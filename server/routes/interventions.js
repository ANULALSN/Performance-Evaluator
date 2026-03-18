const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { analyzeInterventions, getInterventionSummary } = require('../services/interventionService');
const Intervention = require('../models/Intervention');
const Student = require('../models/Student');

// GET /api/admin/interventions
router.get('/', auth, roleGuard('admin'), async (req, res) => {
    try {
        const summary = await analyzeInterventions();
        res.json(summary);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/admin/interventions/:studentId/dismiss
router.post('/:studentId/dismiss', auth, roleGuard('admin'), async (req, res) => {
    try {
        await Intervention.updateMany(
            { studentId: req.params.studentId, dismissed: false },
            { dismissed: true, dismissedAt: new Date() }
        );
        res.json({ message: 'Flags dismissed for student' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/admin/interventions/:studentId/notify
router.post('/:studentId/notify', auth, roleGuard('admin'), async (req, res) => {
    const { message } = req.body;
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        student.notifications.push({
            message,
            fromAdmin: true
        });
        await student.save();

        // Emit via socket if possible
        if (req.io) {
            req.io.to(req.params.studentId).emit("mentor_message", { 
                message,
                from: "System Admin",
                at: new Date()
            });
        }

        res.json({ message: 'Notification sent' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
