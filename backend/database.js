import Database from "better-sqlite3";

const db = new Database("database.db");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  photo TEXT
);

CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  city TEXT NOT NULL,

  UNIQUE(userId, city)
);
`);

export default db;