import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMenu, FiX, FiSun, FiMoon, FiBluetooth } from 'react-icons/fi';
import NotificationCenter from '../common/NotificationCenter';
import LevelBadge from '../dashboard/LevelBadge';

interface NavbarProps {
    isSidebarOpen: boolean;
    setSidebarOpen: (isOpen: boolean) => void;
    isDarkMode: boolean;
    setDarkMode: (isDark: boolean) => void;
    isNotificationsOpen: boolean;
    setNotificationsOpen: (isOpen: boolean) => void;
    userData: any;
    onOpenConnectivity?: () => void;
    onOpenGamification?: () => void;
}

import { useLanguage } from '../../context/LanguageContext';
import { FiGlobe, FiCheck } from 'react-icons/fi';

const LanguageSelector = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = React.useState(false);

    const languages = [
        { code: 'es', label: 'ES', flag: '🇪🇸' },
        { code: 'en', label: 'EN', flag: '🇬🇧' },
        { code: 'ca', label: 'CA', flag: '🏴󠁥󠁳󠁣󠁴󠁿' }, // Using closest flag or just text. Catalan flag not standard emoji, often ES-CT or just text. Using text preferred in prod but emoji for flair. Let's use custom indicator if needed.
        { code: 'fr', label: 'FR', flag: '🇫🇷' },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold text-slate-700 dark:text-slate-300"
            >
                <FiGlobe size={14} />
                <span>{language.toUpperCase()}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-20 py-1"
                        >
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLanguage(lang.code as any);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${language === lang.code ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{lang.flag}</span> {lang.label}
                                    </span>
                                    {language === lang.code && <FiCheck size={12} />}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const Navbar: React.FC<NavbarProps> = React.memo(({ isSidebarOpen, setSidebarOpen, isDarkMode, setDarkMode, isNotificationsOpen, setNotificationsOpen, userData, onOpenConnectivity, onOpenGamification }) => {
    const { t } = useLanguage();
    const location = useLocation();

    // Extract logical page name from path (e.g. "/perfil" -> "perfil", "/" -> "dashboard")
    const activePage = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);

    const getPageTitle = (page: string) => {
        const map: { [key: string]: string } = {
            dashboard: t('dashboard'),
            cuerpo: t('cuerpo'),
            rendimiento: t('rendimiento'),
            especialistas: t('especialistas'),
            marketplace: t('marketplace'),
            'chef-ai': t('chefAI'),
            'historial-medico': t('historialMedico'),
            perfil: t('perfil'),
            'ns-pod': 'Hardware: Neural-Skin POD', // Should add to dict
            'aerovision': 'Hardware: Gafas AeroVision',
            'aerolung': 'Hardware: Máscara AeroLung',
            'groundtruth': 'Hardware: Plantillas GroundTruth',
            'racket-sensor': 'Hardware: Sensor Raqueta',
            'nexus': 'The Nexus',
            'profile': 'Perfil de Atleta',
            'clubhub': 'ClubHub'
        };
        return map[page] || 'NutriStream';
    };
    return (
        <header className="sticky top-0 z-30 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-xl p-4 flex justify-between items-center transition-all">
            <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors">
                    {isSidebarOpen ? <FiX /> : <FiMenu />}
                </button>
                <h2 className="text-2xl font-bold hidden sm:block bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                    {getPageTitle(activePage)}
                </h2>
            </div>
            <div className="flex items-center gap-4">
                {/* Connectivity Button */}
                <button
                    onClick={onOpenConnectivity}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                    <FiBluetooth /> <span className="hidden md:inline">{t('dispositivos')}</span>
                </button>

                {/* Language Switcher */}
                <LanguageSelector />

                <button onClick={() => setDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors">
                    {isDarkMode ? <span className="text-yellow-400"><FiSun /></span> : <span className="text-slate-600"><FiMoon /></span>}
                </button>

                {/* Notification Center */}
                <NotificationCenter />

                {/* Level Badge */}
                <LevelBadge onClick={onOpenGamification} />

                <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                    {userData.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
            </div>
        </header>
    );
});

export default Navbar;
