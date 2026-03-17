const mongoose = require('mongoose');

const CodingProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  techStack: {
    type: String,
    enum: ['Python', 'JavaScript', 'General'],
    default: 'General'
  },
  starterCode: {
    python: {
      type: String,
      default: 'def solution(arr):\n    # your code here\n    pass'
    },
    javascript: {
      type: String,
      default: 'function solution(arr) {\n  // your code here\n}'
    }
  },
  testCases: [{
    input: {
      type: String,
      required: true
    },
    expectedOutput: {
      type: String,
      required: true
    },
    isHidden: {
      type: Boolean,
      default: false
    },
    explanation: {
      type: String
    }
  }],
  constraints: [String],
  hints: [String],
  timeLimit: {
    type: Number,
    default: 1800 // 30 minutes in seconds
  },
  pointsReward: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CodingProblem', CodingProblemSchema);
