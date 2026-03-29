import React, { useState, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale, Filler } from 'chart.js';
import { Bar, Radar, Line, Doughnut, Chart } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiActivity, FiCpu, FiZap, FiTarget, FiHeart, FiDroplet, FiMoon } from 'react-icons/fi';
import { GiFootsteps, GiFire, GiMuscleUp, GiHeartBeats, GiKnifeFork } from 'react-icons/gi';
import { Card, Button } from '../ui/Shared';
import { genAI } from '../../services/ai';

import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';
import MenstrualCycleTracker, { calculateCycleStatus } from './MenstrualCycleTracker';

import HormonalAnalysisModal from './HormonalAnalysisModal';
import { useNutritionLogs } from '../../hooks/useNutritionLogs';
import CardioAnalytics from './CardioAnalytics';
import StrengthAnalytics from './StrengthAnalytics';
import OverviewAnalytics from './OverviewAnalytics';
import RecoveryAnalytics from './RecoveryAnalytics';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale, Filler);

const Rendimiento: React.FC = React.memo(() => {
    const { t } = useLanguage();
    const { userData } = useUser();
    const [timeRange, setTimeRange] = useState('Semana');
    const [activeTab, setActiveTab] = useState<'resumen' | 'fuerza' | 'cardio' | 'recuperacion'>('resumen');

    const { todaySummary } = useNutritionLogs();

    // AI State

    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Female Health State
    const [lastPeriodDate, setLastPeriodDate] = useState<string>('');
    const [cycleLength, setCycleLength] = useState<number>(28);
    const [isHormonalModalOpen, setIsHormonalModalOpen] = useState(false);

    // Activity & Calories Mock Data (Daily)
    const dailySteps = 8432;
    const stepGoal = 10000;
    const caloriesBurned = 2150;
    const caloriesConsumed = todaySummary.totalCalories;
    const calorieGoal = 2000;

    // Derived Cycle Data
    const cycleStatus = React.useMemo(() => calculateCycleStatus(lastPeriodDate, cycleLength), [lastPeriodDate, cycleLength]);

    // --- CHART GRADIENTS ---
    const createGradient = (ctx: CanvasRenderingContext2D, colorStart: string, colorEnd: string) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    };

    // --- CHART OPTIONS (Premium Style) ---
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: 0
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 16,
                displayColors: true,
                usePointStyle: true,
                titleFont: { family: "'Inter', sans-serif", size: 13, weight: 'bold' as const },
                bodyFont: { family: "'Inter', sans-serif", size: 12 },
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: '#94a3b8',
                    font: { family: "'Inter', sans-serif", size: 8 },
                    maxRotation: 0,
                    autoSkip: true
                }
            },
            y: {
                grid: { color: 'rgba(203, 213, 225, 0.05)', borderDash: [5, 5] },
                ticks: {
                    color: '#94a3b8',
                    font: { family: "'Inter', sans-serif", size: 8 }
                },
                border: { display: false }
            }
        },
        elements: {
            line: { tension: 0.4 },
            bar: { borderRadius: 6 },
            point: { radius: 0, hoverRadius: 6 }
        }
    };

    // --- MOCK DATA ---
    const mockData = {
        Semana: {
            volume: { labels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'], datasets: [{ label: t('volumen'), data: [12000, 15000, 8000, 18000, 14000, 20000, 5000], backgroundColor: (ctx: any) => ctx.chart.ctx ? createGradient(ctx.chart.ctx, '#3b82f6', 'rgba(59, 130, 246, 0.2)') : '#3b82f6', borderRadius: 8 }] },
            radar: { labels: [t('fuerza'), t('resistencia'), t('velocidad'), t('flexibilidad'), t('tecnica')], datasets: [{ label: 'Actual', data: [85, 70, 75, 60, 90], backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3b82f6', pointBackgroundColor: '#3b82f6', pointBorderColor: '#fff' }] },
            progress: { labels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'], datasets: [{ label: t('pesoCorporal'), data: [76.5, 76.4, 76.2, 76.0, 75.8, 75.5, 75.0], borderColor: '#10b981', backgroundColor: (ctx: any) => ctx.chart.ctx ? createGradient(ctx.chart.ctx, 'rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.0)') : 'rgba(16, 185, 129, 0.1)', fill: true }] },
            hrZones: {
                labels: ['Zona 1', 'Zona 2', 'Zona 3', 'Zona 4', 'Zona 5'],
                datasets: [{
                    data: [30, 40, 20, 5, 5],
                    backgroundColor: [
                        'rgba(148, 163, 184, 0.8)',  // Z1 - Gris suave
                        'rgba(16, 185, 129, 0.8)',    // Z2 - Verde
                        'rgba(59, 130, 246, 0.8)',    // Z3 - Azul
                        'rgba(245, 158, 11, 0.8)',    // Z4 - Naranja
                        'rgba(239, 68, 68, 0.8)'      // Z5 - Rojo
                    ],
                    borderColor: ['#94a3b8', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },
            recovery: {
                labels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
                datasets: [
                    {
                        type: 'bar' as const,
                        label: t('recuperacion'),
                        data: [90, 85, 95, 80, 85, 90, 100],
                        backgroundColor: (ctx: any) => ctx.chart.ctx ? createGradient(ctx.chart.ctx, '#10b981', 'rgba(16, 185, 129, 0.3)') : '#10b981',
                        borderRadius: 8,
                        borderWidth: 0
                    },
                    {
                        type: 'line' as const,
                        label: t('fatiga'),
                        data: [20, 30, 10, 50, 40, 35, 10],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#ef4444',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            vo2: { labels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'], datasets: [{ label: 'VO2 Max', data: [45, 45, 46, 46, 46, 47, 47], borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)', fill: true }] }
        },
        Mes: {
            volume: { labels: ['S1', 'S2', 'S3', 'S4'], datasets: [{ label: t('volumen'), data: [65000, 72000, 68000, 84000], backgroundColor: '#3b82f6' }] },
            radar: { labels: [t('fuerza'), t('resistencia'), t('velocidad'), t('flexibilidad'), t('tecnica')], datasets: [{ label: 'Avg', data: [82, 75, 78, 65, 88], backgroundColor: 'rgba(168, 85, 247, 0.2)', borderColor: '#a855f7' }] },
            progress: { labels: ['S1', 'S2', 'S3', 'S4'], datasets: [{ label: t('pesoCorporal'), data: [77.5, 76.8, 76.0, 75.0], borderColor: '#10b981', fill: true }] },
            hrZones: {
                labels: ['Zona 1', 'Zona 2', 'Zona 3', 'Zona 4', 'Zona 5'],
                datasets: [{
                    data: [25, 30, 25, 15, 5],
                    backgroundColor: [
                        'rgba(148, 163, 184, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: ['#94a3b8', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },
            recovery: {
                labels: ['S1', 'S2', 'S3', 'S4'],
                datasets: [
                    {
                        type: 'bar' as const,
                        label: t('recuperacion'),
                        data: [88, 82, 85, 78],
                        backgroundColor: '#10b981',
                        borderRadius: 8
                    },
                    {
                        type: 'line' as const,
                        label: t('fatiga'),
                        data: [35, 45, 40, 55],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#ef4444',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            vo2: { labels: ['S1', 'S2', 'S3', 'S4'], datasets: [{ label: 'VO2 Max', data: [45, 46, 46, 47], borderColor: '#8b5cf6', fill: true }] }
        },
        Año: {
            volume: { labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], datasets: [{ label: t('volumen'), data: [240000, 260000, 280000, 250000, 300000, 320000, 310000, 290000, 330000, 350000, 360000, 380000], backgroundColor: '#3b82f6' }] },
            radar: { labels: [t('fuerza'), t('resistencia'), t('velocidad'), t('flexibilidad'), t('tecnica')], datasets: [{ label: 'Avg', data: [80, 80, 80, 70, 92], backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444' }] },
            progress: { labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], datasets: [{ label: t('pesoCorporal'), data: [82, 81, 80, 79, 78, 77, 76, 75, 75, 74, 74, 73], borderColor: '#10b981', fill: true }] },
            hrZones: {
                labels: ['Zona 1', 'Zona 2', 'Zona 3', 'Zona 4', 'Zona 5'],
                datasets: [{
                    data: [15, 25, 30, 20, 10],
                    backgroundColor: [
                        'rgba(148, 163, 184, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: ['#94a3b8', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },
            recovery: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                datasets: [
                    {
                        type: 'bar' as const,
                        label: t('recuperacion'),
                        data: [80, 85, 82, 88, 90, 85, 75, 80, 85, 88, 85, 82],
                        backgroundColor: '#10b981',
                        borderRadius: 8
                    },
                    {
                        type: 'line' as const,
                        label: t('fatiga'),
                        data: [40, 35, 38, 30, 25, 35, 55, 45, 35, 30, 35, 40],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#ef4444',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            vo2: { labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], datasets: [{ label: 'VO2 Max', data: [44, 45, 45, 46, 46, 47, 47, 48, 48, 49, 49, 50], borderColor: '#8b5cf6', fill: true }] }
        }
    };

    const currentData = mockData[timeRange as keyof typeof mockData];

    // AI Analysis
    const handleAiAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const prompt = `Analyze gym performance: Avg Volume ${currentData.volume.datasets[0].data[0]}kg. Phase: Hypertrophy. Give 3 sentence insight.`;
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            setAiAnalysis(response.text() || "Analysis complete.");
        } catch (error) {
            setAiAnalysis("Unable to connect to AI Coach.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header: Title & Time Range */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    {t('analisisRendimiento')}
                </h2>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {['Semana', 'Mes', 'Año'].map(range => (
                        <button key={range} onClick={() => setTimeRange(range)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${timeRange === range ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                            {range === 'Semana' ? t('semana') : range === 'Mes' ? t('mes') : t('ano')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
                {[
                    { id: 'resumen', icon: FiTrendingUp, label: t('tabResumen') },
                    { id: 'fuerza', icon: GiMuscleUp, label: t('tabFuerza') },
                    { id: 'cardio', icon: GiHeartBeats, label: t('tabCardio') },
                    { id: 'recuperacion', icon: FiActivity, label: t('tabRecuperacion') },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105'
                            : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {/* --- TAB: RESUMEN (Overview) --- */}
                    {activeTab === 'resumen' && (
                        <div className="md:col-span-2 lg:col-span-3">
                            <OverviewAnalytics
                                steps={dailySteps}
                                caloriesBurned={caloriesBurned}
                                caloriesConsumed={caloriesConsumed}
                                calorieGoal={2500}
                                timeRange={timeRange}
                            />
                        </div>
                    )}

                    {/* --- TAB: FUERZA --- */}
                    {activeTab === 'fuerza' && (
                        <div className="md:col-span-2 lg:col-span-3">
                            <StrengthAnalytics timeRange={timeRange} />
                        </div>
                    )}

                    {/* --- TAB: CARDIO --- */}
                    {activeTab === 'cardio' && (
                        <div className="md:col-span-2 lg:col-span-3">
                            <CardioAnalytics timeRange={timeRange} />
                        </div>
                    )}

                    {/* --- TAB: RECUPERACIÓN (Recovery) --- */}
                    {activeTab === 'recuperacion' && (
                        <div className="md:col-span-2 lg:col-span-3">
                            <RecoveryAnalytics timeRange={timeRange} />
                            <div className="mt-6">
                                <MenstrualCycleTracker
                                    lastPeriodDate={lastPeriodDate}
                                    setLastPeriodDate={setLastPeriodDate}
                                    cycleLength={cycleLength}
                                    setCycleLength={setCycleLength}
                                />
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <HormonalAnalysisModal
                isOpen={isHormonalModalOpen}
                onClose={() => setIsHormonalModalOpen(false)}
                currentDay={cycleStatus?.day || 1}
                cycleLength={cycleLength}
                phase={cycleStatus?.phaseKey || 'faseLutea'}
            />
        </div>
    );
});

export default Rendimiento;
