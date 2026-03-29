import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiClock, FiUsers, FiZap, FiStar, FiFilter, FiChevronRight,
    FiActivity, FiHeart, FiTarget, FiAward
} from 'react-icons/fi';
import { ClubServiceOffering, ServiceCategory } from '../../types/ClubTypes';
import { ClubHubService } from '../../services/ClubHubService';

interface ServiceCatalogProps {
    clubId: string;
}

const CATEGORY_CONFIG: Record<ServiceCategory, { label: string; icon: React.ComponentType<{ size: number }>; activeClass: string; color: string }> = {
    class: { label: 'Clases', icon: FiActivity, activeClass: 'bg-cyan-500 text-black', color: 'cyan' },
    amenity: { label: 'Instalaciones', icon: FiTarget, activeClass: 'bg-purple-500 text-white', color: 'purple' },
    personal_training: { label: 'Personal', icon: FiAward, activeClass: 'bg-amber-500 text-black', color: 'amber' },
    wellness: { label: 'Bienestar', icon: FiHeart, activeClass: 'bg-emerald-500 text-black', color: 'emerald' }
};

const INTENSITY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
    low: { label: 'Baja', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
    medium: { label: 'Media', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
    high: { label: 'Alta', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    extreme: { label: 'Extrema', color: 'text-red-500', bgColor: 'bg-red-500/10' }
};

const ServiceCatalog: React.FC<ServiceCatalogProps> = ({ clubId }) => {
    const [services, setServices] = useState<ClubServiceOffering[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<ServiceCategory | 'all'>('all');
    const [selectedService, setSelectedService] = useState<ClubServiceOffering | null>(null);

    useEffect(() => {
        loadServices();
    }, [clubId, filter]);

    const loadServices = async () => {
        setIsLoading(true);
        try {
            const data = await ClubHubService.getClubServices(
                clubId,
                filter === 'all' ? undefined : filter
            );
            setServices(data);
        } catch (err) {
            console.error('Error loading services:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getDayName = (day: number): string => {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return days[day];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <FiTarget className="text-cyan-500" />
                        Servicios y Clases
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Explora las actividades disponibles en el club
                    </p>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'all'
                            ? 'bg-cyan-500 text-black'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        Todos
                    </button>
                    {(Object.keys(CATEGORY_CONFIG) as ServiceCategory[]).map(cat => {
                        const config = CATEGORY_CONFIG[cat];
                        return (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === cat
                                    ? config.activeClass
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {config.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Loading */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : services.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    <p className="font-bold">No hay servicios disponibles</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                        {services.map((service, idx) => {
                            const catConfig = CATEGORY_CONFIG[service.category];
                            const intConfig = INTENSITY_CONFIG[service.intensity];
                            const CatIcon = catConfig.icon;

                            return (
                                <motion.div
                                    key={service.id}
                                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all cursor-pointer group"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setSelectedService(service)}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    {/* Category Badge */}
                                    <div className={`px-4 py-2 bg-${catConfig.color}-500/10 flex items-center justify-between`}>
                                        <span className={`text-xs font-black text-${catConfig.color}-500 flex items-center gap-1.5`}>
                                            <CatIcon size={12} />
                                            {catConfig.label}
                                        </span>
                                        <span className={`text-xs font-bold ${intConfig.color} ${intConfig.bgColor} px-2 py-0.5 rounded-full`}>
                                            {intConfig.label}
                                        </span>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                                                    {service.name}
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                                                    {service.description}
                                                </p>
                                            </div>
                                            <FiChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-cyan-500 transition-colors flex-shrink-0 mt-1" />
                                        </div>

                                        {/* Target Muscles */}
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {service.targetMuscles.slice(0, 3).map((muscle, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-full">
                                                    {muscle}
                                                </span>
                                            ))}
                                            {service.targetMuscles.length > 3 && (
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 rounded-full">
                                                    +{service.targetMuscles.length - 3}
                                                </span>
                                            )}
                                        </div>

                                        {/* Stats Row */}
                                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                            {service.duration > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <FiClock size={12} />
                                                    {service.duration} min
                                                </span>
                                            )}
                                            {service.caloriesBurnedAvg > 0 && (
                                                <span className="flex items-center gap-1 text-orange-500">
                                                    <FiZap size={12} />
                                                    {service.caloriesBurnedAvg} kcal
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-amber-500 ml-auto">
                                                <FiStar size={12} />
                                                {service.stats.avgRating.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedService && (
                    <ServiceDetailModal
                        service={selectedService}
                        onClose={() => setSelectedService(null)}
                        getDayName={getDayName}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Service Detail Modal Component
interface ServiceDetailModalProps {
    service: ClubServiceOffering;
    onClose: () => void;
    getDayName: (day: number) => string;
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ service, onClose, getDayName }) => {
    const catConfig = CATEGORY_CONFIG[service.category];
    const intConfig = INTENSITY_CONFIG[service.intensity];
    const CatIcon = catConfig.icon;

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`p-6 bg-gradient-to-r from-${catConfig.color}-500/20 to-${catConfig.color}-600/10 border-b border-slate-200 dark:border-slate-700`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <span className={`text-xs font-black text-${catConfig.color}-500 flex items-center gap-1.5 mb-2`}>
                                <CatIcon size={14} />
                                {catConfig.label}
                            </span>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                {service.name}
                            </h2>
                        </div>
                        <span className={`text-sm font-bold ${intConfig.color} ${intConfig.bgColor} px-3 py-1 rounded-full`}>
                            Intensidad {intConfig.label}
                        </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        {service.description}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <div className="text-2xl font-black text-cyan-500">{service.duration}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Minutos</div>
                        </div>
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <div className="text-2xl font-black text-orange-500">{service.caloriesBurnedAvg}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Calorías</div>
                        </div>
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <div className="text-2xl font-black text-purple-500">{service.batteryDrainAvg}%</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Batería Neural</div>
                        </div>
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <div className="text-2xl font-black text-emerald-500">{service.maxCapacity}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Plazas</div>
                        </div>
                    </div>

                    {/* Target Muscles */}
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <FiTarget className="text-cyan-500" />
                            Grupos Musculares
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {service.targetMuscles.map((muscle, i) => (
                                <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 text-sm font-bold text-cyan-600 dark:text-cyan-400 rounded-full">
                                    {muscle}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Equipment */}
                    {service.equipment && service.equipment.length > 0 && (
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">
                                Equipamiento
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {service.equipment.map((eq, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 rounded-full">
                                        {eq}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Schedule */}
                    {service.weeklySchedule.length > 0 && (
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">
                                Horarios Semanales
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {service.weeklySchedule.map((slot, i) => (
                                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                                            {getDayName(slot.dayOfWeek)}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {slot.times.join(' • ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Session Stats */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-xl border border-amber-500/20">
                        <div className="flex items-center gap-6">
                            <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">Sesiones totales</div>
                                <div className="text-lg font-black text-slate-900 dark:text-white">{service.stats.totalSessions}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">Asistencia media</div>
                                <div className="text-lg font-black text-slate-900 dark:text-white">{service.stats.avgAttendance}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-amber-500">
                                <FiStar size={18} />
                                <span className="text-2xl font-black">{service.stats.avgRating.toFixed(1)}</span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Valoración</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={() => {
                            alert(`Has solicitado reservar: ${service.name}. \n\nRecibirás una confirmación en tu calendario.`);
                            onClose();
                        }}
                        className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all font-bold"
                    >
                        Reservar Sesión
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ServiceCatalog;
