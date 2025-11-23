const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/authController');
const verificationController = require('../controllers/auth/verificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes d'authentification
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware.authenticateToken, authController.me);
router.post('/logout', authMiddleware.authenticateToken, authController.logout);

// Routes de vérification d'email
router.post('/verify-email', verificationController.verifyCode);
router.post('/resend-verification', verificationController.resendVerificationCode);

module.exports = router;
