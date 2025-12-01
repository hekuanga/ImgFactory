# Vercel 部署后网络错误修复指南

## 问题描述

在 Vercel 部署后，登录和注册时出现 `NetworkError when attempting to fetch resource` 错误。

## 可能的原因

1. **网络超时**：Supabase 请求在 Vercel 上可能需要更长时间
2. **CORS 配置**：Supabase 重定向 URL 配置不正确
3. **环境变量**：Vercel 环境变量未正确配置
4. **网络连接问题**：客户端到 Supabase 服务器的连接不稳定

## 已实施的修复

### 1. 注册页面网络错误处理

- 添加了 30 秒超时处理
- 使用 `AbortController` 控制请求取消
- 改进了错误消息，提供更友好的提示
- 添加了响应解析错误处理

### 2. 登录页面网络错误处理

- 已有 30 秒超时处理
- 改进了网络错误捕获
- 添加了更详细的错误消息

### 3. Supabase 客户端配置

- 在客户端添加了自定义 `fetch` 函数，包含 30 秒超时
- 改进了错误处理机制
- 确保仅在客户端环境使用自定义 fetch

## 检查清单

### 1. 检查 Vercel 环境变量

确保以下环境变量已正确配置：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**检查步骤：**
1. 登录 Vercel Dashboard
2. 选择项目
3. 进入 Settings > Environment Variables
4. 确认所有变量都已设置
5. 确保选择了正确的环境（Production, Preview, Development）

### 2. 检查 Supabase 重定向 URL

在 Supabase Dashboard 中配置重定向 URL：

1. 进入 **Authentication** > **URL Configuration**
2. 设置 **Site URL**：`https://your-domain.vercel.app`
3. 在 **Redirect URLs** 中添加：
   ```
   https://your-domain.vercel.app/auth/callback
   https://your-domain.vercel.app/verify-email
   https://your-domain.vercel.app
   http://localhost:3000/auth/callback
   http://localhost:3000/verify-email
   http://localhost:3000
   ```

### 3. 检查网络连接

如果问题持续，可能是网络连接问题：

1. **检查 Supabase 服务状态**：访问 [Supabase Status](https://status.supabase.com/)
2. **检查 Vercel 部署日志**：查看是否有网络相关错误
3. **测试 Supabase 连接**：在浏览器控制台测试 Supabase 连接

### 4. 检查浏览器控制台

打开浏览器开发者工具（F12），查看：

1. **Network 标签**：检查失败的请求
2. **Console 标签**：查看错误消息
3. **Application 标签**：检查 LocalStorage 中的 Supabase session

## 常见错误和解决方案

### 错误 1: `NetworkError when attempting to fetch resource`

**可能原因：**
- Supabase URL 配置错误
- 网络超时
- CORS 问题

**解决方案：**
1. 检查 Vercel 环境变量中的 `NEXT_PUBLIC_SUPABASE_URL`
2. 确认 Supabase 项目 URL 正确
3. 检查 Supabase Dashboard 中的重定向 URL 配置

### 错误 2: `Request timeout`

**可能原因：**
- 网络连接慢
- Supabase 服务器响应慢

**解决方案：**
1. 已实现 30 秒超时，如果仍然超时，可能需要检查网络连接
2. 尝试使用不同的网络（如移动热点）
3. 检查 Supabase 服务状态

### 错误 3: `CORS error`

**可能原因：**
- Supabase 重定向 URL 未正确配置

**解决方案：**
1. 在 Supabase Dashboard 中添加正确的重定向 URL
2. 确保 Site URL 与 Vercel 部署域名匹配

## 调试步骤

### 1. 检查环境变量

在浏览器控制台运行：

```javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

### 2. 测试 Supabase 连接

在浏览器控制台运行：

```javascript
import { supabaseClient } from './lib/supabaseClient';
const { data, error } = await supabaseClient.auth.getSession();
console.log('Session:', data, 'Error:', error);
```

### 3. 检查网络请求

1. 打开浏览器开发者工具
2. 进入 Network 标签
3. 尝试登录或注册
4. 查看失败的请求，检查：
   - 请求 URL
   - 请求状态码
   - 响应内容
   - 错误消息

## 如果问题仍然存在

1. **检查 Vercel 部署日志**：
   - 登录 Vercel Dashboard
   - 选择项目
   - 查看最近的部署日志
   - 查找网络相关错误

2. **联系支持**：
   - 提供错误消息
   - 提供浏览器控制台截图
   - 提供网络请求详情
   - 提供 Vercel 部署日志

3. **临时解决方案**：
   - 尝试使用不同的网络
   - 清除浏览器缓存和 Cookie
   - 使用无痕模式测试
   - 尝试不同的浏览器

## 相关文件

- `pages/login.tsx` - 登录页面，包含网络错误处理
- `pages/register.tsx` - 注册页面，包含网络错误处理
- `lib/supabaseClient.ts` - Supabase 客户端配置，包含超时处理

## 更新日志

- **2024-12-01**: 添加注册页面超时处理和错误处理
- **2024-12-01**: 改进 Supabase 客户端配置，添加自定义 fetch 超时
- **2024-12-01**: 改进登录页面网络错误捕获

