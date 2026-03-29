import { useState, useEffect, useCallback } from 'react';
import {
    UserGamificationState,
    XPEvent,
    XPAxis,
    Reward,
    League
} from '../types/GamificationTypes';
import GamificationService from '../services/GamificationService';
import { getXPProgress } from '../data/gamificationConfig';

/**
 * Custom Hook for Gamification System
 * Manages user's gamification state, XP, levels, and rewards
 */

const STORAGE_KEY = 'nutristream_gamification';

export const useGamification = (userId?: string) => {
    const [userState, setUserState] = useState<UserGamificationState>(() => {
        // Try to load from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return {
                    ...parsed,
                    lastActivityDate: parsed.lastActivityDate ? new Date(parsed.lastActivityDate) : undefined,
                    subscriptionStartDate: parsed.subscriptionStartDate ? new Date(parsed.subscriptionStartDate) : undefined
                };
            } catch (e) {
                console.error('Failed to parse gamification state:', e);
            }
        }

        // Initialize new state
        return GamificationService.initializeUserState(new Date());
    });

    const [recentEvents, setRecentEvents] = useState<XPEvent[]>([]);

    // Save to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userState));
    }, [userState]);

    // Calculate XP progress
    const xpProgress = getXPProgress(userState.totalXP);

    /**
     * Add XP from any source
     */
    const addXP = useCallback((axis: XPAxis, amount: number, reason: string) => {
        const event: XPEvent = {
            axis,
            amount,
            reason,
            timestamp: new Date()
        };

        const { newState, levelUpInfo } = GamificationService.addXP(userState, event);

        setUserState(newState);
        setRecentEvents(prev => [event, ...prev].slice(0, 10)); // Keep last 10 events

        // Return level up info for notifications
        return levelUpInfo;
    }, [userState]);

    /**
     * Add XP from subscription activity
     */
    const addSubscriptionXP = useCallback((days: number) => {
        const xp = GamificationService.calculateSubscriptionXP(days);
        return addXP(XPAxis.SUBSCRIPTION, xp, 'subscription_days');
    }, [addXP]);

    /**
     * Add XP from performance improvement
     */
    const addPerformanceXP = useCallback((improvementPercent: number) => {
        const xp = GamificationService.calculatePerformanceXP(improvementPercent);
        if (xp > 0) {
            return addXP(XPAxis.PERFORMANCE, xp, 'performance_improvement');
        }
        return null;
    }, [addXP]);

    /**
     * Add XP from biometric improvement
     */
    const addBiometricsXP = useCallback((metric: string, improvementPercent: number) => {
        const xp = GamificationService.calculateBiometricsXP(metric, improvementPercent);
        if (xp > 0) {
            return addXP(XPAxis.BIOMETRICS, xp, `biometrics_${metric}`);
        }
        return null;
    }, [addXP]);

    /**
     * Update streak and add XP
     */
    const updateStreak = useCallback(() => {
        const { newStreak, streakBroken } = GamificationService.updateStreak(
            userState.lastActivityDate,
            userState.currentStreak
        );

        const xp = GamificationService.calculateConsistencyXP(newStreak);

        setUserState(prev => ({
            ...prev,
            currentStreak: newStreak,
            longestStreak: Math.max(prev.longestStreak, newStreak),
            lastActivityDate: new Date()
        }));

        if (!streakBroken && xp > 0) {
            return addXP(XPAxis.CONSISTENCY, xp, 'daily_streak');
        }

        return null;
    }, [userState.lastActivityDate, userState.currentStreak, addXP]);

    /**
     * Mark a reward as claimed
     */
    const claimReward = useCallback((rewardId: string) => {
        setUserState(prev => ({
            ...prev,
            unlockedRewards: prev.unlockedRewards.map(reward =>
                reward.id === rewardId
                    ? { ...reward, claimed: true, claimedAt: new Date() }
                    : reward
            )
        }));
    }, []);

    /**
     * Get next reward preview
     */
    const getNextReward = useCallback(() => {
        return GamificationService.getNextReward(userState.currentLevel);
    }, [userState.currentLevel]);

    /**
     * Get unclaimed rewards
     */
    const getUnclaimedRewards = useCallback(() => {
        return userState.unlockedRewards.filter(r => !r.claimed);
    }, [userState.unlockedRewards]);

    return {
        // State
        userLevel: userState.currentLevel,
        currentLeague: userState.currentLeague,
        totalXP: userState.totalXP,
        xpBreakdown: userState.xpBreakdown,
        xpToNextLevel: xpProgress.needed,
        xpInCurrentLevel: xpProgress.current,
        progressPercentage: xpProgress.percentage,

        // Streaks
        currentStreak: userState.currentStreak,
        longestStreak: userState.longestStreak,

        // Rewards
        unlockedRewards: userState.unlockedRewards,
        unclaimedRewards: getUnclaimedRewards(),

        // Recent activity
        recentEvents,

        // Actions
        addXP,
        addSubscriptionXP,
        addPerformanceXP,
        addBiometricsXP,
        updateStreak,
        claimReward,
        getNextReward,

        // Full state for advanced use
        fullState: userState
    };
};
