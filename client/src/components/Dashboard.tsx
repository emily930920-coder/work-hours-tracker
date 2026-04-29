import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  LogOut, 
  Download, 
  Upload,
  History,
  Edit2,
  Trash2,
  Save,
  X,
  Plus
} from 'lucide-react';
import { recordService } from '../services/api';
import { localStorageService } from '../services/storage';
import type { WorkRecord, MonthlyStats, User } from '../types';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [currentRecord, setCurrentRecord] = useState<WorkRecord | null>(null);
  const [todayRecord, setTodayRecord] = useState<WorkRecord | null>(null);
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [editingRecord, setEditingRecord] = useState<WorkRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editForm, setEditForm] = useState({ clock_in: '', clock_out: '', notes: '' });
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isOnline) {
        const [fetchedRecords, stats] = await Promise.all([
          recordService.getRecords(50, 0),
          recordService.getMonthlyRecords(
            new Date().getFullYear(),
            new Date().getMonth() + 1
          ),
        ]);
        setRecords(fetchedRecords);
        setMonthlyStats(stats);

        const activeRecord = fetchedRecords.find(r => !r.clock_out);
        setCurrentRecord(activeRecord || null);

        // 获取今天的记录
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayRec = fetchedRecords.find(r => 
          format(new Date(r.clock_in), 'yyyy-MM-dd') === today
        );
        setTodayRecord(todayRec || null);
      } else {
        const localRecords = await localStorageService.getRecords();
        setRecords(localRecords);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    const now = new Date().toISOString();
    setLoading(true);

    try {
      if (isOnline) {
        const record = await recordService.createRecord({
          clock_in: now,
          clock_out: null,
          work_hours: null,
        });
        setCurrentRecord(record);
      } else {
        const localId = await localStorageService.saveRecord({
          clock_in: now,
          clock_out: null,
          work_hours: null,
        });
        setCurrentRecord({ id: localId, clock_in: now, clock_out: null, work_hours: null });
      }
      await loadData();
    } catch (error: any) {
      console.error('Clock in failed:', error);
      const errorMsg = error.response?.data?.error || '打卡失败，请重试';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!currentRecord) return;

    const now = new Date().toISOString();
    setLoading(true);

    try {
      if (isOnline && currentRecord.id) {
        await recordService.updateRecord(currentRecord.id, {
          clock_out: now,
        });
      } else if (currentRecord.id) {
        await localStorageService.updateRecord(currentRecord.id, {
          clock_out: now,
        });
      }
      setCurrentRecord(null);
      await loadData();
    } catch (error) {
      console.error('Clock out failed:', error);
      alert('下班打卡失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      alert('当前离线，无法同步');
      return;
    }

    setSyncing(true);
    try {
      const unsyncedRecords = await localStorageService.getUnsyncedRecords();
      if (unsyncedRecords.length > 0) {
        await recordService.syncRecords(unsyncedRecords);
        for (const record of unsyncedRecords) {
          if (record.id) {
            await localStorageService.markAsSynced(record.id);
          }
        }
        alert(`成功同步 ${unsyncedRecords.length} 条记录`);
      } else {
        alert('没有需要同步的记录');
      }
      await loadData();
    } catch (error) {
      console.error('Sync failed:', error);
      alert('同步失败，请重试');
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await recordService.exportRecords();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `work-hours-${format(new Date(), 'yyyy-MM-dd')}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请重试');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleEditRecord = (record: WorkRecord) => {
    setEditingRecord(record);
    setEditForm({
      clock_in: record.clock_in ? format(new Date(record.clock_in), "yyyy-MM-dd'T'HH:mm") : '',
      clock_out: record.clock_out ? format(new Date(record.clock_out), "yyyy-MM-dd'T'HH:mm") : '',
      notes: record.notes || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRecord || !editingRecord.id) return;

    setLoading(true);
    try {
      const updates: Partial<WorkRecord> = {
        clock_in: new Date(editForm.clock_in).toISOString(),
        clock_out: editForm.clock_out ? new Date(editForm.clock_out).toISOString() : null,
        notes: editForm.notes,
      };

      await recordService.updateRecord(editingRecord.id, updates);
      setEditingRecord(null);
      await loadData();
      alert('记录已更新');
    } catch (error) {
      console.error('Update failed:', error);
      alert('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;

    setLoading(true);
    try {
      await recordService.deleteRecord(recordId);
      await loadData();
      alert('记录已删除');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('删除失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = () => {
    const now = new Date();
    setEditForm({
      clock_in: format(now, "yyyy-MM-dd'T'HH:mm"),
      clock_out: '',
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleSaveNewRecord = async () => {
    if (!editForm.clock_in) {
      alert('请输入上班时间');
      return;
    }

    setLoading(true);
    try {
      await recordService.createRecord({
        clock_in: new Date(editForm.clock_in).toISOString(),
        clock_out: editForm.clock_out ? new Date(editForm.clock_out).toISOString() : null,
        notes: editForm.notes,
      });
      setShowAddModal(false);
      await loadData();
      alert('记录已添加');
    } catch (error: any) {
      console.error('Add failed:', error);
      const errorMsg = error.response?.data?.error || '添加失败，请重试';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  if (!user) return null;

  const avgWorkHours = monthlyStats && monthlyStats.totalDays > 0 
    ? (monthlyStats.totalHours / monthlyStats.totalDays).toFixed(2)
    : '0.00';

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: '2rem' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '480px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>工时记录</h1>
            <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>{user.fullname}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{
              padding: '0.25rem 0.5rem',
              background: isOnline ? '#10b981' : '#ef4444',
              borderRadius: '1rem',
              fontSize: '0.75rem'
            }}>
              {isOnline ? '在线' : '离线'}
            </span>
            <button
              onClick={handleLogout}
              className="btn"
              style={{ 
                padding: '0.375rem 0.75rem',
                background: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontSize: '0.875rem'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1rem' }}>
        {/* Time and Clock Buttons Card */}
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '20px',
          padding: '2rem 1.5rem',
          marginBottom: '1rem',
          boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)'
        }}>
          <div style={{ 
            textAlign: 'center', 
            color: 'white',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            fontFamily: 'monospace'
          }}>
            {format(currentTime, 'HH:mm:ss')}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={handleClockIn}
              className="btn"
              disabled={loading || !!todayRecord}
              style={{
                width: '100%',
                padding: '1rem',
                background: todayRecord ? 'rgba(139, 92, 246, 0.6)' : 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                color: 'white',
                fontSize: '1.125rem',
                fontWeight: '600',
                borderRadius: '12px',
                boxShadow: '0 4px 8px rgba(139, 92, 246, 0.3)',
                cursor: todayRecord ? 'not-allowed' : 'pointer'
              }}
            >
              😊 上班打卡
            </button>
            
            <button
              onClick={handleClockOut}
              className="btn"
              disabled={loading || !currentRecord}
              style={{
                width: '100%',
                padding: '1rem',
                background: !currentRecord ? 'rgba(251, 146, 60, 0.6)' : 'linear-gradient(135deg, #fbbf24 0%, #fb923c 100%)',
                color: 'white',
                fontSize: '1.125rem',
                fontWeight: '600',
                borderRadius: '12px',
                boxShadow: '0 4px 8px rgba(251, 146, 60, 0.3)',
                cursor: !currentRecord ? 'not-allowed' : 'pointer'
              }}
            >
              🏠 下班打卡
            </button>
          </div>
        </div>

        {/* Today's Record Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📅 今日记录
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: '0.938rem' }}>上班时间：</span>
              <span style={{ fontWeight: '600', fontSize: '1rem' }}>
                {todayRecord ? format(new Date(todayRecord.clock_in), 'HH:mm') : '--:--'}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: '0.938rem' }}>下班时间：</span>
              <span style={{ fontWeight: '600', fontSize: '1rem' }}>
                {todayRecord?.clock_out ? format(new Date(todayRecord.clock_out), 'HH:mm') : '未打卡'}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: '0.938rem' }}>工作时长：</span>
              <span style={{ fontWeight: '600', fontSize: '1rem', color: '#3b82f6' }}>
                {todayRecord?.work_hours ? `${todayRecord.work_hours.toFixed(2)} 小时` : '0.00 小时'}
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Statistics Card */}
        {monthlyStats && (
          <div style={{
            background: 'linear-gradient(135deg, #a7f3d0 0%, #d8b4fe 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1rem',
            boxShadow: '0 2px 8px rgba(167, 243, 208, 0.3)'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#059669'
            }}>
              📊 本月统计
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  工作天数
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>
                  {monthlyStats.totalDays}
                </div>
              </div>
              
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  总工时
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {monthlyStats.totalHours.toFixed(2)}
                </div>
              </div>
              
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  平均工时
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {avgWorkHours}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Records Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <History size={20} />
              历史记录
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={handleAddRecord} 
                className="btn"
                style={{
                  padding: '0.5rem 0.75rem',
                  background: '#10b981',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                <Plus size={16} />
                添加
              </button>
              <button 
                onClick={handleSync} 
                className="btn"
                disabled={syncing || !isOnline}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: '#64748b',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                <Upload size={16} />
                {syncing ? '同步中' : '同步'}
              </button>
              <button 
                onClick={handleExport} 
                className="btn"
                disabled={!isOnline}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: '#3b82f6',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                <Download size={16} />
                导出
              </button>
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem 0' }}>加载中...</p>
          ) : records.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem 0' }}>暂无记录</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', fontWeight: '600' }}>日期</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', fontWeight: '600' }}>上班</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', fontWeight: '600' }}>下班</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: '600' }}>工时</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: '600' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 10).map((record) => (
                    <tr key={record.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {format(new Date(record.clock_in), 'MM-dd')}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {format(new Date(record.clock_in), 'HH:mm')}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {record.clock_out ? format(new Date(record.clock_out), 'HH:mm') : '-'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: '600', color: '#3b82f6' }}>
                        {record.work_hours ? `${record.work_hours.toFixed(1)}h` : '-'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="btn"
                            style={{ 
                              padding: '0.25rem 0.5rem', 
                              background: '#3b82f6', 
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                            title="编辑"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => record.id && handleDeleteRecord(record.id)}
                            className="btn"
                            style={{ 
                              padding: '0.25rem 0.5rem', 
                              background: '#ef4444', 
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                            title="删除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{ 
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '400px', 
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>编辑记录</h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="btn"
                style={{ padding: '0.5rem', background: 'transparent', color: '#6b7280' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">上班时间</label>
              <input
                type="datetime-local"
                className="form-input"
                value={editForm.clock_in}
                onChange={(e) => setEditForm({ ...editForm, clock_in: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">下班时间</label>
              <input
                type="datetime-local"
                className="form-input"
                value={editForm.clock_out}
                onChange={(e) => setEditForm({ ...editForm, clock_out: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">备注</label>
              <textarea
                className="form-input"
                rows={3}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="可选"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingRecord(null)}
                className="btn btn-secondary"
                style={{ padding: '0.625rem 1.25rem' }}
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn btn-primary"
                disabled={loading || !editForm.clock_in}
                style={{ padding: '0.625rem 1.25rem' }}
              >
                <Save size={16} />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{ 
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '400px', 
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>添加记录</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn"
                style={{ padding: '0.5rem', background: 'transparent', color: '#6b7280' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">上班时间 *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={editForm.clock_in}
                onChange={(e) => setEditForm({ ...editForm, clock_in: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">下班时间</label>
              <input
                type="datetime-local"
                className="form-input"
                value={editForm.clock_out}
                onChange={(e) => setEditForm({ ...editForm, clock_out: e.target.value })}
              />
              <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>可选，留空表示未打卡</small>
            </div>

            <div className="form-group">
              <label className="form-label">备注</label>
              <textarea
                className="form-input"
                rows={3}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="可选"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary"
                style={{ padding: '0.625rem 1.25rem' }}
              >
                取消
              </button>
              <button
                onClick={handleSaveNewRecord}
                className="btn btn-success"
                disabled={loading || !editForm.clock_in}
                style={{ padding: '0.625rem 1.25rem' }}
              >
                <Plus size={16} />
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
