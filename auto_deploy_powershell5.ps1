#!/usr/bin/env powershell

# 自动部署脚本 - RestorePhotos 项目（Windows PowerShell 5兼容版本）
# 使用方法: .\auto_deploy_powershell5.ps1

# 配置信息
$SERVER_IP = "49.232.38.171"
$SERVER_USER = "root"
$SERVER_DIR = "/root/restorephotos"

# 颜色定义
function Write-Color {
    param(
        [string]$text,
        [string]$color
    )
    $previousColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $color
    Write-Host $text
    $Host.UI.RawUI.ForegroundColor = $previousColor
}

Write-Color "开始部署 RestorePhotos 项目..." "Green"

# 检查必要文件是否存在
Write-Color "检查必要文件..." "Yellow"
$filesToCheck = @("Dockerfile", "docker-compose.yml", ".env", "init-db\01-init-db.sql")
$missingFiles = @()
foreach ($file in $filesToCheck) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Color "错误: 缺少以下文件:" "Red"
    foreach ($file in $missingFiles) {
        Write-Color "  - $file" "Red"
    }
    exit 1
}
Write-Color "所有必要文件检查通过" "Green"

# 创建服务器目录
Write-Color "创建服务器目录..." "Yellow"
$mkdirCmd = "mkdir -p " + $SERVER_DIR + "/init-db"
$sshCmd = "ssh " + $SERVER_USER + "@" + $SERVER_IP + " '" + $mkdirCmd + "'"
Invoke-Expression $sshCmd
if ($LASTEXITCODE -ne 0) {
    Write-Color "创建服务器目录失败" "Red"
    exit 1
}
Write-Color "服务器目录创建成功" "Green"

# 传输文件到服务器
Write-Color "传输文件到服务器..." "Yellow"

# 传输主文件
$mainFiles = @("Dockerfile", "docker-compose.yml", ".env")
foreach ($file in $mainFiles) {
    $scpCmd = "scp " + $file + " " + $SERVER_USER + "@" + $SERVER_IP + ":" + $SERVER_DIR + "/"
    Write-Color "  传输: $file" "Yellow"
    Invoke-Expression $scpCmd
    if ($LASTEXITCODE -ne 0) {
        Write-Color "  传输失败: $file" "Red"
        exit 1
    }
    Write-Color "  传输成功: $file" "Green"
}

# 传输初始化SQL文件
$scpSqlCmd = "scp init-db\01-init-db.sql " + $SERVER_USER + "@" + $SERVER_IP + ":" + $SERVER_DIR + "/init-db/"
Write-Color "  传输: init-db\01-init-db.sql" "Yellow"
Invoke-Expression $scpSqlCmd
if ($LASTEXITCODE -ne 0) {
    Write-Color "  传输失败: init-db\01-init-db.sql" "Red"
    exit 1
}
Write-Color "  传输成功: init-db\01-init-db.sql" "Green"

Write-Color "所有文件传输完成" "Green"

# 构建和启动服务
Write-Color "构建和启动服务..." "Yellow"
$dockerCmd1 = "docker-compose down -v"
$dockerCmd2 = "docker-compose up -d --build"
$sshCmd1 = "ssh " + $SERVER_USER + "@" + $SERVER_IP + " 'cd " + $SERVER_DIR + " && " + $dockerCmd1 + "'"
$sshCmd2 = "ssh " + $SERVER_USER + "@" + $SERVER_IP + " 'cd " + $SERVER_DIR + " && " + $dockerCmd2 + "'"

# 先停止旧容器
Invoke-Expression $sshCmd1
if ($LASTEXITCODE -ne 0) {
    Write-Color "停止旧容器失败" "Red"
    exit 1
}
Write-Color "旧容器已停止" "Green"

# 构建并启动新容器
Invoke-Expression $sshCmd2
if ($LASTEXITCODE -ne 0) {
    Write-Color "构建和启动服务失败" "Red"
    exit 1
}
Write-Color "服务构建和启动成功" "Green"

# 等待服务初始化
Write-Color "等待服务初始化..." "Yellow"
Start-Sleep -Seconds 15
Write-Color "服务初始化完成" "Green"

# 验证部署
Write-Color "验证部署状态..." "Yellow"

# 检查容器状态
Write-Color "  检查容器状态:" "Yellow"
$dockerPsCmd = "docker-compose ps"
$sshCmd = "ssh " + $SERVER_USER + "@" + $SERVER_IP + " 'cd " + $SERVER_DIR + " && " + $dockerPsCmd + "'"
Invoke-Expression $sshCmd

# 检查端口
Write-Color "  检查端口监听:" "Yellow"
$netstatCmd = "netstat -tulpn | grep -E '3001|5432'"
$sshCmd = "ssh " + $SERVER_USER + "@" + $SERVER_IP + " '" + $netstatCmd + "'"
Invoke-Expression $sshCmd 2>&1 | Out-Null

# 检查服务
Write-Color "  检查服务状态:" "Yellow"
$curlCmd = "curl -s -I http://localhost:3001 | head -1"
$sshCmd = "ssh " + $SERVER_USER + "@" + $SERVER_IP + " '" + $curlCmd + "'"
Invoke-Expression $sshCmd

Write-Color "部署验证完成" "Green"

# 显示完成信息
Write-Color "=====================================" "Green"
Write-Color "部署完成!" "Green"
Write-Color "应用地址: http://"$SERVER_IP":3001" "Green"
Write-Color "=====================================" "Green"