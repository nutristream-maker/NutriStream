import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiX, FiImage, FiVideo, FiZap, FiCheck, FiAlertCircle,
    FiGlobe, FiUsers, FiLock, FiHash, FiActivity
} from 'react-icons/fi';
import { GiMuscleUp, GiRunningShoe, GiGasMask, GiTennisRacket } from 'react-icons/gi';
import { HiOutlineSparkles } from 'react-icons/hi';

import {
    PostType,
    SensorDeviceType,
    SensorDataSnapshot,
    CreatePostRequest
} from '../../types/SocialTypes';
import NexusService from '../../services/NexusService';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const WORKOUT_TYPES = [
    'Fuerza', 'Cardio', 'HIIT', 'Yoga', 'Pádel', 'Tenis',
    'Running', 'Ciclismo', 'Natación', 'CrossFit', 'Funcional', 'Otro'
];

const VISIBILITY_OPTIONS = [
    { key: 'public' as const, label: 'Público', icon: FiGlobe, desc: 'Visible para todos' },
    { key: 'followers' as const, label: 'Seguidores', icon: FiUsers, desc: 'Solo tus seguidores' },
    { key: 'club' as const, label: 'Club', icon: FiLock, desc: 'Solo miembros del club' }
];

const DEVICE_OPTIONS: { type: SensorDeviceType; label: string; icon: React.ReactNode }[] = [
    { type: 'neural-skin', label: 'Neural-Skin POD', icon: <GiMuscleUp /> },
    { type: 'groundtruth', label: 'GroundTruth X1', icon: <GiRunningShoe /> },
    { type: 'aerolung', label: 'AeroLung Mask', icon: <GiGasMask /> },
    { type: 'aerovision', label: 'AeroVision', icon: <HiOutlineSparkles /> },
    { type: 'racket', label: 'Racket Sensor', icon: <GiTennisRacket /> }
];

// ═══════════════════════════════════════════════════════════════════════════
// MOCK SENSOR DATA (would come from real devices)
// ═══════════════════════════════════════════════════════════════════════════

const getMockSensorData = (deviceType: SensorDeviceType): Partial<SensorDataSnapshot> => {
    const base = {
        id: `sensor-${Date.now()}`,
        timestamp: new Date(),
        deviceType,
        deviceId: `${deviceType}-mock-001`
    };

    switch (deviceType) {
        case 'neural-skin':
            return { ...base, fatigueLevel: 42, muscleActivation: { pectoral: 78, deltoides: 65 }, heartRateAvg: 145 };
        case 'aerolung':
            return { ...base, vo2Max: 52.4, breathingRate: 28, heartRateMax: 178, caloriesBurned: 380 };
        case 'groundtruth':
            return { ...base, distanceKm: 5.2, stepsCount: 6800, cadence: 165 };
        case 'racket':
            return { ...base, swingSpeed: 135, impactForce: 820, spinRPM: 2100 };
        default:
            return base;
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated?: () => void;
    clubId?: string;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
    isOpen,
    onClose,
    onPostCreated,
    clubId
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [content, setContent] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>();
    const [postType, setPostType] = useState<PostType>('bio-highlight');
    const [workoutType, setWorkoutType] = useState('');
    const [workoutDuration, setWorkoutDuration] = useState<number>(30);
    const [visibility, setVisibility] = useState<'public' | 'followers' | 'club'>('public');
    const [selectedDevice, setSelectedDevice] = useState<SensorDeviceType | null>(null);
    const [sensorData, setSensorData] = useState<SensorDataSnapshot | null>(null);

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeviceSelector, setShowDeviceSelector] = useState(false);

    // Character limit
    const MAX_CHARS = 500;
    const charsRemaining = MAX_CHARS - content.length;

    // Extract hashtags from content
    const hashtags = content.match(/#\w+/g) || [];

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            setError('Solo se permiten imágenes o videos');
            return;
        }

        // Validate size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('El archivo es demasiado grande (máx 10MB)');
            return;
        }

        setMediaFile(file);
        setMediaType(isImage ? 'image' : 'video');
        setMediaPreview(URL.createObjectURL(file));
        setError(null);
    };

    // Handle device selection
    const handleDeviceSelect = (deviceType: SensorDeviceType) => {
        setSelectedDevice(deviceType);
        const mockData = getMockSensorData(deviceType);
        setSensorData(mockData as SensorDataSnapshot);
        setShowDeviceSelector(false);
    };

    // Clear sensor data
    const clearSensorData = () => {
        setSelectedDevice(null);
        setSensorData(null);
    };

    // Handle submit
    const handleSubmit = async () => {
        if (!content.trim()) {
            setError('El contenido no puede estar vacío');
            return;
        }

        if (postType === 'bio-highlight' && !sensorData) {
            setError('Los Bio-Highlights requieren datos de sensor (Proof of Effort)');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // In real app, would upload media first and get URL
            const mediaUrl = mediaPreview; // Mock: use preview URL

            await NexusService.createPost(
                'current-user-id',
                'Usuario Actual',
                'https://randomuser.me/api/portraits/men/1.jpg',
                'gold',
                {
                    type: postType,
                    content,
                    mediaUrl: mediaUrl || undefined,
                    mediaType,
                    sensorProof: sensorData || undefined,
                    workoutType: workoutType || undefined,
                    workoutDuration: workoutDuration || undefined,
                    visibility,
                    clubId: visibility === 'club' ? clubId : undefined
                }
            );

            // Reset form
            setContent('');
            setMediaFile(null);
            setMediaPreview(null);
            setMediaType(undefined);
            setSensorData(null);
            setSelectedDevice(null);

            onPostCreated?.();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al publicar');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="w-full max-w-xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700">
                        <h2 className="text-xl font-bold text-white">Crear Publicación</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                        {/* Post Type Selector */}
                        <div className="flex gap-2">
                            {[
                                { type: 'bio-highlight' as PostType, label: 'Bio-Highlight', icon: <FiZap /> },
                                { type: 'text' as PostType, label: 'Texto', icon: <FiHash /> },
                                { type: 'achievement' as PostType, label: 'Logro', icon: <FiActivity /> }
                            ].map(opt => (
                                <button
                                    key={opt.type}
                                    onClick={() => setPostType(opt.type)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${postType === opt.type
                                            ? 'bg-cyan-500 text-black'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    {opt.icon}
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Text Area */}
                        <div className="relative">
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value.slice(0, MAX_CHARS))}
                                placeholder="¿Qué has entrenado hoy? Usa #hashtags para más alcance..."
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                            />
                            <div className={`absolute bottom-3 right-3 text-xs ${charsRemaining < 50 ? 'text-amber-400' : 'text-slate-500'
                                }`}>
                                {charsRemaining}
                            </div>
                        </div>

                        {/* Hashtags Preview */}
                        {hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {hashtags.map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Media Preview */}
                        {mediaPreview && (
                            <div className="relative rounded-xl overflow-hidden">
                                {mediaType === 'image' ? (
                                    <img src={mediaPreview} alt="Preview" className="w-full max-h-48 object-cover" />
                                ) : (
                                    <video src={mediaPreview} className="w-full max-h-48" controls />
                                )}
                                <button
                                    onClick={() => { setMediaFile(null); setMediaPreview(null); setMediaType(undefined); }}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white"
                                >
                                    <FiX size={14} />
                                </button>
                            </div>
                        )}

                        {/* Sensor Data Badge */}
                        {sensorData && (
                            <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-900/30 to-emerald-900/30 border border-cyan-500/30">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <FiCheck className="text-emerald-400" />
                                        <span className="text-sm font-bold text-emerald-400">Proof of Effort</span>
                                    </div>
                                    <button
                                        onClick={clearSensorData}
                                        className="text-slate-400 hover:text-white"
                                    >
                                        <FiX size={14} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                                    {sensorData.fatigueLevel !== undefined && (
                                        <span>Fatiga: {sensorData.fatigueLevel}%</span>
                                    )}
                                    {sensorData.vo2Max && <span>VO2 Max: {sensorData.vo2Max}</span>}
                                    {sensorData.distanceKm && <span>Distancia: {sensorData.distanceKm}km</span>}
                                    {sensorData.swingSpeed && <span>Swing: {sensorData.swingSpeed}km/h</span>}
                                    {sensorData.heartRateAvg && <span>HR Avg: {sensorData.heartRateAvg}bpm</span>}
                                </div>
                            </div>
                        )}

                        {/* Workout Details */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Tipo de ejercicio</label>
                                <select
                                    value={workoutType}
                                    onChange={e => setWorkoutType(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                                >
                                    <option value="">Seleccionar...</option>
                                    {WORKOUT_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Duración (min)</label>
                                <input
                                    type="number"
                                    value={workoutDuration}
                                    onChange={e => setWorkoutDuration(Number(e.target.value))}
                                    min={1}
                                    max={300}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                                />
                            </div>
                        </div>

                        {/* Visibility */}
                        <div>
                            <label className="text-xs text-slate-400 mb-2 block">Visibilidad</label>
                            <div className="flex gap-2">
                                {VISIBILITY_OPTIONS.map(opt => {
                                    const Icon = opt.icon;
                                    return (
                                        <button
                                            key={opt.key}
                                            onClick={() => setVisibility(opt.key)}
                                            className={`flex-1 flex flex-col items-center p-3 rounded-xl transition-colors ${visibility === opt.key
                                                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                                                    : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            <Icon size={18} />
                                            <span className="text-xs mt-1">{opt.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 text-sm">
                                <FiAlertCircle />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                        <div className="flex gap-2">
                            {/* Media Upload */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                                title="Añadir foto/video"
                            >
                                <FiImage size={18} />
                            </button>

                            {/* Sensor Data */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowDeviceSelector(!showDeviceSelector)}
                                    className={`p-2.5 rounded-lg transition-colors ${sensorData
                                            ? 'bg-cyan-500/20 text-cyan-400'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                        }`}
                                    title="Añadir datos de sensor"
                                >
                                    <FiZap size={18} />
                                </button>

                                {showDeviceSelector && (
                                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                                        {DEVICE_OPTIONS.map(device => (
                                            <button
                                                key={device.type}
                                                onClick={() => handleDeviceSelect(device.type)}
                                                className="w-full px-3 py-2 flex items-center gap-2 text-sm text-left hover:bg-slate-700 text-slate-300"
                                            >
                                                <span className="text-cyan-400">{device.icon}</span>
                                                {device.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <motion.button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !content.trim()}
                            className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors ${isSubmitting || !content.trim()
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-cyan-500 text-black hover:bg-cyan-400'
                                }`}
                            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FiZap size={16} />
                                    Publicar
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CreatePostModal;
