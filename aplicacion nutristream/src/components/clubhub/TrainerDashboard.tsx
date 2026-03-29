import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    FiCalendar, FiUsers, FiClock, FiTrendingUp, FiChevronRight,
    FiZap, FiAward, FiTarget, FiActivity, FiAlertTriangle, FiCheck
} from 'react-icons/fi';
import { Club, Session, Member } from '../../types/ClubTypes';

interface TrainerDashboardProps {
    club: Club;
    onViewSession?: (session: Session) => void;
    onSendHUDAlert?: () => void;
    onStartFlashChallenge?: () => void;
    onViewAllMembers?: () => void;
}

const TrainerDashboard: React.FC<TrainerDashboardProps> = ({
    club,
    onViewSession,
    onSendHUDAlert,
    onStartFlashChallenge,
    onViewAllMembers
}) => {
    // Get today's sessions
    const todaySessions = useMemo(() => {
        const today = new Date();
        return club.sessions.filter(s =>
            s.dateTime.toDateString() === today.toDateString()
        ).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
    }, [club.sessions]);

    // Calculate stats
    const stats = useMemo(() => {
        const totalToday = todaySessions.length;
        const confirmedToday = todaySessions.reduce((acc, s) =>
            acc + s.attendees.filter(a => a.status === 'confirmed').length, 0
        );
        const capacityToday = todaySessions.reduce((acc, s) => acc + s.capacity, 0);
        const occupancyRate = capacityToday > 0 ? Math.round((confirmedToday / capacityToday) * 100) : 0;

        const avgBattery = Math.round(
            club.members.reduce((acc, m) => acc + m.neuralBattery, 0) / club.members.length
        );

        const fatigueMembers = club.members.filter(m => m.fatigueLevel > 30).length;

        return { totalToday, confirmedToday, capacityToday, occupancyRate, avgBattery, fatigueMembers };
    }, [todaySessions, club.members]);

    // Format time
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    // Get session status
    const getSessionStatus = (session: Session) => {
        const now = new Date();
        const sessionEnd = new Date(session.dateTime.getTime() + session.duration * 60000);

        if (now < session.dateTime) return 'upcoming';
        if (now >= session.dateTime && now <= sessionEnd) return 'active';
        return 'completed';
    };

    // Session type colors
    const sessionTypeColors: Record<string, { bg: string; text: string; border: string }> = {
        strength: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
        cardio: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
        recovery: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
        hiit: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
    };

    return (
        <div className="space-y-6">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                            <FiCalendar className="text-cyan-500" size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalToday}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Clases Hoy</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <FiUsers className="text-emerald-500" size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.confirmedToday}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Reservas Confirmadas</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <FiTrendingUp className="text-amber-500" size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.occupancyRate}%</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Ocupación</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.fatigueMembers > 3 ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                            <FiAlertTriangle className={stats.fatigueMembers > 3 ? 'text-red-500' : 'text-emerald-500'} size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.fatigueMembers}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Fatiga Alta</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Sessions */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <FiCalendar className="text-cyan-500" />
                        Clases de Hoy
                    </h2>

                    {todaySessions.length === 0 ? (
                        <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                            <p className="text-slate-500 dark:text-slate-400">No hay clases programadas para hoy</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {todaySessions.map((session, idx) => {
                                const status = getSessionStatus(session);
                                const typeColors = sessionTypeColors[session.sessionType] || sessionTypeColors.strength;
                                const confirmedCount = session.attendees.filter(a => a.status === 'confirmed').length;
                                const pendingCount = session.attendees.filter(a => a.status === 'pending').length;

                                return (
                                    <motion.div
                                        key={session.id}
                                        className={`p-4 rounded-2xl bg-white dark:bg-slate-800 border ${status === 'active' ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' : 'border-slate-200 dark:border-slate-700'} cursor-pointer group hover:border-cyan-500/50 transition-all`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => onViewSession?.(session)}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Time Block */}
                                            <div className="text-center min-w-[60px]">
                                                <div className="text-xl font-black text-slate-900 dark:text-white">
                                                    {formatTime(session.dateTime)}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    {session.duration} min
                                                </div>
                                                {status === 'active' && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-500 text-black text-[10px] font-bold rounded-full animate-pulse">
                                                        EN CURSO
                                                    </span>
                                                )}
                                                {status === 'completed' && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-full">
                                                        FINALIZADA
                                                    </span>
                                                )}
                                            </div>

                                            {/* Session Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${typeColors.bg} ${typeColors.text}`}>
                                                        {session.sessionType.toUpperCase()}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                                                    {session.title}
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {session.trainerName}
                                                </p>
                                            </div>

                                            {/* Attendance */}
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <div className="flex items-center gap-1 text-emerald-500">
                                                        <FiCheck size={14} />
                                                        <span className="font-bold">{confirmedCount}</span>
                                                    </div>
                                                    {pendingCount > 0 && (
                                                        <div className="flex items-center gap-1 text-amber-500">
                                                            <FiClock size={14} />
                                                            <span className="font-bold">{pendingCount}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    de {session.capacity} plazas
                                                </div>
                                                {/* Progress bar */}
                                                <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                                                        style={{ width: `${Math.min(100, (confirmedCount / session.capacity) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <FiChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-cyan-500 transition-colors" />
                                        </div>

                                        {/* Attendees Preview */}
                                        {confirmedCount > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">Confirmados:</span>
                                                    <div className="flex -space-x-2">
                                                        {session.attendees
                                                            .filter(a => a.status === 'confirmed')
                                                            .slice(0, 5)
                                                            .map((att, i) => (
                                                                <div
                                                                    key={att.id}
                                                                    className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold text-white"
                                                                    title={att.memberName}
                                                                >
                                                                    {att.memberName.charAt(0)}
                                                                </div>
                                                            ))}
                                                        {confirmedCount > 5 && (
                                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                                                +{confirmedCount - 5}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                    {/* Neural Battery Overview */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiZap className="text-amber-500" />
                            Estado del Grupo
                        </h3>

                        <div className="text-center mb-4">
                            <div className="text-4xl font-black text-slate-900 dark:text-white">
                                {stats.avgBattery}%
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                Batería Neural Media
                            </div>
                        </div>

                        {/* Battery distribution */}
                        <div className="space-y-2">
                            {[
                                { label: 'Óptimo (80-100%)', count: club.members.filter(m => m.neuralBattery >= 80).length, color: 'bg-emerald-500' },
                                { label: 'Normal (60-79%)', count: club.members.filter(m => m.neuralBattery >= 60 && m.neuralBattery < 80).length, color: 'bg-cyan-500' },
                                { label: 'Bajo (40-59%)', count: club.members.filter(m => m.neuralBattery >= 40 && m.neuralBattery < 60).length, color: 'bg-amber-500' },
                                { label: 'Crítico (<40%)', count: club.members.filter(m => m.neuralBattery < 40).length, color: 'bg-red-500' },
                            ].map((range, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                    <div className={`w-2 h-2 rounded-full ${range.color}`} />
                                    <span className="flex-1 text-slate-500 dark:text-slate-400">{range.label}</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{range.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Today's Performance */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <FiAward className="text-cyan-500" />
                            Rendimiento Hoy
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Ocupación Media</span>
                                <span className="font-bold text-slate-900 dark:text-white">{stats.occupancyRate}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 dark:text-slate-400">CPI del Club</span>
                                <span className="font-bold text-cyan-500">{club.cpi.value}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Tendencia</span>
                                <span className={`font-bold flex items-center gap-1 ${club.cpi.trend === 'up' ? 'text-emerald-500' : club.cpi.trend === 'down' ? 'text-red-500' : 'text-slate-500'}`}>
                                    {club.cpi.trend === 'up' ? '↗' : club.cpi.trend === 'down' ? '↘' : '→'}
                                    {club.cpi.trend === 'up' ? 'Subiendo' : club.cpi.trend === 'down' ? 'Bajando' : 'Estable'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">
                            Acciones Rápidas
                        </h3>
                        <div className="space-y-2">
                            <button
                                onClick={onSendHUDAlert}
                                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-500 transition-colors flex items-center gap-2"
                            >
                                <FiActivity size={16} />
                                Enviar Alerta HUD
                            </button>
                            <button
                                onClick={onStartFlashChallenge}
                                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-500 transition-colors flex items-center gap-2"
                            >
                                <FiTarget size={16} />
                                Iniciar Flash Challenge
                            </button>
                            <button
                                onClick={onViewAllMembers}
                                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-500 transition-colors flex items-center gap-2"
                            >
                                <FiUsers size={16} />
                                Ver Todos los Miembros
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
