const express = require('express');
const { reservationQueries } = require('../models/db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// CREATE A RESERVATION
router.post('/book', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ error: 'Only users can book a reservation' });
    }

    const { messId, mealType, date } = req.body;
    const userId = req.user.userId;

    if (!messId || !mealType || !date) {
      return res.status(400).json({ error: 'messId, mealType, and date are required' });
    }

    if (!['day', 'night', 'both'].includes(mealType)) {
      return res.status(400).json({ error: 'mealType must be day, night, or both' });
    }

    // Check for existing reservation for same user, mess, meal type, and date
    const existing = await reservationQueries.checkExisting(userId, messId, mealType, date);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You already have a reservation for this meal' });
    }

    const result = await reservationQueries.create(userId, messId, mealType, date);

    res.status(201).json({ status: 'success', reservation: result.rows[0] });
  } catch (err) {
    // Catch UNIQUE constraint violation as a DB-level safety net
    if (err.code === '23505') {
      return res.status(400).json({ error: 'You already have a reservation for this meal' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET MY RESERVATIONS FOR A DATE
router.get('/my-reservations/:date', authMiddleware, async (req, res) => {
  try {
    const result = await reservationQueries.findByUserAndDate(req.user.userId, req.params.date);
    res.json({ status: 'success', reservations: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET RESERVATIONS FOR A MESS ON A DATE (Mess Owner)
router.get('/mess/:messId/:date', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'messowner') {
      return res.status(403).json({ error: 'Only mess owners can view this' });
    }

    const result = await reservationQueries.findByMessAndDate(req.params.messId, req.params.date);
    res.json({ status: 'success', reservations: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
