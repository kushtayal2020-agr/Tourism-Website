#!/usr/bin/env node
// ============================================================
// set-admin.js — CLI utility to grant Administrator rights
// Usage: node server/set-admin.js user@gmail.com
// ============================================================
require('dotenv').config();
const db = require('./db');

const email = process.argv[2];
if (!email) {
  console.log('Usage: node server/set-admin.js <email>');
  process.exit(1);
}

async function setAdmin() {
  try {
    const normalized = email.trim().toLowerCase();
    const [[user]] = await db.query('SELECT user_id, name, email, role FROM users WHERE LOWER(email) = ?', [normalized]);

    if (!user) {
      console.log(`⚠️ User '${normalized}' not found in database.`);
      console.log(`Tip: Sign up first on http://localhost:5000/signup.html, then run this command again.`);
      process.exit(1);
    }

    await db.query("UPDATE users SET role = 'Admin' WHERE user_id = ?", [user.user_id]);
    console.log(`✅ Success: ${user.name} (${user.email}) is now an Administrator in MySQL!`);
    process.exit(0);
  } catch (err) {
    console.error('Error setting admin:', err.message);
    process.exit(1);
  }
}

setAdmin();
