// Smart Equipment & Hardware Inventory Types

export type EquipmentType = 'racket_sensor' | 'aerolung_mask' | 'groundtruth' | 'neural_pod' | 'aerovision';
export type EquipmentStatus = 'available' | 'reserved' | 'in_use' | 'charging' | 'maintenance' | 'calibrating';
export type EquipmentSize = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface Equipment {
    id: string;
    type: EquipmentType;
    name: string; // "Racket Sensor #04"
    size?: EquipmentSize;
    batteryLevel: number;
    status: EquipmentStatus;
    lastCalibration: Date;
    nextCalibrationDue: Date;
    firmwareVersion: string;
    reservedBy?: string;
    reservedByName?: string;
    reservedForSession?: string;
    usageHours: number;
    maxUsageHours: number;
}

export interface EquipmentReservation {
    id: string;
    equipmentId: string;
    memberId: string;
    memberName: string;
    sessionId: string;
    sessionTitle: string;
    startTime: Date;
    endTime: Date;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface EquipmentAlert {
    id: string;
    equipmentId: string;
    equipmentName: string;
    type: 'low_battery' | 'calibration_due' | 'maintenance_required' | 'end_of_life';
    message: string;
    createdAt: Date;
    isResolved: boolean;
}

export const EQUIPMENT_CONFIG: Record<EquipmentType, {
    name: string;
    icon: string;
    hasSizes: boolean;
    calibrationIntervalDays: number;
    maxUsageHours: number;
}> = {
    racket_sensor: {
        name: 'Racket Sensor',
        icon: '🎾',
        hasSizes: false,
        calibrationIntervalDays: 30,
        maxUsageHours: 500
    },
    aerolung_mask: {
        name: 'AeroLung Mask',
        icon: '😷',
        hasSizes: true,
        calibrationIntervalDays: 14,
        maxUsageHours: 300
    },
    groundtruth: {
        name: 'GroundTruth Insoles',
        icon: '👟',
        hasSizes: true,
        calibrationIntervalDays: 60,
        maxUsageHours: 400
    },
    neural_pod: {
        name: 'Neural Skin Pod',
        icon: '🧠',
        hasSizes: false,
        calibrationIntervalDays: 7,
        maxUsageHours: 200
    },
    aerovision: {
        name: 'AeroVision Glasses',
        icon: '👓',
        hasSizes: false,
        calibrationIntervalDays: 45,
        maxUsageHours: 600
    }
};
