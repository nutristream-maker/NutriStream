import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiBattery, FiAlertCircle, FiCheck, FiX, FiTool, FiZap, FiFilter } from 'react-icons/fi';
import { Equipment, EquipmentType, EquipmentAlert, EQUIPMENT_CONFIG, EquipmentSize } from '../../types/EquipmentTypes';
import { EquipmentService } from '../../services/EquipmentService';

interface EquipmentReservationProps {
    sessionId?: string;
    sessionTitle?: string;
    memberId?: string;
    memberName?: string;
    onReserve?: (equipmentId: string) => void;
    isTrainerView?: boolean;
}

const EquipmentReservation: React.FC<EquipmentReservationProps> = ({
    sessionId = 'session-1',
    sessionTitle = 'Sesión de Entrenamiento',
    memberId = 'm-1',
    memberName = 'Usuario',
    onReserve,
    isTrainerView = false
}) => {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [alerts, setAlerts] = useState<EquipmentAlert[]>([]);
    const [selectedType, setSelectedType] = useState<EquipmentType | 'all'>('all');
    const [selectedSize, setSelectedSize] = useState<EquipmentSize | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [allEquipment, allAlerts] = await Promise.all([
            EquipmentService.getAllEquipment(),
            EquipmentService.getAlerts()
        ]);
        setEquipment(allEquipment);
        setAlerts(allAlerts);
        setLoading(false);
    };

    const handleReserve = async (eq: Equipment) => {
        try {
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour

            await EquipmentService.reserve(
                eq.id,
                memberId,
                memberName,
                sessionId,
                sessionTitle,
                startTime,
                endTime
            );

            onReserve?.(eq.id);
            loadData(); // Refresh
        } catch (error) {
            console.error('Reservation failed:', error);
        }
    };

    const filteredEquipment = equipment.filter(e =>
        (selectedType === 'all' || e.type === selectedType) &&
        (!selectedSize || e.size === selectedSize)
    );

    const getBatteryColor = (level: number) => {
        if (level >= 60) return 'text-emerald-400';
        if (level >= 30) return 'text-amber-400';
        return 'text-red-400';
    };

    const equipmentTypes = Object.keys(EQUIPMENT_CONFIG) as EquipmentType[];
    const sizes: EquipmentSize[] = ['XS', 'S', 'M', 'L', 'XL'];

    // Check if selected type has sizes
    const typeHasSizes = selectedType !== 'all' && EQUIPMENT_CONFIG[selectedType]?.hasSizes;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FiPackage className="text-cyan-500 dark:text-cyan-400" />
                        Smart Equipment
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Inventario IoT del club
                    </p>
                </div>

                {/* Alerts Badge */}
                {alerts.length > 0 && isTrainerView && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full">
                        <FiAlertCircle className="text-amber-400" size={14} />
                        <span className="text-xs font-bold text-amber-400">{alerts.length} alertas</span>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => { setSelectedType('all'); setSelectedSize(undefined); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${selectedType === 'all'
                            ? 'bg-cyan-500 text-black'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        Todos
                    </button>
                    {equipmentTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => { setSelectedType(type); setSelectedSize(undefined); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${selectedType === type
                                ? 'bg-cyan-500 text-black'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            {EQUIPMENT_CONFIG[type].icon}
                        </button>
                    ))}
                </div>

                {/* Size Filter */}
                {typeHasSizes && (
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                        {sizes.map(size => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(selectedSize === size ? undefined : size)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${selectedSize === size
                                    ? 'bg-purple-500 text-white'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Equipment Grid */}
            {loading ? (
                <div className="text-center py-8 text-slate-500">Cargando inventario...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredEquipment.map((eq, idx) => {
                            const config = EQUIPMENT_CONFIG[eq.type];
                            const statusInfo = EquipmentService.getStatusInfo(eq.status);
                            const isAvailable = eq.status === 'available' && eq.batteryLevel >= 20;

                            return (
                                <motion.div
                                    key={eq.id}
                                    className={`
                                        p-4 rounded-xl border backdrop-blur-sm
                                        ${isAvailable
                                            ? 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 shadow-sm dark:shadow-none'
                                            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60'
                                        }
                                    `}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.02 }}
                                    layout
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-2xl">{config.icon}</span>
                                        <span className={`
                                            px-2 py-0.5 rounded-full text-[10px] font-bold
                                            ${statusInfo.bg} ${statusInfo.color}
                                        `}>
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    {/* Name */}
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate mb-1">
                                        {eq.name}
                                    </p>
                                    {eq.size && (
                                        <span className="text-xs text-slate-500">Talla {eq.size}</span>
                                    )}

                                    {/* Battery */}
                                    <div className="flex items-center gap-2 mt-3 mb-3">
                                        <FiBattery className={getBatteryColor(eq.batteryLevel)} size={14} />
                                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${eq.batteryLevel >= 60 ? 'bg-emerald-500' :
                                                    eq.batteryLevel >= 30 ? 'bg-amber-500' :
                                                        'bg-red-500'
                                                    }`}
                                                style={{ width: `${eq.batteryLevel}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-500">{eq.batteryLevel}%</span>
                                    </div>

                                    {/* Reserved By */}
                                    {eq.reservedByName && (
                                        <p className="text-xs text-amber-500 dark:text-amber-400 mb-3">
                                            Reservado: {eq.reservedByName}
                                        </p>
                                    )}

                                    {/* Reserve Button */}
                                    {!isTrainerView && isAvailable && (
                                        <motion.button
                                            onClick={() => handleReserve(eq)}
                                            className="w-full py-2 bg-cyan-500 text-black font-bold text-xs rounded-lg hover:bg-cyan-400 transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Reservar
                                        </motion.button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Equipment Alerts (Trainer View) */}
            {isTrainerView && alerts.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <FiTool className="text-amber-500 dark:text-amber-400" />
                        Alertas de Mantenimiento
                    </h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {alerts.slice(0, 5).map(alert => (
                            <div
                                key={alert.id}
                                className={`
                                    flex items-center gap-3 p-3 rounded-lg
                                    ${alert.type === 'low_battery' ? 'bg-red-500/10 border border-red-500/20' :
                                        alert.type === 'calibration_due' ? 'bg-amber-500/10 border border-amber-500/20' :
                                            'bg-orange-500/10 border border-orange-500/20'}
                                `}
                            >
                                <FiAlertCircle className={
                                    alert.type === 'low_battery' ? 'text-red-400' :
                                        alert.type === 'calibration_due' ? 'text-amber-400' :
                                            'text-orange-400'
                                } />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{alert.equipmentName}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">{alert.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipmentReservation;
