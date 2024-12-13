import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Export the db variable
export let db = null;

export const initializeDB = async () => {
  try {
    db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Add foreign key support
    await db.run('PRAGMA foreign_keys = ON');

    // Create tables with proper constraints
    await db.exec(`
      CREATE TABLE IF NOT EXISTS menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL CHECK (price >= 0),
        description TEXT,
        image_url TEXT,
        category TEXT NOT NULL DEFAULT 'coffee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total REAL NOT NULL CHECK (total >= 0),
        note TEXT,
        items TEXT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};