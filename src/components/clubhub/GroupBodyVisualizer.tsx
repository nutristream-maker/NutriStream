import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GroupFatigueData } from '../../types/ClubTypes';
import { extractedAnatomyPaths } from '../body/AnatomyPaths';
import cuerpoSvg from '../../assets/cuerpo2d.svg';

interface GroupBodyVisualizerProps {
    data: GroupFatigueData[];
    view: 'front' | 'back';
    onMuscleClick?: (muscleName: string) => void;
    className?: string;
}

// Function to normalize muscle names for matching
const normalizeName = (name: string): string => {
    const map: { [key: string]: string } = {
        'hombros': 'Deltoides',
        'deltoides': 'Deltoides',
        'pecho': 'Pectoral',
        'pectoral': 'Pectoral',
        'biceps': 'Bíceps',
        'triceps': 'Tríceps',
        'antebrazo': 'Antebrazo',
        'core': 'Abdominales',
        'abdominales': 'Abdominales',
        'abs': 'Abdominales',
        'oblicuos': 'Oblicuos',
        'espalda': 'Dorsales', // Close enough approximation for general back
        'dorsales': 'Dorsales',
        'trapecio': 'Trapecio',
        'lumbares': 'Lumbares',
        'gluteos': 'Glúteos',
        'cuadriceps': 'Cuádriceps',
        'isquios': 'Isquiotibiales',
        'isquiotibiales': 'Isquiotibiales',
        'gemelos': 'Gemelos',
        'tibiales': 'Tibiales',
        'aductores': 'Aductores',
        'serrato': 'Serrato'
    };

    const normalized = name.toLowerCase().trim();
    return map[normalized] || name; // Fallback to original if no map found (capitalization might be needed)
};


const GroupBodyVisualizer: React.FC<GroupBodyVisualizerProps> = ({
    data,
    view,
    onMuscleClick,
    className = ''
}) => {
    const [hoveredPart, setHoveredPart] = useState<string | null>(null);

    // Filter paths based on view
    const currentPaths = useMemo(() => {
        return view === 'front'
            ? extractedAnatomyPaths.filter(p => p.side === 'front')
            : extractedAnatomyPaths.filter(p => p.side === 'back');
    }, [view]);

    const getMuscleFatigue = (muscleName: string): number => {
        // Try exact match
        let found = data.find(d => d.muscleName === muscleName || d.muscleId === muscleName);

        // Try normalized match
        if (!found) {
            const target = normalizeName(muscleName).toLowerCase();
            found = data.find(d => normalizeName(d.muscleName).toLowerCase() === target || normalizeName(d.muscleId).toLowerCase() === target);

            // Reverse lookup: check if data has a name that maps to this path muscle
            if (!found) {
                found = data.find(d => normalizeName(d.muscleName) === muscleName);
            }
        }

        return found ? found.averageFatigue : 0;
    };

    const getFatigueColor = (fatiguePercent: number): string => {
        if (fatiguePercent >= 80) return '#ef4444'; // Red - Critical
        if (fatiguePercent >= 60) return '#f97316'; // Orange - High
        if (fatiguePercent >= 40) return '#eab308'; // Yellow - Moderate
        if (fatiguePercent >= 20) return '#22c55e'; // Green - Good
        return '#10b981'; // Bright Green - Optimal
    };

    return (
        <div className={`relative ${className} flex justify-center items-center min-h-[400px]`}>
            <svg
                viewBox="0 0 300 520"
                className="w-full h-full max-w-[300px] object-contain drop-shadow-2xl"
                role="img"
                aria-label="Mapa de fatiga corporal"
            >
                <defs>
                    {/* ENHANCED FILTERS FROM BODY COMPONENT */}
                    <filter id="hyper-realism-filter-group" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                        <feOffset in="blur" dx="1" dy="2" result="offsetBlur" />
                        <feDiffuseLighting in="blur" lightingColor="#ffffff" surfaceScale="3" diffuseConstant="0.8" result="diffuse">
                            <feDistantLight azimuth="225" elevation="45" />
                        </feDiffuseLighting>
                        <feComposite in="diffuse" in2="SourceAlpha" operator="in" result="diffuseMasked" />
                        <feBlend in="diffuseMasked" in2="SourceGraphic" mode="soft-light" />
                    </filter>

                    <filter id="neon-glow-group" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id="white-silhouette-filter-group" colorInterpolationFilters="sRGB">
                        <feColorMatrix type="matrix" values="-1 0 0 0 1
                                                            0 -1 0 0 1
                                                            0 0 -1 0 1
                                                            0 0 0 1 0" />
                    </filter>

                    <clipPath id="front-clip-group">
                        <rect x="0" y="0" width="1024" height="2048" />
                    </clipPath>
                    <clipPath id="back-clip-group">
                        <rect x="1050" y="0" width="1000" height="2048" />
                    </clipPath>
                </defs>

                {/* Use group transform to center and scale the original 2048px artwork into 300x520 viewport */}
                {/* The original Cuerpo.tsx uses specific coordinates and width/height to crop */}
                {/* <svg x="-35" y="-15" width="370" height="555" ... > */}

                <svg x="-35" y="-15" width="370" height="555"
                    viewBox={view === 'front' ? "0 0 1024 2048" : "1024 0 1024 2048"}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ overflow: 'hidden' }}
                >
                    {/* 1. Underlying Authentic Art */}
                    <image
                        href={cuerpoSvg}
                        x="0"
                        y="0"
                        width="2048"
                        height="2048"
                        clipPath={view === 'front' ? "url(#front-clip-group)" : "url(#back-clip-group)"}
                        className="dark:invert dark:opacity-80 transition-all duration-500" // Simple dark mode invert if filter fails
                        style={{ filter: 'var(--body-filter)' }} // We can handle dark mode via CSS variable or class
                    />

                    {/* Add a specific dark mode style block for consistent SVG filtering */}
                    <style>
                        {`
                           :root { --body-filter: none; }
                           .dark { --body-filter: url(#white-silhouette-filter-group); }
                           /* Tailwind dark mode detection via parent class */
                           :global(.dark) image { filter: url(#white-silhouette-filter-group); }
                        `}
                    </style>

                    {/* 2. Muscle Heatmap Layers */}
                    <g transform="translate(0, 2048) scale(0.1, -0.1)">
                        {currentPaths.map((part, i) => {
                            const fatigue = getMuscleFatigue(part.name);
                            // Only show color if there is fatigue > 0
                            const hasFatigue = fatigue > 0;
                            const color = getFatigueColor(fatigue);
                            const opacity = 0.3 + (fatigue / 100) * 0.5;
                            const isHovered = hoveredPart === part.name;

                            return (
                                <g
                                    key={`${part.name}-${i}`}
                                    onMouseEnter={() => setHoveredPart(part.name)}
                                    onMouseLeave={() => setHoveredPart(null)}
                                    onClick={() => onMuscleClick?.(part.name)}
                                    className="cursor-pointer"
                                >
                                    {/* Invisible Hitbox */}
                                    <path d={part.d} fill="transparent" stroke="none" />

                                    {/* Colored Overlay */}
                                    <AnimatePresence>
                                        {(hasFatigue || isHovered) && (
                                            <motion.path
                                                d={part.d}
                                                initial={{ opacity: 0 }}
                                                animate={{
                                                    opacity: 1,
                                                    fill: color,
                                                    fillOpacity: isHovered ? 0.6 : opacity,
                                                    stroke: color,
                                                    strokeWidth: isHovered ? 20 : 0
                                                }}
                                                exit={{ opacity: 0 }}
                                                filter="url(#neon-glow-group)"
                                                style={{ mixBlendMode: 'multiply' }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </svg>

            {/* Hover Tooltip */}
            <AnimatePresence>
                {hoveredPart && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-4 bg-slate-900/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md border border-white/10 shadow-xl pointer-events-none z-50"
                    >
                        {hoveredPart}: {getMuscleFatigue(hoveredPart)}%
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GroupBodyVisualizer;
