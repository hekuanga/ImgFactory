# 修复 "Price configuration not found" 错误

## 问题

前端显示 "Price configuration not found. Please contact support."

## 原因

`STRIPE_PRICE_BASIC` 环境变量可能没有被 Next.js 正确加载。

## 解决方案

### 方法 1：重启开发服务器（推荐）

环境变量更改后，需要重启 Next.js 开发服务器才能生效：

1. **停止当前服务器**：在终端中按 `Ctrl+C`
2. **重新启动**：
   ```bash
   npm run dev
   ```

### 方法 2：检查环境变量文件

确保 `.env.local` 文件（不是 `env.local`）包含：

```env
STRIPE_PRICE_BASIC=price_1SUPEqE6jQ7bHhFk5Fo2FhDL
```

**重要：**
- 文件名必须是 `.env.local`（注意前面的点）
- 文件必须在项目根目录
- 变量名必须完全匹配：`STRIPE_PRICE_BASIC`

### 方法 3：验证环境变量加载

在 `pages/api/billing/checkout.ts` 中添加调试日志：

```typescript
console.log('STRIPE_PRICE_BASIC:', process.env.STRIPE_PRICE_BASIC);
```

然后查看服务器终端输出，确认环境变量是否被正确加载。

## 当前配置

根据检查，`env.local` 文件中已包含：
```
STRIPE_PRICE_BASIC=price_1SUPEqE6jQ7bHhFk5Fo2FhDL
```

## 下一步

1. **确认文件名**：确保是 `.env.local`（不是 `env.local`）
2. **重启服务器**：停止并重新启动 `npm run dev`
3. **测试订阅**：再次尝试订阅功能

## 如果仍然失败

检查服务器终端输出，查看是否有环境变量相关的错误信息。

