const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { sendResponse, sendError } = require('../utils/response');
const { verifyJWT } = require('../utils/auth');
const { sendAdminNotification } = require('../utils/adminNotifier');

const prisma = new PrismaClient();

// Get all announcements
router.get('/get_all', async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
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
    console.error('Get all announcements error:', error);
    return sendError(res, 'Erreur lors de la récupération des annonces: ' + error.message, 500);
  }
});

// Get announcement by ID
router.get('/get_by_id/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!announcement) {
      return sendError(res, 'Annonce non trouvée', 404);
    }

    const formattedAnnouncement = {
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
    };

    return sendResponse(res, formattedAnnouncement);
  } catch (error) {
    console.error('Get announcement by ID error:', error);
    return sendError(res, 'Erreur lors de la récupération de l\'annonce: ' + error.message, 500);
  }
});

// Get announcements by user
router.get('/get_by_user', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const announcements = await prisma.announcement.findMany({
      where: {
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
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
    console.error('Get announcements by user error:', error);
    return sendError(res, 'Erreur lors de la récupération des annonces: ' + error.message, 500);
  }
});

// Create announcement
router.post('/create', verifyJWT, async (req, res) => {
  try {
    const { content, images, contact } = req.body;

    if (!content) {
      return sendError(res, 'Le contenu est requis', 400);
    }

    const announcement = await prisma.announcement.create({
      data: {
        authorId: req.user.id,
        content,
        images: images ? JSON.stringify(images) : null,
        contact: contact || null
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    const formattedAnnouncement = {
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
    };
    await sendAdminNotification('announcement_created', { id: announcement.id, authorEmail: announcement.author?.email, authorName: `${announcement.author?.firstName || ''} ${announcement.author?.lastName || ''}` }).catch(() => {});
    return sendResponse(res, formattedAnnouncement, 'Annonce créée avec succès', 201);
  } catch (error) {
    console.error('Create announcement error:', error);
    return sendError(res, 'Erreur lors de la création de l\'annonce: ' + error.message, 500);
  }
});

// Update announcement
router.put('/update/:id', verifyJWT, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { content, images, contact } = req.body;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    if (!announcement) {
      return sendError(res, 'Annonce non trouvée', 404);
    }

    if (announcement.authorId !== req.user.id && req.user.userType !== 'admin') {
      return sendError(res, 'Vous n\'êtes pas autorisé à modifier cette annonce', 403);
    }

    const data = {};
    if (content) data.content = content;
    if (images) data.images = JSON.stringify(images);
    if (contact !== undefined) data.contact = contact;

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    const formattedAnnouncement = {
      ...updatedAnnouncement,
      id: updatedAnnouncement.id.toString(),
      authorId: updatedAnnouncement.authorId.toString(),
      images: updatedAnnouncement.images ? JSON.parse(updatedAnnouncement.images) : [],
      author: {
        ...updatedAnnouncement.author,
        id: updatedAnnouncement.author.id.toString()
      },
      createdAt: updatedAnnouncement.createdAt.toISOString(),
      updatedAt: updatedAnnouncement.updatedAt.toISOString()
    };

    await sendAdminNotification('announcement_updated', { id: updatedAnnouncement.id, authorEmail: updatedAnnouncement.author?.email, authorName: `${updatedAnnouncement.author?.firstName || ''} ${updatedAnnouncement.author?.lastName || ''}` }).catch(() => {});
    return sendResponse(res, formattedAnnouncement, 'Annonce mise à jour avec succès');
  } catch (error) {
    console.error('Update announcement error:', error);
    return sendError(res, 'Erreur lors de la mise à jour: ' + error.message, 500);
  }
});

// Delete announcement
router.delete('/delete/:id', verifyJWT, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    });

    if (!announcement) {
      return sendError(res, 'Annonce non trouvée', 404);
    }

    if (announcement.authorId !== req.user.id && req.user.userType !== 'admin') {
      return sendError(res, 'Vous n\'êtes pas autorisé à supprimer cette annonce', 403);
    }

    await prisma.announcement.delete({
      where: { id }
    });
    await sendAdminNotification('announcement_deleted', { id, authorEmail: announcement.author?.email, authorName: `${announcement.author?.firstName || ''} ${announcement.author?.lastName || ''}` }).catch(() => {});
    return sendResponse(res, null, 'Annonce supprimée avec succès');
  } catch (error) {
    console.error('Delete announcement error:', error);
    return sendError(res, 'Erreur lors de la suppression: ' + error.message, 500);
  }
});

module.exports = router;

