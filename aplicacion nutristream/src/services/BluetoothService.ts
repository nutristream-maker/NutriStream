
// ============================================================================
// NutriStream Device UUIDs Configuration
// Replace placeholders with actual proprietary UUIDs when hardware is available
// ============================================================================

export const DEVICE_CONFIG = {
    // Standard Heart Rate Service (for reference/fallback)
    HEART_RATE: {
        SERVICE_UUID: 'heart_rate',
        CHARACTERISTIC_UUID: 'heart_rate_measurement'
    },

    // Neural Skin POD - sEMG Muscle Monitoring Array
    // Primary device for muscle fatigue and activation monitoring
    NEURAL_SKIN: {
        NAME_PREFIX: 'NS-POD',
        SERVICE_UUID: 'e7a80001-0001-4000-8000-00805f9b34fb', // Proprietary
        CHARACTERISTICS: {
            EMG_DATA_STREAM: 'e7a80002-0001-4000-8000-00805f9b34fb',    // 1000Hz raw EMG
            FATIGUE_EVENTS: 'e7a80003-0001-4000-8000-00805f9b34fb',     // Processed fatigue events
            CALIBRATION: 'e7a80004-0001-4000-8000-00805f9b34fb',        // Calibration commands
            BATTERY: 'e7a80005-0001-4000-8000-00805f9b34fb'             // Battery level
        }
    },

    // AeroLung Mask - Respiratory Monitoring with E-VAV
    AERO_LUNG: {
        NAME_PREFIX: 'AERO-LUNG',
        SERVICE_UUID: 'e7a80001-0002-4000-8000-00805f9b34fb', // Proprietary
        CHARACTERISTICS: {
            RESPIRATORY_DATA: 'e7a80002-0002-4000-8000-00805f9b34fb',   // CO2, SpO2, RR
            VALVE_CONTROL: 'e7a80003-0002-4000-8000-00805f9b34fb',      // E-VAV aperture control
            VO2_ESTIMATE: 'e7a80004-0002-4000-8000-00805f9b34fb',       // VO2 calculations
            BATTERY: 'e7a80005-0002-4000-8000-00805f9b34fb'
        }
    },

    // GroundTruth Insoles - Pressure & Gait Analysis
    GROUND_TRUTH: {
        NAME_PREFIX: 'GT-INSOLE',
        SERVICE_UUID: 'e7a80001-0003-4000-8000-00805f9b34fb', // Proprietary
        CHARACTERISTICS: {
            PRESSURE_MAP: 'e7a80002-0003-4000-8000-00805f9b34fb',       // 6-zone pressure array
            GAIT_METRICS: 'e7a80003-0003-4000-8000-00805f9b34fb',       // GCT, cadence, heel strike
            SYMMETRY_INDEX: 'e7a80004-0003-4000-8000-00805f9b34fb',     // L/R balance
            BATTERY: 'e7a80005-0003-4000-8000-00805f9b34fb'
        }
    },

    // AeroVision Glasses - Environmental & Eye Tracking
    AERO_VISION: {
        NAME_PREFIX: 'AERO-VIS',
        SERVICE_UUID: 'e7a80001-0004-4000-8000-00805f9b34fb', // Proprietary
        CHARACTERISTICS: {
            ENVIRONMENTAL: 'e7a80002-0004-4000-8000-00805f9b34fb',      // Temp, humidity, UV
            EYE_TRACKING: 'e7a80003-0004-4000-8000-00805f9b34fb',       // Gaze zone, blink rate
            HUD_OVERLAY: 'e7a80004-0004-4000-8000-00805f9b34fb',        // HUD display commands
            BATTERY: 'e7a80005-0004-4000-8000-00805f9b34fb'
        }
    },

    // Racket Sensor - Sports Equipment Sensor
    RACKET_SENSOR: {
        NAME_PREFIX: 'NS-RACKET',
        SERVICE_UUID: 'e7a80001-0005-4000-8000-00805f9b34fb', // Proprietary
        CHARACTERISTICS: {
            MOTION_DATA: 'e7a80002-0005-4000-8000-00805f9b34fb',        // Accelerometer, gyro
            IMPACT_EVENTS: 'e7a80003-0005-4000-8000-00805f9b34fb',      // Ball impact detection
            SWING_ANALYSIS: 'e7a80004-0005-4000-8000-00805f9b34fb',     // Swing metrics
            BATTERY: 'e7a80005-0005-4000-8000-00805f9b34fb'
        }
    },

    // Generic Battery Service (BLE standard)
    BATTERY: {
        SERVICE_UUID: 'battery_service',
        CHARACTERISTIC_UUID: 'battery_level'
    },

    // Legacy aliases for backwards compatibility with existing components
    NS_POD: {
        SERVICE_UUID: 'e7a80001-0001-4000-8000-00805f9b34fb',
        CHARACTERISTICS: {
            DATA_STREAM: 'e7a80002-0001-4000-8000-00805f9b34fb'
        }
    }
};

// Device type enumeration for multi-device management
export type NutriStreamDeviceType =
    | 'NEURAL_SKIN'
    | 'AERO_LUNG'
    | 'GROUND_TRUTH'
    | 'AERO_VISION'
    | 'RACKET_SENSOR';

// Helper to get all device name prefixes for scanning
export const ALL_DEVICE_PREFIXES = [
    DEVICE_CONFIG.NEURAL_SKIN.NAME_PREFIX,
    DEVICE_CONFIG.AERO_LUNG.NAME_PREFIX,
    DEVICE_CONFIG.GROUND_TRUTH.NAME_PREFIX,
    DEVICE_CONFIG.AERO_VISION.NAME_PREFIX,
    DEVICE_CONFIG.RACKET_SENSOR.NAME_PREFIX,
];


export class BluetoothService {
    private device: BluetoothDevice | null = null;
    private server: BluetoothRemoteGATTServer | null = null;
    private characteristics: Map<string, BluetoothRemoteGATTCharacteristic> = new Map();

    constructor() { }

    /**
     * Request a device with specific filters
     */
    async requestDevice(filters: BluetoothRequestDeviceFilter[] = [], optionalServices: string[] = []): Promise<BluetoothDevice> {
        if (!navigator.bluetooth) {
            throw new Error('Web Bluetooth API is not available in this browser.');
        }

        try {
            // Include common services in optionalServices to ensure we can access them
            const services = [...optionalServices, 'battery_service', 'heart_rate'];
            // Remove duplicates
            const uniqueServices = [...new Set(services)];

            const options: RequestDeviceOptions = {
                optionalServices: uniqueServices,
                acceptAllDevices: filters.length === 0
            };

            if (filters.length > 0) {
                options.filters = filters;
                delete options.acceptAllDevices;
            }

            console.log('Requesting Bluetooth Device with options:', options);
            this.device = await navigator.bluetooth.requestDevice(options);

            this.device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));

            return this.device;
        } catch (error) {
            console.error('Error requesting device:', error);
            throw error;
        }
    }

    /**
     * Connect to the GATT server
     */
    async connect(): Promise<BluetoothRemoteGATTServer> {
        if (!this.device) {
            throw new Error('No device selected. Call requestDevice() first.');
        }

        if (this.device.gatt?.connected && this.server) {
            return this.server;
        }

        console.log('Connecting to GATT Server...');
        this.server = await this.device.gatt!.connect();
        console.log('Connected!');
        return this.server;
    }

    /**
     * Disconnect the device
     */
    disconnect() {
        if (this.device && this.device.gatt?.connected) {
            this.device.gatt.disconnect();
        }
        this.device = null;
        this.server = null;
        this.characteristics.clear();
        console.log('Device disconnected');
    }

    /**
     * Get a characteristic instance, caching it for future use
     */
    async getCharacteristic(serviceUuid: string, characteristicUuid: string): Promise<BluetoothRemoteGATTCharacteristic> {
        const key = `${serviceUuid}:${characteristicUuid}`;
        if (this.characteristics.has(key)) {
            return this.characteristics.get(key)!;
        }

        if (!this.server || !this.server.connected) {
            await this.connect();
        }

        try {
            console.log(`Getting Service ${serviceUuid}...`);
            const service = await this.server!.getPrimaryService(serviceUuid);

            console.log(`Getting Characteristic ${characteristicUuid}...`);
            const characteristic = await service.getCharacteristic(characteristicUuid);

            this.characteristics.set(key, characteristic);
            return characteristic;
        } catch (error) {
            console.error(`Failed to get characteristic ${characteristicUuid} from service ${serviceUuid}:`, error);
            throw error;
        }
    }

    /**
     * Start receiving notifications for a characteristic
     */
    async startNotifications(
        serviceUuid: string,
        characteristicUuid: string,
        callback: (event: Event) => void
    ): Promise<void> {
        const characteristic = await this.getCharacteristic(serviceUuid, characteristicUuid);

        await characteristic.startNotifications();
        console.log(`Notifications started for ${characteristicUuid}`);

        characteristic.addEventListener('characteristicvaluechanged', callback);
    }

    /**
     * Stop notifications
     */
    async stopNotifications(
        serviceUuid: string,
        characteristicUuid: string,
        callback: (event: Event) => void
    ): Promise<void> {
        try {
            const key = `${serviceUuid}:${characteristicUuid}`;
            if (this.characteristics.has(key)) {
                const characteristic = this.characteristics.get(key)!;
                await characteristic.stopNotifications();
                characteristic.removeEventListener('characteristicvaluechanged', callback);
                console.log(`Notifications stopped for ${characteristicUuid}`);
            }
        } catch (error) {
            console.warn('Error stopping notifications:', error);
        }
    }

    /**
     * Read a value once
     */
    async readValue(serviceUuid: string, characteristicUuid: string): Promise<DataView> {
        const characteristic = await this.getCharacteristic(serviceUuid, characteristicUuid);
        return await characteristic.readValue();
    }

    private onDisconnected(event: Event) {
        console.log('Device disconnected event received');
        const device = event.target as BluetoothDevice;
        console.log(`Device ${device.name} is disconnected.`);
        this.server = null;
        this.characteristics.clear();
    }

    isConnected(): boolean {
        return this.device?.gatt?.connected || false;
    }

    getDeviceName(): string | undefined {
        return this.device?.name;
    }
}

export const bluetoothService = new BluetoothService();
