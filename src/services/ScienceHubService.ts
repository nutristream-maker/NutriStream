// ═══════════════════════════════════════════════════════════════════════════
// SCIENCE HUB SERVICE
// Divulgación científica: neurociencia, nutrición, biomecánica, fisiología
// ═══════════════════════════════════════════════════════════════════════════

// ─── TYPES ─────────────────────────────────────────────────────────────────

export type ContentType = 'article' | 'podcast' | 'video' | 'thesis' | 'report';
export type ScienceCategory = 'neuroscience' | 'nutrition' | 'sports-science' | 'biomechanics' | 'physiology';

export interface ScienceComment {
    id: string;
    authorName: string;
    authorAvatar: string;
    text: string;
    createdAt: Date;
    likeCount: number;
}

export interface ScienceContent {
    id: string;
    type: ContentType;
    category: ScienceCategory;
    title: string;
    subtitle?: string;
    author: string;
    authorRole: string;
    authorAvatar: string;
    thumbnail: string;
    content: string; // Summary/description
    fullContent?: string; // HTML or Markdown for the full article
    videoUrl?: string;
    audioUrl?: string;
    duration?: number; // minutes for podcast/video
    pages?: number; // for articles/thesis
    publishedAt: Date;
    source: string; // journal, platform, university
    sourceUrl: string;
    tags: string[];
    isBookmarked: boolean;
    bookmarkCount: number;
    viewCount: number;
    isFeatured: boolean;
    // Interactions
    likeCount: number;
    isLiked: boolean;
    commentCount: number;
    comments: ScienceComment[];
    repostCount: number;
    isReposted: boolean;
}

export interface ScienceCategoryInfo {
    key: ScienceCategory;
    label: string;
    emoji: string;
    color: string;
    bgColor: string;
    borderColor: string;
    gradient: string;
}

// ─── CATEGORY CONFIG ───────────────────────────────────────────────────────

export const SCIENCE_CATEGORIES: ScienceCategoryInfo[] = [
    { key: 'neuroscience', label: 'Neurociencia', emoji: '🧠', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-500/20', borderColor: 'border-purple-200 dark:border-purple-500/30', gradient: 'from-purple-500 to-indigo-600' },
    { key: 'nutrition', label: 'Nutrición', emoji: '🍎', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-500/20', borderColor: 'border-green-200 dark:border-green-500/30', gradient: 'from-green-500 to-emerald-600' },
    { key: 'sports-science', label: 'Ciencia del Deporte', emoji: '🏃', color: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-100 dark:bg-cyan-500/20', borderColor: 'border-cyan-200 dark:border-cyan-500/30', gradient: 'from-cyan-500 to-blue-600' },
    { key: 'biomechanics', label: 'Biomecánica', emoji: '🦴', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-500/20', borderColor: 'border-amber-200 dark:border-amber-500/30', gradient: 'from-amber-500 to-orange-600' },
    { key: 'physiology', label: 'Fisiología', emoji: '🫀', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-500/20', borderColor: 'border-red-200 dark:border-red-500/30', gradient: 'from-red-500 to-rose-600' }
];

export const CONTENT_TYPE_CONFIG: Record<ContentType, { label: string; emoji: string; color: string; bgColor: string }> = {
    article: { label: 'Artículo', emoji: '📄', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    podcast: { label: 'Podcast', emoji: '🎙️', color: 'text-violet-400', bgColor: 'bg-violet-500/20' },
    video: { label: 'Vídeo', emoji: '🎬', color: 'text-rose-400', bgColor: 'bg-rose-500/20' },
    thesis: { label: 'Tesis', emoji: '📚', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
    report: { label: 'Informe', emoji: '📊', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' }
};

// ─── MOCK DATA ─────────────────────────────────────────────────────────────

const mockContents: ScienceContent[] = [
    {
        id: 'sci-001',
        type: 'article',
        category: 'physiology',
        title: 'VO2 Max y longevidad: lo que revelan 20 años de estudios',
        subtitle: 'Un meta-análisis exhaustivo sobre capacidad aeróbica y esperanza de vida',
        author: 'Dra. Elena Martínez',
        authorRole: 'Fisióloga del Ejercicio',
        authorAvatar: 'https://randomuser.me/api/portraits/women/50.jpg',
        thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600',
        content: 'Un nuevo meta-análisis publicado en The Lancet confirma que el VO2 Max es el predictor más potente de mortalidad por todas las causas. Los individuos en el percentil superior de capacidad cardiorrespiratoria muestran una reducción del 80% en riesgo de muerte prematura comparados con los sedentarios.',
        fullContent: `
            <p>El <strong>VO2 Max</strong> (consumo máximo de oxígeno) no es solo una métrica para atletas de élite; es el signo vital más importante para tu longevidad. Un reciente meta-análisis que abarca datos de más de 20 años y 120.000 participantes ha arrojado resultados contundentes.</p>
            <h3>Hallazgos Clave</h3>
            <ul>
                <li><strong>Reducción de Mortalidad:</strong> Pasar de un nivel "Bajo" a "Por debajo del promedio" en VO2 Max reduce el riesgo de muerte más que dejar de fumar.</li>
                <li><strong>El Poder del Percentil Top:</strong> Los individuos en el 2% superior de capacidad aeróbica para su edad tienen una supervivencia 5 veces mayor que los del 20% inferior.</li>
            </ul>
            <h3>¿Cómo mejorarlo?</h3>
            <p>La evidencia sugiere un enfoque polarizado: 80% del volumen a baja intensidad (Zona 2) para mejorar la salud mitocondrial, y 20% a muy alta intensidad (Zona 5/HIIT) para maximizar el gasto cardíaco.</p>
        `,
        pages: 12,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        source: 'The Lancet Sports Medicine',
        sourceUrl: 'https://www.thelancet.com',
        tags: ['VO2 Max', 'Longevidad', 'Meta-análisis', 'Cardio'],
        isBookmarked: false,
        bookmarkCount: 234,
        viewCount: 1820,
        isFeatured: true,
        likeCount: 412,
        isLiked: false,
        commentCount: 2,
        comments: [
            { id: 'c-001', authorName: 'Ana García', authorAvatar: 'https://randomuser.me/api/portraits/women/44.jpg', text: 'Increíble meta-análisis. El VO2 Max debería medirse en todo chequeo médico.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), likeCount: 18 },
            { id: 'c-002', authorName: 'Carlos Ruiz', authorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg', text: 'Empecé a entrenar zona 2 después de leer esto. Resultados visibles en 8 semanas.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), likeCount: 9 }
        ],
        repostCount: 87,
        isReposted: false
    },
    {
        id: 'sci-002',
        type: 'podcast',
        category: 'neuroscience',
        title: 'NeuroPádel Ep.14: Fatiga Central vs Periférica',
        subtitle: 'Por qué tu cerebro se rinde antes que tus músculos',
        author: 'Dr. Javier Ruiz',
        authorRole: 'Neurocientífico Deportivo',
        authorAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600',
        content: 'En este episodio exploramos el fascinante modelo de "gobernador central" del Dr. Noakes. Tu cerebro actúa como un limitador de rendimiento, reduciendo el reclutamiento muscular mucho antes de que haya un peligro real. Descubre cómo engañar a tu sistema nervioso para rendir más.',
        fullContent: 'En este episodio de 45 minutos profundizamos en la teoría del Gobernador Central...',
        audioUrl: 'https://example.com/audio.mp3',
        duration: 45,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        source: 'NeuroPádel Podcast',
        sourceUrl: 'https://open.spotify.com',
        tags: ['Fatiga', 'Sistema Nervioso', 'Rendimiento', 'Cerebro'],
        isBookmarked: true,
        bookmarkCount: 189,
        viewCount: 3420,
        isFeatured: true,
        likeCount: 345,
        isLiked: true,
        commentCount: 1,
        comments: [
            { id: 'c-003', authorName: 'Laura Sánchez', authorAvatar: 'https://randomuser.me/api/portraits/women/28.jpg', text: 'Esto explica por qué rindo peor cuando estoy mentalmente cansado. Fascinante.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), likeCount: 24 }
        ],
        repostCount: 56,
        isReposted: false
    },
    {
        id: 'sci-003',
        type: 'video',
        category: 'biomechanics',
        title: 'Biomecánica del golpeo de revés en pádel: análisis 3D',
        subtitle: 'Captura de movimiento y análisis cinemático completo',
        author: 'Dr. Pablo Sánchez',
        authorRole: 'Biomecánico - Univ. Politécnica',
        authorAvatar: 'https://randomuser.me/api/portraits/men/38.jpg',
        thumbnail: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600',
        content: 'Utilizando 12 cámaras de captura de movimiento y sensores inerciales, analizamos las diferencias cinemáticas entre jugadores amateurs y profesionales en el golpeo de revés. Los resultados revelan que la rotación de cadera y la secuencia de activación son más determinantes que la fuerza bruta.',
        fullContent: 'Análisis detallado en vídeo de la técnica de revés...',
        videoUrl: 'https://example.com/video.mp4',
        duration: 18,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        source: 'Journal of Sports Biomechanics',
        sourceUrl: 'https://www.youtube.com',
        tags: ['Pádel', 'Cinemática', 'Captura Movimiento', '3D'],
        isBookmarked: false,
        bookmarkCount: 312,
        viewCount: 5670,
        isFeatured: false,
        likeCount: 523,
        isLiked: false,
        commentCount: 0,
        comments: [],
        repostCount: 145,
        isReposted: false
    },
    {
        id: 'sci-004',
        type: 'thesis',
        category: 'neuroscience',
        title: 'Adaptaciones neuromusculares al entrenamiento HIIT en adultos mayores',
        subtitle: 'Tesis Doctoral — Universidad de Barcelona',
        author: 'Dra. María López Fernández',
        authorRole: 'Doctorado en Ciencias del Deporte',
        authorAvatar: 'https://randomuser.me/api/portraits/women/33.jpg',
        thumbnail: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600',
        content: 'Esta tesis doctoral demuestra que 12 semanas de HIIT producen mejoras significativas en la velocidad de conducción nerviosa, la tasa de desarrollo de fuerza y la co-activación muscular en adultos mayores de 65 años. Los resultados sugieren que el HIIT puede revertir parcialmente el deterioro neuromuscular asociado al envejecimiento.',
        fullContent: `
            <h3>Resumen Ejecutivo</h3>
            <p>El envejecimiento se asocia con una pérdida progresiva de masa muscular (sarcopenia) y función (dinapenia). Esta tesis investiga el impacto del entrenamiento interválico de alta intensidad (HIIT) en las adaptaciones neuromusculares.</p>
            <h3>Metodología</h3>
            <p>60 participantes (edad media 68 años) fueron aleatorizados en grupos de control, entrenamiento continuo y HIIT. Se realizaron biopsias musculares y estudios de electromiografía de superficie.</p>
            <h3>Resultados</h3>
            <p>El grupo HIIT mostró un aumento del 40% en biomarcadores de biogénesis mitocondrial y una mejora del 15% en la velocidad de marcha.</p>
        `,
        pages: 287,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
        source: 'Universidad de Barcelona',
        sourceUrl: 'https://www.tdx.cat',
        tags: ['HIIT', 'Envejecimiento', 'Neuromuscular', 'Fuerza'],
        isBookmarked: false,
        bookmarkCount: 156,
        viewCount: 890,
        isFeatured: false,
        likeCount: 178,
        isLiked: false,
        commentCount: 1,
        comments: [
            { id: 'c-004', authorName: 'Dr. Pedro Alonso', authorAvatar: 'https://randomuser.me/api/portraits/men/55.jpg', text: 'Excelente trabajo de la Dra. López. Estamos aplicando sus hallazgos en nuestra clínica geriátrica.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), likeCount: 31 }
        ],
        repostCount: 34,
        isReposted: false
    },
    {
        id: 'sci-005',
        type: 'report',
        category: 'nutrition',
        title: 'Creatina y rendimiento cognitivo: revisión sistemática 2025',
        subtitle: 'Más allá del músculo: efectos neuroprotectores de la creatina',
        author: 'Dr. Andrés Moreno',
        authorRole: 'Nutricionista Deportivo',
        authorAvatar: 'https://randomuser.me/api/portraits/men/52.jpg',
        thumbnail: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600',
        content: 'Esta revisión sistemática de 42 ensayos clínicos demuestra que la suplementación con creatina monohidrato (3-5g/día) mejora la memoria de trabajo, la velocidad de procesamiento y la resistencia a la fatiga mental, especialmente bajo estrés o privación de sueño. Los mecanismos incluyen el aumento de fosfocreatina cerebral y la regulación del metabolismo energético neuronal.',
        fullContent: `
            <h3>Introducción</h3>
            <p>La creatina es famosa por su rol en el rendimiento muscular, pero el cerebro consume el 20% de la energía del cuerpo. Mantener los niveles de ATP cerebral es crucial para la cognición.</p>
            <h3>Evidencia en Cognición</h3>
            <p>Los estudios revisados muestran consistentemente que la creatina mejora el rendimiento en tareas que requieren mucho "ancho de banda" cognitivo, como recordar secuencias numéricas inversas o cambiar rápidamente de tareas.</p>
            <h3>Dosis Recomendada</h3>
            <p>Para beneficios cognitivos, la dosis de mantenimiento de 5g diarios parece ser efectiva, aunque la saturación cerebral puede tardar más que la muscular.</p>
        `,
        pages: 34,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
        source: 'British Journal of Sports Medicine',
        sourceUrl: 'https://bjsm.bmj.com',
        tags: ['Creatina', 'Cognición', 'Suplementación', 'Neuroprotección'],
        isBookmarked: true,
        bookmarkCount: 445,
        viewCount: 2340,
        isFeatured: false,
        likeCount: 567,
        isLiked: false,
        commentCount: 0,
        comments: [],
        repostCount: 112,
        isReposted: true
    },
    {
        id: 'sci-006',
        type: 'podcast',
        category: 'sports-science',
        title: 'Ciencia del Desgaste: Cómo periodizar sin sobreentrenar',
        subtitle: 'Entrevista con el Dr. Iñigo San Millán',
        author: 'NutriStream Science',
        authorRole: 'Equipo Editorial',
        authorAvatar: 'https://randomuser.me/api/portraits/men/22.jpg',
        thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600',
        content: 'El Dr. Iñigo San Millán, fisiólogo de rendimiento de Tadej Pogačar, explica su modelo de umbrales metabólicos y cómo aplicarlo a deportistas recreativos. Discutimos la importancia de "entrenar bajo" para las adaptaciones mitocondriales y por qué el 80% de tu entrenamiento debería ser a baja intensidad.',
        fullContent: 'Transcripción y notas del show sobre entrenamiento de Zona 2...',
        audioUrl: 'https://example.com/podcast2.mp3',
        duration: 62,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 120),
        source: 'NutriStream Podcast',
        sourceUrl: 'https://open.spotify.com',
        tags: ['Periodización', 'Sobreentrenamiento', 'Umbrales', 'Mitocondrias'],
        isBookmarked: false,
        bookmarkCount: 567,
        viewCount: 4510,
        isFeatured: false,
        likeCount: 612,
        isLiked: false,
        commentCount: 0,
        comments: [],
        repostCount: 189,
        isReposted: false
    },
    {
        id: 'sci-007',
        type: 'article',
        category: 'nutrition',
        title: 'La ventana anabólica: mito o realidad actualizada',
        subtitle: 'Qué dice la ciencia actual sobre la nutrición post-ejercicio',
        author: 'Dra. Laura Pérez',
        authorRole: 'PhD Nutrición Deportiva',
        authorAvatar: 'https://randomuser.me/api/portraits/women/25.jpg',
        thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600',
        content: 'Durante décadas se promovió la idea de una "ventana anabólica" de 30 minutos post-ejercicio. La evidencia actual muestra que la distribución proteica total diaria (1.6-2.2 g/kg) importa más que el timing inmediato, excepto en atletas que entrenan dos veces al día o en estado de restricción calórica.',
        fullContent: `
            <h3>El Mito de los 30 Minutos</h3>
            <p>La idea de que debes beber tu batido en el vestuario o "perderás tus ganancias" ha sido matizada. La sensibilidad anabólica muscular persiste hasta 24 horas después del entrenamiento.</p>
            <h3>¿Cuándo sí importa el timing?</h3>
            <p>Si tienes otra sesión de entrenamiento en menos de 8 horas (ej. atleta de CrossFit o triatleta), la reposición rápida de glucógeno y proteína es vital. Para el resto de nosotros, el total diario es rey.</p>
        `,
        pages: 8,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 150),
        source: 'International Journal of Sport Nutrition',
        sourceUrl: 'https://journals.humankinetics.com',
        tags: ['Proteína', 'Recuperación', 'Timing', 'Anabolismo'],
        isBookmarked: false,
        bookmarkCount: 289,
        viewCount: 3100,
        isFeatured: false,
        likeCount: 389,
        isLiked: false,
        commentCount: 0,
        comments: [],
        repostCount: 67,
        isReposted: false
    },
    {
        id: 'sci-008',
        type: 'video',
        category: 'physiology',
        title: 'Termorregulación en deportistas: del sudor a la performance',
        subtitle: 'Cómo tu cuerpo gestiona el calor y por qué importa',
        author: 'Dr. Carlos Villar',
        authorRole: 'Fisiólogo - Real Madrid CF',
        authorAvatar: 'https://randomuser.me/api/portraits/men/60.jpg',
        thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
        content: 'Una masterclass visual sobre los mecanismos de termorregulación durante el ejercicio de alta intensidad. Exploramos la vasodilatación cutánea, la producción de sudor, el papel del hipotálamo y las estrategias de pre-cooling que pueden mejorar el rendimiento un 3-7% en condiciones de calor.',
        fullContent: 'Contenido visual detallado sobre termorregulación...',
        videoUrl: 'https://example.com/video2.mp4',
        duration: 24,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 168),
        source: 'Science of Sport Academy',
        sourceUrl: 'https://www.youtube.com',
        tags: ['Termorregulación', 'Calor', 'Sudoración', 'Hipotálamo'],
        isBookmarked: false,
        bookmarkCount: 198,
        viewCount: 2780,
        isFeatured: false,
        likeCount: 234,
        isLiked: false,
        commentCount: 0,
        comments: [],
        repostCount: 45,
        isReposted: false
    },
    {
        id: 'sci-009',
        type: 'report',
        category: 'biomechanics',
        title: 'Análisis biomecánico de lesiones de rodilla en deportes de raqueta',
        subtitle: 'Patrones de carga articular y estrategias de prevención',
        author: 'Dr. Fernando Costa',
        authorRole: 'Traumatólogo Deportivo',
        authorAvatar: 'https://randomuser.me/api/portraits/men/35.jpg',
        thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600',
        content: 'Un informe que analiza 350 lesiones de rodilla en jugadores de pádel y tenis. Los datos de plataformas de fuerza y electromiografía muestran que los cambios de dirección con ángulos superiores a 60° generan cargas en valgo 3.2 veces superiores a las de carrera lineal. Se propone un protocolo preventivo basado en el fortalecimiento excéntrico del cuádriceps.',
        fullContent: `
            <h3>Mecanismos de Lesión</h3>
            <p>El pádel exige frenadas bruscas y giros. El ligamento cruzado anterior (LCA) sufre especialmente durante la desaceleración con la rodilla en valgo (hacia dentro).</p>
            <h3>Protocolo Preventivo</h3>
            <p>Se recomienda incluir ejercicios como el "Nordic Curl", sentadillas búlgaras y trabajo de aterrizaje unipodal al menos 2 veces por semana para mejorar la estabilidad dinámica de la rodilla.</p>
        `,
        pages: 22,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 200),
        source: 'European Journal of Sport Medicine',
        sourceUrl: 'https://ejsm.eu',
        tags: ['Rodilla', 'Prevención', 'Lesiones', 'Deportes Raqueta'],
        isBookmarked: false,
        bookmarkCount: 134,
        viewCount: 1560,
        isFeatured: false,
        likeCount: 198,
        isLiked: false,
        commentCount: 0,
        comments: [],
        repostCount: 56,
        isReposted: false
    },
    {
        id: 'sci-010',
        type: 'article',
        category: 'neuroscience',
        title: 'Neuroplasticidad inducida por ejercicio: mecanismos moleculares',
        subtitle: 'BDNF, neurogénesis y el cerebro del atleta',
        author: 'Dr. Miguel Ángel Torres',
        authorRole: 'Neurocientífico - CSIC',
        authorAvatar: 'https://randomuser.me/api/portraits/men/48.jpg',
        thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600',
        content: 'El ejercicio cardiovascular aumenta los niveles de BDNF (factor neurotrófico derivado del cerebro) hasta un 300%. Este artículo explora los mecanismos moleculares por los cuales el ejercicio promueve la neurogénesis en el hipocampo, mejora la conectividad sináptica y protege contra enfermedades neurodegenerativas como el Alzheimer.',
        fullContent: `
            <h3>BDNF: Fertilizante para el Cerebro</h3>
            <p>El Factor Neurotrófico Derivado del Cerebro (BDNF) es una proteína que actúa en ciertas neuronas del sistema nervioso central y periférico, ayudando a la supervivencia de las neuronas existentes y fomentando el crecimiento y la diferenciación de nuevas neuronas y sinapsis.</p>
            <h3>La Receta de Ejercicio</h3>
            <p>Aunque cualquier movimiento es bueno, el ejercicio aeróbico de intensidad moderada parece ser el más efectivo para elevar el BDNF agudamente, mientras que el entrenamiento de fuerza podría tener efectos complementarios a largo plazo.</p>
        `,
        pages: 15,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 240),
        source: 'Nature Neuroscience Reviews',
        sourceUrl: 'https://www.nature.com',
        tags: ['BDNF', 'Neuroplasticidad', 'Neurogénesis', 'Hipocampo'],
        isBookmarked: false,
        bookmarkCount: 678,
        viewCount: 4120,
        isFeatured: false,
        likeCount: 723,
        isLiked: false,
        commentCount: 0,
        comments: [],
        repostCount: 201,
        isReposted: false
    }
];

// ─── SERVICE ───────────────────────────────────────────────────────────────

export class ScienceHubService {

    static async getContents(category?: ScienceCategory): Promise<ScienceContent[]> {
        await new Promise(r => setTimeout(r, 300));
        let results = [...mockContents];
        if (category) {
            results = results.filter(c => c.category === category);
        }
        return results.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    }

    static async getFeatured(): Promise<ScienceContent[]> {
        await new Promise(r => setTimeout(r, 200));
        return mockContents.filter(c => c.isFeatured);
    }

    static async getById(id: string): Promise<ScienceContent | null> {
        await new Promise(r => setTimeout(r, 100));
        return mockContents.find(c => c.id === id) || null;
    }

    static async toggleBookmark(id: string): Promise<boolean> {
        await new Promise(r => setTimeout(r, 100));
        const content = mockContents.find(c => c.id === id);
        if (content) {
            content.isBookmarked = !content.isBookmarked;
            content.bookmarkCount += content.isBookmarked ? 1 : -1;
            return content.isBookmarked;
        }
        return false;
    }

    static async toggleLike(id: string): Promise<{ isLiked: boolean; likeCount: number }> {
        await new Promise(r => setTimeout(r, 100));
        const content = mockContents.find(c => c.id === id);
        if (content) {
            content.isLiked = !content.isLiked;
            content.likeCount += content.isLiked ? 1 : -1;
            return { isLiked: content.isLiked, likeCount: content.likeCount };
        }
        return { isLiked: false, likeCount: 0 };
    }

    static async toggleRepost(id: string): Promise<{ isReposted: boolean; repostCount: number }> {
        await new Promise(r => setTimeout(r, 100));
        const content = mockContents.find(c => c.id === id);
        if (content) {
            content.isReposted = !content.isReposted;
            content.repostCount += content.isReposted ? 1 : -1;
            return { isReposted: content.isReposted, repostCount: content.repostCount };
        }
        return { isReposted: false, repostCount: 0 };
    }

    static async addComment(id: string, text: string): Promise<ScienceComment | null> {
        await new Promise(r => setTimeout(r, 200));
        const content = mockContents.find(c => c.id === id);
        if (content) {
            const newComment: ScienceComment = {
                id: `c-${Date.now()}`,
                authorName: 'Tú',
                authorAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
                text,
                createdAt: new Date(),
                likeCount: 0
            };
            content.comments.push(newComment);
            content.commentCount++;
            return newComment;
        }
        return null;
    }

    static async getComments(id: string): Promise<ScienceComment[]> {
        await new Promise(r => setTimeout(r, 100));
        const content = mockContents.find(c => c.id === id);
        return content ? [...content.comments] : [];
    }

    static async getCategoryCounts(): Promise<Record<string, number>> {
        await new Promise(r => setTimeout(r, 100));
        const counts: Record<string, number> = { all: mockContents.length };
        for (const cat of SCIENCE_CATEGORIES) {
            counts[cat.key] = mockContents.filter(c => c.category === cat.key).length;
        }
        return counts;
    }
}

export default ScienceHubService;
