import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp, FiTrendingDown, FiHeart, FiZap, FiTarget } from 'react-icons/fi';
import { IndividualReport } from '../../services/AutoReportService';

interface IndividualReportCardProps {
    report: IndividualReport;
    rank?: number;
    onViewHeatmap?: () => void;
}

const IndividualReportCard: React.FC<IndividualReportCardProps> = ({
    report,
    rank,
    onViewHeatmap
}) => {
    const getFatigueColor = (level: number) => {
        if (level >= 70) return 'bg-red-500';
        if (level >= 50) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <motion.div
            className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700 backdrop-blur-sm shadow-sm dark:shadow-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                {/* Rank Badge */}
                {rank && rank <= 3 && (
                    <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-black text-sm
                        ${rank === 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-black' :
                            rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-black' :
                                'bg-gradient-to-br from-amber-600 to-amber-700 text-white'}
                    `}>
                        #{rank}
                    </div>
                )}

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {report.name.split(' ').map(n => n[0]).join('')}
                </div>

                <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{report.name}</h4>
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mt-1">
                        {report.badges.map((badge, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-[10px] font-bold text-cyan-400"
                            >
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-black/20 text-center">
                    <FiZap className="mx-auto text-amber-500 dark:text-amber-400 mb-1" />
                    <p className="text-lg font-black text-slate-900 dark:text-white">{report.metrics.avgPower}W</p>
                    <p className="text-[10px] text-slate-500">Potencia Media</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-black/20 text-center">
                    <FiHeart className="mx-auto text-red-500 dark:text-red-400 mb-1" />
                    <p className="text-lg font-black text-slate-900 dark:text-white">{report.metrics.maxHR}</p>
                    <p className="text-[10px] text-slate-500">HR Máx</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-black/20 text-center">
                    <FiTarget className="mx-auto text-emerald-500 dark:text-emerald-400 mb-1" />
                    <p className="text-lg font-black text-slate-900 dark:text-white">{report.metrics.stability.toFixed(0)}%</p>
                    <p className="text-[10px] text-slate-500">Estabilidad</p>
                </div>
            </div>

            {/* Comparison Stats */}
            <div className="flex items-center gap-3 mb-4">
                <div className={`
                    flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold
                    ${report.comparison.powerVsAvg >= 0
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'}
                `}>
                    {report.comparison.powerVsAvg >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                    {report.comparison.powerVsAvg >= 0 ? '+' : ''}{report.comparison.powerVsAvg.toFixed(0)}% vs media
                </div>

                <div className={`
                    flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold
                    ${report.comparison.asymmetryImprovement >= 0
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'}
                `}>
                    ⚖️ {report.comparison.asymmetryImprovement >= 0 ? '+' : ''}{report.comparison.asymmetryImprovement.toFixed(0)}% simetría
                </div>
            </div>

            {/* Fatigue Zones */}
            <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2">Zonas de Fatiga</p>
                <div className="space-y-2">
                    {report.fatigueZones.map((zone, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 dark:text-slate-400 w-24">{zone.muscle}</span>
                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${getFatigueColor(zone.level)}`}
                                    style={{ width: `${zone.level}%` }}
                                />
                            </div>
                            <span className="text-xs text-slate-500 w-12 text-right">{zone.level.toFixed(0)}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Insight */}
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <p className="text-xs text-slate-500 mb-1">💡 AI Insight</p>
                <p className="text-sm text-cyan-600 dark:text-cyan-400 leading-relaxed">
                    {report.aiInsight}
                </p>
            </div>

            {/* View Heatmap */}
            {onViewHeatmap && (
                <motion.button
                    onClick={onViewHeatmap}
                    className="w-full mt-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white hover:border-cyan-500/50 transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    Ver Heatmap de Fatiga →
                </motion.button>
            )}
        </motion.div>
    );
};

export default IndividualReportCard;
