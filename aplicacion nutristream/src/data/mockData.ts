// Mock Data for NutriStream
import { FiZap, FiShoppingCart, FiTrendingDown, FiCalendar } from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';
import { Product, Specialist, SpecialistVideo, Message, Notification } from '../types';

export const initialUserData = {
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    dob: "1995-07-02",
    height: "178 cm",
    weight: "75 kg",
    wellnessScore: 87,
    plan: 'premium',
    stats: {
        heartRate: 72,
        steps: 8432,
        calories: 2340,
        sleep: 7.5
    },
    monthlyGoals: {
        fatLoss: 95,
        muscleMass: { current: 72, goal: 75 },
        vo2Max: { current: 48, goal: 55 }
    },
    recommendation: "Has mejorado un 8% en fuerza esta semana. Considera aumentar la ingesta de proteínas para optimizar la recuperación muscular."
};

export const mockSpecialists: Specialist[] = [
    { id: 1, name: "Dr. Ana Martínez", specialty: "Nutrición Deportiva", rating: 4.9, reviews: 118, price: 50, available: true, online: true },
    { id: 2, name: "Carlos Ruiz", specialty: "Entrenamiento Personal", rating: 4.8, reviews: 233, price: 50, available: true, online: false },
    { id: 3, name: "Dra. Laura Gómez", specialty: "Fisioterapia", rating: 4.9, reviews: 176, price: 65, available: false, online: false },
    { id: 4, name: "Miguel Torres", specialty: "Psicología Deportiva", rating: 4.7, reviews: 98, price: 60, available: true, online: true },
];

export const mockMarketplaceProducts: Product[] = [
    { id: 1, name: "Proteína Whey Premium", category: "Suplemento", price: 49.99, rating: 4.8, image: "/images/marketplace/whey.png", premium: true, description: "Proteína de suero de alta calidad con 25g por porción. Ideal para recuperación muscular post-entrenamiento.", gallery: ["/images/marketplace/whey.png", "/images/marketplace/whey.png", "/images/marketplace/whey.png"], reviews: [{ user: "Carlos", rating: 5, comment: "Excelente sabor y disolución." }, { user: "Ana", rating: 4, comment: "Buena calidad, pero un poco cara." }] },
    { id: 2, name: "Banda Elástica Pro", category: "Equipamiento", price: 29.99, rating: 4.9, image: "/images/marketplace/bands.png", description: "Set de 3 bandas elásticas de resistencia variable. Perfectas para ejercicios de movilidad y fortalecimiento.", gallery: ["/images/marketplace/bands.png", "/images/marketplace/bands.png", "/images/marketplace/bands.png"], reviews: [{ user: "Miguel", rating: 5, comment: "Muy resistentes y versátiles." }] },
    { id: 3, name: "Monitor Cardiaco Elite", category: "Tecnología", price: 199.99, rating: 4.9, image: "/images/marketplace/watch.png", premium: true, description: "Monitor de frecuencia cardíaca con GPS integrado y análisis avanzado de métricas deportivas.", gallery: ["/images/marketplace/watch.png", "/images/marketplace/watch.png", "/images/marketplace/watch.png"], reviews: [] },
    { id: 4, name: "Rodillo de Espuma", category: "Recuperación", price: 34.99, rating: 4.8, image: "/images/marketplace/roller.png", description: "Rodillo de espuma para masaje muscular y recuperación post-ejercicio. Ayuda a liberar la tensión.", gallery: ["/images/marketplace/roller.png", "/images/marketplace/roller.png", "/images/marketplace/roller.png"], reviews: [{ user: "Laura", rating: 5, comment: "Justo lo que necesitaba para mis piernas." }] },
    { id: 5, name: "Creatina Monohidrato", category: "Suplemento", price: 24.99, rating: 4.7, image: "/images/marketplace/creatine.png", description: "Creatina pura micronizada para mejorar fuerza y potencia muscular. 5g por servicio.", gallery: ["/images/marketplace/creatine.png", "/images/marketplace/creatine.png", "/images/marketplace/creatine.png"], reviews: [{ user: "Alex", rating: 5, comment: "He notado la diferencia en pocas semanas." }] },
    { id: 6, name: "Leggins Técnicos", category: "Ropa Deportiva", price: 59.99, rating: 4.9, image: "/images/marketplace/leggings.png", description: "Leggins de compresión con tejido transpirable que se adapta a cada movimiento.", gallery: ["/images/marketplace/leggings.png", "/images/marketplace/leggings.png", "/images/marketplace/leggings.png"], reviews: [{ user: "Sofia", rating: 5, comment: "¡Súper cómodos y no transparentan!" }] },
    { id: 7, name: "Pistola de Masaje Pro", category: "Recuperación", price: 129.99, rating: 4.8, image: "/images/marketplace/gun.png", premium: true, description: "Pistola de percusión con 5 cabezales intercambiables para una terapia de masaje profunda.", gallery: ["/images/marketplace/gun.png", "/images/marketplace/gun.png", "/images/marketplace/gun.png"], reviews: [{ user: "David", rating: 5, comment: "La mejor inversión para mi recuperación." }, { user: "Elena", rating: 4, comment: "Potente, quizás demasiado para mí." }] },
    { id: 8, name: "Mascara AeroLung Active", category: "Equipamiento", price: 79.99, rating: 5.0, image: "/images/marketplace/aerolung_photo.jpg", premium: true, description: "Máscara híbrida táctica con válvula iris motorizada y sensores integrados. Diseño de alto rendimiento para filtración y monitoreo respiratorio.", gallery: ["/images/marketplace/aerolung_photo.jpg", "/images/marketplace/aerolung_side.png", "/images/marketplace/aerolung_detail.png", "/images/marketplace/aerolung_lifestyle.png"], reviews: [] },
    { id: 9, name: "Gafas AeroVision Pro", category: "Tecnología", price: 299.99, rating: 5.0, image: "/images/marketplace/aerovision_photo.jpg", premium: true, description: "Gafas inteligentes AR con HUD holográfico, conducción ósea y sensores biométricos. Visualiza tu rendimiento en tiempo real sin apartar la vista.", gallery: ["/images/marketplace/aerovision_photo.jpg", "/images/marketplace/aerovision_side.png", "/images/marketplace/aerovision_hud.png", "/images/marketplace/aerovision_case.png"], reviews: [] },
    { id: 10, name: "Plantillas GroundTruth", category: "Equipamiento", price: 149.99, rating: 4.8, image: "/images/marketplace/groundtruth_photo.png", premium: true, description: "Plantillas inteligentes con matriz de presión de alta resolución. Analiza tu pisada, equilibrio y cadencia en tiempo real.", gallery: ["/images/marketplace/groundtruth_photo.png", "/images/marketplace/groundtruth_app.png", "/images/marketplace/groundtruth_lifestyle.png"], reviews: [] },
    { id: 11, name: "Sensor ImpactCore X1", category: "Tecnología", price: 89.99, rating: 4.9, image: "/images/marketplace/impactcore_padel.jpg", premium: true, description: "Sensor inercial de precisión para deportes de raqueta. Analiza potencia, spin y punto de impacto. Compatible con Tenis y Pádel.", gallery: ["/images/marketplace/impactcore_padel.jpg", "/images/marketplace/impactcore_tennis.png"], reviews: [] },
    { id: 12, name: "Sistema Neural Skin-Pod", category: "Equipamiento", price: 349.99, rating: 5.0, image: "/images/marketplace/neuralskin_gym_back.jpg", premium: true, description: "Ecosistema completo: Camiseta + Mallas + POD. Monitorización muscular total y fatiga en tiempo real.", gallery: ["/images/marketplace/neuralskin_gym_back.jpg", "/images/marketplace/neuralskin_ropes_shirt.jpg", "/images/marketplace/neuralskin_run_pants.png", "/images/marketplace/neuralskin_cycle_pants.jpg", "/images/marketplace/neuralskin_pod_product.png"], reviews: [] },
    { id: 13, name: "Camiseta Neural Skin-Core", category: "Ropa Deportiva", price: 129.99, rating: 4.8, image: "/images/marketplace/neuralskin_ropes_shirt.jpg", premium: true, description: "Camiseta de compresión con red de sensores EMG integrada para torso y brazos. *Requiere módulo POD (y se vende por separado).", gallery: ["/images/marketplace/neuralskin_ropes_shirt.jpg", "/images/marketplace/neuralskin_gym_back.jpg"], reviews: [] },
    { id: 14, name: "Mallas Neural Skin-Flex", category: "Ropa Deportiva", price: 149.99, rating: 4.9, image: "/images/marketplace/neuralskin_run_pants.png", premium: true, description: "Mallas biométricas con mapeo muscular de cuádriceps, isquios y glúteos. *Requiere módulo POD (se vende por separado).", gallery: ["/images/marketplace/neuralskin_run_pants.png", "/images/marketplace/neuralskin_cycle_pants.jpg"], reviews: [] },
    { id: 15, name: "Módulo Central Neural POD", category: "Tecnología", price: 199.99, rating: 5.0, image: "/images/marketplace/neuralskin_pod_product.png", premium: true, description: "El cerebro del sistema Neural Skin. Procesador ARM con IA local, Bluetooth 5.2 Low Energy y batería para 24h. Compatible con todas las prendas Neural Skin.", gallery: ["/images/marketplace/neuralskin_pod_product.png"], reviews: [] },
];

export const mockRecoveryData: {
    [key: string]: {
        recovery: number,
        lastTrained: string,
        history: { date: string, type: string, intensity: string }[],
        volumeThisWeek: number,
        maxStrength: string,
        nextRecommended: string,
        injuries: {
            date: string,
            type: string,
            severity: 'leve' | 'moderada' | 'grave',
            status: 'activa' | 'recuperada',
            notes?: string
        }[]
    }
} = {
    'Pectoral': {
        recovery: 95,
        lastTrained: 'hace 2 días',
        volumeThisWeek: 18,
        maxStrength: '120kg',
        nextRecommended: 'Listo para entrenar',
        injuries: [],
        history: [
            { date: 'hace 2 días', type: 'Fuerza', intensity: 'Alta' },
            { date: 'hace 5 días', type: 'Hipertrofia', intensity: 'Media' },
            { date: 'hace 9 días', type: 'Resistencia', intensity: 'Baja' }
        ]
    },
    'Bíceps': {
        recovery: 60,
        lastTrained: 'hace 1 día',
        volumeThisWeek: 24,
        maxStrength: '45kg',
        nextRecommended: 'Descansar 1 día más',
        injuries: [],
        history: [
            { date: 'hace 1 día', type: 'Hipertrofia', intensity: 'Media' },
            { date: 'hace 4 días', type: 'Volumen', intensity: 'Media' },
            { date: 'hace 8 días', type: 'Fuerza', intensity: 'Alta' }
        ]
    },
    'Tríceps': {
        recovery: 75,
        lastTrained: 'hace 1 día',
        volumeThisWeek: 20,
        maxStrength: '50kg',
        nextRecommended: 'Entrenar mañana',
        injuries: [],
        history: [
            { date: 'hace 1 día', type: 'Hipertrofia', intensity: 'Media' },
            { date: 'hace 4 días', type: 'Fuerza', intensity: 'Alta' }
        ]
    },
    'Abdominales': {
        recovery: 80,
        lastTrained: 'hace 1 día',
        volumeThisWeek: 15,
        maxStrength: 'N/A',
        nextRecommended: 'Listo para entrenar',
        injuries: [],
        history: [
            { date: 'hace 1 día', type: 'Resistencia', intensity: 'Alta' },
            { date: 'hace 3 días', type: 'Resistencia', intensity: 'Media' }
        ]
    },
    'Deltoides': {
        recovery: 90,
        lastTrained: 'hace 3 días',
        volumeThisWeek: 16,
        maxStrength: '35kg',
        nextRecommended: 'Listo para entrenar',
        injuries: [],
        history: [
            { date: 'hace 3 días', type: 'Fuerza', intensity: 'Alta' },
            { date: 'hace 7 días', type: 'Hipertrofia', intensity: 'Media' }
        ]
    },
    'Cuádriceps': {
        recovery: 25,
        lastTrained: 'hace 18 horas',
        volumeThisWeek: 28,
        maxStrength: '180kg',
        nextRecommended: 'Descansar 2 días',
        injuries: [{
            date: '2024-12-15',
            type: 'Sobrecarga',
            severity: 'leve',
            status: 'recuperada',
            notes: 'Sensación de tensión tras sesión de sentadillas'
        }],
        history: [
            { date: 'hace 18 horas', type: 'Fuerza', intensity: 'Muy Alta' },
            { date: 'hace 4 días', type: 'Hipertrofia', intensity: 'Alta' },
            { date: 'hace 7 días', type: 'Potencia', intensity: 'Media' }
        ]
    },
    'Isquiotibiales': {
        recovery: 40,
        lastTrained: 'hace 18 horas',
        volumeThisWeek: 22,
        maxStrength: '140kg',
        nextRecommended: 'Descansar 1 día',
        injuries: [],
        history: [
            { date: 'hace 18 horas', type: 'Fuerza', intensity: 'Muy Alta' },
            { date: 'hace 4 días', type: 'Hipertrofia', intensity: 'Alta' }
        ]
    },
    'Gemelos': {
        recovery: 85,
        lastTrained: 'hace 18 horas',
        volumeThisWeek: 12,
        maxStrength: 'N/A',
        nextRecommended: 'Listo para entrenar',
        injuries: [],
        history: [
            { date: 'hace 18 horas', type: 'Resistencia', intensity: 'Alta' },
            { date: 'hace 5 días', type: 'Volumen', intensity: 'Media' }
        ]
    },
    'Glúteos': {
        recovery: 50,
        lastTrained: 'hace 2 días',
        volumeThisWeek: 20,
        maxStrength: '200kg',
        nextRecommended: 'Descansar 1 día',
        injuries: [],
        history: [
            { date: 'hace 2 días', type: 'Potencia', intensity: 'Alta' },
            { date: 'hace 6 días', type: 'Hipertrofia', intensity: 'Media' }
        ]
    },
    'Dorsales': {
        recovery: 88,
        lastTrained: 'hace 3 días',
        volumeThisWeek: 18,
        maxStrength: '95kg',
        nextRecommended: 'Listo para entrenar',
        injuries: [],
        history: [
            { date: 'hace 3 días', type: 'Fuerza', intensity: 'Alta' },
            { date: 'hace 8 días', type: 'Hipertrofia', intensity: 'Media' }
        ]
    },
    'Trapecio': {
        recovery: 92,
        lastTrained: 'hace 4 días',
        volumeThisWeek: 10,
        maxStrength: 'N/A',
        nextRecommended: 'Listo para entrenar',
        injuries: [],
        history: [
            { date: 'hace 4 días', type: 'Hipertrofia', intensity: 'Media' }
        ]
    },
    'Antebrazo': {
        recovery: 70,
        lastTrained: 'hace 1 día',
        volumeThisWeek: 8,
        maxStrength: 'N/A',
        nextRecommended: 'Entrenar mañana',
        injuries: [],
        history: [
            { date: 'hace 1 día', type: 'Resistencia', intensity: 'Baja' },
            { date: 'hace 3 días', type: 'Agarre', intensity: 'Media' }
        ]
    },
    'Oblicuos': {
        recovery: 85,
        lastTrained: 'hace 1 día',
        volumeThisWeek: 12,
        maxStrength: 'N/A',
        nextRecommended: 'Listo para entrenar',
        injuries: [],
        history: [
            { date: 'hace 1 día', type: 'Resistencia', intensity: 'Media' }
        ]
    },
    'Serrato': {
        recovery: 90,
        lastTrained: 'hace 3 días',
        volumeThisWeek: 6,
        maxStrength: 'N/A',
        nextRecommended: 'Listo para entrenar',
        injuries: [],
        history: [
            { date: 'hace 3 días', type: 'Fuerza', intensity: 'Media' }
        ]
    },
    'Lumbares': {
        recovery: 65,
        lastTrained: 'hace 2 días',
        volumeThisWeek: 14,
        maxStrength: 'N/A',
        nextRecommended: 'Entrenar mañana',
        injuries: [],
        history: [
            { date: 'hace 2 días', type: 'Fuerza', intensity: 'Media' }
        ]
    },
    'Tibiales': {
        recovery: 80,
        lastTrained: 'hace 1 día',
        volumeThisWeek: 8,
        maxStrength: 'N/A',
        nextRecommended: 'Listo para entrenar',
        injuries: [],
        history: [
            { date: 'hace 1 día', type: 'Resistencia', intensity: 'Media' }
        ]
    },
    'Aductores': {
        recovery: 70,
        lastTrained: 'hace 2 días',
        volumeThisWeek: 10,
        maxStrength: 'N/A',
        nextRecommended: 'Entrenar mañana',
        injuries: [],
        history: [
            { date: 'hace 2 días', type: 'Hipertrofia', intensity: 'Media' }
        ]
    }
};

export const mockSpecialistVideos: SpecialistVideo[] = [
    {
        id: 1,
        specialistId: 1,
        title: "5 Mitos sobre las Proteínas que Debes Conocer",
        thumbnail: "🥩",
        duration: "8:12",
        views: "12.5k",
        timestamp: "hace 3 días",
        videoUrl: "https://videos.pexels.com/video-files/8342231/8342231-hd_1280_720_25fps.mp4"
    },
    {
        id: 2,
        specialistId: 2,
        title: "Técnica Correcta para Sentadillas y Peso Muerto",
        thumbnail: "🏋️‍♂️",
        duration: "15:30",
        views: "48.2k",
        timestamp: "hace 1 semana",
        videoUrl: "https://videos.pexels.com/video-files/6780132/6780132-hd_1280_720_25fps.mp4"
    },
    {
        id: 3,
        specialistId: 4,
        title: "Visualización: La Herramienta Secreta para el Éxito",
        thumbnail: "🧠",
        duration: "6:45",
        views: "8.1k",
        timestamp: "hace 5 días",
        videoUrl: "https://videos.pexels.com/video-files/853876/853876-hd_1280_720_30fps.mp4"
    },
    {
        id: 4,
        specialistId: 3,
        title: "Cómo Prevenir Lesiones de Rodilla al Correr",
        thumbnail: "🏃‍♀️",
        duration: "11:05",
        views: "22k",
        timestamp: "hace 2 semanas",
        videoUrl: "https://videos.pexels.com/video-files/4064228/4064228-hd_1280_720_25fps.mp4"
    },
    {
        id: 5,
        specialistId: 1,
        title: "Guía Rápida de Suplementos Esenciales",
        thumbnail: "💊",
        duration: "9:55",
        views: "18.9k",
        timestamp: "hace 1 mes",
        videoUrl: "https://videos.pexels.com/video-files/5502128/5502128-hd_1280_720_25fps.mp4"
    },
];

export const mockConversations: { [key: number]: Message[] } = {
    1: [
        { id: 1, text: "Hola Dr. Martínez, tengo una duda sobre mi plan de comidas.", sender: 'user', timestamp: "10:30 AM" },
        { id: 2, text: "¡Hola Alex! Claro, dime en qué puedo ayudarte.", sender: 'specialist', timestamp: "10:31 AM" },
    ],
    4: [
        { id: 1, text: "Hola Miguel, ¿tienes algún consejo para mantener la motivación alta durante la semana?", sender: 'user', timestamp: "Ayer" },
    ]
};

export const mockMedicalData = {
    personal: {
        name: "Alex Morgan",
        age: "28 años",
        weight: "75 kg",
        height: "178 cm",
        bmi: "23.7",
        bloodType: "O+",
    },
    history: [
        { condition: "Esguince tobillo derecho", date: "2024-01-15", status: "Recuperado" },
        { condition: "Tendinitis rotuliana", date: "2023-08-22", status: "En tratamiento" },
    ],
    allergies: [
        { name: "Polen", severity: "positive" },
        { name: "Frutos secos", severity: "high" },
    ],
    analytics: [
        { name: "Hemoglobina", value: "15.2 g/dL", range: "13.5-17.5", status: "Normal" },
        { name: "Colesterol Total", value: "245 mg/dL", range: "<200", status: "Alto" },
        { name: "Glucosa", value: "92 mg/dL", range: "70-100", status: "Normal" },
        { name: "Vitamina D", value: "28 ng/mL", range: "30-100", status: "Bajo" },
    ],
    healthAlert: {
        title: "Alerta de Salud",
        message: "Tus niveles de Vitamina D y Colesterol están fuera del rango óptimo. Se recomienda:",
        recommendations: [
            "Aumentar exposición solar (15-20 min diarios).",
            "Reducir ingesta de grasas saturadas.",
            "Considerar suplementación (consulta con especialista).",
        ],
    },
    vaccinations: [
        { name: "COVID-19 (Pfizer)", date: "2023-11-10", status: "Al día" },
        { name: "Tétanos", date: "2019-05-15", status: "Válida hasta 2029" },
        { name: "Gripe Estacional", date: "2024-10-01", status: "Al día" }
    ],
    medications: [
        { name: "Vitamina D3", dose: "2000 UI", frequency: "Diaria", type: "Suplemento" },
        { name: "Omega 3", dose: "1000 mg", frequency: "Diaria", type: "Suplemento" }
    ],
    familyHistory: [
        { condition: "Diabetes Tipo 2", relative: "Padre", risk: "Moderado" },
        { condition: "Hipertensión", relative: "Madre", risk: "Bajo" }
    ],
    // New Data for Phase G
    documents: [
        { id: 1, name: "Analítica_Completa_2023.pdf", type: "Analítica", date: "2023-11-20", size: "1.2 MB", url: "#" },
        { id: 2, name: "Radiografía_Tobillo.jpg", type: "Imagen", date: "2024-01-16", size: "3.5 MB", url: "#" },
        { id: 3, name: "Informe_Cardiología.pdf", type: "Informe", date: "2023-05-10", size: "0.8 MB", url: "#" }
    ],
    analyticsHistory: {
        "Vitamina D": [
            { date: "2023-01", value: 35 },
            { date: "2023-06", value: 32 },
            { date: "2023-11", value: 28 },
            { date: "2024-01", value: 30 }
        ],
        "Colesterol Total": [
            { date: "2023-01", value: 210 },
            { date: "2023-06", value: 225 },
            { date: "2023-11", value: 245 },
            { date: "2024-01", value: 240 }
        ],
        "Hemoglobina": [
            { date: "2023-01", value: 14.8 },
            { date: "2023-06", value: 15.0 },
            { date: "2023-11", value: 15.2 },
            { date: "2024-01", value: 15.1 }
        ]
    }
};

export const mockNotifications: Notification[] = [
    { id: 1, icon: FiZap, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/50', title: 'Nuevo récord de calorías', message: '¡Felicidades! Has quemado 500 kcal hoy.', time: 'hace 5 min' },
    { id: 2, icon: FiShoppingCart, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/50', title: 'Pedido enviado', message: 'Tu pedido de Proteína Whey ha sido enviado.', time: 'hace 1 hora' },
    { id: 3, icon: GiMuscleUp, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/50', title: 'Recuperación baja', message: 'Tus cuádriceps necesitan descanso.', time: 'hace 3 horas' },
    { id: 4, icon: FiCalendar, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/50', title: 'Cita confirmada', message: 'Tu cita con Dr. Martínez es mañana.', time: 'Ayer' },
];

export const mockOrderHistory = [
    {
        id: 'ORD-NTS-98765',
        date: '2024-06-25',
        status: 'Entregado',
        total: 85.97,
        items: [
            { product: mockMarketplaceProducts.find(p => p.id === 1), quantity: 1 },
            { product: mockMarketplaceProducts.find(p => p.id === 4), quantity: 1 },
        ]
    },
    {
        id: 'ORD-NTS-98764',
        date: '2024-05-18',
        status: 'Entregado',
        total: 129.99,
        items: [
            { product: mockMarketplaceProducts.find(p => p.id === 7), quantity: 1 },
        ]
    },
    {
        id: 'ORD-NTS-98763',
        date: '2024-04-30',
        status: 'Entregado',
        total: 54.98,
        items: [
            { product: mockMarketplaceProducts.find(p => p.id === 2), quantity: 1 },
            { product: mockMarketplaceProducts.find(p => p.id === 5), quantity: 1 },
        ]
    }
].map(order => ({
    ...order,
    items: order.items.filter(item => item.product).map(item => ({ product: item.product!, quantity: item.quantity }))
}));
