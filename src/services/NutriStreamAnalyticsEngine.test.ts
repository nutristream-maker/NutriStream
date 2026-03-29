/**
 * NutriStreamAnalyticsEngine.test.ts
 * Unit tests for the core biometric analytics engine.
 * Covers: calculateBaseline, calculateRecovery, calculateStrain,
 *         calculateEnergyBank, calculateBalance, generateInsights.
 */

import { describe, it, expect } from 'vitest';
import {
    calculateBaseline,
    calculateRecovery,
    calculateStrain,
    calculateEnergyBank,
    calculateBalance,
    generateInsights,
} from './NutriStreamAnalyticsEngine';
import type { DailyBiometrics, BiometricBaseline } from '../types/BiometricAnalytics';

// ============================================================================
// HELPERS: Factory functions for test data
// ============================================================================

function makeDailyBiometrics(overrides: Partial<DailyBiometrics> = {}): DailyBiometrics {
    return {
        date: '2025-01-15',
        hrv: 55,
        rhr: 60,
        respiratoryRate: 15,
        sleepHours: 7.5,
        sleepQuality: 80,
        sleepLatency: 10,
        sleepStages: { deep: 90, rem: 100, light: 180, awake: 15 },
        hrZoneMinutes: { z1: 30, z2: 20, z3: 10, z4: 5, z5: 0 },
        activeCalories: 500,
        totalCalories: 2200,
        steps: 8000,
        restingPeriods: [],
        ...overrides,
    };
}

function makeHistory(count: number, overrides: Partial<DailyBiometrics> = {}): DailyBiometrics[] {
    return Array.from({ length: count }, (_, i) =>
        makeDailyBiometrics({
            date: `2025-01-${String(i + 1).padStart(2, '0')}`,
            ...overrides,
        })
    );
}

// ============================================================================
// calculateBaseline
// ============================================================================

describe('calculateBaseline', () => {
    it('returns zeroed baseline for empty history', () => {
        const baseline = calculateBaseline([]);
        expect(baseline.avgHRV).toBe(0);
        expect(baseline.stdHRV).toBe(0);
        expect(baseline.avgRHR).toBe(0);
        expect(baseline.dataPoints).toBe(0);
    });

    it('computes correct mean for uniform data', () => {
        const history = makeHistory(14, { hrv: 50, rhr: 60, respiratoryRate: 15 });
        const baseline = calculateBaseline(history);

        expect(baseline.avgHRV).toBe(50);
        expect(baseline.avgRHR).toBe(60);
        expect(baseline.avgRespiratoryRate).toBe(15);
        expect(baseline.dataPoints).toBe(14);
    });

    it('computes non-zero std when data varies', () => {
        const history = [
            makeDailyBiometrics({ hrv: 40, rhr: 55 }),
            makeDailyBiometrics({ hrv: 60, rhr: 65 }),
        ];
        const baseline = calculateBaseline(history);

        // Mean HRV = 50, std = 10
        expect(baseline.avgHRV).toBe(50);
        expect(baseline.stdHRV).toBe(10);
        // Mean RHR = 60, std = 5
        expect(baseline.avgRHR).toBe(60);
        expect(baseline.stdRHR).toBe(5);
    });
});

// ============================================================================
// calculateStrain (TRIMP logarithmic 0-21)
// ============================================================================

describe('calculateStrain', () => {
    it('returns 0 strain for a complete rest day', () => {
        const restDay = makeDailyBiometrics({
            hrZoneMinutes: { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 },
        });
        const result = calculateStrain(restDay);

        expect(result.score).toBe(0);
        expect(result.level).toBe('light');
        expect(result.totalActiveMinutes).toBe(0);
        expect(result.cardiovascularLoad).toBe(0);
    });

    it('returns high strain for extreme competition day', () => {
        const raceDay = makeDailyBiometrics({
            hrZoneMinutes: { z1: 10, z2: 20, z3: 40, z4: 60, z5: 90 },
        });
        const result = calculateStrain(raceDay);

        // Raw TRIMP = 10*1 + 20*2 + 40*3 + 60*5 + 90*8 = 10+40+120+300+720 = 1190
        // strain = 7 * ln(1 + 1190/50) = 7 * ln(24.8) ≈ 7 * 3.21 ≈ 22.5, capped at 21
        expect(result.score).toBe(21);
        expect(result.level).toBe('overreaching');
        expect(result.peakHRZone).toBe(5);
    });

    it('returns moderate strain for a normal training session', () => {
        const normalDay = makeDailyBiometrics({
            hrZoneMinutes: { z1: 15, z2: 20, z3: 15, z4: 5, z5: 0 },
        });
        const result = calculateStrain(normalDay);

        // Raw TRIMP = 15 + 40 + 45 + 25 + 0 = 125
        // strain = 7 * ln(1 + 125/50) = 7 * ln(3.5) ≈ 7 * 1.253 ≈ 8.8
        expect(result.score).toBeGreaterThan(5);
        expect(result.score).toBeLessThan(10);
        expect(result.level).toBe('moderate');
    });

    it('correctly identifies peakHRZone', () => {
        const day = makeDailyBiometrics({
            hrZoneMinutes: { z1: 20, z2: 10, z3: 5, z4: 0, z5: 0 },
        });
        const result = calculateStrain(day);
        expect(result.peakHRZone).toBe(3);
    });
});

// ============================================================================
// calculateRecovery (0-100%)
// ============================================================================

describe('calculateRecovery', () => {
    const stableBaseline: BiometricBaseline = {
        avgHRV: 55, stdHRV: 5,
        avgRHR: 60, stdRHR: 3,
        avgRespiratoryRate: 15, stdRespiratoryRate: 1,
        avgSleepHours: 7.5, avgSleepQuality: 80,
        dataPoints: 14,
    };

    it('produces optimal recovery when all metrics are ideal', () => {
        const today = makeDailyBiometrics({
            hrv: 65,   // 2 std above baseline → excellent
            rhr: 54,   // 2 std below baseline → excellent
            sleepHours: 8,
            sleepQuality: 95,
            respiratoryRate: 15, // exactly at baseline
        });
        const result = calculateRecovery(today, stableBaseline);

        expect(result.score).toBeGreaterThanOrEqual(80);
        expect(result.status).toBe('optimal');
        expect(result.nervousSystemState).toBe('parasympathetic');
    });

    it('produces low recovery when all metrics are poor', () => {
        const today = makeDailyBiometrics({
            hrv: 40,   // 3 std below baseline → terrible
            rhr: 72,   // 4 std above baseline → terrible
            sleepHours: 3,
            sleepQuality: 20,
            respiratoryRate: 19, // 4 std above baseline
        });
        const result = calculateRecovery(today, stableBaseline);

        expect(result.score).toBeLessThanOrEqual(40);
        expect(['low', 'moderate']).toContain(result.status);
        expect(result.nervousSystemState).toBe('sympathetic');
    });

    it('returns score of 50 when today equals baseline exactly', () => {
        const today = makeDailyBiometrics({
            hrv: 55, rhr: 60, respiratoryRate: 15,
            sleepHours: 7.5, sleepQuality: 80,
        });
        const result = calculateRecovery(today, stableBaseline);

        // HRV deviation 0 → score 50, RHR deviation 0 → score 50
        // Sleep 7.5h → 100 * 0.6 + 80 * 0.4 = 92
        // Respiratory deviation 0 → score 100
        // Total = 50*0.45 + 50*0.30 + 92*0.15 + 100*0.10 = 22.5+15+13.8+10 = 61.3 ≈ 61
        expect(result.score).toBeGreaterThanOrEqual(55);
        expect(result.score).toBeLessThanOrEqual(70);
        expect(result.nervousSystemState).toBe('balanced');
    });

    it('handles missing baseline gracefully (< 3 data points)', () => {
        const noBaseline: BiometricBaseline = {
            avgHRV: 50, stdHRV: 5,
            avgRHR: 60, stdRHR: 3,
            avgRespiratoryRate: 15, stdRespiratoryRate: 1,
            avgSleepHours: 7, avgSleepQuality: 70,
            dataPoints: 1, // < 3
        };
        const today = makeDailyBiometrics();
        const result = calculateRecovery(today, noBaseline);

        // Without baseline, deviations default to 0 → HRV/RHR scores are 50
        expect(result.score).toBeGreaterThan(0);
        expect(result.score).toBeLessThanOrEqual(100);
    });
});

// ============================================================================
// calculateEnergyBank (0-100%)
// ============================================================================

describe('calculateEnergyBank', () => {
    it('returns high energy when sleep is great and activity is low', () => {
        const today = makeDailyBiometrics({ sleepHours: 9, activeCalories: 200 });
        const history = makeHistory(7, { sleepHours: 8.5 }); // no sleep debt
        const result = calculateEnergyBank(today, history, 1800);

        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(['full', 'good']).toContain(result.status);
    });

    it('returns depleted energy when sleep-deprived and high burn', () => {
        const today = makeDailyBiometrics({ sleepHours: 4, activeCalories: 2500 });
        const history = makeHistory(7, { sleepHours: 4 }); // massive sleep debt
        const result = calculateEnergyBank(today, history, 1800);

        expect(result.score).toBeLessThanOrEqual(40);
        expect(['depleted', 'moderate']).toContain(result.status);
    });
});

// ============================================================================
// calculateBalance
// ============================================================================

describe('calculateBalance', () => {
    it('detects overexertion when strain is high but recovery is low', () => {
        const recovery = { score: 30 } as any;
        const strain = { score: 18 } as any; // high strain

        const result = calculateBalance(recovery, strain);

        // normalizedStrain = (18/21)*100 ≈ 85.7, ratio = 85.7/30 ≈ 2.86 > 1.3
        expect(result.status).toBe('Sobreesfuerzo');
        expect(result.color).toBe('#ef4444');
    });

    it('detects recovery mode when strain is low and recovery is high', () => {
        const recovery = { score: 90 } as any;
        const strain = { score: 3 } as any; // low strain

        const result = calculateBalance(recovery, strain);

        // normalizedStrain = (3/21)*100 ≈ 14.3, ratio = 14.3/90 ≈ 0.16 < 0.6
        expect(result.status).toBe('Recuperación');
        expect(result.color).toBe('#3b82f6');
    });

    it('detects optimal balance when strain and recovery are aligned', () => {
        const recovery = { score: 70 } as any;
        const strain = { score: 10 } as any;

        const result = calculateBalance(recovery, strain);

        // normalizedStrain = (10/21)*100 ≈ 47.6, ratio = 47.6/70 ≈ 0.68
        expect(result.status).toBe('Óptimo');
        expect(result.color).toBe('#10b981');
    });
});

// ============================================================================
// generateInsights
// ============================================================================

describe('generateInsights', () => {
    const baseline: BiometricBaseline = {
        avgHRV: 55, stdHRV: 5,
        avgRHR: 60, stdRHR: 3,
        avgRespiratoryRate: 15, stdRespiratoryRate: 1,
        avgSleepHours: 7.5, avgSleepQuality: 80,
        dataPoints: 14,
    };

    it('returns empty insights when history has < 3 days', () => {
        const today = makeDailyBiometrics();
        const history = makeHistory(2);
        const recovery = calculateRecovery(today, baseline);
        const strain = calculateStrain(today);
        const balance = calculateBalance(recovery, strain);

        const insights = generateInsights(today, history, baseline, recovery, strain, balance);
        expect(insights).toEqual([]);
    });

    it('detects critical RHR rising trend (>7 bpm in 5 days)', () => {
        const history = [
            makeDailyBiometrics({ rhr: 58 }),
            makeDailyBiometrics({ rhr: 60 }),
            makeDailyBiometrics({ rhr: 63 }),
            makeDailyBiometrics({ rhr: 65 }),
            makeDailyBiometrics({ rhr: 68 }),
        ];
        const today = makeDailyBiometrics({ rhr: 68 });
        const recovery = calculateRecovery(today, baseline);
        const strain = calculateStrain(today);
        const balance = calculateBalance(recovery, strain);

        const insights = generateInsights(today, history, baseline, recovery, strain, balance);

        const rhrInsight = insights.find(i => i.id === 'rhr-rising');
        expect(rhrInsight).toBeDefined();
        expect(rhrInsight!.severity).toBe('critical'); // totalRise = 10 > 7
    });

    it('detects HRV falling trend', () => {
        const history = [
            makeDailyBiometrics({ hrv: 65 }),
            makeDailyBiometrics({ hrv: 60 }),
            makeDailyBiometrics({ hrv: 55 }),
            makeDailyBiometrics({ hrv: 50 }),
            makeDailyBiometrics({ hrv: 45 }),
        ];
        const today = makeDailyBiometrics({ hrv: 45 });
        const recovery = calculateRecovery(today, baseline);
        const strain = calculateStrain(today);
        const balance = calculateBalance(recovery, strain);

        const insights = generateInsights(today, history, baseline, recovery, strain, balance);

        const hrvInsight = insights.find(i => i.id === 'hrv-falling');
        expect(hrvInsight).toBeDefined();
        expect(hrvInsight!.severity).toBe('critical'); // totalDrop = 20 > 15
    });

    it('detects sleep debt accumulation', () => {
        const history = makeHistory(7, { sleepHours: 5 }); // avg 5h < 6.5h
        const today = makeDailyBiometrics({ sleepHours: 5 });
        const recovery = calculateRecovery(today, baseline);
        const strain = calculateStrain(today);
        const balance = calculateBalance(recovery, strain);

        const insights = generateInsights(today, history, baseline, recovery, strain, balance);

        const sleepInsight = insights.find(i => i.id === 'sleep-debt');
        expect(sleepInsight).toBeDefined();
        expect(sleepInsight!.severity).toBe('critical'); // avg 5h < 5.5h
    });

    it('generates positive insight for excellent recovery with no issues', () => {
        const history = makeHistory(5, {
            hrv: 55, rhr: 60, sleepHours: 8, respiratoryRate: 15,
        });
        const today = makeDailyBiometrics({
            hrv: 65, rhr: 57, sleepHours: 8.5, sleepQuality: 95, respiratoryRate: 15,
        });
        const recovery = calculateRecovery(today, baseline);
        const strain = calculateStrain(today);
        const balance = calculateBalance(recovery, strain);

        const insights = generateInsights(today, history, baseline, recovery, strain, balance);

        const positiveInsight = insights.find(i => i.id === 'great-recovery');
        expect(positiveInsight).toBeDefined();
        expect(positiveInsight!.severity).toBe('info');
    });

    it('detects respiratory rate anomaly', () => {
        const history = makeHistory(5, { respiratoryRate: 15 });
        const today = makeDailyBiometrics({ respiratoryRate: 18.5 }); // 3.5 std above
        const recovery = calculateRecovery(today, baseline);
        const strain = calculateStrain(today);
        const balance = calculateBalance(recovery, strain);

        const insights = generateInsights(today, history, baseline, recovery, strain, balance);

        const respInsight = insights.find(i => i.id === 'respiratory-anomaly');
        expect(respInsight).toBeDefined();
        expect(respInsight!.severity).toBe('warning');
    });
});
