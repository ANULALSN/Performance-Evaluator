require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const seedAdmin = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const adminEmail = 'admin@sipp.com';
    const existing = await Admin.findOne({ email: adminEmail });
    if (existing) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('Admin@2026', salt);

    const admin = new Admin({
      name: 'System Admin',
      email: adminEmail,
      passwordHash,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin seeded successfully:');
    console.log('Email: admin@sipp.com');
    console.log('Password: Admin@2026');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err.message);
    process.exit(1);
  }
};

seedAdmin();
