const mongoose = require('mongoose');

const dailyCheckInSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  learned: { type: String, required: true },
  built: { type: String, required: true },
  problem: { type: String, required: true },
  aiFeedback: { type: String },
  aiSuggestion: { type: String },
  nextTask: { type: String },
  pointsAwarded: { type: Number, default: 1 },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DailyCheckIn', dailyCheckInSchema);
