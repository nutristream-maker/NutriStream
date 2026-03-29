import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { initialUserData } from '../data/mockData';

// Define the shape of our global sensor state
interface SensorState {
    // Biometric Data - Core
    heartRate: number;
    calories: number;
    steps: number;
    fatigue: number; // 0-100%
    recovery: number; // 0-100%

    // Biometric Data - Extended Vitals
    respirationRate: number; // breaths per minute
    spo2: number; // Blood oxygen saturation %
    bodyTemperature: number; // Celsius
    stressLevel: number; // 0-100, HRV-based
    hydration: number; // 0-100%
    bloodPressureSystolic: number; // mmHg
    bloodPressureDiastolic: number; // mmHg
    hrvScore: number; // Heart Rate Variability ms

    // Active Muscle Tracking
    activeMuscles: string[];
    muscleFatigue: { [muscle: string]: number };

    // Device Connection States
    devices: {
        pod: boolean;
        racket: boolean;
        insoles: boolean;
        mask: boolean;
        glasses: boolean;
    };

    // Derived Wellness Score
    wellnessScore: number;

    // Timestamp of last biometric scan
    lastBiometricScan: number | null;

    // Actions to update state
    updateBiometrics: (data: Partial<SensorState>) => void;
    updateDeviceStatus: (device: keyof SensorState['devices'], status: boolean) => void;
    updateMuscleData: (active: string[], fatigueMap: { [key: string]: number }) => void;
}

const defaultState: SensorState = {
    heartRate: 72,
    calories: initialUserData.stats.calories,
    steps: initialUserData.stats.steps,
    fatigue: 0,
    recovery: 100,
    // Extended Vitals - Defaults
    respirationRate: 16,
    spo2: 98,
    bodyTemperature: 36.5,
    stressLevel: 25,
    hydration: 70,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    hrvScore: 45,
    lastBiometricScan: null,
    activeMuscles: [],
    muscleFatigue: {},
    devices: {
        pod: false,
        racket: false,
        insoles: false,
        mask: false,
        glasses: false
    },
    wellnessScore: initialUserData.wellnessScore,
    updateBiometrics: () => { },
    updateDeviceStatus: () => { },
    updateMuscleData: () => { },
};

const SensorContext = createContext<SensorState>(defaultState);

export const useSensorStore = () => useContext(SensorContext);

export const SensorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<Omit<SensorState, 'updateBiometrics' | 'updateDeviceStatus' | 'updateMuscleData'>>({
        heartRate: defaultState.heartRate,
        calories: defaultState.calories,
        steps: defaultState.steps,
        fatigue: defaultState.fatigue,
        recovery: defaultState.recovery,
        // Extended Vitals
        respirationRate: defaultState.respirationRate,
        spo2: defaultState.spo2,
        bodyTemperature: defaultState.bodyTemperature,
        stressLevel: defaultState.stressLevel,
        hydration: defaultState.hydration,
        bloodPressureSystolic: defaultState.bloodPressureSystolic,
        bloodPressureDiastolic: defaultState.bloodPressureDiastolic,
        hrvScore: defaultState.hrvScore,
        lastBiometricScan: defaultState.lastBiometricScan,
        activeMuscles: defaultState.activeMuscles,
        muscleFatigue: defaultState.muscleFatigue,
        devices: defaultState.devices,
        wellnessScore: defaultState.wellnessScore
    });

    // Auto-calculate Wellness Score based on Fatigue and Recovery
    useEffect(() => {
        setState(prev => {
            // Simple algorithm: Base 100 - (Fatigue * 0.4) + (Recovery * 0.1) - adjustment
            // If Fatigue is high (e.g., 80), Score drops significantly.
            // If Recovery is low, Score drops.
            const calculatedScore = Math.min(100, Math.max(0, 100 - (prev.fatigue * 0.5) - ((100 - prev.recovery) * 0.2)));
            return { ...prev, wellnessScore: Math.round(calculatedScore) };
        });
    }, [state.fatigue, state.recovery]);

    const updateBiometrics = useCallback((data: Partial<SensorState>) => {
        setState(prev => ({ ...prev, ...data }));
    }, []);

    const updateDeviceStatus = useCallback((device: keyof SensorState['devices'], status: boolean) => {
        setState(prev => {
            if (prev.devices[device] === status) return prev; // Avoid update if unchanged
            return {
                ...prev,
                devices: { ...prev.devices, [device]: status }
            };
        });
    }, []);

    const updateMuscleData = useCallback((active: string[], fatigueMap: { [key: string]: number }) => {
        setState(prev => {
            // Calculate max fatigue from current active muscles to update global fatigue
            let maxFatigue = 0;
            // Only consider fatigue from correct updated map
            Object.values(fatigueMap).forEach(v => {
                if (v > maxFatigue) maxFatigue = v;
            });

            // Smooth transition for global fatigue? For now, instant update.
            // Only update global fatigue if Pod is connected? Or just take the max found.
            // Using prev.devices.pod might be stale inside callback if not in dep array, but setState updater gets fresh prev.
            const newGlobalFatigue = prev.devices.pod ? maxFatigue : prev.fatigue;

            return {
                ...prev,
                activeMuscles: active,
                muscleFatigue: { ...prev.muscleFatigue, ...fatigueMap },
                fatigue: newGlobalFatigue
            };
        });
    }, []);

    const contextValue = useMemo(() => ({
        ...state,
        updateBiometrics,
        updateDeviceStatus,
        updateMuscleData
    }), [state, updateBiometrics, updateDeviceStatus, updateMuscleData]);

    return (
        <SensorContext.Provider value={contextValue}>
            {children}
        </SensorContext.Provider>
    );
};
