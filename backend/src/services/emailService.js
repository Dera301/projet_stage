const nodemailer = require('nodemailer');

// Configuration du transporteur SMTP avec gestion d'erreur améliorée
let transporter;

/**
 * Initialise le transporteur SMTP
 * @returns {import('nodemailer').Transporter|null} Instance du transporteur ou null en cas d'erreur
 */
const initTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('⚠️  Configuration SMTP incomplète. Les emails ne seront pas envoyés.');
    return null;
  }

  try {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        // Ne pas échouer sur des certificats auto-signés
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      },
      // Désactiver la vérification du certificat en développement
      // pour éviter les problèmes avec les certificats auto-signés
      ...(process.env.NODE_ENV !== 'production' && {
        tls: { rejectUnauthorized: false }
      })
    });
  } catch (error) {
    console.error('❌ Erreur lors de la création du transporteur SMTP:', error);
    return null;
  }
};

// Initialiser le transporteur au démarrage
transporter = initTransporter();

/**
 * Vérifie la configuration du service d'email
 * @returns {boolean} true si le service est correctement configuré
 */
const isEmailConfigured = () => {
  const isConfigured = !!transporter && 
                      !!process.env.EMAIL_FROM_ADDRESS && 
                      !!process.env.EMAIL_FROM_NAME;
  
  if (!isConfigured) {
    console.warn('⚠️  Configuration d\'email incomplète. Vérifiez vos variables d\'environnement.');
  }
  
  return isConfigured;
};

/**
 * Génère un code de vérification à 6 chiffres
 * @returns {string} Code de vérification
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Envoie un email de vérification à un nouvel utilisateur
 * @param {string} to - Adresse email du destinataire
 * @param {Object} data - Données de l'utilisateur
 * @param {string} data.name - Nom de l'utilisateur
 * @param {string} data.code - Code de vérification
 * @returns {Promise<{success: boolean, message: string}>}
 */
const sendVerificationEmail = async (to, { name, code }) => {
  if (!isEmailConfigured()) {
    console.warn(`📧 [Email simulé] Email de vérification pour ${to} (${name}): Code = ${code}`);
    return { success: true, message: 'Email de vérification simulé (mode développement)' };
  }

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Équipe Colocation'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
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

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email de vérification envoyé à ${to} (Message ID: ${info.messageId})`);
    return { 
      success: true, 
      message: 'Email de vérification envoyé avec succès',
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de vérification:', {
      to,
      error: error.message,
      stack: error.stack
    });
    
    // En mode développement, simuler l'envoi réussi
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  En mode développement, on simule un envoi réussi');
      return { 
        success: true, 
        message: 'Email de vérification simulé (erreur ignorée en développement)',
        debug: { error: error.message }
      };
    }
    
    throw new Error(`Échec de l'envoi de l'email de vérification: ${error.message}`);
  }
};

/**
 * Envoie un email de confirmation de vérification
 * @param {string} to - Adresse email du destinataire
 * @param {Object} data - Données de l'utilisateur
 * @param {string} data.name - Nom de l'utilisateur
 * @returns {Promise<{success: boolean, message: string}>}
 */
const sendVerificationSuccessEmail = async (to, { name }) => {
  if (!isEmailConfigured()) {
    console.warn(`📧 [Email simulé] Email de confirmation de vérification pour ${to} (${name})`);
    return { success: true, message: 'Email de confirmation simulé (mode développement)' };
  }

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Équipe Colocation'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
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
        
        <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 4px; border-left: 4px solid #4a6cf7;">
          <p><strong>Prochaine étape :</strong> Notre équipe va examiner votre inscription et vous serez notifié par email dès que votre compte sera activé.</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777;">
          <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email de confirmation de vérification envoyé à ${to} (Message ID: ${info.messageId})`);
    return { 
      success: true, 
      message: 'Email de confirmation envoyé avec succès',
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', {
      to,
      error: error.message,
      stack: error.stack
    });
    
    // En mode développement, simuler l'envoi réussi
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  En mode développement, on simule un envoi réussi');
      return { 
        success: true, 
        message: 'Email de confirmation simulé (erreur ignorée en développement)',
        debug: { error: error.message }
      };
    }
    
    throw new Error(`Échec de l'envoi de l'email de confirmation: ${error.message}`);
  }
};

/**
 * Notifie l'administrateur d'une nouvelle inscription
 * @param {Object} user - Données de l'utilisateur
 * @returns {Promise<{success: boolean, message: string}>}
 */
const notifyAdminNewRegistration = async (user) => {
  if (!process.env.ADMIN_EMAIL) {
    console.warn('⚠️ Aucun email administrateur configuré. Impossible d\'envoyer la notification.');
    return { success: false, message: 'Aucun email administrateur configuré' };
  }

  if (!isEmailConfigured()) {
    console.warn(`📧 [Email simulé] Notification d'inscription à l'admin pour ${user.email} (${user.firstName} ${user.lastName || ''})`);
    return { success: true, message: 'Notification admin simulée (mode développement)' };
  }

  const adminEmails = process.env.ADMIN_EMAIL.split(',').map(email => email.trim());
  const registrationDate = user.createdAt ? new Date(user.createdAt).toLocaleString() : new Date().toLocaleString();
  
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Système de notification'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: adminEmails,
    subject: `[Action Requise] Nouvelle inscription à valider - ${user.firstName} ${user.lastName || ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4a6cf7;">Nouvelle inscription nécessitant une validation</h2>
        </div>
        
        <p>Un nouvel utilisateur s'est inscrit et attend votre validation :</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #4a6cf7; margin: 15px 0; border-radius: 4px;">
          <p><strong>🔹 Nom complet :</strong> ${user.firstName} ${user.lastName || ''}</p>
          <p><strong>📧 Email :</strong> <a href="mailto:${user.email}">${user.email}</a></p>
          <p><strong>📱 Téléphone :</strong> ${user.phone || 'Non fourni'}</p>
          <p><strong>👤 Type de compte :</strong> ${user.userType || 'Non spécifié'}</p>
          ${user.university ? `<p><strong>🏫 Université :</strong> ${user.university}</p>` : ''}
          ${user.studyLevel ? `<p><strong>📚 Niveau d'études :</strong> ${user.studyLevel}</p>` : ''}
          <p><strong>📅 Date d'inscription :</strong> ${registrationDate}</p>
        </div>
        
        <div style="background-color: #e9f0ff; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold;">Action requise :</p>
          <p style="margin: 10px 0 0 0;">Veuillez vous connecter à l'interface d'administration pour valider ou rejeter cette inscription.</p>
          <p style="margin: 10px 0 0 0;">
            <a href="${process.env.ADMIN_URL || 'http://localhost:3000/admin'}" 
               style="display: inline-block; background-color: #4a6cf7; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
              Aller à l'administration
            </a>
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777;">
          <p>Ceci est une notification automatique, merci de ne pas y répondre.</p>
          <p>ID Utilisateur: ${user.id || 'N/A'}</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Notification d'inscription envoyée à l'administrateur (Message ID: ${info.messageId})`);
    return { 
      success: true, 
      message: 'Notification admin envoyée avec succès',
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification à l\'administrateur:', {
      adminEmails,
      userId: user.id,
      error: error.message,
      stack: error.stack
    });
    
    // En mode développement, simuler l'envoi réussi
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  En mode développement, on simule un envoi réussi');
      return { 
        success: true, 
        message: 'Notification admin simulée (erreur ignorée en développement)',
        debug: { error: error.message }
      };
    }
    
    throw new Error(`Échec de l'envoi de la notification à l'administrateur: ${error.message}`);
  }
};

/**
 * Envoie une notification d'action administrative à un utilisateur
 * @param {string} to - Adresse email du destinataire
 * @param {Object} data - Données de la notification
 * @param {string} data.name - Nom de l'utilisateur
 * @param {string} data.action - Action effectuée par l'administrateur
 * @param {string} data.message - Détails du message
 * @returns {Promise<{success: boolean, message: string}>}
 */
const sendAdminActionNotification = async (to, { name, action, message }) => {
  if (!isEmailConfigured()) {
    console.warn(`📧 [Email simulé] Notification d'action administrative pour ${to} (${name}): ${action}`);
    return { success: true, message: 'Notification administrative simulée (mode développement)' };
  }

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Équipe Colocation'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to,
    subject: `Mise à jour de votre compte - ${action}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4a6cf7;">${action}</h2>
        </div>
        <p>Bonjour ${name},</p>
        <p>L'administrateur a effectué l'action suivante sur votre compte :</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #4a6cf7; border-radius: 4px;">
          ${message}
        </div>
        
        <p>Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter dès que possible.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777;">
          <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Notification d'action administrative envoyée à ${to} (Message ID: ${info.messageId})`);
    return { 
      success: true, 
      message: 'Notification administrative envoyée avec succès',
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification d\'action administrative:', {
      to,
      action,
      error: error.message,
      stack: error.stack
    });
    
    // En mode développement, simuler l'envoi réussi
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  En mode développement, on simule un envoi réussi');
      return { 
        success: true, 
        message: 'Notification administrative simulée (erreur ignorée en développement)',
        debug: { error: error.message }
      };
    }
    
    throw new Error(`Échec de l'envoi de la notification d'action administrative: ${error.message}`);
  }
};

module.exports = {
  // Méthodes principales
  sendVerificationEmail,
  sendVerificationSuccessEmail,
  notifyAdminNewRegistration,
  sendAdminActionNotification,
  
  // Méthodes utilitaires
  isEmailConfigured,
  generateVerificationCode,
  
  // Pour les tests
  ...(process.env.NODE_ENV === 'test' && {
    _test: {
      initTransporter,
      transporter: () => transporter
    }
  })
};