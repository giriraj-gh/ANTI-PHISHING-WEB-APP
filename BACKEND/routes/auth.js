const router = require('express').Router();
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/register', loginLimiter, async (req, res) => {
  const bcrypt = require('bcryptjs');
  const User = require('../models/User');
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered.' });
    const hashed = await bcrypt.hash(password, 10);
    const status = role === 'admin' ? 'pending' : 'pending';
    await User.create({ name, email, password: hashed, role, status });
    res.json({ message: 'Registration successful! Please wait for admin approval.' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials.' });
    if (user.status === 'pending') return res.status(403).json({ message: 'Your account is pending admin approval.' });
    if (user.status === 'rejected') return res.status(403).json({ message: 'Your account has been rejected.' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role, user });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile', auth, async (req, res) => {
  const User = require('../models/User');
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', auth, async (req, res) => {
  const User = require('../models/User');
  try {
    await User.findByIdAndUpdate(req.user.id, req.body);
    res.json({ message: 'Profile updated' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
