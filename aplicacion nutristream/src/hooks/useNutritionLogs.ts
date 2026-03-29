import { useState, useEffect, useCallback, useMemo } from 'react';

// ============ Types ============
export interface NutritionEntry {
    id: string;
    timestamp: number; // ms since epoch
    date: string; // 'YYYY-MM-DD' for grouping
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    imageUrl?: string; // Base64 string of the analyzed image
}

export interface DailySummary {
    date: string;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    entries: NutritionEntry[];
}

const STORAGE_KEY = 'ns_nutrition_logs';

// ============ useNutritionLogs Hook ============
export const useNutritionLogs = () => {
    const [entries, setEntries] = useState<NutritionEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setEntries(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Error loading nutrition logs:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (!loading) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        }
    }, [entries, loading]);

    // Add a new entry
    const addEntry = useCallback((entry: Omit<NutritionEntry, 'id' | 'timestamp' | 'date'>) => {
        const now = new Date();
        const newEntry: NutritionEntry = {
            ...entry,
            id: `nut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: now.getTime(),
            date: now.toISOString().split('T')[0], // 'YYYY-MM-DD'
        };
        setEntries(prev => [newEntry, ...prev]);
        return newEntry.id;
    }, []);

    // Delete an entry
    const deleteEntry = useCallback((id: string) => {
        setEntries(prev => prev.filter(e => e.id !== id));
    }, []);

    // Get entries for a specific date
    const getEntriesForDate = useCallback((date: string): NutritionEntry[] => {
        return entries.filter(e => e.date === date);
    }, [entries]);

    // Calculate daily summary
    const getDailySummary = useCallback((date: string): DailySummary => {
        const dayEntries = getEntriesForDate(date);
        return {
            date,
            totalCalories: dayEntries.reduce((sum, e) => sum + e.calories, 0),
            totalProtein: dayEntries.reduce((sum, e) => sum + e.protein, 0),
            totalCarbs: dayEntries.reduce((sum, e) => sum + e.carbs, 0),
            totalFat: dayEntries.reduce((sum, e) => sum + e.fat, 0),
            entries: dayEntries,
        };
    }, [getEntriesForDate]);

    // Get today's summary (convenience)
    const todaySummary = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return getDailySummary(today);
    }, [getDailySummary, entries]);

    // Get weekly summary (last 7 days)
    const weeklySummary = useMemo(() => {
        const summaries: DailySummary[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            summaries.push(getDailySummary(dateStr));
        }
        return {
            days: summaries,
            totalCalories: summaries.reduce((sum, d) => sum + d.totalCalories, 0),
            avgCalories: Math.round(summaries.reduce((sum, d) => sum + d.totalCalories, 0) / 7),
            totalProtein: summaries.reduce((sum, d) => sum + d.totalProtein, 0),
            totalCarbs: summaries.reduce((sum, d) => sum + d.totalCarbs, 0),
            totalFat: summaries.reduce((sum, d) => sum + d.totalFat, 0),
        };
    }, [getDailySummary, entries]);

    // Get monthly summary (last 30 days)
    const monthlySummary = useMemo(() => {
        const summaries: DailySummary[] = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            summaries.push(getDailySummary(dateStr));
        }
        return {
            days: summaries,
            totalCalories: summaries.reduce((sum, d) => sum + d.totalCalories, 0),
            avgCalories: Math.round(summaries.reduce((sum, d) => sum + d.totalCalories, 0) / 30),
            totalProtein: summaries.reduce((sum, d) => sum + d.totalProtein, 0),
            totalCarbs: summaries.reduce((sum, d) => sum + d.totalCarbs, 0),
            totalFat: summaries.reduce((sum, d) => sum + d.totalFat, 0),
        };
    }, [getDailySummary, entries]);

    return {
        entries,
        loading,
        addEntry,
        deleteEntry,
        getEntriesForDate,
        getDailySummary,
        todaySummary,
        weeklySummary,
        monthlySummary,
    };
};
