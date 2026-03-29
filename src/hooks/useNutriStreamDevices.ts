/**
 * useNutriStreamDevices Hook
 * Manages multi-device Bluetooth connectivity for NutriStream hardware ecosystem
 * Implements Smart Summary Protocol for efficient data streaming
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { bluetoothService, DEVICE_CONFIG, type NutriStreamDeviceType } from '../services/BluetoothService';
import type {
    BiometricSnapshot,
    NeuralBattery,
    GaitAnalysis,
    RespiratoryStatus,
    AeroVisionData,
    SmartSummaryEvent,
    DeviceConnectionMap,
    PerformanceZoneResult
} from '../types/BiometricTypes';
import { getPerformanceZone } from '../services/PerformanceZoneService';

// ============================================================================
// CONSTANTS
// ============================================================================

const THROTTLE_INTERVAL_MS = 100; // Emit summaries every 100ms instead of raw 1000Hz
const FATIGUE_SPIKE_THRESHOLD = 5; // % change to trigger fatigue event
const SYMMETRY_ALERT_THRESHOLD = 10; // % imbalance to trigger alert
const VO2_CHANGE_THRESHOLD = 3; // % change to trigger VO2 event

// ============================================================================
// DATA PARSERS
// ============================================================================

/**
 * Parse raw Neural Skin POD data packet
 */
function parseNeuralSkinData(dataView: DataView): Partial<NeuralBattery> {
    try {
        // Protocol: [level:8, spectralFatigue:16, medianFreq:16, rms:16]
        const level = dataView.getUint8(0);
        const spectralFatigue = dataView.getUint16(1, true) / 100;
        const medianFrequencyShift = dataView.getInt16(3, true) / 10;
        const rmsAmplitude = dataView.getUint16(5, true) / 1000;

        return {
            level,
            spectralFatigue,
            medianFrequencyShift,
            rmsAmplitude,
            timestamp: Date.now()
        };
    } catch {
        return { level: 0, timestamp: Date.now() };
    }
}

/**
 * Parse GroundTruth insole gait data
 */
function parseGroundTruthData(dataView: DataView): Partial<GaitAnalysis> {
    try {
        // Protocol: [heelStrike:16, gct:16, pronation:8, cadence:8, balL:8, balR:8]
        const heelStrike = dataView.getUint16(0, true);
        const gct = dataView.getUint16(2, true);
        const pronation = dataView.getInt8(4);
        const cadence = dataView.getUint8(5);
        const balanceLeft = dataView.getUint8(6);
        const balanceRight = dataView.getUint8(7);
        const symmetryIndex = Math.abs(balanceLeft - balanceRight);

        return {
            heelStrike,
            gct,
            pronation,
            cadence,
            balanceLeft,
            balanceRight,
            symmetryIndex
        };
    } catch {
        return { symmetryIndex: 0 };
    }
}

/**
 * Parse AeroLung respiratory data
 */
function parseAeroLungData(dataView: DataView): Partial<RespiratoryStatus> {
    try {
        // Protocol: [co2:16, spo2:8, valve:8, rr:8, vo2:16]
        const co2Level = dataView.getUint16(0, true);
        const spo2 = dataView.getUint8(2);
        const valveAperture = dataView.getUint8(3);
        const respirationRate = dataView.getUint8(4);
        const vo2Current = dataView.getUint16(5, true) / 10;

        return {
            co2Level,
            spo2,
            valveAperture,
            respirationRate,
            vo2Current
        };
    } catch {
        return { spo2: 98, vo2Current: 0 };
    }
}

/**
 * Parse AeroVision environmental data
 */
function parseAeroVisionData(dataView: DataView): Partial<AeroVisionData> {
    try {
        // Protocol: [temp:16, humidity:8, uv:8, altitude:16, gaze:8, blink:8]
        const ambientTemperature = dataView.getInt16(0, true) / 10;
        const humidity = dataView.getUint8(2);
        const uvIndex = dataView.getUint8(3);
        const altitude = dataView.getUint16(4, true);
        const gazeRaw = dataView.getUint8(6);
        const blinkRate = dataView.getUint8(7);

        const gazeZones: AeroVisionData['gazeZone'][] = ['CENTER', 'LEFT', 'RIGHT', 'UP', 'DOWN'];
        const gazeZone = gazeZones[gazeRaw % 5];

        return {
            ambientTemperature,
            humidity,
            uvIndex,
            altitude,
            gazeZone,
            blinkRate
        };
    } catch {
        return { ambientTemperature: 20, humidity: 50 };
    }
}

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

interface UseNutriStreamDevicesReturn {
    // Connection states
    connections: DeviceConnectionMap;
    isAnyConnected: boolean;
    connectedCount: number;

    // Current biometric data
    snapshot: BiometricSnapshot | null;
    performanceZone: PerformanceZoneResult | null;

    // Smart Summary Events (throttled)
    events: SmartSummaryEvent[];
    clearEvents: () => void;

    // Actions
    scanAndConnect: (deviceType: NutriStreamDeviceType) => Promise<void>;
    scanAll: () => Promise<void>;
    disconnect: (deviceType: NutriStreamDeviceType) => void;
    disconnectAll: () => void;

    // Errors
    errors: Record<NutriStreamDeviceType, string | null>;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useNutriStreamDevices(): UseNutriStreamDevicesReturn {
    // Connection states for each device
    const [connections, setConnections] = useState<DeviceConnectionMap>({
        neuralSkin: 'DISCONNECTED',
        groundTruth: 'DISCONNECTED',
        aeroLung: 'DISCONNECTED',
        aeroVision: 'DISCONNECTED',
        racketSensor: 'DISCONNECTED'
    });

    // Current sensor data
    const [neuralData, setNeuralData] = useState<NeuralBattery | null>(null);
    const [gaitData, setGaitData] = useState<GaitAnalysis | null>(null);
    const [respiratoryData, setRespiratoryData] = useState<RespiratoryStatus | null>(null);
    const [visionData, setVisionData] = useState<AeroVisionData | null>(null);

    // Smart Summary events buffer
    const [events, setEvents] = useState<SmartSummaryEvent[]>([]);

    // Errors
    const [errors, setErrors] = useState<Record<NutriStreamDeviceType, string | null>>({
        NEURAL_SKIN: null,
        AERO_LUNG: null,
        GROUND_TRUTH: null,
        AERO_VISION: null,
        RACKET_SENSOR: null
    });

    // Refs for throttling
    const dataBufferRef = useRef<Map<NutriStreamDeviceType, unknown[]>>(new Map());
    const lastEmitRef = useRef<number>(0);
    const previousValuesRef = useRef<{
        fatigue: number;
        symmetry: number;
        vo2: number;
        zone: string;
    }>({ fatigue: 0, symmetry: 100, vo2: 50, zone: 'GREEN' });

    // ============================================================================
    // SMART SUMMARY PROTOCOL
    // ============================================================================

    /**
     * Process raw data and emit events only for significant changes
     * This prevents React from re-rendering on every 1000Hz sample
     */
    const processSmartSummary = useCallback(() => {
        const now = Date.now();
        if (now - lastEmitRef.current < THROTTLE_INTERVAL_MS) return;
        lastEmitRef.current = now;

        const newEvents: SmartSummaryEvent[] = [];
        const prev = previousValuesRef.current;

        // Check fatigue changes
        if (neuralData) {
            const fatigueDelta = Math.abs(neuralData.level - prev.fatigue);
            if (fatigueDelta >= FATIGUE_SPIKE_THRESHOLD) {
                newEvents.push({
                    type: 'FATIGUE_SPIKE',
                    severity: neuralData.level > 70 ? 'CRITICAL' : neuralData.level > 40 ? 'WARNING' : 'INFO',
                    value: neuralData.level,
                    delta: fatigueDelta,
                    message: `Fatigue ${fatigueDelta > 0 ? 'increased' : 'decreased'} to ${neuralData.level}%`,
                    timestamp: now
                });
                prev.fatigue = neuralData.level;
            }
        }

        // Check symmetry alerts
        if (gaitData) {
            const symmetry = 100 - gaitData.symmetryIndex;
            if (gaitData.symmetryIndex > SYMMETRY_ALERT_THRESHOLD && prev.symmetry >= 90) {
                newEvents.push({
                    type: 'SYMMETRY_ALERT',
                    severity: gaitData.symmetryIndex > 20 ? 'CRITICAL' : 'WARNING',
                    value: gaitData.symmetryIndex,
                    delta: gaitData.symmetryIndex - (100 - prev.symmetry),
                    message: `L/R imbalance: ${gaitData.balanceLeft}% / ${gaitData.balanceRight}%`,
                    timestamp: now
                });
            }
            prev.symmetry = symmetry;
        }

        // Check VO2 changes
        if (respiratoryData) {
            const vo2Delta = Math.abs(respiratoryData.vo2Current - prev.vo2);
            if (vo2Delta >= VO2_CHANGE_THRESHOLD) {
                newEvents.push({
                    type: 'VO2_CHANGE',
                    severity: respiratoryData.vo2Current > 90 ? 'WARNING' : 'INFO',
                    value: respiratoryData.vo2Current,
                    delta: vo2Delta,
                    message: `VO2 now at ${respiratoryData.vo2Current.toFixed(1)} ml/kg/min`,
                    timestamp: now
                });
                prev.vo2 = respiratoryData.vo2Current;
            }
        }

        // Check zone transitions
        const currentZone = getPerformanceZone(
            neuralData?.level ?? 0,
            gaitData ? 100 - gaitData.symmetryIndex : 100,
            respiratoryData?.vo2Current ?? 50
        );

        if (currentZone.zone !== prev.zone) {
            newEvents.push({
                type: 'ZONE_TRANSITION',
                severity: currentZone.zone === 'RED' ? 'CRITICAL' : currentZone.zone === 'AMBER' ? 'WARNING' : 'INFO',
                value: currentZone.zone === 'GREEN' ? 0 : currentZone.zone === 'AMBER' ? 1 : 2,
                delta: 0,
                message: `Performance zone: ${currentZone.zone}`,
                timestamp: now
            });
            prev.zone = currentZone.zone;
        }

        if (newEvents.length > 0) {
            setEvents(prev => [...prev.slice(-49), ...newEvents]); // Keep last 50 events
        }
    }, [neuralData, gaitData, respiratoryData]);

    // Run smart summary processing periodically
    useEffect(() => {
        const interval = setInterval(processSmartSummary, THROTTLE_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [processSmartSummary]);

    // ============================================================================
    // CONNECTION HANDLERS
    // ============================================================================

    const updateConnectionState = useCallback((
        deviceType: NutriStreamDeviceType,
        state: DeviceConnectionMap[keyof DeviceConnectionMap]
    ) => {
        const keyMap: Record<NutriStreamDeviceType, keyof DeviceConnectionMap> = {
            NEURAL_SKIN: 'neuralSkin',
            AERO_LUNG: 'aeroLung',
            GROUND_TRUTH: 'groundTruth',
            AERO_VISION: 'aeroVision',
            RACKET_SENSOR: 'racketSensor'
        };
        setConnections(prev => ({
            ...prev,
            [keyMap[deviceType]]: state
        }));
    }, []);

    const scanAndConnect = useCallback(async (deviceType: NutriStreamDeviceType) => {
        const config = DEVICE_CONFIG[deviceType];
        if (!config) return;

        updateConnectionState(deviceType, 'SCANNING');
        setErrors(prev => ({ ...prev, [deviceType]: null }));

        try {
            // Request device with name filter
            const filters = config.NAME_PREFIX ? [{ namePrefix: config.NAME_PREFIX }] : [];
            await bluetoothService.requestDevice(filters, [config.SERVICE_UUID]);

            updateConnectionState(deviceType, 'CONNECTING');
            await bluetoothService.connect();

            // Start notifications based on device type
            const characteristicUuid = getCharacteristicForDevice(deviceType);
            await bluetoothService.startNotifications(
                config.SERVICE_UUID,
                characteristicUuid,
                (event: Event) => {
                    const target = event.target as BluetoothRemoteGATTCharacteristic;
                    if (target.value) {
                        handleDataReceived(deviceType, target.value);
                    }
                }
            );

            updateConnectionState(deviceType, 'CONNECTED');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Connection failed';
            setErrors(prev => ({ ...prev, [deviceType]: message }));
            updateConnectionState(deviceType, 'ERROR');
        }
    }, [updateConnectionState]);

    const scanAll = useCallback(async () => {
        // Sequential scanning to avoid browser limitations
        const devices: NutriStreamDeviceType[] = [
            'NEURAL_SKIN',
            'GROUND_TRUTH',
            'AERO_LUNG',
            'AERO_VISION'
        ];

        for (const device of devices) {
            try {
                await scanAndConnect(device);
            } catch {
                // Continue with other devices
            }
        }
    }, [scanAndConnect]);

    const disconnect = useCallback((deviceType: NutriStreamDeviceType) => {
        bluetoothService.disconnect();
        updateConnectionState(deviceType, 'DISCONNECTED');
    }, [updateConnectionState]);

    const disconnectAll = useCallback(() => {
        bluetoothService.disconnect();
        setConnections({
            neuralSkin: 'DISCONNECTED',
            groundTruth: 'DISCONNECTED',
            aeroLung: 'DISCONNECTED',
            aeroVision: 'DISCONNECTED',
            racketSensor: 'DISCONNECTED'
        });
    }, []);

    const clearEvents = useCallback(() => {
        setEvents([]);
    }, []);

    // ============================================================================
    // DATA HANDLERS
    // ============================================================================

    const handleDataReceived = useCallback((deviceType: NutriStreamDeviceType, dataView: DataView) => {
        switch (deviceType) {
            case 'NEURAL_SKIN':
                const neuralParsed = parseNeuralSkinData(dataView);
                setNeuralData(prev => ({ ...prev, ...neuralParsed } as NeuralBattery));
                break;
            case 'GROUND_TRUTH':
                const gaitParsed = parseGroundTruthData(dataView);
                setGaitData(prev => ({ ...prev, ...gaitParsed } as GaitAnalysis));
                break;
            case 'AERO_LUNG':
                const respParsed = parseAeroLungData(dataView);
                setRespiratoryData(prev => ({ ...prev, ...respParsed } as RespiratoryStatus));
                break;
            case 'AERO_VISION':
                const visionParsed = parseAeroVisionData(dataView);
                setVisionData(prev => ({ ...prev, ...visionParsed } as AeroVisionData));
                break;
        }
    }, []);

    // ============================================================================
    // HELPERS
    // ============================================================================

    function getCharacteristicForDevice(deviceType: NutriStreamDeviceType): string {
        switch (deviceType) {
            case 'NEURAL_SKIN':
                return DEVICE_CONFIG.NEURAL_SKIN.CHARACTERISTICS.FATIGUE_EVENTS;
            case 'GROUND_TRUTH':
                return DEVICE_CONFIG.GROUND_TRUTH.CHARACTERISTICS.GAIT_METRICS;
            case 'AERO_LUNG':
                return DEVICE_CONFIG.AERO_LUNG.CHARACTERISTICS.RESPIRATORY_DATA;
            case 'AERO_VISION':
                return DEVICE_CONFIG.AERO_VISION.CHARACTERISTICS.ENVIRONMENTAL;
            case 'RACKET_SENSOR':
                return DEVICE_CONFIG.RACKET_SENSOR.CHARACTERISTICS.MOTION_DATA;
            default:
                throw new Error(`Unknown device type: ${deviceType}`);
        }
    }

    // ============================================================================
    // COMPUTED VALUES
    // ============================================================================

    const snapshot = useMemo((): BiometricSnapshot | null => {
        const performanceZone = getPerformanceZone(
            neuralData?.level ?? 0,
            gaitData ? 100 - gaitData.symmetryIndex : 100,
            respiratoryData?.vo2Current ?? 50
        );

        return {
            neuralBattery: neuralData,
            gaitAnalysis: gaitData,
            respiratoryStatus: respiratoryData,
            aeroVisionData: visionData,
            performanceZone,
            timestamp: Date.now()
        };
    }, [neuralData, gaitData, respiratoryData, visionData]);

    const performanceZone = useMemo(() => {
        return snapshot?.performanceZone ?? null;
    }, [snapshot]);

    const isAnyConnected = useMemo(() => {
        return Object.values(connections).some(state => state === 'CONNECTED');
    }, [connections]);

    const connectedCount = useMemo(() => {
        return Object.values(connections).filter(state => state === 'CONNECTED').length;
    }, [connections]);

    // ============================================================================
    // RETURN
    // ============================================================================

    return {
        connections,
        isAnyConnected,
        connectedCount,
        snapshot,
        performanceZone,
        events,
        clearEvents,
        scanAndConnect,
        scanAll,
        disconnect,
        disconnectAll,
        errors
    };
}
