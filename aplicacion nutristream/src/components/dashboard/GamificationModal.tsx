import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiX, FiAward, FiTrendingUp, FiGift, FiTarget,
    FiCalendar, FiActivity, FiHeart, FiZap
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { useGamification } from '../../hooks/useGamification';
import { LEVELS, LEAGUE_THRESHOLDS } from '../../data/gamificationConfig';
import { League, RewardType, XPAxis } from '../../types/GamificationTypes';
import {
    BadgeGradients, BronzeBadge, SilverBadge, GoldBadge,
    PlatinumBadge, DiamondBadge, EliteBadge
} from './LeagueIcons';

interface GamificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'progress' | 'levels' | 'rewards';

const GamificationModal: React.FC<GamificationModalProps> = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const {
        userLevel,
        currentLeague,
        totalXP,
        xpBreakdown,
        unlockedRewards,
        unclaimedRewards,
        currentStreak,
        longestStreak,
        claimReward
    } = useGamification();

    const [activeTab, setActiveTab] = useState<TabType>('progress');

    // League icons
    // League Icon Component Helper
    const getLeagueIcon = (league: League, size: number = 24) => {
        const Component = {
            [League.BRONZE]: BronzeBadge,
            [League.SILVER]: SilverBadge,
            [League.GOLD]: GoldBadge,
            [League.PLATINUM]: PlatinumBadge,
            [League.DIAMOND]: DiamondBadge,
            [League.ELITE]: EliteBadge
        }[league];
        return <Component size={size} />;
    };

    // XP Axis icons
    const axisIcons: Record<XPAxis, React.ReactNode> = {
        [XPAxis.SUBSCRIPTION]: <FiCalendar />,
        [XPAxis.PERFORMANCE]: <FiActivity />,
        [XPAxis.BIOMETRICS]: <FiHeart />,
        [XPAxis.CONSISTENCY]: <FiZap />
    };

    // Calculate XP percentages for breakdown
    const xpBreakdownData = Object.entries(xpBreakdown).map(([axis, xp]) => ({
        axis: axis as XPAxis,
        xp: xp as number,
        percentage: totalXP > 0 ? ((xp as number) / totalXP) * 100 : 0
    }));

    const renderProgressTab = () => (
        <div className="space-y-6">
            {/* XP Breakdown */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <FiTarget />
                    {t('desglose_xp')}
                </h3>
                <div className="space-y-3">
                    {xpBreakdownData.map(({ axis, xp, percentage }) => (
                        <div key={axis} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <span className="text-indigo-600 dark:text-indigo-400">
                                        {axisIcons[axis]}
                                    </span>
                                    <span className="font-semibold">{t(`axis_${axis}`)}</span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {xp.toLocaleString()} NP
                                </span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                />
                            </div>
                            <div className="text-right text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {percentage.toFixed(1)}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Streak Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-xl text-white">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <FiZap size={18} />
                        <span className="text-sm font-semibold uppercase tracking-wide">
                            {t('rachaActual')}
                        </span>
                    </div>
                    <div className="text-4xl font-black">{currentStreak}</div>
                    <div className="text-sm opacity-90 mt-1">{t('dias')}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-6 rounded-xl text-white">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <FiTrendingUp size={18} />
                        <span className="text-sm font-semibold uppercase tracking-wide">
                            {t('mejorRacha')}
                        </span>
                    </div>
                    <div className="text-4xl font-black">{longestStreak}</div>
                    <div className="text-sm opacity-90 mt-1">{t('dias')}</div>
                </div>
            </div>
        </div>
    );

    const renderLevelsTab = () => (
        <div className="space-y-6">
            {LEAGUE_THRESHOLDS.map((league) => {
                const levelsInLeague = LEVELS.filter(
                    l => l.level >= league.minLevel && l.level <= league.maxLevel
                );

                return (
                    <div key={league.league} className="space-y-2">
                        {/* League Header */}
                        <div
                            className="p-4 rounded-xl text-white font-bold flex items-center gap-3"
                            style={{ background: league.gradient }}
                        >
                            <div className="flex-shrink-0">{getLeagueIcon(league.league, 32)}</div>
                            <div>
                                <div className="text-xl">{t(`liga_${league.league.toLowerCase()}`)}</div>
                                <div className="text-sm opacity-90">
                                    {t('niveles')} {league.minLevel} - {league.maxLevel}
                                </div>
                            </div>
                        </div>

                        {/* Levels in this league */}
                        <div className="space-y-2 ml-4">
                            {levelsInLeague.map((levelData) => {
                                const isUnlocked = userLevel >= levelData.level;
                                const isCurrent = userLevel === levelData.level;

                                return (
                                    <motion.div
                                        key={levelData.level}
                                        className={`p-4 rounded-lg border-2 ${isCurrent
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500'
                                            : isUnlocked
                                                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60'
                                            }`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: levelData.level * 0.02 }}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${isCurrent
                                                    ? 'bg-indigo-500 text-white'
                                                    : isUnlocked
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                    }`}>
                                                    {levelData.level}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-white">
                                                        {t('nivel')} {levelData.level}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        {levelData.xpRequired.toLocaleString()} NP {t('total')}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rewards */}
                                            {levelData.rewards.length > 0 || levelData.hasMysteryReward ? (
                                                <div className="flex items-center gap-2 pl-12 sm:pl-0">
                                                    {levelData.hasMysteryReward && (
                                                        <div className="text-xl" title={t('recompensaMisteriosa')}>
                                                            🎁
                                                        </div>
                                                    )}
                                                    {levelData.rewards.map((reward, idx) => (
                                                        !reward.isMystery && (
                                                            <div
                                                                key={idx}
                                                                className={`text-xl ${!isUnlocked && 'blur-sm'}`}
                                                                title={isUnlocked ? t(reward.titleKey) : '???'}
                                                            >
                                                                {reward.icon}
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderRewardsTab = () => {
        // Color coding by reward type
        const rewardTypeStyles: Record<RewardType, { bg: string; border: string; glow: string; icon: string }> = {
            [RewardType.DIGITAL]: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-700', glow: 'shadow-indigo-500/20', icon: '🎨' },
            [RewardType.ECONOMIC]: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-700', glow: 'shadow-emerald-500/20', icon: '💰' },
            [RewardType.PHYSICAL]: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-700', glow: 'shadow-amber-500/20', icon: '📦' },
            [RewardType.PREMIUM]: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-700', glow: 'shadow-purple-500/20', icon: '⭐' },
            [RewardType.MYSTERY]: { bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-700', glow: 'shadow-rose-500/20', icon: '🎁' }
        };

        const rewardsByType = {
            [RewardType.DIGITAL]: unlockedRewards.filter(r => r.type === RewardType.DIGITAL && !r.isMystery),
            [RewardType.ECONOMIC]: unlockedRewards.filter(r => r.type === RewardType.ECONOMIC && !r.isMystery),
            [RewardType.PHYSICAL]: unlockedRewards.filter(r => r.type === RewardType.PHYSICAL && !r.isMystery),
            [RewardType.PREMIUM]: unlockedRewards.filter(r => r.type === RewardType.PREMIUM && !r.isMystery),
            [RewardType.MYSTERY]: unlockedRewards.filter(r => r.type === RewardType.MYSTERY || r.isMystery)
        };

        const typeLabels: Record<RewardType, string> = {
            [RewardType.DIGITAL]: '🎨 Digital',
            [RewardType.ECONOMIC]: '💰 Económico',
            [RewardType.PHYSICAL]: '📦 Físico',
            [RewardType.PREMIUM]: '⭐ Premium',
            [RewardType.MYSTERY]: '🎁 Misterio'
        };

        return (
            <div className="space-y-8">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-xl text-white text-center">
                        <div className="text-3xl font-black">{unlockedRewards.length}</div>
                        <div className="text-xs uppercase tracking-wide opacity-90 mt-1">Total</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-xl text-white text-center">
                        <div className="text-3xl font-black">{unlockedRewards.filter(r => r.claimed).length}</div>
                        <div className="text-xs uppercase tracking-wide opacity-90 mt-1">{t('canjeada')}s</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-xl text-white text-center">
                        <div className="text-3xl font-black">{unclaimedRewards.length}</div>
                        <div className="text-xs uppercase tracking-wide opacity-90 mt-1">Pendientes</div>
                    </div>
                    <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-4 rounded-xl text-white text-center">
                        <div className="text-3xl font-black">{unlockedRewards.filter(r => r.isMystery).length}</div>
                        <div className="text-xs uppercase tracking-wide opacity-90 mt-1">Misterio</div>
                    </div>
                </div>

                {/* Rewards by Type */}
                {Object.entries(rewardsByType).map(([type, rewards]) => {
                    if (rewards.length === 0) return null;
                    const styles = rewardTypeStyles[type as RewardType];

                    return (
                        <div key={type}>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span>{typeLabels[type as RewardType]}</span>
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                    {rewards.length}
                                </span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {rewards.map((reward, idx) => (
                                    <motion.div
                                        key={reward.id}
                                        className={`relative p-5 rounded-2xl border-2 ${styles.bg} ${styles.border} ${!reward.claimed ? `shadow-lg ${styles.glow}` : 'opacity-70'} transition-all`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ scale: reward.claimed ? 1 : 1.02, y: reward.claimed ? 0 : -4 }}
                                    >
                                        {/* Unclaimed badge */}
                                        {!reward.claimed && (
                                            <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg animate-pulse">
                                                NUEVO
                                            </div>
                                        )}

                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${reward.claimed ? 'bg-slate-200 dark:bg-slate-700' : 'bg-white dark:bg-slate-800'} shadow-inner border border-slate-200 dark:border-slate-600`}>
                                                    {reward.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-slate-900 dark:text-white text-base">
                                                        {t(reward.titleKey)}
                                                    </div>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                                        {t(reward.descriptionKey)}
                                                    </div>
                                                    {reward.value && (
                                                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
                                                            {reward.type === RewardType.ECONOMIC ? `${reward.value}% Descuento` : `x${reward.value}`}
                                                        </div>
                                                    )}
                                                    {reward.claimed && (
                                                        <div className="mt-3 inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                                            <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px]">✓</span>
                                                            {t('canjeada')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {!reward.claimed && (
                                                <button
                                                    onClick={() => claimReward(reward.id)}
                                                    className="shrink-0 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                                >
                                                    {t('canjear')}
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {unlockedRewards.length === 0 && (
                    <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <FiGift size={40} className="opacity-40" />
                        </div>
                        <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{t('sinRecompensas')}</p>
                        <p className="text-sm mt-3 opacity-80">{t('sigueProgresando')}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative">
                            <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden"><BadgeGradients /></div>
                            {/* Header */}
                            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                <div>
                                    <h2 className="text-2xl font-black">{t('miProgreso')}</h2>
                                    <p className="text-sm opacity-90 mt-1">
                                        {t('nivel')} {userLevel} • {t(`liga_${currentLeague.toLowerCase()}`)} • {totalXP.toLocaleString()} NP
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                {[
                                    { key: 'progress' as TabType, icon: FiTrendingUp, label: t('progreso') },
                                    { key: 'levels' as TabType, icon: FiTarget, label: t('niveles') },
                                    { key: 'rewards' as TabType, icon: FiAward, label: t('recompensas') }
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex-1 py-3 px-1 sm:py-4 sm:px-6 font-semibold flex items-center justify-center gap-1 sm:gap-2 transition-colors text-xs sm:text-base ${activeTab === tab.key
                                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                        <span>{tab.label}</span>
                                        {tab.key === 'rewards' && unclaimedRewards.length > 0 && (
                                            <span className="ml-1 px-1.5 py-0.5 sm:px-2 bg-red-500 text-white text-[10px] sm:text-xs rounded-full">
                                                {unclaimedRewards.length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {activeTab === 'progress' && renderProgressTab()}
                                {activeTab === 'levels' && renderLevelsTab()}
                                {activeTab === 'rewards' && renderRewardsTab()}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default GamificationModal;
