
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiActivity, FiClock, FiMapPin, FiZap, FiFileText, FiSave, FiCheckCircle } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

interface ActivityLogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ActivityLogModal: React.FC<ActivityLogModalProps> = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const [activityType, setActivityType] = useState('running');
    const [duration, setDuration] = useState('');
    const [distance, setDistance] = useState('');
    const [calories, setCalories] = useState('');
    const [rpe, setRpe] = useState(5); // Rate of Perceived Exertion (1-10)
    const [notes, setNotes] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would normally save to backend
        console.log({ activityType, duration, distance, calories, rpe, notes });
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            onClose();
        }, 1500);
    };

    const activities = [
        { id: 'running', label: 'Running', icon: FiActivity, color: 'bg-orange-500' },
        { id: 'cycling', label: 'Cycling', icon: FiMapPin, color: 'bg-blue-500' },
        { id: 'weights', label: 'Weights', icon: FiZap, color: 'bg-indigo-500' },
        { id: 'yoga', label: 'Yoga', icon: FiActivity, color: 'bg-teal-500' },
        { id: 'swimming', label: 'Swimming', icon: FiActivity, color: 'bg-cyan-500' },
    ];

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
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto border border-slate-200 dark:border-slate-700">
                            {/* Header */}
                            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Log Activity</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Track your progress manually</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {/* Type Selector */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Activity Type</label>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                        {activities.map((act) => (
                                            <button
                                                key={act.id}
                                                type="button"
                                                onClick={() => setActivityType(act.id)}
                                                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all border-2 ${activityType === act.id
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                                        : 'border-transparent bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                <act.icon size={20} />
                                                <span className="text-[10px] font-bold">{act.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Duration */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Duration</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                placeholder="00"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                                <FiClock />
                                            </div>
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">min</span>
                                        </div>
                                    </div>

                                    {/* Calories */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Calories</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={calories}
                                                onChange={(e) => setCalories(e.target.value)}
                                                placeholder="000"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                                            />
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400">
                                                <FiZap />
                                            </div>
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">kcal</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Conditional Distance */}
                                {(activityType === 'running' || activityType === 'cycling' || activityType === 'swimming') && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Distance</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={distance}
                                                onChange={(e) => setDistance(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400">
                                                <FiMapPin />
                                            </div>
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">km</span>
                                        </div>
                                    </div>
                                )}

                                {/* RPE Slider */}
                                <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Intensity (RPE)</label>
                                        <span className="text-sm font-black text-indigo-500">{rpe} / 10</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={rpe}
                                        onChange={(e) => setRpe(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <span>Light</span>
                                        <span>Moderate</span>
                                        <span>Max Effort</span>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Session Notes</label>
                                    <div className="relative">
                                        <textarea
                                            rows={3}
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="How did you feel? Focus points..."
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        />
                                        <div className="absolute left-3.5 top-3.5 text-slate-400">
                                            <FiFileText />
                                        </div>
                                    </div>
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                <button
                                    onClick={handleSubmit}
                                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl transform active:scale-95 text-white ${isSaved ? 'bg-green-500 shadow-green-500/30' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/40'}`}
                                >
                                    {isSaved ? <><FiCheckCircle /> Saved!</> : <><FiSave /> Save Activity</>}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ActivityLogModal;
