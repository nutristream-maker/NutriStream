/**
 * InjuryPredictionService - Injury Shield AI
 * 
 * Analyzes fatigue patterns, workout history, and recovery data
 * to predict potential injury risks and provide preventive recommendations.
 */

import { mockRecoveryData } from '../data/mockData';

// Types
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface MuscleRisk {
    muscle: string;
    riskLevel: RiskLevel;
    riskScore: number; // 0-100
    reasons: string[];
    recommendations: string[];
}

export interface InjuryPrediction {
    overallRisk: RiskLevel;
    overallScore: number;
    muscleRisks: MuscleRisk[];
    topRisks: MuscleRisk[];
    generalRecommendations: string[];
    shouldAlert: boolean;
    alertMessage?: string;
}

export interface FatigueTrend {
    muscle: string;
    trend: 'increasing' | 'stable' | 'decreasing';
    averageFatigue: number;
    peakFatigue: number;
    daysAtHighFatigue: number;
}

// Risk level thresholds
const RISK_THRESHOLDS = {
    low: 30,
    moderate: 50,
    high: 70,
    critical: 85,
};

// Get risk level from score
const getRiskLevel = (score: number): RiskLevel => {
    if (score >= RISK_THRESHOLDS.critical) return 'critical';
    if (score >= RISK_THRESHOLDS.high) return 'high';
    if (score >= RISK_THRESHOLDS.moderate) return 'moderate';
    return 'low';
};

// Get risk color for UI
export const getRiskColor = (level: RiskLevel): string => {
    switch (level) {
        case 'critical': return '#ef4444'; // red-500
        case 'high': return '#f59e0b'; // amber-500
        case 'moderate': return '#eab308'; // yellow-500
        case 'low': return '#10b981'; // emerald-500
    }
};

// Get risk badge classes for UI
export const getRiskBadgeClasses = (level: RiskLevel): string => {
    switch (level) {
        case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        case 'high': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        case 'low': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    }
};

/**
 * Analyzes fatigue data to detect trends per muscle group.
 */
export const analyzeFatigueTrends = (
    currentFatigue: Record<string, number>,
    historicalData?: Record<string, number[]>
): FatigueTrend[] => {
    const trends: FatigueTrend[] = [];

    for (const [muscle, fatigue] of Object.entries(currentFatigue)) {
        const history = historicalData?.[muscle] || [fatigue];
        const avgFatigue = history.reduce((a, b) => a + b, 0) / history.length;
        const peakFatigue = Math.max(...history);
        const daysAtHighFatigue = history.filter(f => f > 60).length;

        // Determine trend
        let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
        if (history.length >= 3) {
            const recentAvg = history.slice(-3).reduce((a, b) => a + b, 0) / 3;
            const previousAvg = history.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(1, history.length - 3);
            if (recentAvg > previousAvg + 10) trend = 'increasing';
            else if (recentAvg < previousAvg - 10) trend = 'decreasing';
        }

        trends.push({
            muscle,
            trend,
            averageFatigue: Math.round(avgFatigue),
            peakFatigue: Math.round(peakFatigue),
            daysAtHighFatigue,
        });
    }

    return trends;
};

/**
 * Calculates injury risk for each muscle group based on multiple factors.
 */
export const calculateMuscleRisks = (
    currentFatigue: Record<string, number>,
    fatigueTrends: FatigueTrend[],
    recentWorkouts?: number, // Number of workouts in last 7 days
    sleepQuality?: number // 0-100
): MuscleRisk[] => {
    const muscleRisks: MuscleRisk[] = [];

    for (const trend of fatigueTrends) {
        const reasons: string[] = [];
        const recommendations: string[] = [];
        let riskScore = 0;

        // Factor 1: Current fatigue level (40% weight)
        const currentFatigueScore = (currentFatigue[trend.muscle] || 0) * 0.4;
        riskScore += currentFatigueScore;
        if (currentFatigue[trend.muscle] > 70) {
            reasons.push('Nivel de fatiga muy alto actualmente');
        }

        // Factor 2: Fatigue trend (25% weight)
        if (trend.trend === 'increasing') {
            riskScore += 25;
            reasons.push('La fatiga está aumentando en los últimos días');
            recommendations.push('Reduce la intensidad del entrenamiento');
        }

        // Factor 3: Days at high fatigue (20% weight)
        if (trend.daysAtHighFatigue >= 3) {
            riskScore += trend.daysAtHighFatigue * 4;
            reasons.push(`${trend.daysAtHighFatigue} días consecutivos con fatiga alta`);
            recommendations.push('Toma un día de descanso activo');
        }

        // Factor 4: Poor sleep (10% weight)
        if (sleepQuality !== undefined && sleepQuality < 60) {
            riskScore += 10;
            reasons.push('Calidad de sueño insuficiente para la recuperación');
            recommendations.push('Prioriza dormir 7-8 horas');
        }

        // Factor 5: Overtraining (5% weight)
        if (recentWorkouts !== undefined && recentWorkouts > 6) {
            riskScore += 5;
            reasons.push('Posible sobreentrenamiento (muchos entrenamientos en 7 días)');
            recommendations.push('Considera un día de descanso completo');
        }

        // Add muscle-specific recommendations
        if (riskScore > 50) {
            recommendations.push(`Aplica hielo/calor en ${trend.muscle} después del entrenamiento`);
            recommendations.push('Estira suavemente antes y después del ejercicio');
        }

        muscleRisks.push({
            muscle: trend.muscle,
            riskLevel: getRiskLevel(riskScore),
            riskScore: Math.min(100, Math.round(riskScore)),
            reasons: reasons.length > 0 ? reasons : ['Sin factores de riesgo significativos'],
            recommendations: recommendations.length > 0 ? recommendations : ['Continúa con tu rutina normal'],
        });
    }

    return muscleRisks.sort((a, b) => b.riskScore - a.riskScore);
};

/**
 * Main prediction function - analyzes all data and returns comprehensive prediction.
 */
export const predictInjuryRisk = (
    currentFatigue: Record<string, number>,
    options?: {
        historicalFatigue?: Record<string, number[]>;
        recentWorkouts?: number;
        sleepQuality?: number;
        hrvScore?: number;
    }
): InjuryPrediction => {
    // Analyze trends
    const fatigueTrends = analyzeFatigueTrends(
        currentFatigue,
        options?.historicalFatigue
    );

    // Calculate per-muscle risks
    const muscleRisks = calculateMuscleRisks(
        currentFatigue,
        fatigueTrends,
        options?.recentWorkouts,
        options?.sleepQuality
    );

    // Calculate overall risk
    const avgRiskScore = muscleRisks.length > 0
        ? muscleRisks.reduce((sum, r) => sum + r.riskScore, 0) / muscleRisks.length
        : 0;

    // Top 3 risks
    const topRisks = muscleRisks.slice(0, 3);

    // General recommendations based on overall risk
    const generalRecommendations: string[] = [];
    const overallRisk = getRiskLevel(avgRiskScore);

    if (overallRisk === 'critical') {
        generalRecommendations.push('⚠️ Recomendamos un día de descanso completo');
        generalRecommendations.push('Consulta a un profesional si sientes dolor');
    } else if (overallRisk === 'high') {
        generalRecommendations.push('Reduce la intensidad al 70% hoy');
        generalRecommendations.push('Enfócate en recuperación activa');
    } else if (overallRisk === 'moderate') {
        generalRecommendations.push('Presta atención a las señales de tu cuerpo');
        generalRecommendations.push('Calienta bien antes de entrenar');
    } else {
        generalRecommendations.push('¡Tu cuerpo está en buen estado!');
        generalRecommendations.push('Puedes entrenar con normalidad');
    }

    // Determine if we should show an alert
    const shouldAlert = overallRisk === 'high' || overallRisk === 'critical';
    const alertMessage = shouldAlert
        ? overallRisk === 'critical'
            ? '🛡️ Injury Shield: Riesgo crítico detectado. Tu cuerpo necesita descanso.'
            : '🛡️ Injury Shield: Riesgo elevado. Considera reducir la intensidad.'
        : undefined;

    return {
        overallRisk,
        overallScore: Math.round(avgRiskScore),
        muscleRisks,
        topRisks,
        generalRecommendations,
        shouldAlert,
        alertMessage,
    };
};

/**
 * Quick check using mock/default data for demo purposes.
 */
export const getQuickPrediction = (muscleFatigue: Record<string, number>): InjuryPrediction => {
    // Use mock recovery data to supplement
    const historicalFatigue: Record<string, number[]> = {};

    for (const [muscle, data] of Object.entries(mockRecoveryData)) {
        // Simulate 7 days of data based on current recovery
        const baseFatigue = 100 - data.recovery;
        historicalFatigue[muscle] = [
            baseFatigue - 10,
            baseFatigue - 5,
            baseFatigue,
            baseFatigue + 5,
            baseFatigue + 3,
            baseFatigue,
            muscleFatigue[muscle] || baseFatigue,
        ];
    }

    return predictInjuryRisk(muscleFatigue, {
        historicalFatigue,
        recentWorkouts: 4,
        sleepQuality: 72,
        hrvScore: 55,
    });
};
