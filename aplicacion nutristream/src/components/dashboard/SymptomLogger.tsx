import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiActivity, FiSmile, FiDroplet, FiBattery } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

interface SymptomLoggerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (symptoms: DailySymptoms) => void;
    initialData?: DailySymptoms;
}

export interface DailySymptoms {
    physical: string[];
    mood: string[];
    flow: 'light' | 'medium' | 'heavy' | 'none';
    energy: 'low' | 'medium' | 'high';
    notes: string;
}

const SymptomLogger: React.FC<SymptomLoggerProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const { t } = useLanguage();
    const [symptoms, setSymptoms] = useState<DailySymptoms>(initialData || {
        physical: [],
        mood: [],
        flow: 'none',
        energy: 'medium',
        notes: ''
    });

    const categories = {
        physical: ['Cramps', 'Bloating', 'Headache', 'Breast Tenderness', 'Back Pain', 'Acne'],
        mood: ['Happy', 'Irritable', 'Sad', 'Anxious', 'Calm', 'Energetic'],
        flow: ['none', 'light', 'medium', 'heavy'],
        energy: ['low', 'medium', 'high']
    };

    const toggleArrayItem = (category: 'physical' | 'mood', item: string) => {
        setSymptoms(prev => {
            const list = prev[category];
            if (list.includes(item)) {
                return { ...prev, [category]: list.filter(i => i !== item) };
            } else {
                return { ...prev, [category]: [...list, item] };
            }
        });
    };

    const handleSave = () => {
        onSave(symptoms);
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md safe-area-inset-bottom" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-900 w-[95%] sm:w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[75dvh] sm:max-h-[80vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10 shrink-0">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600 dark:text-pink-400">
                            <FiActivity />
                        </span>
                        Daily Check-in
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 touch-pan-y overscroll-contain">
                    {/* Energy Level */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                            <FiBattery /> Energy Level
                        </h4>
                        <div className="flex gap-2">
                            {categories.energy.map(level => (
                                <button
                                    key={level}
                                    onClick={() => setSymptoms(prev => ({ ...prev, energy: level as any }))}
                                    className={`flex-1 py-3 px-4 rounded-xl font-bold capitalize transition-all border-2 ${symptoms.energy === level
                                        ? level === 'high' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600'
                                            : level === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600'
                                                : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:border-slate-300'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Flow (only show if selected or imply phase?) -> Let's show always for logging */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                            <FiDroplet /> Menstrual Flow
                        </h4>
                        <div className="flex gap-2">
                            {categories.flow.map(level => (
                                <button
                                    key={level}
                                    onClick={() => setSymptoms(prev => ({ ...prev, flow: level as any }))}
                                    className={`flex-1 py-3 px-4 rounded-xl font-bold capitalize transition-all border-2 ${symptoms.flow === level
                                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600'
                                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:border-slate-300'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Physical Symptoms */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                            <FiActivity /> Physical Symptoms
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {categories.physical.map(symptom => (
                                <button
                                    key={symptom}
                                    onClick={() => toggleArrayItem('physical', symptom)}
                                    className={`py-2 px-4 rounded-full text-xs font-bold transition-all border ${symptoms.physical.includes(symptom)
                                        ? 'border-purple-500 bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-purple-300'
                                        }`}
                                >
                                    {symptom}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mood */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                            <FiSmile /> Mood
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {categories.mood.map(mood => (
                                <button
                                    key={mood}
                                    onClick={() => toggleArrayItem('mood', mood)}
                                    className={`py-2 px-4 rounded-full text-xs font-bold transition-all border ${symptoms.mood.includes(mood)
                                        ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300'
                                        }`}
                                >
                                    {mood}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Notes</h4>
                        <textarea
                            value={symptoms.notes}
                            onChange={(e) => setSymptoms(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-pink-500 min-h-[100px]"
                            placeholder="Any other details..."
                        />
                    </div>
                </div>

                <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
                    <button
                        onClick={handleSave}
                        className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <FiCheck className="stroke-2" /> Save Log
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default SymptomLogger;
