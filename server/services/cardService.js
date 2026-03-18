const Student = require('../models/Student');
const QuizAttempt = require('../models/QuizAttempt');
const CodingAttempt = require('../models/CodingAttempt');

/**
 * Compute dynamic card title based on student performance
 */
function computeCardTitle(student, quizAvg, codingCount) {
  if (student.streak >= 30) return 'The Legend';
  if (quizAvg >= 90) return 'The Scholar';
  if (codingCount >= 10) return 'The Architect';
  if (student.streak >= 14) return 'The Consistent';
  if (student.consistencyScore >= 100) return 'The Grinder';
  return 'The Builder';
}

/**
 * Compute card rarity based on cohort data and performance
 */
async function computeCardRarity(student) {
  const totalStudents = await Student.countDocuments({ role: 'student' });
  const top3Count = Math.max(3, Math.ceil(totalStudents * 0.03));
  const top20Count = Math.ceil(totalStudents * 0.2);

  // Legendary: top 3 all-time OR 30-day streak
  if (student.streak >= 30) return 'legendary';
  const topByScore = await Student.find({ role: 'student' })
    .sort({ consistencyScore: -1 })
    .limit(top3Count)
    .select('_id');
  const isTop3 = topByScore.some(s => s._id.toString() === student._id.toString());
  if (isTop3) return 'legendary';

  // Epic: top 20% of cohort
  const top20 = await Student.find({ role: 'student' })
    .sort({ consistencyScore: -1 })
    .limit(top20Count)
    .select('_id');
  const isTop20 = top20.some(s => s._id.toString() === student._id.toString());
  if (isTop20) return 'epic';

  // Rare: score 100-199 AND streak >= 7
  if (student.consistencyScore >= 100 && student.consistencyScore < 200 && student.streak >= 7) return 'rare';

  // Uncommon: score 50-99
  if (student.consistencyScore >= 50) return 'uncommon';

  // Common
  return 'common';
}

/**
 * Compute level from total XP
 */
function computeLevel(totalXpEarned) {
  return Math.floor(totalXpEarned / 100) + 1;
}

/**
 * Compute 4 stat values (0-100) for the card
 */
function computeStats(student, quizAvg, taskCompletionRate) {
  return {
    power: Math.min(100, Math.round((student.consistencyScore / 300) * 100)),
    speed: Math.min(100, Math.round(taskCompletionRate)),
    streak: Math.min(100, Math.round((student.streak / 30) * 100)),
    knowledge: Math.min(100, Math.round(quizAvg))
  };
}

/**
 * Main recalculate function — updates rarity, title, level on the student doc
 */
async function recalculateCard(studentId) {
  const student = await Student.findById(studentId);
  if (!student) return null;

  // Fetch quiz stats
  const quizAttempts = await QuizAttempt.find({ studentId });
  const quizAvg = quizAttempts.length
    ? quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / quizAttempts.length
    : 0;

  // Fetch coding stats
  const codingAttempts = await CodingAttempt.find({ studentId, status: 'accepted' });
  const codingCount = codingAttempts.length;

  // Recalculate
  const cardRarity = await computeCardRarity(student);
  const cardTitle = computeCardTitle(student, quizAvg, codingCount);
  const level = computeLevel(student.totalXpEarned);

  student.cardRarity = cardRarity;
  student.cardTitle = cardTitle;
  student.level = level;
  await student.save();

  return student;
}

/**
 * Award XP for a given action and recalculate card
 */
async function awardXP(studentId, action) {
  const xpMap = {
    checkin: 10,
    allTasks: 30,
    quizPass: 25,
    quizAce: 50,
    codingSolved: 75,
    streakBonus7: 100
  };

  const xpGain = xpMap[action] || 0;
  if (!xpGain) return;

  const student = await Student.findById(studentId);
  if (!student) return;

  student.xp = (student.xp || 0) + xpGain;
  student.totalXpEarned = (student.totalXpEarned || 0) + xpGain;
  student.level = computeLevel(student.totalXpEarned);
  await student.save();

  // Recalculate card after XP change
  await recalculateCard(studentId);
}

/**
 * Build full card data object for API response
 */
async function buildCardData(studentId) {
  const student = await Student.findById(studentId).lean();
  if (!student) return null;

  // Quiz stats
  const quizAttempts = await QuizAttempt.find({ studentId });
  const passedQuizzes = quizAttempts.filter(a => a.passed);
  const quizAvg = quizAttempts.length
    ? quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / quizAttempts.length
    : 0;

  // Coding stats
  const codingAttempts = await CodingAttempt.find({ studentId, status: 'accepted' });
  const codingCount = codingAttempts.length;

  // Total tasks completed (approximated from consistencyScore history — use score as proxy)
  const taskCompletionRate = Math.min(100, student.consistencyScore * 2);

  // Rank in cohort
  const allStudents = await Student.find({ role: 'student' })
    .sort({ consistencyScore: -1 })
    .select('_id')
    .lean();
  const rank = allStudents.findIndex(s => s._id.toString() === studentId.toString()) + 1;
  const totalStudents = allStudents.length;

  const stats = computeStats(student, quizAvg, taskCompletionRate);

  const level = student.level || 1;
  const totalXpEarned = student.totalXpEarned || 0;
  const xpToNextLevel = (level * 100) - totalXpEarned;

  // Simple badges based on achievements
  const badges = [];
  if (student.streak >= 7) badges.push({ id: 'streak7', label: '🔥 7-Day Streak', color: '#f97316' });
  if (student.streak >= 30) badges.push({ id: 'streak30', label: '⚡ Legend Streak', color: '#ffd700' });
  if (passedQuizzes.length >= 5) badges.push({ id: 'quiz5', label: '🧠 Quiz Pro', color: '#8b5cf6' });
  if (quizAvg >= 90) badges.push({ id: 'scholar', label: '🎓 Scholar', color: '#3b82f6' });
  if (codingCount >= 5) badges.push({ id: 'coder5', label: '💻 Coder', color: '#10b981' });
  if (codingCount >= 10) badges.push({ id: 'architect', label: '🏗️ Architect', color: '#06b6d4' });
  if (rank === 1) badges.push({ id: 'top1', label: '👑 #1 Rank', color: '#ffd700' });

  return {
    _id: student._id,
    name: student.name,
    email: student.email,
    techStack: student.techStack || 'General',
    skillLevel: student.skillLevel || 'beginner',
    cardRarity: student.cardRarity || 'common',
    cardTitle: student.cardTitle || 'The Builder',
    level,
    xp: student.xp || 0,
    totalXpEarned,
    xpToNextLevel: Math.max(0, xpToNextLevel),
    consistencyScore: student.consistencyScore || 0,
    weeklyScore: student.weeklyScore || 0,
    streak: student.streak || 0,
    weaknessTags: student.weaknessTags || [],
    badges,
    rank,
    totalStudents,
    stats,
    joinedDate: student.createdAt,
    lastActiveAt: student.lastActiveAt
  };
}

module.exports = { recalculateCard, awardXP, buildCardData, computeLevel };
