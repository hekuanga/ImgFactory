#!/usr/bin/env pwsh

# 自动部署脚本 - RestorePhotos 项目（Windows PowerShell版本）
# 使用方法: .\auto_deploy_clean.ps1

# 配置信息
$SERVER_IP = "49.232.38.171"
$SERVER_USER = "root"
$SERVER_DIR = "/root/restorephotos"
$SSH_ALIAS = "restorephotos-server"  # SSH配置别名，通过setup_ssh_key.ps1设置

# 颜色定义
function Write-Color([string]$text, [string]$color) {
    $previousColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $color
    Write-Host $text
    $Host.UI.RawUI.ForegroundColor = $previousColor
}

Write-Color "开始部署 RestorePhotos 项目..." "Green"

# 检查必要文件是否存在
function Check-Files {
    Write-Color "检查必要文件..." "Yellow"
    $missing = $false
    
    $filesToCheck = @(
        "Dockerfile",
        "docker-compose.yml",
        ".env",
        "init-db\01-init-db.sql"
    )
    
    foreach ($file in $filesToCheck) {
        if (-not (Test-Path $file)) {
            Write-Color "错误: 缺少文件 $file" "Red"
            $missing = $true
        }
    }
    
    if ($missing) {
        Write-Color "请确保所有必要文件都存在后再尝试部署" "Red"
        exit 1
    }
    
    Write-Color "所有必要文件检查通过" "Green"
}

# 传输文件到服务器
function Transfer-Files {
    Write-Color "正在传输文件到服务器 $SERVER_IP..." "Yellow"
    
    # 创建目录（如果不存在）
    $mkdirCmd = "mkdir -p ${SERVER_DIR}/init-db"
    $sshCmd = "ssh ${SERVER_USER}@${SERVER_IP} '$mkdirCmd'"
    Invoke-Expression -Command $sshCmd
    
    if ($LASTEXITCODE -ne 0) {
        Write-Color "创建服务器目录失败" "Red"
        exit 1
    }
    
    # 传输关键文件
    $filesToTransfer = @(
        "Dockerfile",
        "docker-compose.yml",
        ".env"
    )
    
    foreach ($file in $filesToTransfer) {
        $scpCmd = "scp ${file} ${SERVER_USER}@${SERVER_IP}:${SERVER_DIR}/"
        Invoke-Expression -Command $scpCmd
        
        if ($LASTEXITCODE -ne 0) {
            Write-Color "传输文件 $file 失败" "Red"
            exit 1
        }
    }
    
    # 传输初始化SQL文件
    $scpSqlCmd = "scp init-db\01-init-db.sql ${SERVER_USER}@${SERVER_IP}:${SERVER_DIR}/init-db/"
    Invoke-Expression -Command $scpSqlCmd
    
    if ($LASTEXITCODE -ne 0) {
        Write-Color "传输初始化SQL文件失败" "Red"
        exit 1
    }
    
    Write-Color "文件传输成功" "Green"
}

# 构建和启动服务
function Build-And-Start {
    Write-Color "正在构建和启动服务..." "Yellow"
    
    $dockerCmd = "docker-compose down -v && docker-compose up -d --build"
    $sshCmd = "ssh ${SERVER_USER}@${SERVER_IP} 'cd ${SERVER_DIR} && $dockerCmd'"
    Invoke-Expression -Command $sshCmd
    
    if ($LASTEXITCODE -ne 0) {
        Write-Color "服务构建和启动失败" "Red"
        exit 1
    }
    
    Write-Color "服务构建和启动命令执行成功" "Green"
}

# 等待服务启动
function Wait-ForService {
    Write-Color "等待服务启动并完成初始化..." "Yellow"
    Start-Sleep -Seconds 15  # 给服务足够的启动时间
}

# 验证部署状态
function Verify-Deployment {
    Write-Color "验证部署状态..." "Yellow"
    
    # 检查容器状态
    Write-Color "检查容器运行状态:" "Yellow"
    $dockerPsCmd = "docker-compose ps"
    $sshCmd = "ssh ${SERVER_USER}@${SERVER_IP} 'cd ${SERVER_DIR} && $dockerPsCmd'"
    Invoke-Expression -Command $sshCmd
    
    # 检查端口监听情况
    Write-Color "检查端口监听情况:" "Yellow"
    $netstatCmd = "netstat -tulpn | grep -E '3001|5432'"
    $sshCmd = "ssh ${SERVER_USER}@${SERVER_IP} '$netstatCmd'"
    Invoke-Expression -Command $sshCmd
    
    # 测试服务可访问性
    Write-Color "测试服务可访问性:" "Yellow"
    $curlCmd = "curl -s -I http://localhost:3001 | head -1"
    $sshCmd = "ssh ${SERVER_USER}@${SERVER_IP} '$curlCmd'"
    Invoke-Expression -Command $sshCmd
    
    Write-Color "部署验证完成" "Green"
}

# 主函数
function Main {
    Check-Files
    Transfer-Files
    Build-And-Start
    Wait-ForService
    Verify-Deployment
    
    Write-Color "=====================================" "Green"
    Write-Color "部署完成!" "Green"
    Write-Color "应用地址: http://${SERVER_IP}:3001" "Green"
    Write-Color "=====================================" "Green"
}

# 执行主函数
Main