const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { sendResponse, sendError } = require('../utils/response');
const { verifyJWT } = require('../utils/auth');

const prisma = new PrismaClient();

// Send message
router.post('/send', verifyJWT, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content) {
      return sendError(res, 'Destinataire et contenu requis', 400);
    }

    const receiverIdInt = parseInt(receiverId);

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverIdInt }
    });


    if (!receiver) {
      return sendError(res, 'Destinataire non trouvé', 404);
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverIdInt },
          { user1Id: receiverIdInt, user2Id: senderId }
        ]
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: senderId,
          user2Id: receiverIdInt,
          unreadCount: 0
        }
      });
    } else {
      // Update conversation updatedAt
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        receiverId: receiverIdInt,
        content,
        isRead: false
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Increment unread count for receiver
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        unreadCount: {
          increment: 1
        }
      }
    });

    const formattedMessage = {
      ...message,
      id: message.id.toString(),
      conversationId: message.conversationId.toString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      sender: {
        ...message.sender,
        id: message.sender.id.toString()
      },
      receiver: {
        ...message.receiver,
        id: message.receiver.id.toString()
      },
      createdAt: message.createdAt.toISOString()
    };

    return sendResponse(res, formattedMessage, 'Message envoyé avec succès', 201);
  } catch (error) {
    console.error('Send message error:', error);
    return sendError(res, 'Erreur lors de l\'envoi du message: ' + error.message, 500);
  }
});

// Get conversations
router.get('/conversations', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const formattedConversations = conversations.map(conversation => {
      const otherUser = conversation.user1Id === userId ? conversation.user2 : conversation.user1;
      const lastMessage = conversation.messages[0] || null;

      return {
        id: conversation.id.toString(),
        participants: [
          {
            ...otherUser,
            id: otherUser.id.toString()
          }
        ],
        lastMessage: lastMessage ? {
          id: lastMessage.id.toString(),
          senderId: lastMessage.senderId.toString(),
          receiverId: lastMessage.receiverId.toString(),
          content: lastMessage.content,
          isRead: lastMessage.isRead,
          createdAt: lastMessage.createdAt.toISOString(),
          sender: {
            ...lastMessage.sender,
            id: lastMessage.sender.id.toString()
          }
        } : undefined,
        unreadCount: conversation.unreadCount,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString()
      };
    });

    return sendResponse(res, formattedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    return sendError(res, 'Erreur lors de la récupération des conversations: ' + error.message, 500);
  }
});

// Get messages for a conversation
router.get('/conversation/:conversationId', verifyJWT, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const userId = req.user.id;

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });

    if (!conversation) {
      return sendError(res, 'Conversation non trouvée', 404);
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const formattedMessages = messages.map(message => ({
      ...message,
      id: message.id.toString(),
      conversationId: message.conversationId.toString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      sender: {
        ...message.sender,
        id: message.sender.id.toString()
      },
      receiver: {
        ...message.receiver,
        id: message.receiver.id.toString()
      },
      createdAt: message.createdAt.toISOString()
    }));

    // Reset unread count
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 }
    });

    return sendResponse(res, formattedMessages);
  } catch (error) {
    console.error('Get conversation messages error:', error);
    return sendError(res, 'Erreur lors de la récupération des messages: ' + error.message, 500);
  }
});

// Get all messages (for current user)
router.get('/messages', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedMessages = messages.map(message => ({
      ...message,
      id: message.id.toString(),
      conversationId: message.conversationId.toString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      sender: {
        ...message.sender,
        id: message.sender.id.toString()
      },
      receiver: {
        ...message.receiver,
        id: message.receiver.id.toString()
      },
      createdAt: message.createdAt.toISOString()
    }));

    return sendResponse(res, formattedMessages);
  } catch (error) {
    console.error('Get messages error:', error);
    return sendError(res, 'Erreur lors de la récupération des messages: ' + error.message, 500);
  }
});

// Mark message as read
router.put('/markAsRead/:messageId', verifyJWT, async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: true
      }
    });

    if (!message) {
      return sendError(res, 'Message non trouvé', 404);
    }

    // Verify user is receiver
    if (message.receiverId !== userId) {
      return sendError(res, 'Vous n\'êtes pas autorisé à marquer ce message comme lu', 403);
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true }
    });

    // Decrement unread count if necessary
    if (message.conversation.unreadCount > 0) {
      await prisma.conversation.update({
        where: { id: message.conversationId },
        data: {
          unreadCount: {
            decrement: 1
          }
        }
      });
    }

    return sendResponse(res, null, 'Message marqué comme lu');
  } catch (error) {
    console.error('Mark as read error:', error);
    return sendError(res, 'Erreur lors du marquage du message: ' + error.message, 500);
  }
});

// Update a message (sender only)
router.put('/message/:messageId', verifyJWT, async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return sendError(res, 'Contenu requis', 400);
    }

    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) return sendError(res, 'Message non trouvé', 404);
    if (message.senderId !== userId) return sendError(res, 'Non autorisé', 403);

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { content: content.trim() }
    });

    return sendResponse(
      res,
      {
        ...updated,
        id: updated.id.toString(),
        conversationId: updated.conversationId.toString(),
        senderId: updated.senderId.toString(),
        receiverId: updated.receiverId.toString(),
        createdAt: updated.createdAt.toISOString()
      },
      'Message mis à jour'
    );
  } catch (error) {
    console.error('Update message error:', error);
    return sendError(res, 'Erreur lors de la mise à jour du message: ' + error.message, 500);
  }
});

// Delete a message (sender only)
router.delete('/message/:messageId', verifyJWT, async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const userId = req.user.id;

    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) return sendError(res, 'Message non trouvé', 404);
    if (message.senderId !== userId) return sendError(res, 'Non autorisé', 403);

    await prisma.message.delete({ where: { id: messageId } });

    return sendResponse(res, null, 'Message supprimé');
  } catch (error) {
    console.error('Delete message error:', error);
    return sendError(res, 'Erreur lors de la suppression du message: ' + error.message, 500);
  }
});

// Delete a conversation (participant only)
router.delete('/conversation/:conversationId', verifyJWT, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const userId = req.user.id;

    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) return sendError(res, 'Conversation non trouvée', 404);
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return sendError(res, 'Non autorisé', 403);
    }

    await prisma.message.deleteMany({ where: { conversationId } });
    await prisma.conversation.delete({ where: { id: conversationId } });

    return sendResponse(res, null, 'Conversation supprimée');
  } catch (error) {
    console.error('Delete conversation error:', error);
    return sendError(res, 'Erreur lors de la suppression de la conversation: ' + error.message, 500);
  }
});

module.exports = router;

