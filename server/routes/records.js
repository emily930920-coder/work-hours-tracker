const express = require('express');

// 统一使用 PostgreSQL
const {
  getTodayRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  getUserRecords,
  getUserRecordsByMonth,
  getRecordById,
  batchCreateRecords
} = require('../database/postgres-db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

function calculateWorkHours(clockIn, clockOut) {
  if (!clockOut) return null;
  const diff = new Date(clockOut) - new Date(clockIn);
  return Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
}

router.post('/', (req, res) => {
  try {
    const { clock_in, clock_out, notes } = req.body;
    const userId = req.user.userId;

    if (!clock_in) {
      return res.status(400).json({ error: 'Clock in time required' });
    }

    // 检查当天是否已有记录
    const existingRecord = getTodayRecord(userId, clock_in);
    if (existingRecord) {
      return res.status(400).json({ 
        error: '今天已经打过卡了，每天只能打卡一次',
        existing: existingRecord 
      });
    }

    const workHours = clock_out ? calculateWorkHours(clock_in, clock_out) : null;
    const recordId = createRecord(userId, clock_in, clock_out, workHours, notes);

    res.status(201).json({
      message: 'Record created',
      record: {
        id: recordId,
        user_id: userId,
        clock_in,
        clock_out,
        work_hours: workHours,
        notes
      }
    });
  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { clock_in, clock_out, notes } = req.body;
    const userId = req.user.userId;

    const existingRecord = getRecordById(id, userId);
    if (!existingRecord) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // 使用提供的值或保留原值
    const newClockIn = clock_in || existingRecord.clock_in;
    const newClockOut = clock_out !== undefined ? clock_out : existingRecord.clock_out;
    const newNotes = notes !== undefined ? notes : existingRecord.notes;

    const workHours = newClockOut ? calculateWorkHours(newClockIn, newClockOut) : null;
    updateRecord(id, userId, newClockIn, newClockOut, workHours, newNotes);

    res.json({
      message: 'Record updated',
      record: {
        id,
        clock_in: newClockIn,
        clock_out: newClockOut,
        work_hours: workHours,
        notes: newNotes
      }
    });
  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = deleteRecord(id, userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Record deleted' });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

router.get('/', (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const records = getUserRecords(userId, limit, offset);
    res.json({ records });
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

router.get('/month/:year/:month', (req, res) => {
  try {
    const userId = req.user.userId;
    const { year, month } = req.params;

    const paddedMonth = month.padStart(2, '0');
    const records = getUserRecordsByMonth(userId, year, paddedMonth);

    const totalHours = records.reduce((sum, record) => {
      return sum + (record.work_hours || 0);
    }, 0);

    const stats = {
      totalHours: Math.round(totalHours * 100) / 100,
      totalDays: records.filter(r => r.work_hours > 0).length,
      records
    };

    res.json(stats);
  } catch (error) {
    console.error('Get monthly records error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly records' });
  }
});

router.post('/sync', (req, res) => {
  try {
    const userId = req.user.userId;
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Invalid records data' });
    }

    batchCreateRecords(userId, records);

    res.json({
      message: 'Records synced successfully',
      count: records.length
    });
  } catch (error) {
    console.error('Sync records error:', error);
    res.status(500).json({ error: 'Failed to sync records' });
  }
});

router.get('/export', (req, res) => {
  try {
    const userId = req.user.userId;
    const records = getUserRecords(userId, 10000, 0);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=work-hours-export.json');
    res.json({ records, exportDate: new Date().toISOString() });
  } catch (error) {
    console.error('Export records error:', error);
    res.status(500).json({ error: 'Failed to export records' });
  }
});

module.exports = router;
