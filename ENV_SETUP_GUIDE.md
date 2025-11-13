# 环境变量配置指南

## 📋 配置步骤

### 1. 创建环境变量文件

在项目根目录创建 `.env.local` 文件（如果不存在）。

**Windows PowerShell:**
```powershell
New-Item -Path .env.local -ItemType File -Force
```

**或者手动创建：**
- 在项目根目录右键 → 新建 → 文本文档
- 重命名为 `.env.local`（注意前面的点）

### 2. 配置必需的环境变量

打开 `.env.local` 文件，添加以下内容：

```env
# ============================================
# 必需的环境变量
# ============================================

# 方舟 SDK API 密钥 - 用于证件照生成
# 获取地址: https://www.volcengine.com/
ARK_API_KEY=your_ark_api_key_here

# Replicate API 密钥 - 用于照片修复和证件照备选方案
# 获取地址: https://replicate.com/account/api-tokens
REPLICATE_API_KEY=your_replicate_api_key_here

# ============================================
# 可选的环境变量
# ============================================

# Bytescale 上传 API 密钥（可选，不配置则使用免费版本）
# NEXT_PUBLIC_UPLOAD_API_KEY=your_upload_api_key_here
```

### 3. 获取 API 密钥

#### 获取 Replicate API 密钥：
1. 访问 https://replicate.com/
2. 注册/登录账号
3. 进入 https://replicate.com/account/api-tokens
4. 创建新的 API token
5. 复制 token 到 `REPLICATE_API_KEY`

#### 获取方舟 SDK API 密钥：
1. 访问 https://www.volcengine.com/
2. 注册/登录账号
3. 进入控制台，找到 API 密钥管理
4. 创建新的 API 密钥
5. 复制密钥到 `ARK_API_KEY`

#### 获取 Bytescale API 密钥（可选）：
1. 访问 https://www.bytescale.com/
2. 注册/登录账号
3. 创建 API 密钥
4. 复制密钥到 `NEXT_PUBLIC_UPLOAD_API_KEY`

### 4. 重启开发服务器

配置环境变量后，需要重启开发服务器才能生效：

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
```

## ⚠️ 注意事项

1. **不要提交 `.env.local` 到 Git**
   - 此文件包含敏感信息
   - 应该添加到 `.gitignore`

2. **环境变量格式**
   - 每行一个变量
   - 格式：`变量名=值`
   - 不要有空格（除非值本身包含空格）
   - 不要使用引号（除非值本身需要引号）

3. **变量名大小写敏感**
   - `ARK_API_KEY` 必须全大写
   - `REPLICATE_API_KEY` 必须全大写

4. **开发环境 vs 生产环境**
   - `.env.local` - 本地开发环境（不会被 Git 跟踪）
   - `.env` - 所有环境共享（如果存在）
   - `.env.production` - 生产环境（如果存在）

## 🔍 验证配置

配置完成后，可以通过以下方式验证：

1. **检查服务器日志**
   - 启动服务器后，查看终端输出
   - 如果看到 "API 密钥长度: XX"，说明配置成功

2. **测试功能**
   - 访问 http://localhost:3000/restore 测试照片修复
   - 访问 http://localhost:3000/passport-photo 测试证件照生成

3. **查看错误信息**
   - 如果 API 密钥未配置，会显示友好的错误提示
   - 如果 API 密钥无效，会显示认证失败错误

## 📝 配置示例

### 最小配置（仅必需变量）：
```env
ARK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
REPLICATE_API_KEY=r8_xxxxxxxxxxxxxxxxxxxxx
```

### 完整配置（包含可选变量）：
```env
ARK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
REPLICATE_API_KEY=r8_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_UPLOAD_API_KEY=free_xxxxxxxxxxxxxxxxxxxxx
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

## 🆘 常见问题

### Q: 配置后仍然提示 API 密钥未配置？
A: 
1. 确保文件名为 `.env.local`（注意前面的点）
2. 确保文件在项目根目录
3. 重启开发服务器
4. 检查变量名是否正确（大小写敏感）

### Q: 如何知道 API 密钥是否有效？
A: 
- 查看服务器终端日志
- 如果看到 "API 密钥长度: 0"，说明未读取到
- 如果看到认证错误（401），说明密钥无效

### Q: 可以不配置某个 API 密钥吗？
A: 
- `REPLICATE_API_KEY` - 必需（照片修复功能需要）
- `ARK_API_KEY` - 可选（如果不配置，证件照功能会使用 Replicate 作为备选）
- `NEXT_PUBLIC_UPLOAD_API_KEY` - 可选（不配置会使用免费版本）

## 📞 需要帮助？

如果遇到问题，请检查：
1. 服务器终端日志
2. 浏览器控制台错误
3. 环境变量文件格式是否正确

