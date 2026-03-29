import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiChevronLeft, FiChevronRight, FiX, FiZap, FiHeart, FiEye } from 'react-icons/fi';

import { LeagueColors, LeagueTier } from '../../types/SocialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface Story {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    userLeague: LeagueTier;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    createdAt: Date;
    expiresAt: Date;
    viewCount: number;
    isViewed: boolean;
    sensorData?: {
        heartRate?: number;
        vo2Max?: number;
        caloriesBurned?: number;
    };
}

interface StoryGroup {
    userId: string;
    userName: string;
    userAvatar: string;
    userLeague: LeagueTier;
    stories: Story[];
    hasUnviewed: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_STORY_GROUPS: StoryGroup[] = [
    {
        userId: 'u-1',
        userName: 'Tu Historia',
        userAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        userLeague: 'gold',
        stories: [],
        hasUnviewed: false
    },
    {
        userId: 'u-2',
        userName: 'Carlos Fit',
        userAvatar: 'https://randomuser.me/api/portraits/men/2.jpg',
        userLeague: 'diamond',
        stories: [
            {
                id: 's-1',
                userId: 'u-2',
                userName: 'Carlos Fit',
                userAvatar: 'https://randomuser.me/api/portraits/men/2.jpg',
                userLeague: 'diamond',
                mediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
                mediaType: 'image',
                createdAt: new Date(Date.now() - 3600000 * 2),
                expiresAt: new Date(Date.now() + 3600000 * 22),
                viewCount: 234,
                isViewed: false,
                sensorData: { heartRate: 156, caloriesBurned: 420 }
            },
            {
                id: 's-2',
                userId: 'u-2',
                userName: 'Carlos Fit',
                userAvatar: 'https://randomuser.me/api/portraits/men/2.jpg',
                userLeague: 'diamond',
                mediaUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
                mediaType: 'image',
                createdAt: new Date(Date.now() - 3600000 * 1),
                expiresAt: new Date(Date.now() + 3600000 * 23),
                viewCount: 189,
                isViewed: false
            }
        ],
        hasUnviewed: true
    },
    {
        userId: 'u-3',
        userName: 'Elena Runner',
        userAvatar: 'https://randomuser.me/api/portraits/women/3.jpg',
        userLeague: 'platinum',
        stories: [
            {
                id: 's-3',
                userId: 'u-3',
                userName: 'Elena Runner',
                userAvatar: 'https://randomuser.me/api/portraits/women/3.jpg',
                userLeague: 'platinum',
                mediaUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400',
                mediaType: 'image',
                createdAt: new Date(Date.now() - 3600000 * 4),
                expiresAt: new Date(Date.now() + 3600000 * 20),
                viewCount: 567,
                isViewed: true,
                sensorData: { vo2Max: 52.3, caloriesBurned: 680 }
            }
        ],
        hasUnviewed: false
    },
    {
        userId: 'u-4',
        userName: 'Miguel Padel',
        userAvatar: 'https://randomuser.me/api/portraits/men/4.jpg',
        userLeague: 'gold',
        stories: [
            {
                id: 's-4',
                userId: 'u-4',
                userName: 'Miguel Padel',
                userAvatar: 'https://randomuser.me/api/portraits/men/4.jpg',
                userLeague: 'gold',
                mediaUrl: 'https://images.unsplash.com/photo-1558614836-22a6ea7de446?w=400',
                mediaType: 'image',
                createdAt: new Date(Date.now() - 3600000),
                expiresAt: new Date(Date.now() + 3600000 * 23),
                viewCount: 145,
                isViewed: false
            }
        ],
        hasUnviewed: true
    },
    {
        userId: 'u-5',
        userName: 'Laura CrossFit',
        userAvatar: 'https://randomuser.me/api/portraits/women/5.jpg',
        userLeague: 'elite',
        stories: [
            {
                id: 's-5',
                userId: 'u-5',
                userName: 'Laura CrossFit',
                userAvatar: 'https://randomuser.me/api/portraits/women/5.jpg',
                userLeague: 'elite',
                mediaUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
                mediaType: 'image',
                createdAt: new Date(Date.now() - 3600000 * 5),
                expiresAt: new Date(Date.now() + 3600000 * 19),
                viewCount: 892,
                isViewed: true
            }
        ],
        hasUnviewed: false
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// STORY AVATAR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface StoryAvatarProps {
    group: StoryGroup;
    isFirst: boolean;
    onClick: () => void;
    onAddClick?: () => void;
}

const StoryAvatar: React.FC<StoryAvatarProps> = ({ group, isFirst, onClick, onAddClick }) => {
    const leagueConfig = LeagueColors[group.userLeague];
    const hasStories = group.stories.length > 0;

    return (
        <motion.button
            onClick={isFirst && !hasStories ? onAddClick : onClick}
            className="flex flex-col items-center gap-1.5 shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <div className="relative">
                {/* Ring */}
                <div className={`w-16 h-16 rounded-full p-[2px] ${!hasStories ? 'bg-slate-200 dark:bg-slate-700' :
                    group.hasUnviewed
                        ? 'bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}>
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 p-[2px]">
                        <img
                            src={group.userAvatar}
                            alt={group.userName}
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                </div>

                {/* Add Button (only for first/own) */}
                {isFirst && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                        <FiPlus size={14} className="text-white dark:text-black" />
                    </div>
                )}

                {/* League Badge */}
                {!isFirst && (
                    <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${leagueConfig.bg} ${leagueConfig.border} border`}>
                        {group.userLeague.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            <span className="text-xs text-slate-600 dark:text-slate-400 max-w-16 truncate">
                {isFirst ? 'Tu Historia' : group.userName.split(' ')[0]}
            </span>
        </motion.button>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// STORY VIEWER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface StoryViewerProps {
    groups: StoryGroup[];
    initialGroupIndex: number;
    onClose: () => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ groups, initialGroupIndex, onClose }) => {
    const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const progressRef = useRef<NodeJS.Timeout | null>(null);

    const currentGroup = groups[currentGroupIndex];
    const currentStory = currentGroup?.stories[currentStoryIndex];
    const leagueConfig = currentGroup ? LeagueColors[currentGroup.userLeague] : LeagueColors.bronze;

    // Progress timer
    useEffect(() => {
        if (!currentStory) return;

        setProgress(0);
        const duration = 5000; // 5 seconds per story
        const interval = 50;

        progressRef.current = setInterval(() => {
            setProgress(prev => {
                const next = prev + (interval / duration) * 100;
                if (next >= 100) {
                    // Move to next story
                    goToNext();
                    return 0;
                }
                return next;
            });
        }, interval);

        return () => {
            if (progressRef.current) clearInterval(progressRef.current);
        };
    }, [currentGroupIndex, currentStoryIndex]);

    const goToNext = () => {
        if (currentStoryIndex < currentGroup.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
        } else if (currentGroupIndex < groups.length - 1) {
            setCurrentGroupIndex(prev => prev + 1);
            setCurrentStoryIndex(0);
        } else {
            onClose();
        }
    };

    const goToPrev = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
        } else if (currentGroupIndex > 0) {
            setCurrentGroupIndex(prev => prev - 1);
            setCurrentStoryIndex(groups[currentGroupIndex - 1].stories.length - 1);
        }
    };

    if (!currentStory) return null;

    const timeAgo = (date: Date): string => {
        const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
        if (hours < 1) return 'hace menos de 1h';
        return `hace ${hours}h`;
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
                <FiX size={24} />
            </button>

            {/* Navigation Arrows */}
            {currentGroupIndex > 0 || currentStoryIndex > 0 ? (
                <button
                    onClick={goToPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                    <FiChevronLeft size={24} />
                </button>
            ) : null}

            {currentGroupIndex < groups.length - 1 || currentStoryIndex < currentGroup.stories.length - 1 ? (
                <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                    <FiChevronRight size={24} />
                </button>
            ) : null}

            {/* Story Container */}
            <div className="relative w-full max-w-md h-[80vh] max-h-[700px] rounded-2xl overflow-hidden">
                {/* Progress Bars */}
                <div className="absolute top-0 left-0 right-0 z-10 p-2 flex gap-1">
                    {currentGroup.stories.map((_, index) => (
                        <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-50"
                                style={{
                                    width: index < currentStoryIndex ? '100%' :
                                        index === currentStoryIndex ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-6 left-0 right-0 z-10 px-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full overflow-hidden ${leagueConfig.glow}`}>
                        <img src={currentGroup.userAvatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-white text-sm">{currentGroup.userName}</p>
                        <p className="text-xs text-white/70">{timeAgo(currentStory.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1 text-white/70 text-xs">
                        <FiEye size={14} />
                        {currentStory.viewCount}
                    </div>
                </div>

                {/* Media */}
                {currentStory.mediaType === 'image' ? (
                    <img
                        src={currentStory.mediaUrl}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <video
                        src={currentStory.mediaUrl}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                    />
                )}

                {/* Sensor Data Overlay */}
                {currentStory.sensorData && (
                    <div className="absolute bottom-20 left-4 right-4 z-10">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-sm">
                            <FiZap className="text-cyan-400" />
                            {currentStory.sensorData.heartRate && (
                                <span className="text-white text-sm">
                                    <FiHeart className="inline mr-1 text-red-400" />
                                    {currentStory.sensorData.heartRate} bpm
                                </span>
                            )}
                            {currentStory.sensorData.caloriesBurned && (
                                <span className="text-white text-sm">🔥 {currentStory.sensorData.caloriesBurned} kcal</span>
                            )}
                            {currentStory.sensorData.vo2Max && (
                                <span className="text-white text-sm">O₂ {currentStory.sensorData.vo2Max}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Click Areas */}
                <div className="absolute inset-0 flex z-5">
                    <div className="w-1/3 h-full" onClick={goToPrev} />
                    <div className="w-1/3 h-full" />
                    <div className="w-1/3 h-full" onClick={goToNext} />
                </div>
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// STORIES BAR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface StoriesBarProps {
    onAddStory?: () => void;
    className?: string;
}

const StoriesBar: React.FC<StoriesBarProps> = ({ onAddStory, className = '' }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const amount = direction === 'left' ? -200 : 200;
            scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    const openViewer = (index: number) => {
        // Skip first (own story) if no stories
        if (index === 0 && MOCK_STORY_GROUPS[0].stories.length === 0) return;
        setSelectedGroupIndex(index);
        setViewerOpen(true);
    };

    // Filter groups with stories for viewer
    const viewableGroups = MOCK_STORY_GROUPS.filter(g => g.stories.length > 0);

    return (
        <>
            <div className={`relative ${className}`}>
                {/* Scroll Buttons */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 shadow-lg"
                    >
                        <FiChevronLeft size={16} />
                    </button>
                )}
                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 shadow-lg"
                    >
                        <FiChevronRight size={16} />
                    </button>
                )}

                {/* Stories Container */}
                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {MOCK_STORY_GROUPS.map((group, index) => (
                        <StoryAvatar
                            key={group.userId}
                            group={group}
                            isFirst={index === 0}
                            onClick={() => openViewer(index)}
                            onAddClick={onAddStory}
                        />
                    ))}
                </div>
            </div>

            {/* Story Viewer */}
            <AnimatePresence>
                {viewerOpen && viewableGroups.length > 0 && (
                    <StoryViewer
                        groups={viewableGroups}
                        initialGroupIndex={Math.max(0, selectedGroupIndex - 1)} // Adjust for skipped own story
                        onClose={() => setViewerOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default StoriesBar;
