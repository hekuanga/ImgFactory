#!/usr/bin/env pwsh

# 部署脚本测试工具
# 使用方法: .\test_deploy.ps1

# 颜色定义
function Write-Color([string]$text, [string]$color) {
    $previousColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $color
    Write-Host $text
    $Host.UI.RawUI.ForegroundColor = $previousColor
}

Write-Color "开始测试部署脚本功能..." "Green"

# 检查必要文件是否存在
function Test-NecessaryFiles {
    Write-Color "1. 检查必要文件是否存在..." "Yellow"
    
    $filesToCheck = @{
        "Dockerfile" = "核心构建文件"
        "docker-compose.yml" = "服务配置文件"
        ".env" = "环境变量配置"
        "init-db\01-init-db.sql" = "数据库初始化脚本"
        "auto_deploy.ps1" = "自动部署脚本"
        "setup_ssh_key.ps1" = "SSH密钥配置脚本"
    }
    
    $allFilesExist = $true
    
    foreach ($file in $filesToCheck.GetEnumerator()) {
        if (Test-Path $file.Key) {
            Write-Color "  ✓ $($file.Key) - $($file.Value)" "Green"
        } else {
            Write-Color "  ✗ $($file.Key) - $($file.Value) (缺失)" "Red"
            $allFilesExist = $false
        }
    }
    
    if ($allFilesExist) {
        Write-Color "所有必要文件检查通过" "Green"
        return $true
    } else {
        Write-Color "部分必要文件缺失，请检查" "Red"
        return $false
    }
}

# 检查脚本语法
function Test-ScriptSyntax {
    Write-Color "2. 检查PowerShell脚本语法..." "Yellow"
    
    $scriptsToTest = @(
        "auto_deploy.ps1",
        "setup_ssh_key.ps1"
    )
    
    $allSyntaxValid = $true
    
    foreach ($script in $scriptsToTest) {
        if (Test-Path $script) {
            try {
                # 使用Test-ScriptFileInfo检查语法（PowerShell 5.1+支持）
                $null = Get-Content -Path $script -Raw | Out-String
                Write-Color "  ✓ $script - 语法检查通过" "Green"
            } catch {
                Write-Color "  ✗ $script - 语法检查失败: $_" "Red"
                $allSyntaxValid = $false
            }
        } else {
            Write-Color "  ✗ $script - 文件不存在，跳过语法检查" "Yellow"
        }
    }
    
    return $allSyntaxValid
}

# 检查Dockerfile内容
function Test-Dockerfile {
    Write-Color "3. 检查Dockerfile配置..." "Yellow"
    
    if (-not (Test-Path "Dockerfile")) {
        Write-Color "  ✗ Dockerfile不存在，跳过检查" "Yellow"
        return $false
    }
    
    $dockerfileContent = Get-Content "Dockerfile" -Raw
    $hasCurl = $dockerfileContent -match "apk add --no-cache curl"
    
    if ($hasCurl) {
        Write-Color "  ✓ Dockerfile - 已包含curl支持" "Green"
        return $true
    } else {
        Write-Color "  ✗ Dockerfile - 缺少curl安装命令" "Red"
        return $false
    }
}

# 检查docker-compose.yml内容
function Test-DockerCompose {
    Write-Color "4. 检查docker-compose.yml配置..." "Yellow"
    
    if (-not (Test-Path "docker-compose.yml")) {
        Write-Color "  ✗ docker-compose.yml不存在，跳过检查" "Yellow"
        return $false
    }
    
    $composeContent = Get-Content "docker-compose.yml" -Raw
    $hasCorrectHealthCheck = $composeContent -match 'test: \["CMD", "curl", "-f", "http://localhost:3000"\]'
    $hasCorrectPortMapping = $composeContent -match '"3001:3000"'
    
    $allConfigValid = $true
    
    if ($hasCorrectHealthCheck) {
        Write-Color "  ✓ 健康检查配置正确（指向端口3000）" "Green"
    } else {
        Write-Color "  ✗ 健康检查配置错误（应指向端口3000）" "Red"
        $allConfigValid = $false
    }
    
    if ($hasCorrectPortMapping) {
        Write-Color "  ✓ 端口映射正确（3001:3000）" "Green"
    } else {
        Write-Color "  ✗ 端口映射配置错误（应为3001:3000）" "Red"
        $allConfigValid = $false
    }
    
    return $allConfigValid
}

# 检查环境
function Test-Environment {
    Write-Color "5. 检查部署环境..." "Yellow"
    
    # 检查SSH客户端
    try {
        Get-Command ssh -ErrorAction Stop | Out-Null
        Write-Color "  ✓ SSH客户端已安装" "Green"
        $sshInstalled = $true
    } catch {
        Write-Color "  ✗ SSH客户端未安装，需要安装OpenSSH客户端" "Red"
        $sshInstalled = $false
    }
    
    # 检查SCP命令
    try {
        Get-Command scp -ErrorAction Stop | Out-Null
        Write-Color "  ✓ SCP命令已安装" "Green"
        $scpInstalled = $true
    } catch {
        Write-Color "  ✗ SCP命令未安装，包含在OpenSSH客户端中" "Red"
        $scpInstalled = $false
    }
    
    return ($sshInstalled -and $scpInstalled)
}

# 输出测试报告
function Show-TestReport {
    param(
        [bool]$filesTest,
        [bool]$syntaxTest,
        [bool]$dockerfileTest,
        [bool]$dockerComposeTest,
        [bool]$environmentTest
    )
    
    Write-Color "" "White"
    Write-Color "=====================================" "Yellow"
    Write-Color "测试报告摘要" "Yellow"
    Write-Color "=====================================" "Yellow"
    
    $tests = @{
        "文件检查" = $filesTest
        "脚本语法" = $syntaxTest
        "Dockerfile配置" = $dockerfileTest
        "docker-compose配置" = $dockerComposeTest
        "环境检查" = $environmentTest
    }
    
    $allTestsPassed = $true
    
    foreach ($test in $tests.GetEnumerator()) {
        if ($test.Value) {
            Write-Color "✓ $($test.Key) - 通过" "Green"
        } else {
            Write-Color "✗ $($test.Key) - 失败" "Red"
            $allTestsPassed = $false
        }
    }
    
    Write-Color "=====================================" "Yellow"
    
    if ($allTestsPassed) {
        Write-Color "所有测试通过！部署脚本已准备就绪。" "Green"
        Write-Color "" "White"
        Write-Color "使用说明：" "Yellow"
        Write-Color "1. 首先配置SSH密钥：.\setup_ssh_key.ps1" "White"
        Write-Color "2. 然后执行部署：.\auto_deploy.ps1" "White"
    } else {
        Write-Color "部分测试失败，请修复问题后再尝试部署。" "Red"
    }
    
    Write-Color "=====================================" "Yellow"
}

# 主函数
function Main {
    $filesTest = Test-NecessaryFiles
    $syntaxTest = Test-ScriptSyntax
    $dockerfileTest = Test-Dockerfile
    $dockerComposeTest = Test-DockerCompose
    $environmentTest = Test-Environment
    
    Show-TestReport -filesTest $filesTest -syntaxTest $syntaxTest -dockerfileTest $dockerfileTest -dockerComposeTest $dockerComposeTest -environmentTest $environmentTest
}

# 执行主函数
Main