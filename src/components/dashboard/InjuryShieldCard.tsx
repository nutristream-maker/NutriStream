import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiChevronDown, FiInfo, FiActivity } from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';

import { Card, Button } from '../ui/Shared';
import { useSensorStore } from '../../store/useSensorStore';
import {
    getQuickPrediction,
    getRiskColor,
    getRiskBadgeClasses,
    InjuryPrediction,
    RiskLevel
} from '../../services/InjuryPredictionService';

const riskIcons: Record<RiskLevel, React.ElementType> = {
    low: FiCheckCircle,
    moderate: FiInfo,
    high: FiAlertTriangle,
    critical: FiAlertTriangle,
};

const riskLabels: Record<RiskLevel, string> = {
    low: 'Bajo',
    moderate: 'Moderado',
    high: 'Alto',
    critical: 'Crítico',
};

const InjuryShieldCard: React.FC = () => {
    const { muscleFatigue } = useSensorStore();
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate prediction safely
    const prediction: InjuryPrediction = useMemo(() => {
        try {
            return getQuickPrediction(muscleFatigue);
        } catch (err) {
            console.error("Error calculating injury prediction:", err);
            // Fallback safe state
            return {
                overallRisk: 'low',
                overallScore: 100,
                muscleRisks: [],
                topRisks: [],
                generalRecommendations: [],
                shouldAlert: false
            };
        }
    }, [muscleFatigue]);

    const RiskIcon = riskIcons[prediction?.overallRisk || 'low'];
    const riskColor = getRiskColor(prediction?.overallRisk || 'low');

    return (
        <Card className="!p-0 overflow-hidden">
            {/* Header */}
            <div
                className={`p-5 cursor-pointer transition-colors ${prediction.shouldAlert ? 'bg-gradient-to-r from-amber-500/10 to-red-500/10' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={prediction.shouldAlert ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${riskColor}20` }}
                        >
                            <FiShield size={24} color={riskColor} />
                        </motion.div>
                        <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                Injury Shield
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getRiskBadgeClasses(prediction.overallRisk)}`}>
                                    {riskLabels[prediction.overallRisk]}
                                </span>
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Protección predictiva de lesiones
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Risk Score */}
                        <div className="text-right hidden sm:block">
                            <p className="text-2xl font-bold" style={{ color: riskColor }}>
                                {prediction.overallScore}
                            </p>
                            <p className="text-xs text-slate-500">Riesgo</p>
                        </div>
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            className="text-slate-400"
                        >
                            <FiChevronDown size={20} />
                        </motion.div>
                    </div>
                </div>

                {/* Alert Message */}
                {prediction.shouldAlert && prediction.alertMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-lg text-sm flex items-start gap-2"
                    >
                        <FiAlertTriangle className="mt-0.5 flex-shrink-0" />
                        <span>{prediction.alertMessage}</span>
                    </motion.div>
                )}
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 pt-0 space-y-5 border-t border-slate-200 dark:border-slate-700">
                            {/* Top Risks */}
                            {prediction.topRisks.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
                                        <GiMuscleUp /> Músculos con Mayor Riesgo
                                    </h4>
                                    <div className="space-y-2">
                                        {prediction.topRisks.map((risk, idx) => (
                                            <motion.div
                                                key={risk.muscle}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium capitalize">{risk.muscle}</span>
                                                    <span
                                                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getRiskBadgeClasses(risk.riskLevel)}`}
                                                    >
                                                        {risk.riskScore}%
                                                    </span>
                                                </div>
                                                {/* Progress bar */}
                                                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${risk.riskScore}%` }}
                                                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                                                        className="h-full rounded-full"
                                                        style={{ backgroundColor: getRiskColor(risk.riskLevel) }}
                                                    />
                                                </div>
                                                {/* Reasons */}
                                                {risk.reasons.length > 0 && risk.riskScore > 30 && (
                                                    <p className="text-xs text-slate-500 mt-2">
                                                        {risk.reasons[0]}
                                                    </p>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommendations */}
                            <div>
                                <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
                                    <FiActivity /> Recomendaciones
                                </h4>
                                <ul className="space-y-2">
                                    {prediction.generalRecommendations.map((rec, idx) => (
                                        <motion.li
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + idx * 0.1 }}
                                            className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                                        >
                                            <RiskIcon
                                                className="mt-0.5 flex-shrink-0"
                                                color={riskColor}
                                                size={14}
                                            />
                                            <span>{rec}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            {/* Action Button */}
                            {prediction.overallRisk !== 'low' && (
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    icon={FiShield}
                                >
                                    Ver Plan de Recuperación
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

export default InjuryShieldCard;
