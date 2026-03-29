/**
 * SpecialistPlanService - Marketplace for Training Plans
 * 
 * Manages the creation, listing, purchasing, and rating of
 * training plans created by specialists.
 */

// Types
export type PlanCategory = 'strength' | 'cardio' | 'tennis' | 'weight_loss' | 'flexibility' | 'recovery' | 'nutrition';
export type PlanDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'elite';

export interface SpecialistInfo {
    id: string;
    name: string;
    title: string; // e.g., "Entrenador Personal Certificado"
    avatarUrl?: string;
    verified: boolean;
    rating: number;
    totalSales: number;
    specialty: string[];
}

export interface TrainingPlan {
    id: string;
    title: string;
    description: string;
    shortDescription: string;
    category: PlanCategory;
    difficulty: PlanDifficulty;
    durationWeeks: number;
    sessionsPerWeek: number;
    price: number; // in cents
    discountPrice?: number;
    currency: string;
    specialist: SpecialistInfo;
    rating: number;
    reviewCount: number;
    salesCount: number;
    features: string[];
    targetAudience: string[];
    equipment: string[];
    imageUrl?: string;
    previewAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
    isFeatured: boolean;
    tags: string[];
    curriculum: CurriculumWeek[];
}

export interface CurriculumWeek {
    weekNumber: number;
    title: string;
    description: string;
    days: {
        day: string;
        title: string;
        focus: string;
        duration: string;
        completed?: boolean;
    }[];
}

export interface PlanPurchase {
    id: string;
    planId: string;
    userId: string;
    purchaseDate: Date;
    price: number;
    status: 'active' | 'completed' | 'refunded';
}

export interface PlanReview {
    id: string;
    planId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Date;
    helpful: number;
}

// Category configurations
export const PLAN_CATEGORIES: Record<PlanCategory, { label: string; icon: string; color: string }> = {
    strength: { label: 'Fuerza', icon: '💪', color: 'indigo' },
    cardio: { label: 'Cardio', icon: '❤️', color: 'rose' },
    tennis: { label: 'Tenis', icon: '🎾', color: 'green' },
    weight_loss: { label: 'Pérdida de Peso', icon: '⚖️', color: 'amber' },
    flexibility: { label: 'Flexibilidad', icon: '🧘', color: 'purple' },
    recovery: { label: 'Recuperación', icon: '🔄', color: 'cyan' },
    nutrition: { label: 'Nutrición', icon: '🥗', color: 'emerald' },
};

export const PLAN_DIFFICULTIES: Record<PlanDifficulty, { label: string; color: string }> = {
    beginner: { label: 'Principiante', color: 'green' },
    intermediate: { label: 'Intermedio', color: 'amber' },
    advanced: { label: 'Avanzado', color: 'orange' },
    elite: { label: 'Élite', color: 'red' },
};

/**
 * Format price for display.
 */
export const formatPrice = (cents: number, currency: string = 'EUR'): string => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency,
    }).format(cents / 100);
};

/**
 * Calculate discount percentage.
 */
export const getDiscountPercentage = (original: number, discounted: number): number => {
    return Math.round(((original - discounted) / original) * 100);
};

/**
 * Get featured plans (for homepage).
 */
export const getFeaturedPlans = (): TrainingPlan[] => {
    return getMockPlans().filter(p => p.isFeatured);
};

/**
 * Search plans by query.
 */
export const searchPlans = (query: string, plans: TrainingPlan[]): TrainingPlan[] => {
    const lower = query.toLowerCase();
    return plans.filter(p =>
        p.title.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower) ||
        p.tags.some(t => t.toLowerCase().includes(lower)) ||
        p.specialist.name.toLowerCase().includes(lower)
    );
};

/**
 * Filter plans by category.
 */
export const filterByCategory = (category: PlanCategory, plans: TrainingPlan[]): TrainingPlan[] => {
    return plans.filter(p => p.category === category);
};

/**
 * Sort plans.
 */
export const sortPlans = (
    plans: TrainingPlan[],
    sortBy: 'price_asc' | 'price_desc' | 'rating' | 'popularity' | 'newest'
): TrainingPlan[] => {
    const sorted = [...plans];
    switch (sortBy) {
        case 'price_asc':
            return sorted.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        case 'price_desc':
            return sorted.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        case 'rating':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'popularity':
            return sorted.sort((a, b) => b.salesCount - a.salesCount);
        case 'newest':
            return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        default:
            return sorted;
    }
};

/**
 * Mock data for development.
 */
export const getMockPlans = (): TrainingPlan[] => {
    const now = new Date();
    return [
        {
            id: 'plan_1',
            title: 'Programa de Fuerza 12 Semanas',
            description: 'Un programa completo de 12 semanas diseñado para aumentar tu fuerza máxima en los levantamientos principales. Incluye periodización ondulante, técnicas de intensificación y estrategias de recuperación.',
            shortDescription: 'Aumenta tu fuerza máxima con periodización ondulante',
            category: 'strength',
            difficulty: 'intermediate',
            durationWeeks: 12,
            sessionsPerWeek: 4,
            price: 4999, // €49.99
            discountPrice: 3999, // €39.99
            currency: 'EUR',
            specialist: {
                id: 'specialist_1',
                name: 'Carlos Martínez',
                title: 'Entrenador de Fuerza NSCA-CSCS',
                verified: true,
                rating: 4.9,
                totalSales: 342,
                specialty: ['Fuerza', 'Powerlifting'],
            },
            rating: 4.8,
            reviewCount: 128,
            salesCount: 342,
            features: [
                '48 sesiones detalladas',
                'Videos explicativos',
                'Plantillas de progresión',
                'Soporte por chat',
            ],
            targetAudience: ['Adultos', 'Nivel intermedio', 'Objetivos de fuerza'],
            equipment: ['Barra olímpica', 'Rack de sentadillas', 'Banco'],
            previewAvailable: true,
            createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            updatedAt: now,
            isFeatured: true,
            tags: ['fuerza', 'powerlifting', '12 semanas', 'intermedio'],
            curriculum: [
                {
                    weekNumber: 1,
                    title: "Fase de Adaptación",
                    description: "Introducción a los movimientos básicos y evaluación inicial.",
                    days: [
                        { day: "Lunes", title: "Sentadilla y Pierna", focus: "Hipertrofia", duration: "60m" },
                        { day: "Martes", title: "Bench Press y Empuje", focus: "Fuerza Base", duration: "55m" },
                        { day: "Jueves", title: "Peso Muerto y Tracción", focus: "Técnica", duration: "60m" },
                        { day: "Viernes", title: "Accesorios y Brazos", focus: "Bombeo", duration: "45m" }
                    ]
                },
                {
                    weekNumber: 2,
                    title: "Acumulación de Volumen",
                    description: "Incremento progresivo de la carga de trabajo.",
                    days: [
                        { day: "Lunes", title: "Sentadilla Pesada", focus: "Intensidad", duration: "65m" },
                        { day: "Martes", title: "Bench Press Pausado", focus: "Estabilidad", duration: "60m" },
                        { day: "Jueves", title: "Variantes de Peso Muerto", focus: "Déficit", duration: "65m" },
                        { day: "Viernes", title: "Torso Hipertrofia", focus: "Volumen", duration: "50m" }
                    ]
                }
            ]
        },
        {
            id: 'plan_2',
            title: 'Tenis: Mejora tu Servicio',
            description: 'Programa especializado de 8 semanas para mejorar la potencia, precisión y consistencia de tu servicio. Incluye análisis biomecánico, ejercicios específicos y rutinas de práctica.',
            shortDescription: 'Potencia y precisión en tu servicio de tenis',
            category: 'tennis',
            difficulty: 'intermediate',
            durationWeeks: 8,
            sessionsPerWeek: 3,
            price: 5999,
            currency: 'EUR',
            specialist: {
                id: 'specialist_2',
                name: 'Ana López',
                title: 'Entrenadora PTR Profesional',
                verified: true,
                rating: 4.7,
                totalSales: 186,
                specialty: ['Tenis', 'Técnica'],
            },
            rating: 4.6,
            reviewCount: 67,
            salesCount: 186,
            features: [
                '24 sesiones técnicas',
                'Análisis de video incluido',
                'Ejercicios de movilidad',
                'Plan de práctica semanal',
            ],
            targetAudience: ['Tenistas amateur', 'Nivel intermedio'],
            equipment: ['Raqueta', 'Pelotas', 'Pista de tenis'],
            previewAvailable: true,
            createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
            updatedAt: now,
            isFeatured: true,
            tags: ['tenis', 'servicio', 'técnica', 'potencia'],
            curriculum: [
                {
                    weekNumber: 1,
                    title: "Fundamentos Biomecánicos",
                    description: "Anállisis y corrección de la postura base del servicio.",
                    days: [
                        { day: "Lunes", title: "Lanzamiento de Bola (Toss)", focus: "Consistencia", duration: "40m" },
                        { day: "Miércoles", title: "Fase de Carga", focus: "Potencia de Piernas", duration: "45m" },
                        { day: "Viernes", title: "Punto de Contacto", focus: "Extensión", duration: "40m" }
                    ]
                }
            ]
        },
        {
            id: 'plan_3',
            title: 'Pérdida de Grasa Efectiva',
            description: 'Plan de 16 semanas combinando entrenamiento HIIT, fuerza y nutrición para una pérdida de grasa sostenible. Sin dietas extremas, basado en ciencia.',
            shortDescription: 'Pierde grasa de forma sostenible con ciencia',
            category: 'weight_loss',
            difficulty: 'beginner',
            durationWeeks: 16,
            sessionsPerWeek: 5,
            price: 6999,
            discountPrice: 4999,
            currency: 'EUR',
            specialist: {
                id: 'specialist_3',
                name: 'María García',
                title: 'Nutricionista y PT',
                verified: true,
                rating: 4.9,
                totalSales: 521,
                specialty: ['Nutrición', 'Pérdida de peso'],
            },
            rating: 4.9,
            reviewCount: 234,
            salesCount: 521,
            features: [
                'Plan de entrenamiento completo',
                'Guía nutricional',
                'Recetas saludables',
                'Tracking de progreso',
                'Comunidad de apoyo',
            ],
            targetAudience: ['Principiantes', 'Pérdida de peso'],
            equipment: ['Mancuernas', 'Opcional: gimnasio'],
            previewAvailable: true,
            createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
            updatedAt: now,
            isFeatured: true,
            tags: ['pérdida de peso', 'nutrición', 'HIIT', 'principiante'],
            curriculum: [
                {
                    weekNumber: 1,
                    title: "Kickstart Metabólico",
                    description: "Activación del metabolismo con rutinas HIIT cortas.",
                    days: [
                        { day: "Día 1", title: "Cuerpo Completo A", focus: "Fuerza Resistencia", duration: "35m" },
                        { day: "Día 2", title: "HIIT Tabata", focus: "Cardio", duration: "20m" },
                        { day: "Día 3", title: "Descanso Activo", focus: "Caminar", duration: "30m" },
                        { day: "Día 4", title: "Cuerpo Completo B", focus: "Fuerza", duration: "35m" },
                        { day: "Día 5", title: "HIIT Sprint", focus: "Potencia", duration: "25m" }
                    ]
                }
            ]
        },
        {
            id: 'plan_4',
            title: 'Recuperación Activa para Atletas',
            description: 'Programa de 4 semanas enfocado en optimizar tu recuperación. Incluye protocolos de movilidad, respiración, sueño y nutrición anti-inflamatoria.',
            shortDescription: 'Optimiza tu recuperación y previene lesiones',
            category: 'recovery',
            difficulty: 'beginner',
            durationWeeks: 4,
            sessionsPerWeek: 6,
            price: 2999,
            currency: 'EUR',
            specialist: {
                id: 'specialist_4',
                name: 'Pablo Fernández',
                title: 'Fisioterapeuta Deportivo',
                verified: true,
                rating: 4.8,
                totalSales: 89,
                specialty: ['Recuperación', 'Movilidad'],
            },
            rating: 4.7,
            reviewCount: 42,
            salesCount: 89,
            features: [
                'Rutinas de movilidad diarias',
                'Protocolos de respiración',
                'Guía de sueño',
                'Recetas anti-inflamatorias',
            ],
            targetAudience: ['Atletas', 'Cualquier nivel'],
            equipment: ['Foam roller', 'Bandas elásticas'],
            previewAvailable: true,
            createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
            updatedAt: now,
            isFeatured: false,
            tags: ['recuperación', 'movilidad', 'prevención', 'sueño'],
            curriculum: []
        },
    ];
};
