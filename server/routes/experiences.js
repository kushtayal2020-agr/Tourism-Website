// ============================================================
// routes/experiences.js
// Table: experiences (experience_id, destination_id, title, category, duration, price, rating)
// ============================================================
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authMiddleware } = require('./auth');

// GET /api/experiences — list all experiences with destination info
// Query params: ?category=Water ?destination_id=1 ?max_price=500 ?search=sunset
router.get('/', async (req, res) => {
  try {
    const { category, destination_id, max_price, search } = req.query;

    let sql = `
      SELECT e.*, d.name AS destination_name, d.country
      FROM experiences e
      JOIN destinations d ON e.destination_id = d.destination_id
      WHERE 1=1
    `;
    const vals = [];

    if (category)       { sql += ' AND e.category = ?';        vals.push(category); }
    if (destination_id) { sql += ' AND e.destination_id = ?';  vals.push(parseInt(destination_id, 10)); }
    if (max_price)      { sql += ' AND e.price <= ?';          vals.push(parseFloat(max_price)); }
    if (search)         { sql += ' AND (e.title LIKE ? OR e.category LIKE ?)'; vals.push(`%${search}%`, `%${search}%`); }

    sql += ' ORDER BY e.rating DESC, e.price ASC';
    const [rows] = await db.query(sql, vals);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('GET /experiences error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/experiences/categories — list distinct experience categories
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT category FROM experiences WHERE category IS NOT NULL ORDER BY category ASC');
    res.json({ success: true, data: rows.map(r => r.category) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/experiences/destination/:id — call stored procedure GetExperiencesByDestination
router.get('/destination/:id', async (req, res) => {
  try {
    const [results] = await db.query('CALL GetExperiencesByDestination(?)', [req.params.id]);
    const rows = results[0] || [];
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('CALL GetExperiencesByDestination error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/experiences/:id — get single experience details
router.get('/:id', async (req, res) => {
  try {
    const [[exp]] = await db.query(
      `SELECT e.*, d.name AS destination_name, d.country, d.description AS destination_description
       FROM experiences e
       JOIN destinations d ON e.destination_id = d.destination_id
       WHERE e.experience_id = ?`,
      [req.params.id]
    );

    if (!exp) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    res.json({ success: true, data: exp });
  } catch (err) {
    console.error('GET /experiences/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/experiences — create a new experience (Admin / Protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { destination_id, title, category, duration, price, rating } = req.body;

    if (!destination_id || !title || !price) {
      return res.status(400).json({
        success: false,
        message: 'destination_id, title and price are required'
      });
    }

    const [result] = await db.query(
      'INSERT INTO experiences (destination_id, title, category, duration, price, rating) VALUES (?, ?, ?, ?, ?, ?)',
      [destination_id, title, category || 'Adventure', duration || 1, price, rating || 5.0]
    );

    res.status(201).json({
      success: true,
      message: 'Experience created successfully',
      data: { experience_id: result.insertId, destination_id, title, category, duration, price, rating }
    });
  } catch (err) {
    console.error('POST /experiences error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/experiences/:id — update an experience (Admin / Protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, category, duration, price, rating } = req.body;
    const id = req.params.id;

    const [[existing]] = await db.query('SELECT * FROM experiences WHERE experience_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    await db.query(
      `UPDATE experiences 
       SET title = COALESCE(?, title),
           category = COALESCE(?, category),
           duration = COALESCE(?, duration),
           price = COALESCE(?, price),
           rating = COALESCE(?, rating)
       WHERE experience_id = ?`,
      [title, category, duration, price, rating, id]
    );

    res.json({ success: true, message: 'Experience updated successfully' });
  } catch (err) {
    console.error('PUT /experiences/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/experiences/:id — delete experience (Admin / Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM experiences WHERE experience_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }
    res.json({ success: true, message: 'Experience deleted successfully' });
  } catch (err) {
    console.error('DELETE /experiences/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
