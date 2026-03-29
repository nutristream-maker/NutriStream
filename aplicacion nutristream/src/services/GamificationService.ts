import {
    UserGamificationState,
    XPEvent,
    XPAxis,
    Reward,
    League
} from '../types/GamificationTypes';
import {
    LEVELS,
    XP_RATES,
    calculateLevelFromXP,
    getLevelData,
    getLeagueByLevel,
    getXPProgress
} from '../data/gamificationConfig';

/**
 * Gamification Service
 * Handles all XP calculations, level progression, and reward management
 */

class GamificationService {
    /**
     * Calculate XP gained from subscription activity
     * @param days Number of days as Premium member
     * @returns XP amount
     */
    calculateSubscriptionXP(days: number): number {
        return days * XP_RATES.subscriptionPerDay;
    }

    /**
     * Calculate XP from performance improvements
     * @param improvementPercent Percentage improvement (e.g., 5 for 5% improvement)
     * @returns XP amount
     */
    calculatePerformanceXP(improvementPercent: number): number {
        if (improvementPercent >= 10) {
            return XP_RATES.performanceLarge;
        } else if (improvementPercent >= 5) {
            return XP_RATES.performanceMedium;
        } else if (improvementPercent > 0) {
            return XP_RATES.performanceSmall;
        }
        return 0;
    }

    /**
     * Calculate XP from biometric improvements
     * @param metric Type of metric (rhr, sleep, bodyFat, etc.)
     * @param improvementPercent Percentage improvement
     * @returns XP amount
     */
    calculateBiometricsXP(metric: string, improvementPercent: number): number {
        if (improvementPercent >= 8) {
            return XP_RATES.biometricsLarge;
        } else if (improvementPercent >= 4) {
            return XP_RATES.biometricsMedium;
        } else if (improvementPercent > 0) {
            return XP_RATES.biometricsSmall;
        }
        return 0;
    }

    /**
     * Calculate XP from consistency/streaks
     * @param currentStreak Current streak in days
     * @returns XP amount including bonuses
     */
    calculateConsistencyXP(currentStreak: number): number {
        let xp = XP_RATES.consistencyDaily;

        // Add bonuses for milestones
        if (currentStreak >= 90) {
            xp += XP_RATES.consistencyQuarterBonus;
        } else if (currentStreak >= 30) {
            xp += XP_RATES.consistencyMonthBonus;
        } else if (currentStreak >= 7) {
            xp += XP_RATES.consistencyWeekBonus;
        }

        return xp;
    }

    /**
     * Update user's streak based on last activity
     * @param lastActivityDate Last activity date
     * @param currentStreak Current streak count
     * @returns Updated streak info
     */
    updateStreak(lastActivityDate: Date | undefined, currentStreak: number): {
        newStreak: number;
        streakBroken: boolean;
    } {
        if (!lastActivityDate) {
            return { newStreak: 1, streakBroken: false };
        }

        const now = new Date();
        const lastActivity = new Date(lastActivityDate);
        const diffHours = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

        // If within 24-48 hours, continue streak
        if (diffHours < 48) {
            return { newStreak: currentStreak + 1, streakBroken: false };
        }

        // Streak broken
        return { newStreak: 1, streakBroken: true };
    }

    /**
     * Get user's current level and league from total XP
     * @param totalXP Total XP accumulated
     * @returns Level and league info
     */
    getUserLevelInfo(totalXP: number): {
        level: number;
        league: League;
        xpProgress: { current: number; needed: number; percentage: number };
    } {
        const level = calculateLevelFromXP(totalXP);
        const league = getLeagueByLevel(level);
        const xpProgress = getXPProgress(totalXP);

        return { level, league, xpProgress };
    }

    /**
     * Check if user leveled up
     * @param oldXP Previous total XP
     * @param newXP New total XP
     * @returns Level up info or null
     */
    checkLevelUp(oldXP: number, newXP: number): {
        leveledUp: boolean;
        oldLevel: number;
        newLevel: number;
        newRewards: Reward[];
    } {
        const oldLevel = calculateLevelFromXP(oldXP);
        const newLevel = calculateLevelFromXP(newXP);

        if (newLevel > oldLevel) {
            const newLevelData = getLevelData(newLevel);
            return {
                leveledUp: true,
                oldLevel,
                newLevel,
                newRewards: newLevelData?.rewards || []
            };
        }

        return {
            leveledUp: false,
            oldLevel,
            newLevel: oldLevel,
            newRewards: []
        };
    }

    /**
     * Get all unlocked rewards for user
     * @param currentLevel User's current level
     * @returns Array of all unlocked rewards
     */
    getUnlockedRewards(currentLevel: number): Reward[] {
        const rewards: Reward[] = [];

        for (let i = 0; i < LEVELS.length; i++) {
            if (LEVELS[i].level <= currentLevel) {
                rewards.push(...LEVELS[i].rewards);
            }
        }

        return rewards;
    }

    /**
     * Get next reward to unlock
     * @param currentLevel User's current level
     * @returns Next reward or null
     */
    getNextReward(currentLevel: number): {
        level: number;
        rewards: Reward[];
        isMystery: boolean;
    } | null {
        for (let i = 0; i < LEVELS.length; i++) {
            if (LEVELS[i].level > currentLevel && LEVELS[i].rewards.length > 0) {
                return {
                    level: LEVELS[i].level,
                    rewards: LEVELS[i].rewards,
                    isMystery: LEVELS[i].hasMysteryReward
                };
            }
        }
        return null;
    }

    /**
     * Calculate subscription days from start date
     * @param startDate Subscription start date
     * @returns Number of days
     */
    calculateSubscriptionDays(startDate: Date): number {
        const now = new Date();
        const start = new Date(startDate);
        const diffTime = Math.abs(now.getTime() - start.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Add XP to user state
     * @param currentState Current user gamification state
     * @param event XP event to add
     * @returns Updated state and level up info
     */
    addXP(currentState: UserGamificationState, event: XPEvent): {
        newState: UserGamificationState;
        levelUpInfo: ReturnType<typeof this.checkLevelUp>;
    } {
        const newTotalXP = currentState.totalXP + event.amount;
        const levelUpInfo = this.checkLevelUp(currentState.totalXP, newTotalXP);

        const newState: UserGamificationState = {
            ...currentState,
            totalXP: newTotalXP,
            currentLevel: levelUpInfo.newLevel,
            currentLeague: getLeagueByLevel(levelUpInfo.newLevel),
            xpBreakdown: {
                ...currentState.xpBreakdown,
                [event.axis]: currentState.xpBreakdown[event.axis] + event.amount
            }
        };

        // If leveled up, add new rewards
        if (levelUpInfo.leveledUp) {
            newState.unlockedRewards = this.getUnlockedRewards(levelUpInfo.newLevel);
        }

        return { newState, levelUpInfo };
    }

    /**
     * Initialize new user gamification state
     * @param subscriptionStartDate Optional subscription start date
     * @returns Initial state
     */
    initializeUserState(subscriptionStartDate?: Date): UserGamificationState {
        const subscriptionDays = subscriptionStartDate
            ? this.calculateSubscriptionDays(subscriptionStartDate)
            : 0;

        const subscriptionXP = this.calculateSubscriptionXP(subscriptionDays);

        return {
            totalXP: subscriptionXP,
            currentLevel: calculateLevelFromXP(subscriptionXP),
            currentLeague: getLeagueByLevel(calculateLevelFromXP(subscriptionXP)),
            xpBreakdown: {
                [XPAxis.SUBSCRIPTION]: subscriptionXP,
                [XPAxis.PERFORMANCE]: 0,
                [XPAxis.BIOMETRICS]: 0,
                [XPAxis.CONSISTENCY]: 0
            },
            unlockedRewards: this.getUnlockedRewards(calculateLevelFromXP(subscriptionXP)),
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: new Date(),
            subscriptionStartDate: subscriptionStartDate || new Date(),
            subscriptionDays
        };
    }
}

export default new GamificationService();
