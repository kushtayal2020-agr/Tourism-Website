// ============================================================
// routes/reviews.js
// Table: reviews (review_id, user_id, destination_id, rating, review_text, review_date)
// ============================================================
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authMiddleware } = require('./auth');

// GET /api/reviews — get reviews (supports ?destination_id=1 ?min_rating=4)
router.get('/', async (req, res) => {
  try {
    const { destination_id, min_rating } = req.query;
    let sql = `
      SELECT r.*, u.name AS reviewer_name, d.name AS destination_name, d.country
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      JOIN destinations d ON r.destination_id = d.destination_id
      WHERE 1=1
    `;
    const vals = [];
    if (destination_id) { sql += ' AND r.destination_id = ?'; vals.push(parseInt(destination_id, 10)); }
    if (min_rating)     { sql += ' AND r.rating >= ?';         vals.push(parseFloat(min_rating)); }
    sql += ' ORDER BY r.review_date DESC';

    const [rows] = await db.query(sql, vals);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reviews/recent — get latest reviews across platform
router.get('/recent', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.name AS reviewer_name, d.name AS destination_name, d.country
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       JOIN destinations d ON r.destination_id = d.destination_id
       ORDER BY r.review_date DESC
       LIMIT 10`
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reviews — submit a review (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { destination_id, rating, review_text } = req.body;
    const user_id = req.user.user_id;

    if (!destination_id || !rating) {
      return res.status(400).json({ success: false, message: 'destination_id and rating are required' });
    }
    const numRating = parseFloat(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'rating must be between 1 and 5' });
    }

    const [result] = await db.query(
      'INSERT INTO reviews (user_id, destination_id, rating, review_text, review_date) VALUES (?, ?, ?, ?, CURDATE())',
      [user_id, destination_id, numRating, review_text || null]
    );

    // Update destination average rating dynamically
    await db.query(
      'UPDATE destinations SET rating = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE destination_id = ?) WHERE destination_id = ?',
      [destination_id, destination_id]
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: { review_id: result.insertId, destination_id, rating: numRating, review_text }
    });
  } catch (err) {
    console.error('POST /reviews error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/reviews/:id — delete review (Author or Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const [[review]] = await db.query('SELECT user_id, destination_id FROM reviews WHERE review_id = ?', [reviewId]);

    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (req.user.role !== 'Admin' && review.user_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await db.query('DELETE FROM reviews WHERE review_id = ?', [reviewId]);

    // Update destination average rating
    await db.query(
      'UPDATE destinations SET rating = COALESCE((SELECT ROUND(AVG(rating), 1) FROM reviews WHERE destination_id = ?), 4.5) WHERE destination_id = ?',
      [review.destination_id, review.destination_id]
    );

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('DELETE /reviews/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
