import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSearch, FiX, FiFilter, FiUser, FiZap, FiActivity,
    FiMapPin, FiRadio, FiChevronDown
} from 'react-icons/fi';

import { useLanguage } from '../../context/LanguageContext';
import SocialService from '../../services/SocialService';
import {
    UserProfile,
    UserSearchFilters,
    UserSearchResult,
    LeagueTier,
    LeagueColors,
    SensorDeviceType
} from '../../types/SocialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// DEBOUNCE HOOK
// ═══════════════════════════════════════════════════════════════════════════

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

// ═══════════════════════════════════════════════════════════════════════════
// USER CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface UserCardProps {
    user: UserProfile;
    highlights?: string[];
    onClick: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, highlights = [], onClick }) => {
    const leagueConfig = LeagueColors[user.leagueRank.tier];

    return (
        <motion.div
            className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 cursor-pointer transition-all"
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
        >
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`relative w-14 h-14 rounded-xl overflow-hidden ${leagueConfig.glow}`}>
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${leagueConfig.gradient} flex items-center justify-center`}>
                            <FiUser className="text-white" size={24} />
                        </div>
                    )}

                    {/* Live indicator */}
                    {user.isLive && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-red-500 border-2 border-slate-800 animate-pulse" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white truncate">{user.displayName}</h4>
                        {user.isLive && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white">
                                LIVE
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-400 truncate">@{user.username}</p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1 mt-1">
                        {highlights.slice(0, 3).map((h, i) => (
                            <span key={i} className="text-xs text-cyan-400">
                                {h}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-lg font-bold text-cyan-400">{user.neuralBattery}%</p>
                        <p className="text-xs text-slate-500">Battery</p>
                    </div>
                    <div className={`px-2 py-1 rounded-lg bg-gradient-to-r ${leagueConfig.gradient} text-white text-xs font-bold capitalize`}>
                        {user.leagueRank.tier}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// FILTERS PANEL
// ═══════════════════════════════════════════════════════════════════════════

interface FiltersPanelProps {
    filters: UserSearchFilters;
    onFiltersChange: (filters: UserSearchFilters) => void;
    onClose: () => void;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({ filters, onFiltersChange, onClose }) => {
    const leagues: LeagueTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'elite'];
    const devices: SensorDeviceType[] = ['neural-skin', 'groundtruth', 'aerolung', 'aerovision', 'racket'];

    return (
        <motion.div
            className="p-4 rounded-xl bg-slate-800 border border-slate-700 mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-white flex items-center gap-2">
                    <FiFilter size={16} />
                    Filtros Avanzados
                </h4>
                <button onClick={onClose} className="text-slate-400 hover:text-white">
                    <FiX size={18} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Neural Battery Range */}
                <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">
                        Neural Battery Mínima
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.minNeuralBattery || 0}
                        onChange={(e) => onFiltersChange({
                            ...filters,
                            minNeuralBattery: Number(e.target.value)
                        })}
                        className="w-full accent-cyan-500"
                    />
                    <p className="text-sm text-cyan-400 mt-1">
                        {filters.minNeuralBattery || 0}%+
                    </p>
                </div>

                {/* League Filter */}
                <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">
                        Liga
                    </label>
                    <select
                        value={filters.league || ''}
                        onChange={(e) => onFiltersChange({
                            ...filters,
                            league: e.target.value as LeagueTier || undefined
                        })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    >
                        <option value="">Todas</option>
                        {leagues.map(league => (
                            <option key={league} value={league} className="capitalize">
                                {league.charAt(0).toUpperCase() + league.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Device Filter */}
                <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">
                        Hardware
                    </label>
                    <select
                        value={filters.hasDevice || ''}
                        onChange={(e) => onFiltersChange({
                            ...filters,
                            hasDevice: e.target.value as SensorDeviceType || undefined
                        })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    >
                        <option value="">Cualquiera</option>
                        {devices.map(device => (
                            <option key={device} value={device}>
                                {device.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Live Only Toggle */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="liveOnly"
                        checked={filters.isLive === true}
                        onChange={(e) => onFiltersChange({
                            ...filters,
                            isLive: e.target.checked ? true : undefined
                        })}
                        className="w-5 h-5 rounded accent-red-500"
                    />
                    <label htmlFor="liveOnly" className="text-sm text-white flex items-center gap-2">
                        <FiRadio className="text-red-400" />
                        Solo EN VIVO
                    </label>
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                    <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">
                        Ubicación
                    </label>
                    <div className="relative">
                        <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Ciudad, país..."
                            value={filters.location || ''}
                            onChange={(e) => onFiltersChange({
                                ...filters,
                                location: e.target.value || undefined
                            })}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                        />
                    </div>
                </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
                <button
                    onClick={() => onFiltersChange({})}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                    Limpiar Filtros
                </button>
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface UserSearchProps {
    onSelectUser?: (user: UserProfile) => void;
    embedded?: boolean;
}

const UserSearch: React.FC<UserSearchProps> = ({ onSelectUser, embedded = false }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const inputRef = useRef<HTMLInputElement>(null);

    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState<UserSearchFilters>({});
    const [results, setResults] = useState<UserSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [focused, setFocused] = useState(false);

    // Debounced search query
    const debouncedQuery = useDebounce(query, 300);

    // Perform search
    useEffect(() => {
        const performSearch = async () => {
            if (!debouncedQuery && Object.keys(filters).length === 0) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const searchResults = await SocialService.searchUsers({
                    ...filters,
                    query: debouncedQuery || undefined
                });
                setResults(searchResults);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [debouncedQuery, filters]);

    // Handle user selection
    const handleSelectUser = (user: UserProfile) => {
        if (onSelectUser) {
            onSelectUser(user);
        } else {
            navigate(`/profile/${user.username}`);
        }
        setQuery('');
        setFocused(false);
    };

    // Keyboard shortcut to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

    return (
        <div className={`relative ${embedded ? 'z-40' : 'w-full max-w-2xl mx-auto'}`} style={{ zIndex: focused ? 100 : 'auto' }}>
            {/* Search Input */}
            <div className={`relative flex items-center ${focused ? 'ring-2 ring-cyan-500/50' : ''} rounded-xl transition-all`}>
                <div className="absolute left-4 text-slate-400">
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <FiSearch size={20} />
                    )}
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 200)}
                    placeholder={t('buscarUsuarios') || 'Buscar atletas por nombre, club, o nivel...'}
                    className="w-full pl-12 pr-24 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />

                <div className="absolute right-3 flex items-center gap-2">
                    {/* Keyboard shortcut hint */}
                    <kbd className="hidden md:flex items-center gap-1 px-2 py-1 rounded bg-slate-700 text-xs text-slate-400">
                        <span>⌘</span>K
                    </kbd>

                    {/* Filter toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg transition-colors ${hasActiveFilters || showFilters
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                    >
                        <FiFilter size={18} />
                    </button>

                    {/* Clear button */}
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="p-2 text-slate-400 hover:text-white"
                        >
                            <FiX size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <FiltersPanel
                        filters={filters}
                        onFiltersChange={setFilters}
                        onClose={() => setShowFilters(false)}
                    />
                )}
            </AnimatePresence>

            {/* Results Dropdown */}
            <AnimatePresence>
                {(focused || results.length > 0) && (query || hasActiveFilters) && (
                    <motion.div
                        className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 max-h-96 overflow-auto"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {results.length > 0 ? (
                            <div className="p-2 space-y-2">
                                {results.map(result => (
                                    <UserCard
                                        key={result.user.id}
                                        user={result.user}
                                        highlights={result.highlights}
                                        onClick={() => handleSelectUser(result.user)}
                                    />
                                ))}
                            </div>
                        ) : !loading && (query || hasActiveFilters) ? (
                            <div className="p-8 text-center">
                                <FiUser size={32} className="mx-auto text-slate-600 mb-3" />
                                <p className="text-slate-400">No se encontraron usuarios</p>
                                <p className="text-sm text-slate-600 mt-1">
                                    Intenta con otros términos o filtros
                                </p>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserSearch;
