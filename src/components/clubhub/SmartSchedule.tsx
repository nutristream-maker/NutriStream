import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { Club, Session, Trainer } from '../../types/ClubTypes';
import { ClubHubService } from '../../services/ClubHubService';
import SessionCard from './SessionCard';

interface SmartScheduleProps {
    club: Club;
    currentUserId?: string;
    onAttendanceChange?: () => void;
}

const SmartSchedule: React.FC<SmartScheduleProps> = ({
    club,
    currentUserId = 'm-1',
    onAttendanceChange
}) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loadingSession, setLoadingSession] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

    // Generate week days
    const getWeekDays = () => {
        const days = [];
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay() + 1); // Monday

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const weekDays = getWeekDays();

    // Filter sessions for selected date or week
    const getSessionsForDate = (date: Date): Session[] => {
        return club.sessions.filter(s =>
            s.dateTime.toDateString() === date.toDateString()
        ).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
    };

    const getSessionsForWeek = (): Map<string, Session[]> => {
        const sessionsByDay = new Map<string, Session[]>();
        weekDays.forEach(day => {
            sessionsByDay.set(day.toDateString(), getSessionsForDate(day));
        });
        return sessionsByDay;
    };

    // Navigation
    const navigateWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
        setSelectedDate(newDate);
    };

    const navigateDay = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
        setSelectedDate(newDate);
    };

    // Attendance handlers
    const handleConfirm = async (sessionId: string) => {
        setLoadingSession(sessionId);
        try {
            await ClubHubService.confirmAttendance(sessionId, currentUserId);
            onAttendanceChange?.();
        } finally {
            setLoadingSession(null);
        }
    };

    const handleCancel = async (sessionId: string) => {
        setLoadingSession(sessionId);
        try {
            await ClubHubService.cancelAttendance(sessionId, currentUserId);
            onAttendanceChange?.();
        } finally {
            setLoadingSession(null);
        }
    };

    // Trainer availability display
    const getTrainerAvailability = (trainer: Trainer, date: Date): boolean => {
        return ClubHubService.isTrainerAvailable(trainer, date);
    };

    const formatDayName = (date: Date) => {
        return date.toLocaleDateString('es-ES', { weekday: 'short' });
    };

    const formatDayNum = (date: Date) => {
        return date.getDate();
    };

    const isToday = (date: Date) => {
        return date.toDateString() === new Date().toDateString();
    };

    const isSelected = (date: Date) => {
        return date.toDateString() === selectedDate.toDateString();
    };

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <motion.button
                        onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateDay('prev')}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white hover:border-cyan-500/50 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiChevronLeft size={20} />
                    </motion.button>

                    <div className="text-center min-w-[200px]">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {viewMode === 'week'
                                ? `${weekDays[0].toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
                                : selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
                            }
                        </h2>
                    </div>

                    <motion.button
                        onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateDay('next')}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white hover:border-cyan-500/50 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiChevronRight size={20} />
                    </motion.button>
                </div>



                {/* View Toggle */}
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                    {(['week', 'day'] as const).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-bold transition-all
                                ${viewMode === mode
                                    ? 'bg-cyan-500 text-black'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }
                            `}
                        >
                            {mode === 'week' ? 'Semana' : 'Día'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Week Day Selector (Week View) */}
            {
                viewMode === 'week' && (
                    <div className="grid grid-cols-7 gap-2">
                        {weekDays.map((day, idx) => (
                            <motion.button
                                key={idx}
                                onClick={() => setSelectedDate(day)}
                                className={`
                                py-3 px-2 rounded-xl text-center transition-all
                                ${isToday(day) ? 'ring-2 ring-cyan-500' : ''}
                                ${isSelected(day)
                                        ? 'bg-cyan-500 text-black'
                                        : 'bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 shadow-sm dark:shadow-none'
                                    }
                            `}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className={`text-xs font-bold uppercase ${isSelected(day) ? '' : 'text-slate-500'}`}>
                                    {formatDayName(day)}
                                </span>
                                <span className={`block text-xl font-black mt-1 ${isSelected(day) ? '' : 'text-slate-900 dark:text-white'}`}>
                                    {formatDayNum(day)}
                                </span>
                                {getSessionsForDate(day).length > 0 && (
                                    <span className={`
                                    block text-[10px] mt-1 font-bold
                                    ${isSelected(day) ? 'text-black/70' : 'text-cyan-400'}
                                `}>
                                        {getSessionsForDate(day).length} sesión{getSessionsForDate(day).length > 1 ? 'es' : ''}
                                    </span>
                                )}
                            </motion.button>
                        ))}
                    </div>
                )
            }

            {/* Trainer Availability (Selected Day) */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiUser size={12} />
                    Disponibilidad de Entrenadores
                </h3>
                <div className="flex flex-wrap gap-2">
                    {club.trainers.map(trainer => {
                        const isAvailable = getTrainerAvailability(trainer, selectedDate);
                        return (
                            <div
                                key={trainer.id}
                                className={`
                                    px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2
                                    ${isAvailable
                                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                                    }
                                `}
                            >
                                <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                                {trainer.name.split(' ')[0]}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sessions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="wait">
                    {getSessionsForDate(selectedDate).length > 0 ? (
                        getSessionsForDate(selectedDate).map((session, idx) => {
                            const trainer = club.trainers.find(t => t.id === session.trainerId);
                            const userAttendance = session.attendees.find(a => a.memberId === currentUserId);

                            return (
                                <SessionCard
                                    key={session.id}
                                    session={session}
                                    trainer={trainer}
                                    userAttendance={userAttendance}
                                    onConfirm={() => handleConfirm(session.id)}
                                    onCancel={() => handleCancel(session.id)}
                                    isLoading={loadingSession === session.id}
                                />
                            );
                        })
                    ) : (
                        <motion.div
                            className="col-span-full text-center py-16"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <FiCalendar className="mx-auto text-4xl text-slate-600 mb-4" />
                            <p className="text-slate-500 font-medium">No hay sesiones programadas para este día</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
};

export default SmartSchedule;
