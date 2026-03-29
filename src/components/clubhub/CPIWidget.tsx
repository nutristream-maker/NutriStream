import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiAlertTriangle } from 'react-icons/fi';
import { ClubPerformanceIndex } from '../../types/ClubTypes';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface CPIWidgetProps {
    cpi: ClubPerformanceIndex;
    clubName?: string;
    showAlert?: boolean;
    isDarkMode?: boolean;
}

const CPIWidget: React.FC<CPIWidgetProps> = ({ cpi, clubName, showAlert = true, isDarkMode = true }) => {
    const isCritical = cpi.value < 60;
    const isWarning = cpi.value < 70;

    const trendIcons = {
        up: <FiTrendingUp className="text-emerald-400" size={20} />,
        down: <FiTrendingDown className="text-red-400" size={20} />,
        stable: <FiMinus className="text-slate-400" size={20} />
    };

    const getStatusColor = () => {
        if (isCritical) return 'from-red-500 to-red-600';
        if (isWarning) return 'from-amber-500 to-orange-500';
        return 'from-cyan-500 to-emerald-500';
    };

    const getGlowColor = () => {
        if (isCritical) return 'shadow-[0_0_30px_rgba(239,68,68,0.4)]';
        if (isWarning) return 'shadow-[0_0_30px_rgba(245,158,11,0.3)]';
        return 'shadow-[0_0_30px_rgba(0,255,255,0.3)]';
    };

    const chartData = cpi.history.map(h => ({
        date: h.date.toLocaleDateString('es-ES', { weekday: 'short' }),
        value: h.value
    }));

    return (
        <motion.div
            className={`
                relative p-6 rounded-2xl border border-cyan-500/20
                bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/80 dark:to-slate-800/50
                backdrop-blur-xl ${getGlowColor()} shadow-sm dark:shadow-none
            `}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* Critical Alert Banner */}
            {showAlert && isCritical && (
                <motion.div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-red-500 rounded-full flex items-center gap-2 shadow-lg"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <FiAlertTriangle size={14} />
                    <span className="text-xs font-bold text-white">ALERTA CPI</span>
                </motion.div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Club Performance Index
                    </h3>
                    {clubName && (
                        <p className="text-sm text-slate-500 mt-0.5">{clubName}</p>
                    )}
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    {trendIcons[cpi.trend]}
                    <span className="text-xs font-medium text-slate-400">
                        {cpi.trend === 'up' ? '+' : cpi.trend === 'down' ? '-' : ''}
                        {Math.abs(cpi.value - (cpi.history[cpi.history.length - 2]?.value || cpi.value)).toFixed(1)}
                    </span>
                </div>
            </div>

            {/* Main Value */}
            <div className="flex items-end gap-3 mb-4">
                <motion.div
                    className={`text-5xl font-black bg-gradient-to-r ${getStatusColor()} bg-clip-text text-transparent`}
                    key={cpi.value}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                >
                    {cpi.value.toFixed(1)}
                </motion.div>
                <span className="text-lg text-slate-500 font-medium mb-1">/100</span>
            </div>

            {/* Sparkline Chart */}
            <div className="h-16 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <Tooltip
                            contentStyle={{
                                background: isDarkMode ? '#1e293b' : '#ffffff',
                                border: isDarkMode ? '1px solid rgba(0,255,255,0.2)' : '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '12px',
                                color: isDarkMode ? '#fff' : '#0f172a'
                            }}
                            labelStyle={{ color: '#94a3b8' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#00ffff'}
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Formula */}
            <div className="text-center p-3 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5">
                <p className="text-[10px] font-mono text-slate-500">
                    CPI = Σ(NeuralBattery × Attendance) / TotalMembers
                </p>
            </div>

            {/* Warning Message */}
            {isCritical && (
                <motion.p
                    className="mt-4 text-sm text-red-400 text-center font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    ⚠️ Se recomienda sesión de descarga para el grupo
                </motion.p>
            )}
        </motion.div>
    );
};

export default CPIWidget;
