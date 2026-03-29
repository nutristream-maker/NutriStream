import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiClock, FiCalendar, FiTarget, FiStar, FiUsers, FiShoppingCart, FiAward, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { TrainingPlan, formatPrice, getDiscountPercentage } from '../../services/SpecialistPlanService';
import { Button } from '../ui/Shared';

interface PlanDetailsModalProps {
    plan: TrainingPlan | null;
    onClose: () => void;
    onPurchase: (planId: string) => void;
}

const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({ plan, onClose, onPurchase }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews'>('overview');
    const [openWeeks, setOpenWeeks] = useState<number[]>([1]); // Default open first week

    if (!plan) return null;

    const toggleWeek = (week: number) => {
        setOpenWeeks(prev =>
            prev.includes(week) ? prev.filter(w => w !== week) : [...prev, week]
        );
    };

    const hasDiscount = plan.discountPrice && plan.discountPrice < plan.price;

    return (
        <AnimatePresence>
            {plan && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                    >
                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header Image & Close Button */}
                            <div className="relative h-48 md:h-64 bg-slate-200 dark:bg-slate-800">
                                <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20`} />
                                {/* Placeholder for actual plan image if available */}
                                {plan.imageUrl ? (
                                    <img src={plan.imageUrl} alt={plan.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                        <FiTarget size={64} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"
                                >
                                    <FiX size={24} />
                                </button>

                                <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                                    <div className="flex flex-wrap items-center gap-2 mb-2 text-sm font-medium opacity-90">
                                        <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded capitalize">
                                            {plan.category === 'weight_loss' ? 'Pérdida de Peso' : plan.category}
                                        </span>
                                        <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded capitalize">
                                            {plan.difficulty === 'beginner' ? 'Principiante' :
                                                plan.difficulty === 'intermediate' ? 'Intermedio' :
                                                    plan.difficulty === 'advanced' ? 'Avanzado' : 'Élite'}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-2">{plan.title}</h2>
                                    <div className="flex items-center gap-4 text-sm opacity-90">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">{plan.specialist.name.charAt(0)}</div>
                                            <span>{plan.specialist.name}</span>
                                            {plan.specialist.verified && <FiCheck className="text-blue-400" />}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FiStar className="text-amber-400" />
                                            <span className="font-bold">{plan.rating}</span>
                                            <span>({plan.reviewCount} reseñas)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                                {/* Left: Content Tabs */}
                                <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-100 dark:border-slate-800">
                                    {/* Tabs Header */}
                                    <div className="flex border-b border-slate-100 dark:border-slate-800">
                                        <button
                                            onClick={() => setActiveTab('overview')}
                                            className={`flex-1 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                        >
                                            Descripción
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('curriculum')}
                                            className={`flex-1 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'curriculum' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                        >
                                            Curriculum
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('reviews')}
                                            className={`flex-1 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                        >
                                            Reseñas
                                        </button>
                                    </div>

                                    {/* Tab Content (Scrollable) */}
                                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                        {activeTab === 'overview' && (
                                            <div className="space-y-8 animate-fade-in">
                                                <div>
                                                    <h3 className="text-lg font-bold mb-3 text-slate-800 dark:text-white">Sobre este plan</h3>
                                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                                        {plan.description}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                                        <FiClock className="text-primary mb-2 text-xl" />
                                                        <p className="text-xs text-slate-500 uppercase font-semibold">Duración</p>
                                                        <p className="font-bold text-slate-800 dark:text-white">{plan.durationWeeks} semanas</p>
                                                        <p className="text-xs text-slate-500">{plan.sessionsPerWeek} sesiones/sem</p>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                                        <FiTarget className="text-primary mb-2 text-xl" />
                                                        <p className="text-xs text-slate-500 uppercase font-semibold">Nivel</p>
                                                        <p className="font-bold text-slate-800 dark:text-white capitalize">
                                                            {plan.difficulty === 'beginner' ? 'Principiante' :
                                                                plan.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                                                        </p>
                                                        <p className="text-xs text-slate-500">Adaptable</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-bold mb-3 text-slate-800 dark:text-white">¿Qué incluye?</h3>
                                                    <ul className="space-y-2">
                                                        {plan.features.map((feature, i) => (
                                                            <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                                                                <FiCheck className="text-green-500 mt-1 shrink-0" />
                                                                <span>{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-bold mb-3 text-slate-800 dark:text-white">Equipamiento Necesario</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {plan.equipment.map((item, i) => (
                                                            <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm">
                                                                {item}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'curriculum' && (
                                            <div className="space-y-4 animate-fade-in">
                                                <div className="flex justify-between items-center mb-4">
                                                    <p className="text-sm text-slate-500">{plan.curriculum?.length || 0} semanas • Total 48 sesiones</p>
                                                    <button onClick={() => setOpenWeeks(plan.curriculum?.map(w => w.weekNumber) || [])} className="text-sm text-primary font-medium hover:underline">
                                                        Expandir todo
                                                    </button>
                                                </div>

                                                {plan.curriculum && plan.curriculum.length > 0 ? (
                                                    plan.curriculum.map((week) => (
                                                        <div key={week.weekNumber} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                                            <button
                                                                onClick={() => toggleWeek(week.weekNumber)}
                                                                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                            >
                                                                <div className="flex gap-4 text-left">
                                                                    <div className="flex flex-col items-center justify-center w-12 text-slate-400">
                                                                        <span className="text-xs uppercase font-bold">Sem</span>
                                                                        <span className="text-xl font-bold text-slate-800 dark:text-white">{week.weekNumber}</span>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold text-slate-800 dark:text-white">{week.title}</h4>
                                                                        <p className="text-sm text-slate-500 dark:text-slate-400">{week.description}</p>
                                                                    </div>
                                                                </div>
                                                                {openWeeks.includes(week.weekNumber) ? <FiChevronUp /> : <FiChevronDown />}
                                                            </button>

                                                            <AnimatePresence>
                                                                {openWeeks.includes(week.weekNumber) && (
                                                                    <motion.div
                                                                        initial={{ height: 0 }}
                                                                        animate={{ height: 'auto' }}
                                                                        exit={{ height: 0 }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <div className="p-4 space-y-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                                                            {week.days.map((day, idx) => (
                                                                                <div key={idx} className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                                                                        <FiAward size={14} />
                                                                                    </div>
                                                                                    <div className="flex-1">
                                                                                        <div className="flex justify-between">
                                                                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{day.title}</span>
                                                                                            <span className="text-xs font-mono text-slate-400">{day.duration}</span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                                            <span className="text-xs text-slate-500 uppercase tracking-wide">{day.day}</span>
                                                                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                                                            <span className="text-xs text-indigo-500 font-medium">{day.focus}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-10 text-slate-400">
                                                        <FiCalendar size={32} className="mx-auto mb-2 opacity-50" />
                                                        <p>Detalles del plan de estudio no disponibles.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'reviews' && (
                                            <div className="space-y-6 animate-fade-in text-center py-10">
                                                <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl mb-6">
                                                    <div className="text-4xl font-bold text-amber-500 mb-2">{plan.rating}</div>
                                                    <div className="flex justify-center gap-1 mb-2">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <span key={star}>
                                                                <FiStar className={`${star <= Math.round(plan.rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-400 font-medium">Basado en {plan.reviewCount} reseñas</p>
                                                </div>
                                                <p className="text-slate-400 italic">Las reseñas detalladas estarán disponibles próximamente.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Sticky Sidebar (Desktop) or Bottom Bar (Mobile) */}
                                <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col justify-center border-l border-slate-100 dark:border-slate-800 shrink-0">
                                    <div className="mb-6">
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Precio Total</p>
                                        <div className="flex items-baseline gap-3">
                                            {hasDiscount ? (
                                                <>
                                                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{formatPrice(plan.discountPrice!, plan.currency)}</span>
                                                    <span className="text-lg text-slate-400 line-through decoration-slate-400/50">{formatPrice(plan.price, plan.currency)}</span>
                                                </>
                                            ) : (
                                                <span className="text-3xl font-bold text-slate-900 dark:text-white">{formatPrice(plan.price, plan.currency)}</span>
                                            )}
                                        </div>
                                        {hasDiscount && (
                                            <div className="mt-2 text-sm text-emerald-600 font-medium bg-emerald-100 dark:bg-emerald-900/20 py-1 px-2 rounded inline-block">
                                                ¡Ahorras {getDiscountPercentage(plan.price, plan.discountPrice!)}%!
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <Button onClick={() => onPurchase(plan.id)} className="w-full justify-center py-3 text-lg shadow-xl shadow-primary/20" icon={FiShoppingCart}>
                                            Comprar Ahora
                                        </Button>
                                        <p className="text-xs text-center text-slate-400 mt-4">
                                            Pago seguro • Acceso inmediato • Garantía de 14 días
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 hidden md:block">
                                        <h4 className="font-bold text-sm mb-3">Tu entrenador</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {plan.specialist.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{plan.specialist.name}</p>
                                                <p className="text-xs text-slate-500">{plan.specialist.title}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PlanDetailsModal;
