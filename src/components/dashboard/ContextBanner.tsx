import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon, FiSunrise, FiSunset, FiCoffee, FiArrowRight } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

import { useTimeContext, TimeContext } from '../../services/TimeContextService';

const contextIcons: Record<TimeContext, React.ElementType> = {
    morning: FiSunrise,
    midday: FiSun,
    afternoon: FiCoffee,
    evening: FiSunset,
    night: FiMoon,
};

const contextGradients: Record<TimeContext, string> = {
    morning: 'from-amber-400 via-orange-500 to-yellow-400',
    midday: 'from-sky-400 via-blue-500 to-cyan-400',
    afternoon: 'from-orange-400 via-amber-500 to-yellow-500',
    evening: 'from-purple-500 via-pink-500 to-rose-500',
    night: 'from-indigo-600 via-purple-700 to-slate-800',
};

const ContextBanner: React.FC = () => {
    const timeContext = useTimeContext();
    const navigate = useNavigate();
    const Icon = contextIcons[timeContext.context];
    const gradient = contextGradients[timeContext.context];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${gradient} p-6 text-white shadow-xl`}
        >
            {/* Animated background elements */}
            <motion.div
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-xl"
            />
            <motion.div
                animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-xl"
            />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                    >
                        <Icon size={28} />
                    </motion.div>
                    <div>
                        <h2 className="text-2xl font-bold">{timeContext.greeting}</h2>
                        <p className="text-white/80 text-sm mt-1">{timeContext.focusMessage}</p>
                    </div>
                </div>

                {/* Suggested Actions */}
                <div className="flex flex-wrap gap-2">
                    {timeContext.suggestedActions.slice(0, 2).map((action, idx) => (
                        <motion.button
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(action.path)}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                            {action.label}
                            <FiArrowRight size={14} />
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Priority Widget Hint */}
            {timeContext.prioritizedWidgets[0] && (
                <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-sm text-white/80">
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
                        Recomendado
                    </span>
                    <span>{timeContext.prioritizedWidgets[0].reason}</span>
                </div>
            )}
        </motion.div>
    );
};

export default ContextBanner;
