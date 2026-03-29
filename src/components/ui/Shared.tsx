// Shared UI Components
import React from 'react';
import { motion } from 'framer-motion';

export const Card: React.FC<{ children?: React.ReactNode, className?: string, onClick?: () => void, style?: React.CSSProperties }> = ({ children, className = '', onClick, style }) => (
    <motion.div
        onClick={onClick}
        className={`glass-panel rounded-2xl relative overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
        style={style}
        whileHover={onClick ? { y: -5, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' } : {}}
        whileTap={onClick ? { scale: 0.98 } : {}}
        transition={{ type: 'spring', stiffness: 300 }}
    >
        {children}
    </motion.div>
);

export const Button: React.FC<{
    children?: React.ReactNode,
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void,
    className?: string,
    icon?: React.ElementType,
    disabled?: boolean,
    type?: 'button' | 'submit' | 'reset',
    variant?: 'primary' | 'secondary'
}> = ({ children, onClick, className = '', icon: Icon, disabled, type, variant = 'primary' }) => {
    const baseClasses = "flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 glass-button shadow-lg";
    const variantClasses = {
        primary: "text-primary dark:text-white hover:bg-white/20 focus:ring-primary",
        secondary: "text-slate-700 dark:text-slate-200 hover:bg-white/10 focus:ring-slate-500"
    };
    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={!disabled ? { y: -2, scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
            {Icon && <Icon />} {children}
        </motion.button>
    )

};

export const Toggle: React.FC<{ isEnabled: boolean, onToggle: () => void }> = ({ isEnabled, onToggle }) => (
    <div onClick={onToggle} className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
        <motion.div layout transition={{ type: "spring", stiffness: 700, damping: 30 }} className={`bg-white w-6 h-6 rounded-full shadow-md ${isEnabled ? 'ml-6' : 'ml-0'}`} />
    </div>
);
