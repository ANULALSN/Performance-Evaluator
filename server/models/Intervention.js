const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: String,
  type: { 
    type: String, 
    enum: ["STREAK_BROKEN", "CONSISTENT_DROPOUT", "QUIZ_FAILING", "SCORE_DECLINING", "NEVER_STARTED", "HIGH_PERFORMER"],
    required: true
  },
  severity: { 
    type: String, 
    enum: ["critical", "warning", "positive"],
    required: true
  },
  message: String,
  metadata: { type: Object, default: {} },
  detectedAt: { type: Date, default: Date.now },
  dismissed: { type: Boolean, default: false },
  dismissedAt: { type: Date }
});

module.exports = mongoose.model('Intervention', interventionSchema);
