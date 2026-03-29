import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiActivity, FiPlay, FiSmartphone, FiHeart } from 'react-icons/fi';

interface HapticMeditationProps {
    onClose: () => void;
}

const HapticMeditation: React.FC<HapticMeditationProps> = ({ onClose }) => {
    const [isActive, setIsActive] = useState(false);

    // Heartbeat: Lub (strong) - pause - Dub (soft) - long pause
    const HEARTBEAT_PATTERN = [30, 100, 20];

    const isSupported = typeof navigator !== 'undefined' && !!navigator.vibrate;
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startSession = () => {
        if (isSupported && !isIOS) {
            try { navigator.vibrate(30); } catch (e) { }
        }
        setIsActive(true);

        const runHeartbeat = () => {
            if (isSupported && !isIOS) {
                try { navigator.vibrate(HEARTBEAT_PATTERN); } catch (e) { }
            }
        };

        runHeartbeat();
        intervalRef.current = setInterval(runHeartbeat, 1000);
    };

    const stopSession = () => {
        setIsActive(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (isSupported && !isIOS) navigator.vibrate(0);
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (isSupported && !isIOS) navigator.vibrate(0);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center font-light"
        >
            {/* Close Button - Minimalist */}
            <div className="absolute top-8 right-8 z-[70]">
                <button
                    onClick={() => { stopSession(); onClose(); }}
                    className="p-3 text-white/40 hover:text-white transition-colors rounded-full"
                >
                    <FiX size={24} />
                </button>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6">

                {/* Header - Minimalist Typography */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-16"
                >
                    <div className="flex justify-center mb-6">
                        <FiActivity className="text-white/80" size={32} />
                    </div>

                    <h2 className="text-3xl text-white tracking-[0.2em] uppercase font-light mb-2">
                        Resonancia
                    </h2>
                    <p className="text-white/70 text-xs tracking-widest uppercase">
                        Sincronización 60 BPM
                    </p>
                </motion.div>

                {/* Central Animation - Pure Geometry */}
                <div className="relative w-64 h-64 mb-20 flex items-center justify-center">

                    {/* Breathing Guide - Thin Stroke */}
                    {isActive && (
                        <motion.div
                            className="absolute inset-0 rounded-full border border-white/20"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.4, 0.1] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    )}

                    {/* Heartbeat Ripple - Thin Stroke */}
                    {isActive && (
                        <motion.div
                            className="absolute inset-0 rounded-full border border-white/30"
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 0 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                        />
                    )}

                    {/* Central Element - Minimalist Icon */}
                    <div className="relative z-20 flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                        <AnimatePresence mode="wait">
                            {isActive ? (
                                <motion.div
                                    key="active"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1, 1.05, 1] }}
                                        transition={{ duration: 1, repeat: Infinity, times: [0, 0.1, 0.3, 0.4, 1], ease: "easeInOut" }}
                                    >
                                        <FiHeart className="text-3xl text-rose-500 fill-rose-500/20" />
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <FiPlay className="text-3xl text-white/80 ml-1" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Action - Text Only or Simple Border */}
                <div className="h-20 flex flex-col items-center justify-start gap-4">
                    {isActive ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <p className="text-xs text-rose-300 uppercase tracking-widest animate-pulse font-medium">
                                Sincronizando
                            </p>
                            <button
                                onClick={stopSession}
                                className="text-white hover:text-white/80 text-sm tracking-wider uppercase transition-colors border-b border-white/30 pb-1"
                            >
                                Detener
                            </button>
                        </motion.div>
                    ) : (
                        <button
                            onClick={startSession}
                            className="px-10 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition-all text-sm tracking-[0.2em] uppercase font-medium"
                        >
                            Iniciar
                        </button>
                    )}
                </div>

                {!isSupported && (
                    <div className="absolute bottom-8 text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <FiSmartphone /> No Haptics
                    </div>
                )}
            </div>

            {/* Placement instruction - fade in when active */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-12 text-center"
                    >
                        <p className="text-sm text-white/60 tracking-wide font-light">
                            Coloca el dispositivo en tu pecho
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default HapticMeditation;
