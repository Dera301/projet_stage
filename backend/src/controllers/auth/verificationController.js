const { PrismaClient } = require('@prisma/client');
const emailService = require('../../services/emailService');
const prisma = new PrismaClient();

/**
 * Vérifie un code de vérification
 * @route POST /api/auth/verify
 * @access Public
 */
const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const verifyCode = async (req, res) => {
  try {
    const { registrationId, userId, code } = req.body;

    if ((!registrationId && !userId) || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Identifiant d\'inscription et code sont requis' 
      });
    }

    // Nouveau flux : vérifier une inscription en attente
    if (registrationId) {
      const pendingId = parseInt(registrationId, 10);
      const pending = await prisma.pendingRegistration.findUnique({
        where: { id: pendingId }
      });

      if (!pending) {
        return res.status(400).json({
          success: false,
          message: 'Inscription en attente introuvable ou déjà utilisée'
        });
      }

      const now = new Date();
      if (pending.verificationCode !== code || new Date(pending.verificationExpires) < now) {
        return res.status(400).json({
          success: false,
          message: 'Code de vérification invalide ou expiré'
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: pending.email },
        select: { id: true }
      });

      if (existingUser) {
        await prisma.pendingRegistration.delete({ where: { id: pending.id } }).catch(() => {});
        return res.status(409).json({
          success: false,
          message: 'Ce compte a déjà été créé. Veuillez vous connecter.'
        });
      }

      const createdUser = await prisma.$transaction(async (tx) => {
        // Vérifier à nouveau si l'utilisateur existe déjà (double vérification)
        const existingUser = await tx.user.findUnique({
          where: { email: pending.email },
          select: { id: true }
        });

        if (existingUser) {
          await tx.pendingRegistration.delete({ where: { id: pending.id } }).catch(() => {});
          throw new Error('Un compte existe déjà avec cet email');
        }

        // Créer l'utilisateur avec le statut PENDING_VERIFICATION par défaut
        const newUser = await tx.user.create({
          data: {
            email: pending.email,
            password: pending.passwordHash,
            firstName: pending.firstName,
            lastName: pending.lastName,
            phone: pending.phone,
            userType: pending.userType,
            university: pending.userType === 'student' ? pending.university : null,
            studyLevel: pending.userType === 'student' ? pending.studyLevel : null,
            budget: pending.userType === 'student' ? pending.budget : null,
            avatar: pending.avatar,
            isVerified: true,
            verificationCode: null,
            verificationExpires: null,
            status: 'PENDING_VERIFICATION', // Statut initial
            lastLogin: new Date()
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            userType: true,
            status: true,
            isVerified: true,
            createdAt: true
          }
        });

        // Supprimer l'inscription en attente
        await tx.pendingRegistration.delete({ where: { id: pending.id } });
        
        return newUser;
      });

      try {
        await emailService.sendVerificationSuccessEmail(createdUser.email, {
          name: createdUser.firstName
        });
        await emailService.notifyAdminNewRegistration(createdUser);
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi des emails post-vérification:', emailError);
      }

      return res.status(200).json({
        success: true,
        message: 'Email vérifié avec succès. Votre compte est en attente de validation par un administrateur.',
        user: createdUser
      });
    }

    // Ancien flux basé sur l'utilisateur existant (pour rétrocompatibilité)
    const legacyUserId = parseInt(userId, 10);
    if (isNaN(legacyUserId)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }

    const user = await prisma.user.findUnique({
      where: { 
        id: legacyUserId,
        isVerified: false
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        verificationCode: true,
        verificationExpires: true,
        status: true,
        userType: true,
        password: true
      }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Utilisateur non trouvé ou déjà vérifié' 
      });
    }

    const now = new Date();
    if (user.verificationCode !== code || new Date(user.verificationExpires) < now) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code de vérification invalide ou expiré' 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        isVerified: true,
        status: 'PENDING_VERIFICATION', // Mettre à jour le statut
        verificationCode: null,
        verificationExpires: null,
        lastLogin: new Date() // Mettre à jour la dernière connexion
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        status: true,
        isVerified: true
      }
    });

    await emailService.sendVerificationSuccessEmail(user.email, {
      name: user.firstName
    });
    await emailService.notifyAdminNewRegistration({
      ...updatedUser,
      email: user.email
    });

    res.status(200).json({ 
      success: true, 
      message: 'Email vérifié avec succès. Votre compte est en attente de validation par un administrateur.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du code :', error);
    res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors de la vérification du code' 
    });
  }
};

/**
 * Renvoie un nouveau code de vérification
 * @route POST /api/auth/resend-verification
 * @access Public
 */
const resendVerificationCode = async (req, res) => {
  try {
    const { registrationId, email } = req.body;

    if (!registrationId && !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'L\'identifiant d\'inscription ou l\'email est requis' 
      });
    }

    let pending = null;
    if (registrationId) {
      pending = await prisma.pendingRegistration.findUnique({
        where: { id: parseInt(registrationId, 10) }
      });
    }

    if (!pending && email) {
      pending = await prisma.pendingRegistration.findUnique({
        where: { email }
      });
    }

    if (pending) {
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await prisma.pendingRegistration.update({
        where: { id: pending.id },
        data: {
          verificationCode,
          verificationExpires: expiresAt,
          attempts: 0
        }
      });

      await emailService.sendVerificationEmail(pending.email, {
        name: pending.firstName,
        code: verificationCode
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Un nouveau code de vérification a été envoyé à votre adresse email',
        pendingId: pending.id
      });
    }

    // Compatibilité : reprise sur un utilisateur existant non vérifié
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Inscription en attente introuvable'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        isVerified: true
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

    const verificationCode = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationExpires: expiresAt
      }
    });

    await emailService.sendVerificationEmail(user.email, {
      name: user.firstName,
      code: verificationCode
    });

    res.status(200).json({ 
      success: true, 
      message: 'Un nouveau code de vérification a été envoyé à votre adresse email' 
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du code de vérification :', error);
    res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors de l\'envoi du code de vérification' 
    });
  }
};

module.exports = {
  verifyCode,
  resendVerificationCode
};
