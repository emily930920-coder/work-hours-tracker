import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Key, Trash2, LogOut, ArrowLeft, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  fullname: string;
  created_at: string;
  stats: {
    totalRecords: number;
    totalHours: number;
    firstRecord: string | null;
    lastRecord: string | null;
  };
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'password' | 'delete'>('users');
  
  // 修改密码状态
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 删除账号状态
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (err: any) {
      setError(err.response?.data?.error || '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      setError('新密码至少需要6个字符');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('密码修改成功！');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (deleteConfirm !== 'DELETE') {
      setError('请输入 DELETE 确认删除');
      return;
    }

    if (!deletePassword) {
      setError('请输入当前密码');
      return;
    }

    if (!window.confirm('确定要删除账号吗？此操作不可恢复！所有工时记录将被永久删除。')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete('/api/auth/delete-account', {
        headers: { Authorization: `Bearer ${token}` },
        data: { password: deletePassword }
      });
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('账号已删除');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || '删除账号失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!window.confirm(`确定要删除用户 "${username}" 吗？此操作不可恢复！`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage(`用户 "${username}" 已删除`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || '删除用户失败');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '无';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft size={20} />
                <span>返回主页</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-800">用户管理</h1>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users size={20} />
              用户列表
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'password'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Key size={20} />
              修改密码
            </button>
            <button
              onClick={() => setActiveTab('delete')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'delete'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Trash2 size={20} />
              删除账号
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">所有用户</h2>
                <button
                  onClick={fetchUsers}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '加载中...' : '刷新'}
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-500">加载中...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无用户</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">用户名</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">姓名</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">注册时间</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">记录数</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">总工时</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{user.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{user.username}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{user.fullname}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {user.stats.totalRecords}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {user.stats.totalHours.toFixed(1)}h
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              className="text-red-600 hover:text-red-800"
                              title="删除用户"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'password' && (
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">修改密码</h2>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    当前密码
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新密码
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">至少6个字符</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    确认新密码
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '提交中...' : '修改密码'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'delete' && (
            <div className="max-w-md mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">危险操作</h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• 此操作将永久删除您的账号</li>
                      <li>• 所有工时记录将被删除</li>
                      <li>• 此操作不可恢复</li>
                      <li>• 建议先导出数据备份</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-6">删除账号</h2>
              
              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    当前密码
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    输入 <code className="bg-gray-100 px-2 py-1 rounded">DELETE</code> 确认删除
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="输入 DELETE"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || deleteConfirm !== 'DELETE'}
                  className="w-full py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? '删除中...' : '永久删除账号'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
