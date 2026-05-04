$TELEGRAM_TOKEN = "8780848675:AAGcWeIB8u7Nz5M6v16TeDE6udHPcLPqRg8"
$ENV_FILE       = "$PSScriptRoot\backend\.env"
$NGROK_API      = "http://localhost:4040/api/tunnels"
$BACKEND_PORT   = 8000
$WEBHOOK_PATH   = "/api/telegram/webhook/"
$NGROK_EXE      = "$PSScriptRoot\ngrok.exe"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan

$TELEGRAM_SECRET = ""
if (Test-Path $ENV_FILE) {
    $secretLine = Get-Content $ENV_FILE | Where-Object { $_ -match '^TELEGRAM_WEBHOOK_SECRET=' } | Select-Object -First 1
    if ($secretLine) {
        $TELEGRAM_SECRET = ($secretLine -split '=', 2)[1].Trim()
    }
}
Write-Host "  Telegram Bot Webhook Setup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Step 1: Verify ngrok
Write-Host ""
Write-Host "[1/4] Checking ngrok..." -ForegroundColor Yellow
if (Test-Path $NGROK_EXE) {
    Write-Host "  OK: ngrok found at $NGROK_EXE" -ForegroundColor Green
} else {
    Write-Host "  ERROR: ngrok not found. Run the setup again." -ForegroundColor Red
    exit 1
}

# Step 2: Verify backend
Write-Host ""
Write-Host "[2/4] Checking Django backend on port $BACKEND_PORT..." -ForegroundColor Yellow
try {
    $null = Invoke-WebRequest -Uri "http://localhost:$BACKEND_PORT/api/auth/" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  OK: Backend is reachable." -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -and $statusCode -lt 500) {
        Write-Host "  OK: Backend is reachable (HTTP $statusCode)." -ForegroundColor Green
    } else {
        Write-Host "  WARNING: Backend may not be running. Make sure fast_start.ps1 is active." -ForegroundColor Yellow
        Write-Host "  Continuing anyway..." -ForegroundColor Gray
    }
}

# Step 3: Start ngrok tunnel
Write-Host ""
Write-Host "[3/4] Starting ngrok tunnel on port $BACKEND_PORT..." -ForegroundColor Yellow

Get-Process ngrok -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

Start-Process -FilePath $NGROK_EXE -ArgumentList "http $BACKEND_PORT" -WindowStyle Minimized
Write-Host "  Waiting for tunnel to become active..." -ForegroundColor Gray
Start-Sleep -Seconds 8

$publicUrl = $null
for ($i = 0; $i -lt 12; $i++) {
    try {
        $tunnels = (Invoke-RestMethod -Uri $NGROK_API -ErrorAction Stop).tunnels
        $httpsTunnel = $tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
        if ($httpsTunnel) {
            $publicUrl = $httpsTunnel.public_url
            break
        }
    } catch {
        Write-Host "  Retrying ($($i+1)/12)..." -ForegroundColor Gray
        Start-Sleep -Seconds 3
    }
}

if (-not $publicUrl) {
    Write-Host "  ERROR: Could not get ngrok public URL." -ForegroundColor Red
    Write-Host "  Check if ngrok started by visiting http://localhost:4040" -ForegroundColor Yellow
    exit 1
}

Write-Host "  OK: Tunnel active at $publicUrl" -ForegroundColor Green

# Test webhook endpoint
Write-Host "  Testing webhook endpoint..." -ForegroundColor Yellow
try {
    $testResponse = Invoke-WebRequest -Uri "$publicUrl$WEBHOOK_PATH" -Method POST -ContentType "application/json" -Body '{}' -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "  OK: Webhook endpoint is accessible (HTTP $($testResponse.StatusCode))" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403 -or $statusCode -eq 405 -or $statusCode -eq 200) {
        Write-Host "  OK: Webhook endpoint is responding (HTTP $statusCode)" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: Webhook returned HTTP $statusCode. This might be normal." -ForegroundColor Yellow
    }
}

# Step 4: Register webhook
Write-Host ""
Write-Host "[4/4] Registering webhook with Telegram..." -ForegroundColor Yellow

$webhookUrl    = "$publicUrl$WEBHOOK_PATH"
$telegramApi   = "https://api.telegram.org/bot$TELEGRAM_TOKEN/setWebhook"
$payload = @{
    url = $webhookUrl
}
if ($TELEGRAM_SECRET) {
    $payload.secret_token = $TELEGRAM_SECRET
}

try {
    $response = Invoke-RestMethod -Uri $telegramApi -Method Post -Body $payload -ErrorAction Stop
    if ($response.ok) {
        Write-Host "  OK: Webhook registered!" -ForegroundColor Green
        Write-Host "  URL: $webhookUrl" -ForegroundColor Gray
    } else {
        Write-Host "  ERROR: $($response.description)" -ForegroundColor Red
    }
} catch {
    Write-Host "  ERROR: Failed to contact Telegram API: $_" -ForegroundColor Red
    exit 1
}

# Verify
Write-Host ""
$info = Invoke-RestMethod -Uri "https://api.telegram.org/bot$TELEGRAM_TOKEN/getWebhookInfo"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE" -ForegroundColor Green
Write-Host ""
Write-Host "  Webhook URL  : $($info.result.url)" -ForegroundColor White
Write-Host "  Pending Msgs : $($info.result.pending_update_count)" -ForegroundColor White
if ($info.result.last_error_message) {
    Write-Host "  Last Error   : $($info.result.last_error_message)" -ForegroundColor Red
} else {
    Write-Host "  Last Error   : None - all good!" -ForegroundColor Green
}
Write-Host ""
Write-Host "  Open Telegram and message @AshharExpenseBot" -ForegroundColor Cyan
Write-Host "  In the app: Settings > Integrations > Connect Telegram" -ForegroundColor Gray
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  NOTE: ngrok is running in the background (minimized)." -ForegroundColor Yellow
Write-Host "  Re-run this script whenever you restart the server." -ForegroundColor Yellow
Write-Host ""
