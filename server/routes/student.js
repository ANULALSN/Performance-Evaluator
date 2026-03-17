const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const Student = require('../models/Student');
const DailyCheckIn = require('../models/DailyCheckIn');
const DailyTask = require('../models/DailyTask');
const WeeklyReview = require('../models/WeeklyReview');
const QuizAttempt = require('../models/QuizAttempt');
const CodingAttempt = require('../models/CodingAttempt');
const { generateCheckinFeedback, generateDailyTasks, generateWeeklyReview } = require('../services/aiService');

// App-wide guard for student routes
router.use(auth, roleGuard('student'));

/**
 * @route POST /api/student/checkin
 * @desc Create daily check-in
 */
router.post('/checkin', async (req, res) => {
  try {
    const { learned, built, problem } = req.body;
    const dateStr = new Date().toISOString().split('T')[0];
    
    let checkin = await DailyCheckIn.findOne({ studentId: req.user.id, date: dateStr });
    if (checkin) return res.status(400).json({ error: 'Already checked in today' });

    const student = await Student.findById(req.user.id);
    const aiResponse = await generateCheckinFeedback(student, { learned, built, problem });

    checkin = new DailyCheckIn({
      studentId: req.user.id,
      date: dateStr,
      learned, built, problem,
      aiFeedback: aiResponse.feedback,
      aiSuggestion: aiResponse.suggestion,
      nextTask: aiResponse.nextTask
    });
    await checkin.save();

    student.consistencyScore += 1;
    student.weeklyScore += 1;
    student.streak += 1;
    student.lastActiveAt = Date.now();
    await student.save();

    res.json(checkin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/student/today-checkin
 * @desc Get today's check-in
 */
router.get('/today-checkin', async (req, res) => {
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    const checkin = await DailyCheckIn.findOne({ studentId: req.user.id, date: dateStr });
    res.json(checkin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/student/today-tasks
 * @desc Get or generate today's tasks
 */
router.get('/today-tasks', async (req, res) => {
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    let dailyTask = await DailyTask.findOne({ studentId: req.user.id, date: dateStr });
    
    if (!dailyTask) {
      const student = await Student.findById(req.user.id);
      const aiTasks = await generateDailyTasks(student);
      
      dailyTask = new DailyTask({
        studentId: req.user.id,
        date: dateStr,
        tasks: [
          { type: 'concept', title: aiTasks.concept, completed: false },
          { type: 'feature', title: aiTasks.feature, completed: false },
          { type: 'debug', title: aiTasks.debug, completed: false }
        ]
      });
      await dailyTask.save();
    }
    res.json(dailyTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route PATCH /api/student/tasks/:taskId/complete
 * @desc Mark a task as complete
 */
router.patch('/tasks/:taskId/complete', async (req, res) => {
  try {
    const { taskId } = req.params;
    const dateStr = new Date().toISOString().split('T')[0];
    const dailyTaskEntry = await DailyTask.findOne({ studentId: req.user.id, date: dateStr });
    
    if (!dailyTaskEntry) return res.status(404).json({ error: 'No tasks found for today' });

    const taskIndex = dailyTaskEntry.tasks.findIndex(t => t.id === taskId || t._id.toString() === taskId);
    if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });
    
    if (dailyTaskEntry.tasks[taskIndex].completed) return res.status(400).json({ error: 'Task already completed' });

    dailyTaskEntry.tasks[taskIndex].completed = true;
    
    // Check if all completed
    if (dailyTaskEntry.tasks.every(t => t.completed)) {
      dailyTaskEntry.allCompleted = true;
      dailyTaskEntry.pointsAwarded = 3;
      
      const student = await Student.findById(req.user.id);
      student.consistencyScore += 3;
      student.weeklyScore += 3;
      await student.save();
    }
    
    await dailyTaskEntry.save();
    res.json(dailyTaskEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/student/weekly-review
 * @desc Submit weekly review
 */
router.post('/weekly-review', async (req, res) => {
  try {
    const { completed, incomplete, improvement } = req.body;
    const dateStr = new Date().toISOString().split('T')[0];
    
    const student = await Student.findById(req.user.id);
    const aiReview = await generateWeeklyReview(student, { completed, incomplete, improvement });
    
    const review = new WeeklyReview({
      studentId: req.user.id,
      weekStartDate: dateStr,
      completed, incomplete, improvement,
      aiFeedback: aiReview.feedbackSummary,
      feedbackSummary: aiReview.feedbackSummary,
      weaknessAnalysis: aiReview.weaknessAnalysis,
      nextWeekRoadmap: aiReview.nextWeekRoadmap
    });
    
    await review.save();
    
    // Update student weakness tags
    student.weaknessTags = [...new Set([...student.weaknessTags, ...aiReview.weaknessAnalysis])];
    await student.save();

    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/student/heatmap
 * @desc Get student learning activity heatmap data
 */
router.get('/heatmap', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 365;
    const studentId = req.user.id;
    
    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);
    
    const startDateStr = startDate.toISOString().split('T')[0];

    // Fetch all relevant data in parallel
    const [checkins, dailyTasks, quizAttempts, codingAttempts] = await Promise.all([
      DailyCheckIn.find({ studentId, date: { $gte: startDateStr } }),
      DailyTask.find({ studentId, date: { $gte: startDateStr } }),
      QuizAttempt.find({ studentId, attemptedAt: { $gte: startDate } }),
      CodingAttempt.find({ studentId, attemptedAt: { $gte: startDate } })
    ]);

    // Create a map for easy lookup by date
    const dataByDate = {};

    // Helper to get date string from various formats
    const getDateStr = (val) => {
      if (typeof val === 'string') return val.split('T')[0];
      return new Date(val).toISOString().split('T')[0];
    };

    checkins.forEach(c => {
      const d = getDateStr(c.date);
      if (!dataByDate[d]) dataByDate[d] = { score: 0, checkIn: false, tasksCompleted: 0, extraActivity: false };
      dataByDate[d].checkIn = true;
      dataByDate[d].score += (c.pointsAwarded || 1);
    });

    dailyTasks.forEach(dt => {
      const d = getDateStr(dt.date);
      if (!dataByDate[d]) dataByDate[d] = { score: 0, checkIn: false, tasksCompleted: 0, extraActivity: false };
      dataByDate[d].tasksCompleted = dt.tasks.filter(t => t.completed).length;
      dataByDate[d].score += (dt.pointsAwarded || 0);
    });

    quizAttempts.forEach(qa => {
      const d = getDateStr(qa.attemptedAt);
      if (!dataByDate[d]) dataByDate[d] = { score: 0, checkIn: false, tasksCompleted: 0, extraActivity: false };
      dataByDate[d].extraActivity = true;
      dataByDate[d].score += 2; // Assuming 2 points per quiz attempt for heatmap leveling
    });

    codingAttempts.forEach(ca => {
      const d = getDateStr(ca.attemptedAt);
      if (!dataByDate[d]) dataByDate[d] = { score: 0, checkIn: false, tasksCompleted: 0, extraActivity: false };
      dataByDate[d].extraActivity = true;
      dataByDate[d].score += 3; // Assuming 3 points per coding attempt
    });

    // Generate result for exactly X days
    const result = [];
    const curr = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
        const dStr = curr.toISOString().split('T')[0];
        const dayData = dataByDate[dStr] || { score: 0, checkIn: false, tasksCompleted: 0, extraActivity: false };
        
        let level = 0;
        if (dayData.checkIn || dayData.extraActivity || dayData.tasksCompleted > 0) {
            if (dayData.score >= 7) level = 4;
            else if (dayData.score >= 4) level = 3;
            else if (dayData.score >= 2) level = 2;
            else level = 1;
        }

        result.push({
            date: dStr,
            level,
            score: dayData.score,
            checkIn: dayData.checkIn,
            tasksCompleted: dayData.tasksCompleted
        });
        
        curr.setDate(curr.getDate() + 1);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
