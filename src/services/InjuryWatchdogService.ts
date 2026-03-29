// Injury Risk Watchdog Service - Passive monitoring for trainer alerts
import { Member } from '../types/ClubTypes';

export type RiskType = 'asymmetry' | 'pronation' | 'overload' | 'form_breakdown';
export type RiskSeverity = 'low' | 'medium' | 'high';

export interface InjuryRisk {
    id: string;
    memberId: string;
    memberName: string;
    riskType: RiskType;
    severity: RiskSeverity;
    muscleGroup?: string;
    percentageDeviation: number;
    recommendation: string;
    detectedAt: Date;
    isAcknowledged: boolean;
}

interface RiskThreshold {
    low: number;
    medium: number;
    high: number;
}

const RISK_THRESHOLDS: Record<RiskType, RiskThreshold> = {
    asymmetry: { low: 8, medium: 12, high: 15 },
    pronation: { low: 5, medium: 8, high: 10 },
    overload: { low: 60, medium: 75, high: 85 },
    form_breakdown: { low: 10, medium: 20, high: 30 }
};

const RISK_LABELS: Record<RiskType, { name: string; icon: string }> = {
    asymmetry: { name: 'Asimetría Muscular', icon: '⚖️' },
    pronation: { name: 'Pronación Excesiva', icon: '🦶' },
    overload: { name: 'Sobrecarga Muscular', icon: '💪' },
    form_breakdown: { name: 'Deterioro de Forma', icon: '📉' }
};

const RECOMMENDATIONS: Record<RiskType, Record<RiskSeverity, string>> = {
    asymmetry: {
        low: 'Monitorizar durante el ejercicio',
        medium: 'Revisar técnica y reducir carga en lado dominante',
        high: 'Detener ejercicio bilateral, realizar correcciones unilaterales'
    },
    pronation: {
        low: 'Revisar posición de pies',
        medium: 'Corregir postura, considerar pausa',
        high: 'Detener ejercicio, evaluar fatiga en gemelos/tibiales'
    },
    overload: {
        low: 'Considerar reducir intensidad',
        medium: 'Reducir repeticiones, aumentar descanso',
        high: 'Cambiar a ejercicio de recuperación activa'
    },
    form_breakdown: {
        low: 'Recordar cues técnicos',
        medium: 'Reducir peso/intensidad inmediatamente',
        high: 'Parar ejercicio, riesgo de lesión inminente'
    }
};

// Simulated risk detection based on member fatigue
const simulateRiskDetection = (member: Member): InjuryRisk | null => {
    const fatigue = member.fatigueLevel || 0;
    const neuralBattery = member.neuralBattery;

    // Random chance based on fatigue level
    const riskChance = fatigue / 200; // Max 50% chance at 100% fatigue

    if (Math.random() > riskChance) return null;

    // Determine risk type based on simulated data
    const riskTypes: RiskType[] = ['asymmetry', 'pronation', 'overload', 'form_breakdown'];
    const riskType = riskTypes[Math.floor(Math.random() * riskTypes.length)];

    // Calculate deviation based on fatigue
    const baseDeviation = 5 + (fatigue * 0.2) + (Math.random() * 10);
    const deviation = Math.round(baseDeviation * 10) / 10;

    // Determine severity
    const thresholds = RISK_THRESHOLDS[riskType];
    let severity: RiskSeverity;
    if (deviation >= thresholds.high) severity = 'high';
    else if (deviation >= thresholds.medium) severity = 'medium';
    else if (deviation >= thresholds.low) severity = 'low';
    else return null; // Below threshold

    return {
        id: `risk-${member.id}-${Date.now()}`,
        memberId: member.id,
        memberName: member.name,
        riskType,
        severity,
        muscleGroup: riskType === 'asymmetry' || riskType === 'overload'
            ? ['Cuádriceps', 'Glúteo', 'Isquiotibiales', 'Core'][Math.floor(Math.random() * 4)]
            : undefined,
        percentageDeviation: deviation,
        recommendation: RECOMMENDATIONS[riskType][severity],
        detectedAt: new Date(),
        isAcknowledged: false
    };
};

export const InjuryWatchdogService = {
    /**
     * Get risk label info
     */
    getRiskLabel: (riskType: RiskType) => RISK_LABELS[riskType],

    /**
     * Scan all members for injury risks
     */
    scanForRisks: (members: Member[]): InjuryRisk[] => {
        const risks: InjuryRisk[] = [];

        members
            .filter(m => m.podConnected)
            .forEach(member => {
                const risk = simulateRiskDetection(member);
                if (risk) risks.push(risk);
            });

        // Sort by severity (high first)
        return risks.sort((a, b) => {
            const order = { high: 0, medium: 1, low: 2 };
            return order[a.severity] - order[b.severity];
        });
    },

    /**
     * Get severity color config
     */
    getSeverityConfig: (severity: RiskSeverity) => {
        const configs = {
            low: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
            medium: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
            high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' }
        };
        return configs[severity];
    },

    /**
     * Format alert message for trainer
     */
    formatAlertMessage: (risk: InjuryRisk): string => {
        const label = RISK_LABELS[risk.riskType];
        const muscle = risk.muscleGroup ? ` en ${risk.muscleGroup}` : '';
        return `${label.icon} ${risk.memberName}: ${label.name}${muscle} (${risk.percentageDeviation}%)`;
    },

    /**
     * Check if risk requires immediate attention
     */
    isUrgent: (risk: InjuryRisk): boolean => {
        return risk.severity === 'high';
    },

    /**
     * Get vibration pattern for smartwatch simulation
     */
    getVibrationPattern: (severity: RiskSeverity): number[] => {
        // [vibrate, pause, vibrate, ...] in ms
        switch (severity) {
            case 'high': return [200, 100, 200, 100, 200];
            case 'medium': return [200, 100, 200];
            case 'low': return [150];
        }
    }
};

export default InjuryWatchdogService;
