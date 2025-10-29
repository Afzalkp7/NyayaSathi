const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/authMiddleware')

router.get('/protected', auth, (req, res) => {
    res.json({ msg: 'You are authenticated', user: req.user });
});

router.get('/admin', auth, admin, (req, res) => {
    res.json({ msg: 'Welcome Admin', user: req.user });
});

module.exports = router;