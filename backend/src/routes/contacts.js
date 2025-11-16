const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { sendResponse, sendError } = require('../utils/response');

const prisma = new PrismaClient();

// Send contact message
router.post('/send', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return sendError(res, 'Tous les champs sont requis', 400);
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message
      }
    });

    return sendResponse(res, {
      id: contactMessage.id.toString(),
      name: contactMessage.name,
      email: contactMessage.email,
      subject: contactMessage.subject,
      message: contactMessage.message,
      createdAt: contactMessage.createdAt.toISOString()
    }, 'Message envoyé avec succès', 201);
  } catch (error) {
    console.error('Send contact message error:', error);
    return sendError(res, 'Erreur lors de l\'envoi du message: ' + error.message, 500);
  }
});

module.exports = router;

