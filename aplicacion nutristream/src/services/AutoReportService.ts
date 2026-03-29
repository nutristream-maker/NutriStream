// AI Post-Session Autoreport Service
import { Session, Member } from '../types/ClubTypes';

export interface SessionMetrics {
    avgPower: number;
    maxPower: number;
    avgHR: number;
    maxHR: number;
    totalCalories: number;
    avgVO2: number;
    avgStability: number;
    duration: number; // minutes
}

export interface IndividualReport {
    memberId: string;
    name: string;
    avatar?: string;
    metrics: {
        avgPower: number;
        maxPower: number;
        avgHR: number;
        maxHR: number;
        calories: number;
        stability: number;
        asymmetryScore: number;
    };
    comparison: {
        powerVsAvg: number; // % difference from group average
        asymmetryImprovement: number; // % vs last session
        hrRecoveryTime: number; // seconds
    };
    fatigueZones: { muscle: string; level: number }[];
    aiInsight: string;
    badges: string[];
}

export interface SessionReport {
    id: string;
    sessionId: string;
    sessionTitle: string;
    trainerId: string;
    trainerName: string;
    date: Date;
    groupSummary: {
        peakPower: number;
        avgPower: number;
        avgCompliance: number;
        totalCalories: number;
        cpiChange: number;
        attendanceRate: number;
        podConnectedRate: number;
    };
    individualReports: IndividualReport[];
    highlights: string[];
    recommendations: string[];
    generatedAt: Date;
}

// AI Insights generator
const generateAIInsight = (report: IndividualReport): string => {
    const insights: string[] = [];

    // Power analysis
    if (report.comparison.powerVsAvg > 10) {
        insights.push(`Potencia ${report.comparison.powerVsAvg.toFixed(0)}% superior a la media del grupo.`);
    } else if (report.comparison.powerVsAvg < -10) {
        insights.push(`Considera aumentar intensidad, potencia ${Math.abs(report.comparison.powerVsAvg).toFixed(0)}% bajo la media.`);
    }

    // Asymmetry improvement
    if (report.comparison.asymmetryImprovement > 0) {
        insights.push(`Tu asimetría mejoró un ${report.comparison.asymmetryImprovement.toFixed(0)}% respecto a la sesión anterior. ¡Excelente!`);
    } else if (report.comparison.asymmetryImprovement < -5) {
        insights.push(`Atención: asimetría aumentó ${Math.abs(report.comparison.asymmetryImprovement).toFixed(0)}%. Revisar técnica.`);
    }

    // HR Recovery
    if (report.comparison.hrRecoveryTime < 60) {
        insights.push('Excelente recuperación cardíaca.');
    } else if (report.comparison.hrRecoveryTime > 120) {
        insights.push('Tu recuperación cardíaca está por encima del objetivo. Considera aumentar trabajo aeróbico.');
    }

    // Fatigue zones
    const highFatigue = report.fatigueZones.filter(z => z.level > 70);
    if (highFatigue.length > 0) {
        insights.push(`Zonas de alta fatiga: ${highFatigue.map(z => z.muscle).join(', ')}. Programar recuperación.`);
    }

    return insights.join(' ') || 'Buen rendimiento general. Mantén la constancia.';
};

// Generate badges based on performance
const generateBadges = (report: IndividualReport): string[] => {
    const badges: string[] = [];

    if (report.comparison.powerVsAvg > 15) badges.push('⚡ Power Leader');
    if (report.metrics.stability > 90) badges.push('🎯 Stability Master');
    if (report.comparison.asymmetryImprovement > 5) badges.push('⚖️ Symmetry Warrior');
    if (report.comparison.hrRecoveryTime < 45) badges.push('❤️ Recovery Champion');
    if (report.metrics.calories > 500) badges.push('🔥 Calorie Crusher');

    return badges;
};

// Simulate metrics
const simulateIndividualMetrics = (member: Member, avgPower: number): IndividualReport => {
    const memberVariance = 0.8 + Math.random() * 0.4; // 80-120% of average
    const power = avgPower * memberVariance;

    const report: IndividualReport = {
        memberId: member.id,
        name: member.name,
        avatar: member.avatar,
        metrics: {
            avgPower: Math.round(power),
            maxPower: Math.round(power * (1.2 + Math.random() * 0.3)),
            avgHR: 120 + Math.floor(Math.random() * 40),
            maxHR: 160 + Math.floor(Math.random() * 30),
            calories: 250 + Math.floor(Math.random() * 350),
            stability: 70 + Math.random() * 25,
            asymmetryScore: 2 + Math.random() * 15
        },
        comparison: {
            powerVsAvg: ((power / avgPower) - 1) * 100,
            asymmetryImprovement: -5 + Math.random() * 15,
            hrRecoveryTime: 30 + Math.random() * 120
        },
        fatigueZones: [
            { muscle: 'Cuádriceps', level: 40 + Math.random() * 50 },
            { muscle: 'Glúteos', level: 30 + Math.random() * 40 },
            { muscle: 'Core', level: 20 + Math.random() * 35 }
        ],
        aiInsight: '',
        badges: []
    };

    report.aiInsight = generateAIInsight(report);
    report.badges = generateBadges(report);

    return report;
};

export const AutoReportService = {
    /**
     * Generate complete session report
     */
    generateReport: async (session: Session, members: Member[]): Promise<SessionReport> => {
        const confirmedMembers = members.filter(m =>
            session.attendees.some(a => a.memberId === m.id && a.status === 'confirmed')
        );

        const avgPower = 180 + Math.random() * 80; // Base power

        // Generate individual reports
        const individualReports = confirmedMembers.map(m =>
            simulateIndividualMetrics(m, avgPower)
        );

        // Calculate group summary
        const totalPower = individualReports.reduce((acc, r) => acc + r.metrics.avgPower, 0);
        const maxPower = Math.max(...individualReports.map(r => r.metrics.maxPower));
        const totalCalories = individualReports.reduce((acc, r) => acc + r.metrics.calories, 0);

        // Generate highlights
        const highlights: string[] = [];
        const powerLeader = individualReports.reduce((max, r) => r.metrics.avgPower > max.metrics.avgPower ? r : max);
        highlights.push(`⚡ Mayor potencia: ${powerLeader.name} (${powerLeader.metrics.avgPower}W media)`);

        const stabilityLeader = individualReports.reduce((max, r) => r.metrics.stability > max.metrics.stability ? r : max);
        highlights.push(`🎯 Mejor estabilidad: ${stabilityLeader.name} (${stabilityLeader.metrics.stability.toFixed(1)}%)`);

        highlights.push(`🔥 Calorías totales del grupo: ${totalCalories} kcal`);

        // Generate recommendations
        const recommendations: string[] = [];
        const avgAsymmetry = individualReports.reduce((acc, r) => acc + r.metrics.asymmetryScore, 0) / individualReports.length;

        if (avgAsymmetry > 10) {
            recommendations.push('Incluir más trabajo unilateral en próximas sesiones para mejorar simetría grupal.');
        }

        const highFatigueCount = individualReports.filter(r =>
            r.fatigueZones.some(z => z.level > 70)
        ).length;

        if (highFatigueCount > individualReports.length * 0.5) {
            recommendations.push('Más del 50% del grupo muestra fatiga alta. Considerar sesión de recuperación.');
        }

        recommendations.push('Mantener hidratación y nutrición post-entreno con RecoveryChef AI.');

        return {
            id: `report-${session.id}-${Date.now()}`,
            sessionId: session.id,
            sessionTitle: session.title,
            trainerId: session.trainerId,
            trainerName: session.trainerName,
            date: session.dateTime,
            groupSummary: {
                peakPower: maxPower,
                avgPower: Math.round(totalPower / individualReports.length),
                avgCompliance: 85 + Math.random() * 12,
                totalCalories,
                cpiChange: -2 + Math.random() * 5,
                attendanceRate: (confirmedMembers.length / session.capacity) * 100,
                podConnectedRate: (confirmedMembers.filter(m => m.podConnected).length / confirmedMembers.length) * 100
            },
            individualReports,
            highlights,
            recommendations,
            generatedAt: new Date()
        };
    },

    /**
     * Format report for display
     */
    formatMetric: (value: number, type: 'power' | 'hr' | 'calories' | 'percent'): string => {
        switch (type) {
            case 'power': return `${Math.round(value)}W`;
            case 'hr': return `${Math.round(value)} bpm`;
            case 'calories': return `${Math.round(value)} kcal`;
            case 'percent': return `${value.toFixed(1)}%`;
        }
    }
};

export default AutoReportService;
