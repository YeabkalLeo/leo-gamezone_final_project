const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authenticate = require('../middleware/auth');
const { isStaff, isAdmin } = require('../middleware/roleCheck');

// All routes require authentication
router.use(authenticate);

// Staff can view games
router.get('/', isStaff, gameController.getGames);
router.get('/available', isStaff, gameController.getAvailableGames);
router.get('/:id', isStaff, gameController.getGame);

// Admin only - create, update, delete
router.post('/', isAdmin, gameController.createGame);
router.put('/:id', isAdmin, gameController.updateGame);
router.delete('/:id', isAdmin, gameController.deleteGame);
router.patch('/:id/status', isAdmin, gameController.updateGameStatus);

module.exports = router;
