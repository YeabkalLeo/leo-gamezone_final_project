const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authenticate = require('../middleware/auth');
const { isStaff, isAdmin } = require('../middleware/roleCheck');

// All routes require authentication
router.use(authenticate);

// Staff can manage sessions
router.get('/', isStaff, sessionController.getSessions);
router.get('/active', isStaff, sessionController.getActiveSessions);
router.get('/stats', isStaff, sessionController.getSessionStats);
router.get('/:id', isStaff, sessionController.getSession);
router.post('/', isStaff, sessionController.createSession);
router.put('/:id', isStaff, sessionController.updateSession);
router.post('/:id/end', isStaff, sessionController.endSession);

// Admin only - delete
router.delete('/:id', isAdmin, sessionController.deleteSession);

module.exports = router;
