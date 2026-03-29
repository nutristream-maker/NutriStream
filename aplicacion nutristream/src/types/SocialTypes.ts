// NutriStream Nexus Social Types
// Social ecosystem for athletes to compete, showcase, and connect

// ═══════════════════════════════════════════════════════════════════════════
// LEAGUE & RANKING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'elite';

export interface LeagueRank {
    tier: LeagueTier;
    level: number; // 1-50 within tier
    xp: number;
    xpToNextLevel: number;
    seasonPoints: number;
}

export const LeagueColors: Record<LeagueTier, { primary: string; glow: string; gradient: string }> = {
    bronze: { primary: '#CD7F32', glow: 'shadow-[0_0_20px_rgba(205,127,50,0.5)]', gradient: 'from-amber-700 to-amber-900' },
    silver: { primary: '#C0C0C0', glow: 'shadow-[0_0_20px_rgba(192,192,192,0.5)]', gradient: 'from-slate-300 to-slate-500' },
    gold: { primary: '#FFD700', glow: 'shadow-[0_0_20px_rgba(255,215,0,0.5)]', gradient: 'from-yellow-400 to-amber-500' },
    platinum: { primary: '#E5E4E2', glow: 'shadow-[0_0_25px_rgba(229,228,226,0.6)]', gradient: 'from-slate-200 to-cyan-300' },
    diamond: { primary: '#B9F2FF', glow: 'shadow-[0_0_30px_rgba(185,242,255,0.7)]', gradient: 'from-cyan-300 to-blue-400' },
    elite: { primary: '#FF00FF', glow: 'shadow-[0_0_35px_rgba(255,0,255,0.6)]', gradient: 'from-purple-500 to-pink-500' }
};

// ═══════════════════════════════════════════════════════════════════════════
// BADGES & ACHIEVEMENTS
// ═══════════════════════════════════════════════════════════════════════════

export type BadgeCategory = 'hardware' | 'performance' | 'consistency' | 'social' | 'milestone';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string; // Emoji or icon name
    category: BadgeCategory;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlockedAt?: Date;
    progress?: number; // 0-100 for in-progress badges
}

// ═══════════════════════════════════════════════════════════════════════════
// SENSOR DATA SNAPSHOT (Proof of Effort)
// ═══════════════════════════════════════════════════════════════════════════

export type SensorDeviceType = 'neural-skin' | 'groundtruth' | 'aerolung' | 'aerovision' | 'racket';

export interface SensorDataSnapshot {
    id: string;
    timestamp: Date;
    sessionId?: string;
    deviceType: SensorDeviceType;
    deviceId: string;

    // Biometric data
    heartRate?: number;
    heartRateMax?: number;
    vo2Max?: number;
    caloriesBurned?: number;

    // Fatigue & Recovery
    fatigueLevel?: number; // 0-100
    neuralBattery?: number; // 0-100
    recoveryScore?: number;

    // Muscle activation (from Neural Skin Pod)
    muscleActivation?: Record<string, number>; // muscleId -> activation %

    // Movement (from GroundTruth)
    stepsCount?: number;
    distanceKm?: number;
    cadence?: number;

    // Respiratory (from AeroLung)
    breathingRate?: number;
    oxygenSaturation?: number;

    // Sport-specific (from Racket Sensor)
    swingSpeed?: number;
    impactForce?: number;
    spinRPM?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// USER PROFILE
// ═══════════════════════════════════════════════════════════════════════════

export type ProfileMode = 'ghost' | 'arena'; // Private vs Public

export interface UserProfile {
    id: string;
    username: string; // Unique, URL-safe, lowercase
    displayName: string;
    email?: string;
    avatar?: string;
    coverImage?: string;
    bio?: string;

    // Privacy & Visibility
    profileMode: ProfileMode;
    showLiveStatus: boolean;
    showFatigueToFriends: boolean;

    // Ranking & Progress
    leagueRank: LeagueRank;
    neuralBattery: number; // Current battery level
    totalWorkouts: number;
    totalMinutes: number;

    // Achievements
    badges: Badge[];
    featuredBadges: string[]; // IDs of up to 3 featured badges

    // Social
    followersCount: number;
    followingCount: number;
    clubIds: string[];

    // Hardware
    connectedDevices: SensorDeviceType[];
    lastSensorSync?: Date;

    // Live Status
    isLive: boolean;
    liveSessionId?: string;
    currentFatigue?: number;
    currentHeartRate?: number;

    // Metadata
    joinedAt: Date;
    lastActiveAt: Date;
    location?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// POSTS & FEED (Bio-Highlights)
// ═══════════════════════════════════════════════════════════════════════════

export type PostType = 'bio-highlight' | 'group-report' | 'achievement' | 'milestone';

export interface Endorsement {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    type: 'energy' | 'fire' | 'respect' | 'beast'; // Reaction types
    createdAt: Date;
}

export interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    createdAt: Date;
    likes: number;
    likedByUser?: boolean;
}

export interface Post {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    authorLeague: LeagueTier;

    type: PostType;
    content: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';

    // Proof of Effort - Required for bio-highlights
    sensorProof?: SensorDataSnapshot;
    hasSensorProof: boolean;

    // Workout context
    workoutType?: string;
    workoutDuration?: number; // minutes

    // Engagement
    endorsements: Endorsement[];
    endorsementCount: number;
    comments: Comment[];
    commentCount: number;

    // Visibility
    visibility: 'public' | 'followers' | 'club';
    clubId?: string;

    // Metadata
    createdAt: Date;
    updatedAt?: Date;
    isEdited: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH & DISCOVERY
// ═══════════════════════════════════════════════════════════════════════════

export interface UserSearchFilters {
    query?: string; // Name or username
    club?: string;
    minNeuralBattery?: number;
    maxNeuralBattery?: number;
    minVo2Max?: number;
    league?: LeagueTier;
    hasDevice?: SensorDeviceType;
    isLive?: boolean;
    location?: string;
}

export interface UserSearchResult {
    user: UserProfile;
    matchScore: number; // Relevance score
    highlights: string[]; // What matched
}

// ═══════════════════════════════════════════════════════════════════════════
// FOLLOW SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export interface FollowRelation {
    id: string;
    followerId: string;
    followingId: string;
    createdAt: Date;
    notificationsEnabled: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// LIVE STATUS
// ═══════════════════════════════════════════════════════════════════════════

export interface LiveStatusUpdate {
    userId: string;
    sessionId: string;
    isLive: boolean;
    startedAt: Date;
    workoutType: string;
    currentHeartRate?: number;
    currentFatigue?: number;
    canViewRealtime: boolean; // Based on privacy settings
}

// ═══════════════════════════════════════════════════════════════════════════
// CLUB INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

export interface ClubPost extends Post {
    clubId: string;
    clubName: string;
    isTrainerPost: boolean;
    isPinned: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CreatePostRequest {
    content: string;
    type: PostType;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    sensorProof?: SensorDataSnapshot;
    visibility: 'public' | 'followers' | 'club';
    clubId?: string;
    workoutType?: string;
    workoutDuration?: number;
}

export interface UpdateProfileRequest {
    displayName?: string;
    bio?: string;
    avatar?: string;
    coverImage?: string;
    profileMode?: ProfileMode;
    showLiveStatus?: boolean;
    showFatigueToFriends?: boolean;
    featuredBadges?: string[];
    location?: string;
}

export interface FeedOptions {
    limit: number;
    cursor?: string; // For pagination
    filter?: 'all' | 'following' | 'club';
    clubId?: string;
}

export interface FeedResponse {
    posts: Post[];
    nextCursor?: string;
    hasMore: boolean;
}
