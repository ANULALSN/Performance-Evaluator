const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  passwordHash: { type: String, required: true },
  techStack: { type: String },
  skillLevel: { 
    type: String, 
    enum: ["beginner", "intermediate", "advanced"] 
  },
  role: { type: String, default: "student" },
  isVerified: { type: Boolean, default: true },
  consistencyScore: { type: Number, default: 0 },
  weeklyScore: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  weaknessTags: [String],
  lastActiveAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
