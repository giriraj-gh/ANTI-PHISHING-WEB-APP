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
  adminRequest: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
