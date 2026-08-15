const express = require('express');
const { messQueries, query } = require('../models/db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// CREATE MESS (Mess Owner only)
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;

    if (req.user.role !== 'messowner') {
      return res.status(403).json({ error: 'Only mess owners can create a mess' });
    }

    if (!name || !address || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await messQueries.create(name, address, latitude, longitude, req.user.ownerId);
    const mess = result.rows[0];

    // Update the reverse link: mess_owners.mess_id
    await query('UPDATE mess_owners SET mess_id = $1 WHERE id = $2', [mess.id, req.user.ownerId]);

    res.status(201).json({
      status: 'success',
      mess
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET ALL MESSES
router.get('/all', async (req, res) => {
  try {
    const result = await messQueries.findAll();
    res.json({ status: 'success', messes: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET NEARBY MESSES
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const result = await messQueries.findNearby(
      parseFloat(latitude), 
      parseFloat(longitude), 
      radius ? parseFloat(radius) : 5
    );

    res.json({ status: 'success', messes: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET MY MESS (Mess Owner)
router.get('/my-mess', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'messowner') {
      return res.status(403).json({ error: 'Only mess owners can access this' });
    }

    const result = await messQueries.findByOwnerId(req.user.ownerId);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No mess found for this owner' });
    }

    res.json({ status: 'success', mess: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// GET SINGLE MESS
router.get('/:id', async (req, res) => {
  try {
    const result = await messQueries.findById(req.params.id);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mess not found' });
    }

    res.json({ status: 'success', mess: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;