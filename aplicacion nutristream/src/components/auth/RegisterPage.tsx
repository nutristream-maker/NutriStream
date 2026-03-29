import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiAlertCircle, FiLoader, FiCheck } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';

interface RegisterPageProps {
    onSwitchToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
    const { register, loginWithGoogle, error, clearError, loading } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    // Password strength check
    const passwordStrength = {
        hasMinLength: password.length >= 6,
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
    };
    const isPasswordStrong = Object.values(passwordStrength).every(Boolean);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!displayName || !email || !password) {
            setLocalError('Por favor, completa todos los campos');
            return;
        }

        if (password !== confirmPassword) {
            setLocalError('Las contraseñas no coinciden');
            return;
        }

        if (!isPasswordStrong) {
            setLocalError('La contraseña no cumple los requisitos mínimos');
            return;
        }

        if (!acceptedTerms) {
            setLocalError('Debes aceptar los términos y condiciones');
            return;
        }

        setIsSubmitting(true);
        try {
            await register(email, password, displayName);
        } catch (err) {
            // Error is handled by context
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleRegister = async () => {
        setIsSubmitting(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            // Error is handled by context
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayError = localError || error;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center mb-4">
                        <img
                            src="/login-logo.png"
                            alt="NutriStream Logo"
                            className="h-24 w-auto object-contain invert mix-blend-screen"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Crear cuenta</h1>
                    <p className="text-slate-400">Únete a NutriStream hoy</p>
                </div>

                {/* Form Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-xl">
                    {/* Error Alert */}
                    {displayError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
                        >
                            <FiAlertCircle className="text-red-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-400 text-sm">{displayError}</p>
                                <button
                                    onClick={() => { clearError(); setLocalError(null); }}
                                    className="text-red-400/70 text-xs hover:text-red-400 mt-1"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Nombre completo
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    placeholder="Tu nombre"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    placeholder="tu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {/* Password strength indicators */}
                            {password && (
                                <div className="mt-2 space-y-1">
                                    <PasswordRequirement met={passwordStrength.hasMinLength} text="Al menos 6 caracteres" />
                                    <PasswordRequirement met={passwordStrength.hasUppercase} text="Una letra mayúscula" />
                                    <PasswordRequirement met={passwordStrength.hasNumber} text="Un número" />
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Confirmar contraseña
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-slate-700/50 border text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${confirmPassword && password !== confirmPassword
                                        ? 'border-red-500'
                                        : confirmPassword && password === confirmPassword
                                            ? 'border-green-500'
                                            : 'border-slate-600'
                                        }`}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
                            />
                            <label htmlFor="terms" className="text-sm text-slate-400">
                                Acepto los{' '}
                                <a href="#" className="text-cyan-400 hover:text-cyan-300">términos y condiciones</a>
                                {' '}y la{' '}
                                <a href="#" className="text-cyan-400 hover:text-cyan-300">política de privacidad</a>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <FiLoader className="animate-spin" />
                                    Creando cuenta...
                                </>
                            ) : (
                                'Crear cuenta'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-slate-800/50 text-slate-400">o regístrate con</span>
                        </div>
                    </div>

                    {/* Google Register */}
                    <button
                        onClick={handleGoogleRegister}
                        disabled={isSubmitting || loading}
                        className="w-full py-3 rounded-xl bg-white text-slate-800 font-semibold hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        <FcGoogle className="text-xl" />
                        Continuar con Google
                    </button>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-slate-400">
                        ¿Ya tienes una cuenta?{' '}
                        <button
                            onClick={onSwitchToLogin}
                            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                        >
                            Inicia sesión
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

// Helper component for password requirements
const PasswordRequirement: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
    <div className={`flex items-center gap-2 text-xs ${met ? 'text-green-400' : 'text-slate-500'}`}>
        <FiCheck className={met ? 'opacity-100' : 'opacity-30'} />
        <span>{text}</span>
    </div>
);

export default RegisterPage;
