const router = require('express').Router();
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const sendMail = (to, subject, html) => transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html }).catch(console.error);

const SUPER_ADMIN = 'giriraja.ec23@bitsathy.ac.in';

router.post('/register', loginLimiter, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered.' });
    const hashed = await bcrypt.hash(password, 10);
    // Only giriraja.ec23@bitsathy.ac.in can be admin, everyone else is user
    const assignedRole = (email === SUPER_ADMIN) ? 'admin' : 'user';
    const status = assignedRole === 'admin' ? 'approved' : 'pending';
    await User.create({ name, email, password: hashed, role: assignedRole, status });
    // Notify admin if new user registered
    if (assignedRole === 'user') {
      sendMail(SUPER_ADMIN, '🔔 New User Registration',
        `<h2>New user registration</h2><p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p>Login to admin panel to approve or reject.</p>`
      );
    }
    res.json({ message: assignedRole === 'admin' ? 'Admin account created!' : 'Registration successful! Please wait for admin approval.' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password, role } = req.body;
    // Block non-super-admin from logging in as admin
    if (role === 'admin' && email !== SUPER_ADMIN) {
      return res.status(403).json({ message: 'You are not authorized as admin.' });
    }
    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials.' });
    if (user.status === 'pending') return res.status(403).json({ message: 'Your account is pending admin approval.' });
    if (user.status === 'rejected') return res.status(403).json({ message: 'Your account has been rejected.' });
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date(), $inc: { loginCount: 1 } });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role, user });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email not found.' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendMail(email, '🔐 Reset Your Password',
      `<h2>Password Reset</h2><p>Click the link below to reset your password. This link expires in 1 hour.</p><a href="${resetUrl}" style="background:#8b5cf6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Reset Password</a>`);
    res.json({ message: 'Reset link sent to your email.' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset/:token', async (req, res) => {
  try {
    const { id } = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const hashed = await bcrypt.hash(req.body.password, 10);
    await User.findByIdAndUpdate(id, { password: hashed });
    res.json({ message: 'Password updated successfully.' });
  } catch (e) {
    res.status(400).json({ message: 'Invalid or expired reset link.' });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, req.body);
    res.json({ message: 'Profile updated' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
