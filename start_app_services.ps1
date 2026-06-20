Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   HandyServe Combined Startup Manager       " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Start backend services
Write-Host "Starting Spring Boot microservices..." -ForegroundColor Green
$backendDir = Resolve-Path "backend-java"
Push-Location $backendDir
# Run start-services.ps1 which stops existing ones and spawns them
powershell -ExecutionPolicy Bypass -File .\start-services.ps1
Pop-Location

# Wait for 5 seconds to let API gateway initialize
Start-Sleep -Seconds 5

# 2. Start frontend
Write-Host "Starting React Vite frontend..." -ForegroundColor Green
$frontendDir = Resolve-Path "handyservy_pro"
Push-Location $frontendDir
# Start Vite in background and redirect output to logs
$viteLog = "$PSScriptRoot/vite_stdout.log"
$viteErr = "$PSScriptRoot/vite_stderr.log"
Start-Process -NoNewWindow -FilePath "npm.cmd" -ArgumentList "run", "dev" -WorkingDirectory $frontendDir -RedirectStandardOutput $viteLog -RedirectStandardError $viteErr
Pop-Location

Write-Host "All services started! Keeping the task alive..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to terminate."

# Loop forever to keep the processes alive
while ($true) {
    Start-Sleep -Seconds 10
}
