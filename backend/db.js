
const Database = require('better-sqlite3');

const db = new Database('fitsphere.db');

// Create tables if they do not exist
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT,
        age INTEGER,
        gender TEXT,
        height REAL,
        weight REAL,
        username TEXT,
        password_hash TEXT
    );

    CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        workout_name TEXT NOT NULL,
        duration INTEGER DEFAULT 0,
        completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS fitness_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        height REAL NOT NULL,
        weight REAL NOT NULL,
        goal TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
`);

// Add missing columns to older databases
const userColumns = db.prepare('PRAGMA table_info(users)').all();
const columnNames = userColumns.map(column => column.name);

if (!columnNames.includes('username')) {
    db.exec('ALTER TABLE users ADD COLUMN username TEXT');
}

if (!columnNames.includes('email')) {
    db.exec('ALTER TABLE users ADD COLUMN email TEXT');
}

if (!columnNames.includes('password_hash')) {
    db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT');
}

// Ensure usernames and emails are unique
db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username
    ON users(username)
    WHERE username IS NOT NULL
`);

db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
    ON users(email)
    WHERE email IS NOT NULL
`);

module.exports = db;
