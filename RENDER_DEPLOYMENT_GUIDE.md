# 🚀 Render 完整部署指南

## 您的工时记录系统已准备好部署到 Render！

---

## 🎯 为什么选择 Render？

相比 Vercel，Render 更适合这个项目：

- ✅ **原生支持全栈应用**（Express + React）
- ✅ **免费 PostgreSQL 数据库**（90天）
- ✅ **不会休眠**（Web Service 持续运行）
- ✅ **自动 HTTPS 证书**
- ✅ **全球 CDN 加速**
- ✅ **简单的环境变量管理**
- ✅ **免费套餐足够个人使用**

---

## 📋 部署步骤（15分钟完成）

### 步骤 1：推送代码到 GitHub

确保代码已推送到 GitHub：

```bash
cd /Users/yangyang100/Desktop/AutoTest/work-hours-tracker

# 查看当前状态
git status

# 如有未提交的更改
git add .
git commit -m "Prepare for Render deployment"
git push
```

---

### 步骤 2：注册 Render 账号

1. 访问：https://render.com
2. 点击 **"Get Started"** 或 **"Sign Up"**
3. 选择 **"Continue with GitHub"**
4. 授权 Render 访问你的 GitHub 账号

---

### 步骤 3：创建 PostgreSQL 数据库

**先创建数据库，再创建 Web Service！**

1. 在 Render Dashboard 点击 **"New +"**
2. 选择 **"PostgreSQL"**
3. 填写数据库信息：

| 配置项 | 值 |
|--------|-----|
| **Name** | `work-hours-db` |
| **Database** | `workhours` |
| **User** | `workhours` (自动生成) |
| **Region** | `Singapore` (离中国最近) |
| **PostgreSQL Version** | `16` (最新版) |
| **Instance Type** | **Free** |

4. 点击 **"Create Database"**
5. 等待 1-2 分钟，数据库创建完成
6. **重要：** 复制并保存 **"Internal Database URL"**（以 `postgres://` 开头）

---

### 步骤 4：创建 Web Service

1. 返回 Dashboard，点击 **"New +"**
2. 选择 **"Web Service"**
3. 选择 **"Build and deploy from a Git repository"**
4. 点击 **"Next"**

#### 连接 GitHub 仓库

1. 找到你的仓库 `work-hours-tracker`
2. 点击 **"Connect"**

#### 配置 Web Service

填写以下信息：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **Name** | `work-hours-tracker` | 服务名称（将成为URL的一部分） |
| **Region** | `Singapore` | 与数据库同区域 |
| **Branch** | `main` | 或你的默认分支名 |
| **Root Directory** | `.` | 项目根目录 |
| **Runtime** | `Node` | 自动检测 |
| **Build Command** | `npm run render-build` | 构建命令 |
| **Start Command** | `npm start` | 启动命令 |
| **Instance Type** | **Free** | 免费套餐 |

---

### 步骤 5：添加环境变量

在 **"Environment Variables"** 部分，点击 **"Add Environment Variable"**：

#### 必需的环境变量

| Key | Value | 说明 |
|-----|-------|------|
| `NODE_ENV` | `production` | 生产环境 |
| `JWT_SECRET` | **生成随机字符串** | 见下方说明 |
| `DATABASE_URL` | **复制数据库 Internal URL** | 从步骤3复制 |
| `PORT` | `10000` | Render 默认端口 |

#### 生成 JWT_SECRET

在本地终端运行：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

复制输出的字符串，粘贴到 `JWT_SECRET` 中。

#### DATABASE_URL 格式

应该类似：
```
postgres://workhours:xxxxx@dpg-xxxxx-a.singapore-postgres.render.com/workhours
```

**注意：** 使用 **"Internal Database URL"**，不是 External URL！

---

### 步骤 6：部署应用

1. 确认所有配置正确
2. 点击 **"Create Web Service"** 按钮
3. Render 开始自动构建和部署
4. 等待 5-8 分钟（首次部署需要安装依赖）

#### 查看部署进度

在 **"Logs"** 标签页查看实时日志：

```
==> Cloning from https://github.com/...
==> Running build command: npm run render-build
==> Installing dependencies...
==> Building client...
==> Build complete!
==> Starting service...
Server running on port 10000
Database initialized successfully
```

#### 部署成功标志

当看到 **"Live"** 绿色标签，表示部署成功！

---

### 步骤 7：访问应用

部署成功后，你会看到类似的 URL：

```
https://work-hours-tracker.onrender.com
```

点击访问，首次访问会自动初始化数据库！

---

## 🎉 完成！

你的工时记录系统已成功部署到 Render！

### 应用信息

- **应用地址：** `https://work-hours-tracker.onrender.com`
- **数据库：** PostgreSQL（Render 托管）
- **状态：** 24/7 运行，不会休眠

### 首次使用

1. 访问应用地址
2. 点击"注册"创建账户
3. 开始记录工时

---

## 🔄 自动部署

每次推送代码到 GitHub，Render 会自动检测并重新部署：

```bash
git add .
git commit -m "Update features"
git push
```

Render 自动触发部署，无需手动操作！

---

## 📊 监控和管理

### 查看日志

1. 进入 Web Service 页面
2. 点击 **"Logs"** 标签
3. 实时查看应用运行日志

### 查看指标

1. 点击 **"Metrics"** 标签
2. 查看：
   - CPU 使用率
   - 内存使用量
   - 请求次数
   - 响应时间

### 数据库管理

1. 进入 PostgreSQL 数据库页面
2. 点击 **"Info"** 查看连接信息
3. 使用 **External Database URL** 连接：

```bash
# 使用 psql 连接
psql <External-Database-URL>

# 查看表
\dt

# 查看用户
SELECT * FROM users;

# 查看记录
SELECT * FROM records LIMIT 10;
```

---

## 🔧 常见问题

### 1. 部署失败：TypeScript 类型错误

**原因：** 缺少 React 类型定义或 Vite 环境变量类型

**错误示例：**
```
error TS7016: Could not find a declaration file for module 'react'
error TS2339: Property 'PROD' does not exist on type 'ImportMetaEnv'
```

**解决：** 所有必要的修复已包含在项目中。如果遇到问题，请查看 `BUILD_FIX_GUIDE.md`

### 2. 部署失败：Build Command Error

**原因：** 构建命令错误或依赖安装失败

**解决：**
- 确认 Build Command 是 `npm run render-build`
- 查看 Logs 找到具体错误
- 确认 `package.json` 中有 `render-build` 脚本

### 2. 应用启动失败：Error: listen EADDRINUSE

**原因：** 端口配置错误

**解决：**
- 确认环境变量 `PORT=10000`
- 确认 `server/index.js` 使用 `process.env.PORT`

### 3. 数据库连接失败

**原因：** DATABASE_URL 配置错误

**解决：**
- 确认使用 **Internal Database URL**（不是 External）
- 格式：`postgres://user:password@host/database`
- 确认数据库和 Web Service 在同一 Region

### 4. API 返回 500 错误

**原因：** 数据库表未创建

**解决：**
1. 检查 Logs 确认数据库初始化日志
2. 访问 `/api/health` 触发初始化
3. 手动连接数据库创建表（见下方）

### 5. 应用响应慢（首次访问）

**原因：** 免费套餐在无活动时会 spin down

**解决：**
- 使用 Render 的 Cron Jobs 定期 ping（见优化部分）
- 升级到付费套餐（$7/月）保持始终运行

---

## 🛠 手动初始化数据库（如需要）

如果自动初始化失败，可以手动创建表：

1. 连接到数据库：

```bash
psql <External-Database-URL>
```

2. 创建 users 表：

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  fullname TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. 创建 records 表：

```sql
CREATE TABLE IF NOT EXISTS records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  clock_in TIMESTAMP NOT NULL,
  clock_out TIMESTAMP,
  work_hours REAL,
  notes TEXT,
  is_synced INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

4. 创建索引：

```sql
CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_clock_in ON records(clock_in);
```

5. 退出：

```sql
\q
```

---

## ⚡️ 性能优化

### 1. 避免免费套餐休眠

创建一个 Cron Job 定期 ping 你的应用：

1. 在 Render Dashboard 点击 **"New +"**
2. 选择 **"Cron Job"**
3. 配置：
   - **Name:** `keep-alive-ping`
   - **Command:** `curl https://work-hours-tracker.onrender.com/api/health`
   - **Schedule:** `*/14 * * * *` (每14分钟)

这样可以避免应用 spin down。

### 2. 数据库连接池

确保 `server/database/postgres-db.js` 配置了合理的连接池：

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,  // 免费套餐最多5个连接
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 3. 启用 Gzip 压缩

在 `server/index.js` 中添加：

```javascript
const compression = require('compression');
app.use(compression());
```

安装依赖：

```bash
npm install compression
```

---

## 💰 费用说明

### Render 免费套餐

#### Web Service（免费）
- ✅ 750 小时/月运行时间
- ✅ 512 MB RAM
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ⚠️ 无活动15分钟后 spin down

#### PostgreSQL（免费）
- ✅ 256 MB RAM
- ✅ 1 GB 存储空间
- ✅ 自动备份
- ⚠️ **90天后过期**

**重要：** 免费数据库会在90天后删除，需要：
- 定期导出数据备份
- 或升级到付费数据库（$7/月，1GB存储）

### 付费套餐（可选）

#### Web Service Starter（$7/月）
- ✅ 始终运行，不会休眠
- ✅ 512 MB RAM
- ✅ 更好的性能

#### PostgreSQL Starter（$7/月）
- ✅ 永久使用
- ✅ 1 GB 存储空间
- ✅ 每日自动备份

**对于个人使用，免费套餐完全够用！**

---

## 🔒 安全建议

### 1. 使用强密码

确保 JWT_SECRET 足够长且随机：

```bash
# 生成64字符的密钥
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. 启用 HTTPS Only

Render 自动提供 HTTPS，确保：

```javascript
// server/index.js
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 3. 数据库备份

定期导出数据：

```bash
# 连接到数据库
psql <External-Database-URL>

# 导出所有数据
\copy (SELECT * FROM users) TO 'users_backup.csv' CSV HEADER;
\copy (SELECT * FROM records) TO 'records_backup.csv' CSV HEADER;
```

### 4. 环境变量安全

- 不要在代码中硬编码敏感信息
- 不要提交 `.env` 文件到 Git
- 定期更换 JWT_SECRET

---

## 📱 移动端访问

### 添加到主屏幕

**iOS (Safari):**
1. 访问 `https://work-hours-tracker.onrender.com`
2. 点击分享按钮 (⬆️)
3. 选择"添加到主屏幕"
4. 命名为"工时记录"
5. 点击"添加"

**Android (Chrome):**
1. 访问应用
2. 点击菜单 (⋮)
3. 选择"添加到主屏幕"
4. 点击"添加"

添加后，应用会像原生 App 一样运行！

---

## 🎯 自定义域名（可选）

### 添加自定义域名

1. 在 Web Service 页面，点击 **"Settings"**
2. 滚动到 **"Custom Domain"** 部分
3. 点击 **"Add Custom Domain"**
4. 输入你的域名（如 `work.example.com`）
5. 按照提示配置 DNS：

#### DNS 配置

添加 CNAME 记录到你的域名服务商：

| Type | Name | Value |
|------|------|-------|
| CNAME | `work` | `work-hours-tracker.onrender.com` |

6. 等待 DNS 传播（通常几分钟）
7. Render 自动配置 HTTPS 证书

---

## 📊 与 Vercel 对比

| 特性 | Render | Vercel |
|------|--------|--------|
| **Express 后端支持** | ✅ 原生支持 | ⚠️ 需要 Serverless Functions |
| **免费数据库** | ✅ PostgreSQL (90天) | ✅ Postgres (永久，但有限制) |
| **是否休眠** | ⚠️ 15分钟无活动后休眠 | ✅ 不休眠 |
| **部署速度** | ⚠️ 5-8分钟 | ✅ 2-3分钟 |
| **国内访问速度** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **配置复杂度** | ⭐⭐⭐ 简单 | ⭐⭐⭐⭐ 中等 |
| **适合场景** | 全栈应用 | 前端 + API |

**建议：**
- **个人使用 + 全栈应用** → 选择 Render
- **需要最快访问速度** → 选择 Vercel
- **生产环境** → 两者都可以，根据预算选择

---

## 🚀 高级配置

### 1. 配置健康检查

在 `server/index.js` 添加：

```javascript
app.get('/health', async (req, res) => {
  try {
    // 检查数据库连接
    await pool.query('SELECT 1');
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
});
```

在 Render 设置中配置：
- **Health Check Path:** `/health`

### 2. 环境特定配置

创建 `render.yaml` 文件（可选）：

```yaml
services:
  - type: web
    name: work-hours-tracker
    env: node
    region: singapore
    plan: free
    buildCommand: npm run render-build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    healthCheckPath: /api/health

databases:
  - name: work-hours-db
    databaseName: workhours
    user: workhours
    region: singapore
    plan: free
```

---

## 🎉 恭喜！

你已成功将工时记录系统部署到 Render！

### 部署清单 ✅

- ✅ PostgreSQL 数据库已创建
- ✅ Web Service 已部署
- ✅ 环境变量已配置
- ✅ 自动部署已启用
- ✅ HTTPS 已配置
- ✅ 应用可访问

### 下一步

1. **测试应用：** 注册账户，测试打卡功能
2. **添加到手机：** 将应用添加到主屏幕
3. **设置 Cron Job：** 避免应用休眠
4. **定期备份：** 导出数据库数据
5. **监控日志：** 定期查看应用运行状态

---

## 📚 相关资源

- [Render 官方文档](https://render.com/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Node.js 部署最佳实践](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

## 💡 提示

### 查看应用状态

```bash
# 健康检查
curl https://work-hours-tracker.onrender.com/api/health

# 查看日志（需要安装 Render CLI）
render logs -s work-hours-tracker
```

### 紧急回滚

1. 进入 **"Deployments"** 页面
2. 找到上一个成功的部署
3. 点击 **"Rollback to this version"**

---

**开始使用你的云端工时记录系统吧！** 🎊
