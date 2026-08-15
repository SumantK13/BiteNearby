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

const MEAL_TIMES = {
  day: 13,   // 1:00 PM in 24hr format
  night: 20, // 8:00 PM
};
const CUTOFF_HOURS = 2;

// CANCEL A RESERVATION
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ error: 'Only users can cancel reservations' });
    }

    const result = await reservationQueries.findById(req.params.id);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = result.rows[0];

    // Ensure the reservation belongs to the requesting user
    if (reservation.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'You can only cancel your own reservations' });
    }

    // Calculate cutoff time based on meal type and date
    const mealHour = MEAL_TIMES[reservation.meal_type] ?? MEAL_TIMES.day;
    const mealDateTime = new Date(`${reservation.date}T00:00:00`);
    mealDateTime.setHours(mealHour, 0, 0, 0);

    const cutoffTime = new Date(mealDateTime.getTime() - CUTOFF_HOURS * 60 * 60 * 1000);
    const now = new Date();

    if (now >= cutoffTime) {
      return res.status(400).json({
        error: `Cancellation window has passed. Reservations must be cancelled at least ${CUTOFF_HOURS} hours before the meal.`,
      });
    }

    await reservationQueries.deleteById(req.params.id);

    res.json({ status: 'success', message: 'Reservation cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
