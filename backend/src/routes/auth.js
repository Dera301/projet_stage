const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { clerkClient } = require('@clerk/express');
const { sendResponse, sendError } = require('../utils/response');
const { verifyJWT } = require('../utils/auth');
const { sendAdminNotification } = require('../utils/adminNotifier');

const prisma = new PrismaClient();

// Register (with Clerk integration)
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, userType, university, studyLevel, budget } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone || !userType) {
      return sendError(res, 'Tous les champs requis doivent être remplis', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return sendError(res, 'Cet email est déjà utilisé', 400);
    }

    // Create user in Clerk (optional - skip if Clerk is not configured)
    let clerkUser = null;
    let clerkId = null;
    
    if (process.env.CLERK_SECRET_KEY) {
      try {
        clerkUser = await clerkClient.users.createUser({
          emailAddress: [email],
          password,
          firstName,
          lastName,
          publicMetadata: {
            userType,
            phone
          }
        });
        clerkId = clerkUser.id;
      } catch (clerkError) {
        console.error('Clerk error (continuing without Clerk):', clerkError);
        // Continue without Clerk - not critical for registration
      }
    }

    // Hash password for database (backup)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate activation deadline (24 hours from now)
    const accountActivationDeadline = new Date();
    accountActivationDeadline.setHours(accountActivationDeadline.getHours() + 24);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        userType,
        university: university || null,
        studyLevel: studyLevel || null,
        budget: budget ? parseFloat(budget) : null,
        clerkId: clerkId,
        isVerified: false,
        accountActivationDeadline
      },
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
        isVerified: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    await sendAdminNotification('user_registered', { id: user.id, email: user.email, name: `${user.firstName} ${user.lastName}`, userType: user.userType }).catch(() => {});
    return sendResponse(res, {
      user,
      token
    }, 'Compte créé avec succès', 201);
  } catch (error) {
    console.error('Register error:', error);
    return sendError(res, 'Erreur lors de l\'inscription: ' + error.message, 500);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email et mot de passe requis', 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return sendError(res, 'Utilisateur non trouvé', 404);
    }

    // Verify password
    if (user.password) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return sendError(res, 'Mot de passe incorrect', 401);
      }
    } else {
      // If no password, try to verify with Clerk
      try {
        // Attempt to authenticate with Clerk
        // Note: This is a simplified version - in production, you'd use Clerk's authentication
        return sendError(res, 'Authentification requise via Clerk', 401);
      } catch (clerkError) {
        return sendError(res, 'Mot de passe incorrect', 401);
      }
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return sendResponse(res, {
      user: userWithoutPassword,
      token
    }, 'Connexion réussie');
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Erreur lors de la connexion: ' + error.message, 500);
  }
});

// Get current user
router.get('/me', verifyJWT, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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

    if (!user) {
      return sendError(res, 'Utilisateur non trouvé', 404);
    }

    return sendResponse(res, user);
  } catch (error) {
    console.error('Me error:', error);
    return sendError(res, 'Erreur lors de la récupération du profil: ' + error.message, 500);
  }
});

// Logout
router.post('/logout', (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  // With Clerk, you might want to revoke the session
  return sendResponse(res, null, 'Déconnexion réussie');
});

// Verify CIN
router.post('/verify_cin', verifyJWT, async (req, res) => {
  try {
    const { cinNumber, cinRectoImagePath, cinVersoImagePath, cinData } = req.body;
    const userId = req.user.id;

    if (!cinNumber) {
      return sendError(res, 'Numéro CIN requis', 400);
    }

    // Update user with CIN information
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        cinNumber,
        cinRectoImagePath: cinRectoImagePath || null,
        cinVersoImagePath: cinVersoImagePath || null,
        cinData: cinData ? JSON.stringify(cinData) : null,
        cinVerified: false, // Will be verified by admin
        cinVerificationRequestedAt: new Date()
      }
    });

    await sendAdminNotification('cin_verification_requested', { userId: user.id, email: user.email, name: `${user.firstName || ''} ${user.lastName || ''}`, cinNumber: user.cinNumber }).catch(() => {});
    return sendResponse(res, {
      userId: user.id,
      cinNumber: user.cinNumber,
      cinVerified: user.cinVerified
    }, 'Vérification CIN soumise avec succès');
  } catch (error) {
    console.error('Verify CIN error:', error);
    return sendError(res, 'Erreur lors de la vérification CIN: ' + error.message, 500);
  }
});

module.exports = router;

