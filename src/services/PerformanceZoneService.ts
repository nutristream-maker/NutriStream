/**
 * Performance Zone Service
 * Implements the traffic-light algorithm for athlete readiness assessment
 */

import type { PerformanceZone, PerformanceZoneResult } from '../types/BiometricTypes';

// ============================================================================
// THRESHOLDS CONFIGURATION
// ============================================================================

interface ZoneThresholds {
    fatigue: {
        green: number;  // below this = green
        amber: number;  // below this = amber, above = red
    };
    symmetry: {
        green: number;  // above this = green
        amber: number;  // above this = amber, below = red
    };
    vo2: {
        minEfficiency: number;  // relative to VO2max
        maxStrain: number;      // relative to VO2max
    };
}

const DEFAULT_THRESHOLDS: ZoneThresholds = {
    fatigue: {
        green: 40,   // <40% fatigue = ready
        amber: 70,   // 40-70% = caution, >70% = danger
    },
    symmetry: {
        green: 90,   // >90% = ready (symmetry index as percentage of perfect)
        amber: 80,   // 80-90% = caution, <80% = danger
    },
    vo2: {
        minEfficiency: 0.6,  // 60% of VO2max minimum
        maxStrain: 0.95,     // 95% of VO2max is strain ceiling
    },
};

// ============================================================================
// ZONE CALCULATION
// ============================================================================

/**
 * Calculate performance zone based on fatigue, symmetry, and VO2 metrics
 * 
 * @param fatigue - Fatigue percentage (0-100)
 * @param symmetry - Symmetry percentage (0-100, where 100 = perfect bilateral symmetry)
 * @param vo2 - Current VO2 as percentage of VO2max (0-100)
 * @param thresholds - Optional custom thresholds
 * @returns PerformanceZoneResult with zone classification and contributing factors
 */
export function getPerformanceZone(
    fatigue: number,
    symmetry: number,
    vo2: number,
    thresholds: ZoneThresholds = DEFAULT_THRESHOLDS
): PerformanceZoneResult {
    // Normalize inputs to valid ranges
    const normalizedFatigue = Math.max(0, Math.min(100, fatigue));
    const normalizedSymmetry = Math.max(0, Math.min(100, symmetry));
    const normalizedVo2 = Math.max(0, Math.min(100, vo2));

    // Calculate individual zone contributions
    const fatigueZone = calculateFatigueZone(normalizedFatigue, thresholds.fatigue);
    const symmetryZone = calculateSymmetryZone(normalizedSymmetry, thresholds.symmetry);
    const vo2Zone = calculateVo2Zone(normalizedVo2, thresholds.vo2);

    // Calculate contribution weights (how much each factor influences the final zone)
    const fatigueContribution = calculateContribution(normalizedFatigue, 0, 100);
    const symmetryContribution = calculateContribution(100 - normalizedSymmetry, 0, 20); // Inverted: higher deviation = worse
    const vo2Contribution = calculateVo2Contribution(normalizedVo2, thresholds.vo2);

    // Determine final zone using worst-case approach (most conservative)
    const zoneScores: Record<PerformanceZone, number> = {
        'GREEN': 0,
        'AMBER': 1,
        'RED': 2,
    };

    const zones = [fatigueZone, symmetryZone, vo2Zone];
    const worstZone = zones.reduce((worst, current) =>
        zoneScores[current] > zoneScores[worst] ? current : worst
        , 'GREEN' as PerformanceZone);

    // Generate recommendation based on zone and contributing factors
    const recommendation = generateRecommendation(
        worstZone,
        { fatigue: normalizedFatigue, symmetry: normalizedSymmetry, vo2: normalizedVo2 },
        thresholds
    );

    return {
        zone: worstZone,
        factors: {
            fatigueContribution,
            symmetryContribution,
            vo2Contribution,
        },
        recommendation,
    };
}

// ============================================================================
// INDIVIDUAL ZONE CALCULATIONS
// ============================================================================

function calculateFatigueZone(
    fatigue: number,
    thresholds: ZoneThresholds['fatigue']
): PerformanceZone {
    if (fatigue < thresholds.green) return 'GREEN';
    if (fatigue < thresholds.amber) return 'AMBER';
    return 'RED';
}

function calculateSymmetryZone(
    symmetry: number,
    thresholds: ZoneThresholds['symmetry']
): PerformanceZone {
    if (symmetry > thresholds.green) return 'GREEN';
    if (symmetry > thresholds.amber) return 'AMBER';
    return 'RED';
}

function calculateVo2Zone(
    vo2: number,
    thresholds: ZoneThresholds['vo2']
): PerformanceZone {
    const minPercent = thresholds.minEfficiency * 100;
    const maxPercent = thresholds.maxStrain * 100;

    // VO2 too low = inefficient, too high = overstrain
    if (vo2 >= minPercent && vo2 <= maxPercent) return 'GREEN';
    if (vo2 < minPercent * 0.8 || vo2 > maxPercent * 1.05) return 'RED';
    return 'AMBER';
}

// ============================================================================
// CONTRIBUTION CALCULATIONS
// ============================================================================

function calculateContribution(value: number, min: number, max: number): number {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function calculateVo2Contribution(
    vo2: number,
    thresholds: ZoneThresholds['vo2']
): number {
    const minPercent = thresholds.minEfficiency * 100;
    const maxPercent = thresholds.maxStrain * 100;
    const optimalMid = (minPercent + maxPercent) / 2;

    // Deviation from optimal zone
    const deviation = Math.abs(vo2 - optimalMid);
    const maxDeviation = Math.max(optimalMid - 0, 100 - optimalMid);

    return Math.max(0, Math.min(1, deviation / maxDeviation));
}

// ============================================================================
// RECOMMENDATION GENERATOR
// ============================================================================

interface Metrics {
    fatigue: number;
    symmetry: number;
    vo2: number;
}

function generateRecommendation(
    zone: PerformanceZone,
    metrics: Metrics,
    thresholds: ZoneThresholds
): string {
    switch (zone) {
        case 'GREEN':
            return 'Athlete is in optimal condition. Ready for high-intensity training.';

        case 'AMBER':
            const concerns: string[] = [];

            if (metrics.fatigue >= thresholds.fatigue.green) {
                concerns.push('moderate fatigue levels');
            }
            if (metrics.symmetry <= thresholds.symmetry.green) {
                concerns.push('bilateral asymmetry detected');
            }
            if (metrics.vo2 < thresholds.vo2.minEfficiency * 100 ||
                metrics.vo2 > thresholds.vo2.maxStrain * 100) {
                concerns.push('VO2 outside optimal range');
            }

            return `Caution advised due to ${concerns.join(', ')}. Consider reducing intensity.`;

        case 'RED':
            const criticalIssues: string[] = [];

            if (metrics.fatigue >= thresholds.fatigue.amber) {
                criticalIssues.push('HIGH FATIGUE RISK');
            }
            if (metrics.symmetry < thresholds.symmetry.amber) {
                criticalIssues.push('INJURY RISK (asymmetry)');
            }
            if (metrics.vo2 < thresholds.vo2.minEfficiency * 80 ||
                metrics.vo2 > thresholds.vo2.maxStrain * 105) {
                criticalIssues.push('METABOLIC STRESS');
            }

            return `STOP: ${criticalIssues.join(', ')}. Recovery recommended before continuing.`;

        default:
            return 'Unable to assess performance zone.';
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Quick check if athlete is in danger zone
 */
export function isInDangerZone(
    fatigue: number,
    symmetry: number,
    vo2: number
): boolean {
    return getPerformanceZone(fatigue, symmetry, vo2).zone === 'RED';
}

/**
 * Get zone color for UI rendering
 */
export function getZoneColor(zone: PerformanceZone): string {
    const colors: Record<PerformanceZone, string> = {
        'GREEN': '#00FFCC',  // Cyber-Fitness primary
        'AMBER': '#FFD700',  // Warning gold
        'RED': '#FF0055',    // Danger neon red
    };
    return colors[zone];
}

/**
 * Get zone label for internationalization
 */
export function getZoneLabel(zone: PerformanceZone): { key: string; fallback: string } {
    const labels: Record<PerformanceZone, { key: string; fallback: string }> = {
        'GREEN': { key: 'zoneReady', fallback: 'Ready' },
        'AMBER': { key: 'zoneCaution', fallback: 'Caution' },
        'RED': { key: 'zoneDanger', fallback: 'Danger' },
    };
    return labels[zone];
}
