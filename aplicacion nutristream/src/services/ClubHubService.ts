// ClubHub Service - Business Logic & Mock Data
import {
    Club, Session, Trainer, Member, Attendance, Announcement,
    AttendanceStatus, ClubPerformanceIndex, GroupFatigueData, TimeSlot,
    ClubServiceOffering, ServiceCategory
} from '../types/ClubTypes';

// Summary type for search results
export interface ClubSummary {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    trainerCount: number;
    location: string;
    rating: number; // 0-5 stars
    cpiValue: number;
    logo?: string;
    userRole?: 'trainer' | 'member' | 'admin';
}

// ============== MOCK DATA ==============

const MOCK_TRAINERS: Trainer[] = [
    {
        id: 'tr-1',
        name: 'Carlos Mendez',
        avatar: undefined,
        specialties: ['Fuerza', 'Powerlifting'],
        availability: [
            { dayOfWeek: 1, startTime: '08:00', endTime: '14:00' },
            { dayOfWeek: 3, startTime: '08:00', endTime: '14:00' },
            { dayOfWeek: 5, startTime: '08:00', endTime: '14:00' },
        ],
        rating: 4.8
    },
    {
        id: 'tr-2',
        name: 'Laura Vidal',
        avatar: undefined,
        specialties: ['HIIT', 'Cardio', 'Funcional'],
        availability: [
            { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
            { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
            { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
        ],
        rating: 4.9
    },
    {
        id: 'tr-3',
        name: 'Miguel Ángel Torres',
        avatar: undefined,
        specialties: ['Recuperación', 'Movilidad', 'Yoga'],
        availability: [
            { dayOfWeek: 1, startTime: '16:00', endTime: '20:00' },
            { dayOfWeek: 3, startTime: '16:00', endTime: '20:00' },
            { dayOfWeek: 5, startTime: '16:00', endTime: '20:00' },
        ],
        rating: 4.7
    }
];

const MOCK_MEMBERS: Member[] = [
    { id: 'm-1', name: 'Ana García', neuralBattery: 85, fatigueLevel: 15, podConnected: true, joinedAt: new Date('2024-01-15') },
    { id: 'm-2', name: 'Pedro López', neuralBattery: 72, fatigueLevel: 28, podConnected: true, joinedAt: new Date('2024-02-10') },
    { id: 'm-3', name: 'María Ruiz', neuralBattery: 91, fatigueLevel: 9, podConnected: false, joinedAt: new Date('2024-03-01') },
    { id: 'm-4', name: 'Jorge Martín', neuralBattery: 65, fatigueLevel: 35, podConnected: true, joinedAt: new Date('2024-01-20') },
    { id: 'm-5', name: 'Lucía Fernández', neuralBattery: 78, fatigueLevel: 22, podConnected: true, joinedAt: new Date('2024-02-28') },
    { id: 'm-6', name: 'David Sánchez', neuralBattery: 88, fatigueLevel: 12, podConnected: false, joinedAt: new Date('2024-03-15') },
    { id: 'm-7', name: 'Elena Navarro', neuralBattery: 70, fatigueLevel: 30, podConnected: true, joinedAt: new Date('2024-01-05') },
    { id: 'm-8', name: 'Raúl Jiménez', neuralBattery: 82, fatigueLevel: 18, podConnected: true, joinedAt: new Date('2024-02-20') },
];

const generateSessions = (): Session[] => {
    const today = new Date();
    const sessions: Session[] = [];

    // Generate sessions for the next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const sessionDate = new Date(today);
        sessionDate.setDate(today.getDate() + dayOffset);

        // Morning session
        if (dayOffset % 2 === 0) {
            const morningSession = new Date(sessionDate);
            morningSession.setHours(9, 0, 0, 0);
            sessions.push({
                id: `ses-${dayOffset}-am`,
                clubId: 'club-1',
                trainerId: 'tr-1',
                trainerName: 'Carlos Mendez',
                title: 'Fuerza Explosiva',
                description: 'Sesión de entrenamiento de fuerza con énfasis en potencia',
                dateTime: morningSession,
                duration: 90,
                capacity: 12,
                attendees: generateAttendances(`ses-${dayOffset}-am`, dayOffset === 0 ? 8 : 4),
                sessionType: 'strength'
            });
        }

        // Afternoon session
        const afternoonSession = new Date(sessionDate);
        afternoonSession.setHours(17, 30, 0, 0);
        sessions.push({
            id: `ses-${dayOffset}-pm`,
            clubId: 'club-1',
            trainerId: dayOffset % 2 === 0 ? 'tr-2' : 'tr-3',
            trainerName: dayOffset % 2 === 0 ? 'Laura Vidal' : 'Miguel Ángel Torres',
            title: dayOffset % 2 === 0 ? 'HIIT Intensivo' : 'Recuperación Activa',
            description: dayOffset % 2 === 0
                ? 'Entrenamiento intervalado de alta intensidad'
                : 'Sesión de movilidad y recuperación muscular',
            dateTime: afternoonSession,
            duration: 60,
            capacity: 15,
            attendees: generateAttendances(`ses-${dayOffset}-pm`, dayOffset === 0 ? 10 : 6),
            sessionType: dayOffset % 2 === 0 ? 'cardio' : 'recovery'
        });
    }

    return sessions;
};

const generateAttendances = (sessionId: string, count: number): Attendance[] => {
    const statuses: AttendanceStatus[] = ['confirmed', 'pending', 'absent'];
    return MOCK_MEMBERS.slice(0, count).map((member, idx) => ({
        id: `att-${sessionId}-${member.id}`,
        memberId: member.id,
        memberName: member.name,
        sessionId,
        status: idx < count - 2 ? 'confirmed' : statuses[idx % 3],
        checkinTime: idx < count - 2 ? new Date() : undefined,
        neuralBatteryAtCheckin: member.podConnected ? member.neuralBattery : undefined,
        fatigueDetected: member.podConnected ? member.fatigueLevel : undefined
    }));
};

const MOCK_ANNOUNCEMENTS: Announcement[] = [
    {
        id: 'ann-1',
        clubId: 'club-1',
        authorId: 'owner-1',
        authorName: 'Admin Club',
        authorRole: 'owner',
        title: '🎉 Nuevo Entrenador',
        content: '¡Bienvenido Miguel Ángel al equipo! Especialista en recuperación y movilidad.',
        priority: 'medium',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isHUDAlert: false
    },
    {
        id: 'ann-2',
        clubId: 'club-1',
        authorId: 'tr-1',
        authorName: 'Carlos Mendez',
        authorRole: 'trainer',
        title: '⚠️ Cambio de Horario',
        content: 'La sesión del viernes se adelanta a las 08:30. Por favor, confirmen asistencia.',
        priority: 'high',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        isHUDAlert: true
    },
    {
        id: 'ann-3',
        clubId: 'club-1',
        authorId: 'tr-2',
        authorName: 'Laura Vidal',
        authorRole: 'trainer',
        title: '💪 Récord del Grupo',
        content: '¡El grupo ha alcanzado un CPI de 82 esta semana! Excelente rendimiento colectivo.',
        priority: 'low',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        isHUDAlert: false
    }
];

const MOCK_CPI: ClubPerformanceIndex = {
    value: 78.5,
    trend: 'up',
    lastUpdated: new Date(),
    history: [
        { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), value: 72 },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), value: 74 },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), value: 71 },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), value: 76 },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), value: 75 },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), value: 77 },
        { date: new Date(), value: 78.5 },
    ]
};

const MOCK_CLUB: Club = {
    id: 'club-1',
    name: 'Elite Performance Squad',
    description: 'Grupo de alto rendimiento enfocado en fuerza y acondicionamiento',
    ownerId: 'owner-1',
    ownerName: 'NutriStream Admin',
    trainers: MOCK_TRAINERS,
    members: MOCK_MEMBERS,
    sessions: generateSessions(),
    announcements: MOCK_ANNOUNCEMENTS,
    cpi: MOCK_CPI,
    createdAt: new Date('2024-01-01')
};

// Additional mock clubs for search
const MOCK_CLUBS_DIRECTORY: ClubSummary[] = [
    {
        id: 'club-1',
        name: 'Elite Performance Squad',
        description: 'Grupo de alto rendimiento enfocado en fuerza y acondicionamiento',
        memberCount: 8,
        trainerCount: 3,
        location: 'Barcelona, ES',
        rating: 4.8,
        cpiValue: 78.5
    },
    {
        id: 'club-2',
        name: 'CrossFit Barcelona Central',
        description: 'Box de CrossFit con enfoque en competición y comunidad',
        memberCount: 45,
        trainerCount: 5,
        location: 'Eixample, Barcelona',
        rating: 4.9,
        cpiValue: 82
    },
    {
        id: 'club-3',
        name: 'Yoga & Wellness Studio',
        description: 'Estudio especializado en yoga, pilates y bienestar',
        memberCount: 32,
        trainerCount: 4,
        location: 'Valencia, ES',
        rating: 4.7,
        cpiValue: 91
    },
    {
        id: 'club-4',
        name: 'PowerLifting Club Valencia',
        description: 'Club dedicado al powerlifting y fuerza máxima',
        memberCount: 18,
        trainerCount: 2,
        location: 'Valencia Norte',
        rating: 4.6,
        cpiValue: 75
    },
    {
        id: 'club-5',
        name: 'Running Team Madrid',
        description: 'Equipo de running para maratones y trail',
        memberCount: 60,
        trainerCount: 3,
        location: 'Madrid, ES',
        rating: 4.8,
        cpiValue: 88
    },
    {
        id: 'club-6',
        name: 'Functional Fitness Sevilla',
        description: 'Entrenamiento funcional para todas las edades',
        memberCount: 25,
        trainerCount: 3,
        location: 'Sevilla, ES',
        rating: 4.5,
        cpiValue: 79
    }
];

// Mock Club Services/Classes
const MOCK_SERVICES: ClubServiceOffering[] = [
    {
        id: 'srv-1',
        clubId: 'club-1',
        name: 'HIIT Explosivo',
        description: 'Entrenamiento intervalado de alta intensidad para maximizar la quema de calorías y mejorar la resistencia cardiovascular.',
        category: 'class',
        duration: 45,
        intensity: 'extreme',
        targetMuscles: ['Cuádriceps', 'Glúteos', 'Abdominales', 'Deltoides'],
        equipment: ['Pesas Rusas', 'Cuerdas de Batalla', 'Box de Salto'],
        caloriesBurnedAvg: 550,
        batteryDrainAvg: 35,
        maxCapacity: 15,
        trainerRequired: true,
        weeklySchedule: [
            { dayOfWeek: 1, times: ['07:00', '18:00'] },
            { dayOfWeek: 3, times: ['07:00', '18:00'] },
            { dayOfWeek: 5, times: ['07:00'] }
        ],
        stats: { totalSessions: 156, avgAttendance: 12, avgRating: 4.8, popularityRank: 1 }
    },
    {
        id: 'srv-2',
        clubId: 'club-1',
        name: 'Fuerza Funcional',
        description: 'Desarrollo de fuerza mediante movimientos compuestos. Ideal para mejorar la potencia y el rendimiento atlético.',
        category: 'class',
        duration: 60,
        intensity: 'high',
        targetMuscles: ['Pectoral', 'Dorsales', 'Cuádriceps', 'Isquiotibiales', 'Glúteos'],
        equipment: ['Barra Olímpica', 'Discos', 'Rack de Sentadillas'],
        caloriesBurnedAvg: 420,
        batteryDrainAvg: 28,
        maxCapacity: 12,
        trainerRequired: true,
        weeklySchedule: [
            { dayOfWeek: 2, times: ['09:00', '19:00'] },
            { dayOfWeek: 4, times: ['09:00', '19:00'] },
            { dayOfWeek: 6, times: ['10:00'] }
        ],
        stats: { totalSessions: 203, avgAttendance: 10, avgRating: 4.9, popularityRank: 2 }
    },
    {
        id: 'srv-3',
        clubId: 'club-1',
        name: 'Yoga Restaurativo',
        description: 'Sesión de yoga enfocada en la recuperación muscular, flexibilidad y reducción del estrés.',
        category: 'wellness',
        duration: 50,
        intensity: 'low',
        targetMuscles: ['Isquiotibiales', 'Dorsales', 'Glúteos', 'Lumbares'],
        equipment: ['Esterilla', 'Bloques', 'Cintas'],
        caloriesBurnedAvg: 180,
        batteryDrainAvg: 8,
        maxCapacity: 20,
        trainerRequired: true,
        weeklySchedule: [
            { dayOfWeek: 0, times: ['09:00'] },
            { dayOfWeek: 3, times: ['20:00'] },
            { dayOfWeek: 5, times: ['20:00'] }
        ],
        stats: { totalSessions: 98, avgAttendance: 14, avgRating: 4.7, popularityRank: 4 }
    },
    {
        id: 'srv-4',
        clubId: 'club-1',
        name: 'Spinning Pro',
        description: 'Clase de ciclismo indoor con música motivadora y entrenamiento por zonas de potencia.',
        category: 'class',
        duration: 45,
        intensity: 'high',
        targetMuscles: ['Cuádriceps', 'Isquiotibiales', 'Gemelos', 'Glúteos'],
        equipment: ['Bicicleta Spinning'],
        caloriesBurnedAvg: 480,
        batteryDrainAvg: 25,
        maxCapacity: 25,
        trainerRequired: true,
        weeklySchedule: [
            { dayOfWeek: 1, times: ['06:30', '19:30'] },
            { dayOfWeek: 2, times: ['19:30'] },
            { dayOfWeek: 4, times: ['06:30', '19:30'] }
        ],
        stats: { totalSessions: 312, avgAttendance: 22, avgRating: 4.6, popularityRank: 3 }
    },
    {
        id: 'srv-5',
        clubId: 'club-1',
        name: 'Entrenamiento Personal',
        description: 'Sesión 1-a-1 con entrenador certificado. Plan personalizado según tus objetivos.',
        category: 'personal_training',
        duration: 60,
        intensity: 'medium',
        targetMuscles: ['Todo el cuerpo'],
        equipment: ['Variado'],
        caloriesBurnedAvg: 350,
        batteryDrainAvg: 20,
        maxCapacity: 1,
        trainerRequired: true,
        weeklySchedule: [],
        stats: { totalSessions: 450, avgAttendance: 1, avgRating: 4.95, popularityRank: 5 }
    },
    {
        id: 'srv-6',
        clubId: 'club-1',
        name: 'Zona de Pesas Libre',
        description: 'Acceso a la zona de pesas libres con mancuernas, barras y máquinas de cable.',
        category: 'amenity',
        duration: 0,
        intensity: 'medium',
        targetMuscles: ['Todo el cuerpo'],
        equipment: ['Mancuernas', 'Barras', 'Cables', 'Bancos'],
        caloriesBurnedAvg: 0,
        batteryDrainAvg: 0,
        maxCapacity: 30,
        trainerRequired: false,
        weeklySchedule: [],
        stats: { totalSessions: 0, avgAttendance: 0, avgRating: 4.5, popularityRank: 6 }
    },
    {
        id: 'srv-7',
        clubId: 'club-1',
        name: 'Core & Abdominales',
        description: 'Clase enfocada en fortalecer el core, mejorar la estabilidad y definir los abdominales.',
        category: 'class',
        duration: 30,
        intensity: 'medium',
        targetMuscles: ['Abdominales', 'Oblicuos', 'Lumbares', 'Serrato'],
        equipment: ['Esterilla', 'Fitball', 'Ab Wheel'],
        caloriesBurnedAvg: 220,
        batteryDrainAvg: 15,
        maxCapacity: 18,
        trainerRequired: true,
        weeklySchedule: [
            { dayOfWeek: 1, times: ['13:00'] },
            { dayOfWeek: 3, times: ['13:00'] },
            { dayOfWeek: 5, times: ['13:00'] }
        ],
        stats: { totalSessions: 89, avgAttendance: 15, avgRating: 4.4, popularityRank: 7 }
    },
    {
        id: 'srv-8',
        clubId: 'club-1',
        name: 'Box & Kickboxing',
        description: 'Entrenamiento de alta intensidad combinando técnicas de boxeo y kickboxing.',
        category: 'class',
        duration: 50,
        intensity: 'extreme',
        targetMuscles: ['Deltoides', 'Bíceps', 'Tríceps', 'Abdominales', 'Glúteos'],
        equipment: ['Saco de Boxeo', 'Guantes', 'Protecciones'],
        caloriesBurnedAvg: 620,
        batteryDrainAvg: 40,
        maxCapacity: 16,
        trainerRequired: true,
        weeklySchedule: [
            { dayOfWeek: 2, times: ['18:00'] },
            { dayOfWeek: 4, times: ['18:00'] },
            { dayOfWeek: 6, times: ['11:00'] }
        ],
        stats: { totalSessions: 67, avgAttendance: 13, avgRating: 4.85, popularityRank: 8 }
    },
    {
        id: 'srv-9',
        clubId: 'club-1',
        name: 'Pilates Reformer',
        description: 'Mejora tu postura, flexibilidad y core utilizando máquinas Reformer de última generación.',
        category: 'wellness',
        duration: 55,
        intensity: 'medium',
        targetMuscles: ['Core', 'Glúteos', 'Espalda', 'Aductores'],
        equipment: ['Reformer', 'Aro Mágico'],
        caloriesBurnedAvg: 280,
        batteryDrainAvg: 18,
        maxCapacity: 8,
        trainerRequired: true,
        weeklySchedule: [
            { dayOfWeek: 1, times: ['10:00', '19:00'] },
            { dayOfWeek: 3, times: ['10:00', '19:00'] }
        ],
        stats: { totalSessions: 145, avgAttendance: 8, avgRating: 4.9, popularityRank: 5 }
    },
    {
        id: 'srv-10',
        clubId: 'club-1',
        name: 'CrossFit WOD',
        description: 'Workout of the Day. Entrenamiento funcional constantemente variado ejecutado a alta intensidad.',
        category: 'class',
        duration: 60,
        intensity: 'extreme',
        targetMuscles: ['Todo el cuerpo'],
        equipment: ['Barra', 'Kettlebells', 'Cajón', 'Comba'],
        caloriesBurnedAvg: 650,
        batteryDrainAvg: 45,
        maxCapacity: 20,
        trainerRequired: true,
        weeklySchedule: [
            { dayOfWeek: 1, times: ['08:00', '14:00', '20:00'] },
            { dayOfWeek: 2, times: ['08:00', '14:00', '20:00'] },
            { dayOfWeek: 3, times: ['08:00', '14:00', '20:00'] },
            { dayOfWeek: 4, times: ['08:00', '14:00', '20:00'] },
            { dayOfWeek: 5, times: ['08:00', '14:00', '20:00'] }
        ],
        stats: { totalSessions: 520, avgAttendance: 18, avgRating: 4.8, popularityRank: 1 }
    },
    {
        id: 'srv-11',
        clubId: 'club-1',
        name: 'Piscina Olímpica',
        description: 'Acceso libre a la piscina de 50m para entrenamiento de natación y recuperación.',
        category: 'amenity',
        duration: 0,
        intensity: 'medium',
        targetMuscles: ['Dorsales', 'Hombros', 'Piernas', 'Core'],
        equipment: ['Piscina', 'Tabla', 'Pull Buoy'],
        caloriesBurnedAvg: 400,
        batteryDrainAvg: 20,
        maxCapacity: 40,
        trainerRequired: false,
        weeklySchedule: [],
        stats: { totalSessions: 0, avgAttendance: 0, avgRating: 4.7, popularityRank: 9 }
    },
    {
        id: 'srv-12',
        clubId: 'club-1',
        name: 'Spa & Sauna Recovery',
        description: 'Zona de hidroterapia y sauna para acelerar la recuperación muscular y relajación.',
        category: 'wellness',
        duration: 30,
        intensity: 'low',
        targetMuscles: ['Recuperación General'],
        equipment: ['Sauna', 'Baño Turco', 'Jacuzzi'],
        caloriesBurnedAvg: 50,
        batteryDrainAvg: -15, // Restores battery
        maxCapacity: 15,
        trainerRequired: false,
        weeklySchedule: [],
        stats: { totalSessions: 0, avgAttendance: 0, avgRating: 4.9, popularityRank: 4 }
    },
    {
        id: 'srv-13',
        clubId: 'club-1',
        name: 'Zumba Party',
        description: 'Clase de baile fitness inspirada en música latina. ¡Quema calorías divirtiéndote!',
        category: 'class',
        duration: 50,
        intensity: 'medium',
        targetMuscles: ['Piernas', 'Glúteos', 'Core', 'Cardio'],
        equipment: [],
        caloriesBurnedAvg: 450,
        batteryDrainAvg: 20,
        maxCapacity: 30,
        trainerRequired: true,
        weeklySchedule: [
            { dayOfWeek: 2, times: ['18:30'] },
            { dayOfWeek: 4, times: ['18:30'] }
        ],
        stats: { totalSessions: 110, avgAttendance: 28, avgRating: 4.6, popularityRank: 6 }
    },
    {
        id: 'srv-14',
        clubId: 'club-1',
        name: 'Taller de Nutrición',
        description: 'Charlas educativas sobre nutrición deportiva y suplementación con expertos.',
        category: 'amenity',
        duration: 90,
        intensity: 'low',
        targetMuscles: ['Cerebro'],
        equipment: ['Proyector', 'Material Didáctico'],
        caloriesBurnedAvg: 0,
        batteryDrainAvg: 5,
        maxCapacity: 50,
        trainerRequired: true,
        weeklySchedule: [
            { dayOfWeek: 6, times: ['11:00'] } // Saturdays
        ],
        stats: { totalSessions: 12, avgAttendance: 45, avgRating: 4.8, popularityRank: 10 }
    }
];

// ============== SERVICE FUNCTIONS ==============

export const ClubHubService = {
    // Search clubs by name or description
    searchClubs: async (query: string): Promise<ClubSummary[]> => {
        await simulateDelay(200);
        if (!query || query.trim().length === 0) {
            return MOCK_CLUBS_DIRECTORY;
        }
        const lowerQuery = query.toLowerCase().trim();
        return MOCK_CLUBS_DIRECTORY.filter(club =>
            club.name.toLowerCase().includes(lowerQuery) ||
            club.description.toLowerCase().includes(lowerQuery)
        );
    },

    // Get all clubs (for browsing)
    getAllClubs: async (): Promise<ClubSummary[]> => {
        await simulateDelay(150);
        return MOCK_CLUBS_DIRECTORY;
    },

    // Get user's enrolled clubs (Mock)
    getMyClubs: async (): Promise<ClubSummary[]> => {
        await simulateDelay(100);
        // Simulate user is enrolled in "Elite Performance Squad" as TRAINER
        // and "Running Team Madrid" as MEMBER
        const eliteClub = MOCK_CLUBS_DIRECTORY.find(c => c.id === 'club-1');
        const runningClub = MOCK_CLUBS_DIRECTORY.find(c => c.id === 'club-5');

        const myClubs: ClubSummary[] = [];

        if (eliteClub) {
            myClubs.push({ ...eliteClub, userRole: 'trainer' });
        }
        if (runningClub) {
            myClubs.push({ ...runningClub, userRole: 'member' });
        }

        return myClubs;
    },

    // Get club services/classes
    getClubServices: async (clubId: string, category?: ServiceCategory): Promise<ClubServiceOffering[]> => {
        await simulateDelay(200);
        let services = MOCK_SERVICES.filter(s => s.clubId === clubId);
        if (category) {
            services = services.filter(s => s.category === category);
        }
        return services.sort((a, b) => a.stats.popularityRank - b.stats.popularityRank);
    },

    // Get single service by ID
    getServiceById: async (serviceId: string): Promise<ClubServiceOffering | null> => {
        await simulateDelay(100);
        return MOCK_SERVICES.find(s => s.id === serviceId) || null;
    },

    // Get club by ID
    getClub: async (clubId: string): Promise<Club> => {
        await simulateDelay(300);
        if (clubId === 'club-1') return { ...MOCK_CLUB, sessions: generateSessions() };
        // For other clubs, return a variant of MOCK_CLUB with different name
        const summary = MOCK_CLUBS_DIRECTORY.find(c => c.id === clubId);
        if (summary) {
            return {
                ...MOCK_CLUB,
                id: summary.id,
                name: summary.name,
                description: summary.description,
                sessions: generateSessions(),
                cpi: { ...MOCK_CPI, value: summary.cpiValue }
            };
        }
        throw new Error('Club not found');
    },

    // Get sessions for a date range
    getSessions: async (clubId: string, startDate: Date, endDate: Date): Promise<Session[]> => {
        await simulateDelay(200);
        return MOCK_CLUB.sessions.filter(s =>
            s.dateTime >= startDate && s.dateTime <= endDate
        );
    },

    // Confirm attendance
    confirmAttendance: async (sessionId: string, memberId: string): Promise<Attendance> => {
        await simulateDelay(150);
        const member = MOCK_MEMBERS.find(m => m.id === memberId);
        return {
            id: `att-${sessionId}-${memberId}`,
            memberId,
            memberName: member?.name || 'Usuario',
            sessionId,
            status: 'confirmed',
            checkinTime: new Date(),
            neuralBatteryAtCheckin: member?.neuralBattery,
            fatigueDetected: member?.fatigueLevel
        };
    },

    // Cancel attendance
    cancelAttendance: async (sessionId: string, memberId: string): Promise<void> => {
        await simulateDelay(150);
        // In real app, would update database
    },

    // Calculate CPI
    calculateCPI: (members: Member[], attendanceRate: Map<string, number>): number => {
        if (members.length === 0) return 0;

        const sum = members.reduce((acc, member) => {
            const rate = attendanceRate.get(member.id) || 0.5;
            return acc + (member.neuralBattery * rate);
        }, 0);

        return Math.round((sum / members.length) * 10) / 10;
    },

    // Get group fatigue data for heatmap
    getGroupFatigueData: async (clubId: string): Promise<GroupFatigueData[]> => {
        await simulateDelay(250);

        // Simulate aggregated fatigue data per muscle group
        const muscleGroups = [
            { muscleId: 'quads', muscleName: 'Cuádriceps' },
            { muscleId: 'hamstrings', muscleName: 'Isquiotibiales' },
            { muscleId: 'glutes', muscleName: 'Glúteos' },
            { muscleId: 'calves', muscleName: 'Gemelos' },
            { muscleId: 'chest', muscleName: 'Pecho' },
            { muscleId: 'back', muscleName: 'Espalda' },
            { muscleId: 'shoulders', muscleName: 'Hombros' },
            { muscleId: 'biceps', muscleName: 'Bíceps' },
            { muscleId: 'triceps', muscleName: 'Tríceps' },
            { muscleId: 'core', muscleName: 'Core' },
        ];

        return muscleGroups.map(mg => ({
            ...mg,
            averageFatigue: Math.floor(Math.random() * 40) + 10, // 10-50%
            affectedMembers: Math.floor(Math.random() * 5) + 1
        }));
    },

    // Send AeroVision HUD alert
    // Send AeroVision HUD alert
    sendHUDAlert: async (clubId: string, message: string, targetType: 'group' | 'individual' = 'group', targetMemberId?: string): Promise<void> => {
        await simulateDelay(100);
        const targetInfo = targetType === 'group' ? 'ALL' : `MEMBER ${targetMemberId}`;
        console.log(`[AeroVision HUD] Broadcasting to club ${clubId} [Target: ${targetInfo}]: ${message}`);
        // In real app, would integrate with AeroVision service
    },

    // Get trainer by ID
    getTrainer: (trainerId: string): Trainer | undefined => {
        return MOCK_TRAINERS.find(t => t.id === trainerId);
    },

    // Check trainer availability
    isTrainerAvailable: (trainer: Trainer, dateTime: Date): boolean => {
        const dayOfWeek = dateTime.getDay();
        const timeStr = `${dateTime.getHours().toString().padStart(2, '0')}:${dateTime.getMinutes().toString().padStart(2, '0')}`;

        return trainer.availability.some(slot =>
            slot.dayOfWeek === dayOfWeek &&
            timeStr >= slot.startTime &&
            timeStr <= slot.endTime
        );
    },

    // Get attendance stats for a session
    getAttendanceStats: (session: Session): { confirmed: number; pending: number; absent: number } => {
        return {
            confirmed: session.attendees.filter(a => a.status === 'confirmed').length,
            pending: session.attendees.filter(a => a.status === 'pending').length,
            absent: session.attendees.filter(a => a.status === 'absent').length
        };
    },

    // Check if CPI is critical (below threshold)
    isCPICritical: (cpi: number): boolean => cpi < 60,

    // Get CPI alert message
    getCPIAlertMessage: (clubName: string, cpi: number): string => {
        if (cpi < 50) {
            return `⚠️ ALERTA CRÍTICA: ${clubName} tiene un CPI de ${cpi}. Se recomienda sesión de descarga urgente.`;
        } else if (cpi < 60) {
            return `⚠️ Fatiga acumulada alta en ${clubName} (CPI: ${cpi}). Se recomienda reducir intensidad.`;
        }
        return '';
    }
};

// Helper function to simulate async delay
const simulateDelay = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

export default ClubHubService;
