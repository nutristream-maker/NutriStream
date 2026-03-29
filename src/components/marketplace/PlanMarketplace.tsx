import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiUsers, FiClock, FiShoppingCart, FiCheck, FiSearch, FiFilter, FiChevronDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import { Card, Button } from '../ui/Shared';
import {
    getMockPlans,
    formatPrice,
    getDiscountPercentage,
    searchPlans,
    filterByCategory,
    sortPlans,
    TrainingPlan,
    PlanCategory,
    PLAN_CATEGORIES,
    PLAN_DIFFICULTIES
} from '../../services/SpecialistPlanService';

interface PlanCardProps {
    plan: TrainingPlan;
    onPurchase?: (planId: string) => void;
}

import PlanDetailsModal from './PlanDetailsModal';

// ... (PlanCardProps and imports remain)

const PlanCard: React.FC<PlanCardProps> = ({ plan, onPurchase }) => {
    const categoryConfig = PLAN_CATEGORIES[plan.category];
    const difficultyConfig = PLAN_DIFFICULTIES[plan.difficulty];
    const hasDiscount = plan.discountPrice && plan.discountPrice < plan.price;

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col cursor-pointer group"
            onClick={() => onPurchase && onPurchase(plan.id)}
        >
            {/* Header with category */}
            <div className={`h-2 bg-gradient-to-r from-${categoryConfig.color}-500 to-${categoryConfig.color}-600`} />

            <div className="p-5 flex-1 flex flex-col">
                {/* Category & Difficulty badges */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{categoryConfig.icon}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-${categoryConfig.color}-100 text-${categoryConfig.color}-700 dark:bg-${categoryConfig.color}-900/30 dark:text-${categoryConfig.color}-300 font-medium`}>
                        {categoryConfig.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-${difficultyConfig.color}-100 text-${difficultyConfig.color}-700 dark:bg-${difficultyConfig.color}-900/30 dark:text-${difficultyConfig.color}-300 font-medium`}>
                        {difficultyConfig.label}
                    </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{plan.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {plan.shortDescription}
                </p>

                {/* Specialist */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {plan.specialist.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-medium flex items-center gap-1">
                            {plan.specialist.name}
                            {plan.specialist.verified && (
                                <FiCheck className="text-blue-500" size={12} />
                            )}
                        </p>
                        <p className="text-xs text-slate-500">{plan.specialist.title}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                        <FiStar className="text-amber-500" />
                        {plan.rating.toFixed(1)} ({plan.reviewCount})
                    </span>
                    <span className="flex items-center gap-1">
                        <FiUsers />
                        {plan.salesCount}
                    </span>
                    <span className="flex items-center gap-1">
                        <FiClock />
                        {plan.durationWeeks} sem
                    </span>
                </div>

                {/* Price & CTA */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div>
                        {hasDiscount ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-emerald-600">
                                    {formatPrice(plan.discountPrice!, plan.currency)}
                                </span>
                                <span className="text-sm text-slate-400 line-through">
                                    {formatPrice(plan.price, plan.currency)}
                                </span>
                                <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                                    -{getDiscountPercentage(plan.price, plan.discountPrice!)}%
                                </span>
                            </div>
                        ) : (
                            <span className="text-xl font-bold">
                                {formatPrice(plan.price, plan.currency)}
                            </span>
                        )}
                    </div>
                    <Button
                        className="!py-2 !px-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        icon={FiSearch}
                        onClick={(e) => {
                            e.stopPropagation();
                            onPurchase && onPurchase(plan.id);
                        }}
                    >
                        Ver Detalles
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

const PlanMarketplace: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<PlanCategory | 'all'>('all');
    const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'price_asc' | 'price_desc' | 'newest'>('popularity');
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    const allPlans = getMockPlans();

    const filteredPlans = useMemo(() => {
        let plans = allPlans;

        // Search
        if (searchQuery) {
            plans = searchPlans(searchQuery, plans);
        }

        // Category filter
        if (selectedCategory !== 'all') {
            plans = filterByCategory(selectedCategory, plans);
        }

        // Sort
        plans = sortPlans(plans, sortBy);

        return plans;
    }, [allPlans, searchQuery, selectedCategory, sortBy]);

    const handleViewDetails = (planId: string) => {
        setSelectedPlanId(planId);
    };

    const handlePurchase = (planId: string) => {
        console.log('Purchase plan:', planId);
        // TODO: Implement actual purchase flow
        alert('¡Gracias por tu interés! La pasarela de pago estará disponible pronto.');
        setSelectedPlanId(null);
    };

    const selectedPlan = useMemo(() =>
        allPlans.find(p => p.id === selectedPlanId) || null
        , [allPlans, selectedPlanId]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Planes de Entrenamiento
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Planes creados por especialistas verificados
                </p>
            </div>

            {/* Filters */}
            <Card className="!p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar planes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Category filter */}
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as PlanCategory | 'all')}
                            className="appearance-none pl-4 pr-10 py-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
                        >
                            <option value="all">Todas las categorías</option>
                            {Object.entries(PLAN_CATEGORIES).map(([key, config]) => (
                                <option key={key} value={key}>
                                    {config.icon} {config.label}
                                </option>
                            ))}
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="appearance-none pl-4 pr-10 py-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
                        >
                            <option value="popularity">Más vendidos</option>
                            <option value="rating">Mejor valorados</option>
                            <option value="newest">Más recientes</option>
                            <option value="price_asc">Precio: Menor a mayor</option>
                            <option value="price_desc">Precio: Mayor a menor</option>
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </Card>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlans.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} onPurchase={handleViewDetails} />
                ))}
            </div>

            {/* Empty state */}
            {filteredPlans.length === 0 && (
                <Card className="!p-12 text-center">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold mb-2">No se encontraron planes</h3>
                    <p className="text-slate-500 dark:text-slate-400">
                        Intenta ajustar los filtros o buscar con otras palabras
                    </p>
                </Card>
            )}

            {/* Details Modal */}
            <PlanDetailsModal
                plan={selectedPlan}
                onClose={() => setSelectedPlanId(null)}
                onPurchase={handlePurchase}
            />
        </div>
    );
};

export default PlanMarketplace;
