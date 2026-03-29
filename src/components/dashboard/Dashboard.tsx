import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiActivity, FiZap, FiCheckCircle, FiWatch, FiCpu, FiUser } from 'react-icons/fi';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import { useSensorStore } from '../../store/useSensorStore';
import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';
import { Card } from '../ui/Shared';
import { useWorkouts, useWeightLogs, useBiometricLogs } from '../../hooks/useData';
import { useNutritionLogs } from '../../hooks/useNutritionLogs';
import { useNutriStreamDevices } from '../../hooks/useNutriStreamDevices';
import { FiBluetooth } from 'react-icons/fi';

import HydrationTracker from './HydrationTracker';
import SleepAnalysis from './SleepAnalysis';
import DailyFocusModal from './DailyFocusModal';
import QuickLogWidget from './QuickLogWidget';
import ReadinessScoreCard from './ReadinessScoreCard';
import InjuryShieldCard from './InjuryShieldCard';
import ChallengeCard from './ChallengeCard';
import ContextBanner from './ContextBanner';
import LiveSessionHUD from './LiveSessionHUD';
import SEO from '../common/SEO';

const Dashboard: React.FC = () => {
    const { t } = useLanguage();
    const { userData } = useUser();
    const wellnessScore = useSensorStore(state => state.wellnessScore);
    const steps = useSensorStore(state => state.steps);
    const sensorDevices = useSensorStore(state => state.devices);
    const heartRate = useSensorStore(state => state.heartRate);
    const navigate = useNavigate();

    // Data Hooks
    const { addWorkout } = useWorkouts();
    const { addWeight, latestWeight } = useWeightLogs();
    const { addBiometric } = useBiometricLogs();
    const { todaySummary } = useNutritionLogs();
    const { connections, connectedCount, scanAndConnect } = useNutriStreamDevices();

    const [isDailyFocusOpen, setIsDailyFocusOpen] = useState(false);

    // Dynamic Device Status mapped from Bluetooth Hook
    const devices = useMemo(() => [
        { id: 'NEURAL_SKIN' as const, name: 'Neural Skin POD', active: connections.neuralSkin === 'CONNECTED', battery: connections.neuralSkin === 'CONNECTED' ? 100 : 0, icon: FiCpu },
        { id: 'RACKET_SENSOR' as const, name: 'Racket Sensor X1', active: connections.racketSensor === 'CONNECTED', battery: connections.racketSensor === 'CONNECTED' ? 100 : 0, icon: FiActivity },
        { id: 'AERO_VISION' as const, name: 'AeroVision Glasses', active: connections.aeroVision === 'CONNECTED', battery: connections.aeroVision === 'CONNECTED' ? 100 : 0, icon: FiWatch },
    ], [connections]);

    // Animation Variants
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

    const handleStartSession = () => {
        navigate('/rendimiento');
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-20">
            <DailyFocusModal
                isOpen={isDailyFocusOpen}
                onClose={() => setIsDailyFocusOpen(false)}
                userData={{ ...userData, wellnessScore }}
                onStartSession={handleStartSession}
            />

            {/* Context-Aware Banner */}
            <ContextBanner />

            {/* Live Session HUD - Only show when sensor devices connected */}
            {(sensorDevices.pod || sensorDevices.mask || sensorDevices.insoles) ? (
                <motion.div
                    variants={itemVariants}
                    className="cursor-pointer"
                    onClick={() => navigate('/live-session')}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <LiveSessionHUD compact />
                </motion.div>
            ) : (
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-2xl"
                >
                    {/* Gradient border effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 via-cyan-500/20 to-purple-500/30 rounded-2xl animate-pulse" />

                    <div className="relative m-[1px] rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl p-5">
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                                        <FiBluetooth className="text-white" size={18} />
                                    </div>
                                    <motion.div
                                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-900"
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">{t('conectarDispositivos') || 'Mis Dispositivos'}</h3>
                                    <p className="text-xs text-slate-400">{connectedCount}/{devices.length} {t('conectados') || 'conectados'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/dispositivos')}
                                className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-xs font-bold text-indigo-400 transition-colors"
                            >
                                {t('configurar') || 'Configurar'}
                            </button>
                        </div>

                        {/* Device Cards Grid */}
                        <div className="grid grid-cols-3 gap-2">
                            {devices.map((device, idx) => (
                                <motion.div
                                    key={idx}
                                    className={`relative p-3 rounded-xl border transition-all cursor-pointer group ${device.active
                                        ? 'bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/30 hover:border-emerald-500/50'
                                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                                        }`}
                                    onClick={() => !device.active ? scanAndConnect(device.id) : navigate('/dispositivos')}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {/* Connection Status Indicator */}
                                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${device.active ? 'bg-emerald-400' : 'bg-slate-600'
                                        }`}>
                                        {device.active && (
                                            <motion.div
                                                className="absolute inset-0 rounded-full bg-emerald-400"
                                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                            />
                                        )}
                                    </div>

                                    {/* Icon */}
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${device.active
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-slate-700/50 text-slate-500'
                                        }`}>
                                        <device.icon size={16} />
                                    </div>

                                    {/* Device Name */}
                                    <p className={`text-xs font-medium truncate ${device.active ? 'text-white' : 'text-slate-500'
                                        }`}>
                                        {device.name.split(' ')[0]}
                                    </p>

                                    {/* Battery or Status */}
                                    {device.active ? (
                                        <div className="flex items-center gap-1 mt-1">
                                            <div className="flex-1 h-1 rounded-full bg-slate-700 overflow-hidden">
                                                <motion.div
                                                    className={`h-full rounded-full ${device.battery > 50 ? 'bg-emerald-400' :
                                                        device.battery > 20 ? 'bg-amber-400' : 'bg-red-400'
                                                        }`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${device.battery}%` }}
                                                    transition={{ delay: 0.2 * idx, duration: 0.8 }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-slate-400">{device.battery}%</span>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-slate-600 mt-1">{t('desconectado') || 'Offline'}</p>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Date - Simplified */}
            <div className="flex items-center justify-between">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>


            {/* Daily Readiness & Focus - HERO SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Readiness Score Card (Refactored) */}
                <div className="h-full">
                    <ReadinessScoreCard />
                </div>

                {/* Today's Focus Card */}
                <Card className="!p-0 lg:col-span-2 relative overflow-hidden flex flex-col justify-between">
                    {/* Background Image / Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 z-0"></div>
                    <div className="absolute inset-0 opacity-20 z-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'overlay' }}></div>

                    <div className="relative z-10 p-8 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-white/20 p-1.5 rounded-lg backdrop-blur-md"><FiZap size={20} className="text-white" /></span>
                                    <h3 className="font-bold uppercase tracking-wider text-indigo-100 text-sm">{t('focoDelDia')}</h3>
                                </div>
                                <h2 className="text-3xl font-black mb-2 text-white leading-tight">
                                    {wellnessScore > 80 ? 'Entrenamiento de Fuerza' : 'Recuperación Activa'}
                                </h2>
                                <div className="flex items-center gap-3 text-indigo-200 text-sm">
                                    <span className="flex items-center gap-1"><FiActivity /> Intensidad Alta</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><FiWatch /> 60 min</span>
                                </div>
                            </div>
                            {/* Weather/Context Icon */}
                            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 hidden sm:block">
                                <div className="text-center">
                                    <span className="block text-2xl mb-1">🌤️</span>
                                    <span className="text-xs font-bold text-white uppercase">Perfecto</span>
                                </div>
                            </div>
                        </div>

                        {/* Workout Preview List */}
                        <div className="mt-8 space-y-3 bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                            <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">Rutina Sugerida</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-white">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">1</div>
                                    <span className="font-medium">Calentamiento Dinámico (10')</span>
                                </div>
                                <div className="flex items-center gap-3 text-white">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">2</div>
                                    <span className="font-medium">Sentadilla & Press Banca (4x5)</span>
                                </div>
                                <div className="flex items-center gap-3 text-white">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">3</div>
                                    <span className="font-medium text-white/50">Hipertrofia Accesorios...</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button onClick={handleStartSession} className="flex-1 px-6 py-4 bg-white text-indigo-900 rounded-xl font-black hover:bg-indigo-50 transition-colors shadow-lg shadow-black/20 flex items-center justify-center gap-2 group">
                                {t('iniciarSesion')}
                                <FiActivity className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={() => setIsDailyFocusOpen(true)} className="px-6 py-4 bg-indigo-600/50 hover:bg-indigo-600/70 text-white border border-indigo-400/30 rounded-xl font-bold transition-colors backdrop-blur-md">
                                {t('verDetalles')}
                            </button>
                        </div>
                    </div>
                </Card>
            </div>




            {/* Injury Shield Card - Phase C */}
            <div className="w-full">
                <InjuryShieldCard />
            </div>

            {/* Challenges Card - Phase D */}
            <div className="w-full">
                <ChallengeCard />
            </div>

            {/* Quick Log Widget */}
            <div className="w-full">
                <QuickLogWidget
                    onSaveWorkout={async (data) => { await addWorkout(data); }}
                    onSaveWeight={async (data) => { await addWeight(data); }}
                    onSaveBiometric={async (data) => { await addBiometric(data); }}
                    previousWeight={latestWeight}
                />
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center gap-2">
                    <span className="text-slate-400"><FiActivity size={24} /></span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{steps.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 uppercase">{t('pasos')}</span>
                </div>
                {/* Updated Calorie Card showing Consumption vs Burn - For simplicity, let's show Consumption here as user asked for Chef AI data integration */}
                <div onClick={() => navigate('/chef-ai')} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <span className="text-orange-500"><FiZap size={24} /></span>
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">{todaySummary.totalCalories}</span>
                    </div>
                    <span className="text-xs text-slate-500 uppercase">Kcal (Ingesta)</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center gap-2">
                    <span className="text-slate-400"><FiWatch size={24} /></span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">7h 12m</span>
                    <span className="text-xs text-slate-500 uppercase">{t('sueno')}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center gap-2">
                    <span className="text-slate-400"><FiUser size={24} /></span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{latestWeight ? `${latestWeight} kg` : '--'}</span>
                    <span className="text-xs text-slate-500 uppercase">{t('peso')}</span>
                </div>
            </div>

            {/* Detailed Trackers - Hydration & Sleep (Keep these here for quick access) */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 h-full">
                    <HydrationTracker />
                </div>
                <div className="lg:col-span-2 h-full">
                    <SleepAnalysis />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
