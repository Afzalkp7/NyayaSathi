// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware'); // Import ONLY auth middleware

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.registerUser);

// @route   POST api/auth/login
// @desc    Authenticate user & get token + user data
// @access  Public
router.post('/login', authController.loginUser);

// @route   POST api/auth/guest-login
// @desc    Create a temporary guest user & get token
// @access  Public
router.post('/guest-login', authController.guestLogin); // Added guest login route

// @route   GET api/auth/me
// @desc    Get logged in user data using token (verifies token)
// @access  Private (Requires token via 'auth' middleware)
router.get('/me', auth, authController.getLoggedInUser); // Added this protected route

module.exports = router;