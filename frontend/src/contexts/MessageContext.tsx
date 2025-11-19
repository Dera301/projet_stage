import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Conversation, Message, MessageContextType } from '../types';
import { useAuth } from './AuthContext';
import { apiGet, apiJson } from '../config';
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

  // Charger les conversations depuis l'API
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await apiGet('/api/messages/conversations');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des conversations');
      }

      const data = await response.json();
      
      if (data.success) {
        const formattedConversations: Conversation[] = data.data.map((conv: any) => ({
          id: conv.id,
          participants: conv.participants,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
        }));
        
        setConversations(formattedConversations);
      }
    } catch (error: any) {
      console.error('Erreur chargement conversations:', error);
      toast.error('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Charger les messages d'une conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await apiGet(`/api/messages/conversation/${conversationId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des messages');
      }

      const data = await response.json();
      
      if (data.success) {
        const formattedMessages: Message[] = data.data.map((msg: any) => ({
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          content: msg.content,
          isRead: msg.isRead,
          createdAt: new Date(msg.createdAt),
          sender: msg.sender,
          receiver: msg.receiver,
        }));
        
        // Ajouter les nouveaux messages sans dupliquer
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMessages = formattedMessages.filter(msg => !existingIds.has(msg.id));
          return [...prev, ...newMessages];
        });
      }
    } catch (error: any) {
      console.error('Erreur chargement messages:', error);
      toast.error('Erreur lors du chargement des messages');
    }
  }, []);

  // Charger toutes les conversations au démarrage
  useEffect(() => {
    if (user) {
      fetchConversations();
    } else {
      setConversations([]);
      setMessages([]);
    }
  }, [user, fetchConversations]);


  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchConversations();
    }, 3000); // toutes les 3 secondes

    return () => clearInterval(interval);
  }, [user, fetchConversations]);

  // Fonction pour envoyer un message
  const sendMessage = async (receiverId: string, content: string): Promise<void> => {
    if (!user) {
      toast.error('Vous devez être connecté pour envoyer un message');
      return;
    }

    if (!content.trim()) {
      toast.error('Le message ne peut pas être vide');
      return;
    }

    setLoading(true);
    try {
      const response = await apiJson('/api/messages/send', 'POST', {
        receiverId,
        content: content.trim()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

      const data = await response.json();
      
      if (data.success) {
        const newMessage: Message = {
          id: data.data.id,
          conversationId: data.data.conversationId,
          senderId: data.data.senderId,
          receiverId: data.data.receiverId,
          content: data.data.content,
          isRead: data.data.isRead,
          createdAt: new Date(data.data.createdAt),
          sender: data.data.sender,
          receiver: data.data.receiver,
        };

        // Ajouter le message à la liste
        setMessages(prev => [...prev, newMessage]);
        setConversations(prev => {
          return prev.map(conv => 
            conv.id === newMessage.conversationId 
              ? { 
                  ...conv, 
                  lastMessage: newMessage, 
                  updatedAt: new Date(newMessage.createdAt),
                  unreadCount: 0 // ton propre message n'est jamais "non lu"
                }
              : conv
          );
        });


        // Mettre à jour les conversations
        await fetchConversations();
        
        toast.success('Message envoyé !');
      } else {
        throw new Error(data.message || 'Erreur lors de l\'envoi');
      }
    } catch (error: any) {
      console.error('Erreur envoi message:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi du message');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Marquer un message comme lu
  const markAsRead = async (messageId: string): Promise<void> => {
    try {
      const response = await apiJson(`/api/messages/markAsRead/${messageId}`, 'PUT');

      if (!response.ok) {
        throw new Error('Erreur lors du marquage comme lu');
      }

      const data = await response.json();
      
      if (data.success) {
        // Mettre à jour localement
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        ));
        
        // Recharger les conversations pour mettre à jour les compteurs
        await fetchConversations();
      }
    } catch (error: any) {
      console.error('Erreur marquage comme lu:', error);
      throw error;
    }
  };

  // Récupérer les messages d'une conversation
  const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const response = await apiGet(`/api/messages/conversation/${conversationId}`);
    if (response.status === 404) {
      return [];
    }
    if (!response.ok) throw new Error('Erreur lors du chargement des messages');
    
    const data = await response.json();
    if (!data.success) return [];

    const formattedMessages: Message[] = data.data.map((msg: any) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      content: msg.content,
      isRead: msg.isRead,
      createdAt: new Date(msg.createdAt),
      sender: msg.sender,
      receiver: msg.receiver,
    }));

    // Garder seulement les 50 derniers messages pour l'affichage
    const limitedMessages = formattedMessages.slice(-50);

    // Mettre à jour le cache local avec les 50 derniers messages
    setMessages(prev => {
      const existingIds = new Set(prev.map(m => m.id));
      const newMessages = limitedMessages.filter(msg => !existingIds.has(msg.id));
      return [...prev, ...newMessages];
    });

    return limitedMessages;
  } catch (error: any) {
    console.error('Erreur lors du chargement des messages:', error);
    return [];
  }
};


  // Rafraîchir les conversations
  const refreshConversations = async () => {
    await fetchConversations();
  };

  // Rafraîchir les messages
  const refreshMessages = async () => {
    // Recharger les messages pour toutes les conversations
    const promises = conversations.map(conv => fetchMessages(conv.id));
    await Promise.all(promises);
  };

  // Modifier un message (auteur uniquement)
  const editMessage = async (messageId: string, content: string): Promise<void> => {
    try {
      const res = await apiJson(`/api/messages/message/${messageId}`, 'PUT', { content });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur lors de la modification');

      setMessages(prev => prev.map((m: Message) => m.id === messageId ? { ...m, content: data.data.content } : m));
      // Mettre à jour la lastMessage de la conversation si concernée
      setConversations(prev => prev.map((c: Conversation) => c.lastMessage && c.lastMessage.id === messageId ? { ...c, lastMessage: { ...c.lastMessage, content: data.data.content } } as any : c));
      toast.success('Message modifié');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la modification du message');
      throw error;
    }
  };

  // Supprimer un message (auteur uniquement)
  const deleteMessage = async (messageId: string): Promise<void> => {
    try {
      const res = await apiJson(`/api/messages/message/${messageId}`, 'DELETE');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur lors de la suppression');

      setMessages(prev => prev.filter((m: Message) => m.id !== messageId));
      // Si c'était le dernier message, rafraîchir les conversations
      await fetchConversations();
      toast.success('Message supprimé');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression du message');
      throw error;
    }
  };

  // Supprimer une conversation (participant uniquement)
  const deleteConversation = async (conversationId: string): Promise<void> => {
    try {
      const res = await apiJson(`/api/messages/conversation/${conversationId}`, 'DELETE');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur lors de la suppression');

      setConversations(prev => prev.filter((c: Conversation) => c.id !== conversationId));
      setMessages(prev => prev.filter((m: Message) => m.conversationId !== conversationId));
      toast.success('Conversation supprimée');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression de la conversation');
      throw error;
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
    // Champs additionnels non typés dans MessageContextType original
    ...( { editMessage, deleteMessage, deleteConversation } as any )
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};