// NutriStream Nexus Social Service
// Firebase-based service for social features: profiles, search, follows

import {
    UserProfile,
    UserSearchFilters,
    UserSearchResult,
    UpdateProfileRequest,
    FollowRelation,
    LiveStatusUpdate,
    LeagueTier,
    LeagueRank,
    Badge,
    ProfileMode
} from '../types/SocialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA - Replace with Firebase integration
// ═══════════════════════════════════════════════════════════════════════════

const mockUsers: UserProfile[] = [
    {
        id: 'user-001',
        username: 'carlos_fitness',
        displayName: 'Carlos Martínez',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        bio: '🏋️ Entrenador personal certificado | 💪 Especialista en fuerza | 🔥 5 años transformando vidas',
        profileMode: 'arena',
        showLiveStatus: true,
        showFatigueToFriends: true,
        leagueRank: { tier: 'diamond', level: 42, xp: 8500, xpToNextLevel: 10000, seasonPoints: 2450 },
        neuralBattery: 85,
        totalWorkouts: 347,
        totalMinutes: 18240,
        badges: [
            { id: 'b1', name: 'Neural Pioneer', description: 'First 100 Neural Skin sessions', icon: '🧠', category: 'hardware', rarity: 'epic' },
            { id: 'b2', name: 'Iron Will', description: '30-day streak', icon: '🔥', category: 'consistency', rarity: 'rare' }
        ],
        featuredBadges: ['b1', 'b2'],
        followersCount: 1247,
        followingCount: 89,
        clubIds: ['club-001'],
        connectedDevices: ['neural-skin', 'groundtruth'],
        lastSensorSync: new Date(),
        isLive: false,
        joinedAt: new Date('2024-01-15'),
        lastActiveAt: new Date(),
        location: 'Madrid, España'
    },
    {
        id: 'user-002',
        username: 'ana_runner',
        displayName: 'Ana García',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        bio: '🏃‍♀️ Maratonista | 🌟 VO2 Max: 58 | 🎯 Próximo objetivo: Sub-3h',
        profileMode: 'arena',
        showLiveStatus: true,
        showFatigueToFriends: false,
        leagueRank: { tier: 'platinum', level: 35, xp: 7200, xpToNextLevel: 8500, seasonPoints: 1890 },
        neuralBattery: 72,
        totalWorkouts: 523,
        totalMinutes: 31420,
        badges: [
            { id: 'b3', name: 'Road Warrior', description: '1000km completed', icon: '🛤️', category: 'milestone', rarity: 'legendary' }
        ],
        featuredBadges: ['b3'],
        followersCount: 892,
        followingCount: 156,
        clubIds: ['club-002'],
        connectedDevices: ['groundtruth', 'aerolung'],
        isLive: true,
        liveSessionId: 'session-live-001',
        currentFatigue: 45,
        currentHeartRate: 142,
        joinedAt: new Date('2023-08-20'),
        lastActiveAt: new Date(),
        location: 'Barcelona, España'
    },
    {
        id: 'user-003',
        username: 'pablo_padel',
        displayName: 'Pablo Fernández',
        avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
        bio: '🎾 Jugador de Pádel Pro | 🏆 Campeón regional 2024',
        profileMode: 'arena',
        showLiveStatus: true,
        showFatigueToFriends: true,
        leagueRank: { tier: 'elite', level: 48, xp: 9800, xpToNextLevel: 10000, seasonPoints: 3200 },
        neuralBattery: 91,
        totalWorkouts: 412,
        totalMinutes: 24720,
        badges: [
            { id: 'b4', name: 'Racket Master', description: '500 analyzed swings', icon: '🎾', category: 'hardware', rarity: 'epic' }
        ],
        featuredBadges: ['b4'],
        followersCount: 2341,
        followingCount: 67,
        clubIds: ['club-003'],
        connectedDevices: ['neural-skin', 'racket', 'aerovision'],
        isLive: false,
        joinedAt: new Date('2023-05-10'),
        lastActiveAt: new Date(),
        location: 'Valencia, España'
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// SOCIAL SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class SocialService {

    // ─────────────────────────────────────────────────────────────────────────
    // PROFILE OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get user profile by ID
     */
    static async getProfileById(userId: string): Promise<UserProfile | null> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockUsers.find(u => u.id === userId) || null;
    }

    /**
     * Get user profile by username (for public profile page)
     */
    static async getProfileByUsername(username: string): Promise<UserProfile | null> {
        await new Promise(resolve => setTimeout(resolve, 300));
        const user = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase());

        // If ghost mode, only return if viewer has permission (simplified)
        if (user && user.profileMode === 'ghost') {
            return null; // In real app, check if viewer is following
        }

        return user || null;
    }

    /**
     * Update user profile
     */
    static async updateProfile(userId: string, updates: UpdateProfileRequest): Promise<UserProfile> {
        await new Promise(resolve => setTimeout(resolve, 500));

        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        // Apply updates
        const updatedUser = {
            ...mockUsers[userIndex],
            ...updates,
            lastActiveAt: new Date()
        };

        mockUsers[userIndex] = updatedUser;
        return updatedUser;
    }

    /**
     * Toggle profile mode (ghost/arena)
     */
    static async toggleProfileMode(userId: string): Promise<ProfileMode> {
        const user = mockUsers.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        user.profileMode = user.profileMode === 'ghost' ? 'arena' : 'ghost';
        return user.profileMode;
    }

    /**
     * Check if username is available
     */
    static async isUsernameAvailable(username: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return !mockUsers.some(u => u.username.toLowerCase() === username.toLowerCase());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SEARCH & DISCOVERY
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Search users with filters
     */
    static async searchUsers(filters: UserSearchFilters): Promise<UserSearchResult[]> {
        await new Promise(resolve => setTimeout(resolve, 400));

        let results = mockUsers.filter(user => {
            // Only search arena (public) profiles
            if (user.profileMode === 'ghost') return false;

            // Text query
            if (filters.query) {
                const query = filters.query.toLowerCase();
                const matchesName = user.displayName.toLowerCase().includes(query);
                const matchesUsername = user.username.toLowerCase().includes(query);
                const matchesBio = user.bio?.toLowerCase().includes(query);
                if (!matchesName && !matchesUsername && !matchesBio) return false;
            }

            // Neural Battery range
            if (filters.minNeuralBattery && user.neuralBattery < filters.minNeuralBattery) return false;
            if (filters.maxNeuralBattery && user.neuralBattery > filters.maxNeuralBattery) return false;

            // League filter
            if (filters.league && user.leagueRank.tier !== filters.league) return false;

            // Device filter
            if (filters.hasDevice && !user.connectedDevices.includes(filters.hasDevice)) return false;

            // Live status
            if (filters.isLive !== undefined && user.isLive !== filters.isLive) return false;

            // Location
            if (filters.location) {
                const loc = filters.location.toLowerCase();
                if (!user.location?.toLowerCase().includes(loc)) return false;
            }

            return true;
        });

        // Calculate match scores and create results
        return results.map(user => ({
            user,
            matchScore: this.calculateMatchScore(user, filters),
            highlights: this.getSearchHighlights(user, filters)
        })).sort((a, b) => b.matchScore - a.matchScore);
    }

    private static calculateMatchScore(user: UserProfile, filters: UserSearchFilters): number {
        let score = 50; // Base score

        if (filters.query) {
            if (user.username.toLowerCase().includes(filters.query.toLowerCase())) score += 30;
            if (user.displayName.toLowerCase().includes(filters.query.toLowerCase())) score += 20;
        }

        // Higher league = higher score
        const tierScores: Record<LeagueTier, number> = {
            bronze: 5, silver: 10, gold: 15, platinum: 20, diamond: 25, elite: 30
        };
        score += tierScores[user.leagueRank.tier];

        // Live bonus
        if (user.isLive) score += 15;

        return score;
    }

    private static getSearchHighlights(user: UserProfile, filters: UserSearchFilters): string[] {
        const highlights: string[] = [];

        if (user.isLive) highlights.push('🔴 EN VIVO');
        highlights.push(`⚡ ${user.neuralBattery}% Neural Battery`);
        highlights.push(`🏆 ${user.leagueRank.tier.charAt(0).toUpperCase() + user.leagueRank.tier.slice(1)} League`);

        return highlights;
    }

    /**
     * Get suggested users to follow
     */
    static async getSuggestedUsers(currentUserId: string, limit: number = 5): Promise<UserProfile[]> {
        await new Promise(resolve => setTimeout(resolve, 300));

        return mockUsers
            .filter(u => u.id !== currentUserId && u.profileMode === 'arena')
            .slice(0, limit);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FOLLOW SYSTEM
    // ─────────────────────────────────────────────────────────────────────────

    private static follows: FollowRelation[] = [];

    /**
     * Follow a user
     */
    static async followUser(followerId: string, followingId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Check if already following
        const existing = this.follows.find(
            f => f.followerId === followerId && f.followingId === followingId
        );
        if (existing) return;

        this.follows.push({
            id: `follow-${Date.now()}`,
            followerId,
            followingId,
            createdAt: new Date(),
            notificationsEnabled: true
        });

        // Update counts
        const follower = mockUsers.find(u => u.id === followerId);
        const following = mockUsers.find(u => u.id === followingId);
        if (follower) follower.followingCount++;
        if (following) following.followersCount++;
    }

    /**
     * Unfollow a user
     */
    static async unfollowUser(followerId: string, followingId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const index = this.follows.findIndex(
            f => f.followerId === followerId && f.followingId === followingId
        );

        if (index !== -1) {
            this.follows.splice(index, 1);

            const follower = mockUsers.find(u => u.id === followerId);
            const following = mockUsers.find(u => u.id === followingId);
            if (follower) follower.followingCount--;
            if (following) following.followersCount--;
        }
    }

    /**
     * Check if user A follows user B
     */
    static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
        return this.follows.some(
            f => f.followerId === followerId && f.followingId === followingId
        );
    }

    /**
     * Get followers of a user
     */
    static async getFollowers(userId: string): Promise<UserProfile[]> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const followerIds = this.follows
            .filter(f => f.followingId === userId)
            .map(f => f.followerId);

        return mockUsers.filter(u => followerIds.includes(u.id));
    }

    /**
     * Get users that someone is following
     */
    static async getFollowing(userId: string): Promise<UserProfile[]> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const followingIds = this.follows
            .filter(f => f.followerId === userId)
            .map(f => f.followingId);

        return mockUsers.filter(u => followingIds.includes(u.id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LIVE STATUS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get live status of a user
     */
    static async getLiveStatus(userId: string): Promise<LiveStatusUpdate | null> {
        const user = mockUsers.find(u => u.id === userId);
        if (!user || !user.isLive) return null;

        return {
            userId: user.id,
            sessionId: user.liveSessionId || '',
            isLive: true,
            startedAt: new Date(Date.now() - 1000 * 60 * 25), // 25 min ago
            workoutType: 'Strength Training',
            currentHeartRate: user.currentHeartRate,
            currentFatigue: user.currentFatigue,
            canViewRealtime: user.showFatigueToFriends
        };
    }

    /**
     * Get all live users that the current user can see
     */
    static async getLiveFollowing(userId: string): Promise<LiveStatusUpdate[]> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const followingIds = this.follows
            .filter(f => f.followerId === userId)
            .map(f => f.followingId);

        const liveUsers = mockUsers.filter(
            u => followingIds.includes(u.id) && u.isLive && u.showLiveStatus
        );

        return liveUsers.map(user => ({
            userId: user.id,
            sessionId: user.liveSessionId || '',
            isLive: true,
            startedAt: new Date(Date.now() - 1000 * 60 * Math.random() * 60),
            workoutType: 'Training Session',
            currentHeartRate: user.currentHeartRate,
            currentFatigue: user.currentFatigue,
            canViewRealtime: user.showFatigueToFriends
        }));
    }
}

export default SocialService;
