import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiLoader, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { GiBodyBalance } from 'react-icons/gi';

interface WeightLogFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: WeightData) => Promise<void>;
    previousWeight?: number;
}

interface WeightData {
    date: string;
    weight: number;
    unit: 'kg' | 'lb';
    bodyFat?: number;
    measurements?: {
        waist?: number;
        chest?: number;
        hips?: number;
        arms?: number;
        thighs?: number;
    };
    notes?: string;
}

const WeightLogForm: React.FC<WeightLogFormProps> = ({ isOpen, onClose, onSave, previousWeight = 0 }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [weight, setWeight] = useState<number>(previousWeight || 70);
    const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
    const [bodyFat, setBodyFat] = useState<number | undefined>();
    const [showMeasurements, setShowMeasurements] = useState(false);
    const [measurements, setMeasurements] = useState({
        waist: undefined as number | undefined,
        chest: undefined as number | undefined,
        hips: undefined as number | undefined,
        arms: undefined as number | undefined,
        thighs: undefined as number | undefined
    });
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const weightDiff = previousWeight ? weight - previousWeight : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!weight) return;

        setIsSubmitting(true);
        try {
            await onSave({
                date,
                weight,
                unit,
                bodyFat,
                measurements: showMeasurements ? measurements : undefined,
                notes: notes || undefined
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Error saving weight:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <GiBodyBalance className="text-white text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registrar Peso</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Seguimiento de tu composición</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12"
                            >
                                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                    <FiCheckCircle className="text-4xl text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">¡Peso registrado!</h3>
                                <p className="text-slate-500 dark:text-slate-400">Tu progreso ha sido guardado</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fecha</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                {/* Weight Input with Slider */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Peso</label>
                                    <div className="flex gap-3">
                                        <div className="flex-1 relative">
                                            <input
                                                type="number"
                                                value={weight}
                                                onChange={e => setWeight(Number(e.target.value))}
                                                step={0.1}
                                                min={20}
                                                max={300}
                                                className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                            {previousWeight > 0 && weightDiff !== 0 && (
                                                <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${weightDiff > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                                    }`}>
                                                    {weightDiff > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                                                    {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)}
                                                </div>
                                            )}
                                        </div>
                                        <select
                                            value={unit}
                                            onChange={e => setUnit(e.target.value as 'kg' | 'lb')}
                                            className="w-20 px-3 py-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="kg">kg</option>
                                            <option value="lb">lb</option>
                                        </select>
                                    </div>
                                    <input
                                        type="range"
                                        value={weight}
                                        onChange={e => setWeight(Number(e.target.value))}
                                        min={30}
                                        max={200}
                                        step={0.1}
                                        className="w-full mt-3 accent-emerald-500"
                                    />
                                </div>

                                {/* Body Fat */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Grasa Corporal (%) <span className="text-slate-400 dark:text-slate-500">- opcional</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={bodyFat || ''}
                                        onChange={e => setBodyFat(e.target.value ? Number(e.target.value) : undefined)}
                                        step={0.1}
                                        min={3}
                                        max={60}
                                        placeholder="ej: 15.5"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                {/* Measurements Toggle */}
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setShowMeasurements(!showMeasurements)}
                                        className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                                    >
                                        {showMeasurements ? '− Ocultar medidas' : '+ Añadir medidas corporales'}
                                    </button>

                                    <AnimatePresence>
                                        {showMeasurements && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 grid grid-cols-2 gap-3"
                                            >
                                                {[
                                                    { key: 'waist', label: 'Cintura' },
                                                    { key: 'chest', label: 'Pecho' },
                                                    { key: 'hips', label: 'Caderas' },
                                                    { key: 'arms', label: 'Brazos' },
                                                    { key: 'thighs', label: 'Muslos' }
                                                ].map(({ key, label }) => (
                                                    <div key={key}>
                                                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{label} (cm)</label>
                                                        <input
                                                            type="number"
                                                            value={(measurements as any)[key] || ''}
                                                            onChange={e => setMeasurements(prev => ({
                                                                ...prev,
                                                                [key]: e.target.value ? Number(e.target.value) : undefined
                                                            }))}
                                                            placeholder="--"
                                                            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                        />
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Notas <span className="text-slate-400 dark:text-slate-500">- opcional</span>
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="Observaciones, cómo te sientes..."
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !weight}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold hover:from-emerald-400 hover:to-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FiLoader className="animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <FiCheckCircle />
                                            Guardar Peso
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WeightLogForm;
