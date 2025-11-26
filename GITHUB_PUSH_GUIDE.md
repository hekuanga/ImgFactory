# GitHub 推送指南

## ✅ 已完成

- ✅ 代码已提交到本地仓库（commit: `1c94db7`）
- ✅ 远程仓库已配置：`https://github.com/ishekuanga/ImgFactory.git`
- ✅ 95 个文件已添加，包含所有 Supabase 和 Stripe 集成代码

## ❌ 推送失败原因

权限问题：当前 Git 配置的用户名与 GitHub 仓库所有者不匹配。

错误信息：
```
remote: Permission to ishekuanga/ImgFactory.git denied to hekuanga.
```

## 🔧 解决方案

### 方案 1：使用 Personal Access Token（推荐）

**步骤：**

1. **创建 Personal Access Token**
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token" > "Generate new token (classic)"
   - 设置名称（如：`ImgFactory Push`）
   - 选择过期时间（建议：90 天或自定义）
   - **重要：** 勾选 `repo` 权限（完整仓库访问权限）
   - 点击 "Generate token"
   - **立即复制 Token**（只显示一次！）

2. **使用 Token 推送**
   ```bash
   git push -u origin master
   ```
   - 用户名：`ishekuanga`
   - 密码：**粘贴刚才复制的 Token**（不是 GitHub 密码）

3. **（可选）保存凭据**
   - Windows 会提示保存凭据
   - 选择保存，下次推送时无需再次输入

### 方案 2：配置 SSH 密钥

**步骤：**

1. **生成 SSH 密钥**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
   - 按 Enter 使用默认路径
   - 设置密码（可选）

2. **复制公钥**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   - 复制输出的内容

3. **添加到 GitHub**
   - 访问：https://github.com/settings/ssh/new
   - Title：输入描述（如：`My Computer`）
   - Key：粘贴刚才复制的公钥
   - 点击 "Add SSH key"

4. **更改远程 URL**
   ```bash
   git remote set-url origin git@github.com:ishekuanga/ImgFactory.git
   ```

5. **推送**
   ```bash
   git push -u origin master
   ```

### 方案 3：使用 GitHub CLI

**步骤：**

1. **安装 GitHub CLI**
   ```bash
   winget install GitHub.cli
   ```
   或从 https://cli.github.com/ 下载

2. **登录**
   ```bash
   gh auth login
   ```
   - 选择 GitHub.com
   - 选择 HTTPS
   - 选择浏览器登录或输入 Token

3. **推送**
   ```bash
   git push -u origin master
   ```

## 📋 推送内容总结

本次提交包含：

- **Supabase Auth 集成**
  - 用户注册、登录、会话管理
  - 认证中间件
  - 邮箱验证流程

- **Stripe Billing 集成**
  - Checkout 订阅流程
  - Webhook 订阅状态同步
  - Customer Portal 集成
  - Basic 和 VIP 套餐支持

- **前端页面**
  - 登录/注册页面
  - 订阅管理页面
  - 套餐选择界面

- **文档**
  - 完整接入教程
  - 快速接入指南
  - 环境变量配置指南

## 🚀 推送后验证

推送成功后，访问：
- https://github.com/ishekuanga/ImgFactory

确认所有文件都已上传。

## 📝 注意事项

1. **不要提交敏感信息**
   - `.env.local` 已在 `.gitignore` 中
   - 确保没有提交 API 密钥或密码

2. **分支名称**
   - 当前分支：`master`
   - 如果 GitHub 默认分支是 `main`，可能需要：
     ```bash
     git branch -M main
     git push -u origin main
     ```

3. **首次推送**
   - 如果仓库是空的，直接推送即可
   - 如果仓库已有内容，可能需要先拉取：
     ```bash
     git pull origin master --allow-unrelated-histories
     ```

## 💡 推荐方案

**推荐使用方案 1（Personal Access Token）**，因为：
- 设置简单快速
- 不需要配置 SSH
- 可以设置过期时间
- 可以随时撤销

---

**完成推送后，您的代码将成功上传到 GitHub！** 🎉



