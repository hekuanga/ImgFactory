# 修复404问题的脚本

Write-Host "=== 修复Next.js 404问题 ===" -ForegroundColor Cyan

# 1. 停止所有Node进程
Write-Host "`n1. 停止现有的Node进程..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. 清理构建缓存
Write-Host "2. 清理构建缓存..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "   ✓ 已清理 .next 目录" -ForegroundColor Green
} else {
    Write-Host "   ✓ .next 目录不存在" -ForegroundColor Green
}

# 3. 检查端口占用
Write-Host "`n3. 检查端口3000占用情况..." -ForegroundColor Yellow
$port3000 = netstat -ano | findstr :3000
if ($port3000) {
    Write-Host "   警告: 端口3000仍被占用" -ForegroundColor Red
    Write-Host "   请手动关闭占用端口的进程" -ForegroundColor Red
} else {
    Write-Host "   ✓ 端口3000可用" -ForegroundColor Green
}

# 4. 检查关键文件
Write-Host "`n4. 检查关键文件..." -ForegroundColor Yellow
$files = @(
    "pages/index.tsx",
    "pages/_app.tsx",
    "pages/_document.tsx",
    "next.config.js",
    "package.json"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file 存在" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file 不存在" -ForegroundColor Red
    }
}

# 5. 检查依赖
Write-Host "`n5. 检查node_modules..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    Write-Host "   ✓ node_modules 存在" -ForegroundColor Green
} else {
    Write-Host "   ✗ node_modules 不存在，需要运行 npm install" -ForegroundColor Red
}

# 6. 启动开发服务器
Write-Host "`n6. 启动开发服务器..." -ForegroundColor Yellow
Write-Host "   请在新终端窗口运行: npm run dev" -ForegroundColor Cyan
Write-Host "   然后访问: http://localhost:3000" -ForegroundColor Cyan

Write-Host "`n=== 完成 ===" -ForegroundColor Green

