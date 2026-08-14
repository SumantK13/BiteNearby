const { Pool, types } = require('pg');
require('dotenv').config();

types.setTypeParser(1082, (val) => val);


const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "bitenearby",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

module.exports = pool;


