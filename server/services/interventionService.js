const Student = require('../models/Student');
const DailyCheckIn = require('../models/DailyCheckIn');
const QuizAttempt = require('../models/QuizAttempt');
const Intervention = require('../models/Intervention');
const mongoose = require('mongoose');

const analyzeInterventions = async () => {
    try {
        const students = await Student.find({ role: 'student' });
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Get top 20% score threshold for HIGH_PERFORMER
        const allScores = students.map(s => s.weeklyScore).sort((a,b) => b-a);
        const top20Threshold = allScores[Math.floor(allScores.length * 0.2)] || 0;

        for (const student of students) {
            const flags = [];

            // 1. STREAK_BROKEN (warning)
            // If streak was high but lastActiveAt is > 24h ago
            // Wait, streak is a counter. If they missed a day, the streak might have been reset already by some other logic?
            // Assuming streak is current active streak.
            // If lastActiveAt is before yesterday and streak was >= 5...
            // Actually, if streak is 0 and they had a high streak... 
            // Let's assume the rule is: If streak >= 5 and they didn't check in today or yesterday (missed 1 day).
            if (student.streak >= 5 && student.lastActiveAt < yesterday) {
                flags.push({
                    type: "STREAK_BROKEN",
                    severity: "warning",
                    message: `${student.name} broke a ${student.streak}-day streak yesterday.`,
                    metadata: { streak: student.streak }
                });
            }

            // 2. CONSISTENT_DROPOUT (critical)
            // Missed 3+ consecutive days
            const daysInactive = Math.floor((now - student.lastActiveAt) / (24 * 60 * 60 * 1000));
            if (daysInactive >= 3) {
                flags.push({
                    type: "CONSISTENT_DROPOUT",
                    severity: "critical",
                    message: `${student.name} has been inactive for ${daysInactive} days.`,
                    metadata: { daysInactive }
                });
            }

            // 3. QUIZ_FAILING (warning)
            // Last 2 quiz attempts both scored below passingScore.
            const attempts = await QuizAttempt.find({ studentId: student._id }).sort({ attemptedAt: -1 }).limit(2);
            if (attempts.length === 2 && attempts[0].passed === false && attempts[1].passed === false) {
                flags.push({
                    type: "QUIZ_FAILING",
                    severity: "warning",
                    message: `${student.name} failed their last 2 assessments.`,
                    metadata: { scores: attempts.map(a => a.score) }
                });
            }

            // 4. SCORE_DECLINING (warning)
            // Weekly score this week is 30% lower than last week.
            if (student.lastWeeklyScore > 0) {
                const dropPercent = ((student.lastWeeklyScore - student.weeklyScore) / student.lastWeeklyScore) * 100;
                if (dropPercent >= 30) {
                    flags.push({
                        type: "SCORE_DECLINING",
                        severity: "warning",
                        message: `${student.name}'s score dropped ${Math.round(dropPercent)}% this week.`,
                        metadata: { dropPercent, lastScore: student.lastWeeklyScore, currentScore: student.weeklyScore }
                    });
                }
            }

            // 5. NEVER_STARTED (critical)
            // Registered more than 3 days ago, zero check-ins.
            if (student.createdAt < threeDaysAgo && student.consistencyScore === 0) {
                const daysRegistered = Math.floor((now - student.createdAt) / (24 * 60 * 60 * 1000));
                flags.push({
                    type: "NEVER_STARTED",
                    severity: "critical",
                    message: `${student.name} registered ${daysRegistered} days ago but never checked in.`,
                    metadata: { daysRegistered }
                });
            }

            // 6. HIGH_PERFORMER (positive)
            // Streak >= 7 days AND last weekly score in top 20% of cohort.
            if (student.streak >= 7 && student.weeklyScore >= top20Threshold && top20Threshold > 0) {
                flags.push({
                    type: "HIGH_PERFORMER",
                    severity: "positive",
                    message: `${student.name} is on a ${student.streak}-day streak. Top performer!`,
                    metadata: { streak: student.streak, score: student.weeklyScore }
                });
            }

            // Save new flags if they don't already exist and weren't dismissed SAME DAY
            for (const f of flags) {
                // Check if existing active flag of same type for this student
                const active = await Intervention.findOne({ 
                    studentId: student._id, 
                    type: f.type,
                    dismissed: false
                });

                if (!active) {
                    // Check if dismissed TODAY
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);

                    const dismissedToday = await Intervention.findOne({
                        studentId: student._id,
                        type: f.type,
                        dismissed: true,
                        dismissedAt: { $gte: todayStart }
                    });

                    if (!dismissedToday) {
                        await Intervention.create({
                            ...f,
                            studentId: student._id,
                            studentName: student.name,
                            detectedAt: now
                        });
                    }
                }
            }
        }

        // Return current status summary
        return await getInterventionSummary();
    } catch (err) {
        console.error("Intervention Analysis Error:", err);
        throw err;
    }
};

const getInterventionSummary = async () => {
    const activeFlags = await Intervention.find({ dismissed: false });
    const students = await Student.find({ role: 'student' });
    
    const summary = {
        critical: activeFlags.filter(f => f.severity === 'critical'),
        warning: activeFlags.filter(f => f.severity === 'warning'),
        positive: activeFlags.filter(f => f.severity === 'positive'),
        stats: {
            totalStudents: students.length,
            criticalCount: activeFlags.filter(f => f.severity === 'critical').length,
            warningCount: activeFlags.filter(f => f.severity === 'warning').length,
            positiveCount: activeFlags.filter(f => f.severity === 'positive').length,
            avgConsistencyScore: students.length > 0 ? (students.reduce((acc, s) => acc + s.consistencyScore, 0) / students.length) : 0
        }
    };
    return summary;
};

module.exports = { analyzeInterventions, getInterventionSummary };
