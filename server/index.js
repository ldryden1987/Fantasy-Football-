const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const leagueRoutes = require('./routes/leagues');
const playerRoutes = require('./routes/players');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/players', playerRoutes);


// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: '✅ Server is running' })
);

// MongoDB + server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(8080, '0.0.0.0', () =>
      console.log(`✅ Server running on port 8080`)
    );
  })
  .catch((err) => console.error('❌ MongoDB error:', err));
