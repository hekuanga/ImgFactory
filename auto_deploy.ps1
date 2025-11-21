#!/usr/bin/env pwsh

# 鑷姩閮ㄧ讲鑴氭湰 - RestorePhotos 椤圭洰锛圵indows PowerShell鐗堟湰锛?# 浣跨敤鏂规硶: .\auto_deploy.ps1

# 閰嶇疆淇℃伅
$SERVER_IP = "49.232.38.171"
$SERVER_USER = "root"
$SERVER_DIR = "/root/restorephotos"
$SSH_ALIAS = "restorephotos-server"  # SSH閰嶇疆鍒悕锛岄€氳繃setup_ssh_key.ps1璁剧疆

# 棰滆壊瀹氫箟
function Write-Color([string]$text, [string]$color) {
    $previousColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $color
    Write-Host $text
    $Host.UI.RawUI.ForegroundColor = $previousColor
}

Write-Color "寮€濮嬮儴缃?RestorePhotos 椤圭洰..." "Green"

# 妫€鏌ュ繀瑕佹枃浠舵槸鍚﹀瓨鍦?function Check-Files {
    Write-Color "妫€鏌ュ繀瑕佹枃浠?.." "Yellow"
    $missing = $false
    
    $filesToCheck = @(
        "Dockerfile",
        "docker-compose.yml",
        ".env",
        "init-db\01-init-db.sql"
    )
    
    foreach ($file in $filesToCheck) {
        if (-not (Test-Path $file)) {
            Write-Color "閿欒: 缂哄皯鏂囦欢 $file" "Red"
            $missing = $true
        }
    }
    
    if ($missing) {
        Write-Color "璇风‘淇濇墍鏈夊繀瑕佹枃浠堕兘瀛樺湪鍚庡啀灏濊瘯閮ㄧ讲" "Red"
        exit 1
    }
    
    Write-Color "鎵€鏈夊繀瑕佹枃浠舵鏌ラ€氳繃" "Green"
}

# 浼犺緭鏂囦欢鍒版湇鍔″櫒
function Transfer-Files {
    Write-Color "姝ｅ湪浼犺緭鏂囦欢鍒版湇鍔″櫒 $SERVER_IP..." "Yellow"
    
    # 鍒涘缓鐩綍锛堝鏋滀笉瀛樺湪锛?    # 灏濊瘯浣跨敤SSH鍒悕杩炴帴锛屽け璐ユ椂鍥為€€鍒扮洿鎺P杩炴帴
    try {
        ssh ${SSH_ALIAS} "mkdir -p ${SERVER_DIR}/init-db"
    } catch {
        Write-Color "浣跨敤SSH鍒悕澶辫触锛屽皾璇曠洿鎺ヨ繛鎺?.." "Yellow"
        ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "mkdir -p ${SERVER_DIR}/init-db"
    }
    
    # 浼犺緭鍏抽敭鏂囦欢
    # 灏濊瘯浣跨敤SSH鍒悕浼犺緭锛屽け璐ユ椂鍥為€€鍒扮洿鎺P杩炴帴
    try {
        scp Dockerfile docker-compose.yml ${SSH_ALIAS}:${SERVER_DIR}/
        scp .env ${SSH_ALIAS}:${SERVER_DIR}/
        scp init-db\01-init-db.sql ${SSH_ALIAS}:${SERVER_DIR}/init-db/
    } catch {
        Write-Color "浣跨敤SSH鍒悕浼犺緭澶辫触锛屽皾璇曠洿鎺ヨ繛鎺?.." "Yellow"
        scp -o StrictHostKeyChecking=no Dockerfile docker-compose.yml ${SERVER_USER}@${SERVER_IP}:${SERVER_DIR}/
        scp -o StrictHostKeyChecking=no .env ${SERVER_USER}@${SERVER_IP}:${SERVER_DIR}/
        scp -o StrictHostKeyChecking=no init-db\01-init-db.sql ${SERVER_USER}@${SERVER_IP}:${SERVER_DIR}/init-db/
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Color "鏂囦欢浼犺緭鎴愬姛" "Green"
    } else {
        Write-Color "鏂囦欢浼犺緭澶辫触" "Red"
        exit 1
    }
}

# 鏋勫缓鍜屽惎鍔ㄦ湇鍔?function Build-And-Start {
    Write-Color "姝ｅ湪鏋勫缓鍜屽惎鍔ㄦ湇鍔?.." "Yellow"
    
    # 灏濊瘯浣跨敤SSH鍒悕杩炴帴锛屽け璐ユ椂鍥為€€鍒扮洿鎺P杩炴帴
    try {
        ssh ${SSH_ALIAS} "cd ${SERVER_DIR} `` `&& docker-compose down -v `` `&& docker-compose up -d --build"
    } catch {
        Write-Color "浣跨敤SSH鍒悕澶辫触锛屽皾璇曠洿鎺ヨ繛鎺?.." "Yellow"
        ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_DIR} `` `&& docker-compose down -v `` `&& docker-compose up -d --build"
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Color "鏈嶅姟鏋勫缓鍜屽惎鍔ㄥけ璐? "Red"
        exit 1
    }
    Write-Color "鏈嶅姟鏋勫缓鍜屽惎鍔ㄥ懡浠ゆ墽琛屾垚鍔? "Green"
}

# 绛夊緟鏈嶅姟鍚姩
function Wait-ForService {
    Write-Color "绛夊緟鏈嶅姟鍚姩骞跺畬鎴愬垵濮嬪寲..." "Yellow"
    Start-Sleep -Seconds 15  # 缁欐湇鍔¤冻澶熺殑鍚姩鏃堕棿
}

# 楠岃瘉閮ㄧ讲鐘舵€?function Verify-Deployment {
    Write-Color "楠岃瘉閮ㄧ讲鐘舵€?.." "Yellow"
    
    # 妫€鏌ュ鍣ㄧ姸鎬?    Write-Color "妫€鏌ュ鍣ㄨ繍琛岀姸鎬?" "Yellow"
    try {
        ssh ${SSH_ALIAS} "cd ${SERVER_DIR}; docker-compose ps"
    } catch {
        ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_DIR}; docker-compose ps"
    }
    
    # 妫€鏌ョ鍙ｇ洃鍚儏鍐?    Write-Color "妫€鏌ョ鍙ｇ洃鍚儏鍐?" "Yellow"
    try {
        ssh ${SSH_ALIAS} "netstat -tulpn | grep -E '3001|5432'"
    } catch {
        ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "netstat -tulpn | grep -E '3001|5432'"
    }
    
    # 娴嬭瘯鏈嶅姟鍙闂€?    Write-Color "娴嬭瘯鏈嶅姟鍙闂€?" "Yellow"
    try {
        ssh ${SSH_ALIAS} "curl -s -I http://localhost:3001 | head -1"
    } catch {
        ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "curl -s -I http://localhost:3001 | head -1"
    }
    
    Write-Color "閮ㄧ讲楠岃瘉瀹屾垚" "Green"
}

# 涓诲嚱鏁?
function Main {
    Check-Files
    Transfer-Files
    Build-And-Start
    Wait-ForService
    Verify-Deployment
    
    Write-Color "=====================================" "Green"
    Write-Color "閮ㄧ讲瀹屾垚!" "Green"
    Write-Color "搴旂敤鍦板潃: http://${SERVER_IP}:3001" "Green"
    Write-Color "=====================================" "Green"
}
# 鎵ц涓诲嚱鏁?
Main