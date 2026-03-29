import React from 'react';
import { Doughnut, Bar, Chart } from 'react-chartjs-2';
import { FiActivity, FiZap, FiCheckCircle, FiTarget, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import { GiBatteryPack, GiBedLamp, GiWaterDrop } from 'react-icons/gi';
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
        bar: { borderRadius: 4 }
    }
};

const OverviewAnalytics: React.FC<{
    steps: number;
    caloriesBurned: number;
    caloriesConsumed: number;
    calorieGoal: number;
    timeRange: string;
}> = ({ steps, caloriesBurned, caloriesConsumed, calorieGoal, timeRange }) => {
    const { t } = useLanguage();
    const { dashboard } = useNutriStreamAnalytics();

    // Use engine data or fallback to defaults
    const recoveryScore = dashboard?.recovery.score ?? 0;
    const recoveryStatus = dashboard?.recovery.status ?? 'low';
    const energyBank = dashboard?.energyBank.score ?? 0;
    const energyStatus = dashboard?.energyBank.status ?? 'depleted';
    const strainScore = dashboard?.strain.score ?? 0;
    const strainLevel = dashboard?.strain.level ?? 'light';
    const balanceStatus = dashboard?.balance.status ?? '--';
    const balanceColor = dashboard?.balance.color ?? '#94a3b8';
    const sleepScore = dashboard?.recovery.factors.sleep.score ?? 0;
    const nervousSystem = dashboard?.recovery.nervousSystemState ?? 'balanced';
    const hasData = dashboard !== null;

    // Recovery doughnut color
    const recoveryColor = recoveryScore >= 80 ? '#10b981' : recoveryScore >= 60 ? '#22d3ee' : recoveryScore >= 40 ? '#f59e0b' : '#ef4444';
    const statusLabel = recoveryStatus === 'optimal' ? t('optimal') : recoveryStatus === 'good' ? 'Bueno' : recoveryStatus === 'moderate' ? 'Moderado' : 'Bajo';

    const readinessData = {
        labels: [t('readiness'), 'Rest'],
        datasets: [{
            data: [recoveryScore, 100 - recoveryScore],
            backgroundColor: [recoveryColor, '#1e293b'],
            borderWidth: 0,
            cutout: '85%',
        }]
    };

    const getLabels = () => {
        if (timeRange === 'Mes') return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        if (timeRange === 'Año') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return [t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')];
    };

    const getData = () => {
        if (timeRange === 'Mes') return [85, 90, 88, 92];
        if (timeRange === 'Año') return [80, 85, 90, 88, 92, 95, 90, 88, 85, 90, 92, 95];
        return [90, 85, 100, 75, 95, 80, 0];
    };

    const weeklyCompliance = {
        labels: getLabels(),
        datasets: [{
            label: t('activityScore'),
            data: getData(),
            backgroundColor: (ctx: any) => {
                const val = ctx.raw;
                if (val >= 90) return '#10b981';
                if (val >= 70) return '#f59e0b';
                return '#ef4444';
            },
            borderRadius: 6
        }]
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* No data banner */}
            {!hasData && (
                <Card className="!p-4 bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center gap-3">
                        <FiAlertTriangle className="text-amber-500 flex-shrink-0" size={18} />
                        <p className="text-sm text-amber-200">Conecta tu dispositivo o introduce datos biométricos para activar las analíticas en tiempo real.</p>
                    </div>
                </Card>
            )}

            {/* Hero Readiness Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 !p-6 flex flex-col items-center bg-white dark:bg-slate-800">
                    <div className="w-full text-left mb-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dailyReadiness')}</h3>
                    </div>
                    <div className="w-48 h-48 relative my-2">
                        <Doughnut data={readinessData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span style={{ color: recoveryColor }}><FiZap className="mb-2" size={24} /></span>
                            <span className="text-5xl font-black text-slate-800 dark:text-white">{recoveryScore}</span>
                            <span className="text-xs font-bold mt-1" style={{ color: recoveryColor }}>{statusLabel}</span>
                        </div>
                    </div>
                    {hasData && (
                        <p className="text-xs text-center text-slate-400 mt-4 max-w-[220px]">
                            {dashboard!.recovery.recommendation}
                        </p>
                    )}
                </Card>

                {/* KPI Grid */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    {/* Energy Bank */}
                    <Card className="!p-5 bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-white/70 text-xs font-bold uppercase">{t('bodyBattery')}</p>
                                <h3 className="text-3xl font-black mt-1">{energyBank}%</h3>
                            </div>
                            <GiBatteryPack size={24} className="text-white/50" />
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-1.5 mt-4">
                            <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${energyBank}%` }}></div>
                        </div>
                        <p className="text-xs text-white/70 mt-2">
                            {energyStatus === 'full' ? t('chargedAndReady') : energyStatus === 'good' ? 'Buena energía' : energyStatus === 'moderate' ? 'Energía moderada' : 'Batería agotada'}
                        </p>
                    </Card>

                    {/* Strain */}
                    <Card className="!p-5 bg-white dark:bg-slate-800 border-l-4 border-l-orange-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase">STRAIN</p>
                                <h3 className="text-3xl font-black mt-1 text-slate-800 dark:text-white">{strainScore}</h3>
                            </div>
                            <FiActivity size={24} className="text-orange-500" />
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-4">
                            <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${(strainScore / 21) * 100}%` }}></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            {strainLevel === 'light' ? 'Ligero' : strainLevel === 'moderate' ? 'Moderado' : strainLevel === 'high' ? 'Alto' : 'Extremo'} (0-21)
                        </p>
                    </Card>

                    {/* Balance */}
                    <Card className="!p-5 bg-white dark:bg-slate-800 border-l-4" style={{ borderLeftColor: balanceColor }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase">BALANCE</p>
                                <h3 className="text-2xl font-black mt-1 text-slate-800 dark:text-white">{balanceStatus}</h3>
                            </div>
                            <span style={{ color: balanceColor }}><FiTrendingUp size={24} /></span>
                        </div>
                        {hasData && (
                            <p className="text-xs text-slate-400 mt-4">{dashboard!.balance.description}</p>
                        )}
                    </Card>

                    {/* Nervous System */}
                    <Card className="!p-5 bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase">SNA</p>
                                <h3 className="text-xl font-black mt-1 text-slate-800 dark:text-white">
                                    {nervousSystem === 'parasympathetic' ? 'Parasimpático' : nervousSystem === 'sympathetic' ? 'Simpático' : 'Equilibrado'}
                                </h3>
                            </div>
                            <FiZap size={24} className="text-emerald-500" />
                        </div>
                        {hasData && (
                            <p className="text-[10px] text-slate-400 mt-2">HRV: {dashboard!.recovery.factors.hrv.value}ms</p>
                        )}
                    </Card>
                </div>
            </div>

            {/* Weekly Trends */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 !p-6 h-80">
                    <h3 className="flex items-center gap-2 font-bold mb-6 text-slate-800 dark:text-white">
                        <FiCheckCircle className="text-emerald-500" />
                        {t('weeklyCompliance')}
                    </h3>
                    <div className="w-full h-56">
                        {/* @ts-ignore */}
                        <Chart type='bar' data={weeklyCompliance} options={commonOptions} />
                    </div>
                </Card>

                <Card className="!p-6 h-80 flex flex-col justify-between bg-zinc-900 text-white relative overflow-hidden border-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 blur-[80px] rounded-full opacity-50"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                            <FiTarget className="text-purple-400" size={24} />
                        </div>
                        <h4 className="text-lg font-bold mb-2">{t('todaysFocus')}</h4>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                            {hasData ? dashboard!.recovery.recommendation : t('focusDescRecov')}
                        </p>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1" style={{ color: balanceColor }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: balanceColor }}></span>
                            {balanceStatus === 'Sobreesfuerzo' ? 'Fase de Descanso' : balanceStatus === 'Recuperación' ? t('recoveryPhase') : 'Fase Óptima'}
                        </div>
                    </div>
                </Card>
            </div>

            {/* AI Insights */}
            {hasData && dashboard!.insights.length > 0 && (
                <Card className="!p-5">
                    <h3 className="flex items-center gap-2 font-bold mb-4 text-slate-800 dark:text-white">
                        <FiTrendingUp className="text-blue-500" />
                        Insights AI
                    </h3>
                    <div className="space-y-3">
                        {dashboard!.insights.map(insight => (
                            <div
                                key={insight.id}
                                className="flex items-start gap-3 p-3 rounded-lg"
                                style={{
                                    backgroundColor: insight.severity === 'critical' ? 'rgba(239,68,68,0.08)' :
                                        insight.severity === 'warning' ? 'rgba(245,158,11,0.08)' : 'rgba(59,130,246,0.08)',
                                    borderLeft: `3px solid ${insight.severity === 'critical' ? '#ef4444' : insight.severity === 'warning' ? '#f59e0b' : '#3b82f6'}`
                                }}
                            >
                                <span style={{ color: insight.severity === 'critical' ? '#ef4444' : insight.severity === 'warning' ? '#f59e0b' : '#3b82f6' }}>
                                    <FiAlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{insight.title}</p>
                                    <p className="text-xs text-slate-400 mt-1">{insight.message}</p>
                                    <p className="text-xs font-medium mt-2" style={{ color: insight.severity === 'critical' ? '#ef4444' : insight.severity === 'warning' ? '#f59e0b' : '#3b82f6' }}>
                                        💡 {insight.actionable}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default OverviewAnalytics;
