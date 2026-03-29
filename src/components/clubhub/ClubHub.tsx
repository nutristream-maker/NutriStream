import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FiHome, FiCalendar, FiUsers, FiBarChart2, FiActivity,
    FiSettings, FiRefreshCw, FiZap, FiPackage, FiAlertTriangle, FiFileText, FiAward, FiArrowLeft, FiRadio
} from 'react-icons/fi';
import { Club, Session } from '../../types/ClubTypes';
import { ClubHubService } from '../../services/ClubHubService';
import { useLanguage } from '../../context/LanguageContext';
import SEO from '../common/SEO';

// Club Finder (new)
import ClubFinder from './ClubFinder';

// Core Sub-components
import ClubDashboard from './ClubDashboard';
import SmartSchedule from './SmartSchedule';
import RealTimeAttendance from './RealTimeAttendance';
import TrainerReports from './TrainerReports';
import GroupHeatmap from './GroupHeatmap';

// Pro Features
import GroupEnergySemaphore from './GroupEnergySemaphore';
import LiveLeaderboard from './LiveLeaderboard';
import FlashChallenge from './FlashChallenge';
import InjuryAlert from './InjuryAlert';
import EquipmentReservation from './EquipmentReservation';
import PostSessionReport from './PostSessionReport';
import ServiceCatalog from './ServiceCatalog';
import RoleSelector, { UserRole } from './RoleSelector';
import TrainerDashboard from './TrainerDashboard';
import HUDAlertModal from './HUDAlertModal';
import ClubNexusFeed from './ClubNexusFeed';

type TabType = 'dashboard' | 'services' | 'schedule' | 'attendance' | 'competition' | 'equipment' | 'reports' | 'autoreport' | 'nexus';

const ClubHub: React.FC = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const [club, setClub] = useState<Club | null>(null);
    const [selectedClubId, setSelectedClubId] = useState<string | null>(null); // Track selected club
    const [userRole, setUserRole] = useState<UserRole | null>(null); // Track user role
    const [isLoading, setIsLoading] = useState(false); // Don't auto-load
    const [error, setError] = useState<string | null>(null);
    const [isTrainer, setIsTrainer] = useState(true); // Derived from userRole

    // Selected session for attendance view
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [isHUDModalOpen, setIsHUDModalOpen] = useState(false);

    // Load club when selectedClubId changes
    useEffect(() => {
        if (selectedClubId) {
            loadClubData(selectedClubId);
        }
    }, [selectedClubId]);

    const loadClubData = async (clubId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const clubData = await ClubHubService.getClub(clubId);
            setClub(clubData);
            // Set first upcoming session as default for attendance
            const upcomingSession = clubData.sessions.find(s => s.dateTime >= new Date());
            setSelectedSession(upcomingSession || clubData.sessions[0]);
        } catch (err) {
            setError('Error al cargar datos del club');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClubSelect = (clubId: string, role?: UserRole) => {
        setSelectedClubId(clubId);
        if (role) {
            handleRoleSelect(role);
        }
        // If no role provided, it will show RoleSelector
    };

    const handleRoleSelect = (role: UserRole) => {
        setUserRole(role);
        setIsTrainer(role === 'trainer' || role === 'both');
        // Now load club data
        if (selectedClubId) {
            loadClubData(selectedClubId);
        }
    };

    const handleSwitchClub = () => {
        setSelectedClubId(null);
        setUserRole(null);
        setClub(null);
        setError(null);
    };

    // Define tabs with role visibility
    // 'trainer' = only trainers, 'member' = only members, 'all' = everyone
    const allTabs: { key: TabType; icon: React.ComponentType<{ size?: number; className?: string }>; label: string; pro?: boolean; roles: ('trainer' | 'member' | 'all')[] }[] = [
        { key: 'dashboard', icon: FiHome, label: 'Panel', roles: ['all'] },
        { key: 'services', icon: FiActivity, label: 'Servicios', roles: ['all'] },
        { key: 'schedule', icon: FiCalendar, label: 'Horario', roles: ['all'] },
        { key: 'attendance', icon: FiUsers, label: 'Asistencia', roles: ['trainer'] },
        { key: 'competition', icon: FiAward, label: 'Competición', pro: true, roles: ['all'] },
        { key: 'equipment', icon: FiPackage, label: 'Equipamiento', pro: true, roles: ['trainer'] },
        { key: 'reports', icon: FiBarChart2, label: 'Informes', roles: ['trainer'] },
        { key: 'autoreport', icon: FiFileText, label: 'AI Report', pro: true, roles: ['trainer'] },
        { key: 'nexus', icon: FiRadio, label: 'Nexus', roles: ['all'] },
    ];

    // Filter tabs based on user role
    const tabs = allTabs.filter(tab => {
        if (tab.roles.includes('all')) return true;
        if (userRole === 'both') return true; // Admin sees everything
        if (userRole === 'trainer' && tab.roles.includes('trainer')) return true;
        if (userRole === 'member' && tab.roles.includes('member')) return true;
        return false;
    });

    // Show loading spinner
    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Cargando ClubHub...</p>
                </div>
            </div>
        );
    }

    // Show Club Finder if no club is selected
    if (!selectedClubId) {
        return (
            <>
                <SEO
                    title="ClubHub - Buscar Club"
                    description="Encuentra y únete a tu gimnasio o club deportivo"
                />
                <ClubFinder onClubSelect={handleClubSelect} />
            </>
        );
    }

    // Show Role Selector if club selected but role not yet chosen
    if (!userRole) {
        return (
            <>
                <SEO
                    title={`ClubHub - Seleccionar Rol`}
                    description="Elige cómo deseas acceder al club"
                />
                <RoleSelector
                    clubName={club?.name || 'Club'}
                    onRoleSelect={handleRoleSelect}
                    onBack={handleSwitchClub}
                />
            </>
        );
    }

    // Show loading while club data loads after role selection
    if (!club) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Cargando ClubHub...</p>
                </div>
            </div>
        );
    }

    // Show error with retry for loaded club
    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center p-8 rounded-2xl border border-red-500/20 bg-red-900/10">
                    <p className="text-red-400 font-bold mb-4">{error}</p>
                    <div className="flex items-center gap-3 justify-center">
                        <motion.button
                            onClick={handleSwitchClub}
                            className="px-6 py-3 bg-slate-700 text-white font-bold rounded-xl flex items-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FiArrowLeft size={16} />
                            Cambiar Club
                        </motion.button>
                        <motion.button
                            onClick={() => selectedClubId && loadClubData(selectedClubId)}
                            className="px-6 py-3 bg-cyan-500 text-black font-bold rounded-xl flex items-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FiRefreshCw size={16} />
                            Reintentar
                        </motion.button>
                    </div>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        {/* Trainer Dashboard - shows today's sessions, enrolled users, stats */}
                        {isTrainer && (
                            <TrainerDashboard
                                club={club}
                                onViewSession={(session) => {
                                    setSelectedSession(session);
                                    setActiveTab('attendance');
                                }}
                                onSendHUDAlert={() => setIsHUDModalOpen(true)}
                                onStartFlashChallenge={() => {
                                    setActiveTab('competition');
                                }}
                                onViewAllMembers={() => {
                                    setActiveTab('attendance');
                                }}
                            />
                        )}

                        {/* Neural-Load Balancing Semaphore (Pro Feature #1) */}
                        {isTrainer && (
                            <GroupEnergySemaphore
                                members={club.members}
                                isTrainerView={isTrainer}
                            />
                        )}

                        {/* Injury Risk Watchdog (Pro Feature #3) */}
                        {isTrainer && (
                            <InjuryAlert
                                members={club.members}
                                isTrainerView={isTrainer}
                            />
                        )}

                        {/* HUD Alert Modal */}
                        <HUDAlertModal
                            isOpen={isHUDModalOpen}
                            onClose={() => setIsHUDModalOpen(false)}
                            onSend={async (message, targetType, targetMemberId) => {
                                await ClubHubService.sendHUDAlert(club.id, message, targetType, targetMemberId);
                                // Show success toast or notification if needed
                            }}
                            members={club.members}
                        />

                        {/* General Dashboard for all */}
                        <ClubDashboard club={club} isTrainer={isTrainer} />
                    </div>
                );

            case 'services':
                return <ServiceCatalog clubId={club.id} />;

            case 'schedule':
                return (
                    <SmartSchedule
                        club={club}
                        onAttendanceChange={loadClubData}
                    />
                );

            case 'attendance':
                return selectedSession ? (
                    <div className="space-y-6">
                        {/* Session Selector */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <label className="text-sm font-bold text-slate-400">Sesión:</label>
                            <select
                                value={selectedSession.id}
                                onChange={(e) => {
                                    const session = club.sessions.find(s => s.id === e.target.value);
                                    if (session) setSelectedSession(session);
                                }}
                                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500 outline-none"
                            >
                                {club.sessions.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.title} - {s.dateTime.toLocaleDateString('es-ES')} {s.dateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <RealTimeAttendance
                            session={selectedSession}
                            isTrainerView={isTrainer}
                        />
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-16">No hay sesiones disponibles</p>
                );

            case 'competition':
                // Ghost Pacer & Leaderboards (Pro Feature #2)
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <LiveLeaderboard
                            members={club.members}
                            metric="watts"
                            showTop={8}
                        />
                        <FlashChallenge
                            members={club.members}
                            onAwardPoints={(memberId, points) => {
                                console.log(`Awarded ${points} NutriPoints to ${memberId}`);
                            }}
                        />
                    </div>
                );

            case 'equipment':
                // Smart Equipment Inventory (Pro Feature #4)
                return (
                    <EquipmentReservation
                        sessionId={selectedSession?.id}
                        sessionTitle={selectedSession?.title}
                        memberId="m-1"
                        memberName="Usuario Demo"
                        isTrainerView={isTrainer}
                    />
                );

            case 'reports':
                return (
                    <div className="space-y-6">
                        <TrainerReports club={club} sessions={club.sessions} />
                        <GroupHeatmap clubId={club.id} />
                    </div>
                );

            case 'autoreport':
                // AI Post-Session Autoreport (Pro Feature #5)
                return selectedSession ? (
                    <PostSessionReport
                        session={selectedSession}
                        members={club.members}
                    />
                ) : (
                    <p className="text-slate-500 text-center py-16">Selecciona una sesión para generar el informe</p>
                );

            case 'nexus':
                return <ClubNexusFeed club={club} isTrainer={isTrainer} />;

            default:
                return null;
        }
    };

    return (
        <>
            <SEO
                title="ClubHub Pro - NutriStream"
                description="Gestión avanzada de grupos y equipos de alto rendimiento"
            />

            <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <span className="text-4xl">🏋️</span>
                            {club.name}
                            <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-black rounded-lg">
                                PRO
                            </span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            {club.members.length} miembros • {club.trainers.length} entrenadores • CPI: {club.cpi.value}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Switch Club Button */}
                        <motion.button
                            onClick={handleSwitchClub}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white hover:border-cyan-500/50 transition-colors flex items-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FiArrowLeft size={14} />
                            Cambiar Club
                        </motion.button>

                        <motion.button
                            onClick={loadClubData}
                            className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white hover:border-cyan-500/50 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiRefreshCw size={18} />
                        </motion.button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex bg-white dark:bg-slate-800/50 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700 overflow-x-auto shadow-sm dark:shadow-none">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;

                        return (
                            <motion.button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`
                                    flex-1 min-w-[100px] py-3 px-3 rounded-xl font-bold text-xs
                                    flex items-center justify-center gap-1.5 transition-all relative
                                    ${isActive
                                        ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-black shadow-[0_0_20px_rgba(0,255,255,0.3)]'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                    }
                                `}
                                whileHover={!isActive ? { scale: 1.02 } : {}}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon size={16} />
                                <span className="hidden sm:inline">{tab.label}</span>
                                {tab.pro && !isActive && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderContent()}
                </motion.div>
            </motion.div>
        </>
    );
};

export default ClubHub;
