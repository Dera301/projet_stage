const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { sendResponse, sendError } = require('../utils/response');
const { verifyJWT } = require('../utils/auth');
const { uploadBuffer } = require('../utils/cloudinary');

// Configure multer for file uploads (temporaire pour buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
    }
  }
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'Fichier trop volumineux (max 5MB)', 400);
    }
    return sendError(res, 'Erreur upload: ' + err.message, 400);
  }
  if (err) {
    return sendError(res, err.message, 400);
  }
  next();
};

// Upload image - utilise Cloudinary pour retourner une URL courte
router.post('/image', verifyJWT, upload.single('image'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'Aucun fichier uploadé', 400);
    }

    // Upload vers Cloudinary (utilise le dossier par défaut 'projet-stage/images')
    const result = await uploadBuffer(req.file.buffer, 'images', {
      transformation: [
        { quality: 'auto:good' }
      ]
    });

    // Retourner l'URL Cloudinary (courte, pas de limite 255)
    return sendResponse(res, {
      path: result.secure_url,
      url: result.secure_url,
      public_id: result.public_id,
      filename: req.file.originalname,
      size: req.file.size
    }, 'Image uploadée avec succès');
  } catch (error) {
    console.error('Upload image error:', error);
    return sendError(res, 'Erreur lors de l\'upload: ' + error.message, 500);
  }
});

// Upload image publique pour l'inscription (sans authentification)
router.post('/image/public', upload.single('image'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'Aucun fichier uploadé', 400);
    }

    // Upload vers Cloudinary (utilise le dossier avatars pour les photos de profil)
    const result = await uploadBuffer(req.file.buffer, 'avatars', {
      transformation: [
        { width: 400, height: 400, gravity: 'face', crop: 'thumb' },
        { quality: 'auto:good' }
      ]
    });

    // Retourner l'URL Cloudinary
    return sendResponse(res, {
      path: result.secure_url,
      url: result.secure_url,
      public_id: result.public_id,
      filename: req.file.originalname,
      size: req.file.size
    }, 'Image uploadée avec succès');
  } catch (error) {
    console.error('Upload image public error:', error);
    return sendError(res, 'Erreur lors de l\'upload: ' + error.message, 500);
  }
});

module.exports = router;
