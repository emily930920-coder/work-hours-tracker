# 🚀 Vercel 完整部署指南

## 您的工时记录系统已准备好部署到 Vercel！

---

## ✅ 已完成的准备工作

我已经为您完成了所有代码修改：

1. ✅ 添加了 PostgreSQL 数据库支持
2. ✅ 创建了 `postgres-db.js` 文件
3. ✅ 更新了 `package.json` 添加依赖
4. ✅ 创建了 `vercel.json` 配置文件
5. ✅ 修改了路由文件支持数据库切换
6. ✅ 保留了 SQLite 支持（本地开发仍可用）

---

## 📋 部署步骤（10分钟完成）

### 步骤 1：提交代码到 GitHub

```bash
cd /Users/yangyang100/Desktop/AutoTest/work-hours-tracker

# 添加所有修改
git add .

# 提交更改
git commit -m "Add Vercel deployment support with PostgreSQL"

# 推送到 GitHub
git push
```

### 步骤 2：注册并登录 Vercel

1. 访问：https://vercel.com
2. 点击 **"Sign Up"**
3. 选择 **"Continue with GitHub"**
4. 授权 Vercel 访问你的 GitHub

### 步骤 3：导入项目

1. 在 Vercel Dashboard 点击 **"Add New..."**
2. 选择 **"Project"**
3. 找到 `emily930920-coder/work-hours-tracker`
4. 点击 **"Import"**

### 步骤 4：配置项目

**Framework Preset**: Vercel 会自动检测，选择 **"Other"** 或 **"Express.js"**

**Root Directory**: 保持为 `.` (根目录)

**Build and Output Settings**:
- **Build Command**: `npm run render-build`
- **Output Directory**: `client/dist`
- **Install Command**: `npm install`

### 步骤 5：添加环境变量

点击 **"Environment Variables"** 展开，添加以下变量：

| Key | Value |
|-----|-------|
| `JWT_SECRET` | 生成随机字符串（见下方） |
| `NODE_ENV` | `production` |
| `VERCEL` | `true` |

**生成 JWT_SECRET：**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

复制输出的字符串作为 `JWT_SECRET` 的值。

### 步骤 6：部署项目

1. 确认所有配置正确
2. 点击 **"Deploy"** 按钮
3. 等待 3-5 分钟（首次部署较慢）

### 步骤 7：创建 Vercel Postgres 数据库

部署完成后：

1. 进入项目详情页
2. 点击顶部导航栏的 **"Storage"** 标签
3. 点击 **"Create Database"**
4. 选择 **"Postgres"**
5. 填写：
   - **Database Name**: `work-hours-db`
   - **Region**: 选择离中国最近的（如 Singapore 或 Hong Kong）
6. 点击 **"Create"**

### 步骤 8：连接数据库到项目

1. 数据库创建完成后，点击 **"Connect Project"**
2. 选择你的 `work-hours-tracker` 项目
3. Vercel 会自动添加数据库连接环境变量：
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   等

4. 点击 **"Connect"**

### 步骤 9：重新部署

1. 返回项目的 **"Deployments"** 标签
2. 点击最新部署右侧的 **"..."** 菜单
3. 选择 **"Redeploy"**
4. 确认重新部署

### 步骤 10：访问应用

部署完成后，你会看到：

```
https://work-hours-tracker-xxx.vercel.app
```

点击访问，首次访问会自动初始化数据库！

---

## 🎉 完成！

你的工时记录系统已成功部署到 Vercel！

### 应用地址
```
https://your-project.vercel.app
```

### 首次使用
1. 点击"注册"
2. 创建账户
3. 开始记录工时

---

## 🔄 自动部署

以后每次推送代码到 GitHub：

```bash
git add .
git commit -m "Update features"
git push
```

Vercel 会自动检测并重新部署！

---

## 📱 添加到手机主屏幕

**iOS:**
Safari → 分享 → 添加到主屏幕

**Android:**
Chrome → 菜单 → 添加到主屏幕

---

## 🔧 常见问题

### 1. 数据库连接失败

**原因：** 数据库未创建或未连接到项目

**解决：**
1. 确认已创建 Vercel Postgres 数据库
2. 确认已连接到项目
3. 确认已重新部署

### 2. 部署失败

**检查：**
- 代码是否已推送到 GitHub
- Build Command 是否正确
- 环境变量是否已设置

### 3. 无法访问

**检查：**
- 部署是否成功（状态为 Ready）
- URL 是否正确
- 等待几秒钟（首次可能需要初始化）

### 4. API 返回 500 错误

**原因：** 数据库未初始化

**解决：**
- 访问 `/api/health` 端点触发数据库初始化
- 或在 Vercel Dashboard 查看 Logs

---

## 💰 费用说明

### Vercel 免费套餐包含：
- ✅ 100 GB 带宽/月
- ✅ 无限部署
- ✅ 自动 HTTPS
- ✅ 全球 CDN

### Vercel Postgres 免费套餐：
- ✅ 256 MB 数据库
- ✅ 60 小时计算时间/月
- ✅ 256 MB 存储

**对于个人工时记录完全够用！**

---

## 📊 性能优势

相比其他平台：

- ✅ 不会休眠
- ✅ 国内访问最快
- ✅ 全球 CDN 加速
- ✅ 自动扩展

---

## 🎯 下一步

### 自定义域名（可选）

1. 在项目设置中点击 **"Domains"**
2. 添加你的域名
3. 按照提示配置 DNS
4. 等待验证完成

### 环境监控

1. 在 **"Analytics"** 查看访问统计
2. 在 **"Logs"** 查看运行日志
3. 在 **"Settings"** 配置告警

---

## ✨ 恭喜！

你已成功将工时记录系统部署到 Vercel！

- 🚀 全球最快的访问速度
- 🔒 企业级安全保障
- 💯 99.99% 可用性
- 🆓 完全免费使用

**开始使用吧！** 🎊
