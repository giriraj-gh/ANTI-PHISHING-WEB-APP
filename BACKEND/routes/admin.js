const router = require('express').Router();
const User = require('../models/User');
const ScanLog = require('../models/ScanLog');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});
const sendMail = (to, subject, html) => transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html }).catch(console.error);

const SUPER_ADMIN = 'giriraja.ec23@bitsathy.ac.in';

router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/pending-users', auth, async (req, res) => {
  try {
    const users = await User.find({ status: 'pending' }).select('-password');
    res.json(users);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/approve-user/:id', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.email !== SUPER_ADMIN) return res.status(403).json({ message: 'Not authorized.' });
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    sendMail(user.email, '✅ Account Approved',
      `<h2>Your account has been approved!</h2><p>Hi ${user.name}, your account has been approved. You can now login.</p><a href="${process.env.FRONTEND_URL}" style="background:#10b981;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Login Now</a>`);
    res.json({ message: 'User approved' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/reject-user/:id', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.email !== SUPER_ADMIN) return res.status(403).json({ message: 'Not authorized.' });
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    sendMail(user.email, '❌ Account Rejected',
      `<h2>Account Registration Update</h2><p>Hi ${user.name}, unfortunately your account registration has been rejected. Contact support for more information.</p>`);
    res.json({ message: 'User rejected' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Bulk approve/reject
router.put('/bulk-action', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.email !== SUPER_ADMIN) return res.status(403).json({ message: 'Not authorized.' });
    const { ids, action } = req.body;
    const status = action === 'approve' ? 'approved' : 'rejected';
    const users = await User.find({ _id: { $in: ids } });
    await User.updateMany({ _id: { $in: ids } }, { status });
    users.forEach(user => {
      if (action === 'approve') {
        sendMail(user.email, '✅ Account Approved',
          `<h2>Your account has been approved!</h2><p>Hi ${user.name}, you can now login.</p><a href="${process.env.FRONTEND_URL}" style="background:#10b981;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Login Now</a>`);
      } else {
        sendMail(user.email, '❌ Account Rejected',
          `<h2>Account Registration Update</h2><p>Hi ${user.name}, your account has been rejected.</p>`);
      }
    });
    res.json({ message: `${ids.length} users ${status}` });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Delete user
router.delete('/delete-user/:id', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await ScanLog.deleteMany({ userId: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const logs = await ScanLog.find();
    const high = logs.filter(s => s.risk === 'HIGH').length;
    const medium = logs.filter(s => s.risk === 'MEDIUM').length;
    const low = logs.filter(s => s.risk === 'LOW').length;
    res.json({ high, medium, low });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Real trend data - last 7 days
router.get('/trends', auth, async (req, res) => {
  try {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      const count = await ScanLog.countDocuments({ createdAt: { $gte: start, $lte: end } });
      result.push({ day: days[start.getDay()], threats: count });
    }
    res.json(result);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Notifications - pending count
router.get('/notifications', auth, async (req, res) => {
  try {
    const pendingCount = await User.countDocuments({ status: 'pending' });
    res.json({ pendingCount });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// User requests admin role
router.post('/request-admin', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role === 'admin') return res.status(400).json({ message: 'Already an admin.' });
    if (user.adminRequest === 'pending') return res.status(400).json({ message: 'Request already pending.' });
    await User.findByIdAndUpdate(req.user.id, { adminRequest: 'pending' });
    sendMail(SUPER_ADMIN, '🔔 Admin Role Request',
      `<h2>Admin Role Request</h2><p><b>Name:</b> ${user.name}</p><p><b>Email:</b> ${user.email}</p><p>This user is requesting admin access. Login to approve or reject.</p><a href="${process.env.FRONTEND_URL}" style="background:#8b5cf6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Go to Dashboard</a>`);
    res.json({ message: 'Admin request sent successfully!' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Get all admin requests
router.get('/admin-requests', auth, async (req, res) => {
  try {
    const users = await User.find({ adminRequest: 'pending' }).select('-password');
    res.json(users);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Approve admin request
router.put('/approve-admin-request/:id', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.email !== SUPER_ADMIN) return res.status(403).json({ message: 'Not authorized.' });
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'admin', adminRequest: 'approved', status: 'approved' }, { new: true });
    sendMail(user.email, '✅ Admin Request Approved',
      `<h2>Your admin request has been approved!</h2><p>Hi ${user.name}, you now have admin access.</p><a href="${process.env.FRONTEND_URL}" style="background:#10b981;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Login Now</a>`);
    res.json({ message: 'Admin request approved' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Reject admin request
router.put('/reject-admin-request/:id', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.email !== SUPER_ADMIN) return res.status(403).json({ message: 'Not authorized.' });
    const user = await User.findByIdAndUpdate(req.params.id, { adminRequest: 'rejected' }, { new: true });
    sendMail(user.email, '❌ Admin Request Rejected',
      `<h2>Admin Request Update</h2><p>Hi ${user.name}, your request for admin access has been rejected.</p>`);
    res.json({ message: 'Admin request rejected' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// Login stats - count and history
router.get('/login-stats', auth, async (req, res) => {
  try {
    const totalLogins = await User.aggregate([{ $group: { _id: null, total: { $sum: '$loginCount' } } }]);
    const recentLogins = await User.find({ lastLogin: { $ne: null }, role: 'user' })
      .select('name email lastLogin loginCount')
      .sort({ lastLogin: -1 })
      .limit(10);
    const onlineCount = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
      role: 'user'
    });
    res.json({
      totalLogins: totalLogins[0]?.total || 0,
      recentLogins,
      onlineCount
    });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// One-time cleanup: convert all other admins to users
router.post('/cleanup-admins', async (req, res) => {
  try {
    const result = await User.updateMany(
      { role: 'admin', email: { $ne: 'giriraja.ec23@bitsathy.ac.in' } },
      { role: 'user', status: 'pending' }
    );
    res.json({ message: `${result.modifiedCount} admin accounts converted to users` });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
