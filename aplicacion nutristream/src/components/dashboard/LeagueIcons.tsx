import React from 'react';

// Common definitions for gradients
export const BadgeGradients = () => (
    <svg width="0" height="0">
        <defs>
            <linearGradient id="bronzeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#CD7F32" />
                <stop offset="50%" stopColor="#E6A35C" />
                <stop offset="100%" stopColor="#8B4513" />
            </linearGradient>
            <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C0C0C0" />
                <stop offset="50%" stopColor="#E8E8E8" />
                <stop offset="100%" stopColor="#A9A9A9" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#FFF8DC" />
                <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
            <linearGradient id="platinumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E5E4E2" />
                <stop offset="50%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#B0C4DE" />
            </linearGradient>
            <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E0FFFF" />
                <stop offset="50%" stopColor="#00FFFF" />
                <stop offset="100%" stopColor="#4682B4" />
            </linearGradient>
            <linearGradient id="eliteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9932CC" />
                <stop offset="50%" stopColor="#DA70D6" />
                <stop offset="100%" stopColor="#4B0082" />
            </linearGradient>
        </defs>
    </svg>
);

const BaseBadge: React.FC<{ children: React.ReactNode; size?: number; className?: string }> = ({ children, size = 24, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`drop-shadow-lg ${className}`}
    >
        {children}
    </svg>
);

export const BronzeBadge: React.FC<{ size?: number }> = ({ size }) => (
    <BaseBadge size={size}>
        <path d="M12 2L4 5V11C4 16.55 7.5 21.74 12 23C16.5 21.74 20 16.55 20 11V5L12 2Z" fill="url(#bronzeGradient)" stroke="#8B4513" strokeWidth="1" />
        <path d="M12 4L17 7V11C17 15.01 14.87 18.66 12 19.66C9.13 18.66 7 15.01 7 11V7L12 4Z" fill="white" fillOpacity="0.2" />
    </BaseBadge>
);

export const SilverBadge: React.FC<{ size?: number }> = ({ size }) => (
    <BaseBadge size={size}>
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="url(#silverGradient)" stroke="#A9A9A9" strokeWidth="1" />
        <circle cx="12" cy="12" r="5" fill="white" fillOpacity="0.3" />
    </BaseBadge>
);

export const GoldBadge: React.FC<{ size?: number }> = ({ size }) => (
    <BaseBadge size={size}>
        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.62L12 2L9.19 8.62L2 9.24L7.45 13.97L5.82 21L12 17.27Z" fill="url(#goldGradient)" stroke="#B8860B" strokeWidth="1" />
        <path d="M12 15L15 17L14 13L17 10H13L12 7L11 10H7L10 13L9 17L12 15Z" fill="white" fillOpacity="0.3" />
    </BaseBadge>
);

export const PlatinumBadge: React.FC<{ size?: number }> = ({ size }) => (
    <BaseBadge size={size}>
        <rect x="12" y="2.1213" width="14" height="14" transform="rotate(45 12 2.1213)" fill="url(#platinumGradient)" stroke="#B0C4DE" strokeWidth="1" />
        <rect x="12" y="6.364" width="8" height="8" transform="rotate(45 12 6.364)" fill="white" fillOpacity="0.4" />
    </BaseBadge>
);

export const DiamondBadge: React.FC<{ size?: number }> = ({ size }) => (
    <BaseBadge size={size}>
        <path d="M12 2L2 10L12 22L22 10L12 2Z" fill="url(#diamondGradient)" stroke="#4682B4" strokeWidth="1" />
        <path d="M12 6L6 10L12 18L18 10L12 6Z" fill="white" fillOpacity="0.4" />
    </BaseBadge>
);

export const EliteBadge: React.FC<{ size?: number }> = ({ size }) => (
    <BaseBadge size={size}>
        <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V17H19V19Z" fill="url(#eliteGradient)" stroke="#4B0082" strokeWidth="1" />
        <circle cx="12" cy="12" r="2" fill="#FFD700" />
    </BaseBadge>
);
