const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes'
    }
});

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    message: {
        success: false,
        message: 'Too many requests, please try again later'
    }
});

const snackLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    message: {
        success: false,
        message: 'Too many snack operations, please try again later'
    }
});

module.exports = { authLimiter, apiLimiter, snackLimiter };
