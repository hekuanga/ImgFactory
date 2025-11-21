#!/usr/bin/env pwsh

# SSH密钥配置脚本 - 用于设置免密码登录
# 使用方法: .\setup_ssh_key.ps1

# 配置信息
$SERVER_IP = "49.232.38.171"
$SERVER_USER = "root"
$SSH_KEY_NAME = "restorephotos_deploy_key"

# 颜色定义
function Write-Color([string]$text, [string]$color) {
    $previousColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $color
    Write-Host $text
    $Host.UI.RawUI.ForegroundColor = $previousColor
}

Write-Color "开始配置SSH免密码登录..." "Green"

# 检查SSH客户端是否可用
function Check-SSH {
    Write-Color "检查SSH客户端..." "Yellow"
    try {
        Get-Command ssh -ErrorAction Stop | Out-Null
        Write-Color "SSH客户端可用" "Green"
        return $true
    } catch {
        Write-Color "错误: 未找到SSH客户端，请安装OpenSSH客户端" "Red"
        Write-Color "Windows 10/11可以在'设置->应用->可选功能'中安装OpenSSH客户端" "Yellow"
        return $false
    }
}

# 生成SSH密钥对
function Generate-SSHKey {
    $keyPath = "$env:USERPROFILE\.ssh\$SSH_KEY_NAME"
    
    # 检查密钥是否已存在
    if (Test-Path "$keyPath") {
        Write-Color "SSH密钥已存在: $keyPath" "Yellow"
        $response = Read-Host "是否覆盖现有密钥？(y/n)"
        if ($response -ne 'y') {
            Write-Color "使用现有密钥..." "Green"
            return $keyPath
        }
    }
    
    # 生成新密钥
    Write-Color "生成SSH密钥对..." "Yellow"
    try {
        # 创建.ssh目录（如果不存在）
        if (-not (Test-Path "$env:USERPROFILE\.ssh")) {
            New-Item -ItemType Directory -Path "$env:USERPROFILE\.ssh" -Force | Out-Null
        }
        
        # 生成密钥对
        ssh-keygen -t ed25519 -C "restorephotos_deployment" -f "$keyPath" -N "" -q
        
        if ($LASTEXITCODE -eq 0) {
            Write-Color "SSH密钥生成成功: $keyPath" "Green"
            return $keyPath
        } else {
            Write-Color "SSH密钥生成失败" "Red"
            exit 1
        }
    } catch {
        Write-Color "生成SSH密钥时出错: $_" "Red"
        exit 1
    }
}

# 将公钥复制到服务器
function Copy-SSHKeyToServer {
    param(
        [string]$keyPath
    )
    
    $pubKeyPath = "$keyPath.pub"
    
    Write-Color "将SSH公钥复制到服务器 $SERVER_IP..." "Yellow"
    try {
        # 复制公钥到服务器并添加到authorized_keys
        Get-Content "$pubKeyPath" | ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh'
        
        if ($LASTEXITCODE -eq 0) {
            Write-Color "SSH公钥已成功复制到服务器" "Green"
            return $true
        } else {
            Write-Color "复制SSH公钥失败" "Red"
            return $false
        }
    } catch {
        Write-Color "复制SSH公钥时出错: $_" "Red"
        return $false
    }
}

# 测试SSH免密码登录
function Test-SSHLogin {
    Write-Color "测试SSH免密码登录..." "Yellow"
    try {
        # 使用密钥尝试连接
        ssh -i "$env:USERPROFILE\.ssh\$SSH_KEY_NAME" -o StrictHostKeyChecking=no -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} "echo 'SSH连接成功'"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Color "SSH免密码登录测试成功！" "Green"
            return $true
        } else {
            Write-Color "SSH免密码登录测试失败" "Red"
            return $false
        }
    } catch {
        Write-Color "SSH连接测试时出错: $_" "Red"
        return $false
    }
}

# 创建SSH配置文件，简化连接
function Create-SSHConfig {
    $configPath = "$env:USERPROFILE\.ssh\config"
    
    Write-Color "创建SSH配置文件，简化后续连接..." "Yellow"
    
    # 检查配置文件是否存在
    if (Test-Path $configPath) {
        # 检查是否已存在该主机的配置
        $existingConfig = Get-Content $configPath -ErrorAction SilentlyContinue
        if ($existingConfig -match "Host\s+restorephotos-server") {
            Write-Color "已存在restorephotos-server的SSH配置" "Yellow"
            return
        }
    }
    
    # 创建或追加配置
    $configContent = @"

# RestorePhotos部署服务器配置
Host restorephotos-server
    HostName $SERVER_IP
    User $SERVER_USER
    IdentityFile ~/.ssh/$SSH_KEY_NAME
    StrictHostKeyChecking no
    ServerAliveInterval 60
"@
    
    Add-Content -Path $configPath -Value $configContent -ErrorAction SilentlyContinue
    
    if ($LASTEXITCODE -eq 0) {
        Write-Color "SSH配置已添加，现在可以使用 'ssh restorephotos-server' 直接连接" "Green"
    } else {
        Write-Color "无法写入SSH配置文件，可能需要管理员权限" "Yellow"
    }
}

# 主函数
function Main {
    # 检查SSH客户端
    if (-not (Check-SSH)) {
        exit 1
    }
    
    # 生成SSH密钥
    $keyPath = Generate-SSHKey
    
    # 复制公钥到服务器
    if (-not (Copy-SSHKeyToServer -keyPath $keyPath)) {
        exit 1
    }
    
    # 测试SSH登录
    $loginSuccessful = Test-SSHLogin
    
    # 创建SSH配置
    Create-SSHConfig
    
    # 输出总结信息
    Write-Color "=====================================" "Green"
    if ($loginSuccessful) {
        Write-Color "SSH免密码登录配置成功!" "Green"
    } else {
        Write-Color "SSH免密码登录配置已完成，但测试失败" "Yellow"
        Write-Color "请手动验证配置是否正确" "Yellow"
    }
    Write-Color "SSH密钥路径: $keyPath" "Green"
    Write-Color "使用方法: ssh restorephotos-server" "Green"
    Write-Color "或使用部署脚本: .\auto_deploy.ps1" "Green"
    Write-Color "=====================================" "Green"
}

# 执行主函数
Main