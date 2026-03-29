import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockNotifications } from '../../data/mockData';
import { FiCheck, FiTrash2, FiBell, FiX, FiFilter, FiCheckCircle } from 'react-icons/fi';
import { Notification } from '../../types';

const NotificationDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications.map(n => ({ ...n, read: false }))); // Add local 'read' state mock
    const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'alerts'>('all');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'unread') return !n.read;
        if (activeTab === 'alerts') return n.type === 'alert' || n.title.toLowerCase().includes('alerta') || n.title.toLowerCase().includes('baja') || n.color.includes('red');
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-[4.5rem] left-4 right-4 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-3 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 ring-1 ring-black/5 origin-top sm:origin-top-right"
        >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        Notificaciones
                        {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={markAllAsRead} className="p-1.5 text-slate-400 hover:text-primary transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Marcar todas como leídas">
                            <FiCheckCircle size={16} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 text-xs font-semibold overflow-x-auto pb-1 scrollbar-hide">
                    <button onClick={() => setActiveTab('all')} className={`px-3 py-1.5 rounded-full transition-colors ${activeTab === 'all' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        Todas
                    </button>
                    <button onClick={() => setActiveTab('unread')} className={`px-3 py-1.5 rounded-full transition-colors ${activeTab === 'unread' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        No leídas
                    </button>
                    <button onClick={() => setActiveTab('alerts')} className={`px-3 py-1.5 rounded-full transition-colors ${activeTab === 'alerts' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        Alertas
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="max-h-[28rem] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                <AnimatePresence mode='popLayout'>
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif, i) => (
                            <motion.div
                                key={notif.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => markAsRead(notif.id)}
                                className={`relative flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-slate-100 dark:border-slate-800/50 transition-colors group ${!notif.read ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}
                            >
                                <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${notif.bg} transition-transform group-hover:scale-110`}>
                                    <div className={notif.color}><notif.icon /></div>
                                    {!notif.read && <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 border-2 border-white dark:border-slate-900 rounded-full" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className={`text-sm ${!notif.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>{notif.title}</p>
                                        <span className="text-[10px] text-slate-400 shrink-0">{notif.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{notif.message}</p>
                                </div>
                                <button
                                    onClick={(e) => deleteNotification(notif.id, e)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <FiX size={14} />
                                </button>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-12 px-6 text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
                                <FiBell size={32} />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">¡Estás al día!</p>
                            <p className="text-xs text-slate-400 mt-1">No tienes notificaciones en esta sección.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-center">
                <button className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">
                    Ver historial completo
                </button>
            </div>
        </motion.div>
    );
};

export default NotificationDropdown;
