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
      ScanLog.countDocuments({ risk: { $in: ['HIGH', 'Phishing'] } }),
      ScanLog.countDocuments({ risk: { $in: ['MEDIUM', 'Suspicious'] } }),
      ScanLog.countDocuments({ risk: { $in: ['LOW', 'Safe'] } })
    ]);
    res.json({ high, medium, low });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/scans/:risk', auth, async (req, res) => {
  try {
    const r = req.params.risk.toUpperCase();
    const riskMap = { HIGH: ['HIGH', 'Phishing'], MEDIUM: ['MEDIUM', 'Suspicious'], LOW: ['LOW', 'Safe'] };
    const risks = riskMap[r] || [r];
    const logs = await ScanLog.find({ risk: { $in: risks } }).sort({ createdAt: -1 }).limit(20);
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
    const user = await User.findByIdAndUpdate(req.params.id, {
      status: 'approved',
      $push: { notifications: { message: '✅ Your account has been approved! You can now login.', type: 'success' } }
    }, { new: true });
    sendMail(user.email, '✅ Account Approved', `<h2>Hi ${user.name}, your account has been approved!</h2><a href="${process.env.FRONTEND_URL}" style="background:#10b981;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Login Now</a>`);
    res.json({ message: 'User approved' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/reject-user/:id', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.email !== SUPER_ADMIN) return res.status(403).json({ message: 'Not authorized.' });
    const user = await User.findByIdAndUpdate(req.params.id, {
      status: 'rejected',
      $push: { notifications: { message: '❌ Your account registration has been rejected. Contact support for help.', type: 'warning' } }
    }, { new: true });
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
      { title: 'Introduction to Phishing', description: 'Learn the basics of phishing attacks', content: '<h3>What is Phishing?</h3><p>Phishing is a cybercrime where attackers impersonate legitimate organizations to steal sensitive information. They use fake emails, websites, and messages to trick victims.</p><h3>Common Signs</h3><ul><li>Urgent or threatening language</li><li>Suspicious sender email addresses</li><li>Requests for personal information</li><li>Unexpected attachments or links</li></ul>', icon: '🎣', level: 'Beginner', duration: '15 min', isFree: true, status: 'active' },
      { title: 'Email Security Best Practices', description: 'Essential tips for email security', content: '<h3>Email Red Flags</h3><p>Learn to spot suspicious emails by checking sender addresses, links, and attachments.</p><h3>Best Practices</h3><ul><li>Verify sender email addresses carefully</li><li>Never click suspicious links</li><li>Do not open unexpected attachments</li><li>Enable spam filters</li><li>Use email encryption when possible</li></ul>', icon: '📧', level: 'Beginner', duration: '20 min', isFree: true, status: 'active' },
      { title: 'URL Analysis and Safe Browsing', description: 'Advanced URL inspection techniques', content: '<h3>URL Inspection</h3><p>Master identifying malicious links by analyzing URL structure and domain names.</p><h3>How to Check URLs</h3><ul><li>Look for HTTPS in the address bar</li><li>Check for misspelled domain names</li><li>Hover over links before clicking</li><li>Use URL scanners like VirusTotal</li><li>Avoid shortened URLs from unknown sources</li></ul>', icon: '🔗', level: 'Intermediate', duration: '25 min', isFree: true, status: 'active' },
      { title: 'Social Engineering Attacks', description: 'Understanding manipulation tactics', content: '<h3>Social Engineering</h3><p>Attackers manipulate people psychologically to gain access to systems and data.</p><h3>Common Tactics</h3><ul><li>Pretexting - creating false scenarios</li><li>Baiting - offering something enticing</li><li>Quid pro quo - offering a service for information</li><li>Tailgating - following someone into restricted areas</li></ul>', icon: '🧠', level: 'Intermediate', duration: '20 min', isFree: false, status: 'active' },
      { title: 'Spear Phishing', description: 'Targeted phishing attacks explained', content: '<h3>Spear Phishing</h3><p>Unlike generic phishing, spear phishing targets specific individuals using personal information.</p><h3>How to Protect Yourself</h3><ul><li>Be cautious of personalized emails</li><li>Verify requests through official channels</li><li>Limit personal information shared online</li><li>Use multi-factor authentication</li></ul>', icon: '🎯', level: 'Intermediate', duration: '20 min', isFree: false, status: 'active' },
      { title: 'Password Security', description: 'Creating and managing strong passwords', content: '<h3>Password Best Practices</h3><p>Use long, unique passwords for every account and enable two-factor authentication.</p><h3>Tips</h3><ul><li>Use at least 12 characters</li><li>Mix letters, numbers, and symbols</li><li>Never reuse passwords</li><li>Use a password manager</li><li>Enable 2FA on all accounts</li></ul>', icon: '🔐', level: 'Beginner', duration: '15 min', isFree: true, status: 'active' },
      { title: 'Two-Factor Authentication', description: 'Adding an extra layer of security', content: '<h3>2FA Explained</h3><p>Two-factor authentication adds a second verification step, making accounts much harder to compromise.</p><h3>Types of 2FA</h3><ul><li>SMS codes</li><li>Authenticator apps (Google, Microsoft)</li><li>Hardware security keys</li><li>Biometric verification</li></ul>', icon: '🛡️', level: 'Beginner', duration: '15 min', isFree: true, status: 'active' },
      { title: 'Malware and Ransomware', description: 'Understanding malicious software', content: '<h3>Malware Types</h3><p>Malware includes viruses, trojans, and ransomware that can encrypt your files and demand payment.</p><h3>Prevention</h3><ul><li>Keep software updated</li><li>Use reputable antivirus software</li><li>Backup data regularly</li><li>Avoid downloading from untrusted sources</li></ul>', icon: '🦠', level: 'Intermediate', duration: '25 min', isFree: false, status: 'active' },
      { title: 'Safe Online Shopping', description: 'Protect yourself while shopping online', content: '<h3>Online Shopping Safety</h3><p>Always verify website security, use credit cards, and avoid public Wi-Fi when shopping online.</p><h3>Safe Shopping Tips</h3><ul><li>Only shop on HTTPS websites</li><li>Use credit cards not debit cards</li><li>Check seller reviews</li><li>Avoid public WiFi for transactions</li><li>Monitor bank statements regularly</li></ul>', icon: '🛒', level: 'Beginner', duration: '15 min', isFree: false, status: 'active' },
      { title: 'Wi-Fi Security', description: 'Staying safe on public networks', content: '<h3>Wi-Fi Risks</h3><p>Public Wi-Fi networks can be monitored by attackers. Always use a VPN on public networks.</p><h3>Protection Tips</h3><ul><li>Use a VPN on public networks</li><li>Avoid accessing sensitive accounts on public WiFi</li><li>Turn off auto-connect to WiFi</li><li>Use your mobile data for sensitive tasks</li></ul>', icon: '📶', level: 'Intermediate', duration: '20 min', isFree: false, status: 'active' }
    ]);
    const quizData = [
      { title: 'Phishing Basics Quiz', description: 'Test your knowledge on phishing fundamentals', isDemo: true, status: 'active',
        questions: [
          { question: 'What is phishing?', options: ['A cybercrime to steal information', 'A type of fishing sport', 'A computer virus', 'A firewall type'], correctAnswer: 'A cybercrime to steal information' },
          { question: 'Which is a common sign of a phishing email?', options: ['Urgent language requesting personal info', 'Professional company logo', 'Correct grammar', 'Known sender address'], correctAnswer: 'Urgent language requesting personal info' },
          { question: 'What should you do if you receive a suspicious email?', options: ['Delete it and report it', 'Click all links to verify', 'Reply with your details', 'Forward to friends'], correctAnswer: 'Delete it and report it' },
          { question: 'What does HTTPS mean in a URL?', options: ['Secure encrypted connection', 'High Transfer Protocol', 'Hypertext Phishing System', 'None of the above'], correctAnswer: 'Secure encrypted connection' },
          { question: 'Spear phishing targets:', options: ['Specific individuals', 'Random people', 'Only companies', 'Only governments'], correctAnswer: 'Specific individuals' }
        ]
      },
      { title: 'Email Security Quiz', description: 'Assess your email security awareness', isDemo: true, status: 'active',
        questions: [
          { question: 'What should you check before clicking a link in an email?', options: ['Hover to see the actual URL', 'The email subject', 'The time it was sent', 'The email size'], correctAnswer: 'Hover to see the actual URL' },
          { question: 'Which email attachment is most dangerous?', options: ['.exe files from unknown senders', '.txt files', '.jpg images', '.pdf from known contacts'], correctAnswer: '.exe files from unknown senders' },
          { question: 'What is email spoofing?', options: ['Faking the sender address', 'Encrypting emails', 'Blocking spam', 'Forwarding emails'], correctAnswer: 'Faking the sender address' },
          { question: 'Best practice for email passwords:', options: ['Use unique strong passwords', 'Use same password everywhere', 'Use your birthday', 'Use simple words'], correctAnswer: 'Use unique strong passwords' },
          { question: 'What is 2FA for email?', options: ['Two-step verification', 'Two email accounts', 'Two passwords', 'Two spam filters'], correctAnswer: 'Two-step verification' }
        ]
      },
      { title: 'URL Safety Quiz', description: 'Test your URL inspection skills', isDemo: false, status: 'active',
        questions: [
          { question: 'Which URL is safer?', options: ['https://bank.com', 'http://bank.com', 'https://bank-login.xyz', 'http://secure-bank.net'], correctAnswer: 'https://bank.com' },
          { question: 'What does a padlock icon in browser mean?', options: ['Encrypted connection', 'Safe website', 'No viruses', 'Government approved'], correctAnswer: 'Encrypted connection' },
          { question: 'What is a URL shortener risk?', options: ['Hides the real destination', 'Makes URLs longer', 'Slows internet', 'Blocks websites'], correctAnswer: 'Hides the real destination' },
          { question: 'How to verify a suspicious URL?', options: ['Use VirusTotal.com', 'Just click it', 'Ask a friend', 'Ignore it'], correctAnswer: 'Use VirusTotal.com' },
          { question: 'What is typosquatting?', options: ['Fake domains with misspellings', 'Typing errors', 'URL encryption', 'Domain registration'], correctAnswer: 'Fake domains with misspellings' }
        ]
      },
      { title: 'Password Security Quiz', description: 'Test your password knowledge', isDemo: false, status: 'active',
        questions: [
          { question: 'What makes a strong password?', options: ['Mix of letters, numbers, symbols', 'Your name', 'Simple words', 'Short passwords'], correctAnswer: 'Mix of letters, numbers, symbols' },
          { question: 'How often should you change passwords?', options: ['Regularly or when compromised', 'Never', 'Every day', 'Only once'], correctAnswer: 'Regularly or when compromised' },
          { question: 'What is a password manager?', options: ['Tool to store passwords securely', 'A person who manages passwords', 'A browser feature', 'An antivirus'], correctAnswer: 'Tool to store passwords securely' },
          { question: 'Should you reuse passwords?', options: ['No, use unique passwords', 'Yes, easier to remember', 'Only for unimportant sites', 'Yes always'], correctAnswer: 'No, use unique passwords' },
          { question: 'What is 2FA?', options: ['Two-factor authentication', 'Two passwords', 'Two accounts', 'Two devices'], correctAnswer: 'Two-factor authentication' }
        ]
      },
      { title: 'Social Engineering Quiz', description: 'Understand manipulation tactics', isDemo: false, status: 'active',
        questions: [
          { question: 'What is social engineering?', options: ['Manipulating people to reveal info', 'Building social networks', 'Engineering software', 'Social media marketing'], correctAnswer: 'Manipulating people to reveal info' },
          { question: 'What is pretexting?', options: ['Creating false scenarios to get info', 'Sending fake emails', 'Hacking passwords', 'Installing malware'], correctAnswer: 'Creating false scenarios to get info' },
          { question: 'How to protect against social engineering?', options: ['Verify identities before sharing info', 'Trust everyone', 'Share info freely', 'Ignore security policies'], correctAnswer: 'Verify identities before sharing info' },
          { question: 'What is baiting in cybersecurity?', options: ['Offering something enticing to get info', 'Fishing attack', 'Email spam', 'Password theft'], correctAnswer: 'Offering something enticing to get info' },
          { question: 'Best defense against social engineering?', options: ['Security awareness training', 'Better antivirus', 'Stronger passwords', 'More firewalls'], correctAnswer: 'Security awareness training' }
        ]
      }
    ];
    for (const q of quizData) {
      await Quiz.create(q);
    }
      { title: 'Malware Awareness Quiz', description: 'Test your knowledge on malware and ransomware', isDemo: false, status: 'active',
        questions: [
          { question: 'What is ransomware?', options: ['Malware that encrypts files and demands payment', 'A type of antivirus', 'A firewall software', 'A browser extension'], correctAnswer: 'Malware that encrypts files and demands payment' },
          { question: 'How does malware usually enter a system?', options: ['Through malicious email attachments', 'Through HTTPS websites', 'Through strong passwords', 'Through VPN connections'], correctAnswer: 'Through malicious email attachments' },
          { question: 'What is a trojan horse in cybersecurity?', options: ['Malware disguised as legitimate software', 'A type of firewall', 'An antivirus program', 'A secure browser'], correctAnswer: 'Malware disguised as legitimate software' },
          { question: 'Best protection against ransomware?', options: ['Regular data backups', 'Using public WiFi', 'Disabling antivirus', 'Opening all email attachments'], correctAnswer: 'Regular data backups' },
          { question: 'What should you do if your system is infected with malware?', options: ['Disconnect from internet and run antivirus', 'Continue using normally', 'Share files with others', 'Ignore it'], correctAnswer: 'Disconnect from internet and run antivirus' }
        ]
      },
      { title: 'Wi-Fi Security Quiz', description: 'Test your knowledge on wireless network security', isDemo: false, status: 'active',
        questions: [
          { question: 'What is a man-in-the-middle attack on WiFi?', options: ['Attacker intercepts communication between two parties', 'A type of password attack', 'A firewall bypass', 'A DNS attack'], correctAnswer: 'Attacker intercepts communication between two parties' },
          { question: 'What should you use on public WiFi?', options: ['A VPN', 'No protection needed', 'Public DNS', 'HTTP websites'], correctAnswer: 'A VPN' },
          { question: 'What is a rogue access point?', options: ['A fake WiFi hotspot set up by attackers', 'A secure router', 'A VPN server', 'A firewall device'], correctAnswer: 'A fake WiFi hotspot set up by attackers' },
          { question: 'Which WiFi encryption is most secure?', options: ['WPA3', 'WEP', 'WPA', 'No encryption'], correctAnswer: 'WPA3' },
          { question: 'Should you auto-connect to known WiFi networks?', options: ['No, disable auto-connect', 'Yes always', 'Only at home', 'Only for work networks'], correctAnswer: 'No, disable auto-connect' }
        ]
      },
      { title: 'Safe Online Shopping Quiz', description: 'Test your online shopping security knowledge', isDemo: false, status: 'active',
        questions: [
          { question: 'What should you check before entering payment details online?', options: ['HTTPS and padlock icon', 'Website color scheme', 'Number of products', 'Page loading speed'], correctAnswer: 'HTTPS and padlock icon' },
          { question: 'Which payment method is safer for online shopping?', options: ['Credit card with fraud protection', 'Debit card', 'Bank transfer', 'Cash on delivery only'], correctAnswer: 'Credit card with fraud protection' },
          { question: 'What is a fake online store?', options: ['A fraudulent website mimicking a real store', 'A store with low prices', 'A store without reviews', 'A new online store'], correctAnswer: 'A fraudulent website mimicking a real store' },
          { question: 'How to verify an online seller is legitimate?', options: ['Check reviews and verify contact details', 'Just buy and hope for the best', 'Trust all websites equally', 'Only check the price'], correctAnswer: 'Check reviews and verify contact details' },
          { question: 'What should you do after online shopping on public WiFi?', options: ['Change your passwords immediately', 'Nothing extra needed', 'Delete your browser', 'Restart your device'], correctAnswer: 'Change your passwords immediately' }
        ]
      },
      { title: 'Two-Factor Authentication Quiz', description: 'Test your 2FA knowledge', isDemo: true, status: 'active',
        questions: [
          { question: 'What does 2FA stand for?', options: ['Two-Factor Authentication', 'Two-File Access', 'Two-Form Authorization', 'Two-Factor Application'], correctAnswer: 'Two-Factor Authentication' },
          { question: 'Which 2FA method is most secure?', options: ['Hardware security key', 'SMS code', 'Email code', 'Security questions'], correctAnswer: 'Hardware security key' },
          { question: 'What is an authenticator app?', options: ['App that generates time-based one-time passwords', 'A password manager', 'An antivirus app', 'A VPN app'], correctAnswer: 'App that generates time-based one-time passwords' },
          { question: 'Should you share your 2FA code with anyone?', options: ['Never share it with anyone', 'Share with trusted friends', 'Share with IT support', 'Share if asked politely'], correctAnswer: 'Never share it with anyone' },
          { question: 'What happens if you lose your 2FA device?', options: ['Use backup codes to recover access', 'Account is permanently lost', 'Password alone is enough', 'Contact the attacker'], correctAnswer: 'Use backup codes to recover access' }
        ]
      },
      { title: 'Spear Phishing Quiz', description: 'Test your knowledge on targeted phishing attacks', isDemo: false, status: 'active',
        questions: [
          { question: 'What makes spear phishing different from regular phishing?', options: ['It targets specific individuals using personal info', 'It uses more emails', 'It targets random people', 'It only attacks companies'], correctAnswer: 'It targets specific individuals using personal info' },
          { question: 'Where do spear phishers get personal information?', options: ['Social media and public profiles', 'Dark web only', 'Phone books', 'Random guessing'], correctAnswer: 'Social media and public profiles' },
          { question: 'What is whaling in cybersecurity?', options: ['Spear phishing targeting high-level executives', 'Attacking large companies', 'A type of malware', 'A network attack'], correctAnswer: 'Spear phishing targeting high-level executives' },
          { question: 'How to protect against spear phishing?', options: ['Verify requests through official channels', 'Trust all personalized emails', 'Share personal info freely', 'Ignore security training'], correctAnswer: 'Verify requests through official channels' },
          { question: 'A spear phishing email usually contains:', options: ['Your name and personal details to seem legitimate', 'Generic greetings only', 'Obvious spelling errors', 'No links or attachments'], correctAnswer: 'Your name and personal details to seem legitimate' }
        ]
      },
      { title: 'Data Privacy Quiz', description: 'Test your understanding of data privacy and protection', isDemo: false, status: 'active',
        questions: [
          { question: 'What is personally identifiable information (PII)?', options: ['Data that can identify a specific individual', 'Public company data', 'Website traffic data', 'Anonymous survey data'], correctAnswer: 'Data that can identify a specific individual' },
          { question: 'What is GDPR?', options: ['European data protection regulation', 'A type of malware', 'A firewall standard', 'An email protocol'], correctAnswer: 'European data protection regulation' },
          { question: 'How should you handle sensitive data?', options: ['Encrypt and limit access', 'Share freely with colleagues', 'Store in plain text', 'Email to everyone'], correctAnswer: 'Encrypt and limit access' },
          { question: 'What is a data breach?', options: ['Unauthorized access to confidential data', 'A system update', 'A backup process', 'A security audit'], correctAnswer: 'Unauthorized access to confidential data' },
          { question: 'What should you do if you suspect a data breach?', options: ['Report immediately to security team', 'Ignore it', 'Delete all files', 'Tell only friends'], correctAnswer: 'Report immediately to security team' }
        ]
      },
      { title: 'Browser Security Quiz', description: 'Test your web browser security knowledge', isDemo: false, status: 'active',
        questions: [
          { question: 'What does a browser warning about an invalid certificate mean?', options: ['The site may be unsafe or impersonating another', 'The site is loading slowly', 'Your internet is slow', 'The browser needs updating'], correctAnswer: 'The site may be unsafe or impersonating another' },
          { question: 'What are browser cookies?', options: ['Small files storing website data on your device', 'Malware files', 'Browser extensions', 'Cached images'], correctAnswer: 'Small files storing website data on your device' },
          { question: 'Why should you keep your browser updated?', options: ['To patch security vulnerabilities', 'For better graphics', 'To use more RAM', 'To slow down browsing'], correctAnswer: 'To patch security vulnerabilities' },
          { question: 'What is a browser extension risk?', options: ['Malicious extensions can steal data', 'Extensions make browsers faster', 'Extensions block all ads', 'Extensions improve security always'], correctAnswer: 'Malicious extensions can steal data' },
          { question: 'What is private/incognito browsing?', options: ['Browsing without saving local history', 'Completely anonymous browsing', 'Encrypted browsing', 'VPN browsing'], correctAnswer: 'Browsing without saving local history' }
        ]
      },
      { title: 'Incident Response Quiz', description: 'Test your knowledge on responding to cyber incidents', isDemo: false, status: 'active',
        questions: [
          { question: 'What is the first step when you suspect a phishing attack?', options: ['Do not click any links and report it', 'Click links to verify', 'Forward to colleagues', 'Delete your account'], correctAnswer: 'Do not click any links and report it' },
          { question: 'What should you do if you accidentally clicked a phishing link?', options: ['Disconnect from internet and change passwords', 'Continue browsing normally', 'Restart your browser only', 'Wait and see what happens'], correctAnswer: 'Disconnect from internet and change passwords' },
          { question: 'Who should you report a phishing attempt to?', options: ['IT security team and the impersonated organization', 'Only your friends', 'No one', 'The attacker'], correctAnswer: 'IT security team and the impersonated organization' },
          { question: 'What is a security incident response plan?', options: ['A documented procedure for handling security breaches', 'A firewall configuration', 'An antivirus program', 'A password policy'], correctAnswer: 'A documented procedure for handling security breaches' },
          { question: 'After a phishing incident, what is most important?', options: ['Learn from it and improve security awareness', 'Blame the victim', 'Ignore future emails', 'Disable all email'], correctAnswer: 'Learn from it and improve security awareness' }
        ]
      },
      { title: 'Advanced Threats Quiz', description: 'Test your knowledge on advanced cyber threats', isDemo: false, status: 'active',
        questions: [
          { question: 'What is a zero-day vulnerability?', options: ['An unknown flaw with no available patch', 'A day with no cyber attacks', 'A new software release', 'A type of firewall'], correctAnswer: 'An unknown flaw with no available patch' },
          { question: 'What is an APT (Advanced Persistent Threat)?', options: ['A long-term targeted attack by sophisticated actors', 'A basic virus', 'A spam campaign', 'A DDoS attack'], correctAnswer: 'A long-term targeted attack by sophisticated actors' },
          { question: 'What is DNS spoofing?', options: ['Redirecting users to fake websites via corrupted DNS', 'A type of email attack', 'A password attack', 'A WiFi attack'], correctAnswer: 'Redirecting users to fake websites via corrupted DNS' },
          { question: 'What is a botnet?', options: ['A network of infected computers controlled by attackers', 'A secure network', 'A type of VPN', 'A firewall system'], correctAnswer: 'A network of infected computers controlled by attackers' },
          { question: 'What is credential stuffing?', options: ['Using stolen credentials to access multiple accounts', 'Creating strong passwords', 'A type of 2FA', 'A backup method'], correctAnswer: 'Using stolen credentials to access multiple accounts' }
        ]
      },
      { title: 'Cybersecurity Best Practices Quiz', description: 'Final comprehensive cybersecurity assessment', isDemo: false, status: 'active',
        questions: [
          { question: 'What is the most important cybersecurity habit?', options: ['Staying informed and practicing security awareness', 'Using the same password everywhere', 'Ignoring software updates', 'Disabling firewalls'], correctAnswer: 'Staying informed and practicing security awareness' },
          { question: 'How often should you back up important data?', options: ['Regularly, following the 3-2-1 rule', 'Once a year', 'Never needed', 'Only when attacked'], correctAnswer: 'Regularly, following the 3-2-1 rule' },
          { question: 'What is the principle of least privilege?', options: ['Give users only the access they need', 'Give all users admin access', 'Restrict all access', 'Share all passwords'], correctAnswer: 'Give users only the access they need' },
          { question: 'What is security awareness training?', options: ['Educating users to recognize and respond to threats', 'Installing antivirus software', 'Configuring firewalls', 'Writing security policies'], correctAnswer: 'Educating users to recognize and respond to threats' },
          { question: 'Which is the weakest link in cybersecurity?', options: ['Human behavior and social engineering', 'Outdated software', 'Weak firewalls', 'Slow internet'], correctAnswer: 'Human behavior and social engineering' }
        ]
      }
    ];
    for (const q of quizData) {
      await Quiz.create(q);
    }
    res.json({ message: '✅ 10 lessons and 15 quizzes with real questions seeded successfully!' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Fix all existing lessons and quizzes to active status
router.get('/fix-status', async (req, res) => {
  try {
    const Lesson = require('../models/Lesson');
    const Quiz = require('../models/Quiz');
    await Lesson.updateMany({}, { status: 'active' });
    await Quiz.updateMany({}, { status: 'active' });
    res.json({ message: '✅ All lessons and quizzes set to active!' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
