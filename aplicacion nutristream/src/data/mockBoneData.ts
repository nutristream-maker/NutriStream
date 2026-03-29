// Mock bone injury and fracture history data
export interface BoneInjury {
    type: 'fracture' | 'stress' | 'bruise' | 'none';
    date: string;
    severity: 'mild' | 'moderate' | 'severe';
    recoveryDays: number;
    healed: boolean;
    description?: string;
}

export interface BoneData {
    boneName: string;
    displayName: string;
    lastInjury?: BoneInjury;
    history: BoneInjury[];
    recommendations: string[];
}

export const mockBoneData: { [key: string]: BoneData } = {
    skull: {
        boneName: 'skull',
        displayName: 'Cráneo',
        history: [],
        recommendations: ['Utiliza siempre casco al practicar deportes de contacto', 'Evita impactos directos en la cabeza']
    },
    clavicle: {
        boneName: 'clavicle',
        displayName: 'Clavícula',
        lastInjury: {
            type: 'fracture',
            date: '2024-03-15',
            severity: 'moderate',
            recoveryDays: 42,
            healed: true,
            description: 'Fractura simple por caída'
        },
        history: [
            {
                type: 'fracture',
                date: '2024-03-15',
                severity: 'moderate',
                recoveryDays: 42,
                healed: true,
                description: 'Fractura simple por caída'
            }
        ],
        recommendations: ['Fortalece los músculos del hombro', 'Evita caídas sobre el brazo extendido']
    },
    humerus: {
        boneName: 'humerus',
        displayName: 'Húmero',
        history: [],
        recommendations: ['Mantén buena densidad ósea con ejercicio regular', 'Cuidado con movimientos bruscos de rotación']
    },
    radiusUlna: {
        boneName: 'radiusUlna',
        displayName: 'Radio y Cúbito',
        lastInjury: {
            type: 'stress',
            date: '2024-10-20',
            severity: 'mild',
            recoveryDays: 21,
            healed: false,
            description: 'Fractura por estrés debido a sobrecarga'
        },
        history: [
            {
                type: 'stress',
                date: '2024-10-20',
                severity: 'mild',
                recoveryDays: 21,
                healed: false,
                description: 'Fractura por estrés debido a sobrecarga'
            }
        ],
        recommendations: ['Reduce actividades de alto impacto temporalmente', 'Aumenta ingesta de calcio y vitamina D']
    },
    spine: {
        boneName: 'spine',
        displayName: 'Columna Vertebral',
        history: [],
        recommendations: ['Mantén buena postura', 'Fortalece el core para proteger la columna', 'Evita levantar peso excesivo sin técnica adecuada']
    },
    ribs: {
        boneName: 'ribs',
        displayName: 'Costillas',
        lastInjury: {
            type: 'bruise',
            date: '2024-08-05',
            severity: 'mild',
            recoveryDays: 14,
            healed: true,
            description: 'Contusión costal por impacto'
        },
        history: [
            {
                type: 'bruise',
                date: '2024-08-05',
                severity: 'mild',
                recoveryDays: 14,
                healed: true,
                description: 'Contusión costal por impacto'
            }
        ],
        recommendations: ['Usa protección adecuada en deportes de contacto', 'Respira profundamente regularmente para mantener movilidad']
    },
    pelvis: {
        boneName: 'pelvis',
        displayName: 'Pelvis',
        history: [],
        recommendations: ['Fortalece músculos del suelo pélvico', 'Mantén flexibilidad de cadera']
    },
    femur: {
        boneName: 'femur',
        displayName: 'Fémur',
        history: [],
        recommendations: ['El hueso más fuerte del cuerpo', 'Mantén masa muscular para protección', 'Evita impactos laterales']
    },
    tibiaFibula: {
        boneName: 'tibiaFibula',
        displayName: 'Tibia y Peroné',
        history: [],
        recommendations: ['Aumenta carga de entrenamiento gradualmente', 'Usa calzado apropiado', 'Superficies de entrenamiento variadas']
    }
};
