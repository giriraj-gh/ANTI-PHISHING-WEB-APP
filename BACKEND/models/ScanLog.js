const mongoose = require('mongoose');

const scanLogSchema = new mongoose.Schema({
  url: { type: String, required: true },
  risk: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'] },
  score: Number,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userEmail: String
}, { timestamps: true });

module.exports = mongoose.model('ScanLog', scanLogSchema);
