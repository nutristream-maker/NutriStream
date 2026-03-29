import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiMoon, FiHeart, FiZap } from 'react-icons/fi';
import { GiBrain } from 'react-icons/gi';
import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';
import { useSensorStore } from '../../store/useSensorStore';
import { calculateReadinessScore, getReadinessColor, ReadinessResult } from '../../services/ReadinessService';
import { Card } from '../ui/Shared';

const ReadinessScoreCard: React.FC = () => {
    const { t } = useLanguage();
    const { userData } = useUser();
    const { muscleFatigue } = useSensorStore();

    const readiness: ReadinessResult = useMemo(() => {
        return calculateReadinessScore({
            sleepHours: userData.stats.sleep,
            muscleFatigue: muscleFatigue
        });
    }, [userData.stats.sleep, muscleFatigue]);

    const color = getReadinessColor(readiness.score);
    const radius = 60; // Increased radius
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (readiness.score / 100) * circumference;

    const statusLabels: { [key: string]: string } = {
        optimal: '¡Óptimo!',
        good: 'Bueno',
        moderate: 'Moderado',
        low: 'Bajo'
    };

    return (
        <Card className="h-full !p-0 relative overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex flex-col">
            {/* Header / Title Section */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                    <FiZap className="text-primary" />
                    Índice de Preparación
                </h3>
                <span
                    className="px-3 py-1 rounded-full text-xs font-bold border"
                    style={{ backgroundColor: `${color}10`, color: color, borderColor: `${color}30` }}
                >
                    {statusLabels[readiness.status]}
                </span>
            </div>

            <div className="flex-grow p-6 flex flex-col items-center gap-6">
                {/* Frame 1: Main Circular Score */}
                <div className="flex-shrink-0 relative w-48 h-48 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-full border-4 border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="relative w-36 h-36">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                            {/* Background Circle */}
                            <circle cx="70" cy="70" r={radius} strokeWidth="12" className="stroke-slate-200 dark:stroke-slate-700" fill="transparent" />
                            {/* Progress Circle */}
                            <motion.circle
                                cx="70" cy="70" r={radius} strokeWidth="12" fill="transparent"
                                stroke={color} strokeLinecap="round" strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                key={readiness.score} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                className="text-5xl font-black tracking-tighter" style={{ color }}
                            >
                                {readiness.score}
                            </motion.span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Puntos</span>
                        </div>
                    </div>
                </div>

                {/* Frame 2: Breakdown & AI Insight */}
                <div className="w-full space-y-4">
                    {/* Factors Container with Border (Frame) */}
                    <div className="bg-slate-50 dark:bg-slate-900/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700 space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Factores Clave</h4>
                        <FactorBar icon={<FiMoon />} label="Calidad de Sueño" score={readiness.factors.sleep.score} weight={readiness.factors.sleep.weight} />
                        <FactorBar icon={<FiActivity />} label="Recuperación" score={readiness.factors.muscleRecovery.score} weight={readiness.factors.muscleRecovery.weight} />
                        <FactorBar icon={<FiHeart />} label="HRV" score={readiness.factors.hrv.score} weight={readiness.factors.hrv.weight} />
                    </div>

                    {/* AI Insight Pill */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                        <GiBrain className="text-indigo-600 dark:text-indigo-400 text-xl flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-snug font-medium">
                            {readiness.recommendation}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const FactorBar: React.FC<{ icon: React.ReactNode; label: string; score: number; weight: number }> = ({ icon, label, score, weight }) => {
    const barColor = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';

    return (
        <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-400">{icon}</span>
            <span className="text-slate-600 dark:text-slate-300 w-32 font-medium truncate">{label}</span>
            <div className="flex-grow h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div className={`h-full ${barColor} rounded-full`} initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1, ease: "easeOut" }} />
            </div>
            <span className="text-slate-500 w-10 text-right font-mono font-bold">{score}%</span>
        </div>
    );
};

export default ReadinessScoreCard;
