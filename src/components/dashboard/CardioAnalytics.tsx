import React from 'react';
import { Line, Bar, Doughnut, Radar, Chart } from 'react-chartjs-2';
import { FiActivity, FiHeart, FiTrendingUp, FiCpu, FiWatch, FiWind } from 'react-icons/fi';
import { GiHeartBeats, GiRunningShoe, GiSpeedometer } from 'react-icons/gi';
import { Card } from '../ui/Shared';
import { useLanguage } from '../../context/LanguageContext';
import { useNutriStreamAnalytics } from '../../hooks/useNutriStreamAnalytics';

// Common Chart Options (reused for consistency)
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

const CardioAnalytics: React.FC<{ timeRange: string }> = ({ timeRange }) => {
    const { t } = useLanguage();
    const { dashboard } = useNutriStreamAnalytics();
    const hasData = dashboard !== null;

    // Engine data with fallbacks
    const hrvValue = hasData ? dashboard!.recovery.factors.hrv.value : 52;
    const rhrValue = hasData ? dashboard!.recovery.factors.rhr.value : 48;
    const nervousSystem = hasData ? dashboard!.recovery.nervousSystemState : 'balanced';
    const strainScore = hasData ? dashboard!.strain.score : 0;
    const strainLevel = hasData ? dashboard!.strain.level : 'light';

    const getLabels = () => {
        if (timeRange === 'Mes') return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        if (timeRange === 'Año') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return [t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')];
    };

    const getHRVData = () => {
        if (timeRange === 'Mes') return [56, 58, 62, 59];
        if (timeRange === 'Año') return [55, 58, 60, 58, 62, 65, 63, 64, 66, 68, 70, 72];
        return [45, 42, 55, 58, 48, 65, 70];
    };

    const getTrainingLoadLabels = () => {
        if (timeRange === 'Mes') return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        if (timeRange === 'Año') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return [t('weekAbbr') + '1', t('weekAbbr') + '2', t('weekAbbr') + '3', t('weekAbbr') + '4'];
    };

    // Mock Data for Advanced Analytics
    const hrvData = {
        labels: getLabels(),
        datasets: [{
            label: t('hrvStatus'),
            data: getHRVData(),
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            pointBackgroundColor: '#8b5cf6',
            pointRadius: 4
        }]
    };

    const zoneData = hasData ? dashboard!.strain.zoneDistribution : null;
    const zoneDistribution = {
        labels: ['Z1', 'Z2', 'Z3', 'Z4', 'Z5'],
        datasets: [{
            data: zoneData ? zoneData.map(z => z.minutes) : [25, 40, 20, 10, 5],
            backgroundColor: [
                '#94a3b8',
                '#10b981',
                '#3b82f6',
                '#f59e0b',
                '#ef4444'
            ],
            borderWidth: 0,
            hoverOffset: 10
        }]
    };

    const trainingLoad = {
        labels: getTrainingLoadLabels(),
        datasets: [
            {
                type: 'bar' as const,
                label: t('strain'),
                data: [450, 520, 480, 600],
                backgroundColor: '#3b82f6', // Blue
                borderRadius: 4
            },
            {
                type: 'line' as const,
                label: t('tolerance'),
                data: [500, 510, 530, 550],
                borderColor: '#10b981', // Green
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0
            }
        ]
    };

    const runningMetrics = {
        labels: [t('cadence'), t('strideLength'), t('gct'), t('vertOsc'), t('power')],
        datasets: [{
            label: t('activo'),
            data: [85, 78, 90, 82, 88], // Normalized scores 0-100
            backgroundColor: 'rgba(236, 72, 153, 0.2)',
            borderColor: '#ec4899',
            pointBackgroundColor: '#ec4899',
            pointBorderColor: '#fff'
        }]
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="!p-4 bg-white dark:bg-slate-800 border-l-4 border-l-violet-500">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('vo2max')}</span>
                        <FiWind className="text-violet-500" />
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">54</span>
                        <span className="text-xs font-bold text-emerald-500 mb-1">{t('excellent')}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{t('top5percent')}</p>
                </Card>

                <Card className="!p-4 bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('rhr')}</span>
                        <FiHeart className="text-emerald-500" />
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{rhrValue}</span>
                        <span className="text-xs font-bold text-slate-400 mb-1">bpm</span>
                    </div>
                    {hasData && (
                        <p className={`text-[10px] mt-1 font-medium ${dashboard!.recovery.factors.rhr.deviation < 0 ? 'text-emerald-500' : dashboard!.recovery.factors.rhr.deviation > 0.5 ? 'text-red-500' : 'text-slate-400'}`}>
                            {dashboard!.recovery.factors.rhr.deviation < 0 ? '↓' : dashboard!.recovery.factors.rhr.deviation > 0 ? '↑' : '→'} vs baseline
                        </p>
                    )}
                </Card>

                <Card className="!p-4 bg-white dark:bg-slate-800 border-l-4 border-l-orange-500">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('hrvStatus')}</span>
                        <FiActivity className="text-orange-500" />
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {nervousSystem === 'parasympathetic' ? 'Parasimpático' : nervousSystem === 'sympathetic' ? 'Simpático' : t('balanced')}
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{hrvValue}ms {hasData ? `(Base: ${Math.round(dashboard!.baseline.avgHRV)}ms)` : '(Avg)'}</p>
                </Card>

                <Card className="!p-4 bg-white dark:bg-slate-800 border-l-4 border-l-cyan-500">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">STRAIN</span>
                        <FiCpu className="text-cyan-500" />
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{strainScore}/21</span>
                    </div>
                    <p className="text-[10px] text-cyan-500 mt-1 font-medium">
                        {strainLevel === 'light' ? 'Ligero' : strainLevel === 'moderate' ? 'Moderado' : strainLevel === 'high' ? 'Alto' : 'Extremo'}
                    </p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main: HRV Analysis */}
                <Card className="lg:col-span-2 !p-5 h-80">
                    <h3 className="flex items-center gap-2 font-bold mb-4 text-slate-800 dark:text-white">
                        <FiActivity className="text-violet-500" />
                        {t('hrvStatus')}
                    </h3>
                    <div className="w-full h-64">
                        <Line data={hrvData} options={{
                            ...commonOptions,
                            plugins: {
                                ...commonOptions.plugins,
                                annotation: {
                                    annotations: {
                                        box1: {
                                            type: 'box',
                                            yMin: 40,
                                            yMax: 60,
                                            backgroundColor: 'rgba(16, 185, 129, 0.05)',
                                            borderColor: 'rgba(16, 185, 129, 0.1)',
                                            borderWidth: 1,
                                            label: { content: t('balanced'), enabled: true, position: 'start' }
                                        }
                                    }
                                }
                            } as any
                        }} />
                    </div>
                </Card>

                {/* Training Zones */}
                <Card className="!p-5 h-80">
                    <h3 className="flex items-center gap-2 font-bold mb-4 text-slate-800 dark:text-white">
                        <GiHeartBeats className="text-red-500" />
                        {t('intensityDistribution')}
                    </h3>
                    <div className="w-full h-60 flex items-center justify-center relative">
                        <Doughnut data={zoneDistribution} options={{
                            maintainAspectRatio: false,
                            cutout: '70%',
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'bottom',
                                    labels: {
                                        boxWidth: 8,
                                        usePointStyle: true,
                                        font: { size: 9 },
                                        color: '#94a3b8'
                                    }
                                }
                            }
                        }} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                            <span className="text-3xl font-black text-slate-800 dark:text-white">80/20</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">{t('polarized')}</span>
                        </div>
                    </div>
                </Card>

                {/* Load vs Tolerance */}
                <Card className="lg:col-span-2 !p-5 h-80">
                    <h3 className="flex items-center gap-2 font-bold mb-4 text-slate-800 dark:text-white">
                        <GiSpeedometer className="text-cyan-500" />
                        {t('acuteVsChronic')}
                    </h3>
                    <div className="w-full h-64">
                        {/* @ts-ignore */}
                        <Chart type='bar' data={trainingLoad} options={commonOptions} />
                    </div>
                </Card>

                {/* Running Dynamics */}
                <Card className="!p-5 h-80">
                    <h3 className="flex items-center gap-2 font-bold mb-4 text-slate-800 dark:text-white">
                        <GiRunningShoe className="text-pink-500" />
                        {t('runningDynamics')}
                    </h3>
                    <div className="w-full h-64">
                        <Radar data={runningMetrics} options={{
                            maintainAspectRatio: false,
                            scales: {
                                r: {
                                    ticks: { display: false, backdropColor: 'transparent' },
                                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                                    pointLabels: { font: { size: 10, weight: 'bold' }, color: '#94a3b8' },
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

export default CardioAnalytics;
