const express = require('express');
const router = express.Router();
const CodingProblem = require('../models/CodingProblem');
const CodingAttempt = require('../models/CodingAttempt');
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const { adminGuard } = require('../middleware/roleGuard');
const { executeCode } = require('../services/codeExecutionService');

// =======================================================================
// ADMIN ROUTES
// =======================================================================

// Create a coding problem
router.post('/admin/coding-problems', auth, adminGuard, async (req, res) => {
    try {
        const problem = new CodingProblem(req.body);
        await problem.save();
        res.status(201).json(problem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all coding problems (admin)
router.get('/admin/coding-problems', auth, adminGuard, async (req, res) => {
    try {
        const problems = await CodingProblem.find().sort({ createdAt: -1 });
        res.json(problems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single coding problem (admin)
router.get('/admin/coding-problems/:id', auth, adminGuard, async (req, res) => {
    try {
        const problem = await CodingProblem.findById(req.params.id);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });
        res.json(problem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update coding problem
router.put('/admin/coding-problems/:id', auth, adminGuard, async (req, res) => {
    try {
        const problem = await CodingProblem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!problem) return res.status(404).json({ message: 'Problem not found' });
        res.json(problem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete coding problem
router.delete('/admin/coding-problems/:id', auth, adminGuard, async (req, res) => {
    try {
        const problem = await CodingProblem.findByIdAndDelete(req.params.id);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });
        res.json({ message: 'Problem deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Toggle active status
router.patch('/admin/coding-problems/:id/toggle', auth, adminGuard, async (req, res) => {
    try {
        const problem = await CodingProblem.findById(req.params.id);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });
        problem.isActive = !problem.isActive;
        await problem.save();
        res.json(problem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Seed demo problems
router.post('/admin/coding-problems/seed', auth, adminGuard, async (req, res) => {
    try {
        const demoProblems = [
            {
                title: "Sum of Two Numbers",
                description: "Write a function `solution(arr)` that takes an array of two numbers and returns their sum.",
                difficulty: "easy",
                techStack: "General",
                starterCode: {
                    javascript: "function solution(arr) {\n  // your code here\n}",
                    python: "def solution(arr):\n    # your code here\n    pass"
                },
                testCases: [
                    { input: "[1, 2]", expectedOutput: "3", isHidden: false },
                    { input: "[10, 20]", expectedOutput: "30", isHidden: false },
                    { input: "[-1, 1]", expectedOutput: "0", isHidden: true, explanation: "Handling negative numbers" },
                    { input: "[0, 0]", expectedOutput: "0", isHidden: true, explanation: "Zero case" }
                ],
                constraints: ["Input is always an array of exactly 2 numbers"],
                hints: ["Use array indexing to get the numbers", "Simply return a + b"],
                pointsReward: 10,
                isActive: true
            },
            {
                title: "FizzBuzz Single",
                description: "Write a function `solution(n)` that returns 'Fizz' if `n` is divisible by 3, 'Buzz' if by 5, 'FizzBuzz' if both, else the number as a string.",
                difficulty: "easy",
                techStack: "General",
                starterCode: {
                    javascript: "function solution(n) {\n  // your code here\n}",
                    python: "def solution(n):\n    # your code here\n    pass"
                },
                testCases: [
                    { input: "3", expectedOutput: "Fizz", isHidden: false },
                    { input: "5", expectedOutput: "Buzz", isHidden: false },
                    { input: "15", expectedOutput: "FizzBuzz", isHidden: false },
                    { input: "7", expectedOutput: "7", isHidden: true, explanation: "Regular number case" },
                    { input: "1", expectedOutput: "1", isHidden: true, explanation: "Edge case: 1" }
                ],
                constraints: ["Input is a positive integer"],
                hints: ["Use the modulo operator %", "Check for 15 (or both 3 and 5) first"],
                pointsReward: 15,
                isActive: true
            }
        ];

        await CodingProblem.insertMany(demoProblems);
        res.json({ message: 'Demo problems seeded' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =======================================================================
// STUDENT ROUTES
// =======================================================================

// List active problems
router.get('/', auth, async (req, res) => {
    try {
        const problems = await CodingProblem.find({ isActive: true }).select('-testCases.expectedOutput');
        
        // Enhance with attempt info
        const attempts = await CodingAttempt.find({ studentId: req.user.id });
        
        const enhancedProblems = problems.map(p => {
            const attempt = attempts.find(a => a.problemId.toString() === p._id.toString());
            const pObj = p.toObject();
            
            // Remove hidden test case details except input
            pObj.testCases = pObj.testCases.map(tc => {
                if (tc.isHidden) {
                    return { _id: tc._id, input: tc.input, isHidden: true };
                }
                return tc;
            });

            return {
                ...pObj,
                hasAttempted: !!attempt,
                myScore: attempt ? attempt.score : 0,
                status: attempt ? attempt.status : null
            };
        });

        res.json(enhancedProblems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single problem
router.get('/:id', auth, async (req, res) => {
    try {
        const problem = await CodingProblem.findById(req.params.id);
        if (!problem || !problem.isActive) return res.status(404).json({ message: 'Problem not found' });

        const pObj = problem.toObject();
        // Students should not see expectedOutput for hidden test cases
        pObj.testCases = pObj.testCases.map(tc => {
            if (tc.isHidden) {
                return { _id: tc._id, input: tc.input, isHidden: true, explanation: tc.explanation };
            }
            return tc;
        });

        res.json(pObj);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Run code (temporary, visible test cases only)
router.post('/:id/run', auth, async (req, res) => {
    const { code, language } = req.body;
    try {
        const problem = await CodingProblem.findById(req.params.id);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        // Only visible test cases
        const visibleTestCases = problem.testCases.filter(tc => !tc.isHidden);
        
        const result = await executeCode(code, language, visibleTestCases);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit code (persistent, all test cases)
router.post('/:id/submit', auth, async (req, res) => {
    const { code, language, timeTaken, hintsUsed } = req.body;
    try {
        // Check for existing attempt
        const existing = await CodingAttempt.findOne({ studentId: req.user.id, problemId: req.params.id });
        if (existing) return res.status(409).json({ message: 'You have already submitted this challenge' });

        const problem = await CodingProblem.findById(req.params.id);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        const { results, hasErrors } = await executeCode(code, language, problem.testCases);
        
        // Calculate scoring
        const total = problem.testCases.length;
        const passedCount = results.filter(r => r.passed).length;
        const passedPercentage = (passedCount / total) * 100;
        
        let status = 'failed';
        let pointsAwarded = 0;

        if (passedPercentage === 100) {
            status = 'accepted';
            pointsAwarded = problem.pointsReward;
        } else if (passedPercentage >= 50) {
            status = 'partial';
            pointsAwarded = Math.round(problem.pointsReward / 2);
        } else if (passedCount > 0) {
            status = 'failed';
            pointsAwarded = 1; // Participation point
        } else if (hasErrors) {
            status = 'error';
            pointsAwarded = 0;
        }

        const attempt = new CodingAttempt({
            studentId: req.user.id,
            problemId: req.params.id,
            language,
            code,
            testResults: results,
            passedCount,
            totalVisible: problem.testCases.filter(tc => !tc.isHidden).length,
            totalHidden: problem.testCases.filter(tc => tc.isHidden).length,
            score: Math.round(passedPercentage),
            status,
            pointsAwarded,
            timeTaken,
            hintsUsed: hintsUsed || 0
        });

        await attempt.save();

        // Update student score
        if (pointsAwarded > 0) {
            await Student.findByIdAndUpdate(req.user.id, {
                $inc: { consistencyScore: pointsAwarded }
            });
        }

        res.json(attempt);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Get my attempts
router.get('/attempts/me', auth, async (req, res) => {
    try {
        const attempts = await CodingAttempt.find({ studentId: req.user.id }).populate('problemId', 'title difficulty');
        res.json(attempts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
