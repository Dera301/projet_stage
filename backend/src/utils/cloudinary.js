// backend/src/utils/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Forcer HTTPS
});

// Configuration du stockage pour les avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: 'projet-stage/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    transformation: [
      { width: 400, height: 400, gravity: 'face', crop: 'thumb' },
      { quality: 'auto:good' }
    ]
  })
});

// Configuration du stockage pour les images de propriétés
const propertyStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: 'projet-stage/properties',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto:good' }
    ]
  })
});

// Configuration du stockage pour les annonces
const announcementStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: 'projet-stage/announcements',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    transformation: [
      { width: 1000, height: 800, crop: 'limit' },
      { quality: 'auto:good' }
    ]
  })
});

// Fonction utilitaire pour supprimer une image
const deleteImage = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  avatarStorage,
  propertyStorage,
  announcementStorage,
  deleteImage
};