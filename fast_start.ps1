# PocketFlow - Optimized Fast Start Script
# Usage:
#   .\fast_start.ps1                  - Normal start
#   .\fast_start.ps1 -SkipMigrations  - Skip DB migration check
#   .\fast_start.ps1 -NoBrowser       - Don't open browser
#   .\fast_start.ps1 -Kill            - Stop all servers and exit

param(
    [switch]$SkipMigrations,
    [switch]$NoBrowser,
    [switch]$Kill
)

# --- Configuration -----------------------------------------------------------
$ROOT           = $PSScriptRoot
$BACKEND_DIR    = "$ROOT\backend"
$FRONTEND_DIR   = "$ROOT\backend\frontend"
$VENV_PYTHON    = "$BACKEND_DIR\venv\Scripts\python.exe"
$BACKEND_URL    = "http://127.0.0.1:8000"
$FRONTEND_URL   = "http://localhost:3000"
$HEALTH_TIMEOUT = 60

# Performance environment variables
$env:PYTHONDONTWRITEBYTECODE = "1"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NODE_OPTIONS            = "--max-old-space-size=4096"

# --- Helper functions --------------------------------------------------------

function Print-Header {
    Clear-Host
    Write-Host ""
    Write-Host "  ============================================" -ForegroundColor Cyan
    Write-Host "     PocketFlow  --  Fast Start       " -ForegroundColor Cyan
    Write-Host "  ============================================" -ForegroundColor Cyan
    Write-Host ""
}

function Print-Ok   { param($msg) Write-Host "  [OK]   $msg" -ForegroundColor Green }
function Print-Warn { param($msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Print-Err  { param($msg) Write-Host "  [ERR]  $msg" -ForegroundColor Red }
function Print-Info { param($msg) Write-Host "  [ ]    $msg" -ForegroundColor DarkGray }
function Print-Step { param($msg) Write-Host "  ---    $msg" -ForegroundColor Cyan }

function Get-PidsOnPort {
    param([int]$port)
    # Use netstat for reliable PID detection - more precise regex to avoid partial port matches
    $pids = @()
    $netstatOutput = netstat -ano | Select-String ":$port\s+" | Select-String "LISTENING"
    foreach ($line in $netstatOutput) {
        $parts = ($line -split '\s+') | Where-Object { $_ -ne '' }
        if ($parts.Count -ge 5) {
            $foundPid = $parts[4].Trim()
            if ($foundPid -match '^\d+$') {
                $pids += [int]$foundPid
            }
        }
    }
    return ($pids | Select-Object -Unique)
}

function Stop-Port {
    param([int]$port)
    $pids = Get-PidsOnPort $port
    if ($pids.Count -gt 0) {
        foreach ($procId in $pids) {
            try {
                $procName = (Get-Process -Id $procId -ErrorAction SilentlyContinue).ProcessName
                taskkill /F /PID $procId 2>&1 | Out-Null
                Print-Warn "Killed $procName (PID $procId) on port $port"
                Start-Sleep -Milliseconds 800
            } catch {
                Print-Err "Could not kill process (PID $procId) on port $port -- close it manually."
            }
        }
        return $true
    }
    return $false
}

function Test-ServerUp {
    param([string]$url)
    try {
        $null = Invoke-WebRequest -Uri $url -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        return $true
    } catch {
        return ($null -ne $_.Exception.Response)
    }
}

# --- Kill mode ---------------------------------------------------------------

if ($Kill) {
    Print-Header
    Print-Step "Stopping servers..."
    $killed = $false
    if (Stop-Port 8000) { Print-Ok "Django stopped";  $killed = $true }
    if (Stop-Port 3000) { Print-Ok "Next.js stopped"; $killed = $true }
    if (-not $killed)   { Print-Info "No servers were running." }
    # Also kill any stray node.exe processes that may be ghost processes
    $nodeKilled = $false
    $nodeProcs = Get-Process -Name node -ErrorAction SilentlyContinue
    if ($nodeProcs) {
        foreach ($n in $nodeProcs) {
            try {
                taskkill /F /PID $n.Id 2>&1 | Out-Null
                Print-Warn "Killed ghost node.exe (PID $($n.Id))"
                $nodeKilled = $true
            } catch { }
        }
    }
    if ($nodeKilled) { Print-Ok "Node processes cleared" }
    Write-Host ""
    exit 0
}

# --- Resilience helper -------------------------------------------------------
function Clear-StrayProcesses {
    Print-Step "Checking for stray processes..."
    $killed = $false
    # Kill any node processes holding typical dev ports if they aren't released
    $ports = @(3000, 3001, 8000)
    foreach ($p in $ports) {
        $pids = Get-PidsOnPort $p
        if ($pids.Count -gt 0) {
            foreach ($pid in $pids) {
                try {
                    taskkill /F /PID $pid 2>&1 | Out-Null
                    $killed = $true
                } catch {}
            }
        }
    }
    if ($killed) { Print-Ok "Stray processes cleared" } else { Print-Ok "Ports are clean" }
}

# =============================================================================
Print-Header

# --- Step 0: Pre-flight checks -----------------------------------------------
Print-Step "Pre-flight checks..."

if (-not (Test-Path $VENV_PYTHON)) {
    Print-Err "Python venv not found: $VENV_PYTHON"
    Print-Info "Fix: python -m venv backend\venv"
    Print-Info "     .\backend\venv\Scripts\pip install -r backend\requirements.txt"
    exit 1
}
Print-Ok "Python venv found"

if (-not (Test-Path "$FRONTEND_DIR\node_modules")) {
    Print-Warn "node_modules missing -- running npm install (one-time setup)..."
    Push-Location $FRONTEND_DIR
    npm install --silent
    Pop-Location
    Print-Ok "npm install complete"
} else {
    Print-Ok "node_modules present"
}

# --- Step 1: Free ports ------------------------------------------------------
Write-Host ""
Clear-StrayProcesses
# Extra wait for TCP TIME_WAIT to clear
Start-Sleep -Milliseconds 800

# --- Step 2: Migrations ------------------------------------------------------
if (-not $SkipMigrations) {
    Write-Host ""
    Print-Step "Checking Django migrations..."
    & $VENV_PYTHON "$BACKEND_DIR\manage.py" migrate --check 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Print-Warn "Applying pending migrations..."
        & $VENV_PYTHON "$BACKEND_DIR\manage.py" migrate 2>&1 | ForEach-Object {
            Print-Info $_
        }
        Print-Ok "Migrations applied"
    } else {
        Print-Ok "Database is up to date"
    }
}

# --- Step 3: Launch servers (parallel) ---------------------------------------
Write-Host ""
Print-Step "Launching servers in parallel..."

# Django — use & operator so PowerShell executes the path instead of evaluating it as a string
$djangoCmd = "Set-Location '$BACKEND_DIR'; `$Host.UI.RawUI.WindowTitle = 'Django :8000'; & '$VENV_PYTHON' manage.py runserver"
Start-Process powershell -ArgumentList "-NoProfile", "-NoExit", "-Command", $djangoCmd

# Next.js
$nextCmd = "Set-Location '$FRONTEND_DIR'; `$Host.UI.RawUI.WindowTitle = 'Next.js :3000'; npm run dev"
Start-Process powershell -ArgumentList "-NoProfile", "-NoExit", "-Command", $nextCmd

Print-Ok "Both server windows launched"

# --- Step 4: Poll both servers in parallel -----------------------------------
Write-Host ""
Print-Step "Waiting for servers to be ready..."

$backendJob = Start-Job -ScriptBlock {
    param($url, $timeout)
    $n = 0
    while ($n -lt $timeout) {
        try {
            $null = Invoke-WebRequest -Uri $url -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            return $true
        } catch {
            if ($null -ne $_.Exception.Response) { return $true }
        }
        Start-Sleep -Milliseconds 700
        $n++
    }
    return $false
} -ArgumentList "$BACKEND_URL/admin/", $HEALTH_TIMEOUT

$frontendJob = Start-Job -ScriptBlock {
    param($url, $timeout)
    $n = 0
    while ($n -lt $timeout) {
        try {
            $null = Invoke-WebRequest -Uri $url -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            return $true
        } catch {
            if ($null -ne $_.Exception.Response) { return $true }
        }
        Start-Sleep -Milliseconds 700
        $n++
    }
    return $false
} -ArgumentList $FRONTEND_URL, $HEALTH_TIMEOUT

# Spinner loop while jobs run
$frames        = @('|', '/', '-', '\')
$i             = 0
$backendReady  = $false
$frontendReady = $false
$startTime     = [datetime]::Now

while ($true) {
    $sec = [int]([datetime]::Now - $startTime).TotalSeconds

    if (-not $backendReady  -and ($backendJob  | Receive-Job -Keep 2>$null)) { $backendReady  = $true }
    if (-not $frontendReady -and ($frontendJob | Receive-Job -Keep 2>$null)) { $frontendReady = $true }

    $bLabel = if ($backendReady)  { "ready" } else { "waiting" }
    $fLabel = if ($frontendReady) { "ready" } else { "waiting" }
    $frame  = $frames[$i % $frames.Length]

    Write-Host "`r  $frame  Django: $bLabel  |  Next.js: $fLabel  (${sec}s)" -NoNewline -ForegroundColor DarkGray

    if ($backendReady -and $frontendReady) { break }
    if ($sec -ge $HEALTH_TIMEOUT)          { break }

    Start-Sleep -Milliseconds 350
    $i++
}

Remove-Job -Job $backendJob, $frontendJob -Force 2>$null
Write-Host ""

# --- Step 5: Final report ----------------------------------------------------
Write-Host ""
Write-Host "  ============================================" -ForegroundColor Cyan

if ($backendReady) {
    Print-Ok "Django API   -> $BACKEND_URL"
} else {
    Print-Err "Django failed to start in ${HEALTH_TIMEOUT}s -- check its window"
}

if ($frontendReady) {
    Print-Ok "Next.js App  -> $FRONTEND_URL"
} else {
    Print-Err "Next.js failed to start in ${HEALTH_TIMEOUT}s -- check its window"
}

Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host ""
Print-Info "To stop:             .\fast_start.ps1 -Kill"
Print-Info "Skip migrations:     .\fast_start.ps1 -SkipMigrations"
Print-Info "No browser:          .\fast_start.ps1 -NoBrowser"
Write-Host ""

# --- Step 6: Open browser ----------------------------------------------------
if ($frontendReady -and -not $NoBrowser) {
    Print-Step "Opening browser..."
    Start-Process $FRONTEND_URL
}

Write-Host ""