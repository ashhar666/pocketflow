@echo off
echo === Starting PocketFlow ===
echo.

:: Start Backend in new window
start "Django Backend" cmd /k "cd backend && echo === Django Backend === && python manage.py runserver"

:: Wait 2 seconds
timeout /t 2 /nobreak >nul

:: Start Frontend in new window
start "Next.js Frontend" cmd /k "cd backend\frontend && echo === Next.js Frontend === && npm run dev"

echo.
echo === Servers Starting ===
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo.
echo Wait 15 seconds for servers to fully start.
echo.
pause
