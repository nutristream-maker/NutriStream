import { useState, useEffect, useCallback } from 'react';
import { initialUserData } from '../data/mockData';

export interface BiometricLog {
    id: string;
    timestamp: number;
    date: string;       // YYYY-MM-DD
    time: string;       // HH:MM
    source: 'manual' | 'auto';
    metrics: {
        heartRate: number;
        spo2: number;
        respirationRate: number;
        bodyTemperature: number;
        stressLevel: number;
        hydration: number;
        bloodPressureSystolic: number;
        bloodPressureDiastolic: number;
        hrvScore: number;
    };
    note?: string;
}

const STORAGE_KEY = 'ns_biometric_logs';

export const useBiometricLogs = () => {
    const [logs, setLogs] = useState<BiometricLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setLogs(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Error loading biometric logs:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (!loading) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
        }
    }, [logs, loading]);

    const addLog = useCallback((reading: Omit<BiometricLog, 'id' | 'timestamp' | 'date' | 'time'>) => {
        const now = new Date();
        const newLog: BiometricLog = {
            ...reading,
            id: `bio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: now.getTime(),
            date: now.toISOString().split('T')[0],
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setLogs(prev => [newLog, ...prev]);
        return newLog.id;
    }, []);

    const deleteLog = useCallback((id: string) => {
        setLogs(prev => prev.filter(l => l.id !== id));
    }, []);

    const getLatestLog = useCallback(() => {
        return logs.length > 0 ? logs[0] : null;
    }, [logs]);

    return {
        logs,
        loading,
        addLog,
        deleteLog,
        getLatestLog
    };
};
