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

router.patch('/dish/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'messowner') {
      return res.status(403).json({ error: 'Only mess owners can edit dishes' });
    }

    const { name, price, items } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const check = await dishQueries.findByIdWithMess(req.params.id);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    if (check.rows[0].mess_owner_id !== req.user.ownerId) {
      return res.status(403).json({ error: 'You do not own this dish' });
    }

    const result = await dishQueries.update(req.params.id, name, price);

    // Replace items: delete old ones, insert new ones
    if (Array.isArray(items)) {
      await dishQueries.deleteItemsByDishId(req.params.id);
      for (const item of items) {
        await dishItemQueries.addItem(req.params.id, item);
      }
    }

    res.json({ status: 'success', dish: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// DELETE A DISH (Mess Owner only, must own the mess)
router.delete('/dish/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'messowner') {
      return res.status(403).json({ error: 'Only mess owners can delete dishes' });
    }

    const check = await dishQueries.findByIdWithMess(req.params.id);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    if (check.rows[0].mess_owner_id !== req.user.ownerId) {
      return res.status(403).json({ error: 'You do not own this dish' });
    }

    await dishQueries.deleteById(req.params.id);
    res.json({ status: 'success', message: 'Dish deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
