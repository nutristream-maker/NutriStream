/**
 * DigitalBodyHeatmap Component
 * Interactive SVG human body visualization with dynamic muscle heatmap
 * Cyber-Fitness aesthetic with neon glow effects
 */

import React, { useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSensorStore } from '../../store/useSensorStore';
import { getZoneColor } from '../../services/PerformanceZoneService';
import type { PerformanceZone } from '../../types/BiometricTypes';

// ============================================================================
// TYPES
// ============================================================================

interface MuscleGroup {
    id: string;
    name: string;
    displayName: string;
    path: string;
    center: { x: number; y: number };
    linkedMuscles?: string[]; // Synergistic muscles
}

interface DigitalBodyHeatmapProps {
    width?: number;
    height?: number;
    view?: 'front' | 'back';
    showLabels?: boolean;
    onMuscleClick?: (muscleId: string, fatigueLevel: number) => void;
    className?: string;
}

// ============================================================================
// MUSCLE DEFINITIONS (Simplified SVG paths for key muscle groups)
// ============================================================================

const FRONT_MUSCLES: MuscleGroup[] = [
    {
        id: 'chest_left',
        name: 'pectoralis_major_left',
        displayName: 'Pectoral L',
        path: 'M 100 120 Q 80 130 85 155 Q 100 165 120 155 Q 130 140 120 120 Z',
        center: { x: 105, y: 140 },
        linkedMuscles: ['deltoid_left', 'triceps_left']
    },
    {
        id: 'chest_right',
        name: 'pectoralis_major_right',
        displayName: 'Pectoral R',
        path: 'M 200 120 Q 220 130 215 155 Q 200 165 180 155 Q 170 140 180 120 Z',
        center: { x: 195, y: 140 },
        linkedMuscles: ['deltoid_right', 'triceps_right']
    },
    {
        id: 'deltoid_left',
        name: 'deltoid_left',
        displayName: 'Deltoid L',
        path: 'M 70 105 Q 55 115 55 140 Q 65 150 80 145 L 85 120 Z',
        center: { x: 68, y: 125 }
    },
    {
        id: 'deltoid_right',
        name: 'deltoid_right',
        displayName: 'Deltoid R',
        path: 'M 230 105 Q 245 115 245 140 Q 235 150 220 145 L 215 120 Z',
        center: { x: 232, y: 125 }
    },
    {
        id: 'biceps_left',
        name: 'biceps_left',
        displayName: 'Biceps L',
        path: 'M 55 150 Q 45 170 50 200 Q 60 210 70 200 Q 75 170 70 150 Z',
        center: { x: 60, y: 175 }
    },
    {
        id: 'biceps_right',
        name: 'biceps_right',
        displayName: 'Biceps R',
        path: 'M 245 150 Q 255 170 250 200 Q 240 210 230 200 Q 225 170 230 150 Z',
        center: { x: 240, y: 175 }
    },
    {
        id: 'abs',
        name: 'rectus_abdominis',
        displayName: 'Abs',
        path: 'M 125 165 L 175 165 L 175 250 L 125 250 Z',
        center: { x: 150, y: 207 }
    },
    {
        id: 'obliques_left',
        name: 'obliques_left',
        displayName: 'Oblique L',
        path: 'M 100 170 L 125 170 L 120 250 L 95 240 Z',
        center: { x: 110, y: 210 }
    },
    {
        id: 'obliques_right',
        name: 'obliques_right',
        displayName: 'Oblique R',
        path: 'M 200 170 L 175 170 L 180 250 L 205 240 Z',
        center: { x: 190, y: 210 }
    },
    {
        id: 'quadriceps_left',
        name: 'quadriceps_left',
        displayName: 'Quad L',
        path: 'M 105 265 Q 90 300 95 360 Q 110 375 130 360 Q 135 300 125 265 Z',
        center: { x: 112, y: 315 },
        linkedMuscles: ['glutes_left', 'hamstrings_left']
    },
    {
        id: 'quadriceps_right',
        name: 'quadriceps_right',
        displayName: 'Quad R',
        path: 'M 195 265 Q 210 300 205 360 Q 190 375 170 360 Q 165 300 175 265 Z',
        center: { x: 188, y: 315 },
        linkedMuscles: ['glutes_right', 'hamstrings_right']
    },
    {
        id: 'tibialis_left',
        name: 'tibialis_anterior_left',
        displayName: 'Tibialis L',
        path: 'M 100 375 Q 95 420 100 470 Q 115 475 120 470 Q 125 420 115 375 Z',
        center: { x: 108, y: 425 }
    },
    {
        id: 'tibialis_right',
        name: 'tibialis_anterior_right',
        displayName: 'Tibialis R',
        path: 'M 200 375 Q 205 420 200 470 Q 185 475 180 470 Q 175 420 185 375 Z',
        center: { x: 192, y: 425 }
    }
];

const BACK_MUSCLES: MuscleGroup[] = [
    {
        id: 'trapezius',
        name: 'trapezius',
        displayName: 'Traps',
        path: 'M 120 80 L 180 80 L 195 120 L 150 140 L 105 120 Z',
        center: { x: 150, y: 105 }
    },
    {
        id: 'lats_left',
        name: 'latissimus_dorsi_left',
        displayName: 'Lat L',
        path: 'M 85 130 Q 70 160 80 200 Q 100 220 120 200 L 125 150 Q 110 130 85 130 Z',
        center: { x: 100, y: 165 }
    },
    {
        id: 'lats_right',
        name: 'latissimus_dorsi_right',
        displayName: 'Lat R',
        path: 'M 215 130 Q 230 160 220 200 Q 200 220 180 200 L 175 150 Q 190 130 215 130 Z',
        center: { x: 200, y: 165 }
    },
    {
        id: 'glutes_left',
        name: 'gluteus_maximus_left',
        displayName: 'Glute L',
        path: 'M 100 240 Q 80 260 90 290 Q 115 305 140 285 Q 145 255 130 240 Z',
        center: { x: 115, y: 265 }
    },
    {
        id: 'glutes_right',
        name: 'gluteus_maximus_right',
        displayName: 'Glute R',
        path: 'M 200 240 Q 220 260 210 290 Q 185 305 160 285 Q 155 255 170 240 Z',
        center: { x: 185, y: 265 }
    },
    {
        id: 'hamstrings_left',
        name: 'hamstrings_left',
        displayName: 'Hamstring L',
        path: 'M 95 300 Q 85 340 90 390 Q 110 400 130 390 Q 140 340 125 300 Z',
        center: { x: 110, y: 345 }
    },
    {
        id: 'hamstrings_right',
        name: 'hamstrings_right',
        displayName: 'Hamstring R',
        path: 'M 205 300 Q 215 340 210 390 Q 190 400 170 390 Q 160 340 175 300 Z',
        center: { x: 190, y: 345 }
    },
    {
        id: 'calves_left',
        name: 'gastrocnemius_left',
        displayName: 'Calf L',
        path: 'M 95 400 Q 85 440 95 480 Q 115 490 125 480 Q 135 440 120 400 Z',
        center: { x: 108, y: 440 }
    },
    {
        id: 'calves_right',
        name: 'gastrocnemius_right',
        displayName: 'Calf R',
        path: 'M 205 400 Q 215 440 205 480 Q 185 490 175 480 Q 165 440 180 400 Z',
        center: { x: 192, y: 440 }
    }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get color based on fatigue percentage using cyber-fitness palette
 */
function getFatigueColor(fatiguePercent: number): string {
    if (fatiguePercent < 30) return '#00FFCC'; // Neon cyan - low fatigue
    if (fatiguePercent < 50) return '#7FFF00'; // Chartreuse - moderate
    if (fatiguePercent < 70) return '#FFD700'; // Gold - elevated
    if (fatiguePercent < 85) return '#FF6B35'; // Orange - high
    return '#FF0055'; // Neon red - critical
}

/**
 * Get glow intensity based on muscle activation
 */
function getGlowIntensity(fatiguePercent: number, isActive: boolean): number {
    if (!isActive) return 0;
    // Scale from 4px to 16px based on fatigue
    return 4 + (fatiguePercent / 100) * 12;
}

/**
 * Get opacity based on fatigue level
 */
function getOpacity(fatiguePercent: number, isActive: boolean): number {
    if (!isActive) return 0.3;
    return 0.5 + (fatiguePercent / 100) * 0.5;
}

// ============================================================================
// MUSCLE PATH COMPONENT
// ============================================================================

interface MusclePathProps {
    muscle: MuscleGroup;
    fatiguePercent: number;
    isActive: boolean;
    isHovered: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

const MusclePath = memo<MusclePathProps>(({
    muscle,
    fatiguePercent,
    isActive,
    isHovered,
    onClick,
    onMouseEnter,
    onMouseLeave
}) => {
    const color = getFatigueColor(fatiguePercent);
    const glowIntensity = getGlowIntensity(fatiguePercent, isActive);
    const opacity = getOpacity(fatiguePercent, isActive);

    const glowFilter = useMemo(() => {
        if (glowIntensity === 0) return 'none';
        return `drop-shadow(0 0 ${glowIntensity}px ${color}) drop-shadow(0 0 ${glowIntensity * 0.5}px ${color})`;
    }, [glowIntensity, color]);

    return (
        <motion.path
            d={muscle.path}
            fill={color}
            fillOpacity={opacity}
            stroke={isHovered ? '#FFFFFF' : color}
            strokeWidth={isHovered ? 2 : 1}
            strokeOpacity={0.8}
            style={{
                filter: glowFilter,
                cursor: 'pointer',
                transition: 'fill 0.3s, filter 0.3s'
            }}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            role="button"
            aria-label={`${muscle.displayName}: ${fatiguePercent}% fatigue`}
        />
    );
});

MusclePath.displayName = 'MusclePath';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DigitalBodyHeatmap: React.FC<DigitalBodyHeatmapProps> = ({
    width = 300,
    height = 520,
    view = 'front',
    showLabels = false,
    onMuscleClick,
    className = ''
}) => {
    const { muscleFatigue, activeMuscles } = useSensorStore();
    const [hoveredMuscle, setHoveredMuscle] = React.useState<string | null>(null);

    const muscles = view === 'front' ? FRONT_MUSCLES : BACK_MUSCLES;

    const handleMuscleClick = useCallback((muscleId: string) => {
        const fatigue = muscleFatigue[muscleId] ?? 0;
        onMuscleClick?.(muscleId, fatigue);
    }, [muscleFatigue, onMuscleClick]);

    // Body outline with gradient
    const bodyOutlineGradientId = `body-outline-gradient-${view}`;
    const bodyGlowId = `body-glow-${view}`;

    return (
        <motion.div
            className={`relative ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Premium Container */}
            <div className="relative overflow-hidden rounded-2xl">
                {/* Animated gradient border */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/50 via-purple-500/30 to-pink-500/50 rounded-2xl" />

                {/* Glassmorphism inner container */}
                <div className="relative m-[1px] rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/98 to-slate-950/95 backdrop-blur-xl">
                    {/* Animated scan line effect */}
                    <motion.div
                        className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none"
                        animate={{
                            top: ['0%', '100%', '0%']
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'linear'
                        }}
                    />

                    {/* Ambient glow spots */}
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Header */}
                    <div className="relative z-10 px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <motion.div
                                className="w-2 h-2 rounded-full bg-cyan-400"
                                animate={{
                                    boxShadow: [
                                        '0 0 4px #00FFCC, 0 0 8px #00FFCC',
                                        '0 0 8px #00FFCC, 0 0 16px #00FFCC',
                                        '0 0 4px #00FFCC, 0 0 8px #00FFCC'
                                    ]
                                }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {view === 'front' ? 'Frontal View' : 'Posterior View'}
                            </span>
                        </div>
                        <span className="text-xs text-cyan-400/70 font-mono">LIVE</span>
                    </div>

                    {/* Body content */}
                    <div className="relative z-10 p-4">
                        {/* SVG Filters for Neon Effects */}
                        <svg width="0" height="0" className="absolute">
                            <defs>
                                {/* Gradient for body outline */}
                                <linearGradient id={bodyOutlineGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#00FFCC" stopOpacity="0.3" />
                                    <stop offset="50%" stopColor="#7B68EE" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#FF0055" stopOpacity="0.3" />
                                </linearGradient>

                                {/* Glow filter */}
                                <filter id={bodyGlowId} x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>

                                {/* Pulse animation filter */}
                                <filter id="pulse-glow">
                                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                        </svg>

                        {/* Main SVG */}
                        <svg
                            viewBox="0 0 300 520"
                            width={width}
                            height={height}
                            className="mx-auto"
                            role="img"
                            aria-label={`Body heatmap - ${view} view`}
                        >
                            {/* Background body silhouette */}
                            <ellipse
                                cx="150"
                                cy="50"
                                rx="35"
                                ry="40"
                                fill="none"
                                stroke={`url(#${bodyOutlineGradientId})`}
                                strokeWidth="1.5"
                                opacity="0.5"
                            />

                            {/* Torso outline */}
                            <path
                                d={view === 'front'
                                    ? 'M 95 90 Q 70 100 60 140 L 55 200 Q 50 250 60 260 L 90 260 L 95 200 Q 100 180 100 160 L 100 150 Q 100 140 110 130 L 150 110 L 190 130 Q 200 140 200 150 L 200 160 Q 200 180 205 200 L 210 260 L 240 260 Q 250 250 245 200 L 240 140 Q 230 100 205 90 L 150 80 Z'
                                    : 'M 95 90 Q 70 100 60 140 L 55 200 Q 50 250 60 260 L 90 260 L 95 200 L 100 150 Q 100 140 110 130 L 150 110 L 190 130 Q 200 140 200 150 L 205 200 L 210 260 L 240 260 Q 250 250 245 200 L 240 140 Q 230 100 205 90 L 150 80 Z'
                                }
                                fill="none"
                                stroke={`url(#${bodyOutlineGradientId})`}
                                strokeWidth="1"
                                opacity="0.4"
                            />

                            {/* Legs outline */}
                            <path
                                d="M 100 260 Q 85 320 90 400 Q 85 450 95 500 L 115 500 Q 125 450 120 400 Q 130 320 140 260 Z"
                                fill="none"
                                stroke={`url(#${bodyOutlineGradientId})`}
                                strokeWidth="1"
                                opacity="0.3"
                            />
                            <path
                                d="M 200 260 Q 215 320 210 400 Q 215 450 205 500 L 185 500 Q 175 450 180 400 Q 170 320 160 260 Z"
                                fill="none"
                                stroke={`url(#${bodyOutlineGradientId})`}
                                strokeWidth="1"
                                opacity="0.3"
                            />

                            {/* Muscle Groups */}
                            <AnimatePresence>
                                {muscles.map(muscle => {
                                    const fatigue = muscleFatigue[muscle.name] ?? muscleFatigue[muscle.id] ?? 0;
                                    const isActive = activeMuscles.includes(muscle.name) || activeMuscles.includes(muscle.id);
                                    const isHovered = hoveredMuscle === muscle.id;

                                    return (
                                        <MusclePath
                                            key={muscle.id}
                                            muscle={muscle}
                                            fatiguePercent={fatigue}
                                            isActive={isActive || fatigue > 0}
                                            isHovered={isHovered}
                                            onClick={() => handleMuscleClick(muscle.id)}
                                            onMouseEnter={() => setHoveredMuscle(muscle.id)}
                                            onMouseLeave={() => setHoveredMuscle(null)}
                                        />
                                    );
                                })}
                            </AnimatePresence>

                            {/* Labels */}
                            {showLabels && muscles.map(muscle => {
                                const fatigue = muscleFatigue[muscle.name] ?? muscleFatigue[muscle.id] ?? 0;
                                const isHovered = hoveredMuscle === muscle.id;

                                return (
                                    <AnimatePresence key={`label-${muscle.id}`}>
                                        {(isHovered || fatigue > 50) && (
                                            <motion.g
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                            >
                                                <rect
                                                    x={muscle.center.x - 25}
                                                    y={muscle.center.y - 20}
                                                    width="50"
                                                    height="16"
                                                    rx="4"
                                                    fill="rgba(0,0,0,0.8)"
                                                />
                                                <text
                                                    x={muscle.center.x}
                                                    y={muscle.center.y - 8}
                                                    textAnchor="middle"
                                                    fill="#FFFFFF"
                                                    fontSize="8"
                                                    fontWeight="bold"
                                                >
                                                    {fatigue}%
                                                </text>
                                            </motion.g>
                                        )}
                                    </AnimatePresence>
                                );
                            })}
                        </svg>

                        {/* Hover Tooltip */}
                        <AnimatePresence>
                            {hoveredMuscle && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg bg-slate-900/90 backdrop-blur-sm border border-cyan-500/30 shadow-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{
                                                backgroundColor: getFatigueColor(
                                                    muscleFatigue[hoveredMuscle] ?? 0
                                                ),
                                                boxShadow: `0 0 8px ${getFatigueColor(muscleFatigue[hoveredMuscle] ?? 0)}`
                                            }}
                                        />
                                        <span className="text-white font-medium text-sm">
                                            {muscles.find(m => m.id === hoveredMuscle)?.displayName}
                                        </span>
                                        <span className="text-cyan-400 font-bold text-sm">
                                            {muscleFatigue[hoveredMuscle] ?? 0}%
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Legend */}
                        <div className="flex justify-center gap-4 mt-4 text-xs">
                            {[
                                { color: '#00FFCC', label: '0-30%' },
                                { color: '#FFD700', label: '30-70%' },
                                { color: '#FF0055', label: '70-100%' }
                            ].map(({ color, label }) => (
                                <div key={label} className="flex items-center gap-1">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{
                                            backgroundColor: color,
                                            boxShadow: `0 0 6px ${color}`
                                        }}
                                    />
                                    <span className="text-slate-400">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default memo(DigitalBodyHeatmap);
