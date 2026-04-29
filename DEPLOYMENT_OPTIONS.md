# 免费云端部署方案推荐

## 2026年最佳免费部署选择

根据您的工时记录系统特点（Node.js + Express + SQLite + React），以下是推荐的免费部署方案：

---

## 🥇 方案一：Render.com（强烈推荐）⭐⭐⭐⭐⭐

### 优势
- ✅ **完全免费**：免费套餐永久可用
- ✅ **自动HTTPS**：免费SSL证书
- ✅ **持久化存储**：支持 SQLite 持久化（使用 Persistent Disk）
- ✅ **自动部署**：连接GitHub后自动部署
- ✅ **零配置**：检测 Node.js 自动配置
- ✅ **全球CDN**：访问速度快
- ✅ **无需信用卡**：注册即可使用

### 限制
- ⚠️ 15分钟无活动后休眠（首次访问需10-30秒唤醒）
- 每月750小时免费时长
- 100GB带宽/月

### 部署步骤

#### 1. 准备代码
```bash
# 创建 .gitignore（如果还没有）
cat >> .gitignore << EOF
node_modules/
.env
*.db
.DS_Store
EOF

# 提交到Git
git add .
git commit -m "Prepare for Render deployment"
git push
```

#### 2. 修改配置

创建 `render.yaml`:
```yaml
services:
  # Backend API
  - type: web
    name: work-hours-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: JWT_SECRET
        generateValue: true
    disk:
      name: data
      mountPath: /opt/render/project/src/server/data
      sizeGB: 1

  # Frontend (Static Site)
  - type: web
    name: work-hours-frontend
    env: static
    buildCommand: cd client && npm install && npm run build
    staticPublishPath: ./client/dist
    routes:
      - type: rewrite
        source: /api/*
        destination: https://work-hours-api.onrender.com/api/*
```

#### 3. 在 Render.com 部署
1. 访问 https://render.com/
2. 使用 GitHub 账号登录
3. 点击 "New +" → "Web Service"
4. 连接你的 GitHub 仓库
5. 选择 `work-hours-tracker` 仓库
6. Render 会自动检测配置并部署

#### 4. 配置环境变量
在 Render Dashboard:
- 添加 `JWT_SECRET`（随机字符串）
- 添加 `NODE_ENV=production`

### 预计部署时间：5-10分钟

---

## 🥈 方案二：Railway.app ⭐⭐⭐⭐

### 优势
- ✅ 每月 $5 免费额度
- ✅ 支持 SQLite 持久化
- ✅ 自动HTTPS
- ✅ 不会休眠
- ✅ 自动从 GitHub 部署

### 限制
- ⚠️ 需要信用卡验证（不扣费）
- 免费额度用完后停止服务

### 部署步骤

#### 1. 创建 `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 2. 在 Railway 部署
1. 访问 https://railway.app/
2. 使用 GitHub 登录
3. "New Project" → "Deploy from GitHub repo"
4. 选择仓库并部署

#### 3. 添加持久化存储
- 在项目设置中添加 Volume
- 挂载路径：`/app/server/data`

### 预计部署时间：3-5分钟

---

## 🥉 方案三：Vercel + PlanetScale（分离部署）⭐⭐⭐

### 优势
- ✅ Vercel 部署前端（全球最快CDN）
- ✅ PlanetScale 托管MySQL数据库（免费5GB）
- ✅ 完全不会休眠
- ✅ 自动HTTPS

### 限制
- ⚠️ 需要改用 MySQL（不能用 SQLite）
- 后端需要部署到其他平台

### 适用场景
- 适合流量大的应用
- 需要最佳性能

### 部署步骤（前端）
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署前端
cd client
vercel --prod
```

---

## 🏆 最终推荐

### 如果您是个人使用或小团队（< 10人）
**选择：Render.com（方案一）**

**理由：**
- ✅ 零成本
- ✅ 支持SQLite，无需修改代码
- ✅ 配置简单
- ✅ 可以接受短暂唤醒时间

### 如果您需要24/7不间断服务
**选择：Railway.app（方案二）**

**理由：**
- ✅ 不会休眠
- ✅ 免费额度充足
- ✅ 性能更好

---

## 📋 推荐部署清单（Render.com）

### 步骤1：准备项目
```bash
# 1. 更新 server/index.js，使用环境变量端口
# （已完成，代码中有 process.env.PORT || 3000）

# 2. 创建 render.yaml
# （见上文）

# 3. 更新 client 的 API 地址
# 在 vite.config.ts 中配置生产环境API
```

### 步骤2：修改配置文件

**client/vite.config.ts** - 添加生产环境API配置：
```typescript
export default defineConfig({
  // ... 现有配置
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.NODE_ENV === 'production' 
        ? 'https://your-api.onrender.com'
        : '/api'
    )
  }
});
```

**client/src/services/api.ts** - 使用环境变量：
```typescript
const API_URL = import.meta.env.VITE_API_URL || '/api';
```

### 步骤3：推送到GitHub
```bash
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

### 步骤4：在Render部署
1. 访问 https://render.com
2. 注册/登录（使用GitHub）
3. 创建新的 Web Service
4. 连接GitHub仓库
5. 配置：
   - **Name**: work-hours-tracker
   - **Branch**: main
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
6. 添加环境变量：
   - `JWT_SECRET`: 生成随机字符串
   - `NODE_ENV`: production
7. 添加 Persistent Disk：
   - **Name**: data
   - **Mount Path**: `/opt/render/project/src/server/data`
   - **Size**: 1GB
8. 点击 "Create Web Service"

### 步骤5：部署前端
1. 在Render创建新的 Static Site
2. 配置：
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`
3. 添加环境变量：
   - `VITE_API_URL`: 你的后端API地址
4. 部署

---

## 💰 成本对比

| 平台 | 免费额度 | 休眠 | 持久化 | 需要信用卡 |
|------|---------|------|--------|-----------|
| **Render** | 750h/月 | 是(15分钟) | 支持(1GB) | 否 |
| **Railway** | $5/月 | 否 | 支持 | 是 |
| **Fly.io** | 3个实例 | 否 | 支持(3GB) | 是 |
| **Vercel** | 100GB带宽 | 否 | 不支持SQLite | 否 |

---

## 🚀 快速开始（Render一键部署）

### 最简单的方式：

1. **Fork 项目到你的 GitHub**
2. **点击下面的按钮一键部署：**

```markdown
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
```

3. **配置环境变量后即可使用**

---

## 📞 需要帮助？

如果你选择了某个方案需要详细的部署指导，告诉我你选择了哪个，我会提供完整的部署脚本和配置文件！

---

## 🎯 我的建议

**立即开始：选择 Render.com**

**为什么？**
1. 完全免费，永久可用
2. 不需要信用卡
3. 5分钟即可部署完成
4. 支持SQLite，无需修改代码
5. 自动HTTPS和CDN

**唯一妥协：** 15分钟无活动后休眠，但首次访问10-30秒即可唤醒，对于个人使用完全可以接受。

**准备好了吗？告诉我你的选择，我会帮你完成部署！** 🚀
