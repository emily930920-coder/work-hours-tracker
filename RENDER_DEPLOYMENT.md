# Render 部署指南

## 🚀 完整部署步骤

### 前提条件
- ✅ GitHub 账号
- ✅ 项目已推送到 GitHub

---

## 步骤 1：准备项目代码

### 1.1 确认所有配置文件已创建

检查以下文件是否存在：
- ✅ `render.yaml` - Render 配置文件
- ✅ `Procfile` - 启动命令配置
- ✅ `.env.example` - 环境变量示例
- ✅ `.gitignore` - Git 忽略文件

### 1.2 提交并推送到 GitHub

```bash
# 查看更改
git status

# 添加所有文件
git add .

# 提交更改
git commit -m "Configure for Render deployment"

# 推送到 GitHub（如果还没有）
# 首次推送需要创建仓库
# 1. 在 GitHub 创建新仓库：work-hours-tracker
# 2. 执行以下命令：

git remote add origin https://github.com/你的用户名/work-hours-tracker.git
git branch -M main
git push -u origin main

# 如果已有仓库，直接推送
git push
```

---

## 步骤 2：在 Render 创建账号

### 2.1 访问 Render
打开浏览器访问：https://render.com

### 2.2 注册/登录
1. 点击右上角 "Get Started"
2. 选择 "Sign up with GitHub"
3. 授权 Render 访问你的 GitHub

---

## 步骤 3：部署后端 API

### 3.1 创建 Web Service

1. 在 Render Dashboard 点击 "New +"
2. 选择 "Web Service"
3. 找到你的 `work-hours-tracker` 仓库
4. 点击 "Connect"

### 3.2 配置服务

**Basic Settings:**
- **Name**: `work-hours-api` (或你喜欢的名称)
- **Region**: `Oregon (US West)` (免费套餐可选)
- **Branch**: `main`
- **Root Directory**: 留空
- **Runtime**: `Node`

**Build & Deploy:**
- **Build Command**: `npm run render-build`
- **Start Command**: `npm start`

**Plan:**
- 选择 **Free** 套餐

### 3.3 配置环境变量

在 "Environment" 部分，添加以下变量：

| Key | Value | 说明 |
|-----|-------|------|
| `NODE_ENV` | `production` | 生产环境标识 |
| `PORT` | `3000` | 端口号（可选，Render会自动设置） |
| `JWT_SECRET` | 点击"Generate"生成 | JWT密钥 |

> 💡 提示：`JWT_SECRET` 点击输入框右边的 "Generate" 按钮自动生成安全的随机字符串

### 3.4 添加持久化存储（重要！）

1. 滚动到 "Disk" 部分
2. 点击 "Add Disk"
3. 配置：
   - **Name**: `sqlite-data`
   - **Mount Path**: `/opt/render/project/src/server/data`
   - **Size**: `1 GB`
4. 点击 "Save"

### 3.5 开始部署

1. 滚动到页面底部
2. 点击 "Create Web Service"
3. 等待部署完成（约3-5分钟）

### 3.6 验证部署

部署完成后，会显示你的 API 地址，类似：
```
https://work-hours-api.onrender.com
```

测试健康检查：
```bash
curl https://work-hours-api.onrender.com/api/health
```

应该返回：
```json
{"status":"ok","timestamp":"2026-04-29T..."}
```

---

## 步骤 4：访问应用

### 4.1 获取访问地址

你的应用地址就是：
```
https://work-hours-api.onrender.com
```

### 4.2 首次访问

1. 在浏览器打开上面的地址
2. 如果服务休眠，等待10-30秒唤醒
3. 看到登录页面表示部署成功！

### 4.3 注册账户

1. 点击"注册"
2. 输入用户名、姓名、密码
3. 开始使用！

---

## 步骤 5：配置自定义域名（可选）

### 5.1 在 Render 添加域名

1. 进入你的服务设置
2. 找到 "Custom Domain" 部分
3. 点击 "Add Custom Domain"
4. 输入你的域名（如：workhours.yourdomain.com）

### 5.2 配置 DNS

在你的域名提供商添加 CNAME 记录：
```
Type: CNAME
Name: workhours (或你的子域名)
Value: work-hours-api.onrender.com
```

### 5.3 启用 HTTPS

Render 会自动为自定义域名提供免费 SSL 证书（Let's Encrypt）

---

## 📱 移动端访问

部署完成后，你可以：

1. **在手机浏览器访问你的应用**
2. **添加到主屏幕：**
   - iOS: Safari → 分享 → 添加到主屏幕
   - Android: Chrome → 菜单 → 添加到主屏幕

---

## 🔧 部署后管理

### 查看日志

1. 进入 Render Dashboard
2. 选择你的服务
3. 点击 "Logs" 标签
4. 实时查看应用日志

### 手动重启

如果需要重启服务：
1. 进入服务详情
2. 点击右上角 "Manual Deploy"
3. 选择 "Clear build cache & deploy"

### 环境变量修改

1. 进入服务设置
2. 找到 "Environment" 部分
3. 修改变量后点击 "Save Changes"
4. 服务会自动重启

### 数据备份

1. 在 Render Dashboard 进入你的服务
2. 找到 "Disks" 部分
3. 点击 "Create Snapshot" 创建备份

---

## 🔄 自动部署

配置完成后，每次你推送代码到 GitHub：

```bash
git add .
git commit -m "Update features"
git push
```

Render 会自动：
1. 检测到代码更新
2. 拉取最新代码
3. 重新构建
4. 自动部署

---

## ⚠️ 常见问题

### 1. 服务显示 "Deploy failed"

**解决方法：**
- 检查日志查看错误信息
- 确认 `render.yaml` 配置正确
- 确认所有依赖已安装

### 2. 数据库文件丢失

**原因：** 没有配置 Persistent Disk

**解决方法：**
- 按步骤 3.4 添加持久化存储
- 重新部署服务

### 3. 应用打开很慢

**原因：** 免费套餐15分钟无活动后休眠

**解决方法：**
- 首次访问等待10-30秒唤醒
- 或升级到付费套餐（$7/月）

### 4. API 调用失败

**检查项：**
- 确认 API 地址正确
- 检查 CORS 配置
- 查看浏览器控制台错误
- 查看 Render 日志

### 5. 环境变量未生效

**解决方法：**
- 确认在 Render 设置中已添加
- 修改后需要重启服务
- 检查变量名称是否正确

---

## 📊 监控和维护

### 服务健康检查

Render 会自动监控 `/api/health` 端点

### 查看使用统计

在 Dashboard 可以看到：
- 请求次数
- 响应时间
- 错误率
- 带宽使用

### 设置告警（付费功能）

升级到付费套餐后可以设置：
- 服务宕机告警
- 性能告警
- 邮件/Slack 通知

---

## 💰 成本说明

### 免费套餐包含：
- ✅ 750小时/月（足够24/7运行）
- ✅ 1GB 持久化存储
- ✅ 100GB 带宽/月
- ✅ 自动 HTTPS
- ✅ 全球 CDN

### 使用限制：
- ⚠️ 15分钟无活动后休眠
- ⚠️ CPU 和内存共享
- ⚠️ 不支持自定义构建时间

### 升级到付费（可选）：
- **Starter Plan**: $7/月
  - 不休眠
  - 更多资源
  - 更快速度

---

## 🎉 部署完成！

恭喜！你的工时记录系统已经成功部署到云端！

### 下一步：

1. ✅ 分享应用地址给团队成员
2. ✅ 添加到手机主屏幕
3. ✅ 开始记录工时
4. ✅ 定期备份数据

### 需要帮助？

- 📖 查看 Render 文档：https://render.com/docs
- 💬 Render 社区：https://community.render.com
- 🐛 提交 Issue 到你的 GitHub 仓库

---

**祝使用愉快！** 🚀
