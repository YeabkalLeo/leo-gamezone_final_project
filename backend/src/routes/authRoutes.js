const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.get('/users', authenticate, isAdmin, authController.getAllUsers);
router.put('/users/:userId/role', authenticate, isAdmin, authController.updateRole);

module.exports = router;
