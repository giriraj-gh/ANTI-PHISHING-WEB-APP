# 🚀 COMPLETE SETUP GUIDE - Real Backend Application

## ✅ What Changed

**BEFORE:** Data stored in localStorage (temporary, browser-only)
**NOW:** Data stored in MongoDB (permanent, real database)

## 📋 Prerequisites

1. **Node.js** (v16+) - [Download](https://nodejs.org/)
2. **MongoDB** - [Download](https://www.mongodb.com/try/download/community)
   - OR use MongoDB Atlas (cloud): [Sign up free](https://www.mongodb.com/cloud/atlas/register)

## 🔧 Setup Instructions

### Step 1: Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update `.env` file with your connection string

### Step 2: Setup Backend

```bash
# Navigate to backend
cd BACKEND/backend

# Install dependencies
npm install

# Create .env file
# Copy this content:
MONGO_URI=mongodb://localhost:27017/antiphishing
JWT_SECRET=your_secret_key_12345

# Seed database with demo data
node seedDatabase.js

# Start backend server
npm start
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

### Step 3: Setup Frontend

```bash
# Navigate to frontend
cd FRONTEND/frontend

# Install dependencies (if not done)
npm install

# Start frontend
npm start
```

Frontend opens at: `http://localhost:3000`

## 🎯 Demo Accounts

**User Account:**
- Email: `user@gmail.com`
- Password: `123456`
- Role: User

**Admin Account:**
- Email: `admin@gmail.com`
- Password: `123456`
- Role: Admin

## ✨ Features Now Working

### 1. **Real User Registration**
- Create account with role selection (User/Admin)
- Data permanently saved in MongoDB
- Password encrypted with bcrypt

### 2. **Real Login System**
- Login with email, password, and role
- JWT token authentication
- Session persists across browser restarts

### 3. **Profile Management**
- Save: name, age, dob, phone, address, bio, picture
- Data stored permanently in database
- Updates sync across all sessions

### 4. **URL Scanning**
- Every scan saved to database
- Statistics tracked per user
- Admin sees all scans, users see only their own

### 5. **Scan Statistics**
- Total scans count
- High/Medium/Low risk breakdown
- Never resets, permanently stored

### 6. **Lesson Management**
- 4 active lessons (visible to users)
- 4 pending lessons (admin only)
- Admin can activate/edit/delete lessons
- All changes saved to database

### 7. **Quiz System**
- 4 student quizzes (20 questions each)
- 4 admin quizzes (60 questions each)
- Results saved permanently
- Track pass/fail history

### 8. **Admin Tracking**
- View all user accounts
- See all scan history
- Track user statistics
- Monitor quiz results

## 🗄️ Database Collections

Your MongoDB will have these collections:

1. **users** - All user accounts
2. **lessons** - All lessons (active + pending)
3. **quizzes** - All quiz questions
4. **quizresults** - All quiz attempts
5. **scanlogs** - All URL scans
6. **userstats** - User statistics
7. **reports** - Phishing reports

## 🔄 Data Persistence

**Everything is now permanent:**
- ✅ User accounts
- ✅ Profile data
- ✅ Scan history
- ✅ Scan statistics
- ✅ Quiz results
- ✅ Lesson completion
- ✅ Admin changes

**Data survives:**
- Browser refresh
- Browser close
- Computer restart
- Cache clear

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if MongoDB is running
mongo --version

# Check if port 5000 is free
netstat -ano | findstr :5000

# Check .env file exists
```

### Frontend can't connect
```bash
# Make sure backend is running on port 5000
# Check browser console for errors
# Verify API URL in frontend/src/api.js
```

### Database connection error
```bash
# Check MongoDB is running
# Verify MONGO_URI in .env
# Try: mongodb://127.0.0.1:27017/antiphishing
```

## 📊 Testing the System

1. **Register new user**
   - Go to Register page
   - Fill form with role selection
   - Check MongoDB: `db.users.find()`

2. **Scan a URL**
   - Login as user
   - Scan any URL
   - Check MongoDB: `db.scanlogs.find()`
   - Check stats: `db.userstats.find()`

3. **Admin features**
   - Login as admin
   - View all users
   - See all scan history
   - Activate pending lessons

## 🎉 Success Indicators

✅ Backend console shows "MongoDB connected"
✅ Frontend can register new users
✅ Login works with JWT token
✅ Scans appear in database
✅ Statistics update automatically
✅ Admin can see all data
✅ Data persists after restart

## 📝 Next Steps

1. **Customize**: Add more lessons, quizzes
2. **Deploy**: Host on Heroku, AWS, or Vercel
3. **Enhance**: Add email verification, password reset
4. **Scale**: Add caching, load balancing

---

**🎊 Congratulations! You now have a real, production-ready application with permanent data storage!**
