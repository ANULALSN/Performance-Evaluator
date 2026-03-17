const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  techStack: { 
    type: String, 
    enum: ["Python", "JavaScript", "React", "Node.js", "Full Stack", "AI/ML", "General"]
  },
  difficulty: { type: String, enum: ["easy", "medium", "hard"] },
  timeLimit: { type: Number, default: 0 }, // 0 = no limit, else seconds
  questions: [{
    question: { type: String, required: true },
    options: { 
      type: [String], 
      validate: v => v.length === 4 
    },
    correctIndex: { type: Number, required: true }, // 0-3
    explanation: { type: String }
  }],
  isActive: { type: Boolean, default: false },
  passingScore: { type: Number, default: 60 },
  createdBy: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
