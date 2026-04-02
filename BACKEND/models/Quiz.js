const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  isDemo: { type: Boolean, default: false },
  status: { type: String, default: 'active' },
  questions: [questionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
