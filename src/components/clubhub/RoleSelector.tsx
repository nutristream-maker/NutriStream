import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiAward, FiShield, FiArrowLeft } from 'react-icons/fi';

export type UserRole = 'trainer' | 'member' | 'both';

interface RoleSelectorProps {
    clubName: string;
    onRoleSelect: (role: UserRole) => void;
    onBack: () => void;
}

const ROLES: { key: UserRole; label: string; description: string; icon: React.ComponentType<{ size: number; className?: string }>; color: string }[] = [
    {
        key: 'trainer',
        label: 'Entrenador',
        description: 'Acceso completo a gestión de sesiones, asistencia y reportes del grupo.',
        icon: FiAward,
        color: 'cyan'
    },
    {
        key: 'member',
        label: 'Deportista',
        description: 'Ver horarios, reservar clases y seguir tu progreso personal.',
        icon: FiUsers,
        color: 'emerald'
    },
    {
        key: 'both',
        label: 'Admin / Ambos',
        description: 'Acceso total como entrenador y deportista. Ideal para propietarios.',
        icon: FiShield,
        color: 'amber'
    }
];

const RoleSelector: React.FC<RoleSelectorProps> = ({ clubName, onRoleSelect, onBack }) => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            {/* Back Button */}
            <motion.button
                onClick={onBack}
                className="absolute top-4 left-4 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 transition-colors text-sm font-bold"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <FiArrowLeft size={16} />
                Cambiar Club
            </motion.button>

            {/* Header */}
            <motion.div
                className="text-center mb-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                    ¿Cuál es tu rol?
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Selecciona cómo deseas acceder a <span className="font-bold text-cyan-500">{clubName}</span>
                </p>
            </motion.div>

            {/* Role Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full px-4">
                {ROLES.map((role, idx) => {
                    const Icon = role.icon;
                    return (
                        <motion.button
                            key={role.key}
                            onClick={() => onRoleSelect(role.key)}
                            className={`
                                relative p-6 rounded-2xl text-left
                                bg-white dark:bg-slate-800
                                border-2 border-slate-200 dark:border-slate-700
                                hover:border-${role.color}-500 hover:shadow-lg hover:shadow-${role.color}-500/10
                                transition-all group
                            `}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {/* Icon Circle */}
                            <div className={`
                                w-14 h-14 rounded-full mb-4 flex items-center justify-center
                                bg-${role.color}-500/10 group-hover:bg-${role.color}-500/20
                                transition-colors
                            `}>
                                <Icon size={28} className={`text-${role.color}-500`} />
                            </div>

                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-cyan-500 transition-colors">
                                {role.label}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                {role.description}
                            </p>

                            {/* Hover Arrow */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className={`w-8 h-8 rounded-full bg-${role.color}-500 flex items-center justify-center`}>
                                    <FiArrowLeft size={16} className="text-white rotate-180" />
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Footer hint */}
            <motion.div
                className="text-center mt-10 text-xs text-slate-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <p>Esta selección determina qué funciones verás en el panel. Puedes cambiarlo más tarde.</p>
            </motion.div>
        </div>
    );
};

export default RoleSelector;
