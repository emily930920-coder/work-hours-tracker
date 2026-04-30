const { Pool } = require('pg');

// 创建连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function initDatabase() {
  try {
    // 创建 users 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fullname TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建 records 表
    await pool.query(`
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
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // 创建索引
    await pool.query('CREATE INDEX IF NOT EXISTS idx_user_records ON records(user_id, clock_in DESC)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sync_status ON records(user_id, is_synced)');

    console.log('PostgreSQL Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

async function getUser(username) {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
}

async function getUserById(id) {
  const result = await pool.query('SELECT id, username, fullname, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

async function createUser(username, hashedPassword, fullname) {
  const result = await pool.query(
    'INSERT INTO users (username, password, fullname) VALUES ($1, $2, $3) RETURNING id',
    [username, hashedPassword, fullname]
  );
  return result.rows[0].id;
}

async function getTodayRecord(userId, date) {
  const result = await pool.query(
    'SELECT * FROM records WHERE user_id = $1 AND DATE(clock_in) = DATE($2) LIMIT 1',
    [userId, date]
  );
  return result.rows[0];
}

async function createRecord(userId, clockIn, clockOut, workHours, notes) {
  const result = await pool.query(
    'INSERT INTO records (user_id, clock_in, clock_out, work_hours, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [userId, clockIn, clockOut || null, workHours || null, notes || null]
  );
  return result.rows[0].id;
}

async function updateRecord(id, userId, clockIn, clockOut, workHours, notes) {
  await pool.query(
    'UPDATE records SET clock_in = $1, clock_out = $2, work_hours = $3, notes = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND user_id = $6',
    [clockIn, clockOut || null, workHours || null, notes || null, id, userId]
  );
  return { changes: 1 };
}

async function deleteRecord(id, userId) {
  const result = await pool.query(
    'DELETE FROM records WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return { changes: result.rowCount };
}

async function getUserRecords(userId, limit = 100, offset = 0) {
  const result = await pool.query(
    'SELECT * FROM records WHERE user_id = $1 ORDER BY clock_in DESC LIMIT $2 OFFSET $3',
    [userId, limit, offset]
  );
  return result.rows;
}

async function getUserRecordsByMonth(userId, year, month) {
  const result = await pool.query(
    'SELECT * FROM records WHERE user_id = $1 AND EXTRACT(YEAR FROM clock_in) = $2 AND EXTRACT(MONTH FROM clock_in) = $3 ORDER BY clock_in DESC',
    [userId, parseInt(year), parseInt(month)]
  );
  return result.rows;
}

async function getRecordById(id, userId) {
  const result = await pool.query(
    'SELECT * FROM records WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0];
}

async function batchCreateRecords(userId, records) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const record of records) {
      await client.query(
        'INSERT INTO records (user_id, clock_in, clock_out, work_hours, notes, is_synced) VALUES ($1, $2, $3, $4, $5, 1)',
        [userId, record.clock_in, record.clock_out || null, record.work_hours || null, record.notes || null]
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// 新增：获取所有用户列表
async function getAllUsers() {
  const result = await pool.query(
    'SELECT id, username, fullname, created_at FROM users ORDER BY created_at DESC'
  );
  return result.rows;
}

// 新增：更新用户密码
async function updateUserPassword(userId, newHashedPassword) {
  const result = await pool.query(
    'UPDATE users SET password = $1 WHERE id = $2 RETURNING id',
    [newHashedPassword, userId]
  );
  return result.rowCount > 0;
}

// 新增：删除用户（会级联删除其所有记录）
async function deleteUser(userId) {
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1',
    [userId]
  );
  return result.rowCount > 0;
}

// 新增：获取用户统计信息
async function getUserStats(userId) {
  const result = await pool.query(`
    SELECT 
      COUNT(*) as total_records,
      SUM(work_hours) as total_hours,
      MIN(clock_in) as first_record,
      MAX(clock_in) as last_record
    FROM records 
    WHERE user_id = $1
  `, [userId]);
  return result.rows[0];
}

// 优雅关闭
process.on('SIGTERM', () => {
  pool.end(() => {
    console.log('PostgreSQL pool has ended');
  });
});

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
  batchCreateRecords,
  getAllUsers,
  updateUserPassword,
  deleteUser,
  getUserStats,
  pool
};
