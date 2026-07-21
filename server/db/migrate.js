/**
 * server/db/migrate.js
 *
 * IBM OnboardAI — Database Migration Runner
 *
 * Usage:  npm run migrate
 *
 * Applies server/db/schema.sql to the configured database (PostgreSQL or SQLite).
 * Safe to re-run — all statements use CREATE TABLE IF NOT EXISTS.
 */

require('dotenv').config();
const path = require('path');
const fs   = require('fs');

async function migrate() {
  console.log('\n📦 IBM OnboardAI — Database Migration\n');

  // ── Bootstrap DB ────────────────────────────────────────────────────────────
  const { initDB } = require('../config/database');
  await initDB();

  console.log('\n✅ Migration complete.\n');
  console.log('   All tables are up to date.');
  console.log('   Run `npm run seed` to populate demo data.\n');

  process.exit(0);
}

migrate().catch(err => {
  console.error('\n❌ Migration failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
