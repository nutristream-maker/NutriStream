import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiAward, FiRefreshCw } from 'react-icons/fi';
import { Member } from '../../types/ClubTypes';
import { LeaderboardService, LeaderboardEntry, MetricType } from '../../services/LeaderboardService';

interface LiveLeaderboardProps {
    members: Member[];
    metric?: MetricType;
    refreshInterval?: number;
    showTop?: number;
}

const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({
    members,
    metric = 'watts',
    refreshInterval = 3000,
    showTop = 10
}) => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [isLive, setIsLive] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const metricInfo = LeaderboardService.getMetricInfo(metric as MetricType);

    useEffect(() => {
        // Initial load
        setEntries(LeaderboardService.generateLeaderboard(members, metric as MetricType));

        if (!isLive) return;

        // Simulated real-time updates
        const interval = setInterval(() => {
            setEntries(prev => {
                const newEntries = LeaderboardService.generateLeaderboard(members, metric as MetricType);
                // Preserve previous ranks
                newEntries.forEach(e => {
                    const old = prev.find(p => p.memberId === e.memberId);
                    e.previousRank = old?.rank;
                    e.delta = old ? (old.rank - e.rank) : 0;
                });
                return newEntries;
            });
            setLastUpdate(new Date());
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [members, metric, refreshInterval, isLive]);

    const getRankChange = (entry: LeaderboardEntry) => {
        if (!entry.previousRank || entry.previousRank === entry.rank) {
            return { icon: FiMinus, color: 'text-slate-500', text: '' };
        }
        if (entry.previousRank > entry.rank) {
            return { icon: FiTrendingUp, color: 'text-emerald-400', text: `+${entry.previousRank - entry.rank}` };
        }
        return { icon: FiTrendingDown, color: 'text-red-400', text: `${entry.previousRank - entry.rank}` };
    };

    const getRankStyle = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black';
        if (rank === 2) return 'bg-gradient-to-r from-slate-400 to-slate-300 text-black';
        if (rank === 3) return 'bg-gradient-to-r from-amber-700 to-amber-600 text-white';
        return 'bg-slate-700 text-slate-300';
    };

    return (
        <div className="p-6 rounded-2xl border border-cyan-500/20 bg-white dark:bg-slate-900/50 backdrop-blur-xl shadow-sm dark:shadow-none">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FiAward className="text-amber-500 dark:text-amber-400" />
                        Leaderboard en Vivo
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        {metricInfo.icon} {metricInfo.name}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Live indicator */}
                    <motion.div
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold
                            ${isLive
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }
                        `}
                        animate={isLive ? { opacity: [1, 0.5, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        {isLive ? 'EN VIVO' : 'PAUSADO'}
                    </motion.div>

                    <button
                        onClick={() => setIsLive(!isLive)}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white transition-colors"
                    >
                        <FiRefreshCw size={16} className={isLive ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Leaderboard */}
            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {entries.slice(0, showTop).map((entry, idx) => {
                        const change = getRankChange(entry);
                        const ChangeIcon = change.icon;

                        return (
                            <motion.div
                                key={entry.memberId}
                                className={`
                                    flex items-center gap-4 p-3 rounded-xl
                                    ${entry.rank <= 3 ? 'bg-gradient-to-r from-slate-100/80 to-slate-100/40 dark:from-slate-800/80 dark:to-slate-800/40' : 'bg-slate-50 dark:bg-slate-800/30'}
                                    border border-slate-200 dark:border-white/5
                                `}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: idx * 0.02 }}
                            >
                                {/* Rank */}
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center
                                    text-sm font-black ${getRankStyle(entry.rank)}
                                `}>
                                    {entry.rank}
                                </div>

                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                    {entry.name.split(' ').map(n => n[0]).join('')}
                                </div>

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{entry.name}</p>
                                    <div className={`flex items-center gap-1 text-xs ${change.color}`}>
                                        <ChangeIcon size={12} />
                                        {change.text && <span>{change.text}</span>}
                                    </div>
                                </div>

                                {/* Metric */}
                                <motion.div
                                    className="text-right"
                                    key={entry.metric}
                                    initial={{ scale: 1.1 }}
                                    animate={{ scale: 1 }}
                                >
                                    <p className="text-lg font-black text-cyan-600 dark:text-cyan-400">
                                        {LeaderboardService.formatMetric(entry.metric, metric as MetricType)}
                                    </p>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <p className="text-[10px] text-slate-600 mt-4 text-right">
                Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
            </p>
        </div>
    );
};

export default LiveLeaderboard;
