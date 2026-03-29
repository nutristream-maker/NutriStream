// Database Types for Firebase/Firestore

// User Profile
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: Date;
    updatedAt?: Date;
    preferences: UserPreferences;
    metrics: UserMetrics;
    subscription?: SubscriptionInfo;
}

export interface UserPreferences {
    language: 'es' | 'en' | 'ca';
    darkMode: boolean;
    notifications: boolean;
    units: 'metric' | 'imperial';
    weeklyGoal?: number; // workouts per week
}

export interface UserMetrics {
    weight?: number;
    height?: number;
    goalWeight?: number;
    birthDate?: string;
    gender?: 'male' | 'female' | 'other';
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface SubscriptionInfo {
    plan: 'free' | 'pro' | 'elite';
    startDate: Date;
    expiresAt?: Date;
    status: 'active' | 'cancelled' | 'expired';
}

// Workout Logs
export interface WorkoutLog {
    id: string;
    odId: string;
    date: Date;
    duration: number; // minutes
    type: string;
    intensity: 'low' | 'medium' | 'high' | 'max';
    exercises: ExerciseEntry[];
    notes?: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface ExerciseEntry {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight: number;
    unit: 'kg' | 'lb';
    restTime?: number; // seconds
    notes?: string;
}

// Weight/Body Composition Logs
export interface WeightLog {
    id: string;
    userId: string;
    date: Date;
    weight: number;
    unit: 'kg' | 'lb';
    bodyFat?: number; // percentage
    muscleMass?: number; // kg or lb
    waterPercentage?: number;
    measurements?: BodyMeasurements;
    notes?: string;
    createdAt: Date;
}

export interface BodyMeasurements {
    waist?: number;
    chest?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
    neck?: number;
    shoulders?: number;
}

// Biometric/Health Logs
export interface BiometricLog {
    id: string;
    userId: string;
    date: Date;
    time: string;
    heartRate?: number;
    bloodPressure?: BloodPressure;
    sleepHours?: number;
    sleepQuality?: 1 | 2 | 3 | 4 | 5;
    energyLevel?: 1 | 2 | 3 | 4 | 5;
    mood?: 1 | 2 | 3 | 4 | 5;
    stressLevel?: 1 | 2 | 3 | 4 | 5;
    hydration?: number; // liters
    notes?: string;
    createdAt: Date;
}

export interface BloodPressure {
    systolic: number;
    diastolic: number;
}

// Meal/Nutrition Logs
export interface MealLog {
    id: string;
    userId: string;
    date: Date;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foods: FoodEntry[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    notes?: string;
    createdAt: Date;
}

export interface FoodEntry {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
}

// Recovery Data (muscle-specific)
export interface RecoveryData {
    id: string;
    odId: string;
    muscleName: string;
    recoveryPercentage: number;
    lastTrained: Date;
    history: TrainingHistoryEntry[];
    updatedAt: Date;
}

export interface TrainingHistoryEntry {
    date: Date;
    type: string;
    intensity: string;
    volume?: number;
}

// Goals
export interface Goal {
    id: string;
    userId: string;
    type: 'weight' | 'strength' | 'endurance' | 'habit' | 'custom';
    title: string;
    description?: string;
    targetValue?: number;
    currentValue?: number;
    unit?: string;
    deadline?: Date;
    status: 'active' | 'completed' | 'abandoned';
    createdAt: Date;
    completedAt?: Date;
}

// Firestore Collection Names
export const COLLECTIONS = {
    USERS: 'users',
    WORKOUTS: 'workouts',
    WEIGHT_LOGS: 'weightLogs',
    BIOMETRIC_LOGS: 'biometricLogs',
    MEAL_LOGS: 'mealLogs',
    RECOVERY_DATA: 'recoveryData',
    GOALS: 'goals'
} as const;
