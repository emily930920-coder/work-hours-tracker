const { sql } = require('@vercel/postgres');

async function initDatabase() {
  try {
    // 创建 users 表
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fullname TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 创建 records 表
    await sql`
      CREATE TABLE IF NOT EXISTS records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        clock_in TIMESTAMP NOT NULL,
        clock_out TIMESTAMP,
        work_hours REAL,
        notes TEXT,
        is_synced INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `;

    // 创建索引
    await sql`CREATE INDEX IF NOT EXISTS idx_user_records ON records(user_id, clock_in DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sync_status ON records(user_id, is_synced)`;

    console.log('PostgreSQL Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

async function getUser(username) {
  const result = await sql`SELECT * FROM users WHERE username = ${username}`;
  return result.rows[0];
}

async function getUserById(id) {
  const result = await sql`SELECT id, username, fullname, created_at FROM users WHERE id = ${id}`;
  return result.rows[0];
}

async function createUser(username, hashedPassword, fullname) {
  const result = await sql`
    INSERT INTO users (username, password, fullname) 
    VALUES (${username}, ${hashedPassword}, ${fullname})
    RETURNING id
  `;
  return result.rows[0].id;
}

async function getTodayRecord(userId, date) {
  const result = await sql`
    SELECT * FROM records 
    WHERE user_id = ${userId} 
    AND DATE(clock_in) = DATE(${date})
    LIMIT 1
  `;
  return result.rows[0];
}

async function createRecord(userId, clockIn, clockOut, workHours, notes) {
  const result = await sql`
    INSERT INTO records (user_id, clock_in, clock_out, work_hours, notes)
    VALUES (${userId}, ${clockIn}, ${clockOut || null}, ${workHours || null}, ${notes || null})
    RETURNING id
  `;
  return result.rows[0].id;
}

async function updateRecord(id, userId, clockIn, clockOut, workHours, notes) {
  await sql`
    UPDATE records 
    SET clock_in = ${clockIn}, 
        clock_out = ${clockOut || null}, 
        work_hours = ${workHours || null}, 
        notes = ${notes || null}, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND user_id = ${userId}
  `;
  return { changes: 1 };
}

async function deleteRecord(id, userId) {
  const result = await sql`
    DELETE FROM records 
    WHERE id = ${id} AND user_id = ${userId}
  `;
  return { changes: result.rowCount };
}

async function getUserRecords(userId, limit = 100, offset = 0) {
  const result = await sql`
    SELECT * FROM records 
    WHERE user_id = ${userId} 
    ORDER BY clock_in DESC 
    LIMIT ${limit} OFFSET ${offset}
  `;
  return result.rows;
}

async function getUserRecordsByMonth(userId, year, month) {
  const result = await sql`
    SELECT * FROM records 
    WHERE user_id = ${userId} 
    AND EXTRACT(YEAR FROM clock_in) = ${parseInt(year)}
    AND EXTRACT(MONTH FROM clock_in) = ${parseInt(month)}
    ORDER BY clock_in DESC
  `;
  return result.rows;
}

async function getRecordById(id, userId) {
  const result = await sql`
    SELECT * FROM records 
    WHERE id = ${id} AND user_id = ${userId}
  `;
  return result.rows[0];
}

async function batchCreateRecords(userId, records) {
  for (const record of records) {
    await sql`
      INSERT INTO records (user_id, clock_in, clock_out, work_hours, notes, is_synced)
      VALUES (
        ${userId}, 
        ${record.clock_in}, 
        ${record.clock_out || null}, 
        ${record.work_hours || null}, 
        ${record.notes || null}, 
        1
      )
    `;
  }
}

module.exports = {
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
