const { clerkClient } = require('@clerk/express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const useClerk = process.env.USE_CLERK === 'true';

// Verify Clerk token and get user
const verifyClerkToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant'
      });
    }

    const token = authHeader.substring(7);
    
    // Verify with Clerk
    if (!useClerk || !clerkClient || typeof clerkClient.verifyToken !== 'function') {
      return res.status(501).json({ success: false, message: 'Clerk non configuré' });
    }
    const decoded = await clerkClient.verifyToken(token);
    const clerkUserId = decoded.sub;

    // Find user in database by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    req.user = user;
    req.clerkUserId = clerkUserId;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

// Optional: Fallback JWT auth for backward compatibility
const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      // If JWT fails, try Clerk only if enabled
      if (useClerk) {
        return verifyClerkToken(req, res, next);
      }
      return res.status(401).json({ success: false, message: 'Token invalide' });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé - Admin uniquement'
    });
  }
};

module.exports = {
  verifyClerkToken,
  verifyJWT,
  isAdmin
};

