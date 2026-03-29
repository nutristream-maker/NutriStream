import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
    onSwitchToRegister: () => void;
    onForgotPassword: () => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const logoVariants = {
    hidden: { scale: 0, opacity: 0, rotate: -180 },
    visible: {
        scale: 1,
        opacity: 1,
        rotate: 0,
        transition: { type: "spring", stiffness: 200, damping: 20 }
    },
    float: {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister, onForgotPassword }) => {
    const { login, loginWithGoogle, error, clearError, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsSubmitting(true);
        console.log('Attempting login with:', email);
        try {
            await login(email, password);
            console.log('Login successful');
        } catch (err: any) {
            console.error('Login error:', err);
            // Error is handled by context, checking if it persists
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            // Error is handled by context
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md"
            >
                {/* Logo */}
                <motion.div variants={itemVariants} className="text-center mb-8">
                    <motion.div
                        variants={logoVariants}
                        animate={["visible", "float"]}
                        className="inline-flex items-center justify-center mb-4"
                    >
                        <img
                            src="/login-logo.png"
                            alt="NutriStream Logo"
                            className="h-24 w-auto object-contain invert mix-blend-screen"
                        />
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white mb-2">NutriStream</motion.h1>
                    <motion.p variants={itemVariants} className="text-slate-400">Inicia sesión para continuar</motion.p>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    variants={itemVariants}
                    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-xl"
                >
                    {/* Error Alert */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 overflow-hidden"
                        >
                            <FiAlertCircle className="text-red-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-400 text-sm">{error}</p>
                                <button
                                    onClick={clearError}
                                    className="text-red-400/70 text-xs hover:text-red-400 mt-1"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <motion.input
                                    whileFocus={{ scale: 1.02 }}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    placeholder="tu@email.com"
                                    required
                                />
                            </div>
                        </motion.div>

                        {/* Password */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <motion.input
                                    whileFocus={{ scale: 1.02 }}
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
                        </motion.div>

                        {/* Forgot Password */}
                        <motion.div variants={itemVariants} className="text-right">
                            <button
                                type="button"
                                onClick={onForgotPassword}
                                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmitting || loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <FiLoader className="animate-spin" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                'Iniciar sesión'
                            )}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <motion.div variants={itemVariants} className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-slate-800/50 text-slate-400">o continúa con</span>
                        </div>
                    </motion.div>

                    {/* Google Login */}
                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGoogleLogin}
                        disabled={isSubmitting || loading}
                        className="w-full py-3 rounded-xl bg-white text-slate-800 font-semibold hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        <FcGoogle className="text-xl" />
                        Continuar con Google
                    </motion.button>

                    {/* Register Link */}
                    <motion.p variants={itemVariants} className="mt-6 text-center text-slate-400">
                        ¿No tienes una cuenta?{' '}
                        <button
                            onClick={onSwitchToRegister}
                            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                        >
                            Regístrate
                        </button>
                    </motion.p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
