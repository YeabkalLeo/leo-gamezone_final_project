const express = require('express');
const router = express.Router();
const snackController = require('../controllers/snackController');
const authenticate = require('../middleware/auth');
const { isStaff, isAdmin } = require('../middleware/roleCheck');
const { snackLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(authenticate);

// Staff can view snacks
router.get('/', isStaff, snackController.getSnacks);
router.get('/search', isStaff, snackController.getSnacks);
router.get('/low-stock', isStaff, snackController.getLowStockSnacks);
router.get('/:id', isStaff, snackController.getSnack);

// Admin only - create, update, delete
router.post('/', isAdmin, snackLimiter, snackController.createSnack);
router.put('/:id', isAdmin, snackLimiter, snackController.updateSnack);
router.delete('/:id', isAdmin, snackLimiter, snackController.deleteSnack);
router.patch('/:id/quantity', isAdmin, snackLimiter, snackController.updateSnackQuantity);

module.exports = router;
