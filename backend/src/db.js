import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

let db = null;

const initializeDB = async () => {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  })

  await db.exec(`
    CREATE TABLE IF NOT EXISTS menu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      image_url TEXT,
      category TEXT NOT NULL DEFAULT 'coffee'
    );
  `)

  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      total REAL NOT NULL,
      status TEXT DEFAULT 'completed',
      note TEXT,
      items TEXT NOT NULL
    );
  `)

  return db
}

export { db, initializeDB }