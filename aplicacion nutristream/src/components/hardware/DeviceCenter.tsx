import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useSensorStore } from '../../store/useSensorStore';
import { FiCpu, FiBluetooth, FiWifi, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import { GiTennisRacket, GiMuscleUp, GiRunningShoe, GiGasMask } from 'react-icons/gi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { Card } from '../ui/Shared';

// Lazy load device components
const NeuralSkinPod = lazy(() => import('./NeuralSkinPod'));
const RacketSensor = lazy(() => import('./RacketSensor'));
const AeroLungMask = lazy(() => import('./AeroLungMask'));
const AeroVisionGlasses = lazy(() => import('./AeroVisionGlasses'));
const GroundTruthInsoles = lazy(() => import('./GroundTruthInsoles'));

type DeviceId = 'neural-pod' | 'racket' | 'aerolung' | 'aerovision' | 'insoles' | null;

interface DeviceInfo {
    id: DeviceId;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    gradient: string;
    component: React.LazyExoticComponent<React.ComponentType<any>>;
    contextKey: 'pod' | 'racket' | 'mask' | 'glasses' | 'insoles';
}

const DeviceCenter: React.FC = () => {
    const { t } = useLanguage();
    const { devices: sensorDevices } = useSensorStore();
    const [activeDevice, setActiveDevice] = useState<DeviceId>(null);

    const devices: DeviceInfo[] = [
        {
            id: 'neural-pod',
            name: 'Neural Skin POD',
            description: t('neuralPodDesc') || 'Array EMG para seguimiento de activación muscular',
            icon: <GiMuscleUp size={28} />,
            color: 'indigo',
            gradient: 'from-indigo-500 to-purple-600',
            component: NeuralSkinPod,
            contextKey: 'pod'
        },
        {
            id: 'racket',
            name: 'Sensor Raqueta',
            description: t('racketSensorDesc') || 'Análisis de swing para Tenis/Padel',
            icon: <GiTennisRacket size={28} />,
            color: 'emerald',
            gradient: 'from-emerald-500 to-teal-600',
            component: RacketSensor,
            contextKey: 'racket'
        },
        {
            id: 'aerolung',
            name: 'Máscara AeroLung',
            description: t('aerolungDesc') || 'Entrenamiento respiratorio y análisis de VO2',
            icon: <GiGasMask size={28} />,
            color: 'cyan',
            gradient: 'from-cyan-500 to-blue-600',
            component: AeroLungMask,
            contextKey: 'mask'
        },
        {
            id: 'aerovision',
            name: 'Gafas AeroVision',
            description: t('aerovisionDesc') || 'Seguimiento ocular y tiempo de reacción',
            icon: <HiOutlineSparkles size={28} />,
            color: 'amber',
            gradient: 'from-amber-500 to-orange-600',
            component: AeroVisionGlasses,
            contextKey: 'glasses'
        },
        {
            id: 'insoles',
            name: 'Plantillas GroundTruth',
            description: t('insolesDesc') || 'Mapeo de presión y análisis de marcha',
            icon: <GiRunningShoe size={28} />,
            color: 'rose',
            gradient: 'from-rose-500 to-pink-600',
            component: GroundTruthInsoles,
            contextKey: 'insoles'
        }
    ];

    const connectedCount = Object.values(sensorDevices).filter(Boolean).length;
    const selectedDevice = devices.find(d => d.id === activeDevice);

    const DeviceCard: React.FC<{ device: DeviceInfo }> = ({ device }) => {
        const isConnected = sensorDevices[device.contextKey];

        return (
            <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveDevice(device.id)}
                className="cursor-pointer"
            >
                <Card className="!p-0 overflow-hidden group relative border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                    {/* Gradient top bar */}
                    <div className={`h-2 bg-gradient-to-r ${device.gradient}`} />

                    <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${device.gradient} flex items-center justify-center text-white shadow-lg`}>
                                {device.icon}
                            </div>

                            {/* Connection status */}
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isConnected
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}>
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                {isConnected ? t('conectado') || 'Conectado' : t('desconectado') || 'Desconectado'}
                            </div>
                        </div>

                        {/* Device info */}
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{device.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{device.description}</p>

                        {/* Open button */}
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
                                {t('verDetalles') || 'Ver Detalles'}
                            </span>
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${device.gradient} flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity`}>
                                <FiChevronRight size={18} />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        );
    };

    return (
        <div className="space-y-6 pb-20">
            {/* HEADER */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                                    <FiCpu size={24} className="text-indigo-400" />
                                </span>
                                <span className="text-xs font-bold tracking-widest uppercase text-indigo-400">
                                    {t('hardwareHub') || 'Hardware Hub'}
                                </span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight mb-2">
                                {t('centroDispositivos') || 'Centro de Dispositivos'}
                            </h1>
                            <p className="text-slate-400 max-w-lg">
                                {t('centroDispositivosDesc') || 'Gestiona y monitoriza todo tu hardware NutriStream conectado desde un solo lugar.'}
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center min-w-[100px]">
                                <div className="text-3xl font-black text-white">{devices.length}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">{t('dispositivos') || 'Disp.'}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md text-center min-w-[100px]">
                                <div className="text-3xl font-black text-emerald-400">{connectedCount}</div>
                                <div className="text-xs text-emerald-400/80 uppercase tracking-wider">{t('conectados') || 'Activos'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <AnimatePresence mode="wait">
                {activeDevice && selectedDevice ? (
                    <motion.div
                        key="device-detail"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Back button */}
                        <motion.button
                            onClick={() => setActiveDevice(null)}
                            className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                            whileHover={{ x: -4 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiArrowLeft size={18} />
                            <span>{t('volverADispositivos') || 'Volver al Centro'}</span>
                        </motion.button>

                        {/* Device component */}
                        <Suspense fallback={
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
                            </div>
                        }>
                            <selectedDevice.component />
                        </Suspense>
                    </motion.div>
                ) : (
                    <motion.div
                        key="device-grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Section title */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow" />
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <FiBluetooth className="text-indigo-500" />
                                {t('seleccionaDispositivo') || 'Selecciona un Dispositivo'}
                            </span>
                            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow" />
                        </div>

                        {/* Device grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {devices.map((device, index) => (
                                <motion.div
                                    key={device.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <DeviceCard device={device} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Quick connect tip */}
                        <div className="mt-8 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <FiWifi className="text-indigo-500 text-xl" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white">
                                    {t('consejoConexion') || 'Consejo de Conexión'}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {t('consejoConexionDesc') || 'Activa el Bluetooth de tu dispositivo y asegúrate de que tu hardware NutriStream esté encendido para conectar.'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DeviceCenter;
