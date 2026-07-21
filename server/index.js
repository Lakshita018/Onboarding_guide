/**
 * server/index.js
 *
 * IBM OnboardAI — Express + Socket.IO application entrypoint.
 */

require('dotenv').config();

const express      = require('express');
const http         = require('http');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const path         = require('path');
const { Server }   = require('socket.io');

const { initDB }         = require('./config/database');
const { initSocket }     = require('./socket/socketHandler');
const errorHandler       = require('./middleware/errorHandler');

// Routes
const authRoutes      = require('./routes/auth');
const employeeRoutes  = require('./routes/employee');
const adminRoutes     = require('./routes/admin');
const documentRoutes  = require('./routes/documents');
const checklistRoutes = require('./routes/checklist');
const taskRoutes      = require('./routes/tasks');
const accessRoutes    = require('./routes/access');
const chatRoutes      = require('./routes/chat');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin:  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// ─── Security & Parsing Middleware ────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving uploaded files
}));

app.use(cors({
  origin:      process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting (auth routes only) ────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      20,
  message:  { success: false, data: null, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ─── Static File Serving (uploaded documents) ────────────────────────────────
app.use(
  '/uploads',
  express.static(path.join(__dirname, process.env.UPLOAD_DIR || './uploads'))
);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/employee',  employeeRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/tasks',     taskRoutes);
app.use('/api/access',    accessRoutes);
app.use('/api/chat',      chatRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', env: process.env.NODE_ENV }, message: 'IBM OnboardAI API is running.' });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '5000', 10);

async function start() {
  try {
    await initDB();
    initSocket(io);

    server.listen(PORT, () => {
      console.log(`\n🚀 IBM OnboardAI API running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health:      http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('[STARTUP] Fatal error:', err);
    process.exit(1);
  }
}

start();
