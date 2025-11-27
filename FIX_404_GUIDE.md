# 修复404问题指南

## 问题诊断

如果访问 `http://localhost:3000` 出现404错误，请按以下步骤排查：

## 解决步骤

### 1. 停止所有Node进程

```powershell
# 停止所有Node进程
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### 2. 清理构建缓存

```powershell
# 删除.next目录
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
}
```

### 3. 检查端口占用

```powershell
# 检查端口3000是否被占用
netstat -ano | findstr :3000
```

如果端口被占用，找到进程ID并结束它：
```powershell
# 替换 <PID> 为实际的进程ID
taskkill /PID <PID> /F
```

### 4. 重新安装依赖（可选）

如果问题持续，尝试重新安装依赖：
```powershell
# 删除node_modules和package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# 重新安装
npm install
```

### 5. 重新启动开发服务器

```powershell
npm run dev
```

### 6. 访问正确的URL

确保访问的是：
- ✅ `http://localhost:3000` （首页）
- ✅ `http://localhost:3000/restore` （照片修复页面）
- ✅ `http://localhost:3000/passport-photo` （证件照页面）

## 常见问题

### 问题1: 页面显示404但服务器在运行

**原因**: 可能是路由配置问题或页面文件有问题

**解决**:
1. 检查 `pages/index.tsx` 是否存在且正确导出
2. 检查浏览器控制台是否有错误
3. 检查终端是否有编译错误

### 问题2: 端口被占用

**解决**:
```powershell
# 查找占用3000端口的进程
netstat -ano | findstr :3000

# 结束进程（替换PID）
taskkill /PID <PID> /F
```

### 问题3: 编译错误

**解决**:
1. 检查终端输出的错误信息
2. 运行 `npm run build` 查看详细错误
3. 修复所有TypeScript错误

### 问题4: 缓存问题

**解决**:
1. 清理浏览器缓存
2. 使用无痕模式访问
3. 清理.next目录后重新启动

## 验证步骤

1. ✅ 开发服务器成功启动（看到 "Ready" 消息）
2. ✅ 访问 `http://localhost:3000` 显示首页
3. ✅ 浏览器控制台无错误
4. ✅ 终端无编译错误

## 如果问题仍然存在

1. 检查 `pages/index.tsx` 文件是否正确导出
2. 检查 `pages/_app.tsx` 文件是否正确
3. 检查 `next.config.js` 配置是否正确
4. 查看终端完整错误信息
5. 检查环境变量配置（`.env.local`）

## 快速修复命令

```powershell
# 一键修复脚本
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
if (Test-Path .next) { Remove-Item -Recurse -Force .next }
npm run dev
```

