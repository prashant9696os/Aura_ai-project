# PowerShell Launch Script for AURA AI Platform
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  AURA AI Enterprise Platform - Launch Script" -ForegroundColor Cyan
Write-Host "============================================================"

Write-Host "`n[1/2] Starting FastAPI backend on port 8001..." -ForegroundColor Yellow
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\venv\Scripts\python.exe run.py" -PassThru

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting React frontend on port 5173..." -ForegroundColor Yellow
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npx vite" -PassThru

Start-Sleep -Seconds 3

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "  AURA AI is now running!" -ForegroundColor Green
Write-Host "============================================================"
Write-Host "`n  Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:   http://127.0.0.1:8001" -ForegroundColor White
Write-Host "  API Docs:  http://127.0.0.1:8001/docs" -ForegroundColor White
Write-Host "`nOpening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"
