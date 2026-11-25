@echo off
echo ============================================================
echo   AURA AI Enterprise Platform - Launch Script
echo ============================================================
echo.

echo [1/2] Starting FastAPI backend on port 8001...
start "AURA Backend" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe run.py"

timeout /t 2 /nobreak > nul

echo [2/2] Starting React frontend on port 5173...
start "AURA Frontend" cmd /k "cd /d %~dp0frontend && npx vite"

timeout /t 3 /nobreak > nul

echo.
echo ============================================================
echo   AURA AI is now running!
echo ============================================================
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:   http://127.0.0.1:8001
echo   API Docs:  http://127.0.0.1:8001/docs
echo.
echo   Press any key to open the app in your browser...
pause > nul
start "" "http://localhost:5173"
