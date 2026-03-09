# 🗄️ Permanent Data Storage System

## ✅ All Data Stored Permanently in localStorage

### 1. **URL Scan History** 
**Storage Key:** `scanHistory`
- Every URL scan is permanently saved
- Includes: URL, risk level, score, user info, timestamp
- Accessible by both users and admins
- Never deleted unless manually cleared

**Data Structure:**
```json
{
  "_id": "timestamp",
  "url": "https://example.com",
  "risk": "HIGH/MEDIUM/LOW",
  "score": 0-100,
  "userId": 123,
  "userName": "John Doe",
  "userEmail": "user@gmail.com",
  "userRole": "user/admin",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. **User Scan Statistics**
**Storage Key:** `userStats_{userId}`
- Individual stats for each user
- Automatically updated on every scan
- Tracks total scans and risk breakdown

**Data Structure:**
```json
{
  "totalScans": 25,
  "highRisk": 5,
  "mediumRisk": 8,
  "lowRisk": 12,
  "lastScan": "2024-01-01T00:00:00.000Z"
}
```

### 3. **User Profile Data**
**Storage Key:** `registeredUsers`
- All user registration data
- Profile information (name, email, age, dob, picture, phone, address, bio)
- Permanently stored and synced

### 4. **Quiz Results**
**Storage Key:** `quizResults`
- All quiz attempts with scores
- Pass/fail status (80% requirement)
- Timestamp and user info

### 5. **Lesson Completion**
**Storage Key:** `completedLessons_{userId}`
- Tracks which lessons each user completed
- Completion timestamps
- Subject tracking

### 6. **Current User Session**
**Storage Key:** `user`
- Currently logged-in user data
- Synced with registeredUsers on profile updates

## 📊 Admin Tracking Features

### What Admins Can See:
1. **All User Scan History**
   - Every URL scanned by all users
   - User names, emails, and timestamps
   - Risk levels and scores

2. **Individual User Statistics**
   - Total scans per user
   - High/Medium/Low risk counts per user
   - Join dates and activity

3. **Quiz Results**
   - All user quiz attempts
   - Scores and pass/fail status
   - Quiz titles and timestamps

4. **User Management**
   - List of all registered users
   - User profiles and activity
   - Registration dates

## 🔄 Data Persistence

### How It Works:
- **Automatic Save**: Every action (scan, quiz, profile update) automatically saves to localStorage
- **Permanent Storage**: Data persists across browser sessions
- **No Expiration**: Data never expires unless manually cleared
- **Real-time Updates**: Counts and statistics update immediately

### Data Flow:
```
User Action → API Call → localStorage Update → UI Refresh → Permanent Storage
```

## 📈 Dashboard Features

### User Dashboard Shows:
- ✅ Total scans count (permanent)
- ✅ High/Medium/Low risk counts (permanent)
- ✅ Recent scan history (last 10)
- ✅ Quiz results (last 5)
- ✅ Personal statistics

### Admin Dashboard Shows:
- ✅ All users' scan history
- ✅ Total system statistics
- ✅ Per-user scan counts
- ✅ Per-user risk breakdown
- ✅ All quiz results
- ✅ User registration tracking

## 🔐 Data Security

- All data stored locally in browser
- No external database required
- User-specific data isolated by userId
- Admin can view all data
- Users can only view their own data

## 💾 Storage Keys Reference

| Key | Description | Access |
|-----|-------------|--------|
| `scanHistory` | All URL scans | Admin: All, User: Own |
| `userStats_{userId}` | Per-user statistics | User: Own, Admin: All |
| `registeredUsers` | All user accounts | Admin: All, User: Own |
| `quizResults` | All quiz attempts | Admin: All, User: Own |
| `completedLessons_{userId}` | Lesson completion | User: Own |
| `lessons` | Available lessons | All |
| `user` | Current session | Current user |
| `token` | Auth token | Current user |
| `role` | User role | Current user |

## 🎯 Key Features

✅ **Permanent Storage** - All data persists forever
✅ **Real-time Counts** - Statistics update instantly
✅ **User Tracking** - Admin sees all user activity
✅ **Individual Stats** - Each user has separate statistics
✅ **History Preservation** - Complete scan history maintained
✅ **No Data Loss** - Data survives page refreshes and browser restarts

---

**Note:** To clear all data, use browser developer tools → Application → Local Storage → Clear All
