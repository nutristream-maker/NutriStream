import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-slate-200 dark:border-slate-700"
                    >
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiAlertTriangle className="text-4xl text-red-500 dark:text-red-400" />
                        </div>

                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                            ¡Vaya! Algo salió mal
                        </h1>

                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Ha ocurrido un error inesperado en la aplicación. No te preocupes, nuestros especialistas ya han sido notificados.
                        </p>

                        <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg mb-6 text-left overflow-auto max-h-32">
                            <code className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                {this.state.error?.toString()}
                            </code>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-full font-semibold transition-colors shadow-lg hover:shadow-primary/30"
                            >
                                <FiRefreshCw /> Reiniciar App
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-full font-semibold transition-colors"
                            >
                                <FiHome /> Ir al Inicio
                            </button>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
