import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FiAward, FiUsers, FiClock, FiChevronRight, FiCheck, FiZap, FiTrendingUp
} from 'react-icons/fi';
import { GiFire, GiTrophy } from 'react-icons/gi';

import { Challenge, ChallengeProgress, LeaderboardEntry, ChallengeService } from '../../services/ChallengeService';
import { LeagueColors, LeagueTier } from '../../types/SocialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// CHALLENGE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ChallengeCardProps {
    challenge: Challenge;
    progress?: ChallengeProgress;
    onJoin: () => void;
    onViewDetails: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, progress, onJoin, onViewDetails }) => {
    const daysLeft = Math.ceil((challenge.endDate.getTime() - Date.now()) / 86400000);
    const isJoined = !!progress;
    const isUpcoming = challenge.status === 'upcoming';

    // Calculate overall progress percentage
    const overallProgress = progress
        ? challenge.requirements.reduce((acc, req, i) => {
            const p = progress.progress.find(pr => pr.requirementIndex === i);
            return acc + (p ? Math.min(p.current / req.target, 1) : 0);
        }, 0) / challenge.requirements.length * 100
        : 0;

    const typeColors = {
        weekly: 'from-cyan-500 to-blue-600',
        monthly: 'from-purple-500 to-pink-600',
        special: 'from-amber-500 to-orange-600',
        club: 'from-emerald-500 to-teal-600'
    };

    return (
        <motion.div
            className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/30 transition-all shadow-sm dark:shadow-none"
            whileHover={{ scale: 1.01 }}
        >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <div className={`p-2.5 rounded-lg bg-gradient-to-br ${typeColors[challenge.type]}`}>
                    {challenge.type === 'special' ? <GiFire size={20} className="text-white" /> : <FiAward size={20} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{challenge.title}</h4>
                        {isUpcoming && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30">
                                PRÓXIMO
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">{challenge.description}</p>
                </div>
            </div>

            {/* Requirements */}
            <div className="space-y-2 mb-3">
                {challenge.requirements.map((req, i) => {
                    const p = progress?.progress.find(pr => pr.requirementIndex === i);
                    const current = p?.current || 0;
                    const percentage = Math.min((current / req.target) * 100, 100);

                    return (
                        <div key={i} className="flex items-center gap-2">
                            {req.sensorRequired && <FiZap size={12} className="text-cyan-400" />}
                            <div className="flex-1">
                                <div className="flex justify-between text-xs mb-0.5">
                                    <span className="text-slate-600 dark:text-slate-400">{req.type.replace('_', ' ')}</span>
                                    <span className="text-slate-500 dark:text-slate-300">{current}/{req.target} {req.unit}</span>
                                </div>
                                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
                {challenge.rewards.map((reward, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 text-xs dark:border-amber-500/30">
                        {reward.description}
                    </span>
                ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1">
                    <FiUsers size={12} />
                    {challenge.participants}
                </span>
                <span className="flex items-center gap-1">
                    <FiClock size={12} />
                    {isUpcoming ? 'En' : ''} {daysLeft}d
                </span>
                <span className="flex items-center gap-1">
                    <FiCheck size={12} />
                    {challenge.completions}
                </span>
            </div>

            {/* Action Button - Full Width */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                {isJoined ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-white text-xs font-medium dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-1"
                    >
                        Ver detalles
                        <FiChevronRight size={12} />
                    </button>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); onJoin(); }}
                        disabled={isUpcoming}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-bold transition-colors ${isUpcoming
                            ? 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                            : 'bg-cyan-500 text-black hover:bg-cyan-400'
                            }`}
                    >
                        {isUpcoming ? 'Próximamente' : 'Unirse'}
                    </button>
                )}
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// LEADERBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface LeaderboardProps {
    challengeId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ challengeId }) => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoading(true);
            const data = await ChallengeService.getLeaderboard(challengeId, 5);
            setEntries(data);
            setLoading(false);
        };
        loadLeaderboard();
    }, [challengeId]);

    if (loading) {
        return (
            <div className="flex justify-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {entries.map((entry, i) => {
                const leagueConfig = LeagueColors[entry.userLeague];
                const isCurrentUser = entry.userId === 'u-1';

                return (
                    <div
                        key={entry.userId}
                        className={`flex items-center gap-3 p-2 rounded-lg ${isCurrentUser ? 'bg-cyan-50 border border-cyan-200 dark:bg-cyan-500/10 dark:border-cyan-500/30' : 'bg-white border border-slate-200 dark:bg-slate-800/50 dark:border-transparent'
                            }`}
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500 text-black' :
                            i === 1 ? 'bg-slate-300 text-slate-700 dark:bg-slate-400 dark:text-black' :
                                i === 2 ? 'bg-amber-700 text-white' :
                                    'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                            }`}>
                            {entry.rank}
                        </div>
                        <div className={`w-8 h-8 rounded-full overflow-hidden ${leagueConfig.glow}`}>
                            <img src={entry.userAvatar} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className={`font-medium text-sm ${isCurrentUser ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-900 dark:text-white'}`}>
                                {entry.userName}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{entry.score}</span>
                            {entry.isCompleted && <FiCheck className="inline ml-1 text-emerald-500 dark:text-emerald-400" size={12} />}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CHALLENGES SECTION
// ═══════════════════════════════════════════════════════════════════════════

interface ChallengesSectionProps {
    className?: string;
}

const ChallengesSection: React.FC<ChallengesSectionProps> = ({ className = '' }) => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [progress, setProgress] = useState<ChallengeProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
    const [filter, setFilter] = useState<'all' | 'joined' | 'upcoming'>('all');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const [challengesData, progressData] = await Promise.all([
                ChallengeService.getActiveChallenges(),
                ChallengeService.getUserProgress('u-1')
            ]);
            setChallenges(challengesData);
            setProgress(progressData);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleJoin = async (challengeId: string) => {
        await ChallengeService.joinChallenge('u-1', challengeId);
        const newProgress = await ChallengeService.getUserProgress('u-1');
        setProgress(newProgress);
    };

    const filteredChallenges = challenges.filter(c => {
        if (filter === 'joined') return progress.some(p => p.challengeId === c.id);
        if (filter === 'upcoming') return c.status === 'upcoming';
        return true;
    });

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GiTrophy className="text-amber-500 dark:text-amber-400" size={24} />
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Challenges</h3>
                </div>
                <div className="flex gap-1">
                    {(['all', 'joined', 'upcoming'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filter === f
                                ? 'bg-amber-500 text-black'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                }`}
                        >
                            {f === 'all' ? 'Todos' : f === 'joined' ? 'Mis retos' : 'Próximos'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
                </div>
            ) : (
                <>
                    {/* Challenges List - Single Column for Sidebar */}
                    <div className="space-y-4">
                        {filteredChallenges.slice(0, 3).map(challenge => (
                            <ChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                                progress={progress.find(p => p.challengeId === challenge.id)}
                                onJoin={() => handleJoin(challenge.id)}
                                onViewDetails={() => setSelectedChallenge(challenge)}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Challenge Details Modal */}
            {selectedChallenge && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedChallenge(null)}
                >
                    <div
                        className="w-full max-w-lg max-h-[80vh] overflow-y-auto bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-5 border-b border-slate-700">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-amber-500/30">
                                        <GiTrophy className="text-amber-400" size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{selectedChallenge.title}</h2>
                                        <span className="text-xs text-amber-400 font-medium uppercase">
                                            {selectedChallenge.type === 'weekly' ? 'Semanal' :
                                                selectedChallenge.type === 'monthly' ? 'Mensual' :
                                                    selectedChallenge.type === 'special' ? 'Especial' : 'Club'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedChallenge(null)}
                                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-5">
                            {/* Description */}
                            <p className="text-slate-300">{selectedChallenge.description}</p>

                            {/* Time Remaining */}
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800">
                                <FiClock className="text-cyan-400" />
                                <span className="text-slate-300">
                                    {Math.ceil((selectedChallenge.endDate.getTime() - Date.now()) / 86400000)} días restantes
                                </span>
                            </div>

                            {/* Requirements */}
                            <div>
                                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <FiCheck className="text-emerald-400" />
                                    Requisitos
                                </h3>
                                <div className="space-y-3">
                                    {selectedChallenge.requirements.map((req, i) => {
                                        const prog = progress.find(p => p.challengeId === selectedChallenge.id);
                                        const p = prog?.progress.find(pr => pr.requirementIndex === i);
                                        const current = p?.current || 0;
                                        const percentage = Math.min((current / req.target) * 100, 100);

                                        return (
                                            <div key={i} className="p-3 rounded-lg bg-slate-800">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-white flex items-center gap-2">
                                                        {req.sensorRequired && <FiZap size={14} className="text-cyan-400" />}
                                                        {req.type.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-cyan-400 font-medium">{current}/{req.target} {req.unit}</span>
                                                </div>
                                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Rewards */}
                            <div>
                                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <FiAward className="text-amber-400" />
                                    Recompensas
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedChallenge.rewards.map((reward, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-sm border border-amber-500/30">
                                            {reward.description}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Leaderboard */}
                            <div>
                                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <FiTrendingUp className="text-purple-400" />
                                    Leaderboard
                                </h3>
                                <Leaderboard challengeId={selectedChallenge.id} />
                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-around p-3 rounded-lg bg-slate-800 text-center">
                                <div>
                                    <div className="text-xl font-bold text-white">{selectedChallenge.participants}</div>
                                    <div className="text-xs text-slate-400">Participantes</div>
                                </div>
                                <div className="w-px h-8 bg-slate-700" />
                                <div>
                                    <div className="text-xl font-bold text-emerald-400">{selectedChallenge.completions}</div>
                                    <div className="text-xs text-slate-400">Completados</div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 p-4 border-t border-slate-700 bg-slate-900">
                            {progress.some(p => p.challengeId === selectedChallenge.id) ? (
                                <div className="text-center text-emerald-400 font-medium">
                                    ✓ Ya estás participando
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        handleJoin(selectedChallenge.id);
                                        setSelectedChallenge(null);
                                    }}
                                    className="w-full py-3 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors"
                                >
                                    Unirse al Reto
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChallengesSection;
