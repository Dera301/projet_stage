const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { sendResponse, sendError } = require('../utils/response');
const { verifyJWT } = require('../utils/auth');
const { sendAdminNotification } = require('../utils/adminNotifier');

const prisma = new PrismaClient();

// Update user profile
router.put('/update_profile', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Prepare update data
    const data = {};
    if (updateData.firstName) data.firstName = updateData.firstName;
    if (updateData.lastName) data.lastName = updateData.lastName;
    if (updateData.phone) data.phone = updateData.phone;
    if (updateData.university) data.university = updateData.university;
    if (updateData.studyLevel) data.studyLevel = updateData.studyLevel;
    if (updateData.bio) data.bio = updateData.bio;
    if (updateData.avatar) data.avatar = updateData.avatar;
    if (updateData.budget !== undefined) data.budget = updateData.budget ? parseFloat(updateData.budget) : null;

    // Update password if provided
    if (updateData.password) {
      data.password = await bcrypt.hash(updateData.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        userType: true,
        university: true,
        studyLevel: true,
        budget: true,
        bio: true,
        avatar: true,
        isVerified: true,
        cinVerified: true,
        cinNumber: true,
        cinData: true,
        cinRectoImagePath: true,
        cinVersoImagePath: true,
        cinVerifiedAt: true,
        cinVerificationRequestedAt: true,
        accountActivationDeadline: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await sendAdminNotification('profile_updated', { id: user.id, email: user.email, name: `${user.firstName || ''} ${user.lastName || ''}`, updatedFields: Object.keys(data) }).catch(() => {});
    return sendResponse(res, {
      ...user,
      id: user.id.toString(),
      budget: user.budget ? parseFloat(user.budget) : null,
      cinData: user.cinData ? JSON.parse(user.cinData) : null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      accountActivationDeadline: user.accountActivationDeadline ? user.accountActivationDeadline.toISOString() : null,
      cinVerifiedAt: user.cinVerifiedAt ? user.cinVerifiedAt.toISOString() : null,
      cinVerificationRequestedAt: user.cinVerificationRequestedAt ? user.cinVerificationRequestedAt.toISOString() : null
    }, 'Profil mis à jour avec succès');
  } catch (error) {
    console.error('Update profile error:', error);
    return sendError(res, 'Erreur lors de la mise à jour du profil: ' + error.message, 500);
  }
});

// Update current user profile (alias)
router.put('/me', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const data = {};
    if (updateData.firstName) data.firstName = updateData.firstName;
    if (updateData.lastName) data.lastName = updateData.lastName;
    if (updateData.phone) data.phone = updateData.phone;
    if (updateData.university) data.university = updateData.university;
    if (updateData.studyLevel) data.studyLevel = updateData.studyLevel;
    if (updateData.bio) data.bio = updateData.bio;
    if (updateData.avatar) data.avatar = updateData.avatar;
    if (updateData.budget !== undefined) data.budget = updateData.budget ? parseFloat(updateData.budget) : null;

    if (updateData.password) {
      data.password = await bcrypt.hash(updateData.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        userType: true,
        university: true,
        studyLevel: true,
        budget: true,
        bio: true,
        avatar: true,
        isVerified: true,
        cinVerified: true,
        cinNumber: true,
        cinData: true,
        cinRectoImagePath: true,
        cinVersoImagePath: true,
        cinVerifiedAt: true,
        cinVerificationRequestedAt: true,
        accountActivationDeadline: true,
        createdAt: true,
        updatedAt: true
      }
    });
    await sendAdminNotification('profile_updated', { id: user.id, email: user.email, name: `${user.firstName || ''} ${user.lastName || ''}`, updatedFields: Object.keys(data) }).catch(() => {});
    return sendResponse(res, {
      ...user,
      id: user.id.toString(),
      budget: user.budget ? parseFloat(user.budget) : null,
      cinData: user.cinData ? JSON.parse(user.cinData) : null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      accountActivationDeadline: user.accountActivationDeadline ? user.accountActivationDeadline.toISOString() : null,
      cinVerifiedAt: user.cinVerifiedAt ? user.cinVerifiedAt.toISOString() : null,
      cinVerificationRequestedAt: user.cinVerificationRequestedAt ? user.cinVerificationRequestedAt.toISOString() : null
    }, 'Profil mis à jour avec succès');
  } catch (error) {
    console.error('Update profile (me) error:', error);
    return sendError(res, 'Erreur lors de la mise à jour du profil: ' + error.message, 500);
  }
});

module.exports = router;

