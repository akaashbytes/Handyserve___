# HandyServe Microservices Shutdown Script (PowerShell)
# Run this from the backend-java directory to stop all microservices

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "       HandyServe Shutdown Manager           " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$ports = @(8081, 8082, 8083, 8084)
$killedCount = 0

foreach ($port in $ports) {
    Write-Host "Checking for process listening on port $port..." -ForegroundColor Gray
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        # OwningProcess can sometimes return multiple connections or processes, extract unique PIDs
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pidToKill in $pids) {
            $procName = (Get-Process -Id $pidToKill -ErrorAction SilentlyContinue).Name
            Write-Host "Stopping process $pidToKill ($procName) using port $port..." -ForegroundColor Yellow
            Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            $killedCount++
        }
    } else {
        Write-Host "No process found on port $port." -ForegroundColor Gray
    }
}

Write-Host ""
if ($killedCount -gt 0) {
    Write-Host "Stopped $killedCount service process(es)." -ForegroundColor Green
} else {
    Write-Host "No active HandyServe service processes were running." -ForegroundColor Green
}
Write-Host "=============================================" -ForegroundColor Cyan
