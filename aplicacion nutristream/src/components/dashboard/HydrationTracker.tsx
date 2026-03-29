import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDroplet, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { Card } from '../ui/Shared';
import confetti from 'canvas-confetti';

const HydrationTracker: React.FC = () => {
    const [intake, setIntake] = useState(0);
    const [goal, setGoal] = useState(2500); // Default goal
    const [recentAdded, setRecentAdded] = useState(0); // For undo functionality

    // Percentage for the visual bottle
    const percentage = Math.min((intake / goal) * 100, 100);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('ns_hydration');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                // Check if it's the same day
                if (new Date().toDateString() === data.date) {
                    setIntake(data.amount);
                    if (data.goal) setGoal(data.goal);
                } else {
                    // Reset for new day but keep goal
                    if (data.goal) setGoal(data.goal);
                }
            } catch (e) {
                console.error("Error parsing hydration data", e);
            }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('ns_hydration', JSON.stringify({
            date: new Date().toDateString(),
            amount: intake,
            goal: goal
        }));

        // Trigger confetti if goal reached for the first time in this session (simple check)
        // We use a small tolerance to avoid re-triggering on tiny updates or loads
        if (intake >= goal && intake - recentAdded < goal && recentAdded > 0) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [intake, goal, recentAdded]);

    const addWater = (amount: number) => {
        setRecentAdded(amount);
        setIntake(prev => prev + amount);
    };

    const undoLast = () => {
        if (recentAdded > 0) {
            setIntake(prev => Math.max(0, prev - recentAdded));
            setRecentAdded(0);
        }
    };

    return (
        <Card className="!p-0 relative overflow-hidden h-full min-h-[350px] border-none shadow-xl bg-white dark:bg-slate-800 flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-5 z-20 flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                        <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-500"><FiDroplet /></span>
                        Hidratación
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-1">Objetivo Diario</p>
                </div>
                <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                        <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{intake}</span>
                        <span className="text-xs text-slate-400">ml</span>
                    </div>
                    <p className="text-xs font-medium text-slate-400">/ {goal} ml</p>
                </div>
            </div>

            {/* Main Visual - The Bottle */}
            <div className="flex-grow relative flex items-center justify-center py-12 z-10">
                {/* Bottle Shape */}
                <div className="relative w-24 h-44 bg-slate-100 dark:bg-slate-700/50 rounded-[2rem] border-4 border-slate-200 dark:border-slate-600 overflow-hidden shadow-inner transform transition-transform hover:scale-105 duration-300">
                    {/* Water Level */}
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400"
                        initial={{ height: 0 }}
                        animate={{ height: `${percentage}%` }}
                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                    >
                        {/* Bubbles / Wave Effect */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-300/30 animate-pulse"></div>
                        {percentage < 100 && (
                            <div className="absolute top-0 w-full flex justify-center -mt-8">
                                <motion.div
                                    initial={{ y: 0, opacity: 0 }}
                                    animate={{ y: -20, opacity: [0, 1, 0] }}
                                    transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                                    className="text-blue-400"
                                >
                                    <FiDroplet size={12} />
                                </motion.div>
                            </div>
                        )}
                    </motion.div>

                    {/* Glass Glare */}
                    <div className="absolute top-4 right-3 w-2 h-32 bg-white/20 rounded-full blur-[1px]"></div>
                </div>

                {/* Percentage Badge */}
                <div className="absolute bottom-8 right-8 bg-white dark:bg-slate-700 shadow-lg px-3 py-1 rounded-full text-xs font-bold text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                    {Math.round(percentage)}%
                </div>
            </div>

            {/* Controls */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-100 dark:border-slate-700 z-20">
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => addWater(250)}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-600 transition-all active:scale-95 group"
                    >
                        <div className="text-blue-500 mb-1 group-hover:scale-110 transition-transform"><FiPlus /></div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">250ml</span>
                    </button>

                    <button
                        onClick={() => addWater(500)}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-600 transition-all active:scale-95 group"
                    >
                        <div className="text-blue-600 mb-1 group-hover:scale-110 transition-transform"><FiPlus size={18} /></div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">500ml</span>
                    </button>

                    <button
                        onClick={undoLast}
                        disabled={recentAdded === 0}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all active:scale-95 ${recentAdded > 0 ? 'bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-slate-200 dark:border-slate-600 text-slate-600' : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400 cursor-not-allowed'}`}
                    >
                        <div className="mb-1"><FiRefreshCw size={14} className={recentAdded > 0 ? '' : 'opacity-50'} /></div>
                        <span className="text-xs font-medium">Deshacer</span>
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default HydrationTracker;
