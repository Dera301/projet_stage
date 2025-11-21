const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendResponse, sendError } = require('../utils/response');
const { verifyJWT } = require('../utils/auth');

// Configure multer for file uploads
// Sur Vercel, utiliser /tmp car le système de fichiers est en lecture seule
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const uploadDir = isVercel 
  ? '/tmp/uploads' 
  : path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
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

// Upload image
router.post('/image', verifyJWT, upload.single('image'), handleMulterError, (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'Aucun fichier uploadé', 400);
    }

    // Pour Vercel, on convertit l'image en base64 ou on utilise un service cloud
    // Pour l'instant, on retourne une URL temporaire
    // NOTE: Sur Vercel, les fichiers dans /tmp sont temporaires
    // En production, il faudrait utiliser Cloudinary, AWS S3, ou similaire
    
    const filePath = `/uploads/${req.file.filename}`;
    let fullUrl;
    
    if (isVercel) {
      // Sur Vercel, lire le fichier et le convertir en base64 ou utiliser un service cloud
      // Pour l'instant, on retourne juste le nom du fichier
      // TODO: Intégrer Cloudinary ou AWS S3 pour le stockage permanent
      const fileBuffer = fs.readFileSync(req.file.path);
      const base64Image = fileBuffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
      
      return sendResponse(res, {
        path: filePath,
        url: dataUrl,
        filename: req.file.filename,
        size: req.file.size,
        isBase64: true
      }, 'Image uploadée avec succès');
    } else {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      fullUrl = `${baseUrl}${filePath}`;
      
      return sendResponse(res, {
        path: filePath,
        url: fullUrl,
        filename: req.file.filename,
        size: req.file.size
      }, 'Image uploadée avec succès');
    }
  } catch (error) {
    console.error('Upload image error:', error);
    return sendError(res, 'Erreur lors de l\'upload: ' + error.message, 500);
  }
});

module.exports = router;

