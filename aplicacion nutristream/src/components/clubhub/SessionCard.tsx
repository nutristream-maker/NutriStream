import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiUsers, FiCheck, FiX } from 'react-icons/fi';
import { Session, Trainer, Attendance } from '../../types/ClubTypes';
import AttendanceBall from './AttendanceBall';

interface SessionCardProps {
    session: Session;
    trainer?: Trainer;
    userAttendance?: Attendance;
    onConfirm?: () => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({
    session,
    trainer,
    userAttendance,
    onConfirm,
    onCancel,
    isLoading = false
}) => {
    const slotsAvailable = session.capacity - session.attendees.length;
    const isConfirmed = userAttendance?.status === 'confirmed';
    const isPending = userAttendance?.status === 'pending';

    const sessionTypeColors = {
        strength: 'from-red-500/20 to-orange-500/20 border-red-500/30',
        cardio: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
        recovery: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
        mixed: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30'
    };

    const sessionTypeLabels = {
        strength: '💪 Fuerza',
        cardio: '🏃 Cardio',
        recovery: '🧘 Recuperación',
        mixed: '🔥 Mixto'
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: Date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Hoy';
        if (date.toDateString() === tomorrow.toDateString()) return 'Mañana';
        return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
    };

    return (
        <motion.div
            className={`
                relative p-5 rounded-2xl border backdrop-blur-sm
                bg-gradient-to-br ${sessionTypeColors[session.sessionType]}
                hover:shadow-[0_0_30px_rgba(0,255,255,0.15)]
                transition-all duration-300
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -4 }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                        {formatDate(session.dateTime)}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                        {session.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-0.5">
                        {sessionTypeLabels[session.sessionType]}
                    </p>
                </div>

                {/* Attendance Status */}
                {userAttendance && (
                    <AttendanceBall status={userAttendance.status} size="lg" />
                )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Time */}
                <div className="flex items-center gap-2 text-slate-300">
                    <FiClock className="text-cyan-400" size={16} />
                    <span className="text-sm font-medium">
                        {formatTime(session.dateTime)} • {session.duration}min
                    </span>
                </div>

                {/* Slots */}
                <div className="flex items-center gap-2 text-slate-300">
                    <FiUsers className="text-amber-400" size={16} />
                    <span className="text-sm font-medium">
                        {slotsAvailable}/{session.capacity} plazas
                    </span>
                </div>
            </div>

            {/* Trainer */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/5 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {session.trainerName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                    <p className="text-sm font-bold text-white">{session.trainerName}</p>
                    {trainer && (
                        <p className="text-xs text-slate-400">
                            {trainer.specialties.slice(0, 2).join(' • ')} • ⭐ {trainer.rating}
                        </p>
                    )}
                </div>
            </div>

            {/* Actions */}
            {!isConfirmed ? (
                <motion.button
                    onClick={onConfirm}
                    disabled={isLoading || slotsAvailable === 0}
                    className={`
                        w-full py-3 px-4 rounded-xl font-bold text-sm
                        flex items-center justify-center gap-2
                        transition-all duration-200
                        ${slotsAvailable === 0
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-black hover:from-cyan-400 hover:to-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.3)]'
                        }
                    `}
                    whileHover={slotsAvailable > 0 ? { scale: 1.02 } : {}}
                    whileTap={slotsAvailable > 0 ? { scale: 0.98 } : {}}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : slotsAvailable === 0 ? (
                        'Sesión Completa'
                    ) : (
                        <>
                            <FiCheck size={18} />
                            Confirmar Asistencia
                        </>
                    )}
                </motion.button>
            ) : (
                <div className="flex gap-2">
                    <div className="flex-1 py-3 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-sm text-center flex items-center justify-center gap-2">
                        <FiCheck size={16} />
                        Confirmado
                    </div>
                    <motion.button
                        onClick={onCancel}
                        className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiX size={18} />
                    </motion.button>
                </div>
            )}

            {/* Pending indicator */}
            {isPending && (
                <p className="text-center text-xs text-amber-400 mt-2">
                    Pendiente de confirmación del entrenador
                </p>
            )}
        </motion.div>
    );
};

export default SessionCard;
