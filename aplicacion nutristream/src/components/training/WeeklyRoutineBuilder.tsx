import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiCalendar, FiClock, FiRepeat, FiCheck, FiX, FiSearch, FiFilter, FiCheckCircle } from 'react-icons/fi';
import { exerciseLibrary } from '../../data/ExerciseLibrary';
import { Card } from '../ui/Shared';

export interface WeeklyRoutine {
    [day: string]: SavedExercise[];
}

export interface ExerciseSet {
    id: string;
    reps: string;
    weight?: number;
    duration?: string;
}

export interface SavedExercise {
    id: string; // unique instance id
    exerciseId: number;
    sets: ExerciseSet[];
    notes?: string;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface WeeklyRoutineBuilderProps {
    routine: WeeklyRoutine;
    setRoutine: React.Dispatch<React.SetStateAction<WeeklyRoutine>>;
    forcedActiveDay?: string | null;
    onStartSession?: (day: string, exercises: SavedExercise[]) => void;
    isLive?: boolean;
}

export const WeeklyRoutineBuilder: React.FC<WeeklyRoutineBuilderProps> = ({ routine, setRoutine, forcedActiveDay, onStartSession, isLive }) => {
    const [activeDay, setActiveDay] = useState('Lunes');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Update active day if forced by parent component (e.g. when adding a template)
    useEffect(() => {
        if (forcedActiveDay) {
            setActiveDay(forcedActiveDay);
        }
    }, [forcedActiveDay]);

    // Load from LocalStorage on mount and listen for external changes
    useEffect(() => {
        const loadFromStorage = () => {
            const saved = localStorage.getItem('userWeeklyRoutine');
            if (saved) {
                setRoutine(JSON.parse(saved));
            }
        };

        loadFromStorage();

        // Listen for custom routineUpdated events (from template imports)
        window.addEventListener('routineUpdated', loadFromStorage)
        return () => window.removeEventListener('routineUpdated', loadFromStorage);
    }, []);

    useEffect(() => {
        localStorage.setItem('userWeeklyRoutine', JSON.stringify(routine));
    }, [routine]);

    const addExercise = (exerciseId: number) => {
        const initialSets: ExerciseSet[] = Array(3).fill(null).map((_, i) => ({
            id: Date.now().toString() + i,
            reps: '10-12',
            weight: 0,
            duration: '10 min'
        }));

        const newExercise: SavedExercise = {
            id: Date.now().toString(),
            exerciseId,
            sets: initialSets,
        };

        setRoutine(prev => ({
            ...prev,
            [activeDay]: [...(prev[activeDay] || []), newExercise]
        }));
        setIsAddModalOpen(false);
    };

    const removeExercise = (id: string) => {
        setRoutine(prev => ({
            ...prev,
            [activeDay]: prev[activeDay].filter(ex => ex.id !== id)
        }));
    };

    const addSet = (exerciseId: string) => {
        setRoutine(prev => ({
            ...prev,
            [activeDay]: prev[activeDay].map(ex => {
                if (ex.id !== exerciseId) return ex;
                const newSet: ExerciseSet = {
                    id: Date.now().toString(),
                    reps: '10',
                    weight: 0,
                    duration: '10 min'
                };
                return { ...ex, sets: [...ex.sets, newSet] };
            })
        }));
    };

    const removeSet = (exerciseId: string, setId: string) => {
        setRoutine(prev => ({
            ...prev,
            [activeDay]: prev[activeDay].map(ex => {
                if (ex.id !== exerciseId) return ex;
                return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
            })
        }));
    };

    const updateSet = (exerciseId: string, setId: string, field: keyof ExerciseSet, value: any) => {
        setRoutine(prev => ({
            ...prev,
            [activeDay]: prev[activeDay].map(ex => {
                if (ex.id !== exerciseId) return ex;
                return {
                    ...ex,
                    sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
                };
            })
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mi Rutina Semanal</h2>
                    <p className="text-slate-500 text-sm">Diseña tu plan de entrenamiento personalizado.</p>
                </div>
            </div>

            {/* Day Selector */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
                {DAYS.map(day => {
                    const count = routine[day]?.length || 0;
                    return (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`flex flex-col items-center min-w-[80px] p-3 rounded-2xl transition-all border ${activeDay === day
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300'
                                }`}
                        >
                            <span className="text-xs font-bold uppercase tracking-wider mb-1">{day.slice(0, 3)}</span>
                            {count > 0 && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeDay === day ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                    }`}>
                                    {count} Ej
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Active Day Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeDay}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                >
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <FiCalendar className="text-indigo-500" />
                            {activeDay}
                        </h3>
                        <div className="flex gap-2">
                            {onStartSession && !isLive && (routine[activeDay] || []).length > 0 && (
                                <button
                                    onClick={() => onStartSession(activeDay, routine[activeDay])}
                                    className="flex items-center gap-2 text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/30"
                                >
                                    <FiCheckCircle /> INICIAR SESIÓN
                                </button>
                            )}
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center gap-2 text-indigo-600 font-bold text-xs bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-colors dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40"
                            >
                                <FiPlus /> AÑADIR
                            </button>
                        </div>
                    </div>

                    {(routine[activeDay] || []).length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <FiCalendar size={32} />
                            </div>
                            <h4 className="text-slate-600 dark:text-slate-300 font-bold mb-2">Día de Descanso</h4>
                            <p className="text-slate-400 text-sm mb-6">No hay ejercicios programados para este día.</p>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
                            >
                                Diseñar Rutina
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {routine[activeDay].map((savedEx) => {
                                const originalEx = exerciseLibrary.find(e => e.id === savedEx.exerciseId);
                                if (!originalEx) return null;

                                return (
                                    <div key={savedEx.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-4">
                                        <div className="w-full sm:w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                                            <img src={originalEx.image} alt={originalEx.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{originalEx.name}</h4>
                                                    <p className="text-xs text-slate-500">{originalEx.muscle} • {originalEx.category}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeExercise(savedEx.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>

                                            <div className="space-y-2 w-full mt-2">
                                                <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 text-xs font-bold text-slate-500 px-2">
                                                    <span>SET</span>
                                                    {(originalEx.category === 'strength') ? (
                                                        <>
                                                            <span className="text-center">KG</span>
                                                            <span className="text-center">REPS</span>
                                                        </>
                                                    ) : (
                                                        <span className="col-span-2 text-center">TIEMPO / DISTANCIA</span>
                                                    )}
                                                    <span></span>
                                                </div>

                                                {savedEx.sets.map((set, index) => (
                                                    <div key={set.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center font-bold text-xs text-slate-500">
                                                            {index + 1}
                                                        </div>

                                                        {originalEx.category === 'strength' ? (
                                                            <>
                                                                <input
                                                                    type="number"
                                                                    value={set.weight || 0}
                                                                    onChange={(e) => updateSet(savedEx.id, set.id, 'weight', parseFloat(e.target.value))}
                                                                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2 text-center text-sm font-bold outline-none focus:border-indigo-500"
                                                                    placeholder="kg"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={set.reps}
                                                                    onChange={(e) => updateSet(savedEx.id, set.id, 'reps', e.target.value)}
                                                                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2 text-center text-sm font-bold outline-none focus:border-indigo-500"
                                                                    placeholder="Reps"
                                                                />
                                                            </>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                value={set.duration || ''}
                                                                onChange={(e) => updateSet(savedEx.id, set.id, 'duration', e.target.value)}
                                                                className="col-span-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2 text-center text-sm font-bold outline-none focus:border-indigo-500"
                                                                placeholder="10 min"
                                                            />
                                                        )}

                                                        <button
                                                            onClick={() => removeSet(savedEx.id, set.id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                                            title="Eliminar serie"
                                                        >
                                                            <FiX size={14} />
                                                        </button>
                                                    </div>
                                                ))}

                                                <button
                                                    onClick={() => addSet(savedEx.id)}
                                                    className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors border border-dashed border-indigo-200 dark:border-indigo-900/50 mt-2"
                                                >
                                                    <FiPlus size={12} /> AÑADIR SERIE
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Add Exercise Modal */}
            <AddExerciseModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSelect={addExercise}
            />
        </div>
    );
};

const AddExerciseModal: React.FC<{ isOpen: boolean; onClose: () => void; onSelect: (id: number) => void }> = ({ isOpen, onClose, onSelect }) => {
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    if (!isOpen) return null;

    const filtered = exerciseLibrary.filter(ex =>
        ex.name.toLowerCase().includes(search.toLowerCase()) &&
        (filterCategory === 'all' || ex.category === filterCategory)
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <h3 className="font-bold text-lg">Seleccionar Ejercicio</h3>
                    <button onClick={onClose}><FiX size={24} /></button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar ejercicios..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 text-sm overflow-x-auto pb-1 scrollbar-hide">
                        {['all', 'strength', 'cardio', 'flexibility', 'warmup'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-3 py-1.5 rounded-full capitalize transition-colors ${filterCategory === cat
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.map(ex => (
                        <div key={ex.id}
                            onClick={() => onSelect(ex.id)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group"
                        >
                            <img src={ex.image} alt={ex.name} className="w-16 h-16 rounded-lg object-cover bg-slate-200" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{ex.name}</h4>
                                <p className="text-xs text-slate-500 truncate capitalize">{ex.muscle} • {ex.category}</p>
                            </div>
                            <button className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <FiPlus />
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};
