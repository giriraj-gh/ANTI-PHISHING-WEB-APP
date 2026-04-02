# FINAL YEAR PROJECT REPORT

---

## ANTI-PHISHING WEB APPLICATION
### A Comprehensive Cybersecurity Awareness and Threat Detection Platform

---

**Project Title:** Anti-Phishing Web Application
**Technology Stack:** React.js, Node.js, Express.js, MongoDB
**GitHub Repository:** https://github.com/giriraj-gh/ANTI-PHISHING-WEB-APP
**Academic Year:** 2024–2025

---

## TABLE OF CONTENTS

1. Abstract
2. Introduction
3. Problem Statement
4. Objectives
5. System Architecture
6. Technology Stack
7. Features and Modules
8. Database Design
9. Security Implementation
10. System Requirements
11. Installation and Setup
12. Screenshots / Module Description
13. Testing
14. Conclusion
15. Future Scope
16. References

---

## 1. ABSTRACT

The Anti-Phishing Web Application is a full-stack cybersecurity platform designed to detect, report, and educate users about phishing threats. The system provides real-time URL scanning, phishing awareness lessons, interactive quizzes, and an admin dashboard for monitoring user activity and threat statistics. Built using React.js for the frontend and Node.js with MongoDB for the backend, the application follows a role-based access control model supporting Guest, User, and Admin roles. The platform aims to reduce the risk of phishing attacks by combining threat detection tools with educational content, empowering users to identify and avoid online threats.

---

## 2. INTRODUCTION

Phishing is one of the most prevalent and dangerous forms of cybercrime in the digital age. Attackers impersonate legitimate organizations through fraudulent emails, websites, and messages to steal sensitive information such as passwords, credit card numbers, and personal data. According to cybersecurity reports, phishing attacks account for over 80% of reported security incidents globally.

This project addresses the growing need for accessible cybersecurity tools by developing a web-based anti-phishing platform that:
- Scans URLs for phishing indicators
- Educates users through structured lessons
- Tests knowledge through interactive quizzes
- Provides administrators with monitoring and management tools

---

## 3. PROBLEM STATEMENT

Despite the widespread awareness of cybersecurity threats, many internet users lack the knowledge and tools to identify phishing attacks. Existing solutions are either too technical for general users or too expensive for individuals and small organizations. There is a need for a user-friendly, accessible, and educational platform that combines threat detection with cybersecurity awareness training.

---

## 4. OBJECTIVES

- To develop a web application that scans URLs and identifies potential phishing threats
- To provide structured cybersecurity education through 15 lessons across Beginner, Intermediate, and Advanced levels
- To implement an interactive quiz system with 20 quizzes (20 questions each) to test user knowledge
- To build a role-based access control system supporting Guest, User, and Admin roles
- To create an admin dashboard for monitoring users, scan history, and quiz results
- To implement secure authentication using JWT tokens and bcrypt password hashing
- To ensure application security through CORS policies, rate limiting, and input validation

---

## 5. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT LAYER                       │
│              React.js Frontend (Port 3000)           │
│   ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│   │  Guest   │ │   User   │ │      Admin        │   │
│   │  Pages   │ │Dashboard │ │    Dashboard      │   │
│   └──────────┘ └──────────┘ └──────────────────┘   │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP/REST API (Axios)
┌─────────────────────▼───────────────────────────────┐
│                   SERVER LAYER                       │
│              Node.js + Express.js (Port 5000)        │
│   ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│   │   Auth   │ │  Phish   │ │  Lessons/Quiz     │   │
│   │  Routes  │ │  Routes  │ │     Routes        │   │
│   └──────────┘ └──────────┘ └──────────────────┘   │
│              JWT Middleware + Rate Limiter            │
└─────────────────────┬───────────────────────────────┘
                      │ Mongoose ODM
┌─────────────────────▼───────────────────────────────┐
│                  DATABASE LAYER                      │
│                MongoDB (Port 27017)                  │
│   ┌───────┐ ┌─────────┐ ┌───────┐ ┌────────────┐  │
│   │ Users │ │ Lessons │ │Quizzes│ │  ScanLogs  │  │
│   └───────┘ └─────────┘ └───────┘ └────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 6. TECHNOLOGY STACK

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React.js | 19.x | UI Framework |
| React Router DOM | 7.x | Client-side Routing |
| Axios | 1.x | HTTP Client |
| Recharts | 3.x | Data Visualization |
| Tailwind CSS | 3.x | Styling |
| JWT Decode | 4.x | Token Decoding |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 16+ | Runtime Environment |
| Express.js | 4.x | Web Framework |
| MongoDB | 6.x | Database |
| Mongoose | 7.x | ODM |
| bcryptjs | 2.x | Password Hashing |
| jsonwebtoken | 9.x | Authentication |
| express-rate-limit | 8.x | Rate Limiting |
| dotenv | 16.x | Environment Variables |
| cors | 2.x | Cross-Origin Policy |
| nodemon | 3.x | Development Server |

---

## 7. FEATURES AND MODULES

### 7.1 Authentication Module
- User Registration with role selection (User / Admin)
- Secure Login with email, password, and role
- JWT Token-based session management (7-day expiry)
- Password hashing using bcrypt (salt rounds: 10)
- Rate limiting on login/register (20 requests per 15 minutes)
- Guest access without registration

### 7.2 URL Scanner Module
- Real-time URL phishing detection
- Risk classification: HIGH / MEDIUM / LOW
- Scan history stored in MongoDB
- User-specific scan statistics
- Admin view of all user scans

### 7.3 Lessons Module
- 15 structured cybersecurity lessons
- 3 difficulty levels: Beginner, Intermediate, Advanced
- 5 free lessons accessible to Guest users
- Admin can Add / Edit / Delete / Activate lessons
- Lesson status management: Active / Waiting / Pending

### 7.4 Quiz Module
- 20 quizzes with 20 questions each
- 2 demo quizzes accessible to Guest users
- 10 active quizzes for registered users
- 10 quizzes pending admin approval
- Pass requirement: 80% score
- Quiz results saved to database
- Admin approval workflow for new quizzes

### 7.5 Admin Dashboard
- Overview statistics (High/Medium/Low risk scans)
- Bar chart and Pie chart for threat distribution
- Line chart for 7-day threat trends
- User management and activity tracking
- Recent scan history monitoring
- Quiz result monitoring
- Lesson and Quiz management

### 7.6 User Dashboard
- Personal scan statistics
- Quick URL scanner
- Recent scan history
- Quiz results history
- Security tips and best practices
- Profile management

### 7.7 Profile Module
- Update name, age, date of birth
- Phone number and address
- Bio and profile picture
- Data persisted in MongoDB

### 7.8 Report Module
- Users can report suspicious URLs
- Reports submitted to admin

---

## 8. DATABASE DESIGN

### Collections

**Users Collection**
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (unique)",
  "password": "String (hashed)",
  "role": "String (user/admin)",
  "age": "String",
  "dob": "String",
  "phone": "String",
  "address": "String",
  "bio": "String",
  "profilePicture": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Lessons Collection**
```json
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "content": "String (HTML)",
  "icon": "String (emoji)",
  "level": "String (Beginner/Intermediate/Advanced)",
  "duration": "String",
  "isFree": "Boolean",
  "status": "String (active/pending/waiting)",
  "createdAt": "Date"
}
```

**Quizzes Collection**
```json
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "isDemo": "Boolean",
  "status": "String (active/waiting)",
  "questions": [
    {
      "question": "String",
      "options": ["String"],
      "correctAnswer": "String"
    }
  ],
  "createdAt": "Date"
}
```

**ScanLogs Collection**
```json
{
  "_id": "ObjectId",
  "url": "String",
  "risk": "String (HIGH/MEDIUM/LOW)",
  "score": "Number",
  "userId": "ObjectId (ref: User)",
  "userName": "String",
  "userEmail": "String",
  "createdAt": "Date"
}
```

**QuizResults Collection**
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User)",
  "userName": "String",
  "quizId": "ObjectId (ref: Quiz)",
  "quizTitle": "String",
  "score": "Number",
  "total": "Number",
  "percentage": "Number",
  "passed": "Boolean",
  "createdAt": "Date"
}
```

---

## 9. SECURITY IMPLEMENTATION

| Security Feature | Implementation |
|-----------------|----------------|
| Password Hashing | bcrypt with 10 salt rounds |
| Authentication | JWT tokens with 7-day expiry |
| Authorization | Role-based middleware (Guest/User/Admin) |
| CORS Policy | Restricted to frontend origin only |
| Rate Limiting | 20 requests per 15 minutes on auth routes |
| Input Validation | Server-side validation on all routes |
| Environment Variables | Sensitive data stored in .env file |
| Lazy Module Loading | Modules loaded on demand to reduce attack surface |

---

## 10. SYSTEM REQUIREMENTS

### Hardware Requirements
- Processor: Intel Core i3 or higher
- RAM: 4 GB minimum (8 GB recommended)
- Storage: 500 MB free space
- Internet Connection: Required

### Software Requirements
- Operating System: Windows 10/11, macOS, or Linux
- Node.js: v16 or higher
- MongoDB: v6 or higher
- Web Browser: Chrome, Firefox, Edge (latest versions)
- Git: v2.x or higher

---

## 11. INSTALLATION AND SETUP

### Step 1: Clone Repository
```bash
git clone https://github.com/giriraj-gh/ANTI-PHISHING-WEB-APP.git
cd ANTI-PHISHING-WEB-APP
```

### Step 2: Setup Backend
```bash
cd BACKEND
npm install
npm run seed
npm run dev
```

### Step 3: Setup Frontend
```bash
cd FRONTEND/frontend
npm install
npm start
```

### Step 4: Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | 123456 |
| User | user@gmail.com | 123456 |

---

## 12. MODULE DESCRIPTION

### Guest User Access
- View home page and platform features
- Access 5 free lessons
- Take 2 demo quizzes
- View public information

### Registered User Access
- All guest features
- Scan URLs for phishing threats
- Access all 15 lessons
- Take all 10 active quizzes
- View personal dashboard and statistics
- Manage profile
- Report suspicious URLs

### Admin Access
- All user features
- View all users and their activity
- Manage all 15 lessons (Add/Edit/Delete/Activate)
- Manage all 20 quizzes (Add/Edit/Delete/Activate)
- Approve waiting quizzes and lessons
- View all scan history across all users
- Monitor quiz results
- View threat analytics and charts

---

## 13. TESTING

### Functional Testing

| Test Case | Input | Expected Output | Status |
|-----------|-------|-----------------|--------|
| User Registration | Valid name, email, password | Account created successfully | ✅ Pass |
| User Login | Valid credentials | JWT token returned, redirect to dashboard | ✅ Pass |
| Invalid Login | Wrong password | Error message displayed | ✅ Pass |
| URL Scan (Phishing) | URL with "phish" keyword | HIGH risk result | ✅ Pass |
| URL Scan (Safe) | Normal URL | LOW risk result | ✅ Pass |
| Guest Lesson Access | Free lesson | Lesson content displayed | ✅ Pass |
| Guest Premium Lesson | Paid lesson | Redirect to register | ✅ Pass |
| Quiz Pass | Score >= 80% | Pass message displayed | ✅ Pass |
| Quiz Fail | Score < 80% | Fail message, retry option | ✅ Pass |
| Admin Activate Lesson | Click Activate | Lesson status changed to Active | ✅ Pass |
| Admin Activate Quiz | Click Activate | Quiz available to users | ✅ Pass |
| Rate Limiting | 21+ login attempts | Request blocked | ✅ Pass |

### Security Testing

| Test | Result |
|------|--------|
| SQL Injection attempt | Blocked by Mongoose ODM |
| Unauthorized API access | 401 Unauthorized returned |
| CORS from unknown origin | Blocked |
| Brute force login | Blocked by rate limiter |
| Password stored in plain text | No - bcrypt hashed |

---

## 14. CONCLUSION

The Anti-Phishing Web Application successfully achieves its objectives of providing a comprehensive cybersecurity awareness and threat detection platform. The system combines real-time URL scanning with structured educational content and interactive quizzes to empower users against phishing threats.

Key achievements of this project:
- Developed a full-stack web application using modern technologies (React.js, Node.js, MongoDB)
- Implemented role-based access control for Guest, User, and Admin roles
- Created 15 cybersecurity lessons covering Beginner to Advanced topics
- Built 20 interactive quizzes with 20 questions each
- Implemented secure authentication with JWT and bcrypt
- Applied security best practices including CORS, rate limiting, and lazy loading
- Deployed version control using Git and GitHub

The project demonstrates practical application of web development, database management, and cybersecurity concepts learned throughout the academic program.

---

## 15. FUTURE SCOPE

1. **AI-Powered URL Analysis** - Integrate machine learning models for more accurate phishing detection
2. **Email Scanner** - Scan email content and attachments for phishing indicators
3. **Browser Extension** - Real-time protection while browsing
4. **Mobile Application** - React Native mobile app for iOS and Android
5. **Email Verification** - OTP-based email verification during registration
6. **Two-Factor Authentication** - SMS or authenticator app 2FA
7. **Cloud Deployment** - Deploy on AWS, Azure, or Vercel for public access
8. **Internationalization** - Multi-language support
9. **API Integration** - Integrate with VirusTotal or Google Safe Browsing API
10. **Gamification** - Points, badges, and leaderboards for quiz performance

---

## 16. REFERENCES

1. OWASP Foundation. (2023). *Phishing Prevention Cheat Sheet*. https://owasp.org
2. React Documentation. (2024). *React - A JavaScript library for building user interfaces*. https://react.dev
3. Node.js Foundation. (2024). *Node.js Documentation*. https://nodejs.org
4. MongoDB Inc. (2024). *MongoDB Documentation*. https://www.mongodb.com/docs
5. Express.js. (2024). *Express - Fast, unopinionated, minimalist web framework*. https://expressjs.com
6. JWT.io. (2024). *JSON Web Tokens Introduction*. https://jwt.io
7. NIST. (2023). *Phishing Attack Prevention Guidelines*. https://www.nist.gov
8. Verizon. (2023). *Data Breach Investigations Report*. https://www.verizon.com/business/resources/reports/dbir
9. bcrypt.js. (2024). *bcryptjs npm package*. https://www.npmjs.com/package/bcryptjs
10. Mongoose. (2024). *Mongoose ODM Documentation*. https://mongoosejs.com

---

*This report was prepared as part of the Final Year Project submission.*
*GitHub: https://github.com/giriraj-gh/ANTI-PHISHING-WEB-APP*

---
