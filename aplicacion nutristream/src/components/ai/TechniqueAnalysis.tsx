import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiRefreshCw, FiVideoOff, FiCpu, FiActivity, FiCheckCircle, FiAlertTriangle, FiUpload, FiBarChart2, FiTarget, FiClock, FiHeart, FiSave, FiZap, FiLayers } from 'react-icons/fi';
import { Card, Button } from '../ui/Shared';
import { genAI } from '../../services/ai';
import SEO from '../common/SEO';

interface DetailedScore {
    category: string;
    score: number;
    feedback: string;
    icon: React.ElementType;
}

interface AnalysisResult {
    exercise: string;
    overallScore: number;
    detailedScores: {
        posture: number;
        rangeOfMotion: number;
        tempo: number;
        stability: number;
        breathing: number;
    };
    issues: string[];
    corrections: string[];
    injuryRisk: "Bajo" | "Medio" | "Alto";
    potentialInjuries: string[];
    improvementPlan: string[];
    estimatedCalories: number;
    musclesTargeted: string[];
    biomechanics: {
        angles: { joint: string; angle: string; ideal: string }[];
        velocity: string;
        phaseAnalysis: string;
    };
    executionQuality: {
        score: number;
        summary: string;
    };
}

interface UserInjury {
    muscle: string;
    type: string;
    status: string;
}

const TechniqueAnalysis = () => {
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [feedback, setFeedback] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
    const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
    const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
    const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
    const [capturedFrames, setCapturedFrames] = useState<string[]>([]); // New state for multi-frame
    const [userInjuries, setUserInjuries] = useState<UserInjury[]>([]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const captureTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        // Load history
        const stored = localStorage.getItem('techniqueAnalysisHistory');
        if (stored) setAnalysisHistory(JSON.parse(stored));

        // Load injuries
        const injuries = localStorage.getItem('userInjuries');
        if (injuries) setUserInjuries(JSON.parse(injuries).filter((i: any) => i.status === 'activa'));

        return () => {
            if (captureTimeoutRef.current) clearTimeout(captureTimeoutRef.current);
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const saveToHistory = (result: AnalysisResult) => {
        const newHistory = [result, ...analysisHistory].slice(0, 10);
        setAnalysisHistory(newHistory);
        localStorage.setItem('techniqueAnalysisHistory', JSON.stringify(newHistory));
    };

    const toggleCamera = async () => {
        if (isCameraOn) {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
            setIsCameraOn(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setIsCameraOn(true);
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("No se pudo acceder a la cámara. Por favor, comprueba los permisos.");
            }
        }
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedVideo(file);
            setUploadedVideoUrl(URL.createObjectURL(file));
        }
    };

    const captureFrameAsBase64 = (video: HTMLVideoElement): string => {
        if (!canvasRef.current) return '';
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    };

    const startAnalysis = async () => {
        if (activeTab === 'camera') {
            if (!isCameraOn || !videoRef.current) return;
            await analyzeFromCamera();
        } else {
            if (!uploadedVideo) return;
            await analyzeFromUpload();
        }
    };

    const analyzeFromCamera = async () => {
        setIsLoading(true);
        setFeedback(null);
        setCapturedFrames([]);

        const frames: string[] = [];
        const captureDelay = 600; // ms between frames

        setLoadingStep('Capturando movimiento...');

        // Capture 3 frames sequence
        for (let i = 0; i < 3; i++) {
            if (videoRef.current) {
                frames.push(captureFrameAsBase64(videoRef.current));
            }
            await new Promise(resolve => setTimeout(resolve, captureDelay));
        }

        setCapturedFrames(frames);
        await processWithAI(frames);
    };

    const analyzeFromUpload = async () => {
        if (!uploadedVideo || !uploadedVideoUrl) return;
        setIsLoading(true);
        setFeedback(null);
        setLoadingStep('Procesando video...');

        const video = document.createElement('video');
        video.src = uploadedVideoUrl;
        video.muted = true;
        video.playsInline = true;

        await new Promise((resolve) => {
            video.onloadedmetadata = () => resolve(true);
        });

        const duration = video.duration || 1;
        const frames: string[] = [];
        const timestamps = [duration * 0.2, duration * 0.5, duration * 0.8]; // Start, Middle, End

        const captureAtTime = async (time: number): Promise<string> => {
            return new Promise(resolve => {
                video.currentTime = time;
                video.onseeked = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(video, 0, 0);
                    resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
                };
            });
        };

        for (const time of timestamps) {
            frames.push(await captureAtTime(time));
        }

        setCapturedFrames(frames);
        await processWithAI(frames);
    };

    const processWithAI = async (framesBase64: string[]) => {
        setLoadingStep('Analizando biomecánica...');
        try {
            const injuriesContext = userInjuries.length > 0
                ? `\nCONTEXTO CRÍTICO - HISTORIAL DE LESIONES: El usuario tiene lesiones activas en: ${userInjuries.map(i => `${i.muscle} (${i.type})`).join(', ')}. Ten esto MUY en cuenta para la evaluación de seguridad.`
                : '';

            const prompt = `Actúa como un Entrenador de Biomecánica de Élite y Fisioterapeuta Deportivo.
Analiza esta secuencia de 3 imágenes (Inicio, Desarrollo, Puntos Clave) del usuario realizando un ejercicio.

${injuriesContext}

Proporciona un análisis TÉCNICO PROFESIONAL. Enfócate en ángulos articulares, estabilidad, control motor y seguridad.

Responde EXCLUSIVAMENTE con un JSON válido con este formato exacto:
{
    "exercise": "Nombre técnico del ejercicio (e.g. Sentadilla Profunda)",
    "overallScore": 0-100,
    "detailedScores": {
        "posture": 0-100,
        "rangeOfMotion": 0-100,
        "tempo": 0-100,
        "stability": 0-100,
        "breathing": 0-100
    },
    "issues": ["Error técnico 1", "Error técnico 2"],
    "corrections": ["Corrección biomecánica precisa 1", "Cue visual específico 2"],
    "injuryRisk": "Bajo" | "Medio" | "Alto",
    "potentialInjuries": ["Estructuras en riesgo"],
    "improvementPlan": ["Drills correctivos", "Progresiones recomendadas"],
    "estimatedCalories": number,
    "musclesTargeted": ["Músculo principal", "Sinergistas"],
    "biomechanics": {
        "angles": [
            { "joint": "Rodilla/Cadera/Codo", "angle": "Ej: 90°", "ideal": "Ej: 110-120°" }
        ],
        "velocity": "Descripción del tempo (Ej: Excéntrica controlada, explosiva concéntrica)",
        "phaseAnalysis": "Análisis de la fase crítica del movimiento"
    },
    "executionQuality": {
        "score": 0-100,
        "summary": "Resumen ejecutivo de la calidad de movimiento"
    }
}`;

            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const imageParts = framesBase64.map(data => ({
                inlineData: {
                    data: data,
                    mimeType: "image/jpeg",
                }
            }));

            const result = await model.generateContent([prompt, ...imageParts]);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("La IA no devolvió un JSON válido.");

            const jsonResponse: AnalysisResult = JSON.parse(jsonMatch[0]);
            setFeedback(jsonResponse);
            saveToHistory(jsonResponse);

        } catch (error: any) {
            console.error("Critical error in analysis:", error);
            setFeedback(null);

            let errorMessage = "Ha ocurrido un error inesperado.";
            if (error.message.includes("API key")) errorMessage = "Clave de API no válida o no encontrada.";
            else if (error.message.includes("model")) errorMessage = "El modelo de IA no está disponible temporalmente.";
            else if (error.message.includes("JSON")) errorMessage = "Error interpretando la respuesta de la IA.";

            alert(`Error en el análisis: ${errorMessage} (${error.message})`);
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
        if (score >= 60) return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    };

    const getScoreGradient = (score: number) => {
        if (score >= 80) return 'from-emerald-500 to-teal-500';
        if (score >= 60) return 'from-amber-500 to-orange-500';
        return 'from-red-500 to-rose-500';
    };

    const detailedCategories = feedback ? [
        { category: 'Postura', score: feedback.detailedScores.posture, icon: FiTarget, description: 'Alineación corporal' },
        { category: 'Rango de Movimiento', score: feedback.detailedScores.rangeOfMotion, icon: FiActivity, description: 'Amplitud del ejercicio' },
        { category: 'Tempo', score: feedback.detailedScores.tempo, icon: FiClock, description: 'Velocidad y control' },
        { category: 'Estabilidad', score: feedback.detailedScores.stability, icon: FiBarChart2, description: 'Control del core' },
        { category: 'Respiración', score: feedback.detailedScores.breathing, icon: FiHeart, description: 'Patrón respiratorio' },
    ] : [];

    return (
        <>
            <SEO title="Análisis Biomecánico IA" description="Análisis de técnica avanzado con IA" />

            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <FiCpu className="text-primary" /> Análisis Biomecánico Avanzado
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        IA de visión computarizada para corrección de técnica en tiempo real
                    </p>
                </div>

                {/* Input Mode Toggle */}
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
                    <button
                        onClick={() => setActiveTab('camera')}
                        className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${activeTab === 'camera'
                            ? 'bg-white dark:bg-slate-700 shadow text-primary'
                            : 'text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        <FiCamera /> Live Cam
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${activeTab === 'upload'
                            ? 'bg-white dark:bg-slate-700 shadow text-primary'
                            : 'text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        <FiUpload /> Subir Video
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Video Input Section */}
                    <Card className="!p-6 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {activeTab === 'camera' ? (
                                <motion.div
                                    key="camera"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="aspect-video bg-black rounded-lg mb-4 relative overflow-hidden shadow-inner">
                                        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}></video>
                                        {!isCameraOn && (
                                            <div className="w-full h-full flex flex-col justify-center items-center text-slate-400">
                                                <span className="text-5xl mb-2"><FiVideoOff /></span>
                                                <p>Cámara apagada</p>
                                            </div>
                                        )}

                                        {/* Frame indicators overlay */}
                                        {capturedFrames.length > 0 && (
                                            <div className="absolute bottom-4 right-4 flex gap-2">
                                                {capturedFrames.map((_, idx) => (
                                                    <div key={idx} className="w-12 h-8 bg-white/20 border border-white/50 rounded overflow-hidden">
                                                        <img src={`data:image/jpeg;base64,${_}`} className="w-full h-full object-cover opacity-80" alt={`Frame ${idx}`} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <canvas ref={canvasRef} className="hidden"></canvas>
                                    </div>
                                    <div className="flex justify-center gap-4">
                                        <Button onClick={toggleCamera} icon={isCameraOn ? FiVideoOff : FiCamera} variant="secondary">
                                            {isCameraOn ? 'Apagar' : 'Encender'}
                                        </Button>
                                        <Button onClick={startAnalysis} icon={FiZap} disabled={!isCameraOn || isLoading} variant="primary">
                                            {isLoading ? 'Escaneando...' : 'Analizar Movimiento'}
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div
                                        className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg mb-4 relative overflow-hidden cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary transition-colors group"
                                        onClick={() => !uploadedVideoUrl && fileInputRef.current?.click()}
                                    >
                                        {uploadedVideoUrl ? (
                                            <video src={uploadedVideoUrl} controls className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col justify-center items-center text-slate-400 group-hover:text-primary transition-colors">
                                                <span className="text-5xl mb-2"><FiUpload /></span>
                                                <p className="font-medium">Haz clic para subir video</p>
                                                <p className="text-sm mt-1 opacity-70">MP4, MOV, WebM</p>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="video/*"
                                            onChange={handleVideoUpload}
                                            className="hidden"
                                        />
                                    </div>
                                    <div className="flex justify-center gap-4">
                                        {uploadedVideoUrl && (
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setUploadedVideo(null);
                                                    setUploadedVideoUrl(null);
                                                    setCapturedFrames([]);
                                                }}
                                            >
                                                Cambiar Video
                                            </Button>
                                        )}
                                        <Button onClick={startAnalysis} icon={FiCpu} disabled={!uploadedVideo || isLoading}>
                                            {isLoading ? 'Procesando...' : 'Analizar Video'}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Loading Overlay */}
                        <AnimatePresence>
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 z-20 flex flex-col items-center justify-center p-8 text-center"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                        className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mb-4"
                                    />
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{loadingStep}</h3>
                                    <p className="text-sm text-slate-500">Analizando secuencia de frames para detectar biomecánica...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>

                    {/* Results Section */}
                    <Card className="!p-6 flex flex-col min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {feedback ? (
                                <motion.div key="feedback" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                                        <div>
                                            <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Ejercicio Detectado</p>
                                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">{feedback.exercise}</h3>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {feedback.musclesTargeted.map((muscle, i) => (
                                                    <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                                                        {muscle}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={`px-4 py-3 rounded-2xl text-center ${getScoreColor(feedback.overallScore)}`}>
                                            <span className="block text-4xl font-black">{feedback.overallScore}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-wide">Puntuación</span>
                                        </div>
                                    </div>

                                    {/* Biomecanics Panel (NEW) */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                                        <h4 className="flex items-center gap-2 font-bold text-sm text-slate-700 dark:text-slate-200 mb-3">
                                            <FiLayers className="text-indigo-500" /> Datos Biomecánicos
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            {feedback.biomechanics.angles.map((angle, idx) => (
                                                <div key={idx} className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border-l-2 border-indigo-400">
                                                    <p className="text-[10px] text-slate-400 uppercase">{angle.joint}</p>
                                                    <div className="flex items-baseline justify-between">
                                                        <span className="font-bold text-slate-700 dark:text-slate-200">{angle.angle}</span>
                                                        <span className="text-[10px] text-green-500">{angle.ideal}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-xs text-slate-500 space-y-1">
                                            <p className="flex items-start gap-2"><span className="font-semibold text-slate-600 dark:text-slate-400">Fase:</span> {feedback.biomechanics.phaseAnalysis}</p>
                                            <p className="flex items-start gap-2"><span className="font-semibold text-slate-600 dark:text-slate-400">Tempo:</span> {feedback.biomechanics.velocity}</p>
                                        </div>
                                    </div>

                                    {/* Issues & Corrections */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className={`p-4 rounded-xl ${feedback.injuryRisk === 'Alto' ? 'bg-red-50 dark:bg-red-900/20 border border-red-100' : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-100'}`}>
                                            <div className="flex items-center gap-2 mb-2 font-bold text-sm text-red-700 dark:text-red-400">
                                                <FiAlertTriangle /> Riesgo: {feedback.injuryRisk}
                                            </div>
                                            <ul className="text-xs space-y-1.5 opacity-90">
                                                {feedback.issues.slice(0, 3).map((issue, i) => (
                                                    <li key={i} className="flex gap-2">
                                                        <span className="mt-0.5">•</span>
                                                        <span>{issue}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 p-4 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2 font-bold text-sm text-emerald-700 dark:text-emerald-400">
                                                <FiCheckCircle /> Correcciones
                                            </div>
                                            <ul className="text-xs space-y-1.5 opacity-90">
                                                {feedback.corrections.slice(0, 3).map((corr, i) => (
                                                    <li key={i} className="flex gap-2">
                                                        <span className="mt-0.5">•</span>
                                                        <span>{corr}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Button variant="secondary" className="w-full" icon={FiSave}>
                                        Guardar Análisis en Historial
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col justify-center items-center text-center text-slate-400 p-8">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                        <FiActivity className="text-4xl text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300 mb-2">Esperando análisis</h3>
                                    <p className="text-sm max-w-xs mx-auto">
                                        Captura 3 frames del movimiento o sube un video para obtener métricas biomecánicas detalladas.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                </div>

                {/* History Section */}
                {analysisHistory.length > 0 && (
                    <Card className="!p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <FiBarChart2 /> Historial de Análisis
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {analysisHistory.slice(0, 5).map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.02 }}
                                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                                    onClick={() => setFeedback(item)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold uppercase text-slate-400">{item.injuryRisk} Risk</span>
                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getScoreColor(item.overallScore)}`}>{item.overallScore}</span>
                                    </div>
                                    <p className="font-medium text-sm truncate text-slate-700 dark:text-slate-200">{item.exercise}</p>
                                    <p className="text-xs text-slate-500 mt-1">{new Date().toLocaleDateString()}</p>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </>
    );
};

export default TechniqueAnalysis;
