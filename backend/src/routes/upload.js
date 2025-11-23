const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendResponse, sendError } = require('../utils/response');
const { verifyJWT } = require('../utils/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
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

// Upload image
router.post('/image', verifyJWT, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'Aucun fichier uploadé', 400);
    }

    // Return the file path (relative to the uploads directory)
    const filePath = `/uploads/${req.file.filename}`;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fullUrl = `${baseUrl}${filePath}`;

    return sendResponse(res, {
      path: filePath,
      url: fullUrl,
      filename: req.file.filename,
      size: req.file.size
    }, 'Image uploadée avec succès');
  } catch (error) {
    console.error('Upload image error:', error);
    return sendError(res, 'Erreur lors de l\'upload: ' + error.message, 500);
  }
});

module.exports = router;

