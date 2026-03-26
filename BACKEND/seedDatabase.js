const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

const seedDatabase = async () => {
  try {
    await User.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});

    const hashedPassword = await bcrypt.hash('123456', 10);
    
    await User.create([
      { name: 'Demo User', email: 'user@gmail.com', password: hashedPassword, role: 'user' },
      { name: 'Demo Admin', email: 'admin@gmail.com', password: hashedPassword, role: 'admin' }
    ]);

    await Lesson.create([
      { title: 'Introduction to Phishing', description: 'Learn the basics of phishing attacks', content: '<h3>What is Phishing?</h3><p>Phishing is a cybercrime where attackers impersonate legitimate organizations to steal sensitive information.</p>', icon: '🎣', level: 'Beginner', duration: '15 min', isFree: true, status: 'active' },
      { title: 'Email Security Best Practices', description: 'Essential tips for email security', content: '<h3>Email Red Flags</h3><p>Learn to spot suspicious emails by checking sender addresses, links, and attachments.</p>', icon: '📧', level: 'Beginner', duration: '20 min', isFree: true, status: 'active' },
      { title: 'URL Analysis and Safe Browsing', description: 'Advanced URL inspection techniques', content: '<h3>URL Inspection</h3><p>Master identifying malicious links by analyzing URL structure and domain names.</p>', icon: '🔗', level: 'Intermediate', duration: '25 min', isFree: true, status: 'active' },
      { title: 'Social Engineering Attacks', description: 'Understanding manipulation tactics', content: '<h3>Social Engineering</h3><p>Attackers manipulate people psychologically to gain access to systems and data.</p>', icon: '🧠', level: 'Intermediate', duration: '20 min', isFree: true, status: 'active' },
      { title: 'Spear Phishing', description: 'Targeted phishing attacks explained', content: '<h3>Spear Phishing</h3><p>Unlike generic phishing, spear phishing targets specific individuals using personal information.</p>', icon: '🎯', level: 'Intermediate', duration: '20 min', isFree: true, status: 'active' },
      { title: 'Smishing and Vishing', description: 'SMS and voice phishing attacks', content: '<h3>Smishing & Vishing</h3><p>Phishing attacks via SMS (smishing) and phone calls (vishing) are increasingly common.</p>', icon: '📱', level: 'Beginner', duration: '15 min', isFree: false, status: 'active' },
      { title: 'Password Security', description: 'Creating and managing strong passwords', content: '<h3>Password Best Practices</h3><p>Use long, unique passwords for every account and enable two-factor authentication.</p>', icon: '🔐', level: 'Beginner', duration: '15 min', isFree: false, status: 'active' },
      { title: 'Two-Factor Authentication', description: 'Adding an extra layer of security', content: '<h3>2FA Explained</h3><p>Two-factor authentication adds a second verification step, making accounts much harder to compromise.</p>', icon: '🛡️', level: 'Beginner', duration: '15 min', isFree: false, status: 'active' },
      { title: 'Malware and Ransomware', description: 'Understanding malicious software', content: '<h3>Malware Types</h3><p>Malware includes viruses, trojans, and ransomware that can encrypt your files and demand payment.</p>', icon: '🦠', level: 'Intermediate', duration: '25 min', isFree: false, status: 'active' },
      { title: 'Safe Online Shopping', description: 'Protect yourself while shopping online', content: '<h3>Online Shopping Safety</h3><p>Always verify website security, use credit cards, and avoid public Wi-Fi when shopping online.</p>', icon: '🛒', level: 'Beginner', duration: '15 min', isFree: false, status: 'active' },
      { title: 'Wi-Fi Security', description: 'Staying safe on public networks', content: '<h3>Wi-Fi Risks</h3><p>Public Wi-Fi networks can be monitored by attackers. Always use a VPN on public networks.</p>', icon: '📶', level: 'Intermediate', duration: '20 min', isFree: false, status: 'active' },
      { title: 'Data Privacy Fundamentals', description: 'Protecting your personal information', content: '<h3>Data Privacy</h3><p>Understand what data companies collect and how to minimize your digital footprint.</p>', icon: '🔒', level: 'Beginner', duration: '20 min', isFree: false, status: 'active' },
      { title: 'Recognizing Fake Websites', description: 'Spot cloned and fraudulent websites', content: '<h3>Fake Websites</h3><p>Fraudulent websites mimic legitimate ones. Check SSL certificates, domain spelling, and design quality.</p>', icon: '🌐', level: 'Intermediate', duration: '20 min', isFree: false, status: 'active' },
      { title: 'Corporate Phishing Defense', description: 'Protecting your organization', content: '<h3>Corporate Defense</h3><p>Organizations must train employees, implement email filters, and establish incident response plans.</p>', icon: '🏢', level: 'Advanced', duration: '30 min', isFree: false, status: 'active' },
      { title: 'Incident Response', description: 'What to do after a phishing attack', content: '<h3>Incident Response</h3><p>If you fall victim to phishing, immediately change passwords, notify your bank, and report to authorities.</p>', icon: '🚨', level: 'Advanced', duration: '30 min', isFree: false, status: 'active' }
    ]);

    const quizData = [
      { title: 'Phishing Basics Quiz', description: 'Test your knowledge on phishing fundamentals', isDemo: true },
      { title: 'Email Security Quiz', description: 'Assess your email security awareness', isDemo: true },
      { title: 'URL Analysis Quiz', description: 'Test your URL inspection skills', isDemo: false },
      { title: 'Social Engineering Quiz', description: 'Understand manipulation tactics', isDemo: false },
      { title: 'Spear Phishing Quiz', description: 'Targeted attack scenarios', isDemo: false },
      { title: 'Mobile Security Quiz', description: 'Smishing and vishing awareness', isDemo: false },
      { title: 'Password Security Quiz', description: 'Test your password knowledge', isDemo: false },
      { title: 'Two-Factor Authentication Quiz', description: 'Understanding 2FA', isDemo: false },
      { title: 'Malware Defense Quiz', description: 'Protect against malicious software', isDemo: false },
      { title: 'Online Shopping Safety Quiz', description: 'Safe e-commerce practices', isDemo: false },
      { title: 'Wi-Fi Security Quiz', description: 'Public network safety', isDemo: false },
      { title: 'Data Privacy Quiz', description: 'Personal information protection', isDemo: false },
      { title: 'Fake Website Detection Quiz', description: 'Spot fraudulent sites', isDemo: false },
      { title: 'Corporate Security Quiz', description: 'Organizational defense strategies', isDemo: false },
      { title: 'Incident Response Quiz', description: 'Handling security breaches', isDemo: false }
    ];

    for (let i = 0; i < quizData.length; i++) {
      const questions = [];
      for (let j = 1; j <= 20; j++) {
        questions.push({
          question: `${quizData[i].title} - Question ${j}: What is the best practice?`,
          options: ['Option A - Correct Answer', 'Option B - Wrong', 'Option C - Wrong', 'Option D - Wrong'],
          correctAnswer: 'Option A - Correct Answer'
        });
      }
      await Quiz.create({ ...quizData[i], questions });
    }

    console.log('✅ Database seeded successfully!');
    console.log('📚 15 Lessons created (5 free for guests)');
    console.log('📝 15 Quizzes created (2 demo for guests, 20 questions each)');
    console.log('👤 Demo accounts created:');
    console.log('   User: user@gmail.com / 123456');
    console.log('   Admin: admin@gmail.com / 123456');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
