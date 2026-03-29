import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiLoader, FiHeart, FiMoon, FiZap, FiSmile } from 'react-icons/fi';

interface BiometricLogFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: BiometricData) => Promise<void>;
}

interface BiometricData {
    date: string;
    time: string;
    heartRate?: number;
    bloodPressure?: { systolic: number; diastolic: number };
    sleepHours?: number;
    sleepQuality?: 1 | 2 | 3 | 4 | 5;
    energyLevel?: 1 | 2 | 3 | 4 | 5;
    mood?: 1 | 2 | 3 | 4 | 5;
    notes?: string;
}

const BiometricLogForm: React.FC<BiometricLogFormProps> = ({ isOpen, onClose, onSave }) => {
    const now = new Date();
    const [date, setDate] = useState(now.toISOString().split('T')[0]);
    const [time, setTime] = useState(now.toTimeString().slice(0, 5));
    const [heartRate, setHeartRate] = useState<number | undefined>();
    const [systolic, setSystolic] = useState<number | undefined>();
    const [diastolic, setDiastolic] = useState<number | undefined>();
    const [sleepHours, setSleepHours] = useState<number | undefined>();
    const [sleepQuality, setSleepQuality] = useState<1 | 2 | 3 | 4 | 5 | undefined>();
    const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5 | undefined>();
    const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | undefined>();
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        try {
            await onSave({
                date,
                time,
                heartRate,
                bloodPressure: systolic && diastolic ? { systolic, diastolic } : undefined,
                sleepHours,
                sleepQuality,
                energyLevel,
                mood,
                notes: notes || undefined
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Error saving biometrics:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const RatingSelector = ({
        value,
        onChange,
        labels
    }: {
        value?: number;
        onChange: (v: 1 | 2 | 3 | 4 | 5) => void;
        labels: string[];
    }) => (
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(level => (
                <button
                    key={level}
                    type="button"
                    onClick={() => onChange(level as 1 | 2 | 3 | 4 | 5)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${value === level
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                >
                    {labels[level - 1]}
                </button>
            ))}
        </div>
    );

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
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <FiHeart className="text-white text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registrar Biométricos</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Salud y bienestar diario</p>
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
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">¡Datos guardados!</h3>
                                <p className="text-slate-500 dark:text-slate-400">Tu registro de salud ha sido actualizado</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fecha</label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={e => setDate(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Hora</label>
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={e => setTime(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                </div>

                                {/* Heart Rate */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                        <FiHeart className="text-red-500 dark:text-red-400" />
                                        Frecuencia Cardíaca (BPM)
                                    </label>
                                    <input
                                        type="number"
                                        value={heartRate || ''}
                                        onChange={e => setHeartRate(e.target.value ? Number(e.target.value) : undefined)}
                                        placeholder="ej: 72"
                                        min={30}
                                        max={220}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>

                                {/* Blood Pressure */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Presión Arterial (mmHg)
                                    </label>
                                    <div className="flex gap-3 items-center">
                                        <input
                                            type="number"
                                            value={systolic || ''}
                                            onChange={e => setSystolic(e.target.value ? Number(e.target.value) : undefined)}
                                            placeholder="Sistólica"
                                            min={70}
                                            max={200}
                                            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                        <span className="text-slate-400 dark:text-slate-500">/</span>
                                        <input
                                            type="number"
                                            value={diastolic || ''}
                                            onChange={e => setDiastolic(e.target.value ? Number(e.target.value) : undefined)}
                                            placeholder="Diastólica"
                                            min={40}
                                            max={130}
                                            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                </div>

                                {/* Sleep */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                        <FiMoon className="text-indigo-500 dark:text-indigo-400" />
                                        Horas de Sueño
                                    </label>
                                    <input
                                        type="number"
                                        value={sleepHours || ''}
                                        onChange={e => setSleepHours(e.target.value ? Number(e.target.value) : undefined)}
                                        placeholder="ej: 7.5"
                                        min={0}
                                        max={24}
                                        step={0.5}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>

                                {/* Sleep Quality */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Calidad del Sueño</label>
                                    <RatingSelector
                                        value={sleepQuality}
                                        onChange={setSleepQuality}
                                        labels={['Muy Mal', 'Mal', 'Regular', 'Bien', 'Excelente']}
                                    />
                                </div>

                                {/* Energy Level */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                        <FiZap className="text-yellow-500 dark:text-yellow-400" />
                                        Nivel de Energía
                                    </label>
                                    <RatingSelector
                                        value={energyLevel}
                                        onChange={setEnergyLevel}
                                        labels={['Agotado', 'Bajo', 'Normal', 'Alto', 'Máximo']}
                                    />
                                </div>

                                {/* Mood */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                        <FiSmile className="text-green-500 dark:text-green-400" />
                                        Estado de Ánimo
                                    </label>
                                    <RatingSelector
                                        value={mood}
                                        onChange={setMood}
                                        labels={['😢', '😕', '😐', '🙂', '😄']}
                                    />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Notas <span className="text-slate-400 dark:text-slate-500">- opcional</span>
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="Cómo te sientes hoy, síntomas..."
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold hover:from-violet-400 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FiLoader className="animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <FiCheckCircle />
                                            Guardar Registro
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

export default BiometricLogForm;
