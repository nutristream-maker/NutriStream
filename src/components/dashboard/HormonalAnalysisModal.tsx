import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { FiX, FiActivity, FiArrowUp, FiArrowDown, FiZap, FiMoon, FiDroplet } from 'react-icons/fi'; // Icons for tabs
import { useLanguage } from '../../context/LanguageContext';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface HormonalAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentDay: number;
    cycleLength: number;
    phase: string;
}

const HormonalAnalysisModal: React.FC<HormonalAnalysisModalProps> = ({ isOpen, onClose, currentDay, cycleLength, phase }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'overview' | 'training' | 'nutrition'>('overview');

    // Hormone Curve Logic (Scientific Approximation 28-day base, scaled)
    const hormoneData = useMemo(() => {
        const labels = Array.from({ length: cycleLength }, (_, i) => i + 1);
        const ovulationDay = cycleLength - 14;

        // Helper to normalize day to standard 28-day cycle for curve calc
        const normalize = (d: number) => {
            if (d <= ovulationDay) return (d / ovulationDay) * 14; // Pre-ovulation mapping
            return 14 + ((d - ovulationDay) / 14) * 14; // Post-ovulation mapping
        };

        const estrogen = labels.map(day => {
            const x = normalize(day);
            // Estrogen: Rise 1-13, Peak 13, Drop 14-16, Rise 17-21, Drop 22-28
            if (x < 14) return 20 + 80 * Math.exp(-0.1 * Math.pow(x - 13, 2));
            return 30 + 40 * Math.exp(-0.1 * Math.pow(x - 21, 2));
        });

        const progesterone = labels.map(day => {
            const x = normalize(day);
            // Progesterone: Low 1-14, Rise 15-22, Peak 22, Drop 23-28
            if (x < 14.5) return 5;
            return 5 + 85 * Math.exp(-0.06 * Math.pow(x - 22, 2));
        });

        const testosterone = labels.map(day => {
            const x = normalize(day);
            // Testosterone: Low baseline, small peak at ovulation
            return 15 + 25 * Math.exp(-0.5 * Math.pow(x - 14, 2));
        });

        return { labels, estrogen, progesterone, testosterone };
    }, [cycleLength]);

    const chartData = {
        labels: hormoneData.labels,
        datasets: [
            {
                label: t('estrogeno'),
                data: hormoneData.estrogen,
                borderColor: '#ec4899', // Pink-500
                backgroundColor: (ctx: any) => {
                    const canvas = ctx.chart.ctx;
                    const gradient = canvas.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
                    gradient.addColorStop(1, 'rgba(236, 72, 153, 0.0)');
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2
            },
            {
                label: t('progesterona'),
                data: hormoneData.progesterone,
                borderColor: '#f59e0b', // Amber-500
                backgroundColor: (ctx: any) => {
                    const canvas = ctx.chart.ctx;
                    const gradient = canvas.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
                    gradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2
            },
            {
                label: t('testosterona'),
                data: hormoneData.testosterone,
                borderColor: '#6366f1', // Indigo-500
                borderDash: [5, 5],
                backgroundColor: 'transparent',
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 1.5,
                hidden: false
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'end' as const,
                labels: { usePointStyle: true, boxWidth: 6, font: { family: "'Inter', sans-serif", size: 10 } }
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                padding: 10
            },
            annotation: {
                annotations: {
                    line1: {
                        type: 'line',
                        xMin: currentDay - 1,
                        xMax: currentDay - 1,
                        borderColor: '#10b981',
                        borderWidth: 2,
                        borderDash: [2, 2],
                        label: { content: 'Hoy', enabled: true, position: 'top', backgroundColor: '#10b981', color: 'white', font: { size: 10, weight: 'bold' } }
                    }
                }
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { display: false } },
            y: { display: false, min: 0 }
        },
        interaction: { mode: 'index' as const, intersect: false },
    };

    if (!isOpen) return null;

    // Derived Insights
    const getInsights = () => {
        // Simplified Logic mapping Phase -> Insight Object
        if (phase === 'faseMenstrual') return {
            focus: 'Restauración',
            training: 'Movilidad, Yoga, Caminatas. Cargas bajas (40-60%).',
            nutrition: t('recNutricionMenstrual'),
            mood: 'Introspectivo. Baja energía física, claridad mental.'
        };
        if (phase === 'faseFolicular') return {
            focus: 'Progresión',
            training: 'Fuerza, Hipertrofia, HIIT. Cargas altas (80-90%).',
            nutrition: t('recNutricionFolicular'),
            mood: 'Energético, confiado, sociable. Alta tolerancia al dolor.'
        };
        if (phase === 'ovulacion') return {
            focus: 'Pico de Rendimiento',
            training: 'PRs (Récords Personales), Pliometría. Máxima intensidad.',
            nutrition: t('recNutricionOvulacion'),
            mood: 'Máxima libido, energía y magnetismo social.'
        };
        return { // Luteal
            focus: 'Mantenimiento',
            training: 'Cardio estable, Deload, Técnica. Cargas moderadas (60-70%).',
            nutrition: t('recNutricionLutea'),
            mood: 'Calma, enfoque en tareas, mayor necesidad de sueño.'
        };
    };

    const insights = getInsights();

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                            <FiActivity size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                                {t('analisisHormonal')}
                            </h2>
                            <p className="text-slate-500 text-xs md:text-sm flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${phase === 'faseMenstrual' ? 'bg-red-500' : 'bg-pink-500'}`}></span>
                                {t(phase)} • {t('dia')} {currentDay} / {cycleLength}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: GRAPH */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/50 relative min-h-[300px] flex flex-col">
                            <div className="flex justify-between items-end mb-4">
                                <h3 className="font-bold text-slate-700 dark:text-slate-300">Paisaje Hormonal</h3>
                                <div className="text-[10px] text-slate-400">*Niveles estimados basados en ciclo circadiano</div>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                                {/* @ts-ignore */}
                                <Line data={chartData} options={chartOptions} />
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/20 flex flex-row sm:flex-col justify-between items-center sm:items-start">
                                <span className="text-xs text-pink-600 dark:text-pink-400 font-bold uppercase">{t('estrogeno')}</span>
                                <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-200 mt-0 sm:mt-1">
                                    {hormoneData.estrogen[currentDay - 1] > 60 ? 'Alto' : hormoneData.estrogen[currentDay - 1] > 30 ? 'Medio' : 'Bajo'}
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 flex flex-row sm:flex-col justify-between items-center sm:items-start">
                                <span className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase">{t('progesterona')}</span>
                                <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-200 mt-0 sm:mt-1">
                                    {hormoneData.progesterone[currentDay - 1] > 20 ? 'Alto' : 'Bajo'}
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 flex flex-row sm:flex-col justify-between items-center sm:items-start">
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase">{t('testosterona')}</span>
                                <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-200 mt-0 sm:mt-1">
                                    {hormoneData.testosterone[currentDay - 1] > 20 ? 'Pico' : 'Estable'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: INSIGHTS & TABS */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-1">
                            <div className="flex">
                                <button onClick={() => setActiveTab('overview')} className={`flex-1 py-3 text-xs font-bold rounded-2xl transition-all ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Resumen</button>
                                <button onClick={() => setActiveTab('training')} className={`flex-1 py-3 text-xs font-bold rounded-2xl transition-all ${activeTab === 'training' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Entreno</button>
                                <button onClick={() => setActiveTab('nutrition')} className={`flex-1 py-3 text-xs font-bold rounded-2xl transition-all ${activeTab === 'nutrition' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Nutrición</button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex-1"
                            >
                                {activeTab === 'overview' && (
                                    <div className="space-y-4">
                                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><FiZap className="text-yellow-500" /> Focus del Día</h4>
                                            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">{insights.focus}</p>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><FiMoon className="text-purple-500" /> Estado Mental</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{insights.mood}</p>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'training' && (
                                    <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
                                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2"><FiActivity /> Recomendación</h4>
                                        <p className="text-slate-300 leading-relaxed text-sm mb-6">
                                            {insights.training}
                                        </p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                                                <span>Intensidad</span>
                                                <span>{phase === 'ovulacion' || phase === 'faseFolicular' ? 'Alta' : 'Baja'}</span>
                                            </div>
                                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${phase === 'ovulacion' ? 'bg-red-500' : phase === 'faseFolicular' ? 'bg-green-500' : 'bg-blue-500'}`}
                                                    style={{ width: phase === 'ovulacion' ? '95%' : phase === 'faseFolicular' ? '80%' : '40%' }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'nutrition' && (
                                    <div className="p-6 rounded-3xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                                        <h4 className="font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2"><FiDroplet /> Nutrientes Clave</h4>
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                                            {insights.nutrition}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default HormonalAnalysisModal;
