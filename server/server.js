// ============================================================
// server.js — AZURA Tourism Express API Server
// Database: azura_tourism (MySQL 8.0)
// Port: 5000 (configured in .env)
// ============================================================
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const db      = require('./db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '..')));

// ── Import Route Files ────────────────────────────────────
const destinationsRouter     = require('./routes/destinations');
const packagesRouter         = require('./routes/packages');
const experiencesRouter      = require('./routes/experiences');
const hotelsRouter           = require('./routes/hotels');
const bookingsRouter         = require('./routes/bookings');
const reviewsRouter          = require('./routes/reviews');
const { router: authRouter } = require('./routes/auth');

// ── Mount API Routes ──────────────────────────────────────
app.use('/api/destinations',  destinationsRouter);
app.use('/api/packages',      packagesRouter);
app.use('/api/experiences',   experiencesRouter);
app.use('/api/hotels',        hotelsRouter);
app.use('/api/bookings',      bookingsRouter);
app.use('/api/reviews',       reviewsRouter);
app.use('/api/auth',          authRouter);

// ── Platform Stats & Analytics (DBMS PBL Showcase) ────────
app.get('/api/stats', async (req, res) => {
  try {
    const [[{ dCount }]] = await db.query('SELECT COUNT(*) AS dCount FROM destinations');
    const [[{ pCount }]] = await db.query('SELECT COUNT(*) AS pCount FROM packages');
    const [[{ eCount }]] = await db.query('SELECT COUNT(*) AS eCount FROM experiences');
    const [[{ hCount }]] = await db.query('SELECT COUNT(*) AS hCount FROM hotels');
    const [[{ bCount }]] = await db.query('SELECT COUNT(*) AS bCount FROM bookings');
    const [[{ uCount }]] = await db.query('SELECT COUNT(*) AS uCount FROM users');
    const [[{ totalRev }]] = await db.query('SELECT COALESCE(SUM(total_amount), 0) AS totalRev FROM bookings WHERE booking_status = "Confirmed"');

    res.json({
      success: true,
      data: {
        destinations: dCount,
        packages:     pCount,
        experiences:  eCount,
        hotels:       hCount,
        bookings:     bCount,
        users:        uCount,
        totalRevenue: parseFloat(totalRev)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Audit Logs endpoint (Demonstrates Trigger Logging) ─────
app.get('/api/audit-logs', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM audit_logs ORDER BY audit_id DESC LIMIT 50');
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Health Check ──────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  let dbStatus = 'connected';
  try {
    await db.query('SELECT 1');
  } catch (e) {
    dbStatus = 'disconnected: ' + e.message;
  }

  res.json({
    success: true,
    message: 'AZURA Tourism API is running',
    database: process.env.DB_NAME || 'azura_tourism',
    dbStatus,
    timestamp: new Date().toISOString(),
    endpoints: {
      destinations: 'GET /api/destinations',
      packages:     'GET /api/packages',
      experiences:  'GET /api/experiences',
      hotels:       'GET /api/hotels',
      bookings:     'POST /api/bookings  |  GET /api/bookings/my',
      reviews:      'GET /api/reviews  |  POST /api/reviews',
      auth:         'POST /api/auth/signup  |  POST /api/auth/login  |  GET /api/auth/me',
      stats:        'GET /api/stats',
      auditLogs:    'GET /api/audit-logs'
    }
  });
});

// ── Clean URL routing for HTML pages ──────────────────────
const publicDir = path.join(__dirname, '..');
const cleanRoutes = {
  '/destinations':        'destinations.html',
  '/destination-details': 'destination-details.html',
  '/packages':            'packages.html',
  '/experiences':         'experiences.html',
  '/about':               'about.html',
  '/blog':                'blog.html',
  '/contact':             'contact.html',
  '/login':               'login.html',
  '/signup':              'signup.html',
  '/admin':               'admin.html',
  '/dashboard':           'dashboard.html',
};

Object.entries(cleanRoutes).forEach(([routePath, fileName]) => {
  app.get(routePath, (req, res) => {
    res.sendFile(path.join(publicDir, fileName));
  });
});

// ── Catch-all: serve index.html for non-API routes ─────────
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// ── 404 for unknown API routes ────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Start Server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🌍 ═══════════════════════════════════════════');
  console.log(`✈️   AZURA Tourism API Server`);
  console.log(`🚀  Running at: http://localhost:${PORT}`);
  console.log(`📡  API Base:   http://localhost:${PORT}/api`);
  console.log(`❤️   Health:    http://localhost:${PORT}/api/health`);
  console.log(`📊  Stats:     http://localhost:${PORT}/api/stats`);
  console.log('🌍 ═══════════════════════════════════════════');
  console.log('');
});
