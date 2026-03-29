/**
 * NotificationService - Push Notifications and In-App Alerts
 * 
 * Manages browser notifications, in-app toast alerts, and notification preferences.
 */

// Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'challenge' | 'reminder';

export interface NotificationPayload {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    icon?: string;
    action?: {
        label: string;
        url: string;
    };
    createdAt: Date;
    read: boolean;
    persistent?: boolean; // If true, stays until dismissed
}

export interface NotificationPreferences {
    pushEnabled: boolean;
    emailEnabled: boolean;
    categories: {
        workoutReminders: boolean;
        achievements: boolean;
        challenges: boolean;
        injuryAlerts: boolean;
        socialUpdates: boolean;
        marketplaceDeals: boolean;
    };
    quietHours: {
        enabled: boolean;
        start: string; // "22:00"
        end: string;   // "08:00"
    };
}

// Default preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
    pushEnabled: true,
    emailEnabled: true,
    categories: {
        workoutReminders: true,
        achievements: true,
        challenges: true,
        injuryAlerts: true,
        socialUpdates: true,
        marketplaceDeals: false,
    },
    quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
    },
};

// Notification storage key
const NOTIFICATIONS_KEY = 'nutristream_notifications';
const PREFERENCES_KEY = 'nutristream_notification_prefs';

/**
 * Check if browser supports notifications.
 */
export const isNotificationSupported = (): boolean => {
    return 'Notification' in window;
};

/**
 * Request notification permission.
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!isNotificationSupported()) {
        console.warn('Notifications not supported');
        return 'denied';
    }

    return await Notification.requestPermission();
};

/**
 * Get current notification permission status.
 */
export const getNotificationPermission = (): NotificationPermission => {
    if (!isNotificationSupported()) return 'denied';
    return Notification.permission;
};

/**
 * Send a browser push notification.
 */
export const sendPushNotification = (
    title: string,
    options?: NotificationOptions
): Notification | null => {
    if (!isNotificationSupported()) return null;
    if (Notification.permission !== 'granted') return null;

    // Check quiet hours
    const prefs = getPreferences();
    if (isQuietHours(prefs)) return null;

    try {
        const notification = new Notification(title, {
            icon: '/logo.png',
            badge: '/logo.png',
            ...options,
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        return notification;
    } catch (error) {
        console.error('Error sending notification:', error);
        return null;
    }
};

/**
 * Check if currently in quiet hours.
 */
export const isQuietHours = (prefs: NotificationPreferences): boolean => {
    if (!prefs.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const { start, end } = prefs.quietHours;

    if (start <= end) {
        return currentTime >= start && currentTime < end;
    } else {
        // Wraps around midnight
        return currentTime >= start || currentTime < end;
    }
};

/**
 * Get stored notifications.
 */
export const getNotifications = (): NotificationPayload[] => {
    try {
        const stored = localStorage.getItem(NOTIFICATIONS_KEY);
        if (!stored) return [];
        return JSON.parse(stored).map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
        }));
    } catch {
        return [];
    }
};

/**
 * Add a new in-app notification.
 */
export const addNotification = (
    payload: Omit<NotificationPayload, 'id' | 'createdAt' | 'read'>
): NotificationPayload => {
    const notification: NotificationPayload = {
        ...payload,
        id: `notif_${Date.now()}`,
        createdAt: new Date(),
        read: false,
    };

    const existing = getNotifications();
    const updated = [notification, ...existing].slice(0, 50); // Keep max 50
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));

    // Also send push if enabled
    const prefs = getPreferences();
    if (prefs.pushEnabled && shouldNotify(payload.type, prefs)) {
        sendPushNotification(payload.title, { body: payload.message });
    }

    return notification;
};

/**
 * Mark notification as read.
 */
export const markAsRead = (notificationId: string): void => {
    const notifications = getNotifications();
    const updated = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
};

/**
 * Mark all notifications as read.
 */
export const markAllAsRead = (): void => {
    const notifications = getNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
};

/**
 * Delete a notification.
 */
export const deleteNotification = (notificationId: string): void => {
    const notifications = getNotifications();
    const updated = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
};

/**
 * Clear all notifications.
 */
export const clearAllNotifications = (): void => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
};

/**
 * Get unread count.
 */
export const getUnreadCount = (): number => {
    return getNotifications().filter(n => !n.read).length;
};

/**
 * Get notification preferences.
 */
export const getPreferences = (): NotificationPreferences => {
    try {
        const stored = localStorage.getItem(PREFERENCES_KEY);
        if (!stored) return DEFAULT_PREFERENCES;
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    } catch {
        return DEFAULT_PREFERENCES;
    }
};

/**
 * Update notification preferences.
 */
export const updatePreferences = (
    updates: Partial<NotificationPreferences>
): NotificationPreferences => {
    const current = getPreferences();
    const updated = {
        ...current,
        ...updates,
        categories: { ...current.categories, ...updates.categories },
        quietHours: { ...current.quietHours, ...updates.quietHours },
    };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
    return updated;
};

/**
 * Check if a notification type should be sent based on preferences.
 */
const shouldNotify = (type: NotificationType, prefs: NotificationPreferences): boolean => {
    switch (type) {
        case 'achievement':
            return prefs.categories.achievements;
        case 'challenge':
            return prefs.categories.challenges;
        case 'reminder':
            return prefs.categories.workoutReminders;
        case 'warning':
            return prefs.categories.injuryAlerts;
        default:
            return true;
    }
};

// Pre-built notification helpers

export const notifyAchievement = (title: string, description: string) => {
    return addNotification({
        type: 'achievement',
        title: `🏆 ${title}`,
        message: description,
    });
};

export const notifyChallengeUpdate = (challengeName: string, status: string) => {
    return addNotification({
        type: 'challenge',
        title: `⚔️ ${challengeName}`,
        message: status,
    });
};

export const notifyInjuryRisk = (muscle: string, risk: string) => {
    return addNotification({
        type: 'warning',
        title: '🛡️ Injury Shield',
        message: `Riesgo ${risk} detectado en ${muscle}. Revisa las recomendaciones.`,
        persistent: true,
    });
};

export const notifyWorkoutReminder = () => {
    return addNotification({
        type: 'reminder',
        title: '💪 Hora de entrenar',
        message: 'Tu cuerpo está listo para una sesión. ¡Vamos!',
        action: {
            label: 'Iniciar sesión',
            url: '/live-session',
        },
    });
};

export const notifyReadinessScore = (score: number) => {
    const emoji = score >= 80 ? '🟢' : score >= 50 ? '🟡' : '🔴';
    return addNotification({
        type: 'info',
        title: `${emoji} Tu índice de preparación: ${score}%`,
        message: score >= 80
            ? '¡Estás en forma óptima para entrenar!'
            : score >= 50
                ? 'Puedes entrenar con moderación'
                : 'Tu cuerpo necesita más descanso',
    });
};
