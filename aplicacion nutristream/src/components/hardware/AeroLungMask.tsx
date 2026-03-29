import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiWind, FiZap, FiBluetooth, FiZapOff } from 'react-icons/fi';
import { FaLungs } from 'react-icons/fa';
import { Card, Button } from '../ui/Shared';
import { DEVICE_CONFIG } from '../../services/BluetoothService';
import { useBluetoothDevice } from '../../hooks/useBluetoothDevice';

const parseAeroLungPacket = (data: DataView): any => {
    return { airFlow: 0, vo2Max: 0 };
};

const AeroLungMask: React.FC<{}> = React.memo(() => {
    // REAL BLUETOOTH HOOK
    const {
        connectionState: realConnectionState,
        data: realData,
        connect: connectReal,
        disconnect: disconnectReal
    } = useBluetoothDevice<any>({
        deviceNameFilter: 'AERO_LUNG',
        serviceUuid: DEVICE_CONFIG.AERO_LUNG.SERVICE_UUID,
        characteristicUuid: DEVICE_CONFIG.AERO_LUNG.CHARACTERISTIC_UUID,
        parseData: parseAeroLungPacket
    });

    const [simIsConnected, setSimIsConnected] = useState(false);
    const [simData, setSimData] = useState({ airFlow: 0, vo2Max: 0 });
    const [oxygenRestriction, setOxygenRestriction] = useState(0);
    const dataIntervalRef = useRef<number | null>(null);
    const { t } = useLanguage();

    // Unified State
    const isRealConnected = realConnectionState === 'CONNECTED';
    const isConnected = isRealConnected || simIsConnected;
    const data = isRealConnected ? (realData || { airFlow: 0, vo2Max: 0 }) : simData;

    const handleSimToggleConnection = () => {
        if (simIsConnected) {
            if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
            setSimIsConnected(false);
            if (isRealConnected) disconnectReal();
        } else {
            setSimIsConnected(true);
            dataIntervalRef.current = window.setInterval(() => {
                setSimData(() => {
                    const baseVO2 = 45;
                    const restrictionEffect = baseVO2 * (oxygenRestriction / 100) * 0.5;
                    const newVO2 = baseVO2 - restrictionEffect + (Math.random() * 4 - 2);
                    const newAirFlow = 150 + Math.random() * 20 - (restrictionEffect * 2);
                    return { vo2Max: newVO2, airFlow: newAirFlow };
                });
            }, 500);
        }
    };

    useEffect(() => { return () => { if (dataIntervalRef.current) clearInterval(dataIntervalRef.current) }; }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><FiWind /> {t('mascaraAeroLung')}</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button icon={simIsConnected ? FiZapOff : FiZap} onClick={handleSimToggleConnection} variant="secondary" className="w-full sm:w-auto">{simIsConnected ? t('descSim') : t('simular')}</Button>
                    <Button icon={isRealConnected ? FiBluetooth : FiBluetooth} onClick={isRealConnected ? disconnectReal : connectReal} className={`w-full sm:w-auto ${isRealConnected ? "!bg-red-500" : ""}`}>{isRealConnected ? t('descReal') : t('conectarReal')}</Button>
                </div>
            </div>

            <AnimatePresence>
                {!isConnected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Card className="!p-8 text-center min-h-[300px] flex flex-col justify-center items-center">
                            <div className="text-6xl text-slate-400 dark:text-slate-600 mb-4"><FiWind /></div>
                            <h3 className="text-xl font-bold">{t('mascaraDesconectada')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">{t('conectaAeroLungMonitor')}</p>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isConnected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="!p-4 text-center">
                                <div className="mx-auto text-3xl mb-2 text-cyan-500 flex justify-center"><FiWind /></div>
                                <p className="font-bold text-2xl">{data.airFlow.toFixed(1)}<span className="text-lg text-slate-500"> L/min</span></p>
                                <p className="text-sm text-slate-500">{t('flujoAire')}</p>
                            </Card>
                            <Card className="!p-4 text-center">
                                <div className="mx-auto text-3xl mb-2 text-red-500 flex justify-center"><FaLungs /></div>
                                <p className="font-bold text-2xl">{data.vo2Max.toFixed(1)}<span className="text-lg text-slate-500"> ml/kg/min</span></p>
                                <p className="text-sm text-slate-500">{t('vo2MaxEstimado')}</p>
                            </Card>
                        </div>
                        <Card className="!p-6">
                            <h3 className="font-bold text-lg mb-2">{t('simulacionAltitud')}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('simulacionAltitudDesc')}</p>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="80"
                                    value={oxygenRestriction}
                                    onChange={(e) => setOxygenRestriction(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                                />
                                <span className="font-bold text-lg w-20 text-center">{oxygenRestriction}%</span>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

export default AeroLungMask;
