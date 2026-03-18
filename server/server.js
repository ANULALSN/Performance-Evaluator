require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.CLIENT_URL || "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach Socket.io to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/quiz'));
app.use('/api/coding-problems', require('./routes/codingProblems'));
app.use('/api/export', require('./routes/export'));
app.use('/api/admin/interventions', require('./routes/interventions'));

const cron = require('node-cron');
const { analyzeInterventions } = require('./services/interventionService');

// Schedule daily midnight analysis
cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running daily intervention analysis...');
    try {
        const result = await analyzeInterventions();
        io.to("admin_room").emit("daily_report", result.stats);
        console.log('✅ Daily report generated & broadcasted.');
    } catch (err) {
        console.error('❌ Cron Analysis Error:', err);
    }
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Socket.io Logic
io.on("connection", (socket) => {
  console.log('🔌 New Client Connected:', socket.id);

  socket.on("join_room", (userId) => {
    socket.join(userId.toString());
    console.log(`👤 User ${userId} joined room`);
  });

  socket.on("join_admin", () => {
    socket.join("admin_room");
    console.log(`🛡️ Admin joined admin room`);
  });

  socket.on("disconnect", () => {
    console.log('🔌 Client Disconnected');
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 SIPP Server running on port ${PORT}`);
});
