import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiX, FiHeart, FiMessageCircle, FiSend, FiMoreHorizontal, FiTrash2, FiCornerDownRight
} from 'react-icons/fi';

import { Comment, LeagueColors, LeagueTier } from '../../types/SocialTypes';
import NexusService from '../../services/NexusService';

// ═══════════════════════════════════════════════════════════════════════════
// MOCK COMMENTS DATA
// ═══════════════════════════════════════════════════════════════════════════

const generateMockComments = (postId: string): Comment[] => [
    {
        id: 'c-1',
        postId,
        authorId: 'u-5',
        authorName: 'Elena Pérez',
        authorAvatar: 'https://randomuser.me/api/portraits/women/5.jpg',
        authorLeague: 'platinum',
        content: '¡Impresionante sesión! 💪 ¿Cuánto tiempo llevas entrenando con el Neural-Skin?',
        createdAt: new Date(Date.now() - 3600000 * 2),
        likes: 12,
        isLiked: false,
        replies: [
            {
                id: 'c-1-1',
                postId,
                authorId: 'u-1',
                authorName: 'Carlos García',
                authorAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
                authorLeague: 'gold',
                content: '@Elena_Perez ¡Gracias! Llevo 3 meses y ha sido un game changer total.',
                createdAt: new Date(Date.now() - 3600000 * 1),
                likes: 5,
                isLiked: true,
                replies: []
            }
        ]
    },
    {
        id: 'c-2',
        postId,
        authorId: 'u-6',
        authorName: 'Miguel López',
        authorAvatar: 'https://randomuser.me/api/portraits/men/6.jpg',
        authorLeague: 'silver',
        content: 'Esos datos de fatiga son muy buenos para esa intensidad. ¡Sigue así! 🔥',
        createdAt: new Date(Date.now() - 3600000 * 4),
        likes: 8,
        isLiked: false,
        replies: []
    },
    {
        id: 'c-3',
        postId,
        authorId: 'u-7',
        authorName: 'Laura Martín',
        authorAvatar: 'https://randomuser.me/api/portraits/women/7.jpg',
        authorLeague: 'diamond',
        content: '¿Me puedes pasar la rutina? Quiero probarla esta semana. El VO2 que has sacado está brutal.',
        createdAt: new Date(Date.now() - 3600000 * 6),
        likes: 15,
        isLiked: true,
        replies: []
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// COMMENT ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CommentItemProps {
    comment: Comment;
    isReply?: boolean;
    onLike: (commentId: string) => void;
    onReply: (commentId: string, authorName: string) => void;
    onDelete: (commentId: string) => void;
    currentUserId: string;
}

const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    isReply = false,
    onLike,
    onReply,
    onDelete,
    currentUserId
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const leagueConfig = LeagueColors[comment.authorLeague as LeagueTier];

    const timeAgo = (date: Date): string => {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return 'ahora';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
    };

    const isOwn = comment.authorId === currentUserId;

    return (
        <div className={`${isReply ? 'ml-10 mt-3' : ''}`}>
            <div className="flex gap-3">
                {/* Avatar */}
                <div className={`shrink-0 w-9 h-9 rounded-full overflow-hidden ${leagueConfig.glow}`}>
                    {comment.authorAvatar ? (
                        <img src={comment.authorAvatar} alt={comment.authorName} className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${leagueConfig.gradient} flex items-center justify-center text-white text-sm font-bold`}>
                            {comment.authorName.charAt(0)}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 rounded-xl bg-slate-800/80">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white text-sm">{comment.authorName}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${leagueConfig.bg} ${leagueConfig.border} font-bold`}>
                                {comment.authorLeague.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-sm text-slate-300">{comment.content}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-1 px-2">
                        <span className="text-xs text-slate-500">{timeAgo(comment.createdAt)}</span>

                        <button
                            onClick={() => onLike(comment.id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${comment.isLiked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'
                                }`}
                        >
                            <FiHeart size={12} className={comment.isLiked ? 'fill-current' : ''} />
                            {comment.likes > 0 && comment.likes}
                        </button>

                        {!isReply && (
                            <button
                                onClick={() => onReply(comment.id, comment.authorName)}
                                className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
                            >
                                Responder
                            </button>
                        )}

                        {/* Menu */}
                        <div className="relative ml-auto">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="text-slate-500 hover:text-white transition-colors"
                            >
                                <FiMoreHorizontal size={14} />
                            </button>

                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                    <div className="absolute right-0 top-full mt-1 w-32 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-xl z-20">
                                        {isOwn && (
                                            <button
                                                onClick={() => { onDelete(comment.id); setShowMenu(false); }}
                                                className="w-full px-3 py-2 flex items-center gap-2 text-sm text-red-400 hover:bg-red-500/10"
                                            >
                                                <FiTrash2 size={14} />
                                                Eliminar
                                            </button>
                                        )}
                                        <button className="w-full px-3 py-2 flex items-center gap-2 text-sm text-slate-400 hover:bg-slate-700">
                                            Reportar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3">
                    {comment.replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            isReply={true}
                            onLike={onLike}
                            onReply={onReply}
                            onDelete={onDelete}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
    postAuthorName: string;
    initialCommentCount: number;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
    isOpen,
    onClose,
    postId,
    postAuthorName,
    initialCommentCount
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUserId = 'u-1'; // Mock current user

    // Load comments
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            // Simulate API call
            setTimeout(() => {
                setComments(generateMockComments(postId));
                setLoading(false);
            }, 500);
        }
    }, [isOpen, postId]);

    // Focus input when replying
    useEffect(() => {
        if (replyingTo) {
            inputRef.current?.focus();
        }
    }, [replyingTo]);

    // Handle like
    const handleLike = (commentId: string) => {
        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 };
            }
            // Check replies
            if (c.replies) {
                return {
                    ...c,
                    replies: c.replies.map(r =>
                        r.id === commentId
                            ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 }
                            : r
                    )
                };
            }
            return c;
        }));
    };

    // Handle reply
    const handleReply = (commentId: string, authorName: string) => {
        setReplyingTo({ id: commentId, name: authorName });
        setNewComment(`@${authorName.replace(' ', '_')} `);
    };

    // Cancel reply
    const cancelReply = () => {
        setReplyingTo(null);
        setNewComment('');
    };

    // Handle delete
    const handleDelete = (commentId: string) => {
        setComments(prev => prev.filter(c => {
            if (c.id === commentId) return false;
            if (c.replies) {
                c.replies = c.replies.filter(r => r.id !== commentId);
            }
            return true;
        }));
    };

    // Submit comment
    const handleSubmit = async () => {
        if (!newComment.trim()) return;

        setIsSubmitting(true);

        const newCommentObj: Comment = {
            id: `c-${Date.now()}`,
            postId,
            authorId: currentUserId,
            authorName: 'Tu',
            authorAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
            authorLeague: 'gold',
            content: newComment.trim(),
            createdAt: new Date(),
            likes: 0,
            isLiked: false,
            replies: []
        };

        // Simulate API delay
        await new Promise(r => setTimeout(r, 300));

        if (replyingTo) {
            // Add as reply
            setComments(prev => prev.map(c =>
                c.id === replyingTo.id
                    ? { ...c, replies: [...(c.replies || []), newCommentObj] }
                    : c
            ));
        } else {
            // Add as top-level comment
            setComments(prev => [newCommentObj, ...prev]);
        }

        setNewComment('');
        setReplyingTo(null);
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="w-full max-w-lg bg-slate-900 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl border border-slate-700 max-h-[80vh] flex flex-col"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700 shrink-0">
                        <h2 className="text-lg font-bold text-white">
                            Comentarios ({comments.length || initialCommentCount})
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-8">
                                <FiMessageCircle size={32} className="mx-auto text-slate-600 mb-3" />
                                <p className="text-slate-400">No hay comentarios aún</p>
                                <p className="text-sm text-slate-500">¡Sé el primero en comentar!</p>
                            </div>
                        ) : (
                            comments.map(comment => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    onLike={handleLike}
                                    onReply={handleReply}
                                    onDelete={handleDelete}
                                    currentUserId={currentUserId}
                                />
                            ))
                        )}
                    </div>

                    {/* Reply Indicator */}
                    {replyingTo && (
                        <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <FiCornerDownRight size={14} />
                                <span>Respondiendo a <span className="text-cyan-400">{replyingTo.name}</span></span>
                            </div>
                            <button onClick={cancelReply} className="text-slate-500 hover:text-white">
                                <FiX size={14} />
                            </button>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-slate-700 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                T
                            </div>
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                    placeholder={replyingTo ? `Responder a ${replyingTo.name}...` : 'Escribe un comentario...'}
                                    className="w-full px-4 py-2.5 pr-12 rounded-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                                />
                                <button
                                    onClick={handleSubmit}
                                    disabled={!newComment.trim() || isSubmitting}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${newComment.trim() && !isSubmitting
                                            ? 'text-cyan-400 hover:bg-cyan-500/20'
                                            : 'text-slate-600'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <FiSend size={18} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CommentsModal;
