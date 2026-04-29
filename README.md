# 工时记录系统

一个功能完善的工时记录系统，支持多用户、离线模式、数据同步等特性。

## 功能特点

- ✅ 上下班打卡记录
- ✅ 自动计算工时
- ✅ 本月统计报表
- ✅ 历史记录查看
- ✅ 服务端数据存储（SQLite）
- ✅ WiFi/5G 局域网访问
- ✅ 离线模式支持（IndexedDB）
- ✅ 智能数据同步
- ✅ 数据导出功能（JSON格式）
- ✅ 多用户支持，数据隔离
- ✅ 本地数据自动同步到服务器
- ✅ 响应式设计，支持 iPhone、Android 和 PC 端

## 技术栈

### 后端
- Node.js + Express
- better-sqlite3（SQLite数据库）
- JWT 身份认证
- bcryptjs 密码加密
- Helmet 安全防护

### 前端
- React 18 + TypeScript
- Vite 构建工具
- React Router 路由管理
- Axios HTTP 客户端
- date-fns 日期处理
- Lucide React 图标
- PWA 支持（离线模式）
- IndexedDB 本地存储

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装步骤

1. **克隆或下载项目**

```bash
cd work-hours-tracker
```

2. **安装所有依赖**

```bash
npm run install-all
```

这个命令会同时安装后端和前端的所有依赖。

3. **配置环境变量**

复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置必要的环境变量：

```env
PORT=3000
JWT_SECRET=your-secure-secret-key-here
NODE_ENV=development
```

**重要：** 在生产环境中，请务必修改 `JWT_SECRET` 为一个安全的随机字符串！

4. **启动开发服务器**

```bash
npm run dev
```

这个命令会同时启动后端服务（端口3000）和前端开发服务器（端口5173）。

5. **访问应用**

在浏览器中打开：
- 本地访问: `http://localhost:5173`
- 局域网访问: `http://your-ip:5173`（例如：`http://192.168.1.100:5173`）

### 单独启动服务

如果需要单独启动后端或前端：

```bash
# 只启动后端
npm run server

# 只启动前端
cd client && npm run dev
```

## 生产部署

### 1. 构建前端

```bash
cd client
npm run build
```

构建产物会输出到 `client/dist` 目录。

### 2. 配置后端服务静态文件

修改 `server/index.js`，添加静态文件服务：

```javascript
const path = require('path');

// 在路由之前添加
app.use(express.static(path.join(__dirname, '../client/dist')));

// 在所有路由之后添加
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
```

### 3. 设置生产环境变量

```bash
export NODE_ENV=production
export JWT_SECRET=your-production-secret-key
export PORT=3000
```

### 4. 启动生产服务器

```bash
npm start
```

或使用 PM2 进程管理器：

```bash
npm install -g pm2
pm2 start server/index.js --name work-hours-tracker
pm2 save
pm2 startup
```

### 5. 配置反向代理（可选）

使用 Nginx 配置反向代理，支持 HTTPS：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 局域网访问配置

### 查找本机IP地址

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

### 防火墙配置

确保防火墙允许以下端口：
- 端口 3000（后端API）
- 端口 5173（开发环境前端）

**macOS 防火墙：**
系统偏好设置 → 安全性与隐私 → 防火墙 → 防火墙选项 → 添加 Node

**Windows 防火墙：**
控制面板 → Windows Defender 防火墙 → 高级设置 → 入站规则 → 新建规则

### 移动设备访问

1. 确保移动设备和电脑在同一个WiFi网络
2. 在移动设备浏览器中输入：`http://[电脑IP]:5173`
3. 首次访问建议添加到主屏幕，获得类似原生应用的体验

## 使用指南

### 注册和登录

1. 首次使用，点击"注册"创建账户
2. 输入用户名、姓名和密码（至少6个字符）
3. 注册成功后自动登录

### 打卡操作

1. **上班打卡：** 点击"上班打卡"按钮记录开始时间
2. **下班打卡：** 工作结束后点击"下班打卡"，系统自动计算工时
3. **实时显示：** 打卡后显示当前工作时长

### 查看统计

- **本月统计：** 显示当月总工时和工作天数
- **历史记录：** 查看最近的打卡记录，包括日期、上下班时间和工时

### 离线模式

系统支持离线使用：

1. **离线打卡：** 无网络时仍可正常打卡，数据保存在本地
2. **数据同步：** 恢复网络后，点击"同步"按钮上传本地数据
3. **状态指示：** 右上角显示当前在线/离线状态

### 数据导出

点击"导出"按钮，下载 JSON 格式的工时记录，可用于：
- 备份数据
- 导入其他系统
- 数据分析

## API 接口文档

### 认证接口

#### 注册用户
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "fullname": "string"
}
```

#### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

#### 获取当前用户信息
```
GET /api/auth/me
Authorization: Bearer {token}
```

### 工时记录接口

所有记录接口都需要 JWT token 认证。

#### 创建打卡记录
```
POST /api/records
Authorization: Bearer {token}
Content-Type: application/json

{
  "clock_in": "2024-01-01T09:00:00.000Z",
  "clock_out": "2024-01-01T18:00:00.000Z",
  "notes": "string"
}
```

#### 更新打卡记录
```
PUT /api/records/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "clock_out": "2024-01-01T18:00:00.000Z",
  "notes": "string"
}
```

#### 删除记录
```
DELETE /api/records/:id
Authorization: Bearer {token}
```

#### 获取记录列表
```
GET /api/records?limit=100&offset=0
Authorization: Bearer {token}
```

#### 获取月度统计
```
GET /api/records/month/:year/:month
Authorization: Bearer {token}
```

#### 同步离线记录
```
POST /api/records/sync
Authorization: Bearer {token}
Content-Type: application/json

{
  "records": [...]
}
```

#### 导出记录
```
GET /api/records/export
Authorization: Bearer {token}
```

## 数据库结构

### users 表
- `id` - 用户ID（主键）
- `username` - 用户名（唯一）
- `password` - 加密密码
- `fullname` - 姓名
- `created_at` - 创建时间

### records 表
- `id` - 记录ID（主键）
- `user_id` - 用户ID（外键）
- `clock_in` - 上班时间
- `clock_out` - 下班时间
- `work_hours` - 工时（小时）
- `notes` - 备注
- `is_synced` - 同步状态
- `created_at` - 创建时间
- `updated_at` - 更新时间

## 故障排除

### 常见问题

**Q: 无法启动服务器**
- 检查端口 3000 是否被占用
- 确认 Node.js 版本 >= 16.0.0
- 检查 `.env` 文件是否正确配置

**Q: 前端无法连接后端**
- 确认后端服务正在运行
- 检查 `vite.config.ts` 中的代理配置
- 查看浏览器控制台的错误信息

**Q: 移动设备无法访问**
- 确认设备在同一局域网
- 检查防火墙设置
- 尝试使用 `0.0.0.0` 而不是 `localhost`

**Q: 数据同步失败**
- 确认网络连接正常
- 检查 token 是否有效
- 查看服务器日志排查错误

**Q: 离线模式不工作**
- 检查浏览器是否支持 IndexedDB
- 确认 Service Worker 已注册
- 清除浏览器缓存后重试

## 项目结构

```
work-hours-tracker/
├── server/                 # 后端代码
│   ├── database/          # 数据库相关
│   │   └── db.js         # 数据库操作
│   ├── middleware/        # 中间件
│   │   └── auth.js       # 认证中间件
│   ├── routes/           # 路由
│   │   ├── auth.js       # 认证路由
│   │   └── records.js    # 记录路由
│   ├── data/             # 数据文件目录
│   │   └── work-hours.db # SQLite数据库
│   └── index.js          # 服务器入口
├── client/                # 前端代码
│   ├── src/
│   │   ├── components/   # React组件
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── services/     # 服务层
│   │   │   ├── api.ts    # API调用
│   │   │   └── storage.ts # 本地存储
│   │   ├── types.ts      # TypeScript类型
│   │   ├── App.tsx       # 应用主组件
│   │   ├── main.tsx      # 应用入口
│   │   └── index.css     # 全局样式
│   ├── vite.config.ts    # Vite配置
│   └── package.json      # 前端依赖
├── .env.example          # 环境变量示例
├── .gitignore           # Git忽略文件
├── package.json         # 后端依赖
└── README.md           # 项目文档
```

## 安全建议

1. **生产环境务必修改 JWT_SECRET**
2. **使用 HTTPS 协议**
3. **定期备份数据库文件**
4. **限制 API 访问频率**（已集成 rate-limit）
5. **定期更新依赖包**

## 开发计划

- [ ] 支持修改历史记录
- [ ] 添加数据可视化图表
- [ ] 支持多语言
- [ ] 添加通知提醒功能
- [ ] 支持导入 CSV/Excel
- [ ] 添加团队管理功能

## 许可证

ISC

## 支持

如有问题或建议，请提交 Issue。

---

**享受高效的工时管理！** ⏰
