# 本地开发安装指南

## 快速开始

本项目支持本地开发（SQLite）和云端部署（PostgreSQL）。

### 本地开发设置

1. 安装依赖：
```bash
npm install
cd client && npm install
cd ..
```

2. **重要**：安装 SQLite（仅本地开发需要）：
```bash
npm run install-local
```

3. 创建环境变量文件 `.env`：
```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-me
NODE_ENV=development
```

4. 启动开发服务器：
```bash
npm run dev
```

5. 访问应用：http://localhost:5173/

---

## 为什么 better-sqlite3 不在 package.json 中？

`better-sqlite3` 需要编译原生模块，在 Vercel 等 serverless 平台上无法使用。因此：
- **本地开发**：使用 SQLite（需手动安装 `better-sqlite3`）
- **云端部署**：使用 PostgreSQL（自动切换）

这样可以确保 Vercel 部署不会因为 SQLite 编译失败而中断。

---

## 云端部署

详见：`VERCEL_DEPLOYMENT_GUIDE.md`
