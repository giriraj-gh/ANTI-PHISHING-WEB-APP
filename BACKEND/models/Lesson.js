const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  content: String,
  icon: { type: String, default: '📚' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  duration: { type: String, default: '10 min' },
  isFree: { type: Boolean, default: false },
  status: { type: String, default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
