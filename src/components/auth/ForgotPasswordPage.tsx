import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiAlertCircle, FiLoader, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

interface ForgotPasswordPageProps {
    onBack: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBack }) => {
    const { resetPassword, error, clearError } = useAuth();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        try {
            await resetPassword(email);
            setIsSuccess(true);
        } catch (err) {
            // Error is handled by context
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <img
                            src="/login-logo.png"
                            alt="NutriStream Logo"
                            className="h-24 w-auto object-contain invert mix-blend-screen"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Restablecer contraseña</h1>
                    <p className="text-slate-400">Te enviaremos un enlace para restablecer tu contraseña</p>
                </div>

                {/* Form Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-xl">
                    {isSuccess ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-4"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                                <FiCheckCircle className="text-4xl text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">¡Correo enviado!</h3>
                            <p className="text-slate-400 mb-6">
                                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                            </p>
                            <button
                                onClick={onBack}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all"
                            >
                                Volver al inicio de sesión
                            </button>
                        </motion.div>
                    ) : (
                        <>
                            {/* Error Alert */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
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

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FiLoader className="animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        'Enviar enlace de recuperación'
                                    )}
                                </button>
                            </form>

                            {/* Back Link */}
                            <button
                                onClick={onBack}
                                className="mt-6 w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
                            >
                                <FiArrowLeft />
                                Volver al inicio de sesión
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
