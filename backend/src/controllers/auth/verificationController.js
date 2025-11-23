const { PrismaClient } = require('@prisma/client');
const emailService = require('../../services/emailService');
const prisma = new PrismaClient();

/**
 * Vérifie un code de vérification
 * @route POST /api/auth/verify
 * @access Public
 */
const verifyCode = async (req, res) => {
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
        isVerified: false // Ne vérifier que les comptes non vérifiés
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        verificationCode: true,
        verificationExpires: true,
        isVerified: true,
        status: true,
        userType: true
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
        status: 'PENDING_APPROVAL' // Mettre le statut en attente d'approbation
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

    // Envoyer un email de confirmation de vérification
    await emailService.sendVerificationSuccessEmail(user.email, {
      name: user.firstName
    });

    // Notifier l'administrateur de la nouvelle inscription
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
        status: true
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
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expire dans 24 heures

    // Mettre à jour le code de vérification de l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationExpires: expiresAt
      }
    });

    // Envoyer l'email de vérification
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
