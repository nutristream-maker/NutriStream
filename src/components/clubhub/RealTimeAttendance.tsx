import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiCheck, FiClock, FiX, FiRefreshCw, FiZap } from 'react-icons/fi';
import { Session, Attendance, AttendanceStatus } from '../../types/ClubTypes';
import AttendanceBall from './AttendanceBall';

interface RealTimeAttendanceProps {
    session: Session;
    isTrainerView?: boolean;
    onRefresh?: () => void;
}

const RealTimeAttendance: React.FC<RealTimeAttendanceProps> = ({
    session,
    isTrainerView = true,
    onRefresh
}) => {
    const [attendees, setAttendees] = useState<Attendance[]>(session.attendees);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [isLive, setIsLive] = useState(true);

    // Simulate real-time updates
    useEffect(() => {
        if (!isLive) return;

        const interval = setInterval(() => {
            // Simulate random attendance updates
            setAttendees(prev => {
                const updated = [...prev];
                const randomIdx = Math.floor(Math.random() * updated.length);
                if (updated[randomIdx] && updated[randomIdx].status === 'pending') {
                    if (Math.random() > 0.7) {
                        updated[randomIdx] = {
                            ...updated[randomIdx],
                            status: 'confirmed',
                            checkinTime: new Date()
                        };
                    }
                }
                return updated;
            });
            setLastUpdate(new Date());
        }, 5000);

        return () => clearInterval(interval);
    }, [isLive]);

    const stats = {
        confirmed: attendees.filter(a => a.status === 'confirmed').length,
        pending: attendees.filter(a => a.status === 'pending').length,
        absent: attendees.filter(a => a.status === 'absent').length,
        total: attendees.length
    };

    const getStatusLabel = (status: AttendanceStatus) => {
        switch (status) {
            case 'confirmed': return 'Confirmado';
            case 'pending': return 'Pendiente';
            case 'absent': return 'Ausente';
        }
    };

    const sortedAttendees = [...attendees].sort((a, b) => {
        const order = { confirmed: 0, pending: 1, absent: 2 };
        return order[a.status] - order[b.status];
    });

    return (
        <div className="space-y-6">
            {/* Session Header */}
            <div className="p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-900/10 to-white dark:from-cyan-900/20 dark:to-slate-900/50 backdrop-blur-xl shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{session.title}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {session.dateTime.toLocaleDateString('es-ES', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                            })} • {session.dateTime.toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>

                    {/* Live Indicator */}
                    <div className="flex items-center gap-3">
                        <motion.div
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-full
                                ${isLive
                                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                                }
                            `}
                            animate={isLive ? { opacity: [1, 0.5, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                            <span className="text-xs font-bold">{isLive ? 'EN VIVO' : 'PAUSADO'}</span>
                        </motion.div>

                        <button
                            onClick={() => setIsLive(!isLive)}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white transition-colors"
                        >
                            {isLive ? <FiX size={16} /> : <FiRefreshCw size={16} />}
                        </button>
                    </div>
                </div>

                {/* Stats Counter */}
                <div className="grid grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <FiUsers className="text-slate-400" size={16} />
                        </div>
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</span>
                        <p className="text-xs text-slate-500 mt-1">Total</p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <AttendanceBall status="confirmed" size="sm" showPulse={false} />
                        </div>
                        <motion.span
                            className="text-3xl font-black text-emerald-600 dark:text-emerald-400"
                            key={stats.confirmed}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                        >
                            {stats.confirmed}
                        </motion.span>
                        <p className="text-xs text-emerald-700 dark:text-emerald-500/70 mt-1">Confirmados</p>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <AttendanceBall status="pending" size="sm" />
                        </div>
                        <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{stats.pending}</span>
                        <p className="text-xs text-amber-700 dark:text-amber-500/70 mt-1">Pendientes</p>
                    </div>

                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <AttendanceBall status="absent" size="sm" showPulse={false} />
                        </div>
                        <span className="text-3xl font-black text-red-500 dark:text-red-400">{stats.absent}</span>
                        <p className="text-xs text-red-600 dark:text-red-500/70 mt-1">Ausentes</p>
                    </div>
                </div>
            </div>

            {/* Attendance Status Balls Visualization */}
            <div className="p-6 rounded-2xl border border-cyan-500/20 bg-white dark:bg-slate-900/50 backdrop-blur-xl shadow-sm dark:shadow-none">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FiZap className="text-cyan-600 dark:text-cyan-400" />
                    Estado en Tiempo Real
                </h3>

                <div className="flex flex-wrap gap-3">
                    <AnimatePresence>
                        {sortedAttendees.map((att, idx) => (
                            <motion.div
                                key={att.id}
                                className={`
                                    p-3 rounded-xl border flex items-center gap-3
                                    ${att.status === 'confirmed'
                                        ? 'bg-emerald-500/10 border-emerald-500/20'
                                        : att.status === 'pending'
                                            ? 'bg-amber-500/10 border-amber-500/20'
                                            : 'bg-red-500/10 border-red-500/20'
                                    }
                                `}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.02 }}
                                layout
                            >
                                <AttendanceBall status={att.status} size="md" />
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{att.memberName}</p>
                                    <p className="text-[10px] text-slate-500">
                                        {att.checkinTime
                                            ? `Check-in: ${att.checkinTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
                                            : getStatusLabel(att.status)
                                        }
                                    </p>
                                </div>

                                {/* Neural Battery if available */}
                                {att.neuralBatteryAtCheckin && (
                                    <div className="ml-auto text-right">
                                        <span className="text-xs text-slate-400">NB</span>
                                        <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{att.neuralBatteryAtCheckin}%</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <p className="text-[10px] text-slate-600 mt-4 text-right">
                    Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
                </p>
            </div>
        </div>
    );
};

export default RealTimeAttendance;
