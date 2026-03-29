import { League, LevelData, Reward, RewardType, LeagueThresholds } from '../types/GamificationTypes';

/**
 * Gamification System Configuration
 * Contains all 50 levels with XP requirements and rewards
 */

// League Thresholds and Styling
export const LEAGUE_THRESHOLDS: LeagueThresholds[] = [
    {
        league: League.BRONZE,
        minLevel: 1,
        maxLevel: 5,
        minXP: 0,
        maxXP: 1000,
        gradient: 'linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)'
    },
    {
        league: League.SILVER,
        minLevel: 6,
        maxLevel: 15,
        minXP: 1001,
        maxXP: 11500,
        gradient: 'linear-gradient(135deg, #c0c0c0 0%, #808080 100%)'
    },
    {
        league: League.GOLD,
        minLevel: 16,
        maxLevel: 25,
        minXP: 11501,
        maxXP: 38000,
        gradient: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)'
    },
    {
        league: League.PLATINUM,
        minLevel: 26,
        maxLevel: 35,
        minXP: 38001,
        maxXP: 90500,
        gradient: 'linear-gradient(135deg, #e5e4e2 0%, #b0b0b0 100%)'
    },
    {
        league: League.DIAMOND,
        minLevel: 36,
        maxLevel: 45,
        minXP: 90501,
        maxXP: 175500,
        gradient: 'linear-gradient(135deg, #b9f2ff 0%, #00bfff 100%)'
    },
    {
        league: League.ELITE,
        minLevel: 46,
        maxLevel: 50,
        minXP: 175501,
        maxXP: 999999,
        gradient: 'linear-gradient(135deg, #9b59b6 0%, #e74c3c 100%)'
    }
];

// XP Calculation Rates
export const XP_RATES = {
    // Subscription: 50 NP per day as Premium member
    subscriptionPerDay: 50,

    // Performance: XP based on improvement magnitude
    performanceSmall: 100,      // Small PR improvement
    performanceMedium: 250,     // Medium PR improvement
    performanceLarge: 500,      // Major PR breakthrough

    // Biometrics: Health metric improvements
    biometricsSmall: 75,        // Slight improvement
    biometricsMedium: 150,      // Noticeable improvement
    biometricsLarge: 300,       // Significant improvement

    // Consistency: Daily streaks
    consistencyDaily: 25,       // Per day in streak
    consistencyWeekBonus: 100,  // 7-day streak bonus
    consistencyMonthBonus: 500, // 30-day streak bonus
    consistencyQuarterBonus: 2000 // 90-day streak bonus
};

// Complete 50-Level System
export const LEVELS: LevelData[] = [
    // BRONZE LEAGUE (Levels 1-5) - Fast initial progression for Endowment Effect
    {
        level: 1,
        league: League.BRONZE,
        xpRequired: 0,
        xpForLevel: 0,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 2,
        league: League.BRONZE,
        xpRequired: 100,
        xpForLevel: 100,
        rewards: [
            {
                id: 'reward_lv2_badge',
                type: RewardType.DIGITAL,
                titleKey: 'reward_bronzeStarter',
                descriptionKey: 'reward_bronzeStarter_desc',
                icon: '🥉'
            }
        ],
        hasMysteryReward: false
    },
    {
        level: 3,
        league: League.BRONZE,
        xpRequired: 250,
        xpForLevel: 150,
        rewards: [
            {
                id: 'reward_lv3_skin',
                type: RewardType.DIGITAL,
                titleKey: 'reward_basicSkin',
                descriptionKey: 'reward_basicSkin_desc',
                icon: '🎨'
            }
        ],
        hasMysteryReward: false
    },
    {
        level: 4,
        league: League.BRONZE,
        xpRequired: 450,
        xpForLevel: 200,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 5,
        league: League.BRONZE,
        xpRequired: 700,
        xpForLevel: 250,
        rewards: [
            {
                id: 'reward_lv5_discount',
                type: RewardType.ECONOMIC,
                titleKey: 'reward_discount5',
                descriptionKey: 'reward_discount5_desc',
                icon: '💰',
                value: 5
            }
        ],
        hasMysteryReward: false
    },

    // SILVER LEAGUE (Levels 6-15)
    {
        level: 6,
        league: League.SILVER,
        xpRequired: 1000,
        xpForLevel: 300,
        rewards: [
            {
                id: 'reward_lv6_badge',
                type: RewardType.DIGITAL,
                titleKey: 'reward_silverEntry',
                descriptionKey: 'reward_silverEntry_desc',
                icon: '🥈'
            }
        ],
        hasMysteryReward: false
    },
    {
        level: 7,
        league: League.SILVER,
        xpRequired: 1400,
        xpForLevel: 400,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 8,
        league: League.SILVER,
        xpRequired: 1900,
        xpForLevel: 500,
        rewards: [
            {
                id: 'reward_lv8_skin',
                type: RewardType.DIGITAL,
                titleKey: 'reward_silverSkin',
                descriptionKey: 'reward_silverSkin_desc',
                icon: '🎨'
            }
        ],
        hasMysteryReward: false
    },
    {
        level: 9,
        league: League.SILVER,
        xpRequired: 2500,
        xpForLevel: 600,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 10,
        league: League.SILVER,
        xpRequired: 3200,
        xpForLevel: 700,
        rewards: [
            {
                id: 'reward_lv10_discount',
                type: RewardType.ECONOMIC,
                titleKey: 'reward_discount10',
                descriptionKey: 'reward_discount10_desc',
                icon: '💎',
                value: 10
            },
            {
                id: 'reward_lv10_mystery',
                type: RewardType.MYSTERY,
                titleKey: 'reward_mystery',
                descriptionKey: 'reward_mystery_desc',
                icon: '🎁',
                isMystery: true
            }
        ],
        hasMysteryReward: true
    },
    {
        level: 11,
        league: League.SILVER,
        xpRequired: 4000,
        xpForLevel: 800,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 12,
        league: League.SILVER,
        xpRequired: 4900,
        xpForLevel: 900,
        rewards: [
            {
                id: 'reward_lv12_skin',
                type: RewardType.DIGITAL,
                titleKey: 'reward_improvedSkin',
                descriptionKey: 'reward_improvedSkin_desc',
                icon: '🎨'
            }
        ],
        hasMysteryReward: false
    },
    {
        level: 13,
        league: League.SILVER,
        xpRequired: 5900,
        xpForLevel: 1000,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 14,
        league: League.SILVER,
        xpRequired: 7000,
        xpForLevel: 1100,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 15,
        league: League.SILVER,
        xpRequired: 8300,
        xpForLevel: 1300,
        rewards: [
            {
                id: 'reward_lv15_consultation',
                type: RewardType.PREMIUM,
                titleKey: 'reward_freeWellness',
                descriptionKey: 'reward_freeWellness_desc',
                icon: '🩺'
            }
        ],
        hasMysteryReward: false
    },

    // GOLD LEAGUE (Levels 16-25)
    {
        level: 16,
        league: League.GOLD,
        xpRequired: 9800,
        xpForLevel: 1500,
        rewards: [
            {
                id: 'reward_lv16_badge',
                type: RewardType.DIGITAL,
                titleKey: 'reward_goldEntry',
                descriptionKey: 'reward_goldEntry_desc',
                icon: '🥇'
            }
        ],
        hasMysteryReward: false
    },
    {
        level: 17,
        league: League.GOLD,
        xpRequired: 11500,
        xpForLevel: 1700,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 18,
        league: League.GOLD,
        xpRequired: 13400,
        xpForLevel: 1900,
        rewards: [
            {
                id: 'reward_lv18_skin',
                type: RewardType.DIGITAL,
                titleKey: 'reward_goldSkin',
                descriptionKey: 'reward_goldSkin_desc',
                icon: '✨'
            }
        ],
        hasMysteryReward: false
    },
    {
        level: 19,
        league: League.GOLD,
        xpRequired: 15500,
        xpForLevel: 2100,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 20,
        league: League.GOLD,
        xpRequired: 17800,
        xpForLevel: 2300,
        rewards: [
            {
                id: 'reward_lv20_discount',
                type: RewardType.ECONOMIC,
                titleKey: 'reward_discount15',
                descriptionKey: 'reward_discount15_desc',
                icon: '💰',
                value: 15
            },
            {
                id: 'reward_lv20_mystery',
                type: RewardType.MYSTERY,
                titleKey: 'reward_mystery',
                descriptionKey: 'reward_mystery_desc',
                icon: '🎁',
                isMystery: true
            }
        ],
        hasMysteryReward: true
    },
    {
        level: 21,
        league: League.GOLD,
        xpRequired: 20400,
        xpForLevel: 2600,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 22,
        league: League.GOLD,
        xpRequired: 23200,
        xpForLevel: 2800,
        rewards: [
            {
                id: 'reward_lv22_fitness',
                type: RewardType.PREMIUM,
                titleKey: 'reward_fitnessConsult',
                descriptionKey: 'reward_fitnessConsult_desc',
                icon: '💪'
            }
        ],
        hasMysteryReward: false
    },
    {
        level: 23,
        league: League.GOLD,
        xpRequired: 26200,
        xpForLevel: 3000,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 24,
        league: League.GOLD,
        xpRequired: 29400,
        xpForLevel: 3200,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 25,
        league: League.GOLD,
        xpRequired: 33000,
        xpForLevel: 3600,
        rewards: [
            {
                id: 'reward_lv25_merch',
                type: RewardType.PHYSICAL,
                titleKey: 'reward_merchBasic',
                descriptionKey: 'reward_merchBasic_desc',
                icon: '👕'
            }
        ],
        hasMysteryReward: false
    },

    // PLATINUM LEAGUE (Levels 26-35)
    {
        level: 26,
        league: League.PLATINUM,
        xpRequired: 37000,
        xpForLevel: 4000,
        rewards: [
            {
                id: 'reward_lv26_badge',
                type: RewardType.DIGITAL,
                titleKey: 'reward_platinumEntry',
                descriptionKey: 'reward_platinumEntry_desc',
                icon: '⚪'
            }
        ],
        hasMysteryReward: false
    },
    {
        level: 27,
        league: League.PLATINUM,
        xpRequired: 41400,
        xpForLevel: 4400,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 28,
        league: League.PLATINUM,
        xpRequired: 46000,
        xpForLevel: 4600,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 29,
        league: League.PLATINUM,
        xpRequired: 51000,
        xpForLevel: 5000,
        rewards: [
            {
                id: 'reward_lv29_skin',
                type: RewardType.DIGITAL,
                titleKey: 'reward_platinumSkin',
                descriptionKey: 'reward_platinumSkin_desc',
                icon: '🌟'
            }
        ],
        hasMysteryReward: false
    },
    {
        level: 30,
        league: League.PLATINUM,
        xpRequired: 56500,
        xpForLevel: 5500,
        rewards: [
            {
                id: 'reward_lv30_discount',
                type: RewardType.ECONOMIC,
                titleKey: 'reward_discount20',
                descriptionKey: 'reward_discount20_desc',
                icon: '💎',
                value: 20
            },
            {
                id: 'reward_lv30_mystery',
                type: RewardType.MYSTERY,
                titleKey: 'reward_mystery',
                descriptionKey: 'reward_mystery_desc',
                icon: '🎁',
                isMystery: true
            }
        ],
        hasMysteryReward: true
    },
    {
        level: 31,
        league: League.PLATINUM,
        xpRequired: 62500,
        xpForLevel: 6000,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 32,
        league: League.PLATINUM,
        xpRequired: 69000,
        xpForLevel: 6500,
        rewards: [
            {
                id: 'reward_lv32_skin',
                type: RewardType.DIGITAL,
                titleKey: 'reward_premiumSkin',
                descriptionKey: 'reward_premiumSkin_desc',
                icon: '👑'
            }
        ],
        hasMysteryReward: false
    },
    {
        level: 33,
        league: League.PLATINUM,
        xpRequired: 76000,
        xpForLevel: 7000,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 34,
        league: League.PLATINUM,
        xpRequired: 83500,
        xpForLevel: 7500,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 35,
        league: League.PLATINUM,
        xpRequired: 91500,
        xpForLevel: 8000,
        rewards: [
            {
                id: 'reward_lv35_merch',
                type: RewardType.PHYSICAL,
                titleKey: 'reward_merchPremium',
                descriptionKey: 'reward_merchPremium_desc',
                icon: '🎽'
            }
        ],
        hasMysteryReward: false
    },

    // DIAMOND LEAGUE (Levels 36-45)
    {
        level: 36,
        league: League.DIAMOND,
        xpRequired: 100000,
        xpForLevel: 8500,
        rewards: [
            {
                id: 'reward_lv36_badge',
                type: RewardType.DIGITAL,
                titleKey: 'reward_diamondEntry',
                descriptionKey: 'reward_diamondEntry_desc',
                icon: '💎'
            }
        ],
        hasMysteryReward: false
    },
    {
        level: 37,
        league: League.DIAMOND,
        xpRequired: 109000,
        xpForLevel: 9000,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 38,
        league: League.DIAMOND,
        xpRequired: 118500,
        xpForLevel: 9500,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 39,
        league: League.DIAMOND,
        xpRequired: 128500,
        xpForLevel: 10000,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 40,
        league: League.DIAMOND,
        xpRequired: 139000,
        xpForLevel: 10500,
        rewards: [
            {
                id: 'reward_lv40_discount',
                type: RewardType.ECONOMIC,
                titleKey: 'reward_discount25',
                descriptionKey: 'reward_discount25_desc',
                icon: '💰',
                value: 25
            },
            {
                id: 'reward_lv40_mystery',
                type: RewardType.MYSTERY,
                titleKey: 'reward_mystery',
                descriptionKey: 'reward_mystery_desc',
                icon: '🎁',
                isMystery: true
            }
        ],
        hasMysteryReward: true
    },
    {
        level: 41,
        league: League.DIAMOND,
        xpRequired: 150000,
        xpForLevel: 11000,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 42,
        league: League.DIAMOND,
        xpRequired: 161500,
        xpForLevel: 11500,
        rewards: [
            {
                id: 'reward_lv42_consult',
                type: RewardType.PREMIUM,
                titleKey: 'reward_nutritionTrainer',
                descriptionKey: 'reward_nutritionTrainer_desc',
                icon: '🥗'
            }
        ],
        hasMysteryReward: false
    },
    {
        level: 43,
        league: League.DIAMOND,
        xpRequired: 173500,
        xpForLevel: 12000,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 44,
        league: League.DIAMOND,
        xpRequired: 186000,
        xpForLevel: 12500,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 45,
        league: League.DIAMOND,
        xpRequired: 199000,
        xpForLevel: 13000,
        rewards: [
            {
                id: 'reward_lv45_merch',
                type: RewardType.PHYSICAL,
                titleKey: 'reward_merchExclusive',
                descriptionKey: 'reward_merchExclusive_desc',
                icon: '🏆'
            }
        ],
        hasMysteryReward: false
    },

    // ELITE LEAGUE (Levels 46-50)
    {
        level: 46,
        league: League.ELITE,
        xpRequired: 212500,
        xpForLevel: 13500,
        rewards: [
            {
                id: 'reward_lv46_badge',
                type: RewardType.DIGITAL,
                titleKey: 'reward_eliteEntry',
                descriptionKey: 'reward_eliteEntry_desc',
                icon: '👑'
            },
            {
                id: 'reward_lv46_discount',
                type: RewardType.ECONOMIC,
                titleKey: 'reward_discount30Permanent',
                descriptionKey: 'reward_discount30Permanent_desc',
                icon: '💎',
                value: 30
            }
        ],
        hasMysteryReward: false
    },
    {
        level: 47,
        league: League.ELITE,
        xpRequired: 226500,
        xpForLevel: 14000,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 48,
        league: League.ELITE,
        xpRequired: 241000,
        xpForLevel: 14500,
        rewards: [
            {
                id: 'reward_lv48_premium',
                type: RewardType.PREMIUM,
                titleKey: 'reward_premiumMonth',
                descriptionKey: 'reward_premiumMonth_desc',
                icon: '🌟',
                value: 1
            }
        ],
        hasMysteryReward: false
    },
    {
        level: 49,
        league: League.ELITE,
        xpRequired: 256000,
        xpForLevel: 15000,
        rewards: [],
        hasMysteryReward: false
    },
    {
        level: 50,
        league: League.ELITE,
        xpRequired: 271500,
        xpForLevel: 15500,
        rewards: [
            {
                id: 'reward_lv50_ultimate',
                type: RewardType.PHYSICAL,
                titleKey: 'reward_ultimatePack',
                descriptionKey: 'reward_ultimatePack_desc',
                icon: '🏅'
            },
            {
                id: 'reward_lv50_beta',
                type: RewardType.PREMIUM,
                titleKey: 'reward_betaAccess',
                descriptionKey: 'reward_betaAccess_desc',
                icon: '🚀'
            },
            {
                id: 'reward_lv50_mystery',
                type: RewardType.MYSTERY,
                titleKey: 'reward_mysteryUltimate',
                descriptionKey: 'reward_mysteryUltimate_desc',
                icon: '🎁✨',
                isMystery: true
            }
        ],
        hasMysteryReward: true
    }
];

// Helper function to get level data by level number
export const getLevelData = (level: number): LevelData | undefined => {
    return LEVELS.find(l => l.level === level);
};

// Helper function to get league by level
export const getLeagueByLevel = (level: number): League => {
    const threshold = LEAGUE_THRESHOLDS.find(
        t => level >= t.minLevel && level <= t.maxLevel
    );
    return threshold?.league || League.BRONZE;
};

// Helper function to get league by XP
export const getLeagueByXP = (xp: number): LeagueThresholds => {
    for (let i = LEAGUE_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEAGUE_THRESHOLDS[i].minXP) {
            return LEAGUE_THRESHOLDS[i];
        }
    }
    return LEAGUE_THRESHOLDS[0];
};

// Helper function to calculate current level from total XP
export const calculateLevelFromXP = (totalXP: number): number => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (totalXP >= LEVELS[i].xpRequired) {
            return LEVELS[i].level;
        }
    }
    return 1;
};

// Helper function to get XP progress to next level
export const getXPProgress = (totalXP: number): { current: number; needed: number; percentage: number } => {
    const currentLevel = calculateLevelFromXP(totalXP);
    const currentLevelData = getLevelData(currentLevel);
    const nextLevelData = getLevelData(currentLevel + 1);

    if (!currentLevelData || !nextLevelData) {
        return { current: 0, needed: 0, percentage: 100 };
    }

    const xpInCurrentLevel = totalXP - currentLevelData.xpRequired;
    const xpNeededForNext = nextLevelData.xpForLevel;
    const percentage = Math.min(100, (xpInCurrentLevel / xpNeededForNext) * 100);

    return {
        current: xpInCurrentLevel,
        needed: xpNeededForNext,
        percentage
    };
};
