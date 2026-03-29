/**
 * LiveSessionHUD Component
 * Real-time training heads-up display with multi-sensor fusion
 * Displays Neural Efficiency, AeroLung valve, and Bio-Symmetry alerts
 */

import React, { useMemo, useCallback, memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiAlertTriangle, FiZap, FiWind, FiCpu } from 'react-icons/fi';
import { FaLungs, FaShoePrints } from 'react-icons/fa';
import { useSensorStore } from '../../store/useSensorStore';
import { useLanguage } from '../../context/LanguageContext';
import { getPerformanceZone, getZoneColor } from '../../services/PerformanceZoneService';
import type { PerformanceZone, SmartSummaryEvent } from '../../types/BiometricTypes';
import { Card } from '../ui/Shared';

// ============================================================================
// TYPES
// ============================================================================

interface LiveSessionHUDProps {
    className?: string;
    compact?: boolean;
    neuralData?: { fatigue: number; velocity: number }[] | null;
    respiratoryData?: {
        valveAperture: number;
        vo2Current: number;
        respirationRate: number;
        spo2: number;
    } | null;
    gaitData?: {
        balanceLeft: number;
        balanceRight: number;
        symmetryIndex: number;
        cadence: number;
    } | null;
    events?: SmartSummaryEvent[];
}

// ============================================================================
// SIMULATED DATA FOR DEMO
// ============================================================================

function generateMockNeuralData(): { fatigue: number; velocity: number }[] {
    const data: { fatigue: number; velocity: number }[] = [];
    for (let i = 0; i < 30; i++) {
        const baseFatigue = 20 + (i * 1.5);
        const baseVelocity = 100 - (i * 0.8);
        data.push({
            fatigue: Math.min(100, baseFatigue + (Math.random() * 10 - 5)),
            velocity: Math.max(40, baseVelocity + (Math.random() * 15 - 7.5))
        });
    }
    return data;
}

// ============================================================================
// NEURAL EFFICIENCY CHART
// ============================================================================

interface NeuralEfficiencyChartProps {
    data: { fatigue: number; velocity: number }[];
    width?: number;
    height?: number;
}

const NeuralEfficiencyChart = memo<NeuralEfficiencyChartProps>(({
    data,
    width = 280,
    height = 150
}) => {
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const points = useMemo(() => {
        if (data.length === 0) return '';

        return data.map((d, i) => {
            const x = padding.left + (i / (data.length - 1)) * chartWidth;
            const y = padding.top + chartHeight - (d.velocity / 100) * chartHeight;
            return `${x},${y}`;
        }).join(' ');
    }, [data, chartWidth, chartHeight]);

    const fatiguePoints = useMemo(() => {
        if (data.length === 0) return '';

        return data.map((d, i) => {
            const x = padding.left + (i / (data.length - 1)) * chartWidth;
            const y = padding.top + chartHeight - (d.fatigue / 100) * chartHeight;
            return `${x},${y}`;
        }).join(' ');
    }, [data, chartWidth, chartHeight]);

    const latestFatigue = data[data.length - 1]?.fatigue ?? 0;
    const latestVelocity = data[data.length - 1]?.velocity ?? 0;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            <defs>
                <linearGradient id="velocityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00FFCC" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#00FFCC" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="fatigueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF0055" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FF0055" stopOpacity="0.4" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(val => {
                const y = padding.top + chartHeight - (val / 100) * chartHeight;
                return (
                    <g key={val}>
                        <line
                            x1={padding.left}
                            y1={y}
                            x2={width - padding.right}
                            y2={y}
                            stroke="#334155"
                            strokeWidth="0.5"
                            strokeDasharray="4,4"
                        />
                        <text
                            x={padding.left - 6}
                            y={y + 3}
                            fill="#64748B"
                            fontSize="8"
                            textAnchor="end"
                        >
                            {val}%
                        </text>
                    </g>
                );
            })}

            {/* Velocity line (blue/cyan) */}
            <polyline
                points={points}
                fill="none"
                stroke="url(#velocityGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                filter="url(#glow)"
            />

            {/* Fatigue line (red) */}
            <polyline
                points={fatiguePoints}
                fill="none"
                stroke="url(#fatigueGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                filter="url(#glow)"
            />

            {/* Legend */}
            <g transform={`translate(${padding.left}, ${height - 10})`}>
                <rect x="0" y="-6" width="8" height="8" rx="1" fill="#00FFCC" />
                <text x="12" y="0" fill="#94A3B8" fontSize="8">Velocity</text>
                <rect x="60" y="-6" width="8" height="8" rx="1" fill="#FF0055" />
                <text x="72" y="0" fill="#94A3B8" fontSize="8">sEMG Fatigue</text>
            </g>

            {/* Current values */}
            <g transform={`translate(${width - padding.right - 5}, ${padding.top + 5})`}>
                <text x="0" y="0" fill="#00FFCC" fontSize="10" textAnchor="end" fontWeight="bold">
                    {latestVelocity.toFixed(0)}%
                </text>
                <text x="0" y="12" fill="#FF0055" fontSize="10" textAnchor="end" fontWeight="bold">
                    {latestFatigue.toFixed(0)}%
                </text>
            </g>
        </svg>
    );
});

NeuralEfficiencyChart.displayName = 'NeuralEfficiencyChart';

// ============================================================================
// AEROLUNG VALVE INDICATOR
// ============================================================================

interface ValveIndicatorProps {
    aperture: number; // 0-100%
    size?: number;
}

const ValveIndicator = memo<ValveIndicatorProps>(({ aperture, size = 120 }) => {
    const center = size / 2;
    const outerRadius = size / 2 - 10;
    const innerRadius = outerRadius - 15;

    // Calculate iris blades
    const numBlades = 8;
    const blades = useMemo(() => {
        const result: { path: string; rotation: number }[] = [];
        const openAngle = (aperture / 100) * 30; // Max 30 degrees open

        for (let i = 0; i < numBlades; i++) {
            const baseAngle = (i * 360) / numBlades;
            const startAngle = (baseAngle * Math.PI) / 180;
            const endAngle = ((baseAngle + 45 - openAngle) * Math.PI) / 180;

            const x1 = center + innerRadius * Math.cos(startAngle);
            const y1 = center + innerRadius * Math.sin(startAngle);
            const x2 = center + outerRadius * Math.cos(startAngle);
            const y2 = center + outerRadius * Math.sin(startAngle);
            const x3 = center + outerRadius * Math.cos(endAngle);
            const y3 = center + outerRadius * Math.sin(endAngle);
            const x4 = center + innerRadius * Math.cos(endAngle);
            const y4 = center + innerRadius * Math.sin(endAngle);

            result.push({
                path: `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`,
                rotation: baseAngle
            });
        }
        return result;
    }, [aperture, center, innerRadius, outerRadius]);

    const apertureColor = aperture > 70 ? '#00FFCC' : aperture > 40 ? '#FFD700' : '#FF0055';

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
                <defs>
                    <radialGradient id="irisGradient">
                        <stop offset="0%" stopColor="#1E293B" />
                        <stop offset="100%" stopColor="#0F172A" />
                    </radialGradient>
                    <filter id="irisGlow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Outer ring */}
                <circle
                    cx={center}
                    cy={center}
                    r={outerRadius + 2}
                    fill="none"
                    stroke={apertureColor}
                    strokeWidth="2"
                    opacity="0.5"
                    filter="url(#irisGlow)"
                />

                {/* Background */}
                <circle
                    cx={center}
                    cy={center}
                    r={outerRadius}
                    fill="url(#irisGradient)"
                />

                {/* Iris blades */}
                {blades.map((blade, i) => (
                    <motion.path
                        key={i}
                        d={blade.path}
                        fill="#334155"
                        stroke="#475569"
                        strokeWidth="0.5"
                        initial={false}
                        animate={{
                            opacity: 0.9 - (aperture / 100) * 0.5
                        }}
                        transition={{ duration: 0.3 }}
                    />
                ))}

                {/* Center aperture (visible opening) */}
                <motion.circle
                    cx={center}
                    cy={center}
                    r={innerRadius * (aperture / 100)}
                    fill={apertureColor}
                    opacity="0.3"
                    filter="url(#irisGlow)"
                    initial={false}
                    animate={{ r: innerRadius * (aperture / 100) * 0.8 }}
                    transition={{ duration: 0.3 }}
                />

                {/* Center percentage */}
                <text
                    x={center}
                    y={center + 4}
                    textAnchor="middle"
                    fill={apertureColor}
                    fontSize="16"
                    fontWeight="bold"
                >
                    {aperture}%
                </text>
            </svg>

            {/* Label */}
            <div className="text-center mt-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider">E-VAV Aperture</span>
            </div>
        </div>
    );
});

ValveIndicator.displayName = 'ValveIndicator';

// ============================================================================
// BIO-SYMMETRY ALERT
// ============================================================================

interface BioSymmetryAlertProps {
    balanceLeft: number;
    balanceRight: number;
    threshold?: number;
}

const BioSymmetryAlert = memo<BioSymmetryAlertProps>(({
    balanceLeft,
    balanceRight,
    threshold = 10
}) => {
    const imbalance = Math.abs(balanceLeft - balanceRight);
    const isAlert = imbalance > threshold;
    const severity = imbalance > 20 ? 'critical' : imbalance > threshold ? 'warning' : 'normal';

    const colors = {
        critical: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', glow: '#FF0055' },
        warning: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', glow: '#FFD700' },
        normal: { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400', glow: '#00FFCC' }
    };

    const style = colors[severity];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    boxShadow: isAlert ? `0 0 20px ${style.glow}40` : 'none'
                }}
                className={`rounded-xl p-4 ${style.bg} border ${style.border} transition-all duration-300`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isAlert ? (
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                            >
                                <FiAlertTriangle className={`text-2xl ${style.text}`} />
                            </motion.div>
                        ) : (
                            <FaShoePrints className={`text-2xl ${style.text}`} />
                        )}
                        <div>
                            <h4 className={`font-bold ${style.text}`}>
                                {isAlert ? 'Bio-Symmetry Alert' : 'Balance OK'}
                            </h4>
                            <p className="text-xs text-slate-400">
                                L/R Distribution: {balanceLeft}% / {balanceRight}%
                            </p>
                        </div>
                    </div>

                    {/* Visual Balance Bar */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">L</span>
                        <div className="w-24 h-3 bg-slate-700 rounded-full overflow-hidden flex">
                            <motion.div
                                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                                initial={false}
                                animate={{ width: `${balanceLeft}%` }}
                                transition={{ duration: 0.3 }}
                            />
                            <motion.div
                                className="h-full bg-gradient-to-r from-pink-400 to-pink-500"
                                initial={false}
                                animate={{ width: `${balanceRight}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <span className="text-xs text-slate-400">R</span>
                    </div>

                    {/* Imbalance Percentage */}
                    <div className={`text-right ${style.text}`}>
                        <span className="text-2xl font-bold">{imbalance}</span>
                        <span className="text-xs">% diff</span>
                    </div>
                </div>

                {isAlert && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 text-xs text-slate-300 border-t border-slate-600/50 pt-3"
                    >
                        {imbalance > 20
                            ? '⚠️ Critical imbalance detected. Stop activity and assess for potential injury.'
                            : '⚡ Moderate imbalance. Consider adjusting form or reducing intensity.'}
                    </motion.p>
                )}
            </motion.div>
        </AnimatePresence>
    );
});

BioSymmetryAlert.displayName = 'BioSymmetryAlert';

// ============================================================================
// PERFORMANCE ZONE INDICATOR
// ============================================================================

interface PerformanceZoneIndicatorProps {
    zone: PerformanceZone;
    recommendation?: string;
}

const PerformanceZoneIndicator = memo<PerformanceZoneIndicatorProps>(({
    zone,
    recommendation
}) => {
    const color = getZoneColor(zone);
    const labels: Record<PerformanceZone, string> = {
        GREEN: 'READY',
        AMBER: 'CAUTION',
        RED: 'DANGER'
    };

    return (
        <motion.div
            className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700"
            animate={{
                borderColor: color,
                boxShadow: zone === 'RED' ? `0 0 15px ${color}40` : 'none'
            }}
        >
            <motion.div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
                animate={{
                    scale: zone === 'RED' ? [1, 1.2, 1] : 1,
                    boxShadow: `0 0 10px ${color}`
                }}
                transition={{ repeat: zone === 'RED' ? Infinity : 0, duration: 0.8 }}
            />
            <div className="flex-1">
                <span className="font-bold text-sm" style={{ color }}>{labels[zone]}</span>
                {recommendation && (
                    <p className="text-xs text-slate-400 truncate">{recommendation}</p>
                )}
            </div>
        </motion.div>
    );
});

PerformanceZoneIndicator.displayName = 'PerformanceZoneIndicator';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LiveSessionHUD: React.FC<LiveSessionHUDProps> = ({
    className = '',
    compact = false,
    neuralData: propNeuralData,
    respiratoryData: propRespiratoryData,
    gaitData: propGaitData,
    events = []
}) => {
    const { t } = useLanguage();
    const sensorContext = useSensorStore();

    // Use prop data or fall back to simulated demo data
    const [demoNeuralData] = useState(() => generateMockNeuralData());
    const [demoRespiratoryData, setDemoRespiratoryData] = useState({
        valveAperture: 65,
        vo2Current: 42.5,
        respirationRate: 24,
        spo2: 97
    });
    const [demoGaitData, setDemoGaitData] = useState({
        balanceLeft: 52,
        balanceRight: 48,
        symmetryIndex: 4,
        cadence: 175
    });

    // Simulate data updates for demo
    useEffect(() => {
        const interval = setInterval(() => {
            setDemoRespiratoryData(prev => ({
                ...prev,
                valveAperture: Math.max(20, Math.min(100, prev.valveAperture + (Math.random() * 10 - 5))),
                vo2Current: Math.max(30, Math.min(60, prev.vo2Current + (Math.random() * 2 - 1)))
            }));

            setDemoGaitData(prev => {
                const newLeft = Math.max(35, Math.min(65, prev.balanceLeft + (Math.random() * 4 - 2)));
                const newRight = 100 - newLeft;
                return {
                    ...prev,
                    balanceLeft: Math.round(newLeft),
                    balanceRight: Math.round(newRight),
                    symmetryIndex: Math.abs(newLeft - newRight)
                };
            });
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    const neuralData = propNeuralData ?? demoNeuralData;
    const respiratoryData = propRespiratoryData ?? demoRespiratoryData;
    const gaitData = propGaitData ?? demoGaitData;

    // Calculate performance zone
    const performanceZone = useMemo(() => {
        const latestFatigue = neuralData[neuralData.length - 1]?.fatigue ?? 0;
        const symmetry = 100 - (gaitData.symmetryIndex ?? 0);
        const vo2 = respiratoryData.vo2Current ?? 50;

        return getPerformanceZone(latestFatigue, symmetry, vo2);
    }, [neuralData, gaitData, respiratoryData]);

    if (compact) {
        return (
            <motion.div
                className={`relative overflow-hidden ${className}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Animated gradient border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-70 animate-pulse"
                    style={{ padding: '2px' }}
                />

                {/* Glassmorphism container */}
                <div className="relative m-[2px] rounded-2xl bg-slate-900/95 backdrop-blur-xl">
                    {/* Ambient glow effects */}
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex items-center justify-between gap-4 p-4 sm:p-5">
                        {/* Performance Zone - Enhanced */}
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="relative"
                                animate={{
                                    scale: performanceZone.zone === 'RED' ? [1, 1.1, 1] : 1
                                }}
                                transition={{ repeat: performanceZone.zone === 'RED' ? Infinity : 0, duration: 0.8 }}
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{
                                        background: `linear-gradient(135deg, ${getZoneColor(performanceZone.zone)}40, ${getZoneColor(performanceZone.zone)}10)`,
                                        boxShadow: `0 0 20px ${getZoneColor(performanceZone.zone)}30, inset 0 0 20px ${getZoneColor(performanceZone.zone)}20`
                                    }}
                                >
                                    <motion.div
                                        className="w-5 h-5 rounded-full"
                                        style={{ backgroundColor: getZoneColor(performanceZone.zone) }}
                                        animate={{
                                            boxShadow: [
                                                `0 0 10px ${getZoneColor(performanceZone.zone)}`,
                                                `0 0 25px ${getZoneColor(performanceZone.zone)}`,
                                                `0 0 10px ${getZoneColor(performanceZone.zone)}`
                                            ]
                                        }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    />
                                </div>
                            </motion.div>
                            <div className="hidden sm:block">
                                <p className="text-xs text-slate-400 uppercase tracking-widest">Status</p>
                                <p className="font-black text-lg" style={{ color: getZoneColor(performanceZone.zone) }}>
                                    {performanceZone.zone === 'GREEN' ? 'READY' : performanceZone.zone === 'AMBER' ? 'CAUTION' : 'DANGER'}
                                </p>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="flex items-center gap-3 sm:gap-6">
                            {/* Neural Fatigue */}
                            <motion.div
                                className="text-center px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                                whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 204, 0.5)' }}
                            >
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <span style={{ filter: 'drop-shadow(0 0 4px #00FFCC)' }}><FiZap className="text-cyan-400" /></span>
                                    <span className="text-xs text-cyan-300/70 uppercase tracking-wider hidden sm:inline">Neural</span>
                                </div>
                                <p className="text-xl font-black text-cyan-400 font-mono" style={{ textShadow: '0 0 10px #00FFCC60' }}>
                                    {(neuralData[neuralData.length - 1]?.fatigue ?? 0).toFixed(0)}%
                                </p>
                            </motion.div>

                            {/* AeroLung */}
                            <motion.div
                                className="text-center px-3 py-2 rounded-xl bg-pink-500/10 border border-pink-500/20"
                                whileHover={{ scale: 1.05, borderColor: 'rgba(255, 0, 85, 0.5)' }}
                            >
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <span style={{ filter: 'drop-shadow(0 0 4px #FF0055)' }}><FaLungs className="text-pink-400" /></span>
                                    <span className="text-xs text-pink-300/70 uppercase tracking-wider hidden sm:inline">Lung</span>
                                </div>
                                <p className="text-xl font-black text-pink-400 font-mono" style={{ textShadow: '0 0 10px #FF005560' }}>
                                    {Math.round(respiratoryData.valveAperture)}%
                                </p>
                            </motion.div>

                            {/* Symmetry */}
                            <motion.div
                                className="text-center px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20"
                                whileHover={{ scale: 1.05, borderColor: 'rgba(255, 215, 0, 0.5)' }}
                            >
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <span style={{ filter: 'drop-shadow(0 0 4px #FFD700)' }}><FaShoePrints className="text-amber-400" /></span>
                                    <span className="text-xs text-amber-300/70 uppercase tracking-wider hidden sm:inline">Balance</span>
                                </div>
                                <p className="text-xl font-black text-amber-400 font-mono" style={{ textShadow: '0 0 10px #FFD70060' }}>
                                    {gaitData.balanceLeft}/{gaitData.balanceRight}
                                </p>
                            </motion.div>
                        </div>

                        {/* Live indicator */}
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30">
                            <motion.div
                                className="w-2.5 h-2.5 rounded-full bg-red-500"
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                style={{ boxShadow: '0 0 8px #ef4444' }}
                            />
                            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header with Performance Zone */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FiCpu className="text-2xl text-cyan-400" />
                    <h2 className="text-xl font-bold text-white">Live Session HUD</h2>
                </div>
                <PerformanceZoneIndicator
                    zone={performanceZone.zone}
                    recommendation={performanceZone.recommendation}
                />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Neural Efficiency Chart */}
                <Card className="!p-4 !bg-slate-900/80 backdrop-blur border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                        <FiZap className="text-cyan-400" />
                        <h3 className="font-bold text-white">Neural Efficiency</h3>
                        <span className="text-xs text-slate-400 ml-auto">sEMG vs Velocity</span>
                    </div>
                    <NeuralEfficiencyChart data={neuralData} />
                </Card>

                {/* AeroLung Valve */}
                <Card className="!p-4 !bg-slate-900/80 backdrop-blur border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                        <FaLungs className="text-pink-400" />
                        <h3 className="font-bold text-white">AeroLung Status</h3>
                    </div>
                    <div className="flex items-center justify-around">
                        <ValveIndicator aperture={respiratoryData.valveAperture} />
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-8">
                                <span className="text-slate-400">VO2</span>
                                <span className="font-mono text-cyan-400">{respiratoryData.vo2Current.toFixed(1)} ml/kg/min</span>
                            </div>
                            <div className="flex items-center justify-between gap-8">
                                <span className="text-slate-400">SpO2</span>
                                <span className="font-mono text-green-400">{respiratoryData.spo2}%</span>
                            </div>
                            <div className="flex items-center justify-between gap-8">
                                <span className="text-slate-400">RR</span>
                                <span className="font-mono text-amber-400">{respiratoryData.respirationRate} bpm</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Bio-Symmetry Alert */}
            <BioSymmetryAlert
                balanceLeft={gaitData.balanceLeft}
                balanceRight={gaitData.balanceRight}
                threshold={10}
            />

            {/* Recent Events */}
            {events.length > 0 && (
                <Card className="!p-4 !bg-slate-900/80 backdrop-blur border-slate-700">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        <FiActivity className="text-cyan-400" />
                        Recent Events
                    </h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {events.slice(-5).reverse().map((event, i) => (
                            <div
                                key={i}
                                className={`text-xs p-2 rounded ${event.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
                                    event.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-300' :
                                        'bg-slate-700/50 text-slate-300'
                                    }`}
                            >
                                <span className="font-mono">{new Date(event.timestamp).toLocaleTimeString()}</span>
                                <span className="mx-2">•</span>
                                {event.message}
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default memo(LiveSessionHUD);
