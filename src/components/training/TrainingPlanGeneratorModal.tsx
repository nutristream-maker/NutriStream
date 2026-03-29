import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCpu, FiCalendar, FiTarget, FiCheck, FiLayers, FiActivity, FiZap } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

interface TrainingPlanGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TrainingFocus = 'balanced' | 'strength' | 'hypertrophy' | 'endurance';

const TrainingPlanGeneratorModal: React.FC<TrainingPlanGeneratorModalProps> = ({ isOpen, onClose }) => {
    const { t } = useLanguage(); // Ensure you have this or use a mock if context is missing in this file scope
    const [step, setStep] = useState<'input' | 'generating' | 'result'>('input');
    const [daysPerWeek, setDaysPerWeek] = useState<number>(3);
    const [focus, setFocus] = useState<TrainingFocus>('balanced');
    const [generatedPlan, setGeneratedPlan] = useState<any>(null);

    const handleGenerate = () => {
        setStep('generating');

        // Simulate AI Processing Time
        setTimeout(() => {
            const plan = generatePlanLogic(daysPerWeek, focus);
            setGeneratedPlan(plan);
            setStep('result');
        }, 2500);
    };

    const generatePlanLogic = (days: number, focus: TrainingFocus) => {
        // Core Logic requested by user
        let schedule = [];
        let name = "Custom Plan";
        let description = "Tailored to your availability.";

        if (days === 3) {
            name = "Classic PPL (Push/Pull/Legs)";
            description = "High intensity, equal development. Perfect for 3 days.";
            schedule = [
                { day: 'Day 1', focus: 'Push', muscles: 'Chest, Shoulders, Triceps', icon: FiZap },
                { day: 'Day 2', focus: 'Rest', muscles: 'Active Recovery', icon: FiActivity },
                { day: 'Day 3', focus: 'Pull', muscles: 'Back, Biceps, Rear Delts', icon: FiLayers },
                { day: 'Day 4', focus: 'Rest', muscles: 'Active Recovery', icon: FiActivity },
                { day: 'Day 5', focus: 'Legs', muscles: 'Quads, Hams, Glutes, Calves', icon: FiTarget },
                { day: 'Day 6', focus: 'Rest', muscles: 'Active Recovery', icon: FiActivity },
                { day: 'Day 7', focus: 'Rest', muscles: 'Full Rest', icon: FiActivity },
            ];
        } else if (days === 4) {
            name = "Upper / Lower Split";
            description = "Balanced frequency for strength and size.";
            schedule = [
                { day: 'Day 1', focus: 'Upper A', muscles: 'Chest, Back (Strength)', icon: FiLayers },
                { day: 'Day 2', focus: 'Lower A', muscles: 'Squat pattern, Quads', icon: FiTarget },
                { day: 'Day 3', focus: 'Rest', muscles: 'Recovery', icon: FiActivity },
                { day: 'Day 4', focus: 'Upper B', muscles: 'Shoulders, Arms (Hypertrophy)', icon: FiZap },
                { day: 'Day 5', focus: 'Lower B', muscles: 'Hinge pattern, Hamstrings', icon: FiTarget },
                { day: 'Day 6', focus: 'Rest', muscles: 'Active Recovery', icon: FiActivity },
                { day: 'Day 7', focus: 'Rest', muscles: 'Full Rest', icon: FiActivity },
            ];
        } else if (days === 5) {
            name = "Hybrid PPL + Upper/Lower";
            description = "High volume for advanced trainees.";
            schedule = [
                { day: 'Day 1', focus: 'Upper Power', muscles: 'Compound Upper Body', icon: FiZap },
                { day: 'Day 2', focus: 'Lower Power', muscles: 'Compound Lower Body', icon: FiTarget },
                { day: 'Day 3', focus: 'Push', muscles: 'Chest, Shoulders, Tri', icon: FiLayers },
                { day: 'Day 4', focus: 'Pull', muscles: 'Back, Bi', icon: FiLayers },
                { day: 'Day 5', focus: 'Legs', muscles: 'Legs Isolation', icon: FiTarget },
                { day: 'Day 6', focus: 'Rest', muscles: 'Recovery', icon: FiActivity },
                { day: 'Day 7', focus: 'Rest', muscles: 'Recovery', icon: FiActivity },
            ];
        } else {
            // Default / Fallback
            name = "General Physical Preparedness";
            description = "Keep moving and stay active.";
            schedule = Array(7).fill(null).map((_, i) => ({
                day: `Day ${i + 1}`,
                focus: i % 2 === 0 ? 'Full Body' : 'Rest',
                muscles: i % 2 === 0 ? 'General' : 'Recovery',
                icon: i % 2 === 0 ? FiZap : FiActivity
            }));
        }

        return { name, description, schedule };
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
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden pointer-events-auto border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh]">

                            {/* Header */}
                            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 tracking-tight flex items-center gap-2">
                                        <span className="text-indigo-500"><FiCpu /></span> AI Trainer
                                    </h2>
                                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Smart Program Generator</p>
                                </div>
                                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500">
                                    <FiX size={24} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-8 overflow-y-auto custom-scrollbar flex-grow">
                                {step === 'input' && (
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">

                                        {/* Days Input */}
                                        <div className="space-y-4">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <FiCalendar /> How many days/week can you train?
                                            </label>
                                            <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl">
                                                {[2, 3, 4, 5, 6].map((num) => (
                                                    <button
                                                        key={num}
                                                        onClick={() => setDaysPerWeek(num)}
                                                        className={`w-10 h-10 md:w-14 md:h-14 rounded-xl font-black text-lg md:text-xl transition-all ${daysPerWeek === num ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md scale-110 ring-2 ring-indigo-500' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        {num}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Focus Input */}
                                        <div className="space-y-4">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <FiTarget /> Primary Goal
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {(['balanced', 'strength', 'hypertrophy', 'endurance'] as TrainingFocus[]).map((f) => (
                                                    <button
                                                        key={f}
                                                        onClick={() => setFocus(f)}
                                                        className={`p-4 rounded-xl border-2 text-left transition-all ${focus === f ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-slate-100 dark:border-slate-700 hover:border-indigo-200'}`}
                                                    >
                                                        <span className="block font-bold capitalize text-sm">{f}</span>
                                                        <span className="text-[10px] text-slate-400 capitalize">Optimize for {f}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleGenerate}
                                            className="w-full py-4 mt-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                        >
                                            <FiCpu /> Generate Plan
                                        </button>
                                    </motion.div>
                                )}

                                {step === 'generating' && (
                                    <div className="flex flex-col items-center justify-center h-full py-12 space-y-6">
                                        <div className="relative w-24 h-24">
                                            <span className="absolute inset-0 border-4 border-indigo-100 dark:border-slate-700 rounded-full"></span>
                                            <span className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></span>
                                            <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
                                                <FiCpu size={32} />
                                            </div>
                                        </div>
                                        <div className="text-center space-y-2">
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Analyzing Biometrics...</h3>
                                            <p className="text-sm text-slate-500">Optimizing split for {daysPerWeek} days / {focus}</p>
                                        </div>
                                    </div>
                                )}

                                {step === 'result' && generatedPlan && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 text-center">
                                            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-300 mb-1">{generatedPlan.name}</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{generatedPlan.description}</p>
                                        </div>

                                        <div className="space-y-3">
                                            {generatedPlan.schedule.map((day: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${day.focus === 'Rest' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'}`}>
                                                        <day.icon />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{day.day}</span>
                                                            {day.focus !== 'Rest' && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Workout</span>}
                                                        </div>
                                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{day.focus}</h4>
                                                        <p className="text-xs text-slate-500 truncate">{day.muscles}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={onClose}
                                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            <span className="inline mr-2"><FiCheck /></span> Accept Plan
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TrainingPlanGeneratorModal;
