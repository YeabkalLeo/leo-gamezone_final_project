    const GameSession = require('../models/GameSession');
    const Game = require('../models/Game');
    const logger = require('../middleware/logger');

    exports.createSession = async (req, res) => {
        try {
            const sessionData = {
                ...req.body,
                userId: req.userId
            };

            // Check if game exists and is available
            const game = await Game.getById(sessionData.gameId);
            if (!game) {
                return res.status(404).json({
                    success: false,
                    message: 'Game not found'
                });
            }

            if (game.status !== 'available') {
                return res.status(400).json({
                    success: false,
                    message: 'Game is not available'
                });
            }

            const sessionId = await GameSession.create(sessionData);

            // Update game status to in-use
            await Game.updateStatus(sessionData.gameId, 'in-use');

            logger.info(`Game session created: ${sessionId}`);

            res.status(201).json({
                success: true,
                message: 'Game session created successfully',
                sessionId
            });
        } catch (error) {
            logger.error('Create session error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create game session',
                error: error.message
            });
        }
    };

    exports.getSessions = async (req, res) => {
        try {
            const { date, gameId } = req.query;
            let sessions;

            if (date) {
                sessions = await GameSession.getByDate(date);
            } else if (gameId) {
                sessions = await GameSession.getByGame(gameId);
            } else {
                sessions = await GameSession.getAll();
            }

            res.json({
                success: true,
                sessions
            });
        } catch (error) {
            logger.error('Get sessions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get game sessions',
                error: error.message
            });
        }
    };

    exports.getSession = async (req, res) => {
        try {
            const session = await GameSession.getById(req.params.id);
            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'Game session not found'
                });
            }

            res.json({
                success: true,
                session
            });
        } catch (error) {
            logger.error('Get session error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get game session',
                error: error.message
            });
        }
    };

    exports.updateSession = async (req, res) => {
        try {
            await GameSession.update(req.params.id, req.body);

            logger.info(`Game session updated: ${req.params.id}`);

            res.json({
                success: true,
                message: 'Game session updated successfully'
            });
        } catch (error) {
            logger.error('Update session error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update game session',
                error: error.message
            });
        }
    };

    exports.endSession = async (req, res) => {
        try {
            const { endTime, totalAmount } = req.body;
            await GameSession.endSession(req.params.id, endTime, totalAmount);

            // Get session to find game_id and update game status
            const session = await GameSession.getById(req.params.id);
            if (session) {
                await Game.updateStatus(session.game_id, 'available');
            }

            logger.info(`Game session ended: ${req.params.id}`);

            res.json({
                success: true,
                message: 'Game session ended successfully'
            });
        } catch (error) {
            logger.error('End session error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to end game session',
                error: error.message
            });
        }
    };

    exports.deleteSession = async (req, res) => {
        try {
            await GameSession.delete(req.params.id);

            logger.info(`Game session deleted: ${req.params.id}`);

            res.json({
                success: true,
                message: 'Game session deleted successfully'
            });
        } catch (error) {
            logger.error('Delete session error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete game session',
                error: error.message
            });
        }
    };

    exports.getActiveSessions = async (req, res) => {
        try {
            const sessions = await GameSession.getActiveSessions();
            res.json({
                success: true,
                sessions
            });
        } catch (error) {
            logger.error('Get active sessions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get active sessions',
                error: error.message
            });
        }
    };

    exports.getSessionStats = async (req, res) => {
        try {
            const stats = await GameSession.getStats();
            res.json({
                success: true,
                stats
            });
        } catch (error) {
            logger.error('Get session stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get session stats',
                error: error.message
            });
        }
    };
