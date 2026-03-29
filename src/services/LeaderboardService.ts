// Leaderboard Service - Real-time competition management
import { Member } from '../types/ClubTypes';

export type MetricType = 'watts' | 'stability' | 'hr_zone' | 'vo2';

export interface LeaderboardEntry {
    memberId: string;
    name: string;
    avatar?: string;
    metric: number;
    rank: number;
    previousRank?: number;
    delta: number; // Change since last update
    isConnected: boolean;
}

export interface FlashChallenge {
    id: string;
    title: string;
    metric: MetricType;
    duration: number; // seconds
    reward: number; // NutriPoints
    startTime: Date;
    endTime: Date;
    isActive: boolean;
    participants: LeaderboardEntry[];
    winner?: LeaderboardEntry;
}

export interface LeaderboardConfig {
    metric: MetricType;
    refreshInterval: number; // ms
    showTop: number;
}

const METRIC_LABELS: Record<MetricType, { name: string; unit: string; icon: string }> = {
    watts: { name: 'TrueForce™ Power', unit: 'W', icon: '⚡' },
    stability: { name: 'GroundTruth Stability', unit: '%', icon: '🎯' },
    hr_zone: { name: 'HR Zone', unit: '', icon: '❤️' },
    vo2: { name: 'VO2 (AeroLung)', unit: 'ml/kg/min', icon: '💨' }
};

const FLASH_CHALLENGES: Omit<FlashChallenge, 'id' | 'startTime' | 'endTime' | 'isActive' | 'participants' | 'winner'>[] = [
    { title: '⚡ Power Surge', metric: 'watts', duration: 120, reward: 50 },
    { title: '🎯 Stability Master', metric: 'stability', duration: 90, reward: 40 },
    { title: '❤️ Zone Lock', metric: 'hr_zone', duration: 60, reward: 30 },
    { title: '💨 Oxygen Rush', metric: 'vo2', duration: 120, reward: 60 },
];

// Simulated real-time data generator
const generateMetricValue = (metric: MetricType, memberId: string): number => {
    const baseValues: Record<MetricType, number> = {
        watts: 180 + Math.random() * 120,
        stability: 70 + Math.random() * 25,
        hr_zone: 3 + Math.floor(Math.random() * 2),
        vo2: 35 + Math.random() * 15
    };

    // Add some consistency per member
    const memberHash = memberId.charCodeAt(memberId.length - 1) % 20;
    return Math.round((baseValues[metric] + memberHash) * 10) / 10;
};

export const LeaderboardService = {
    /**
     * Get metric display info
     */
    getMetricInfo: (metric: MetricType) => METRIC_LABELS[metric],

    /**
     * Generate leaderboard from members with simulated metrics
     */
    generateLeaderboard: (members: Member[], metric: MetricType): LeaderboardEntry[] => {
        const entries: LeaderboardEntry[] = members
            .filter(m => m.podConnected)
            .map(member => ({
                memberId: member.id,
                name: member.name,
                avatar: member.avatar,
                metric: generateMetricValue(metric, member.id),
                rank: 0,
                delta: Math.round((Math.random() - 0.5) * 20),
                isConnected: member.podConnected
            }));

        // Sort and assign ranks
        entries.sort((a, b) => b.metric - a.metric);
        entries.forEach((entry, idx) => {
            entry.rank = idx + 1;
        });

        return entries;
    },

    /**
     * Create a new flash challenge
     */
    createFlashChallenge: (members: Member[], challengeIndex?: number): FlashChallenge => {
        const template = FLASH_CHALLENGES[challengeIndex ?? Math.floor(Math.random() * FLASH_CHALLENGES.length)];
        const now = new Date();
        const endTime = new Date(now.getTime() + template.duration * 1000);

        const participants = LeaderboardService.generateLeaderboard(members, template.metric);

        return {
            id: `challenge-${Date.now()}`,
            ...template,
            startTime: now,
            endTime,
            isActive: true,
            participants
        };
    },

    /**
     * Update flash challenge with new rankings
     */
    updateChallenge: (challenge: FlashChallenge, members: Member[]): FlashChallenge => {
        const now = new Date();
        const isActive = now < challenge.endTime;

        const participants = LeaderboardService.generateLeaderboard(members, challenge.metric);

        // Preserve previous ranks for animation
        participants.forEach(p => {
            const prev = challenge.participants.find(cp => cp.memberId === p.memberId);
            p.previousRank = prev?.rank;
        });

        return {
            ...challenge,
            isActive,
            participants,
            winner: !isActive ? participants[0] : undefined
        };
    },

    /**
     * Get remaining time in challenge
     */
    getRemainingTime: (challenge: FlashChallenge): number => {
        const now = new Date();
        return Math.max(0, Math.floor((challenge.endTime.getTime() - now.getTime()) / 1000));
    },

    /**
     * Format metric value with unit
     */
    formatMetric: (value: number, metric: MetricType): string => {
        const info = METRIC_LABELS[metric];
        if (metric === 'watts') return `${Math.round(value)}${info.unit}`;
        if (metric === 'stability') return `${value.toFixed(1)}${info.unit}`;
        if (metric === 'hr_zone') return `Z${Math.round(value)}`;
        return `${value.toFixed(1)} ${info.unit}`;
    },

    /**
     * Get available challenge types
     */
    getChallengeTypes: () => FLASH_CHALLENGES.map((c, idx) => ({
        index: idx,
        title: c.title,
        metric: c.metric,
        duration: c.duration,
        reward: c.reward
    }))
};

export default LeaderboardService;
