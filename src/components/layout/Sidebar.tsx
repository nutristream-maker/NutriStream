import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiActivity, FiTrendingUp, FiCamera, FiUsers, FiShoppingCart, FiHeart, FiUser, FiDroplet, FiEye, FiWind, FiTarget, FiPlay, FiCpu, FiRadio } from 'react-icons/fi';
import { GiMuscleUp, GiBrain, GiTennisRacket } from 'react-icons/gi';
import { FaShoePrints } from 'react-icons/fa';
import { Button } from '../ui/Shared';

import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
    isSidebarOpen: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = React.memo(({ isSidebarOpen, onClose }) => {
    // Helper to close sidebar on mobile only when navigating
    const handleMobileNav = () => {
        if (window.innerWidth < 768 && onClose) {
            onClose();
        }
    };
    const { t } = useLanguage();

    const navItems = {
        main: [
            { id: '/', label: t('dashboard'), icon: FiActivity },
            { id: '/nexus', label: 'Nexus', icon: FiRadio },
            { id: '/clubhub', label: 'ClubHub', icon: FiUsers },
        ],
        training: [
            { id: '/training-center', label: t('centroEntrenamiento'), icon: FiTarget },

            { id: '/rendimiento', label: t('rendimiento'), icon: FiTrendingUp },
            { id: '/technique-analysis', label: 'Análisis Técnica IA', icon: FiCamera },
        ],
        health: [
            { id: '/cuerpo', label: t('cuerpo'), icon: GiMuscleUp },
            { id: '/historial-medico', label: t('historialMedico'), icon: FiHeart },
            { id: '/chef-ai', label: t('chefAI'), icon: GiBrain },
        ],
        services: [
            { id: '/especialistas', label: t('especialistas'), icon: FiUsers },
            { id: '/marketplace', label: t('marketplace'), icon: FiShoppingCart },
        ],
        hardware: [
            { id: '/dispositivos', label: t('centroDispositivos') || 'Centro de Dispositivos', icon: FiCpu },
        ]
    };


    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <aside className={`fixed top-0 left-0 h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl z-40 transition-transform md:transition-all duration-300 ease-in-out flex flex-col shadow-2xl 
                ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'} 
                md:translate-x-0`}>
                <div className={`flex items-center gap-2 p-4 shrink-0 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                            <img
                                src="/logo.png"
                                alt="NutriStream Logo"
                                className="w-full h-full object-contain dark:invert"
                            />
                        </div>
                        {isSidebarOpen && <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">NutriStream</h1>}
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <nav className="flex-grow p-4 space-y-6 overflow-y-auto no-scrollbar">
                    {/* MAIN */}
                    <div>
                        <p className={`px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'text-center'}`}>Principal</p>
                        {navItems.main.map(item => (
                            <NavLink
                                key={item.id}
                                to={item.id}
                                title={item.label}
                                onClick={handleMobileNav}
                                className={({ isActive }) => `w-full flex items-center gap-3 p-3 rounded-lg font-semibold transition-colors text-left ${isActive ? 'bg-primary/20 text-primary' : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50'} ${!isSidebarOpen && 'justify-center'}`}
                            >
                                <span className="text-xl shrink-0"><item.icon /></span>
                                {isSidebarOpen && <span>{item.label}</span>}
                            </NavLink>
                        ))}
                    </div>

                    {/* TRAINING */}
                    <div>
                        <p className={`px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'text-center'}`}>Entrenamiento</p>
                        {navItems.training.map(item => (
                            <NavLink
                                key={item.id}
                                to={item.id}
                                title={item.label}
                                onClick={handleMobileNav}
                                className={({ isActive }) => `w-full flex items-center gap-3 p-3 rounded-lg font-semibold transition-colors text-left ${isActive ? 'bg-primary/20 text-primary' : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50'} ${!isSidebarOpen && 'justify-center'}`}
                            >
                                <span className="text-xl shrink-0"><item.icon /></span>
                                {isSidebarOpen && <span>{item.label}</span>}
                            </NavLink>
                        ))}
                    </div>

                    {/* HEALTH */}
                    <div>
                        <p className={`px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'text-center'}`}>Salud y Cuerpo</p>
                        {navItems.health.map(item => (
                            <NavLink
                                key={item.id}
                                to={item.id}
                                title={item.label}
                                onClick={handleMobileNav}
                                className={({ isActive }) => `w-full flex items-center gap-3 p-3 rounded-lg font-semibold transition-colors text-left ${isActive ? 'bg-primary/20 text-primary' : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50'} ${!isSidebarOpen && 'justify-center'}`}
                            >
                                <span className="text-xl shrink-0"><item.icon /></span>
                                {isSidebarOpen && <span>{item.label}</span>}
                            </NavLink>
                        ))}
                    </div>

                    {/* SERVICES */}
                    <div>
                        <p className={`px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'text-center'}`}>Servicios</p>
                        {navItems.services.map(item => (
                            <NavLink
                                key={item.id}
                                to={item.id}
                                title={item.label}
                                onClick={handleMobileNav}
                                className={({ isActive }) => `w-full flex items-center gap-3 p-3 rounded-lg font-semibold transition-colors text-left ${isActive ? 'bg-primary/20 text-primary' : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50'} ${!isSidebarOpen && 'justify-center'}`}
                            >
                                <span className="text-xl shrink-0"><item.icon /></span>
                                {isSidebarOpen && <span>{item.label}</span>}
                            </NavLink>
                        ))}
                    </div>

                    {/* HARDWARE */}
                    <div>
                        <p className={`px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'text-center'}`}>Hardware</p>
                        {navItems.hardware.map(item => (
                            <NavLink
                                key={item.id}
                                to={item.id}
                                title={item.label}
                                className={({ isActive }) => `w-full flex items-center gap-3 p-3 rounded-lg font-semibold transition-colors text-left ${isActive ? 'bg-primary/20 text-primary' : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50'} ${!isSidebarOpen && 'justify-center'}`}
                            >
                                <span className="text-xl shrink-0"><item.icon /></span>
                                {isSidebarOpen && <span>{item.label}</span>}
                            </NavLink>
                        ))}
                    </div>
                </nav>
                <div className="p-4 border-t border-slate-200/80 dark:border-slate-700/80">
                    <NavLink
                        to="/perfil"
                        className={({ isActive }) => `w-full flex items-center gap-3 p-3 rounded-lg font-semibold transition-colors text-left ${isActive ? 'bg-primary/20 text-primary' : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50'} ${!isSidebarOpen && 'justify-center'}`}
                    >
                        <span className="text-xl shrink-0"><FiUser /></span>
                        {isSidebarOpen && <span>{t('perfil')}</span>}
                    </NavLink>
                </div>
            </aside>
        </>
    );
});

export default Sidebar;
