import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiChevronRight, FiUsers, FiClock, FiPlus, FiTrendingUp } from 'react-icons/fi';

import { Card, Button } from '../ui/Shared';
import {
    getMockChallenges,
    getTimeRemaining,
    DashboardChallenge,
    CHALLENGE_TYPES
} from '../../services/ChallengeService';

interface ChallengeCardProps {
    onCreateChallenge?: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ onCreateChallenge }) => {
    const [challenges] = useState<DashboardChallenge[]>(getMockChallenges());
    const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedChallenge(prev => prev === id ? null : id);
    };

    return (
        <Card className="!p-0 overflow-hidden">
            {/* Header */}
            <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                        <FiAward size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Desafíos Activos</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {challenges.length} {challenges.length === 1 ? 'desafío' : 'desafíos'} en curso
                        </p>
                    </div>
                </div>
                {onCreateChallenge && (
                    <Button
                        variant="secondary"
                        className="!py-2 !px-3"
                        icon={FiPlus}
                        onClick={onCreateChallenge}
                    >
                        <span className="hidden sm:inline">Nuevo</span>
                    </Button>
                )}
            </div>

            {/* Challenges List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {challenges.map((challenge) => {
                    const config = CHALLENGE_TYPES[challenge.type];
                    const isExpanded = expandedChallenge === challenge.id;
                    const currentUser = challenge.participants.find(p => p.id === 'user_1');
                    const opponent = challenge.participants.find(p => p.id !== 'user_1');
                    const isWinning = currentUser && opponent && currentUser.currentValue > opponent.currentValue;

                    return (
                        <div key={challenge.id}>
                            {/* Challenge Summary */}
                            <motion.div
                                className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                onClick={() => toggleExpand(challenge.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{config.icon}</span>
                                        <div>
                                            <p className="font-semibold">{challenge.title}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                <FiClock size={12} /> {getTimeRemaining(challenge)}
                                                <span className="mx-1">•</span>
                                                <FiUsers size={12} /> {challenge.participants.length} participantes
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Position indicator */}
                                        {currentUser && (
                                            <div className={`text-right ${isWinning ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                <p className="font-bold text-lg">
                                                    {isWinning ? '🥇' : '🥈'}
                                                </p>
                                            </div>
                                        )}
                                        <motion.div
                                            animate={{ rotate: isExpanded ? 90 : 0 }}
                                            className="text-slate-400"
                                        >
                                            <FiChevronRight size={18} />
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Progress bars */}
                                <div className="mt-3 space-y-2">
                                    {challenge.participants.map((participant, idx) => (
                                        <div key={participant.id} className="flex items-center gap-2">
                                            <span className="text-xs w-16 truncate font-medium">
                                                {participant.name}
                                            </span>
                                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${participant.progress}%` }}
                                                    transition={{ duration: 0.8 }}
                                                    className={`h-full rounded-full ${idx === 0
                                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                                        : 'bg-slate-400'
                                                        }`}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-500 w-16 text-right">
                                                {participant.currentValue.toLocaleString()} {challenge.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden bg-slate-50 dark:bg-slate-800/30"
                                    >
                                        <div className="p-4 space-y-4">
                                            {/* Goal progress */}
                                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
                                                <FiTrendingUp className="text-indigo-500" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">Meta: {challenge.goal.toLocaleString()} {challenge.unit}</p>
                                                    <p className="text-xs text-slate-500">{config.description}</p>
                                                </div>
                                            </div>

                                            {/* Reward */}
                                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg">
                                                <span className="text-xl">🏆</span>
                                                <div>
                                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                                        Premio: {challenge.reward.xp} XP
                                                    </p>
                                                    {challenge.reward.badge && (
                                                        <p className="text-xs text-amber-600 dark:text-amber-400">
                                                            + Insignia "{challenge.reward.badge}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Button variant="secondary" className="flex-1 !py-2">
                                                    Ver Detalles
                                                </Button>
                                                <Button className="flex-1 !py-2" icon={FiTrendingUp}>
                                                    Actualizar Progreso
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {challenges.length === 0 && (
                <div className="p-8 text-center">
                    <div className="text-4xl mb-3">🎯</div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                        No tienes desafíos activos
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                        ¡Reta a un amigo y compite!
                    </p>
                    {onCreateChallenge && (
                        <Button
                            className="mt-4"
                            icon={FiPlus}
                            onClick={onCreateChallenge}
                        >
                            Crear Desafío
                        </Button>
                    )}
                </div>
            )}
        </Card>
    );
};

export default ChallengeCard;
