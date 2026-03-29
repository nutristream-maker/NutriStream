/**
 * BiometricAnalytics.ts
 * Core type definitions for the NutriStream AI Analytics Engine.
 * Follows Bevel/Whoop biometric specification.
 */

// ============================================================================
// RAW DAILY BIOMETRIC DATA
// ============================================================================

/** A single day's biometric readings from hardware sensors */
export interface DailyBiometrics {
    date: string; // ISO date string (YYYY-MM-DD)
    hrv: number; // Heart Rate Variability in ms
    rhr: number; // Resting Heart Rate in bpm
    respiratoryRate: number; // Breaths per minute
    sleepHours: number;
    sleepQuality: number; // 0-100
    sleepLatency: number; // Minutes to fall asleep
    sleepStages: {
        deep: number; // Minutes
        rem: number;
        light: number;
        awake: number;
    };
    hrZoneMinutes: HRZoneMinutes;
    activeCalories: number;
    totalCalories: number;
    steps: number;
    restingPeriods: RestingPeriod[]; // For stress detection
}

/** Time spent in each heart rate zone */
export interface HRZoneMinutes {
    z1: number; // Zone 1: 50-60% max HR (Warm-up)
    z2: number; // Zone 2: 60-70% max HR (Fat burn)
    z3: number; // Zone 3: 70-80% max HR (Aerobic)
    z4: number; // Zone 4: 80-90% max HR (Threshold)
    z5: number; // Zone 5: 90-100% max HR (VO2 Max)
}

/** Resting period measurement for stress proxy */
export interface RestingPeriod {
    timestamp: string;
    hrvReading: number;
    duration: number; // Minutes
}

// ============================================================================
// 14-DAY BASELINE
// ============================================================================

/** Rolling 14-day averages used as the user's personal baseline */
export interface BiometricBaseline {
    avgHRV: number;
    stdHRV: number; // Standard deviation for deviation scoring
    avgRHR: number;
    stdRHR: number;
    avgRespiratoryRate: number;
    stdRespiratoryRate: number;
    avgSleepHours: number;
    avgSleepQuality: number;
    dataPoints: number; // How many days of data we have (0-14)
}

// ============================================================================
// RECOVERY (0-100%)
// ============================================================================

export type NervousSystemState = 'parasympathetic' | 'balanced' | 'sympathetic';

export interface RecoveryResult {
    score: number; // 0-100
    status: 'optimal' | 'good' | 'moderate' | 'low';
    nervousSystemState: NervousSystemState;
    nervousSystemDescription: string;
    factors: {
        hrv: {
            value: number;
            baseline: number;
            deviation: number; // How many std devs from baseline
            score: number; // 0-100 contribution
            weight: number;
        };
        rhr: {
            value: number;
            baseline: number;
            deviation: number;
            score: number;
            weight: number;
        };
        sleep: {
            hours: number;
            quality: number;
            score: number;
            weight: number;
        };
        respiratory: {
            value: number;
            baseline: number;
            deviation: number;
            score: number;
            weight: number;
        };
    };
    recommendation: string;
}

// ============================================================================
// STRAIN (0-21 logarithmic, TRIMP-based)
// ============================================================================

export interface StrainResult {
    score: number; // 0-21 (logarithmic)
    level: 'light' | 'moderate' | 'high' | 'overreaching';
    cardiovascularLoad: number; // Raw TRIMP value
    zoneDistribution: {
        zone: number;
        minutes: number;
        weight: number;
        contribution: number;
    }[];
    peakHRZone: number; // Highest zone reached
    totalActiveMinutes: number;
    recommendation: string;
}

// ============================================================================
// ENERGY BANK (0-100%)
// ============================================================================

export interface EnergyBankResult {
    score: number; // 0-100
    status: 'full' | 'good' | 'moderate' | 'depleted';
    components: {
        sleepDebt: {
            value: number; // Hours of deficit accumulated (7 days)
            score: number; // 0-100
        };
        metabolicBurn: {
            ratio: number; // activeCalories / basalMetabolicRate
            score: number;
        };
        stressLevel: {
            value: number; // 0-100 derived from resting HRV dips
            score: number;
        };
    };
    recommendation: string;
}

// ============================================================================
// BALANCE STATUS
// ============================================================================

export type BalanceStatus = 'Sobreesfuerzo' | 'Óptimo' | 'Recuperación';

export interface BalanceResult {
    status: BalanceStatus;
    recoveryScore: number;
    strainScore: number;
    ratio: number; // strain/recovery ratio
    description: string;
    color: string; // UI color code
}

// ============================================================================
// AI INSIGHTS
// ============================================================================

export type InsightSeverity = 'info' | 'warning' | 'critical';
export type InsightCategory = 'hrv' | 'rhr' | 'sleep' | 'strain' | 'respiratory' | 'balance';

export interface AIInsight {
    id: string;
    category: InsightCategory;
    severity: InsightSeverity;
    title: string;
    message: string;
    trend: 'rising' | 'falling' | 'stable' | 'anomaly';
    dataPoints?: number[]; // Last N values for trend visualization
    actionable: string; // What the user should do
}

// ============================================================================
// FULL ANALYTICS DASHBOARD RESULT
// ============================================================================

export interface NutriStreamDashboard {
    recovery: RecoveryResult;
    strain: StrainResult;
    energyBank: EnergyBankResult;
    balance: BalanceResult;
    insights: AIInsight[];
    baseline: BiometricBaseline;
    lastUpdated: string; // ISO timestamp
}
