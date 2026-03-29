import React from 'react';
import { motion } from 'framer-motion';
import {
    FiX, FiCalendar, FiClock, FiShare2, FiBookmark,
    FiHeart, FiMessageCircle, FiRepeat, FiPlay, FiFileText, FiExternalLink
} from 'react-icons/fi';
import { ScienceContent, ScienceCategoryInfo, SCIENCE_CATEGORIES, CONTENT_TYPE_CONFIG } from '../../services/ScienceHubService';

interface InteractionButtonProps {
    icon: React.ReactNode;
    label?: string | number;
    active?: boolean;
    activeColor?: string;
    onClick: (e: React.MouseEvent) => void;
}

const InteractionButton: React.FC<InteractionButtonProps> = ({ icon, label, active, activeColor = 'text-cyan-400', onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${active
            ? `${activeColor} bg-white/10`
            : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
    >
        {icon}
        {label && <span className="font-medium text-sm">{label}</span>}
    </button>
);

interface ScienceDetailModalProps {
    content: ScienceContent;
    onClose: () => void;
    onLike: (id: string) => void;
    onBookmark: (id: string) => void;
    onShare: (id: string) => void;
}

const ScienceDetailModal: React.FC<ScienceDetailModalProps> = ({ content, onClose, onLike, onBookmark, onShare }) => {
    const category = SCIENCE_CATEGORIES.find(c => c.key === content.category);
    const typeConfig = CONTENT_TYPE_CONFIG[content.type];

    // Format dates
    const formattedDate = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(content.publishedAt);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 overflow-y-auto"
            onClick={onClose}
        >
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="bg-slate-900 w-full max-w-4xl rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl relative"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                    >
                        <FiX size={24} />
                    </button>

                    {/* HERO SECTION */}
                    <div className="relative h-64 md:h-80 lg:h-96">
                        <img
                            src={content.thumbnail}
                            alt={content.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                        {/* Play Button Overlay for Video/Podcast */}
                        {(content.type === 'video' || content.type === 'podcast') && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button className="w-16 h-16 md:w-20 md:h-20 bg-white/10 hover:bg-cyan-500 hover:scale-105 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 border border-white/20">
                                    <FiPlay size={32} className="ml-1" />
                                </button>
                            </div>
                        )}

                        {/* Hero Content */}
                        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                {category && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-slate-800/80 backdrop-blur-sm border border-slate-600 ${category.color}`}>
                                        {category.emoji} {category.label}
                                    </span>
                                )}
                                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-slate-800/80 backdrop-blur-sm border border-slate-600 ${typeConfig.color}`}>
                                    {typeConfig.emoji} {typeConfig.label}
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight mb-2">
                                {content.title}
                            </h1>
                            {content.subtitle && (
                                <p className="text-lg text-slate-300 md:max-w-2xl">{content.subtitle}</p>
                            )}
                        </div>
                    </div>

                    {/* BODY CONTENT */}
                    <div className="flex flex-col lg:flex-row">
                        {/* Main Article */}
                        <div className="flex-1 p-6 md:p-10 space-y-8">
                            {/* Meta Bar */}
                            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                                <div className="flex items-center gap-3">
                                    <img src={content.authorAvatar} alt={content.author} className="w-10 h-10 rounded-full object-cover border border-slate-600" />
                                    <div>
                                        <p className="text-sm font-bold text-white">{content.author}</p>
                                        <p className="text-xs text-slate-400">{content.authorRole}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-slate-500 text-sm">
                                    <span className="flex items-center gap-1.5"><FiCalendar /> {formattedDate}</span>
                                    {content.duration ? (
                                        <span className="flex items-center gap-1.5"><FiClock /> {content.duration} min</span>
                                    ) : (
                                        <span className="flex items-center gap-1.5"><FiFileText /> {content.pages} pág.</span>
                                    )}
                                </div>
                            </div>

                            {/* Actual Content */}
                            <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                                {content.fullContent ? (
                                    <div dangerouslySetInnerHTML={{ __html: content.fullContent }} />
                                ) : (
                                    <p className="leading-relaxed">{content.content}</p>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 pt-6">
                                {content.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-slate-800 rounded-lg text-sm text-slate-400">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar / Quick Actions */}
                        <div className="lg:w-80 bg-slate-800/20 border-l border-slate-800 p-6 space-y-8">
                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                                <InteractionButton
                                    icon={<FiHeart className={content.isLiked ? 'fill-current' : ''} />}
                                    label={content.likeCount > 0 ? content.likeCount : 'Me gusta'}
                                    active={content.isLiked}
                                    activeColor="text-rose-400"
                                    onClick={(e) => { e.stopPropagation(); onLike(content.id); }}
                                />
                                <InteractionButton
                                    icon={<FiBookmark className={content.isBookmarked ? 'fill-current' : ''} />}
                                    label={content.isBookmarked ? 'Guardado' : 'Guardar'}
                                    active={content.isBookmarked}
                                    onClick={(e) => { e.stopPropagation(); onBookmark(content.id); }}
                                />
                                <InteractionButton
                                    icon={<FiShare2 />}
                                    label="Compartir"
                                    onClick={(e) => { e.stopPropagation(); onShare(content.id); }}
                                    activeColor="text-blue-400"
                                />
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-left">
                                    <FiExternalLink />
                                    <span className="font-medium text-sm">Ver fuente original</span>
                                </button>
                            </div>

                            {/* Related Placeholder (Could be real data later) */}
                            <div>
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <FiRepeat className="text-cyan-400" /> Relacionado
                                </h4>
                                <div className="space-y-4">
                                    {/* Mock related item */}
                                    <div className="group cursor-pointer">
                                        <div className="h-24 rounded-xl overflow-hidden mb-2 relative">
                                            <img
                                                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300"
                                                alt="Relacionado"
                                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                            />
                                        </div>
                                        <p className="text-sm font-medium text-white line-clamp-2 group-hover:text-cyan-300 transition-colors">
                                            Termorregulación en deportistas de élite
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ScienceDetailModal;
