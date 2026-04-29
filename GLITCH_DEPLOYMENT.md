# Glitch 部署指南

## 🚀 5分钟完成部署

### 步骤 1：访问 Glitch

打开浏览器访问：
```
https://glitch.com
```

### 步骤 2：用 GitHub 登录

1. 点击右上角 **"Sign in"**
2. 选择 **"Sign in with GitHub"**
3. 授权 Glitch 访问你的 GitHub

### 步骤 3：导入项目

1. 点击右上角 **"New Project"**
2. 选择 **"Import from GitHub"**
3. 输入仓库地址：
   ```
   emily930920-coder/work-hours-tracker
   ```
4. 点击 **"OK"**

### 步骤 4：配置环境变量

项目导入后：

1. 点击左下角 **"Tools"** 按钮
2. 选择 **".env"**
3. 添加以下环境变量：

```env
# 必填：JWT密钥
JWT_SECRET=你的随机密钥

# 可选
NODE_ENV=production
PORT=3000
```

**生成 JWT_SECRET：**
```bash
# 在本地终端运行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

复制生成的字符串粘贴到 Glitch

### 步骤 5：等待部署

- Glitch 会自动安装依赖
- 自动构建前端
- 自动启动服务
- 大约 2-3 分钟完成

### 步骤 6：访问应用

部署完成后：
1. 点击顶部的 **"Show"** 按钮
2. 选择 **"In a New Window"**
3. 获得你的应用地址：`https://your-project.glitch.me`

---

## 🎉 完成！

你的工时记录系统已经部署成功！

### 应用地址
```
https://your-project-name.glitch.me
```

### 首次使用
1. 等待 5-10 秒（服务唤醒）
2. 注册新账户
3. 开始使用

### 自动更新
- 每次推送到 GitHub
- 在 Glitch 项目中点击 "Tools" → "Import/Export" → "Import from GitHub"
- 选择最新的代码

---

## 💡 Glitch 使用技巧

### 保持服务唤醒（可选）

如果想减少休眠：
1. 使用 UptimeRobot 监控（免费）
2. 每 5 分钟 ping 一次你的应用
3. 保持服务活跃

### 查看日志

1. 点击底部的 **"Logs"** 按钮
2. 实时查看服务器日志
3. 调试错误

### 数据备份

1. 点击 "Tools" → "Terminal"
2. 运行：
   ```bash
   cp server/data/work-hours.db backup.db
   ```
3. 点击 "Assets" 上传备份

---

## 🆘 常见问题

### 项目休眠了？
- 正常现象，5分钟无活动会休眠
- 首次访问等待 5-10 秒唤醒
- 或使用 UptimeRobot 保持唤醒

### 数据会丢失吗？
- 不会！Glitch 提供持久化存储
- 数据库文件会一直保存
- 建议定期备份

### 如何自定义域名？
- Glitch 免费版不支持自定义域名
- 升级到付费版（$8/月）可以

---

## ✅ 总结

Glitch 是最适合您的选择：
- ✅ 完全免费
- ✅ 无需信用卡
- ✅ 支持 SQLite
- ✅ 部署简单
- ✅ 代码无需修改

**开始部署：** https://glitch.com
