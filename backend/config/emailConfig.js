// Configuration pour le service d'email
module.exports = {
  // Configuration pour l'envoi d'emails
  from: 'no-reply@colocantananarivo.com',
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true pour le port 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  // Configuration des templates d'email
  templates: {
    verification: {
      subject: 'Vérification de votre email',
      template: 'verification-email.html'
    },
    verificationSuccess: {
      subject: 'Email vérifié avec succès',
      template: 'verification-success.html'
    },
    passwordReset: {
      subject: 'Réinitialisation de votre mot de passe',
      template: 'password-reset.html'
    }
  },
  // Configuration des URLs
  urls: {
    verification: process.env.FRONTEND_URL + '/verify-account',
    passwordReset: process.env.FRONTEND_URL + '/reset-password'
  }
};
