import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UIContextType {
    isDarkMode: boolean;
    setDarkMode: (value: boolean) => void;
    toggleDarkMode: () => void;

    isSidebarOpen: boolean;
    setSidebarOpen: (value: boolean) => void;
    toggleSidebar: () => void;

    isNotificationsOpen: boolean;
    setNotificationsOpen: (value: boolean) => void;
    toggleNotifications: () => void;

    isSubscriptionModalOpen: boolean;
    setSubscriptionModalOpen: (value: boolean) => void;

    isConnectivityModalOpen: boolean;
    setConnectivityModalOpen: (value: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = (): UIContextType => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};

interface UIProviderProps {
    children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
    // Theme State
    const [isDarkMode, setDarkModeState] = useState(() => {
        const saved = localStorage.getItem('nutristream_theme');
        return saved ? saved === 'dark' : true;
    });

    // Sidebar State
    const [isSidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

    // Modal & Dropdown States
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [isSubscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
    const [isConnectivityModalOpen, setConnectivityModalOpen] = useState(false);

    // Theme Effect
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('nutristream_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('nutristream_theme', 'light');
        }
    }, [isDarkMode]);

    // Resize Effect for Sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const setDarkMode = (value: boolean) => setDarkModeState(value);
    const toggleDarkMode = () => setDarkModeState(prev => !prev);
    const toggleSidebar = () => setSidebarOpen(prev => !prev);
    const toggleNotifications = () => setNotificationsOpen(prev => !prev);

    const value: UIContextType = {
        isDarkMode,
        setDarkMode,
        toggleDarkMode,
        isSidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        isNotificationsOpen,
        setNotificationsOpen,
        toggleNotifications,
        isSubscriptionModalOpen,
        setSubscriptionModalOpen,
        isConnectivityModalOpen,
        setConnectivityModalOpen,
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};

export default UIContext;
