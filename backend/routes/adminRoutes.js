const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/authMiddleware');
const Law = require('../models/Law');
const User = require('../models/User');

// GET /api/admin/stats
// Returns basic aggregate counts for admin dashboard
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const [totalLaws, totalUsers] = await Promise.all([
      Law.countDocuments({}),
      User.countDocuments({})
    ]);

    res.json({ totalLaws, totalUsers });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/users
// Returns list of users for admin management, with optional filters
router.get('/users', auth, admin, async (req, res) => {
  try {
    const { search = '', role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ username: regex }, { email: regex }];
    }

    const users = await User.find(filter)
      .select('username email role createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json(users);
  } catch (err) {
    console.error('Admin users list error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router;
