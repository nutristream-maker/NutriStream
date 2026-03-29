// ReadinessService.ts - Calculates user's daily readiness score
// Now delegates to NutriStreamAnalyticsEngine when biometric data is available.
// Falls back to legacy calculation with mock data when no real biometrics exist.

import { mockRecoveryData } from '../data/mockData';
import { calculateRecovery, calculateBaseline } from './NutriStreamAnalyticsEngine';
import { getTodayBiometrics, getHistory } from './BiometricStorageService';

export interface ReadinessResult {
    score: number; // 0-100
    status: 'optimal' | 'good' | 'moderate' | 'low';
    recommendation: string;
    factors: {
        sleep: { score: number; weight: number };
        muscleRecovery: { score: number; weight: number };
        hrv: { score: number; weight: number };
    };
}

interface ReadinessInputs {
    sleepHours: number;
    sleepQuality?: number;
    hrvValue?: number;
    muscleFatigue?: { [key: string]: number };
}

/**
 * Calculates the overall readiness score.
 * Uses NutriStreamAnalyticsEngine with real biometric data when available,
 * falls back to legacy mock-based calculation otherwise.
 */
export const calculateReadinessScore = (inputs: ReadinessInputs): ReadinessResult => {
    // Try to use real biometric data from NutriStreamAnalyticsEngine
    const todayBiometrics = getTodayBiometrics();
    if (todayBiometrics && (todayBiometrics.hrv > 0 || todayBiometrics.rhr > 0)) {
        const history = getHistory(14);
        const baseline = calculateBaseline(history);
        const engineResult = calculateRecovery(todayBiometrics, baseline);

        // Convert engine result to legacy ReadinessResult format
        return {
            score: engineResult.score,
            status: engineResult.status,
            recommendation: engineResult.recommendation,
            factors: {
                sleep: { score: engineResult.factors.sleep.score, weight: engineResult.factors.sleep.weight },
                muscleRecovery: { score: 0, weight: 0 }, // Not used in engine
                hrv: { score: engineResult.factors.hrv.score, weight: engineResult.factors.hrv.weight },
            },
        };
    }

    // --- Legacy fallback with mock data ---
    const sleepScore = Math.min(100, Math.max(0,
        inputs.sleepHours >= 7 && inputs.sleepHours <= 9
            ? 100
            : inputs.sleepHours < 7
                ? (inputs.sleepHours / 7) * 100
                : 100 - ((inputs.sleepHours - 9) * 10)
    ));

    const recoveryValues = Object.values(mockRecoveryData).map(m => m.recovery);
    const avgRecovery = recoveryValues.reduce((a, b) => a + b, 0) / recoveryValues.length;

    let muscleRecoveryScore = avgRecovery;
    if (inputs.muscleFatigue && Object.keys(inputs.muscleFatigue).length > 0) {
        const fatigueValues = Object.values(inputs.muscleFatigue);
        const avgFatigue = fatigueValues.reduce((a, b) => a + b, 0) / fatigueValues.length;
        muscleRecoveryScore = Math.max(0, 100 - avgFatigue);
    }

    const hrvValue = inputs.hrvValue || 65;
    const hrvScore = Math.min(100, Math.max(0, (hrvValue / 100) * 100));

    const weights = { sleep: 0.4, muscle: 0.4, hrv: 0.2 };
    const totalScore = Math.round(
        sleepScore * weights.sleep +
        muscleRecoveryScore * weights.muscle +
        hrvScore * weights.hrv
    );

    let status: ReadinessResult['status'];
    let recommendation: string;

    if (totalScore >= 80) {
        status = 'optimal';
        recommendation = '¡Estás listo para un entrenamiento de alta intensidad! Tu cuerpo está completamente recuperado.';
    } else if (totalScore >= 60) {
        status = 'good';
        recommendation = 'Puedes entrenar con intensidad moderada-alta. Evita sobrecarga en músculos que aún se recuperan.';
    } else if (totalScore >= 40) {
        status = 'moderate';
        recommendation = 'Considera un entrenamiento ligero o de recuperación activa. Tu cuerpo necesita más tiempo.';
    } else {
        status = 'low';
        recommendation = 'Hoy es mejor descansar. Prioriza el sueño y la nutrición para una recuperación óptima.';
    }

    return {
        score: totalScore,
        status,
        recommendation,
        factors: {
            sleep: { score: Math.round(sleepScore), weight: weights.sleep },
            muscleRecovery: { score: Math.round(muscleRecoveryScore), weight: weights.muscle },
            hrv: { score: Math.round(hrvScore), weight: weights.hrv }
        }
    };
};

/**
 * Quick helper to get readiness color based on score
 */
export const getReadinessColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#22d3ee'; // Cyan
    if (score >= 40) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
};

export default { calculateReadinessScore, getReadinessColor };
