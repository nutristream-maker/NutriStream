import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider, db } from '../services/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Types
interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: Date;
    preferences: {
        language: string;
        darkMode: boolean;
        notifications: boolean;
    };
    metrics: {
        weight?: number;
        height?: number;
        goalWeight?: number;
        activityLevel?: string;
    };
}

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user profile from Firestore
    const fetchUserProfile = async (uid: string) => {
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserProfile(docSnap.data() as UserProfile);
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
        }
    };

    // Create user profile in Firestore
    const createUserProfile = async (user: User, displayName: string) => {
        const profile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: displayName,
            photoURL: user.photoURL || undefined,
            createdAt: new Date(),
            preferences: {
                language: 'es',
                darkMode: true,
                notifications: true
            },
            metrics: {}
        };

        await setDoc(doc(db, 'users', user.uid), {
            ...profile,
            createdAt: serverTimestamp()
        });

        setUserProfile(profile);
    };

    // Auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await fetchUserProfile(user.uid);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Login with email/password
    const login = async (email: string, password: string) => {
        try {
            setError(null);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            setError(getErrorMessage(err.code));
            throw err;
        }
    };

    // Register with email/password
    const register = async (email: string, password: string, displayName: string) => {
        try {
            setError(null);
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(user, { displayName });
            await createUserProfile(user, displayName);
        } catch (err: any) {
            setError(getErrorMessage(err.code));
            throw err;
        }
    };

    // Login with Google
    const loginWithGoogle = async () => {
        try {
            setError(null);
            const { user } = await signInWithPopup(auth, googleProvider);

            // Check if profile exists, if not create one
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                await createUserProfile(user, user.displayName || 'Usuario');
            } else {
                setUserProfile(docSnap.data() as UserProfile);
            }
        } catch (err: any) {
            setError(getErrorMessage(err.code));
            throw err;
        }
    };

    // Logout
    const logout = async () => {
        try {
            await signOut(auth);
            setUserProfile(null);
        } catch (err: any) {
            setError(getErrorMessage(err.code));
            throw err;
        }
    };

    // Reset password
    const resetPassword = async (email: string) => {
        try {
            setError(null);
            await sendPasswordResetEmail(auth, email);
        } catch (err: any) {
            setError(getErrorMessage(err.code));
            throw err;
        }
    };

    // Update user profile
    const updateUserProfile = async (data: Partial<UserProfile>) => {
        if (!currentUser) return;

        try {
            const docRef = doc(db, 'users', currentUser.uid);
            await setDoc(docRef, data, { merge: true });
            setUserProfile(prev => prev ? { ...prev, ...data } : null);
        } catch (err: any) {
            setError('Error al actualizar el perfil');
            throw err;
        }
    };

    const clearError = () => setError(null);

    const value: AuthContextType = {
        currentUser,
        userProfile,
        loading,
        error,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
        updateUserProfile,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Helper function for error messages in Spanish
const getErrorMessage = (code: string): string => {
    const errorMessages: { [key: string]: string } = {
        'auth/user-not-found': 'No existe una cuenta con este correo electrónico',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
        'auth/invalid-email': 'Correo electrónico inválido',
        'auth/too-many-requests': 'Demasiados intentos. Por favor, espera unos minutos',
        'auth/popup-closed-by-user': 'Inicio de sesión cancelado',
        'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
        'auth/invalid-credential': 'Credenciales inválidas',
        'auth/invalid-api-key': 'Configuración de Firebase incorrecta. Verifica tu API Key.',
        'auth/app-not-authorized': 'Dominio no autorizado para autenticación.',
        'auth/project-not-found': 'Proyecto de Firebase no encontrado.'
    };
    return errorMessages[code] || `Error: ${code || 'Desconocido'}`;
};

export default AuthContext;
