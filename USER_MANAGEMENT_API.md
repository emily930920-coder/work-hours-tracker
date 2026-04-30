# 🔐 用户管理功能 API 文档

## 新增功能

本次更新添加了三个核心用户管理功能：
1. **查看所有用户** - 查看系统中所有注册用户及其统计信息
2. **修改密码** - 用户可以修改自己的登录密码
3. **删除用户** - 用户可以删除自己的账号或管理员删除其他用户

---

## 📋 API 端点

所有端点都需要在请求头中携带 JWT token：
```
Authorization: Bearer <your-jwt-token>
```

---

### 1. 获取所有用户列表

**端点：** `GET /api/auth/users`

**描述：** 获取系统中所有用户及其统计信息

**请求示例：**
```bash
curl -X GET https://your-app.onrender.com/api/auth/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**响应示例：**
```json
{
  "users": [
    {
      "id": 1,
      "username": "yangyang100",
      "fullname": "杨洋",
      "created_at": "2026-04-30T06:00:00.000Z",
      "stats": {
        "totalRecords": 45,
        "totalHours": 360.5,
        "firstRecord": "2026-04-01T09:00:00.000Z",
        "lastRecord": "2026-04-30T09:00:00.000Z"
      }
    },
    {
      "id": 2,
      "username": "user2",
      "fullname": "用户2",
      "created_at": "2026-04-28T10:00:00.000Z",
      "stats": {
        "totalRecords": 10,
        "totalHours": 80.0,
        "firstRecord": "2026-04-28T09:00:00.000Z",
        "lastRecord": "2026-04-30T09:00:00.000Z"
      }
    }
  ],
  "total": 2
}
```

**响应字段说明：**
- `id` - 用户ID
- `username` - 用户名
- `fullname` - 姓名
- `created_at` - 注册时间
- `stats.totalRecords` - 总打卡记录数
- `stats.totalHours` - 总工时（小时）
- `stats.firstRecord` - 第一条记录时间
- `stats.lastRecord` - 最后一条记录时间

---

### 2. 修改密码

**端点：** `PUT /api/auth/change-password`

**描述：** 用户修改自己的登录密码

**请求体：**
```json
{
  "currentPassword": "旧密码",
  "newPassword": "新密码"
}
```

**请求示例：**
```bash
curl -X PUT https://your-app.onrender.com/api/auth/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpass123",
    "newPassword": "newpass456"
  }'
```

**成功响应：**
```json
{
  "message": "Password changed successfully",
  "user": {
    "id": 1,
    "username": "yangyang100",
    "fullname": "杨洋"
  }
}
```

**错误响应：**
```json
{
  "error": "Current password is incorrect"
}
```

**注意事项：**
- 新密码必须至少 6 个字符
- 必须提供正确的当前密码
- 修改成功后，原有的 JWT token 仍然有效（30天内）

---

### 3. 删除自己的账号

**端点：** `DELETE /api/auth/delete-account`

**描述：** 用户删除自己的账号（会同时删除所有工时记录）

**请求体：**
```json
{
  "password": "当前密码"
}
```

**请求示例：**
```bash
curl -X DELETE https://your-app.onrender.com/api/auth/delete-account \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "yourpassword123"
  }'
```

**成功响应：**
```json
{
  "message": "Account deleted successfully",
  "username": "yangyang100"
}
```

**错误响应：**
```json
{
  "error": "Invalid password"
}
```

**警告：**
- ⚠️ 此操作不可逆！
- ⚠️ 会删除该用户的所有工时记录
- ⚠️ 删除后需要重新注册才能使用

---

### 4. 删除其他用户（管理功能）

**端点：** `DELETE /api/auth/users/:userId`

**描述：** 删除指定的用户账号

**路径参数：**
- `userId` - 要删除的用户ID

**请求示例：**
```bash
curl -X DELETE https://your-app.onrender.com/api/auth/users/2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**成功响应：**
```json
{
  "message": "User deleted successfully",
  "deletedUser": {
    "id": 2,
    "username": "user2",
    "fullname": "用户2"
  }
}
```

**错误响应：**
```json
{
  "error": "User not found"
}
```

或

```json
{
  "error": "Use /delete-account to delete your own account"
}
```

**注意事项：**
- 不能删除自己（使用 `/delete-account` 端点）
- 删除会级联删除该用户的所有工时记录
- 目前任何登录用户都可以删除其他用户（后续可以添加管理员权限控制）

---

## 🧪 测试步骤

### 1. 获取 JWT Token

首先登录获取 token：

```bash
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "yangyang100",
    "password": "yourpassword"
  }'
```

复制响应中的 `token` 字段。

### 2. 测试查看所有用户

```bash
curl -X GET https://your-app.onrender.com/api/auth/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. 测试修改密码

```bash
curl -X PUT https://your-app.onrender.com/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123"
  }'
```

### 4. 测试删除账号

```bash
# 删除自己的账号
curl -X DELETE https://your-app.onrender.com/api/auth/delete-account \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "yourpassword"
  }'
```

---

## 🔒 安全考虑

### 当前实现
- ✅ 所有端点都需要 JWT 认证
- ✅ 修改密码和删除账号都需要验证当前密码
- ✅ 密码使用 bcrypt 加密存储
- ✅ 删除操作会级联删除相关数据

### 建议改进（可选）
1. **添加管理员角色**
   - 在 users 表添加 `role` 字段（admin/user）
   - 只有管理员可以查看所有用户
   - 只有管理员可以删除其他用户

2. **添加操作日志**
   - 记录敏感操作（删除用户、修改密码等）
   - 便于审计和追踪

3. **添加软删除**
   - 不直接删除数据，而是标记为已删除
   - 可以在一定时间内恢复

4. **添加邮箱验证**
   - 修改密码时发送验证邮件
   - 删除账号前发送确认邮件

---

## 📝 数据库更新

数据库函数已添加到 `server/database/postgres-db.js`：

```javascript
// 新增函数
getAllUsers()           // 获取所有用户
updateUserPassword()    // 更新密码
deleteUser()            // 删除用户
getUserStats()          // 获取用户统计
```

---

## 🚀 部署说明

代码已推送到 GitHub，Render 会自动检测并重新部署。

部署完成后，新的 API 端点会立即可用，无需额外配置。

---

## 💡 使用场景

### 场景 1：查看系统使用情况
管理员可以查看所有用户的工时统计，了解系统使用情况。

### 场景 2：用户自主管理
用户可以定期修改密码，提高账户安全性。

### 场景 3：账号清理
不再使用系统的用户可以自行删除账号，保护隐私。

### 场景 4：管理员维护
管理员可以清理不活跃或违规的账号。

---

## ❓ 常见问题

**Q: 删除账号后数据能恢复吗？**
A: 目前不能。建议在删除前使用导出功能备份数据。

**Q: 修改密码后需要重新登录吗？**
A: 不需要。原有的 token 在 30 天内仍然有效。

**Q: 如何限制只有管理员可以查看所有用户？**
A: 需要在数据库添加角色字段，并在路由中添加权限检查。详见"安全考虑"部分。

**Q: 能批量删除用户吗？**
A: 目前不支持。需要逐个删除。

---

**需要帮助？** 查看完整部署文档 `RENDER_DEPLOYMENT_GUIDE.md`
