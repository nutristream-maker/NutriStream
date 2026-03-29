import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiSettings, FiPlay, FiPause, FiBluetooth, FiBarChart2, FiZap, FiRadio, FiRefreshCw, FiDownload, FiAlertTriangle } from 'react-icons/fi';
import { Card, Button, Toggle } from '../ui/Shared';
import { useLanguage } from '../../context/LanguageContext';
import { useSensorStore } from '../../store/useSensorStore';

// --- TYPES ---
interface ChannelStat {
    rms: number;
    peak: number;
    freq: number;
    fatigue: number; // 0-100%
}

// --- SUB-COMPONENTS ---

// 1. Single Channel Oscilloscope Graph
const OscilloscopeGraph: React.FC<{
    data: number[];
    color: string;
    height?: number;
    label: string;
    showGrid?: boolean;
    isActive?: boolean;
}> = ({ data, color, height = 80, label, showGrid = true, isActive = true }) => {
    const points = data.map((val, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - val;
        return `${x},${y}`;
    }).join(' ');

    const glowColor = color.includes('indigo') ? '#6366f1' :
        color.includes('blue') ? '#3b82f6' :
            color.includes('cyan') ? '#06b6d4' : '#14b8a6';

    return (
        <div className="relative bg-white/60 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden backdrop-blur-sm group hover:border-slate-300 dark:hover:border-white/10 transition-colors" style={{ height }}>
            {showGrid && (
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                    <div className="w-full h-full"
                        style={{
                            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                            backgroundSize: '20px 20px'
                        }}>
                    </div>
                </div>
            )}
            {isActive && (
                <div className="absolute top-0 bottom-0 w-[2px] bg-indigo-500/30 dark:bg-white/30 z-20 shadow-[0_0_10px_rgba(99,102,241,0.5)] dark:shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-[scan_2s_linear_infinite]"
                    style={{ left: '100%' }}></div>
            )}
            <div className="absolute top-2 left-3 z-10 flex flex-col">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold tracking-wider">{label}</span>
                <span className={`text-xs font-mono font-bold ${isActive ? 'text-slate-700 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                    {isActive ? `${Math.round(data[data.length - 1] || 0)}µV` : '--'}
                </span>
            </div>
            <div className="absolute inset-0 pt-4 pb-2 px-0 text-slate-800 dark:text-white">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                        <filter id={`glow-${label}`} x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>
                    <polyline
                        points={points}
                        fill="none"
                        stroke={isActive ? glowColor : 'currentColor'}
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={!isActive ? 'text-slate-300 dark:text-slate-700' : ''}
                        filter={isActive ? `url(#glow-${label})` : ''}
                    />
                </svg>
            </div>
        </div>
    );
};

// 2. Statistics Panel (with Fatigue)
const StatsPanel: React.FC<{ stats: ChannelStat[] }> = ({ stats }) => {
    const getFatigueColor = (fatigue: number) => {
        if (fatigue < 30) return 'bg-emerald-500';
        if (fatigue < 60) return 'bg-amber-400';
        return 'bg-rose-500';
    };
    return (
        <div className="overflow-x-auto relative scrollbar-hide">
            <table className="w-full text-xs font-mono text-left border-collapse">
                <thead>
                    <tr className="text-slate-500 border-b border-slate-200 dark:border-white/5">
                        <th className="py-2 px-3 font-normal">CH</th>
                        <th className="py-2 px-3 font-normal">RMS</th>
                        <th className="py-2 px-3 font-normal">PEAK</th>
                        <th className="py-2 px-3 font-normal">FREQ</th>
                        <th className="py-2 px-3 font-normal">FATIGUE</th>
                        <th className="py-2 px-3 font-normal">STATUS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                    {stats.map((stat, i) => (
                        <tr key={i} className="group hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                            <td className="py-2 px-3 font-bold text-indigo-600 dark:text-indigo-400">{i + 1}</td>
                            <td className="py-2 px-3">{stat.rms.toFixed(1)}</td>
                            <td className="py-2 px-3 text-slate-500">{(stat.peak / 1000).toFixed(2)}V</td>
                            <td className="py-2 px-3 text-cyan-600 dark:text-cyan-400">{stat.freq}Hz</td>
                            <td className="py-2 px-3">
                                <div className="flex items-center gap-2 w-24">
                                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${getFatigueColor(stat.fatigue)} transition-all`} style={{ width: `${stat.fatigue}%` }}></div>
                                    </div>
                                    <span className={`text-[10px] font-bold ${stat.fatigue > 60 ? 'text-rose-500' : 'text-slate-500'}`}>{Math.round(stat.fatigue)}%</span>
                                </div>
                            </td>
                            <td className="py-2 px-3">
                                {stat.fatigue > 70 ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[9px] border border-rose-500/20 animate-pulse">
                                        <FiAlertTriangle size={10} /> FATIGUE
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] border border-emerald-500/20">
                                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span> OK
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const NeuralSkinPod: React.FC = () => {
    const { t } = useLanguage();
    const { devices, updateDeviceStatus } = useSensorStore();
    const isConnected = devices?.pod || false;

    const handleConnectionToggle = () => {
        const newState = !isConnected;
        updateDeviceStatus('pod', newState);
        if (newState) { setIsStreaming(true); } else { setIsStreaming(false); setFatigueAccumulators(Array(8).fill(0)); }
    };

    const [isStreaming, setIsStreaming] = useState(false);
    const [signalQuality, setSignalQuality] = useState(98);
    const [batteryLevel, setBatteryLevel] = useState(82);
    const [skinTemp, setSkinTemp] = useState(36.5);
    const [channelData, setChannelData] = useState<number[][]>(Array(8).fill(Array(50).fill(50)));

    // Fatigue State: Tracks cumulative "work" for each channel
    const [fatigueAccumulators, setFatigueAccumulators] = useState<number[]>(Array(8).fill(0));

    // Data Logging: Session Recording
    const sessionDataRef = useRef<{ timestamp: number; channels: number[] }[]>([]);

    // Derived Stats with Fatigue
    const stats = useMemo((): ChannelStat[] => {
        return channelData.map((ch, idx) => {
            const sumSq = ch.reduce((a, b) => a + (b * b), 0);
            const rms = Math.sqrt(sumSq / ch.length) * 1.5;
            // Fatigue: Simulated by accumulator. Higher activity = faster accumulation.
            const fatigue = Math.min(100, fatigueAccumulators[idx] / 20); // Scales over time
            return {
                rms: rms,
                peak: Math.max(...ch) * 10,
                freq: Math.max(30, 60 - Math.floor(fatigue / 3)), // Freq drops as fatigue increases
                fatigue: fatigue,
            };
        });
    }, [channelData, fatigueAccumulators]);

    const [isVibrating, setIsVibrating] = useState(false);
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [calibrationProgress, setCalibrationProgress] = useState(0);
    const [filters, setFilters] = useState({ smoothing: true, notch: true, logging: false });

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isConnected && isStreaming) {
            interval = setInterval(() => {
                const timestamp = Date.now();
                const newChannels: number[] = [];

                setChannelData(prev => prev.map((channel, idx) => {
                    let newPoint = 20 + Math.random() * 60 + (Math.sin(timestamp / 100) * 10);
                    if (!filters.smoothing) { newPoint += (Math.random() - 0.5) * 40; }
                    newChannels.push(Math.round(newPoint));
                    const newCh = [...channel.slice(1), Math.max(0, Math.min(100, newPoint))];
                    return newCh;
                }));

                // Accumulate fatigue based on signal intensity
                setFatigueAccumulators(prev => prev.map((acc, idx) => {
                    const intensity = newChannels[idx] || 50;
                    return acc + (intensity / 100); // The more intense, the faster it accumulates
                }));

                // Log data if logging is enabled
                if (filters.logging) {
                    sessionDataRef.current.push({ timestamp, channels: newChannels });
                }

                setSignalQuality(prev => Math.max(85, Math.min(100, prev + (Math.random() > 0.5 ? 1 : -1))));
                setSkinTemp(prev => 36.5 + (Math.random() * 0.4 - 0.2));
            }, 50);
        }
        return () => clearInterval(interval);
    }, [isConnected, isStreaming, filters.smoothing, filters.logging]);

    const handleTestHaptics = () => { if (!isConnected) return; setIsVibrating(true); setTimeout(() => setIsVibrating(false), 2000); };
    const handleCalibration = () => {
        if (!isConnected || isCalibrating) return;
        setIsCalibrating(true); setCalibrationProgress(0);
        const interval = setInterval(() => {
            setCalibrationProgress(prev => {
                if (prev >= 100) { clearInterval(interval); setTimeout(() => setIsCalibrating(false), 500); return 100; }
                return prev + 5;
            });
        }, 100);
    };

    // --- EXPORT SESSION (Rich HTML for Excel or Browser) ---
    const handleExportSession = (format: 'xls' | 'html') => {
        if (sessionDataRef.current.length === 0) {
            alert('No data recorded. Enable "Data Logging" first.');
            return;
        }

        const now = new Date();
        const data = sessionDataRef.current;
        const duration = ((data[data.length - 1].timestamp - data[0].timestamp) / 1000).toFixed(1);

        // Calculate channel statistics
        const channelNames = ['Vasto Medial', 'Vasto Lateral', 'Recto Femoral', 'Bíceps Femoral', 'Semitendinoso', 'Semimembranoso', 'Gastro Int.', 'Gastro Ext.'];
        const channelStats = Array(8).fill(0).map((_, chIdx) => {
            const values = data.map(d => d.channels[chIdx]);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            const max = Math.max(...values);
            const min = Math.min(...values);
            return { name: channelNames[chIdx], avg: avg.toFixed(1), max, min, values };
        });

        // Generate mini sparkline SVG for each channel
        const generateSparkline = (values: number[], color: string) => {
            const w = 150, h = 30;
            const maxVal = Math.max(...values, 1);
            const step = w / Math.max(values.length - 1, 1);
            const points = values.map((v, i) => `${i * step},${h - (v / maxVal) * h}`).join(' ');
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" style="vertical-align:middle;"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5"/></svg>`;
        };

        const colors = ['#6366f1', '#6366f1', '#3b82f6', '#3b82f6', '#06b6d4', '#06b6d4', '#14b8a6', '#14b8a6'];

        // Build HTML document
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 20px; }
        .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; }
        .header h1 { margin: 0 0 8px 0; font-size: 28px; }
        .header p { margin: 4px 0; opacity: 0.9; font-size: 14px; }
        .stats-grid { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
        .stat-card { background: white; border-radius: 8px; padding: 16px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); min-width: 140px; }
        .stat-card .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-card .value { font-size: 24px; font-weight: 700; color: #1e293b; }
        .section { background: white; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .section h2 { margin: 0 0 16px 0; font-size: 16px; color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; }
        td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
        tr:hover { background: #f8fafc; }
        .channel-row td:first-child { font-weight: 600; color: #4f46e5; }
        .data-table th { background: #4f46e5; color: white; }
        .sparkline { text-align: center; }
        .footer { text-align: center; color: #94a3b8; font-size: 11px; margin-top: 24px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Neural Skin POD - EMG Session Report</h1>
        <p><strong>Date:</strong> ${now.toLocaleDateString()} &nbsp;&nbsp; <strong>Time:</strong> ${now.toLocaleTimeString()}</p>
        <p><strong>Device:</strong> Neural Skin POD v2.4 &nbsp;&nbsp; <strong>Sample Rate:</strong> 20 Hz</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card"><div class="label">Duration</div><div class="value">${duration}s</div></div>
        <div class="stat-card"><div class="label">Data Points</div><div class="value">${data.length}</div></div>
        <div class="stat-card"><div class="label">Channels</div><div class="value">8</div></div>
        <div class="stat-card"><div class="label">Frequency</div><div class="value">20 Hz</div></div>
    </div>

    <div class="section">
        <h2>📈 Channel Summary with Activity Graphs</h2>
        <table>
            <thead>
                <tr><th>Channel</th><th>Muscle</th><th>Avg (µV)</th><th>Min</th><th>Max</th><th class="sparkline">Activity Graph</th></tr>
            </thead>
            <tbody>
                ${channelStats.map((ch, i) => `
                <tr class="channel-row">
                    <td>CH${i + 1}</td>
                    <td>${ch.name}</td>
                    <td>${ch.avg}</td>
                    <td>${ch.min}</td>
                    <td>${ch.max}</td>
                    <td class="sparkline">${generateSparkline(ch.values.slice(-50), colors[i])}</td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>📋 Raw Data (First 100 samples)</h2>
        <table class="data-table">
            <thead>
                <tr><th>#</th><th>DateTime</th>${channelNames.map((n, i) => `<th>CH${i + 1}</th>`).join('')}</tr>
            </thead>
            <tbody>
                ${data.slice(0, 100).map((d, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${new Date(d.timestamp).toLocaleTimeString()}</td>
                    ${d.channels.map(v => `<td>${v}</td>`).join('')}
                </tr>`).join('')}
            </tbody>
        </table>
        ${data.length > 100 ? `<p style="color:#64748b;font-size:11px;margin-top:12px;">... and ${data.length - 100} more rows (truncated for display)</p>` : ''}
    </div>

    <div class="footer">
        Generated by NutriStream Neural Skin POD • ${now.toISOString()}
    </div>
</body>
</html>`;

        const mimeType = format === 'xls' ? 'application/vnd.ms-excel' : 'text/html';
        const extension = format === 'xls' ? 'xls' : 'html';
        const blob = new Blob([html], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `NeuralSkinPod_Report_${now.toISOString().slice(0, 10)}.${extension}`;
        link.click();
    };

    const channels = [
        { id: 1, name: 'Vasto Medial', color: 'bg-indigo-500' }, { id: 2, name: 'Vasto Lateral', color: 'bg-indigo-500' },
        { id: 3, name: 'Recto Femoral', color: 'bg-blue-500' }, { id: 4, name: 'Bíceps Femoral', color: 'bg-blue-500' },
        { id: 5, name: 'Semitendinoso', color: 'bg-cyan-500' }, { id: 6, name: 'Semimembranoso', color: 'bg-cyan-500' },
        { id: 7, name: 'Gastro Int.', color: 'bg-teal-500' }, { id: 8, name: 'Gastro Ext.', color: 'bg-teal-500' },
    ];

    return (
        <div className="space-y-6 pb-24 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
            {/* --- HEADER SECTION --- */}
            <div className="relative rounded-3xl p-8 overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl bg-white dark:bg-slate-900 transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/50 to-slate-100 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 z-0"></div>
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[100px] transition-all duration-1000 ${isConnected ? 'bg-indigo-500/10 dark:bg-indigo-500/20' : 'bg-slate-200 dark:bg-slate-500/5'}`}></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-mono text-[10px] tracking-widest backdrop-blur-md">NS_POD_v2.4</span>
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border backdrop-blur-md transition-all ${isConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>{isConnected ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight text-slate-900 dark:text-white">NEURAL<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">SKIN</span>_POD</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">EMG Array • <span className="text-indigo-600 dark:text-indigo-400 font-mono">2000Hz</span> • 8-Channel</p>
                    </div>
                    <Button onClick={handleConnectionToggle} className={`min-w-[160px] h-12 rounded-xl font-bold ${isConnected ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/50' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'}`}>
                        <FiBluetooth className="mr-2" /> {isConnected ? 'DISCONNECT' : 'CONNECT POD'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- LEFT COLUMN: CONTROLS --- */}
                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200 dark:border-white/5 shadow-xl">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><FiActivity className="text-indigo-500" /> Diagnostics</h3>
                            <div className="space-y-6">
                                <div><div className="flex justify-between text-xs mb-2 font-mono"><span className="text-slate-500">BATTERY</span><span className={`font-bold ${batteryLevel > 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>{batteryLevel}%</span></div><div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${batteryLevel}%` }} className={`h-full rounded-full ${batteryLevel > 20 ? 'bg-emerald-500' : 'bg-rose-500'}`} /></div></div>
                                <div><div className="flex justify-between text-xs mb-2 font-mono"><span className="text-slate-500">SIGNAL</span><span className="font-bold text-indigo-600 dark:text-indigo-400">-{100 - signalQuality}dBm</span></div><div className="flex gap-1">{[1, 2, 3, 4, 5].map(bar => (<div key={bar} className={`h-1.5 flex-1 rounded-sm ${bar * 20 <= signalQuality ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'}`} />))}</div></div>
                                <Button variant="outline" className={`w-full justify-between group h-12 border-slate-200 dark:border-white/10 ${isVibrating ? 'border-amber-500/50 bg-amber-500/5' : ''}`} onClick={handleTestHaptics} disabled={!isConnected}><span className="flex items-center gap-3 text-sm font-medium"><div className={`p-1.5 rounded-md ${isVibrating ? 'bg-amber-500/20 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}><FiZap className={isVibrating ? 'animate-pulse' : ''} /></div>{isVibrating ? <span className="text-amber-500">Testing...</span> : <span className="text-slate-600 dark:text-slate-300">Test Haptics</span>}</span><span className={`text-[10px] px-2 py-1 rounded font-mono ${isVibrating ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>EXEC</span></Button>
                            </div>
                        </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200 dark:border-white/5 shadow-xl relative overflow-hidden group">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FiSettings className="text-indigo-500" /> Calibration</h3>
                            <p className="text-xs text-slate-500 mb-6">Skin impedance check before sessions.</p>
                            {isCalibrating ? (<div className="space-y-3"><div className="flex justify-between text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 animate-pulse"><span>CALIBRATING...</span><span>{calibrationProgress}%</span></div><div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400" initial={{ width: 0 }} animate={{ width: `${calibrationProgress}%` }} /></div></div>) : (<Button onClick={handleCalibration} disabled={!isConnected} className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-indigo-600 text-slate-600 dark:text-white border border-slate-200 dark:border-white/5 font-mono text-xs h-10"><FiRefreshCw className="mr-2" /> INIT_SEQUENCE</Button>)}
                        </Card>
                    </motion.div>
                </div>

                {/* --- RIGHT COLUMN: MAIN VISUALIZER --- */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
                        <Card className="p-0 overflow-hidden border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-[#0B0F19] ring-1 ring-slate-200 dark:ring-white/5">
                            <div className="p-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
                                <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500 border border-emerald-500/20"><FiActivity /></span><div><h3 className="font-bold text-slate-800 dark:text-white text-sm">Live Bio-Signals</h3><p className="text-[10px] text-slate-500 font-mono">EMG_STREAM</p></div></div>
                                <div className="flex items-center gap-3">
                                    <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isStreaming ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-white/5'}`}><span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span><span className={`text-[10px] font-mono ${isStreaming ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>{isStreaming ? 'RX' : 'IDLE'}</span></div>
                                    {filters.logging && <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-rose-500/10 border-rose-500/20 animate-pulse"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div><span className="text-[10px] font-mono text-rose-500">REC</span></div>}
                                    <button onClick={() => setIsStreaming(!isStreaming)} disabled={!isConnected} className={`h-8 px-4 rounded-lg font-mono text-[10px] font-bold flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${isStreaming ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-300 dark:hover:bg-slate-600' : 'bg-emerald-500 text-white border border-emerald-400 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400'}`}>{isStreaming ? <><FiPause size={10} /> PAUSE</> : <><FiPlay size={10} /> START</>}</button>
                                </div>
                            </div>
                            <div className="p-6 relative min-h-[500px] flex flex-col">
                                <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                                <AnimatePresence mode='wait'>
                                    {!isConnected ? (<div className="flex-1 flex flex-col items-center justify-center text-slate-400 z-10 space-y-4"><div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border border-slate-200 dark:border-slate-800"><FiRadio size={32} className="opacity-50 animate-pulse" /></div><p className="font-mono text-sm font-bold text-slate-500">NO CARRIER</p></div>) : (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 z-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{channels.map((channel, idx) => (<OscilloscopeGraph key={channel.id} data={channelData[idx]} color={channel.color} label={`CH${channel.id}:${channel.name.toUpperCase()}`} isActive={isStreaming} />))}</div>
                                            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-sm rounded-xl p-0.5 border border-slate-200 dark:border-white/5"><div className="bg-white/80 dark:bg-slate-900/80 rounded-[10px] p-4"><div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-white/5"><h4 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2"><FiBarChart2 className="text-cyan-600" /> Analytics</h4><span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">LATENCY: 12ms</span></div><StatsPanel stats={stats} /></div></div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-950 p-3 flex justify-between items-center text-[9px] text-slate-400 dark:text-slate-500 font-mono border-t border-slate-200 dark:border-white/5"><div className="flex gap-6"><span>FS:2048Hz</span><span>GAIN:x100</span><span>ADC:24-BIT</span></div><span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>DSP_V3.1</span></div>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* --- BOTTOM CONTROLS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4 bg-white/60 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 flex items-center justify-between backdrop-blur-sm shadow-sm"><span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Smoothing Filter</span><Toggle isEnabled={filters.smoothing} onToggle={() => setFilters(prev => ({ ...prev, smoothing: !prev.smoothing }))} /></Card>
                <Card className="p-4 bg-white/60 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 flex items-center justify-between backdrop-blur-sm shadow-sm"><span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data Logging</span><Toggle isEnabled={filters.logging} onToggle={() => setFilters(prev => ({ ...prev, logging: !prev.logging }))} /></Card>
                <Card className="p-4 bg-white/60 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 flex flex-col gap-2 backdrop-blur-sm shadow-sm">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Export Session</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleExportSession('xls')}
                            disabled={sessionDataRef.current.length === 0 && !filters.logging}
                            className="flex-1 h-9 bg-indigo-500 hover:bg-indigo-600 text-white font-mono text-[10px] rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <FiDownload size={12} /> Excel (.xls)
                        </button>
                        <button
                            onClick={() => handleExportSession('html')}
                            disabled={sessionDataRef.current.length === 0 && !filters.logging}
                            className="flex-1 h-9 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-mono text-[10px] rounded-lg flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <FiDownload size={12} /> HTML
                        </button>
                    </div>
                </Card>
            </div>

            <style>{`@keyframes scan { 0% { left: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { left: 100%; opacity: 0; } }`}</style>
        </div>
    );
};

export default NeuralSkinPod;
