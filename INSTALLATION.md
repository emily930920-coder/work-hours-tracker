# 安装指南

## 第一步：检查环境

确保已安装 Node.js 和 npm：

```bash
node --version  # 应该 >= 16.0.0
npm --version   # 应该 >= 8.0.0
```

如果没有安装，请访问 https://nodejs.org/ 下载安装。

## 第二步：安装依赖

在项目根目录执行：

```bash
npm run install-all
```

这个命令会：
1. 安装后端依赖（Express, SQLite, JWT 等）
2. 进入 client 目录安装前端依赖（React, Vite, TypeScript 等）

预计需要 2-5 分钟，取决于网速。

## 第三步：启动服务

```bash
npm run dev
```

这个命令会同时启动：
- 后端服务器：http://localhost:3000
- 前端开发服务器：http://localhost:5173

看到以下输出表示成功：

```
Server running on http://0.0.0.0:3000
Accessible from network on port 3000

VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

## 第四步：访问应用

1. **本地访问：** 打开浏览器访问 http://localhost:5173
2. **手机访问：** 使用上面显示的 Network 地址（如 http://192.168.1.100:5173）

## 第五步：注册账户

1. 点击"注册"按钮
2. 输入用户名、姓名和密码（至少6个字符）
3. 点击"注册"按钮
4. 自动登录到系统

## 开始使用

1. 点击"上班打卡"开始记录
2. 系统会实时显示工作时长
3. 工作结束后点击"下班打卡"
4. 查看本月统计和历史记录

## 常见问题

### 端口被占用

如果 3000 端口被占用，修改 `.env` 文件：

```env
PORT=3001
```

然后重启服务。

### 无法局域网访问

1. 检查防火墙设置
2. 确保设备在同一WiFi网络
3. 尝试使用 `0.0.0.0` 而不是 `localhost`

### 依赖安装失败

尝试使用国内镜像：

```bash
npm config set registry https://registry.npmmirror.com
npm run install-all
```

### 前端无法连接后端

确认：
1. 后端服务正在运行（检查终端输出）
2. 端口配置正确
3. 没有防火墙阻止

## 下一步

- 查看 [README.md](./README.md) 了解更多功能
- 查看 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 了解技术细节
- 配置生产环境部署

祝使用愉快！🎉
