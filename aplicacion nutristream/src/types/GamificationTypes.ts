/**
 * Gamification System Types
 * Defines the structure for levels, leagues, XP, and rewards
 */

export enum League {
    BRONZE = 'Bronze',
    SILVER = 'Silver',
    GOLD = 'Gold',
    PLATINUM = 'Platinum',
    DIAMOND = 'Diamond',
    ELITE = 'Elite'
}

export enum RewardType {
    DIGITAL = 'digital',        // Skins, profile customization
    ECONOMIC = 'economic',      // Discount coupons
    PHYSICAL = 'physical',      // Merchandising
    PREMIUM = 'premium',        // Consultations, premium features
    MYSTERY = 'mystery'         // Mystery rewards
}

export enum XPAxis {
    SUBSCRIPTION = 'subscription',   // Loyalty/time as Premium member
    PERFORMANCE = 'performance',     // Training improvements
    BIOMETRICS = 'biometrics',       // Health metrics improvements
    CONSISTENCY = 'consistency'      // Daily streaks
}

export interface Reward {
    id: string;
    type: RewardType;
    titleKey: string;           // Translation key for title
    descriptionKey: string;     // Translation key for description
    icon: string;               // Icon identifier or emoji
    value?: number;             // For discounts, free months, etc.
    isMystery?: boolean;        // Is this a mystery reward?
    claimed?: boolean;          // Has user claimed this reward?
    claimedAt?: Date;
    expiresAt?: Date;
}

export interface LevelData {
    level: number;
    league: League;
    xpRequired: number;         // Total XP needed to reach this level
    xpForLevel: number;         // XP needed from previous level
    rewards: Reward[];
    hasMysteryReward: boolean;
}

export interface UserGamificationState {
    totalXP: number;
    currentLevel: number;
    currentLeague: League;
    xpBreakdown: {
        [XPAxis.SUBSCRIPTION]: number;
        [XPAxis.PERFORMANCE]: number;
        [XPAxis.BIOMETRICS]: number;
        [XPAxis.CONSISTENCY]: number;
    };
    unlockedRewards: Reward[];
    currentStreak: number;      // Days in a row
    longestStreak: number;
    lastActivityDate?: Date;
    subscriptionStartDate?: Date;
    subscriptionDays: number;   // Total days as Premium member
}

export interface XPEvent {
    axis: XPAxis;
    amount: number;
    reason: string;             // Translation key for reason
    timestamp: Date;
}

export interface LeagueThresholds {
    league: League;
    minLevel: number;
    maxLevel: number;
    minXP: number;
    maxXP: number;
    gradient: string;           // CSS gradient for styling
}
