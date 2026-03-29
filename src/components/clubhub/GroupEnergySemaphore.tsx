import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiZap, FiActivity, FiUsers, FiChevronDown, FiCpu } from 'react-icons/fi';
import { Member } from '../../types/ClubTypes';
import { NeuralLoadService, GroupLoadStatus, SemaphoreLevel } from '../../services/NeuralLoadService';

interface GroupEnergySemaphoreProps {
    members: Member[];
    isTrainerView?: boolean;
}

const GroupEnergySemaphore: React.FC<GroupEnergySemaphoreProps> = ({
    members,
    isTrainerView = true
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const status = useMemo(() =>
        NeuralLoadService.calculateGroupLoad(members),
        [members]
    );

    const rpeInfo = NeuralLoadService.getRPERecommendation(status.semaphore);
    const alert = NeuralLoadService.getTrainerAlert(status);

    const semaphoreConfig: Record<SemaphoreLevel, {
        bg: string;
        glow: string;
        text: string;
        border: string;
        gradient: string;
    }> = {
        green: {
            bg: 'bg-emerald-500',
            glow: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]',
            text: 'text-emerald-400',
            border: 'border-emerald-500/30',
            gradient: 'from-emerald-500/10 to-transparent'
        },
        amber: {
            bg: 'bg-amber-500',
            glow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
            text: 'text-amber-400',
            border: 'border-amber-500/30',
            gradient: 'from-amber-500/10 to-transparent'
        },
        red: {
            bg: 'bg-red-500',
            glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
            text: 'text-red-400',
            border: 'border-red-500/30',
            gradient: 'from-red-500/10 to-transparent'
        }
    };

    const config = semaphoreConfig[status.semaphore];

    return (
        <motion.div
            className={`rounded-2xl border ${config.border} bg-gradient-to-r ${config.gradient} dark:from-slate-900/90 dark:to-slate-800/50 backdrop-blur-xl overflow-hidden`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Compact Header - Always Visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
                {/* Inline Traffic Light */}
                <div className="flex gap-1.5">
                    {(['green', 'amber', 'red'] as SemaphoreLevel[]).map(level => (
                        <motion.div
                            key={level}
                            className={`w-3 h-3 rounded-full transition-all ${status.semaphore === level
                                    ? `${semaphoreConfig[level].bg} ${semaphoreConfig[level].glow}`
                                    : 'bg-slate-600/50'
                                }`}
                            animate={status.semaphore === level ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                    ))}
                </div>

                {/* Main Info */}
                <div className="flex-1 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{rpeInfo.icon}</span>
                        <span className={`font-bold text-sm ${config.text}`}>{rpeInfo.sessionType}</span>
                    </div>
                    <span className="text-xs text-slate-500 hidden sm:inline">•</span>
                    <span className="text-xs text-slate-400 hidden sm:inline">RPE {rpeInfo.rpe}/10</span>
                </div>

                {/* Quick Stats Badges */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <FiZap size={12} />
                        <span className="text-xs font-bold">{status.averageBattery}%</span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${config.bg}/10 ${config.text}`}>
                        <FiActivity size={12} />
                        <span className="text-xs font-bold">{status.averageFatigue}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <FiUsers size={12} />
                        <span>{status.connectedCount}</span>
                    </div>
                </div>

                {/* Expand Toggle */}
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-slate-400"
                >
                    <FiChevronDown size={16} />
                </motion.div>
            </button>

            {/* Alert Banner - Always Visible When Present */}
            <AnimatePresence>
                {alert && isTrainerView && !isExpanded && (
                    <motion.div
                        className="px-4 pb-3 flex items-center gap-2 text-xs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <FiAlertTriangle className="text-amber-400" size={12} />
                        <span className="text-amber-400 truncate">{alert}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Expandable Details */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-700/50"
                    >
                        <div className="p-4 space-y-4">
                            {/* AI Recommendation */}
                            <div className={`p-3 rounded-xl bg-slate-800/50 border ${config.border}`}>
                                <div className="flex items-start gap-2">
                                    <FiCpu className={`${config.text} mt-0.5 flex-shrink-0`} size={14} />
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        {status.recommendation}
                                    </p>
                                </div>
                            </div>

                            {/* Full Alert */}
                            {alert && isTrainerView && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <FiAlertTriangle className="text-amber-400 flex-shrink-0" />
                                    <p className="text-sm text-amber-400">{alert}</p>
                                </div>
                            )}

                            {/* High Fatigue Athletes */}
                            {isTrainerView && status.highFatigueMembers.length > 0 && (
                                <div>
                                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                        <FiAlertTriangle size={10} />
                                        Atletas con fatiga elevada
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {status.highFatigueMembers.map((m, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400"
                                            >
                                                {m.name.split(' ')[0]} ({m.fatigue}%)
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Metrics Detail */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 rounded-lg bg-slate-800/30">
                                    <p className="text-xs text-slate-500">Batería</p>
                                    <p className="text-lg font-bold text-cyan-400">{status.averageBattery}%</p>
                                </div>
                                <div className="p-2 rounded-lg bg-slate-800/30">
                                    <p className="text-xs text-slate-500">Fatiga</p>
                                    <p className={`text-lg font-bold ${config.text}`}>{status.averageFatigue}%</p>
                                </div>
                                <div className="p-2 rounded-lg bg-slate-800/30">
                                    <p className="text-xs text-slate-500">Conectados</p>
                                    <p className="text-lg font-bold text-slate-300">{status.connectedCount}/{status.totalCount}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default GroupEnergySemaphore;
