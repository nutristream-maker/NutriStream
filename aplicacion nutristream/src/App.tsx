import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { UIProvider } from './context/UIContext';
import { UserProvider } from './context/UserContext';

// Components
import Layout from './components/layout/Layout';
import AuthWrapper from './components/auth/AuthWrapper';
import Loading from './components/ui/Loading';
import { initialUserData } from './data/mockData';

// Modular Routes
import { CoreRoutes } from './routes/CoreRoutes';
import { PerformanceRoutes } from './routes/PerformanceRoutes';
import { HardwareRoutes } from './routes/HardwareRoutes';
import { SocialRoutes } from './routes/SocialRoutes';

import ErrorBoundary from './components/ui/ErrorBoundary';

const AppContent = () => {
    return (
        <AuthWrapper>
            <ErrorBoundary>
                <Suspense fallback={<Loading />}>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            {CoreRoutes()}
                            {PerformanceRoutes()}
                            {HardwareRoutes()}
                            {SocialRoutes()}

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                    </Routes>
                </Suspense>
            </ErrorBoundary>
        </AuthWrapper>
    );
};

const App = () => {
    return (
        <HelmetProvider>
            <BrowserRouter>
                <AuthProvider>
                    <LanguageProvider>
                        <UIProvider>
                            <UserProvider initialData={initialUserData}>
                                <AppContent />
                            </UserProvider>
                        </UIProvider>
                    </LanguageProvider>
                </AuthProvider>
            </BrowserRouter>
        </HelmetProvider>
    );
};

export default App;

