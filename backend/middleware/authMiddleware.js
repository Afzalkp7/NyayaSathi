// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ensure JWT_SECRET is loaded

// Middleware to verify the token (authentication) for ANY user (guest or registered)
const auth = (req, res, next) => {
    // 1. Get token from Authorization header (Bearer scheme)
    const authHeader = req.header('Authorization');

    // 2. Check if header exists and has the correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Allow request to proceed but mark as unauthenticated (useful for optional auth)
        // If a route *requires* auth, it should check req.user later or this middleware can deny here.
        // For simplicity now, let's deny if format is wrong/missing for protected routes.
        return res.status(401).json({ msg: 'Authorization denied, invalid header format (Bearer token required)' });
    }

    // 3. Extract token
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ msg: 'Authorization denied, no token found after Bearer' });
    }

    // 4. Verify token
    try {
        // Decode token using the JWT secret from your .env file
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Add user payload (id, role) from token to the request object
        // Ensure your JWT payload has a 'user' object with 'id' and 'role'
        if (!decoded.user || !decoded.user.id || !decoded.user.role) {
             throw new Error('Invalid token payload structure');
        }
        req.user = decoded.user;
        next(); // Pass control to the next middleware or route handler
    } catch (err) {
        console.error("Token verification failed:", err.message);
        res.status(401).json({ msg: 'Token is not valid or expired' });
    }
};

// Middleware to check specifically for admin role (authorization)
const admin = (req, res, next) => {
    // Assumes 'auth' middleware has already run and attached req.user
    if (req.user && req.user.role === 'admin') {
        next(); // User is an admin, proceed
    } else {
        // User is not an admin, or req.user is not set (shouldn't happen if 'auth' runs first)
        res.status(403).json({ msg: 'Access denied. Administrator privileges required.' });
    }
};

module.exports = { auth, admin };