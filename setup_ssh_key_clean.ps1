<#
.SYNOPSIS
This script sets up SSH keys for passwordless login to the restorephotos server.
.DESCRIPTION
This script generates an SSH key pair, copies the public key to the server, and tests the connection.
#>

# ---------------------- Configuration ----------------------
$SERVER_IP = "49.232.38.171"
$SERVER_USER = "root"
$SSH_KEY_NAME = "restorephotos_deploy_key"
$SSH_ALIAS = "restorephotos-server"

# ---------------------- Color Definitions ----------------------
function Write-Color {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

# ---------------------- SSH Functions ----------------------

# Check if SSH client is available
function Check-SSH {
    Write-Color "Checking SSH client installation..." "Yellow"
    try {
        $sshVersion = ssh -V 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Color "SSH client is available: $sshVersion" "Green"
            return $true
        } else {
            Write-Color "SSH client is not available" "Red"
            Write-Color "Please install OpenSSH Client for Windows" "Red"
            return $false
        }
    } catch {
        Write-Color "Error checking SSH client: $_" "Red"
        return $false
    }
}

# Generate SSH key pair
function Generate-SSHKey {
    $keyPath = "$env:USERPROFILE\.ssh\$SSH_KEY_NAME"
    $pubKeyPath = "$keyPath.pub"

    Write-Color "Generating SSH key pair..." "Yellow"
    try {
        # Create .ssh directory if it doesn't exist
        if (-not (Test-Path "$env:USERPROFILE\.ssh")) {
            New-Item -ItemType Directory -Path "$env:USERPROFILE\.ssh" -Force | Out-Null
        }

        # Generate SSH key pair with empty passphrase using echo piping
        echo "" | ssh-keygen -t ed25519 -C "restorephotos_deployment" -f "$keyPath" -q 2>&1 | Out-Null

        if ($LASTEXITCODE -eq 0) {
            Write-Color "SSH key generated successfully: $keyPath" "Green"
            return $keyPath
        } else {
            Write-Color "SSH key generation failed" "Red"
            return $null
        }
    } catch {
        Write-Color "Error generating SSH key: $_" "Red"
        return $null
    }
}

# Copy public key to server
function Copy-SSHKeyToServer {
    param([string]$keyPath)

    $pubKeyPath = "$keyPath.pub"

    Write-Color "Copying SSH public key to server $SERVER_IP..." "Yellow"
    try {
        Get-Content "$pubKeyPath" | ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh'

        if ($LASTEXITCODE -eq 0) {
            Write-Color "SSH public key copied to server successfully" "Green"
            return $true
        } else {
            Write-Color "Failed to copy SSH public key to server" "Red"
            return $false
        }
    } catch {
        Write-Color "Error copying SSH public key: $_" "Red"
        return $false
    }
}

# Test SSH login
function Test-SSHLogin {
    Write-Color "Testing SSH passwordless login..." "Yellow"
    try {
        $result = ssh -i "$env:USERPROFILE\.ssh\$SSH_KEY_NAME" -o StrictHostKeyChecking=no -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} "echo 'Success'"
        if ($LASTEXITCODE -eq 0 -and $result -eq "Success") {
            Write-Color "SSH passwordless login test passed!" "Green"
            return $true
        } else {
            Write-Color "SSH passwordless login test failed" "Red"
            return $false
        }
    } catch {
        Write-Color "Error testing SSH login: $_" "Red"
        return $false
    }
}

# Create SSH config alias
function Create-SSHConfig {
    $sshConfigPath = "$env:USERPROFILE\.ssh\config"
    $configEntry = @"
Host $SSH_ALIAS
    HostName $SERVER_IP
    User $SERVER_USER
    IdentityFile $env:USERPROFILE\.ssh\$SSH_KEY_NAME
    StrictHostKeyChecking no
"@

    Write-Color "Creating SSH config entry for $SSH_ALIAS..." "Yellow"
    try {
        # Create config file if it doesn't exist
        if (-not (Test-Path "$sshConfigPath")) {
            New-Item -ItemType File -Path "$sshConfigPath" -Force | Out-Null
        }

        # Add or update config entry
        $content = Get-Content "$sshConfigPath" -Raw
        if ($content -match "Host $SSH_ALIAS") {
            Write-Color "Updating existing SSH config entry..." "Yellow"
            $content = $content -replace "Host $SSH_ALIAS.*?(?=Host|$)", $configEntry
        } else {
            Write-Color "Adding new SSH config entry..." "Yellow"
            Add-Content "$sshConfigPath" "`n$configEntry"
        }

        Set-Content "$sshConfigPath" $content -Force
        Write-Color "SSH config entry created successfully!" "Green"
        return $true
    } catch {
        Write-Color "Error creating SSH config: $_" "Red"
        return $false
    }
}

# ---------------------- Main Script ----------------------

Write-Color "=== SSH Key Setup for restorephotos Server ===" "Cyan"
Write-Host ""

# Step 1: Check SSH client
if (-not (Check-SSH)) {
    exit 1
}

# Step 2: Generate SSH key pair
$keyPath = Generate-SSHKey
if (-not $keyPath) {
    exit 1
}

# Step 3: Copy public key to server
if (-not (Copy-SSHKeyToServer -keyPath $keyPath)) {
    exit 1
}

# Step 4: Test SSH login
if (-not (Test-SSHLogin)) {
    exit 1
}

# Step 5: Create SSH config alias
if (-not (Create-SSHConfig)) {
    exit 1
}

Write-Host ""
Write-Color "=== SSH Key Setup Complete! ===" "Green"
Write-Host ""
Write-Color "You can now connect to the server using: ssh $SSH_ALIAS" "Green"
Write-Color "Or run the deployment script: .\auto_deploy.ps1" "Green"