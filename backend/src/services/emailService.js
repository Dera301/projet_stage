const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Générer un code de vérification
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Envoie un email de vérification à un nouvel utilisateur
 * @param {string} to - Adresse email du destinataire
 * @param {Object} data - Données de l'utilisateur
 * @param {string} data.name - Nom de l'utilisateur
 * @param {string} data.code - Code de vérification
 * @returns {Promise<void>}
 */
const sendVerificationEmail = async (to, { name, code }) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Équipe Colocation'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to,
      subject: 'Vérifiez votre adresse email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #4a6cf7;">Vérification d'email</h2>
          </div>
          <p>Bonjour ${name},</p>
          <p>Merci de vous être inscrit sur notre plateforme. Pour activer votre compte, veuillez utiliser le code de vérification suivant :</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 25px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; border-radius: 4px;">
            ${code}
          </div>
          
          <p>Ce code est valable pendant 24 heures.</p>
          <p>Si vous n'avez pas créé de compte, veuillez ignorer cet email.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777;">
            <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de vérification envoyé à ${to}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
    throw new Error('Échec de l\'envoi de l\'email de vérification');
  }
};

/**
 * Envoie un email de confirmation de vérification
 * @param {string} to - Adresse email du destinataire
 * @param {Object} data - Données de l'utilisateur
 * @param {string} data.name - Nom de l'utilisateur
 * @returns {Promise<void>}
 */
const sendVerificationSuccessEmail = async (to, { name }) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Équipe Colocation'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to,
      subject: 'Email vérifié avec succès',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #4a6cf7;">Email vérifié avec succès !</h2>
          </div>
          <p>Félicitations ${name} !</p>
          <p>Votre adresse email a été vérifiée avec succès. Votre compte est maintenant en attente de validation par un administrateur.</p>
          <p>Vous recevrez un email une fois votre compte approuvé.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777;">
            <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de confirmation envoyé à ${to}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
    throw new Error('Échec de l\'envoi de l\'email de confirmation');
  }
};

/**
 * Notifie l'administrateur d'une nouvelle inscription
 * @param {Object} user - Données de l'utilisateur
 * @returns {Promise<void>}
 */
const notifyAdminNewRegistration = async (user) => {
  if (!process.env.ADMIN_EMAIL) {
    console.warn('Aucun email administrateur configuré. Impossible d\'envoyer la notification.');
    return;
  }

  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Système de notification'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: 'Nouvelle inscription à valider',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Nouvelle inscription nécessitant une validation</h2>
          <p>Un nouvel utilisateur s'est inscrit et attend votre validation :</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4a6cf7; margin: 15px 0;">
            <p><strong>Nom :</strong> ${user.firstName} ${user.lastName || ''}</p>
            <p><strong>Email :</strong> ${user.email}</p>
            <p><strong>Type de compte :</strong> ${user.userType}</p>
            <p><strong>Date d'inscription :</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>Veuillez vous connecter à l'interface d'administration pour valider ou rejeter cette inscription.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777;">
            <p>Ceci est une notification automatique, merci de ne pas y répondre.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Notification d\'inscription envoyée à l\'administrateur');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification à l\'administrateur:', error);
    throw new Error('Échec de l\'envoi de la notification à l\'administrateur');
  }
};

/**
 * Envoie une notification d'action administrative à un utilisateur
 * @param {string} to - Adresse email du destinataire
 * @param {Object} data - Données de la notification
 * @param {string} data.name - Nom de l'utilisateur
 * @param {string} data.action - Action effectuée par l'administrateur
 * @param {string} data.message - Détails du message
 * @returns {Promise<void>}
 */
const sendAdminActionNotification = async (to, { name, action, message }) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Équipe Colocation'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to,
      subject: `Mise à jour de votre compte - ${action}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #4a6cf7;">${action}</h2>
          </div>
          <p>Bonjour ${name},</p>
          <p>L'administrateur a effectué l'action suivante sur votre compte :</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #4a6cf7;">
            ${message}
          </div>
          
          <p>Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter dès que possible.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777;">
            <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Notification d'action administrative envoyée à ${to}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification d\'action administrative:', error);
    throw new Error('Échec de l\'envoi de la notification d\'action administrative');
  }
};

module.exports = {
  sendVerificationEmail,
  sendVerificationSuccessEmail,
  notifyAdminNewRegistration,
  sendAdminActionNotification
};
