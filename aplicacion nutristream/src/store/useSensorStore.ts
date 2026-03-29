import { create } from 'zustand';
import { initialUserData } from '../data/mockData';

export interface SensorState {
    heartRate: number;
    calories: number;
    steps: number;
    fatigue: number; // 0-100%
    recovery: number; // 0-100%

    // Extended Vitals
    respirationRate: number; 
    spo2: number; 
    bodyTemperature: number; 
    stressLevel: number; 
    hydration: number; 
    bloodPressureSystolic: number; 
    bloodPressureDiastolic: number; 
    hrvScore: number; 
    lastBiometricScan: number | null;

    activeMuscles: string[];
    muscleFatigue: { [muscle: string]: number };

    devices: {
        pod: boolean;
        racket: boolean;
        insoles: boolean;
        mask: boolean;
        glasses: boolean;
    };

    wellnessScore: number;

    updateBiometrics: (data: Partial<Omit<SensorState, 'updateBiometrics' | 'updateDeviceStatus' | 'updateMuscleData'>>) => void;
    updateDeviceStatus: (device: keyof SensorState['devices'], status: boolean) => void;
    updateMuscleData: (active: string[], fatigueMap: { [key: string]: number }) => void;
}

const defaultState = {
    heartRate: 72,
    calories: initialUserData.stats?.calories || 0,
    steps: initialUserData.stats?.steps || 0,
    fatigue: 0,
    recovery: 100,
    // Extended Vitals
    respirationRate: 16,
    spo2: 98,
    bodyTemperature: 36.5,
    stressLevel: 25,
    hydration: 70,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    hrvScore: 45,
    lastBiometricScan: null as number | null,
    activeMuscles: [] as string[],
    muscleFatigue: {} as { [muscle: string]: number },
    devices: {
        pod: false,
        racket: false,
        insoles: false,
        mask: false,
        glasses: false
    },
    wellnessScore: initialUserData.wellnessScore || 100,
};

// Helper for wellness score recalculation
const calculateWellness = (fatigue: number, recovery: number) => {
    return Math.round(Math.min(100, Math.max(0, 100 - (fatigue * 0.5) - ((100 - recovery) * 0.2))));
};

export const useSensorStore = create<SensorState>((set) => ({
    ...defaultState,

    updateBiometrics: (data) => set((state) => {
        const nextState = { ...state, ...data };
        if (data.fatigue !== undefined || data.recovery !== undefined) {
            nextState.wellnessScore = calculateWellness(nextState.fatigue, nextState.recovery);
        }
        return nextState;
    }),

    updateDeviceStatus: (device, status) => set((state) => {
        if (state.devices[device] === status) return state;
        return {
            ...state,
            devices: { ...state.devices, [device]: status }
        };
    }),

    updateMuscleData: (active, fatigueMap) => set((state) => {
        let maxFatigue = 0;
        Object.values(fatigueMap).forEach(v => {
            if (v > maxFatigue) maxFatigue = v;
        });

        const newGlobalFatigue = state.devices.pod ? maxFatigue : state.fatigue;

        return {
            ...state,
            activeMuscles: active,
            muscleFatigue: { ...state.muscleFatigue, ...fatigueMap },
            fatigue: newGlobalFatigue,
            wellnessScore: calculateWellness(newGlobalFatigue, state.recovery)
        };
    })
}));
