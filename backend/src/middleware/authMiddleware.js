const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware pour vérifier le token JWT
const authenticateToken = async (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé - Token manquant'
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier si l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        isVerified: true,
        cinVerified: true,
        avatar: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification :', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Token invalide'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expirée, veuillez vous reconnecter'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification',
      error: error.message
    });
  }
};

// Middleware pour vérifier si l'utilisateur est administrateur
const isAdmin = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'Accès refusé - Droits insuffisants'
  });
};

// Middleware pour vérifier si l'utilisateur est un propriétaire
const isOwner = (req, res, next) => {
  if (req.user && req.user.userType === 'owner') {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'Accès réservé aux propriétaires'
  });
};

// Middleware pour vérifier si l'utilisateur est un étudiant
const isStudent = (req, res, next) => {
  if (req.user && req.user.userType === 'student') {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'Accès réservé aux étudiants'
  });
};

// Middleware pour vérifier si l'utilisateur est vérifié
const isVerified = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'Veuillez vérifier votre adresse email avant de continuer'
  });
};

module.exports = {
  authenticateToken,
  isAdmin,
  isOwner,
  isStudent,
  isVerified
};
