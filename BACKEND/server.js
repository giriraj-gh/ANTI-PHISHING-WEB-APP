const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', /\.vercel\.app$/, /\.onrender\.com$/],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    const Lesson = require('./models/Lesson');
    const Quiz = require('./models/Quiz');
    const lessonCount = await Lesson.countDocuments();
    const quizCount = await Quiz.countDocuments();
    if (lessonCount === 0) {
      await Lesson.create([
        { title: 'Introduction to Phishing', description: 'Learn the basics of phishing attacks', content: '<h3>What is Phishing?</h3><p>Phishing is a cybercrime where attackers impersonate legitimate organizations to steal sensitive information. They use fake emails, websites, and messages to trick victims.</p><h3>Common Signs</h3><ul><li>Urgent or threatening language</li><li>Suspicious sender email addresses</li><li>Requests for personal information</li></ul>', icon: '🎣', level: 'Beginner', duration: '15 min', isFree: true, status: 'active' },
        { title: 'Email Security Best Practices', description: 'Essential tips for email security', content: '<h3>Email Red Flags</h3><p>Learn to spot suspicious emails by checking sender addresses, links, and attachments.</p><h3>Best Practices</h3><ul><li>Verify sender email addresses carefully</li><li>Never click suspicious links</li><li>Do not open unexpected attachments</li></ul>', icon: '📧', level: 'Beginner', duration: '20 min', isFree: true, status: 'active' },
        { title: 'URL Analysis and Safe Browsing', description: 'Advanced URL inspection techniques', content: '<h3>URL Inspection</h3><p>Master identifying malicious links by analyzing URL structure and domain names.</p><h3>How to Check URLs</h3><ul><li>Look for HTTPS in the address bar</li><li>Check for misspelled domain names</li><li>Hover over links before clicking</li></ul>', icon: '🔗', level: 'Intermediate', duration: '25 min', isFree: true, status: 'active' },
        { title: 'Password Security', description: 'Creating and managing strong passwords', content: '<h3>Password Best Practices</h3><p>Use long, unique passwords for every account and enable two-factor authentication.</p><h3>Tips</h3><ul><li>Use at least 12 characters</li><li>Mix letters, numbers, and symbols</li><li>Never reuse passwords</li><li>Use a password manager</li></ul>', icon: '🔐', level: 'Beginner', duration: '15 min', isFree: true, status: 'active' },
        { title: 'Two-Factor Authentication', description: 'Adding an extra layer of security', content: '<h3>2FA Explained</h3><p>Two-factor authentication adds a second verification step, making accounts much harder to compromise.</p><h3>Types of 2FA</h3><ul><li>SMS codes</li><li>Authenticator apps</li><li>Hardware security keys</li></ul>', icon: '🛡️', level: 'Beginner', duration: '15 min', isFree: true, status: 'active' },
        { title: 'Social Engineering Attacks', description: 'Understanding manipulation tactics', content: '<h3>Social Engineering</h3><p>Attackers manipulate people psychologically to gain access to systems and data.</p><h3>Common Tactics</h3><ul><li>Pretexting - creating false scenarios</li><li>Baiting - offering something enticing</li><li>Quid pro quo attacks</li></ul>', icon: '🧠', level: 'Intermediate', duration: '20 min', isFree: false, status: 'active' },
        { title: 'Malware and Ransomware', description: 'Understanding malicious software', content: '<h3>Malware Types</h3><p>Malware includes viruses, trojans, and ransomware that can encrypt your files and demand payment.</p><h3>Prevention</h3><ul><li>Keep software updated</li><li>Use reputable antivirus software</li><li>Backup data regularly</li></ul>', icon: '🦠', level: 'Intermediate', duration: '25 min', isFree: false, status: 'active' },
        { title: 'Safe Online Shopping', description: 'Protect yourself while shopping online', content: '<h3>Online Shopping Safety</h3><p>Always verify website security, use credit cards, and avoid public Wi-Fi when shopping online.</p><h3>Safe Shopping Tips</h3><ul><li>Only shop on HTTPS websites</li><li>Use credit cards not debit cards</li><li>Check seller reviews</li></ul>', icon: '🛒', level: 'Beginner', duration: '15 min', isFree: false, status: 'active' },
        { title: 'Wi-Fi Security', description: 'Staying safe on public networks', content: '<h3>Wi-Fi Risks</h3><p>Public Wi-Fi networks can be monitored by attackers. Always use a VPN on public networks.</p><h3>Protection Tips</h3><ul><li>Use a VPN on public networks</li><li>Avoid accessing sensitive accounts on public WiFi</li><li>Turn off auto-connect to WiFi</li></ul>', icon: '📶', level: 'Intermediate', duration: '20 min', isFree: false, status: 'active' },
        { title: 'Recognizing Fake Websites', description: 'Spot cloned and fraudulent websites', content: '<h3>Fake Websites</h3><p>Fraudulent websites mimic legitimate ones. Check SSL certificates, domain spelling, and design quality.</p><h3>How to Spot Fakes</h3><ul><li>Check the URL carefully</li><li>Look for SSL certificate</li><li>Check website design quality</li></ul>', icon: '🌐', level: 'Intermediate', duration: '20 min', isFree: false, status: 'active' }
      ]);
      console.log('✅ 10 Lessons auto-seeded!');
    }
    if (quizCount === 0) {
      const quizzes = [
        { title: 'Phishing Basics Quiz', description: 'Test your knowledge on phishing fundamentals', isDemo: true, status: 'active',
          questions: [
            { question: 'What is phishing?', options: ['A cybercrime to steal information', 'A type of fishing sport', 'A computer virus', 'A firewall type'], correctAnswer: 'A cybercrime to steal information' },
            { question: 'Which is a common sign of a phishing email?', options: ['Urgent language requesting personal info', 'Professional company logo', 'Correct grammar', 'Known sender address'], correctAnswer: 'Urgent language requesting personal info' },
            { question: 'What should you do with a suspicious email?', options: ['Delete it and report it', 'Click all links to verify', 'Reply with your details', 'Forward to friends'], correctAnswer: 'Delete it and report it' },
            { question: 'What does HTTPS mean?', options: ['Secure encrypted connection', 'High Transfer Protocol', 'Hypertext Phishing System', 'None of the above'], correctAnswer: 'Secure encrypted connection' },
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
      for (const q of quizzes) { await Quiz.create(q); }
      console.log('✅ 5 Quizzes with real questions auto-seeded!');
    }
  })
  .catch(err => console.log('❌ MongoDB error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/phish', require('./routes/phish'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/results', require('./routes/results'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
