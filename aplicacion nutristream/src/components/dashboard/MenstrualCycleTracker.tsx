import React, { useState, useMemo } from 'react';
import { FiCalendar, FiActivity, FiInfo, FiCheckCircle, FiDroplet, FiTrendingUp, FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button } from '../ui/Shared';
import { useLanguage } from '../../context/LanguageContext';
import SymptomLogger, { DailySymptoms } from './SymptomLogger';

// Scientific Constants
const LUTEAL_LENGTH = 14;

export const calculateCycleStatus = (lastPeriodDate: string, cycleLength: number) => {
    if (!lastPeriodDate) return null;

    const start = new Date(lastPeriodDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Cycle Day (1-based)
    const currentCycleDay = ((diffDays - 1) % cycleLength) + 1;

    // Calculate critical days
    const ovulationDay = cycleLength - LUTEAL_LENGTH;
    const fertileStart = ovulationDay - 5;
    const fertileEnd = ovulationDay + 1;

    // Determine Phase
    let currentPhaseKey = '';
    let phaseColor = '';
    let phaseDescKey = '';
    let nutritionKey = '';

    if (currentCycleDay <= 5) {
        currentPhaseKey = 'faseMenstrual';
        phaseColor = 'text-red-500 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
        phaseDescKey = 'descMenstrual';
        nutritionKey = 'recNutricionMenstrual';
    } else if (currentCycleDay < ovulationDay) {
        currentPhaseKey = 'faseFolicular';
        phaseColor = 'text-pink-500 bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800';
        phaseDescKey = 'descFolicular';
        nutritionKey = 'recNutricionFolicular';
    } else if (currentCycleDay === ovulationDay) {
        currentPhaseKey = 'ovulacion';
        phaseColor = 'text-purple-500 bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800';
        phaseDescKey = 'descOvulacion';
        nutritionKey = 'recNutricionOvulacion';
    } else {
        currentPhaseKey = 'faseLutea';
        phaseColor = 'text-amber-500 bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800';
        phaseDescKey = 'descLutea';
        nutritionKey = 'recNutricionLutea';
    }

    return {
        day: currentCycleDay,
        phaseKey: currentPhaseKey,
        phaseColor,
        phaseDescKey,
        nutritionKey,
        isFertile: currentCycleDay >= fertileStart && currentCycleDay <= fertileEnd,
        ovulationDay
    };
};

const HormoneGraph: React.FC<{ day: number, length: number }> = ({ day, length }) => {
    const { t } = useLanguage();

    // Approx normalized curves (0-100)
    // Estrogen: Peaks at Ovulation, secondary peak in Luteal
    // Progesterone: Low until Ovulation, high plateau in Luteal
    const points = 50;
    const ovulationX = (length - 14) / length * 100;

    const getEstrogen = (x: number) => {
        // Peak at ovulation (x=ovulationX)
        const d = x - ovulationX;
        if (x < ovulationX) return 20 + 80 * Math.exp(-0.05 * d * d); // Rise to peak
        return 30 + 40 * Math.sin((x - ovulationX) * 0.3) * Math.exp(-0.02 * x); // Luteal fluctuation
    };

    const getProgesterone = (x: number) => {
        if (x < ovulationX) return 5;
        // Rise after ovulation, peak mid luteal, drop end
        const lutealProgr = (x - ovulationX) / (100 - ovulationX);
        return 5 + 90 * Math.sin(lutealProgr * Math.PI);
    };

    const pathE = [];
    const pathP = [];

    for (let i = 0; i <= 100; i += 2) {
        pathE.push(`${i},${100 - getEstrogen(i)}`); // SVG y is inverted
        pathP.push(`${i},${100 - getProgesterone(i)}`);
    }

    const currentX = (day / length) * 100;

    return (
        <div className="mt-6">
            <h5 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">{t('analisisHormonal')}</h5>
            <div className="relative h-24 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full p-2">
                    {/* Estrogen */}
                    <motion.path
                        d={`M ${pathE.join(' L ')}`}
                        fill="none"
                        stroke="#ec4899"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5 }}
                    />
                    {/* Progesterone */}
                    <motion.path
                        d={`M ${pathP.join(' L ')}`}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                    />

                    {/* Current Day Line */}
                    <line x1={currentX} y1="0" x2={currentX} y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-slate-400" />
                </svg>

                {/* Legend */}
                <div className="absolute top-1 right-2 flex flex-col text-[8px] gap-0.5">
                    <span className="text-pink-500 font-bold">● {t('estrogeno')}</span>
                    <span className="text-amber-500 font-bold">● {t('progesterona')}</span>
                </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-center italic">
                * {t('nivelesHormonales')}
            </p>
        </div>
    );
};

interface MenstrualCycleTrackerProps {
    lastPeriodDate: string;
    setLastPeriodDate: (date: string) => void;
    cycleLength: number;
    setCycleLength: (length: number) => void;
}

const MenstrualCycleTracker: React.FC<MenstrualCycleTrackerProps> = ({ lastPeriodDate, setLastPeriodDate, cycleLength, setCycleLength }) => {
    const { t } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoggerOpen, setIsLoggerOpen] = useState(false);
    const [dailyLog, setDailyLog] = useState<DailySymptoms | null>(null);

    // Calculate current day and phase
    const cycleStatus = useMemo(() => calculateCycleStatus(lastPeriodDate, cycleLength), [lastPeriodDate, cycleLength]);

    // Adapt recommendations based on symptoms
    const adjustedStatus = useMemo(() => {
        if (!cycleStatus) return null;
        const status = { ...cycleStatus };

        if (dailyLog) {
            const hasPain = dailyLog.physical.some(s => ['Cramps', 'Back Pain', 'Headache', 'Migraine'].includes(s));
            const isLowEnergy = dailyLog.energy === 'low';

            if (hasPain || isLowEnergy) {
                // Downgrade intensity to restorative
                status.phaseDescKey = 'descMenstrual'; // Yoga/Stretching
                status.nutritionKey = 'recNutricionMenstrual'; // Anti-inflammatory
            }
        }
        return status;
    }, [cycleStatus, dailyLog]);

    const handleSave = () => setIsEditing(false);

    return (
        <Card className="!p-0 overflow-hidden relative border-none shadow-none bg-transparent">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-pink-600 dark:text-pink-400">
                        <span className="bg-pink-100 dark:bg-pink-900/30 p-2 rounded-lg"><FiActivity className="text-xl" /></span>
                        {t('saludFemenina')}
                    </h3>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-sm font-medium text-slate-500 hover:text-pink-500 transition-colors"
                    >
                        {isEditing ? t('guardarCambios') : (lastPeriodDate ? t('ajustarObjetivo') : t('registrarPeriodo'))}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {isEditing || !lastPeriodDate ? (
                        <motion.div
                            key="edit"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-5"
                        >
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">{t('registrarPeriodo')}</label>
                                <input
                                    type="date"
                                    value={lastPeriodDate}
                                    onChange={(e) => setLastPeriodDate(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-pink-500 outline-none"
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-xs font-bold uppercase text-slate-500">{t('duracionCiclo')} (días)</label>
                                    <span className="text-xl font-bold text-pink-500">{cycleLength}</span>
                                </div>
                                <input
                                    type="range"
                                    min="21"
                                    max="35"
                                    value={cycleLength}
                                    onChange={(e) => setCycleLength(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>21</span>
                                    <span>28</span>
                                    <span>35</span>
                                </div>
                            </div>
                            <Button onClick={handleSave} className="w-full !bg-pink-500 hover:!bg-pink-600 text-white" icon={FiCheckCircle}>{t('guardarCambios')}</Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="display"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col sm:flex-row items-center gap-8">
                                {/* Cycle Visual */}
                                <div className="relative w-48 h-48 shrink-0">
                                    {/* Outer Ring with Gradients */}
                                    <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-700/50"></div>
                                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90">
                                        {/* Fertile Window Marker */}
                                        <circle
                                            cx="50" cy="50" r="46" fill="none" stroke="#a78bfa" strokeWidth="2" strokeOpacity="0.3"
                                            strokeDasharray={`${6 / cycleLength * 289} 289`}
                                            strokeDashoffset={-((adjustedStatus?.ovulationDay - 6) / cycleLength * 289)}
                                        />
                                        {/* Progress */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="46"
                                            fill="none"
                                            stroke="url(#gradientPink)"
                                            strokeWidth="6"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(adjustedStatus?.day || 1) / cycleLength * 289} 289`}
                                            className="drop-shadow-lg" // Add glow
                                        />
                                        <defs>
                                            <linearGradient id="gradientPink" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#ec4899" />
                                                <stop offset="100%" stopColor="#8b5cf6" />
                                            </linearGradient>
                                        </defs>
                                    </svg>

                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                        <span className="text-4xl font-black bg-gradient-to-br from-pink-500 to-purple-600 bg-clip-text text-transparent">
                                            {t('dia')} {adjustedStatus?.day}
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 border ${adjustedStatus?.phaseColor}`}>
                                            {t(adjustedStatus?.phaseKey || '')}
                                        </span>
                                        {adjustedStatus?.isFertile && (
                                            <span className="text-[10px] text-purple-500 font-semibold mt-1 flex items-center gap-1">
                                                <FiDroplet size={8} /> Ventana Fértil
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Insights */}
                                <div className="flex-1 w-full space-y-3">
                                    <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 rounded-xl border border-pink-100 dark:border-pink-900/20">
                                        <h4 className="text-xs font-bold text-pink-600 dark:text-pink-400 flex items-center gap-1.5 uppercase tracking-wide mb-1">
                                            <FiActivity /> {t('entrenamientoSugerido')}
                                            {dailyLog && (dailyLog.energy === 'low' || dailyLog.physical.length > 0) && (
                                                <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded ml-auto">Adaptado</span>
                                            )}
                                        </h4>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {t(adjustedStatus?.phaseDescKey || '')}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <h4 className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5 uppercase tracking-wide mb-1">
                                            <FiInfo /> {t('nutricionRecomendada')}
                                        </h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {t(adjustedStatus?.nutritionKey || '')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Daily Symptom Log Summary */}
                            {dailyLog ? (
                                <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                            <FiCheckCircle className="text-green-500" /> Registro de Hoy
                                        </h4>
                                        <button onClick={() => setIsLoggerOpen(true)} className="text-xs font-bold text-pink-500 hover:text-pink-600 transition-colors">
                                            Editar
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {dailyLog.energy && (
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${dailyLog.energy === 'high' ? 'bg-green-100 text-green-700 border-green-200' :
                                                dailyLog.energy === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                    'bg-red-100 text-red-700 border-red-200'
                                                }`}>
                                                Energía: {dailyLog.energy}
                                            </span>
                                        )}
                                        {dailyLog.physical.map(s => (
                                            <span key={s} className="px-2 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                                {s}
                                            </span>
                                        ))}
                                        {dailyLog.mood.map(s => (
                                            <span key={s} className="px-2 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsLoggerOpen(true)}
                                    className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 font-bold text-sm hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <FiPlus /> Registrar Síntomas de Hoy
                                </button>
                            )}

                            {/* Logger Modal */}
                            <SymptomLogger
                                isOpen={isLoggerOpen}
                                onClose={() => setIsLoggerOpen(false)}
                                onSave={(data) => setDailyLog(data)}
                                initialData={dailyLog || undefined}
                            />

                            {/* Hormonal Graph */}
                            <HormoneGraph day={adjustedStatus?.day || 1} length={cycleLength} />
                        </motion.div>
                    )
                    }
                </AnimatePresence>
            </div>
        </Card>
    );
};

export default MenstrualCycleTracker;
