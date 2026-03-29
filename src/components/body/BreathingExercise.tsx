import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiWind, FiPlay, FiPause, FiSmartphone } from 'react-icons/fi';

interface BreathingExerciseProps {
    onClose: () => void;
}

type BreathingPhase = 'inhale' | 'hold_in' | 'exhale' | 'hold_out' | 'idle';

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onClose }) => {
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<BreathingPhase>('idle');
    const [cycleCount, setCycleCount] = useState(0);

    // Vibration Patterns (in ms)
    const VIBRATION = {
        INHALE: [100, 100, 100, 100], // Stronger ticking to be felt
        EXHALE: [400], // Long solid pulse
        HOLD: [50] // Short blip
    };

    const isSupported = typeof navigator !== 'undefined' && !!navigator.vibrate;
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

    const PHASE_DURATION = 4000; // 4 seconds Box Breathing

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const triggerHaptic = (pattern: number[]) => {
        if (isSupported && !isIOS) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                // Silently fail if blocked
            }
        }
    };

    const nextPhase = useCallback((current: BreathingPhase) => {
        switch (current) {
            case 'idle': return 'inhale';
            case 'inhale': return 'hold_in';
            case 'hold_in': return 'exhale';
            case 'exhale': return 'hold_out';
            case 'hold_out': return 'inhale';
            default: return 'idle';
        }
    }, []);

    const getInstruction = (p: BreathingPhase) => {
        switch (p) {
            case 'idle': return 'Listo para comenzar';
            case 'inhale': return 'Inhala (Nariz)';
            case 'hold_in': return 'Mantén';
            case 'exhale': return 'Exhala (Boca)';
            case 'hold_out': return 'Mantén';
        }
    };

    const getPhaseColor = (p: BreathingPhase) => {
        switch (p) {
            case 'inhale': return 'text-cyan-400';
            case 'hold_in': return 'text-emerald-400';
            case 'exhale': return 'text-indigo-400';
            case 'hold_out': return 'text-slate-400';
            default: return 'text-white';
        }
    };

    const runPhase = useCallback((newPhase: BreathingPhase) => {
        setPhase(newPhase);

        // Haptics and Logic
        switch (newPhase) {
            case 'inhale':
                triggerHaptic(VIBRATION.INHALE);
                setCycleCount(c => c + 1);
                break;
            case 'exhale':
                triggerHaptic(VIBRATION.EXHALE);
                break;
            case 'hold_in':
            case 'hold_out':
                triggerHaptic(VIBRATION.HOLD);
                break;
        }

        // Timer for next phase
        timerRef.current = setTimeout(() => {
            if (newPhase === 'idle') return;
            const next = nextPhase(newPhase);
            runPhase(next);
        }, PHASE_DURATION);

    }, [nextPhase, VIBRATION.INHALE, VIBRATION.EXHALE, VIBRATION.HOLD]);

    const startSession = () => {
        // Trigger immediate "wake up" vibration on user gesture
        if (isSupported && !isIOS) {
            try { navigator.vibrate(200); } catch (e) { }
        }

        setIsActive(true);
        setCycleCount(0);
        runPhase('inhale');
    };

    const stopSession = () => {
        setIsActive(false);
        setPhase('idle');
        if (timerRef.current) clearTimeout(timerRef.current);
        if (isSupported && !isIOS) navigator.vibrate(0); // Stop any ongoing vibration
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (isSupported && !isIOS) navigator.vibrate(0);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
        >
            {/* Sticky Close Button - Always visible at top right */}
            <div className="absolute top-0 right-0 p-4 z-[100]">
                <button
                    onClick={() => { stopSession(); onClose(); }}
                    className="bg-black/50 hover:text-white text-white/70 rounded-full p-3 backdrop-blur-md border border-white/10 transition-all shadow-lg active:scale-95"
                >
                    <FiX className="text-2xl" />
                </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="w-full h-full overflow-y-auto flex flex-col items-center justify-center p-6">

                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto pt-10 md:pt-16">
                    <h2 className="text-xl md:text-2xl font-light text-white mb-2 flex items-center gap-2">
                        <FiWind /> Respiración Guiada
                    </h2>
                    <p className="text-slate-400 text-xs md:text-sm text-center mb-6 md:mb-12">
                        Sigue el ritmo de la animación para relajarte.
                        <br />
                        {(isSupported && !isIOS) ? (
                            <span className="text-[10px] md:text-xs opacity-50 flex items-center justify-center gap-1 mt-2 text-green-400"><FiSmartphone /> Vibración activada</span>
                        ) : (
                            <span className="text-[10px] md:text-xs opacity-50 flex items-center justify-center gap-1 mt-2 text-amber-400"><FiSmartphone /> Vibración no disponible en este dispositivo</span>
                        )}
                    </p>

                    {/* ANIMATION CIRCLE */}
                    <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center mb-8 md:mb-12">
                        {/* Outer Rings */}
                        <motion.div
                            className="absolute inset-0 rounded-full border border-white/10"
                            animate={{
                                scale: phase === 'inhale' ? 1.5 : (phase === 'exhale' ? 0.8 : 1),
                                opacity: phase === 'idle' ? 0.1 : 0.5
                            }}
                            transition={{ duration: 4, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute inset-4 rounded-full border border-white/10"
                            animate={{
                                scale: phase === 'inhale' ? 1.3 : (phase === 'exhale' ? 0.9 : 1),
                                opacity: phase === 'idle' ? 0.1 : 0.3
                            }}
                            transition={{ duration: 4, ease: "easeInOut" }}
                        />

                        {/* Core Breathing Circle */}
                        <motion.div
                            className={`w-28 h-28 md:w-32 md:h-32 rounded-full blur-2xl transition-colors duration-1000 ${phase === 'inhale' ? 'bg-cyan-500' :
                                    phase === 'hold_in' ? 'bg-emerald-500' :
                                        phase === 'exhale' ? 'bg-indigo-500' :
                                            'bg-slate-700'
                                }`}
                            animate={{
                                scale: phase === 'inhale' ? 2 : (phase === 'exhale' ? 0.5 : 1.2),
                                opacity: phase === 'idle' ? 0.2 : 0.8
                            }}
                            transition={{ duration: 4, ease: "easeInOut" }}
                        />

                        {/* Text Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                            <span className={`text-xl md:text-2xl font-bold transition-colors duration-500 ${getPhaseColor(phase)}`}>
                                {getInstruction(phase)}
                            </span>
                            {isActive && <span className="text-[10px] md:text-xs text-white/30 mt-2">Ciclo {cycleCount}</span>}
                        </div>
                    </div>

                    {/* CONTROLS */}
                    {!isActive ? (
                        <button
                            onClick={startSession}
                            className="flex items-center gap-3 px-8 py-3 md:py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)] text-sm md:text-base"
                        >
                            <FiPlay className="fill-black" /> Comenzar
                        </button>
                    ) : (
                        <button
                            onClick={stopSession}
                            className="flex items-center gap-3 px-8 py-3 md:py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-colors border border-white/10 text-sm md:text-base"
                        >
                            <FiPause /> Detener
                        </button>
                    )}
                </div>

                <div className="text-center text-xs text-white/20 pb-4">
                    Técnica 'Box Breathing' (4-4-4-4)
                </div>
            </div>
        </motion.div>
    );
};

export default BreathingExercise;
