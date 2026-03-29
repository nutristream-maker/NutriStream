import React from 'react';
import { Chart, Bar, Line } from 'react-chartjs-2';
import { FiMoon, FiActivity, FiZap, FiRefreshCw } from 'react-icons/fi';
import { Card } from '../ui/Shared';
import { useLanguage } from '../../context/LanguageContext';
import { useNutriStreamAnalytics } from '../../hooks/useNutriStreamAnalytics';

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
        bar: { borderRadius: 4 },
        line: { tension: 0.4 }
    }
};

const RecoveryAnalytics: React.FC<{ timeRange: string }> = ({ timeRange }) => {
    const { t } = useLanguage();
    const { dashboard } = useNutriStreamAnalytics();
    const hasData = dashboard !== null;

    // Engine data with fallbacks
    const sleepQuality = hasData ? dashboard!.recovery.factors.sleep.score : 88;
    const sleepHours = hasData ? dashboard!.recovery.factors.sleep.hours : 7.75;
    const cnsState = hasData ? dashboard!.recovery.nervousSystemState : 'balanced';
    const cnsDescription = hasData ? dashboard!.recovery.nervousSystemDescription : t('readyToTrain');

    const getLabels = () => {
        if (timeRange === 'Mes') return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        if (timeRange === 'Año') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return [t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')];
    };

    // Mock Data for Recovery
    const labels = getLabels();

    const sleepStagesData = {
        labels,
        datasets: [
            {
                label: t('deepSleep'),
                data: [90, 85, 100, 110, 95, 120, 105], // Minutes
                backgroundColor: '#3b82f6',
                stack: 'Stack 0',
            },
            {
                label: t('remSleep'),
                data: [120, 110, 130, 115, 125, 140, 130], // Minutes
                backgroundColor: '#8b5cf6',
                stack: 'Stack 0',
            },
            {
                label: t('lightSleep'),
                data: [210, 200, 190, 220, 205, 230, 215], // Minutes
                backgroundColor: '#94a3b8',
                stack: 'Stack 0',
            },
        ]
    };

    const cnsData = {
        labels,
        datasets: [
            {
                label: t('cnsReadiness'),
                data: [85, 80, 92, 78, 88, 95, 90],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                pointBackgroundColor: '#10b981',
                pointRadius: 4
            }
        ]
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="!p-4 bg-white dark:bg-slate-800 border-l-4 border-l-indigo-500">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('sleepQuality')}</span>
                        <FiMoon className="text-indigo-500" />
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{sleepQuality}%</span>
                        <span className="text-xs font-bold text-emerald-500 mb-1">{sleepQuality >= 80 ? t('optimal') : sleepQuality >= 60 ? 'Bueno' : 'Bajo'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{Math.floor(sleepHours)}h {Math.round((sleepHours % 1) * 60)}m {t('totalTime')}</p>
                </Card>

                <Card className="!p-4 bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('cnsStatus')}</span>
                        <FiZap className="text-emerald-500" />
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {cnsState === 'parasympathetic' ? 'Parasimpático' : cnsState === 'sympathetic' ? 'Simpático' : t('primed')}
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{hasData ? cnsDescription.slice(0, 60) + '...' : t('readyToTrain')}</p>
                </Card>

                <Card className="!p-4 bg-white dark:bg-slate-800 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('deepSleep')}</span>
                        <FiActivity className="text-blue-500" />
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">1h 45m</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">22% ({t('target')}: 20%)</p>
                </Card>

                <Card className="!p-4 bg-white dark:bg-slate-800 border-l-4 border-l-violet-500">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('remSleep')}</span>
                        <div className="p-1 rounded bg-violet-100 dark:bg-violet-900/30">
                            <FiRefreshCw className="text-violet-500 text-xs" />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">2h 10m</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{t('mentalRecovery')}</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sleep Stages Chart */}
                <Card className="!p-5 h-80">
                    <h3 className="flex items-center gap-2 font-bold mb-4 text-slate-800 dark:text-white">
                        <FiMoon className="text-indigo-500" />
                        {t('sleepStages')}
                    </h3>
                    <div className="w-full h-64">
                        {/* @ts-ignore */}
                        <Chart type='bar' data={sleepStagesData} options={{
                            ...commonOptions,
                            scales: {
                                x: { stacked: true, grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                                y: { stacked: true, grid: { color: 'rgba(203, 213, 225, 0.1)', borderDash: [4, 4] } as any, ticks: { color: '#94a3b8', font: { size: 10 } }, border: { display: false } }
                            }
                        }} />
                    </div>
                </Card>

                {/* CNS Readiness Chart */}
                <Card className="!p-5 h-80">
                    <h3 className="flex items-center gap-2 font-bold mb-4 text-slate-800 dark:text-white">
                        <FiZap className="text-emerald-500" />
                        {t('cnsReadinessTrend')}
                    </h3>
                    <div className="w-full h-64">
                        <Line data={cnsData} options={{
                            ...commonOptions,
                            plugins: {
                                ...commonOptions.plugins,
                                annotation: {
                                    annotations: {
                                        line1: {
                                            type: 'line',
                                            yMin: 80,
                                            yMax: 80,
                                            borderColor: 'rgba(16, 185, 129, 0.5)',
                                            borderWidth: 1,
                                            borderDash: [5, 5],
                                            label: { content: t('optimalZone'), enabled: true, position: 'end', color: '#10b981', font: { size: 10 } }
                                        }
                                    }
                                }
                            } as any
                        }} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default RecoveryAnalytics;
