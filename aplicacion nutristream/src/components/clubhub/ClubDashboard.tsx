import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiMessageCircle, FiAlertCircle, FiInfo, FiAlertTriangle,
    FiSend, FiEye, FiClock
} from 'react-icons/fi';
import { Club, Announcement } from '../../types/ClubTypes';
import { ClubHubService } from '../../services/ClubHubService';
import CPIWidget from './CPIWidget';

interface ClubDashboardProps {
    club: Club;
    isTrainer?: boolean;
}

const ClubDashboard: React.FC<ClubDashboardProps> = ({ club, isTrainer = false }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>(club.announcements);
    const [newAnnouncement, setNewAnnouncement] = useState('');
    const [isHUDAlert, setIsHUDAlert] = useState(false);

    const priorityConfig = {
        low: { icon: FiInfo, bg: 'bg-slate-800/50', border: 'border-slate-600/30', text: 'text-slate-400' },
        medium: { icon: FiMessageCircle, bg: 'bg-cyan-900/30', border: 'border-cyan-500/30', text: 'text-cyan-400' },
        high: { icon: FiAlertCircle, bg: 'bg-amber-900/30', border: 'border-amber-500/30', text: 'text-amber-400' },
        urgent: { icon: FiAlertTriangle, bg: 'bg-red-900/30', border: 'border-red-500/30', text: 'text-red-400' }
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Hace unos minutos';
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays === 1) return 'Ayer';
        return `Hace ${diffDays} días`;
    };

    const handleSendAnnouncement = async () => {
        if (!newAnnouncement.trim()) return;

        const announcement: Announcement = {
            id: `ann-${Date.now()}`,
            clubId: club.id,
            authorId: 'current-user',
            authorName: isTrainer ? 'Entrenador' : 'Staff',
            authorRole: isTrainer ? 'trainer' : 'staff',
            title: isHUDAlert ? '📢 Aviso HUD' : '📣 Nuevo Aviso',
            content: newAnnouncement,
            priority: isHUDAlert ? 'high' : 'medium',
            createdAt: new Date(),
            isHUDAlert
        };

        setAnnouncements([announcement, ...announcements]);
        setNewAnnouncement('');
        setIsHUDAlert(false);

        if (isHUDAlert) {
            await ClubHubService.sendHUDAlert(club.id, newAnnouncement);
        }
    };

    // Stats
    const confirmedToday = club.sessions
        .filter(s => s.dateTime.toDateString() === new Date().toDateString())
        .reduce((acc, s) => acc + s.attendees.filter(a => a.status === 'confirmed').length, 0);

    const totalMembers = club.members.length;
    const avgNeuralBattery = Math.round(
        club.members.reduce((acc, m) => acc + m.neuralBattery, 0) / totalMembers
    );
    const connectedPods = club.members.filter(m => m.podConnected).length;

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Miembros', value: totalMembers, icon: '👥', bgClass: 'bg-cyan-900/20 border-cyan-500/20' },
                    { label: 'Confirmados Hoy', value: confirmedToday, icon: '✅', bgClass: 'bg-emerald-900/20 border-emerald-500/20' },
                    { label: 'Neural Battery Media', value: `${avgNeuralBattery}%`, icon: '🔋', bgClass: 'bg-amber-900/20 border-amber-500/20' },
                    { label: 'Pods Conectados', value: connectedPods, icon: '📡', bgClass: 'bg-purple-900/20 border-purple-500/20' },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        className={`p-4 rounded-xl border ${stat.bgClass} backdrop-blur-sm shadow-sm dark:shadow-none bg-white dark:bg-transparent`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-2xl">{stat.icon}</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CPI Widget */}
                <div className="lg:col-span-1">
                    <CPIWidget cpi={club.cpi} clubName={club.name} />
                </div>

                {/* Announcement Feed */}
                <div className="lg:col-span-2">
                    <div className="p-6 rounded-2xl border border-cyan-500/20 bg-white dark:bg-slate-900/50 backdrop-blur-xl dark:border-cyan-500/20 shadow-sm dark:shadow-none">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiMessageCircle className="text-cyan-500 dark:text-cyan-400" />
                            Tablón de Anuncios
                        </h3>

                        {/* New Announcement (Trainer Only) */}
                        {isTrainer && (
                            <div className="mb-6 p-4 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5">
                                <textarea
                                    value={newAnnouncement}
                                    onChange={(e) => setNewAnnouncement(e.target.value)}
                                    placeholder="Escribe un aviso para el grupo..."
                                    className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-500 resize-none outline-none text-sm"
                                    rows={2}
                                />
                                <div className="flex items-center justify-between mt-3">
                                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isHUDAlert}
                                            onChange={(e) => setIsHUDAlert(e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                                        />
                                        <FiEye size={14} />
                                        Enviar a AeroVision HUD
                                    </label>
                                    <motion.button
                                        onClick={handleSendAnnouncement}
                                        className="px-4 py-2 bg-cyan-500 text-black font-bold text-sm rounded-lg flex items-center gap-2 hover:bg-cyan-400 transition-colors"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <FiSend size={14} />
                                        Publicar
                                    </motion.button>
                                </div>
                            </div>
                        )}

                        {/* Announcements List */}
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {announcements.map((ann, idx) => {
                                const config = priorityConfig[ann.priority];
                                const Icon = config.icon;

                                return (
                                    <motion.div
                                        key={ann.id}
                                        className={`p-4 rounded-xl border ${config.bg} ${config.border}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${config.bg} ${config.text}`}>
                                                <Icon size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                                        {ann.title}
                                                    </h4>
                                                    {ann.isHUDAlert && (
                                                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold rounded-full">
                                                            HUD
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                                    {ann.content}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                                    <span>{ann.authorName}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <FiClock size={10} />
                                                        {formatTimeAgo(ann.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClubDashboard;
