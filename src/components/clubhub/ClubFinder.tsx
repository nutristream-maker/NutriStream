import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUsers, FiAward, FiChevronRight, FiMapPin, FiStar } from 'react-icons/fi';
import { ClubHubService, ClubSummary } from '../../services/ClubHubService';

interface ClubFinderProps {
    onClubSelect: (clubId: string, role?: 'trainer' | 'member' | 'admin') => void;
}

const ClubFinder: React.FC<ClubFinderProps> = ({ onClubSelect }) => {
    const [query, setQuery] = useState('');
    const [clubs, setClubs] = useState<ClubSummary[]>([]);
    const [myClubs, setMyClubs] = useState<ClubSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadClubs = useCallback(async (searchQuery: string) => {
        setIsLoading(true);
        try {
            // Load user's clubs first (only on initial load or empty query)
            if (!searchQuery) {
                const myClubsData = await ClubHubService.getMyClubs();
                setMyClubs(myClubsData);
            }

            const results = await ClubHubService.searchClubs(searchQuery);
            setClubs(results);
        } catch (err) {
            console.error('Error searching clubs:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadClubs('');
    }, [loadClubs]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            loadClubs(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, loadClubs]);

    const getCPIColor = (cpi: number): string => {
        if (cpi >= 85) return 'text-emerald-500';
        if (cpi >= 70) return 'text-cyan-500';
        if (cpi >= 55) return 'text-amber-500';
        return 'text-red-500';
    };

    return (
        <div className="min-h-[60vh] flex flex-col">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-3">
                    <span className="text-5xl">🏋️</span>
                    ClubHub
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Encuentra y únete a tu gimnasio o club deportivo para acceder al panel de rendimiento grupal.
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-xl mx-auto w-full mb-8">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por nombre del club..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-sm"
                />
            </div>

            {/* My Clubs Section */}
            {myClubs.length > 0 && !query && (
                <div className="mb-10 max-w-5xl mx-auto w-full px-4">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="text-cyan-500">★</span> Mis Clubs
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myClubs.map((club) => (
                            <motion.button
                                key={`my-${club.id}`}
                                onClick={() => onClubSelect(club.id, club.userRole)}
                                className="text-left p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50 border-2 border-cyan-500/30 hover:border-cyan-500 shadow-lg shadow-cyan-500/5 transition-all group relative overflow-hidden"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className={`absolute bottom-0 right-0 p-2 text-[10px] font-black rounded-tl-xl shadow-sm z-10
                                    ${club.userRole === 'trainer' ? 'bg-purple-500 text-white' :
                                        club.userRole === 'admin' ? 'bg-amber-500 text-black' :
                                            'bg-cyan-500 text-black'}`}>
                                    {club.userRole === 'trainer' ? 'ENTRENADOR' :
                                        club.userRole === 'admin' ? 'ADMIN' :
                                            'DEPORTISTA'}
                                </div>
                                <div className="flex items-start justify-between mb-3 pr-8">
                                    <div>
                                        <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                            {club.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            <span className="flex items-center gap-1">
                                                <FiMapPin size={12} />
                                                {club.location}
                                            </span>
                                        </div>
                                    </div>
                                    <FiChevronRight className="text-cyan-500/50 group-hover:text-cyan-500 transition-colors" size={24} />
                                </div>

                                <div className="flex items-center gap-3 text-xs font-bold pt-3 border-t border-slate-200 dark:border-slate-700/50">
                                    <span className={`flex items-center gap-1.5 ${getCPIColor(club.cpiValue)}`}>
                                        <FiAward size={14} />
                                        CPI {club.cpiValue}
                                    </span>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-slate-500 dark:text-slate-400">
                                        Última visita: Hoy
                                    </span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Results Title */}
            {query && (
                <div className="max-w-5xl mx-auto w-full px-4 mb-4">
                    <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Resultados de búsqueda
                    </h2>
                </div>
            )}

            {/* Results */}
            <div className="flex-grow px-4">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : clubs.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <p className="text-lg font-bold mb-2">No se encontraron clubs</p>
                        <p className="text-sm">Intenta buscar con otro nombre</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                        <AnimatePresence mode="popLayout">
                            {clubs.map((club, idx) => (
                                <motion.button
                                    key={club.id}
                                    onClick={() => onClubSelect(club.id)}
                                    className="text-left p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10 transition-all group"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-grow">
                                            <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                                {club.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <FiMapPin size={12} />
                                                    {club.location}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1 text-amber-500 font-bold">
                                                    <FiStar size={12} />
                                                    {club.rating}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                                {club.description}
                                            </p>
                                        </div>
                                        <FiChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-cyan-500 transition-colors mt-1 flex-shrink-0" size={20} />
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-bold pt-3 border-t border-slate-100 dark:border-slate-700/50">
                                        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                            <FiUsers size={14} className="text-cyan-500" />
                                            {club.memberCount} miembros
                                        </span>
                                        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                            <FiUsers size={14} className="text-purple-500" />
                                            {club.trainerCount} entrenadores
                                        </span>
                                        <span className={`flex items-center gap-1.5 ml-auto ${getCPIColor(club.cpiValue)}`}>
                                            <FiAward size={14} />
                                            CPI {club.cpiValue}
                                        </span>
                                    </div>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Footer hint */}
            <div className="text-center mt-8 text-xs text-slate-400">
                <p>¿No encuentras tu club? Contacta con tu entrenador para obtener el código de acceso.</p>
            </div>
        </div>
    );
};

export default ClubFinder;
