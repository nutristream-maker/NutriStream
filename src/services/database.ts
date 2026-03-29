// Database Service - Firestore CRUD Operations
import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    serverTimestamp,
    QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import {
    WorkoutLog,
    WeightLog,
    BiometricLog,
    MealLog,
    Goal,
    COLLECTIONS
} from '../types/database';

// Helper to convert Firestore Timestamps to Dates
const convertTimestamps = (data: any): any => {
    if (!data) return data;
    const result = { ...data };
    Object.keys(result).forEach(key => {
        if (result[key] instanceof Timestamp) {
            result[key] = result[key].toDate();
        } else if (typeof result[key] === 'object' && result[key] !== null) {
            result[key] = convertTimestamps(result[key]);
        }
    });
    return result;
};

// ============ WORKOUT LOGS ============

export const addWorkoutLog = async (userId: string, workout: Omit<WorkoutLog, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.WORKOUTS), {
        ...workout,
        userId,
        date: Timestamp.fromDate(new Date(workout.date)),
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

export const getWorkoutLogs = async (
    userId: string,
    limitCount: number = 50,
    startDate?: Date,
    endDate?: Date
): Promise<WorkoutLog[]> => {
    const constraints: QueryConstraint[] = [
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(limitCount)
    ];

    if (startDate) {
        constraints.push(where('date', '>=', Timestamp.fromDate(startDate)));
    }
    if (endDate) {
        constraints.push(where('date', '<=', Timestamp.fromDate(endDate)));
    }

    const q = query(collection(db, COLLECTIONS.WORKOUTS), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
    })) as WorkoutLog[];
};

export const updateWorkoutLog = async (workoutId: string, data: Partial<WorkoutLog>): Promise<void> => {
    const docRef = doc(db, COLLECTIONS.WORKOUTS, workoutId);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
};

export const deleteWorkoutLog = async (workoutId: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.WORKOUTS, workoutId));
};

// ============ WEIGHT LOGS ============

export const addWeightLog = async (userId: string, weight: Omit<WeightLog, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.WEIGHT_LOGS), {
        ...weight,
        userId,
        date: Timestamp.fromDate(new Date(weight.date)),
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

export const getWeightLogs = async (userId: string, limitCount: number = 30): Promise<WeightLog[]> => {
    const q = query(
        collection(db, COLLECTIONS.WEIGHT_LOGS),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(limitCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
    })) as WeightLog[];
};

export const getLatestWeight = async (userId: string): Promise<WeightLog | null> => {
    const logs = await getWeightLogs(userId, 1);
    return logs.length > 0 ? logs[0] : null;
};

export const deleteWeightLog = async (weightId: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.WEIGHT_LOGS, weightId));
};

// ============ BIOMETRIC LOGS ============

export const addBiometricLog = async (userId: string, biometric: Omit<BiometricLog, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.BIOMETRIC_LOGS), {
        ...biometric,
        userId,
        date: Timestamp.fromDate(new Date(biometric.date)),
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

export const getBiometricLogs = async (userId: string, limitCount: number = 30): Promise<BiometricLog[]> => {
    const q = query(
        collection(db, COLLECTIONS.BIOMETRIC_LOGS),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(limitCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
    })) as BiometricLog[];
};

export const getLatestBiometric = async (userId: string): Promise<BiometricLog | null> => {
    const logs = await getBiometricLogs(userId, 1);
    return logs.length > 0 ? logs[0] : null;
};

export const deleteBiometricLog = async (biometricId: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.BIOMETRIC_LOGS, biometricId));
};

// ============ MEAL LOGS ============

export const addMealLog = async (userId: string, meal: Omit<MealLog, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.MEAL_LOGS), {
        ...meal,
        userId,
        date: Timestamp.fromDate(new Date(meal.date)),
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

export const getMealLogs = async (
    userId: string,
    date?: Date,
    limitCount: number = 50
): Promise<MealLog[]> => {
    const constraints: QueryConstraint[] = [
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(limitCount)
    ];

    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        constraints.push(
            where('date', '>=', Timestamp.fromDate(startOfDay)),
            where('date', '<=', Timestamp.fromDate(endOfDay))
        );
    }

    const q = query(collection(db, COLLECTIONS.MEAL_LOGS), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
    })) as MealLog[];
};

export const deleteMealLog = async (mealId: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.MEAL_LOGS, mealId));
};

// ============ GOALS ============

export const addGoal = async (userId: string, goal: Omit<Goal, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.GOALS), {
        ...goal,
        userId,
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

export const getGoals = async (userId: string, status?: Goal['status']): Promise<Goal[]> => {
    const constraints: QueryConstraint[] = [
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    ];

    if (status) {
        constraints.push(where('status', '==', status));
    }

    const q = query(collection(db, COLLECTIONS.GOALS), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
    })) as Goal[];
};

export const updateGoal = async (goalId: string, data: Partial<Goal>): Promise<void> => {
    const docRef = doc(db, COLLECTIONS.GOALS, goalId);
    await updateDoc(docRef, data);
};

export const deleteGoal = async (goalId: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.GOALS, goalId));
};

// ============ STATISTICS ============

export const getWorkoutStats = async (userId: string, days: number = 30): Promise<{
    totalWorkouts: number;
    totalDuration: number;
    avgDuration: number;
    mostCommonType: string;
}> => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const workouts = await getWorkoutLogs(userId, 100, startDate);

    if (workouts.length === 0) {
        return { totalWorkouts: 0, totalDuration: 0, avgDuration: 0, mostCommonType: 'N/A' };
    }

    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
    const typeCount: Record<string, number> = {};
    workouts.forEach(w => {
        typeCount[w.type] = (typeCount[w.type] || 0) + 1;
    });
    const mostCommonType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
        totalWorkouts: workouts.length,
        totalDuration,
        avgDuration: Math.round(totalDuration / workouts.length),
        mostCommonType
    };
};

export const getWeightProgress = async (userId: string, days: number = 30): Promise<{
    current: number | null;
    change: number;
    trend: 'up' | 'down' | 'stable';
}> => {
    const logs = await getWeightLogs(userId, days);

    if (logs.length === 0) {
        return { current: null, change: 0, trend: 'stable' };
    }

    const current = logs[0].weight;
    const oldest = logs[logs.length - 1].weight;
    const change = current - oldest;
    const trend = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable';

    return { current, change, trend };
};
