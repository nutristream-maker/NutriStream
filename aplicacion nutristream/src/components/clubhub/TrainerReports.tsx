import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiFileText, FiUpload, FiBarChart2, FiUsers, FiActivity,
    FiTrendingUp, FiTrendingDown, FiCpu
} from 'react-icons/fi';
import { Club, Session, Member } from '../../types/ClubTypes';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend, LineChart, Line
} from 'recharts';

interface TrainerReportsProps {
    club: Club;
    sessions: Session[];
}

const TrainerReports: React.FC<TrainerReportsProps> = ({ club, sessions }) => {
    const [selectedSession, setSelectedSession] = useState<Session | null>(
        sessions.find(s => s.dateTime <= new Date()) || sessions[0]
    );
    const [reportNotes, setReportNotes] = useState('');

    // Generate mock Neural Battery comparison data
    const generateNBComparison = () => {
        const currentSession = selectedSession;
        const previousSession = sessions.find(s =>
            s.dateTime < (currentSession?.dateTime || new Date()) &&
            s.id !== currentSession?.id
        );

        return club.members.slice(0, 6).map(member => ({
            name: member.name.split(' ')[0],
            current: member.neuralBattery,
            previous: Math.max(40, member.neuralBattery + (Math.random() * 20 - 10)),
            fatigue: member.fatigueLevel || 0,
            podConnected: member.podConnected
        }));
    };

    const nbData = generateNBComparison();

    // Calculate group averages
    const avgCurrent = Math.round(nbData.reduce((a, b) => a + b.current, 0) / nbData.length);
    const avgPrevious = Math.round(nbData.reduce((a, b) => a + b.previous, 0) / nbData.length);
    const avgFatigue = Math.round(nbData.reduce((a, b) => a + b.fatigue, 0) / nbData.length);
    const trend = avgCurrent - avgPrevious;

    // Session history for trend chart
    const sessionTrendData = sessions.slice(0, 7).reverse().map((s, idx) => ({
        session: `S${idx + 1}`,
        avgNB: 65 + Math.random() * 25,
        attendance: s.attendees.filter(a => a.status === 'confirmed').length
    }));

    const handleUploadReport = () => {
        console.log('Uploading report:', {
            session: selectedSession?.id,
            notes: reportNotes,
            metrics: { avgCurrent, avgFatigue }
        });
        setReportNotes('');
    };

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    className="p-5 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-white dark:from-cyan-900/20 dark:to-slate-900/50 shadow-sm dark:shadow-none"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <FiActivity className="text-cyan-600 dark:text-cyan-400" size={20} />
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">NB Media Actual</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">{avgCurrent}%</span>
                        <span className={`text-sm font-bold flex items-center gap-1 ${trend >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                            {trend >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                            {Math.abs(trend).toFixed(1)}%
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    className="p-5 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-white dark:from-amber-900/20 dark:to-slate-900/50 shadow-sm dark:shadow-none"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <FiCpu className="text-amber-500 dark:text-amber-400" size={20} />
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Fatiga Media</span>
                    </div>
                    <span className="text-4xl font-black text-slate-900 dark:text-white">{avgFatigue}%</span>
                </motion.div>

                <motion.div
                    className="p-5 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-white dark:from-purple-900/20 dark:to-slate-900/50 shadow-sm dark:shadow-none"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <FiUsers className="text-purple-500 dark:text-purple-400" size={20} />
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Pods Conectados</span>
                    </div>
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                        {nbData.filter(m => m.podConnected).length}/{nbData.length}
                    </span>
                </motion.div>

                <motion.div
                    className="p-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-white dark:from-emerald-900/20 dark:to-slate-900/50 shadow-sm dark:shadow-none"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <FiFileText className="text-emerald-500 dark:text-emerald-400" size={20} />
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Sesiones Analizadas</span>
                    </div>
                    <span className="text-4xl font-black text-slate-900 dark:text-white">{sessions.length}</span>
                </motion.div>
            </div>

            {/* Neural Battery Comparison Chart */}
            <div className="p-6 rounded-2xl border border-cyan-500/20 bg-white dark:bg-slate-900/50 backdrop-blur-xl shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FiBarChart2 className="text-cyan-500 dark:text-cyan-400" />
                            Neural Battery™ - Comparativa
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Sesión actual vs. sesión anterior
                        </p>
                    </div>

                    {/* Session Selector */}
                    <select
                        value={selectedSession?.id || ''}
                        onChange={(e) => setSelectedSession(sessions.find(s => s.id === e.target.value) || null)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:border-cyan-500 outline-none"
                    >
                        {sessions.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.title} - {s.dateTime.toLocaleDateString('es-ES')}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={nbData} barGap={0} barCategoryGap="20%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{
                                    background: '#1e293b',
                                    border: '1px solid rgba(0,255,255,0.2)',
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                }}
                                labelStyle={{ color: '#e2e8f0' }}
                            />
                            <Legend />
                            <Bar
                                dataKey="current"
                                name="Sesión Actual"
                                fill="#00ffff"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="previous"
                                name="Sesión Anterior"
                                fill="#6366f1"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Fatigue Warning */}
                {avgFatigue > 25 && (
                    <motion.div
                        className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="text-sm font-bold text-amber-400">Fatiga elevada detectada</p>
                            <p className="text-xs text-amber-500/70">
                                {nbData.filter(m => m.fatigue > 25).length} atletas con fatiga &gt; 25%.
                                Considerar reducir intensidad.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Session Trend Chart */}
            <div className="p-6 rounded-2xl border border-cyan-500/20 bg-white dark:bg-slate-900/50 backdrop-blur-xl shadow-sm dark:shadow-none">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <FiTrendingUp className="text-emerald-500 dark:text-emerald-400" />
                    Tendencia de Rendimiento
                </h3>

                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sessionTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="session" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    background: '#1e293b',
                                    border: '1px solid rgba(0,255,255,0.2)',
                                    borderRadius: '12px'
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="avgNB"
                                name="NB Media"
                                stroke="#00ffff"
                                strokeWidth={2}
                                dot={{ fill: '#00ffff' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="attendance"
                                name="Asistencia"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={{ fill: '#f59e0b' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Upload Report Section */}
            <div className="p-6 rounded-2xl border border-cyan-500/20 bg-white dark:bg-slate-900/50 backdrop-blur-xl shadow-sm dark:shadow-none">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <FiUpload className="text-cyan-500 dark:text-cyan-400" />
                    Subir Informe de Sesión
                </h3>

                <textarea
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="Añade notas sobre la sesión, observaciones de rendimiento, recomendaciones..."
                    className="w-full h-32 p-4 bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 resize-none outline-none focus:border-cyan-500 transition-colors"
                />

                <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-slate-500">
                        Los datos de Neural Skin Pod se adjuntarán automáticamente
                    </p>
                    <motion.button
                        onClick={handleUploadReport}
                        disabled={!reportNotes.trim()}
                        className={`
                            px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2
                            ${reportNotes.trim()
                                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-black hover:from-cyan-400'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }
                        `}
                        whileHover={reportNotes.trim() ? { scale: 1.02 } : {}}
                        whileTap={reportNotes.trim() ? { scale: 0.98 } : {}}
                    >
                        <FiUpload size={16} />
                        Publicar Informe
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default TrainerReports;
