// ============================================================
// routes/packages.js
// Table: packages (package_id, destination_id, package_name, duration, price, travel_style, rating)
// ============================================================
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authMiddleware } = require('./auth');

// GET /api/packages — list all packages with destination info
// Supports: ?destination_id=1 ?travel_style=honeymoon ?max_price=3000 ?duration=short/medium/long ?search=tour
router.get('/', async (req, res) => {
  try {
    const { destination_id, travel_style, max_price, duration, search } = req.query;

    let sql = `
      SELECT p.*, d.name AS destination_name, d.country
      FROM packages p
      JOIN destinations d ON p.destination_id = d.destination_id
      WHERE 1=1
    `;
    const vals = [];

    if (destination_id) { sql += ' AND p.destination_id = ?';  vals.push(parseInt(destination_id, 10)); }
    if (travel_style)   { sql += ' AND LOWER(p.travel_style) = LOWER(?)';  vals.push(travel_style); }
    if (max_price)      { sql += ' AND p.price <= ?';          vals.push(parseFloat(max_price)); }
    if (search)         { sql += ' AND (p.package_name LIKE ? OR d.name LIKE ?)'; vals.push(`%${search}%`, `%${search}%`); }

    if (duration) {
      if (duration === 'short')  { sql += ' AND p.duration BETWEEN 3 AND 5'; }
      if (duration === 'medium') { sql += ' AND p.duration BETWEEN 6 AND 8'; }
      if (duration === 'long')   { sql += ' AND p.duration >= 9'; }
    }

    sql += ' ORDER BY p.rating DESC, p.price ASC';
    const [rows] = await db.query(sql, vals);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('GET /packages error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/packages/styles — list distinct travel styles
router.get('/styles', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT travel_style FROM packages WHERE travel_style IS NOT NULL ORDER BY travel_style ASC');
    res.json({ success: true, data: rows.map(r => r.travel_style) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/packages/:id — single package details + included experiences
router.get('/:id', async (req, res) => {
  try {
    const [[pkg]] = await db.query(
      `SELECT p.*, d.name AS destination_name, d.country, d.description AS destination_description
       FROM packages p
       JOIN destinations d ON p.destination_id = d.destination_id
       WHERE p.package_id = ?`,
      [req.params.id]
    );
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

    // Get included experiences
    const [experiences] = await db.query(
      `SELECT e.* FROM experiences e
       JOIN package_experiences pe ON e.experience_id = pe.experience_id
       WHERE pe.package_id = ?`, [req.params.id]);

    res.json({ success: true, data: { ...pkg, experiences } });
  } catch (err) {
    console.error('GET /packages/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/packages — create package (Admin / Protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { destination_id, package_name, duration, price, travel_style, rating, experience_ids } = req.body;

    if (!destination_id || !package_name || !price || !duration) {
      return res.status(400).json({
        success: false,
        message: 'destination_id, package_name, duration and price are required'
      });
    }

    const [result] = await db.query(
      'INSERT INTO packages (destination_id, package_name, duration, price, travel_style, rating) VALUES (?, ?, ?, ?, ?, ?)',
      [destination_id, package_name, duration, price, travel_style || 'Luxury', rating || 4.8]
    );

    const package_id = result.insertId;

    // Link experiences if provided
    if (Array.isArray(experience_ids) && experience_ids.length > 0) {
      const expValues = experience_ids.map(eid => [package_id, eid]);
      for (const [pid, eid] of expValues) {
        await db.query('INSERT IGNORE INTO package_experiences (package_id, experience_id) VALUES (?, ?)', [pid, eid]);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: { package_id, destination_id, package_name, duration, price, travel_style, rating }
    });
  } catch (err) {
    console.error('POST /packages error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/packages/:id — update package (Admin / Protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { package_name, duration, price, travel_style, rating } = req.body;
    const id = req.params.id;

    const [[existing]] = await db.query('SELECT * FROM packages WHERE package_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    await db.query(
      `UPDATE packages
       SET package_name = COALESCE(?, package_name),
           duration = COALESCE(?, duration),
           price = COALESCE(?, price),
           travel_style = COALESCE(?, travel_style),
           rating = COALESCE(?, rating)
       WHERE package_id = ?`,
      [package_name, duration, price, travel_style, rating, id]
    );

    res.json({ success: true, message: 'Package updated successfully' });
  } catch (err) {
    console.error('PUT /packages/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/packages/:id — delete package (Admin / Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM package_experiences WHERE package_id = ?', [req.params.id]);
    const [result] = await db.query('DELETE FROM packages WHERE package_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.json({ success: true, message: 'Package deleted successfully' });
  } catch (err) {
    console.error('DELETE /packages/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
