import { LeagueTier } from '../types/SocialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    createdAt: Date;
    isRead: boolean;
    isDelivered: boolean;
    reactions?: { [userId: string]: string }; // e.g., { 'u-2': '❤️' }
}

export interface Conversation {
    id: string;
    participantIds: string[];
    participants: ConversationParticipant[];
    lastMessage?: Message;
    unreadCount: number;
    isBlocked: boolean;
    isMuted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ConversationParticipant {
    userId: string;
    userName: string;
    userAvatar: string;
    userLeague: LeagueTier;
    isOnline: boolean;
    lastSeen?: Date;
}

export interface SendMessageRequest {
    conversationId: string;
    content: string;
    mediaFile?: File;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const mockParticipants: ConversationParticipant[] = [
    { userId: 'u-2', userName: 'Carlos García', userAvatar: 'https://randomuser.me/api/portraits/men/2.jpg', userLeague: 'diamond', isOnline: true },
    { userId: 'u-3', userName: 'Elena Pérez', userAvatar: 'https://randomuser.me/api/portraits/women/3.jpg', userLeague: 'platinum', isOnline: false, lastSeen: new Date(Date.now() - 3600000) },
    { userId: 'u-4', userName: 'Miguel López', userAvatar: 'https://randomuser.me/api/portraits/men/4.jpg', userLeague: 'gold', isOnline: true },
    { userId: 'u-5', userName: 'Laura Martín', userAvatar: 'https://randomuser.me/api/portraits/women/5.jpg', userLeague: 'diamond', isOnline: false, lastSeen: new Date(Date.now() - 86400000) }
];

const mockConversations: Conversation[] = [
    {
        id: 'conv-1',
        participantIds: ['u-1', 'u-2'],
        participants: [mockParticipants[0]],
        lastMessage: {
            id: 'm-1',
            conversationId: 'conv-1',
            senderId: 'u-2',
            content: '¡Brutal sesión hoy! ¿Entrenamos juntos mañana?',
            createdAt: new Date(Date.now() - 60000 * 5),
            isRead: false,
            isDelivered: true
        },
        unreadCount: 1,
        isBlocked: false,
        isMuted: false,
        createdAt: new Date(Date.now() - 86400000 * 7),
        updatedAt: new Date(Date.now() - 60000 * 5)
    },
    {
        id: 'conv-2',
        participantIds: ['u-1', 'u-3'],
        participants: [mockParticipants[1]],
        lastMessage: {
            id: 'm-2',
            conversationId: 'conv-2',
            senderId: 'u-1',
            content: 'Genial, nos vemos a las 18:00 en el gimnasio 💪',
            createdAt: new Date(Date.now() - 60000 * 30),
            isRead: true,
            isDelivered: true
        },
        unreadCount: 0,
        isBlocked: false,
        isMuted: false,
        createdAt: new Date(Date.now() - 86400000 * 14),
        updatedAt: new Date(Date.now() - 60000 * 30)
    },
    {
        id: 'conv-3',
        participantIds: ['u-1', 'u-4'],
        participants: [mockParticipants[2]],
        lastMessage: {
            id: 'm-3',
            conversationId: 'conv-3',
            senderId: 'u-4',
            content: '¿Qué ejercicio usas para mejorar el VO2 Max?',
            createdAt: new Date(Date.now() - 3600000 * 2),
            isRead: true,
            isDelivered: true
        },
        unreadCount: 0,
        isBlocked: false,
        isMuted: true,
        createdAt: new Date(Date.now() - 86400000 * 3),
        updatedAt: new Date(Date.now() - 3600000 * 2)
    }
];

const mockMessages: { [conversationId: string]: Message[] } = {
    'conv-1': [
        { id: 'm-1-1', conversationId: 'conv-1', senderId: 'u-2', content: '¡Hey! ¿Cómo te fue hoy?', createdAt: new Date(Date.now() - 60000 * 60), isRead: true, isDelivered: true },
        { id: 'm-1-2', conversationId: 'conv-1', senderId: 'u-1', content: 'Bastante bien, hice 45 minutos de HIIT', createdAt: new Date(Date.now() - 60000 * 55), isRead: true, isDelivered: true },
        { id: 'm-1-3', conversationId: 'conv-1', senderId: 'u-2', content: '¡Genial! Yo hice pesas hoy, quedé muerto 😅', createdAt: new Date(Date.now() - 60000 * 50), isRead: true, isDelivered: true },
        { id: 'm-1-4', conversationId: 'conv-1', senderId: 'u-1', content: 'Jaja te entiendo, mañana descanso activo', createdAt: new Date(Date.now() - 60000 * 45), isRead: true, isDelivered: true },
        { id: 'm-1-5', conversationId: 'conv-1', senderId: 'u-2', content: '¡Brutal sesión hoy! ¿Entrenamos juntos mañana?', createdAt: new Date(Date.now() - 60000 * 5), isRead: false, isDelivered: true }
    ],
    'conv-2': [
        { id: 'm-2-1', conversationId: 'conv-2', senderId: 'u-3', content: '¿Tienes plan para esta tarde?', createdAt: new Date(Date.now() - 60000 * 60), isRead: true, isDelivered: true },
        { id: 'm-2-2', conversationId: 'conv-2', senderId: 'u-1', content: 'Sí, pensaba ir al gym a las 18:00', createdAt: new Date(Date.now() - 60000 * 45), isRead: true, isDelivered: true },
        { id: 'm-2-3', conversationId: 'conv-2', senderId: 'u-3', content: '¡Perfecto! Me apunto entonces', createdAt: new Date(Date.now() - 60000 * 35), isRead: true, isDelivered: true },
        { id: 'm-2-4', conversationId: 'conv-2', senderId: 'u-1', content: 'Genial, nos vemos a las 18:00 en el gimnasio 💪', createdAt: new Date(Date.now() - 60000 * 30), isRead: true, isDelivered: true }
    ],
    'conv-3': [
        { id: 'm-3-1', conversationId: 'conv-3', senderId: 'u-4', content: '¡Hola! Vi tu post de CardioKing', createdAt: new Date(Date.now() - 3600000 * 3), isRead: true, isDelivered: true },
        { id: 'm-3-2', conversationId: 'conv-3', senderId: 'u-1', content: '¡Hola! Sí, fue una sesión intensa', createdAt: new Date(Date.now() - 3600000 * 2.5), isRead: true, isDelivered: true },
        { id: 'm-3-3', conversationId: 'conv-3', senderId: 'u-4', content: '¿Qué ejercicio usas para mejorar el VO2 Max?', createdAt: new Date(Date.now() - 3600000 * 2), isRead: true, isDelivered: true }
    ]
};

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGING SERVICE
// ═══════════════════════════════════════════════════════════════════════════

type MessageCallback = (message: Message) => void;
type TypingCallback = (conversationId: string, userId: string, isTyping: boolean) => void;

class MessagingServiceClass {
    private messageListeners: Map<string, MessageCallback[]> = new Map();
    private typingListeners: TypingCallback[] = [];

    /**
     * Get all conversations for user
     */
    async getConversations(userId: string): Promise<Conversation[]> {
        await new Promise(r => setTimeout(r, 200));
        return mockConversations.filter(c => c.participantIds.includes(userId))
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }

    /**
     * Get messages for conversation
     */
    async getMessages(conversationId: string, limit = 50): Promise<Message[]> {
        await new Promise(r => setTimeout(r, 150));
        return mockMessages[conversationId]?.slice(-limit) || [];
    }

    /**
     * Send a message
     */
    async sendMessage(senderId: string, request: SendMessageRequest): Promise<Message> {
        await new Promise(r => setTimeout(r, 200));

        const newMessage: Message = {
            id: `m-${Date.now()}`,
            conversationId: request.conversationId,
            senderId,
            content: request.content,
            mediaUrl: request.mediaFile ? URL.createObjectURL(request.mediaFile) : undefined,
            mediaType: request.mediaFile?.type.startsWith('video') ? 'video' : 'image',
            createdAt: new Date(),
            isRead: false,
            isDelivered: true
        };

        // Add to mock storage
        if (!mockMessages[request.conversationId]) {
            mockMessages[request.conversationId] = [];
        }
        mockMessages[request.conversationId].push(newMessage);

        // Update conversation
        const conversation = mockConversations.find(c => c.id === request.conversationId);
        if (conversation) {
            conversation.lastMessage = newMessage;
            conversation.updatedAt = new Date();
        }

        // Notify listeners
        const listeners = this.messageListeners.get(request.conversationId) || [];
        listeners.forEach(cb => cb(newMessage));

        // Simulate reply after 3-5 seconds
        this.simulateReply(request.conversationId);

        return newMessage;
    }

    /**
     * Start new conversation
     */
    async startConversation(userId: string, targetUserId: string): Promise<Conversation> {
        await new Promise(r => setTimeout(r, 200));

        // Check if conversation already exists
        const existing = mockConversations.find(c =>
            c.participantIds.includes(userId) && c.participantIds.includes(targetUserId)
        );
        if (existing) return existing;

        // Create new conversation
        const targetUser = mockParticipants.find(p => p.userId === targetUserId);
        const newConversation: Conversation = {
            id: `conv-${Date.now()}`,
            participantIds: [userId, targetUserId],
            participants: targetUser ? [targetUser] : [],
            unreadCount: 0,
            isBlocked: false,
            isMuted: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        mockConversations.unshift(newConversation);
        return newConversation;
    }

    /**
     * Mark messages as read
     */
    async markAsRead(conversationId: string): Promise<void> {
        await new Promise(r => setTimeout(r, 100));

        const messages = mockMessages[conversationId];
        if (messages) {
            messages.forEach(m => m.isRead = true);
        }

        const conversation = mockConversations.find(c => c.id === conversationId);
        if (conversation) {
            conversation.unreadCount = 0;
        }
    }

    /**
     * Mute/unmute conversation
     */
    async toggleMute(conversationId: string): Promise<boolean> {
        await new Promise(r => setTimeout(r, 100));

        const conversation = mockConversations.find(c => c.id === conversationId);
        if (conversation) {
            conversation.isMuted = !conversation.isMuted;
            return conversation.isMuted;
        }
        return false;
    }

    /**
     * Block/unblock user
     */
    async toggleBlock(conversationId: string): Promise<boolean> {
        await new Promise(r => setTimeout(r, 100));

        const conversation = mockConversations.find(c => c.id === conversationId);
        if (conversation) {
            conversation.isBlocked = !conversation.isBlocked;
            return conversation.isBlocked;
        }
        return false;
    }

    /**
     * Toggle reaction on a message
     */
    async toggleReaction(conversationId: string, messageId: string, userId: string, reaction: string): Promise<void> {
        // Find message
        const msgs = mockMessages[conversationId];
        if (!msgs) return;

        const msg = msgs.find(m => m.id === messageId);
        if (!msg) return;

        if (!msg.reactions) msg.reactions = {};

        // Toggle logic
        if (msg.reactions[userId] === reaction) {
            delete msg.reactions[userId];
        } else {
            msg.reactions[userId] = reaction;
        }

        // Notify listeners (simplified update)
        const listeners = this.messageListeners.get(conversationId) || [];
        // We might want a specific 'messageUpdated' event, but for now re-sending the message works if UI handles it
        // Or we just rely on local state update + silence
    }

    /**
     * Delete conversation
     */
    async deleteConversation(conversationId: string): Promise<void> {
        await new Promise(r => setTimeout(r, 150));

        const index = mockConversations.findIndex(c => c.id === conversationId);
        if (index !== -1) {
            mockConversations.splice(index, 1);
        }
        delete mockMessages[conversationId];
    }

    /**
     * Subscribe to new messages in conversation
     */
    subscribeToMessages(conversationId: string, callback: MessageCallback): () => void {
        if (!this.messageListeners.has(conversationId)) {
            this.messageListeners.set(conversationId, []);
        }
        this.messageListeners.get(conversationId)!.push(callback);

        return () => {
            const listeners = this.messageListeners.get(conversationId);
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index !== -1) listeners.splice(index, 1);
            }
        };
    }

    /**
     * Subscribe to typing indicators
     */
    subscribeToTyping(callback: TypingCallback): () => void {
        this.typingListeners.push(callback);

        return () => {
            const index = this.typingListeners.indexOf(callback);
            if (index !== -1) this.typingListeners.splice(index, 1);
        };
    }

    /**
     * Send typing indicator
     */
    async sendTypingIndicator(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
        this.typingListeners.forEach(cb => cb(conversationId, userId, isTyping));
    }

    /**
     * Simulate reply from other user
     */
    private simulateReply(conversationId: string) {
        const conversation = mockConversations.find(c => c.id === conversationId);
        if (!conversation) return;

        const otherParticipant = conversation.participants[0];
        if (!otherParticipant) return;

        // Simulate typing
        setTimeout(() => {
            this.typingListeners.forEach(cb => cb(conversationId, otherParticipant.userId, true));
        }, 1000);

        // Simulate reply
        setTimeout(() => {
            this.typingListeners.forEach(cb => cb(conversationId, otherParticipant.userId, false));

            const replies = [
                '¡Genial! 💪', '¡Suena bien!', '¡Perfecto!', '👍', 'Vale, hablamos luego',
                '¿A qué hora?', 'Me parece genial', '¡Nos vemos!'
            ];

            const reply: Message = {
                id: `m-${Date.now()}`,
                conversationId,
                senderId: otherParticipant.userId,
                content: replies[Math.floor(Math.random() * replies.length)],
                createdAt: new Date(),
                isRead: false,
                isDelivered: true
            };

            mockMessages[conversationId]?.push(reply);
            conversation.lastMessage = reply;
            conversation.updatedAt = new Date();
            conversation.unreadCount += 1;

            const listeners = this.messageListeners.get(conversationId) || [];
            listeners.forEach(cb => cb(reply));
        }, 3000 + Math.random() * 2000);
    }

    /**
     * Get total unread count
     */
    async getTotalUnreadCount(userId: string): Promise<number> {
        await new Promise(r => setTimeout(r, 50));
        return mockConversations
            .filter(c => c.participantIds.includes(userId))
            .reduce((acc, c) => acc + c.unreadCount, 0);
    }
    /**
     * Create or get existing conversation
     */
    async createConversation(currentUserId: string, targetUserId: string): Promise<Conversation> {
        // Check if conversation already exists
        const existing = mockConversations.find(c =>
            c.participantIds.includes(currentUserId) && c.participantIds.includes(targetUserId)
        );

        if (existing) return existing;

        // Create new mock conversation
        const targetUser = mockParticipants.find(p => p.userId === targetUserId) || {
            userId: targetUserId,
            userName: 'Usuario Nuevo',
            userAvatar: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 99)}.jpg`,
            userLeague: 'bronze',
            isOnline: true
        };

        const newConv: Conversation = {
            id: `conv-${Date.now()}`,
            participantIds: [currentUserId, targetUserId],
            participants: [targetUser], // In a real app this would differentiate between 'me' and 'them'
            unreadCount: 0,
            isBlocked: false,
            isMuted: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        mockConversations.unshift(newConv);
        mockMessages[newConv.id] = []; // Initialize messages array
        return newConv;
    }


}

export const MessagingService = new MessagingServiceClass();
export default MessagingService;
