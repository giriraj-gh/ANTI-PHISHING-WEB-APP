import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = token;
  return config;
});

// Initialize demo users if not exists
if (!localStorage.getItem('registeredUsers')) {
  const demoUsers = [
    {
      id: 1,
      name: 'Demo User',
      email: 'user@gmail.com',
      password: '123456',
      role: 'user',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Demo Admin',
      email: 'admin@gmail.com',
      password: '123456',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ];
  localStorage.setItem('registeredUsers', JSON.stringify(demoUsers));
}

// Initialize default lessons
const defaultLessons = [
  { id: 1, title: 'Introduction to Phishing', description: 'Learn the basics of phishing attacks', content: '<h3>What is Phishing?</h3><p>Phishing is a cybercrime where attackers impersonate legitimate organizations to steal sensitive information.</p>', icon: '🎣', level: 'Beginner', duration: '15 min', isFree: true, status: 'active', createdAt: new Date().toISOString() },
  { id: 2, title: 'Email Security Best Practices', description: 'Essential tips for email security', content: '<h3>Email Red Flags</h3><p>Learn to spot suspicious emails by checking sender addresses, links, and attachments.</p>', icon: '📧', level: 'Beginner', duration: '20 min', isFree: true, status: 'active', createdAt: new Date().toISOString() },
  { id: 3, title: 'URL Analysis and Safe Browsing', description: 'Advanced URL inspection techniques', content: '<h3>URL Inspection</h3><p>Master identifying malicious links by analyzing URL structure and domain names.</p>', icon: '🔗', level: 'Intermediate', duration: '25 min', isFree: false, status: 'active', createdAt: new Date().toISOString() },
  { id: 4, title: 'Social Engineering Attacks', description: 'Understanding manipulation tactics', content: '<h3>Social Engineering</h3><p>Attackers manipulate people psychologically to gain access to systems and data.</p>', icon: '🧠', level: 'Intermediate', duration: '20 min', isFree: false, status: 'active', createdAt: new Date().toISOString() },
  { id: 5, title: 'Spear Phishing', description: 'Targeted phishing attacks explained', content: '<h3>Spear Phishing</h3><p>Unlike generic phishing, spear phishing targets specific individuals using personal information.</p>', icon: '🎯', level: 'Intermediate', duration: '20 min', isFree: false, status: 'active', createdAt: new Date().toISOString() },
  { id: 6, title: 'Smishing and Vishing', description: 'SMS and voice phishing attacks', content: '<h3>Smishing & Vishing</h3><p>Phishing attacks via SMS (smishing) and phone calls (vishing) are increasingly common.</p>', icon: '📱', level: 'Beginner', duration: '15 min', isFree: true, status: 'active', createdAt: new Date().toISOString() },
  { id: 7, title: 'Password Security', description: 'Creating and managing strong passwords', content: '<h3>Password Best Practices</h3><p>Use long, unique passwords for every account and enable two-factor authentication.</p>', icon: '🔐', level: 'Beginner', duration: '15 min', isFree: true, status: 'active', createdAt: new Date().toISOString() },
  { id: 8, title: 'Two-Factor Authentication', description: 'Adding an extra layer of security', content: '<h3>2FA Explained</h3><p>Two-factor authentication adds a second verification step, making accounts much harder to compromise.</p>', icon: '🛡️', level: 'Beginner', duration: '15 min', isFree: true, status: 'active', createdAt: new Date().toISOString() },
  { id: 9, title: 'Malware and Ransomware', description: 'Understanding malicious software', content: '<h3>Malware Types</h3><p>Malware includes viruses, trojans, and ransomware that can encrypt your files and demand payment.</p>', icon: '🦠', level: 'Intermediate', duration: '25 min', isFree: false, status: 'active', createdAt: new Date().toISOString() },
  { id: 10, title: 'Safe Online Shopping', description: 'Protect yourself while shopping online', content: '<h3>Online Shopping Safety</h3><p>Always verify website security, use credit cards, and avoid public Wi-Fi when shopping online.</p>', icon: '🛒', level: 'Beginner', duration: '15 min', isFree: true, status: 'active', createdAt: new Date().toISOString() },
  { id: 11, title: 'Wi-Fi Security', description: 'Staying safe on public networks', content: '<h3>Wi-Fi Risks</h3><p>Public Wi-Fi networks can be monitored by attackers. Always use a VPN on public networks.</p>', icon: '📶', level: 'Intermediate', duration: '20 min', isFree: false, status: 'active', createdAt: new Date().toISOString() },
  { id: 12, title: 'Data Privacy Fundamentals', description: 'Protecting your personal information', content: '<h3>Data Privacy</h3><p>Understand what data companies collect and how to minimize your digital footprint.</p>', icon: '🔒', level: 'Beginner', duration: '20 min', isFree: false, status: 'active', createdAt: new Date().toISOString() },
  { id: 13, title: 'Recognizing Fake Websites', description: 'Spot cloned and fraudulent websites', content: '<h3>Fake Websites</h3><p>Fraudulent websites mimic legitimate ones. Check SSL certificates, domain spelling, and design quality.</p>', icon: '🌐', level: 'Intermediate', duration: '20 min', isFree: false, status: 'active', createdAt: new Date().toISOString() },
  { id: 14, title: 'Corporate Phishing Defense', description: 'Protecting your organization', content: '<h3>Corporate Defense</h3><p>Organizations must train employees, implement email filters, and establish incident response plans.</p>', icon: '🏢', level: 'Advanced', duration: '30 min', isFree: false, status: 'active', createdAt: new Date().toISOString() },
  { id: 15, title: 'Incident Response', description: 'What to do after a phishing attack', content: '<h3>Incident Response</h3><p>If you fall victim to phishing, immediately change passwords, notify your bank, and report to authorities.</p>', icon: '🚨', level: 'Advanced', duration: '30 min', isFree: false, status: 'active', createdAt: new Date().toISOString() }
];

localStorage.setItem('lessons', JSON.stringify(defaultLessons));

// Mock authentication for demo purposes
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ERR_NETWORK') {
      const { url, method, data } = error.config;
      
      // Mock login
      if (url.includes('/auth/login') && method === 'post') {
        const { email, password, role } = JSON.parse(data);
        const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const user = storedUsers.find(u => u.email === email && u.password === password && u.role === role);
        
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          return Promise.resolve({
            data: { token: 'mock-jwt-token-' + Date.now(), role: user.role, user: user }
          });
        } else {
          return Promise.reject({
            response: { data: { message: 'Invalid credentials.' } }
          });
        }
      }
      
      // Mock register
      if (url.includes('/auth/register') && method === 'post') {
        const userData = JSON.parse(data);
        const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const existingUser = storedUsers.find(u => u.email === userData.email);
        
        if (existingUser) {
          return Promise.reject({
            response: { data: { message: 'Email already registered.' } }
          });
        }
        
        const newUser = {
          id: Date.now(),
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          createdAt: new Date().toISOString()
        };
        
        storedUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(storedUsers));
        return Promise.resolve({ data: { message: 'Registration successful!' } });
      }
      
      // Mock profile
      if (url.includes('/auth/profile')) {
        if (method === 'get') {
          return Promise.resolve({
            data: { name: 'Demo User', age: '25', dob: '1999-01-01', picture: '' }
          });
        }
        if (method === 'put') {
          return Promise.resolve({ data: { message: 'Profile updated' } });
        }
      }
      
      // Mock phishing data
      if (url.includes('/phish/all')) {
        const scanHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');
        return Promise.resolve({ data: scanHistory });
      }
      
      // Mock URL check
      if (url.includes('/phish/check') && method === 'post') {
        const { url: checkUrl } = JSON.parse(data);
        const risk = checkUrl.includes('fake') || checkUrl.includes('phish') ? 'HIGH' : 
                    checkUrl.includes('suspicious') ? 'MEDIUM' : 'LOW';
        const score = risk === 'HIGH' ? 100 : risk === 'MEDIUM' ? 50 : 0;
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const scanHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');
        const newScan = {
          _id: Date.now().toString(),
          url: checkUrl,
          risk,
          score,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          createdAt: new Date().toISOString()
        };
        scanHistory.push(newScan);
        localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
        
        return Promise.resolve({ data: { url: checkUrl, risk, score } });
      }
      
      // Mock report
      if (url.includes('/phish/report') && method === 'post') {
        return Promise.resolve({ data: { message: 'Report submitted successfully' } });
      }
      
      // Mock users for admin
      if (url.includes('/admin/users')) {
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        return Promise.resolve({ data: users.filter(u => u.role === 'user') });
      }
      
      // Mock admin stats
      if (url.includes('/admin/stats')) {
        const scanHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');
        const high = scanHistory.filter(s => s.risk === 'HIGH').length;
        const medium = scanHistory.filter(s => s.risk === 'MEDIUM').length;
        const low = scanHistory.filter(s => s.risk === 'LOW').length;
        return Promise.resolve({ data: { high, medium, low } });
      }

      // Mock lessons
      if (url.includes('/lessons/all')) {
        const lessons = JSON.parse(localStorage.getItem('lessons') || '[]');
        return Promise.resolve({ data: lessons });
      }

      // Mock lesson create
      if (url.includes('/lessons/create') && method === 'post') {
        const lessonData = JSON.parse(data);
        const lessons = JSON.parse(localStorage.getItem('lessons') || '[]');
        const newLesson = {
          id: Date.now(),
          ...lessonData,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        lessons.push(newLesson);
        localStorage.setItem('lessons', JSON.stringify(lessons));
        return Promise.resolve({ data: { message: 'Lesson created' } });
      }

      // Mock lesson update
      if (url.includes('/lessons/') && method === 'put') {
        const lessonId = parseInt(url.split('/lessons/')[1]);
        const lessonData = JSON.parse(data);
        const lessons = JSON.parse(localStorage.getItem('lessons') || '[]');
        const lessonIndex = lessons.findIndex(l => l.id === lessonId);
        if (lessonIndex !== -1) {
          lessons[lessonIndex] = { ...lessons[lessonIndex], ...lessonData, status: 'active' };
          localStorage.setItem('lessons', JSON.stringify(lessons));
        }
        return Promise.resolve({ data: { message: 'Lesson updated' } });
      }

      // Mock lesson delete
      if (url.includes('/lessons/') && method === 'delete') {
        const lessonId = parseInt(url.split('/lessons/')[1]);
        const lessons = JSON.parse(localStorage.getItem('lessons') || '[]');
        const filteredLessons = lessons.filter(l => l.id !== lessonId);
        localStorage.setItem('lessons', JSON.stringify(filteredLessons));
        return Promise.resolve({ data: { message: 'Lesson deleted' } });
      }

      // Mock activate lesson
      if (url.includes('/lessons/activate/') && method === 'post') {
        const lessonId = parseInt(url.split('/lessons/activate/')[1]);
        const lessons = JSON.parse(localStorage.getItem('lessons') || '[]');
        const lessonIndex = lessons.findIndex(l => l.id === lessonId);
        if (lessonIndex !== -1) {
          lessons[lessonIndex].status = 'active';
          localStorage.setItem('lessons', JSON.stringify(lessons));
        }
        return Promise.resolve({ data: { message: 'Lesson activated' } });
      }

      // Mock quizzes
      if (url.includes('/quiz/all')) {
        const quizList = [
          { id: 1, title: 'Phishing Basics Quiz', description: 'Test your knowledge on phishing fundamentals', isDemo: true, status: 'active' },
          { id: 2, title: 'Email Security Quiz', description: 'Assess your email security awareness', isDemo: true, status: 'active' },
          { id: 3, title: 'URL Analysis Quiz', description: 'Test your URL inspection skills', isDemo: false, status: 'active' },
          { id: 4, title: 'Social Engineering Quiz', description: 'Understand manipulation tactics', isDemo: false, status: 'active' },
          { id: 5, title: 'Spear Phishing Quiz', description: 'Targeted attack scenarios', isDemo: false, status: 'active' },
          { id: 6, title: 'Mobile Security Quiz', description: 'Smishing and vishing awareness', isDemo: false, status: 'active' },
          { id: 7, title: 'Password Security Quiz', description: 'Test your password knowledge', isDemo: false, status: 'active' },
          { id: 8, title: 'Two-Factor Authentication Quiz', description: 'Understanding 2FA concepts', isDemo: false, status: 'active' },
          { id: 9, title: 'Malware Defense Quiz', description: 'Protect against malicious software', isDemo: false, status: 'active' },
          { id: 10, title: 'Online Shopping Safety Quiz', description: 'Safe e-commerce practices', isDemo: false, status: 'active' },
          { id: 11, title: 'Wi-Fi Security Quiz', description: 'Public network safety awareness', isDemo: false, status: 'waiting' },
          { id: 12, title: 'Data Privacy Quiz', description: 'Personal information protection', isDemo: false, status: 'waiting' },
          { id: 13, title: 'Fake Website Detection Quiz', description: 'Spot fraudulent websites', isDemo: false, status: 'waiting' },
          { id: 14, title: 'Corporate Security Quiz', description: 'Organizational defense strategies', isDemo: false, status: 'waiting' },
          { id: 15, title: 'Incident Response Quiz', description: 'Handling security breaches', isDemo: false, status: 'waiting' },
          { id: 16, title: 'Browser Security Quiz', description: 'Safe browsing habits and settings', isDemo: false, status: 'waiting' },
          { id: 17, title: 'Cloud Security Quiz', description: 'Protecting data in the cloud', isDemo: false, status: 'waiting' },
          { id: 18, title: 'Identity Theft Quiz', description: 'Preventing and detecting identity theft', isDemo: false, status: 'waiting' },
          { id: 19, title: 'Cyber Hygiene Quiz', description: 'Daily cybersecurity best practices', isDemo: false, status: 'waiting' },
          { id: 20, title: 'Advanced Threats Quiz', description: 'Zero-day and APT awareness', isDemo: false, status: 'waiting' }
        ];
        const quizzesWithQuestions = quizList.map(q => ({
          ...q,
          questions: Array(20).fill().map((_, i) => ({
            question: `${q.title} - Question ${i + 1}: What is the best security practice?`,
            options: ['Always verify the source', 'Ignore warnings', 'Share your password', 'Click all links'],
            correctAnswer: 'Always verify the source'
          }))
        }));
        const storedQuizzes = JSON.parse(localStorage.getItem('quizzes') || 'null');
        if (!storedQuizzes) localStorage.setItem('quizzes', JSON.stringify(quizzesWithQuestions));
        return Promise.resolve({ data: JSON.parse(localStorage.getItem('quizzes')) });
      }

      // Mock quiz create
      if (url.includes('/quiz/create') && method === 'post') {
        const quizData = JSON.parse(data);
        const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        const newQuiz = { id: Date.now(), ...quizData };
        quizzes.push(newQuiz);
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
        return Promise.resolve({ data: { message: 'Quiz created' } });
      }

      // Mock quiz update
      if (url.includes('/quiz/') && method === 'put') {
        const quizId = parseInt(url.split('/quiz/')[1]);
        const quizData = JSON.parse(data);
        const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        const idx = quizzes.findIndex(q => q.id === quizId);
        if (idx !== -1) quizzes[idx] = { ...quizzes[idx], ...quizData };
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
        return Promise.resolve({ data: { message: 'Quiz updated' } });
      }

      // Mock quiz delete
      if (url.includes('/quiz/') && method === 'delete') {
        const quizId = parseInt(url.split('/quiz/')[1]);
        const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        localStorage.setItem('quizzes', JSON.stringify(quizzes.filter(q => q.id !== quizId)));
        return Promise.resolve({ data: { message: 'Quiz deleted' } });
      }

      // Mock save results
      if (url.includes('/results/save') && method === 'post') {
        return Promise.resolve({ data: { message: 'Result saved' } });
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
