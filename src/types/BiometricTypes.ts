/**
 * NutriStream Biometric Types
 * Interfaces for proprietary hardware sensor data
 */

// ============================================================================
// NEURAL SKIN POD - sEMG Fatigue Monitoring
// ============================================================================

/**
 * NeuralBattery: Muscle fatigue level derived from spectral EMG analysis
 * Value ranges from 0 (fully recovered) to 100 (fully fatigued)
 */
export interface NeuralBattery {
    /** Overall fatigue level 0-100 */
    level: number;
    /** Raw spectral fatigue from sEMG frequency analysis */
    spectralFatigue: number;
    /** Median frequency shift (Hz) - indicates muscle fatigue */
    medianFrequencyShift: number;
    /** RMS amplitude (mV) */
    rmsAmplitude: number;
    /** Timestamp of measurement */
    timestamp: number;
}

/**
 * Per-muscle fatigue data from Neural Skin electrode array
 */
export interface MuscleFatigueData {
    muscleName: string;
    fatiguePercent: number;
    activationLevel: number;
    isActive: boolean;
}

// ============================================================================
// GROUNDTRUTH INSOLES - Gait Analysis
// ============================================================================

/**
 * GaitAnalysis: Biomechanical metrics from pressure-sensing insoles
 */
export interface GaitAnalysis {
    /** Heel strike timing (ms from gait cycle start) */
    heelStrike: number;
    /** Ground Contact Time in milliseconds */
    gct: number;
    /** Foot pronation angle in degrees (negative = supination) */
    pronation: number;
    /** Running cadence in steps per minute */
    cadence: number;
    /** Left foot pressure distribution 0-100% */
    balanceLeft: number;
    /** Right foot pressure distribution 0-100% */
    balanceRight: number;
    /** Symmetry index: deviation from perfect 50/50 balance (0 = perfect) */
    symmetryIndex: number;
    /** Flight time in milliseconds (for running) */
    flightTime: number;
    /** Vertical oscillation in cm */
    verticalOscillation: number;
    /** Pressure heatmap data for each foot zone */
    pressureZones: {
        left: number[];  // 6 zones: heel, mid-heel, arch, mid-foot, ball, toes
        right: number[];
    };
}

// ============================================================================
// AEROLUNG MASK - Respiratory Monitoring
// ============================================================================

/**
 * RespiratoryStatus: Real-time respiratory and metabolic data from AeroLung mask
 */
export interface RespiratoryStatus {
    /** Exhaled CO2 concentration in ppm */
    co2Level: number;
    /** Blood oxygen saturation percentage */
    spo2: number;
    /** E-VAV (Electronic Variable Air Valve) aperture 0-100% */
    valveAperture: number;
    /** Breathing rate in breaths per minute */
    respirationRate: number;
    /** Current VO2 consumption in ml/kg/min */
    vo2Current: number;
    /** Ventilatory threshold detection */
    ventilationThreshold: 'BELOW' | 'AT' | 'ABOVE';
    /** Tidal volume estimate in liters */
    tidalVolume: number;
}

// ============================================================================
// AEROVISION GLASSES - Environmental & Biometric Overlay
// ============================================================================

/**
 * AeroVisionData: Environmental awareness and HUD data
 */
export interface AeroVisionData {
    /** Ambient temperature in Celsius */
    ambientTemperature: number;
    /** Relative humidity percentage */
    humidity: number;
    /** UV index */
    uvIndex: number;
    /** Altitude estimate in meters */
    altitude: number;
    /** Eye tracking: focus zone */
    gazeZone: 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';
    /** Blink rate per minute */
    blinkRate: number;
}

// ============================================================================
// PERFORMANCE ZONE ALGORITHM
// ============================================================================

/**
 * Performance zone classification based on multi-sensor fusion
 */
export type PerformanceZone = 'GREEN' | 'AMBER' | 'RED';

export interface PerformanceZoneResult {
    zone: PerformanceZone;
    factors: {
        fatigueContribution: number;
        symmetryContribution: number;
        vo2Contribution: number;
    };
    recommendation: string;
}

// ============================================================================
// MULTI-DEVICE AGGREGATED STATE
// ============================================================================

/**
 * Complete biometric snapshot from all connected devices
 */
export interface BiometricSnapshot {
    neuralBattery: NeuralBattery | null;
    gaitAnalysis: GaitAnalysis | null;
    respiratoryStatus: RespiratoryStatus | null;
    aeroVisionData: AeroVisionData | null;
    performanceZone: PerformanceZoneResult;
    timestamp: number;
}

/**
 * Smart Summary Event - throttled event for significant changes
 * Used to avoid saturating React with raw 1000Hz sensor data
 */
export interface SmartSummaryEvent {
    type: 'FATIGUE_SPIKE' | 'SYMMETRY_ALERT' | 'VO2_CHANGE' | 'ZONE_TRANSITION';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    value: number;
    delta: number;
    message: string;
    timestamp: number;
}

/**
 * Device connection state for multi-device management
 */
export interface DeviceConnectionMap {
    neuralSkin: 'DISCONNECTED' | 'SCANNING' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
    groundTruth: 'DISCONNECTED' | 'SCANNING' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
    aeroLung: 'DISCONNECTED' | 'SCANNING' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
    aeroVision: 'DISCONNECTED' | 'SCANNING' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
    racketSensor: 'DISCONNECTED' | 'SCANNING' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
}

// ============================================================================
// CHEF AI - Recovery Recipe Types
// ============================================================================

/**
 * Daily energy expenditure calculated from sensor data
 */
export interface DailyEnergyExpenditure {
    /** Total calories burned */
    totalCalories: number;
    /** Active calories (exercise) */
    activeCalories: number;
    /** Basal metabolic rate calories */
    bmrCalories: number;
    /** Estimated glycogen depletion percentage */
    glycogenDepletion: number;
    /** Primary fuel source during activity */
    primaryFuelSource: 'CARBS' | 'FAT' | 'MIXED';
    /** Training intensity zones breakdown */
    zoneBreakdown: {
        zone1: number; // minutes
        zone2: number;
        zone3: number;
        zone4: number;
        zone5: number;
    };
}

/**
 * Ingredient for recovery recipe
 */
export interface RecipeIngredient {
    name: string;
    quantity: number;
    unit: string;
    macros: {
        carbs: number;
        protein: number;
        fat: number;
        calories: number;
    };
}

/**
 * Recovery recipe generated by Chef AI
 */
export interface RecoveryRecipe {
    id: string;
    name: string;
    description: string;
    targetMacros: {
        carbohydrates: number;
        protein: number;
        fat: number;
        totalCalories: number;
    };
    ingredients: RecipeIngredient[];
    instructions: string[];
    glycogenRestoration: number; // Estimated % recovery
    recoveryFocus: 'GLYCOGEN' | 'MUSCLE_REPAIR' | 'HYDRATION' | 'BALANCED';
    preparationTime: number; // minutes
    imageUrl?: string;
}
