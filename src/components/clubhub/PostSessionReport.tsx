import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiDownload, FiShare2, FiTrendingUp, FiUsers, FiZap, FiActivity, FiClock } from 'react-icons/fi';
import { Session, Member } from '../../types/ClubTypes';
import { AutoReportService, SessionReport } from '../../services/AutoReportService';
import IndividualReportCard from './IndividualReportCard';

interface PostSessionReportProps {
    session: Session;
    members: Member[];
}

const PostSessionReport: React.FC<PostSessionReportProps> = ({ session, members }) => {
    const [report, setReport] = useState<SessionReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [showIndividual, setShowIndividual] = useState(false);
    const [selectedMember, setSelectedMember] = useState<string | null>(null);

    useEffect(() => {
        generateReport();
    }, [session, members]);

    const generateReport = async () => {
        setLoading(true);
        const generated = await AutoReportService.generateReport(session, members);
        setReport(generated);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <FiActivity className="mx-auto text-4xl text-cyan-400 mb-4 animate-pulse" />
                    <p className="text-slate-400">Generando informe AI...</p>
                </motion.div>
            </div>
        );
    }

    if (!report) return null;

    const selectedReport = report.individualReports.find(r => r.memberId === selectedMember);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FiFileText className="text-cyan-600 dark:text-cyan-400" />
                        AI Autoreport
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        {report.sessionTitle} • {report.date.toLocaleDateString('es-ES')}
                    </p>
                </div>

                <div className="flex gap-2">
                    <motion.button
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white transition-colors flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FiDownload size={16} />
                        Exportar
                    </motion.button>
                    <motion.button
                        className="px-4 py-2 bg-cyan-500 rounded-lg text-sm font-bold text-black flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FiShare2 size={16} />
                        Compartir
                    </motion.button>
                </div>
            </div>

            {/* Group Summary */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <FiUsers className="text-cyan-600 dark:text-cyan-400" />
                    Resumen del Grupo
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-black/20 text-center">
                        <p className="text-3xl font-black text-amber-500 dark:text-amber-400">{report.groupSummary.peakPower}W</p>
                        <p className="text-xs text-slate-500 mt-1">Potencia Pico</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-black/20 text-center">
                        <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400">{report.groupSummary.avgPower}W</p>
                        <p className="text-xs text-slate-500 mt-1">Media Potencia</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-black/20 text-center">
                        <p className="text-3xl font-black text-orange-500 dark:text-orange-400">{report.groupSummary.totalCalories}</p>
                        <p className="text-xs text-slate-500 mt-1">Total Calorías</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-black/20 text-center">
                        <p className={`text-3xl font-black ${report.groupSummary.cpiChange >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                            {report.groupSummary.cpiChange >= 0 ? '+' : ''}{report.groupSummary.cpiChange.toFixed(1)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">CPI Change</p>
                    </div>
                </div>

                {/* Highlights */}
                <div className="space-y-2 mb-6">
                    {report.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <FiTrendingUp className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <p className="text-sm text-emerald-700 dark:text-emerald-400">{highlight}</p>
                        </div>
                    ))}
                </div>

                {/* Recommendations */}
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <p className="text-xs text-slate-500 mb-2">💡 Recomendaciones AI</p>
                    <div className="space-y-2">
                        {report.recommendations.map((rec, idx) => (
                            <p key={idx} className="text-sm text-cyan-700 dark:text-cyan-400 flex items-start gap-2">
                                <span>•</span>
                                <span>{rec}</span>
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            {/* Toggle Individual Reports */}
            <button
                onClick={() => setShowIndividual(!showIndividual)}
                className="w-full py-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white hover:border-cyan-500/50 transition-colors"
            >
                {showIndividual ? '▲ Ocultar' : '▼ Mostrar'} Informes Individuales ({report.individualReports.length})
            </button>

            {/* Individual Reports */}
            <AnimatePresence>
                {showIndividual && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                    >
                        {/* List View */}
                        <div className="grid gap-4">
                            {report.individualReports
                                .sort((a, b) => b.metrics.avgPower - a.metrics.avgPower)
                                .map((ir, idx) => (
                                    <IndividualReportCard
                                        key={ir.memberId}
                                        report={ir}
                                        rank={idx + 1}
                                    />
                                ))
                            }
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-600 pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="flex items-center gap-1">
                    <FiClock size={12} />
                    Generado: {report.generatedAt.toLocaleTimeString('es-ES')}
                </span>
                <span>Powered by NutriStream AI</span>
            </div>
        </div>
    );
};

export default PostSessionReport;
