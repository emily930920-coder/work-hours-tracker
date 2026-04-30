const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 统一使用 PostgreSQL
const { 
  getUser, 
  createUser, 
  getUserById, 
  getAllUsers, 
  updateUserPassword, 
  deleteUser,
  getUserStats 
} = require('../database/postgres-db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, fullname } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await getUser(username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await createUser(username, hashedPassword, fullname || username);

    const token = jwt.sign(
      { userId, username },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, username, fullname: fullname || username }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await getUser(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, fullname: user.fullname }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 获取当前用户信息
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// 新增：获取所有用户列表（需要认证）
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await getAllUsers();
    
    // 为每个用户添加统计信息
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const stats = await getUserStats(user.id);
        return {
          ...user,
          stats: {
            totalRecords: parseInt(stats.total_records) || 0,
            totalHours: parseFloat(stats.total_hours) || 0,
            firstRecord: stats.first_record,
            lastRecord: stats.last_record
          }
        };
      })
    );

    res.json({ 
      users: usersWithStats,
      total: usersWithStats.length 
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to get users list' });
  }
});

// 新增：修改密码
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // 验证输入
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // 获取用户信息
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 验证当前密码
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // 更新密码
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    const success = await updateUserPassword(userId, newHashedPassword);

    if (!success) {
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.json({ 
      message: 'Password changed successfully',
      user: { id: user.id, username: user.username, fullname: user.fullname }
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// 新增：删除用户账号
router.delete('/delete-account', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.userId;

    // 验证密码
    if (!password) {
      return res.status(400).json({ error: 'Password required to delete account' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // 删除用户（会级联删除所有工时记录）
    const success = await deleteUser(userId);

    if (!success) {
      return res.status(500).json({ error: 'Failed to delete account' });
    }

    res.json({ 
      message: 'Account deleted successfully',
      username: user.username
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// 新增：管理员删除指定用户（需要 admin 权限，暂时允许任何登录用户）
router.delete('/users/:userId', authenticateToken, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);
    const currentUserId = req.user.userId;

    // 不能删除自己（应该使用 delete-account 端点）
    if (targetUserId === currentUserId) {
      return res.status(400).json({ error: 'Use /delete-account to delete your own account' });
    }

    // 验证目标用户是否存在
    const targetUser = await getUserById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 删除用户
    const success = await deleteUser(targetUserId);

    if (!success) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    res.json({ 
      message: 'User deleted successfully',
      deletedUser: {
        id: targetUser.id,
        username: targetUser.username,
        fullname: targetUser.fullname
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
