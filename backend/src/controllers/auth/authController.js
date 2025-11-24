const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../../services/emailService');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Générer un code de vérification
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Inscription d'un nouvel utilisateur
const register = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      userType, 
      university, 
      studyLevel, 
      budget,
      avatar
    } = req.body;
    
    console.log('Tentative d\'inscription avec les données:', {
      email,
      firstName,
      lastName,
      userType,
      hasPassword: !!password
    });

    // Validation des champs requis
    if (!email || !password || !firstName || !lastName || !phone || !userType) {
      return res.status(400).json({ 
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true, isVerified: true }
    });
    
    if (existingUser) {
      // Si l'utilisateur existe mais n'est pas vérifié, on peut lui renvoyer un code
      if (!existingUser.isVerified) {
        return res.status(400).json({ 
          success: false,
          message: 'Un compte existe déjà avec cet email mais n\'est pas encore vérifié. Veuillez vérifier votre boîte mail ou demander un nouveau code de vérification.'
        });
      }
      return res.status(400).json({ 
        success: false,
        message: 'Un compte avec cet email existe déjà' 
      });
    }

    // Vérifier si une inscription est déjà en attente
    const existingPending = await prisma.pendingRegistration.findUnique({
      where: { email },
      select: { id: true }
    });

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // Expire dans 24h

    const normalizedUserType = (userType || 'student').toLowerCase();
    const isStudent = normalizedUserType === 'student';
    const numericBudget = isStudent && budget !== undefined && budget !== null
      ? Number(budget)
      : null;

    // Créer ou mettre à jour l'inscription en attente
    const pendingRegistration = await prisma.pendingRegistration.upsert({
      where: { email },
      create: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        phone,
        userType: normalizedUserType,
        university: isStudent ? university : null,
        studyLevel: isStudent ? studyLevel : null,
        budget: numericBudget,
        avatar: avatar || null,
        verificationCode,
        verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h d'expiration
      },
      update: {
        passwordHash: hashedPassword,
        firstName,
        lastName,
        phone,
        userType: normalizedUserType,
        university: isStudent ? university : null,
        studyLevel: isStudent ? studyLevel : null,
        budget: numericBudget,
        avatar: avatar || null,
        verificationCode,
        verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h d'expiration
        attempts: 0
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        verificationExpires: true
      }
    });

    try {
      // Envoyer l'email de vérification
      await emailService.sendVerificationEmail(email, {
        name: firstName,
        code: verificationCode
      });
      console.log(`Email de vérification envoyé à ${email} avec le code: ${verificationCode}`);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', emailError);
      // En mode développement, retourner le code directement pour faciliter les tests
      if (process.env.NODE_ENV === 'development') {
        console.warn('En mode développement, le code de vérification est:', verificationCode);
      }
      // Ne pas échouer l'inscription à cause d'une erreur d'email
    }

    // En mode développement, inclure le code de vérification dans la réponse
    const response = {
      success: true,
      message: 'Un code de vérification a été envoyé à votre adresse email',
      pendingId: pendingRegistration.id,
      email: pendingRegistration.email,
      requiresVerification: true,
      expiresAt: pendingRegistration.verificationExpires,
      existingPending: !!existingPending
    };

    // En mode développement, inclure le code de vérification dans la réponse
    if (process.env.NODE_ENV === 'development') {
      response.verificationCode = verificationCode;
      console.log('Code de vérification (développement uniquement):', verificationCode);
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Connexion de l'utilisateur
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        phone: true,
        userType: true,
        isVerified: true,
        status: true,
        verificationCode: true,
        verificationExpires: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérifier si le compte est vérifié
    if (!user.isVerified) {
      // Si le code de vérification a expiré, en générer un nouveau
      const now = new Date();
      let verificationCode = user.verificationCode;
      let verificationExpires = user.verificationExpires;
      let shouldUpdateUser = false;

      if (!verificationCode || new Date(verificationExpires) < now) {
        verificationCode = generateVerificationCode();
        verificationExpires = new Date();
        verificationExpires.setHours(verificationExpires.getHours() + 24); // Expire dans 24h
        shouldUpdateUser = true;
      }

      // Mettre à jour l'utilisateur si nécessaire
      if (shouldUpdateUser) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            verificationCode,
            verificationExpires
          }
        });

        // Envoyer le nouvel email de vérification
        try {
          await emailService.sendVerificationEmail(user.email, {
            name: user.firstName,
            code: verificationCode
          });
        } catch (emailError) {
          console.error('Erreur lors de l\'envoi de l\'email de vérification:', emailError);
        }
      }

      return res.status(403).json({
        success: false,
        message: 'Veuillez vérifier votre adresse email avant de vous connecter. Un code de vérification vous a été envoyé par email.',
        requiresVerification: true,
        userId: user.id,
        email: user.email,
        codeSent: shouldUpdateUser
      });
    }

    // Vérifier si le compte est approuvé
    if (user.status && user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Votre compte est en attente de validation par un administrateur',
        requiresApproval: true,
        userId: user.id,
        email: user.email
      });
    }

    // Créer le token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        userType: user.userType
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Ne pas renvoyer le mot de passe
    const { password: _, verificationCode: vc, verificationExpires: ve, ...userWithoutSensitiveData } = user;

    // Mettre à jour la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: userWithoutSensitiveData
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la connexion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Vérification de l'email
const verifyEmail = async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID utilisateur et code sont requis' 
      });
    }

    // Vérifier si l'utilisateur existe et n'est pas encore vérifié
    const user = await prisma.user.findUnique({
      where: { 
        id: parseInt(userId),
        isVerified: false
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        verificationCode: true,
        verificationExpires: true
      }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Utilisateur non trouvé ou déjà vérifié' 
      });
    }

    // Vérifier si le code correspond et n'est pas expiré
    const now = new Date();
    if (user.verificationCode !== code || new Date(user.verificationExpires) < now) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code de vérification invalide ou expiré' 
      });
    }

    // Mettre à jour l'utilisateur comme vérifié
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        isVerified: true,
        status: 'PENDING_APPROVAL', // Mettre le statut en attente d'approbation
        verificationCode: null,
        verificationExpires: null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        status: true
      }
    });

    // Envoyer un email de confirmation
    try {
      await emailService.sendVerificationSuccessEmail(user.email, {
        name: user.firstName
      });

      // Notifier l'administrateur de la nouvelle inscription
      await emailService.notifyAdminNewRegistration(updatedUser);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi des notifications par email:', emailError);
      // Ne pas échouer la vérification à cause d'une erreur d'email
    }

    res.json({ 
      success: true, 
      message: 'Email vérifié avec succès. Votre compte est en attente de validation par un administrateur.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors de la vérification de l\'email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Renvoyer le code de vérification
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'L\'adresse email est requise' 
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        isVerified: true,
        verificationCode: true,
        verificationExpires: true
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aucun compte trouvé avec cette adresse email' 
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ce compte est déjà vérifié' 
      });
    }

    // Générer un nouveau code de vérification
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // Expire dans 24h

    // Mettre à jour le code de vérification de l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationExpires
      }
    });

    // Envoyer l'email de vérification
    try {
      await emailService.sendVerificationEmail(user.email, {
        name: user.firstName,
        code: verificationCode
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', emailError);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de l\'envoi de l\'email de vérification' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Un nouveau code de vérification a été envoyé à votre adresse email',
      email: user.email
    });
  } catch (error) {
    console.error('Erreur lors du renvoi du code de vérification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors du renvoi du code de vérification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Vérifier l'état d'authentification
const me = async (req, res) => {
  try {
    // Récupérer l'utilisateur depuis la base de données pour avoir les informations à jour
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        userType: true,
        isVerified: true,
        status: true,
        university: true,
        studyLevel: true,
        budget: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
    }

    // Ne pas renvoyer le mot de passe dans la réponse
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de l\'authentification',
      error: error.message
    });
  }
};

// Déconnexion (gérée côté client en supprimant le token)
const logout = (req, res) => {
  res.json({ success: true, message: 'Déconnexion réussie' });
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerificationCode,
  me,
  logout
};
