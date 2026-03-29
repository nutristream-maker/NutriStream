import React, { Suspense, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw } from 'react-icons/fi';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ConnectivityModal from '../connectivity/ConnectivityModal';
import SubscriptionModal from '../ui/SubscriptionModal';
import GamificationModal from '../dashboard/GamificationModal';
import { useUI } from '../../context/UIContext';
import { useUser } from '../../context/UserContext';
import Loading from '../ui/Loading';

const Layout: React.FC = () => {
    const { userData, setUserData } = useUser();
    const {
        isDarkMode,
        setDarkMode,
        isSidebarOpen,
        setSidebarOpen,
        isNotificationsOpen,
        setNotificationsOpen,
        isConnectivityModalOpen,
        setConnectivityModalOpen,
        isSubscriptionModalOpen,
        setSubscriptionModalOpen
    } = useUI();

    const [isGamificationModalOpen, setIsGamificationModalOpen] = useState(false);

    const location = useLocation();

    return (
        <div className={`min-h-screen text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans`}>
            {/* GLOBAL MODALS */}
            <AnimatePresence>
                {isSubscriptionModalOpen && <SubscriptionModal onClose={() => setSubscriptionModalOpen(false)} currentUserPlan={userData.plan} />}
                {isConnectivityModalOpen && <ConnectivityModal onClose={() => setConnectivityModalOpen(false)} setActivePage={() => { }} />}
                {isGamificationModalOpen && <GamificationModal isOpen={isGamificationModalOpen} onClose={() => setIsGamificationModalOpen(false)} />}
            </AnimatePresence>

            {/* LAYOUT */}
            <Sidebar isSidebarOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className={`transition-all duration-300 ease-in-out w-full ${isSidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
                <Navbar
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    isDarkMode={isDarkMode}
                    setDarkMode={setDarkMode}
                    isNotificationsOpen={isNotificationsOpen}
                    setNotificationsOpen={setNotificationsOpen}
                    userData={userData}
                    onOpenConnectivity={() => setConnectivityModalOpen(true)}
                    onOpenGamification={() => setIsGamificationModalOpen(true)}
                />

                <div className="p-8 pb-24">
                    <Suspense fallback={<div className="h-96 relative"><div className="absolute inset-0 flex items-center justify-center"><div className="animate-spin text-4xl text-primary"><FiRefreshCw /></div></div></div>}>
                        <Outlet context={{ userData, setUserData, setSubscriptionModalOpen }} />
                    </Suspense>
                </div>
            </main>
        </div>
    );
};

export default Layout;

