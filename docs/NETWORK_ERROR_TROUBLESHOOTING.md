# 登录注册网络错误排查指南

## 错误信息

如果看到 "NetworkError when attempting to fetch resource" 错误，请按照以下步骤排查：

## 可能的原因

### 1. Supabase 环境变量未正确配置

**检查 Vercel 环境变量：**

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 选择项目，进入 **Settings** > **Environment Variables**
3. 确认以下变量已设置：
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase 项目 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 匿名密钥

**检查本地环境变量：**

如果本地开发，检查 `.env.local` 文件：
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Supabase URL 或 Key 错误

**验证 Supabase 配置：**

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目
3. 进入 **Settings** > **API**
4. 确认：
   - **Project URL** 与 `NEXT_PUBLIC_SUPABASE_URL` 一致
   - **anon/public key** 与 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 一致

### 3. CORS 配置问题

Supabase 默认允许所有来源，但如果遇到 CORS 错误：

1. 在 Supabase Dashboard 中进入 **Settings** > **API**
2. 检查 **CORS** 设置
3. 确保你的域名在允许列表中（或使用通配符 `*`）

### 4. 网络连接问题

**检查网络：**

1. 确认能访问 Supabase Dashboard
2. 在浏览器控制台检查网络请求：
   - 打开开发者工具（F12）
   - 进入 **Network** 标签
   - 尝试登录/注册
   - 查看失败的请求详情

### 5. 浏览器安全策略

某些浏览器扩展或安全策略可能阻止请求：

1. 尝试禁用浏览器扩展
2. 尝试使用隐私模式/无痕模式
3. 检查浏览器控制台是否有其他错误

## 调试步骤

### 步骤 1: 检查浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 进入 **Console** 标签
3. 尝试登录/注册
4. 查看错误信息

### 步骤 2: 检查网络请求

1. 进入 **Network** 标签
2. 尝试登录/注册
3. 查找失败的请求（红色）
4. 点击查看详情：
   - **Status**: 状态码
   - **Headers**: 请求头
   - **Response**: 响应内容

### 步骤 3: 验证环境变量

在浏览器控制台运行：
```javascript
// 检查环境变量（注意：NEXT_PUBLIC_ 前缀的变量在客户端可用）
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

### 步骤 4: 测试 Supabase 连接

在浏览器控制台运行：
```javascript
// 测试 Supabase 连接
import { supabaseClient } from '../lib/supabaseClient';
const { data, error } = await supabaseClient.auth.getSession();
console.log('Session:', data);
console.log('Error:', error);
```

## 常见错误和解决方案

### 错误：`Failed to fetch`

**原因：** 网络请求失败

**解决方案：**
1. 检查 Supabase URL 是否正确
2. 检查网络连接
3. 检查防火墙设置
4. 确认 Supabase 服务正常运行

### 错误：`CORS policy`

**原因：** 跨域请求被阻止

**解决方案：**
1. 在 Supabase Dashboard 中检查 CORS 设置
2. 确保域名在允许列表中

### 错误：`Invalid API key`

**原因：** Supabase Anon Key 错误

**解决方案：**
1. 在 Supabase Dashboard 中重新获取 Anon Key
2. 更新环境变量
3. 重新部署应用

### 错误：`NetworkError when attempting to fetch resource`

**原因：** 多种可能（网络、配置、CORS等）

**解决方案：**
1. 按照上述步骤逐一排查
2. 检查浏览器控制台的详细错误信息
3. 检查 Vercel 部署日志

## 快速修复检查清单

- [ ] Vercel 环境变量已正确设置
- [ ] Supabase URL 和 Key 正确
- [ ] 网络连接正常
- [ ] 浏览器控制台没有其他错误
- [ ] Supabase 服务正常运行
- [ ] CORS 配置正确

## 联系支持

如果以上步骤都无法解决问题：

1. 收集以下信息：
   - 浏览器控制台错误信息
   - Network 标签中的失败请求详情
   - Vercel 部署日志
   - Supabase Dashboard 中的项目状态

2. 检查 Supabase 状态：
   - 访问 [Supabase Status](https://status.supabase.com)
   - 确认服务正常运行

3. 联系管理员并提供收集的信息

## 预防措施

1. **定期检查环境变量**：确保 Vercel 中的环境变量正确
2. **监控 Supabase 状态**：关注 Supabase 服务状态
3. **测试部署**：每次部署后测试登录/注册功能
4. **错误日志**：定期检查 Vercel 日志和 Supabase 日志

