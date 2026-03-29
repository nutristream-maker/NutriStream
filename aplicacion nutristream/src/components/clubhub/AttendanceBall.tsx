import React from 'react';
import { motion } from 'framer-motion';
import { AttendanceStatus } from '../../types/ClubTypes';

interface AttendanceBallProps {
    status: AttendanceStatus;
    size?: 'sm' | 'md' | 'lg';
    showPulse?: boolean;
    label?: string;
}

const AttendanceBall: React.FC<AttendanceBallProps> = ({
    status,
    size = 'md',
    showPulse = true,
    label
}) => {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-6 h-6'
    };

    const statusConfig = {
        confirmed: {
            bg: 'bg-emerald-500',
            glow: 'shadow-[0_0_12px_rgba(16,185,129,0.6)]',
            ring: 'ring-emerald-400/30'
        },
        pending: {
            bg: 'bg-amber-500',
            glow: 'shadow-[0_0_12px_rgba(245,158,11,0.6)]',
            ring: 'ring-amber-400/30'
        },
        absent: {
            bg: 'bg-red-500',
            glow: 'shadow-[0_0_12px_rgba(239,68,68,0.6)]',
            ring: 'ring-red-400/30'
        }
    };

    const config = statusConfig[status];

    return (
        <div className="flex items-center gap-2">
            <div className="relative">
                <motion.div
                    className={`
                        ${sizeClasses[size]} 
                        ${config.bg} 
                        ${config.glow}
                        rounded-full ring-2 ${config.ring}
                    `}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
                {showPulse && status === 'pending' && (
                    <motion.div
                        className={`absolute inset-0 ${config.bg} rounded-full`}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    />
                )}
            </div>
            {label && (
                <span className="text-xs font-medium text-slate-400">
                    {label}
                </span>
            )}
        </div>
    );
};

export default AttendanceBall;
