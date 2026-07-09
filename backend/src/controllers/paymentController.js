const Payment = require('../models/Payment');
const GameSession = require('../models/GameSession');
const logger = require('../middleware/logger');

exports.createPayment = async (req, res) => {
    try {
        const paymentData = req.body;

        // Check if session exists
        const session = await GameSession.getById(paymentData.sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Game session not found'
            });
        }

        const paymentId = await Payment.create(paymentData);

        // Update session payment status if completed
        if (paymentData.status === 'completed') {
            await GameSession.updateStatus(paymentData.sessionId, 'paid');
        }

        logger.info(`Payment created: ${paymentId}`);

        res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            paymentId
        });
    } catch (error) {
        logger.error('Create payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record payment',
            error: error.message
        });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.getAll();
        res.json({
            success: true,
            payments
        });
    } catch (error) {
        logger.error('Get payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payments',
            error: error.message
        });
    }
};

exports.getPayment = async (req, res) => {
    try {
        const payment = await Payment.getById(req.params.id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            payment
        });
    } catch (error) {
        logger.error('Get payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment',
            error: error.message
        });
    }
};

exports.getPaymentsBySession = async (req, res) => {
    try {
        const payments = await Payment.getBySession(req.params.sessionId);
        res.json({
            success: true,
            payments
        });
    } catch (error) {
        logger.error('Get session payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get session payments',
            error: error.message
        });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await Payment.updateStatus(req.params.id, status);

        logger.info(`Payment status updated: ${req.params.id} -> ${status}`);

        res.json({
            success: true,
            message: 'Payment status updated successfully'
        });
    } catch (error) {
        logger.error('Update payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update payment status',
            error: error.message
        });
    }
};

exports.getDailyReport = async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const report = await Payment.getDailyReport(date);

        res.json({
            success: true,
            date,
            report
        });
    } catch (error) {
        logger.error('Get daily report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get daily report',
            error: error.message
        });
    }
};

exports.getMonthlyReport = async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();
        const month = req.query.month || new Date().getMonth() + 1;
        const report = await Payment.getMonthlyReport(year, month);

        res.json({
            success: true,
            year,
            month,
            report
        });
    } catch (error) {
        logger.error('Get monthly report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get monthly report',
            error: error.message
        });
    }
};

exports.getRevenueStats = async (req, res) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const stats = await Payment.getRevenueStats(startDate, endDate);
        res.json({
            success: true,
            startDate,
            endDate,
            stats
        });
    } catch (error) {
        logger.error('Get revenue stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get revenue stats',
            error: error.message
        });
    }
};
