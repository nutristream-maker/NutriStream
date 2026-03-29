import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSensorStore } from '../../store/useSensorStore';
import { useLanguage } from '../../context/LanguageContext';
import { useBiometricLogs, BiometricLog } from '../../hooks/useBiometricLogs';
import { FiHeart, FiWind, FiThermometer, FiDroplet, FiActivity, FiZap, FiRefreshCw, FiList, FiPlus, FiTrash2, FiSave, FiClock, FiSmartphone, FiArrowLeft, FiBarChart2, FiCamera } from 'react-icons/fi';
import { GiLungs, GiWaterDrop, GiBrain, GiHeartBeats } from 'react-icons/gi';
import { Card, Button } from '../ui/Shared';
import CameraPulseSensor from './CameraPulseSensor';
import BreathingExercise from './BreathingExercise';
import HapticMeditation from './HapticMeditation';

interface BiometricCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    unit: string;
    status: 'normal' | 'warning' | 'critical' | 'optimal';
    statusLabel: string;
    isScanning?: boolean;
    onClick: () => void;
}

const statusColors = {
    optimal: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
    normal: 'bg-sky-500/10 border-sky-500/30 text-sky-500',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
    critical: 'bg-red-500/10 border-red-500/30 text-red-500',
};

// Utility to get status based on metric type and value
const getMetricStatus = (metric: string, value: number): 'normal' | 'warning' | 'critical' | 'optimal' => {
    switch (metric) {
        case 'heartRate':
            if (value < 60 || value > 100) return 'warning';
            if (value > 120) return 'critical';
            return 'normal';
        case 'spo2':
            if (value >= 98) return 'optimal';
            if (value >= 95) return 'normal';
            if (value >= 90) return 'warning';
            return 'critical';
        case 'respirationRate':
            if (value >= 12 && value <= 20) return 'normal';
            if (value > 20 && value <= 25) return 'warning';
            return 'critical';
        case 'bodyTemperature':
            if (value >= 36.1 && value <= 37.2) return 'normal';
            if (value > 37.2 && value <= 38) return 'warning';
            return 'critical';
        case 'stressLevel':
            if (value <= 30) return 'optimal';
            if (value <= 60) return 'normal';
            if (value <= 80) return 'warning';
            return 'critical';
        case 'hydration':
            if (value >= 70) return 'optimal';
            if (value >= 50) return 'normal';
            if (value >= 30) return 'warning';
            return 'critical';
        default:
            return 'normal';
    }
};

const BiometricCard: React.FC<BiometricCardProps> = ({ icon: Icon, label, value, unit, status, statusLabel, isScanning, onClick }) => (
    <motion.div
        className={`w-full p-3 md:p-4 rounded-xl border ${statusColors[status]} transition-all duration-300 cursor-pointer hover:shadow-md active:scale-95`}
        onClick={onClick}
        animate={{ opacity: isScanning ? [0.5, 1, 0.5] : 1 }}
        transition={{ duration: 1, repeat: isScanning ? Infinity : 0 }}
        whileTap={{ scale: 0.98 }}
    >
        <div className="flex items-center justify-between mb-2">
            <span className="text-xl md:text-2xl"><Icon /></span>
            <span className={`text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[status]}`}>
                {statusLabel}
            </span>
        </div>
        <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{label}</p>
        <p className="text-xl md:text-2xl font-bold mt-1">
            {isScanning ? '--' : value}
            <span className="text-xs md:text-sm font-normal opacity-60 ml-1">{unit}</span>
        </p>
    </motion.div>
);

const BiometricsPanel: React.FC = () => {
    const { t } = useLanguage();
    const { updateBiometrics, ...sensorData } = useSensorStore(); // Spread to access dynamic keys
    const { logs, addLog, deleteLog } = useBiometricLogs();

    const [mode, setMode] = useState<'auto' | 'manual'>('auto');
    const [isScanning, setIsScanning] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
    const [showCameraPulse, setShowCameraPulse] = useState(false);
    const [showBreathingExercise, setShowBreathingExercise] = useState(false);
    const [showHapticMeditation, setShowHapticMeditation] = useState(false);

    const statusLabels: { [key: string]: string } = {
        optimal: t('optimo'),
        normal: 'Normal',
        warning: 'Elevado',
        critical: t('critico'),
    };

    // Metric Definitions for clean iteration and lookup
    const metricDefinitions = [
        { key: 'heartRate', label: t('pulso'), unit: 'bpm', icon: FiHeart },
        { key: 'spo2', label: t('spo2'), unit: '%', icon: GiLungs },
        { key: 'respirationRate', label: t('resp'), unit: 'rpm', icon: FiWind },
        { key: 'bodyTemperature', label: t('temp'), unit: '°C', icon: FiThermometer },
        { key: 'stressLevel', label: t('estres'), unit: '%', icon: GiBrain },
        { key: 'hydration', label: t('agua'), unit: '%', icon: GiWaterDrop },
    ];

    // Form State for Manual Entry
    const [formData, setFormData] = useState({
        heartRate: 72,
        spo2: 98,
        respirationRate: 16,
        bodyTemperature: 36.5,
        stressLevel: 30,
        hydration: 60,
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        hrvScore: 50
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    const handleScan = () => {
        setIsScanning(true);
        // Simulate a 3-second scan
        setTimeout(() => {
            // Generate realistic random variations
            const generatedData = {
                heartRate: Math.floor(65 + Math.random() * 25),
                spo2: Math.floor(95 + Math.random() * 4),
                respirationRate: Math.floor(14 + Math.random() * 6),
                bodyTemperature: parseFloat((36.2 + Math.random() * 0.8).toFixed(1)),
                stressLevel: Math.floor(15 + Math.random() * 50),
                hydration: Math.floor(55 + Math.random() * 35),
                bloodPressureSystolic: Math.floor(110 + Math.random() * 20),
                bloodPressureDiastolic: Math.floor(70 + Math.random() * 15),
                hrvScore: Math.floor(30 + Math.random() * 40),
            };

            // Update Context
            updateBiometrics({ ...generatedData, lastBiometricScan: Date.now() });

            // Add to History Logs
            addLog({
                source: 'auto',
                metrics: generatedData
            });

            setIsScanning(false);
        }, 3000);
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Update Context with manual data
        updateBiometrics({ ...formData, lastBiometricScan: Date.now() });

        // Add to History Logs
        addLog({
            source: 'manual',
            metrics: formData,
            note: t('registroManual')
        });
    };

    // --- RENDER DETAIL VIEW ---
    if (selectedMetric) {
        const metricDef = metricDefinitions.find(m => m.key === selectedMetric);
        if (!metricDef) return null; // Should not happen

        // @ts-ignore - dynamic access to sensorData
        const currentValue = sensorData[selectedMetric] as number;
        const currentStatus = getMetricStatus(selectedMetric, currentValue);
        const Icon = metricDef.icon;

        // Filter logs that have this metric (assuming all logs have full structure currently, but good to be safe)
        const relevantLogs = logs.filter(log => log.metrics && log.metrics[selectedMetric as keyof typeof log.metrics] !== undefined);

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 md:space-y-6"
            >
                {/* Camera Pulse Sensor Modal */}
                <AnimatePresence>
                    {showCameraPulse && (
                        <CameraPulseSensor
                            onResult={(bpm) => {
                                updateBiometrics({ heartRate: bpm, lastBiometricScan: Date.now() });
                                addLog({ source: 'camera', metrics: { ...formData, heartRate: bpm } });
                                setShowCameraPulse(false);
                            }}
                            onClose={() => setShowCameraPulse(false)}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showBreathingExercise && (
                        <BreathingExercise onClose={() => setShowBreathingExercise(false)} />
                    )}
                </AnimatePresence>

                {/* Haptic Meditation Modal */}
                <AnimatePresence>
                    {showHapticMeditation && (
                        <HapticMeditation onClose={() => setShowHapticMeditation(false)} />
                    )}
                </AnimatePresence>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedMetric(null)}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors bg-slate-50 dark:bg-slate-700/50"
                        >
                            <FiArrowLeft className="text-xl text-slate-700 dark:text-slate-200" />
                        </button>
                        <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                            <Icon className="text-primary" /> {metricDef.label}
                        </h3>
                    </div>

                    <div className="sm:ml-auto">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${statusColors[currentStatus]}`}>
                            {statusLabels[currentStatus]}
                        </span>
                    </div>
                </div>

                {/* Main Value Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <Card className="flex flex-col items-center justify-center p-6 md:p-8 min-h-[160px] md:min-h-[200px]">
                        <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-800 dark:text-white mb-2 text-center break-words">
                            {currentValue} <span className="text-lg md:text-2xl text-slate-400 font-normal">{metricDef.unit}</span>
                        </div>
                        <p className="text-sm md:text-base text-slate-500">{t('estadoActual')}</p>
                    </Card>

                    {/* Respiration Guided Breathing Feature */}
                    {selectedMetric === 'respirationRate' ? (
                        <Card className="flex flex-col items-center justify-center p-6 md:p-8 min-h-[160px] md:min-h-[200px] border-indigo-100 dark:border-indigo-900/30">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-3">
                                <FiWind className="text-2xl text-indigo-500" />
                            </div>
                            <h4 className="font-bold text-slate-700 dark:text-slate-200">Respiración Guiada</h4>
                            <p className="text-xs md:text-sm text-slate-400 text-center mt-1 mb-4 leading-relaxed">Sincroniza tu respiración con vibraciones relajantes.</p>
                            <button
                                onClick={() => setShowBreathingExercise(true)}
                                className="w-full sm:w-auto px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <FiWind /> Iniciar Relajación
                            </button>
                        </Card>
                    ) : selectedMetric === 'heartRate' ? (
                        <Card className="flex flex-col items-center justify-center p-6 md:p-8 min-h-[160px] md:min-h-[200px] border-red-100 dark:border-red-900/30">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-3">
                                <FiCamera className="text-2xl text-red-500" />
                            </div>
                            <h4 className="font-bold text-slate-700 dark:text-slate-200">Medir con Cámara</h4>
                            <p className="text-xs md:text-sm text-slate-400 text-center mt-1 mb-4 leading-relaxed">Usa la cámara trasera para medir tu pulso.</p>
                            <button
                                onClick={() => setShowCameraPulse(true)}
                                className="w-full sm:w-auto px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <FiCamera /> Iniciar Medición
                            </button>
                        </Card>
                    ) : selectedMetric === 'stressLevel' ? (
                        <Card className="flex flex-col items-center justify-center p-6 md:p-8 min-h-[160px] md:min-h-[200px] border-violet-100 dark:border-violet-900/30">
                            <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mb-3">
                                <GiBrain className="text-2xl text-violet-500" />
                            </div>
                            <h4 className="font-bold text-slate-700 dark:text-slate-200">Reducción de Estrés</h4>
                            <p className="text-xs md:text-sm text-slate-400 text-center mt-1 mb-4 leading-relaxed">Simula latidos calmantes mediante vibración.</p>
                            <button
                                onClick={() => setShowHapticMeditation(true)}
                                className="w-full sm:w-auto px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <FiSmartphone /> Iniciar Relajación
                            </button>
                        </Card>
                    ) : (
                        <Card className="flex flex-col items-center justify-center p-6 md:p-8 min-h-[160px] md:min-h-[200px] border-dashed border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <FiBarChart2 className="text-4xl text-slate-300 mb-4" />
                            <h4 className="font-bold text-slate-500">Análisis Avanzado</h4>
                            <p className="text-xs md:text-sm text-slate-400 text-center mt-2">Próximamente: Gráficas de tendencia y análisis predictivo para {metricDef.label}.</p>
                        </Card>
                    )}
                </div>

                {/* Metric Specific History */}
                <div className="pt-4 md:pt-6">
                    <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                        <FiClock /> Historial: {metricDef.label}
                    </h4>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs md:text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-semibold uppercase text-[10px] md:text-xs">
                                    <tr>
                                        <th className="px-3 py-2 md:px-4 md:py-3">{t('fechaHora')}</th>
                                        <th className="px-3 py-2 md:px-4 md:py-3">{t('origen')}</th>
                                        <th className="px-3 py-2 md:px-4 md:py-3 text-right">Valor ({metricDef.unit})</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {relevantLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-slate-500">{t('noHayRegistrosBiometricos')}</td>
                                        </tr>
                                    ) : relevantLogs.slice(0, 10).map((log) => ( // Show last 10
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-3 py-2 md:px-4 md:py-3 border-b border-slate-50 dark:border-slate-800">
                                                <div className="font-medium text-slate-900 dark:text-slate-100">{log.date}</div>
                                                <div className="text-[10px] md:text-xs text-slate-400">{log.time}</div>
                                            </td>
                                            <td className="px-3 py-2 md:px-4 md:py-3 border-b border-slate-50 dark:border-slate-800">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${log.source === 'auto' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                                                    {log.source === 'auto' ? t('autoS') : t('manual')}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 md:px-4 md:py-3 text-right font-mono font-bold text-base md:text-lg border-b border-slate-50 dark:border-slate-800">
                                                {/* @ts-ignore */}
                                                {log.metrics[selectedMetric]}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </motion.div>
        );
    }

    // --- RENDER DASHBOARD VIEW ---
    return (
        <div className="space-y-4 md:space-y-6">

            {/* TABS */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-2 md:mb-4">
                <button
                    onClick={() => setMode('auto')}
                    className={`flex-1 py-2 md:py-3 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'auto' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
                >
                    <FiRefreshCw /> {t('autoEscaneo')}
                </button>
                <button
                    onClick={() => setMode('manual')}
                    className={`flex-1 py-2 md:py-3 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'manual' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
                >
                    <FiPlus /> {t('registroManual')}
                </button>
            </div>

            {/* ACTION AREA */}
            <div className="p-1">
                {mode === 'auto' ? (
                    <div className="text-center space-y-4">
                        <div className="p-4 md:p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                            <motion.div
                                className="w-16 h-16 md:w-24 md:h-24 mx-auto bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-500 mb-4"
                                animate={{ scale: isScanning ? [1, 1.1, 1] : 1 }}
                                transition={{ duration: 1, repeat: isScanning ? Infinity : 0 }}
                            >
                                <FiSmartphone className="text-3xl md:text-4xl" />
                            </motion.div>
                            <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2">{t('monitorNeuralPod')}</h3>
                            <p className="text-xs md:text-sm text-slate-500 mb-4 md:mb-6 max-w-xs mx-auto">{t('monitorNeuralPodDesc')}</p>

                            <motion.button
                                onClick={handleScan}
                                disabled={isScanning}
                                className={`w-full max-w-xs mx-auto py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm md:text-base
                                    ${isScanning
                                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
                                    }`}
                                whileTap={{ scale: 0.95 }}
                            >
                                <motion.span animate={{ rotate: isScanning ? 360 : 0 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                    <FiRefreshCw className="text-lg" />
                                </motion.span>
                                {isScanning ? t('escaneando') : t('iniciarEscaneo')}
                            </motion.button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                            {/* Inputs for each metric */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">{t('pulso')} (bpm)</label>
                                <input type="number" name="heartRate" value={formData.heartRate} onChange={handleInputChange} className="w-full p-2 text-sm rounded-lg border dark:bg-slate-800 dark:border-slate-700 font-mono" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">{t('spo2')} (%)</label>
                                <input type="number" name="spo2" value={formData.spo2} onChange={handleInputChange} className="w-full p-2 text-sm rounded-lg border dark:bg-slate-800 dark:border-slate-700 font-mono" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">{t('resp')} (rpm)</label>
                                <input type="number" name="respirationRate" value={formData.respirationRate} onChange={handleInputChange} className="w-full p-2 text-sm rounded-lg border dark:bg-slate-800 dark:border-slate-700 font-mono" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">{t('temp')} (°C)</label>
                                <input type="number" step="0.1" name="bodyTemperature" value={formData.bodyTemperature} onChange={handleInputChange} className="w-full p-2 text-sm rounded-lg border dark:bg-slate-800 dark:border-slate-700 font-mono" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">{t('estres')} (0-100)</label>
                                <input type="number" name="stressLevel" value={formData.stressLevel} onChange={handleInputChange} className="w-full p-2 text-sm rounded-lg border dark:bg-slate-800 dark:border-slate-700 font-mono" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">{t('agua')} (%)</label>
                                <input type="number" name="hydration" value={formData.hydration} onChange={handleInputChange} className="w-full p-2 text-sm rounded-lg border dark:bg-slate-800 dark:border-slate-700 font-mono" />
                            </div>
                        </div>
                        <Button type="submit" variant="primary" icon={FiSave} className="w-full !py-3">{t('guardarRegistro')}</Button>
                    </form>
                )}
            </div>

            {/* LIVE DATA PREVIEW (Context) */}
            <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                    <FiActivity />
                    {t('estadoActual')} <span className="text-[10px] bg-red-500 text-white px-2 rounded-full">LIVE</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
                    {metricDefinitions.map((def) => {
                        // @ts-ignore
                        const val = sensorData[def.key] as number;
                        return (
                            <BiometricCard
                                key={def.key}
                                icon={def.icon}
                                label={def.label}
                                value={val}
                                unit={def.unit}
                                status={getMetricStatus(def.key, val)}
                                statusLabel={statusLabels[getMetricStatus(def.key, val)]}
                                isScanning={isScanning}
                                onClick={() => setSelectedMetric(def.key)}
                            />
                        );
                    })}
                </div>
            </div>

            {/* GLOBAL HISTORY TABLE */}
            <div className="pt-4 md:pt-6 border-t border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base"><FiClock /> {t('historialRegistros')}</h4>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs md:text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-semibold uppercase text-[10px] md:text-xs">
                                <tr>
                                    <th className="px-3 py-2 md:px-4 md:py-3">{t('fechaHora')}</th>
                                    <th className="px-3 py-2 md:px-4 md:py-3">{t('origen')}</th>
                                    <th className="px-3 py-2 md:px-4 md:py-3 text-center">BPM</th>
                                    <th className="px-3 py-2 md:px-4 md:py-3 text-center">SpO2</th>
                                    <th className="hidden md:table-cell px-4 py-3 text-center">Temp</th>
                                    <th className="hidden md:table-cell px-4 py-3 text-center">{t('estres')}</th>
                                    <th className="px-3 py-2 md:px-4 md:py-3 text-right">{t('acciones')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">{t('noHayRegistrosBiometricos')}</td>
                                    </tr>
                                ) : logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-3 py-2 md:px-4 md:py-3 border-b border-slate-50 dark:border-slate-700">
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{log.date}</div>
                                            <div className="text-[10px] md:text-xs text-slate-400">{log.time}</div>
                                        </td>
                                        <td className="px-3 py-2 md:px-4 md:py-3 border-b border-slate-50 dark:border-slate-700">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${log.source === 'auto' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                                                {log.source === 'auto' ? t('autoS')[0] : t('manual')[0]}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 md:px-4 md:py-3 text-center font-mono border-b border-slate-50 dark:border-slate-700">{log.metrics.heartRate}</td>
                                        <td className="px-3 py-2 md:px-4 md:py-3 text-center font-mono border-b border-slate-50 dark:border-slate-700">{log.metrics.spo2}%</td>
                                        <td className="hidden md:table-cell px-4 py-3 text-center font-mono border-b border-slate-50 dark:border-slate-700">{log.metrics.bodyTemperature}°</td>
                                        <td className="hidden md:table-cell px-4 py-3 text-center font-mono border-b border-slate-50 dark:border-slate-700">{log.metrics.stressLevel}%</td>
                                        <td className="px-3 py-2 md:px-4 md:py-3 text-right border-b border-slate-50 dark:border-slate-700">
                                            <button
                                                onClick={() => deleteLog(log.id)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BiometricsPanel;
