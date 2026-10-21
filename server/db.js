// ============================================================
// db.js — MySQL Connection Pool & Query Helpers
// Database: azura_tourism
// ============================================================
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT, 10) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'azura_tourism',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
  multipleStatements: false,
});

// Test connection on startup with helpful diagnostics
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected — azura_tourism database ready');
    conn.release();
    return true;
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('👉 Tip: Check your server/.env credentials and make sure MySQL80 service is running.');
    return false;
  }
}

// Initial test
testConnection();

/**
 * Execute a query with optional parameters
 */
async function query(sql, params = []) {
  return pool.query(sql, params);
}

/**
 * Execute a transaction with automatic COMMIT / ROLLBACK
 * @param {Function} callback - async (conn) => Promise<any>
 */
async function withTransaction(callback) {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});

// Assign helpers to pool for direct access
pool.withTransaction = withTransaction;
pool.testConnection = testConnection;

module.exports = pool;

