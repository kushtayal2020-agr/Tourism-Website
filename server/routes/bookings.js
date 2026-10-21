// ============================================================
// routes/bookings.js
// Table: bookings (booking_id, user_id, package_id, booking_date, number_of_travelers, total_amount, booking_status)
// Table: payments (payment_id, booking_id, payment_method, amount, payment_date, payment_status, transaction_id)
// Procedures: CreateBooking, CancelBooking, GetUserBookings
// ============================================================
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authMiddleware } = require('./auth');

// GET /api/bookings — list all bookings (Admin view)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, u.name AS customer_name, u.email AS customer_email,
              p.package_name, p.duration, d.name AS destination_name, d.country,
              pay.payment_status, pay.transaction_id, pay.payment_method
       FROM bookings b
       JOIN users u        ON b.user_id        = u.user_id
       JOIN packages p     ON b.package_id     = p.package_id
       JOIN destinations d ON p.destination_id = d.destination_id
       LEFT JOIN payments pay ON b.booking_id  = pay.booking_id
       ORDER BY b.booking_id DESC`
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('GET /bookings error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/my — get current logged-in user's bookings
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT b.*, p.package_name, p.duration, d.name AS destination_name, d.country,
              pay.payment_status, pay.transaction_id, pay.payment_method
       FROM bookings b
       JOIN packages p     ON b.package_id     = p.package_id
       JOIN destinations d ON p.destination_id = d.destination_id
       LEFT JOIN payments pay ON b.booking_id  = pay.booking_id
       WHERE b.user_id = ?
       ORDER BY b.booking_id DESC`,
      [req.user.user_id]
    );
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    console.error('GET /bookings/my error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/summary — booking stats (uses booking_summary view)
router.get('/summary', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM booking_summary LIMIT 100');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/:id — single booking details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [[booking]] = await db.query(
      `SELECT b.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
              p.package_name, p.duration, p.travel_style,
              d.name AS destination_name, d.country,
              pay.payment_status, pay.transaction_id, pay.payment_method, pay.amount AS payment_amount
       FROM bookings b
       JOIN users u        ON b.user_id        = u.user_id
       JOIN packages p     ON b.package_id     = p.package_id
       JOIN destinations d ON p.destination_id = d.destination_id
       LEFT JOIN payments pay ON b.booking_id  = pay.booking_id
       WHERE b.booking_id = ?`,
      [req.params.id]
    );

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Allow user to see only their booking unless admin
    if (req.user.role !== 'Admin' && booking.user_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    console.error('GET /bookings/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/bookings — create a new booking (supports authenticated & guest checkout)
router.post('/', async (req, res) => {
  try {
    const {
      package_id,
      package_name,
      booking_date,
      number_of_travelers,
      payment_method,
      customer_name,
      customer_email,
      customer_phone
    } = req.body;

    let user_id = null;

    // 1. Enforce authenticated user via JWT token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'azura_tourism_jwt_secret_change_me_in_production');
        if (decoded && decoded.user_id) user_id = decoded.user_id;
      } catch (_) { }
    }

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to your AZURA account before booking.'
      });
    }

    const numTravelers = parseInt(number_of_travelers, 10) || 1;
    if (numTravelers <= 0) {
      return res.status(400).json({ success: false, message: 'number_of_travelers must be > 0' });
    }

    // 3. Match package by ID or Name
    let pkg = null;
    if (package_id) {
      const [[foundById]] = await db.query('SELECT package_id, price, package_name, destination_id FROM packages WHERE package_id = ?', [package_id]);
      pkg = foundById;
    }

    if (!pkg && package_name) {
      const cleanName = package_name.trim();

      // a. Exact or substring match on package_name
      const [[foundByName]] = await db.query(
        'SELECT package_id, price, package_name, destination_id FROM packages WHERE LOWER(package_name) LIKE ? ORDER BY package_id DESC LIMIT 1',
        [`%${cleanName.toLowerCase()}%`]
      );
      pkg = foundByName;

      // b. Match by keywords (e.g. 'Santorini', 'Bali', 'Kyoto', 'Alps', 'Maldives', 'Machu', 'Serengeti', 'Dubai', 'Amalfi', 'Banff', 'Sunset')
      if (!pkg) {
        const words = cleanName.split(/[\s—–-]+/).filter(w => w.length >= 4);
        for (const word of words) {
          const [[matchByWord]] = await db.query(
            'SELECT package_id, price, package_name, destination_id FROM packages WHERE LOWER(package_name) LIKE ? ORDER BY package_id DESC LIMIT 1',
            [`%${word.toLowerCase()}%`]
          );
          if (matchByWord) {
            pkg = matchByWord;
            break;
          }
        }
      }

      // c. Match by destination name
      if (!pkg) {
        const [[matchByDest]] = await db.query(
          `SELECT p.package_id, p.price, p.package_name, p.destination_id
           FROM packages p
           JOIN destinations d ON p.destination_id = d.destination_id
           WHERE LOWER(?) LIKE CONCAT('%', LOWER(d.name), '%')
           ORDER BY p.package_id DESC LIMIT 1`,
          [cleanName]
        );
        pkg = matchByDest;
      }

      // d. If not found, create new package entry preserving exact chosen name & price
      if (!pkg) {
        const [[matchedDest]] = await db.query(
          `SELECT destination_id FROM destinations WHERE LOWER(?) LIKE CONCAT('%', LOWER(name), '%') LIMIT 1`,
          [cleanName]
        );
        const destId = matchedDest ? matchedDest.destination_id : 5; // Default to Santorini
        const unitPrice = parseFloat(req.body.price) || 1890.00;
        const [insertRes] = await db.query(
          'INSERT INTO packages (destination_id, package_name, duration, price, travel_style, rating) VALUES (?, ?, ?, ?, ?, ?)',
          [destId, cleanName, 5, unitPrice, 'Curated', 5.0]
        );
        pkg = {
          package_id: insertRes.insertId,
          package_name: cleanName,
          price: unitPrice,
          destination_id: destId
        };
      }
    }

    if (!pkg) {
      // Default to Santorini package if nothing provided (never Gwalior)
      const [[santoriniPkg]] = await db.query(
        "SELECT package_id, price, package_name, destination_id FROM packages WHERE package_name LIKE '%Santorini%' LIMIT 1"
      );
      pkg = santoriniPkg;
    }

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'No tour packages found in database' });
    }

    const total_amount = parseFloat((pkg.price * numTravelers + 142).toFixed(2));
    const travelDate = booking_date || new Date().toISOString().split('T')[0];

    // 4. Insert booking into MySQL
    const [result] = await db.query(
      'INSERT INTO bookings (user_id, package_id, booking_date, number_of_travelers, total_amount, booking_status) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, pkg.package_id, travelDate, numTravelers, total_amount, 'Confirmed']
    );

    const booking_id = result.insertId;
    const transaction_id = 'AZ-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);

    // 5. Insert payment record into MySQL
    await db.query(
      'INSERT INTO payments (booking_id, payment_method, amount, payment_date, payment_status, transaction_id) VALUES (?, ?, ?, CURDATE(), ?, ?)',
      [booking_id, payment_method || 'Card', total_amount, 'Completed', transaction_id]
    );

    res.status(201).json({
      success: true,
      message: 'Booking confirmed!',
      data: {
        booking_id,
        package_id: pkg.package_id,
        package_name: pkg.package_name,
        transaction_id,
        total_amount,
        booking_status: 'Confirmed'
      }
    });
  } catch (err) {
    console.error('POST /bookings error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/bookings/:id/cancel — cancel booking via stored procedure CancelBooking
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Verify booking exists and belongs to user or admin
    const [[booking]] = await db.query('SELECT user_id, booking_status FROM bookings WHERE booking_id = ?', [bookingId]);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (req.user.role !== 'Admin' && booking.user_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Call stored procedure CancelBooking
    await db.query('CALL CancelBooking(?)', [bookingId]);

    res.json({
      success: true,
      message: `Booking #${bookingId} successfully cancelled`,
      booking_status: 'Cancelled'
    });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/bookings/:id — alias for cancel
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const [[booking]] = await db.query('SELECT user_id FROM bookings WHERE booking_id = ?', [bookingId]);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (req.user.role !== 'Admin' && booking.user_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await db.query('CALL CancelBooking(?)', [bookingId]);
    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
