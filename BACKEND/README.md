# Anti-Phishing Backend

## Setup

1. Install MongoDB: https://www.mongodb.com/try/download/community

2. Install dependencies:
```
cd BACKEND
npm install
```

3. Start MongoDB:
```
mongod
```

4. Seed database:
```
npm run seed
```

5. Start server:
```
npm start
```

Server runs on: http://localhost:5000

## Demo Accounts
- User: user@gmail.com / 123456
- Admin: admin@gmail.com / 123456

## Features
- 15 Lessons (5 free for guests)
- 15 Quizzes (2 demo for guests, 20 questions each)
- User authentication with JWT
- URL scanning and logging
- Admin dashboard with statistics
