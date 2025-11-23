// backend/src/utils/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration de Cloudinary avec vos credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dz4ttrfjc",
  api_key: process.env.CLOUDINARY_API_KEY || "978656743848875",
  api_secret: process.env.CLOUDINARY_API_SECRET || "nfXU43i-oRECzbB5-ybIEq0GndY",
  secure: true
});

// Configuration du stockage pour les avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'projet-stage/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, gravity: 'face', crop: 'thumb' },
      { quality: 'auto:good' }
    ]
  }
});

// Configuration du stockage pour les images de propriétés
const propertyStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'projet-stage/properties',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto:good' }
    ]
  }
});

// Configuration du stockage pour les annonces
const announcementStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'projet-stage/announcements',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1000, height: 800, crop: 'limit' },
      { quality: 'auto:good' }
    ]
  }
});

// Fonction utilitaire pour supprimer une image
const deleteImage = async (publicId) => {
  try {
    if (!publicId) return;
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Fonction pour uploader directement un buffer
const uploadBuffer = async (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: `projet-stage/${folder}`,
      resource_type: 'image',
      ...options
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

module.exports = {
  cloudinary,
  avatarStorage,
  propertyStorage,
  announcementStorage,
  deleteImage,
  uploadBuffer
};