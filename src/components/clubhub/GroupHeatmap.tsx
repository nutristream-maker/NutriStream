import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiAlertTriangle, FiRotateCw } from 'react-icons/fi';
import { GroupFatigueData } from '../../types/ClubTypes';
import { ClubHubService } from '../../services/ClubHubService';
import GroupBodyVisualizer from './GroupBodyVisualizer'; // Import new component

interface GroupHeatmapProps {
    clubId: string;
}

const GroupHeatmap: React.FC<GroupHeatmapProps> = ({ clubId }) => {
    const [fatigueData, setFatigueData] = useState<GroupFatigueData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
    const [view, setView] = useState<'front' | 'back'>('front'); // Add view state

    useEffect(() => {
        loadFatigueData();
    }, [clubId]);

    const loadFatigueData = async () => {
        setIsLoading(true);
        try {
            const data = await ClubHubService.getGroupFatigueData(clubId);
            setFatigueData(data);
        } finally {
            setIsLoading(false);
        }
    };

    const getFatigueColor = (fatigue: number): string => {
        if (fatigue >= 40) return '#ef4444'; // Red - High fatigue
        if (fatigue >= 25) return '#f59e0b'; // Amber - Medium fatigue
        if (fatigue >= 10) return '#22c55e'; // Green - Low fatigue
        return '#06b6d4'; // Cyan - Minimal fatigue
    };





    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Find highest fatigue areas
    const highFatigueAreas = fatigueData.filter(d => d.averageFatigue >= 30);

    return (
        <div className="p-6 rounded-2xl border border-cyan-500/20 bg-white dark:bg-slate-900/50 backdrop-blur-xl shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FiUsers className="text-cyan-600 dark:text-cyan-400" />
                        Mapa de Fatiga del Grupo
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Media de fatiga neuromuscular de todos los miembros
                    </p>
                </div>
                <motion.button
                    onClick={loadFatigueData}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white hover:border-cyan-500/50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Actualizar
                </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Body Visualization */}
                <div className="relative flex flex-col items-center">
                    {/* View Toggle */}
                    <button
                        onClick={() => setView(v => v === 'front' ? 'back' : 'front')}
                        className="mb-4 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:text-cyan-500 flex items-center gap-2 transition-all"
                    >
                        <FiRotateCw />
                        {view === 'front' ? 'Vista Frontal' : 'Vista Trasera'}
                    </button>

                    <div className="relative w-full max-w-[300px]">
                        <GroupBodyVisualizer
                            data={fatigueData}
                            view={view}
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Fatigue List */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Detalle por Zona
                    </h4>

                    {fatigueData
                        .sort((a, b) => b.averageFatigue - a.averageFatigue)
                        .map((muscle, idx) => (
                            <motion.div
                                key={muscle.muscleId}
                                className={`
                                    p-3 rounded-xl border flex items-center gap-3
                                    ${muscle.averageFatigue >= 30
                                        ? 'bg-red-500/10 border-red-500/20'
                                        : muscle.averageFatigue >= 20
                                            ? 'bg-amber-500/10 border-amber-500/20'
                                            : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50'
                                    }
                                `}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onMouseEnter={() => setHoveredMuscle(muscle.muscleId)}
                                onMouseLeave={() => setHoveredMuscle(null)}
                            >
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: getFatigueColor(muscle.averageFatigue) }}
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{muscle.muscleName}</p>
                                    <p className="text-[10px] text-slate-500">
                                        {muscle.affectedMembers} atletas afectados
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span
                                        className="text-lg font-black"
                                        style={{ color: getFatigueColor(muscle.averageFatigue) }}
                                    >
                                        {muscle.averageFatigue}%
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    }
                </div>
            </div>

            {/* High Fatigue Warning */}
            {highFatigueAreas.length > 0 && (
                <motion.div
                    className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <FiAlertTriangle className="text-red-400 text-xl flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-red-400">
                            Zonas con fatiga elevada detectadas
                        </p>
                        <p className="text-xs text-red-500/70 mt-1">
                            {highFatigueAreas.map(a => a.muscleName).join(', ')}.
                            Se recomienda incluir ejercicios de recuperación en las próximas sesiones.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                {[
                    { color: '#06b6d4', label: 'Mínima (<10%)' },
                    { color: '#22c55e', label: 'Baja (10-25%)' },
                    { color: '#f59e0b', label: 'Media (25-40%)' },
                    { color: '#ef4444', label: 'Alta (>40%)' },
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[10px] text-slate-500">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupHeatmap;
