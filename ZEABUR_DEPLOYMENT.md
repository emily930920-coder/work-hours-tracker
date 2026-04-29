# Zeabur 部署指南（国内优化）

## 🚀 5分钟完成部署

### 步骤 1：注册 Zeabur

访问：https://zeabur.com

1. 点击右上角 **"登录"**
2. 选择 **"使用 GitHub 登录"**
3. 授权 Zeabur 访问

### 步骤 2：创建项目

1. 点击 **"创建项目"** 或 "Create Project"
2. 选择 **"从 GitHub 导入"**
3. 选择仓库：`emily930920-coder/work-hours-tracker`
4. 点击确认

### 步骤 3：配置环境变量

Zeabur 会自动检测 Node.js 项目

1. 在项目设置中找到 **"环境变量"**
2. 添加以下变量：

```env
JWT_SECRET=你的随机密钥
NODE_ENV=production
```

**生成 JWT_SECRET：**
```bash
# 在终端运行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步骤 4：添加持久化存储

1. 在项目中点击 **"添加服务"**
2. 选择 **"Volume"**（存储卷）
3. 配置：
   - **挂载路径**：`/app/server/data`
   - **大小**：1 GB

### 步骤 5：部署

1. 点击 **"部署"** 按钮
2. 等待 2-3 分钟
3. 获得访问地址

---

## 🌐 访问应用

部署完成后，获得类似：
```
https://your-project.zeabur.app
```

### 首次访问
1. 打开地址
2. 注册账户
3. 开始使用

---

## 🔄 自动更新

每次推送代码到 GitHub：
```bash
git add .
git commit -m "Update"
git push
```

Zeabur 会自动重新部署！

---

## 💡 优势

- ✅ 国内访问快（香港节点）
- ✅ 中文界面
- ✅ 支持 SQLite
- ✅ 无需修改代码
- ✅ 完全免费

---

## 🆘 常见问题

### 1. 免费额度够用吗？
对于个人工时记录完全够用

### 2. 数据会丢失吗？
不会，添加存储卷后数据持久化

### 3. 访问速度如何？
使用香港节点，国内访问很快

---

**立即开始：** https://zeabur.com
