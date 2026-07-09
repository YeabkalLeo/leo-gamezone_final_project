const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authenticate = require('../middleware/auth');
const { isStaff, isAdmin } = require('../middleware/roleCheck');

// All routes require authentication
router.use(authenticate);

// Staff can manage payments
router.get('/', isStaff, paymentController.getPayments);
router.get('/daily-report', isStaff, paymentController.getDailyReport);
router.get('/monthly-report', isStaff, paymentController.getMonthlyReport);
router.get('/revenue-stats', isStaff, paymentController.getRevenueStats);
router.get('/:id', isStaff, paymentController.getPayment);
router.get('/session/:sessionId', isStaff, paymentController.getPaymentsBySession);
router.post('/', isStaff, paymentController.createPayment);
router.patch('/:id/status', isStaff, paymentController.updatePaymentStatus);

module.exports = router;
