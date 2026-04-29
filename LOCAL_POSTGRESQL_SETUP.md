# 本地 PostgreSQL 安装和配置指南

本项目现在统一使用 PostgreSQL 数据库（本地和云端）。

---

## 📦 步骤 1：安装 PostgreSQL

### macOS（推荐使用 Homebrew）

```bash
# 安装 PostgreSQL
brew install postgresql@16

# 启动 PostgreSQL 服务
brew services start postgresql@16

# 验证安装
psql --version
```

### Windows

1. 下载安装包：https://www.postgresql.org/download/windows/
2. 运行安装程序，记住设置的密码
3. 添加 PostgreSQL 到系统 PATH

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

## 🔧 步骤 2：创建数据库

```bash
# 方法 1：使用命令行
psql postgres

# 在 psql 命令行中执行：
CREATE DATABASE work_hours_tracker;
\q

# 方法 2：使用一行命令
createdb work_hours_tracker
```

---

## ⚙️ 步骤 3：配置环境变量

编辑项目根目录的 `.env` 文件：

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-me-in-production
NODE_ENV=development

# PostgreSQL 连接（根据您的配置修改）
POSTGRES_URL=postgresql://localhost:5432/work_hours_tracker

# 如果设置了密码，使用这个格式：
# POSTGRES_URL=postgresql://postgres:your_password@localhost:5432/work_hours_tracker
```

**说明：**
- `postgres` 是默认用户名
- `your_password` 是安装时设置的密码
- `localhost:5432` 是默认地址和端口
- `work_hours_tracker` 是数据库名

---

## 🚀 步骤 4：启动项目

```bash
# 安装依赖
npm install
cd client && npm install && cd ..

# 启动开发服务器
npm run dev
```

首次启动时，数据库表会自动创建！

访问：http://localhost:5173/

---

## 🔍 步骤 5：验证数据库（可选）

```bash
# 连接到数据库
psql -d work_hours_tracker

# 查看所有表
\dt

# 查看 users 表结构
\d users

# 查看 records 表结构
\d records

# 退出
\q
```

---

## 🛠️ 常用命令

```bash
# 启动 PostgreSQL 服务
brew services start postgresql@16    # macOS
sudo systemctl start postgresql       # Linux
# Windows: 服务管理器中启动

# 停止服务
brew services stop postgresql@16     # macOS
sudo systemctl stop postgresql       # Linux

# 重启服务
brew services restart postgresql@16  # macOS
sudo systemctl restart postgresql    # Linux

# 查看服务状态
brew services list                    # macOS
sudo systemctl status postgresql     # Linux
```

---

## ❓ 常见问题

### 1. 连接被拒绝

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解决方法：**
- 确认 PostgreSQL 服务已启动
- 检查端口 5432 是否被占用：`lsof -i :5432`

### 2. 密码认证失败

```
Error: password authentication failed
```

**解决方法：**
- 检查 `.env` 中的密码是否正确
- 或者不设置密码（本地开发）：`POSTGRES_URL=postgresql://localhost:5432/work_hours_tracker`

### 3. 数据库不存在

```
Error: database "work_hours_tracker" does not exist
```

**解决方法：**
```bash
createdb work_hours_tracker
```

---

## 🎉 完成

现在您的本地开发环境使用 PostgreSQL，与 Vercel 生产环境完全一致！
