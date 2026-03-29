/**
 * NutriStreamAnalyticsEngine.ts
 * Core analytics engine implementing Bevel/Whoop-style biometric analysis.
 *
 * Three pillars: Recovery, Strain, Energy Bank
 * All calculations use 14-day baseline deviation scoring.
 */

import type {
    DailyBiometrics,
    BiometricBaseline,
    RecoveryResult,
    StrainResult,
    EnergyBankResult,
    BalanceResult,
    BalanceStatus,
    AIInsight,
    NutriStreamDashboard,
    NervousSystemState,
    InsightSeverity,
} from '../types/BiometricAnalytics';

// ============================================================================
// BASELINE CALCULATOR
// ============================================================================

/**
 * Calculate 14-day rolling baseline from historical data.
 * Uses mean and standard deviation for deviation scoring.
 */
export function calculateBaseline(history: DailyBiometrics[]): BiometricBaseline {
    const n = history.length;

    if (n === 0) {
        return {
            avgHRV: 0, stdHRV: 0,
            avgRHR: 0, stdRHR: 0,
            avgRespiratoryRate: 0, stdRespiratoryRate: 0,
            avgSleepHours: 0, avgSleepQuality: 0,
            dataPoints: 0,
        };
    }

    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const std = (arr: number[], avg: number) =>
        Math.sqrt(arr.reduce((sum, v) => sum + (v - avg) ** 2, 0) / arr.length) || 1; // min 1 to avoid /0

    const hrvValues = history.map(d => d.hrv);
    const rhrValues = history.map(d => d.rhr);
    const respValues = history.map(d => d.respiratoryRate);
    const sleepH = history.map(d => d.sleepHours);
    const sleepQ = history.map(d => d.sleepQuality);

    const avgHRV = mean(hrvValues);
    const avgRHR = mean(rhrValues);
    const avgResp = mean(respValues);

    return {
        avgHRV,
        stdHRV: std(hrvValues, avgHRV),
        avgRHR,
        stdRHR: std(rhrValues, avgRHR),
        avgRespiratoryRate: avgResp,
        stdRespiratoryRate: std(respValues, avgResp),
        avgSleepHours: mean(sleepH),
        avgSleepQuality: mean(sleepQ),
        dataPoints: n,
    };
}

// ============================================================================
// RECOVERY CALCULATOR (0-100%)
// ============================================================================

// Weight distribution following Bevel specification
const RECOVERY_WEIGHTS = {
    hrv: 0.45,
    rhr: 0.30,
    sleep: 0.15,
    respiratory: 0.10,
};

/**
 * Calculate Recovery score by comparing today's values against 14-day baseline.
 * HRV above baseline → better recovery. RHR above baseline → worse recovery.
 */
export function calculateRecovery(
    today: DailyBiometrics,
    baseline: BiometricBaseline
): RecoveryResult {
    // If no baseline data, use reasonable defaults
    const hasBaseline = baseline.dataPoints >= 3;

    // --- HRV Score ---
    // Higher HRV = better. Positive deviation from baseline = good.
    const hrvDeviation = hasBaseline
        ? (today.hrv - baseline.avgHRV) / baseline.stdHRV
        : 0;
    // Map deviation to 0-100: +2σ = 100, -2σ = 0, mean = 50
    const hrvScore = clamp(50 + hrvDeviation * 25, 0, 100);

    // --- RHR Score ---
    // Lower RHR = better. Positive deviation from baseline = BAD.
    const rhrDeviation = hasBaseline
        ? (today.rhr - baseline.avgRHR) / baseline.stdRHR
        : 0;
    // Invert: +2σ = 0, -2σ = 100, mean = 50
    const rhrScore = clamp(50 - rhrDeviation * 25, 0, 100);

    // --- Sleep Score ---
    // Target: 7-9 hours = 100%. Quality weighted.
    let sleepHoursScore: number;
    if (today.sleepHours >= 7 && today.sleepHours <= 9) {
        sleepHoursScore = 100;
    } else if (today.sleepHours < 7) {
        sleepHoursScore = (today.sleepHours / 7) * 100;
    } else {
        sleepHoursScore = Math.max(0, 100 - (today.sleepHours - 9) * 15);
    }
    const sleepScore = sleepHoursScore * 0.6 + today.sleepQuality * 0.4;

    // --- Respiratory Score ---
    // Stable respiratory rate = good. Deviation in either direction = bad.
    const respDeviation = hasBaseline
        ? Math.abs(today.respiratoryRate - baseline.avgRespiratoryRate) / baseline.stdRespiratoryRate
        : 0;
    const respiratoryScore = clamp(100 - respDeviation * 30, 0, 100);

    // --- Weighted Total ---
    const totalScore = Math.round(
        hrvScore * RECOVERY_WEIGHTS.hrv +
        rhrScore * RECOVERY_WEIGHTS.rhr +
        sleepScore * RECOVERY_WEIGHTS.sleep +
        respiratoryScore * RECOVERY_WEIGHTS.respiratory
    );

    // --- Nervous System State ---
    let nervousSystemState: NervousSystemState;
    let nervousSystemDescription: string;
    if (hrvDeviation > 0.5) {
        nervousSystemState = 'parasympathetic';
        nervousSystemDescription = 'Predominio Parasimpático: Tu sistema nervioso está en modo recuperación. HRV por encima de tu línea base.';
    } else if (hrvDeviation < -0.5) {
        nervousSystemState = 'sympathetic';
        nervousSystemDescription = 'Predominio Simpático: Tu sistema nervioso está activado. HRV por debajo de tu línea base. Considera reducir la intensidad.';
    } else {
        nervousSystemState = 'balanced';
        nervousSystemDescription = 'Sistema Nervioso Equilibrado: Tu HRV está dentro del rango normal. Tu cuerpo está en buen estado.';
    }

    // --- Status and Recommendation ---
    let status: RecoveryResult['status'];
    let recommendation: string;

    if (totalScore >= 80) {
        status = 'optimal';
        recommendation = '¡Recuperación óptima! Puedes afrontar un entrenamiento de alta intensidad. Tu cuerpo está completamente preparado.';
    } else if (totalScore >= 60) {
        status = 'good';
        recommendation = 'Buena recuperación. Entrenamiento moderado-alto recomendado. Monitoriza las señales de tu cuerpo.';
    } else if (totalScore >= 40) {
        status = 'moderate';
        recommendation = 'Recuperación moderada. Opta por un entrenamiento ligero o recuperación activa. Prioriza la hidratación.';
    } else {
        status = 'low';
        recommendation = 'Recuperación baja. Hoy es mejor descansar. Prioriza sueño de calidad y nutrición antiinflamatoria.';
    }

    return {
        score: totalScore,
        status,
        nervousSystemState,
        nervousSystemDescription,
        factors: {
            hrv: {
                value: today.hrv,
                baseline: baseline.avgHRV,
                deviation: Math.round(hrvDeviation * 100) / 100,
                score: Math.round(hrvScore),
                weight: RECOVERY_WEIGHTS.hrv,
            },
            rhr: {
                value: today.rhr,
                baseline: baseline.avgRHR,
                deviation: Math.round(rhrDeviation * 100) / 100,
                score: Math.round(rhrScore),
                weight: RECOVERY_WEIGHTS.rhr,
            },
            sleep: {
                hours: today.sleepHours,
                quality: today.sleepQuality,
                score: Math.round(sleepScore),
                weight: RECOVERY_WEIGHTS.sleep,
            },
            respiratory: {
                value: today.respiratoryRate,
                baseline: baseline.avgRespiratoryRate,
                deviation: Math.round(respDeviation * 100) / 100,
                score: Math.round(respiratoryScore),
                weight: RECOVERY_WEIGHTS.respiratory,
            },
        },
        recommendation,
    };
}

// ============================================================================
// STRAIN CALCULATOR (0-21, TRIMP logarithmic)
// ============================================================================

// Zone weights for TRIMP calculation (exponential increase reflects intensity)
const ZONE_WEIGHTS = [1, 2, 3, 5, 8]; // Z1 through Z5

/**
 * Calculate Strain using TRIMP (Training Impulse).
 * Logarithmic scale 0-21 based on time in heart rate zones.
 */
export function calculateStrain(today: DailyBiometrics): StrainResult {
    const zones = today.hrZoneMinutes;
    const zoneArr = [zones.z1, zones.z2, zones.z3, zones.z4, zones.z5];

    // Raw TRIMP = Σ(zone_minutes × zone_weight)
    const zoneDistribution = zoneArr.map((minutes, i) => ({
        zone: i + 1,
        minutes,
        weight: ZONE_WEIGHTS[i],
        contribution: minutes * ZONE_WEIGHTS[i],
    }));

    const rawTRIMP = zoneDistribution.reduce((sum, z) => sum + z.contribution, 0);

    // Logarithmic transformation: strain = 7 × ln(1 + rawTRIMP / 50)
    // This creates the non-linear 0-21 scale where higher strain is harder to reach
    const strainScore = Math.min(21, 7 * Math.log(1 + rawTRIMP / 50));
    const roundedStrain = Math.round(strainScore * 10) / 10;

    // Peak zone
    let peakHRZone = 1;
    for (let i = zoneArr.length - 1; i >= 0; i--) {
        if (zoneArr[i] > 0) { peakHRZone = i + 1; break; }
    }

    const totalActiveMinutes = zoneArr.reduce((a, b) => a + b, 0);

    // Level classification
    let level: StrainResult['level'];
    let recommendation: string;

    if (roundedStrain < 5) {
        level = 'light';
        recommendation = 'Esfuerzo ligero. Si tu recuperación es buena, puedes buscar más intensidad.';
    } else if (roundedStrain < 10) {
        level = 'moderate';
        recommendation = 'Esfuerzo moderado. Buen rango para mantener la forma sin sobrecargar.';
    } else if (roundedStrain < 16) {
        level = 'high';
        recommendation = 'Esfuerzo alto. Asegúrate de una buena recuperación esta noche: sueño, hidratación y nutrición.';
    } else {
        level = 'overreaching';
        recommendation = 'Esfuerzo extremo. Tu carga cardiovascular es muy alta. Necesitarás 1-2 días de recuperación.';
    }

    return {
        score: roundedStrain,
        level,
        cardiovascularLoad: rawTRIMP,
        zoneDistribution,
        peakHRZone,
        totalActiveMinutes,
        recommendation,
    };
}

// ============================================================================
// ENERGY BANK (0-100%)
// ============================================================================

/**
 * Calculate Energy Bank: sleep debt + metabolic burn rate + stress level.
 * @param history - last 7 days of biometrics for sleep debt calculation
 * @param basalMetabolicRate - user's BMR in kcal/day
 */
export function calculateEnergyBank(
    today: DailyBiometrics,
    history: DailyBiometrics[],
    basalMetabolicRate: number
): EnergyBankResult {
    // --- Sleep Debt (last 7 days) ---
    const targetSleep = 8; // hours
    const last7 = history.slice(-7);
    const sleepDebtHours = last7.reduce((debt, d) => debt + Math.max(0, targetSleep - d.sleepHours), 0);
    // 0 debt = 100, 14+ hours debt = 0
    const sleepDebtScore = clamp(100 - (sleepDebtHours / 14) * 100, 0, 100);

    // --- Metabolic Burn ---
    const bmr = basalMetabolicRate || 1800; // default fallback
    const metabolicRatio = today.activeCalories / bmr;
    // Ratio 0 = 100 (no burn), ratio 1+ = lower score
    const metabolicScore = clamp(100 - metabolicRatio * 60, 20, 100);

    // --- Stress Level (from resting HRV dips) ---
    let stressValue = 30; // default moderate
    if (today.restingPeriods && today.restingPeriods.length > 0) {
        const restingHRVs = today.restingPeriods.map(p => p.hrvReading);
        const avgRestingHRV = restingHRVs.reduce((a, b) => a + b, 0) / restingHRVs.length;
        // Lower resting HRV = higher stress
        // Compare against today's overall HRV
        if (today.hrv > 0) {
            const dip = (today.hrv - avgRestingHRV) / today.hrv;
            stressValue = clamp(dip * 200, 0, 100); // Scale dip to 0-100
        }
    }
    const stressScore = clamp(100 - stressValue, 0, 100);

    // --- Combined Score ---
    const totalScore = Math.round(
        sleepDebtScore * 0.45 +
        metabolicScore * 0.30 +
        stressScore * 0.25
    );

    let status: EnergyBankResult['status'];
    let recommendation: string;

    if (totalScore >= 80) {
        status = 'full';
        recommendation = 'Batería llena. Tienes energía de sobra para un día exigente.';
    } else if (totalScore >= 60) {
        status = 'good';
        recommendation = 'Buena energía. Gestiona bien los descansos y llegarás bien al final del día.';
    } else if (totalScore >= 35) {
        status = 'moderate';
        recommendation = 'Energía moderada. Tienes deuda de sueño o alto gasto metabólico. Prioriza la recuperación.';
    } else {
        status = 'depleted';
        recommendation = 'Batería agotada. Tu cuerpo necesita descanso urgente. Evita entrenamientos intensos.';
    }

    return {
        score: totalScore,
        status,
        components: {
            sleepDebt: { value: Math.round(sleepDebtHours * 10) / 10, score: Math.round(sleepDebtScore) },
            metabolicBurn: { ratio: Math.round(metabolicRatio * 100) / 100, score: Math.round(metabolicScore) },
            stressLevel: { value: Math.round(stressValue), score: Math.round(stressScore) },
        },
        recommendation,
    };
}

// ============================================================================
// BALANCE STATUS
// ============================================================================

/**
 * Cross recovery with strain to determine training balance.
 */
export function calculateBalance(
    recovery: RecoveryResult,
    strain: StrainResult
): BalanceResult {
    // Normalize strain to 0-100 scale for comparison (21 → 100)
    const normalizedStrain = (strain.score / 21) * 100;
    const ratio = normalizedStrain / Math.max(recovery.score, 1);

    let status: BalanceStatus;
    let description: string;
    let color: string;

    if (ratio > 1.3) {
        status = 'Sobreesfuerzo';
        description = 'Tu esfuerzo supera tu capacidad de recuperación. Riesgo de sobreentrenamiento.';
        color = '#ef4444'; // red
    } else if (ratio < 0.6) {
        status = 'Recuperación';
        description = 'Tu recuperación supera el esfuerzo realizado. Día ideal para cargar más o descansar activamente.';
        color = '#3b82f6'; // blue
    } else {
        status = 'Óptimo';
        description = 'Tu esfuerzo está equilibrado con tu recuperación. Entrenamiento inteligente.';
        color = '#10b981'; // green
    }

    return {
        status,
        recoveryScore: recovery.score,
        strainScore: strain.score,
        ratio: Math.round(ratio * 100) / 100,
        description,
        color,
    };
}

// ============================================================================
// AI INSIGHTS GENERATOR
// ============================================================================

/**
 * Generate actionable insights by detecting trends in biometric history.
 */
export function generateInsights(
    today: DailyBiometrics,
    history: DailyBiometrics[],
    baseline: BiometricBaseline,
    recovery: RecoveryResult,
    strain: StrainResult,
    balance: BalanceResult
): AIInsight[] {
    const insights: AIInsight[] = [];

    if (history.length < 3) return insights; // Need minimum data

    const last5 = history.slice(-5);

    // --- RHR Rising Trend (illness/overtraining) ---
    if (last5.length >= 3) {
        const rhrTrend = last5.map(d => d.rhr);
        const isRising = rhrTrend.every((v, i) => i === 0 || v >= rhrTrend[i - 1]);
        const totalRise = rhrTrend[rhrTrend.length - 1] - rhrTrend[0];

        if (isRising && totalRise > 3) {
            const severity: InsightSeverity = totalRise > 7 ? 'critical' : 'warning';
            insights.push({
                id: 'rhr-rising',
                category: 'rhr',
                severity,
                title: 'Frecuencia cardíaca en reposo subiendo',
                message: `Tu RHR ha subido ${totalRise} bpm en los últimos ${last5.length} días. Esto puede indicar enfermedad incipiente, sobreentrenamiento o estrés acumulado.`,
                trend: 'rising',
                dataPoints: rhrTrend,
                actionable: 'Monitoriza tu temperatura. Si continúa subiendo, reduce la carga de entrenamiento y prioriza el descanso.',
            });
        }
    }

    // --- HRV Dropping Trend ---
    if (last5.length >= 3) {
        const hrvTrend = last5.map(d => d.hrv);
        const isFalling = hrvTrend.every((v, i) => i === 0 || v <= hrvTrend[i - 1]);
        const totalDrop = hrvTrend[0] - hrvTrend[hrvTrend.length - 1];

        if (isFalling && totalDrop > 8) {
            insights.push({
                id: 'hrv-falling',
                category: 'hrv',
                severity: totalDrop > 15 ? 'critical' : 'warning',
                title: 'HRV en descenso',
                message: `Tu variabilidad cardíaca ha bajado ${totalDrop}ms en los últimos días. Tu sistema nervioso no está recuperándose correctamente.`,
                trend: 'falling',
                dataPoints: hrvTrend,
                actionable: 'Reduce la intensidad del entrenamiento. Incluye técnicas de respiración y meditación.',
            });
        }
    }

    // --- Sleep Debt Accumulation ---
    const last7 = history.slice(-7);
    const avgSleep7 = last7.reduce((sum, d) => sum + d.sleepHours, 0) / last7.length;
    if (avgSleep7 < 6.5 && last7.length >= 5) {
        insights.push({
            id: 'sleep-debt',
            category: 'sleep',
            severity: avgSleep7 < 5.5 ? 'critical' : 'warning',
            title: 'Deuda de sueño acumulada',
            message: `Tu promedio de sueño esta semana es ${avgSleep7.toFixed(1)}h. Estás por debajo del mínimo recomendado de 7h.`,
            trend: 'falling',
            dataPoints: last7.map(d => d.sleepHours),
            actionable: 'Establece una rutina de sueño fija. Evita pantallas 1h antes de dormir. Apunta a 8h esta noche.',
        });
    }

    // --- Strain vs Recovery Imbalance ---
    if (balance.status === 'Sobreesfuerzo') {
        const consecutiveOverreach = last5.filter(d => {
            const s = calculateStrain(d);
            return (s.score / 21) * 100 > 60;
        }).length;

        if (consecutiveOverreach >= 3) {
            insights.push({
                id: 'chronic-overreach',
                category: 'balance',
                severity: 'critical',
                title: 'Sobreesfuerzo crónico detectado',
                message: `Llevas ${consecutiveOverreach} días consecutivos con carga alta y recuperación insuficiente.`,
                trend: 'anomaly',
                actionable: 'Necesitas 1-2 días de descanso completo. Tu riesgo de lesión es elevado.',
            });
        }
    }

    // --- Respiratory Rate Anomaly (illness prediction) ---
    if (baseline.dataPoints >= 7) {
        const respDeviation = Math.abs(today.respiratoryRate - baseline.avgRespiratoryRate) / baseline.stdRespiratoryRate;
        if (respDeviation > 2) {
            insights.push({
                id: 'respiratory-anomaly',
                category: 'respiratory',
                severity: 'warning',
                title: 'Frecuencia respiratoria anómala',
                message: `Tu frecuencia respiratoria (${today.respiratoryRate} rpm) está ${respDeviation.toFixed(1)} desviaciones por encima de tu norma. Cambios aquí a menudo preceden síntomas de enfermedad.`,
                trend: 'anomaly',
                actionable: 'Monitoriza cómo te sientes las próximas horas. Hidrátate bien y evita sobrecargas.',
            });
        }
    }

    // --- Positive: Good Recovery Info ---
    if (recovery.score >= 85 && insights.length === 0) {
        insights.push({
            id: 'great-recovery',
            category: 'hrv',
            severity: 'info',
            title: '¡Recuperación excelente!',
            message: `Tu HRV está ${recovery.factors.hrv.deviation > 0 ? 'por encima' : 'en'} tu línea base y tu RHR es estable. Día ideal para entrenar fuerte.`,
            trend: 'stable',
            actionable: 'Aprovecha para un entrenamiento de alta intensidad o establecer nuevos récords.',
        });
    }

    return insights;
}

// ============================================================================
// FULL DASHBOARD CALCULATOR
// ============================================================================

/**
 * Main entry point: calculate all metrics from today's data + history.
 */
export function calculateDashboard(
    today: DailyBiometrics,
    history: DailyBiometrics[],
    basalMetabolicRate: number
): NutriStreamDashboard {
    // 14-day baseline from history
    const last14 = history.slice(-14);
    const baseline = calculateBaseline(last14);

    // Three pillars
    const recovery = calculateRecovery(today, baseline);
    const strain = calculateStrain(today);
    const energyBank = calculateEnergyBank(today, history, basalMetabolicRate);

    // Cross-analysis
    const balance = calculateBalance(recovery, strain);

    // AI insights
    const insights = generateInsights(today, history, baseline, recovery, strain, balance);

    return {
        recovery,
        strain,
        energyBank,
        balance,
        insights,
        baseline,
        lastUpdated: new Date().toISOString(),
    };
}

// ============================================================================
// UTILITY
// ============================================================================

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
