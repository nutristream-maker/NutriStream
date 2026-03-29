import React, { useState } from 'react';
import { Card, Button } from '../ui/Shared';
import { FiMessageSquare, FiCalendar, FiUserCheck, FiStar, FiFilter, FiTag, FiClock, FiX, FiCheckCircle } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import SpecialistProfileModal from './SpecialistProfileModal';

// Mock Data - Massive Expansion
const SPECIALISTS_DATA = [
    {
        id: 1,
        name: 'Dr. Sarah Connor',
        roleKey: 'filtroFisio',
        role: 'Fisioterapeuta Deportivo',
        image: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
        status: 'online',
        rating: 4.9,
        reviews: 124,
        price: '60€',
        tags: ['Rehabilitación', 'Masaje', 'Punción Seca'],
        bio: 'Especialista en recuperación de lesiones de alto rendimiento con 10 años de experiencia en la NBA.',
        videos: [
            { id: 101, title: 'Rutina de Activación de Glúteos', duration: '12:30', views: '1.2k', thumbnail: 'https://images.unsplash.com/photo-1574680096141-1cddd32e011e?auto=format&fit=crop&q=80' }
        ]
    },
    {
        id: 2,
        name: 'Marc Neo',
        roleKey: 'filtroEntrenador',
        role: 'Coach de Rendimiento',
        image: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
        status: 'offline',
        rating: 4.8,
        reviews: 89,
        price: '50€',
        tags: ['HIIT', 'Fuerza', 'Mental Game'],
        bio: 'Ex-atleta olímpico transformado en coach. Enfoque en mentalidad y fuerza explosiva.',
        videos: [
            { id: 201, title: 'HIIT Explosivo: 20 Minutos', duration: '20:00', views: '5.6k', thumbnail: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&q=80' }
        ]
    },
    {
        id: 3,
        name: 'Elena Ripley',
        roleKey: 'filtroNutri',
        role: 'Nutricionista',
        image: 'https://i.pravatar.cc/150?u=a04258114e29026302d',
        status: 'online',
        rating: 5.0,
        reviews: 210,
        price: '75€',
        tags: ['Keto', 'Suplementación', 'Metabolismo'],
        bio: 'Nutrición de precisión basada en análisis genético y biomarcadores.',
        videos: [{ id: 301, title: 'Mitos del Ayuno Intermitente', duration: '10:15', views: '8.9k', thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80' }]
    },
    {
        id: 4,
        name: 'Sofia Chen',
        roleKey: 'filtroEntrenador',
        role: 'Instructora de Yoga & Movilidad',
        image: 'https://i.pravatar.cc/150?u=a042581f4e29026014d',
        status: 'online',
        rating: 4.9,
        reviews: 156,
        price: '45€',
        tags: ['Yoga', 'Flexibilidad', 'Mindfulness'],
        bio: 'Combino la sabiduría del Yoga tradicional con la ciencia moderna del movimiento. Mejora tu rango de movimiento y encuentra tu centro.',
        videos: [{ id: 401, title: 'Morning Flow 15 Min', duration: '15:00', views: '12k', thumbnail: 'https://images.unsplash.com/photo-1544367563-12123d895e29?auto=format&fit=crop&q=80' }]
    },
    {
        id: 5,
        name: 'David Stone',
        roleKey: 'filtroEntrenador',
        role: 'Endurance Coach',
        image: 'https://i.pravatar.cc/150?u=a042581f4e29026884d',
        status: 'online',
        rating: 4.7,
        reviews: 78,
        price: '55€',
        tags: ['Running', 'Triatlón', 'Resistencia'],
        bio: 'Coach de resistencia para corredores y triatletas. Preparación para maratones y Ironman con métricas avanzadas.',
        videos: [{ id: 501, title: 'Técnica de Carrera Eficiente', duration: '08:20', views: '3k', thumbnail: 'https://images.unsplash.com/photo-1552674605-46d526758ad2?auto=format&fit=crop&q=80' }]
    },
    {
        id: 6,
        name: 'Dr. Javier Costa',
        roleKey: 'filtroFisio',
        role: 'Osteópata',
        image: 'https://i.pravatar.cc/150?u=a042581f4e29026333d',
        status: 'offline',
        rating: 5.0,
        reviews: 95,
        price: '70€',
        tags: ['Osteopatía', 'Columna', 'Postura'],
        bio: 'Enfoque holístico para el dolor de espalda y corrección postural. Terapia manual suave pero profunda.',
        videos: [{ id: 601, title: '5 Ejercicios para Dolor Lumbar', duration: '12:00', views: '5k', thumbnail: 'https://images.unsplash.com/photo-1544367563-12123d895e29?auto=format&fit=crop&q=80' }]
    },
    {
        id: 7,
        name: 'Maya Angelou',
        roleKey: 'filtroNutri',
        role: 'Nutricionista Plant-Based',
        image: 'https://i.pravatar.cc/150?u=a042581f4e29026999d',
        status: 'online',
        rating: 4.8,
        reviews: 112,
        price: '65€',
        tags: ['Vegano', 'Digestión', 'Energía'],
        bio: 'Especialista en nutrición basada en plantas para atletas. Optimiza tu rendimiento sin productos animales.',
        videos: [{ id: 701, title: 'Proteína Vegetal para Atletas', duration: '14:45', views: '7.2k', thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80' }]
    },
    {
        id: 8,
        name: 'Tom Platz',
        roleKey: 'filtroEntrenador',
        role: 'Coach de Hipertrofia',
        image: 'https://i.pravatar.cc/150?u=a042581f4e29026888d',
        status: 'offline',
        rating: 4.6,
        reviews: 205,
        price: '80€',
        tags: ['Bodybuilding', 'Pierna', 'Volumen'],
        bio: 'La vieja escuela del culturismo. Entrenamiento de alta intensidad para máxima hipertrofia.',
        videos: [{ id: 801, title: 'La Sentadilla Perfecta', duration: '18:30', views: '45k', thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80' }]
    },
    {
        id: 9,
        name: 'Laura Croft',
        roleKey: 'filtroFisio',
        role: 'Fisioterapeuta Neurológica',
        image: 'https://i.pravatar.cc/150?u=a042581f4e29026444d',
        status: 'online',
        rating: 4.9,
        reviews: 67,
        price: '65€',
        tags: ['Neuro', 'Equilibrio', 'Coordinación'],
        bio: 'Rehabilitación especializada para el sistema nervioso. Mejora tu conexión cerebro-músculo.',
        videos: []
    },
    {
        id: 10,
        name: 'Anna Freud',
        roleKey: 'filtroEntrenador',
        role: 'Psicóloga Deportiva',
        image: 'https://i.pravatar.cc/150?u=a042581f4e29026111d',
        status: 'online',
        rating: 5.0,
        reviews: 134,
        price: '90€',
        tags: ['Mente', 'Ansiedad', 'Foco'],
        bio: 'El rendimiento empieza en la mente. Técnicas de visualización y control del estrés para competición.',
        videos: [{ id: 1001, title: 'Visualización Pre-Competición', duration: '25:00', views: '2.5k', thumbnail: 'https://images.unsplash.com/photo-1499557354967-2b2d8910bcca?auto=format&fit=crop&q=80' }]
    }
];

const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 20; i++) {
        slots.push(`${i.toString().padStart(2, '0')}:00`);
        slots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return slots;
};

const Especialistas: React.FC = () => {
    const { t } = useLanguage();
    const [selectedSpecialist, setSelectedSpecialist] = useState<any>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [isPremium] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    const timeSlots = generateTimeSlots();

    // Filter Logic
    const filteredSpecialists = SPECIALISTS_DATA.filter(s =>
        filter === 'all' || s.roleKey === filter
    );

    const categories = [
        { key: 'all', label: t('filtroTodos') },
        { key: 'filtroEntrenador', label: t('filtroEntrenador') },
        { key: 'filtroFisio', label: t('filtroFisio') },
        { key: 'filtroNutri', label: t('filtroNutri') },
    ];

    const handleOpenBooking = (specialist: any) => {
        setSelectedSpecialist(specialist);
        setIsBookingModalOpen(true);
        setSelectedSlot(null);
    };

    const handleOpenProfile = (specialist: any) => {
        setSelectedSpecialist(specialist);
        setIsProfileModalOpen(true);
    };

    return (
        <div className="space-y-8">
            {/* Header & Filters */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        {t('especialistasCertificados')}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base">
                        {t('especialistasDesc')}
                    </p>
                </div>

                {/* Category Pills - Mobile Optimized */}
                <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex gap-2 min-w-max md:min-w-0 md:flex-wrap">
                        {categories.map(cat => (
                            <button
                                key={cat.key}
                                onClick={() => setFilter(cat.key)}
                                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${filter === cat.key
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredSpecialists.map((specialist) => (
                        <motion.div
                            key={specialist.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <Card className="hover:shadow-xl transition-shadow border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="p-6">
                                    {/* Header Profile */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img
                                                    src={specialist.image}
                                                    alt={specialist.name}
                                                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800"
                                                />
                                                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${specialist.status === 'online' ? 'bg-green-500' : 'bg-slate-400'
                                                    }`} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg dark:text-white">{specialist.name}</h3>
                                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{specialist.role}</p>
                                                <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                                                    <span className="fill-current"><FiStar /></span>
                                                    <span className="font-bold">{specialist.rating}</span>
                                                    <span className="text-slate-400">({specialist.reviews} {t('resenas')})</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {specialist.tags.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs rounded-md text-slate-600 dark:text-slate-400 font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Info Row */}
                                    <div className="mt-6 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400"><FiTag /></span>
                                            <span className={isPremium ? 'text-green-500 font-bold' : ''}>
                                                {isPremium ? (parseInt(specialist.price.replace('€', '')) * 0.2).toFixed(0) + '€' : specialist.price}
                                                / {t('sesion')}
                                            </span>
                                            {isPremium && <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded">-80%</span>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${specialist.status === 'online' ? 'bg-green-500' : 'bg-slate-400'}`} />
                                            <span>{specialist.status === 'online' ? t('conectado') : t('desconectadoStatus')}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-6 grid grid-cols-2 gap-3">
                                        <Button
                                            variant="secondary"
                                            icon={FiUserCheck}
                                            className="text-sm"
                                            onClick={() => handleOpenProfile(specialist)}
                                        >
                                            {t('verPerfil')}
                                        </Button>
                                        <Button onClick={() => handleOpenBooking(specialist)} icon={FiCalendar} className="text-sm">
                                            {t('agendar')}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Profile Modal */}
            <SpecialistProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                specialist={selectedSpecialist}
                isPremium={isPremium}
            />

            {/* Booking Modal */}
            <AnimatePresence>
                {isBookingModalOpen && selectedSpecialist && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsBookingModalOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <img
                                    src={selectedSpecialist.image}
                                    alt={selectedSpecialist.name}
                                    className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-slate-100 dark:border-slate-800"
                                />
                                <h3 className="text-xl font-bold">{t('agendarCita')}</h3>
                                <p className="text-slate-500 text-sm">{t('con')} {selectedSpecialist.name}</p>
                            </div>

                            {/* Time Slots Grid */}
                            <div className="mb-6 h-64 overflow-y-auto pr-2">
                                <h4 className="text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">Selecciona un Horario</h4>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {timeSlots.map(slot => (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`py-2 rounded-lg text-sm font-medium transition-all ${selectedSlot === slot
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="secondary" onClick={() => setIsBookingModalOpen(false)} className="flex-1">
                                    Cancelar
                                </Button>
                                <Button
                                    className="flex-1"
                                    icon={FiCheckCircle}
                                    onClick={() => setIsBookingModalOpen(false)}
                                    disabled={!selectedSlot}
                                >
                                    {t('confirmarCita')}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Especialistas;
