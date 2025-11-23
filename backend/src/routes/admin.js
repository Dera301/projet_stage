const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { sendResponse, sendError } = require('../utils/response');
const { verifyJWT, isAdmin } = require('../utils/auth');
const { sendAdminNotification } = require('../utils/adminNotifier');

const prisma = new PrismaClient();

// Helper function to send automatic message to user
const sendAutoMessage = async (userId, adminId, content) => {
  try {
    // Find or create conversation between admin and user
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: adminId, user2Id: userId },
          { user1Id: userId, user2Id: adminId }
        ]
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: adminId,
          user2Id: userId,
          unreadCount: 0
        }
      });
    } else {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      });
    }

    // Create message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: adminId,
        receiverId: userId,
        content,
        isRead: false
      }
    });

    // Increment unread count
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        unreadCount: {
          increment: 1
        }
      }
    });
  } catch (error) {
    console.error('Error sending auto message:', error);
    // Don't throw, just log the error
  }
};

// Public route to seed the first admin (only when no admin exists)
router.post('/seed_admin', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password || !firstName || !lastName || !phone) {
      return sendError(res, 'Tous les champs sont requis', 400);
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { userType: 'admin' }
    });

    // If an admin already exists, deny public seeding
    if (existingAdmin) {
      return sendError(res, 'Un administrateur existe déjà. Authentification requise.', 403);
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        userType: 'admin',
        isVerified: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true
      }
    });

    return sendResponse(
      res,
      { ...admin, id: admin.id.toString() },
      'Administrateur créé avec succès',
      201
    );
  } catch (error) {
    console.error('Seed admin error:', error);
    return sendError(res, 'Erreur lors de la création: ' + error.message, 500);
  }
});

// Apply admin middleware to all routes after public seeding route
router.use(verifyJWT);
router.use(isAdmin);

// Get all users
router.get('/users_list', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        userType: true,
        university: true,
        studyLevel: true,
        isVerified: true,
        cinVerified: true,
        cinNumber: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedUsers = users.map(user => ({
      ...user,
      id: user.id.toString(),
      createdAt: user.createdAt.toISOString()
    }));

    return sendResponse(res, formattedUsers);
  } catch (error) {
    console.error('Get users list error:', error);
    return sendError(res, 'Erreur lors de la récupération des utilisateurs: ' + error.message, 500);
  }
});

// Update user role
router.put('/user_update_role/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { userType } = req.body;

    if (!userType || !['student', 'owner', 'admin'].includes(userType)) {
      return sendError(res, 'Type d\'utilisateur invalide', 400);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { userType },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true
      }
    });

    return sendResponse(res, {
      ...user,
      id: user.id.toString()
    }, 'Rôle utilisateur mis à jour');
  } catch (error) {
    console.error('Update user role error:', error);
    return sendError(res, 'Erreur lors de la mise à jour: ' + error.message, 500);
  }
});

// Delete user
router.delete('/user_delete/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { reason } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    if (!user) {
      return sendError(res, 'Utilisateur non trouvé', 404);
    }

    // Envoyer un message avant suppression si une raison est fournie
    if (reason && reason.trim()) {
      const messageContent = `Bonjour ${user.firstName},\n\nVotre compte a été supprimé par un administrateur.\n\nRaison : ${reason}\n\nSi vous pensez qu'il s'agit d'une erreur, veuillez nous contacter.\n\nCordialement,\nL'équipe ColocAntananarivo`;
      await sendAutoMessage(user.id, req.user.id, messageContent);
    }

    await prisma.user.delete({
      where: { id }
    });

    return sendResponse(res, null, 'Utilisateur supprimé avec succès');
  } catch (error) {
    console.error('Delete user error:', error);
    return sendError(res, 'Erreur lors de la suppression: ' + error.message, 500);
  }
});

// Get all properties
router.get('/properties_list', async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedProperties = properties.map(property => ({
      ...property,
      id: property.id.toString(),
      ownerId: property.ownerId.toString(),
      price: parseFloat(property.price),
      deposit: parseFloat(property.deposit),
      latitude: property.latitude ? parseFloat(property.latitude) : null,
      longitude: property.longitude ? parseFloat(property.longitude) : null,
      images: property.images ? JSON.parse(property.images) : [],
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      owner: {
        ...property.owner,
        id: property.owner.id.toString()
      },
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString()
    }));

    return sendResponse(res, formattedProperties);
  } catch (error) {
    console.error('Get properties list error:', error);
    return sendError(res, 'Erreur lors de la récupération des propriétés: ' + error.message, 500);
  }
});

// Toggle property availability
router.put('/property_toggle_availability/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return sendError(res, 'Propriété non trouvée', 404);
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        isAvailable: !property.isAvailable
      }
    });

    return sendResponse(res, {
      id: updatedProperty.id.toString(),
      isAvailable: updatedProperty.isAvailable
    }, 'Disponibilité de la propriété mise à jour');
  } catch (error) {
    console.error('Toggle property availability error:', error);
    return sendError(res, 'Erreur lors de la mise à jour: ' + error.message, 500);
  }
});

// Get all announcements
router.get('/announcements_list', async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedAnnouncements = announcements.map(announcement => ({
      ...announcement,
      id: announcement.id.toString(),
      authorId: announcement.authorId.toString(),
      images: announcement.images ? JSON.parse(announcement.images) : [],
      author: {
        ...announcement.author,
        id: announcement.author.id.toString()
      },
      createdAt: announcement.createdAt.toISOString(),
      updatedAt: announcement.updatedAt.toISOString()
    }));

    return sendResponse(res, formattedAnnouncements);
  } catch (error) {
    console.error('Get announcements list error:', error);
    return sendError(res, 'Erreur lors de la récupération des annonces: ' + error.message, 500);
  }
});

// Delete announcement
router.delete('/announcement_delete/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.announcement.delete({
      where: { id }
    });

    return sendResponse(res, null, 'Annonce supprimée avec succès');
  } catch (error) {
    console.error('Delete announcement error:', error);
    return sendError(res, 'Erreur lors de la suppression: ' + error.message, 500);
  }
});

// Delete announcement with reason
router.delete('/announcement_delete_with_reason/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { reason } = req.body;
    const ann = await prisma.announcement.findUnique({
      where: { id },
      include: { author: { select: { id: true, firstName: true, lastName: true, email: true } } }
    });

    if (!ann) {
      return sendError(res, 'Annonce non trouvée', 404);
    }

    // Envoyer un message à l'auteur si une raison est fournie
    if (reason && reason.trim() && ann.author) {
      const messageContent = `Bonjour ${ann.author.firstName},\n\nVotre annonce a été supprimée par un administrateur.\n\nRaison : ${reason}\n\nSi vous pensez qu'il s'agit d'une erreur, veuillez nous contacter.\n\nCordialement,\nL'équipe ColocAntananarivo`;
      await sendAutoMessage(ann.author.id, req.user.id, messageContent);
    }

    await prisma.announcement.delete({ where: { id } });

    try {
      const { sendAdminNotification } = require('../utils/adminNotifier');
      await sendAdminNotification('announcement_deleted', { id, authorEmail: ann?.author?.email, authorName: `${ann?.author?.firstName || ''} ${ann?.author?.lastName || ''}` });
    } catch (_) {}

    console.log(`Announcement ${id} deleted with reason: ${reason}`);

    return sendResponse(res, null, 'Annonce supprimée avec succès');
  } catch (error) {
    console.error('Delete announcement with reason error:', error);
    return sendError(res, 'Erreur lors de la suppression: ' + error.message, 500);
  }
});

// Get CINs to verify
router.get('/cin_to_verify', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        cinVerificationRequestedAt: {
          not: null
        },
        cinVerified: false
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        cinNumber: true,
        cinData: true,
        cinRectoImagePath: true,
        cinVersoImagePath: true,
        cinVerificationRequestedAt: true
      },
      orderBy: {
        cinVerificationRequestedAt: 'desc'
      }
    });

    const formattedUsers = users.map(user => ({
      ...user,
      id: user.id.toString(),
      cinData: user.cinData ? JSON.parse(user.cinData) : null,
      cinVerificationRequestedAt: user.cinVerificationRequestedAt.toISOString()
    }));

    return sendResponse(res, formattedUsers);
  } catch (error) {
    console.error('Get CINs to verify error:', error);
    return sendError(res, 'Erreur lors de la récupération: ' + error.message, 500);
  }
});

// Verify CIN
router.put('/cin_verify/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { verified, reason } = req.body;

    const userBeforeUpdate = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    if (!userBeforeUpdate) {
      return sendError(res, 'Utilisateur non trouvé', 404);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        cinVerified: verified === true,
        cinVerifiedAt: verified === true ? new Date() : null,
        cinVerificationErrors: verified === false ? reason : null,
        isVerified: verified === true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        cinVerified: true,
        cinVerifiedAt: true
      }
    });

    // Envoyer un message automatique
    if (verified === false && reason && reason.trim()) {
      const messageContent = `Bonjour ${user.firstName},\n\nVotre demande de vérification de CIN a été rejetée.\n\nRaison : ${reason}\n\nVous pouvez soumettre une nouvelle demande avec des documents valides.\n\nCordialement,\nL'équipe ColocAntananarivo`;
      await sendAutoMessage(user.id, req.user.id, messageContent);
    } else if (verified === true) {
      const messageContent = `Bonjour ${user.firstName},\n\nFélicitations ! Votre CIN a été vérifiée avec succès.\n\nVotre compte est maintenant vérifié et vous pouvez utiliser toutes les fonctionnalités de la plateforme.\n\nCordialement,\nL'équipe ColocAntananarivo`;
      await sendAutoMessage(user.id, req.user.id, messageContent);
    }

    await sendAdminNotification('cin_verification_result', { id: user.id, email: user.email, name: `${user.firstName || ''} ${user.lastName || ''}`, verified: verified === true, reason }).catch(() => {});
    return sendResponse(res, {
      ...user,
      id: user.id.toString(),
      cinVerifiedAt: user.cinVerifiedAt ? user.cinVerifiedAt.toISOString() : null
    }, verified ? 'CIN vérifiée avec succès' : 'CIN rejetée');
  } catch (error) {
    console.error('Verify CIN error:', error);
    return sendError(res, 'Erreur lors de la vérification: ' + error.message, 500);
  }
});

// Get policy
router.get('/policy_get', async (req, res) => {
  try {
    // In a real app, you'd store this in a database
    // For now, return a default policy
    return sendResponse(res, {
      policy: 'Politique de confidentialité par défaut'
    });
  } catch (error) {
    console.error('Get policy error:', error);
    return sendError(res, 'Erreur lors de la récupération: ' + error.message, 500);
  }
});

// Set policy
router.put('/policy_set', async (req, res) => {
  try {
    const { policy } = req.body;

    // In a real app, you'd save this to a database
    // For now, just return success
    return sendResponse(res, {
      policy
    }, 'Politique mise à jour avec succès');
  } catch (error) {
    console.error('Set policy error:', error);
    return sendError(res, 'Erreur lors de la mise à jour: ' + error.message, 500);
  }
});

// (Protected) Seed admin endpoint retained for compatibility if needed later
// Requires authenticated admin after the middleware above
router.post('/seed_admin_protected', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password || !firstName || !lastName || !phone) {
      return sendError(res, 'Tous les champs sont requis', 400);
    }

    const existingAdmin = await prisma.user.findFirst({
      where: { userType: 'admin' }
    });

    if (existingAdmin) {
      return sendError(res, 'Un administrateur existe déjà', 400);
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        userType: 'admin',
        isVerified: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true
      }
    });

    return sendResponse(res, { ...admin, id: admin.id.toString() }, 'Administrateur créé avec succès', 201);
  } catch (error) {
    console.error('Seed admin (protected) error:', error);
    return sendError(res, 'Erreur lors de la création: ' + error.message, 500);
  }
});

module.exports = router;

