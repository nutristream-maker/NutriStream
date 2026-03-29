import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiZap, FiBluetooth, FiTrendingDown, FiTrendingUp, FiSliders as FiSlidersIcon, FiTarget, FiMousePointer, FiAlertTriangle, FiZapOff } from 'react-icons/fi';
import { Card, Button } from '../ui/Shared';
import { DEVICE_CONFIG } from '../../services/BluetoothService';
import { useBluetoothDevice } from '../../hooks/useBluetoothDevice';

const parseAeroVisionPacket = (data: DataView): any => {
    return { pitch: 0, yaw: 0, roll: 0, focus: 100, target: 'Lejos' };
};

const AeroVisionGlasses: React.FC<{}> = React.memo(() => {
    // REAL BLUETOOTH HOOK
    const {
        connectionState: realConnectionState,
        data: realData,
        connect: connectReal,
        disconnect: disconnectReal
    } = useBluetoothDevice<any>({
        deviceNameFilter: 'AERO_VISION',
        serviceUuid: DEVICE_CONFIG.AERO_VISION.SERVICE_UUID,
        characteristicUuid: DEVICE_CONFIG.AERO_VISION.CHARACTERISTIC_UUID,
        parseData: parseAeroVisionPacket
    });

    const [simIsConnected, setSimIsConnected] = useState(false);
    const [simData, setSimData] = useState({ pitch: 0, yaw: 0, roll: 0, focus: 100, target: 'Centro' });
    const [alerts, setAlerts] = useState<{ type: string, message: string, time: string }[]>([]);
    const dataIntervalRef = useRef<number | null>(null);
    const { t } = useLanguage();

    // Unified State
    const isRealConnected = realConnectionState === 'CONNECTED';
    const isConnected = isRealConnected || simIsConnected;
    const data = isRealConnected ? (realData || { pitch: 0, yaw: 0, roll: 0, focus: 100, target: 'Centro' }) : simData;

    // Alert Logic
    useEffect(() => {
        if (!isConnected || !data) return;
        if (data.focus < 60 && !alerts.some(a => a.type === 'Focus' && a.message === t('nivelFocoBajo'))) {
            setAlerts(a => [{ type: 'Focus', message: t('nivelFocoBajo'), time: new Date().toLocaleTimeString() }, ...a]);
        }
        if (data.pitch > 15 && !alerts.some(a => a.type === 'Posture' && a.message === t('alertaPostural'))) {
            setAlerts(a => [{ type: 'Posture', message: t('alertaPostural'), time: new Date().toLocaleTimeString() }, ...a]);
        }
    }, [data, isConnected]);

    const handleSimToggleConnection = () => {
        if (simIsConnected) {
            if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
            setSimIsConnected(false);
            if (isRealConnected) disconnectReal();
        } else {
            setSimIsConnected(true);
            dataIntervalRef.current = window.setInterval(() => {
                setSimData(prev => {
                    const newFocus = Math.max(0, prev.focus - 0.2);
                    const newPitch = Math.min(20, prev.pitch + 0.1); // Simulate head drooping
                    const newYaw = prev.yaw + (Math.random() - 0.5);
                    const newRoll = prev.roll + (Math.random() - 0.5);
                    const targets = ['Centro', 'Izquierda', 'Derecha', 'Arriba', 'Abajo'];
                    const newTarget = Math.random() < 0.05 ? targets[Math.floor(Math.random() * targets.length)] : prev.target;
                    return { pitch: newPitch, yaw: newYaw, roll: newRoll, focus: newFocus, target: newTarget };
                });
            }, 100);
        }
    };

    useEffect(() => { return () => { if (dataIntervalRef.current) clearInterval(dataIntervalRef.current) }; }, []);

    const DataDisplay: React.FC<{ icon: React.ElementType, label: string, value: string | number, unit?: string, colorClass: string }> = ({ icon: Icon, label, value, unit, colorClass }) => (
        <Card className="!p-4 text-center">
            <div className={`mx-auto text-3xl mb-2 ${colorClass} flex justify-center`}><Icon /></div>
            <p className="font-bold text-2xl">{value}<span className="text-lg text-slate-500">{unit}</span></p>
            <p className="text-sm text-slate-500">{label}</p>
        </Card>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><FiEye /> {t('gafasAeroVision')}</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button icon={simIsConnected ? FiZapOff : FiZap} onClick={handleSimToggleConnection} variant="secondary" className="w-full sm:w-auto">{simIsConnected ? t('descSim') : t('simular')}</Button>
                    <Button icon={isRealConnected ? FiBluetooth : FiBluetooth} onClick={isRealConnected ? disconnectReal : connectReal} className={`w-full sm:w-auto ${isRealConnected ? "!bg-red-500" : ""}`}>{isRealConnected ? t('descReal') : t('conectarReal')}</Button>
                </div>
            </div>

            <AnimatePresence>
                {!isConnected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Card className="!p-8 text-center min-h-[300px] flex flex-col justify-center items-center">
                            <div className="text-6xl text-slate-400 dark:text-slate-600 mb-4"><FiEye /></div>
                            <h3 className="text-xl font-bold">{t('gafasDesconectadas')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">{t('conectaAeroVision')}</p>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isConnected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                            <DataDisplay icon={FiTrendingDown} label={t('inclinacion')} value={data.pitch.toFixed(1)} unit="°" colorClass="text-red-500" />
                            <DataDisplay icon={FiTrendingUp} label={t('giro')} value={data.yaw.toFixed(1)} unit="°" colorClass="text-green-500" />
                            <DataDisplay icon={FiSlidersIcon} label={t('ladeo')} value={data.roll.toFixed(1)} unit="°" colorClass="text-yellow-500" />
                            <DataDisplay icon={FiTarget} label={t('foco')} value={data.focus.toFixed(0)} unit="%" colorClass="text-blue-500" />
                            <DataDisplay icon={FiMousePointer} label={t('objetivoMirada')} value={data.target} colorClass="text-purple-500" />
                        </div>
                        <Card className="!p-6">
                            <h3 className="text-xl font-bold mb-4">Alertas de IA en Tiempo Real</h3>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {alerts.length > 0 ? alerts.map((alert, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                                        <div className="text-orange-500 shrink-0"><FiAlertTriangle /></div>
                                        <div className="flex-grow">
                                            <p className="font-semibold">{alert.type}</p>
                                            <p className="text-sm text-slate-500">{alert.message}</p>
                                        </div>
                                        <p className="text-xs text-slate-400 shrink-0">{alert.time}</p>
                                    </motion.div>
                                )) : <p className="text-slate-500">Sin alertas. ¡Mantén el buen trabajo!</p>}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

export default AeroVisionGlasses;
