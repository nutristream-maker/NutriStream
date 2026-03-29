import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiHash, FiChevronRight, FiAward, FiZap } from 'react-icons/fi';
import { GiFire } from 'react-icons/gi';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface TrendingHashtag {
    tag: string;
    count: number;
    change: 'up' | 'down' | 'stable';
    isChallenge?: boolean;
}

interface TrendingTopicsProps {
    onTagClick?: (tag: string) => void;
    className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_TRENDING: TrendingHashtag[] = [
    { tag: 'NeuralGains', count: 2847, change: 'up', isChallenge: true },
    { tag: 'ProofOfEffort', count: 1923, change: 'up' },
    { tag: 'LegDay', count: 1456, change: 'stable' },
    { tag: 'CardioKing', count: 1234, change: 'up' },
    { tag: 'EliteChallenge', count: 987, change: 'up', isChallenge: true },
    { tag: 'MorningWorkout', count: 876, change: 'down' },
    { tag: 'VO2MaxBeast', count: 765, change: 'up' },
    { tag: 'PádelPro', count: 654, change: 'stable' },
    { tag: 'CrossFitWOD', count: 543, change: 'up' },
    { tag: 'RecoveryDay', count: 432, change: 'stable' }
];

const FEATURED_CHALLENGE = {
    title: 'Reto Neural Battery 100%',
    description: 'Completa 5 entrenamientos esta semana con Neural Battery > 80%',
    participants: 1247,
    daysLeft: 4,
    prize: '500 XP + Badge Exclusivo'
};

// ═══════════════════════════════════════════════════════════════════════════
// TRENDING ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface TrendingItemProps {
    hashtag: TrendingHashtag;
    rank: number;
    onClick: () => void;
}

const TrendingItem: React.FC<TrendingItemProps> = ({ hashtag, rank, onClick }) => {
    const formatCount = (count: number): string => {
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    return (
        <motion.button
            onClick={onClick}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/30 transition-all text-left shadow-sm dark:shadow-none"
            whileHover={{ x: 4 }}
        >
            <div className="w-6 text-center font-bold text-slate-500 text-sm">
                {rank}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    {hashtag.isChallenge && (
                        <FiAward size={12} className="text-amber-400" />
                    )}
                    <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        #{hashtag.tag}
                    </span>
                </div>
                <p className="text-xs text-slate-500">{formatCount(hashtag.count)} posts</p>
            </div>

            <div className={`text-xs font-bold ${hashtag.change === 'up' ? 'text-emerald-400' :
                hashtag.change === 'down' ? 'text-red-400' : 'text-slate-500'
                }`}>
                {hashtag.change === 'up' && '↑'}
                {hashtag.change === 'down' && '↓'}
                {hashtag.change === 'stable' && '−'}
            </div>
        </motion.button>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const TrendingTopics: React.FC<TrendingTopicsProps> = ({ onTagClick, className = '' }) => {
    const [showAll, setShowAll] = useState(false);
    const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h');

    const displayedTags = showAll ? MOCK_TRENDING : MOCK_TRENDING.slice(0, 5);

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FiTrendingUp className="text-cyan-400" size={20} />
                    <h3 className="font-bold text-slate-900 dark:text-white">Trending</h3>
                </div>

                <div className="flex gap-1">
                    {(['24h', '7d'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${timeRange === range
                                ? 'bg-cyan-500 text-black'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Featured Challenge */}
            <motion.div
                className="p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-transparent dark:bg-gradient-to-r dark:from-amber-900/30 dark:to-orange-900/30 dark:border-amber-500/30"
                whileHover={{ scale: 1.01 }}
            >
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                        <GiFire size={24} className="text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{FEATURED_CHALLENGE.title}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black">
                                HOT
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{FEATURED_CHALLENGE.description}</p>
                        <div className="flex items-center gap-4 text-xs">
                            <span className="text-amber-400">🏆 {FEATURED_CHALLENGE.prize}</span>
                            <span className="text-slate-500">{FEATURED_CHALLENGE.participants} participando</span>
                            <span className="text-red-400">{FEATURED_CHALLENGE.daysLeft} días</span>
                        </div>
                    </div>
                    <FiChevronRight className="text-slate-500" />
                </div>
            </motion.div>

            {/* Trending List */}
            <div className="space-y-2">
                {displayedTags.map((hashtag, index) => (
                    <TrendingItem
                        key={hashtag.tag}
                        hashtag={hashtag}
                        rank={index + 1}
                        onClick={() => onTagClick?.(hashtag.tag)}
                    />
                ))}
            </div>

            {/* Show More */}
            {!showAll && MOCK_TRENDING.length > 5 && (
                <button
                    onClick={() => setShowAll(true)}
                    className="w-full py-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                    Ver más tendencias
                </button>
            )}
        </div>
    );
};

export default TrendingTopics;
