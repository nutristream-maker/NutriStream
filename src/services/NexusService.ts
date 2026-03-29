// NutriStream Nexus Feed Service
// Firebase-based service for social feed operations: posts, endorsements, comments

import {
    Post,
    PostType,
    CreatePostRequest,
    FeedOptions,
    FeedResponse,
    Endorsement,
    Comment,
    SensorDataSnapshot,
    LeagueTier
} from '../types/SocialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// MOCK SOCIAL DATA
// ═══════════════════════════════════════════════════════════════════════════

// Current user follows these users
const followedUserIds = ['user-002', 'user-003', 'user-005'];

// Current user's club
const currentUserClubId = 'club-elite';

// ═══════════════════════════════════════════════════════════════════════════
// MOCK POSTS
// ═══════════════════════════════════════════════════════════════════════════

const mockPosts: Post[] = [
    // ── FOLLOWED + CLUB: Ana García ──
    {
        id: 'post-001',
        authorId: 'user-002',
        authorName: 'Ana García',
        authorAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        authorLeague: 'platinum',
        type: 'bio-highlight',
        content: '🔥 ¡Nuevo récord personal de VO2 Max! 58.2 ml/kg/min después de 3 meses de entrenamiento con AeroLung. La constancia paga. #NutriStream #VO2Max',
        mediaUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        mediaType: 'image',
        hasSensorProof: true,
        sensorProof: {
            id: 'sensor-001',
            timestamp: new Date(),
            deviceType: 'aerolung',
            deviceId: 'aerolung-ana-001',
            vo2Max: 58.2,
            heartRateMax: 186,
            caloriesBurned: 420,
            breathingRate: 32
        },
        workoutType: 'Cardio Intenso',
        workoutDuration: 45,
        endorsements: [
            { id: 'e1', userId: 'u1', userName: 'Carlos', type: 'fire', createdAt: new Date() },
            { id: 'e2', userId: 'u2', userName: 'Pablo', type: 'beast', createdAt: new Date() }
        ],
        endorsementCount: 47,
        comments: [
            { id: 'c1', authorId: 'u3', authorName: 'María López', content: '¡Increíble progreso! ¿Qué rutina sigues?', createdAt: new Date(), likes: 5 }
        ],
        commentCount: 12,
        visibility: 'public',
        clubId: 'club-elite',
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
        isEdited: false
    },
    // ── FOLLOWED: Pablo Fernández ──
    {
        id: 'post-002',
        authorId: 'user-003',
        authorName: 'Pablo Fernández',
        authorAvatar: 'https://randomuser.me/api/portraits/men/67.jpg',
        authorLeague: 'elite',
        type: 'bio-highlight',
        content: '💪 Sesión de pádel brutal hoy. El Racket Sensor detectó un 15% más de potencia en el drive. ¡El trabajo de fuerza está dando resultados! 🎾',
        mediaUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
        mediaType: 'image',
        hasSensorProof: true,
        sensorProof: {
            id: 'sensor-002',
            timestamp: new Date(),
            deviceType: 'racket',
            deviceId: 'racket-pablo-001',
            swingSpeed: 142,
            impactForce: 890,
            spinRPM: 2400
        },
        workoutType: 'Pádel Training',
        workoutDuration: 90,
        endorsements: [
            { id: 'e3', userId: 'u4', userName: 'David', type: 'respect', createdAt: new Date() }
        ],
        endorsementCount: 89,
        comments: [],
        commentCount: 23,
        visibility: 'public',
        createdAt: new Date(Date.now() - 1000 * 60 * 120),
        isEdited: false
    },
    // ── CLUB: Carlos Martínez (current user) ──
    {
        id: 'post-003',
        authorId: 'user-001',
        authorName: 'Carlos Martínez',
        authorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        authorLeague: 'diamond',
        type: 'group-report',
        content: '📊 Informe del grupo de fuerza de esta mañana. 12 atletas, fatiga media del 45%, ¡excelente rendimiento! Neural Skin Pod detectó recuperación óptima en todos. #ClubElite',
        hasSensorProof: true,
        sensorProof: {
            id: 'sensor-003',
            timestamp: new Date(),
            deviceType: 'neural-skin',
            deviceId: 'ns-club-001',
            fatigueLevel: 45,
            muscleActivation: { 'pectoral': 85, 'deltoides': 72, 'biceps': 68 }
        },
        workoutType: 'Fuerza Grupal',
        workoutDuration: 60,
        endorsements: [],
        endorsementCount: 34,
        comments: [],
        commentCount: 8,
        visibility: 'public',
        clubId: 'club-elite',
        createdAt: new Date(Date.now() - 1000 * 60 * 240),
        isEdited: false
    },
    // ── FOLLOWED: Laura Sánchez ──
    {
        id: 'post-004',
        authorId: 'user-005',
        authorName: 'Laura Sánchez',
        authorAvatar: 'https://randomuser.me/api/portraits/women/28.jpg',
        authorLeague: 'gold',
        type: 'achievement',
        content: '🏆 ¡Desbloqueé la insignia "Road Warrior"! 1000km completados con GroundTruth X1. Ha sido un viaje increíble. ¡Gracias a todos por el apoyo!',
        hasSensorProof: true,
        sensorProof: {
            id: 'sensor-004',
            timestamp: new Date(),
            deviceType: 'groundtruth',
            deviceId: 'gt-laura-001',
            distanceKm: 1000,
            stepsCount: 1250000
        },
        endorsements: [],
        endorsementCount: 156,
        comments: [],
        commentCount: 42,
        visibility: 'public',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
        isEdited: false
    },
    // ── NOT FOLLOWED / NOT CLUB: Marco Ruiz ──
    {
        id: 'post-005',
        authorId: 'user-010',
        authorName: 'Marco Ruiz',
        authorAvatar: 'https://randomuser.me/api/portraits/men/55.jpg',
        authorLeague: 'silver',
        type: 'bio-highlight',
        content: '🏃 Primera media maratón completada en 1:42:30. GroundTruth registró 21.1km exactos con cadencia media de 178 spm. ¡Objetivo cumplido!',
        mediaUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
        mediaType: 'image',
        hasSensorProof: true,
        sensorProof: {
            id: 'sensor-005',
            timestamp: new Date(),
            deviceType: 'groundtruth',
            deviceId: 'gt-marco-001',
            distanceKm: 21.1,
            stepsCount: 26500
        },
        workoutType: 'Media Maratón',
        workoutDuration: 102,
        endorsements: [],
        endorsementCount: 212,
        comments: [],
        commentCount: 35,
        visibility: 'public',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        isEdited: false
    },
    // ── CLUB: Sofía Torres ──
    {
        id: 'post-006',
        authorId: 'user-011',
        authorName: 'Sofía Torres',
        authorAvatar: 'https://randomuser.me/api/portraits/women/65.jpg',
        authorLeague: 'diamond',
        type: 'bio-highlight',
        content: '🧬 Sesión de recuperación activa con el equipo. Neural Skin detectó que mi fatiga muscular bajó un 32% después del protocolo de movilidad. ¡El club funciona! 🏋️‍♀️',
        mediaUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
        mediaType: 'image',
        hasSensorProof: true,
        sensorProof: {
            id: 'sensor-006',
            timestamp: new Date(),
            deviceType: 'neural-skin',
            deviceId: 'ns-sofia-001',
            fatigueLevel: 28,
            muscleActivation: { 'cuadriceps': 45, 'isquiotibiales': 40, 'gluteo': 55 }
        },
        workoutType: 'Recuperación Activa',
        workoutDuration: 35,
        endorsements: [
            { id: 'e6', userId: 'user-001', userName: 'Carlos', type: 'respect', createdAt: new Date() }
        ],
        endorsementCount: 28,
        comments: [],
        commentCount: 6,
        visibility: 'club',
        clubId: 'club-elite',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        isEdited: false
    },
    // ── FOLLOWED: Pablo Fernández (second post) ──
    {
        id: 'post-007',
        authorId: 'user-003',
        authorName: 'Pablo Fernández',
        authorAvatar: 'https://randomuser.me/api/portraits/men/67.jpg',
        authorLeague: 'elite',
        type: 'achievement',
        content: '🎖️ ¡Liga Elite desbloqueada! Después de 6 meses de constancia y datos verificados. Gracias a todos por el apoyo. Los sensores no mienten 💯',
        hasSensorProof: false,
        endorsements: [],
        endorsementCount: 324,
        comments: [],
        commentCount: 67,
        visibility: 'public',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        isEdited: false
    },
    // ── NOT FOLLOWED / NOT CLUB: Lucía Vega ──
    {
        id: 'post-008',
        authorId: 'user-012',
        authorName: 'Lucía Vega',
        authorAvatar: 'https://randomuser.me/api/portraits/women/22.jpg',
        authorLeague: 'bronze',
        type: 'bio-highlight',
        content: '🌟 Mi primer mes con NutriStream. AeroLung dice que mi VO2 Max subió de 32 a 36. ¡Pequeños pasos! ¿Algún consejo para mejorar más rápido?',
        hasSensorProof: true,
        sensorProof: {
            id: 'sensor-008',
            timestamp: new Date(),
            deviceType: 'aerolung',
            deviceId: 'aerolung-lucia-001',
            vo2Max: 36,
            breathingRate: 22
        },
        workoutType: 'Cardio Suave',
        workoutDuration: 30,
        endorsements: [],
        endorsementCount: 18,
        comments: [],
        commentCount: 9,
        visibility: 'public',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 16),
        isEdited: false
    },
    // ── CLUB: Diego Alonso ──
    {
        id: 'post-009',
        authorId: 'user-013',
        authorName: 'Diego Alonso',
        authorAvatar: 'https://randomuser.me/api/portraits/men/41.jpg',
        authorLeague: 'platinum',
        type: 'group-report',
        content: '🏆 Ranking semanal del Club Elite: 1º Carlos M. (2450 XP) 2º Ana G. (2280 XP) 3º Sofía T. (2150 XP). ¡Vamos equipo, a por la siguiente liga! 💪',
        hasSensorProof: false,
        endorsements: [],
        endorsementCount: 45,
        comments: [],
        commentCount: 14,
        visibility: 'club',
        clubId: 'club-elite',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        isEdited: false
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// NEXUS SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class NexusService {

    // ─────────────────────────────────────────────────────────────────────────
    // FEED OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get followed user IDs (for filtering)
     */
    static getFollowedUserIds(): string[] {
        return followedUserIds;
    }

    /**
     * Get current user's club ID
     */
    static getCurrentClubId(): string {
        return currentUserClubId;
    }

    /**
     * Get count of posts per filter (for tab badges)
     */
    static async getFeedCounts(): Promise<{ all: number; following: number; club: number }> {
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
            all: mockPosts.length,
            following: mockPosts.filter(p => followedUserIds.includes(p.authorId)).length,
            club: mockPosts.filter(p => p.clubId === currentUserClubId).length
        };
    }

    /**
     * Get feed posts with pagination
     */
    static async getFeed(options: FeedOptions): Promise<FeedResponse> {
        await new Promise(resolve => setTimeout(resolve, 500));

        let posts = [...mockPosts];

        // Apply filter
        if (options.filter === 'following') {
            posts = posts.filter(p => followedUserIds.includes(p.authorId));
        } else if (options.filter === 'club') {
            const clubId = options.clubId || currentUserClubId;
            posts = posts.filter(p => p.clubId === clubId);
        }

        // Sort by date (newest first)
        posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Pagination
        const startIndex = options.cursor ? parseInt(options.cursor) : 0;
        const paginatedPosts = posts.slice(startIndex, startIndex + options.limit);

        const hasMore = startIndex + options.limit < posts.length;
        const nextCursor = hasMore ? String(startIndex + options.limit) : undefined;

        return {
            posts: paginatedPosts,
            nextCursor,
            hasMore
        };
    }

    /**
     * Get a single post by ID
     */
    static async getPostById(postId: string): Promise<Post | null> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return mockPosts.find(p => p.id === postId) || null;
    }

    /**
     * Get posts by user
     */
    static async getPostsByUser(userId: string, limit: number = 10): Promise<Post[]> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockPosts
            .filter(p => p.authorId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, limit);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST CREATION
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Validate sensor proof (Proof of Effort)
     */
    static validateSensorProof(proof: SensorDataSnapshot): { valid: boolean; reason?: string } {
        if (!proof.deviceType) {
            return { valid: false, reason: 'Tipo de dispositivo no especificado' };
        }

        if (!proof.deviceId) {
            return { valid: false, reason: 'ID de dispositivo no válido' };
        }

        // Check timestamp is recent (within last 24 hours)
        const hoursSinceProof = (Date.now() - proof.timestamp.getTime()) / (1000 * 60 * 60);
        if (hoursSinceProof > 24) {
            return { valid: false, reason: 'Los datos del sensor son demasiado antiguos (máx 24h)' };
        }

        // Validate based on device type
        switch (proof.deviceType) {
            case 'neural-skin':
                if (!proof.muscleActivation && proof.fatigueLevel === undefined) {
                    return { valid: false, reason: 'Datos de activación muscular requeridos' };
                }
                break;
            case 'aerolung':
                if (!proof.vo2Max && !proof.breathingRate) {
                    return { valid: false, reason: 'Datos respiratorios requeridos' };
                }
                break;
            case 'groundtruth':
                if (!proof.stepsCount && !proof.distanceKm) {
                    return { valid: false, reason: 'Datos de movimiento requeridos' };
                }
                break;
            case 'racket':
                if (!proof.swingSpeed && !proof.impactForce) {
                    return { valid: false, reason: 'Datos de swing requeridos' };
                }
                break;
        }

        return { valid: true };
    }

    /**
     * Create a new post
     */
    static async createPost(
        authorId: string,
        authorName: string,
        authorAvatar: string,
        authorLeague: LeagueTier,
        request: CreatePostRequest
    ): Promise<Post> {
        await new Promise(resolve => setTimeout(resolve, 500));

        // Validate sensor proof for bio-highlights
        if (request.type === 'bio-highlight') {
            if (!request.sensorProof) {
                throw new Error('Los Bio-Highlights requieren prueba de sensor (Proof of Effort)');
            }

            const validation = this.validateSensorProof(request.sensorProof);
            if (!validation.valid) {
                throw new Error(validation.reason);
            }
        }

        const newPost: Post = {
            id: `post-${Date.now()}`,
            authorId,
            authorName,
            authorAvatar,
            authorLeague,
            type: request.type,
            content: request.content,
            mediaUrl: request.mediaUrl,
            mediaType: request.mediaType,
            sensorProof: request.sensorProof,
            hasSensorProof: !!request.sensorProof,
            workoutType: request.workoutType,
            workoutDuration: request.workoutDuration,
            endorsements: [],
            endorsementCount: 0,
            comments: [],
            commentCount: 0,
            visibility: request.visibility,
            clubId: request.clubId,
            createdAt: new Date(),
            isEdited: false
        };

        mockPosts.unshift(newPost);
        return newPost;
    }

    /**
     * Delete a post
     */
    static async deletePost(postId: string, userId: string): Promise<void> {
        const index = mockPosts.findIndex(p => p.id === postId);
        if (index === -1) throw new Error('Post no encontrado');
        if (mockPosts[index].authorId !== userId) throw new Error('No autorizado');

        mockPosts.splice(index, 1);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ENDORSEMENTS (Reactions)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Add endorsement to a post
     */
    static async addEndorsement(
        postId: string,
        userId: string,
        userName: string,
        type: Endorsement['type']
    ): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 200));

        const post = mockPosts.find(p => p.id === postId);
        if (!post) throw new Error('Post no encontrado');

        // Remove existing endorsement from this user
        post.endorsements = post.endorsements.filter(e => e.userId !== userId);

        // Add new endorsement
        post.endorsements.push({
            id: `endorsement-${Date.now()}`,
            userId,
            userName,
            type,
            createdAt: new Date()
        });

        post.endorsementCount = post.endorsements.length;
    }

    /**
     * Remove endorsement from a post
     */
    static async removeEndorsement(postId: string, userId: string): Promise<void> {
        const post = mockPosts.find(p => p.id === postId);
        if (!post) throw new Error('Post no encontrado');

        post.endorsements = post.endorsements.filter(e => e.userId !== userId);
        post.endorsementCount = post.endorsements.length;
    }

    /**
     * Get user's endorsement on a post
     */
    static getUserEndorsement(post: Post, userId: string): Endorsement | undefined {
        return post.endorsements.find(e => e.userId === userId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // COMMENTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Add comment to a post
     */
    static async addComment(
        postId: string,
        authorId: string,
        authorName: string,
        authorAvatar: string | undefined,
        content: string
    ): Promise<Comment> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const post = mockPosts.find(p => p.id === postId);
        if (!post) throw new Error('Post no encontrado');

        const newComment: Comment = {
            id: `comment-${Date.now()}`,
            authorId,
            authorName,
            authorAvatar,
            content,
            createdAt: new Date(),
            likes: 0
        };

        post.comments.push(newComment);
        post.commentCount++;

        return newComment;
    }

    /**
     * Get comments for a post
     */
    static async getComments(postId: string, limit: number = 20): Promise<Comment[]> {
        await new Promise(resolve => setTimeout(resolve, 200));

        const post = mockPosts.find(p => p.id === postId);
        if (!post) return [];

        return post.comments.slice(0, limit);
    }

    /**
     * Like a comment
     */
    static async likeComment(postId: string, commentId: string): Promise<void> {
        const post = mockPosts.find(p => p.id === postId);
        if (!post) return;

        const comment = post.comments.find(c => c.id === commentId);
        if (comment) {
            comment.likes++;
            comment.likedByUser = true;
        }
    }
}

export default NexusService;
