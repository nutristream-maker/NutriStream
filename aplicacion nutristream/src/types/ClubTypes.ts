// ClubHub Types - NutriStream Group Management

export type AttendanceStatus = 'confirmed' | 'pending' | 'absent';

export interface TimeSlot {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // "HH:MM"
    endTime: string;
}

export interface Trainer {
    id: string;
    name: string;
    avatar?: string;
    specialties: string[];
    availability: TimeSlot[];
    rating: number;
}

export interface Member {
    id: string;
    name: string;
    avatar?: string;
    neuralBattery: number; // 0-100
    fatigueLevel?: number; // 0-100, from Neural Skin Pod
    podConnected: boolean;
    joinedAt: Date;
}

export interface Attendance {
    id: string;
    memberId: string;
    memberName: string;
    sessionId: string;
    status: AttendanceStatus;
    checkinTime?: Date;
    neuralBatteryAtCheckin?: number;
    fatigueDetected?: number;
}

export interface Session {
    id: string;
    clubId: string;
    trainerId: string;
    trainerName: string;
    title: string;
    description?: string;
    dateTime: Date;
    duration: number; // minutes
    capacity: number;
    attendees: Attendance[];
    sessionType: 'strength' | 'cardio' | 'recovery' | 'mixed';
}

export interface Announcement {
    id: string;
    clubId: string;
    authorId: string;
    authorName: string;
    authorRole: 'owner' | 'trainer' | 'staff';
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    createdAt: Date;
    isHUDAlert?: boolean; // For AeroVision integration
}

export interface ClubPerformanceIndex {
    value: number; // 0-100
    trend: 'up' | 'down' | 'stable';
    lastUpdated: Date;
    history: { date: Date; value: number }[];
}

export interface GroupFatigueData {
    muscleId: string;
    muscleName: string;
    averageFatigue: number;
    affectedMembers: number;
}

export interface Club {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    ownerId: string;
    ownerName: string;
    trainers: Trainer[];
    members: Member[];
    sessions: Session[];
    announcements: Announcement[];
    cpi: ClubPerformanceIndex;
    createdAt: Date;
}

// Session Card Display Data
export interface SessionCardData {
    session: Session;
    trainer: Trainer;
    slotsAvailable: number;
    userAttendance?: Attendance;
    isUserConfirmed: boolean;
}

// Real-time event types
export type ClubEventType =
    | 'attendance_update'
    | 'new_announcement'
    | 'session_update'
    | 'cpi_change'
    | 'hud_alert';

export interface ClubEvent {
    type: ClubEventType;
    clubId: string;
    payload: unknown;
    timestamp: Date;
}

// Club Service/Class offering
export type ServiceCategory = 'class' | 'amenity' | 'personal_training' | 'wellness';

export interface ClubServiceOffering {
    id: string;
    clubId: string;
    name: string;
    description: string;
    category: ServiceCategory;
    duration: number; // minutes
    intensity: 'low' | 'medium' | 'high' | 'extreme';
    targetMuscles: string[]; // e.g., ['Pectoral', 'Deltoides', 'Tríceps']
    equipment?: string[]; // e.g., ['Mancuernas', 'Barra']
    caloriesBurnedAvg: number;
    batteryDrainAvg: number; // Neural Battery % consumed
    maxCapacity: number;
    trainerRequired: boolean;
    weeklySchedule: { dayOfWeek: number; times: string[] }[];
    stats: {
        totalSessions: number;
        avgAttendance: number;
        avgRating: number;
        popularityRank: number;
    };
    imageUrl?: string;
}
