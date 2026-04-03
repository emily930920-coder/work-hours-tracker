# 部署指南

这个工时记录系统是一个纯前端应用，可以部署到任何静态网站托管服务。以下是几种推荐的部署方案：

---

## 方案1：GitHub Pages（推荐 - 永久免费）

### 优点
- 完全免费
- 无需注册额外账号（如果你有GitHub账号）
- 支持自定义域名
- 自动HTTPS
- 简单易用

### 部署步骤

1. **创建GitHub仓库**
   - 访问 https://github.com/new
   - 仓库名：`work-hours-tracker`（或任意名称）
   - 设置为 Public
   - 点击 "Create repository"

2. **上传文件**
   
   方法A：使用Git命令（如果已安装Git）
   ```bash
   cd /Users/yangyang100/Desktop/AutoTest/Test
   git init
   git add index.html README.md
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/work-hours-tracker.git
   git push -u origin main
   ```

   方法B：网页上传（更简单）
   - 在仓库页面点击 "uploading an existing file"
   - 拖拽 `index.html` 上传
   - 点击 "Commit changes"

3. **启用GitHub Pages**
   - 进入仓库的 Settings
   - 点击左侧 "Pages"
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main" 和 "/ (root)"
   - 点击 Save
   - 等待1-2分钟

4. **访问你的网站**
   - 访问：`https://你的用户名.github.io/work-hours-tracker/index.html`
   - 或设置为：`https://你的用户名.github.io/work-hours-tracker/`（需要重命名index.html）

---

## 方案2：Vercel（推荐 - 最快速）

### 优点
- 部署超快（几秒钟）
- 免费额度充足
- 自动HTTPS
- 支持自定义域名
- 提供更好的访问速度

### 部署步骤

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 用GitHub账号登录（或注册）

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 如果使用Git：选择你的GitHub仓库
   - 如果不使用Git：
     - 选择 "Deploy from CLI"
     - 下载Vercel CLI: `npm install -g vercel`
     - 在项目目录运行: `vercel`
     - 按提示操作

3. **或使用拖拽部署**
   - 访问 https://vercel.com/new
   - 直接拖拽包含 index.html 的文件夹
   - 自动部署完成

4. **访问你的网站**
   - Vercel会提供一个 `.vercel.app` 域名
   - 例如：`work-hours-tracker.vercel.app`

---

## 方案3：Netlify Drop

### 优点
- 最简单（拖拽即可）
- 免费
- 自动HTTPS

### 部署步骤

1. 访问 https://app.netlify.com/drop
2. 拖拽包含 `index.html` 的文件夹到页面
3. 等待几秒钟
4. 获得一个 `.netlify.app` 域名

---

## 方案4：Cloudflare Pages

### 优点
- CDN加速，访问速度快
- 免费
- 支持自定义域名

### 部署步骤

1. 访问 https://pages.cloudflare.com
2. 用GitHub登录
3. 创建项目并连接你的仓库
4. 部署设置保持默认
5. 点击 "Save and Deploy"

---

## 方案5：腾讯云/阿里云静态网站托管

### 适用场景
- 需要国内访问速度快
- 需要备案的正式网站

### 部署步骤（腾讯云示例）

1. 登录 https://console.cloud.tencent.com/cos
2. 创建存储桶
3. 上传 index.html
4. 开启静态网站功能
5. 设置 index.html 为默认首页
6. 获取访问域名

---

## 快速开始推荐

**如果你：**
- 有GitHub账号 → 使用 **GitHub Pages**
- 想要最快速度 → 使用 **Netlify Drop**（拖拽上传）
- 需要中国访问快 → 使用 **腾讯云COS** 或 **阿里云OSS**

---

## 本地测试

如果想在本地测试，可以：

```bash
# 方法1：Python自带服务器
cd /Users/yangyang100/Desktop/AutoTest/Test
python3 -m http.server 8000

# 方法2：Node.js服务器
npx serve

# 然后访问 http://localhost:8000
```

---

## 注意事项

1. **数据存储**：数据保存在浏览器本地存储（localStorage），不会上传到服务器
2. **隐私安全**：所有数据仅在你的浏览器中，不会被第三方获取
3. **数据备份**：定期使用"导出数据"功能备份你的工时记录
4. **跨设备同步**：如需多设备使用，可以导出数据后在其他设备导入

---

## 自定义域名（可选）

所有上述服务都支持自定义域名：

1. 购买域名（如 `yourname.com`）
2. 在托管服务中添加自定义域名
3. 修改域名DNS记录指向托管服务
4. 等待DNS生效（通常几分钟到几小时）

---

需要帮助？可以查看各平台的官方文档或联系我。
