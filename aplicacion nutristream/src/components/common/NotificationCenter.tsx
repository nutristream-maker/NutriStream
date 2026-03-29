import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck, FiTrash2, FiX, FiSettings, FiExternalLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    NotificationPayload,
    NotificationType
} from '../../services/NotificationService';

const typeIcons: Record<NotificationType, string> = {
    info: '💡',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    achievement: '🏆',
    challenge: '⚔️',
    reminder: '⏰',
};

const typeBgColors: Record<NotificationType, string> = {
    info: 'bg-blue-50 dark:bg-blue-900/20',
    success: 'bg-emerald-50 dark:bg-emerald-900/20',
    warning: 'bg-amber-50 dark:bg-amber-900/20',
    error: 'bg-red-50 dark:bg-red-900/20',
    achievement: 'bg-purple-50 dark:bg-purple-900/20',
    challenge: 'bg-indigo-50 dark:bg-indigo-900/20',
    reminder: 'bg-cyan-50 dark:bg-cyan-900/20',
};

interface NotificationCenterProps {
    className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Load notifications
    const loadNotifications = () => {
        setNotifications(getNotifications());
        setUnreadCount(getUnreadCount());
    };

    useEffect(() => {
        loadNotifications();

        // Refresh every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = (id: string) => {
        markAsRead(id);
        loadNotifications();
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
        loadNotifications();
    };

    const handleDelete = (id: string) => {
        deleteNotification(id);
        loadNotifications();
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        return `${days}d`;
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                <FiBell size={20} />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold">Notificaciones</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                        <FiCheck size={12} /> Marcar todas
                                    </button>
                                )}
                                <Link
                                    to="/perfil"
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <FiSettings size={16} />
                                </Link>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <motion.div
                                        key={notif.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={`p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${typeBgColors[notif.type]}`}>
                                                {typeIcons[notif.type]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm font-medium ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <span className="text-xs text-slate-400 whitespace-nowrap">
                                                        {formatTime(notif.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                {notif.action && (
                                                    <Link
                                                        to={notif.action.url}
                                                        className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        {notif.action.label} <FiExternalLink size={10} />
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {!notif.read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notif.id)}
                                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                                                        title="Marcar como leída"
                                                    >
                                                        <FiCheck size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notif.id)}
                                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400">
                                    <FiBell size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No tienes notificaciones</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
                                <Link
                                    to="/perfil"
                                    className="text-sm text-primary hover:underline"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Ver todas las notificaciones
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
