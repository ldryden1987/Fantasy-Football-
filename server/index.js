const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const leagueRoutes = require('./routes/leagues');
const playerRoutes = require('./routes/players');
const draftRoutes = require('./routes/draft');
const matchupRoutes = require('./routes/matchups');
const tradeRoutes = require('./routes/trades');
const waiverRoutes = require('./routes/waivers');
const newsRoutes = require('./routes/news');
const aiRoutes = require('./routes/ai');
const commissionerRoutes = require('./routes/commissioner');
const playoffRoutes = require('./routes/playoffs');
const notificationRoutes = require('./routes/notifications');
const avatarRoutes = require('./routes/avatar');




const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173',
            'fantasy-football-production-f626.up.railway.app'],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/draft', draftRoutes);
app.use('/api/matchups', matchupRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/waivers', waiverRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/commissioner', commissionerRoutes);
app.use('/api/playoffs', playoffRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/uploads', express.static('uploads'));




// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: '✅ Server is running' })
);

// Socket.io
const draftSocket = require('./socket/draftSocket');
draftSocket(io);

// MongoDB + server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(8080, '0.0.0.0', () =>
      console.log('✅ Server running on port 8080')
    );
  })
  .catch((err) => console.error('❌ MongoDB error:', err));
