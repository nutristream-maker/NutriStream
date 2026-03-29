/**
 * BiometricStorageService.ts
 * Persistence layer for daily biometric readings.
 * Uses localStorage keyed by date with a rolling 30-day window.
 */

import type { DailyBiometrics } from '../types/BiometricAnalytics';

const STORAGE_KEY = 'nutristream_biometrics';
const MAX_HISTORY_DAYS = 30;

// ============================================================================
// SAVE & LOAD
// ============================================================================

/**
 * Save a day's biometric readings.
 * Overwrites any existing entry for the same date.
 */
export function saveDailyBiometrics(data: DailyBiometrics): void {
    const history = loadAllBiometrics();
    const idx = history.findIndex(d => d.date === data.date);

    if (idx >= 0) {
        history[idx] = data;
    } else {
        history.push(data);
    }

    // Keep only last MAX_HISTORY_DAYS
    const trimmed = history
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-MAX_HISTORY_DAYS);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
        console.error('BiometricStorage: Failed to save', e);
    }
}

/**
 * Load all stored biometric history (up to 30 days).
 */
export function loadAllBiometrics(): DailyBiometrics[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as DailyBiometrics[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

/**
 * Get last N days of biometric history.
 */
export function getHistory(days: number): DailyBiometrics[] {
    const all = loadAllBiometrics();
    return all.slice(-days);
}

/**
 * Get today's biometric entry, if it exists.
 */
export function getTodayBiometrics(): DailyBiometrics | null {
    const today = new Date().toISOString().split('T')[0];
    const all = loadAllBiometrics();
    return all.find(d => d.date === today) || null;
}

/**
 * Create a default empty biometric entry for today.
 */
export function createEmptyBiometrics(date?: string): DailyBiometrics {
    return {
        date: date || new Date().toISOString().split('T')[0],
        hrv: 0,
        rhr: 0,
        respiratoryRate: 0,
        sleepHours: 0,
        sleepQuality: 0,
        sleepLatency: 0,
        sleepStages: { deep: 0, rem: 0, light: 0, awake: 0 },
        hrZoneMinutes: { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 },
        activeCalories: 0,
        totalCalories: 0,
        steps: 0,
        restingPeriods: [],
    };
}

/**
 * Update a specific field in today's biometrics.
 * Creates the entry if it doesn't exist.
 */
export function updateTodayBiometrics(
    updates: Partial<DailyBiometrics>
): DailyBiometrics {
    const today = new Date().toISOString().split('T')[0];
    const existing = getTodayBiometrics() || createEmptyBiometrics(today);
    const updated = { ...existing, ...updates, date: today };
    saveDailyBiometrics(updated);
    return updated;
}

/**
 * Check if we have enough data for baseline calculations.
 */
export function hasMinimumData(): boolean {
    return loadAllBiometrics().length >= 3;
}

/**
 * Clear all stored biometric data.
 */
export function clearBiometricData(): void {
    localStorage.removeItem(STORAGE_KEY);
}
