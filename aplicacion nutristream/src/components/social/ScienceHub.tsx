import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiFileText, FiHeadphones, FiPlay, FiBookOpen, FiBarChart2,
    FiBookmark, FiClock, FiEye, FiExternalLink,
    FiSearch, FiTrendingUp, FiHeart, FiMessageCircle, FiRepeat,
    FiSend, FiX, FiShare2, FiCheck
} from 'react-icons/fi';
import {
    ScienceHubService,
    ScienceContent,
    ScienceCategory,
    ScienceComment,
    SCIENCE_CATEGORIES,
    CONTENT_TYPE_CONFIG,
    ContentType
} from '../../services/ScienceHubService';
import ScienceDetailModal from './ScienceDetailModal';

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT TYPE ICONS
// ═══════════════════════════════════════════════════════════════════════════

const contentTypeIcons: Record<ContentType, React.ReactNode> = {
    article: <FiFileText size={16} />,
    podcast: <FiHeadphones size={16} />,
    video: <FiPlay size={16} />,
    thesis: <FiBookOpen size={16} />,
    report: <FiBarChart2 size={16} />
};

// ═══════════════════════════════════════════════════════════════════════════
// FORMAT HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 1) return 'Hace unos minutos';
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Hace ${days}d`;
    const weeks = Math.floor(days / 7);
    return `Hace ${weeks} sem`;
};

const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`;
};

const formatViews = (count: number): string => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return String(count);
};

const formatCount = (count: number): string => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return String(count);
};

// ═══════════════════════════════════════════════════════════════════════════
// INTERACTION BAR (shared between cards)
// ═══════════════════════════════════════════════════════════════════════════

interface InteractionBarProps {
    content: ScienceContent;
    onLike: (id: string) => void;
    onComment: (id: string) => void;
    onRepost: (id: string) => void;
    onBookmark: (id: string) => void;
    onSend: (id: string) => void;
    compact?: boolean;
}

const InteractionBar: React.FC<InteractionBarProps> = ({ content, onLike, onComment, onRepost, onBookmark, onSend, compact = false }) => {
    const btnBase = compact
        ? 'flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all'
        : 'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all';

    return (
        <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'} mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/30`}>
            {/* Like */}
            <button
                onClick={(e) => { e.stopPropagation(); onLike(content.id); }}
                className={`${btnBase} ${content.isLiked
                    ? 'text-rose-500 bg-rose-100 dark:text-rose-400 dark:bg-rose-500/10 hover:bg-rose-200 dark:hover:bg-rose-500/20'
                    : 'text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
            >
                <FiHeart size={compact ? 13 : 15} className={content.isLiked ? 'fill-current' : ''} />
                <span className="font-medium">{formatCount(content.likeCount)}</span>
            </button>

            {/* Comment */}
            <button
                onClick={(e) => { e.stopPropagation(); onComment(content.id); }}
                className={`${btnBase} text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-700/50`}
            >
                <FiMessageCircle size={compact ? 13 : 15} />
                <span className="font-medium">{content.commentCount}</span>
            </button>

            {/* Repost */}
            <button
                onClick={(e) => { e.stopPropagation(); onRepost(content.id); }}
                className={`${btnBase} ${content.isReposted
                    ? 'text-emerald-500 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 hover:bg-emerald-200 dark:hover:bg-emerald-500/20'
                    : 'text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
            >
                <FiRepeat size={compact ? 13 : 15} />
                <span className="font-medium">{formatCount(content.repostCount)}</span>
            </button>

            {/* Send to contact */}
            <button
                onClick={(e) => { e.stopPropagation(); onSend(content.id); }}
                className={`${btnBase} text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700/50`}
            >
                <FiShare2 size={compact ? 13 : 15} />
            </button>

            {/* Bookmark (pushed right) */}
            <div className="ml-auto">
                <button
                    onClick={(e) => { e.stopPropagation(); onBookmark(content.id); }}
                    className={`${btnBase} ${content.isBookmarked
                        ? 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-500/10'
                        : 'text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                        }`}
                >
                    <FiBookmark size={compact ? 13 : 15} className={content.isBookmarked ? 'fill-current' : ''} />
                </button>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMMENTS PANEL
// ═══════════════════════════════════════════════════════════════════════════

interface CommentsPanelProps {
    contentId: string;
    contentTitle: string;
    comments: ScienceComment[];
    onClose: () => void;
    onAddComment: (contentId: string, text: string) => void;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ contentId, contentTitle, comments, onClose, onAddComment }) => {
    const [newComment, setNewComment] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = async () => {
        if (!newComment.trim() || sending) return;
        setSending(true);
        await onAddComment(contentId, newComment.trim());
        setNewComment('');
        setSending(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                className="bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[80vh] flex flex-col border border-slate-700/50 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white">Comentarios</h3>
                        <p className="text-xs text-slate-500 truncate">{contentTitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                        <FiX size={18} />
                    </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {comments.length === 0 ? (
                        <div className="text-center py-8">
                            <FiMessageCircle size={32} className="mx-auto text-slate-700 mb-3" />
                            <p className="text-sm text-slate-500">Sé el primero en comentar</p>
                        </div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <img
                                    src={comment.authorAvatar}
                                    alt={comment.authorName}
                                    className="w-8 h-8 rounded-full border border-slate-700 shrink-0 object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="bg-slate-800/60 rounded-2xl px-3.5 py-2.5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-white">{comment.authorName}</span>
                                            <span className="text-[10px] text-slate-600">{formatTimeAgo(comment.createdAt)}</span>
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed">{comment.text}</p>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 ml-2">
                                        <button className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors">
                                            <FiHeart size={10} /> {comment.likeCount > 0 && comment.likeCount}
                                        </button>
                                        <button className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors">
                                            Responder
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                        <img
                            src="https://randomuser.me/api/portraits/men/1.jpg"
                            alt="Tú"
                            className="w-8 h-8 rounded-full border border-slate-700 shrink-0 object-cover"
                        />
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                placeholder="Añadir un comentario..."
                                className="w-full bg-slate-800/50 text-white text-sm pl-4 pr-10 py-2.5 rounded-full border border-slate-700/50 focus:border-cyan-500/50 focus:outline-none placeholder-slate-500"
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={!newComment.trim() || sending}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${newComment.trim()
                                    ? 'text-cyan-400 hover:bg-cyan-500/20'
                                    : 'text-slate-600 cursor-not-allowed'
                                    }`}
                            >
                                <FiSend size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SEND CONTENT MODAL
// ═══════════════════════════════════════════════════════════════════════════

const CONTACTS = [
    { id: 'u-1', name: 'Ana García', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', status: 'En línea' },
    { id: 'u-2', name: 'Carlos Ruiz', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', status: 'Hace 5 min' },
    { id: 'u-3', name: 'Laura Sánchez', avatar: 'https://randomuser.me/api/portraits/women/28.jpg', status: 'En línea' },
    { id: 'u-4', name: 'Pablo Fernández', avatar: 'https://randomuser.me/api/portraits/men/36.jpg', status: 'Hace 1h' },
    { id: 'u-5', name: 'María López', avatar: 'https://randomuser.me/api/portraits/women/33.jpg', status: 'Hace 30 min' },
    { id: 'u-6', name: 'David Kim', avatar: 'https://randomuser.me/api/portraits/men/40.jpg', status: 'Hace 2h' },
];

interface SendContentModalProps {
    content: ScienceContent;
    onClose: () => void;
    onSent: (contactName: string) => void;
}

const SendContentModal: React.FC<SendContentModalProps> = ({ content, onClose, onSent }) => {
    const [search, setSearch] = useState('');
    const [sentTo, setSentTo] = useState<Set<string>>(new Set());
    const [message, setMessage] = useState('');

    const filteredContacts = CONTACTS.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSendTo = async (contact: typeof CONTACTS[0]) => {
        setSentTo(prev => new Set(prev).add(contact.id));
        // Simulate send delay
        await new Promise(r => setTimeout(r, 300));
        onSent(contact.name);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`https://nexus.app/science/${content.id}`);
        onSent('Portapapeles');
    };

    const handleNativeShare = () => {
        if (navigator.share) {
            navigator.share({
                title: content.title,
                text: content.content,
                url: `https://nexus.app/science/${content.id}`
            }).then(() => onSent('App externa'))
                .catch(() => { });
        }
    };

    const typeConfig = CONTENT_TYPE_CONFIG[content.type];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                className="bg-slate-900 rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col border border-slate-700/50 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <FiShare2 size={16} className="text-blue-400" />
                            Compartir en...
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                        <FiX size={18} />
                    </button>
                </div>

                {/* Content Preview */}
                <div className="px-4 py-3 border-b border-slate-800/50">
                    <div className="flex items-center gap-3 bg-slate-800/40 rounded-xl p-3">
                        <img src={content.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                            <div className={`text-[10px] font-bold ${typeConfig.color} mb-0.5`}>
                                {typeConfig.emoji} {typeConfig.label}
                            </div>
                            <p className="text-xs font-bold text-white truncate">{content.title}</p>
                            <p className="text-[10px] text-slate-500">{content.author}</p>
                        </div>
                    </div>
                </div>

                {/* External Actions */}
                <div className="grid grid-cols-2 gap-3 p-4">
                    <button onClick={handleCopyLink} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl transition-colors font-medium text-sm">
                        <FiFileText /> Copiar enlace
                    </button>
                    <button onClick={handleNativeShare} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl transition-colors font-medium text-sm">
                        <FiShare2 /> Más opciones
                    </button>
                </div>

                <div className="px-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Enviar a contactos
                </div>

                {/* Search */}
                <div className="px-4 pb-2">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar contacto..."
                            className="w-full bg-slate-800/50 text-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-700/50 focus:border-blue-500/50 focus:outline-none placeholder-slate-500"
                        />
                    </div>
                </div>

                {/* Contacts List */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
                    {filteredContacts.map(contact => {
                        const isSent = sentTo.has(contact.id);
                        return (
                            <div
                                key={contact.id}
                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/40 transition-colors"
                            >
                                <div className="relative">
                                    <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full border border-slate-700 object-cover" />
                                    {contact.status === 'En línea' && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{contact.name}</p>
                                    <p className="text-[10px] text-slate-500">{contact.status}</p>
                                </div>
                                <button
                                    onClick={() => !isSent && handleSendTo(contact)}
                                    disabled={isSent}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${isSent
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/40 hover:bg-blue-500/30'
                                        }`}
                                >
                                    {isSent ? (
                                        <span className="flex items-center gap-1"><FiCheck size={12} /> Enviado</span>
                                    ) : (
                                        <span className="flex items-center gap-1"><FiSend size={12} /> Enviar</span>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                    {filteredContacts.length === 0 && (
                        <div className="text-center py-6">
                            <p className="text-xs text-slate-500">No se encontraron contactos</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// TOAST NOTIFICATION
// ═══════════════════════════════════════════════════════════════════════════

const ToastNotification: React.FC<{ message: string; icon?: React.ReactNode; onClose: () => void }> = ({ message, icon, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 2500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-800/90 border border-slate-600/50 text-white text-sm font-medium px-5 py-3 rounded-2xl backdrop-blur-sm flex items-center gap-2 shadow-xl"
        >
            {icon || <FiCheck size={16} className="text-emerald-400" />}
            {message}
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// FEATURED HERO CARD
// ═══════════════════════════════════════════════════════════════════════════

interface CardActions {
    onLike: (id: string) => void;
    onComment: (id: string) => void;
    onRepost: (id: string) => void;
    onBookmark: (id: string) => void;
    onClick?: () => void;
}

const FeaturedCard: React.FC<{ content: ScienceContent; onClick?: () => void } & CardActions> = ({ content, onLike, onComment, onRepost, onBookmark, onSend, onClick }) => {
    const typeConfig = CONTENT_TYPE_CONFIG[content.type];
    const category = SCIENCE_CATEGORIES.find(c => c.key === content.category);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700/50 group cursor-pointer shadow-lg dark:shadow-none"
            onClick={onClick}
        >
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={content.thumbnail}
                    alt={content.title}
                    className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative p-6 md:p-8 flex flex-col min-h-[280px] justify-end">
                {/* Top badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold backdrop-blur-sm">
                        <FiTrendingUp size={12} />
                        Destacado
                    </span>
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${typeConfig.bgColor} ${typeConfig.color} text-xs font-bold backdrop-blur-sm border border-white/10`}>
                        {contentTypeIcons[content.type]}
                        {typeConfig.label}
                    </span>
                </div>

                {/* Category & Time */}
                <div className="flex items-center gap-2 mb-3">
                    {category && (
                        <span className={`text-sm font-medium ${category.color}`}>
                            {category.emoji} {category.label}
                        </span>
                    )}
                    <span className="text-slate-500">·</span>
                    <span className="text-sm text-slate-400">{formatTimeAgo(content.publishedAt)}</span>
                </div>

                {/* Title */}
                <h2 className="text-xl md:text-2xl font-black text-white mb-2 leading-tight group-hover:text-cyan-300 transition-colors">
                    {content.title}
                </h2>

                {content.subtitle && (
                    <p className="text-slate-400 text-sm mb-3 max-w-2xl">{content.subtitle}</p>
                )}

                {/* Author + Meta */}
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                        <img src={content.authorAvatar} alt={content.author} className="w-9 h-9 rounded-full border border-slate-600 object-cover" />
                        <div>
                            <span className="text-sm font-bold text-white">{content.author}</span>
                            <span className="block text-xs text-slate-500">{content.authorRole}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                            <FiEye size={13} />
                            {formatViews(content.viewCount)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                            {content.duration ? (
                                <><FiClock size={13} /> {formatDuration(content.duration)}</>
                            ) : content.pages ? (
                                <><FiFileText size={13} /> {content.pages} pág.</>
                            ) : null}
                        </span>
                    </div>
                </div>

                {/* Interaction Bar */}
                <InteractionBar
                    content={content}
                    onLike={onLike}
                    onComment={onComment}
                    onRepost={onRepost}
                    onBookmark={onBookmark}
                    onSend={onSend}
                />
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT CARD
// ═══════════════════════════════════════════════════════════════════════════

const ContentCard: React.FC<{ content: ScienceContent; index: number; onClick?: () => void } & CardActions> = ({ content, index, onLike, onComment, onRepost, onBookmark, onSend, onClick }) => {
    const typeConfig = CONTENT_TYPE_CONFIG[content.type];
    const category = SCIENCE_CATEGORIES.find(c => c.key === content.category);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 transition-all group cursor-pointer shadow-sm dark:shadow-none"
            onClick={onClick}
        >
            <div className="flex flex-col sm:flex-row">
                {/* Thumbnail */}
                <div className="relative sm:w-48 h-48 sm:h-auto shrink-0">
                    <img src={content.thumbnail} alt={content.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md bg-white/90 dark:bg-slate-900/90 ${typeConfig.color} shadow-sm`}>
                            {typeConfig.emoji} {typeConfig.label}
                        </span>
                    </div>
                    {/* Duration badge */}
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1">
                        {content.type === 'video' || content.type === 'podcast' ? <FiPlay size={10} /> : <FiClock size={10} />}
                        {content.duration ? formatDuration(content.duration) : `${content.pages} pág`}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            {category && (
                                <span className={`text-[10px] uppercase tracking-wider font-bold ${category.color}`}>
                                    {category.label}
                                </span>
                            )}
                            <span className="text-[10px] text-slate-400">•</span>
                            <span className="text-[10px] text-slate-400">{formatTimeAgo(content.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                            <span className="flex items-center gap-1 text-[10px]"><FiEye /> {formatViews(content.viewCount)}</span>
                        </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {content.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 flex-1">
                        {content.content}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                        <img src={content.authorAvatar} alt={content.author} className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{content.author}</span>
                        <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700/50 rounded-full border border-slate-200 dark:border-slate-600/50">
                            {content.authorRole}
                        </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                        {content.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* Interaction Bar */}
                    <InteractionBar
                        content={content}
                        onLike={onLike}
                        onComment={onComment}
                        onRepost={onRepost}
                        onBookmark={onBookmark}
                        onSend={onSend}
                        compact
                    />
                </div>
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SCIENCE HUB COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const ScienceHub: React.FC = () => {
    const [contents, setContents] = useState<ScienceContent[]>([]);
    const [featured, setFeatured] = useState<ScienceContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<ScienceCategory | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [featuredIndex, setFeaturedIndex] = useState(0);

    // Interaction state
    const [commentPanelId, setCommentPanelId] = useState<string | null>(null);
    const [commentPanelData, setCommentPanelData] = useState<{ title: string; comments: ScienceComment[] }>({ title: '', comments: [] });
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [sendModalContent, setSendModalContent] = useState<ScienceContent | null>(null);
    const [selectedContent, setSelectedContent] = useState<ScienceContent | null>(null);

    useEffect(() => {
        loadContents();
    }, [activeCategory]);

    useEffect(() => {
        ScienceHubService.getFeatured().then(setFeatured);
    }, []);

    // Auto-rotate featured
    useEffect(() => {
        if (featured.length <= 1) return;
        const interval = setInterval(() => {
            setFeaturedIndex(prev => (prev + 1) % featured.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [featured.length]);

    const loadContents = async () => {
        setLoading(true);
        const data = await ScienceHubService.getContents(activeCategory || undefined);
        setContents(data);
        setLoading(false);
    };

    // ─── INTERACTION HANDLERS ──────────────────────────────────────────

    const updateContent = (id: string, updates: Partial<ScienceContent>) => {
        setContents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        setFeatured(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const handleLike = async (id: string) => {
        const result = await ScienceHubService.toggleLike(id);
        updateContent(id, { isLiked: result.isLiked, likeCount: result.likeCount });
    };

    const handleComment = async (id: string) => {
        const content = [...contents, ...featured].find(c => c.id === id);
        if (!content) return;
        const comments = await ScienceHubService.getComments(id);
        setCommentPanelData({ title: content.title, comments });
        setCommentPanelId(id);
    };

    const handleAddComment = async (contentId: string, text: string) => {
        const newComment = await ScienceHubService.addComment(contentId, text);
        if (newComment) {
            setCommentPanelData(prev => ({ ...prev, comments: [...prev.comments, newComment] }));
            const content = [...contents, ...featured].find(c => c.id === contentId);
            if (content) {
                updateContent(contentId, { commentCount: content.commentCount + 1, comments: [...content.comments, newComment] });
            }
        }
    };

    const handleRepost = async (id: string) => {
        const result = await ScienceHubService.toggleRepost(id);
        updateContent(id, { isReposted: result.isReposted, repostCount: result.repostCount });
        setToastMessage(result.isReposted ? 'Compartido en tu feed' : 'Repost eliminado');
    };

    const handleSend = (id: string) => {
        const content = [...contents, ...featured].find(c => c.id === id);
        if (content) setSendModalContent(content);
    };

    const handleBookmark = async (id: string) => {
        await ScienceHubService.toggleBookmark(id);
        const content = [...contents, ...featured].find(c => c.id === id);
        if (content) {
            updateContent(id, {
                isBookmarked: !content.isBookmarked,
                bookmarkCount: content.bookmarkCount + (content.isBookmarked ? -1 : 1)
            });
        }
    };

    // Filter by search
    const filteredContents = contents.filter(c =>
        !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Separate non-featured for the list
    const listContents = filteredContents.filter(c => !c.isFeatured);

    const handleContentClick = (content: ScienceContent) => {
        setSelectedContent(content);
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="text-3xl">🧬</span> Ciencia & Salud
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-xl">
                        Divulgación científica basada en evidencia para conocerte mejor
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar contenido..."
                        className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-white pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700/50 focus:border-purple-500/50 focus:outline-none transition-all placeholder-slate-500"
                    />
                </div>
            </div>

            {/* CATEGORY TABS */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setActiveCategory(null)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${activeCategory === null
                        ? 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/30'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/50 dark:hover:bg-slate-700/50'
                        }`}
                >
                    🚀 Todos
                </button>
                {SCIENCE_CATEGORIES.map(category => (
                    <button
                        key={category.key}
                        onClick={() => setActiveCategory(category.key)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${activeCategory === category.key
                            ? `${category.bgColor} ${category.color} ${category.borderColor}`
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/50 dark:hover:bg-slate-700/50'
                            }`}
                    >
                        {category.emoji} {category.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full" />
                </div>
            ) : (
                <>
                    {/* FEATURED HERO */}
                    {!searchQuery && !activeCategory && featured.length > 0 && (
                        <div className="relative">
                            <AnimatePresence mode="wait">
                                <FeaturedCard
                                    key={featured[featuredIndex].id}
                                    content={featured[featuredIndex]}
                                    onLike={handleLike}
                                    onComment={handleComment}
                                    onRepost={handleRepost}
                                    onBookmark={handleBookmark}
                                    onSend={handleSend}
                                    onClick={() => handleContentClick(featured[featuredIndex])}
                                />
                            </AnimatePresence>
                            {/* Dots indicator */}
                            {featured.length > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-3">
                                    {featured.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setFeaturedIndex(i)}
                                            className={`w-2 h-2 rounded-full transition-all ${i === featuredIndex ? 'w-6 bg-cyan-400' : 'bg-slate-600 hover:bg-slate-500'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* CONTENT TYPE FILTERS (quick inline) */}
                    {!searchQuery && (
                        <div className="flex items-center gap-4 pt-2">
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Tipo:</span>
                            <div className="flex items-center gap-2 flex-wrap">
                                {Object.entries(CONTENT_TYPE_CONFIG).map(([key, config]) => {
                                    const count = listContents.filter(c => c.type === key).length;
                                    if (count === 0) return null;
                                    return (
                                        <span key={key} className={`text-xs ${config.color} flex items-center gap-1`}>
                                            {config.emoji} {config.label} ({count})
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* CONTENT LIST */}
                    <div className="space-y-3">
                        {listContents.map((content, i) => (
                            <ContentCard
                                key={content.id}
                                content={content}
                                index={i}
                                onLike={handleLike}
                                onComment={handleComment}
                                onRepost={handleRepost}
                                onBookmark={handleBookmark}
                                onSend={handleSend}
                                onClick={() => handleContentClick(content)}
                            />
                        ))}
                    </div>

                    {/* Empty state */}
                    {listContents.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <FiSearch size={32} className="text-slate-600" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">No se encontró contenido</h3>
                            <p className="text-slate-400 text-sm">Prueba con otra categoría o término de búsqueda</p>
                        </div>
                    )}

                    {/* Source disclaimer */}
                    <div className="text-center pt-4 pb-2">
                        <p className="text-[10px] text-slate-600 flex items-center justify-center gap-1">
                            <FiExternalLink size={10} />
                            Contenido basado en publicaciones científicas revisadas por pares
                        </p>
                    </div>
                </>
            )}

            {/* SEND CONTENT MODAL */}
            <AnimatePresence>
                {sendModalContent && (
                    <SendContentModal
                        content={sendModalContent}
                        onClose={() => setSendModalContent(null)}
                        onSent={(name) => {
                            setToastMessage(`Enviado a ${name}`);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* DETAIL MODAL */}
            <AnimatePresence>
                {selectedContent && (
                    <ScienceDetailModal
                        content={selectedContent}
                        onClose={() => setSelectedContent(null)}
                        onLike={() => handleLike(selectedContent.id)}
                        onBookmark={() => handleBookmark(selectedContent.id)}
                        onShare={() => handleSend(selectedContent.id)}
                    />
                )}
            </AnimatePresence>

            {/* COMMENTS PANEL MODAL */}
            <AnimatePresence>
                {commentPanelId && (
                    <CommentsPanel
                        contentId={commentPanelId}
                        contentTitle={commentPanelData.title}
                        comments={commentPanelData.comments}
                        onClose={() => setCommentPanelId(null)}
                        onAddComment={handleAddComment}
                    />
                )}
            </AnimatePresence>

            {/* TOAST */}
            <AnimatePresence>
                {toastMessage && (
                    <ToastNotification message={toastMessage} onClose={() => setToastMessage(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ScienceHub;
