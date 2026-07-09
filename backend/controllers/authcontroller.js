const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const logger = require('../middleware/logger');

exports.register = async (req, res) => {
    try {
        const { username, email, password, fullName, role } = req.body;

        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user
        const userId = await User.create({
            username,
            email,
            password,
            fullName,
            role: role || 'staff'
        });

        logger.info(`User registered: ${username} (${email})`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isValid = await User.comparePassword(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        await User.updateLastLogin(user.id);

        // Generate token
        const token = generateToken(user.id, user.role);

        logger.info(`User logged in: ${user.username} (${user.email})`);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.full_name
            }
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

exports.logout = async (req, res) => {
    // JWT is stateless, so logout is handled client-side
    res.json({
        success: true,
        message: 'Logout successful'
    });
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: error.message
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json({
            success: true,
            users
        });
    } catch (error) {
        logger.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users',
            error: error.message
        });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        await User.updateRole(userId, role);

        logger.info(`User role updated: ${userId} -> ${role}`);

        res.json({
            success: true,
            message: 'User role updated successfully'
        });
    } catch (error) {
        logger.error('Update role error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update role',
            error: error.message
        });
    }
};
