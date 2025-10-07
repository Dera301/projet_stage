import React, { useState } from 'react';
import { useMessage } from '../contexts/MessageContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChatBubbleLeftRightIcon as ChatIcon, 
  PaperAirplaneIcon, 
  CheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const MessagesPage: React.FC = () => {
  const { conversations, messages, sendMessage, loading } = useMessage();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const currentConversation = conversations.find(c => c.id === selectedConversation);
  const currentMessages = messages.filter(m => 
    (m.senderId === user?.id && m.receiverId === currentConversation?.participants.find(p => p.id !== user?.id)?.id) ||
    (m.receiverId === user?.id && m.senderId === currentConversation?.participants.find(p => p.id !== user?.id)?.id)
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;
    
    const otherParticipant = currentConversation.participants.find(p => p.id !== user?.id);
    if (!otherParticipant) return;

    try {
      await sendMessage(otherParticipant.id, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <ChatIcon className="w-12 h-12 mb-4" />
                    <p>Aucune conversation</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((conversation) => {
                      const otherParticipant = conversation.participants.find(p => p.id !== user.id);
                      if (!otherParticipant) return null;

                      return (
                        <button
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation.id)}
                          className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                            selectedConversation === conversation.id ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-medium text-sm">
                                {otherParticipant.firstName[0]}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                  {otherParticipant.firstName} {otherParticipant.lastName}
                                </h3>
                                {conversation.unreadCount > 0 && (
                                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                              </div>
                              {conversation.lastMessage && (
                                <p className="text-sm text-gray-500 truncate">
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
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium text-sm">
                          {currentConversation.participants.find(p => p.id !== user.id)?.firstName[0]}
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
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {currentMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <ChatIcon className="w-12 h-12 mb-4" />
                        <p>Aucun message dans cette conversation</p>
                        <p className="text-sm">Envoyez le premier message !</p>
                      </div>
                    ) : (
                      currentMessages.map((message) => {
                        const isOwn = message.senderId === user.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwn
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className={`flex items-center justify-end mt-1 space-x-1 ${
                                isOwn ? 'text-primary-100' : 'text-gray-500'
                              }`}>
                                <span className="text-xs">
                                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: fr })}
                                </span>
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
                            </div>
                          </div>
                        );
                      })
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
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PaperAirplaneIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <ChatIcon className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sélectionnez une conversation
                    </h3>
                    <p>Choisissez une conversation pour commencer à discuter</p>
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
