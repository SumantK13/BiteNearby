const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { userQueries, messOwnerQueries } = require('../models/db');
require('dotenv').config();

const router = express.Router();

// USER SIGNUP
router.post('/user/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await userQueries.findByEmail(email);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await userQueries.create(name, email, passwordHash, phone);
    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      status: 'success',
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// USER LOGIN
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const result = await userQueries.findByEmail(email);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Compare password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      status: 'success',
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// MESS OWNER SIGNUP
router.post('/messowner/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if mess owner exists
    const existingOwner = await messOwnerQueries.findByEmail(email);
    if (existingOwner.rows.length > 0) {
      return res.status(400).json({ error: 'Mess owner already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create mess owner
    const result = await messOwnerQueries.create(name, email, passwordHash, phone);
    const owner = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { ownerId: owner.id, email: owner.email, role: 'messowner' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      status: 'success',
      owner: { id: owner.id, name: owner.name, email: owner.email },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// MESS OWNER LOGIN
router.post('/messowner/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find mess owner
    const result = await messOwnerQueries.findByEmail(email);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const owner = result.rows[0];

    // Compare password
    const isValid = await bcrypt.compare(password, owner.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { ownerId: owner.id, email: owner.email, role: 'messowner' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      status: 'success',
      owner: { id: owner.id, name: owner.name, email: owner.email },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;