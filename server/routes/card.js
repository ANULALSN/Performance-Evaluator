const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { buildCardData, recalculateCard } = require('../services/cardService');
const Student = require('../models/Student');

/**
 * @route GET /api/card/me
 * @desc Get current student's full card data (authenticated)
 */
router.get('/me', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Students only' });
    }
    const cardData = await buildCardData(req.user.id);
    if (!cardData) return res.status(404).json({ error: 'Student not found' });
    res.json(cardData);
  } catch (err) {
    console.error('Card /me error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/card/:studentId
 * @desc Get public card data — no auth needed (for sharing links)
 */
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    // Validate it looks like a mongo ID
    if (!/^[a-f\d]{24}$/i.test(studentId)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    const cardData = await buildCardData(studentId);
    if (!cardData) return res.status(404).json({ error: 'Student not found' });

    // Remove sensitive fields for public view
    delete cardData.email;
    delete cardData.weaknessTags;

    res.json(cardData);
  } catch (err) {
    console.error('Card public error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/card/recalculate
 * @desc Recalculate rarity, title, level for current student
 */
router.post('/recalculate', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Students only' });
    }
    const updated = await recalculateCard(req.user.id);
    res.json({ cardRarity: updated.cardRarity, cardTitle: updated.cardTitle, level: updated.level });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
