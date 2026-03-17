const mongoose = require('mongoose');

const CodingAttemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingProblem',
    required: true
  },
  language: {
    type: String,
    enum: ['python', 'javascript'],
    required: true
  },
  code: {
    type: String,
    required: true
  },
  testResults: [{
    testCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    passed: {
      type: Boolean,
      required: true
    },
    actualOutput: String,
    expectedOutput: String,
    isHidden: Boolean
  }],
  passedCount: {
    type: Number,
    default: 0
  },
  totalVisible: {
    type: Number,
    default: 0
  },
  totalHidden: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['accepted', 'partial', 'failed', 'error'],
    default: 'failed'
  },
  errorMessage: String,
  timeTaken: {
    type: Number,
    default: 0
  },
  hintsUsed: {
    type: Number,
    default: 0
  },
  pointsAwarded: {
    type: Number,
    default: 0
  },
  attemptedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one submission per student per problem
CodingAttemptSchema.index({ studentId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('CodingAttempt', CodingAttemptSchema);
