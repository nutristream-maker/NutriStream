import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import { Button } from '../ui/Shared';

interface InjuryModalProps {
    isOpen: boolean;
    onClose: () => void;
    muscleName: string;
    onSave: (injury: {
        date: string;
        type: string;
        severity: 'leve' | 'moderada' | 'grave';
        status: 'activa' | 'recuperada';
        notes?: string;
    }) => void;
}

const InjuryModal: React.FC<InjuryModalProps> = ({ isOpen, onClose, muscleName, onSave }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: '',
        severity: 'leve' as 'leve' | 'moderada' | 'grave',
        status: 'activa' as 'activa' | 'recuperada',
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.type.trim()) {
            onSave(formData);
            onClose();
            // Reset form
            setFormData({
                date: new Date().toISOString().split('T')[0],
                type: '',
                severity: 'leve',
                status: 'activa',
                notes: ''
            });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                                        <FiAlertTriangle className="text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Registrar Lesión</h3>
                                        <p className="text-xs text-slate-500">{muscleName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <FiX className="text-slate-500" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        required
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Tipo de Lesión
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Contractura">Contractura</option>
                                        <option value="Desgarro">Desgarro</option>
                                        <option value="Tendinitis">Tendinitis</option>
                                        <option value="Esguince">Esguince</option>
                                        <option value="Sobrecarga">Sobrecarga</option>
                                        <option value="Distensión">Distensión</option>
                                        <option value="Otra">Otra</option>
                                    </select>
                                </div>

                                {/* Severity */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Severidad
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['leve', 'moderada', 'grave'].map((sev) => (
                                            <button
                                                key={sev}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, severity: sev as any })}
                                                className={`px-4 py-2 rounded-lg border-2 font-semibold capitalize transition-all ${formData.severity === sev
                                                        ? sev === 'leve' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-600'
                                                            : sev === 'moderada' ? 'border-orange-500 bg-orange-500/10 text-orange-600'
                                                                : 'border-red-500 bg-red-500/10 text-red-600'
                                                        : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                                                    }`}
                                            >
                                                {sev}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Estado
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['activa', 'recuperada'].map((st) => (
                                            <button
                                                key={st}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, status: st as any })}
                                                className={`px-4 py-2 rounded-lg border-2 font-semibold capitalize transition-all ${formData.status === st
                                                        ? st === 'activa' ? 'border-red-500 bg-red-500/10 text-red-600'
                                                            : 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                                                        : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                                                    }`}
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Notas (opcional)
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Detalles adicionales sobre la lesión..."
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={onClose}
                                        className="flex-1"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="flex-1"
                                    >
                                        Guardar Lesión
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default InjuryModal;
