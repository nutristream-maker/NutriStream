import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import { LOGO_BASE64 } from '../../assets/LogoBase64';

type AuthView = 'login' | 'register' | 'forgot-password';

interface AuthWrapperProps {
    children: React.ReactNode;
}

/* Inline keyframes for the splash screen */
const splashStyles = `
@keyframes ns-fade-up {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes ns-progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@keyframes ns-pulse-subtle {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
`;

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const { currentUser, loading } = useAuth();
    const [authView, setAuthView] = useState<AuthView>('login');

    // Show professional loading screen while checking auth state
    if (loading) {
        return (
            <>
                <style>{splashStyles}</style>
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#0f172a',
                        fontFamily: "'Inter', sans-serif",
                    }}
                >
                    {/* Content */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '32px',
                        animation: 'ns-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
                    }}>
                        {/* Logo */}
                        <img
                            src={LOGO_BASE64}
                            alt="NutriStream"
                            style={{
                                width: '140px',
                                height: '140px',
                                objectFit: 'contain',
                                filter: 'brightness(0) invert(1)',
                                opacity: 0.9,
                            }}
                        />

                        {/* Brand */}
                        <div style={{ textAlign: 'center' }}>
                            <h1 style={{
                                fontSize: '24px',
                                fontWeight: 600,
                                letterSpacing: '-0.01em',
                                margin: 0,
                                color: '#e2e8f0',
                                lineHeight: 1.2,
                            }}>
                                NutriStream
                            </h1>
                        </div>

                        {/* Progress indicator */}
                        <div style={{ width: '140px' }}>
                            <div style={{
                                height: '2px',
                                borderRadius: '2px',
                                background: 'rgba(255,255,255,0.06)',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    width: '40%',
                                    height: '100%',
                                    borderRadius: '2px',
                                    background: '#3b82f6',
                                    animation: 'ns-progress 1.2s ease-in-out infinite',
                                }} />
                            </div>
                            <p style={{
                                textAlign: 'center',
                                fontSize: '12px',
                                color: 'rgba(148, 163, 184, 0.5)',
                                margin: '12px 0 0 0',
                                fontWeight: 400,
                                animation: 'ns-pulse-subtle 2s ease-in-out infinite',
                            }}>
                                Cargando...
                            </p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Show auth pages if not logged in
    if (!currentUser) {
        switch (authView) {
            case 'register':
                return (
                    <RegisterPage
                        onSwitchToLogin={() => setAuthView('login')}
                    />
                );
            case 'forgot-password':
                return (
                    <ForgotPasswordPage
                        onBack={() => setAuthView('login')}
                    />
                );
            case 'login':
            default:
                return (
                    <LoginPage
                        onSwitchToRegister={() => setAuthView('register')}
                        onForgotPassword={() => setAuthView('forgot-password')}
                    />
                );
        }
    }

    // User is authenticated, show the app
    return <>{children}</>;
};

export default AuthWrapper;
