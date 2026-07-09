const Snack = require('../models/Snack');
const logger = require('../middleware/logger');

exports.createSnack = async (req, res) => {
    try {
        const snackData = req.body;
        const snackId = await Snack.create(snackData);

        logger.info(`Snack created: ${snackData.name}`);

        res.status(201).json({
            success: true,
            message: 'Snack created successfully',
            snackId
        });
    } catch (error) {
        logger.error('Create snack error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create snack',
            error: error.message
        });
    }
};

exports.getSnacks = async (req, res) => {
    try {
        const { search, lowStock } = req.query;
        let snacks;

        if (search) {
            snacks = await Snack.search(search);
        } else if (lowStock) {
            snacks = await Snack.getLowStock(lowStock);
        } else {
            snacks = await Snack.getAll();
        }

        res.json({
            success: true,
            snacks
        });
    } catch (error) {
        logger.error('Get snacks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get snacks',
            error: error.message
        });
    }
};

exports.getSnack = async (req, res) => {
    try {
        const snack = await Snack.getById(req.params.id);
        if (!snack) {
            return res.status(404).json({
                success: false,
                message: 'Snack not found'
            });
        }

        res.json({
            success: true,
            snack
        });
    } catch (error) {
        logger.error('Get snack error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get snack',
            error: error.message
        });
    }
};

exports.updateSnack = async (req, res) => {
    try {
        await Snack.update(req.params.id, req.body);

        logger.info(`Snack updated: ${req.params.id}`);

        res.json({
            success: true,
            message: 'Snack updated successfully'
        });
    } catch (error) {
        logger.error('Update snack error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update snack',
            error: error.message
        });
    }
};

exports.deleteSnack = async (req, res) => {
    try {
        await Snack.delete(req.params.id);

        logger.info(`Snack deleted: ${req.params.id}`);

        res.json({
            success: true,
            message: 'Snack deleted successfully'
        });
    } catch (error) {
        logger.error('Delete snack error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete snack',
            error: error.message
        });
    }
};

exports.updateSnackQuantity = async (req, res) => {
    try {
        const { quantity } = req.body;
        await Snack.updateQuantity(req.params.id, quantity);

        logger.info(`Snack quantity updated: ${req.params.id} -> ${quantity}`);

        res.json({
            success: true,
            message: 'Snack quantity updated successfully'
        });
    } catch (error) {
        logger.error('Update snack quantity error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update snack quantity',
            error: error.message
        });
    }
};

exports.getLowStockSnacks = async (req, res) => {
    try {
        const threshold = req.query.threshold || 10;
        const snacks = await Snack.getLowStock(threshold);

        res.json({
            success: true,
            snacks
        });
    } catch (error) {
        logger.error('Get low stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get low stock items',
            error: error.message
        });
    }
};
