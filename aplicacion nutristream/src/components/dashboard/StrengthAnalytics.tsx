import React from 'react';
import { Line, Bar, Radar, Doughnut, Chart } from 'react-chartjs-2';
import { GiMuscleUp, GiBiceps, GiWeightLiftingUp, GiLegArmor } from 'react-icons/gi';
import { FiTrendingUp, FiTarget, FiLayers } from 'react-icons/fi';
import { Card } from '../ui/Shared';
import { useLanguage } from '../../context/LanguageContext';

const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            padding: 10,
            cornerRadius: 8,
            displayColors: true,
            usePointStyle: true,
        }
    },
    scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
        y: { grid: { color: 'rgba(203, 213, 225, 0.1)', borderDash: [4, 4] }, ticks: { color: '#94a3b8', font: { size: 10 } }, border: { display: false } }
    },
    elements: {
        line: { tension: 0.4 },
        point: { radius: 0, hoverRadius: 6 }
    }
};

const StrengthAnalytics: React.FC<{ timeRange: string }> = ({ timeRange }) => {
    const { t } = useLanguage();

    const getLabels = () => {
        if (timeRange === 'Mes') return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        if (timeRange === 'Año') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return [t('weekAbbr') + '1', t('weekAbbr') + '2', t('weekAbbr') + '3', t('weekAbbr') + '4'];
    };

    const getVolumeLabels = () => {
        if (timeRange === 'Mes') return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        if (timeRange === 'Año') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return [t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')];
    };

    const getVolumeData = () => {
        if (timeRange === 'Mes') return [45000, 48000, 52000, 50000];
        if (timeRange === 'Año') return [200000, 210000, 220000, 215000, 230000, 240000, 235000, 250000, 260000, 255000, 270000, 280000];
        return [12000, 15500, 0, 18000, 14200, 21000, 0];
    };

    // Mock Data for Strength
    const oneRepMaxData = {
        labels: getLabels(),
        datasets: [
            {
                label: 'Squat',
                data: [120, 122.5, 125, 127.5],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
            },
            {
                label: 'Bench Press',
                data: [95, 95, 97.5, 100],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
            },
            {
                label: 'Deadlift',
                data: [150, 155, 155, 160],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2,
            }
        ]
    };

    const muscleBalanceData = {
        labels: [t('pechoTC'), t('espaldaTC'), t('piernasTC'), t('hombrosTC'), t('brazosTC'), t('coreTC')],
        datasets: [{
            label: t('volumeLoad'),
            data: [25, 20, 30, 10, 10, 5],
            backgroundColor: [
                '#3b82f6', // Chest
                '#8b5cf6', // Back
                '#ef4444', // Legs
                '#f59e0b', // Shoulders
                '#10b981', // Arms
                '#6366f1'  // Core
            ],
            borderWidth: 0,
            hoverOffset: 8
        }]
    };

    const symmetryData = {
        labels: [t('upperPush'), t('upperPull'), t('squatPattern'), t('hingePattern'), t('rotation'), t('antiRotation')],
        datasets: [{
            label: t('symmetryScore'),
            data: [85, 82, 90, 88, 75, 80],
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: '#10b981',
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#fff'
        }]
    };

    const volumeLoadTrend = {
        labels: getVolumeLabels(),
        datasets: [{
            type: 'bar' as const,
            label: t('volume'),
            data: getVolumeData(),
            backgroundColor: (ctx: any) => {
                const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
                gradient.addColorStop(0, '#6366f1');
                gradient.addColorStop(1, '#a855f7');
                return gradient;
            },
            borderRadius: 6
        }]
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="!p-4 bg-white dark:bg-slate-800 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('totalVolume')}</span>
                        <GiWeightLiftingUp className="text-blue-500" />
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">80.7t</span>
                        <span className="text-xs font-bold text-emerald-500 mb-1">↑ 5%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{t('thisWeek')}</p>
                </Card>

                <Card className="!p-4 bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('relativeStrength')}</span>
                        <GiMuscleUp className="text-emerald-500" />
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">2.5x</span>
                        <span className="text-xs font-bold text-emerald-500 mb-1">{t('elite')}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">BW Ratio</p>
                </Card>

                <Card className="!p-4 bg-white dark:bg-slate-800 border-l-4 border-l-rose-500">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('heaviestLift')}</span>
                        <GiLegArmor className="text-rose-500" />
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">160kg</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Deadlift - {t('personalRecord')}</p>
                </Card>

                <Card className="!p-4 bg-white dark:bg-slate-800 border-l-4 border-l-violet-500">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('workouts')}</span>
                        <FiLayers className="text-violet-500" />
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">5</span>
                        <span className="text-xs font-bold text-slate-400 mb-1">/ 6 {t('goal')}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{t('consistency')}: 92%</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1RM Trends */}
                <Card className="lg:col-span-2 !p-5 h-80">
                    <h3 className="flex items-center gap-2 font-bold mb-4 text-slate-800 dark:text-white">
                        <FiTrendingUp className="text-blue-500" />
                        {t('estimated1RM')}
                    </h3>
                    <div className="w-full h-64">
                        <Line data={oneRepMaxData} options={commonOptions} />
                    </div>
                </Card>

                {/* Muscle Balance */}
                <Card className="!p-5 h-80">
                    <h3 className="flex items-center gap-2 font-bold mb-4 text-slate-800 dark:text-white">
                        <GiBiceps className="text-indigo-500" />
                        {t('muscleDistribution')}
                    </h3>
                    <div className="w-full h-60 flex items-center justify-center relative">
                        <Doughnut data={muscleBalanceData} options={{
                            maintainAspectRatio: false,
                            cutout: '70%',
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'bottom',
                                    labels: { boxWidth: 8, usePointStyle: true, font: { size: 9 }, color: '#94a3b8' }
                                }
                            }
                        }} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                            <span className="text-2xl font-black text-slate-800 dark:text-white">Legs</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Dominant</span>
                        </div>
                    </div>
                </Card>

                {/* Volume Load */}
                <Card className="lg:col-span-2 !p-5 h-80">
                    <h3 className="flex items-center gap-2 font-bold mb-4 text-slate-800 dark:text-white">
                        <FiLayers className="text-violet-500" />
                        {t('weeklyVolumeLoad')}
                    </h3>
                    <div className="w-full h-64">
                        {/* @ts-ignore */}
                        <Chart type='bar' data={volumeLoadTrend} options={commonOptions} />
                    </div>
                </Card>

                {/* Symmetry/Movement Patterns */}
                <Card className="!p-5 h-80">
                    <h3 className="flex items-center gap-2 font-bold mb-4 text-slate-800 dark:text-white">
                        <FiTarget className="text-emerald-500" />
                        {t('movementPatterns')}
                    </h3>
                    <div className="w-full h-64">
                        <Radar data={symmetryData} options={{
                            maintainAspectRatio: false,
                            scales: {
                                r: {
                                    ticks: { display: false, backdropColor: 'transparent' },
                                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                                    pointLabels: { font: { size: 9, weight: 'bold' }, color: '#94a3b8' },
                                    angleLines: { color: 'rgba(148, 163, 184, 0.1)' }
                                }
                            }
                        }} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default StrengthAnalytics;
