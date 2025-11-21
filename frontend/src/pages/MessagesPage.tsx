import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useMessage } from '../contexts/MessageContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChatBubbleLeftRightIcon as ChatIcon, 
  PaperAirplaneIcon, 
  CheckIcon,
  CheckCircleIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Message } from '../types';

const MessagesPage: React.FC = () => {
  const { conversations, sendMessage, markAsRead, getConversationMessages, loading } = useMessage();
  const { editMessage, deleteMessage, deleteConversation } = useMessage();
  const { user } = useAuth();
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [readConversations, setReadConversations] = useState<Set<string>>(new Set());
  const [userHasManuallyClosed, setUserHasManuallyClosed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [hiddenConversations, setHiddenConversations] = useState<Set<string>>(new Set());

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  // Charger les messages quand une conversation est sélectionnée
  const loadConversationMessages = useCallback(async (conversationId: string) => {
    if (!getConversationMessages) return;    
    const messages = await getConversationMessages(conversationId);
    setConversationMessages(messages);
  }, [getConversationMessages]);

  useEffect(() => {
    if (selectedConversation) {
      loadConversationMessages(selectedConversation);
    }
  }, [selectedConversation, loadConversationMessages]);

  // Faire défiler vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  // Marquer les messages comme lus quand on ouvre une conversation
  useEffect(() => {
    if (selectedConversation && user && markAsRead) {
      const unreadMessages = conversationMessages.filter(
        msg => msg.receiverId === user.id && !msg.isRead
      );
      
      // Marquer la conversation comme lue localement
      if (unreadMessages.length > 0) {
        setReadConversations(prev => new Set([...prev, selectedConversation]));
      }


      // Marquer les messages comme lus dans l'API
      unreadMessages.forEach(async (msg) => {
        try {
          await markAsRead(msg.id);
        } catch (error) {
          console.error('Erreur marquage comme lu:', error);
        }
      });
    }
  }, [selectedConversation, conversationMessages, user, markAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation || !user || isSending) return;
    
    const otherParticipant = currentConversation.participants.find(p => p.id !== user.id);
    if (!otherParticipant) return;

    setIsSending(true);
    try {
      await sendMessage(otherParticipant.id, newMessage);
      setNewMessage('');
      // Recharger les messages de la conversation
      if (selectedConversation) {
        await loadConversationMessages(selectedConversation);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Fonction pour quitter la conversation
  const handleCloseConversation = () => {
    setSelectedConversation(null);
    setNewMessage('');
    setUserHasManuallyClosed(true);
  };

  // Sélectionner automatiquement la première conversation seulement si l'utilisateur n'a pas fermé manuellement
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation && !loading && !userHasManuallyClosed) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation, loading, userHasManuallyClosed]);

  // Auto-sélection via query param ?to=<userId> & optionnellement prefill=<message>
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const toUserId = params.get('to');
    const prefill = params.get('prefill');
    if (!toUserId || conversations.length === 0) return;

    const target = conversations.find(conv => conv.participants.some(p => String(p.id) === String(toUserId)));
    if (target) {
      setSelectedConversation(target.id);
      if (prefill) setNewMessage(prefill);
    }
  }, [location.search, conversations]);

  // Réinitialiser le flag de fermeture manuelle quand l'utilisateur sélectionne une conversation
  useEffect(() => {
    if (selectedConversation) {
      setUserHasManuallyClosed(false);
    }
  }, [selectedConversation]);

  // Charger/sauvegarder les conversations masquées (par utilisateur)
  useEffect(() => {
    if (!user) return;
    const key = `hidden_conversations_${user.id}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) setHiddenConversations(new Set<string>(JSON.parse(raw)));
    } catch {}
  }, [user]);

  const persistHiddenConversations = (next: Set<string>) => {
    if (!user) return;
    const key = `hidden_conversations_${user.id}`;
    try { localStorage.setItem(key, JSON.stringify(Array.from(next))); } catch {}
  };

  const hideConversationForMe = (conversationId: string) => {
    setHiddenConversations(prev => {
      const next = new Set(prev);
      next.add(conversationId);
      persistHiddenConversations(next);
      return next;
    });
    if (selectedConversation === conversationId) {
      setSelectedConversation(null);
    }
    setOpenMenuId(null);
  };

  // Fermer menu sur clic global
  useEffect(() => {
    const onDocClick = () => setOpenMenuId(null);
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // Fonction pour calculer le nombre de messages non lus affichés
  const getDisplayUnreadCount = (conversation: any) => {
  const isSelected = selectedConversation === conversation.id;

  // Si la conversation est ouverte → on la considère comme lue
  if (isSelected) return 0;

  // Si la conversation a été déjà ouverte au moins une fois
  if (readConversations.has(conversation.id)) return 0;

  // Afficher le badge seulement si le dernier message vient de l'autre participant et qu'il n'est pas lu
  const lastMsg = conversation.lastMessage;
  if (!lastMsg) return 0;

  const isFromOther = String(lastMsg.senderId) !== String(user?.id);
  const isUnread = !lastMsg.isRead;

  return isFromOther && isUnread ? 1 : 0;
};


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Messages
          </h1>
          <p className="text-gray-600">
            Communiquez avec les propriétaires et les étudiants
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex h-[600px]">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : conversations.filter(c => !hiddenConversations.has(c.id)).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <ChatIcon className="w-12 h-12 mb-4" />
                    <p className="text-center">Aucune conversation</p>
                    <p className="text-sm text-center mt-2">Commencez une nouvelle conversation depuis une annonce</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations.filter(c => !hiddenConversations.has(c.id)).map((conversation) => {
                      const otherParticipant = conversation.participants.find(p => p.id !== user.id);
                      if (!otherParticipant) return null;

                      const displayUnreadCount = getDisplayUnreadCount(conversation);

                      return (
                        <button
                          key={conversation.id}
                          onClick={() => {
                            setSelectedConversation(conversation.id);
                            setOpenMenuId(null);
                          }}
                          className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                            selectedConversation === conversation.id ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-medium text-sm">
                                {otherParticipant.firstName[0]}{otherParticipant.lastName[0]}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                  {otherParticipant.firstName} {otherParticipant.lastName}
                                </h3>
                                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                  {displayUnreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                      {displayUnreadCount}
                                    </span>
                                  )}
                                  <div className="relative">
                                    <button
                                      className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                                      title="Options"
                                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(prev => prev === conversation.id ? null : conversation.id); }}
                                    >
                                      <EllipsisHorizontalIcon className="w-5 h-5" />
                                    </button>
                                    {openMenuId === conversation.id && (
                                      <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded shadow z-10">
                                        <button
                                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                          onClick={() => hideConversationForMe(conversation.id)}
                                        >
                                          Supprimer pour moi
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {conversation.lastMessage && (
                                <p className={`text-sm truncate ${
                                  displayUnreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                                }`}>
                                  {conversation.lastMessage.content}
                                </p>
                              )}
                              <p className="text-xs text-gray-400">
                                {conversation.lastMessage && formatDistanceToNow(
                                  new Date(conversation.lastMessage.createdAt),
                                  { addSuffix: true, locale: fr }
                                )}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              {currentConversation ? (
                <>
                  {/* Chat Header avec bouton de fermeture */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium text-sm">
                          {currentConversation.participants.find(p => p.id !== user.id)?.firstName[0]}
                          {currentConversation.participants.find(p => p.id !== user.id)?.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {currentConversation.participants.find(p => p.id !== user.id)?.firstName}{' '}
                          {currentConversation.participants.find(p => p.id !== user.id)?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {currentConversation.participants.find(p => p.id !== user.id)?.userType === 'student' ? 'Étudiant' : 'Propriétaire'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCloseConversation}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        title="Fermer la conversation"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!selectedConversation) return;
                          if (window.confirm('Supprimer cette conversation ? Cette action est irréversible.')) {
                            try { await deleteConversation(selectedConversation); setSelectedConversation(null); } catch {}
                          }
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                        title="Supprimer la conversation"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {conversationMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <ChatIcon className="w-12 h-12 mb-4" />
                        <p>Aucun message dans cette conversation</p>
                        <p className="text-sm">Envoyez le premier message !</p>
                      </div>
                    ) : (
                      <>
                        {conversationMessages.map((message) => {
                          const isOwn = String(message.senderId) === String(user.id);

                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
                            >
                              <div
                                className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
                                  isOwn
                                    ? 'bg-primary-600 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200'
                                }`}
                              >
                                <p className="text-sm break-words">{message.content}</p>
                                <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                                  isOwn ? 'text-primary-100' : 'text-gray-500'
                                }`}>
                                  <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: fr })}</span>
                                  {isOwn && (
                                    <div className="flex items-center">
                                      {message.isRead ? (
                                        <CheckCircleIcon className="w-3 h-3" />
                                      ) : (
                                        <CheckIcon className="w-3 h-3" />
                                      )}
                                    </div>
                                  )}
                                </div>
                                {isOwn && (
                                  <div className="mt-1 flex justify-end space-x-1 text-xs">
                                    <button
                                      className="p-1 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      title="Modifier le message"
                                      onClick={async () => {
                                        const updated = prompt('Modifier le message:', message.content);
                                        if (updated !== null && updated.trim() && updated !== message.content) {
                                          try { await editMessage(message.id, updated); } catch {}
                                        }
                                      }}
                                    >
                                      <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                      className="p-1 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                      title="Supprimer le message"
                                      onClick={async () => {
                                        if (window.confirm('Supprimer ce message ?')) {
                                          try { await deleteMessage(message.id); } catch {}
                                        }
                                      }}
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tapez votre message..."
                        rows={2}
                        className="flex-1 input-field resize-none"
                        disabled={isSending}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                        className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <PaperAirplaneIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <ChatIcon className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {conversations.length === 0 ? 'Aucune conversation' : 'Sélectionnez une conversation'}
                    </h3>
                    <p>
                      {conversations.length === 0 
                        ? 'Commencez une nouvelle conversation depuis une annonce' 
                        : 'Choisissez une conversation pour commencer à discuter'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
