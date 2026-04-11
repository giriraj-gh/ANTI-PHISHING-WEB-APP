const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  age: String,
  dob: String,
  phone: String,
  address: String,
  bio: String,
  profilePicture: String,
  adminRequest: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  lastLogin: Date,
  loginCount: { type: Number, default: 0 },
  // Email verification
  emailVerified: { type: Boolean, default: false },
  emailVerifyToken: String,
  // Refresh token
  refreshToken: String,
  // Quiz cooldown: map of quizId -> last attempt timestamp
  quizCooldowns: { type: Map, of: Date, default: {} },
  // Bookmarked lesson IDs
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  // Unread notifications
  notifications: [{
    message: String,
    type: { type: String, enum: ['success', 'warning', 'info'], default: 'info' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  // Dark mode preference
  darkMode: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
