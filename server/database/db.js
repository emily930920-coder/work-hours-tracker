const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/work-hours.db'));

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      fullname TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      clock_in DATETIME NOT NULL,
      clock_out DATETIME,
      work_hours REAL,
      notes TEXT,
      is_synced INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE INDEX IF NOT EXISTS idx_user_records ON records(user_id, clock_in DESC);
    CREATE INDEX IF NOT EXISTS idx_sync_status ON records(user_id, is_synced);
  `);

  console.log('Database initialized successfully');
}

function getUser(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

function getUserById(id) {
  return db.prepare('SELECT id, username, fullname, created_at FROM users WHERE id = ?').get(id);
}

function createUser(username, hashedPassword, fullname) {
  const stmt = db.prepare('INSERT INTO users (username, password, fullname) VALUES (?, ?, ?)');
  const result = stmt.run(username, hashedPassword, fullname);
  return result.lastInsertRowid;
}

function getTodayRecord(userId, date) {
  const stmt = db.prepare(`
    SELECT * FROM records 
    WHERE user_id = ? 
    AND date(clock_in) = date(?)
    LIMIT 1
  `);
  return stmt.get(userId, date);
}

function createRecord(userId, clockIn, clockOut, workHours, notes) {
  const stmt = db.prepare(`
    INSERT INTO records (user_id, clock_in, clock_out, work_hours, notes)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(userId, clockIn, clockOut, workHours, notes);
  return result.lastInsertRowid;
}

function updateRecord(id, userId, clockIn, clockOut, workHours, notes) {
  const stmt = db.prepare(`
    UPDATE records 
    SET clock_in = ?, clock_out = ?, work_hours = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `);
  return stmt.run(clockIn, clockOut, workHours, notes, id, userId);
}

function deleteRecord(id, userId) {
  const stmt = db.prepare('DELETE FROM records WHERE id = ? AND user_id = ?');
  return stmt.run(id, userId);
}

function getUserRecords(userId, limit = 100, offset = 0) {
  const stmt = db.prepare(`
    SELECT * FROM records 
    WHERE user_id = ? 
    ORDER BY clock_in DESC 
    LIMIT ? OFFSET ?
  `);
  return stmt.all(userId, limit, offset);
}

function getUserRecordsByMonth(userId, year, month) {
  const stmt = db.prepare(`
    SELECT * FROM records 
    WHERE user_id = ? 
    AND strftime('%Y', clock_in) = ? 
    AND strftime('%m', clock_in) = ?
    ORDER BY clock_in DESC
  `);
  return stmt.all(userId, year, month);
}

function getRecordById(id, userId) {
  return db.prepare('SELECT * FROM records WHERE id = ? AND user_id = ?').get(id, userId);
}

function batchCreateRecords(userId, records) {
  const stmt = db.prepare(`
    INSERT INTO records (user_id, clock_in, clock_out, work_hours, notes, is_synced)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const insertMany = db.transaction((recordsList) => {
    for (const record of recordsList) {
      stmt.run(
        userId,
        record.clock_in,
        record.clock_out,
        record.work_hours,
        record.notes,
        1
      );
    }
  });
  
  insertMany(records);
}

module.exports = {
  db,
  initDatabase,
  getUser,
  getUserById,
  createUser,
  getTodayRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  getUserRecords,
  getUserRecordsByMonth,
  getRecordById,
  batchCreateRecords
};
