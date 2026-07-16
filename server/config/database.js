/**
 * server/config/database.js
 *
 * Database connection abstraction.
 * Tries PostgreSQL first. If PG is unavailable (missing env vars or connection error),
 * falls back to SQLite transparently.
 *
 * Exports a single `query(sql, params)` function so all models are engine-agnostic.
 */

require('dotenv').config();
const path = require('path');
const fs   = require('fs');

let db     = null;    // SQLite instance (fallback)
let pool   = null;    // PG pool (primary)
let usePG  = false;

// ─── PostgreSQL Setup ────────────────────────────────────────────────────────
async function initPostgres() {
  const { Pool } = require('pg');

  pool = new Pool({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max:      10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 3000,
  });

  // Test connection
  const client = await pool.connect();
  client.release();
  usePG = true;
  console.log('[DB] Connected to PostgreSQL');
}

// ─── SQLite Setup ────────────────────────────────────────────────────────────
function initSQLite() {
  const Database = require('better-sqlite3');
  const dbPath   = path.resolve(process.env.SQLITE_PATH || './db/onboardai.db');

  // Ensure directory exists
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  usePG = false;
  console.log(`[DB] Connected to SQLite at ${dbPath}`);
}

// ─── Schema Bootstrap ────────────────────────────────────────────────────────
async function runSchema() {
  const schemaPath = path.resolve(__dirname, '../db/schema.sql');
  if (!fs.existsSync(schemaPath)) return;

  const rawSQL = fs.readFileSync(schemaPath, 'utf8');

  if (usePG) {
    await pool.query(rawSQL);
  } else {
    // SQLite-compatible schema (strip PG-specific parts)
    const sqliteSQL = toSQLiteSchema(rawSQL);
    db.exec(sqliteSQL);
  }
  console.log('[DB] Schema applied');
}

/**
 * Converts the PostgreSQL schema to SQLite-compatible SQL.
 * Handles:
 *  - UUID type → TEXT
 *  - gen_random_uuid() → (lower(hex(randomblob(4))) || '-' || ...)
 *  - EXTENSION statements removed
 *  - TIMESTAMP → DATETIME
 *  - NOW() → CURRENT_TIMESTAMP
 *  - CHECK constraints preserved
 *  - IF NOT EXISTS preserved
 */
function toSQLiteSchema(pgSQL) {
  const uuidDefault =
    "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || " +
    "substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || " +
    "substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))";

  return pgSQL
    .replace(/CREATE EXTENSION[^;]+;/gi, '')
    .replace(/UUID\s+PRIMARY KEY\s+DEFAULT\s+gen_random_uuid\(\)/gi,
             `TEXT PRIMARY KEY DEFAULT ${uuidDefault}`)
    .replace(/UUID\b/gi, 'TEXT')
    .replace(/VARCHAR\(\d+\)/gi, 'TEXT')
    .replace(/TIMESTAMP\b/gi, 'DATETIME')
    .replace(/\bNOW\(\)/gi, 'CURRENT_TIMESTAMP')
    .replace(/\bBOOLEAN\b/gi, 'INTEGER')
    .replace(/DEFAULT true/gi, 'DEFAULT 1')
    .replace(/DEFAULT false/gi, 'DEFAULT 0');
}

// ─── Unified Query Interface ──────────────────────────────────────────────────
/**
 * Execute a SQL query.
 * @param {string} sql  - SQL with positional placeholders ($1/$2 for PG, ? for SQLite)
 * @param {Array}  params
 * @returns {Promise<{ rows: Array }>}
 */
async function query(sql, params = []) {
  if (usePG) {
    const result = await pool.query(sql, params);
    return { rows: result.rows };
  }

  // Convert $1, $2 … placeholders to ?
  const sqliteSql = sql.replace(/\$\d+/g, '?');

  // Coerce booleans to 0/1 for SQLite
  const sqliteParams = params.map(p =>
    p === true ? 1 : p === false ? 0 : p
  );

  try {
    // Route to .all() for SELECT, WITH, and any statement with RETURNING clause
    const isRead = /^\s*(SELECT|WITH)/i.test(sqliteSql);
    const hasReturning = /\bRETURNING\b/i.test(sqliteSql);

    if (isRead || hasReturning) {
      const rows = db.prepare(sqliteSql).all(sqliteParams);
      return { rows };
    } else {
      const info = db.prepare(sqliteSql).run(sqliteParams);
      return { rows: [], rowCount: info.changes };
    }
  } catch (err) {
    throw err;
  }
}

// ─── Initialise (called once at startup) ─────────────────────────────────────
async function initDB() {
  const hasPGConfig =
    process.env.DB_HOST &&
    process.env.DB_NAME &&
    process.env.DB_USER;

  if (hasPGConfig) {
    try {
      await initPostgres();
    } catch (err) {
      console.warn(`[DB] PostgreSQL unavailable (${err.message}). Falling back to SQLite.`);
      initSQLite();
    }
  } else {
    initSQLite();
  }

  await runSchema();
}

module.exports = { initDB, query };
