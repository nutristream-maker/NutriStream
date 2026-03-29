import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch, FiUserPlus } from 'react-icons/fi';
import { LeagueColors } from '../../types/SocialTypes';

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserSelect: (userId: string) => void;
}

// Mock users to select from
const SUGGESTED_USERS = [
    { id: 'u-2', name: 'Carlos García', avatar: 'https://randomuser.me/api/portraits/men/2.jpg', league: 'diamond' as const, status: 'En línea' },
    { id: 'u-3', name: 'Elena Pérez', avatar: 'https://randomuser.me/api/portraits/women/3.jpg', league: 'platinum' as const, status: 'Hace 1h' },
    { id: 'u-6', name: 'Sofia Rodriguez', avatar: 'https://randomuser.me/api/portraits/women/8.jpg', league: 'gold' as const, status: 'En línea' },
    { id: 'u-7', name: 'David Kim', avatar: 'https://randomuser.me/api/portraits/men/12.jpg', league: 'elite' as const, status: 'En línea' },
    { id: 'u-8', name: 'Ana Silva', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', league: 'silver' as const, status: 'Hace 2d' },
];

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, onUserSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = SUGGESTED_USERS.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-700 shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[80vh]">
                            {/* Header */}
                            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Nuevo Mensaje</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="p-4 pb-2">
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Buscar usuario..."
                                        className="w-full bg-slate-800 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-cyan-500 focus:outline-none"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* User List */}
                            <div className="flex-1 overflow-y-auto p-2">
                                <div className="space-y-1">
                                    {filteredUsers.map(user => {
                                        const league = LeagueColors[user.league];
                                        return (
                                            <button
                                                key={user.id}
                                                onClick={() => onUserSelect(user.id)}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors text-left group"
                                            >
                                                <div className={`relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-br ${league.gradient}`}>
                                                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover border-2 border-slate-900" />
                                                    {user.status === 'En línea' && (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{user.name}</h4>
                                                    <p className="text-xs text-slate-400">{user.status}</p>
                                                </div>
                                                <div className="p-2 rounded-full bg-slate-800 text-slate-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                                                    <FiUserPlus size={18} />
                                                </div>
                                            </button>
                                        );
                                    })}
                                    {filteredUsers.length === 0 && (
                                        <div className="text-center py-8 text-slate-500">
                                            No se encontraron usuarios
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NewChatModal;
