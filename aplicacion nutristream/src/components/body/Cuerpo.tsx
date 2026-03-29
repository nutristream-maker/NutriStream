import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../common/SEO';
import { FiRefreshCw, FiMousePointer, FiUser, FiCpu, FiBluetooth, FiActivity, FiZap, FiBattery, FiCheckCircle, FiCommand, FiAlertTriangle, FiCalendar, FiHeart } from 'react-icons/fi';
import { GiMuscleUp, GiBrain, GiShirt, GiLegArmor, GiBodyBalance } from 'react-icons/gi';

import { Card, Button, Toggle } from '../ui/Shared';
import { genAI } from '../../services/ai';
import { mockRecoveryData } from '../../data/mockData';
import MetricCard from './MetricCard';
import InjuryModal from './InjuryModal';
import BiometricsPanel from './BiometricsPanel';

import { useBluetoothDevice } from '../../hooks/useBluetoothDevice';
import { DEVICE_CONFIG } from '../../services/BluetoothService';
import { useSensorStore } from '../../store/useSensorStore';
import { useUser } from '../../context/UserContext';


import { extractedAnatomyPaths } from './AnatomyPaths';
import cuerpoSvg from '../../assets/cuerpo2d.svg';


// --- DATA HELPERS ---
const getRecoveryDetails = (percentage: number, t: any) => {
    if (percentage >= 85) return { statusText: t('listo'), recommendation: t('rec_listo'), color: 'text-green-400', progressColor: 'bg-green-500', hex: '#4ade80' };
    if (percentage >= 60) return { statusText: t('optimo'), recommendation: t('rec_optimo'), color: 'text-cyan-400', progressColor: 'bg-cyan-500', hex: '#22d3ee' };
    if (percentage >= 30) return { statusText: t('fatigado'), recommendation: t('rec_fatigado'), color: 'text-yellow-400', progressColor: 'bg-yellow-500', hex: '#facc15' };
    return { statusText: t('critico'), recommendation: t('rec_critico'), color: 'text-red-400', progressColor: 'bg-red-500', hex: '#f87171' };
};

const normalizeKey = (key: string) => {
    return key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "_");
};

const getVisualizationColor = (partName: string, mode: 'recovery' | 'live', recoveryData: any, liveData: any) => {
    if (mode === 'live') {
        // LIVE MODE: Show Fatigue / Activation
        const fatigue = liveData.fatigueMap?.[partName] || 0;
        const isActive = liveData.activeMuscles?.includes(partName);

        if (isActive) return '#0ea5e9'; // Active (Blue)
        if (fatigue > 70) return '#ef4444'; // High Fatigue (Red)
        if (fatigue > 40) return '#f59e0b'; // Medium Fatigue (Orange)
        return '#334155'; // Resting (Dark Grey)
    } else {
        // RECOVERY MODE: Show Recovery Status
        const percentage = recoveryData[partName]?.recovery;
        if (percentage === undefined) return '#94a3b8';
        if (percentage >= 85) return '#10b981'; // Ready (Green)
        if (percentage >= 60) return '#0ea5e9'; // Optimal (Cyan)
        if (percentage >= 30) return '#f59e0b'; // Fatigued (Yellow)
        return '#ef4444'; // Critical (Red)
    }
};

const getIntensityColor = (intensity: string | undefined) => {
    switch (intensity?.toLowerCase()) {
        case 'muy alta': return 'bg-red-600';
        case 'alta': return 'bg-red-500';
        case 'media': return 'bg-orange-500';
        case 'baja': return 'bg-green-500';
        default: return 'bg-slate-500';
    }
};

// Get fatigue color based on percentage (0-100)
const getFatigueColor = (fatiguePercent: number): string => {
    if (fatiguePercent >= 80) return '#ef4444'; // Red - Critical
    if (fatiguePercent >= 60) return '#f97316'; // Orange - High
    if (fatiguePercent >= 40) return '#eab308'; // Yellow - Moderate
    if (fatiguePercent >= 20) return '#22c55e'; // Green - Good
    return '#10b981'; // Bright Green - Optimal
};

const muscleSynergies: { [key: string]: string[] } = { 'Pectoral': ['Deltoides', 'Tríceps', 'Serrato'], 'Dorsales': ['Bíceps', 'Antebrazo', 'Trapecio', 'Deltoides'], 'Cuádriceps': ['Glúteos', 'Isquiotibiales', 'Gemelos'], 'Isquiotibiales': ['Glúteos', 'Cuádriceps', 'Gemelos'], 'Glúteos': ['Cuádriceps', 'Isquiotibiales'], 'Deltoides': ['Pectoral', 'Tríceps', 'Trapecio'], 'Bíceps': ['Antebrazo', 'Dorsales'], 'Tríceps': ['Pectoral', 'Deltoides'], 'Abdominales': ['Oblicuos'], 'Oblicuos': ['Abdominales', 'Serrato'], 'Trapecio': ['Deltoides', 'Dorsales'], 'Serrato': ['Pectoral', 'Oblicuos'], 'Antebrazo': ['Bíceps', 'Tríceps'], 'Gemelos': ['Cuádriceps', 'Isquiotibiales'], };

type SelectedItem =
    | { type: 'muscle'; name: string; data: any; related: string[] }
    | null;

// --- ANATOMY PATHS ---
// Clean line-art style matching professional anatomical reference
// Viewport: 300x520, centered at x=150
// Hardcoded anatomyPaths removed in favor of extractedAnatomyPaths

const MuscleGroup: React.FC<{
    part: any;
    isSelected: boolean;
    isSynergy: boolean;
    isHovered: boolean;
    isTransparent: boolean;
    mode: 'recovery' | 'live';
    liveData: { activeMuscles: string[], fatigueMap: { [key: string]: number } };
    onClick: () => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
    selectedPart: any;
    showHeatmap?: boolean;
}> = ({ part, isSelected, isSynergy, isHovered, isTransparent, mode, liveData, onClick, onMouseMove, onMouseLeave, selectedPart, showHeatmap }) => {
    const recoveryPercentage = mockRecoveryData[part.name]?.recovery || 0;
    const fatiguePercentage = liveData.fatigueMap[part.name] || 0;
    const statusLabel = mode === 'live'
        ? `${part.name}, Fatiga: ${fatiguePercentage}%`
        : `${part.name}, Recuperación: ${recoveryPercentage}%`;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        }
    };
    const baseColor = getVisualizationColor(part.name, mode, mockRecoveryData, liveData);

    return (
        <motion.g
            onClick={onClick}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            onKeyDown={handleKeyDown}
            className="cursor-pointer"
            role="button"
            aria-label={statusLabel}
            tabIndex={0}
            animate={{
                opacity: (selectedPart && !isSelected && !isSynergy) ? 0.3 : 1,
                scale: isSelected || isHovered ? 1.05 : 1,
                filter: isSelected || isHovered ? "brightness(1.2)" : "brightness(1)"
            }}
            style={{ transformOrigin: 'center', transformBox: 'fill-box', transitionDuration: '0.3s' }}
        >
            {/* Invisible Hitbox (Interaction Layer) */}
            <path d={part.d} fill="transparent" stroke="none" style={{ pointerEvents: 'all' }} />

            {/* Heatmap Overlay (Always visible when showHeatmap is true) */}
            {showHeatmap && (() => {
                const fatigueLevel = liveData.fatigueMap[part.name] || (100 - recoveryPercentage) * 0.5;
                const heatmapColor = getFatigueColor(fatigueLevel);
                const opacity = 0.3 + (fatigueLevel / 100) * 0.5; // 30% to 80% opacity based on fatigue

                return (
                    <motion.path
                        d={part.d}
                        fill={heatmapColor}
                        fillOpacity={opacity}
                        stroke={heatmapColor}
                        strokeWidth="8"
                        filter="url(#neon-glow)"
                        style={{ mixBlendMode: 'multiply', pointerEvents: 'none' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    />
                );
            })()}

            {/* Highlight Overlay (Only visible when active) - DYNAMIC COLOR */}
            {!showHeatmap && (isSelected || isHovered || (mode === 'live' && liveData.activeMuscles.includes(part.name))) && (() => {
                // Determine fatigue/recovery level for this muscle
                const fatigueLevel = mode === 'live'
                    ? (liveData.fatigueMap[part.name] || 0)
                    : (100 - recoveryPercentage);

                const highlightColor = getFatigueColor(fatigueLevel);

                return (
                    <motion.path
                        d={part.d}
                        fill={`${highlightColor}33`} // 33 = ~20% opacity in hex
                        stroke={highlightColor}
                        strokeWidth="10"
                        filter="url(#neon-glow)"
                        style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}
                        animate={{
                            fill: `${highlightColor}33`,
                            stroke: highlightColor
                        }}
                        transition={{ duration: 0.3 }}
                    />
                );
            })()}
        </motion.g>
    );
};



const BodySVG: React.FC<{
    isDarkMode: boolean,
    selectedItem: SelectedItem,
    view: string,
    mode: 'recovery' | 'live',
    liveData: { activeMuscles: string[], fatigueMap: { [key: string]: number } },
    handlePartClick: any,

    handlePartMouseMove: any,
    handlePartMouseLeave: any,
    hoveredPart: any,
    showHeatmap?: boolean
}> = ({ isDarkMode, selectedItem, view, mode, liveData, handlePartClick, handlePartMouseMove, handlePartMouseLeave, hoveredPart, showHeatmap }) => {

    const currentPaths = useMemo(() => {
        return view === 'front'
            ? extractedAnatomyPaths.filter(p => p.side === 'front')
            : extractedAnatomyPaths.filter(p => p.side === 'back');
    }, [view]);

    // Anatomically correct silhouette using 8-head proportions
    // Viewport: 300x520, Body centered at x=150, 1 head = 60px
    // Head: 10-70, Shoulders: 85, Chest: 100-160, Waist: 180, Hips: 220, Legs: 240-490
    // Silhouette removed to fix misalignment with SVG
    const silhouettePath = "";


    return (
        <svg
            viewBox="0 0 300 520"
            className="w-full h-full max-h-[70vh] object-contain filter transition-all duration-500 drop-shadow-2xl dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            role="img"
            aria-label="Modelo anatómico muscular interactivo"
        >
            <defs>
                {/* ENHANCED LIGHTING FILTER - Optimized for mobile performance */}
                <filter id="hyper-realism-filter" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                    <feOffset in="blur" dx="1" dy="2" result="offsetBlur" />
                    <feDiffuseLighting in="blur" lightingColor={isDarkMode ? "#475569" : "#ffffff"} surfaceScale="3" diffuseConstant="0.8" result="diffuse">
                        <feDistantLight azimuth="225" elevation="45" />
                    </feDiffuseLighting>
                    <feComposite in="diffuse" in2="SourceAlpha" operator="in" result="diffuseMasked" />
                    <feBlend in="diffuseMasked" in2="SourceGraphic" mode="soft-light" />
                </filter>

                {/* MUSCLE VOLUME GRADIENT - 3D Roundness */}
                <radialGradient id="muscle-volume-gradient" cx="30%" cy="30%" r="70%" fx="20%" fy="20%">
                    <stop offset="0%" stopColor={isDarkMode ? "#1e293b" : "#ffffff"} stopOpacity="0.4" />
                    <stop offset="40%" stopColor={isDarkMode ? "#1e293b" : "#ffffff"} stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
                </radialGradient>

                {/* MUSCLE DEPTH GRADIENT - Edge Shading */}
                <linearGradient id="muscle-depth" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isDarkMode ? "#334155" : "#ffffff"} stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#000000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
                </linearGradient>

                {/* SKIN GRADIENT - Realistic Flesh Tones */}
                <linearGradient id="skin-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isDarkMode ? "#334155" : "#f5d0c5"} stopOpacity="0.9" />
                    <stop offset="30%" stopColor={isDarkMode ? "#1e293b" : "#e8b4a0"} stopOpacity="0.85" />
                    <stop offset="70%" stopColor={isDarkMode ? "#0f172a" : "#d4967a"} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={isDarkMode ? "#020617" : "#b87860"} stopOpacity="0.75" />
                </linearGradient>

                {/* SKIN SUBSURFACE - Blood undertone */}
                <radialGradient id="skin-subsurface" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor={isDarkMode ? "#475569" : "#ffb8a8"} stopOpacity={isDarkMode ? 0.1 : 0.3} />
                    <stop offset="100%" stopColor={isDarkMode ? "#1e293b" : "#c96050"} stopOpacity="0.2" />
                </radialGradient>

                {/* MUSCLE FIBER PATTERN - Subtle striation */}
                <pattern id="fiber-pattern" patternUnits="userSpaceOnUse" width="3" height="8" patternTransform="rotate(75)">
                    <line x1="0" y1="0" x2="0" y2="8" stroke="#000" strokeWidth="0.3" opacity="0.08" />
                    <line x1="1.5" y1="0" x2="1.5" y2="8" stroke="#fff" strokeWidth="0.2" opacity="0.05" />
                </pattern>

                {/* AMBIENT OCCLUSION - Edge darkening */}
                <filter id="ambient-occlusion" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="out" result="inverse" />
                    <feFlood floodColor="#000000" floodOpacity="0.3" result="color" />
                    <feComposite in="color" in2="inverse" operator="in" result="shadow" />
                    <feComposite in="SourceGraphic" in2="shadow" operator="over" />
                </filter>

                {/* NEON GLOW - Selection highlight */}
                <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feGaussianBlur stdDeviation="8" result="coloredBlur2" />
                    <feMerge>
                        <feMergeNode in="coloredBlur2" />
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* DROP SHADOW - Depth */}
                <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
                </filter>

                {/* INNER SHADOW - Muscle definition (optimized) */}
                <filter id="inner-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feComponentTransfer in="SourceAlpha">
                        <feFuncA type="table" tableValues="1 0" />
                    </feComponentTransfer>
                    <feGaussianBlur stdDeviation="2" />
                    <feOffset dx="2" dy="2" result="offsetblur" />
                    <feFlood floodColor="#3a1a0a" floodOpacity="0.5" result="color" />
                    <feComposite in2="offsetblur" operator="in" />
                    <feComposite in2="SourceAlpha" operator="in" />
                    <feMerge>
                        <feMergeNode in="SourceGraphic" />
                        <feMergeNode />
                    </feMerge>
                </filter>

                {/* WHITE SILHOUETTE FILTER - Robust inversion for mobile Safari */}
                <filter id="white-silhouette-filter" colorInterpolationFilters="sRGB">
                    <feColorMatrix type="matrix" values="-1 0 0 0 1
                                                        0 -1 0 0 1
                                                        0 0 -1 0 1
                                                        0 0 0 1 0" />
                </filter>
            </defs>

            {/* Silhouette Background Removed */}


            {/* Muscle Layer */}

            {/* Muscle Layer */}
            <g id="muscle-layer">
                {/* Hybrid approach: Authentic Image Background + Interactive Overlay Path */}
                {/* STRICT clipping strategy:
                    Front View: Max X is ~895. Limit ViewBox to 900 width.
                    Back View: Min X is ~1050. Start ViewBox at 1050.
                    Using explicit aspect ratio preservation to avoid bleed.
                */}
                <svg x="-35" y="-15" width="370" height="555"
                    viewBox={view === 'front' ? "0 0 1024 2048" : "1024 0 1024 2048"}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ overflow: 'hidden' }}
                >
                    <defs>
                        <clipPath id="front-clip">
                            <rect x="0" y="0" width="1024" height="2048" />
                        </clipPath>
                        <clipPath id="back-clip">
                            <rect x="1050" y="0" width="1000" height="2048" />
                        </clipPath>
                    </defs>
                    {/* 1. Underlying Authentic Art */}
                    <image href={cuerpoSvg} x="0" y="0" width="2048" height="2048"
                        clipPath={view === 'front' ? "url(#front-clip)" : "url(#back-clip)"}
                        style={{ filter: isDarkMode ? 'url(#white-silhouette-filter)' : 'none' }}
                        className="transition-all duration-500"
                    />


                    {/* 2. Interactive Overlay Layer (Invisible Hitboxes) */}
                    <g transform="translate(0, 2048) scale(0.1, -0.1)">
                        {currentPaths.map((part: any, i: number) => (
                            <MuscleGroup
                                key={`${part.name}-${i}`}
                                part={part}
                                isSelected={selectedItem?.type === 'muscle' && selectedItem?.name === part.name}
                                isSynergy={selectedItem?.type === 'muscle' && (selectedItem?.related.includes(part.name) ?? false)}
                                isHovered={hoveredPart === part.name}
                                isTransparent={false} // Always visible, colored by logic
                                mode={mode}
                                liveData={liveData}
                                onClick={() => handlePartClick(part.name)}
                                onMouseMove={(e) => handlePartMouseMove(e, part.name)}
                                onMouseLeave={handlePartMouseLeave}
                                selectedPart={selectedItem}
                                showHeatmap={showHeatmap}
                            />
                        ))}
                    </g>
                </svg>
            </g>

            {/* Skin Layer - Enhanced with realistic shading */}

        </svg >
    );
};



const Cuerpo: React.FC = React.memo(() => {
    const { t, language } = useLanguage();
    const { userData } = useUser();
    const [view, setView] = useState<'front' | 'back'>('front');
    const [viewMode, setViewMode] = useState<'body' | 'biometrics'>('body');

    // REACTIVE DARK MODE: Listen for class changes on <html>
    const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsDarkMode(document.documentElement.classList.contains('dark'));
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
    const [hoveredPart, setHoveredPart] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<{ visible: boolean; part: any; x: number; y: number; }>({ visible: false, part: null, x: 0, y: 0 });
    const [activeTab, setActiveTab] = useState('analysis');
    const [aiTip, setAiTip] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isInjuryModalOpen, setIsInjuryModalOpen] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);

    // --- NEURAL POD DATA INTEGRATION ---
    const { updateMuscleData, updateBiometrics, updateDeviceStatus, activeMuscles: contextActiveMuscles, muscleFatigue: contextFatigue } = useSensorStore();
    const [deviceType, setDeviceType] = useState<'shirt' | 'pants' | 'full'>('shirt');
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [calibrationProgress, setCalibrationProgress] = useState(0);

    const { connectionState: realConnectionState, data: realData, connect: connectReal, disconnect: disconnectReal } = useBluetoothDevice<any>({
        deviceNameFilter: 'NEURAL_POD', serviceUuid: DEVICE_CONFIG.NS_POD.SERVICE_UUID, characteristicUuid: DEVICE_CONFIG.NS_POD.CHARACTERISTICS.DATA_STREAM,
        parseData: (dataView: DataView) => {
            const decoder = new TextDecoder('utf-8'); const str = decoder.decode(dataView); const parts = str.split('|');
            return parts.length >= 3 ? { metrics: { symmetry: parts[1], fatigue: parseInt(parts[2]), activeMuscles: ["Pectoral", "Tríceps"] } } : null;
        }
    });

    const isConnected = realConnectionState === 'connected';
    const [simulatedData, setSimulatedData] = useState({ symmetry: '50/50', fatigue: 0, battery: 85, activeMuscles: [] as string[], fatigueMap: {} as any });

    // PERSISTENCE STATE: Stores the last valid data received from the device
    const [lastKnownData, setLastKnownData] = useState<{ symmetry: string, fatigue: number, battery: number, activeMuscles: string[], fatigueMap: any } | null>(null);

    // Sync status
    useEffect(() => {
        updateDeviceStatus('pod', isConnected);
    }, [isConnected, updateDeviceStatus]);

    // Live Data Simulation (Demo Mode) when not actually connected but "Connect" is clicked
    useEffect(() => {
        if (!isConnected) return;

        const interval = setInterval(() => {
            setSimulatedData(prev => {
                const newFatigue = Math.min(100, Math.max(0, prev.fatigue + (Math.random() > 0.6 ? 2 : -1)));
                const roll = Math.random();
                let muscles: string[] = [];
                let muscleFatigueMap: { [key: string]: number } = {};

                if (deviceType === 'shirt') {
                    if (roll > 0.5) { muscles.push('Pectoral'); muscleFatigueMap['Pectoral'] = newFatigue; }
                    if (roll > 0.7) { muscles.push('Abdominales'); muscleFatigueMap['Abdominales'] = newFatigue - 10; }
                } else {
                    if (roll > 0.5) { muscles.push('Recto Femoral'); muscleFatigueMap['Recto Femoral'] = newFatigue; }
                    if (roll > 0.7) { muscles.push('Gemelos'); muscleFatigueMap['Gemelos'] = newFatigue + 5; }
                }

                const newData = { ...prev, fatigue: newFatigue, activeMuscles: muscles, fatigueMap: muscleFatigueMap, battery: Math.max(0, prev.battery - 0.05) };

                // Sync with Global Context
                updateMuscleData(muscles, muscleFatigueMap);
                updateBiometrics({ fatigue: newFatigue });

                // Update Persistence
                setLastKnownData(newData);

                return newData;
            });
        }, 1500);
        return () => clearInterval(interval);
    }, [isConnected, deviceType, updateMuscleData, updateBiometrics]);

    // LOGIC: Use live data if connected. If not, try local history. If not, try GLOBAL history (Context).
    const hasContextData = Object.keys(contextFatigue).length > 0;

    let displayData = { symmetry: '--/--', fatigue: 0, battery: 0, activeMuscles: [], fatigueMap: {} };

    if (isConnected) {
        displayData = simulatedData;
    } else if (lastKnownData) {
        displayData = lastKnownData;
    } else if (hasContextData) {
        // Recover from Global Context if page refreshed/navigated
        displayData = {
            symmetry: '--/--',
            fatigue: 0,
            battery: 0,
            activeMuscles: contextActiveMuscles,
            fatigueMap: contextFatigue
        };
    }

    // MODE: 'live' if we have ANY data source (Connected, Local History, or Global History)
    const mode = (isConnected || lastKnownData || hasContextData) ? 'live' : 'recovery';

    // --- ACTIONS ---
    const handleCalibration = () => {
        setIsCalibrating(true);
        setCalibrationProgress(0);
        const interval = setInterval(() => {
            setCalibrationProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsCalibrating(false), 500);
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    };



    const handlePartClick = useCallback(async (partName: string) => {
        if (partName) {
            const partData = mockRecoveryData[partName] || { recovery: 100, lastTrained: 'N/A', history: [] };
            const relatedMuscles = muscleSynergies[partName] || [];
            setSelectedItem({ type: 'muscle', name: partName, data: partData, related: relatedMuscles });
            setActiveTab('analysis');

            // If connected, generate AI tip based on LIVE data
            const liveFatigue = displayData.fatigueMap[partName];

            setIsAiLoading(true);
            setAiTip('');
            try {
                let prompt = '';
                const baseContext = isConnected
                    ? `Usuario usando Neural Skin Pod. Fatiga en tiempo real: ${liveFatigue || 0}%. Activación muscular actual: ${displayData.activeMuscles.includes(partName) ? 'Alta' : 'Baja'}.`
                    : `Recuperación: ${partData.recovery}%. Último entreno: ${partData.lastTrained}.`;

                prompt = `Actúa como fisioterapeuta. Musculo: ${partName}. ${baseContext} Dame un consejo breve (max 30 palabras) en ${language === 'es' ? 'Español' : 'Inglés'}.`;

                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                setAiTip(response.text());
            } catch (error) {
                console.error("AI Error", error);
                setAiTip(t('error_ai') || "AI Error");
            } finally {
                setIsAiLoading(false);
            }
        }
    }, [language, t, isConnected, displayData]);

    const handlePartMouseMove = (e: React.MouseEvent, partName: string) => {
        setHoveredPart(partName);
        const recovery = mockRecoveryData[partName]?.recovery;
        const liveFatigue = displayData.fatigueMap[partName];

        let label = `${t('recuperacion')}: ${recovery}%`;
        if (mode === 'live') {
            label = liveFatigue ? `Fatiga: ${liveFatigue}%` : `Fatiga: 0%`;
        }

        if (recovery !== undefined) {
            setTooltip({ visible: true, part: { name: partName, label }, x: e.clientX, y: e.clientY });
        }
    };

    const handlePartMouseLeave = () => {
        setHoveredPart(null);
        setTooltip(t => ({ ...t, visible: false }));
    };

    const handleSaveInjury = (injury: any) => {
        if (selectedItem && selectedItem.type === 'muscle') {
            const newInjury = {
                ...injury,
                muscle: selectedItem.name,
                id: Date.now(),
                timestamp: new Date().toISOString()
            };

            // Save to localStorage
            const existingInjuries = JSON.parse(localStorage.getItem('userInjuries') || '[]');
            const updatedInjuries = [...existingInjuries, newInjury];
            localStorage.setItem('userInjuries', JSON.stringify(updatedInjuries));

            console.log('Injury saved:', newInjury);
            // Close modal via check or UI update if needed
            setIsInjuryModalOpen(false);
        }
    };

    const overallRecovery = useMemo(() => {
        const recoveryValues = Object.values(mockRecoveryData).map(d => d.recovery);
        return Math.round(recoveryValues.reduce((a, b) => a + b, 0) / recoveryValues.length);
    }, []);

    // --- RENDER HELPERS ---
    const RecoveryCircle: React.FC<{ percentage: number }> = ({ percentage }) => {
        const radius = 60;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        const details = getRecoveryDetails(percentage, t);

        // If Live Mode, show Fatigue Color
        const color = mode === 'live' ? (percentage > 50 ? '#ef4444' : '#0ea5e9') : details.hex;

        return (
            <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r={radius} strokeWidth="12" className="stroke-slate-200 dark:stroke-slate-700" fill="transparent" />
                    <motion.circle cx="70" cy="70" r={radius} strokeWidth="12" fill="transparent"
                        stroke={color} strokeLinecap="round" transform="rotate(-90 70 70)"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span key={percentage} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold">{percentage}<span className="text-2xl opacity-50">%</span></motion.span>
                    <span className={`text-sm font-semibold`} style={{ color }}>{mode === 'live' ? t('fatiga') : details.statusText}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col space-y-6 pb-20">
            {/* HEADER & CONTROLS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        {t('analisisCorporalTitle')}
                        {isConnected && <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs rounded-full border border-emerald-500/20 flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> {t('sincronizado')}</span>}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        {isConnected ? t('monitorizacion_tiempo_real') : (lastKnownData ? "Mostrando últimos datos recogidos" : t('seleccionaMusculoDesc'))}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 text-slate-800 dark:text-white">
                    <Button
                        onClick={isConnected ? disconnectReal : connectReal}
                        className={`!py-2 !px-4 text-sm font-bold shadow-lg transition-all ${isConnected ? '!bg-red-500 hover:!bg-red-600 !text-white' : '!bg-indigo-600 hover:!bg-indigo-700 !text-white'}`}
                        icon={isConnected ? FiCommand : FiBluetooth}
                    >
                        {isConnected ? t('desconectar') : t('conectar_pod')}
                    </Button>
                    {isConnected && (
                        <>
                            <Button onClick={handleCalibration} variant="secondary" className="!py-2 !px-4 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800" icon={FiRefreshCw}>{t('calibrar')}</Button>
                            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                <span className={displayData.battery < 20 ? 'text-red-500' : 'text-green-500'}><FiBattery /></span>
                                <span className="font-mono text-sm text-slate-700 dark:text-slate-200">{Math.round(displayData.battery)}%</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* TOP NAVIGATION TOGGLE */}
            <div className="flex justify-center">
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl inline-flex shadow-inner">
                    <button
                        onClick={() => setViewMode('body')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'body' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <GiMuscleUp /> {t('analisisCorporalTitle') || 'Anatomía'}
                    </button>
                    <button
                        onClick={() => setViewMode('biometrics')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'biometrics' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <FiHeart /> {t('monitorBiometrico')}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            {viewMode === 'biometrics' ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
                    <Card className="!p-4 md:!p-8">
                        <BiometricsPanel />
                    </Card>
                </motion.div>
            ) : (
                <div className="flex-grow">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* VISUALIZER */}
                        <div className="lg:col-span-2 rounded-3xl shadow-2xl bg-slate-100 dark:bg-[#0f172a] p-1 flex flex-col items-center justify-between overflow-hidden relative border border-slate-200 dark:border-slate-800">
                            {/* Calibration Overlay */}
                            <AnimatePresence>
                                {isCalibrating && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-3xl">
                                        <div className="text-5xl text-cyan-400 animate-spin mb-4"><FiRefreshCw /></div>
                                        <h3 className="text-2xl font-bold text-white mb-2">{t('calibrando')}</h3>
                                        <div className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div className="h-full bg-cyan-400" style={{ width: `${calibrationProgress}%` }} />
                                        </div>
                                        <p className="text-cyan-200 mt-2 font-mono">{calibrationProgress}%</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Background Grid */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(14, 165, 233, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                            <div className="w-full flex justify-center items-center relative flex-grow min-h-[600px]">
                                <motion.div key="svg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex justify-center z-10">
                                    <BodySVG
                                        key={isDarkMode ? 'dark' : 'light'}
                                        isDarkMode={isDarkMode}
                                        selectedItem={selectedItem}
                                        view={view}
                                        mode={mode}
                                        liveData={displayData}
                                        handlePartClick={handlePartClick}

                                        handlePartMouseMove={handlePartMouseMove}
                                        handlePartMouseLeave={handlePartMouseLeave}
                                        hoveredPart={hoveredPart}
                                        showHeatmap={showHeatmap}
                                    />
                                </motion.div>

                                {/* View Controls & Mode Indicator Container */}
                                <div className="absolute top-4 left-0 w-full px-4 flex justify-between items-start z-30 pointer-events-none">
                                    <div className="flex flex-col gap-2 pointer-events-auto">
                                        <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur rounded-xl">
                                            <Button onClick={() => setView('front')} variant={view === 'front' ? 'primary' : 'ghost'} className="!py-1 !px-3 text-xs">{t('frontal')}</Button>
                                            <Button onClick={() => setView('back')} variant={view === 'back' ? 'primary' : 'ghost'} className="!py-1 !px-3 text-xs">{t('trasera')}</Button>
                                        </div>
                                        {isConnected && (
                                            <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur rounded-xl">
                                                <Button onClick={() => setDeviceType('shirt')} variant={deviceType === 'shirt' ? 'primary' : 'ghost'} className="!py-1 !px-3 text-xs"><GiShirt /></Button>
                                                <Button onClick={() => setDeviceType('pants')} variant={deviceType === 'pants' ? 'primary' : 'ghost'} className="!py-1 !px-3 text-xs"><GiLegArmor /></Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pointer-events-auto">
                                        <div className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg border backdrop-blur-md flex items-center gap-2 text-[10px] md:text-xs font-bold shadow-lg ${mode === 'live' ? 'bg-red-500/20 border-red-500/30 text-red-500' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500'}`}>
                                            {mode === 'live' ? <span className="animate-pulse"><FiActivity /></span> : <FiCheckCircle />}
                                            {mode === 'live' ?
                                                (isConnected ? 'LIVE' : 'LAST SYNC')
                                                : (window.innerWidth < 768 ? 'RECOVERY' : 'RECOVERY STATUS')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SIDE PANEL */}
                        <Card className="lg:col-span-1 flex flex-col !p-6 max-h-[600px] overflow-y-auto">
                            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4 sticky top-0 bg-white dark:bg-slate-800 z-10 -mx-6 px-6 pb-4">
                                <button onClick={() => setActiveTab('analysis')} className={`py-3 px-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'analysis' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-primary'}`}>{t('analisis')}</button>
                                <button onClick={() => setActiveTab('layers')} className={`py-3 px-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'layers' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-primary'}`}>{t('capas')}</button>
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === 'analysis' ? (
                                    <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-grow flex flex-col">
                                        {!selectedItem ? (
                                            <div className="flex flex-col items-center justify-center text-center text-slate-500 flex-grow">
                                                <span className="text-5xl mb-4 text-slate-300 dark:text-slate-600"><FiMousePointer /></span>
                                                <h4 className="font-bold text-lg">{t('seleccionaMusculo')}</h4>
                                                <p className="text-sm max-w-[200px]">{t('clicZona')}</p>
                                            </div>
                                        ) : selectedItem.type === 'muscle' ? (
                                            <div className="space-y-6">
                                                <div className="text-center">
                                                    <h3 className="text-2xl font-bold capitalize mb-1">{t(normalizeKey(selectedItem.name))}</h3>
                                                    <p className="text-xs text-slate-400 uppercase tracking-widest">{mode === 'live' ? t('tiempo_real') : t('estado_recuperacion')}</p>
                                                </div>

                                                <div className="flex items-center justify-center py-4">
                                                    <RecoveryCircle percentage={mode === 'live' ? (displayData.fatigueMap[selectedItem.name] || 0) : selectedItem.data.recovery} />
                                                </div>

                                                {/* Extra Metrics - EXPANDED */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    {mode === 'live' ? (
                                                        <>
                                                            <MetricCard
                                                                label="Activación"
                                                                value={displayData.activeMuscles.includes(selectedItem.name) ? 'ALTA' : 'BAJA'}
                                                                icon={FiActivity}
                                                                variant={displayData.activeMuscles.includes(selectedItem.name) ? 'info' : 'default'}
                                                            />
                                                            <MetricCard
                                                                label="Riesgo Lesión"
                                                                value={(displayData.fatigueMap[selectedItem.name] || 0) > 80 ? 'Alto' : 'Bajo'}
                                                                icon={FiAlertTriangle}
                                                                variant={(displayData.fatigueMap[selectedItem.name] || 0) > 80 ? 'warning' : 'success'}
                                                            />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MetricCard
                                                                label="Vol. Semanal"
                                                                value={`${selectedItem.data.volumeThisWeek} series`}
                                                                icon={FiActivity}
                                                            />
                                                            <MetricCard
                                                                label="1RM"
                                                                value={selectedItem.data.maxStrength}
                                                                icon={GiMuscleUp}
                                                                variant={selectedItem.data.maxStrength !== 'N/A' ? 'info' : 'default'}
                                                            />
                                                            <MetricCard
                                                                label="Próximo Entreno"
                                                                value={selectedItem.data.nextRecommended}
                                                                icon={FiCalendar}
                                                                variant={selectedItem.data.nextRecommended.includes('Listo') ? 'success' : 'warning'}
                                                            />
                                                            {selectedItem.data.injuries.filter((i: any) => i.status === 'activa').length > 0 && (
                                                                <MetricCard
                                                                    label="Lesiones Activas"
                                                                    value={selectedItem.data.injuries.filter((i: any) => i.status === 'activa').length}
                                                                    icon={FiAlertTriangle}
                                                                    variant="warning"
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                {/* Last trained info moved below metrics */}
                                                {mode !== 'live' && (
                                                    <div className="text-center text-xs text-slate-500 dark:text-slate-400 p-2 bg-slate-100/50 dark:bg-slate-700/20 rounded-lg">
                                                        Último entreno: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedItem.data.lastTrained}</span>
                                                    </div>
                                                )}


                                                {/* AI TIP */}
                                                {isAiLoading ? (
                                                    <div className="flex items-center gap-3 text-sm p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 animate-pulse">
                                                        <span className="text-primary"><FiCpu /></span> {t('analizando')}...
                                                    </div>
                                                ) : (
                                                    aiTip && (
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                                                            <h4 className="font-bold text-indigo-500 mb-2 flex items-center gap-2 text-sm"><GiBrain /> {t('consejoCoach')}</h4>
                                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{aiTip}</p>
                                                        </motion.div>
                                                    )
                                                )}

                                                {/* REGISTER INJURY BUTTON - Only in Recovery Mode */}
                                                {mode !== 'live' && (
                                                    <Button
                                                        onClick={() => setIsInjuryModalOpen(true)}
                                                        variant="secondary"
                                                        icon={FiAlertTriangle}
                                                        className="w-full !text-amber-600 dark:!text-amber-400 !border-amber-500/30 hover:!bg-amber-500/10"
                                                    >
                                                        Registrar Lesión
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            /* BONE DATA DISPLAY */
                                            <div className="space-y-6">
                                                <div className="text-center">
                                                    <h3 className="text-2xl font-bold mb-1">{selectedItem.data.displayName}</h3>
                                                    <p className="text-xs text-slate-400 uppercase tracking-widest">ESTRUCTURA ÓSEA</p>
                                                </div>

                                                {selectedItem.data.lastInjury ? (
                                                    <div className="space-y-4">
                                                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                                            <h4 className="font-bold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                                                                <FiAlertTriangle /> Última Lesión
                                                            </h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-600 dark:text-slate-400">Tipo:</span>
                                                                    <span className="font-semibold capitalize">{selectedItem.data.lastInjury.type}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-600 dark:text-slate-400">Fecha:</span>
                                                                    <span className="font-semibold">{selectedItem.data.lastInjury.date}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-600 dark:text-slate-400">Severidad:</span>
                                                                    <span className={`font-semibold capitalize ${selectedItem.data.lastInjury.severity === 'severe' ? 'text-red-500' :
                                                                        selectedItem.data.lastInjury.severity === 'moderate' ? 'text-orange-500' :
                                                                            'text-yellow-500'
                                                                        }`}>{selectedItem.data.lastInjury.severity}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-600 dark:text-slate-400">Recuperación:</span>
                                                                    <span className="font-semibold">{selectedItem.data.lastInjury.recoveryDays} días</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-600 dark:text-slate-400">Estado:</span>
                                                                    <span className={`font-semibold ${selectedItem.data.lastInjury.healed ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                        {selectedItem.data.lastInjury.healed ? 'Sanado' : 'En recuperación'}
                                                                    </span>
                                                                </div>
                                                                {selectedItem.data.lastInjury.description && (
                                                                    <p className="text-slate-600 dark:text-slate-400 pt-2 border-t border-amber-500/20">
                                                                        {selectedItem.data.lastInjury.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {selectedItem.data.history.length > 1 && (
                                                            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800">
                                                                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Historial de Lesiones</h4>
                                                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                                                    Total de lesiones registradas: <span className="font-semibold">{selectedItem.data.history.length}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                                                        <span className="inline-block text-2xl text-emerald-500 mb-2"><FiCheckCircle /></span>
                                                        <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
                                                            Sin lesiones registradas
                                                        </p>
                                                    </div>
                                                )}

                                                {/* RECOMMENDATIONS */}
                                                {selectedItem.data.recommendations.length > 0 && (
                                                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                                                        <h4 className="font-bold text-indigo-500 mb-3 flex items-center gap-2 text-sm">
                                                            <GiBrain /> Recomendaciones
                                                        </h4>
                                                        <ul className="space-y-2">
                                                            {selectedItem.data.recommendations.map((rec, idx) => (
                                                                <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                                                    <span className="text-indigo-500 mt-1">•</span>
                                                                    <span>{rec}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div key="layers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                        <h3 className="text-xl font-bold mb-2">{t('capasAnatomicas')}</h3>
                                        <div className="space-y-3">
                                            {/* Muscle System Layer */}
                                            <div
                                                className="p-4 rounded-xl border-2 border-primary bg-primary/10"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-red-100 dark:bg-red-900/50">
                                                            <span className="text-red-500"><GiMuscleUp /></span>
                                                        </div>
                                                        <span className="font-bold">{t('sistemaMuscular')}</span>
                                                    </div>
                                                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-primary bg-primary">
                                                        <div className="w-2 h-2 bg-white rounded-full" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Heatmap Layer - NEW */}
                                            <div
                                                onClick={() => setShowHeatmap(!showHeatmap)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${showHeatmap ? 'border-orange-500 bg-orange-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-orange-500/50'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${showHeatmap ? 'bg-orange-100 dark:bg-orange-900/50' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                                            <span className={showHeatmap ? 'text-orange-500' : 'text-slate-400'}><FiActivity /></span>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold block">{t('mapaCalor') || 'Mapa de Calor'}</span>
                                                            <span className="text-xs text-slate-500">{t('fatigaMuscular') || 'Fatiga Muscular'}</span>
                                                        </div>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${showHeatmap ? 'border-orange-500 bg-orange-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                                        {showHeatmap && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Heatmap Legend */}
                                            {showHeatmap && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 space-y-3"
                                                >
                                                    <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('leyenda') || 'Leyenda'}</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {[
                                                            { color: '#10b981', label: '0-20%' },
                                                            { color: '#22c55e', label: '20-40%' },
                                                            { color: '#eab308', label: '40-60%' },
                                                            { color: '#f97316', label: '60-80%' },
                                                            { color: '#ef4444', label: '80-100%' }
                                                        ].map(({ color, label }) => (
                                                            <div key={label} className="flex items-center gap-1.5 text-xs">
                                                                <div
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
                                                                />
                                                                <span className="text-slate-600 dark:text-slate-400">{label}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </div>
                </div>
            )}

            {/* INJURY MODAL */}
            <InjuryModal
                isOpen={isInjuryModalOpen}
                onClose={() => setIsInjuryModalOpen(false)}
                muscleName={selectedItem?.type === 'muscle' ? selectedItem.name : ''}
                onSave={handleSaveInjury}
            />
        </div>
    );
});

export default Cuerpo;
