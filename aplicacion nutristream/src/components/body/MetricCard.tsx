import React from 'react';
import { IconType } from 'react-icons';

interface MetricCardProps {
    label: string;
    value: string | number;
    icon: IconType;
    variant?: 'default' | 'warning' | 'success' | 'info';
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon: Icon, variant = 'default' }) => {
    const variantStyles = {
        default: 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200',
        warning: 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400',
        success: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
        info: 'bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400'
    };

    const iconStyles = {
        default: 'text-slate-500',
        warning: 'text-amber-500',
        success: 'text-emerald-500',
        info: 'text-blue-500'
    };

    return (
        <div className={`p-3 rounded-xl text-center ${variantStyles[variant]}`}>
            <div className="flex items-center justify-center gap-2 mb-1">
                <Icon className={`text-sm ${iconStyles[variant]}`} />
                <div className="text-xs">{label}</div>
            </div>
            <div className="font-bold text-lg">{value}</div>
        </div>
    );
};

export default MetricCard;
