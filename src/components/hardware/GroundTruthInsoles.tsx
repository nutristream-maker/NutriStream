import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Card, Button } from '../ui/Shared';
import { FiZap, FiBluetooth, FiZapOff, FiActivity } from 'react-icons/fi';
import { FaShoePrints, FaRunning } from 'react-icons/fa';
import { GiBrain } from 'react-icons/gi';
import { DEVICE_CONFIG } from '../../services/BluetoothService';
import { useBluetoothDevice } from '../../hooks/useBluetoothDevice';

const parseGroundTruthPacket = (data: DataView): any => {
    return { cadence: 0, balance: 50, heatMap: [0, 0, 0, 0, 0, 0], strikeType: 'Neutral', impactForce: 0 };
};

const HeatMapFoot: React.FC<{ side: 'left' | 'right', data: number[] }> = ({ side, data }) => {
    // Data mapping: [0] = Forefoot/Toes, [1] = Midfoot/Arch, [2] = Heel
    // Ensure data exists and fallback to 0
    const forefootPressure = data[0] || 0;
    const midfootPressure = data[1] || 0;
    const heelPressure = data[2] || 0;

    const isLeft = side === 'left';

    return (
        <div className="relative w-32 h-80 flex items-center justify-center">
            {/* Main Foot SVG */}
            <svg
                viewBox="0 0 100 240"
                className={`w-full h-full drop-shadow-2xl ${isLeft ? 'scale-x-[-1]' : ''}`}
                style={{ filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.2))' }}
            >
                <defs>
                    <radialGradient id="pressureGradientHigh">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                        <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Foot Outline (Sole) */}
                <path
                    d="M50 5 
                       C 65 5, 85 20, 85 60 
                       C 85 100, 75 120, 65 140 
                       C 55 160, 50 160, 50 190 
                       C 50 220, 30 235, 30 235 
                       C 30 235, 10 220, 10 190 
                       C 10 160, 20 140, 25 120 
                       C 30 100, 15 50, 15 35 
                       C 15 15, 35 5, 50 5 Z"
                    fill="#e2e8f0"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    className="dark:fill-slate-800 dark:stroke-slate-700"
                />

                {/* Pressure Zones (Mapped to Data) */}
                <g style={{ mixBlendMode: 'multiply' }} className="dark:mix-blend-screen">
                    {/* Forefoot (Metatarsals & Toes) */}
                    <circle cx="50" cy="50" r="35" fill="url(#pressureGradientHigh)" filter="url(#glow)"
                        style={{ opacity: forefootPressure }} />

                    {/* Midfoot (Arch) - Slightly offset for realism if it were strict anatomy, but center for generic balance data */}
                    <ellipse cx="45" cy="120" rx="20" ry="30" fill="url(#pressureGradientHigh)" filter="url(#glow)"
                        style={{ opacity: midfootPressure }} />

                    {/* Heel */}
                    <circle cx="40" cy="200" r="25" fill="url(#pressureGradientHigh)" filter="url(#glow)"
                        style={{ opacity: heelPressure }} />
                </g>

                {/* Grid Lines for "Tech" feel */}
                <path d="M50 10 V 230 M 20 120 H 70" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="2 2" />
            </svg>

            {/* Side Label */}
            <div className={`absolute bottom-2 ${isLeft ? 'right-2' : 'left-2'} text-[10px] font-bold text-slate-400 uppercase`}>
                {isLeft ? 'L' : 'R'}
            </div>
        </div>
    );
};

const GroundTruthInsoles: React.FC<{}> = React.memo(() => {
    // REAL BLUETOOTH HOOK
    const {
        connectionState: realConnectionState,
        data: realData,
        connect: connectReal,
        disconnect: disconnectReal
    } = useBluetoothDevice<any>({
        deviceNameFilter: 'GROUND_TRUTH',
        serviceUuid: DEVICE_CONFIG.GROUND_TRUTH.SERVICE_UUID,
        characteristicUuid: DEVICE_CONFIG.GROUND_TRUTH.CHARACTERISTIC_UUID,
        parseData: parseGroundTruthPacket
    });

    const [simIsConnected, setSimIsConnected] = useState(false);
    const [simData, setSimData] = useState({
        cadence: 0,
        balance: 50,
        heatMap: Array(6).fill(0),
        strikeType: 'Neutral',
        impactForce: 0
    });
    const intervalRef = useRef<number | null>(null);
    const { t } = useLanguage();

    // Unified State
    const isRealConnected = realConnectionState === 'CONNECTED';
    const isConnected = isRealConnected || simIsConnected;
    const data = isRealConnected ? (realData || { cadence: 0, balance: 50, heatMap: Array(6).fill(0) }) : simData;

    const handleSimToggleConnection = () => {
        if (simIsConnected) {
            setSimIsConnected(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            setSimData(d => ({ ...d, cadence: 0 }));
            if (isRealConnected) disconnectReal();
        } else {
            setSimIsConnected(true);
            intervalRef.current = window.setInterval(() => {
                setSimData(prev => ({
                    ...prev,
                    cadence: 160 + Math.floor(Math.random() * 20),
                    balance: 50 + (Math.random() * 10 - 5),
                    heatMap: prev.heatMap.map(() => Math.random())
                }));
            }, 1000);
        }
    };

    useEffect(() => { return () => { if (intervalRef.current) clearInterval(intervalRef.current); }; }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><FaShoePrints /> {t('plantillasGroundTruth')}</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button icon={simIsConnected ? FiZapOff : FiZap} onClick={handleSimToggleConnection} variant="secondary" className="w-full sm:w-auto">{simIsConnected ? t('descSim') : t('simular')}</Button>
                    <Button icon={isRealConnected ? FiBluetooth : FiBluetooth} onClick={isRealConnected ? disconnectReal : connectReal} className={`w-full sm:w-auto ${isRealConnected ? "!bg-red-500" : ""}`}>{isRealConnected ? t('descReal') : t('conectarReal')}</Button>
                </div>
            </div>

            {!isConnected ? (
                <Card className="!p-8 text-center min-h-[300px] flex flex-col justify-center items-center">
                    <div className="text-6xl text-slate-400 dark:text-slate-600 mb-4"><FaShoePrints /></div>
                    <h3 className="text-xl font-bold">{t('plantillasDesconectadas')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">{t('conectaPlantillas')}</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="!p-6 flex flex-col items-center">
                        <h3 className="text-lg font-bold mb-6">{t('mapaPresion')}</h3>
                        <div className="flex gap-8">
                            <HeatMapFoot side="left" data={data.heatMap ? data.heatMap.slice(0, 3) : [0, 0, 0]} />
                            <HeatMapFoot side="right" data={data.heatMap ? data.heatMap.slice(3, 6) : [0, 0, 0]} />
                        </div>
                        <div className="flex justify-between w-full max-w-xs mt-6 text-sm font-semibold text-slate-500">
                            <span>{t('izquierda')}</span>
                            <span>{t('derecha')}</span>
                        </div>
                    </Card>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="!p-4 text-center">
                                <div className="mx-auto text-3xl mb-2 text-primary flex justify-center"><FaRunning /></div>
                                <p className="text-3xl font-bold">{data.cadence}</p>
                                <p className="text-sm text-slate-500">{t('cadencia')}</p>
                            </Card>
                            <Card className="!p-4 text-center">
                                <div className="mx-auto text-3xl mb-2 text-green-500 flex justify-center"><FiActivity /></div>
                                <p className="text-3xl font-bold">{data.balance ? data.balance.toFixed(1) : 50}%</p>
                                <p className="text-sm text-slate-500">{t('balanceLR')}</p>
                            </Card>
                        </div>
                        <Card className="!p-6 bg-primary/5 border border-primary/20">
                            <h3 className="font-bold text-primary mb-2 flex items-center gap-2"><GiBrain /> {t('aiGaitCoach')}</h3>
                            <p className="text-slate-700 dark:text-slate-300 text-sm">
                                {data.cadence < 170 ? t('cadenciaBaja') : t('cadenciaExcel')}
                            </p>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
});

export default GroundTruthInsoles;
