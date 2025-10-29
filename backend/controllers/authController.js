// controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ensure JWT_SECRET and JWT_EXPIRES_IN are loaded

// --- User Registration ---
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // --- Input Validation ---
    if (!username || !email || !password) {
        return res.status(400).json({ msg: 'Please provide username, email, and password' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
         return res.status(400).json({ msg: 'Please enter a valid email address' });
    }
    if (password.length < 6) {
         return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
    }
    // --- End Validation ---

    try {
        // Check if a non-guest user already exists with this email
        let user = await User.findOne({ email: email.toLowerCase(), role: { $ne: 'guest' } });
        if (user) {
            return res.status(400).json({ msg: 'An account with this email already exists' });
        }

        // Create new user instance
        user = new User({
            username,
            email: email.toLowerCase(), // Store email consistently
            password, // Hashed below
            role: 'user' // Explicitly set role
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user
        await user.save();

        res.status(201).json({ msg: 'Registration successful! Please log in.' });

    } catch (err) {
        console.error("Registration error:", err.message);
        // Handle potential duplicate key errors if username were unique
        res.status(500).send('Server error during registration');
    }
};

// --- User Login ---
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Please provide email and password' });
    }

    try {
        // Find registered user by email (case-insensitive)
        const user = await User.findOne({ email: email.toLowerCase(), role: { $ne: 'guest' } });

        // Check if user exists and password is correct
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create JWT payload
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // Sign the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '5h' },
            (err, token) => {
                if (err) throw err;
                // Send token AND user data needed by frontend
                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).send('Server error during login');
    }
};

// --- Guest Login --- (New Function)
exports.guestLogin = async (req, res) => {
    try {
        // Generate a random username for the guest
        const guestUsername = `guest_${Math.random().toString(36).substring(2, 8)}`;

        // Create temporary guest user object
        const guestUser = {
            _id: `temp_${Date.now()}`, // Temporary ID (non-DB)
            username: guestUsername,
            email: `${guestUsername}@temp.com`,
            role: 'guest'
        };

        // Sign payload in the SAME shape as regular login: { user: { id, role, ... } }
        const payload = {
            user: {
                id: guestUser._id,
                role: guestUser.role,
                username: guestUser.username,
                email: guestUser.email
            }
        };

        // Generate JWT token
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send response
        res.json({
            token,
            user: {
                id: guestUser._id,
                username: guestUser.username,
                email: guestUser.email,
                role: guestUser.role
            }
        });
    } catch (error) {
        console.error('Guest login error:', error);
        res.status(500).json({ msg: 'Error creating guest session' });
    }
};

// --- Get Logged-In User Data (for token verification) ---
// Responds to GET /api/auth/me
exports.getLoggedInUser = async (req, res) => {
    try {
        // If token belongs to a guest (no DB record), return the token user payload directly
        if (req.user && req.user.role === 'guest') {
            // The auth middleware will have attached decoded user payload to req.user
            return res.json({
                id: req.user.id,
                username: req.user.username || `guest_${req.user.id}`,
                email: req.user.email || null,
                role: req.user.role
            });
        }

        // For registered users, fetch from DB (exclude password)
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        });
    } catch (err) {
        console.error("Get user error:", err.message);
        res.status(500).send('Server Error fetching user data');
    }
};