import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX, FiCheck, FiWatch, FiActivity } from 'react-icons/fi';
import { Member } from '../../types/ClubTypes';
import { InjuryWatchdogService, InjuryRisk, RiskSeverity } from '../../services/InjuryWatchdogService';

interface InjuryAlertProps {
    members: Member[];
    scanInterval?: number;
    onRiskAcknowledged?: (risk: InjuryRisk) => void;
    isTrainerView?: boolean;
}

const InjuryAlert: React.FC<InjuryAlertProps> = ({
    members,
    scanInterval = 8000,
    onRiskAcknowledged,
    isTrainerView = true
}) => {
    const [activeRisks, setActiveRisks] = useState<InjuryRisk[]>([]);
    const [isScanning, setIsScanning] = useState(true);
    const [showVibration, setShowVibration] = useState(false);
    const [lastScan, setLastScan] = useState(new Date());

    // Scan for risks
    const performScan = useCallback(() => {
        const newRisks = InjuryWatchdogService.scanForRisks(members);

        if (newRisks.length > 0) {
            setActiveRisks(prev => {
                // Avoid duplicates
                const existingIds = prev.map(r => r.memberId + r.riskType);
                const filtered = newRisks.filter(r => !existingIds.includes(r.memberId + r.riskType));
                return [...prev, ...filtered].slice(-5); // Keep last 5
            });

            // Trigger vibration animation for high severity
            if (newRisks.some(r => r.severity === 'high')) {
                setShowVibration(true);
                setTimeout(() => setShowVibration(false), 2000);
            }
        }

        setLastScan(new Date());
    }, [members]);

    useEffect(() => {
        if (!isScanning || !isTrainerView) return;

        const interval = setInterval(performScan, scanInterval);
        return () => clearInterval(interval);
    }, [isScanning, scanInterval, performScan, isTrainerView]);

    const acknowledgeRisk = (risk: InjuryRisk) => {
        setActiveRisks(prev => prev.filter(r => r.id !== risk.id));
        onRiskAcknowledged?.({ ...risk, isAcknowledged: true });
    };

    const dismissRisk = (riskId: string) => {
        setActiveRisks(prev => prev.filter(r => r.id !== riskId));
    };

    const getSeverityStyles = (severity: RiskSeverity) => {
        return InjuryWatchdogService.getSeverityConfig(severity);
    };

    if (!isTrainerView) return null;

    return (
        <div className="space-y-4">
            {/* Status Bar */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-3">
                    <motion.div
                        className={`
                            p-2 rounded-lg
                            ${isScanning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'}
                        `}
                        animate={isScanning ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <FiActivity size={20} />
                    </motion.div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Injury Risk Watchdog</p>
                        <p className="text-xs text-slate-500">
                            {isScanning ? 'Monitorizando en tiempo real' : 'Pausado'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Watch Vibration Indicator */}
                    <AnimatePresence>
                        {showVibration && (
                            <motion.div
                                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0, scale: [1, 1.05, 1] }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ scale: { repeat: 3, duration: 0.2 } }}
                            >
                                <FiWatch className="text-red-400" />
                                <span className="text-xs font-bold text-red-400">VIBRACIÓN</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => setIsScanning(!isScanning)}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-bold transition-colors
                            ${isScanning
                                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                : 'bg-emerald-500 text-black hover:bg-emerald-400'
                            }
                        `}
                    >
                        {isScanning ? 'Pausar' : 'Reanudar'}
                    </button>
                </div>
            </div>

            {/* Active Alerts */}
            <AnimatePresence mode="popLayout">
                {activeRisks.map((risk, idx) => {
                    const styles = getSeverityStyles(risk.severity);
                    const label = InjuryWatchdogService.getRiskLabel(risk.riskType);
                    const isUrgent = InjuryWatchdogService.isUrgent(risk);

                    return (
                        <motion.div
                            key={risk.id}
                            className={`
                                p-4 rounded-xl border-l-4 
                                ${styles.bg} ${styles.border}
                                ${isUrgent ? 'shadow-[0_0_20px_rgba(239,68,68,0.3)]' : ''}
                            `}
                            initial={{ opacity: 0, x: -50, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                            exit={{ opacity: 0, x: 50, height: 0 }}
                            layout
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <motion.div
                                    className={`p-2 rounded-lg ${styles.bg}`}
                                    animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ repeat: isUrgent ? Infinity : 0, duration: 0.5 }}
                                >
                                    <span className="text-2xl">{label.icon}</span>
                                </motion.div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h4 className={`font-bold ${styles.text}`}>
                                            {risk.memberName}
                                        </h4>
                                        <span className={`
                                            px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                                            ${risk.severity === 'high' ? 'bg-red-500 text-white' :
                                                risk.severity === 'medium' ? 'bg-orange-500 text-white' :
                                                    'bg-amber-500 text-black'}
                                        `}>
                                            {risk.severity === 'high' ? 'URGENTE' :
                                                risk.severity === 'medium' ? 'ATENCIÓN' : 'INFO'}
                                        </span>
                                    </div>

                                    <p className="text-sm text-white dark:text-white mb-1 drop-shadow-md">
                                        {label.name}
                                        {risk.muscleGroup && <span className="text-slate-200 dark:text-slate-400"> en {risk.muscleGroup}</span>}
                                        <span className={`ml-2 font-bold ${styles.text}`}>
                                            {risk.percentageDeviation}%
                                        </span>
                                    </p>

                                    <p className="text-xs text-slate-400">
                                        💡 {risk.recommendation}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <motion.button
                                        onClick={() => acknowledgeRisk(risk)}
                                        className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        title="Atendido"
                                    >
                                        <FiCheck size={16} />
                                    </motion.button>
                                    <motion.button
                                        onClick={() => dismissRisk(risk.id)}
                                        className="p-2 rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 transition-colors"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        title="Descartar"
                                    >
                                        <FiX size={16} />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Empty State */}
            {activeRisks.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                    <FiAlertTriangle size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No hay alertas de riesgo activas</p>
                    <p className="text-xs mt-1">Última revisión: {lastScan.toLocaleTimeString('es-ES')}</p>
                </div>
            )}
        </div>
    );
};

export default InjuryAlert;
