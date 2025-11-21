$SERVER_IP = "49.232.38.171"
$SERVER_USER = "root"
$SERVER_DIR = "/root/restorephotos"

Write-Host "Starting deployment to $SERVER_IP..."

# Check files
Write-Host "Checking necessary files..." -ForegroundColor Yellow
$files = @("Dockerfile", "docker-compose.yml", ".env", "init-db\01-init-db.sql")
foreach ($file in $files) {
    if (-not (Test-Path $file)) {
        Write-Host "ERROR: Missing $file" -ForegroundColor Red
        exit 1
    }
}
Write-Host "All files OK" -ForegroundColor Green

# Create directory
Write-Host "Creating server directory..." -ForegroundColor Yellow
& ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${SERVER_DIR}/init-db"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create directory" -ForegroundColor Red
    exit 1
}
Write-Host "Directory created" -ForegroundColor Green

# Transfer files
Write-Host "Transferring files..." -ForegroundColor Yellow
& scp Dockerfile docker-compose.yml .env ${SERVER_USER}@${SERVER_IP}:${SERVER_DIR}/
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to transfer main files" -ForegroundColor Red
    exit 1
}

& scp init-db\01-init-db.sql ${SERVER_USER}@${SERVER_IP}:${SERVER_DIR}/init-db/
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to transfer SQL file" -ForegroundColor Red
    exit 1
}
Write-Host "Files transferred" -ForegroundColor Green

# Deploy
Write-Host "Deploying application..." -ForegroundColor Yellow
& ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_DIR} && docker-compose down -v && docker-compose up -d --build"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Application: http://$SERVER_IP:3001" -ForegroundColor Green