import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiZap, FiMessageCircle, FiShare2, FiFilter, FiImage, FiChevronDown,
    FiClock, FiActivity, FiHeart, FiAward, FiRadio, FiCheck, FiPlus, FiMessageSquare, FiUser, FiSettings
} from 'react-icons/fi';
import { GiMuscleUp, GiRunningShoe, GiGasMask, GiTennisRacket, GiFire } from 'react-icons/gi';
import { HiOutlineSparkles } from 'react-icons/hi';

import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../ui/Shared';
import NexusService from '../../services/NexusService';
import UserSearch from './UserSearch';
import StoriesBar from './StoriesBar';
import CreatePostModal from './CreatePostModal';
import CommentsModal from './CommentsModal';
import ShareModal from './ShareModal';
import TrendingTopics from './TrendingTopics';
import ChallengesSection from './ChallengesSection';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import NewChatModal from './NewChatModal';
import ProfileEditor from './ProfileEditor';
import ScienceHub from './ScienceHub';
import { MessagingService, Conversation } from '../../services/MessagingService';
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
// ENDORSEMENT BUTTON
// ═══════════════════════════════════════════════════════════════════════════

const endorsementTypes = [
    { type: 'energy' as const, icon: <FiZap />, label: 'Energía', color: 'text-cyan-400' },
    { type: 'fire' as const, icon: <GiFire />, label: 'Fuego', color: 'text-orange-400' },
    { type: 'respect' as const, icon: <FiHeart />, label: 'Respeto', color: 'text-pink-400' },
    { type: 'beast' as const, icon: <GiMuscleUp />, label: 'Bestia', color: 'text-purple-400' }
];

interface EndorsementButtonProps {
    post: Post;
    currentUserId: string;
    onEndorse: (postId: string, type: Endorsement['type']) => void;
}

const EndorsementButton: React.FC<EndorsementButtonProps> = ({ post, currentUserId, onEndorse }) => {
    const [showPicker, setShowPicker] = useState(false);
    const userEndorsement = NexusService.getUserEndorsement(post, currentUserId);

    return (
        <div className="relative">
            <button
                onClick={() => setShowPicker(!showPicker)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${userEndorsement
                    ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'
                    }`}
            >
                <FiZap size={18} />
                <span className="font-medium">{post.endorsementCount}</span>
            </button>

            <AnimatePresence>
                {showPicker && (
                    <motion.div
                        className="absolute bottom-full left-0 mb-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex gap-1 shadow-xl dark:shadow-none"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        {endorsementTypes.map(({ type, icon, label, color }) => (
                            <button
                                key={type}
                                onClick={() => {
                                    onEndorse(post.id, type);
                                    setShowPicker(false);
                                }}
                                className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${color} ${userEndorsement?.type === type ? 'bg-slate-100 dark:bg-slate-700' : ''
                                    }`}
                                title={label}
                            >
                                {icon}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// POST CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface PostCardProps {
    post: Post;
    currentUserId: string;
    onEndorse: (postId: string, type: Endorsement['type']) => void;
    onComment: (postId: string) => void;
    onShare: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onEndorse, onComment, onShare }) => {
    const navigate = useNavigate();
    const leagueConfig = LeagueColors[post.authorLeague];

    // Format time ago
    const timeAgo = (date: Date): string => {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return 'ahora';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm dark:shadow-none"
        >
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
                <div
                    className={`w-12 h-12 rounded-xl overflow-hidden cursor-pointer ${leagueConfig.glow}`}
                    onClick={() => navigate(`/profile/${post.authorId}`)}
                >
                    {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${leagueConfig.gradient} flex items-center justify-center text-white font-bold`}>
                            {post.authorName.charAt(0)}
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span
                            className="font-bold text-slate-900 dark:text-white cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                            onClick={() => navigate(`/profile/${post.authorId}`)}
                        >
                            {post.authorName}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r ${leagueConfig.gradient} text-white capitalize`}>
                            {post.authorLeague}
                        </span>
                        {post.type === 'group-report' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400">
                                ENTRENADOR
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                        <FiClock size={12} />
                        <span>{timeAgo(post.createdAt)}</span>
                        {post.workoutType && (
                            <>
                                <span>•</span>
                                <span>{post.workoutType}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
                <p className="text-slate-800 dark:text-white whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Media */}
            {post.mediaUrl && (
                <div className="relative">
                    <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full max-h-96 object-cover"
                    />
                </div>
            )}

            {/* Sensor Proof Badge */}
            {post.hasSensorProof && post.sensorProof && (
                <div className="mx-4 my-3 p-3 rounded-xl bg-cyan-50 border border-cyan-100 dark:bg-transparent dark:bg-gradient-to-r dark:from-cyan-900/30 dark:to-emerald-900/30 dark:border-cyan-500/30">
                    <div className="flex items-center gap-2 mb-2">
                        <FiCheck className="text-emerald-600 dark:text-emerald-400" size={14} />
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            Proof of Effort Verificado
                        </span>
                        <span className="text-cyan-600 dark:text-cyan-400">{deviceIcons[post.sensorProof.deviceType]}</span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm">
                        {post.sensorProof.vo2Max && (
                            <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-300">
                                <FiActivity size={12} />
                                <span>VO2 Max: {post.sensorProof.vo2Max}</span>
                            </div>
                        )}
                        {post.sensorProof.heartRateMax && (
                            <div className="flex items-center gap-1 text-red-600 dark:text-red-300">
                                <FiHeart size={12} />
                                <span>HR Max: {post.sensorProof.heartRateMax} bpm</span>
                            </div>
                        )}
                        {post.sensorProof.caloriesBurned && (
                            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-300">
                                <GiFire size={12} />
                                <span>{post.sensorProof.caloriesBurned} kcal</span>
                            </div>
                        )}
                        {post.sensorProof.swingSpeed && (
                            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-300">
                                <GiTennisRacket size={12} />
                                <span>{post.sensorProof.swingSpeed} km/h</span>
                            </div>
                        )}
                        {post.sensorProof.distanceKm && (
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-300">
                                <GiRunningShoe size={12} />
                                <span>{post.sensorProof.distanceKm} km</span>
                            </div>
                        )}
                        {post.sensorProof.fatigueLevel !== undefined && (
                            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-300">
                                <GiMuscleUp size={12} />
                                <span>Fatiga: {post.sensorProof.fatigueLevel}%</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <EndorsementButton
                    post={post}
                    currentUserId={currentUserId}
                    onEndorse={onEndorse}
                />

                <button
                    onClick={() => onComment(post.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                >
                    <FiMessageCircle size={18} />
                    <span className="font-medium">{post.commentCount}</span>
                </button>

                <button
                    onClick={() => onShare(post)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors ml-auto"
                >
                    <FiShare2 size={18} />
                </button>
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN NEXUS FEED COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const NexusFeed: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [filter, setFilter] = useState<'all' | 'following' | 'club'>('all');
    const [activeSection, setActiveSection] = useState<'feed' | 'science'>('feed');

    // Modal states
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
    const [selectedPostForShare, setSelectedPostForShare] = useState<Post | null>(null);

    // Chat states
    const [showChat, setShowChat] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [showNewChat, setShowNewChat] = useState(false);

    // Profile editor state
    const [showProfileEditor, setShowProfileEditor] = useState(false);

    // Feed counts for tab badges
    const [feedCounts, setFeedCounts] = useState({ all: 0, following: 0, club: 0 });

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Current user (would come from auth context)
    const currentUserId = 'current-user-id';

    // Initial load
    useEffect(() => {
        loadPosts(true);
        loadUnreadCount();
        NexusService.getFeedCounts().then(setFeedCounts);
    }, [filter]);

    // ... existing loadUnreadCount ...

    // Handle new chat creation
    const handleNewChat = async (targetUserId: string) => {
        setShowNewChat(false);
        const newConv = await MessagingService.createConversation('u-1', targetUserId);
        setSelectedConversation(newConv);
        setShowChat(true);
    };

    // Load unread message count
    const loadUnreadCount = async () => {
        const count = await MessagingService.getTotalUnreadCount('u-1');
        setUnreadMessages(count);
    };

    // Load posts
    const loadPosts = async (refresh: boolean = false) => {
        if (refresh) {
            setLoading(true);
            setCursor(undefined);
        } else {
            setLoadingMore(true);
        }

        try {
            const response = await NexusService.getFeed({
                limit: 10,
                cursor: refresh ? undefined : cursor,
                filter
            });

            if (refresh) {
                setPosts(response.posts);
            } else {
                setPosts(prev => [...prev, ...response.posts]);
            }

            setCursor(response.nextCursor);
            setHasMore(response.hasMore);
        } catch (error) {
            console.error('Error loading feed:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Infinite scroll observer
    useEffect(() => {
        if (loading) return;

        observerRef.current = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadPosts(false);
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => observerRef.current?.disconnect();
    }, [loading, hasMore, loadingMore, cursor]);

    // Handle endorsement
    const handleEndorse = async (postId: string, type: Endorsement['type']) => {
        await NexusService.addEndorsement(postId, currentUserId, 'Usuario', type);
        // Refresh the post
        const updatedPost = await NexusService.getPostById(postId);
        if (updatedPost) {
            setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
        }
    };

    // Handle comment - open modal
    const handleComment = (postId: string) => {
        setSelectedPostForComments(postId);
    };

    // Handle share - open modal
    const handleShare = (post: Post) => {
        setSelectedPostForShare(post);
    };

    // Handle tag click
    const handleTagClick = (tag: string) => {
        console.log('Filter by tag:', tag);
    };

    // Handle post created
    const handlePostCreated = (post: Post) => {
        setPosts(prev => [post, ...prev]);
        setShowCreatePost(false);
    };

    // Handle select conversation
    const handleSelectConversation = async (convId: string) => {
        const convs = await MessagingService.getConversations('u-1');
        setConversations(convs);
        const conv = convs.find(c => c.id === convId);
        if (conv) setSelectedConversation(conv);
    };

    return (
        <>
            <Helmet>
                <title>Nexus | NutriStream</title>
                <meta name="description" content="El feed social de atletas de NutriStream. Comparte tus logros, conecta con otros atletas y descubre rendimientos reales verificados por sensores." />
            </Helmet>

            <div className="pb-20">
                {/* HEADER */}
                <div className="bg-gradient-to-r from-slate-900 via-cyan-900/20 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden mb-6">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <span className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 shrink-0">
                                    <FiRadio className="text-cyan-400" size={24} />
                                </span>
                                <div>
                                    <h1 className="text-2xl font-black tracking-tight">The Nexus</h1>
                                    <span className="text-xs text-slate-400">Rendimiento real verificado</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                                <button
                                    onClick={() => navigate('/profile/user-001')}
                                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 hover:border-cyan-500/50 transition-colors"
                                    title="Ver Mi Perfil"
                                >
                                    <FiUser className="text-cyan-400" size={18} />
                                    <span className="text-sm font-medium text-cyan-300 hidden sm:inline">Mi Perfil</span>
                                </button>
                                <button
                                    onClick={() => setShowProfileEditor(true)}
                                    className="relative p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 transition-colors"
                                    title="Editar Perfil Público"
                                >
                                    <FiSettings className="text-slate-300" size={18} />
                                </button>
                                <button
                                    onClick={() => setShowChat(!showChat)}
                                    className="relative p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 transition-colors"
                                >
                                    <FiMessageSquare className="text-slate-300" size={20} />
                                    {unreadMessages > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                                            {unreadMessages}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowCreatePost(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors shrink-0"
                                >
                                    <FiPlus size={18} />
                                    <span className="hidden sm:inline">Crear Post</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEARCH BAR - Outside header for proper dropdown visibility */}
                <div className="relative z-50 mb-6 -mt-4">
                    <UserSearch embedded />
                </div>

                {/* STORIES BAR */}
                <div className="mb-6">
                    <StoriesBar />
                </div>

                {/* SECTION TOGGLE: Feed / Ciencia */}
                <div className="flex items-center gap-2 mb-6 bg-slate-100 dark:bg-slate-800/30 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700/40">
                    <button
                        onClick={() => setActiveSection('feed')}
                        className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === 'feed' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        {activeSection === 'feed' && (
                            <motion.div
                                layoutId="sectionToggle"
                                className="absolute inset-0 bg-white shadow-sm dark:bg-slate-800 dark:bg-gradient-to-r dark:from-cyan-500/20 dark:to-blue-500/20 border border-slate-200 dark:border-cyan-500/30 rounded-xl"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <FiRadio size={16} className={activeSection === 'feed' ? 'text-cyan-600 dark:text-cyan-400' : ''} />
                            Feed Social
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveSection('science')}
                        className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === 'science' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        {activeSection === 'science' && (
                            <motion.div
                                layoutId="sectionToggle"
                                className="absolute inset-0 bg-white shadow-sm dark:bg-slate-800 dark:bg-gradient-to-r dark:from-purple-500/20 dark:to-indigo-500/20 border border-slate-200 dark:border-purple-500/30 rounded-xl"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <span className={activeSection === 'science' ? 'text-purple-600 dark:text-purple-400' : ''}>🔬</span>
                            Ciencia & Salud
                        </span>
                    </button>
                </div>

                {/* CONDITIONAL SECTION CONTENT */}
                {activeSection === 'science' ? (
                    <ScienceHub />
                ) : (
                    <>
                        {/* MAIN CONTENT GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* LEFT/MAIN COLUMN - Feed */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* FILTER TABS - Enhanced */}
                                <div className="relative">
                                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-1 border border-slate-200 dark:border-slate-700/50">
                                        {[
                                            { key: 'all' as const, label: 'Todos', icon: <FiActivity size={16} />, count: feedCounts.all },
                                            { key: 'following' as const, label: 'Siguiendo', icon: <FiHeart size={16} />, count: feedCounts.following },
                                            { key: 'club' as const, label: 'Mi Club', icon: <FiAward size={16} />, count: feedCounts.club }
                                        ].map(tab => (
                                            <button
                                                key={tab.key}
                                                onClick={() => setFilter(tab.key)}
                                                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap flex-1 justify-center ${filter === tab.key
                                                    ? 'text-slate-900 dark:text-white'
                                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                                    }`}
                                            >
                                                {filter === tab.key && (
                                                    <motion.div
                                                        layoutId="activeTab"
                                                        className="absolute inset-0 bg-white shadow-sm dark:bg-slate-800 dark:bg-gradient-to-r dark:from-cyan-500/20 dark:to-blue-500/20 border border-slate-200 dark:border-cyan-500/40 rounded-xl"
                                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                                                    />
                                                )}
                                                <span className="relative z-10 flex items-center gap-2">
                                                    <span className={filter === tab.key ? 'text-cyan-600 dark:text-cyan-400' : ''}>{tab.icon}</span>
                                                    <span className="text-sm">{tab.label}</span>
                                                    {tab.count > 0 && (
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${filter === tab.key
                                                            ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/30 dark:text-cyan-300'
                                                            : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-500'
                                                            }`}>
                                                            {tab.count}
                                                        </span>
                                                    )}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* POSTS */}
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full" />
                                    </div>
                                ) : posts.length === 0 ? (
                                    <Card className="!p-12 text-center">
                                        {filter === 'following' ? (
                                            <>
                                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-5 border border-pink-500/30">
                                                    <FiHeart size={36} className="text-pink-400" />
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2">No sigues a nadie aún</h3>
                                                <p className="text-slate-400 mb-5 max-w-sm mx-auto">
                                                    Sigue a otros atletas para ver sus publicaciones, logros y datos verificados aquí.
                                                </p>
                                                <button
                                                    onClick={() => setFilter('all')}
                                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold hover:opacity-90 transition-opacity"
                                                >
                                                    Descubrir Atletas
                                                </button>
                                            </>
                                        ) : filter === 'club' ? (
                                            <>
                                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center mb-5 border border-amber-500/30">
                                                    <FiAward size={36} className="text-amber-400" />
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2">Tu club está vacío</h3>
                                                <p className="text-slate-400 mb-5 max-w-sm mx-auto">
                                                    Comparte entrenamientos con tu equipo o invita a otros atletas a unirse al club.
                                                </p>
                                                <button
                                                    onClick={() => setShowCreatePost(true)}
                                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:opacity-90 transition-opacity"
                                                >
                                                    Publicar en el Club
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <FiImage size={48} className="mx-auto text-slate-600 mb-4" />
                                                <h3 className="text-xl font-bold text-white mb-2">No hay posts aún</h3>
                                                <p className="text-slate-400 mb-4">
                                                    Sé el primero en compartir tu rendimiento
                                                </p>
                                                <button
                                                    onClick={() => setShowCreatePost(true)}
                                                    className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400"
                                                >
                                                    Crear Post
                                                </button>
                                            </>
                                        )}
                                    </Card>
                                ) : (
                                    <div className="space-y-4">
                                        {posts.map(post => (
                                            <PostCard
                                                key={post.id}
                                                post={post}
                                                currentUserId={currentUserId}
                                                onEndorse={handleEndorse}
                                                onComment={handleComment}
                                                onShare={handleShare}
                                            />
                                        ))}

                                        {/* Load more trigger */}
                                        <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
                                            {loadingMore && (
                                                <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
                                            )}
                                            {!hasMore && posts.length > 0 && (
                                                <p className="text-slate-500 text-sm">No hay más posts</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT COLUMN - Sidebar Widgets */}
                            <div className="hidden lg:block space-y-6">
                                <TrendingTopics onTagClick={handleTagClick} />
                                <ChallengesSection />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* MODALS */}
            <CreatePostModal
                isOpen={showCreatePost}
                onClose={() => setShowCreatePost(false)}
                onPostCreated={handlePostCreated}
            />

            {selectedPostForComments && (
                <CommentsModal
                    isOpen={!!selectedPostForComments}
                    onClose={() => setSelectedPostForComments(null)}
                    postId={selectedPostForComments}
                    currentUserId={currentUserId}
                />
            )}

            {selectedPostForShare && (
                <ShareModal
                    isOpen={!!selectedPostForShare}
                    onClose={() => setSelectedPostForShare(null)}
                    post={selectedPostForShare}
                />
            )}

            {/* CHAT PANEL - FULL SCREEN OVERLAY */}
            <AnimatePresence>
                {showChat && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-slate-950 flex flex-col"
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className="flex-1 flex overflow-hidden">
                            {/* Left Side: List (Always visible on desktop, hidden on mobile if chat open) */}
                            <div className={`w-full md:w-80 lg:w-96 border-r border-slate-800 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                                <ChatList
                                    selectedConversationId={selectedConversation?.id}
                                    onSelectConversation={(id) => handleSelectConversation(id)}
                                    onNewConversation={() => setShowNewChat(true)}
                                    onClose={() => setShowChat(false)}
                                />
                            </div>

                            {/* Right Side: Chat Window (Hidden on mobile if no chat selected) */}
                            <div className={`flex-1 bg-slate-900 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                                {selectedConversation ? (
                                    <ChatWindow
                                        conversation={selectedConversation}
                                        onBack={() => setSelectedConversation(null)}
                                        onClose={() => setShowChat(false)}
                                        className="h-full"
                                    />
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
                                        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                            <FiMessageSquare size={48} className="text-slate-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Tus Mensajes</h3>
                                        <p className="max-w-xs text-center">Selecciona una conversación de la lista o inicia un nuevo chat.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* NEW CHAT MODAL */}
            <NewChatModal
                isOpen={showNewChat}
                onClose={() => setShowNewChat(false)}
                onUserSelect={handleNewChat}
            />

            {/* PROFILE EDITOR MODAL */}
            <ProfileEditor
                isOpen={showProfileEditor}
                onClose={() => setShowProfileEditor(false)}
                onSave={(data) => {
                    console.log('Profile saved:', data);
                    // Here you would save to your backend
                }}
                currentProfile={{
                    displayName: 'Carlos Martínez',
                    username: 'carlosfit',
                    bio: 'Atleta verificado con sensores NutriStream',
                    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
                    location: 'Barcelona, España',
                    isPublic: true,
                    showSensorData: true,
                    showWorkouts: true,
                    showLeague: true
                }}
            />
        </>
    );
};

export default NexusFeed;
