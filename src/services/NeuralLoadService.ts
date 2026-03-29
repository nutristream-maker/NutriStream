// Neural-Load Balancing Service - Group Energy Management
import { Member, Session } from '../types/ClubTypes';

export type SemaphoreLevel = 'green' | 'amber' | 'red';

export interface GroupLoadStatus {
    averageBattery: number;
    averageFatigue: number;
    semaphore: SemaphoreLevel;
    recommendation: string;
    suggestedRPE: number;
    highFatigueMembers: { name: string; fatigue: number }[];
    connectedCount: number;
    totalCount: number;
}

export interface RPERecommendation {
    rpe: number;
    sessionType: string;
    description: string;
    icon: string;
}

const RPE_RECOMMENDATIONS: Record<SemaphoreLevel, RPERecommendation> = {
    green: {
        rpe: 7,
        sessionType: 'Alta Intensidad',
        description: 'El grupo está fresco y listo. Sesión normal con intensidad completa.',
        icon: '🚀'
    },
    amber: {
        rpe: 5,
        sessionType: 'Intensidad Moderada',
        description: 'Fatiga moderada detectada. Se recomienda reducir el volumen un 20%.',
        icon: '⚡'
    },
    red: {
        rpe: 3,
        sessionType: 'Recuperación / Movilidad',
        description: 'Fatiga alta en el grupo. Recomendamos sesión de descarga o movilidad activa.',
        icon: '🧘'
    }
};

export const NeuralLoadService = {
    /**
     * Calculate group load status from confirmed session attendees
     */
    calculateGroupLoad: (members: Member[], session?: Session): GroupLoadStatus => {
        // Filter to only members with connected pods for accurate data
        const connectedMembers = members.filter(m => m.podConnected);

        if (connectedMembers.length === 0) {
            return {
                averageBattery: 0,
                averageFatigue: 0,
                semaphore: 'green',
                recommendation: 'Sin datos de Neural Skin Pod conectados',
                suggestedRPE: 6,
                highFatigueMembers: [],
                connectedCount: 0,
                totalCount: members.length
            };
        }

        // Calculate averages
        const avgBattery = Math.round(
            connectedMembers.reduce((acc, m) => acc + m.neuralBattery, 0) / connectedMembers.length
        );
        const avgFatigue = Math.round(
            connectedMembers.reduce((acc, m) => acc + (m.fatigueLevel || 0), 0) / connectedMembers.length
        );

        // Determine semaphore level based on fatigue
        let semaphore: SemaphoreLevel;
        if (avgFatigue >= 70) {
            semaphore = 'red';
        } else if (avgFatigue >= 30) {
            semaphore = 'amber';
        } else {
            semaphore = 'green';
        }

        // Find high-fatigue members (> 50%)
        const highFatigueMembers = connectedMembers
            .filter(m => (m.fatigueLevel || 0) > 50)
            .map(m => ({ name: m.name, fatigue: m.fatigueLevel || 0 }))
            .sort((a, b) => b.fatigue - a.fatigue);

        const recommendation = RPE_RECOMMENDATIONS[semaphore];

        return {
            averageBattery: avgBattery,
            averageFatigue: avgFatigue,
            semaphore,
            recommendation: recommendation.description,
            suggestedRPE: recommendation.rpe,
            highFatigueMembers,
            connectedCount: connectedMembers.length,
            totalCount: members.length
        };
    },

    /**
     * Get RPE recommendation details
     */
    getRPERecommendation: (level: SemaphoreLevel): RPERecommendation => {
        return RPE_RECOMMENDATIONS[level];
    },

    /**
     * Check if session should be modified based on group load
     */
    shouldModifySession: (status: GroupLoadStatus): boolean => {
        return status.semaphore === 'red' || status.highFatigueMembers.length >= 3;
    },

    /**
     * Get alert message for trainer
     */
    getTrainerAlert: (status: GroupLoadStatus): string | null => {
        if (status.semaphore === 'red') {
            return `⚠️ ALERTA: Fatiga grupal alta (${status.averageFatigue}%). Se recomienda sesión de recuperación.`;
        }
        if (status.highFatigueMembers.length >= 3) {
            const names = status.highFatigueMembers.slice(0, 3).map(m => m.name.split(' ')[0]).join(', ');
            return `⚡ ${status.highFatigueMembers.length} atletas con fatiga elevada: ${names}...`;
        }
        return null;
    }
};

export default NeuralLoadService;
