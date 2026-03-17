const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const auth = require('../middleware/auth');
const { adminGuard } = require('../middleware/roleGuard');

/**
 * @route GET /api/export/students
 * @desc Export student roster to CSV
 */
router.get('/students', [auth, adminGuard], async (req, res) => {
  try {
    const students = await Student.find().sort({ consistencyScore: -1 });
    let csv = 'Name,Email,Tech Stack,Skill Level,Score,Weekly Score,Streak,Last Active,Weakness Tags\n';
    students.forEach(s => {
      const tags = (s.weaknessTags || []).join(';');
      csv += `"${s.name}","${s.email}","${s.techStack}","${s.skillLevel}",${s.consistencyScore},${s.weeklyScore},${s.streak},"${s.lastActiveAt ? s.lastActiveAt.toISOString() : ''}","${tags}"\n`;
    });
    const filename = `sipp_students_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/export/quiz-results
 * @desc Export quiz results to CSV
 */
router.get('/quiz-results', [auth, adminGuard], async (req, res) => {
  try {
    const attempts = await QuizAttempt.find()
      .populate('studentId', 'name email')
      .populate('quizId', 'title')
      .sort({ attemptedAt: -1 });
    let csv = 'Student Name,Student Email,Quiz Title,Score,Passed,Correct,Total,Time (s),Attempted At\n';
    attempts.forEach(a => {
      const sName = a.studentId ? a.studentId.name : 'Deleted Student';
      const sEmail = a.studentId ? a.studentId.email : 'N/A';
      const qTitle = a.quizId ? a.quizId.title : 'Deleted Quiz';
      csv += `"${sName}","${sEmail}","${qTitle}",${a.score},${a.passed},${a.correctCount},${a.totalQuestions},${a.timeTaken},"${a.attemptedAt.toISOString()}"\n`;
    });
    const filename = `sipp_quiz_results_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
