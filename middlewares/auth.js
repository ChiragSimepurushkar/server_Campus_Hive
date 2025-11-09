import dotenv from 'dotenv';
dotenv.config();


import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';

const auth = async (req, res, next) => {

    console.log('🔐 Auth middleware called');
    console.log('Headers:', req.headers.authorization);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET); // Should be true
    console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Authorization required.'
            });
        }

        // Extract token
        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await UserModel.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Invalid token.'
            });
        }

        // Attach user to request object
        req.user = user;  // This sets req.user with the full user object
        req.userId = user._id; // Also set userId for backward compatibility

        next();
    } catch (error) {
        console.error('Authentication error:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

export default auth;