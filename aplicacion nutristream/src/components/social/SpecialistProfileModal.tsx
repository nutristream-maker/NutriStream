import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiPlay, FiStar, FiClock, FiTag, FiAward, FiShield } from 'react-icons/fi';
import { Button } from '../ui/Shared';
import { useLanguage } from '../../context/LanguageContext';

interface Video {
    id: number;
    title: string;
    duration: string;
    thumbnail: string;
    views: string;
}

interface Specialist {
    id: number;
    name: string;
    role: string;
    image: string;
    status: string;
    rating: number;
    reviews: number;
    price: string;
    tags: string[];
    bio: string;
    videos?: Video[];
}

interface SpecialistProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    specialist: Specialist | null;
    isPremium: boolean;
}

const SpecialistProfileModal: React.FC<SpecialistProfileModalProps> = ({ isOpen, onClose, specialist, isPremium }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'bio' | 'videos'>('bio');

    if (!isOpen || !specialist) return null;

    // Helper to calculate discounted price
    const originalPrice = parseInt(specialist.price.replace('€', ''));
    const discountedPrice = isPremium ? Math.round(originalPrice * 0.2) : originalPrice;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800"
                onClick={e => e.stopPropagation()}
            >
                {/* Header Image & Close */}
                <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-600 overflow-hidden">
                    <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors">
                        <FiX size={24} />
                    </button>
                    <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                </div>

                {/* Profile Content */}
                <div className="px-8 pb-8">
                    {/* Floating Avatar */}
                    <div className="relative -mt-20 mb-6 flex justify-between items-end">
                        <div className="relative">
                            <img
                                src={specialist.image}
                                alt={specialist.name}
                                className="w-40 h-40 rounded-3xl border-4 border-white dark:border-slate-900 shadow-xl object-cover"
                            />
                            <div className={`absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs font-bold text-white border-2 border-white dark:border-slate-900 ${specialist.status === 'online' ? 'bg-green-500' : 'bg-slate-400'
                                }`}>
                                {specialist.status === 'online' ? t('conectado') : t('desconectadoStatus')}
                            </div>
                        </div>

                        {/* Pricing Badge */}
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm text-right">
                            {isPremium ? (
                                <>
                                    <div className="text-xs text-slate-400 line-through font-medium mb-1">{originalPrice}€</div>
                                    <div className="text-3xl font-bold text-green-500 flex items-center gap-2">
                                        {discountedPrice}€
                                        <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">-80%</span>
                                    </div>
                                    <div className="text-xs font-bold text-slate-500 flex items-center justify-end gap-1 mt-1">
                                        <span className="text-amber-500"><FiShield /></span> {t('precioPremium')}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-3xl font-bold text-slate-800 dark:text-white">{originalPrice}€</div>
                                    <div className="text-xs text-slate-500 mt-1">{t('precioSesion')}</div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Name & Role */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-3">
                            {specialist.name}
                            <span className="text-blue-500 text-2xl"><FiCheckCircle /></span>
                        </h2>
                        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                            <span className="font-medium text-blue-600 dark:text-blue-400">{specialist.role}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1 text-amber-500">
                                <span className="fill-current"><FiStar /></span>
                                <span className="font-bold">{specialist.rating}</span>
                                <span className="text-slate-400 text-sm">({specialist.reviews})</span>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {specialist.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium flex items-center gap-2">
                                <FiTag size={14} /> {tag}
                            </span>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 mb-6">
                        <button
                            onClick={() => setActiveTab('bio')}
                            className={`pb-4 px-2 font-bold text-sm transition-colors relative ${activeTab === 'bio' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            {t('sobreMi')}
                            {activeTab === 'bio' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('videos')}
                            className={`pb-4 px-2 font-bold text-sm transition-colors relative ${activeTab === 'videos' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            {t('videosEducativos')}
                            {activeTab === 'videos' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="min-h-[200px]">
                        {activeTab === 'bio' ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                                    {specialist.bio}
                                </p>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <h4 className="font-bold mb-4 flex items-center gap-2"><span className="text-amber-500"><FiAward /></span> {t('experiencia')}</h4>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2" />
                                            Senior Specialist en Recuperación Deportiva (2018 - Presente)
                                        </li>
                                        <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2" />
                                            Máster en Biomecánica Clínica - Universidad de Barcelona
                                        </li>
                                        <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2" />
                                            Certificación Internacional en Nutrición Deportiva (ISSN)
                                        </li>
                                    </ul>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {specialist.videos?.map(video => (
                                    <div key={video.id} className="group cursor-pointer">
                                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3">
                                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                                                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center pl-1 shadow-lg">
                                                    <span className="text-blue-600"><FiPlay /></span>
                                                </div>
                                            </div>
                                            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded">
                                                {video.duration}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {video.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                            <FiPlay size={10} /> {video.views} vistas
                                        </div>
                                    </div>
                                ))}
                                {(!specialist.videos || specialist.videos.length === 0) && (
                                    <div className="col-span-2 text-center py-12 text-slate-400">
                                        No hay videos disponibles por el momento.
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SpecialistProfileModal;
