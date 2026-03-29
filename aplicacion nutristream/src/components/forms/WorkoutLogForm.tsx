import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiTrash2, FiClock, FiActivity, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { GiMuscleUp, GiWeightLiftingUp } from 'react-icons/gi';

interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight: number;
    unit: 'kg' | 'lb';
}

interface WorkoutLogFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: WorkoutData) => Promise<void>;
}

interface WorkoutData {
    date: string;
    duration: number;
    type: string;
    intensity: 'low' | 'medium' | 'high' | 'max';
    exercises: Exercise[];
    notes: string;
}

const exerciseLibrary = [
    'Press de Banca', 'Sentadilla', 'Peso Muerto', 'Press Militar',
    'Dominadas', 'Remo con Barra', 'Curl de Bíceps', 'Extensión de Tríceps',
    'Prensa de Piernas', 'Zancadas', 'Elevaciones Laterales', 'Fondos',
    'Hip Thrust', 'Plancha', 'Abdominales', 'Cardio'
];

const WorkoutLogForm: React.FC<WorkoutLogFormProps> = ({ isOpen, onClose, onSave }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [duration, setDuration] = useState(60);
    const [type, setType] = useState('Fuerza');
    const [intensity, setIntensity] = useState<'low' | 'medium' | 'high' | 'max'>('medium');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showExerciseSearch, setShowExerciseSearch] = useState(false);

    const filteredExercises = exerciseLibrary.filter(ex =>
        ex.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addExercise = (name: string) => {
        const newExercise: Exercise = {
            id: Date.now().toString(),
            name,
            sets: 3,
            reps: 10,
            weight: 0,
            unit: 'kg'
        };
        setExercises([...exercises, newExercise]);
        setShowExerciseSearch(false);
        setSearchTerm('');
    };

    const updateExercise = (id: string, field: keyof Exercise, value: any) => {
        setExercises(exercises.map(ex =>
            ex.id === id ? { ...ex, [field]: value } : ex
        ));
    };

    const removeExercise = (id: string) => {
        setExercises(exercises.filter(ex => ex.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (exercises.length === 0) return;

        setIsSubmitting(true);
        try {
            await onSave({
                date,
                duration,
                type,
                intensity,
                exercises,
                notes
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
                // Reset form
                setExercises([]);
                setNotes('');
                setDuration(60);
            }, 1500);
        } catch (err) {
            console.error('Error saving workout:', err);
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
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                <GiWeightLiftingUp className="text-white text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registrar Entrenamiento</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Añade los detalles de tu sesión</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
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
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">¡Entrenamiento guardado!</h3>
                                <p className="text-slate-500 dark:text-slate-400">Tu progreso ha sido registrado</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Date & Duration */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fecha</label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={e => setDate(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Duración (min)</label>
                                        <div className="relative">
                                            <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="number"
                                                value={duration}
                                                onChange={e => setDuration(Number(e.target.value))}
                                                min={1}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Type & Intensity */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo</label>
                                        <select
                                            value={type}
                                            onChange={e => setType(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        >
                                            <option>Fuerza</option>
                                            <option>Hipertrofia</option>
                                            <option>Cardio</option>
                                            <option>HIIT</option>
                                            <option>Flexibilidad</option>
                                            <option>Funcional</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Intensidad</label>
                                        <div className="flex gap-2">
                                            {(['low', 'medium', 'high', 'max'] as const).map(level => (
                                                <button
                                                    key={level}
                                                    type="button"
                                                    onClick={() => setIntensity(level)}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${intensity === level
                                                        ? level === 'low' ? 'bg-green-500 text-white'
                                                            : level === 'medium' ? 'bg-yellow-500 text-slate-900'
                                                                : level === 'high' ? 'bg-orange-500 text-white'
                                                                    : 'bg-red-500 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                        }`}
                                                >
                                                    {level === 'low' ? 'Baja' : level === 'medium' ? 'Media' : level === 'high' ? 'Alta' : 'Máx'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Exercises */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Ejercicios ({exercises.length})
                                    </label>

                                    {/* Exercise List */}
                                    <div className="space-y-3 mb-4">
                                        {exercises.map((exercise, index) => (
                                            <motion.div
                                                key={exercise.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs flex items-center justify-center font-bold">
                                                            {index + 1}
                                                        </span>
                                                        <span className="font-medium text-slate-900 dark:text-white">{exercise.name}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExercise(exercise.id)}
                                                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-4 gap-3">
                                                    <div>
                                                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Series</label>
                                                        <input
                                                            type="number"
                                                            value={exercise.sets}
                                                            onChange={e => updateExercise(exercise.id, 'sets', Number(e.target.value))}
                                                            min={1}
                                                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Reps</label>
                                                        <input
                                                            type="number"
                                                            value={exercise.reps}
                                                            onChange={e => updateExercise(exercise.id, 'reps', Number(e.target.value))}
                                                            min={1}
                                                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Peso</label>
                                                        <input
                                                            type="number"
                                                            value={exercise.weight}
                                                            onChange={e => updateExercise(exercise.id, 'weight', Number(e.target.value))}
                                                            min={0}
                                                            step={0.5}
                                                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Unidad</label>
                                                        <select
                                                            value={exercise.unit}
                                                            onChange={e => updateExercise(exercise.id, 'unit', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                                        >
                                                            <option value="kg">kg</option>
                                                            <option value="lb">lb</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Add Exercise */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowExerciseSearch(!showExerciseSearch)}
                                            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-cyan-500 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all flex items-center justify-center gap-2"
                                        >
                                            <FiPlus />
                                            Añadir ejercicio
                                        </button>

                                        {/* Exercise Search Dropdown */}
                                        <AnimatePresence>
                                            {showExerciseSearch && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xl z-10 overflow-hidden"
                                                >
                                                    <input
                                                        type="text"
                                                        value={searchTerm}
                                                        onChange={e => setSearchTerm(e.target.value)}
                                                        placeholder="Buscar ejercicio..."
                                                        className="w-full px-4 py-3 bg-transparent border-b border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                                                        autoFocus
                                                    />
                                                    <div className="max-h-48 overflow-y-auto">
                                                        {filteredExercises.map(ex => (
                                                            <button
                                                                key={ex}
                                                                type="button"
                                                                onClick={() => addExercise(ex)}
                                                                className="w-full px-4 py-2.5 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
                                                            >
                                                                <GiMuscleUp className="text-cyan-500 dark:text-cyan-400" />
                                                                {ex}
                                                            </button>
                                                        ))}
                                                        {filteredExercises.length === 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => addExercise(searchTerm)}
                                                                className="w-full px-4 py-3 text-left text-cyan-600 dark:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                                                            >
                                                                + Añadir "{searchTerm}" como nuevo ejercicio
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notas (opcional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="Cómo te sentiste, observaciones..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting || exercises.length === 0}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FiLoader className="animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <FiCheckCircle />
                                            Guardar Entrenamiento
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

export default WorkoutLogForm;
