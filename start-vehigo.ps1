$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$javaHome = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
$mavenHome = "C:\Tools\apache-maven-3.9.9"
$mongoBinary = "C:\Tools\mongodb-win32-x86_64-windows-8.3.7\bin\mongod.exe"
$dbPath = "C:\data\vehigo-mongo"
$logPath = "C:\data\vehigo-mongo.log"
$backendDir = Join-Path $repoRoot "backend"
$backendLog = Join-Path $backendDir "backend-run.log"

New-Item -ItemType Directory -Force -Path $dbPath | Out-Null

$mongoRunning = Get-CimInstance Win32_Process -Filter "Name = 'mongod.exe'" -ErrorAction SilentlyContinue
if (-not $mongoRunning) {
    Write-Host "Starting MongoDB..."
    Start-Process -FilePath $mongoBinary -ArgumentList @(
        "--dbpath", $dbPath,
        "--logpath", $logPath,
        "--port", "27017",
        "--bind_ip", "127.0.0.1"
    ) -NoNewWindow
}

$env:JAVA_HOME = $javaHome
$env:Path = "$javaHome\bin;$mavenHome\bin;$env:Path"

Write-Host "Starting Spring Boot backend..."
Start-Process -FilePath "$mavenHome\bin\mvn.cmd" -ArgumentList @(
    "-f", (Join-Path $backendDir "pom.xml"),
    "spring-boot:run"
) -WorkingDirectory $backendDir -RedirectStandardOutput $backendLog -RedirectStandardError $backendLog -NoNewWindow

Write-Host ""
Write-Host "VEHIGO is starting..."
Write-Host "MongoDB: mongodb://localhost:27017/vehigo_db"
Write-Host "Backend API: http://localhost:8080"
Write-Host "Frontend: file://$repoRoot\frontend\index.html"
Write-Host "Backend log: $backendLog"
Write-Host "MongoDB log: $logPath"
