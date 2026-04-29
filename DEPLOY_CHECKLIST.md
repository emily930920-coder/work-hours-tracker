# 🚀 快速部署清单

部署到 Render.com 只需 5 个步骤！

## ✅ 部署前检查

- [ ] GitHub 账号已创建
- [ ] 代码已推送到 GitHub
- [ ] 所有配置文件已就绪

---

## 📋 5 步完成部署

### 1️⃣ 推送代码到 GitHub

```bash
git add .
git commit -m "Ready for Render deployment"
git push
```

### 2️⃣ 注册 Render 账号

访问：https://render.com
点击：Sign up with GitHub

### 3️⃣ 创建 Web Service

1. 点击 "New +" → "Web Service"
2. 选择仓库：`work-hours-tracker`
3. 点击 "Connect"

### 4️⃣ 配置服务

**Name**: work-hours-api
**Build Command**: `npm run render-build`
**Start Command**: `npm start`

**环境变量**（点击 Add Environment Variable）:
- `NODE_ENV` = `production`
- `JWT_SECRET` = 点击 "Generate" 自动生成

**添加 Disk**:
- Name: `sqlite-data`
- Mount Path: `/opt/render/project/src/server/data`
- Size: 1GB

### 5️⃣ 部署

点击 "Create Web Service"

等待 3-5 分钟... ☕

---

## ✨ 完成！

你的应用地址：
```
https://work-hours-api.onrender.com
```

---

## 🎯 首次使用

1. 打开应用地址
2. 等待 10-30 秒（首次唤醒）
3. 注册账户
4. 开始使用！

---

## 📱 添加到手机

**iOS**: Safari → 分享 → 添加到主屏幕
**Android**: Chrome → 菜单 → 添加到主屏幕

---

## 🔄 自动更新

以后每次 `git push`，Render 会自动部署！

---

需要详细步骤？查看 `RENDER_DEPLOYMENT.md`
