const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const { adminGuard, studentGuard } = require('../middleware/roleGuard');
const { toStudentDTO, toAdminDTO } = require('../utils/quizDTO');

// --- ADMIN ROUTES ---

/**
 * @route POST /api/admin/quizzes
 */
router.post('/admin/quizzes', [auth, adminGuard], async (req, res) => {
  const { title, description, techStack, difficulty, timeLimit, passingScore, questions, isActive } = req.body;
  try {
    const quiz = new Quiz({
      title, description, techStack, difficulty, 
      timeLimit, passingScore, questions, isActive: !!isActive
    });
    await quiz.save();
    res.json(toAdminDTO(quiz));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/admin/quizzes
 */
router.get('/admin/quizzes', [auth, adminGuard], async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    const quizzesWithStats = await Promise.all(quizzes.map(async (quiz) => {
      const attemptCount = await QuizAttempt.countDocuments({ quizId: quiz._id });
      return { ...toAdminDTO(quiz), attemptCount };
    }));
    res.json(quizzesWithStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/admin/quizzes/:id/results
 */
router.get('/admin/quizzes/:id/results', [auth, adminGuard], async (req, res) => {
  try {
    const results = await QuizAttempt.find({ quizId: req.params.id })
      .populate('studentId', 'name email')
      .sort({ score: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ... other admin routes as needed (toggle, delete, etc)
router.get('/admin/quizzes/:id', [auth, adminGuard], async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(toAdminDTO(quiz));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/admin/quizzes/:id/toggle', [auth, adminGuard], async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    quiz.isActive = !quiz.isActive;
    await quiz.save();
    res.json({ isActive: quiz.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- STUDENT ROUTES ---

router.get('/quizzes', [auth, studentGuard], async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true }).sort({ createdAt: -1 });
    const userAttempts = await QuizAttempt.find({ studentId: req.user.id });
    const studentQuizzes = quizzes.map(quiz => {
      const attempt = userAttempts.find(a => a.quizId.toString() === quiz._id.toString());
      return {
        ...toStudentDTO(quiz),
        hasAttempted: !!attempt,
        myScore: attempt ? attempt.score : null
      };
    });
    res.json(studentQuizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/quizzes/:id', [auth, studentGuard], async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz || !quiz.isActive) return res.status(403).json({ message: 'Quiz not available' });
    res.json(toStudentDTO(quiz));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/quizzes/:id/attempt', [auth, studentGuard], async (req, res) => {
  const { answers, timeTaken } = req.body;
  try {
    const existing = await QuizAttempt.findOne({ studentId: req.user.id, quizId: req.params.id });
    if (existing) return res.status(409).json({ message: 'Already attempted.' });

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let correctCount = 0;
    const breakdown = quiz.questions.map(q => {
      const studentAnswer = answers.find(a => a.questionId.toString() === q._id.toString());
      const selectedIndex = studentAnswer ? studentAnswer.selectedIndex : -1;
      const isCorrect = selectedIndex === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q._id, question: q.question,
        yourAnswer: q.options[selectedIndex] || 'No answer',
        correctAnswer: q.options[q.correctIndex],
        explanation: q.explanation, isCorrect
      };
    });

    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = new QuizAttempt({
      studentId: req.user.id, quizId: quiz._id,
      answers, score, correctCount, totalQuestions, passed, timeTaken
    });
    await attempt.save();

    let pointsAwarded = score >= 80 ? 5 : (score >= 60 ? 3 : 1);
    await Student.findByIdAndUpdate(req.user.id, { $inc: { consistencyScore: pointsAwarded } });

    res.json({ score, correctCount, totalQuestions, passed, timeTaken, pointsAwarded, breakdown });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
