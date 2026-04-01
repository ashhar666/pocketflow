# Automated Setup and Run for Expense Tracker
$ROOT = $PSScriptRoot

Write-Host "--- Starting Backend Setup ---" -ForegroundColor Cyan
Set-Location "$ROOT\backend"

# Create .env if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "Creating .env from .env.example..."
    Copy-Item .env.example .env
}

# Activate virtual environment
if (-not (Test-Path venv)) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "Installing backend dependencies..."
.\venv\Scripts\pip.exe install -r requirements.txt

Write-Host "Synchronizing database schema..." -ForegroundColor Yellow
.\venv\Scripts\python.exe manage.py makemigrations
.\venv\Scripts\python.exe manage.py migrate

# Start backend server in a new window
Write-Host "Launching Django server in background..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location `"$ROOT\backend`"; .\venv\Scripts\python.exe manage.py runserver"

Write-Host "--- Starting Frontend Setup ---" -ForegroundColor Cyan
Set-Location "$ROOT\backend\frontend"

# Install dependencies
Write-Host "Installing frontend dependencies (this may take a minute)..."
npm install

# Start frontend server in a new window
Write-Host "Launching Next.js server in background..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location `"$ROOT\backend\frontend`"; npm run dev"

Write-Host "--- All set! ---" -ForegroundColor Green
Write-Host "Backend: http://127.0.0.1:8000"
Write-Host "Frontend: http://localhost:3000"

