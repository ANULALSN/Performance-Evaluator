const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const Student = require('../models/Student');
const DailyCheckIn = require('../models/DailyCheckIn');
const DailyTask = require('../models/DailyTask');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const CodingAttempt = require('../models/CodingAttempt');
const WeeklyReview = require('../models/WeeklyReview');

// @route GET /api/admin/students
router.get('/students', auth, roleGuard('admin'), async (req, res) => {
  try {
    const students = await Student.find({ role: 'student' }).sort({ consistencyScore: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route GET /api/admin/dropoff-alerts
router.get('/dropoff-alerts', auth, roleGuard('admin'), async (req, res) => {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    // Students who haven't been active in the last 2 days
    const alertStudents = await Student.find({
      role: 'student',
      lastActiveAt: { $lt: twoDaysAgo }
    }).sort({ lastActiveAt: 1 });
    
    res.json(alertStudents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route GET /api/admin/leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const students = await Student.find({ role: 'student' })
      .sort({ weeklyScore: -1 })
      .limit(10);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route GET /api/admin/analytics
router.get('/analytics', auth, roleGuard('admin'), async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ role: 'student' });
    const students = await Student.find({ role: 'student' });
    
    const avgScore = totalStudents > 0 ? (students.reduce((acc, s) => acc + s.consistencyScore, 0) / totalStudents) : 0;
    
    const dateStr = new Date().toISOString().split('T')[0];
    const todayCheckins = await DailyCheckIn.countDocuments({ date: dateStr });
    
    const checkinRate = totalStudents > 0 ? (todayCheckins / totalStudents) * 100 : 0;

    res.json({ totalStudents, avgScore, checkinRate: Math.round(checkinRate) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route GET /api/admin/students/:id/profile
router.get('/students/:id/profile', auth, roleGuard('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // 1. Last 7 days activity
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        const checkin = await DailyCheckIn.findOne({ studentId: student._id, date: dateStr });
        const tasks = await DailyTask.findOne({ studentId: student._id, date: dateStr });
        
        // Find attempts on this date (start of day to end of day)
        const startOfDay = new Date(d); startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(d); endOfDay.setHours(23,59,59,999);
        
        const quizzes = await QuizAttempt.find({ 
            studentId: student._id, 
            attemptedAt: { $gte: startOfDay, $lte: endOfDay } 
        }).populate('quizId', 'title');
        
        const codings = await CodingAttempt.find({ 
            studentId: student._id, 
            attemptedAt: { $gte: startOfDay, $lte: endOfDay } 
        }).populate('problemId', 'title');

        last7Days.push({
            date: dateStr,
            checkInDone: !!checkin,
            checkInText: checkin ? { learned: checkin.learned, built: checkin.built, problem: checkin.problem } : null,
            aiFeedback: checkin ? checkin.aiFeedback : null,
            tasksAssigned: tasks ? tasks.tasks : [],
            tasksCompleted: tasks ? tasks.tasks.filter(t => t.completed).length : 0,
            pointsEarned: (checkin ? 1 : 0) + (tasks ? tasks.pointsAwarded : 0),
            quizAttempts: quizzes.map(q => ({ title: q.quizId?.title || 'Unknown', score: q.score })),
            codingAttempts: codings.map(c => ({ title: c.problemId?.title || 'Unknown', status: c.status, score: c.score }))
        });
    }

    // 2. Assessment History
    const quizHistory = await QuizAttempt.find({ studentId: student._id })
        .populate('quizId', 'title')
        .sort({ attemptedAt: -1 });
    
    const codingHistory = await CodingAttempt.find({ studentId: student._id })
        .populate('problemId', 'title')
        .sort({ attemptedAt: -1 });

    // 3. Weekly Reviews
    const weeklyReviews = await WeeklyReview.find({ studentId: student._id })
        .sort({ submittedAt: -1 })
        .limit(4);

    // 4. Score Timeline (Last 8 Weeks)
    const scoreTimeline = [];
    const today = new Date();
    for (let i = 0; i < 8; i++) {
        const start = new Date(today);
        start.setDate(today.getDate() - (i * 7) - today.getDay()); // Sunday
        start.setHours(0,0,0,0);
        
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23,59,59,999);

        const tasksForWeek = await DailyTask.find({
            studentId: student._id,
            date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] }
        });

        const weeklyScore = tasksForWeek.reduce((acc, curr) => acc + curr.pointsAwarded, 0);
        const totalTasks = tasksForWeek.reduce((acc, curr) => acc + curr.tasks.length, 0);
        const completedTasks = tasksForWeek.reduce((acc, curr) => acc + curr.tasks.filter(t => t.completed).length, 0);
        
        scoreTimeline.unshift({
            week: `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            weeklyScore,
            avgTaskCompletion: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
        });
    }

    res.json({
        student,
        last7Days,
        quizHistory: quizHistory.map(q => ({ title: q.quizId?.title || 'Unknown', score: q.score, passed: q.passed, attemptedAt: q.attemptedAt })),
        codingHistory: codingHistory.map(c => ({ title: c.problemId?.title || 'Unknown', status: c.status, score: c.score, language: c.language, attemptedAt: c.attemptedAt })),
        weeklyReviews,
        scoreTimeline
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
