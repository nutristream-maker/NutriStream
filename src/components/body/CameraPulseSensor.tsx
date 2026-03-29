import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiX, FiHeart, FiAlertTriangle, FiZap } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

interface CameraPulseSensorProps {
    onResult: (bpm: number) => void;
    onClose: () => void;
}

const CameraPulseSensor: React.FC<CameraPulseSensorProps> = ({ onResult, onClose }) => {
    const { t } = useLanguage();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [status, setStatus] = useState<'idle' | 'initializing' | 'waiting_finger' | 'measuring' | 'complete' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [remainingTime, setRemainingTime] = useState(12);
    const [currentBpm, setCurrentBpm] = useState<number | null>(null);
    const [signalHistory, setSignalHistory] = useState<number[]>([]);
    const [torchEnabled, setTorchEnabled] = useState(false);
    const [torchSupported, setTorchSupported] = useState<boolean | null>(null);
    const [fingerReady, setFingerReady] = useState(false);
    const [lastBeatTime, setLastBeatTime] = useState(0);
    const [debugPeaks, setDebugPeaks] = useState(0);
    const [fps, setFps] = useState(0);
    const [debugAmp, setDebugAmp] = useState(0);
    const [debugVal, setDebugVal] = useState(0);
    const [debugElapsed, setDebugElapsed] = useState(0);

    const MEASUREMENT_DURATION_MS = 12000;
    const MIN_SAMPLES_FOR_BPM = 60;

    // REFS
    const statusRef = useRef(status);
    const fingerReadyRef = useRef(fingerReady);
    const rawSamplesRef = useRef<{ time: number, value: number }[]>([]);
    const measurementStartTimeRef = useRef<number>(0);
    const animationFrameRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number>(0);
    const framesCountRef = useRef<number>(0);
    const missingFingerFramesRef = useRef<number>(0);
    const lowLightFramesRef = useRef<number>(0);
    const debugFrameCounterRef = useRef(0);
    const stableFingerCountRef = useRef<number>(0);

    useEffect(() => { statusRef.current = status; }, [status]);
    useEffect(() => { fingerReadyRef.current = fingerReady; }, [fingerReady]);

    // Handle Unmount cleanup
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const stopCamera = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setTorchEnabled(false);
    }, []);

    const calculateBpm = useCallback((samples: { time: number, value: number }[]): number | null => {
        if (samples.length < 5) return null;

        const values = samples.map(s => s.value);
        const times = samples.map(s => s.time);

        const smoothed: number[] = [];
        const smoothWin = 15;
        for (let i = 0; i < values.length; i++) {
            let sum = 0;
            let count = 0;
            for (let j = Math.max(0, i - smoothWin); j <= Math.min(values.length - 1, i + smoothWin); j++) {
                sum += values[j];
                count++;
            }
            smoothed.push(sum / count);
        }

        const minVal = Math.min(...smoothed);
        const maxVal = Math.max(...smoothed);
        const amplitude = maxVal - minVal;

        if (debugFrameCounterRef.current % 15 === 0) setDebugAmp(amplitude);

        if (samples.length < MIN_SAMPLES_FOR_BPM) return null;
        if (amplitude < 2) return null;

        const dynamicThreshold = minVal + (amplitude * 0.40);
        const peakIndices: number[] = [];

        for (let i = 5; i < smoothed.length - 5; i++) {
            if (smoothed[i] > dynamicThreshold &&
                smoothed[i] >= smoothed[i - 1] && smoothed[i] >= smoothed[i - 2] && smoothed[i] >= smoothed[i - 3] &&
                smoothed[i] >= smoothed[i + 1] && smoothed[i] >= smoothed[i + 2] && smoothed[i] >= smoothed[i + 3]) {
                const time = times[i];
                if (peakIndices.length === 0 || (time - times[peakIndices[peakIndices.length - 1]] > 300)) {
                    peakIndices.push(i);
                }
            }
        }

        if (debugFrameCounterRef.current % 15 === 0) setDebugPeaks(peakIndices.length);

        if (peakIndices.length < 2) return null;

        const intervals: number[] = [];
        for (let i = 1; i < peakIndices.length; i++) {
            const interval = times[peakIndices[i]] - times[peakIndices[i - 1]];
            if (interval >= 300 && interval <= 1500) {
                intervals.push(interval);
            }
        }

        if (intervals.length < 2) return null;

        intervals.sort((a, b) => a - b);
        const medianInterval = intervals[Math.floor(intervals.length / 2)];

        const bpm = 60000 / medianInterval;

        return (bpm >= 40 && bpm <= 220) ? Math.round(bpm) : null;
    }, []);

    const processCameraFrame = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        debugFrameCounterRef.current++;

        if (!ctx || video.readyState < video.HAVE_CURRENT_DATA) {
            animationFrameRef.current = requestAnimationFrame(processCameraFrame);
            return;
        }

        const now = performance.now();

        framesCountRef.current++;
        if (now - lastFrameTimeRef.current >= 1000) {
            setFps(framesCountRef.current);
            framesCountRef.current = 0;
            lastFrameTimeRef.current = now;
        }

        try {
            ctx.drawImage(video, 0, 0, 50, 50);

            const imageData = ctx.getImageData(0, 0, 50, 50);
            const data = imageData.data;

            let totalRed = 0;
            let totalGreen = 0;
            let validPixels = 0;
            for (let i = 0; i < data.length; i += 4) {
                totalRed += data[i];
                totalGreen += data[i + 1];
                validPixels++;
            }
            const avgRed = totalRed / validPixels;
            const avgGreen = totalGreen / validPixels;

            // --- RELAXED FINGER VALIDATION (User preferred this) ---
            // Just checks if it's decently bright red and red is stronger than green
            // Removed strict ratio > 1.2
            const isFingerCovering = avgRed > 60 && (avgRed > avgGreen + 10);
            const signalValue = 255 - avgRed;

            if (debugFrameCounterRef.current % 10 === 0) setDebugVal(Math.round(signalValue));

            // Auto-torch
            if (avgRed < 10) {
                lowLightFramesRef.current++;
                if (lowLightFramesRef.current > 60 && streamRef.current) {
                    lowLightFramesRef.current = 0;
                    const track = streamRef.current.getVideoTracks()[0];
                    try {
                        // @ts-ignore
                        track.applyConstraints({ advanced: [{ torch: true }] }).catch(e => { });
                        setTorchEnabled(true);
                    } catch (err) { }
                }
            } else {
                lowLightFramesRef.current = 0;
            }

            const currentStatus = statusRef.current;

            if (isFingerCovering) {
                missingFingerFramesRef.current = 0;
                stableFingerCountRef.current++;

                rawSamplesRef.current.push({ time: now, value: signalValue });

                // STABILITY CHECK: Reduced to 10 frames (~0.3s) for faster feel
                if (stableFingerCountRef.current > 10) {
                    if (!fingerReadyRef.current) {
                        setFingerReady(true);
                        if (currentStatus === 'waiting_finger') {
                            measurementStartTimeRef.current = now;
                            setStatus('measuring');
                        }
                    }
                }

                if (rawSamplesRef.current.length > 20) {
                    const recent = rawSamplesRef.current.slice(-15).map(s => s.value);
                    const localMax = Math.max(...recent);
                    if (signalValue >= localMax && (now - lastBeatTime > 300)) {
                        setLastBeatTime(now);
                    }
                }

            } else {
                missingFingerFramesRef.current++;
                stableFingerCountRef.current = 0;
                // Don't punish momentary loss too hard, but show status
                if (missingFingerFramesRef.current > 10) {
                    if (fingerReadyRef.current) setFingerReady(false);
                }

                if (missingFingerFramesRef.current > 30) {
                    if (rawSamplesRef.current.length > 0 && currentStatus !== 'complete') {
                        rawSamplesRef.current = [];
                        setStatus('waiting_finger');
                        setProgress(0);
                        setRemainingTime(12);
                    }
                }
            }

            if (debugFrameCounterRef.current % 2 === 0) {
                setSignalHistory(prev => {
                    const displayVal = isFingerCovering ? signalValue : 127;
                    const newHistory = [...prev, displayVal];
                    if (newHistory.length > 200) return newHistory.slice(-200);
                    return newHistory;
                });
            }

        } catch (error) {
            console.error(error);
        }

        const samplesCount = rawSamplesRef.current.length;
        const currentStatus = statusRef.current;

        // Elapsed
        let elapsed = 0;
        if (currentStatus === 'measuring') {
            elapsed = now - measurementStartTimeRef.current;
        }

        if (debugFrameCounterRef.current % 5 === 0) setDebugElapsed(elapsed);

        if (currentStatus === 'measuring') {
            if (debugFrameCounterRef.current % 5 === 0) {
                setProgress(Math.min(100, (elapsed / MEASUREMENT_DURATION_MS) * 100));
                setRemainingTime(Math.max(0, Math.ceil((MEASUREMENT_DURATION_MS - elapsed) / 1000)));
            }

            if (fingerReadyRef.current && samplesCount > 5 && debugFrameCounterRef.current % 10 === 0) {
                const activeSamples = rawSamplesRef.current.slice(-300);
                const liveBpm = calculateBpm(activeSamples);
                if (liveBpm) setCurrentBpm(liveBpm);
            }

            const timeDone = elapsed >= MEASUREMENT_DURATION_MS;
            const samplesDone = samplesCount > 500;

            if (timeDone || samplesDone) {
                const finalBpm = calculateBpm(rawSamplesRef.current);
                stopCamera();

                if (finalBpm) {
                    setCurrentBpm(finalBpm);
                    setStatus('complete');
                } else {
                    setErrorMessage('No se detectó pulso claro.');
                    setStatus('error');
                    setFingerReady(false);
                }
                return;
            }
        }

        animationFrameRef.current = requestAnimationFrame(processCameraFrame);
    }, [calculateBpm, stopCamera]);


    const startMeasurement = useCallback(async () => {
        setStatus('initializing');
        setErrorMessage(null);
        setProgress(0);
        setRemainingTime(12);
        setCurrentBpm(null);
        setSignalHistory([]);
        rawSamplesRef.current = [];
        setTorchSupported(null);
        setFingerReady(false);
        missingFingerFramesRef.current = 0;
        lowLightFramesRef.current = 0;
        stableFingerCountRef.current = 0;

        try {
            if (!window.isSecureContext && window.location.hostname !== 'localhost') {
                setErrorMessage('HTTPS requerido.');
                setStatus('error');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', frameRate: { ideal: 30 } },
                audio: false
            });

            streamRef.current = stream;
            const video = videoRef.current;

            if (video) {
                video.srcObject = stream;
                video.onloadedmetadata = async () => {
                    await video.play();

                    const track = stream.getVideoTracks()[0];
                    const caps = track.getCapabilities() as any;
                    if (caps.torch) {
                        setTorchSupported(true);
                        try {
                            await track.applyConstraints({ advanced: [{ torch: true }] } as any);
                            setTorchEnabled(true);
                        } catch (e) {
                            console.warn("Torch retry");
                            setTimeout(async () => {
                                try { await track.applyConstraints({ advanced: [{ torch: true }] } as any); }
                                catch (e2) { }
                            }, 500);
                        }
                    } else {
                        setTorchSupported(false);
                    }

                    setStatus('waiting_finger');
                    animationFrameRef.current = requestAnimationFrame(processCameraFrame);
                };
            }

        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setErrorMessage('Error de cámara.');
        }
    }, [processCameraFrame]);


    const handleSaveResult = () => {
        if (currentBpm) onResult(currentBpm);
        onClose();
    };

    const getSignalDiagnosis = () => {
        if (signalHistory.length === 0) return "Esperando...";
        if (fingerReady) return "🟢 DEDO DETECTADO";
        return "⚪ ESPERANDO DEDO...";
    };

    const renderWaveform = () => {
        const maxVal = signalHistory.length > 0 ? Math.max(...signalHistory) : 999;
        const minVal = signalHistory.length > 0 ? Math.min(...signalHistory) : 0;
        const range = maxVal - minVal || 1;
        const diagnosis = getSignalDiagnosis();

        const debugInfo = (
            <div className="absolute top-0 left-0 right-0 p-2 text-xs font-mono z-50 pointer-events-none flex flex-col items-center">
                <span className={`px-2 py-1 rounded mb-1 border font-bold ${fingerReady ? 'bg-green-500 text-black border-green-400' : 'bg-slate-700 text-white border-slate-600'}`}>
                    {diagnosis}
                </span>
                <div className="flex flex-wrap gap-2 bg-black/90 p-1 rounded text-green-400 border border-white/20 justify-center">
                    <span>Val:{debugVal}</span>
                    <span>Amp:{debugAmp.toFixed(1)}</span>
                    <span className={status === 'measuring' ? 'text-green-400 font-bold' : 'text-yellow-400'}>
                        {status.substring(0, 4).toUpperCase()}
                    </span>
                    <span>El:{Math.round(debugElapsed / 1000)}s</span>
                </div>
            </div>
        );

        if (range < 1) return (
            <div className="relative h-24 w-full bg-slate-800/50 rounded flex items-center justify-center text-xs text-slate-500">
                {debugInfo}
                <span className="mt-8 opacity-50">Esperando señal...</span>
            </div>
        );

        const points = signalHistory.map(v => ((maxVal - v) / range));

        return (
            <div className="relative h-24 w-full flex items-end justify-between px-1 bg-black/40 rounded-lg overflow-hidden border border-slate-700 backdrop-blur-sm">
                {debugInfo}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-[1px] bg-white/50"></div>
                </div>
                {points.map((p, i) => (
                    <div
                        key={i}
                        className="w-1 bg-red-500/80 rounded-t-sm"
                        style={{ height: `${Math.max(5, p * 100)}%` }}
                    />
                ))}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col" // Removed items-center justify-center here
        >
            {/* Sticky Close Button - Always visible at top right */}
            <div className="absolute top-0 right-0 p-4 z-[100]">
                <button
                    onClick={() => { stopCamera(); onClose(); }}
                    className="bg-black/50 hover:bg-red-500 text-white rounded-full p-3 backdrop-blur-md border border-white/10 transition-all shadow-lg active:scale-95"
                >
                    <FiX className="text-2xl" />
                </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="w-full h-full overflow-y-auto flex flex-col items-center justify-center p-4">

                <div className="w-full max-w-sm text-center text-white space-y-3 md:space-y-6 my-auto pt-10 md:pt-16">

                    {/* Camera Viewport - Responsive Size */}
                    <div className={`relative mx-auto rounded-full overflow-hidden border-4 transition-all duration-500 ${(status === 'measuring' || status === 'waiting_finger') ? 'w-20 h-20 md:w-32 md:h-32 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'w-0 h-0 border-transparent'}`}>
                        <video ref={videoRef} className="w-full h-full object-cover opacity-80" playsInline muted autoPlay />
                        <canvas ref={canvasRef} className="hidden" width={50} height={50} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div style={{ transform: (Date.now() - lastBeatTime < 150) ? 'scale(1.3)' : 'scale(1)', transition: 'transform 0.1s' }}>
                                <FiHeart className={`text-2xl md:text-4xl text-white drop-shadow-lg ${(status === 'measuring' || status === 'waiting_finger') ? 'scale-100' : ''}`} />
                            </div>
                        </div>
                    </div>

                    {status === 'idle' && (
                        <div className="space-y-3 md:space-y-6">
                            <div className="w-16 h-16 md:w-24 md:h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700">
                                <FiCamera className="text-2xl md:text-4xl text-slate-400" />
                            </div>
                            <div>
                                <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">Monitor Cardíaco</h2>
                                <p className="text-slate-400 text-xs md:text-sm leading-relaxed px-2 md:px-4">
                                    Usaremos la cámara y el flash para detectar tu pulso.
                                    <br /><br />
                                    <span className="text-white font-medium">Instrucciones:</span>
                                    <br />1. Cubre cámara y flash.
                                    <br />2. No presiones fuerte.
                                    <br />3. Quédate quieto.
                                </p>
                            </div>
                            <button
                                onClick={startMeasurement}
                                className="w-full py-3 md:py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base"
                            >
                                <FiHeart className="fill-current" /> Comenzar Escáner
                            </button>
                        </div>
                    )}

                    {status === 'initializing' && (
                        <div className="py-8 md:py-12">
                            <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-sm md:text-lg font-medium animate-pulse">Activando sensores...</p>
                        </div>
                    )}

                    {status === 'waiting_finger' && (
                        <div className="space-y-3 md:space-y-6 animate-in fade-in duration-500">
                            <div className="text-center">
                                <p className="text-base md:text-xl font-semibold text-amber-400 animate-pulse mb-1 md:mb-2">
                                    👆 Coloca tu dedo
                                </p>
                                <p className="text-slate-400 text-xs md:text-sm">
                                    Cubre cámara y flash suavemente.
                                </p>
                            </div>

                            {/* Waveform preview */}
                            {renderWaveform()}

                            <div className="text-xs text-slate-500 text-center">
                                {fingerReady ? "✅ Dedo detectado" : "⏳ Esperando dedo..."}
                            </div>
                        </div>
                    )}

                    {status === 'measuring' && (
                        <div className="space-y-3 md:space-y-6 animate-in fade-in duration-500">
                            <div className="flex flex-col items-center justify-center h-16 md:h-24">
                                {currentBpm ? (
                                    <>
                                        <span className="text-5xl md:text-6xl font-bold tracking-tighter tabular-nums">{currentBpm}</span>
                                        <span className="text-red-400 font-medium tracking-widest text-[10px] md:text-xs uppercase mt-1">Latidos / Min</span>
                                    </>
                                ) : (
                                    <span className="text-slate-500 text-sm md:text-lg animate-pulse">
                                        Analizando...
                                        <br /><span className="text-xs md:text-sm font-mono text-slate-600">{remainingTime}s</span>
                                    </span>
                                )}
                            </div>

                            {renderWaveform()}

                            <div className="space-y-2">
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-red-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ ease: "linear", duration: 0.1 }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] md:text-xs text-slate-500 font-medium">
                                    <span>Escaneando...</span>
                                    <span>{remainingTime}s</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'complete' && (
                        <div className="space-y-4 md:space-y-8 py-4">
                            <div className="w-14 h-14 md:w-20 md:h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto ring-4 ring-green-500/20">
                                <FiHeart className="text-2xl md:text-4xl fill-current" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{currentBpm} <span className="text-base md:text-lg text-green-400 font-normal">BPM</span></h2>
                                <p className="text-slate-400 text-xs md:text-sm">Medición completada</p>
                            </div>
                            <button
                                onClick={handleSaveResult}
                                className="w-full py-3 md:py-4 bg-white text-black hover:bg-slate-200 font-bold rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 text-sm md:text-base"
                            >
                                Guardar Resultado
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-4 md:space-y-6">
                            <div className="w-14 h-14 md:w-20 md:h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border-2 border-amber-500/30">
                                <FiAlertTriangle className="text-2xl md:text-4xl" />
                            </div>
                            <div className="bg-amber-500/5 border border-amber-500/20 p-3 md:p-4 rounded-xl">
                                <p className="text-amber-200 text-xs md:text-sm">{errorMessage}</p>
                            </div>
                            <button
                                onClick={startMeasurement}
                                className="w-full py-3 md:py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all border border-slate-700 text-sm md:text-base"
                            >
                                Intentar de nuevo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default CameraPulseSensor;
