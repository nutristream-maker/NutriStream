import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiBattery, FiBluetooth, FiPlay, FiPause, FiStopCircle, FiZap, FiHeart, FiWind, FiTarget, FiClock, FiTrendingUp } from 'react-icons/fi';
import { GiMuscleUp, GiBrain, GiLungs, GiTennisBall } from 'react-icons/gi';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import { Card, Button } from '../ui/Shared';
import { useSensorStore } from '../../store/useSensorStore';
import { useLanguage } from '../../context/LanguageContext';
import LiveSessionHUD from '../dashboard/LiveSessionHUD';
import SEO from '../common/SEO';

interface DeviceStatusProps {
    name: string;
    icon: React.ElementType;
    isConnected: boolean;
    battery?: number;
    color: string;
    metrics?: { label: string; value: string | number; unit?: string }[];
}

const colorVariants: Record<string, { bg: string, border: string, iconBg: string, text: string }> = {
    indigo: {
        bg: 'bg-gradient-to-br from-indigo-500/10 to-indigo-600/5',
        border: 'border-indigo-500/50 dark:border-indigo-400/50',
        iconBg: 'bg-indigo-500',
        text: 'text-indigo-500'
    },
    amber: {
        bg: 'bg-gradient-to-br from-amber-500/10 to-amber-600/5',
        border: 'border-amber-500/50 dark:border-amber-400/50',
        iconBg: 'bg-amber-500',
        text: 'text-amber-500'
    },
    cyan: {
        bg: 'bg-gradient-to-br from-cyan-500/10 to-cyan-600/5',
        border: 'border-cyan-500/50 dark:border-cyan-400/50',
        iconBg: 'bg-cyan-500',
        text: 'text-cyan-500'
    },
    rose: {
        bg: 'bg-gradient-to-br from-rose-500/10 to-rose-600/5',
        border: 'border-rose-500/50 dark:border-rose-400/50',
        iconBg: 'bg-rose-500',
        text: 'text-rose-500'
    }
};

const DeviceCard: React.FC<DeviceStatusProps> = ({ name, icon: Icon, isConnected, battery, color, metrics }) => {
    const variants = colorVariants[color] || colorVariants['indigo'];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl border-2 transition-all ${isConnected
                ? `${variants.bg} ${variants.border}`
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50'
                }`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isConnected ? `${variants.iconBg} text-white` : 'bg-slate-300 dark:bg-slate-600 text-slate-500'}`}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-sm">{name}</p>
                        <p className={`text-xs ${isConnected ? 'text-green-500' : 'text-slate-400'}`}>
                            {isConnected ? 'Conectado' : 'Desconectado'}
                        </p>
                    </div>
                </div>
                {isConnected && battery !== undefined && (
                    <div className="flex items-center gap-1 text-xs">
                        <FiBattery className={battery > 20 ? 'text-green-500' : 'text-red-500'} />
                        <span>{battery}%</span>
                    </div>
                )}
            </div>
            {isConnected && metrics && metrics.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    {metrics.map((metric, idx) => (
                        <div key={idx} className="text-center">
                            <p className="text-lg font-bold">{metric.value}<span className="text-xs font-normal ml-0.5">{metric.unit}</span></p>
                            <p className="text-xs text-slate-500">{metric.label}</p>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

const LiveSessionView: React.FC = () => {
    const { t } = useLanguage();
    const {
        heartRate,
        calories,
        steps,
        wellnessScore,
        fatigue: muscleFatigue,
        devices: deviceStatus,
        activeMuscles
    } = useSensorStore();

    // Session state
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);
    const [sessionType, setSessionType] = useState<'strength' | 'cardio' | 'tennis' | 'breathing'>('strength');

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSessionActive && !isPaused) {
            interval = setInterval(() => {
                setSessionTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isSessionActive, isPaused]);

    // Format time
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate average fatigue
    const avgFatigue = useMemo(() => {
        const values = Object.values(muscleFatigue) as number[];
        if (values.length === 0) return 0;
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    }, [muscleFatigue]);

    // Session controls
    const startSession = () => {
        setIsSessionActive(true);
        setIsPaused(false);
        setSessionTime(0);
    };

    const pauseSession = () => setIsPaused(!isPaused);
    const stopSession = () => {
        setIsSessionActive(false);
        setIsPaused(false);
        // TODO: Save session data
    };

    // Device configurations
    const devices: DeviceStatusProps[] = [
        {
            name: 'NS Pod',
            icon: GiMuscleUp,
            isConnected: deviceStatus.pod,
            battery: 85,
            color: 'indigo',
            metrics: [
                { label: 'Fatiga', value: avgFatigue, unit: '%' },
                { label: 'Músculos', value: activeMuscles.length }
            ]
        },
        {
            name: 'Sensor Raqueta',
            icon: GiTennisBall,
            isConnected: deviceStatus.racket,
            battery: 72,
            color: 'amber',
            metrics: [
                { label: 'Golpes', value: 127 },
                { label: 'Velocidad', value: 142, unit: 'km/h' }
            ]
        },
        {
            name: 'AeroLung',
            icon: GiLungs,
            isConnected: deviceStatus.aerolung,
            battery: 90,
            color: 'cyan',
            metrics: [
                { label: 'VO2', value: 48, unit: 'ml/kg' },
                { label: 'Resp/min', value: 22 }
            ]
        },
        {
            name: 'BioHarness',
            icon: FiHeart,
            isConnected: deviceStatus.watch,
            battery: 65,
            color: 'rose',
            metrics: [
                { label: 'FC', value: heartRate, unit: 'bpm' },
                { label: 'HRV', value: 45, unit: 'ms' }
            ]
        }
    ];

    const sessionTypes = [
        { id: 'strength', label: 'Fuerza', icon: GiMuscleUp, color: 'from-indigo-500 to-purple-600' },
        { id: 'cardio', label: 'Cardio', icon: FiHeart, color: 'from-rose-500 to-red-600' },
        { id: 'tennis', label: 'Tenis', icon: GiTennisBall, color: 'from-amber-500 to-orange-600' },
        { id: 'breathing', label: 'Respiración', icon: FiWind, color: 'from-cyan-500 to-blue-600' }
    ];

    return (
        <>
            <SEO title="Sesión en Vivo" description="Monitorización unificada de todos tus sensores durante el entrenamiento." />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                            Sesión en Vivo
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Monitorización unificada de todos tus dispositivos
                        </p>
                    </div>

                    {/* Session Timer */}
                    {isSessionActive && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl shadow-xl"
                        >
                            <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} />
                            <span className="font-mono text-2xl font-bold">{formatTime(sessionTime)}</span>
                            <div className="flex gap-2">
                                <button onClick={pauseSession} className="p-2 hover:bg-white/10 dark:hover:bg-black/10 rounded-full">
                                    {isPaused ? <FiPlay /> : <FiPause />}
                                </button>
                                <button onClick={stopSession} className="p-2 hover:bg-white/10 dark:hover:bg-black/10 rounded-full text-red-400">
                                    <FiStopCircle />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Session Type Selector */}
                {!isSessionActive && (
                    <Card className="!p-6">
                        <h3 className="font-bold mb-4">Tipo de Sesión</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            {sessionTypes.map((type) => (
                                <motion.button
                                    key={type.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSessionType(type.id as any)}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${sessionType === type.id
                                        ? `bg-gradient-to-br ${type.color} text-white border-transparent shadow-lg`
                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    <type.icon size={24} />
                                    <span className="font-semibold text-sm">{type.label}</span>
                                </motion.button>
                            ))}
                        </div>
                        <Button onClick={startSession} className="w-full" icon={FiPlay}>
                            Iniciar Sesión
                        </Button>
                    </Card>
                )}

                {/* NutriStream Biometric HUD - Full View */}
                {isSessionActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <LiveSessionHUD />
                    </motion.div>
                )}

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Real-time Metrics */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="!p-4 bg-gradient-to-br from-rose-500 to-red-600 text-white border-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <FiHeart />
                                    <span className="text-xs font-medium opacity-80">FC</span>
                                </div>
                                <p className="text-3xl font-bold">{heartRate}</p>
                                <p className="text-xs opacity-80">bpm</p>
                            </Card>
                            <Card className="!p-4 bg-gradient-to-br from-orange-500 to-amber-600 text-white border-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <FiZap />
                                    <span className="text-xs font-medium opacity-80">Calorías</span>
                                </div>
                                <p className="text-3xl font-bold">{calories}</p>
                                <p className="text-xs opacity-80">kcal</p>
                            </Card>
                            <Card className="!p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <GiMuscleUp />
                                    <span className="text-xs font-medium opacity-80">Fatiga</span>
                                </div>
                                <p className="text-3xl font-bold">{avgFatigue}</p>
                                <p className="text-xs opacity-80">%</p>
                            </Card>
                            <Card className="!p-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <FiTrendingUp />
                                    <span className="text-xs font-medium opacity-80">Intensidad</span>
                                </div>
                                <p className="text-3xl font-bold">{wellnessScore}</p>
                                <p className="text-xs opacity-80">%</p>
                            </Card>
                        </div>

                        {/* Heart Rate Zones */}
                        <Card className="!p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <FiHeart className="text-rose-500" /> Zona de Frecuencia Cardíaca
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { zone: 'Z1 - Recuperación', range: '90-108', color: 'bg-slate-400', active: heartRate < 108 },
                                    { zone: 'Z2 - Quema Grasa', range: '108-126', color: 'bg-green-500', active: heartRate >= 108 && heartRate < 126 },
                                    { zone: 'Z3 - Aeróbico', range: '126-144', color: 'bg-blue-500', active: heartRate >= 126 && heartRate < 144 },
                                    { zone: 'Z4 - Umbral', range: '144-162', color: 'bg-amber-500', active: heartRate >= 144 && heartRate < 162 },
                                    { zone: 'Z5 - Máximo', range: '162-180', color: 'bg-red-500', active: heartRate >= 162 },
                                ].map((zone, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${zone.color} ${zone.active ? 'ring-4 ring-offset-2 ring-opacity-50 ring-current' : 'opacity-40'}`} />
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm">
                                                <span className={zone.active ? 'font-bold' : 'opacity-60'}>{zone.zone}</span>
                                                <span className="text-slate-500">{zone.range} bpm</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Active Muscles */}
                        {deviceStatus.pod && activeMuscles.length > 0 && (
                            <Card className="!p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <GiMuscleUp className="text-indigo-500" /> Músculos Activos
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {activeMuscles.map((muscle, idx) => (
                                        <motion.span
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium"
                                        >
                                            {muscle}
                                        </motion.span>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Right: Device Status */}
                    <div className="space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <FiBluetooth className="text-blue-500" /> Dispositivos
                        </h3>
                        {devices.map((device, idx) => (
                            <DeviceCard key={idx} {...device} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default LiveSessionView;
