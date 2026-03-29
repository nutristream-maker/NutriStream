import { useMemo } from 'react';

/**
 * Time-based context system for displaying relevant widgets based on time of day.
 * Returns which widgets should be prioritized based on the user's likely activity.
 */

export type TimeContext = 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';

export interface WidgetPriority {
    id: string;
    priority: number; // 1 = highest priority
    reason: string;
}

export interface SuggestionAction {
    label: string;
    path: string;
}

export interface TimeContextConfig {
    context: TimeContext;
    hour: number;
    greeting: string;
    focusMessage: string;
    prioritizedWidgets: WidgetPriority[];
    suggestedActions: SuggestionAction[];
}

/**
 * Determines the current time context based on the hour of the day.
 */
export const getTimeContext = (hour: number): TimeContext => {
    if (hour >= 5 && hour < 10) return 'morning';
    if (hour >= 10 && hour < 13) return 'midday';
    if (hour >= 13 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
};

/**
 * Returns the full configuration for the current time context.
 */
export const getTimeContextConfig = (hour: number): TimeContextConfig => {
    const context = getTimeContext(hour);

    const configs: Record<TimeContext, Omit<TimeContextConfig, 'context' | 'hour'>> = {
        morning: {
            greeting: '¡Buenos días!',
            focusMessage: 'Comienza tu día con energía. Revisa tu índice de preparación.',
            prioritizedWidgets: [
                { id: 'readiness', priority: 1, reason: 'Evalúa tu nivel de preparación para el día' },
                { id: 'sleep', priority: 2, reason: 'Revisa la calidad de tu sueño' },
                { id: 'nutrition', priority: 3, reason: 'Planifica un desayuno nutritivo' },
                { id: 'hydration', priority: 4, reason: 'Comienza a hidratarte' },
                { id: 'dailyFocus', priority: 5, reason: 'Establece tu enfoque del día' },
            ],
            suggestedActions: [
                { label: 'Revisar calidad de sueño', path: '/rendimiento' }, // Sleep analysis is often in performance or dashboard
                { label: 'Registrar peso matutino', path: '/' }, // Tries to trigger quick log widget
                { label: 'Planificar comidas del día', path: '/chef-ai' },
            ],
        },
        midday: {
            greeting: '¡Buen día!',
            focusMessage: 'Mantén tu energía y productividad.',
            prioritizedWidgets: [
                { id: 'hydration', priority: 1, reason: 'Mantente hidratado' },
                { id: 'nutrition', priority: 2, reason: 'Hora de almorzar saludable' },
                { id: 'activity', priority: 3, reason: 'Revisa tu actividad de la mañana' },
                { id: 'quickLog', priority: 4, reason: 'Registra tu comida' },
            ],
            suggestedActions: [
                { label: 'Registrar almuerzo', path: '/chef-ai' },
                { label: 'Beber agua', path: '/' }, // Focus on hydration widget
                { label: 'Estiramiento rápido', path: '/training-center' },
            ],
        },
        afternoon: {
            greeting: '¡Buenas tardes!',
            focusMessage: 'Momento ideal para entrenar.',
            prioritizedWidgets: [
                { id: 'training', priority: 1, reason: 'Mejor momento para entrenar' },
                { id: 'liveSession', priority: 2, reason: 'Inicia una sesión de entrenamiento' },
                { id: 'gamification', priority: 3, reason: 'Revisa tu progreso' },
                { id: 'readiness', priority: 4, reason: 'Comprueba tu nivel de energía' },
            ],
            suggestedActions: [
                { label: 'Iniciar entrenamiento', path: '/training-center' },
                { label: 'Sesión en vivo', path: '/live-session' },
                { label: 'Revisar plan de entrenamiento', path: '/training-center' },
            ],
        },
        evening: {
            greeting: '¡Buenas noches!',
            focusMessage: 'Tiempo de recuperación y planificación.',
            prioritizedWidgets: [
                { id: 'recovery', priority: 1, reason: 'Revisa tu recuperación muscular' },
                { id: 'nutrition', priority: 2, reason: 'Planifica una cena ligera' },
                { id: 'gamification', priority: 3, reason: 'Revisa logros del día' },
                { id: 'sleep', priority: 4, reason: 'Prepárate para descansar' },
            ],
            suggestedActions: [
                { label: 'Registrar cena', path: '/chef-ai' }, // Directs to Nutrition/Chef AI
                { label: 'Revisar progreso del día', path: '/rendimiento' },
                { label: 'Planificar mañana', path: '/training-center' },
            ],
        },
        night: {
            greeting: '¡Descansa bien!',
            focusMessage: 'Prioriza tu sueño para una mejor recuperación.',
            prioritizedWidgets: [
                { id: 'sleep', priority: 1, reason: 'Tu sueño es crucial para la recuperación' },
                { id: 'recovery', priority: 2, reason: 'Tu cuerpo se repara mientras duermes' },
                { id: 'readiness', priority: 3, reason: 'Prepárate para mañana' },
            ],
            suggestedActions: [
                { label: 'Activar modo No Molestar', path: '/perfil?tab=notificaciones' },
                { label: 'Preparar rutina de sueño', path: '/cuerpo' },
            ],
        },
    };

    return {
        context,
        hour,
        ...configs[context],
    };
};

/**
 * Custom hook that provides the current time context configuration.
 * Updates when the hour changes.
 */
export const useTimeContext = (): TimeContextConfig => {
    return useMemo(() => {
        const now = new Date();
        return getTimeContextConfig(now.getHours());
    }, []);
};

/**
 * Returns the widget IDs in priority order for the current time.
 */
export const getPrioritizedWidgetIds = (hour: number): string[] => {
    const config = getTimeContextConfig(hour);
    return config.prioritizedWidgets
        .sort((a, b) => a.priority - b.priority)
        .map(w => w.id);
};
