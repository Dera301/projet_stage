import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Conversation, Message, MessageContextType } from '../types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

interface MessageProviderProps {
  children: ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const getMockConversations = (): Conversation[] => {
      if (!user) return [];

      const lastMessage = {
        id: '1',
        senderId: '2',
        receiverId: user.id,
        content: 'Bonjour, je suis intéressé par votre logement',
        isRead: false,
        createdAt: new Date(),
        sender: { firstName: 'Jean', lastName: 'Dupont' },
        receiver: { firstName: user.firstName, lastName: user.lastName },
      };

      return [
        {
          id: '1',
          participants: [
            {
              id: '2',
              email: 'proprietaire@example.com',
              firstName: 'Jean',
              lastName: 'Dupont',
              phone: '+261320123456',
              userType: 'owner',
              isVerified: true,
              preferences: [],
              bio: 'Propriétaire sérieux',
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          ],
          lastMessage: lastMessage,
          unreadCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
    };

    const getMockMessages = (): Message[] => {
      if (!user) return [];

      return [
        {
          id: '1',
          conversationId: '1',
          senderId: '2',
          receiverId: user.id,
          content: 'Bonjour, je suis intéressé par votre logement',
          isRead: false,
          createdAt: new Date(),
          sender: { firstName: 'Jean', lastName: 'Dupont' },
          receiver: { firstName: user.firstName, lastName: user.lastName },
        }
      ];
    };
    if (user) {
      setConversations(getMockConversations());
      setMessages(getMockMessages());
    } else {
      setConversations([]);
      setMessages([]);
    }
  }, [user]); // Now only depends on user

  // Keep separate versions for other methods
  const getMockMessagesForMethod = useCallback((): Message[] => {
    if (!user) return [];

    return [
      {
        id: '1',
        conversationId: '1',
        senderId: '2',
        receiverId: user.id,
        content: 'Bonjour, je suis intéressé par votre logement',
        isRead: false,
        createdAt: new Date(),
        sender: { firstName: 'Jean', lastName: 'Dupont' },
        receiver: { firstName: user.firstName, lastName: user.lastName },
      }
    ];
  }, [user]);

  const getMockConversationsForMethod = useCallback((): Conversation[] => {
    if (!user) return [];

    const lastMessage = {
      id: '1',
      senderId: '2',
      receiverId: user.id,
      content: 'Bonjour, je suis intéressé par votre logement',
      isRead: false,
      createdAt: new Date(),
      sender: { firstName: 'Jean', lastName: 'Dupont' },
      receiver: { firstName: user.firstName, lastName: user.lastName },
    };

    return [
      {
        id: '1',
        participants: [
          {
            id: '2',
            email: 'proprietaire@example.com',
            firstName: 'Jean',
            lastName: 'Dupont',
            phone: '+261320123456',
            userType: 'owner',
            isVerified: true,
            preferences: [],
            bio: 'Propriétaire sérieux',
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ],
        lastMessage: lastMessage,
        unreadCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
  }, [user]);

  const sendMessage = async (receiverId: string, content: string): Promise<void> => {
    if (!user) {
      toast.error('Vous devez être connecté pour envoyer un message');
      return;
    }

    setLoading(true);
    try {
      // Simulation d'envoi
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newMessage: Message = {
        id: Date.now().toString(),
        conversationId: '1',
        senderId: user.id,
        receiverId,
        content,
        isRead: false,
        createdAt: new Date(),
        sender: { firstName: user.firstName, lastName: user.lastName },
        receiver: { firstName: 'Destinataire', lastName: 'Test' },
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Mettre à jour la dernière conversation (sans conversationId dans lastMessage)
      const lastMessageWithoutConvId = {
        id: newMessage.id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        content: newMessage.content,
        isRead: newMessage.isRead,
        createdAt: newMessage.createdAt,
        sender: newMessage.sender,
        receiver: newMessage.receiver,
      };
      
      setConversations(prev => prev.map(conv => 
        conv.id === '1' ? {
          ...conv,
          lastMessage: lastMessageWithoutConvId,
          updatedAt: new Date(),
          unreadCount: conv.unreadCount + 1
        } : conv
      ));
      
      toast.success('Message envoyé !');
    } catch (error: any) {
      toast.error('Erreur lors de l\'envoi du message');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string): Promise<void> => {
    setLoading(true);
    try {
      // Simulation de mise à jour
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
      
      // Mettre à jour le compteur de messages non lus
      setConversations(prev => prev.map(conv => ({
        ...conv,
        unreadCount: Math.max(0, conv.unreadCount - 1)
      })));
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour');
      throw error;
    } finally {
      setLoading(false);
    }
  };

   const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      return getMockMessagesForMethod().filter(msg => msg.conversationId === conversationId);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des messages');
      return [];
    }
  };

  const refreshConversations = () => {
    if (user) {
      setConversations(getMockConversationsForMethod());
    }
  };

  const refreshMessages = () => {
    if (user) {
      setMessages(getMockMessagesForMethod());
    }
  };

  const value: MessageContextType = {
    conversations,
    messages,
    sendMessage,
    markAsRead,
    getConversationMessages,
    refreshConversations,
    refreshMessages,
    loading,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};