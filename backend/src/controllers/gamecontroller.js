const Game = require('../models/Game');
const logger = require('../middleware/logger');

exports.createGame = async (req, res) => {
    try {
        const gameData = req.body;
        const gameId = await Game.create(gameData);

        logger.info(`Game created: ${gameData.name}`);

        res.status(201).json({
            success: true,
            message: 'Game created successfully',
            gameId
        });
    } catch (error) {
        logger.error('Create game error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create game',
            error: error.message
        });
    }
};

exports.getGames = async (req, res) => {
    try {
        const { search, type, available } = req.query;
        let games;

        if (search) {
            games = await Game.search(search);
        } else if (type) {
            games = await Game.getByType(type);
        } else if (available) {
            games = await Game.getAvailable();
        } else {
            games = await Game.getAll();
        }

        res.json({
            success: true,
            games
        });
    } catch (error) {
        logger.error('Get games error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get games',
            error: error.message
        });
    }
};

exports.getGame = async (req, res) => {
    try {
        const game = await Game.getById(req.params.id);
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        res.json({
            success: true,
            game
        });
    } catch (error) {
        logger.error('Get game error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get game',
            error: error.message
        });
    }
};

exports.updateGame = async (req, res) => {
    try {
        await Game.update(req.params.id, req.body);

        logger.info(`Game updated: ${req.params.id}`);

        res.json({
            success: true,
            message: 'Game updated successfully'
        });
    } catch (error) {
        logger.error('Update game error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update game',
            error: error.message
        });
    }
};

exports.deleteGame = async (req, res) => {
    try {
        await Game.delete(req.params.id);

        logger.info(`Game deleted: ${req.params.id}`);

        res.json({
            success: true,
            message: 'Game deleted successfully'
        });
    } catch (error) {
        logger.error('Delete game error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete game',
            error: error.message
        });
    }
};

exports.updateGameStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await Game.updateStatus(req.params.id, status);

        logger.info(`Game status updated: ${req.params.id} -> ${status}`);

        res.json({
            success: true,
            message: 'Game status updated successfully'
        });
    } catch (error) {
        logger.error('Update game status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update game status',
            error: error.message
        });
    }
};

exports.getAvailableGames = async (req, res) => {
    try {
        const games = await Game.getAvailable();
        res.json({
            success: true,
            games
        });
    } catch (error) {
        logger.error('Get available games error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get available games',
            error: error.message
        });
    }
};
