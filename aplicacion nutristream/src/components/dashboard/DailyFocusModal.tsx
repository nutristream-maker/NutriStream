import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTarget, FiActivity, FiZap, FiCheck, FiClock, FiLayers, FiCoffee } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

interface DailyFocusModalProps {
    isOpen: boolean;
    onClose: () => void;
    userData: any;
    onStartSession: () => void;
}

const DailyFocusModal: React.FC<DailyFocusModalProps> = ({ isOpen, onClose, userData, onStartSession }) => {
    const { t } = useLanguage();
    if (!isOpen) return null;

    // Smart logic based on readiness (mocked for now but structure is ready)
    const isHighReadiness = userData.wellnessScore > 80;
    const themeColor = isHighReadiness ? 'from-indigo-600 to-violet-600' : 'from-emerald-500 to-teal-600';
    const intensityLabel = isHighReadiness ? 'Alta Intensidad' : 'Recuperación Activa';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Hero Header */}
                    <div className={`bg-gradient-to-r ${themeColor} p-8 text-white relative shrink-0`}>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-2 opacity-90">
                                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">{intensityLabel}</span>
                                    <span className="flex items-center gap-1 text-xs font-medium"><FiClock /> 60m</span>
                                </div>
                                <h2 className="text-4xl font-black mb-1 leading-none">{t('focoDelDia')}</h2>
                                <p className="text-white/80 text-lg font-medium">
                                    {isHighReadiness ? 'Enfoque: Fuerza Máxima & Potencia' : 'Enfoque: Movilidad & Flujo Sanguíneo'}
                                </p>
                            </div>

                            <div className="flex flex-col items-end">
                                <span className="text-5xl font-black">{userData.wellnessScore}</span>
                                <span className="text-xs uppercase opacity-75">Readiness</span>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 rounded-full transition-colors text-white z-20">
                            <FiX size={20} />
                        </button>

                        {/* Decor */}
                        <div className="absolute -bottom-10 -right-10 opacity-20 transform rotate-12">
                            <FiTarget size={200} />
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-0 overflow-y-auto flex-1">
                        <div className="p-8 space-y-8">

                            {/* Section 1: Session Timeline */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FiActivity /> Estructura de la Sesión
                                </h3>
                                <div className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-700 space-y-6">
                                    {/* Item 1 */}
                                    <div className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-white dark:ring-slate-900" />
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <div className="flex justify-between mb-1">
                                                <h4 className="font-bold text-slate-800 dark:text-white">Calentamiento Dinámico</h4>
                                                <span className="text-xs font-bold text-slate-500">0'-10'</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Activación de glúteos y movilidad torácica. Preparación del CNS.</p>
                                        </div>
                                    </div>

                                    {/* Item 2 (Highlight) */}
                                    <div className="relative">
                                        <div className={`absolute -left-[23px] top-0 w-4 h-4 rounded-full ${isHighReadiness ? 'bg-indigo-500' : 'bg-emerald-500'} ring-4 ring-white dark:ring-slate-900 animate-pulse`} />
                                        <div className={`p-5 rounded-xl border-l-4 ${isHighReadiness ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10'}`}>
                                            <div className="flex justify-between mb-1">
                                                <h4 className={`font-bold ${isHighReadiness ? 'text-indigo-900 dark:text-indigo-200' : 'text-emerald-900 dark:text-emerald-200'} text-lg`}>Bloque Principal</h4>
                                                <span className="text-xs font-bold opacity-70">10'-45'</span>
                                            </div>
                                            <p className="text-sm opacity-80 mb-3 font-medium">
                                                {isHighReadiness ? 'Sentadilla Trasera (5x5) + Press Banca (4x6)' : 'Yoga Flow + Estiramientos Estáticos'}
                                            </p>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] uppercase font-bold px-2 py-1 bg-white/50 rounded-md">RPE 8-9</span>
                                                <span className="text-[10px] uppercase font-bold px-2 py-1 bg-white/50 rounded-md">Descanso 3min</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Item 3 */}
                                    <div className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-white dark:ring-slate-900" />
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <div className="flex justify-between mb-1">
                                                <h4 className="font-bold text-slate-800 dark:text-white">Accesorios / Finisher</h4>
                                                <span className="text-xs font-bold text-slate-500">45'-60'</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Trabajo de aislamiento (Hipertrofia) o Core cooling.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Preparation Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Equipment */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <FiLayers /> Equipamiento
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['Barra Olímpica', 'Rack', 'Bandas Elásticas', 'Cinturón'].map((item, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Fuel / Pre-workout */}
                                <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-800/30">
                                    <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <FiCoffee /> Combustible Pre-reno
                                    </h4>
                                    <p className="text-sm text-orange-800 dark:text-orange-200 font-medium mb-1">
                                        Se recomienda ingesta de carbohidratos rápidos.
                                    </p>
                                    <p className="text-xs text-orange-600 dark:text-orange-300">
                                        Ej: Plátano, Avena o Batido de Maltodextrina 30min antes.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                        <button
                            onClick={onStartSession}
                            className={`w-full py-4 bg-gradient-to-r ${themeColor} text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2`}
                        >
                            Comenzar Sesión Ahora <FiActivity />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DailyFocusModal;
