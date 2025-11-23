const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  cloudinary,
  deleteImage 
} = require('../utils/cloudinary');
const { sendResponse, sendError } = require('../utils/response');
const { verifyJWT } = require('../utils/auth');

// Configuration commune pour multer (mémoire)
const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, webp)'));
  }
};

// Configuration pour le stockage en mémoire avant upload vers Cloudinary
const upload = multer({ 
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 6 * 1024 * 1024 } // 6MB max
});

// Gestion des erreurs d'upload
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'Fichier trop volumineux (max 6MB)', 400);
    }
    return sendError(res, `Erreur upload: ${err.message}`, 400);
  }
  if (err) {
    return sendError(res, err.message, 400);
  }
  next();
};

// Fonction utilitaire pour uploader vers Cloudinary
const uploadToCloudinary = async (file, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: `projet-stage/${folder}`,
        resource_type: 'auto',
        quality: 'auto:good',
        ...(folder === 'avatars' ? {
          width: 400,
          height: 400,
          gravity: 'face',
          crop: 'thumb'
        } : {
          width: folder === 'properties' ? 1200 : 1000,
          height: 800,
          crop: 'limit'
        })
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

// Upload d'avatar
router.post('/avatar', verifyJWT, upload.single('file'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'Aucun fichier fourni', 400);
    }

    const result = await uploadToCloudinary(req.file, 'avatars');

    return sendResponse(res, {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    }, 'Avatar uploadé avec succès');

  } catch (error) {
    console.error('Erreur upload avatar:', error);
    return sendError(res, 'Erreur lors de l\'upload de l\'avatar', 500);
  }
});

// Upload d'image de propriété
router.post('/property', verifyJWT, upload.single('file'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'Aucun fichier fourni', 400);
    }

    const result = await uploadToCloudinary(req.file, 'properties');

    return sendResponse(res, {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    }, 'Image de propriété uploadée avec succès');

  } catch (error) {
    console.error('Erreur upload propriété:', error);
    return sendError(res, 'Erreur lors de l\'upload de l\'image de propriété', 500);
  }
});

// Upload d'image d'annonce
router.post('/announcement', verifyJWT, upload.single('file'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'Aucun fichier fourni', 400);
    }

    const result = await uploadToCloudinary(req.file, 'announcements');

    return sendResponse(res, {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    }, 'Image d\'annonce uploadée avec succès');

  } catch (error) {
    console.error('Erreur upload annonce:', error);
    return sendError(res, 'Erreur lors de l\'upload de l\'image d\'annonce', 500);
  }
});

// Upload multiple d'images
router.post('/multiple', verifyJWT, upload.array('files', 10), handleMulterError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'Aucun fichier fourni', 400);
    }

    const type = req.query.type || 'properties'; // Par défaut: propriétés
    const results = [];

    for (const file of req.files) {
      try {
        const result = await uploadToCloudinary(file, type);
        results.push({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes
        });
      } catch (error) {
        console.error(`Erreur upload fichier ${file.originalname}:`, error);
        // On continue avec les autres fichiers
      }
    }

    if (results.length === 0) {
      return sendError(res, 'Aucun fichier n\'a pu être uploadé', 500);
    }

    return sendResponse(res, results, `${results.length} fichier(s) uploadé(s) avec succès`);

  } catch (error) {
    console.error('Erreur upload multiple:', error);
    return sendError(res, 'Erreur lors de l\'upload des fichiers', 500);
  }
});

// Suppression d'image
router.delete('/:publicId', verifyJWT, async (req, res) => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      return sendError(res, 'ID public manquant', 400);
    }

    await deleteImage(publicId);
    return sendResponse(res, null, 'Image supprimée avec succès');

  } catch (error) {
    console.error('Erreur suppression image:', error);
    return sendError(res, 'Erreur lors de la suppression de l\'image', 500);
  }
});

module.exports = router;