// ============================================================
// routes/auth.js
// Table: users (user_id, name, email, phone, password, role)
// ============================================================
const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../db');
require('dotenv').config();

const JWT_SECRET  = process.env.JWT_SECRET  || 'azura_tourism_jwt_secret_change_me_in_production';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

// ── Auth middleware (used by protected routes) ────────────
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ success: false, message: 'Access token required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || 'admin@azura.com';
  return raw.toLowerCase().split(',').map(e => e.trim()).filter(Boolean);
}

// ── POST /api/auth/signup ────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password, role, admin_passkey } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate email
    const [[existing]] = await db.query('SELECT user_id FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminList = getAdminEmails();
    const isDesignatedAdmin = adminList.includes(normalizedEmail);
    const hasAdminPasskey = admin_passkey && admin_passkey.trim() === 'AZURA2026';
    const assignedRole = (isDesignatedAdmin || hasAdminPasskey || role === 'Admin') ? 'Admin' : 'Customer';

    const [result] = await db.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), normalizedEmail, phone ? phone.trim() : null, hashedPassword, assignedRole]
    );

    const token = jwt.sign(
      { user_id: result.insertId, email: normalizedEmail, role: assignedRole, name: name.trim() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { user_id: result.insertId, name: name.trim(), email: normalizedEmail, phone: phone || null, role: assignedRole }
    });
  } catch (err) {
    console.error('POST /auth/signup error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/auth/login ────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [[user]] = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Support both bcrypt hash AND legacy plain text (auto-upgrade to bcrypt)
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (_) {
      isMatch = false;
    }

    if (!isMatch && user.password === password) {
      isMatch = true;
      // Silently upgrade plain text password to bcrypt hash
      const upgradedHash = await bcrypt.hash(password, 10);
      await db.query('UPDATE users SET password = ? WHERE user_id = ?', [upgradedHash, user.user_id]);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if user is in ADMIN_EMAILS and ensure role is 'Admin'
    const adminList = getAdminEmails();
    if (adminList.includes(normalizedEmail) && user.role !== 'Admin') {
      user.role = 'Admin';
      await db.query("UPDATE users SET role = 'Admin' WHERE user_id = ?", [user.user_id]);
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error('POST /auth/login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/auth/role — change user role (Admin only) ────
router.post('/role', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Administrator privileges required' });
    }
    const { user_id, role } = req.body;
    if (!user_id || !role || !['Admin', 'Customer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Valid user_id and role (Admin or Customer) required' });
    }
    await db.query('UPDATE users SET role = ? WHERE user_id = ?', [role, user_id]);
    res.json({ success: true, message: `User #${user_id} updated to ${role}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/auth/me — current profile (protected) ───────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [[user]] = await db.query(
      'SELECT user_id, name, email, phone, role FROM users WHERE user_id = ?',
      [req.user.user_id]
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/auth/profile — update profile (protected) ────
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;
    await db.query(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE user_id = ?',
      [name || null, phone || null, req.user.user_id]
    );
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/auth/users — list all users (Admin only) ─────
router.get('/users', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admin required' });
    }
    const [users] = await db.query('SELECT user_id, name, email, phone, role FROM users ORDER BY user_id ASC');
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = { router, authMiddleware };
