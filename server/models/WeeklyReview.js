const mongoose = require('mongoose');

const weeklyReviewSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  weekStartDate: { type: String, required: true }, // YYYY-MM-DD
  completed: { type: String, required: true },
  incomplete: { type: String, required: true },
  improvement: { type: String, required: true },
  aiFeedback: { type: String }, // Keep for legacy if needed, but we'll use feedbackSummary
  feedbackSummary: { type: String },
  weaknessAnalysis: [{ type: String }],
  nextWeekRoadmap: [{ type: String }],
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WeeklyReview', weeklyReviewSchema);
