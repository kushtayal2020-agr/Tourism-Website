// ============================================================
// routes/destinations.js
// Table: destinations (destination_id, name, country, rating, price, description)
// ============================================================
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authMiddleware } = require('./auth');

// GET /api/destinations — list all destinations
// Query params: ?country=Greece ?min_rating=4.5 ?max_price=2000 ?search=Bali ?sort=price-asc
router.get('/', async (req, res) => {
  try {
    const { country, min_rating, max_price, search, sort } = req.query;
    let sql    = 'SELECT * FROM destinations WHERE 1=1';
    const vals = [];

    if (country && country !== 'all') {
      sql += ' AND country = ?';
      vals.push(country);
    }
    if (min_rating) {
      sql += ' AND rating >= ?';
      vals.push(parseFloat(min_rating));
    }
    if (max_price) {
      sql += ' AND price <= ?';
      vals.push(parseFloat(max_price));
    }
    if (search) {
      sql += ' AND (name LIKE ? OR country LIKE ? OR description LIKE ?)';
      const q = `%${search}%`;
      vals.push(q, q, q);
    }

    if (sort === 'price-asc') {
      sql += ' ORDER BY price ASC';
    } else if (sort === 'price-desc') {
      sql += ' ORDER BY price DESC';
    } else if (sort === 'rating-asc') {
      sql += ' ORDER BY rating ASC';
    } else {
      sql += ' ORDER BY rating DESC, price ASC';
    }

    const [rows] = await db.query(sql, vals);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('GET /destinations error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/destinations/countries — list distinct countries
router.get('/countries', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT country FROM destinations ORDER BY country ASC');
    res.json({ success: true, data: rows.map(r => r.country) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/destinations/:id/packages — packages for destination
router.get('/:id/packages', async (req, res) => {
  try {
    const [results] = await db.query('CALL GetPackagesByDestination(?)', [req.params.id]);
    const rows = results[0] || [];
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('CALL GetPackagesByDestination error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/destinations/:id/experiences — experiences for destination
router.get('/:id/experiences', async (req, res) => {
  try {
    const [results] = await db.query('CALL GetExperiencesByDestination(?)', [req.params.id]);
    const rows = results[0] || [];
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('CALL GetExperiencesByDestination error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/destinations/:id — single destination + hotels, reviews, packages, experiences
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Check if queried by numeric ID or by slug name
    let dest;
    if (!isNaN(id)) {
      const [[d]] = await db.query('SELECT * FROM destinations WHERE destination_id = ?', [parseInt(id, 10)]);
      dest = d;
    } else {
      const [[d]] = await db.query('SELECT * FROM destinations WHERE LOWER(name) = ?', [id.toLowerCase()]);
      dest = d;
    }

    if (!dest) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const actualId = dest.destination_id;
    const [hotels]   = await db.query('SELECT * FROM hotels WHERE destination_id = ?', [actualId]);
    const [packages] = await db.query('SELECT * FROM packages WHERE destination_id = ?', [actualId]);
    const [reviews]  = await db.query(
      `SELECT r.*, u.name AS reviewer_name
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.destination_id = ?
       ORDER BY r.review_date DESC`, [actualId]);
    const [experiences] = await db.query(
      'SELECT * FROM experiences WHERE destination_id = ? ORDER BY rating DESC', [actualId]);

    res.json({
      success: true,
      data: { ...dest, hotels, packages, reviews, experiences }
    });
  } catch (err) {
    console.error('GET /destinations/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/destinations — create destination (Admin / Protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, country, rating, price, description } = req.body;

    if (!name || !country) {
      return res.status(400).json({ success: false, message: 'name and country are required' });
    }

    const [result] = await db.query(
      'INSERT INTO destinations (name, country, rating, price, description) VALUES (?, ?, ?, ?, ?)',
      [name, country, rating || 4.5, price || 1000, description || '']
    );

    res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      data: { destination_id: result.insertId, name, country, rating, price, description }
    });
  } catch (err) {
    console.error('POST /destinations error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/destinations/:id — update destination (Admin / Protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, country, rating, price, description } = req.body;
    const id = req.params.id;

    const [[existing]] = await db.query('SELECT * FROM destinations WHERE destination_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    await db.query(
      `UPDATE destinations
       SET name = COALESCE(?, name),
           country = COALESCE(?, country),
           rating = COALESCE(?, rating),
           price = COALESCE(?, price),
           description = COALESCE(?, description)
       WHERE destination_id = ?`,
      [name, country, rating, price, description, id]
    );

    res.json({ success: true, message: 'Destination updated successfully' });
  } catch (err) {
    console.error('PUT /destinations/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/destinations/:id — delete destination (Admin / Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM destinations WHERE destination_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }
    res.json({ success: true, message: 'Destination deleted successfully' });
  } catch (err) {
    console.error('DELETE /destinations/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
