const mongoose = require('mongoose');

const scanLogSchema = new mongoose.Schema({
  url: { type: String, required: true },
  risk: { type: String, enum: ['Safe', 'Suspicious', 'Phishing', 'HIGH', 'MEDIUM', 'LOW'], required: true },
  score: { type: Number, required: true },
  sources: [{ type: String }],
  message: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  userEmail: { type: String },
  scannedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ScanLog', scanLogSchema);
