import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUser, FiMapPin, FiCalendar, FiUsers, FiSettings, FiShare2,
    FiEye, FiEyeOff, FiActivity, FiZap, FiAward, FiHeart,
    FiMessageCircle, FiUserPlus, FiUserCheck, FiRadio, FiGrid, FiBookmark, FiImage, FiEdit3
} from 'react-icons/fi';
import { GiMuscleUp, GiRunningShoe, GiGasMask, GiTennisRacket, GiFire } from 'react-icons/gi';
import { HiOutlineSparkles } from 'react-icons/hi';

import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../ui/Shared';
import SocialService from '../../services/SocialService';
import NexusService from '../../services/NexusService';
import ProfileEditor from './ProfileEditor';
import {
    UserProfile,
    LeagueColors,
    LeagueTier,
    Badge as BadgeType,
    SensorDeviceType,
    Post
} from '../../types/SocialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// DEVICE ICONS MAP
// ═══════════════════════════════════════════════════════════════════════════

const deviceIcons: Record<SensorDeviceType, React.ReactNode> = {
    'neural-skin': <GiMuscleUp size={16} />,
    'groundtruth': <GiRunningShoe size={16} />,
    'aerolung': <GiGasMask size={16} />,
    'aerovision': <HiOutlineSparkles size={16} />,
    'racket': <GiTennisRacket size={16} />
};

// ═══════════════════════════════════════════════════════════════════════════
// BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const BadgeDisplay: React.FC<{ badge: BadgeType; featured?: boolean }> = ({ badge, featured = false }) => {
    const rarityColors = {
        common: 'border-slate-500/30 bg-slate-500/10',
        rare: 'border-blue-500/30 bg-blue-500/10',
        epic: 'border-purple-500/30 bg-purple-500/10',
        legendary: 'border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
    };

    return (
        <motion.div
            className={`relative p-3 rounded-xl border ${rarityColors[badge.rarity]} ${featured ? 'ring-2 ring-cyan-400/50' : ''}`}
            whileHover={{ scale: 1.05 }}
            title={badge.description}
        >
            <div className="text-2xl mb-1">{badge.icon}</div>
            <p className="text-xs font-bold text-white truncate">{badge.name}</p>
            {featured && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 border border-slate-900" />
            )}
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// LEAGUE BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const LeagueBadge: React.FC<{ tier: LeagueTier; level: number }> = ({ tier, level }) => {
    const config = LeagueColors[tier];
    const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${config.gradient} ${config.glow}`}>
            <FiAward className="text-white" size={14} />
            <span className="text-xs font-black text-white uppercase tracking-wider">
                {tierName} {level}
            </span>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// POST GRID ITEM
// ═══════════════════════════════════════════════════════════════════════════

const PostGridItem: React.FC<{ post: Post; onClick: () => void }> = ({ post, onClick }) => {
    const hasMedia = !!post.mediaUrl;
    const hasSensorData = post.sensorProof && Object.keys(post.sensorProof).length > 0;

    return (
        <motion.div
            className="relative aspect-square rounded-xl overflow-hidden bg-slate-800 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
        >
            {hasMedia ? (
                <img
                    src={post.mediaUrl}
                    alt=""
                    className="w-full h-full object-cover"
                />
            ) : hasSensorData ? (
                <div className="w-full h-full bg-gradient-to-br from-cyan-900/50 to-purple-900/50 flex items-center justify-center">
                    <FiZap className="text-cyan-400" size={32} />
                </div>
            ) : (
                <div className="w-full h-full p-3 flex items-center justify-center">
                    <p className="text-sm text-slate-300 line-clamp-4 text-center">{post.content}</p>
                </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <div className="flex items-center gap-1 text-white">
                    <FiHeart />
                    <span className="font-bold">{post.endorsementCount}</span>
                </div>
                <div className="flex items-center gap-1 text-white">
                    <FiMessageCircle />
                    <span className="font-bold">{post.commentCount}</span>
                </div>
            </div>

            {/* Sensor data indicator */}
            {hasSensorData && (
                <div className="absolute top-2 left-2 p-1 rounded bg-cyan-500/80">
                    <FiZap className="text-white" size={14} />
                </div>
            )}
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const PublicProfile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState<'posts' | 'badges' | 'saved'>('posts');
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [showEditProfile, setShowEditProfile] = useState(false);

    // Current user ID (mocked as user-001 for now)
    const currentUserId = 'user-001';

    // Fetch profile
    useEffect(() => {
        const fetchProfile = async () => {
            if (!username) return;

            setLoading(true);
            setError(null);

            try {
                // Try to find by username first
                let data = await SocialService.getProfileByUsername(username);

                // If not found, try by ID (in case navigation used userId)
                if (!data) {
                    data = await SocialService.getProfileById(username);
                }

                if (data) {
                    setProfile(data);
                    // Check follow status
                    const following = await SocialService.isFollowing(currentUserId, data.id);
                    setIsFollowing(following);
                } else {
                    setError('Perfil no encontrado o es privado');
                }
            } catch (err) {
                setError('Error al cargar el perfil');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    // Fetch user posts
    useEffect(() => {
        const fetchPosts = async () => {
            if (!profile) return;

            setLoadingPosts(true);
            try {
                const response = await NexusService.getFeed({ limit: 30 });
                // Filter posts by this user (in real app, would be an API call)
                const filteredPosts = response.posts.filter(p => p.authorId === profile?.id);
                setUserPosts(filteredPosts.length > 0 ? filteredPosts : response.posts.slice(0, 12));
            } catch (err) {
                console.error('Error loading posts:', err);
            } finally {
                setLoadingPosts(false);
            }
        };

        if (activeTab === 'posts') {
            fetchPosts();
        }
    }, [profile, activeTab, username]);

    // Handle follow/unfollow
    const handleFollowToggle = async () => {
        if (!profile) return;

        if (isFollowing) {
            await SocialService.unfollowUser(currentUserId, profile.id);
        } else {
            await SocialService.followUser(currentUserId, profile.id);
        }
        setIsFollowing(!isFollowing);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    // Error state
    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <FiEyeOff size={48} className="text-slate-500" />
                <h2 className="text-xl font-bold text-white">{error || 'Perfil no encontrado'}</h2>
                <p className="text-slate-400">Este perfil puede ser privado o no existir</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold hover:bg-cyan-500/30 transition-colors"
                >
                    Volver
                </button>
            </div>
        );
    }

    const leagueConfig = LeagueColors[profile.leagueRank.tier];

    return (
        <>
            {/* SEO Meta Tags */}
            <Helmet>
                <title>{profile.displayName} (@{profile.username}) | NutriStream</title>
                <meta name="description" content={profile.bio || `Perfil de ${profile.displayName} en NutriStream`} />
                <meta property="og:title" content={`${profile.displayName} | NutriStream`} />
                <meta property="og:description" content={profile.bio || 'Atleta de NutriStream'} />
                <meta property="og:image" content={profile.avatar} />
                <meta property="og:type" content="profile" />
                <link rel="canonical" href={`https://nutristream.app/profile/${profile.username}`} />
            </Helmet>

            <motion.div
                className="space-y-6 pb-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {/* HERO HEADER */}
                <div className="relative rounded-3xl overflow-hidden">
                    {/* Cover Image / Gradient */}
                    <div
                        className={`h-48 bg-gradient-to-br ${leagueConfig.gradient} relative`}
                        style={profile.coverImage ? {
                            backgroundImage: `url(${profile.coverImage})`,
                            backgroundSize: 'cover'
                        } : {}}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />

                        {/* Live Indicator */}
                        {profile.isLive && (
                            <motion.div
                                className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500 text-white font-bold text-sm"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                <FiRadio className="animate-pulse" />
                                EN VIVO
                            </motion.div>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="relative px-6 pb-6 -mt-16">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Avatar with Neon Aura */}
                            <motion.div
                                className={`relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-slate-900 ${leagueConfig.glow}`}
                                whileHover={{ scale: 1.05 }}
                            >
                                {profile.avatar ? (
                                    <img
                                        src={profile.avatar}
                                        alt={profile.displayName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className={`w-full h-full bg-gradient-to-br ${leagueConfig.gradient} flex items-center justify-center`}>
                                        <FiUser size={48} className="text-white" />
                                    </div>
                                )}

                                {/* Online indicator */}
                                {profile.isLive && (
                                    <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-red-500 border-2 border-slate-900 animate-pulse" />
                                )}
                            </motion.div>

                            {/* Name & Bio */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl md:text-3xl font-black text-white">
                                        {profile.displayName}
                                    </h1>
                                    <LeagueBadge tier={profile.leagueRank.tier} level={profile.leagueRank.level} />
                                </div>

                                <p className="text-slate-400 mb-3">@{profile.username}</p>

                                {profile.bio && (
                                    <p className="text-slate-300 mb-4 max-w-xl">{profile.bio}</p>
                                )}

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                    {profile.location && (
                                        <span className="flex items-center gap-1">
                                            <FiMapPin size={14} />
                                            {profile.location}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <FiCalendar size={14} />
                                        Desde {profile.joinedAt.toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                                {profile.id === currentUserId ? (
                                    <motion.button
                                        onClick={() => setShowEditProfile(true)}
                                        className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors bg-slate-700 text-white hover:bg-slate-600 border border-slate-600"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <FiEdit3 />
                                        Editar Perfil
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        onClick={handleFollowToggle}
                                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors ${isFollowing
                                            ? 'bg-slate-700 text-white hover:bg-slate-600'
                                            : 'bg-cyan-500 text-white hover:bg-cyan-400'
                                            }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isFollowing ? <FiUserCheck /> : <FiUserPlus />}
                                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                                    </motion.button>
                                )}

                                <button className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2 justify-center">
                                    <FiShare2 size={16} />
                                    Compartir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STATS BAR - Instagram Style */}
                <div className="flex justify-around py-4 border-y border-slate-700">
                    <div className="text-center cursor-pointer hover:opacity-80">
                        <p className="text-2xl font-black text-white">{userPosts.length}</p>
                        <p className="text-xs text-slate-400 uppercase">Publicaciones</p>
                    </div>
                    <div className="text-center cursor-pointer hover:opacity-80">
                        <p className="text-2xl font-black text-white">{profile.followersCount.toLocaleString()}</p>
                        <p className="text-xs text-slate-400 uppercase">Seguidores</p>
                    </div>
                    <div className="text-center cursor-pointer hover:opacity-80">
                        <p className="text-2xl font-black text-white">{profile.followingCount.toLocaleString()}</p>
                        <p className="text-xs text-slate-400 uppercase">Siguiendo</p>
                    </div>
                </div>

                {/* ADDITIONAL STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">

                    <Card className="!p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <FiActivity className="text-emerald-400" />
                            <span className="text-xs text-slate-400 uppercase tracking-wider">Entrenamientos</span>
                        </div>
                        <p className="text-2xl font-black text-white">{profile.totalWorkouts}</p>
                    </Card>

                    <Card className="!p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <FiCalendar className="text-amber-400" />
                            <span className="text-xs text-slate-400 uppercase tracking-wider">Horas</span>
                        </div>
                        <p className="text-2xl font-black text-white">{Math.round(profile.totalMinutes / 60)}</p>
                    </Card>

                    <Card className="!p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <GiFire className="text-orange-400" />
                            <span className="text-xs text-slate-400 uppercase tracking-wider">Racha</span>
                        </div>
                        <p className="text-2xl font-black text-white">7 días</p>
                    </Card>
                </div>

                {/* CONNECTED DEVICES */}
                {profile.connectedDevices.length > 0 && (
                    <Card className="!p-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                            Hardware Conectado
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.connectedDevices.map(device => (
                                <div
                                    key={device}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700"
                                >
                                    <span className="text-cyan-400">{deviceIcons[device]}</span>
                                    <span className="text-sm text-white capitalize">{device.replace('-', ' ')}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* CONTENT TABS - Instagram Style */}
                <div className="border-b border-slate-700 mt-2">
                    <div className="flex justify-between sm:justify-center sm:gap-12 px-2">
                        {[
                            { key: 'posts' as const, label: 'Publicaciones', icon: <FiGrid /> },
                            { key: 'badges' as const, label: 'Logros', icon: <FiAward /> },
                            { key: 'saved' as const, label: 'Guardados', icon: <FiBookmark /> }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center justify-center gap-2 py-3 border-t-2 transition-colors flex-1 sm:flex-none ${activeTab === tab.key
                                    ? 'border-cyan-400 text-white'
                                    : 'border-transparent text-slate-400 hover:text-white'
                                    }`}
                            >
                                {tab.icon}
                                <span className="hidden sm:inline text-sm uppercase font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* TAB CONTENT */}
                {activeTab === 'posts' && (
                    <div>
                        {loadingPosts ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
                            </div>
                        ) : userPosts.length > 0 ? (
                            <div className="grid grid-cols-3 gap-1 md:gap-3">
                                {userPosts.map(post => (
                                    <PostGridItem
                                        key={post.id}
                                        post={post}
                                        onClick={() => setSelectedPost(post)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <FiImage size={48} className="mx-auto text-slate-600 mb-4" />
                                <p className="text-slate-400">Aún no hay publicaciones</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'badges' && (
                    <Card className="!p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FiAward className="text-amber-400" />
                                Logros
                            </h3>
                            <span className="text-sm text-slate-400">{profile.badges.length} insignias</span>
                        </div>

                        {profile.badges.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {profile.badges.map(badge => (
                                    <BadgeDisplay
                                        key={badge.id}
                                        badge={badge}
                                        featured={profile.featuredBadges.includes(badge.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-8">
                                Aún no hay insignias desbloqueadas
                            </p>
                        )}
                    </Card>
                )}

                {activeTab === 'saved' && (
                    <div className="text-center py-16">
                        <FiBookmark size={48} className="mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">Solo tú puedes ver tus publicaciones guardadas</p>
                    </div>
                )}

                {/* POST DETAIL MODAL */}
                <AnimatePresence>
                    {selectedPost && (
                        <motion.div
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPost(null)}
                        >
                            <motion.div
                                className="bg-slate-900 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] grid md:grid-cols-2"
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Media side */}
                                <div className="bg-black flex items-center justify-center min-h-[300px]">
                                    {selectedPost.mediaUrl ? (
                                        <img
                                            src={selectedPost.mediaUrl}
                                            alt=""
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="p-8">
                                            <p className="text-lg text-white">{selectedPost.content}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Details side */}
                                <div className="flex flex-col max-h-[90vh] overflow-y-auto">
                                    {/* Author header */}
                                    <div className="p-4 border-b border-slate-700 flex items-center gap-3">
                                        <img
                                            src={selectedPost.authorAvatar || 'https://via.placeholder.com/40'}
                                            alt=""
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div>
                                            <p className="font-bold text-white">{selectedPost.authorName}</p>
                                            <p className="text-xs text-slate-400">@{selectedPost.authorId}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedPost(null)}
                                            className="ml-auto text-slate-400 hover:text-white"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4">
                                        <p className="text-slate-300">{selectedPost.content}</p>

                                        {/* Sensor data */}
                                        {selectedPost.sensorProof && (
                                            <div className="mt-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                                                <p className="text-xs text-cyan-400 font-bold mb-2">DATOS DE SENSORES</p>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    {Object.entries(selectedPost.sensorProof).map(([key, value]) => (
                                                        <div key={key} className="text-slate-300">
                                                            <span className="text-slate-500">{key}:</span> {String(value)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="p-4 border-t border-slate-700">
                                        <div className="flex items-center gap-6 text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <FiHeart /> {selectedPost.endorsementCount}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FiMessageCircle /> {selectedPost.commentCount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* PROFILE EDITOR MODAL */}
                <ProfileEditor
                    isOpen={showEditProfile}
                    onClose={() => setShowEditProfile(false)}
                    onSave={(data) => {
                        console.log('Profile saved:', data);
                        // Update local profile state if needed
                        setProfile(prev => prev ? { ...prev, ...data } : null);
                        setShowEditProfile(false);
                    }}
                    currentProfile={profile}
                />

                {/* LIVE SESSION CARD (if live) */}
                {profile.isLive && profile.showLiveStatus && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="!p-0 overflow-hidden border-2 border-red-500/50">
                            <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <motion.div
                                            className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center"
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                        >
                                            <FiRadio size={24} className="text-white" />
                                        </motion.div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Sesión en Vivo</h4>
                                            <p className="text-red-300">Entrenando ahora mismo</p>
                                        </div>
                                    </div>

                                    {profile.showFatigueToFriends && (
                                        <div className="flex gap-6">
                                            {profile.currentHeartRate && (
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-red-400">
                                                        {profile.currentHeartRate}
                                                    </p>
                                                    <p className="text-xs text-red-300">BPM</p>
                                                </div>
                                            )}
                                            {profile.currentFatigue !== undefined && (
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-amber-400">
                                                        {profile.currentFatigue}%
                                                    </p>
                                                    <p className="text-xs text-amber-300">Fatiga</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </motion.div>
        </>
    );
};

export default PublicProfile;

