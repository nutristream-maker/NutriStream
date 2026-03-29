import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiAward, FiClock, FiZap, FiGift } from 'react-icons/fi';
import { Member } from '../../types/ClubTypes';
import { LeaderboardService, FlashChallenge as FlashChallengeType, MetricType } from '../../services/LeaderboardService';

interface FlashChallengeProps {
    members: Member[];
    onAwardPoints?: (memberId: string, points: number) => void;
}

const FlashChallenge: React.FC<FlashChallengeProps> = ({ members, onAwardPoints }) => {
    const [activeChallenge, setActiveChallenge] = useState<FlashChallengeType | null>(null);
    const [remainingTime, setRemainingTime] = useState(0);
    const [showWinner, setShowWinner] = useState(false);

    const challengeTypes = LeaderboardService.getChallengeTypes();

    // Start a challenge
    const startChallenge = useCallback((index: number) => {
        const challenge = LeaderboardService.createFlashChallenge(members, index);
        setActiveChallenge(challenge);
        setShowWinner(false);
    }, [members]);

    // Timer and updates
    useEffect(() => {
        if (!activeChallenge) return;

        const interval = setInterval(() => {
            const remaining = LeaderboardService.getRemainingTime(activeChallenge);
            setRemainingTime(remaining);

            // Update rankings
            const updated = LeaderboardService.updateChallenge(activeChallenge, members);
            setActiveChallenge(updated);

            // Challenge ended
            if (!updated.isActive && updated.winner) {
                setShowWinner(true);
                onAwardPoints?.(updated.winner.memberId, updated.reward);
                // Auto-clear after showing winner
                setTimeout(() => {
                    setActiveChallenge(null);
                    setShowWinner(false);
                }, 5000);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [activeChallenge, members, onAwardPoints]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const metricInfo = activeChallenge
        ? LeaderboardService.getMetricInfo(activeChallenge.metric)
        : null;

    return (
        <div className="space-y-6">
            {/* Challenge Selector (when no active challenge) */}
            <AnimatePresence mode="wait">
                {!activeChallenge && (
                    <motion.div
                        className="p-6 rounded-2xl border border-cyan-500/20 bg-white dark:bg-slate-900/50 backdrop-blur-xl shadow-sm dark:shadow-none"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiZap className="text-amber-500 dark:text-amber-400" />
                            Flash Challenges
                        </h3>
                        <p className="text-sm text-slate-400 mb-6">
                            Lanza una competición relámpago para el grupo. El ganador obtiene NutriPoints.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            {challengeTypes.map((type, idx) => (
                                <motion.button
                                    key={idx}
                                    onClick={() => startChallenge(idx)}
                                    className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 transition-all text-left shadow-sm dark:shadow-none"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">{type.title}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <FiClock size={12} />
                                            {type.duration}s
                                        </span>
                                        <span className="flex items-center gap-1 text-amber-400">
                                            <FiGift size={12} />
                                            {type.reward} NP
                                        </span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Active Challenge */}
                {activeChallenge && !showWinner && (
                    <motion.div
                        className="p-6 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-white dark:from-amber-900/20 dark:to-slate-900/80 backdrop-blur-xl shadow-[0_0_40px_rgba(245,158,11,0.2)]"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    {activeChallenge.title}
                                </h3>
                                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                                    {metricInfo?.icon} {metricInfo?.name}
                                </p>
                            </div>

                            {/* Timer */}
                            <motion.div
                                className="text-3xl font-mono font-black text-amber-400"
                                animate={{ scale: remainingTime <= 10 ? [1, 1.1, 1] : 1 }}
                                transition={{ repeat: remainingTime <= 10 ? Infinity : 0, duration: 0.5 }}
                            >
                                {formatTime(remainingTime)}
                            </motion.div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 bg-slate-800 rounded-full mb-6 overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                                initial={{ width: '100%' }}
                                animate={{ width: `${(remainingTime / activeChallenge.duration) * 100}%` }}
                            />
                        </div>

                        {/* Top 3 */}
                        <div className="space-y-2">
                            {activeChallenge.participants.slice(0, 5).map((p, idx) => (
                                <motion.div
                                    key={p.memberId}
                                    className={`
                                        flex items-center gap-4 p-3 rounded-xl
                                        ${idx === 0 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-100 dark:bg-slate-800/50'}
                                    `}
                                    layout
                                >
                                    <span className={`
                                        w-6 h-6 rounded-full flex items-center justify-center text-sm font-black
                                        ${idx === 0 ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-400'}
                                    `}>
                                        {idx + 1}
                                    </span>
                                    <span className="flex-1 font-bold text-slate-900 dark:text-white">{p.name}</span>
                                    <span className="text-lg font-black text-cyan-600 dark:text-cyan-400">
                                        {LeaderboardService.formatMetric(p.metric, activeChallenge.metric)}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-4 text-center text-xs text-slate-500">
                            Premio: <span className="text-amber-400 font-bold">{activeChallenge.reward} NutriPoints</span>
                        </div>
                    </motion.div>
                )}

                {/* Winner Announcement */}
                {showWinner && activeChallenge?.winner && (
                    <motion.div
                        className="p-8 rounded-2xl border-2 border-amber-500 bg-gradient-to-br from-amber-900/30 to-slate-900/80 backdrop-blur-xl text-center shadow-[0_0_60px_rgba(245,158,11,0.4)]"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                            transition={{ type: 'spring', stiffness: 200 }}
                        >
                            <FiAward className="mx-auto text-6xl text-amber-400 mb-4" />
                        </motion.div>

                        <h2 className="text-2xl font-black text-white mb-2">
                            🎉 ¡GANADOR!
                        </h2>
                        <p className="text-3xl font-black text-amber-400 mb-4">
                            {activeChallenge.winner.name}
                        </p>
                        <p className="text-lg text-cyan-400">
                            {LeaderboardService.formatMetric(activeChallenge.winner.metric, activeChallenge.metric)}
                        </p>
                        <p className="mt-4 text-amber-400 font-bold">
                            +{activeChallenge.reward} NutriPoints
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FlashChallenge;
