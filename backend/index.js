const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
const lawRoutes = require('./routes/lawRoutes');
app.use('/api/auth', authRoutes);  // ← Must be present
app.use('/api/laws', lawRoutes);
app.use('/api/rag-laws', require('./routes/ragLawRoute')); // if using the older endpoint

// Example protected route
const { auth } = require('./middleware/authMiddleware');
app.get('/api/protected', auth, (req, res) => {
    res.json({ msg: `Hello ${req.user.role}`, user: req.user });
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
