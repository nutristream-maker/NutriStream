import { LeagueTier } from '../types/SocialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ChallengeType = 'weekly' | 'monthly' | 'special' | 'club';
export type ChallengeStatus = 'upcoming' | 'active' | 'completed' | 'expired';

export interface Challenge {
    id: string;
    title: string;
    description: string;
    type: ChallengeType;
    status: ChallengeStatus;
    startDate: Date;
    endDate: Date;
    requirements: ChallengeRequirement[];
    rewards: ChallengeReward[];
    participants: number;
    completions: number;
    clubId?: string;
    badgeId?: string;
    imageUrl?: string;
}

export interface ChallengeRequirement {
    type: 'workouts' | 'distance' | 'calories' | 'neural_battery' | 'vo2max' | 'duration';
    target: number;
    unit: string;
    sensorRequired?: boolean;
}

export interface ChallengeReward {
    type: 'xp' | 'badge' | 'discount' | 'item';
    value: number | string;
    description: string;
}

export interface ChallengeProgress {
    challengeId: string;
    userId: string;
    progress: { requirementIndex: number; current: number }[];
    isCompleted: boolean;
    completedAt?: Date;
    rank?: number;
}

export interface ChallengeLeaderboard {
    challengeId: string;
    entries: LeaderboardEntry[];
}

export interface LeaderboardEntry {
    userId: string;
    userName: string;
    userAvatar: string;
    userLeague: LeagueTier;
    score: number;
    rank: number;
    isCompleted: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const mockChallenges: Challenge[] = [
    {
        id: 'ch-1',
        title: 'Neural Battery 100%',
        description: 'Completa 5 entrenamientos esta semana manteniendo tu Neural Battery por encima del 80%',
        type: 'weekly',
        status: 'active',
        startDate: new Date(Date.now() - 86400000 * 3),
        endDate: new Date(Date.now() + 86400000 * 4),
        requirements: [
            { type: 'workouts', target: 5, unit: 'entrenamientos', sensorRequired: true },
            { type: 'neural_battery', target: 80, unit: '%', sensorRequired: true }
        ],
        rewards: [
            { type: 'xp', value: 500, description: '500 XP' },
            { type: 'badge', value: 'neural_champion', description: 'Badge "Neural Champion"' }
        ],
        participants: 1247,
        completions: 342
    },
    {
        id: 'ch-2',
        title: 'Maratón de Calorías',
        description: 'Quema 5000 calorías en total durante este mes con cualquier actividad',
        type: 'monthly',
        status: 'active',
        startDate: new Date(Date.now() - 86400000 * 15),
        endDate: new Date(Date.now() + 86400000 * 15),
        requirements: [
            { type: 'calories', target: 5000, unit: 'kcal', sensorRequired: true }
        ],
        rewards: [
            { type: 'xp', value: 1000, description: '1000 XP' },
            { type: 'badge', value: 'calorie_crusher', description: 'Badge "Calorie Crusher"' },
            { type: 'discount', value: '15%', description: '15% descuento en tienda' }
        ],
        participants: 3890,
        completions: 567
    },
    {
        id: 'ch-3',
        title: 'VO2 Max Beast',
        description: 'Alcanza un VO2 Max de 50+ en cualquier sesión de cardio intenso',
        type: 'special',
        status: 'active',
        startDate: new Date(Date.now() - 86400000 * 7),
        endDate: new Date(Date.now() + 86400000 * 7),
        requirements: [
            { type: 'vo2max', target: 50, unit: 'ml/kg/min', sensorRequired: true }
        ],
        rewards: [
            { type: 'xp', value: 750, description: '750 XP' },
            { type: 'badge', value: 'vo2_beast', description: 'Badge "VO2 Beast"' }
        ],
        participants: 892,
        completions: 156
    },
    {
        id: 'ch-4',
        title: 'Semana Consistente',
        description: 'Entrena al menos 30 minutos cada día durante 7 días consecutivos',
        type: 'weekly',
        status: 'upcoming',
        startDate: new Date(Date.now() + 86400000 * 2),
        endDate: new Date(Date.now() + 86400000 * 9),
        requirements: [
            { type: 'duration', target: 30 * 7, unit: 'minutos', sensorRequired: false }
        ],
        rewards: [
            { type: 'xp', value: 600, description: '600 XP' },
            { type: 'badge', value: 'iron_week', description: 'Badge "Iron Week"' }
        ],
        participants: 0,
        completions: 0
    }
];

const mockProgress: ChallengeProgress[] = [
    {
        challengeId: 'ch-1',
        userId: 'u-1',
        progress: [
            { requirementIndex: 0, current: 3 },
            { requirementIndex: 1, current: 85 }
        ],
        isCompleted: false
    },
    {
        challengeId: 'ch-2',
        userId: 'u-1',
        progress: [
            { requirementIndex: 0, current: 2340 }
        ],
        isCompleted: false
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// CHALLENGE SERVICE
// ═══════════════════════════════════════════════════════════════════════════

class ChallengeServiceClass {
    /**
     * Get all active challenges
     */
    async getActiveChallenges(): Promise<Challenge[]> {
        await new Promise(r => setTimeout(r, 200));
        return mockChallenges.filter(c => c.status === 'active' || c.status === 'upcoming');
    }

    /**
     * Get challenge by ID
     */
    async getChallengeById(challengeId: string): Promise<Challenge | null> {
        await new Promise(r => setTimeout(r, 100));
        return mockChallenges.find(c => c.id === challengeId) || null;
    }

    /**
     * Get user's challenge progress
     */
    async getUserProgress(userId: string): Promise<ChallengeProgress[]> {
        await new Promise(r => setTimeout(r, 150));
        return mockProgress.filter(p => p.userId === userId);
    }

    /**
     * Join a challenge
     */
    async joinChallenge(userId: string, challengeId: string): Promise<void> {
        await new Promise(r => setTimeout(r, 200));

        const challenge = mockChallenges.find(c => c.id === challengeId);
        if (challenge) {
            challenge.participants += 1;
        }

        const existing = mockProgress.find(p => p.userId === userId && p.challengeId === challengeId);
        if (!existing) {
            const challenge = mockChallenges.find(c => c.id === challengeId);
            if (challenge) {
                mockProgress.push({
                    challengeId,
                    userId,
                    progress: challenge.requirements.map((_, i) => ({ requirementIndex: i, current: 0 })),
                    isCompleted: false
                });
            }
        }
    }

    /**
     * Get challenge leaderboard
     */
    async getLeaderboard(challengeId: string, limit = 10): Promise<LeaderboardEntry[]> {
        await new Promise(r => setTimeout(r, 200));

        // Mock leaderboard
        return [
            { userId: 'u-3', userName: 'Elena Pérez', userAvatar: 'https://randomuser.me/api/portraits/women/3.jpg', userLeague: 'diamond', score: 5, rank: 1, isCompleted: true },
            { userId: 'u-4', userName: 'Miguel López', userAvatar: 'https://randomuser.me/api/portraits/men/4.jpg', userLeague: 'platinum', score: 4, rank: 2, isCompleted: false },
            { userId: 'u-1', userName: 'Tú', userAvatar: 'https://randomuser.me/api/portraits/men/1.jpg', userLeague: 'gold', score: 3, rank: 3, isCompleted: false },
            { userId: 'u-5', userName: 'Laura Martín', userAvatar: 'https://randomuser.me/api/portraits/women/5.jpg', userLeague: 'gold', score: 3, rank: 4, isCompleted: false },
            { userId: 'u-6', userName: 'Pablo García', userAvatar: 'https://randomuser.me/api/portraits/men/6.jpg', userLeague: 'silver', score: 2, rank: 5, isCompleted: false }
        ].slice(0, limit);
    }

    /**
     * Get completed challenges for badge showcase
     */
    async getCompletedChallenges(userId: string): Promise<Challenge[]> {
        await new Promise(r => setTimeout(r, 150));

        const completedIds = mockProgress
            .filter(p => p.userId === userId && p.isCompleted)
            .map(p => p.challengeId);

        return mockChallenges.filter(c => completedIds.includes(c.id));
    }
}

export const ChallengeService = new ChallengeServiceClass();
export default ChallengeService;

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY EXPORTS FOR DASHBOARD COMPATIBILITY
// ═══════════════════════════════════════════════════════════════════════════

// Dashboard Challenge Type (different structure from Nexus Challenge)
export interface DashboardParticipant {
    id: string;
    name: string;
    avatar: string;
    currentValue: number;
    targetValue: number;
    progress: number;
}

export interface DashboardChallenge {
    id: string;
    title: string;
    type: 'steps' | 'calories' | 'distance' | 'workout_minutes';
    goal: number;
    unit: string;
    startDate: Date;
    endDate: Date;
    participants: DashboardParticipant[];
    reward: { xp: number; badge?: string };
}

export const CHALLENGE_TYPES: Record<string, { icon: string; color: string; description: string }> = {
    steps: { icon: '👟', color: 'emerald', description: 'Compite por el mayor número de pasos' },
    calories: { icon: '🔥', color: 'amber', description: 'Quema más calorías que tu rival' },
    distance: { icon: '🏃', color: 'blue', description: 'Recorre la mayor distancia posible' },
    workout_minutes: { icon: '⏱️', color: 'purple', description: 'Acumula más minutos de entrenamiento' }
};

export function getMockChallenges(): DashboardChallenge[] {
    return [
        {
            id: 'dash-ch-1',
            title: 'Desafío de Pasos',
            type: 'steps',
            goal: 50000,
            unit: 'pasos',
            startDate: new Date(Date.now() - 86400000 * 3),
            endDate: new Date(Date.now() + 86400000 * 4),
            participants: [
                { id: 'user_1', name: 'Tú', avatar: '/avatars/user.jpg', currentValue: 32500, targetValue: 50000, progress: 65 },
                { id: 'user_2', name: 'Carlos', avatar: '/avatars/carlos.jpg', currentValue: 28000, targetValue: 50000, progress: 56 }
            ],
            reward: { xp: 300, badge: 'Step Master' }
        },
        {
            id: 'dash-ch-2',
            title: 'Maratón de Calorías',
            type: 'calories',
            goal: 3000,
            unit: 'kcal',
            startDate: new Date(Date.now() - 86400000 * 5),
            endDate: new Date(Date.now() + 86400000 * 2),
            participants: [
                { id: 'user_1', name: 'Tú', avatar: '/avatars/user.jpg', currentValue: 1800, targetValue: 3000, progress: 60 },
                { id: 'user_3', name: 'Elena', avatar: '/avatars/elena.jpg', currentValue: 2100, targetValue: 3000, progress: 70 }
            ],
            reward: { xp: 500, badge: 'Calorie Burner' }
        }
    ];
}

export function getTimeRemaining(challenge: DashboardChallenge): string {
    const diff = challenge.endDate.getTime() - Date.now();
    if (diff <= 0) return 'Finalizado';

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);

    if (days > 0) return `${days}d ${hours}h restantes`;
    return `${hours}h restantes`;
}

