import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Card } from '../ui/Shared';
import { useLanguage } from '../../context/LanguageContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface AnalyticsInsightsProps {
    history: {
        [key: string]: { date: string, value: number }[];
    }
}

const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({ history }) => {
    const { t } = useLanguage();
    const metrics = Object.keys(history);
    const [selectedMetric, setSelectedMetric] = useState(metrics[0]);

    if (!metrics.length) return <div className="p-4 text-center text-slate-500">No hay datos históricos disponibles.</div>;

    const dataPoints = history[selectedMetric];

    const chartData = {
        labels: dataPoints.map(d => d.date),
        datasets: [
            {
                label: selectedMetric,
                data: dataPoints.map(d => d.value),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                pointBackgroundColor: '#fff',
                pointBorderColor: '#10b981',
                pointRadius: 6,
                tension: 0.4
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                displayColors: false,
            }
        },
        scales: {
            y: { grid: { color: 'rgba(200, 200, 200, 0.1)' } },
            x: { grid: { display: false } }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {metrics.map(metric => (
                    <button
                        key={metric}
                        onClick={() => setSelectedMetric(metric)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${selectedMetric === metric
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                    >
                        {metric}
                    </button>
                ))}
            </div>

            <Card className="!p-6 h-80">
                <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-200">{selectedMetric} - Evolución</h3>
                {/* @ts-ignore */}
                <Line data={chartData} options={options} />
            </Card>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Actual</p>
                    <p className="text-xl font-bold">{dataPoints[dataPoints.length - 1].value}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Máximo</p>
                    <p className="text-xl font-bold">{Math.max(...dataPoints.map(d => d.value))}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Mínimo</p>
                    <p className="text-xl font-bold">{Math.min(...dataPoints.map(d => d.value))}</p>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsInsights;
