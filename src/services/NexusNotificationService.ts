import { LeagueTier } from '../types/SocialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type NexusNotificationType =
    | 'endorsement'
    | 'comment'
    | 'reply'
    | 'mention'
    | 'follow'
    | 'badge'
    | 'challenge'
    | 'message'
    | 'live';

export interface NexusNotification {
    id: string;
    type: NexusNotificationType;
    fromUserId: string;
    fromUserName: string;
    fromUserAvatar: string;
    fromUserLeague: LeagueTier;
    toUserId: string;
    content: string;
    postId?: string;
    commentId?: string;
    challengeId?: string;
    badgeId?: string;
    createdAt: Date;
    isRead: boolean;
}

export interface NotificationPreferences {
    endorsements: boolean;
    comments: boolean;
    mentions: boolean;
    follows: boolean;
    challenges: boolean;
    messages: boolean;
    liveUpdates: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const mockNotifications: NexusNotification[] = [
    {
        id: 'n-1',
        type: 'endorsement',
        fromUserId: 'u-2',
        fromUserName: 'Carlos García',
        fromUserAvatar: 'https://randomuser.me/api/portraits/men/2.jpg',
        fromUserLeague: 'diamond',
        toUserId: 'u-1',
        content: 'le dio 🔥 a tu publicación',
        postId: 'p-1',
        createdAt: new Date(Date.now() - 60000 * 5),
        isRead: false
    },
    {
        id: 'n-2',
        type: 'comment',
        fromUserId: 'u-3',
        fromUserName: 'Elena Pérez',
        fromUserAvatar: 'https://randomuser.me/api/portraits/women/3.jpg',
        fromUserLeague: 'platinum',
        toUserId: 'u-1',
        content: 'comentó: "¡Brutal sesión! 💪"',
        postId: 'p-1',
        commentId: 'c-1',
        createdAt: new Date(Date.now() - 60000 * 15),
        isRead: false
    },
    {
        id: 'n-3',
        type: 'follow',
        fromUserId: 'u-4',
        fromUserName: 'Miguel López',
        fromUserAvatar: 'https://randomuser.me/api/portraits/men/4.jpg',
        fromUserLeague: 'gold',
        toUserId: 'u-1',
        content: 'empezó a seguirte',
        createdAt: new Date(Date.now() - 60000 * 30),
        isRead: false
    },
    {
        id: 'n-4',
        type: 'badge',
        fromUserId: 'system',
        fromUserName: 'NutriStream',
        fromUserAvatar: '/logo.png',
        fromUserLeague: 'elite',
        toUserId: 'u-1',
        content: '¡Desbloqueaste el badge "Iron Week"! 🏆',
        badgeId: 'b-ironweek',
        createdAt: new Date(Date.now() - 60000 * 60),
        isRead: true
    },
    {
        id: 'n-5',
        type: 'challenge',
        fromUserId: 'system',
        fromUserName: 'NutriStream',
        fromUserAvatar: '/logo.png',
        fromUserLeague: 'elite',
        toUserId: 'u-1',
        content: '¡El reto "Neural Battery 100%" comienza mañana! 🚀',
        challengeId: 'ch-neural100',
        createdAt: new Date(Date.now() - 60000 * 120),
        isRead: true
    },
    {
        id: 'n-6',
        type: 'mention',
        fromUserId: 'u-5',
        fromUserName: 'Laura Martín',
        fromUserAvatar: 'https://randomuser.me/api/portraits/women/5.jpg',
        fromUserLeague: 'diamond',
        toUserId: 'u-1',
        content: 'te mencionó en un comentario',
        postId: 'p-3',
        commentId: 'c-5',
        createdAt: new Date(Date.now() - 60000 * 180),
        isRead: true
    },
    {
        id: 'n-7',
        type: 'live',
        fromUserId: 'u-6',
        fromUserName: 'Pablo Fitness',
        fromUserAvatar: 'https://randomuser.me/api/portraits/men/6.jpg',
        fromUserLeague: 'platinum',
        toUserId: 'u-1',
        content: 'está entrenando ahora mismo 🔴',
        createdAt: new Date(Date.now() - 60000 * 2),
        isRead: false
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION SERVICE
// ═══════════════════════════════════════════════════════════════════════════

type NotificationCallback = (notification: NexusNotification) => void;

class NexusNotificationServiceClass {
    private listeners: NotificationCallback[] = [];
    private simulationInterval: NodeJS.Timeout | null = null;

    /**
     * Get all notifications for user
     */
    async getNotifications(userId: string, limit = 20): Promise<NexusNotification[]> {
        await new Promise(r => setTimeout(r, 200));
        return mockNotifications
            .filter(n => n.toUserId === userId)
            .slice(0, limit);
    }

    /**
     * Get unread count
     */
    async getUnreadCount(userId: string): Promise<number> {
        await new Promise(r => setTimeout(r, 100));
        return mockNotifications.filter(n => n.toUserId === userId && !n.isRead).length;
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string): Promise<void> {
        await new Promise(r => setTimeout(r, 100));
        const notification = mockNotifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
        }
    }

    /**
     * Mark all as read
     */
    async markAllAsRead(userId: string): Promise<void> {
        await new Promise(r => setTimeout(r, 150));
        mockNotifications
            .filter(n => n.toUserId === userId)
            .forEach(n => n.isRead = true);
    }

    /**
     * Subscribe to real-time notifications
     */
    subscribe(callback: NotificationCallback): () => void {
        this.listeners.push(callback);

        // Start simulation if first listener
        if (this.listeners.length === 1) {
            this.startSimulation();
        }

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
            if (this.listeners.length === 0) {
                this.stopSimulation();
            }
        };
    }

    /**
     * Simulate real-time notifications (would be WebSocket in production)
     */
    private startSimulation() {
        const randomNotifications: Partial<NexusNotification>[] = [
            { type: 'endorsement', content: 'le dio ⚡ a tu publicación' },
            { type: 'comment', content: 'comentó: "¡Gran esfuerzo!"' },
            { type: 'follow', content: 'empezó a seguirte' },
            { type: 'live', content: 'está entrenando ahora 🔴' }
        ];

        const randomUsers = [
            { id: 'u-10', name: 'Ana García', avatar: 'https://randomuser.me/api/portraits/women/10.jpg', league: 'gold' as LeagueTier },
            { id: 'u-11', name: 'Pedro Martín', avatar: 'https://randomuser.me/api/portraits/men/11.jpg', league: 'silver' as LeagueTier },
            { id: 'u-12', name: 'María López', avatar: 'https://randomuser.me/api/portraits/women/12.jpg', league: 'platinum' as LeagueTier }
        ];

        // Simulate notification every 30-60 seconds
        this.simulationInterval = setInterval(() => {
            const randomNotif = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
            const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)];

            const newNotification: NexusNotification = {
                id: `n-${Date.now()}`,
                type: randomNotif.type!,
                fromUserId: randomUser.id,
                fromUserName: randomUser.name,
                fromUserAvatar: randomUser.avatar,
                fromUserLeague: randomUser.league,
                toUserId: 'u-1',
                content: randomNotif.content!,
                createdAt: new Date(),
                isRead: false
            };

            mockNotifications.unshift(newNotification);

            this.listeners.forEach(listener => listener(newNotification));
        }, 30000 + Math.random() * 30000);
    }

    private stopSimulation() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
    }

    /**
     * Get notification preferences
     */
    async getPreferences(userId: string): Promise<NotificationPreferences> {
        await new Promise(r => setTimeout(r, 100));
        return {
            endorsements: true,
            comments: true,
            mentions: true,
            follows: true,
            challenges: true,
            messages: true,
            liveUpdates: true
        };
    }

    /**
     * Update notification preferences
     */
    async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
        await new Promise(r => setTimeout(r, 150));
        // Would save to backend
        console.log('Updated preferences:', preferences);
    }
}

export const NexusNotificationService = new NexusNotificationServiceClass();
export default NexusNotificationService;
