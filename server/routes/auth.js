const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const auth = require('../middleware/auth');

// Regex for email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @route POST /api/auth/register
 * @desc Register a new student
 */
router.post('/register', async (req, res) => {
  const { name, email, password, techStack, skillLevel } = req.body;

  try {
    // Validations
    if (!name || !email || !password || !techStack || !skillLevel) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 8 || !/\d/.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters and contain at least one number' });
    }

    // Check for existing user
    let student = await Student.findOne({ email: email.toLowerCase() });
    if (student) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    student = new Student({
      name,
      email: email.toLowerCase(),
      passwordHash,
      techStack,
      skillLevel
    });

    await student.save();

    // Create JWT
    const payload = {
      id: student.id,
      email: student.email,
      role: 'student',
      name: student.name
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        const studentResponse = student.toObject();
        delete studentResponse.passwordHash;
        res.json({ token, user: studentResponse });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route POST /api/auth/login
 * @desc Login user (student or admin)
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    let user = await Student.findOne({ email: email.toLowerCase() });
    let role = 'student';

    if (!user) {
      user = await Admin.findOne({ email: email.toLowerCase() });
      role = 'admin';
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update lastActiveAt
    if (role === 'student') {
      user.lastActiveAt = Date.now();
      await user.save();
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: role,
      name: user.name
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        const userResponse = user.toObject();
        delete userResponse.passwordHash;
        res.json({ token, user: userResponse });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user
 */
router.get('/me', auth, async (req, res) => {
  try {
    let user;
    if (req.user.role === 'admin') {
      user = await Admin.findById(req.user.id).select('-passwordHash');
    } else {
      user = await Student.findById(req.user.id).select('-passwordHash');
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route POST /api/auth/seed-admin
 * @desc Seed default admin
 */
router.post('/seed-admin', async (req, res) => {
  try {
    const adminEmail = 'admin@sipp.com';
    const existing = await Admin.findOne({ email: adminEmail });
    if (existing) return res.status(200).json({ message: 'Admin already exists' });

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('Admin@2026', salt);

    const admin = new Admin({
      name: 'System Admin',
      email: adminEmail,
      passwordHash,
      role: 'admin'
    });

    await admin.save();
    res.json({ message: 'Admin seeded successfully' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
