const express = require('express');
const { enrollmentQueries } = require('../models/db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// JOIN A MESS (User enrolls)
router.post('/join', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ error: 'Only users can join a mess' });
    }

    const { messId } = req.body;
    const userId = req.user.userId;

    if (!messId) {
      return res.status(400).json({ error: 'messId is required' });
    }

    // Check if already enrolled 
    const existing = await enrollmentQueries.findOne(userId, messId);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already enrolled in this mess' });
    }

    const result = await enrollmentQueries.create(userId, messId);

    res.status(201).json({ status: 'success', enrollment: result.rows[0] });
  } catch (err) {
    // Catch UNIQUE constraint violation as a safety net
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Already enrolled in this mess' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET MY ENROLLMENTS (User)
router.get('/my-enrollments', authMiddleware, async (req, res) => {
  try {
    const result = await enrollmentQueries.findByUser(req.user.userId);
    res.json({ status: 'success', enrollments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET MESS ENROLLMENTS (Mess Owner — see who joined)
router.get('/mess/:messId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'messowner') {
      return res.status(403).json({ error: 'Only mess owners can view this' });
    }

    const result = await enrollmentQueries.findByMess(req.params.messId);
    res.json({ status: 'success', enrollments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ACCEPT/REJECT ENROLLMENT (Mess Owner)
router.patch('/:enrollmentId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'messowner') {
      return res.status(403).json({ error: 'Only mess owners can update enrollment status' });
    }

    const { isAccepted } = req.body;

    const result = await enrollmentQueries.updateAcceptance(req.params.enrollmentId, isAccepted);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json({ status: 'success', enrollment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;