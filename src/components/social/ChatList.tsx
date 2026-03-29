import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FiMessageCircle, FiSearch, FiPlus, FiVolume2, FiVolumeX, FiBell, FiBellOff, FiX, FiChevronLeft
} from 'react-icons/fi';

import { Conversation, MessagingService } from '../../services/MessagingService';
import { LeagueColors } from '../../types/SocialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// CONVERSATION ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ConversationItemProps {
    conversation: Conversation;
    isSelected: boolean;
    onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, isSelected, onClick }) => {
    const participant = conversation.participants[0];
    if (!participant) return null;

    const leagueConfig = LeagueColors[participant.userLeague];

    const timeAgo = (date: Date): string => {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return 'ahora';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
    };

    return (
        <motion.button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${isSelected
                ? 'bg-cyan-500/20 border border-cyan-500/30'
                : 'hover:bg-slate-800/50 border border-transparent'
                }`}
            whileHover={{ x: 2 }}
        >
            {/* Avatar */}
            <div className="relative shrink-0">
                <div className={`w-12 h-12 rounded-full overflow-hidden ${leagueConfig.glow}`}>
                    <img
                        src={participant.userAvatar}
                        alt={participant.userName}
                        className="w-full h-full object-cover"
                    />
                </div>
                {/* Online indicator */}
                {participant.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-white text-sm truncate">{participant.userName}</span>
                    {conversation.lastMessage && (
                        <span className="text-xs text-slate-500 shrink-0">
                            {timeAgo(conversation.lastMessage.createdAt)}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {conversation.lastMessage && (
                        <p className={`text-xs truncate flex-1 ${conversation.unreadCount > 0 ? 'text-white font-medium' : 'text-slate-400'
                            }`}>
                            {conversation.lastMessage.senderId === 'u-1' && 'Tú: '}
                            {conversation.lastMessage.content}
                        </p>
                    )}
                    {/* Badges */}
                    <div className="flex items-center gap-1 shrink-0">
                        {conversation.isMuted && <FiBellOff size={12} className="text-slate-500" />}
                        {conversation.unreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-cyan-500 text-black text-xs font-bold flex items-center justify-center">
                                {conversation.unreadCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.button>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CHAT LIST COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ChatListProps {
    selectedConversationId?: string;
    onSelectConversation: (conversationId: string) => void;
    onNewConversation: () => void;
    onClose: () => void;
    className?: string;
}

const ChatList: React.FC<ChatListProps> = ({
    selectedConversationId,
    onSelectConversation,
    onNewConversation,
    onClose,
    className = ''
}) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        const loadConversations = async () => {
            setLoading(true);
            const data = await MessagingService.getConversations('u-1');
            setConversations(data);
            setLoading(false);
        };
        loadConversations();
    }, []);

    const filteredConversations = conversations.filter(c => {
        const participant = c.participants[0];
        if (!participant) return false;

        const matchesSearch = searchQuery === '' ||
            participant.userName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || (filter === 'unread' && c.unreadCount > 0);

        return matchesSearch && matchesFilter;
    });

    const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

    return (
        <div className={`flex flex-col h-full bg-slate-900 ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="p-2 -ml-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors lg:hidden"
                        >
                            <FiChevronLeft size={24} />
                        </button>
                        <h3 className="font-bold text-white text-xl">Mensajes</h3>
                        {totalUnread > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-black text-xs font-bold">
                                {totalUnread}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onNewConversation}
                            className="p-2 rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 transition-colors"
                        >
                            <FiPlus size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="hidden lg:flex p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Buscar conversación..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                    />
                </div>

                {/* Filter */}
                <div className="flex gap-1">
                    {(['all', 'unread'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f
                                ? 'bg-slate-700 text-white'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {f === 'all' ? 'Todos' : 'No leídos'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-8">
                        <FiMessageCircle size={32} className="mx-auto text-slate-600 mb-3" />
                        <p className="text-slate-400 text-sm">
                            {searchQuery ? 'No se encontraron conversaciones' : 'No tienes mensajes'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredConversations.map(conversation => (
                            <ConversationItem
                                key={conversation.id}
                                conversation={conversation}
                                isSelected={conversation.id === selectedConversationId}
                                onClick={() => onSelectConversation(conversation.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatList;
