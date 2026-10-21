// ============================================================
// routes/hotels.js
// Table: hotels (hotel_id, destination_id, hotel_name, stars, price, amenities)
// Table: rooms  (hotel_id, room_number, room_type, price_per_night, availability)
// ============================================================
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authMiddleware } = require('./auth');

// GET /api/hotels — list all hotels (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { destination_id, min_stars, max_price, search } = req.query;

    let sql = `
      SELECT h.*, d.name AS destination_name, d.country
      FROM hotels h
      JOIN destinations d ON h.destination_id = d.destination_id
      WHERE 1=1
    `;
    const vals = [];

    if (destination_id) { sql += ' AND h.destination_id = ?'; vals.push(parseInt(destination_id, 10)); }
    if (min_stars)      { sql += ' AND h.stars >= ?';         vals.push(parseFloat(min_stars)); }
    if (max_price)      { sql += ' AND h.price <= ?';         vals.push(parseFloat(max_price)); }
    if (search)         { sql += ' AND (h.hotel_name LIKE ? OR d.name LIKE ?)'; vals.push(`%${search}%`, `%${search}%`); }

    sql += ' ORDER BY h.stars DESC, h.price ASC';
    const [rows] = await db.query(sql, vals);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('GET /hotels error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hotels/:id — single hotel with rooms & amenities
router.get('/:id', async (req, res) => {
  try {
    const [[hotel]] = await db.query(
      `SELECT h.*, d.name AS destination_name, d.country
       FROM hotels h
       JOIN destinations d ON h.destination_id = d.destination_id
       WHERE h.hotel_id = ?`,
      [req.params.id]
    );
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

    const [rooms] = await db.query('SELECT * FROM rooms WHERE hotel_id = ?', [req.params.id]);
    const [amenities] = await db.query(
      `SELECT a.amenity_name FROM amenities a
       JOIN hotel_amenities ha ON a.amenity_id = ha.amenity_id
       WHERE ha.hotel_id = ?`, [req.params.id]);

    res.json({ success: true, data: { ...hotel, rooms, amenities } });
  } catch (err) {
    console.error('GET /hotels/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hotels/:id/rooms — get rooms for a hotel
router.get('/:id/rooms', async (req, res) => {
  try {
    const [rooms] = await db.query('SELECT * FROM rooms WHERE hotel_id = ?', [req.params.id]);
    res.json({ success: true, count: rooms.length, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/hotels — create hotel (Admin / Protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { destination_id, hotel_name, stars, price, amenities } = req.body;

    if (!destination_id || !hotel_name || !price) {
      return res.status(400).json({ success: false, message: 'destination_id, hotel_name and price are required' });
    }

    const [result] = await db.query(
      'INSERT INTO hotels (destination_id, hotel_name, stars, price, amenities) VALUES (?, ?, ?, ?, ?)',
      [destination_id, hotel_name, stars || 5, price, amenities || 'Infinity Pool, Ocean View, Free Breakfast']
    );

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: { hotel_id: result.insertId, destination_id, hotel_name, stars, price, amenities }
    });
  } catch (err) {
    console.error('POST /hotels error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/hotels/:id — update hotel (Admin / Protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { hotel_name, stars, price, amenities } = req.body;
    const id = req.params.id;

    const [[existing]] = await db.query('SELECT * FROM hotels WHERE hotel_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    await db.query(
      `UPDATE hotels
       SET hotel_name = COALESCE(?, hotel_name),
           stars = COALESCE(?, stars),
           price = COALESCE(?, price),
           amenities = COALESCE(?, amenities)
       WHERE hotel_id = ?`,
      [hotel_name, stars, price, amenities, id]
    );

    res.json({ success: true, message: 'Hotel updated successfully' });
  } catch (err) {
    console.error('PUT /hotels/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/hotels/:id — delete hotel (Admin / Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM rooms WHERE hotel_id = ?', [req.params.id]);
    await db.query('DELETE FROM hotel_amenities WHERE hotel_id = ?', [req.params.id]);
    const [result] = await db.query('DELETE FROM hotels WHERE hotel_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    res.json({ success: true, message: 'Hotel deleted successfully' });
  } catch (err) {
    console.error('DELETE /hotels/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
