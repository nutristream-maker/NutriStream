import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useGamification } from '../../hooks/useGamification';
import { LEAGUE_THRESHOLDS } from '../../data/gamificationConfig';
import { League } from '../../types/GamificationTypes';
import {
    BadgeGradients, BronzeBadge, SilverBadge, GoldBadge,
    PlatinumBadge, DiamondBadge, EliteBadge
} from './LeagueIcons';

interface LevelBadgeProps {
    onClick?: () => void;
}

const LevelBadge: React.FC<LevelBadgeProps> = ({ onClick }) => {
    const { t } = useLanguage();
    const {
        userLevel,
        currentLeague,
        progressPercentage,
        currentStreak
    } = useGamification();

    const leagueData = LEAGUE_THRESHOLDS.find(l => l.league === currentLeague);

    const LeagueIconComponent = {
        [League.BRONZE]: BronzeBadge,
        [League.SILVER]: SilverBadge,
        [League.GOLD]: GoldBadge,
        [League.PLATINUM]: PlatinumBadge,
        [League.DIAMOND]: DiamondBadge,
        [League.ELITE]: EliteBadge
    }[currentLeague];

    // Compact dimensions
    const radius = 14;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

    return (
        <motion.button
            onClick={onClick}
            className="relative group mr-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={`${t('nivel')} ${userLevel} • ${t(`liga_${currentLeague.toLowerCase()}`)}`}
        >
            {/* Inject Gradients (idempotent if rendered multiple times, IDs match) */}
            <BadgeGradients />

            {/* Background Glow on Hover */}
            <div
                className="absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300"
                style={{ background: leagueData?.gradient || '#4f46e5' }}
            />

            {/* Main Circle Container */}
            <div className="relative w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 group-hover:border-transparent transition-colors">

                {/* XP Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 p-0.5">
                    <circle
                        cx="50%" cy="50%" r={radius}
                        strokeWidth="2.5"
                        stroke="currentColor"
                        className="text-slate-200 dark:text-slate-700"
                        fill="none"
                    />
                    <motion.circle
                        cx="50%" cy="50%" r={radius}
                        strokeWidth="2.5"
                        stroke="currentColor"
                        className="text-indigo-500 dark:text-indigo-400"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{ strokeDasharray: circumference }}
                    />
                </svg>

                {/* Level Number */}
                <span className="text-xs font-black text-slate-700 dark:text-slate-200 z-10">
                    {userLevel}
                </span>

                {/* League Badge Icon (Bottom Right Overlap) */}
                <div className="absolute -bottom-1.5 -right-1.5 z-20 drop-shadow-md transform scale-90">
                    <LeagueIconComponent size={18} />
                </div>
            </div>

            {/* Streak Indicator (Top Right Dot if active) */}
            {currentStreak > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center z-20">
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                </div>
            )}
        </motion.button>
    );
};

export default LevelBadge;
