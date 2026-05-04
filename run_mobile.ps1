# Run Project for Mobile/Local Network Access
# Automatically detects your PC's IP and starts servers on all interfaces.
param([switch]$Kill)

$ROOT        = $PSScriptRoot
$BACKEND_DIR = "$ROOT\backend"
$FRONTEND_DIR = "$ROOT\backend\frontend"
$VENV_PYTHON = "$BACKEND_DIR\venv\Scripts\python.exe"
$BACKEND_PORT = 8000
$FRONTEND_PORT = 3000

function Print { param($msg, $color = "White") Write-Host $msg -ForegroundColor $color }

# --- Kill mode ---------------------------------------------------------------
if ($Kill) {
    Print "--- Stopping servers ---" Cyan
    $killed = $false
    Get-NetTCPConnection -LocalPort $BACKEND_PORT -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        Print "  Killed backend (PID $($_.OwningProcess))" Green
        $killed = $true
    }
    Get-NetTCPConnection -LocalPort $FRONTEND_PORT -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        Print "  Killed frontend (PID $($_.OwningProcess))" Green
        $killed = $true
    }
    if (-not $killed) { Print "  No servers were running." DarkGray }
    Write-Host ""
    exit 0
}

# --- Step 1: Find PC IP Address ----------------------------------------------
$ipConfig = Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Wi-Fi -ErrorAction SilentlyContinue |
            Where-Object { $_.IPAddress -notlike "169.254.*" } |
            Select-Object -First 1

if (-not $ipConfig) {
    $ipConfig = Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Ethernet -ErrorAction SilentlyContinue |
                Where-Object { $_.IPAddress -notlike "169.254.*" } |
                Select-Object -First 1
}

$PC_IP = if ($ipConfig) { $ipConfig.IPAddress } else { "unknown" }

Clear-Host
Write-Host ""
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host "   Mobile / Network Access Start" -ForegroundColor Cyan
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host ""

# --- Step 2: Free ports ------------------------------------------------------
Write-Host "  --- Freeing ports $BACKEND_PORT and $FRONTEND_PORT ---" -ForegroundColor Cyan
Get-NetTCPConnection -LocalPort $BACKEND_PORT -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Get-NetTCPConnection -LocalPort $FRONTEND_PORT -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Milliseconds 500
Write-Host "  [OK] Ports cleared" -ForegroundColor Green

# --- Step 3: Check venv ------------------------------------------------------
if (-not (Test-Path $VENV_PYTHON)) {
    Write-Host "  [ERR] Python venv not found: $VENV_PYTHON" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] Python venv found" -ForegroundColor Green

# --- Step 4: Migrations ------------------------------------------------------
Write-Host "  [ ]  Checking migrations..." -ForegroundColor DarkGray
& $VENV_PYTHON "$BACKEND_DIR\manage.py" migrate --check 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [!] Applying pending migrations..." -ForegroundColor Yellow
    & $VENV_PYTHON "$BACKEND_DIR\manage.py" migrate 2>&1 | Out-Null
    Write-Host "  [OK] Migrations applied" -ForegroundColor Green
} else {
    Write-Host "  [OK] Database up to date" -ForegroundColor Green
}

# --- Step 5: Start servers ---------------------------------------------------
Write-Host ""
Write-Host "  --- Launching servers on 0.0.0.0 (network access) ---" -ForegroundColor Cyan

# Backend
$djangoCmd = "Set-Location '$BACKEND_DIR'; `$Host.UI.RawUI.WindowTitle = 'Django :$BACKEND_PORT (Network)'; & '$VENV_PYTHON' manage.py runserver 0.0.0.0:$BACKEND_PORT --noreload"
Start-Process powershell -ArgumentList "-NoExit", "-NoProfile", "-Command", $djangoCmd

# Frontend — set NEXT_PUBLIC_API_URL so it points to backend over the network
$nextCmd = "Set-Location '$FRONTEND_DIR'; `$env:NEXT_PUBLIC_API_URL='http://$PC_IP`:$BACKEND_PORT/api'; `$Host.UI.RawUI.WindowTitle = 'Next.js :$FRONTEND_PORT (Network)'; npm run dev -- -H 0.0.0.0 -p $FRONTEND_PORT"
Start-Process powershell -ArgumentList "-NoExit", "-NoProfile", "-Command", $nextCmd

Write-Host "  [OK] Both servers launched" -ForegroundColor Green

# --- Step 6: Wait for ready --------------------------------------------------
Write-Host ""
Write-Host "  --- Waiting for servers ---" -ForegroundColor Cyan

$frames = @('|', '/', '-', '\')
$i = 0
$maxWait = 45
$startTime = [datetime]::Now
$backendReady = $false
$frontendReady = $false

while ($true) {
    $sec = [int]([datetime]::Now - $startTime).TotalSeconds
    if ($sec -ge $maxWait) { break }

    if (-not $backendReady) {
        try { $null = Invoke-WebRequest -Uri "http://127.0.0.1:$BACKEND_PORT/api/auth/" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop; $backendReady = $true }
        catch { if ($null -ne $_.Exception.Response) { $backendReady = $true } }
    }
    if (-not $frontendReady) {
        try { $null = Invoke-WebRequest -Uri "http://127.0.0.1:$FRONTEND_PORT" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop; $frontendReady = $true }
        catch { if ($null -ne $_.Exception.Response) { $frontendReady = $true } }
    }

    if ($backendReady -and $frontendReady) { break }

    $frame = $frames[$i % $frames.Length]
    $bLabel = if ($backendReady) { "ready" } else { "waiting" }
    $fLabel = if ($frontendReady) { "ready" } else { "waiting" }
    Write-Host "`r  $frame  Django: $bLabel  |  Next.js: $fLabel  (${sec}s)" -NoNewline -ForegroundColor DarkGray
    Start-Sleep -Milliseconds 350
    $i++
}

Write-Host ""

# --- Step 7: Final report ----------------------------------------------------
Write-Host ""
Write-Host "  ============================================" -ForegroundColor Cyan

if ($PC_IP -ne "unknown") {
    Write-Host "  Your PC IP : $PC_IP" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Open on your phone:" -ForegroundColor Cyan
    Write-Host "    Frontend : http://$PC_IP`:$FRONTEND_PORT" -ForegroundColor White
    Write-Host "    Backend  : http://$PC_IP`:$BACKEND_PORT/api" -ForegroundColor White
} else {
    Write-Host "  [WARN] Could not detect IP. Run 'ipconfig' and use your Wi-Fi IP." -ForegroundColor Yellow
}

Write-Host ""
if ($backendReady) { Write-Host "  [OK] Django running"  -ForegroundColor Green } else { Write-Host "  [ERR] Django failed"  -ForegroundColor Red }
if ($frontendReady){ Write-Host "  [OK] Next.js running" -ForegroundColor Green } else { Write-Host "  [ERR] Next.js failed" -ForegroundColor Red }
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  [ ]  To stop:   .\run_mobile.ps1 -Kill" -ForegroundColor DarkGray
Write-Host ""
