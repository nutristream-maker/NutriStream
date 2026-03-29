// Custom Hooks for Data Operations
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as db from '../services/database';
import { WorkoutLog, WeightLog, BiometricLog } from '../types/database';

// ============ useWorkouts ============
export const useWorkouts = (limitCount: number = 30) => {
    const { currentUser } = useAuth();
    const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkouts = useCallback(async () => {
        if (!currentUser) return;

        setLoading(true);
        setError(null);
        try {
            const data = await db.getWorkoutLogs(currentUser.uid, limitCount);
            setWorkouts(data);
        } catch (err) {
            setError('Error al cargar entrenamientos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentUser, limitCount]);

    useEffect(() => {
        fetchWorkouts();
    }, [fetchWorkouts]);

    const addWorkout = async (workout: Omit<WorkoutLog, 'id' | 'userId' | 'createdAt'>) => {
        if (!currentUser) throw new Error('No authenticated user');

        const id = await db.addWorkoutLog(currentUser.uid, workout);
        await fetchWorkouts(); // Refresh list
        return id;
    };

    const deleteWorkout = async (workoutId: string) => {
        await db.deleteWorkoutLog(workoutId);
        setWorkouts(prev => prev.filter(w => w.id !== workoutId));
    };

    return {
        workouts,
        loading,
        error,
        addWorkout,
        deleteWorkout,
        refresh: fetchWorkouts
    };
};

// ============ useWeightLogs ============
export const useWeightLogs = (limitCount: number = 30) => {
    const { currentUser } = useAuth();
    const [weights, setWeights] = useState<WeightLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [latestWeight, setLatestWeight] = useState<number | undefined>();

    const fetchWeights = useCallback(async () => {
        if (!currentUser) return;

        setLoading(true);
        setError(null);
        try {
            const data = await db.getWeightLogs(currentUser.uid, limitCount);
            setWeights(data);
            if (data.length > 0) {
                setLatestWeight(data[0].weight);
            }
        } catch (err) {
            setError('Error al cargar registros de peso');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentUser, limitCount]);

    useEffect(() => {
        fetchWeights();
    }, [fetchWeights]);

    const addWeight = async (weight: Omit<WeightLog, 'id' | 'userId' | 'createdAt'>) => {
        if (!currentUser) throw new Error('No authenticated user');

        const id = await db.addWeightLog(currentUser.uid, weight);
        await fetchWeights(); // Refresh list
        return id;
    };

    const deleteWeight = async (weightId: string) => {
        await db.deleteWeightLog(weightId);
        setWeights(prev => prev.filter(w => w.id !== weightId));
    };

    return {
        weights,
        latestWeight,
        loading,
        error,
        addWeight,
        deleteWeight,
        refresh: fetchWeights
    };
};

// ============ useBiometricLogs ============
export const useBiometricLogs = (limitCount: number = 30) => {
    const { currentUser } = useAuth();
    const [biometrics, setBiometrics] = useState<BiometricLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBiometrics = useCallback(async () => {
        if (!currentUser) return;

        setLoading(true);
        setError(null);
        try {
            const data = await db.getBiometricLogs(currentUser.uid, limitCount);
            setBiometrics(data);
        } catch (err) {
            setError('Error al cargar datos biométricos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentUser, limitCount]);

    useEffect(() => {
        fetchBiometrics();
    }, [fetchBiometrics]);

    const addBiometric = async (biometric: Omit<BiometricLog, 'id' | 'userId' | 'createdAt'>) => {
        if (!currentUser) throw new Error('No authenticated user');

        const id = await db.addBiometricLog(currentUser.uid, biometric);
        await fetchBiometrics(); // Refresh list
        return id;
    };

    const deleteBiometric = async (biometricId: string) => {
        await db.deleteBiometricLog(biometricId);
        setBiometrics(prev => prev.filter(b => b.id !== biometricId));
    };

    return {
        biometrics,
        loading,
        error,
        addBiometric,
        deleteBiometric,
        refresh: fetchBiometrics
    };
};

// ============ useStats ============
export const useStats = () => {
    const { currentUser } = useAuth();
    const [workoutStats, setWorkoutStats] = useState<{
        totalWorkouts: number;
        totalDuration: number;
        avgDuration: number;
        mostCommonType: string;
    } | null>(null);
    const [weightProgress, setWeightProgress] = useState<{
        current: number | null;
        change: number;
        trend: 'up' | 'down' | 'stable';
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!currentUser) return;

            setLoading(true);
            try {
                const [wStats, wProgress] = await Promise.all([
                    db.getWorkoutStats(currentUser.uid, 30),
                    db.getWeightProgress(currentUser.uid, 30)
                ]);
                setWorkoutStats(wStats);
                setWeightProgress(wProgress);
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [currentUser]);

    return {
        workoutStats,
        weightProgress,
        loading
    };
};
