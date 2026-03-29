import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiChevronRight, FiZap } from 'react-icons/fi';
import { Card } from '../ui/Shared';
import { useLanguage } from '../../context/LanguageContext';
import { useGamification } from '../../hooks/useGamification';
import { LEAGUE_THRESHOLDS } from '../../data/gamificationConfig';
import { League } from '../../types/GamificationTypes';

interface GamificationCardProps {
    onOpenDetails?: () => void;
}

const GamificationCard: React.FC<GamificationCardProps> = ({ onOpenDetails }) => {
    const { t } = useLanguage();
    const {
        userLevel,
        currentLeague,
        totalXP,
        progressPercentage,
        xpInCurrentLevel,
        xpToNextLevel,
        currentStreak,
        getNextReward
    } = useGamification();

    const nextReward = getNextReward();
    const leagueData = LEAGUE_THRESHOLDS.find(l => l.league === currentLeague);

    // Compact League styling
    const leagueConfig: Record<League, { icon: string; glow: string }> = {
        [League.BRONZE]: { icon: '🥉', glow: 'shadow-[0_0_30px_rgba(205,127,50,0.25)]' },
        [League.SILVER]: { icon: '🥈', glow: 'shadow-[0_0_30px_rgba(192,192,192,0.25)]' },
        [League.GOLD]: { icon: '🥇', glow: 'shadow-[0_0_30px_rgba(255,215,0,0.3)]' },
        [League.PLATINUM]: { icon: '⚪', glow: 'shadow-[0_0_30px_rgba(229,228,226,0.3)]' },
        [League.DIAMOND]: { icon: '💎', glow: 'shadow-[0_0_40px_rgba(100,200,255,0.4)]' },
        [League.ELITE]: { icon: '👑', glow: 'shadow-[0_0_40px_rgba(155,89,182,0.4)]' }
    };

    const config = leagueConfig[currentLeague];

    // Circular progress calculation
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

    return (
        <Card className="!p-0 overflow-hidden relative">
            <div
                className={`relative w-full ${config.glow}`}
                style={{ background: leagueData?.gradient || 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
            >
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />

                {/* Decorative orb */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 p-5">
                    {/* Header: Badge + Level + Streak */}
                    <div className="flex items-center justify-between mb-4">
                        {/* Left: Ring + Level */}
                        <div className="flex items-center gap-4">
                            {/* Compact Circular XP Ring */}
                            <div className="relative w-20 h-20">
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="40" cy="40" r={radius} strokeWidth="5" stroke="rgba(255,255,255,0.2)" fill="none" />
                                    <motion.circle
                                        cx="40" cy="40" r={radius}
                                        strokeWidth="5"
                                        stroke="white"
                                        fill="none"
                                        strokeLinecap="round"
                                        initial={{ strokeDashoffset: circumference }}
                                        animate={{ strokeDashoffset }}
                                        transition={{ duration: 1.2, ease: 'easeOut' }}
                                        style={{ strokeDasharray: circumference }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                                    {config.icon}
                                </div>
                            </div>

                            {/* Level info */}
                            <div className="text-white">
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-[10px] font-semibold uppercase tracking-widest opacity-70">{t('nivel')}</span>
                                    <motion.span
                                        className="text-3xl font-black"
                                        key={userLevel}
                                        initial={{ scale: 1.2, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                    >
                                        {userLevel}
                                    </motion.span>
                                </div>
                                <div className="text-sm font-bold opacity-90">{t(`liga_${currentLeague.toLowerCase()}`)}</div>
                                <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                                    <FiTrendingUp size={11} />
                                    <span className="font-mono">{totalXP.toLocaleString()} NP</span>
                                </div>
                            </div>
                        </div>

                        {/* Streak Badge */}
                        {currentStreak > 0 && (
                            <motion.div
                                className="bg-white/15 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/15"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                            >
                                <div className="text-center text-white">
                                    <div className="flex items-center gap-1">
                                        <FiZap className="text-amber-300" size={14} />
                                        <span className="text-xl font-black">{currentStreak}</span>
                                    </div>
                                    <div className="text-[9px] uppercase tracking-wide opacity-70">{t('diasRacha')}</div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between items-baseline text-white text-xs mb-1.5">
                            <span className="opacity-80">{t('progresoNivel')} {userLevel + 1}</span>
                            <span className="font-mono font-bold text-[10px]">{xpInCurrentLevel.toLocaleString()} / {xpToNextLevel.toLocaleString()}</span>
                        </div>
                        <div className="relative h-2 bg-white/15 rounded-full overflow-hidden border border-white/10">
                            <motion.div
                                className="h-full bg-white rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </div>
                    </div>

                    {/* Next Reward (compact) */}
                    {nextReward && (
                        <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 mb-4 border border-white/10">
                            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-lg">
                                {nextReward.isMystery ? '🎁' : nextReward.rewards[0]?.icon || '🏆'}
                            </div>
                            <div className="flex-1 text-white min-w-0">
                                <p className="text-[10px] uppercase tracking-wide opacity-60 font-semibold">{t('proximaRecompensa')}</p>
                                <p className="font-bold text-xs truncate">
                                    {nextReward.isMystery ? t('recompensaMisteriosa') : t(nextReward.rewards[0]?.titleKey || 'reward_unknown')}
                                </p>
                            </div>
                            <span className="text-white/50 text-xs">Nv.{nextReward.level}</span>
                        </div>
                    )}

                    {/* View Details Button */}
                    <motion.button
                        onClick={onOpenDetails}
                        className="w-full bg-white text-slate-900 py-2.5 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-white/90 transition-all shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {t('verDetallesProgreso')}
                        <FiChevronRight size={16} />
                    </motion.button>
                </div>
            </div>
        </Card>
    );
};

export default GamificationCard;
