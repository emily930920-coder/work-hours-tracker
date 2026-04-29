# Vercel 部署指南

## 🚀 完整部署方案（无需信用卡）

Vercel 是最受欢迎的前端部署平台，完全免费且国内访问速度快。

---

## ⚠️ 重要说明

Vercel 是 **Serverless 平台**，不支持 SQLite。有两个解决方案：

### 方案 A：使用 Vercel Postgres（推荐）
- ✅ 完全免费
- ✅ Vercel 官方数据库
- ✅ 自动集成
- ⚠️ 需要修改少量代码

### 方案 B：使用 Supabase
- ✅ 完全免费
- ✅ PostgreSQL 数据库
- ✅ 功能强大
- ⚠️ 需要修改代码

---

## 📋 方案 A：Vercel + Vercel Postgres（推荐）

### 步骤 1：注册 Vercel

访问：https://vercel.com

1. 点击 **"Sign Up"**
2. 选择 **"Continue with GitHub"**
3. 授权 Vercel 访问

### 步骤 2：导入项目

1. 在 Vercel Dashboard 点击 **"Add New..."**
2. 选择 **"Project"**
3. 找到 `emily930920-coder/work-hours-tracker`
4. 点击 **"Import"**

### 步骤 3：配置项目

**Framework Preset**: 选择 "Other"

**Build Settings**:
- Build Command: `npm run render-build`
- Output Directory: `client/dist`
- Install Command: `npm install`

**Root Directory**: 保持为 `.` (根目录)

### 步骤 4：添加环境变量

点击 **"Environment Variables"**，添加：

```
JWT_SECRET = [点击生成随机字符串]
NODE_ENV = production
```

### 步骤 5：创建 Vercel Postgres 数据库

1. 部署完成后，进入项目
2. 点击顶部 **"Storage"** 标签
3. 点击 **"Create Database"**
4. 选择 **"Postgres"**
5. 填写数据库名称：`work-hours-db`
6. 点击 **"Create"**

### 步骤 6：连接数据库到项目

1. 在 Storage 页面选择刚创建的数据库
2. 点击 **"Connect Project"**
3. 选择你的项目
4. Vercel 会自动添加数据库环境变量

---

## 🔧 代码修改（使用 Vercel Postgres）

由于 Vercel 不支持 SQLite，需要改用 PostgreSQL。

### 修改 1：安装依赖

在 `package.json` 中添加：

```json
"dependencies": {
  "pg": "^8.11.3",
  "@vercel/postgres": "^0.5.1"
}
```

### 修改 2：更新数据库配置

创建新的数据库文件 `server/database/postgres-db.js`:

```javascript
const { sql } = require('@vercel/postgres');

async function initDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      fullname TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

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

  await sql`CREATE INDEX IF NOT EXISTS idx_user_records ON records(user_id, clock_in DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sync_status ON records(user_id, is_synced)`;

  console.log('PostgreSQL Database initialized successfully');
}

async function getUser(username) {
  const result = await sql`SELECT * FROM users WHERE username = ${username}`;
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

// ... 其他函数类似修改

module.exports = {
  initDatabase,
  getUser,
  createUser,
  // ... 导出其他函数
};
```

### 修改 3：创建 Vercel 配置

创建 `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "client/dist/$1"
    }
  ]
}
```

---

## 🎯 方案 B：快速部署（保持 SQLite - 使用 Glitch）

**如果觉得修改代码太麻烦**，我强烈建议使用 **Glitch**：

- ✅ 支持 SQLite，无需修改代码
- ✅ 完全免费，无需信用卡
- ✅ 5分钟部署完成
- ⚠️ 5分钟无活动休眠

访问：https://glitch.com

---

## 📊 Vercel vs Glitch 对比

| 特性 | Vercel | Glitch |
|------|--------|--------|
| 💳 需信用卡 | ❌ | ❌ |
| 🗄️ SQLite | ❌ 需改PostgreSQL | ✅ 直接支持 |
| ⚡ 国内速度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 🔧 配置难度 | ⭐⭐⭐⭐ 需改代码 | ⭐ 极简单 |
| 😴 休眠 | ❌ 不休眠 | ✅ 5分钟休眠 |
| 📦 部署时间 | 2分钟 | 3分钟 |

---

## 💡 我的建议

### 如果您想要最快部署（推荐）
**选择：Glitch**
- 无需修改代码
- 5分钟完成
- 完全够用

**查看：** `GLITCH_DEPLOYMENT.md`

### 如果您需要最佳性能
**选择：Vercel + Postgres**
- 需要修改代码
- 性能最好
- 不会休眠

---

## 🚀 立即开始

### 方式 1：Glitch（简单）
```
1. 访问 glitch.com
2. Import from GitHub
3. 配置环境变量
4. 完成！
```

### 方式 2：Vercel（需改代码）
```
1. 访问 vercel.com
2. Import project
3. 修改数据库代码
4. 部署
```

---

## 🆘 需要帮助？

**想用 Glitch（推荐）？**
- 查看 `GLITCH_DEPLOYMENT.md`
- 5分钟完成，无需修改代码

**坚持用 Vercel？**
- 我可以帮您修改数据库代码
- 提供完整的迁移脚本

**告诉我您的选择！** 🎯
