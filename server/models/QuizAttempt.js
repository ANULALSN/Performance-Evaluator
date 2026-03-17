const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  answers: [{ 
    questionId: mongoose.Schema.Types.ObjectId,
    selectedIndex: Number
  }],
  score: Number, // percentage 0-100
  correctCount: Number,
  totalQuestions: Number,
  passed: Boolean,
  timeTaken: Number, // seconds
  attemptedAt: { type: Date, default: Date.now }
});

// Enforce one attempt per student per quiz
quizAttemptSchema.index({ studentId: 1, quizId: 1 }, { unique: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
