import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiUsers, FiUser, FiRadio, FiCheck } from 'react-icons/fi';
import { Member } from '../../types/ClubTypes';

interface HUDAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (message: string, targetType: 'group' | 'individual', targetMemberId?: string) => void;
    members: Member[];
}

const HUDAlertModal: React.FC<HUDAlertModalProps> = ({ isOpen, onClose, onSend, members }) => {
    const [message, setMessage] = useState('');
    const [targetType, setTargetType] = useState<'group' | 'individual'>('group');
    const [selectedMember, setSelectedMember] = useState<string | null>(null);

    // Filter only connected members (with pod connected)
    const activeMembers = members.filter(m => m.podConnected);

    const handleSend = () => {
        if (!message.trim()) return;
        if (targetType === 'individual' && !selectedMember) return;

        onSend(message, targetType, selectedMember || undefined);
        setMessage('');
        setSelectedMember(null);
        onClose();
    };

    const handleClose = () => {
        setMessage('');
        setSelectedMember(null);
        setTargetType('group');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                        <FiRadio className="text-cyan-500" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900 dark:text-white">
                                            Enviar Alerta HUD
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Mensaje a dispositivos AeroVision
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <FiX className="text-slate-500" size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-5 space-y-5">
                                {/* Target Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                                        Destinatario
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setTargetType('group')}
                                            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3
                                                ${targetType === 'group'
                                                    ? 'border-cyan-500 bg-cyan-500/10'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                                ${targetType === 'group' ? 'bg-cyan-500 text-black' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                                <FiUsers size={18} />
                                            </div>
                                            <div className="text-left">
                                                <div className={`font-bold ${targetType === 'group' ? 'text-cyan-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    Grupo Completo
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    {activeMembers.length} conectados
                                                </div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setTargetType('individual')}
                                            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3
                                                ${targetType === 'individual'
                                                    ? 'border-cyan-500 bg-cyan-500/10'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                                ${targetType === 'individual' ? 'bg-cyan-500 text-black' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                                <FiUser size={18} />
                                            </div>
                                            <div className="text-left">
                                                <div className={`font-bold ${targetType === 'individual' ? 'text-cyan-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    Individual
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    Seleccionar miembro
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Member Selection (Individual Mode) */}
                                {targetType === 'individual' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                                            Seleccionar Miembro Activo
                                        </label>
                                        <div className="max-h-40 overflow-y-auto space-y-2 p-1">
                                            {activeMembers.length === 0 ? (
                                                <p className="text-sm text-slate-500 text-center py-4">
                                                    No hay miembros con POD conectado
                                                </p>
                                            ) : (
                                                activeMembers.map(member => (
                                                    <button
                                                        key={member.id}
                                                        onClick={() => setSelectedMember(member.id)}
                                                        className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all
                                                            ${selectedMember === member.id
                                                                ? 'bg-cyan-500/10 border-2 border-cyan-500'
                                                                : 'bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                                                            }`}
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                                                                {member.name}
                                                            </div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                                🔋 {member.neuralBattery}% • POD Conectado
                                                            </div>
                                                        </div>
                                                        {selectedMember === member.id && (
                                                            <FiCheck className="text-cyan-500" size={18} />
                                                        )}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Message Input */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Mensaje
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Escribe el mensaje para el HUD..."
                                        className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500 transition-colors"
                                        rows={3}
                                    />
                                </div>

                                {/* Quick Messages */}
                                <div className="flex flex-wrap gap-2">
                                    {['⏱️ 30s descanso', '💪 Último set!', '🚰 Hidratación', '⚠️ Postura'].map((msg) => (
                                        <button
                                            key={msg}
                                            onClick={() => setMessage(msg)}
                                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-500 transition-colors"
                                        >
                                            {msg}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {targetType === 'group'
                                        ? `Se enviará a ${activeMembers.length} dispositivos`
                                        : selectedMember
                                            ? `Se enviará a ${activeMembers.find(m => m.id === selectedMember)?.name}`
                                            : 'Selecciona un miembro'}
                                </span>
                                <motion.button
                                    onClick={handleSend}
                                    disabled={!message.trim() || (targetType === 'individual' && !selectedMember)}
                                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FiSend size={16} />
                                    Enviar Alerta
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default HUDAlertModal;
