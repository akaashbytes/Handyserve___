# HandyServe Microservices Startup Script (PowerShell)
# Run this from the backend-java directory to spin up all 4 microservices

# Set console title
$Host.UI.RawUI.WindowTitle = "HandyServe Microservices Controller"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "       HandyServe Startup Manager            " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if jars exist
$jars = @{
    "auth-service"          = "auth-service/target/auth-service-1.0.0.jar"
    "communication-service" = "communication-service/target/communication-service-1.0.0.jar"
    "booking-service"       = "booking-service/target/booking-service-1.0.0.jar"
    "api-gateway"           = "api-gateway/target/api-gateway-1.0.0.jar"
}

$missingJars = @()
foreach ($service in $jars.Keys) {
    $path = $jars[$service]
    if (-not (Test-Path $path)) {
        $missingJars += $service
    }
}

if ($missingJars.Count -gt 0) {
    Write-Host "Warning: The following service JARs are missing or not built yet:" -ForegroundColor Yellow
    foreach ($m in $missingJars) {
        Write-Host " - $m ($($jars[$m]))" -ForegroundColor Yellow
    }
    Write-Host ""
    $buildChoice = Read-Host "Would you like to build the project using Maven first? (y/n)"
    if ($buildChoice -eq 'y' -or $buildChoice -eq 'Y') {
        Write-Host "Building project using local Maven..." -ForegroundColor Cyan
        Start-Process -Wait -NoNewWindow -FilePath "..\apache-maven-3.9.9\bin\mvn.cmd" -ArgumentList "clean install -DskipTests"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Maven build failed. Exiting startup script." -ForegroundColor Red
            Exit $LASTEXITCODE
        }
    } else {
        Write-Host "Continuing startup attempt. Note that services might fail to start if JAR files are missing." -ForegroundColor Yellow
    }
}

# Define services to start in order, with names, ports, and start-up delays
$servicesToStart = @(
    @{ Name = "auth-service";          Jar = "auth-service/target/auth-service-1.0.0.jar";          Port = 8082; Delay = 22 },
    @{ Name = "communication-service";  Jar = "communication-service/target/communication-service-1.0.0.jar"; Port = 8084; Delay = 20 },
    @{ Name = "booking-service";        Jar = "booking-service/target/booking-service-1.0.0.jar";        Port = 8083; Delay = 22 },
    @{ Name = "api-gateway";            Jar = "api-gateway/target/api-gateway-1.0.0.jar";            Port = 8081; Delay = 2 }
)

Write-Host "Stopping any existing HandyServe services on ports 8081-8084..." -ForegroundColor Gray
foreach ($service in $servicesToStart) {
    $port = $service.Port
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        $pidToKill = $conn.OwningProcess[0]
        Write-Host "Killing process $pidToKill using port $port..." -ForegroundColor Yellow
        Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "`nStarting services in sequence..." -ForegroundColor Cyan

foreach ($service in $servicesToStart) {
    $name = $service.Name
    $jar = $service.Jar
    $port = $service.Port
    $delay = $service.Delay
    
    if (-not (Test-Path $jar)) {
        Write-Host "Error: Could not find JAR for $name at $jar" -ForegroundColor Red
        continue
    }
    
    Write-Host "Launching $name on port $port..." -ForegroundColor Green
    
    # Launch Java process directly without creating a GUI window, redirecting standard output to service logs.
    $stdoutLog = "$PSScriptRoot/${name}_stdout.log"
    $stderrLog = "$PSScriptRoot/${name}_stderr.log"
    Start-Process -NoNewWindow -FilePath "java" -ArgumentList "-Xms24m", "-Xmx96m", "-XX:MaxMetaspaceSize=128m", "-XX:CompressedClassSpaceSize=32m", "-Xshare:off", "-jar", $jar -WorkingDirectory $PSScriptRoot -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog
    
    if ($service -ne $servicesToStart[-1]) {
        Write-Host "Waiting $delay seconds for $name to initialize..." -ForegroundColor Gray
        Start-Sleep -Seconds $delay
    }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " All services started!                       " -ForegroundColor Green
Write-Host " Gateway routing requests on http://localhost:8081" -ForegroundColor Green
Write-Host " Run 'stop-services.ps1' to stop them.       " -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan
