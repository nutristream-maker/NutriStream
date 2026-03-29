import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSend, FiImage, FiMoreVertical, FiChevronLeft, FiCheck, FiCheckCircle,
    FiBellOff, FiBell, FiTrash2, FiAlertOctagon, FiHeart, FiSmile, FiX, FiUser
} from 'react-icons/fi';

import { Message, Conversation, MessagingService } from '../../services/MessagingService';
import { LeagueColors } from '../../types/SocialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE BUBBLE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    showAvatar: boolean;
    participantAvatar?: string;
    onDoubleTap: (messageId: string) => void;
    currentUserId: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, showAvatar, participantAvatar, onDoubleTap, currentUserId }) => {
    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const reaction = message.reactions ? Object.values(message.reactions)[0] : null;
    const hasMyReaction = message.reactions && message.reactions[currentUserId];

    return (
        <motion.div
            className={`flex gap-3 mb-1 group ${isOwn ? 'flex-row-reverse' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Avatar (only for received messages) */}
            {!isOwn && (
                <div className="w-8 h-8 shrink-0 flex items-end">
                    {showAvatar && participantAvatar ? (
                        <img src={participantAvatar} alt="" className="w-full h-full rounded-full object-cover border border-slate-700" />
                    ) : <div className="w-8" />}
                </div>
            )}

            {/* Bubble Container */}
            <div className={`relative max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>

                {/* Visual Content */}
                {message.mediaUrl && (
                    <div className="mb-1 rounded-2xl overflow-hidden shadow-lg border border-white/5">
                        {message.mediaType === 'video' ? (
                            <video src={message.mediaUrl} className="max-w-xs" controls />
                        ) : (
                            <img src={message.mediaUrl} alt="" className="max-w-xs" />
                        )}
                    </div>
                )}

                {/* Text Bubble */}
                {message.content && (
                    <div
                        onDoubleClick={() => onDoubleTap(message.id)}
                        className={`px-4 py-2.5 shadow-sm backdrop-blur-sm relative transition-all ${isOwn
                            ? 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white rounded-2xl rounded-tr-sm'
                            : 'bg-slate-700/80 text-slate-100 rounded-2xl rounded-tl-sm'
                            }`}
                    >
                        <p className="text-[15px] leading-relaxed">{message.content}</p>
                    </div>
                )}

                {/* Meta Row */}
                <div className={`flex items-center gap-1 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] text-slate-500 font-medium">{formatTime(message.createdAt)}</span>
                    {isOwn && (
                        <span className={`${message.isRead ? 'text-cyan-400' : 'text-slate-500'}`}>
                            {message.isRead ? <FiCheckCircle size={10} /> : <FiCheck size={10} />}
                        </span>
                    )}
                </div>

                {/* Reaction Badge */}
                <AnimatePresence>
                    {reaction && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className={`absolute -bottom-2 ${isOwn ? '-left-2' : '-right-2'} w-6 h-6 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center shadow-lg text-xs`}
                        >
                            {reaction}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Quick Action (Like) on Hover for desktop */}
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center self-center ${isOwn ? 'mr-2' : 'ml-2'}`}>
                <button
                    onClick={() => onDoubleTap(message.id)}
                    className={`p-1.5 rounded-full hover:bg-slate-800 text-slate-400 transition-colors ${hasMyReaction ? 'text-red-500' : ''}`}
                >
                    <FiHeart size={14} className={hasMyReaction ? "fill-current" : ""} />
                </button>
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPING INDICATOR
// ═══════════════════════════════════════════════════════════════════════════

const TypingIndicator: React.FC = () => (
    <div className="flex gap-3 mb-4">
        <div className="w-8 h-8 shrink-0" /> {/* Spacer for avatar alignment */}
        <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-800/80 border border-slate-700/50 w-16 flex items-center justify-center">
            <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-slate-400/50 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                    />
                ))}
            </div>
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CHAT WINDOW COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ChatWindowProps {
    conversation: Conversation;
    onBack: () => void;
    onClose?: () => void;
    className?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onBack, onClose, className = '' }) => {
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isMuted, setIsMuted] = useState(conversation.isMuted);
    const [isBlocked, setIsBlocked] = useState(conversation.isBlocked);
    const [showMenu, setShowMenu] = useState(false);

    const currentUserId = 'u-1'; // Mock ID
    const participant = conversation.participants[0] || {
        userId: 'unknown',
        userName: 'Usuario Desconocido',
        userAvatar: 'https://via.placeholder.com/150',
        userLeague: 'bronze',
        isOnline: false
    };
    const leagueConfig = LeagueColors[participant.userLeague] || LeagueColors.bronze;

    // Load messages
    useEffect(() => {
        setIsMuted(conversation.isMuted);
        setIsBlocked(conversation.isBlocked);
        const loadMessages = async () => {
            setLoading(true);
            const data = await MessagingService.getMessages(conversation.id);
            setMessages(data);
            setLoading(false);
            await MessagingService.markAsRead(conversation.id);
        };
        loadMessages();
    }, [conversation.id]);

    // Group messages by date and convert to array
    const groupedMessages = Object.entries(
        messages.reduce((groups, message) => {
            const date = new Date(message.createdAt).toLocaleDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(message);
            return groups;
        }, {} as { [key: string]: Message[] })
    ).map(([date, msgs]) => ({ date, messages: msgs }));

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        setIsSending(true);
        try {
            const sent = await MessagingService.sendMessage(currentUserId, {
                conversationId: conversation.id,
                content: newMessage
            });
            setMessages(prev => [...prev, sent]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleReaction = async (messageId: string, reaction: string) => {
        await MessagingService.toggleReaction(conversation.id, messageId, currentUserId, reaction);
        // Optimistic update
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                const newReactions = { ...msg.reactions };
                if (newReactions[currentUserId] === reaction) {
                    delete newReactions[currentUserId];
                } else {
                    newReactions[currentUserId] = reaction;
                }
                return { ...msg, reactions: newReactions };
            }
            return msg;
        }));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Handle file upload here
            console.log('File selected:', file);
        }
    };

    const handleToggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
        setShowMenu(false);
        // Call service to persist
        // MessagingService.toggleMute(conversation.id);
    };

    const handleBlockUser = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsBlocked(!isBlocked);
        setShowMenu(false);
        // MessagingService.toggleBlock(participant.userId);
    };

    const handleDeleteChat = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
            onBack();
            // MessagingService.deleteConversation(conversation.id);
        }
    };

    // ... (rest of logic: handleSend, handleReaction etc)

    if (!participant) return null;

    return (
        <div className={`flex flex-col h-full bg-[#0F172A] relative ${className}`}>
            {/* Header - Glassmorphic */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-slate-900/80 backdrop-blur-md z-30 border-b border-slate-700/50 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-slate-300 md:hidden transition-colors">
                        <FiChevronLeft size={24} />
                    </button>

                    <div className="relative cursor-pointer group">
                        <div className={`w-10 h-10 rounded-full p-0.5 bg-gradient-to-br ${leagueConfig.gradient}`}>
                            <img src={participant.userAvatar} alt="" className="w-full h-full rounded-full object-cover border-2 border-slate-900" />
                        </div>
                        {participant.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 ring-1 ring-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        )}
                    </div>

                    <div>
                        <h4 className="font-bold text-white text-base leading-tight">{participant.userName}</h4>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${participant.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                            <p className="text-xs text-slate-400 font-medium tracking-wide">
                                {participant.isOnline ? 'Activo ahora' : 'Desconectado'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handleToggleMute}
                        className={`p-2.5 rounded-xl hover:bg-white/5 transition-colors hidden sm:flex ${isMuted ? 'text-red-400' : 'text-slate-400 hover:text-cyan-400'}`}
                        title={isMuted ? "Reactivar notificaciones" : "Silenciar notificaciones"}
                    >
                        {isMuted ? <FiBellOff size={20} /> : <FiBell size={20} />}
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className={`p-2.5 rounded-xl hover:bg-white/5 transition-colors hidden sm:flex ${showMenu ? 'bg-white/10 text-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}
                        >
                            <FiMoreVertical size={20} />
                        </button>

                        <AnimatePresence>
                            {showMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-1 overflow-hidden z-50 origin-top-right"
                                >
                                    <button
                                        onClick={() => {
                                            setShowMenu(false);
                                            navigate(`/profile/${participant.userId}`);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors text-sm text-slate-300 flex items-center gap-2"
                                    >
                                        <FiUser size={16} /> Ver Perfil
                                    </button>
                                    <button
                                        onClick={handleToggleMute}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors text-sm text-slate-300 flex items-center gap-2 sm:hidden"
                                    >
                                        {isMuted ? <FiBellOff size={16} /> : <FiBell size={16} />}
                                        {isMuted ? 'Reactivar aviso' : 'Silenciar'}
                                    </button>
                                    <button
                                        onClick={handleBlockUser}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors text-sm text-amber-500 flex items-center gap-2"
                                    >
                                        <FiAlertOctagon size={16} /> {isBlocked ? 'Desbloquear' : 'Bloquear'}
                                    </button>
                                    <div className="h-px bg-slate-700 my-1" />
                                    <button
                                        onClick={handleDeleteChat}
                                        className="w-full text-left px-4 py-3 hover:bg-red-500/10 transition-colors text-sm text-red-500 flex items-center gap-2"
                                    >
                                        <FiTrash2 size={16} /> Eliminar Chat
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors ml-1"
                            title="Cerrar chat"
                        >
                            <FiX size={24} />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto w-full pt-24 pb-24 px-4 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-100">
                {/* Background Noise/Texture Overlay could go here */}

                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    groupedMessages.map((group, gi) => (
                        <div key={gi} className="mb-6">
                            <div className="flex justify-center mb-6">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50 backdrop-blur-sm">
                                    {group.date}
                                </span>
                            </div>

                            <div className="space-y-1">
                                {group.messages.map((msg, mi) => {
                                    const isOwn = msg.senderId === currentUserId;
                                    const prevMsg = group.messages[mi - 1];
                                    const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;

                                    return (
                                        <MessageBubble
                                            key={msg.id}
                                            message={msg}
                                            isOwn={isOwn}
                                            showAvatar={showAvatar}
                                            participantAvatar={participant.userAvatar}
                                            onDoubleTap={handleReaction}
                                            currentUserId={currentUserId}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}

                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area - Floating Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent z-20">
                <div className="max-w-4xl mx-auto flex items-end gap-2 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-2 rounded-2xl shadow-2xl">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 rounded-xl hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 transition-all active:scale-95"
                    >
                        <FiImage size={20} />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <textarea
                        ref={inputRef as any}
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 resize-none max-h-32 py-3 px-2 text-[15px] leading-relaxed scrollbar-hide"
                        rows={1}
                        style={{ minHeight: '44px' }}
                    />

                    <button className="p-3 rounded-xl hover:bg-slate-700/50 text-slate-400 hover:text-amber-400 transition-all active:scale-95">
                        <FiSmile size={20} />
                    </button>

                    <motion.button
                        onClick={handleSend}
                        disabled={!newMessage.trim() && !isSending}
                        className={`p-3 rounded-xl transition-all shadow-lg ${newMessage.trim()
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-cyan-500/20'
                            : 'bg-slate-700 text-slate-500'
                            }`}
                        whileHover={newMessage.trim() ? { scale: 1.05 } : {}}
                        whileTap={newMessage.trim() ? { scale: 0.95 } : {}}
                    >
                        <FiSend size={18} className={newMessage.trim() ? 'translate-x-0.5 translate-y-0.5' : ''} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
