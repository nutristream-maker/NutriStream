import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LOGO_BASE64 } from '../../assets/LogoBase64';

const Loading: React.FC = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                // Simulate realistic loading: fast start, slow middle, fast end
                const increment = prev < 30 ? 4 : prev < 70 ? 1.5 : 3;
                return Math.min(prev + increment, 100);
            });
        }, 60);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 25%, #111827 50%, #0d1117 75%, #0a0a0f 100%)',
            }}
        >
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: 200 + i * 80,
                            height: 200 + i * 80,
                            background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(59,130,246,0.06)' : 'rgba(139,92,246,0.05)'} 0%, transparent 70%)`,
                            left: `${15 + i * 12}%`,
                            top: `${10 + (i % 3) * 25}%`,
                        }}
                        animate={{
                            x: [0, 30 * (i % 2 === 0 ? 1 : -1), 0],
                            y: [0, 20 * (i % 2 === 0 ? -1 : 1), 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 6 + i * 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* Logo with glow and pulse */}
                <motion.div
                    className="relative"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Glow ring behind logo */}
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)',
                            filter: 'blur(25px)',
                            transform: 'scale(2.2)',
                        }}
                        animate={{
                            opacity: [0.5, 0.8, 0.5],
                            scale: [2, 2.4, 2],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />

                    {/* Logo container */}
                    <motion.div
                        className="relative w-28 h-28 rounded-3xl flex items-center justify-center overflow-hidden"
                        style={{
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                        }}
                        animate={{
                            y: [0, -6, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        <img
                            src={LOGO_BASE64}
                            alt="NutriStream Logo"
                            className="w-16 h-16 object-contain"
                            style={{ filter: 'brightness(0) invert(1)' }}
                        />
                    </motion.div>
                </motion.div>

                {/* Brand Name */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <h1
                        className="text-3xl font-bold tracking-tight"
                        style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 50%, #60a5fa 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        NutriStream
                    </h1>
                    <motion.p
                        className="text-xs font-medium tracking-[0.3em] uppercase mt-1.5"
                        style={{ color: 'rgba(148, 163, 184, 0.6)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                    >
                        Performance Intelligence
                    </motion.p>
                </motion.div>

                {/* Progress bar */}
                <motion.div
                    className="w-48"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                >
                    <div
                        className="h-1 rounded-full overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                        <motion.div
                            className="h-full rounded-full"
                            style={{
                                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)',
                                backgroundSize: '200% 100%',
                            }}
                            animate={{
                                width: `${progress}%`,
                                backgroundPosition: ['0% 0%', '100% 0%'],
                            }}
                            transition={{
                                width: { duration: 0.3, ease: 'easeOut' },
                                backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' },
                            }}
                        />
                    </div>
                    <p
                        className="text-center text-[10px] mt-2 font-medium tabular-nums"
                        style={{ color: 'rgba(148, 163, 184, 0.4)' }}
                    >
                        {progress < 100 ? 'Cargando...' : 'Listo'}
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Loading;
