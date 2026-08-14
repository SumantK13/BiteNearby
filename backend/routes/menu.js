const express = require('express');
const { dishQueries, dishItemQueries, menuQueries } = require('../models/db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// CREATE A DISH (Mess Owner only)
router.post('/dish', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'messowner') {
      return res.status(403).json({ error: 'Only mess owners can add dishes' });
    }

    const { name, price, messId, items } = req.body;

    if (!name || !price || !messId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const dishResult = await dishQueries.create(name, price, messId);
    const dish = dishResult.rows[0];

    // Add items if provided
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await dishItemQueries.addItem(dish.id, item);
      }
    }

    res.status(201).json({ status: 'success', dish });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE A MENU FOR A SPECIFIC DATE
router.post('/menu', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'messowner') {
      return res.status(403).json({ error: 'Only mess owners can create a menu' });
    }

    const { messId, mealType, date, dishIds } = req.body;

    if (!messId || !mealType || !date || !dishIds) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const menuResult = await menuQueries.create(messId, mealType, date);
    const menu = menuResult.rows[0];

    // Link dishes to this menu
    for (const dishId of dishIds) {
      await menuQueries.linkDish(menu.id, dishId);
    }

    res.status(201).json({ status: 'success', menu });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET FULL MENU FOR A MESS ON A DATE
router.get('/menu/:messId/:date', async (req, res) => {
  try {
    const { messId, date } = req.params;

    const result = await menuQueries.getFullMenu(messId, date);

    res.json({ status: 'success', menu: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
