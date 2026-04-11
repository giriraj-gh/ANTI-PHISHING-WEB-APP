const router = require('express').Router();
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const sendMail = (to, subject, html) =>
  transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html }).catch(console.error);

const SUPER_ADMIN = 'giriraja.ec23@bitsathy.ac.in';

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', loginLimiter, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered.' });
    const hashed = await bcrypt.hash(password, 10);
    const assignedRole = (email === SUPER_ADMIN) ? 'admin' : (role === 'admin' ? 'admin' : 'user');
    const status = (email === SUPER_ADMIN || assignedRole === 'user') ? 'approved' : 'pending';

    // Email verification token for regular users
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const emailVerified = email === SUPER_ADMIN; // super admin auto-verified

    await User.create({ name, email, password: hashed, role: assignedRole, status, emailVerifyToken, emailVerified });

    // Send verification email to regular users
    if (email !== SUPER_ADMIN && assignedRole === 'user') {
      const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${emailVerifyToken}`;
      sendMail(email, '✅ Verify Your Email - AntiPhishing',
        `<h2>Hi ${name}, verify your email</h2>
         <p>Click the button below to verify your email address.</p>
         <a href="${verifyUrl}" style="background:#10b981;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:1rem;">Verify Email</a>
         <p style="margin-top:1rem;opacity:0.7;font-size:0.9rem;">Link expires in 24 hours.</p>`
      );
    }

    if (email !== SUPER_ADMIN && assignedRole === 'admin') {
      sendMail(SUPER_ADMIN, '🔔 New Admin Registration Request',
        `<h2>New Admin Registration</h2><p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p>
         <a href="${process.env.FRONTEND_URL}" style="background:#8b5cf6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Go to Dashboard</a>`
      );
    }

    res.json({
      message: email === SUPER_ADMIN
        ? 'Admin account created!'
        : assignedRole === 'admin'
          ? 'Admin registration successful! Pending approval from super admin.'
          : 'Registration successful! Please check your email to verify your account.'
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Verify Email ──────────────────────────────────────────────────────────────
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({ emailVerifyToken: req.params.token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification link.' });
    await User.findByIdAndUpdate(user._id, { emailVerified: true, emailVerifyToken: null });
    res.json({ message: 'Email verified successfully! You can now login.' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (role === 'admin' && email !== SUPER_ADMIN) {
      const adminUser = await User.findOne({ email, role: 'admin' });
      if (!adminUser) return res.status(403).json({ message: 'You are not authorized as admin.' });
      if (adminUser.status !== 'approved') return res.status(403).json({ message: 'Your admin account is pending approval.' });
    }
    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials.' });
    if (user.status === 'pending') return res.status(403).json({ message: 'Your account is pending admin approval.' });
    if (user.status === 'rejected') return res.status(403).json({ message: 'Your account has been rejected.' });
    // Email verification check skipped - existing users not blocked

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '7d' });

    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      $inc: { loginCount: 1 },
      refreshToken
    });

    res.json({ token: accessToken, refreshToken, role: user.role, user });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Refresh Token ─────────────────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token.' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) return res.status(403).json({ message: 'Invalid refresh token.' });
    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ token: accessToken });
  } catch (e) {
    res.status(403).json({ message: 'Refresh token expired. Please login again.' });
  }
});

// ── Logout ────────────────────────────────────────────────────────────────────
router.post('/logout', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
    res.json({ message: 'Logged out successfully.' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Forgot Password ───────────────────────────────────────────────────────────
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email not found.' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendMail(email, '🔐 Reset Your Password',
      `<h2>Password Reset</h2><p>Click the link below to reset your password. Expires in 1 hour.</p>
       <a href="${resetUrl}" style="background:#8b5cf6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Reset Password</a>`);
    res.json({ message: 'Reset link sent to your email.' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Reset Password ────────────────────────────────────────────────────────────
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

// ── Profile ───────────────────────────────────────────────────────────────────
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken -emailVerifyToken');
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    // Don't allow updating sensitive fields via profile endpoint
    const { password, role, status, refreshToken, emailVerifyToken, ...safe } = req.body;
    await User.findByIdAndUpdate(req.user.id, safe);
    res.json({ message: 'Profile updated' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Notifications ─────────────────────────────────────────────────────────────
router.get('/my-notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    res.json(user.notifications || []);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/mark-notifications-read', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $set: { 'notifications.$[].read': true } });
    res.json({ message: 'Notifications marked as read' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Bookmarks ─────────────────────────────────────────────────────────────────
router.post('/bookmark/:lessonId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const id = req.params.lessonId;
    const isBookmarked = user.bookmarks.includes(id);
    if (isBookmarked) {
      await User.findByIdAndUpdate(req.user.id, { $pull: { bookmarks: id } });
      res.json({ bookmarked: false, message: 'Bookmark removed' });
    } else {
      await User.findByIdAndUpdate(req.user.id, { $addToSet: { bookmarks: id } });
      res.json({ bookmarked: true, message: 'Lesson bookmarked' });
    }
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/bookmarks', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('bookmarks');
    res.json(user.bookmarks || []);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Dark Mode Preference ──────────────────────────────────────────────────────
router.put('/dark-mode', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { darkMode: req.body.darkMode });
    res.json({ message: 'Preference saved' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Resend Verification ───────────────────────────────────────────────────────
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email not found.' });
    if (user.emailVerified) return res.status(400).json({ message: 'Email already verified.' });
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    await User.findByIdAndUpdate(user._id, { emailVerifyToken });
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${emailVerifyToken}`;
    sendMail(email, '✅ Verify Your Email - AntiPhishing',
      `<h2>Hi ${user.name}, verify your email</h2>
       <a href="${verifyUrl}" style="background:#10b981;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Verify Email</a>`
    );
    res.json({ message: 'Verification email resent.' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
