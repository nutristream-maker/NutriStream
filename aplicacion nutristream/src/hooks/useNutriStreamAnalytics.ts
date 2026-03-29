/**
 * useNutriStreamAnalytics.ts
 * React hook that combines BiometricStorage + NutriStreamAnalyticsEngine.
 * Provides the full analytics dashboard to any component.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DailyBiometrics, NutriStreamDashboard } from '../types/BiometricAnalytics';
import { calculateDashboard } from '../services/NutriStreamAnalyticsEngine';
import {
    loadAllBiometrics,
    getTodayBiometrics,
    updateTodayBiometrics,
    createEmptyBiometrics,
    hasMinimumData,
} from '../services/BiometricStorageService';

interface UseNutriStreamAnalyticsReturn {
    /** Full analytics dashboard (recovery, strain, energy, balance, insights) */
    dashboard: NutriStreamDashboard | null;
    /** Today's raw biometric data */
    todayData: DailyBiometrics;
    /** Whether we have enough history for baseline calculations */
    hasBaseline: boolean;
    /** Number of days of historical data available */
    historyDays: number;
    /** Whether the dashboard is being recalculated */
    isLoading: boolean;
    /** Update today's biometric readings (partial updates supported) */
    updateBiometrics: (updates: Partial<DailyBiometrics>) => void;
    /** Force recalculation of the dashboard */
    recalculate: () => void;
}

/**
 * @param basalMetabolicRate - User's BMR in kcal/day (calculate from height/weight/age)
 */
export function useNutriStreamAnalytics(
    basalMetabolicRate: number = 1800
): UseNutriStreamAnalyticsReturn {
    const [dashboard, setDashboard] = useState<NutriStreamDashboard | null>(null);
    const [todayData, setTodayData] = useState<DailyBiometrics>(createEmptyBiometrics());
    const [isLoading, setIsLoading] = useState(true);
    const bmrRef = useRef(basalMetabolicRate);
    bmrRef.current = basalMetabolicRate;

    // Load and calculate on mount
    useEffect(() => {
        const existing = getTodayBiometrics();
        if (existing) {
            setTodayData(existing);
        }
        recalculate();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const recalculate = useCallback(() => {
        setIsLoading(true);

        try {
            const history = loadAllBiometrics();
            const today = getTodayBiometrics() || todayData;

            // Only calculate if we have today's data with actual readings
            if (today.hrv > 0 || today.rhr > 0 || today.sleepHours > 0) {
                const result = calculateDashboard(today, history, bmrRef.current);
                setDashboard(result);
            } else {
                setDashboard(null);
            }
        } catch (e) {
            console.error('NutriStreamAnalytics: calculation error', e);
            setDashboard(null);
        } finally {
            setIsLoading(false);
        }
    }, [todayData]);

    const updateBiometrics = useCallback((updates: Partial<DailyBiometrics>) => {
        const updated = updateTodayBiometrics(updates);
        setTodayData(updated);

        // Recalculate after update
        const history = loadAllBiometrics();
        try {
            const result = calculateDashboard(updated, history, bmrRef.current);
            setDashboard(result);
        } catch (e) {
            console.error('NutriStreamAnalytics: update calculation error', e);
        }
    }, []);

    return {
        dashboard,
        todayData,
        hasBaseline: hasMinimumData(),
        historyDays: loadAllBiometrics().length,
        isLoading,
        updateBiometrics,
        recalculate,
    };
}

export default useNutriStreamAnalytics;
