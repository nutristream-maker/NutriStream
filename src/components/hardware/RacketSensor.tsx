import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GiTennisRacket, GiTennisBall } from 'react-icons/gi';
import { FiActivity, FiZap, FiRotateCw, FiList, FiWifi, FiPower, FiTarget, FiSmartphone, FiBattery, FiBatteryCharging, FiX, FiCheckCircle, FiPlayCircle, FiStopCircle, FiTrendingUp } from 'react-icons/fi';
import { Card } from '../ui/Shared';

// --- Types ---
type HitZone = 'top' | 'center' | 'bottom' | 'left' | 'right';
type SportType = 'tennis' | 'padel';
type ShotType = 'topspin' | 'slice' | 'flat';

interface SensorData {
    swingSpeed: number; // km/h
    spinRate: number; // rpm
    sweetSpot: number; // %
    impactZone: HitZone;
    shotType: ShotType;
    lastImpactTime: number;
    rotation: { x: number, y: number, z: number };
}

interface ImpactEvent {
    id: number;
    time: string;
    speed: number;
    spin: number;
    sweetSpot: number;
    zone: HitZone;
    type: ShotType;
    score: number; // 0-100 based on metrics
}

// --- Mock Data Service ---
const useRacketSensor = (sport: SportType, isConnected: boolean, isSessionActive: boolean) => {
    const [data, setData] = useState<SensorData>({
        swingSpeed: 0,
        spinRate: 0,
        sweetSpot: 0,
        impactZone: 'center',
        shotType: 'flat',
        lastImpactTime: 0,
        rotation: { x: 0, y: 0, z: 0 }
    });

    const [history, setHistory] = useState<ImpactEvent[]>([]);
    const [batteryLevel, setBatteryLevel] = useState(85);

    useEffect(() => {
        if (!isConnected) return;

        // Battery Drain Simulation
        const batteryInterval = setInterval(() => {
            setBatteryLevel(prev => Math.max(0, prev - (isSessionActive ? 0.05 : 0.01)));
        }, 5000);

        if (!isSessionActive) { // Only stream rotation if connected, but no shots if session paused? Or maybe yes. Let's say shots only record if session active.
            // Allow rotation to show "live" status
        }

        const rotationInterval = setInterval(() => {
            setData(prev => ({
                ...prev,
                rotation: {
                    x: Math.sin(Date.now() / 800) * 12,
                    y: Math.cos(Date.now() / 1200) * 25,
                    z: Math.sin(Date.now() / 1500) * 8
                }
            }));
        }, 50);

        const impactInterval = setInterval(() => {
            if (!isSessionActive) return; // Only record shots if tracking session

            if (Math.random() > 0.6) { // Slightly lowered frequency
                const zones: HitZone[] = ['top', 'center', 'center', 'center', 'bottom', 'left', 'right'];
                const types: ShotType[] = ['topspin', 'flat', 'slice', 'topspin'];

                const minSpeed = sport === 'tennis' ? 70 : 50;
                const maxSpeed = sport === 'tennis' ? 160 : 120;
                const newSpeed = Math.floor(Math.random() * (maxSpeed - minSpeed) + minSpeed);
                const newSpin = Math.floor(Math.random() * 2500 + 500); // 500-3000 RPM
                const newZone = zones[Math.floor(Math.random() * zones.length)];
                const newType = types[Math.floor(Math.random() * types.length)];
                const newSweetSpot = newZone === 'center' ? Math.floor(Math.random() * 10 + 90) : Math.floor(Math.random() * 30 + 50);

                // Calculate "Score"
                const speedScore = (newSpeed / maxSpeed) * 40;
                const spinScore = (newSpin / 3000) * 30;
                const sweetSpotScore = (newSweetSpot / 100) * 30;
                const totalScore = Math.floor(speedScore + spinScore + sweetSpotScore);

                const newEvent: ImpactEvent = {
                    id: Date.now(),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    speed: newSpeed,
                    spin: newSpin,
                    sweetSpot: newSweetSpot,
                    zone: newZone,
                    type: newType,
                    score: totalScore
                };

                setData(prev => ({
                    ...prev,
                    swingSpeed: newSpeed,
                    spinRate: newSpin,
                    sweetSpot: newSweetSpot,
                    impactZone: newZone,
                    shotType: newType,
                    lastImpactTime: Date.now()
                }));

                setHistory(prev => [newEvent, ...prev]);
            }
        }, 3000);

        return () => {
            clearInterval(impactInterval);
            clearInterval(rotationInterval);
            clearInterval(batteryInterval);
        };
    }, [sport, isConnected, isSessionActive]);

    return { data, history, batteryLevel, clearHistory: () => setHistory([]) };
};

// --- Heatmap Component ---
const HeatmapRacket: React.FC<{ lastZone: HitZone, sport: SportType, isConnected: boolean }> = ({ lastZone, sport, isConnected }) => {
    const getZoneOpacity = (zone: HitZone) => (!isConnected ? 0 : zone === lastZone ? 0.8 : 0);

    return (
        <div className="relative w-full h-full flex items-center justify-center p-4">
            <svg viewBox="0 0 300 450" className="w-full h-full max-h-[500px] drop-shadow-2xl">
                <defs>
                    <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#334155" />
                        <stop offset="50%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <pattern id="stringPattern" patternUnits="userSpaceOnUse" width="15" height="15">
                        <path d="M7.5 0 V15 M0 7.5 H15" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                    </pattern>
                    <radialGradient id="impactGradient">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Racket Frame */}
                <g filter="url(#glow)">
                    {sport === 'tennis' ? (
                        <>
                            {/* Tennis Shape */}
                            <ellipse cx="150" cy="180" rx="95" ry="120" fill="url(#stringPattern)" stroke="url(#frameGradient)" strokeWidth="12" />
                            <path d="M150 300 L120 250 L180 250 Z" fill="#334155" />
                            <rect x="135" y="300" width="30" height="100" rx="4" fill="#0f172a" stroke="#334155" />
                            <path d="M150 310 Q60 290 40 160 Q40 40 150 40 Q260 40 260 160 Q240 290 150 310 Z" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        </>
                    ) : (
                        <>
                            {/* Padel Shape */}
                            <path d="M150 360 L140 280 Q50 260 50 150 Q50 50 150 50 Q250 50 250 150 Q250 260 160 280 L150 360 Z" fill="url(#frameGradient)" />
                            <path d="M150 280 Q60 260 60 150 Q60 50 150 50 Q240 50 240 150 Q240 260 150 280 Z" fill="#1e293b" />
                            <path d="M150 280 Q60 260 60 150 Q60 50 150 50 Q240 50 240 150 Q240 260 150 280 Z" fill="url(#stringPattern)" />
                            <rect x="135" y="300" width="30" height="90" rx="5" fill="#0f172a" stroke="#334155" />
                            {/* Holes */}
                            <g fill="black" opacity="0.3">
                                <circle cx="150" cy="100" r="4" /> <circle cx="120" cy="120" r="4" /> <circle cx="180" cy="120" r="4" />
                                <circle cx="150" cy="140" r="4" /> <circle cx="120" cy="160" r="4" /> <circle cx="180" cy="160" r="4" />
                            </g>
                        </>
                    )}
                </g>

                {/* Impact Zones */}
                <g style={{ mixBlendMode: 'screen', transition: 'opacity 0.2s' }}>
                    <circle cx="150" cy="150" r="35" fill="url(#impactGradient)" opacity={getZoneOpacity('center')} />
                    <circle cx="150" cy="90" r="30" fill="url(#impactGradient)" opacity={getZoneOpacity('top')} />
                    <circle cx="150" cy="210" r="30" fill="url(#impactGradient)" opacity={getZoneOpacity('bottom')} />
                    <circle cx="90" cy="150" r="25" fill="url(#impactGradient)" opacity={getZoneOpacity('left')} />
                    <circle cx="210" cy="150" r="25" fill="url(#impactGradient)" opacity={getZoneOpacity('right')} />
                </g>
            </svg>
            {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-3xl">
                    <div className="text-white text-center">
                        <div className="mx-auto mb-2 opacity-50 flex justify-center"><FiPower size={40} /></div>
                        <span className="text-sm font-mono opacity-80">SENSOR OFFLINE</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Session Report Modal ---
const SessionReportModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    history: ImpactEvent[];
    sport: SportType
}> = ({ isOpen, onClose, history, sport }) => {
    const { t } = useLanguage();
    if (!isOpen) return null;

    // Calculate Stats
    const totalShots = history.length;
    const avgSpeed = Math.round(history.reduce((acc, curr) => acc + curr.speed, 0) / (totalShots || 1));
    const avgSpin = Math.round(history.reduce((acc, curr) => acc + curr.spin, 0) / (totalShots || 1));
    const avgScore = Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / (totalShots || 1));

    // Find best shot or default to zero
    const bestShot = history.reduce((prev, current) => (prev.score > current.score) ? prev : current, history[0] || { score: 0, speed: 0, spin: 0, type: 'flat', sweetSpot: 0 });

    // Recommendations Logic
    const getRecommendation = () => {
        if (totalShots < 3) return t('rec_pocas_muestras') || "Registra más golpes para obtener recomendaciones.";
        if (avgSpeed < (sport === 'tennis' ? 90 : 70)) return t('rec_velocidad') || "Intenta acelerar la cabeza de la raqueta en el impacto para ganar potencia.";
        if (avgSpin < 1500 && sport === 'tennis') return t('rec_spin') || "Trabaja el cepillado de la bola para aumentar el topspin y el control."; // Spin mostly for tennis
        return t('rec_excelente') || "¡Excelente sesión! Mantén este nivel de consistencia.";
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()} // Prevent close on modal click
                    className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] relative"
                >
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center shrink-0">
                        <div>
                            <h2 className="text-xl font-bold">{t('informeSesion')}</h2>
                            <p className="text-indigo-100 text-xs opacity-90">{new Date().toLocaleDateString()} • {totalShots} {t('impactos') || 'Shots'}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-4 overflow-y-auto custom-scrollbar space-y-4 flex-1 min-h-0">

                        {/* Summary Stats Rows */}
                        <div className="grid grid-cols-4 gap-2">
                            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-center border border-slate-100 dark:border-slate-700">
                                <div className="text-[10px] text-slate-500 uppercase font-bold">{t('puntuacionGolpe')}</div>
                                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{avgScore}</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-center border border-slate-100 dark:border-slate-700">
                                <div className="text-[10px] text-slate-500 uppercase font-bold">{t('potenciaMedia')}</div>
                                <div className="text-xl font-bold text-slate-700 dark:text-slate-300">{avgSpeed}<span className="text-[10px] ml-1">km/h</span></div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-center border border-slate-100 dark:border-slate-700">
                                <div className="text-[10px] text-slate-500 uppercase font-bold">{t('consistencia')}</div>
                                <div className="text-xl font-bold text-slate-700 dark:text-slate-300">{(Math.random() * 20 + 70).toFixed(0)}%</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-center border border-slate-100 dark:border-slate-700">
                                <div className="text-[10px] text-slate-500 uppercase font-bold">Cals</div>
                                <div className="text-xl font-bold text-slate-700 dark:text-slate-300">{Math.floor(totalShots * 1.5)}</div>
                            </div>
                        </div>

                        {/* Best Shot & AI Rec */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Best Shot Card */}
                            <div className="space-y-1">
                                <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                    <span className="text-green-500 flex items-center"><FiCheckCircle size={14} /></span> {t('mejorGolpe')}
                                </h3>
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl relative overflow-hidden group shadow-lg">
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <GiTennisBall size={60} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-3xl font-black tracking-tight">{bestShot.speed} <span className="text-sm font-normal text-slate-400">km/h</span></span>
                                            <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-[10px] font-bold uppercase">{t(bestShot.type as any) || bestShot.type}</span>
                                        </div>
                                        <div className="text-xs opacity-70 flex gap-3">
                                            <span>RPM: <b>{bestShot.spin}</b></span>
                                            <span>{t('puntoDulce')}: <b>{bestShot.sweetSpot}%</b></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Recommendations Card */}
                            <div className="space-y-1 flex flex-col">
                                <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                    <span className="text-indigo-500 flex items-center"><FiActivity size={14} /></span> {t('recomendaciones')} (AI)
                                </h3>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 flex-1 flex items-center shadow-sm">
                                    <div className="flex gap-3 items-start">
                                        <div className="shrink-0 pt-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic">
                                            "{getRecommendation()}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Section */}
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                <span className="text-blue-500 flex items-center"><FiTrendingUp size={14} /></span> {t('progresoSesion')}
                            </h3>
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                <div className="space-y-3">
                                    {/* Speed Progress */}
                                    <div>
                                        <div className="flex justify-between items-center text-xs mb-1.5">
                                            <span className="text-slate-500 font-medium">{t('velocidadImpacto')}</span>
                                            <span className="text-green-500 font-bold flex items-center gap-1 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full text-[10px]">
                                                +4% <FiTrendingUp size={10} />
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full rounded-full w-[65%]"></div>
                                        </div>
                                    </div>

                                    {/* Sweet Spot Progress */}
                                    <div>
                                        <div className="flex justify-between items-center text-xs mb-1.5">
                                            <span className="text-slate-500 font-medium">{t('puntoDulce')}</span>
                                            <span className="text-green-500 font-bold flex items-center gap-1 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full text-[10px]">
                                                +2.5% <FiTrendingUp size={10} />
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                            <div className="bg-teal-500 h-full rounded-full w-[78%]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end shrink-0 backdrop-blur-sm">
                        <button
                            onClick={onClose}
                            className="w-full md:w-auto px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow hover:opacity-90 transition-opacity text-sm"
                        >
                            {t('cerrarInforme')}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// --- Main Component ---
const RacketSensor: React.FC = () => {
    const { t } = useLanguage();
    const [sport, setSport] = useState<SportType>('tennis');
    const [isConnected, setIsConnected] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [showReport, setShowReport] = useState(false);

    const { data, history, batteryLevel, clearHistory } = useRacketSensor(sport, isConnected, isSessionActive);

    const toggleConnection = () => {
        if (isConnected) {
            // If disconnecting while session active, stop session first?
            // Or just disconnect.
            if (isSessionActive) {
                // End session logic triggering report
                setIsSessionActive(false);
                setShowReport(true);
            }
            setIsConnected(false);
        } else {
            setIsConnected(true);
        }
    };

    const toggleSession = () => {
        if (isSessionActive) {
            // End Session
            setIsSessionActive(false);
            setShowReport(true);
        } else {
            // Start Session
            clearHistory(); // Clear previous session data
            setIsSessionActive(true);
        }
    };

    const handleCloseReport = () => {
        setShowReport(false);
        // Maybe save session to global history here?
    };

    // Battery Icon Logic
    const getBatteryIcon = (level: number) => {
        if (level > 90) return <span className="text-green-500"><FiBattery /></span>;
        if (level > 50) return <span className="text-green-500"><FiBattery /></span>;
        if (level > 20) return <span className="text-yellow-500"><FiBattery /></span>;
        return <span className="text-red-500 animate-pulse"><FiBattery /></span>;
    };

    return (
        <Card className="h-full bg-slate-50 dark:bg-slate-900 border-0 shadow-none !p-0 flex flex-col gap-6 overflow-hidden">

            {showReport && (
                <SessionReportModal
                    isOpen={showReport}
                    onClose={handleCloseReport}
                    history={history}
                    sport={sport}
                />
            )}

            {/* Minimal Header */}
            <div className="bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center rounded-t-2xl">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${sport === 'tennis' ? 'bg-indigo-600' : 'bg-orange-600'}`}>
                        <GiTennisRacket size={22} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">ProSensor X1</h2>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-400'}`} />
                                <span className="text-xs text-slate-500">{isConnected ? (isSessionActive ? 'Recording...' : 'Connected') : 'Offline'}</span>
                            </div>
                            {isConnected && (
                                <div className="flex items-center gap-1 text-xs text-slate-400 font-mono border-l border-slate-200 dark:border-slate-700 pl-3">
                                    {getBatteryIcon(batteryLevel)} <span className="ml-1">{Math.round(batteryLevel)}%</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isConnected && (
                        <button
                            onClick={toggleSession}
                            className={`px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold transition-all ${isSessionActive
                                ? 'bg-red-500 text-white shadow-red-500/30 shadow-lg hover:bg-red-600'
                                : 'bg-indigo-600 text-white shadow-indigo-500/30 shadow-lg hover:bg-indigo-700'
                                }`}
                        >
                            {isSessionActive ? <><FiStopCircle size={14} /> {t('finalizarSesion')}</> : <><FiPlayCircle size={14} /> {t('iniciarSesion')}</>}
                        </button>
                    )}

                    <button
                        onClick={toggleConnection}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isConnected ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-red-500' : 'bg-green-50 text-green-500 hover:bg-green-100'
                            }`}
                        title={isConnected ? t('desconectarSensor') : t('conectarSensor')}
                    >
                        <FiPower size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 pt-0">

                {/* Visualizer */}
                <div className="lg:col-span-5 h-[400px] bg-slate-200 dark:bg-slate-950 rounded-3xl relative overflow-hidden border border-slate-300 dark:border-slate-800 shadow-inner group">
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0" />
                    <HeatmapRacket lastZone={data.impactZone} sport={sport} isConnected={isConnected} />

                    {!isConnected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10 p-6 text-center">
                            <div className="text-white max-w-[200px]">
                                <div className="mx-auto mb-4 opacity-50 flex justify-center"><FiWifi size={40} /></div>
                                <p className="text-sm opacity-80 mb-4">{t('conectaSensorDesc') || "Connect your sensor to visualize impact zones and real-time metrics."}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Metrics */}
                <div className={`lg:col-span-7 flex flex-col gap-4 transition-all duration-500 ${!isConnected ? 'opacity-50 blur-sm pointer-events-none grayscale' : ''}`}>

                    {/* Primary Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                            <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <FiZap size={16} /> <span className="text-xs font-bold uppercase">{t('velocidadSwing')}</span>
                            </div>
                            <div className="text-3xl font-black text-slate-800 dark:text-white">
                                {data.swingSpeed} <span className="text-sm font-medium text-slate-400">km/h</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                            <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all" />
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <FiRotateCw size={16} /> <span className="text-xs font-bold uppercase">{t('efectoRPM')}</span>
                            </div>
                            <div className="text-3xl font-black text-slate-800 dark:text-white">
                                {data.spinRate}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-green-500/50 transition-colors">
                            <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-all" />
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <FiTarget size={16} /> <span className="text-xs font-bold uppercase">{t('puntoDulce')}</span>
                            </div>
                            <div className="text-3xl font-black text-slate-800 dark:text-white">
                                {data.sweetSpot}<span className="text-sm">%</span>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Stats & History */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        {/* 3D Orientation Mini */}
                        <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden shadow-inner">
                            <div className="text-[10px] text-slate-500 font-mono absolute top-2 left-3">GYRO_XYZ</div>
                            <motion.div
                                className="w-20 h-28 border-2 border-indigo-500 rounded-2xl relative bg-indigo-500/20 backdrop-blur-md"
                                animate={{
                                    rotateX: data.rotation.x,
                                    rotateY: data.rotation.y,
                                    rotateZ: data.rotation.z
                                }}
                                style={{ perspective: 1000 }}
                            >
                                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-30">
                                    <div className="border-r border-b border-indigo-300" />
                                    <div className="border-b border-indigo-300" />
                                    <div className="border-r border-indigo-300" />
                                </div>
                            </motion.div>
                            <div className="absolute bottom-2 right-3 text-[10px] text-indigo-400 font-mono">
                                {data.rotation.x.toFixed(1)} / {data.rotation.y.toFixed(1)}
                            </div>
                        </div>

                        {/* Recent Shots List */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase flex justify-between sticky top-0">
                                <span>{t('recientes')}</span>
                                <FiList />
                            </div>
                            <div className="overflow-y-auto flex-1 p-2 max-h-[150px] space-y-1 custom-scrollbar">
                                <AnimatePresence initial={false}>
                                    {history.map(shot => (
                                        <motion.div
                                            key={shot.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-slate-400">{shot.time}</span>
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-white ${shot.type === 'topspin' ? 'bg-indigo-500' : shot.type === 'slice' ? 'bg-orange-500' : 'bg-slate-500'
                                                    }`}>
                                                    {t(shot.type as any) || shot.type}
                                                </span>
                                            </div>
                                            <div className="font-bold text-slate-700 dark:text-slate-300">
                                                {shot.speed} <span className="text-[10px] font-normal text-slate-400">km/h</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {history.length === 0 && (
                                        <div className="text-center py-8 text-slate-400 italic text-xs">
                                            {isSessionActive ? "Waiting for shots..." : "Start session to record"}
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default RacketSensor;
