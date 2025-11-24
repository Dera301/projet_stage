const emailService = require('../services/emailService');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hajaaridera@gmail.com';

function buildNotificationContent(action, d) {
  const adminUrl = process.env.ADMIN_URL || 'http://localhost:3000/admin';
  
  let subject = 'Notification - ColocAntananarivo';
  let html = '';

  if (action === 'user_registered') {
    subject = '[Nouvelle Inscription] Nouvel utilisateur enregistré';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4a6cf7;">Nouvelle inscription</h2>
        </div>
        <p>Un nouvel utilisateur s'est inscrit sur la plateforme :</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #4a6cf7; margin: 15px 0; border-radius: 4px;">
          <p><strong>📧 Email :</strong> ${d.email}</p>
          <p><strong>👤 Nom :</strong> ${d.name || 'Non spécifié'}</p>
          <p><strong>🔹 Type :</strong> ${d.userType || 'Non spécifié'}</p>
          <p><strong>🆔 ID Utilisateur :</strong> ${d.id}</p>
        </div>
        <div style="margin-top: 20px; text-align: center;">
          <a href="${adminUrl}/users" style="display: inline-block; background-color: #4a6cf7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Voir dans l'administration</a>
        </div>
      </div>
    `;
  } else if (action === 'announcement_created') {
    subject = '[Nouvelle Annonce] Annonce créée';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4a6cf7;">Nouvelle annonce créée</h2>
        </div>
        <p>Une nouvelle annonce a été créée :</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #4a6cf7; margin: 15px 0; border-radius: 4px;">
          <p><strong>👤 Auteur :</strong> ${d.authorName || 'Non spécifié'} (${d.authorEmail || ''})</p>
          <p><strong>🆔 ID Annonce :</strong> ${d.id}</p>
        </div>
        <div style="margin-top: 20px; text-align: center;">
          <a href="${adminUrl}/announcements" style="display: inline-block; background-color: #4a6cf7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Voir dans l'administration</a>
        </div>
      </div>
    `;
  } else if (action === 'property_created') {
    subject = '[Nouvelle Propriété] Propriété créée';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4a6cf7;">Nouvelle propriété créée</h2>
        </div>
        <p>Une nouvelle propriété a été créée :</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #4a6cf7; margin: 15px 0; border-radius: 4px;">
          <p><strong>🏠 Titre :</strong> ${d.title || 'Non spécifié'}</p>
          <p><strong>👤 Propriétaire :</strong> ${d.ownerName || 'Non spécifié'} (${d.ownerEmail || ''})</p>
          <p><strong>🆔 ID Propriété :</strong> ${d.id}</p>
        </div>
        <div style="margin-top: 20px; text-align: center;">
          <a href="${adminUrl}/properties" style="display: inline-block; background-color: #4a6cf7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Voir dans l'administration</a>
        </div>
      </div>
    `;
  } else if (action === 'cin_verification_requested') {
    subject = '[Vérification CIN] Demande de vérification CIN';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #ff9800;">Demande de vérification CIN</h2>
        </div>
        <p>Un utilisateur a demandé la vérification de sa CIN :</p>
        <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 15px 0; border-radius: 4px;">
          <p><strong>👤 Utilisateur :</strong> ${d.name || 'Non spécifié'} (${d.email || ''})</p>
          <p><strong>🆔 ID Utilisateur :</strong> ${d.userId}</p>
          <p><strong>🪪 Numéro CIN :</strong> ${d.cinNumber || 'Non spécifié'}</p>
        </div>
        <div style="background-color: #e9f0ff; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold;">Action requise :</p>
          <p style="margin: 10px 0 0 0;">Veuillez vérifier la CIN de cet utilisateur dans l'interface d'administration.</p>
          <p style="margin: 10px 0 0 0;">
            <a href="${adminUrl}/cin-verifications" 
               style="display: inline-block; background-color: #4a6cf7; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
              Vérifier la CIN
            </a>
          </p>
        </div>
      </div>
    `;
  } else if (action === 'cin_verification_result') {
    subject = '[Vérification CIN] Résultat de la vérification';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: ${d.verified ? '#4caf50' : '#f44336'};">Résultat de vérification CIN</h2>
        </div>
        <p>La vérification CIN a été ${d.verified ? 'approuvée' : 'rejetée'} :</p>
        <div style="background-color: ${d.verified ? '#e8f5e9' : '#ffebee'}; padding: 15px; border-left: 4px solid ${d.verified ? '#4caf50' : '#f44336'}; margin: 15px 0; border-radius: 4px;">
          <p><strong>👤 Utilisateur :</strong> ${d.name || 'Non spécifié'} (${d.email || ''})</p>
          <p><strong>🆔 ID Utilisateur :</strong> ${d.id}</p>
          <p><strong>✅ Statut :</strong> ${d.verified ? 'Approuvé' : 'Rejeté'}</p>
          ${d.reason ? `<p><strong>📝 Raison :</strong> ${d.reason}</p>` : ''}
        </div>
      </div>
    `;
  } else if (action === 'announcement_updated') {
    subject = '[Modification] Annonce modifiée';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4a6cf7;">Annonce modifiée</h2>
        </div>
        <p>Une annonce a été modifiée :</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #4a6cf7; margin: 15px 0; border-radius: 4px;">
          <p><strong>🆔 ID Annonce :</strong> ${d.id}</p>
          <p><strong>👤 Auteur :</strong> ${d.authorName || 'Non spécifié'} (${d.authorEmail || ''})</p>
        </div>
        <div style="margin-top: 20px; text-align: center;">
          <a href="${adminUrl}/announcements" style="display: inline-block; background-color: #4a6cf7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Voir dans l'administration</a>
        </div>
      </div>
    `;
  } else if (action === 'announcement_deleted') {
    subject = '[Suppression] Annonce supprimée';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #f44336;">Annonce supprimée</h2>
        </div>
        <p>Une annonce a été supprimée :</p>
        <div style="background-color: #ffebee; padding: 15px; border-left: 4px solid #f44336; margin: 15px 0; border-radius: 4px;">
          <p><strong>🆔 ID Annonce :</strong> ${d.id}</p>
          <p><strong>👤 Auteur :</strong> ${d.authorName || 'Non spécifié'} (${d.authorEmail || ''})</p>
        </div>
      </div>
    `;
  } else if (action === 'property_updated') {
    subject = '[Modification] Propriété modifiée';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4a6cf7;">Propriété modifiée</h2>
        </div>
        <p>Une propriété a été modifiée :</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #4a6cf7; margin: 15px 0; border-radius: 4px;">
          <p><strong>🏠 Titre :</strong> ${d.title || 'Non spécifié'}</p>
          <p><strong>🆔 ID Propriété :</strong> ${d.id}</p>
          <p><strong>👤 Propriétaire :</strong> ${d.ownerName || 'Non spécifié'} (${d.ownerEmail || ''})</p>
        </div>
        <div style="margin-top: 20px; text-align: center;">
          <a href="${adminUrl}/properties" style="display: inline-block; background-color: #4a6cf7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Voir dans l'administration</a>
        </div>
      </div>
    `;
  } else if (action === 'property_deleted') {
    subject = '[Suppression] Propriété supprimée';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #f44336;">Propriété supprimée</h2>
        </div>
        <p>Une propriété a été supprimée :</p>
        <div style="background-color: #ffebee; padding: 15px; border-left: 4px solid #f44336; margin: 15px 0; border-radius: 4px;">
          <p><strong>🏠 Titre :</strong> ${d.title || 'Non spécifié'}</p>
          <p><strong>🆔 ID Propriété :</strong> ${d.id}</p>
          <p><strong>👤 Propriétaire :</strong> ${d.ownerName || 'Non spécifié'} (${d.ownerEmail || ''})</p>
        </div>
      </div>
    `;
  } else if (action === 'profile_updated') {
    subject = '[Modification] Profil utilisateur modifié';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4a6cf7;">Profil utilisateur modifié</h2>
        </div>
        <p>Un utilisateur a modifié son profil :</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #4a6cf7; margin: 15px 0; border-radius: 4px;">
          <p><strong>👤 Utilisateur :</strong> ${d.name || 'Non spécifié'} (${d.email || ''})</p>
          <p><strong>🆔 ID Utilisateur :</strong> ${d.id}</p>
          <p><strong>📝 Champs modifiés :</strong> ${(d.updatedFields || []).join(', ') || 'Non spécifié'}</p>
        </div>
        <div style="margin-top: 20px; text-align: center;">
          <a href="${adminUrl}/users" style="display: inline-block; background-color: #4a6cf7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Voir dans l'administration</a>
        </div>
      </div>
    `;
  } else if (action === 'admin_message_sent') {
    subject = '[Message Admin] Message envoyé à un utilisateur';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4a6cf7;">Message admin envoyé</h2>
        </div>
        <p>Un message a été envoyé à un utilisateur :</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #4a6cf7; margin: 15px 0; border-radius: 4px;">
          <p><strong>👤 Destinataire :</strong> ${d.userName || 'Non spécifié'} (${d.userEmail || ''})</p>
          <p><strong>📝 Contenu :</strong> ${d.content ? (d.content.length > 100 ? d.content.substring(0, 100) + '...' : d.content) : 'Non spécifié'}</p>
        </div>
      </div>
    `;
  }

  return { subject, html };
}

async function sendAdminNotification(action, details) {
  try {
    const { subject, html } = buildNotificationContent(action, details || {});
    
    // Utiliser le service email pour envoyer la notification
    if (!emailService.isEmailConfigured()) {
      console.warn(`📧 [Email simulé] Notification admin pour ${action}:`, { to: ADMIN_EMAIL, subject });
      return true;
    }

    // Utiliser nodemailer directement pour envoyer à l'admin
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      },
      ...(process.env.NODE_ENV !== 'production' && {
        tls: { rejectUnauthorized: false }
      })
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Système de notification'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: ADMIN_EMAIL,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Notification admin envoyée (${action}) à ${ADMIN_EMAIL} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de la notification admin (${action}):`, {
      error: error.message,
      code: error.code,
      stack: error.stack
    });
    return false;
  }
}

module.exports = { sendAdminNotification };
