import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiZap, FiMessageCircle, FiShare2, FiPlus, FiFilter,
    FiClock, FiActivity, FiHeart, FiAward, FiRadio, FiCheck, FiUser
} from 'react-icons/fi';
import { GiMuscleUp, GiRunningShoe, GiGasMask, GiTennisRacket, GiFire } from 'react-icons/gi';
import { HiOutlineSparkles } from 'react-icons/hi';

import { Card } from '../ui/Shared';
import { Club, Member } from '../../types/ClubTypes';
import NexusService from '../../services/NexusService';
import {
    Post,
    LeagueColors,
    SensorDeviceType,
    Endorsement
} from '../../types/SocialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// DEVICE ICONS
// ═══════════════════════════════════════════════════════════════════════════

const deviceIcons: Record<SensorDeviceType, React.ReactNode> = {
    'neural-skin': <GiMuscleUp size={14} />,
    'groundtruth': <GiRunningShoe size={14} />,
    'aerolung': <GiGasMask size={14} />,
    'aerovision': <HiOutlineSparkles size={14} />,
    'racket': <GiTennisRacket size={14} />
};

// ═══════════════════════════════════════════════════════════════════════════
// MEMBER ACTIVITY CARD
// ═══════════════════════════════════════════════════════════════════════════

interface MemberActivityCardProps {
    member: Member;
    onClick: () => void;
}

const MemberActivityCard: React.FC<MemberActivityCardProps> = ({ member, onClick }) => {
    const isLive = member.neuralPodConnected;

    return (
        <motion.div
            className={`p-3 rounded-xl border transition-all cursor-pointer ${isLive
                    ? 'bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-500/30'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/30'
                }`}
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
        >
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 flex items-center justify-center text-white font-bold">
                        {member.name.charAt(0)}
                    </div>
                    {isLive && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse border border-slate-900" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{member.name}</p>
                    <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-12 rounded-full ${member.neuralBattery > 70 ? 'bg-emerald-500' :
                                member.neuralBattery > 40 ? 'bg-amber-500' : 'bg-red-500'
                            }`} style={{ width: `${member.neuralBattery * 0.5}px` }} />
                        <span className="text-xs text-slate-400">{member.neuralBattery}%</span>
                    </div>
                </div>

                {isLive && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white">
                        LIVE
                    </span>
                )}
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// POST MINI CARD
// ═══════════════════════════════════════════════════════════════════════════

const PostMiniCard: React.FC<{ post: Post }> = ({ post }) => {
    const leagueConfig = LeagueColors[post.authorLeague];

    const timeAgo = (date: Date): string => {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return 'ahora';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
    };

    return (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg overflow-hidden ${leagueConfig.glow}`}>
                    {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${leagueConfig.gradient} flex items-center justify-center text-white font-bold`}>
                            {post.authorName.charAt(0)}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{post.authorName}</span>
                        {post.type === 'group-report' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400">
                                GRUPO
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500">{timeAgo(post.createdAt)}</p>
                </div>
            </div>

            {/* Content */}
            <p className="text-sm text-slate-300 line-clamp-2 mb-3">{post.content}</p>

            {/* Sensor Proof Badge */}
            {post.hasSensorProof && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 mb-2">
                    <FiCheck size={12} />
                    <span className="font-medium">Proof of Effort</span>
                    {post.sensorProof && <span className="text-cyan-400">{deviceIcons[post.sensorProof.deviceType]}</span>}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-2 border-t border-slate-700/50 text-slate-500">
                <button className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                    <FiZap size={14} />
                    <span className="text-xs">{post.endorsementCount}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                    <FiMessageCircle size={14} />
                    <span className="text-xs">{post.commentCount}</span>
                </button>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ClubNexusFeedProps {
    club: Club;
    isTrainer?: boolean;
}

const ClubNexusFeed: React.FC<ClubNexusFeedProps> = ({ club, isTrainer = false }) => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'highlights' | 'reports'>('all');

    // Load club posts
    useEffect(() => {
        const loadPosts = async () => {
            setLoading(true);
            try {
                const response = await NexusService.getFeed({
                    limit: 20,
                    filter: 'club',
                    clubId: club.id
                });
                setPosts(response.posts);
            } catch (error) {
                console.error('Error loading club posts:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPosts();
    }, [club.id]);

    // Get live members
    const liveMembers = club.members.filter(m => m.neuralPodConnected);

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <FiRadio className="text-cyan-400" />
                        Club Nexus
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Actividad del club en tiempo real</p>
                </div>

                {isTrainer && (
                    <motion.button
                        className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FiPlus size={16} />
                        Publicar
                    </motion.button>
                )}
            </div>

            {/* LIVE MEMBERS */}
            {liveMembers.length > 0 && (
                <Card className="!p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            {liveMembers.length} Miembros EN VIVO
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {liveMembers.slice(0, 8).map(member => (
                            <MemberActivityCard
                                key={member.id}
                                member={member}
                                onClick={() => navigate(`/profile/${member.name.toLowerCase().replace(' ', '_')}`)}
                            />
                        ))}
                    </div>

                    {liveMembers.length > 8 && (
                        <button className="w-full mt-3 py-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                            Ver todos ({liveMembers.length})
                        </button>
                    )}
                </Card>
            )}

            {/* FILTER TABS */}
            <div className="flex items-center gap-2">
                {[
                    { key: 'all' as const, label: 'Todo', icon: <FiActivity /> },
                    { key: 'highlights' as const, label: 'Highlights', icon: <FiZap /> },
                    { key: 'reports' as const, label: 'Informes', icon: <FiAward /> }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === tab.key
                                ? 'bg-cyan-500 text-black'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* POSTS */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
                </div>
            ) : posts.length === 0 ? (
                <Card className="!p-12 text-center">
                    <FiActivity size={48} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Sin actividad reciente</h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                        Cuando los miembros del club completen entrenamientos, sus logros aparecerán aquí.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {posts.map(post => (
                        <PostMiniCard key={post.id} post={post} />
                    ))}
                </div>
            )}

            {/* LINK TO FULL NEXUS */}
            <div className="text-center pt-4">
                <button
                    onClick={() => navigate('/nexus')}
                    className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                    Ver todo en The Nexus →
                </button>
            </div>
        </div>
    );
};

export default ClubNexusFeed;
