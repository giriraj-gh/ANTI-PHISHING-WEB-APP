const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  quizTitle: String,
  score: Number,
  total: Number,
  percentage: Number,
  passed: Boolean
}, { timestamps: true });

module.exports = mongoose.model('QuizResult', quizResultSchema);
