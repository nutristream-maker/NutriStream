// Smart Equipment Service - IoT Hardware Inventory Management
import {
    Equipment,
    EquipmentType,
    EquipmentStatus,
    EquipmentReservation,
    EquipmentAlert,
    EQUIPMENT_CONFIG,
    EquipmentSize
} from '../types/EquipmentTypes';

// Generate mock equipment inventory
const generateEquipment = (): Equipment[] => {
    const equipment: Equipment[] = [];
    const sizes: EquipmentSize[] = ['XS', 'S', 'M', 'L', 'XL'];

    // Racket Sensors (8 units)
    for (let i = 1; i <= 8; i++) {
        equipment.push({
            id: `racket-${i}`,
            type: 'racket_sensor',
            name: `Racket Sensor #${i.toString().padStart(2, '0')}`,
            batteryLevel: 20 + Math.floor(Math.random() * 80),
            status: i <= 6 ? 'available' : i === 7 ? 'charging' : 'maintenance',
            lastCalibration: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
            nextCalibrationDue: new Date(Date.now() + Math.random() * 10 * 24 * 60 * 60 * 1000),
            firmwareVersion: '2.4.1',
            usageHours: Math.floor(Math.random() * 400),
            maxUsageHours: 500
        });
    }

    // AeroLung Masks (sizes)
    sizes.forEach((size, idx) => {
        for (let i = 1; i <= 2; i++) {
            equipment.push({
                id: `aerolung-${size.toLowerCase()}-${i}`,
                type: 'aerolung_mask',
                name: `AeroLung Mask ${size}-${i.toString().padStart(2, '0')}`,
                size,
                batteryLevel: 30 + Math.floor(Math.random() * 70),
                status: Math.random() > 0.2 ? 'available' : 'reserved',
                lastCalibration: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
                nextCalibrationDue: new Date(Date.now() + Math.random() * 4 * 24 * 60 * 60 * 1000),
                firmwareVersion: '1.8.3',
                usageHours: Math.floor(Math.random() * 250),
                maxUsageHours: 300
            });
        }
    });

    // GroundTruth Insoles (sizes)
    ['S', 'M', 'L', 'XL'].forEach(size => {
        for (let i = 1; i <= 3; i++) {
            equipment.push({
                id: `groundtruth-${size.toLowerCase()}-${i}`,
                type: 'groundtruth',
                name: `GroundTruth ${size}-${i.toString().padStart(2, '0')}`,
                size: size as EquipmentSize,
                batteryLevel: 40 + Math.floor(Math.random() * 60),
                status: Math.random() > 0.15 ? 'available' : 'in_use',
                lastCalibration: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                nextCalibrationDue: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
                firmwareVersion: '3.1.0',
                usageHours: Math.floor(Math.random() * 350),
                maxUsageHours: 400
            });
        }
    });

    // Neural Pods (10 units)
    for (let i = 1; i <= 10; i++) {
        equipment.push({
            id: `neural-${i}`,
            type: 'neural_pod',
            name: `Neural Pod #${i.toString().padStart(2, '0')}`,
            batteryLevel: 15 + Math.floor(Math.random() * 85),
            status: i <= 8 ? 'available' : 'calibrating',
            lastCalibration: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
            nextCalibrationDue: new Date(Date.now() + Math.random() * 2 * 24 * 60 * 60 * 1000),
            firmwareVersion: '4.2.0',
            usageHours: Math.floor(Math.random() * 180),
            maxUsageHours: 200
        });
    }

    // AeroVision Glasses (6 units)
    for (let i = 1; i <= 6; i++) {
        equipment.push({
            id: `aerovision-${i}`,
            type: 'aerovision',
            name: `AeroVision #${i.toString().padStart(2, '0')}`,
            batteryLevel: 25 + Math.floor(Math.random() * 75),
            status: i <= 5 ? 'available' : 'maintenance',
            lastCalibration: new Date(Date.now() - Math.random() * 40 * 24 * 60 * 60 * 1000),
            nextCalibrationDue: new Date(Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000),
            firmwareVersion: '2.0.5',
            usageHours: Math.floor(Math.random() * 500),
            maxUsageHours: 600
        });
    }

    return equipment;
};

const MOCK_EQUIPMENT = generateEquipment();
const MOCK_RESERVATIONS: EquipmentReservation[] = [];

export const EquipmentService = {
    /**
     * Get all equipment
     */
    getAllEquipment: async (): Promise<Equipment[]> => {
        return [...MOCK_EQUIPMENT];
    },

    /**
     * Get equipment by type
     */
    getByType: async (type: EquipmentType): Promise<Equipment[]> => {
        return MOCK_EQUIPMENT.filter(e => e.type === type);
    },

    /**
     * Get available equipment for a session
     */
    getAvailable: async (type: EquipmentType, size?: EquipmentSize): Promise<Equipment[]> => {
        return MOCK_EQUIPMENT.filter(e =>
            e.type === type &&
            e.status === 'available' &&
            e.batteryLevel >= 20 &&
            (!size || e.size === size)
        );
    },

    /**
     * Reserve equipment
     */
    reserve: async (
        equipmentId: string,
        memberId: string,
        memberName: string,
        sessionId: string,
        sessionTitle: string,
        startTime: Date,
        endTime: Date
    ): Promise<EquipmentReservation> => {
        const equipment = MOCK_EQUIPMENT.find(e => e.id === equipmentId);
        if (!equipment) throw new Error('Equipment not found');
        if (equipment.status !== 'available') throw new Error('Equipment not available');

        // Update equipment status
        equipment.status = 'reserved';
        equipment.reservedBy = memberId;
        equipment.reservedByName = memberName;
        equipment.reservedForSession = sessionId;

        const reservation: EquipmentReservation = {
            id: `res-${Date.now()}`,
            equipmentId,
            memberId,
            memberName,
            sessionId,
            sessionTitle,
            startTime,
            endTime,
            status: 'confirmed'
        };

        MOCK_RESERVATIONS.push(reservation);
        return reservation;
    },

    /**
     * Cancel reservation
     */
    cancelReservation: async (reservationId: string): Promise<void> => {
        const reservation = MOCK_RESERVATIONS.find(r => r.id === reservationId);
        if (!reservation) return;

        const equipment = MOCK_EQUIPMENT.find(e => e.id === reservation.equipmentId);
        if (equipment) {
            equipment.status = 'available';
            equipment.reservedBy = undefined;
            equipment.reservedByName = undefined;
            equipment.reservedForSession = undefined;
        }

        reservation.status = 'cancelled';
    },

    /**
     * Get user's reservations
     */
    getUserReservations: async (memberId: string): Promise<EquipmentReservation[]> => {
        return MOCK_RESERVATIONS.filter(r => r.memberId === memberId && r.status !== 'cancelled');
    },

    /**
     * Get equipment alerts
     */
    getAlerts: async (): Promise<EquipmentAlert[]> => {
        const alerts: EquipmentAlert[] = [];

        MOCK_EQUIPMENT.forEach(e => {
            // Low battery
            if (e.batteryLevel < 20) {
                alerts.push({
                    id: `alert-battery-${e.id}`,
                    equipmentId: e.id,
                    equipmentName: e.name,
                    type: 'low_battery',
                    message: `Batería baja (${e.batteryLevel}%). Poner a cargar.`,
                    createdAt: new Date(),
                    isResolved: false
                });
            }

            // Calibration due
            if (e.nextCalibrationDue < new Date()) {
                alerts.push({
                    id: `alert-calibration-${e.id}`,
                    equipmentId: e.id,
                    equipmentName: e.name,
                    type: 'calibration_due',
                    message: 'Calibración vencida. Recalibrar antes de usar.',
                    createdAt: new Date(),
                    isResolved: false
                });
            }

            // End of life warning
            if (e.usageHours >= e.maxUsageHours * 0.9) {
                alerts.push({
                    id: `alert-eol-${e.id}`,
                    equipmentId: e.id,
                    equipmentName: e.name,
                    type: 'end_of_life',
                    message: `${Math.round((e.usageHours / e.maxUsageHours) * 100)}% de vida útil consumida.`,
                    createdAt: new Date(),
                    isResolved: false
                });
            }
        });

        return alerts;
    },

    /**
     * Get equipment config
     */
    getConfig: (type: EquipmentType) => EQUIPMENT_CONFIG[type],

    /**
     * Get status display info
     */
    getStatusInfo: (status: EquipmentStatus): { label: string; color: string; bg: string } => {
        const configs: Record<EquipmentStatus, { label: string; color: string; bg: string }> = {
            available: { label: 'Disponible', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
            reserved: { label: 'Reservado', color: 'text-amber-400', bg: 'bg-amber-500/20' },
            in_use: { label: 'En Uso', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
            charging: { label: 'Cargando', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
            maintenance: { label: 'Mantenimiento', color: 'text-red-400', bg: 'bg-red-500/20' },
            calibrating: { label: 'Calibrando', color: 'text-purple-400', bg: 'bg-purple-500/20' }
        };
        return configs[status];
    }
};

export default EquipmentService;
