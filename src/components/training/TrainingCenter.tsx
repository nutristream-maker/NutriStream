import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiZap, FiWatch, FiCpu, FiCheckCircle, FiPlay, FiClock, FiBarChart2, FiChevronDown, FiInfo, FiTarget, FiSearch, FiFilter, FiTrendingUp, FiAward, FiCalendar, FiPlus, FiX, FiHeart, FiWind, FiPause, FiStopCircle } from 'react-icons/fi';
import { GiMuscleUp, GiTennisBall } from 'react-icons/gi';
import { Card, Button } from '../ui/Shared';
import SEO from '../common/SEO';
import { useLanguage } from '../../context/LanguageContext';
import { useSensorStore } from '../../store/useSensorStore';
import LiveSessionHUD from '../dashboard/LiveSessionHUD';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Import Exercise Images
import joggingGuide from '../../assets/exercises/jogging_guide.png';
import hipMobilityGuide from '../../assets/exercises/hip_mobility_guide.png';
import backSquatGuide from '../../assets/exercises/back_squat_anatomy.png';
import inclineBenchGuide from '../../assets/exercises/incline_bench_press_anatomy.png';
import deadliftGuide from '../../assets/exercises/deadlift_anatomy.png';
import overheadPressGuide from '../../assets/exercises/overhead_press_anatomy.png';
import barbellRowGuide from '../../assets/exercises/barbell_row_anatomy.png';
import pullUpGuide from '../../assets/exercises/pull_up_anatomy.png';
import yogaFlowGuide from '../../assets/exercises/yoga_flow_guide.png';
import breathworkGuide from '../../assets/exercises/breathwork_guide.png';
import dumbbellCurlGuide from '../../assets/exercises/dumbbell_curl_anatomy.png';
import pushUpGuide from '../../assets/exercises/push_up_guide.png';
import kettlebellSwingGuide from '../../assets/exercises/kettlebell_swing_guide.png';
import legPressGuide from '../../assets/exercises/leg_press_guide.png';
import plankGuide from '../../assets/exercises/plank_anatomy.png';
import latPulldownGuide from '../../assets/exercises/lat_pulldown_guide.png';
import declineBenchGuide from '../../assets/exercises/decline_bench_press.png';
import barbellBenchGuide from '../../assets/exercises/barbell_bench_press_anatomy.png';
import tricepDipGuide from '../../assets/exercises/tricep_dip_anatomy.png';
import lungeGuide from '../../assets/exercises/lunge_anatomy.png';
import ActivityLogModal from './ActivityLogModal';
import TrainingPlanGeneratorModal from './TrainingPlanGeneratorModal';
import { genAI } from '../../services/ai';

// Exercise Library Data
import { exerciseLibrary } from '../../data/ExerciseLibrary';
import { WeeklyRoutineBuilder, WeeklyRoutine } from './WeeklyRoutineBuilder'; // Added import

// Exercise Animation Preview Component
const ExerciseAnimationPreview: React.FC<{ type: 'warmup' | 'strength' | 'cooldown', imageSrc?: string }> = ({ type, imageSrc }) => {
    return (
        <div className="h-64 bg-white dark:bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner group p-8">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
            </div>
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                {imageSrc ? (
                    <img src={imageSrc} alt="Exercise Guide" className="max-h-full max-w-full object-contain rounded-lg" />
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300 gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <FiCpu size={32} />
                        </div>
                        <span className="text-xs font-bold font-mono tracking-widest uppercase">Visual Generation Pending</span>
                    </div>
                )}
            </div>
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-lg backdrop-blur-sm border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 text-xs"><FiTarget /></span>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-widest">
                    {type === 'warmup' ? 'MOBILITY_SEQ' : type === 'strength' ? 'TECHNIQUE_GUIDE' : 'RECOVERY_FLOW'}
                </span>
            </div>
        </div>
    );
};

// Expandable Exercise Card
const ExerciseCard: React.FC<{ title: string, subtitle: string, type: 'warmup' | 'strength' | 'cooldown', image?: string }> = ({ title, subtitle, type, image }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const styleMap: Record<string, { badge: string, border: string, icon: string }> = {
        warmup: { badge: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', border: 'hover:border-orange-400', icon: 'text-orange-500' },
        strength: { badge: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', border: 'hover:border-blue-400', icon: 'text-blue-500' },
        cooldown: { badge: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', border: 'hover:border-teal-400', icon: 'text-teal-500' },
    };

    const currentStyle = styleMap[type];

    return (
        <motion.div layout className={`rounded-2xl border bg-white dark:bg-slate-800/80 backdrop-blur-sm transition-all duration-300 overflow-hidden ${isExpanded ? `shadow-xl ring-1 ring-slate-200 dark:ring-slate-700` : 'shadow-sm hover:shadow-md'} ${isChecked ? 'opacity-60 grayscale-[0.5]' : ''} border-slate-200 dark:border-slate-700 ${currentStyle.border}`}>
            <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div onClick={(e) => { e.stopPropagation(); setIsChecked(!isChecked); }}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${isChecked ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-slate-50 dark:bg-slate-800'}`}>
                    <AnimatePresence>
                        {isChecked && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <FiCheckCircle size={14} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="flex-grow">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base">{title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${currentStyle.icon.replace('text-', 'bg-')}`}></span>
                        {subtitle}
                    </p>
                </div>
                <div className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${isExpanded ? 'bg-slate-100 dark:bg-slate-700' : ''}`}>
                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <span className="text-slate-400"><FiChevronDown /></span>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'circOut' }} className="border-t border-slate-100 dark:border-slate-700/50">
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-800/50">
                            <ExerciseAnimationPreview type={type} imageSrc={image} />
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <h5 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${currentStyle.icon}`}>
                                        <FiInfo /> Execution
                                    </h5>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        Maintain a neutral spine. Engage your core throughout the movement.
                                        {type === 'warmup' && ' Focus on increasing range of motion smoothly.'}
                                        {type === 'strength' && ' Explode up, control the descent.'}
                                        {type === 'cooldown' && ' Breathe deeply into the stretch.'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs font-medium">
                                    <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 shadow-sm">3 Sets</span>
                                    <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 shadow-sm">{type === 'strength' ? '8-12 Reps' : '45 Seconds'}</span>
                                    <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 shadow-sm flex items-center gap-1"><FiClock size={10} /> Rest 60s</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Template Preview Modal
const TemplatePreviewModal: React.FC<{
    template: { id: number; name: string; exerciseIds: number[]; color: string; difficulty: string; duration: string; exercises: number; equipment: string } | null;
    onClose: () => void;
    onAdd: (template: any, day: string) => void;
}> = ({ template, onClose, onAdd }) => {
    const [selectedDay, setSelectedDay] = useState<string>('');
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    if (!template) return null;

    const templateExercises = template.exerciseIds
        .map(id => exerciseLibrary.find(ex => ex.id === id))
        .filter(Boolean);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`p-6 bg-gradient-to-br ${template.color} text-white`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">{template.name}</h3>
                            <div className="flex flex-wrap gap-2 text-sm">
                                <span className="px-3 py-1 bg-white/20 rounded-full">{template.difficulty}</span>
                                <span className="px-3 py-1 bg-white/20 rounded-full flex items-center gap-1"><FiClock size={12} /> {template.duration}</span>
                                <span className="px-3 py-1 bg-white/20 rounded-full">{template.exercises} ejercicios</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>
                </div>

                {/* Exercise List */}
                <div className="p-6 max-h-[40vh] overflow-y-auto">
                    <h4 className="font-bold text-sm text-slate-500 mb-4 uppercase tracking-wider">Ejercicios Incluidos</h4>
                    <div className="space-y-3">
                        {templateExercises.map((ex, idx) => ex && (
                            <div key={ex.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                    {idx + 1}
                                </div>
                                <img src={ex.image} alt={ex.name} className="w-12 h-12 rounded-lg object-cover" />
                                <div className="flex-1">
                                    <h5 className="font-bold text-slate-900 dark:text-white">{ex.name}</h5>
                                    <p className="text-xs text-slate-500 capitalize">{ex.muscle} • {ex.category}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Day Selector */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-sm text-slate-500 mb-3 uppercase tracking-wider">Selecciona el día</h4>
                    <div className="grid grid-cols-7 gap-2">
                        {days.map(day => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${selectedDay === day
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {day.slice(0, 3)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <button
                        onClick={() => selectedDay && onAdd(template, selectedDay)}
                        disabled={!selectedDay}
                        className={`w-full px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${selectedDay
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        <FiPlus /> {selectedDay ? `Añadir a ${selectedDay}` : 'Selecciona un día'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const TrainingCenter: React.FC = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'today' | 'templates' | 'library' | 'progress' | 'live'>('today');
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [aiBriefing, setAiBriefing] = useState<string>("");
    const [isAnalyzingBriefing, setIsAnalyzingBriefing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [muscleFilter, setMuscleFilter] = useState('all');
    const [showRecommended, setShowRecommended] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);
    const [forcedActiveDay, setForcedActiveDay] = useState<string | null>(null);

    // Lifted state from WeeklyRoutineBuilder
    const [routine, setRoutine] = useState<WeeklyRoutine>({});

    // Load routine from LocalStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('userWeeklyRoutine');
        if (saved) {
            setRoutine(JSON.parse(saved));
        }
    }, []);

    // Sync routine to LocalStorage whenever it changes
    useEffect(() => {
        if (Object.keys(routine).length > 0) {
            localStorage.setItem('userWeeklyRoutine', JSON.stringify(routine));
        }
    }, [routine]);

    const handleGenerateBriefing = async () => {
        setIsAnalyzingBriefing(true);
        try {
            const prompt = "Act as an elite coach. Give me a 2-sentence motivational pre-workout briefing based on a user who is resting well but needs to focus on intensity today.";
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            setAiBriefing(response.text() || "Let's crush this workout!");
        } catch (e) {
            setAiBriefing("Focus on form and consistency today. You got this!");
        } finally {
            setIsAnalyzingBriefing(false);
        }
    };

    // --- LIVE SESSION LOGIC MERGED ---
    const {
        heartRate,
        calories,
        wellnessScore,
        fatigue: muscleFatigue,
        devices: deviceStatus,
        activeMuscles
    } = useSensorStore();

    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);
    const [sessionType, setSessionType] = useState<'strength' | 'cardio' | 'tennis' | 'breathing'>('strength');

    // New state for session context
    const [activeSessionContext, setActiveSessionContext] = useState<{ day: string; exercises: any[] } | null>(null);
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSessionActive && !isPaused) {
            interval = setInterval(() => {
                setSessionTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isSessionActive, isPaused]);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const avgFatigue = useMemo(() => {
        const values = Object.values(muscleFatigue) as number[];
        if (values.length === 0) return 0;
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    }, [muscleFatigue]);

    const startSession = (day?: string, exercises?: any[]) => {
        setIsSessionActive(true);
        setIsPaused(false);
        setSessionTime(0);
        if (day && exercises) {
            setActiveSessionContext({ day, exercises });
            // Infer session type based on exercises (simplified logic)
            const strengthCount = exercises.filter(e => {
                const ex = exerciseLibrary.find(lib => lib.id === e.exerciseId);
                return ex?.category === 'strength';
            }).length;
            if (strengthCount > 0) setSessionType('strength');
        }
    };

    const stopSession = () => {
        setIsSessionActive(false);
        setIsPaused(false);
    };

    const sessionTypes = [
        { id: 'strength', label: 'Fuerza', icon: GiMuscleUp, color: 'from-indigo-500 to-purple-600' },
        { id: 'cardio', label: 'Cardio', icon: FiHeart, color: 'from-rose-500 to-red-600' },
        { id: 'tennis', label: 'Tenis', icon: GiTennisBall, color: 'from-amber-500 to-orange-600' },
        { id: 'breathing', label: 'Respiración', icon: FiWind, color: 'from-cyan-500 to-blue-600' }
    ];
    // ---------------------------------

    // Function to add template to user's routine
    const addTemplateToRoutine = (template: typeof templates[0], selectedDay: string) => {
        const newExercises = template.exerciseIds.map((exId, index) => ({
            id: Date.now().toString() + index,
            exerciseId: exId,
            sets: [
                { id: Date.now().toString() + index + 'a', reps: '10-12', weight: 0, duration: '10 min' },
                { id: Date.now().toString() + index + 'b', reps: '10-12', weight: 0, duration: '10 min' },
                { id: Date.now().toString() + index + 'c', reps: '10-12', weight: 0, duration: '10 min' }
            ]
        }));

        setRoutine(prev => ({
            ...prev,
            [selectedDay]: [...(prev[selectedDay] || []), ...newExercises]
        }));

        setSelectedTemplate(null);
        setActiveTab('today');

        // Force WeeklyRoutineBuilder to switch to the selected day
        setForcedActiveDay(selectedDay);
        // Clear the force flag after a moment so user can switch days manually again
        setTimeout(() => setForcedActiveDay(null), 1000);
    };

    const connectedDevices = [
        { name: 'Neural Skin POD', status: t('activo'), battery: 82, icon: FiCpu, color: 'text-green-500' },
        { name: 'Racket Sensor', status: t('enEspera'), battery: 45, icon: FiActivity, color: 'text-yellow-500' }
    ];

    // Workout Templates with exercise IDs
    const templates = [
        {
            id: 1,
            name: t('plantillaFullBody'),
            difficulty: t('principiante'),
            duration: '45 min',
            exercises: 8,
            equipment: t('sinEquipo'),
            color: 'from-green-500 to-emerald-600',
            exerciseIds: [1, 5, 7, 9, 13, 17, 21, 25] // Full body compound movements
        },
        {
            id: 2,
            name: t('plantillaUpperLower'),
            difficulty: t('intermedio'),
            duration: '60 min',
            exercises: 10,
            equipment: t('mancuernas'),
            color: 'from-blue-500 to-cyan-600',
            exerciseIds: [1, 2, 3, 5, 6, 7, 9, 10, 11, 13] // Upper/Lower split
        },
        {
            id: 3,
            name: t('plantillaPPL'),
            difficulty: t('avanzado'),
            duration: '75 min',
            exercises: 12,
            equipment: t('barras'),
            color: 'from-purple-500 to-pink-600',
            exerciseIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] // Push/Pull/Legs
        },
        {
            id: 4,
            name: t('plantillaHIIT'),
            difficulty: t('intermedio'),
            duration: '30 min',
            exercises: 6,
            equipment: t('sinEquipo'),
            color: 'from-orange-500 to-red-600',
            exerciseIds: [17, 21, 25, 26, 27, 28] // HIIT cardio exercises
        },
    ];

    // Exercise Library Data - Imported from centralized file at top

    const filteredExercises = exerciseLibrary.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || ex.category === categoryFilter;
        const matchesMuscle = muscleFilter === 'all' || ex.muscle === muscleFilter;
        return matchesSearch && matchesCategory && matchesMuscle;
    });

    // Progress Data
    const progressData = {
        weeklyWorkouts: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: t('sesionesCompletadas'),
                data: [1, 1, 0, 1, 1, 1, 0],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderRadius: 8
            }]
        },
        volumeProgression: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            datasets: [{
                label: t('volumenTotal'),
                data: [15000, 18000, 17500, 20000],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            }]
        }
    };

    const personalRecords = [
        { exercise: 'Back Squat', record: '140kg', date: '2026-01-05' },
        { exercise: 'Deadlift', record: '180kg', date: '2025-12-28' },
        { exercise: 'Bench Press', record: '100kg', date: '2026-01-02' },
    ];

    const tabs = [
        { key: 'today', label: t('tabHoy'), icon: FiCalendar },
        { key: 'templates', label: t('tabPlantillas'), icon: FiTarget },
        { key: 'library', label: t('tabBiblioteca'), icon: GiMuscleUp },
        { key: 'progress', label: t('tabProgreso'), icon: FiTrendingUp }
    ];

    return (
        <div className="space-y-6 pb-24">
            <SEO title="Centro de Entrenamiento" description="Planes personalizados y biblioteca de ejercicios." />

            {/* Header */}
            <header className="relative z-10 p-4 md:p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                            {t('centroEntrenamiento')}
                        </motion.h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium flex items-center gap-2">
                            <span className="text-indigo-500"><FiCpu /></span> {t('sugerenciasIA')}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => setIsPlanModalOpen(true)}
                            className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                            <FiCpu className="text-indigo-500" /> {t('planIA')}
                        </button>
                        <button onClick={() => setIsLogModalOpen(true)}
                            className="px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                            <FiBarChart2 /> {t('registrarActividad')}
                        </button>
                    </div>
                </div>

                {/* Tab Navigation - Mobile Optimized */}
                <div className="mt-6 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex gap-2 min-w-max md:min-w-0">
                        {tabs.map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                                className={`px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab.key
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                <tab.icon size={16} /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {/* TODAY TAB */}
                {activeTab === 'today' && (
                    <motion.div key="today" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                        {/* AI Briefing */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                                            <span className="bg-white/20 p-1.5 rounded-lg"><FiCpu /></span> {t('aiCoachInsight')}
                                        </h2>
                                        <AnimatePresence mode="wait">
                                            {aiBriefing ? (
                                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/90 leading-relaxed font-medium">
                                                    "{aiBriefing}"
                                                </motion.p>
                                            ) : (
                                                <p className="text-white/60 text-sm">{t('tocaParaGenerar')}</p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <button onClick={handleGenerateBriefing} disabled={isAnalyzingBriefing}
                                        className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-50 transition-colors disabled:opacity-50">
                                        {isAnalyzingBriefing ? t('analizandoBriefing') : t('generarBriefing')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* SESSION CONTROLS & LIVE VIEW (Collapsible Header) */}
                        <AnimatePresence>
                            {isSessionActive && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="sticky top-0 z-30 space-y-4 mb-6"
                                >
                                    {/* Compact Bar */}
                                    <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-2xl shadow-xl backdrop-blur-md bg-opacity-95">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                <span className="font-mono text-xl font-bold">{formatTime(sessionTime)}</span>
                                            </div>
                                            <div className="hidden sm:flex gap-4 text-sm text-white/80">
                                                <span className="flex items-center gap-1"><FiHeart className="text-rose-500" /> {heartRate}</span>
                                                <span className="flex items-center gap-1"><FiZap className="text-amber-500" /> {calories}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-white/80 transition-colors text-xs font-bold flex items-center gap-1"
                                            >
                                                {isHeaderExpanded ? 'Ocultar' : 'Ver Métricas'}
                                            </button>
                                            <div className="h-6 w-px bg-white/20 mx-1" />
                                            <button onClick={() => setIsPaused(!isPaused)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                                {isPaused ? <FiPlay /> : <FiPause />}
                                            </button>
                                            <button onClick={stopSession} className="p-2 hover:bg-white/10 rounded-full text-red-400 transition-colors">
                                                <FiStopCircle />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Content (HUD, Metrics) */}
                                    <AnimatePresence>
                                        {isHeaderExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden space-y-4"
                                            >
                                                {/* Live HUD */}
                                                <LiveSessionHUD />

                                                {/* Key Metrics Grid */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <Card className="!p-4 bg-gradient-to-br from-rose-500 to-red-600 text-white border-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <FiHeart /> <span className="text-xs font-medium opacity-80">FC</span>
                                                        </div>
                                                        <p className="text-xl font-bold">{heartRate} <span className="text-xs font-normal opacity-80">bpm</span></p>
                                                    </Card>
                                                    <Card className="!p-4 bg-gradient-to-br from-orange-500 to-amber-600 text-white border-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <FiZap /> <span className="text-xs font-medium opacity-80">Calorías</span>
                                                        </div>
                                                        <p className="text-xl font-bold">{calories} <span className="text-xs font-normal opacity-80">kcal</span></p>
                                                    </Card>
                                                    <Card className="!p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <GiMuscleUp /> <span className="text-xs font-medium opacity-80">Fatiga</span>
                                                        </div>
                                                        <p className="text-xl font-bold">{avgFatigue} <span className="text-xs font-normal opacity-80">%</span></p>
                                                    </Card>
                                                    <Card className="!p-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <FiTrendingUp /> <span className="text-xs font-medium opacity-80">Intensity</span>
                                                        </div>
                                                        <p className="text-xl font-bold">{wellnessScore} <span className="text-xs font-normal opacity-80">%</span></p>
                                                    </Card>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Weekly Routine Builder (Always Visible - Entry Point) */}
                        <WeeklyRoutineBuilder
                            routine={routine}
                            setRoutine={setRoutine}
                            forcedActiveDay={forcedActiveDay}
                            onStartSession={startSession}
                            isLive={isSessionActive}
                        />


                    </motion.div>
                )}

                {/* TEMPLATES TAB */}
                {activeTab === 'templates' && (
                    <motion.div key="templates" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <h2 className="text-2xl font-bold mb-6">{t('plantillasDisponibles')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {templates.map(template => (
                                <Card key={template.id} className={`!p-0 overflow-hidden bg-gradient-to-br ${template.color} text-white border-none`}>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                                        <div className="flex flex-wrap gap-2 mb-4 text-sm">
                                            <span className="px-3 py-1 bg-white/20 rounded-full">{template.difficulty}</span>
                                            <span className="px-3 py-1 bg-white/20 rounded-full flex items-center gap-1"><FiClock size={12} /> {template.duration}</span>
                                            <span className="px-3 py-1 bg-white/20 rounded-full">{template.exercises} {t('ejerciciosIncluidos')}</span>
                                        </div>
                                        <p className="text-white/80 text-sm mb-4">{t('equipoNecesario')}: {template.equipment}</p>
                                        <button
                                            onClick={() => setSelectedTemplate(template)}
                                            className="w-full bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-slate-100 transition-colors"
                                        >
                                            {t('usarPlantilla')}
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* LIBRARY TAB */}
                {activeTab === 'library' && (
                    <motion.div key="library" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-4">{t('bibliotecaEjercicios')}</h2>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" placeholder={t('buscarEjercicio')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value="all">{t('todasCategorias')}</option>
                                    <option value="strength">{t('fuerzaTC')}</option>
                                    <option value="cardio">{t('cardioTC')}</option>
                                    <option value="flexibility">{t('flexibilidadTC')}</option>
                                </select>
                                <select value={muscleFilter} onChange={(e) => setMuscleFilter(e.target.value)}
                                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value="all">{t('todosGrupos')}</option>
                                    <option value="chest">{t('pechoTC')}</option>
                                    <option value="back">{t('espaldaTC')}</option>
                                    <option value="legs">{t('piernasTC')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredExercises.map(exercise => (
                                <Card key={exercise.id} className="!p-4 hover:shadow-xl transition-shadow">
                                    <img src={exercise.image} alt={exercise.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                                    <h3 className="font-bold text-lg mb-2">{exercise.name}</h3>
                                    <div className="flex gap-2 mb-3 text-xs">
                                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">{exercise.difficulty}</span>
                                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">{exercise.category}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1"><strong>{t('musculoPrimario')}:</strong> {exercise.primary}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4"><strong>{t('musculoSecundario')}:</strong> {exercise.secondary}</p>
                                    <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                                        {t('agregarEjercicio')}
                                    </button>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}



                {/* PROGRESS TAB */}
                {activeTab === 'progress' && (
                    <motion.div key="progress" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <h2 className="text-2xl font-bold mb-6">{t('tuProgreso')}</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <Card className="!p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <FiCalendar className="text-blue-500" /> {t('sesionesCompletadas')} - {t('semanaActual')}
                                </h3>
                                <div className="h-64">
                                    <Bar data={progressData.weeklyWorkouts} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                                </div>
                            </Card>
                            <Card className="!p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <FiTrendingUp className="text-green-500" /> {t('volumenTotal')} - {t('ultimoMes')}
                                </h3>
                                <div className="h-64">
                                    <Line data={progressData.volumeProgression} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                                </div>
                            </Card>
                        </div>

                        <Card className="!p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <FiAward className="text-yellow-500" /> {t('recordsPersonales')}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            <th className="text-left py-3 px-4 font-semibold">{t('ejercicioTC')}</th>
                                            <th className="text-left py-3 px-4 font-semibold">{t('recordTC')}</th>
                                            <th className="text-left py-3 px-4 font-semibold">{t('fechaTC')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {personalRecords.map((pr, idx) => (
                                            <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="py-3 px-4">{pr.exercise}</td>
                                                <td className="py-3 px-4 font-bold text-green-600">{pr.record}</td>
                                                <td className="py-3 px-4 text-slate-500">{pr.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </motion.div>
                )}

            </AnimatePresence>

            <ActivityLogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />
            <TrainingPlanGeneratorModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} />

            {/* Template Preview Modal */}
            {selectedTemplate && (
                <TemplatePreviewModal
                    template={selectedTemplate}
                    onClose={() => setSelectedTemplate(null)}
                    onAdd={addTemplateToRoutine}
                />
            )}
        </div>
    );
};

export default TrainingCenter;
