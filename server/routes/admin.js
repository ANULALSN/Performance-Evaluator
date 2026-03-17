const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const Student = require('../models/Student');
const DailyCheckIn = require('../models/DailyCheckIn');
const DailyTask = require('../models/DailyTask');
const Quiz = require('../models/Quiz');

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

module.exports = router;
