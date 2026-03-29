import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiX, FiShare2, FiCopy, FiDownload, FiCheck,
    FiTwitter, FiInstagram, FiFacebook
} from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';

import { Post, LeagueColors } from '../../types/SocialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: Post;
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARE OPTIONS
// ═══════════════════════════════════════════════════════════════════════════

const SHARE_PLATFORMS = [
    {
        id: 'copy',
        label: 'Copiar enlace',
        icon: FiCopy,
        color: 'bg-slate-700',
        hoverColor: 'hover:bg-slate-600'
    },
    {
        id: 'whatsapp',
        label: 'WhatsApp',
        icon: FaWhatsapp,
        color: 'bg-green-600',
        hoverColor: 'hover:bg-green-500'
    },
    {
        id: 'twitter',
        label: 'Twitter/X',
        icon: FiTwitter,
        color: 'bg-sky-500',
        hoverColor: 'hover:bg-sky-400'
    },
    {
        id: 'instagram',
        label: 'Instagram',
        icon: FiInstagram,
        color: 'bg-gradient-to-br from-purple-600 to-pink-500',
        hoverColor: 'hover:opacity-90'
    },
    {
        id: 'facebook',
        label: 'Facebook',
        icon: FiFacebook,
        color: 'bg-blue-600',
        hoverColor: 'hover:bg-blue-500'
    },
    {
        id: 'telegram',
        label: 'Telegram',
        icon: FaTelegram,
        color: 'bg-sky-600',
        hoverColor: 'hover:bg-sky-500'
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, post }) => {
    const [copied, setCopied] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);

    const leagueConfig = LeagueColors[post.authorLeague];
    const shareUrl = `https://nutristream.app/nexus/post/${post.id}`;
    const shareText = `${post.authorName} en NutriStream: "${post.content.slice(0, 100)}${post.content.length > 100 ? '...' : ''}"`;

    // Copy link handler
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Share to platform
    const handleShare = (platformId: string) => {
        if (platformId === 'copy') {
            handleCopyLink();
            return;
        }

        let url = '';

        switch (platformId) {
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'telegram':
                url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
                break;
            case 'instagram':
                // Instagram doesn't support direct sharing, show instructions
                alert('Para compartir en Instagram:\n1. Descarga la imagen\n2. Súbela a tu historia o publicación');
                return;
        }

        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
        }
    };

    // Native share API
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Publicación de NutriStream',
                    text: shareText,
                    url: shareUrl
                });
            } catch (err) {
                // User cancelled or error
            }
        }
    };

    // Download as image (mock - would use html2canvas in production)
    const handleDownloadImage = () => {
        setIsGeneratingImage(true);
        setTimeout(() => {
            setIsGeneratingImage(false);
            alert('Imagen descargada (mock)');
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="w-full max-w-md bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700">
                        <div className="flex items-center gap-2">
                            <FiShare2 className="text-cyan-400" />
                            <h2 className="text-lg font-bold text-white">Compartir</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Preview Card */}
                    <div className="p-4">
                        <div
                            ref={previewRef}
                            className="p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700"
                        >
                            {/* NutriStream Branding */}
                            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700/50">
                                <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                                    <span className="text-xs font-bold text-black">N</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400">NutriStream</span>
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-8 h-8 rounded-full overflow-hidden ${leagueConfig.glow}`}>
                                    {post.authorAvatar ? (
                                        <img src={post.authorAvatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className={`w-full h-full bg-gradient-to-br ${leagueConfig.gradient} flex items-center justify-center text-white text-xs font-bold`}>
                                            {post.authorName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="font-bold text-white text-sm">{post.authorName}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${leagueConfig.bg} ${leagueConfig.border} font-bold`}>
                                    {post.authorLeague.toUpperCase()}
                                </span>
                            </div>

                            {/* Content */}
                            <p className="text-sm text-slate-300 line-clamp-3">{post.content}</p>

                            {/* Sensor Proof */}
                            {post.hasSensorProof && (
                                <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                                    <FiCheck size={10} />
                                    Proof of Effort
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Share Options */}
                    <div className="p-4 pt-0">
                        <p className="text-xs text-slate-400 mb-3">Compartir en:</p>
                        <div className="grid grid-cols-3 gap-2">
                            {SHARE_PLATFORMS.map(platform => {
                                const Icon = platform.icon;
                                const isCopyAndCopied = platform.id === 'copy' && copied;

                                return (
                                    <motion.button
                                        key={platform.id}
                                        onClick={() => handleShare(platform.id)}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${platform.color} ${platform.hoverColor} transition-all`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isCopyAndCopied ? (
                                            <FiCheck size={20} className="text-white" />
                                        ) : (
                                            <Icon size={20} className="text-white" />
                                        )}
                                        <span className="text-xs text-white font-medium">
                                            {isCopyAndCopied ? '¡Copiado!' : platform.label}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Additional Actions */}
                    <div className="p-4 pt-0 flex gap-2">
                        {/* Native Share (mobile) */}
                        {'share' in navigator && (
                            <motion.button
                                onClick={handleNativeShare}
                                className="flex-1 py-3 rounded-xl bg-cyan-500 text-black font-bold flex items-center justify-center gap-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FiShare2 size={16} />
                                Compartir
                            </motion.button>
                        )}

                        {/* Download Image */}
                        <motion.button
                            onClick={handleDownloadImage}
                            disabled={isGeneratingImage}
                            className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isGeneratingImage ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FiDownload size={16} />
                                    Descargar
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ShareModal;
