import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { FiMoon, FiSunrise, FiActivity, FiZap } from 'react-icons/fi';
import { Card, Button } from '../ui/Shared';
import { genAI } from '../../services/ai';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SleepAnalysis: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [aiTip, setAiTip] = useState("");

    const sleepData = {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
            data: [7.5, 6.8, 8.2, 7.0, 6.5, 9.0, 8.5],
            backgroundColor: '#6366f1',
            borderRadius: 6
        }]
    };

    const sleepStages = [
        { label: 'Profundo', value: '1h 30m', color: 'bg-indigo-600' },
        { label: 'Ligero', value: '4h 45m', color: 'bg-indigo-400' },
        { label: 'REM', value: '1h 45m', color: 'bg-indigo-300' }
    ];

    const generateTip = async () => {
        setIsLoading(true);
        try {
            const prompt = "Actúa como un especialista en sueño. Analiza estos datos: Promedio 7.6 horas. 20% sueño profundo. Dame un consejo corto (max 2 frases) para mejorar el sueño profundo.";
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            setAiTip(response.text());
        } catch (error) {
            setAiTip("Error al conectar con el coach de sueño.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="!p-6 flex flex-col justify-between h-full bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-slate-800/80 dark:to-slate-900/80">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-indigo-500"><FiMoon /></span>
                        Análisis de Sueño
                    </h3>
                    <p className="text-xs text-slate-500">Últimos 7 días</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold">85</span>
                    <span className="text-xs text-slate-500 block">Sleep Score</span>
                </div>
            </div>

            <div className="h-40 mb-6 relative">
                <Bar
                    data={sleepData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { display: false, grid: { display: false } },
                            x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }
                        }
                    }}
                />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
                {sleepStages.map(stage => (
                    <div key={stage.label} className="text-center p-2 bg-white dark:bg-black/20 rounded-lg shadow-sm">
                        <div className={`w-full h-1.5 rounded-full ${stage.color} mb-2`}></div>
                        <p className="font-bold text-lg">{stage.value}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{stage.label}</p>
                    </div>
                ))}
            </div>

            <div className="mt-auto">
                {aiTip ? (
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-sm text-indigo-800 dark:text-indigo-300 mb-4 animate-fade-in">
                        <span className="inline-block mr-1"><FiZap /></span> {aiTip}
                    </div>
                ) : (
                    <Button onClick={generateTip} disabled={isLoading} variant="secondary" className="w-full text-xs py-2" icon={FiActivity}>
                        {isLoading ? 'Analizando...' : 'Obtener Consejo IA'}
                    </Button>
                )}
            </div>
        </Card>
    );
};

export default SleepAnalysis;
