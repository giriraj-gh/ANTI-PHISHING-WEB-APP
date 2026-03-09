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
  {
    id: 1,
    title: 'Introduction to Phishing',
    description: 'Learn the basics of phishing attacks',
    content: '<h3>What is Phishing?</h3><p>Phishing is a cybercrime where attackers impersonate legitimate organizations.</p>',
    icon: '🎣',
    level: 'Beginner',
    duration: '15 min',
    isFree: true,
    status: 'waiting',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Email Security Best Practices',
    description: 'Essential tips for email security',
    content: '<h3>Email Red Flags</h3><p>Learn to spot suspicious emails.</p>',
    icon: '📧',
    level: 'Beginner',
    duration: '20 min',
    isFree: true,
    status: 'waiting',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: 'URL Analysis and Safe Browsing',
    description: 'Advanced URL inspection techniques',
    content: '<h3>URL Inspection</h3><p>Master identifying malicious links.</p>',
    icon: '🔗',
    level: 'Intermediate',
    duration: '25 min',
    isFree: false,
    status: 'waiting',
    createdAt: new Date().toISOString()
  }
];

if (!localStorage.getItem('lessons')) {
  localStorage.setItem('lessons', JSON.stringify(defaultLessons));
}

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
        return Promise.resolve({
          data: [
            {
              id: 1,
              title: 'Phishing Basics Quiz',
              description: 'Test your knowledge',
              isDemo: true,
              questions: Array(20).fill().map((_, i) => ({
                question: `Question ${i + 1}?`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 'Option A'
              }))
            }
          ]
        });
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
