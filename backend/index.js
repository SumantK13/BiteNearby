const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const messRoutes = require('./routes/mess');
const menuRoutes = require('./routes/menu');
const enrollmentRoutes = require('./routes/enrollment');
const reservationRoutes = require('./routes/reservation');
const initCronJobs = require('./cron/dailyJobs');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/reservation', reservationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Server running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  initCronJobs();

});



