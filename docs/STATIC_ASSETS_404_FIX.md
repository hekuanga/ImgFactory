# Next.js 静态资源 404 错误修复指南

## 问题描述

页面刷新后显示空白，浏览器控制台显示静态资源（main.js, react-refresh.js, pages/app.js）404错误。

## 问题原因

`next.config.js` 中的自定义 `file-loader` webpack 配置与 Next.js 内置的静态资源处理冲突，导致：
- Next.js 无法正确生成和提供静态 chunk 文件
- 刷新页面时找不到必要的 JavaScript 文件
- 页面无法正常渲染

## 解决方案

### 1. 移除冲突的 webpack 配置

Next.js 已经内置了图片和静态资源处理，不需要自定义 `file-loader`。

**已修复：** 移除了 `next.config.js` 中的自定义 webpack 配置。

### 2. 清理构建缓存

```bash
# 删除 .next 目录
rm -rf .next

# 或者 Windows PowerShell
Remove-Item -Recurse -Force .next
```

### 3. 重新构建

```bash
npm run build
```

### 4. 重启开发服务器

```bash
npm run dev
```

## 验证修复

1. **清理浏览器缓存**
   - 按 `Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac) 强制刷新
   - 或清除浏览器缓存

2. **检查静态资源**
   - 打开浏览器开发者工具（F12）
   - 进入 Network 标签
   - 刷新页面
   - 检查 `/_next/static/chunks/` 下的文件是否正常加载（状态码 200）

3. **检查页面渲染**
   - 页面应该正常显示
   - 不应该有空白页面
   - 控制台不应该有 404 错误

## 如果问题仍然存在

### 检查清单

1. **开发服务器是否正常运行**
   ```bash
   # 检查端口 3000 是否被占用
   netstat -ano | findstr :3000
   ```

2. **.next 目录是否存在**
   ```bash
   # 检查 .next 目录
   ls .next
   ```

3. **Node.js 版本**
   ```bash
   node --version
   # 应该 >= 18.0.0
   ```

4. **依赖是否正确安装**
   ```bash
   npm install
   ```

### 完全重置

如果问题仍然存在，尝试完全重置：

```bash
# 1. 删除所有构建产物和缓存
rm -rf .next
rm -rf node_modules
rm -rf .cache

# 2. 重新安装依赖
npm install

# 3. 重新构建
npm run build

# 4. 启动开发服务器
npm run dev
```

## 技术说明

### Next.js 内置资源处理

Next.js 13+ 内置了以下功能：
- **图片优化**：使用 `next/image` 组件自动优化图片
- **静态资源**：自动处理 `public` 目录下的文件
- **代码分割**：自动生成和提供 JavaScript chunks

### 为什么自定义 file-loader 会导致问题

1. **路径冲突**：自定义 `publicPath` 可能与 Next.js 内部路径不匹配
2. **构建流程干扰**：覆盖了 Next.js 的默认资源处理逻辑
3. **开发/生产不一致**：可能导致开发环境正常但生产环境出错

### 正确的图片使用方式

使用 Next.js 内置的 `Image` 组件：

```tsx
import Image from 'next/image';

<Image
  src="/your-image.png"
  alt="Description"
  width={500}
  height={300}
/>
```

或者直接使用 `public` 目录下的文件：

```tsx
<img src="/your-image.png" alt="Description" />
```

## 相关文件

- `next.config.js` - Next.js 配置文件
- `.next/` - Next.js 构建输出目录
- `public/` - 静态资源目录

## 常见错误

### 错误1：`net::ERR_ABORTED 404`

**原因**：静态资源文件不存在或路径错误

**解决**：
- 清理 `.next` 目录并重新构建
- 检查 `next.config.js` 是否有错误的配置

### 错误2：页面空白但无错误

**原因**：JavaScript chunks 加载失败

**解决**：
- 检查浏览器控制台的 Network 标签
- 确认所有 `/_next/static/chunks/` 文件都返回 200

### 错误3：开发环境正常但生产环境404

**原因**：构建配置问题

**解决**：
- 检查 `next.config.js` 配置
- 确保生产环境构建成功
- 检查 Vercel 或其他部署平台的构建日志

