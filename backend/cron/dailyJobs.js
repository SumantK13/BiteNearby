const cron = require('node-cron');
const pool = require('../config/db');

// Reset attendance counters at midnight
const resetAttendanceCounts = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      await pool.query(
        'UPDATE messes SET attending_today_day = 0, attending_today_night = 0'
      );
      console.log('✅ [CRON] Reset attendance counts for all messes');
    } catch (err) {
      console.error('❌ [CRON] Failed to reset attendance counts:', err);
    }
  });
};

// Clean up expired reservations at midnight
const cleanupExpiredReservations = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const result = await pool.query(
        'DELETE FROM reservations WHERE date < CURRENT_DATE RETURNING id'
      );
      console.log(`✅ [CRON] Deleted ${result.rowCount} outdated reservations`);
    } catch (err) {
      console.error('❌ [CRON] Failed to clean up reservations:', err);
    }
  });
};

// Clean up old menus (older than today)
const cleanupOldMenus = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const result = await pool.query(
        'DELETE FROM menus WHERE date < CURRENT_DATE RETURNING id'
      );
      console.log(`✅ [CRON] Deleted ${result.rowCount} outdated menus`);
    } catch (err) {
      console.error('❌ [CRON] Failed to clean up menus:', err);
    }
  });
};

const initCronJobs = () => {
  resetAttendanceCounts();
  cleanupExpiredReservations();
  cleanupOldMenus();
  console.log('⏰ Cron jobs initialized');
};

module.exports = initCronJobs;