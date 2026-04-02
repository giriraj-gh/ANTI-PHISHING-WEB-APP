const router = require('express').Router();
const User = require('../models/User');
const ScanLog = require('../models/ScanLog');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
const sendMail = (to, subject, html) => transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html }).catch(console.error);
const SUPER_ADMIN = 'giriraja.ec23@bitsathy.ac.in';

router.get('/users', auth, async (req, res) => {
  try { res.json(await User.find({ role: 'user' }).select('-password')); }
  catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/admins', auth, async (req, res) => {
  try { res.json(await User.find({ role: 'admin', email: { $ne: SUPER_ADMIN } }).select('-password')); }
  catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/pending-users', auth, async (req, res) => {
  try { res.json(await User.find({ status: 'pending' }).select('-password')); }
  catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const [high, medium, low] = await Promise.all([
      ScanLog.countDocuments({ risk: 'HIGH' }),
      ScanLog.countDocuments({ risk: 'MEDIUM' }),
      ScanLog.countDocuments({ risk: 'LOW' })
    ]);
    res.json({ high, medium, low });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/scans/:risk', auth, async (req, res) => {
  try {
    const logs = await ScanLog.find({ risk: req.params.risk.toUpperCase() }).sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

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

router.get('/notifications', auth, async (req, res) => {
  try { res.json({ pendingCount: await User.countDocuments({ status: 'pending' }) }); }
  catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/login-stats', auth, async (req, res) => {
  try {
    const totalLogins = await User.aggregate([{ $group: { _id: null, total: { $sum: '$loginCount' } } }]);
    const recentLogins = await User.find({ lastLogin: { $ne: null }, role: 'user' }).select('name email lastLogin loginCount').sort({ lastLogin: -1 }).limit(10);
    const onlineCount = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 60 * 1000) }, role: 'user' });
    res.json({ totalLogins: totalLogins[0]?.total || 0, recentLogins, onlineCount });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/admin-requests', auth, async (req, res) => {
  try { res.json(await User.find({ adminRequest: 'pending' }).select('-password')); }
  catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/approve-user/:id', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.email !== SUPER_ADMIN) return res.status(403).json({ message: 'Not authorized.' });
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    sendMail(user.email, '✅ Account Approved', `<h2>Hi ${user.name}, your account has been approved!</h2><a href="${process.env.FRONTEND_URL}" style="background:#10b981;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Login Now</a>`);
    res.json({ message: 'User approved' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/reject-user/:id', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.email !== SUPER_ADMIN) return res.status(403).json({ message: 'Not authorized.' });
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    sendMail(user.email, '❌ Account Rejected', `<h2>Hi ${user.name}, your account registration has been rejected.</h2>`);
    res.json({ message: 'User rejected' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/bulk-action', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.email !== SUPER_ADMIN) return res.status(403).json({ message: 'Not authorized.' });
    const { ids, action } = req.body;
    const status = action === 'approve' ? 'approved' : 'rejected';
    const users = await User.find({ _id: { $in: ids } });
    await User.updateMany({ _id: { $in: ids } }, { status });
    users.forEach(u => sendMail(u.email, status === 'approved' ? '✅ Account Approved' : '❌ Account Rejected', `<h2>Hi ${u.name}, your account has been ${status}.</h2>`));
    res.json({ message: `${ids.length} users ${status}` });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/delete-user/:id', auth, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return res.status(404).json({ message: 'User not found.' });
    if (userToDelete.email === SUPER_ADMIN) return res.status(403).json({ message: 'Cannot delete the super admin.' });
    await User.findByIdAndDelete(req.params.id);
    await ScanLog.deleteMany({ userId: req.params.id });
    res.json({ message: 'Deleted successfully' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/approve-admin-request/:id', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.email !== SUPER_ADMIN) return res.status(403).json({ message: 'Not authorized.' });
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'admin', adminRequest: 'approved', status: 'approved' }, { new: true });
    sendMail(user.email, '✅ Admin Request Approved', `<h2>Hi ${user.name}, you now have admin access!</h2><a href="${process.env.FRONTEND_URL}" style="background:#10b981;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Login Now</a>`);
    res.json({ message: 'Admin request approved' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/reject-admin-request/:id', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.email !== SUPER_ADMIN) return res.status(403).json({ message: 'Not authorized.' });
    const user = await User.findByIdAndUpdate(req.params.id, { adminRequest: 'rejected' }, { new: true });
    sendMail(user.email, '❌ Admin Request Rejected', `<h2>Hi ${user.name}, your admin request has been rejected.</h2>`);
    res.json({ message: 'Admin request rejected' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/request-admin', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role === 'admin') return res.status(400).json({ message: 'Already an admin.' });
    if (user.adminRequest === 'pending') return res.status(400).json({ message: 'Request already pending.' });
    await User.findByIdAndUpdate(req.user.id, { adminRequest: 'pending' });
    sendMail(SUPER_ADMIN, '🔔 Admin Role Request', `<h2>Admin Role Request</h2><p><b>Name:</b> ${user.name}</p><p><b>Email:</b> ${user.email}</p><a href="${process.env.FRONTEND_URL}" style="background:#8b5cf6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Go to Dashboard</a>`);
    res.json({ message: 'Admin request sent successfully!' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/reseed', async (req, res) => {
  try {
    const Lesson = require('../models/Lesson');
    const Quiz = require('../models/Quiz');
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    await Lesson.create([
      { title: 'Introduction to Phishing', description: 'Learn the basics of phishing attacks', content: '<h3>What is Phishing?</h3><p>Phishing is a cybercrime where attackers impersonate legitimate organizations to steal sensitive information.</p>', icon: '🎣', level: 'Beginner', duration: '15 min', isFree: true, status: 'active' },
      { title: 'Email Security Best Practices', description: 'Essential tips for email security', content: '<h3>Email Red Flags</h3><p>Learn to spot suspicious emails by checking sender addresses, links, and attachments.</p>', icon: '📧', level: 'Beginner', duration: '20 min', isFree: true, status: 'active' },
      { title: 'URL Analysis and Safe Browsing', description: 'Advanced URL inspection techniques', content: '<h3>URL Inspection</h3><p>Master identifying malicious links by analyzing URL structure and domain names.</p>', icon: '🔗', level: 'Intermediate', duration: '25 min', isFree: true, status: 'active' },
      { title: 'Social Engineering Attacks', description: 'Understanding manipulation tactics', content: '<h3>Social Engineering</h3><p>Attackers manipulate people psychologically to gain access to systems and data.</p>', icon: '🧠', level: 'Intermediate', duration: '20 min', isFree: false, status: 'waiting' },
      { title: 'Spear Phishing', description: 'Targeted phishing attacks explained', content: '<h3>Spear Phishing</h3><p>Unlike generic phishing, spear phishing targets specific individuals using personal information.</p>', icon: '🎯', level: 'Intermediate', duration: '20 min', isFree: false, status: 'waiting' },
      { title: 'Smishing and Vishing', description: 'SMS and voice phishing attacks', content: '<h3>Smishing & Vishing</h3><p>Phishing attacks via SMS (smishing) and phone calls (vishing) are increasingly common.</p>', icon: '📱', level: 'Beginner', duration: '15 min', isFree: false, status: 'waiting' },
      { title: 'Password Security', description: 'Creating and managing strong passwords', content: '<h3>Password Best Practices</h3><p>Use long, unique passwords for every account and enable two-factor authentication.</p>', icon: '🔐', level: 'Beginner', duration: '15 min', isFree: false, status: 'waiting' },
      { title: 'Two-Factor Authentication', description: 'Adding an extra layer of security', content: '<h3>2FA Explained</h3><p>Two-factor authentication adds a second verification step, making accounts much harder to compromise.</p>', icon: '🛡️', level: 'Beginner', duration: '15 min', isFree: false, status: 'waiting' },
      { title: 'Malware and Ransomware', description: 'Understanding malicious software', content: '<h3>Malware Types</h3><p>Malware includes viruses, trojans, and ransomware that can encrypt your files and demand payment.</p>', icon: '🦠', level: 'Intermediate', duration: '25 min', isFree: false, status: 'waiting' },
      { title: 'Safe Online Shopping', description: 'Protect yourself while shopping online', content: '<h3>Online Shopping Safety</h3><p>Always verify website security, use credit cards, and avoid public Wi-Fi when shopping online.</p>', icon: '🛒', level: 'Beginner', duration: '15 min', isFree: false, status: 'waiting' },
      { title: 'Wi-Fi Security', description: 'Staying safe on public networks', content: '<h3>Wi-Fi Risks</h3><p>Public Wi-Fi networks can be monitored by attackers. Always use a VPN on public networks.</p>', icon: '📶', level: 'Intermediate', duration: '20 min', isFree: false, status: 'waiting' },
      { title: 'Data Privacy Fundamentals', description: 'Protecting your personal information', content: '<h3>Data Privacy</h3><p>Understand what data companies collect and how to minimize your digital footprint.</p>', icon: '🔒', level: 'Beginner', duration: '20 min', isFree: false, status: 'waiting' },
      { title: 'Recognizing Fake Websites', description: 'Spot cloned and fraudulent websites', content: '<h3>Fake Websites</h3><p>Fraudulent websites mimic legitimate ones. Check SSL certificates, domain spelling, and design quality.</p>', icon: '🌐', level: 'Intermediate', duration: '20 min', isFree: false, status: 'waiting' },
      { title: 'Corporate Phishing Defense', description: 'Protecting your organization', content: '<h3>Corporate Defense</h3><p>Organizations must train employees, implement email filters, and establish incident response plans.</p>', icon: '🏢', level: 'Advanced', duration: '30 min', isFree: false, status: 'waiting' },
      { title: 'Incident Response', description: 'What to do after a phishing attack', content: '<h3>Incident Response</h3><p>If you fall victim to phishing, immediately change passwords, notify your bank, and report to authorities.</p>', icon: '🚨', level: 'Advanced', duration: '30 min', isFree: false, status: 'waiting' }
    ]);
    const quizData = [
      { title: 'Phishing Basics Quiz', description: 'Test your knowledge', isDemo: true, status: 'active' },
      { title: 'Email Security Quiz', description: 'Email security awareness', isDemo: true, status: 'active' },
      { title: 'URL Analysis Quiz', description: 'URL inspection skills', isDemo: false, status: 'active' },
      { title: 'Social Engineering Quiz', description: 'Manipulation tactics', isDemo: false, status: 'waiting' },
      { title: 'Spear Phishing Quiz', description: 'Targeted attack scenarios', isDemo: false, status: 'waiting' },
      { title: 'Mobile Security Quiz', description: 'Smishing and vishing', isDemo: false, status: 'waiting' },
      { title: 'Password Security Quiz', description: 'Password knowledge', isDemo: false, status: 'waiting' },
      { title: 'Two-Factor Authentication Quiz', description: 'Understanding 2FA', isDemo: false, status: 'waiting' },
      { title: 'Malware Defense Quiz', description: 'Malicious software', isDemo: false, status: 'waiting' },
      { title: 'Online Shopping Safety Quiz', description: 'Safe e-commerce', isDemo: false, status: 'waiting' }
    ];
    for (const q of quizData) {
      await Quiz.create({ ...q, questions: Array.from({ length: 20 }, (_, i) => ({ question: `${q.title} - Q${i + 1}: What is the best security practice?`, options: ['Always verify the source', 'Ignore warnings', 'Share your password', 'Click all links'], correctAnswer: 'Always verify the source' })) });
    }
    res.json({ message: '✅ 3 active + 12 waiting lessons, 3 active + 7 waiting quizzes seeded!' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
