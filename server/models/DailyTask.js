const mongoose = require('mongoose');

const dailyTaskSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  tasks: [
    { 
      type: { type: String, enum: ['concept', 'feature', 'debug'], required: true },
      title: { type: String, required: true },
      completed: { type: Boolean, default: false }
    }
  ],
  allCompleted: { type: Boolean, default: false },
  pointsAwarded: { type: Number, default: 0 }
});

module.exports = mongoose.model('DailyTask', dailyTaskSchema);
