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
      console.log('✅ 3 Active + 12 Waiting Lessons seeded!');
    }
    if (quizCount === 0) {
      const quizData = [
        { title: 'Phishing Basics Quiz', description: 'Test your knowledge on phishing fundamentals', isDemo: true, status: 'active' },
        { title: 'Email Security Quiz', description: 'Assess your email security awareness', isDemo: true, status: 'active' },
        { title: 'URL Analysis Quiz', description: 'Test your URL inspection skills', isDemo: false, status: 'active' },
        { title: 'Social Engineering Quiz', description: 'Understand manipulation tactics', isDemo: false, status: 'active' },
        { title: 'Spear Phishing Quiz', description: 'Targeted attack scenarios', isDemo: false, status: 'active' },
        { title: 'Mobile Security Quiz', description: 'Smishing and vishing awareness', isDemo: false, status: 'active' },
        { title: 'Password Security Quiz', description: 'Test your password knowledge', isDemo: false, status: 'active' },
        { title: 'Two-Factor Authentication Quiz', description: 'Understanding 2FA', isDemo: false, status: 'active' },
        { title: 'Malware Defense Quiz', description: 'Protect against malicious software', isDemo: false, status: 'active' },
        { title: 'Online Shopping Safety Quiz', description: 'Safe e-commerce practices', isDemo: false, status: 'active' }
      ];
      for (const q of quizData) {
        const questions = Array.from({ length: 20 }, (_, i) => ({
          question: `${q.title} - Question ${i + 1}: What is the best security practice?`,
          options: ['Always verify the source', 'Ignore warnings', 'Share your password', 'Click all links'],
          correctAnswer: 'Always verify the source'
        }));
        await Quiz.create({ ...q, questions });
      }
      console.log('✅ 10 Quizzes auto-seeded!');
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
