const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { uploadBuffer } = require('../utils/cloudinary');
const { sendResponse, sendError } = require('../utils/response');

// Configuration de multer pour la mémoire (nous allons utiliser Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, webp)'));
  }
}).single('image');

// Route pour l'upload d'images
router.post('/image', (req, res) => {
  upload(req, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, 'La taille du fichier ne doit pas dépasser 5MB', 400);
      }
      return sendError(res, err.message, 400);
    }
    
    if (!req.file) {
      return sendError(res, 'Aucun fichier téléchargé', 400);
    }
    
    try {
      // Utiliser Cloudinary pour l'upload
      const result = await uploadBuffer(
        req.file.buffer,
        'avatars',
        { 
          public_id: `avatar_${uuidv4()}`,
          width: 500,
          height: 500,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto:good'
        }
      );
      
      sendResponse(res, {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload vers Cloudinary:', error);
      sendError(res, 'Erreur lors du traitement de l\'image', 500);
    }
  });
});

module.exports = router;
