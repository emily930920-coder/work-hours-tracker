# GitHub Pages 快速部署

## ✅ 已完成的准备工作

- ✅ Git 仓库已初始化
- ✅ 文件已提交到本地仓库
- ✅ 创建了 README.md 和部署指南

## 📋 接下来的步骤

### 步骤 1: 创建 GitHub 仓库

点击这个链接创建仓库：
🔗 https://github.com/new

填写信息：
- **Repository name**: `work-hours-tracker` (或你喜欢的名字)
- **Description**: 工时记录系统
- **Public** (必须选择公开才能使用免费的GitHub Pages)
- ⚠️ **不要**勾选 "Add a README file"
- ⚠️ **不要**勾选 "Add .gitignore"
- 点击 **Create repository**

---

### 步骤 2: 推送代码到 GitHub

创建仓库后，GitHub 会显示一个页面。

**在你的终端（Terminal）中运行以下命令：**

```bash
cd /Users/yangyang100/Desktop/AutoTest/Test

# 添加远程仓库（替换 YOUR_USERNAME 为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/work-hours-tracker.git

git remote add origin http://github.com/emily930920-coder/work-hours-tracker.git

# 推送代码
git push -u origin main
```

如果需要登录，GitHub 可能会要求你输入：
- 用户名：你的 GitHub 用户名
- 密码：使用 Personal Access Token（不是密码）
  - 获取 Token：https://github.com/settings/tokens

---

### 步骤 3: 启用 GitHub Pages

推送成功后：

1. 在 GitHub 仓库页面，点击 **Settings** ⚙️
2. 在左侧菜单向下滚动，找到 **Pages**
3. 在 **Source** 下：
   - Branch: 选择 `main`
   - Folder: 选择 `/ (root)`
4. 点击 **Save**
5. 等待 1-2 分钟（页面会自动构建）

---

### 步骤 4: 访问你的网站 🎉

部署完成后，访问：

```
https://YOUR_USERNAME.github.io/work-hours-tracker/index.html
```

或者（如果设置了默认页面）：

```
https://YOUR_USERNAME.github.io/work-hours-tracker/
```

---

## 📱 快速命令参考

```bash
# 查看当前状态
git status

# 如果有新的修改，提交并推送
git add .
git commit -m "更新内容"
git push

# 查看远程仓库
git remote -v
```

---

## ❓ 常见问题

### 1. 推送时要求输入密码
GitHub 不再支持密码登录，需要使用 Personal Access Token：
- 创建 Token: https://github.com/settings/tokens
- 权限选择: `repo` (完整仓库访问权限)
- 复制生成的 Token（只显示一次！）
- 推送时用 Token 代替密码

### 2. 网站显示 404
- 检查 GitHub Pages 是否已启用
- 确认分支选择正确（main）
- 等待几分钟让 GitHub 构建网站
- 访问完整路径: `.../work-hours-tracker/index.html`

### 3. 想更新网站内容
```bash
# 修改 index.html 后
git add index.html
git commit -m "更新内容"
git push
```
GitHub Pages 会自动更新（1-2分钟后生效）

---

## 🚀 下一步

部署成功后，你可以：
- 分享链接给同事使用
- 设置自定义域名（在 Settings > Pages）
- 继续开发新功能

需要帮助？查看详细指南：`deploy-guide.md`
