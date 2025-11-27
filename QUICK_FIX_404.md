# 快速修复404问题

## 🚀 立即执行以下命令

### 1. 停止所有Node进程并清理缓存
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
if (Test-Path .next) { Remove-Item -Recurse -Force .next }
```

### 2. 重新启动开发服务器
```powershell
npm run dev
```

### 3. 等待服务器启动完成
看到以下消息表示启动成功：
```
✓ Ready in X seconds
○ Compiling / ...
✓ Compiled / in Xs
```

### 4. 访问正确的URL
- **首页**: http://localhost:3000
- **照片修复**: http://localhost:3000/restore  
- **证件照**: http://localhost:3000/passport-photo

## ⚠️ 常见问题

### 如果仍然404，检查：

1. **确认服务器已启动**
   - 终端应该显示 "Ready" 消息
   - 端口3000应该被监听

2. **检查访问的URL**
   - 确保是 `http://localhost:3000` 而不是 `https://`
   - 不要使用 `127.0.0.1:3000`（虽然也可以，但localhost更可靠）

3. **清除浏览器缓存**
   - 按 `Ctrl+Shift+R` 强制刷新
   - 或使用无痕模式访问

4. **检查终端错误**
   - 查看是否有编译错误
   - 查看是否有路由错误

## 🔍 诊断命令

```powershell
# 检查端口占用
netstat -ano | findstr :3000

# 检查进程
Get-Process -Name node

# 检查文件是否存在
Test-Path pages/index.tsx
Test-Path pages/_app.tsx
```

## ✅ 验证清单

- [ ] Node进程已停止
- [ ] .next目录已清理
- [ ] 开发服务器成功启动
- [ ] 访问 http://localhost:3000
- [ ] 浏览器控制台无错误
- [ ] 终端无编译错误

## 📞 如果问题仍然存在

请提供以下信息：
1. 终端完整输出（包括错误信息）
2. 浏览器控制台错误（F12查看）
3. 访问的具体URL
4. 服务器启动后的完整日志

