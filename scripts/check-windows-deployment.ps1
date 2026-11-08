<#
.SYNOPSIS
    TECHA 2.0 — Windows Server 2025 Deployment & Diagnostics Protocol
.DESCRIPTION
    Non-destructive PowerShell script that inspects DNS resolution, local port listeners,
    process ownership, local HTTP endpoints, and public HTTP/HTTPS connectivity for techa.ir.
.PARAMETER Domain
    The canonical production domain (default: techa.ir)
.PARAMETER ExpectedIP
    The expected public IPv4 address (default: 62.220.123.21)
.PARAMETER FrontendPort
    The internal loopback port for Next.js 16 (default: 3000)
.PARAMETER BackendPort
    The internal loopback port for Express 5 (default: 5000)
#>

[CmdletBinding()]
param (
    [string]$Domain = "techa.ir",
    [string]$ExpectedIP = "62.220.123.21",
    [int]$FrontendPort = 3000,
    [int]$BackendPort = 5000
)

$ErrorActionPreference = "Continue"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " TECHA 2.0 — WINDOWS SERVER 2025 DEPLOYMENT CHECK" -ForegroundColor Cyan
Write-Host " Inspecting: Domain: $Domain | IP: $ExpectedIP | Ports: $FrontendPort, $BackendPort" -ForegroundColor Cyan
Write-Host "======================================================================`n" -ForegroundColor Cyan

$checksPassed = 0
$checksFailed = 0

function Report-Result {
    param(
        [bool]$Condition,
        [string]$Description,
        [string]$Details = ""
    )
    if ($Condition) {
        Write-Host "[PASS] $Description" -ForegroundColor Green
        if ($Details) { Write-Host "       $Details" -ForegroundColor DarkGray }
        $script:checksPassed++
    } else {
        Write-Host "[FAIL] $Description" -ForegroundColor Red
        if ($Details) { Write-Host "       $Details" -ForegroundColor Yellow }
        $script:checksFailed++
    }
}

# 1. DNS Resolution Check
Write-Host "--- 1. DNS Resolution ---" -ForegroundColor Yellow
try {
    $dnsRecords = Resolve-DnsName -Name $Domain -Type A -ErrorAction Stop
    $resolvedIPs = $dnsRecords | Where-Object { $_.IPAddress } | ForEach-Object { $_.IPAddress }
    $dnsMatched = $resolvedIPs -contains $ExpectedIP
    Report-Result -Condition $dnsMatched `
        -Description "DNS resolution for $Domain points to expected IP ($ExpectedIP)" `
        -Details "Resolved IPs: $($resolvedIPs -join ', ')"
} catch {
    Report-Result -Condition $false `
        -Description "DNS resolution for $Domain failed" `
        -Details $_.Exception.Message
}

# 2. Frontend Loopback Port Listener
Write-Host "`n--- 2. Frontend Port Listener (Port $FrontendPort) ---" -ForegroundColor Yellow
$frontendConn = Get-NetTCPConnection -LocalPort $FrontendPort -State Listen -ErrorAction SilentlyContinue
if ($frontendConn) {
    $procId = $frontendConn[0].OwningProcess
    $procName = (Get-Process -Id $procId -ErrorAction SilentlyContinue).ProcessName
    $isLoopback = $frontendConn | Where-Object { $_.LocalAddress -eq "127.0.0.1" -or $_.LocalAddress -eq "::1" }
    Report-Result -Condition ($isLoopback -ne $null) `
        -Description "Frontend is listening on loopback (Port $FrontendPort)" `
        -Details "PID: $procId ($procName) | Bound Address: $($frontendConn.LocalAddress -join ', ')"
} else {
    Report-Result -Condition $false `
        -Description "Frontend port $FrontendPort is not listening" `
        -Details "Verify Next.js service is started via PM2: npm run pm2:status"
}

# 3. Backend Loopback Port Listener
Write-Host "`n--- 3. Backend Port Listener (Port $BackendPort) ---" -ForegroundColor Yellow
$backendConn = Get-NetTCPConnection -LocalPort $BackendPort -State Listen -ErrorAction SilentlyContinue
if ($backendConn) {
    $procId = $backendConn[0].OwningProcess
    $procName = (Get-Process -Id $procId -ErrorAction SilentlyContinue).ProcessName
    $isLoopback = $backendConn | Where-Object { $_.LocalAddress -eq "127.0.0.1" -or $_.LocalAddress -eq "::1" }
    Report-Result -Condition ($isLoopback -ne $null) `
        -Description "Backend is listening on loopback (Port $BackendPort)" `
        -Details "PID: $procId ($procName) | Bound Address: $($backendConn.LocalAddress -join ', ')"
} else {
    Report-Result -Condition $false `
        -Description "Backend port $BackendPort is not listening" `
        -Details "Verify Express service is started via PM2: npm run pm2:status"
}

# 4. Local Frontend HTTP Smoke Check
Write-Host "`n--- 4. Local Frontend HTTP Smoke Check ---" -ForegroundColor Yellow
try {
    $feResponse = Invoke-WebRequest -Uri "http://127.0.0.1:$FrontendPort/" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Report-Result -Condition ($feResponse.StatusCode -eq 200) `
        -Description "Local Frontend HTTP GET / returned HTTP 200 OK" `
        -Details "Content-Type: $($feResponse.Headers['Content-Type']) | Length: $($feResponse.Content.Length) bytes"
} catch {
    Report-Result -Condition $false `
        -Description "Local Frontend HTTP check failed" `
        -Details $_.Exception.Message
}

# 5. Local Backend Health HTTP Smoke Check
Write-Host "`n--- 5. Local Backend HTTP Smoke Check ---" -ForegroundColor Yellow
try {
    $beResponse = Invoke-WebRequest -Uri "http://127.0.0.1:$BackendPort/api/v1/health/liveness" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $beLiveness = $beResponse.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
    $isLive = ($beResponse.StatusCode -eq 200) -and ($beLiveness.status -eq "up")
    Report-Result -Condition $isLive `
        -Description "Local Backend HTTP GET /api/v1/health/liveness returned status 'up'" `
        -Details "HTTP $($beResponse.StatusCode) | Response: $($beResponse.Content)"
} catch {
    Report-Result -Condition $false `
        -Description "Local Backend HTTP health check failed" `
        -Details $_.Exception.Message
}

# 6. Local Backend Landing Page & Swagger Smoke Check
Write-Host "`n--- 6. Local Backend Landing Page & Swagger Smoke Check ---" -ForegroundColor Yellow
try {
    $rootResponse = Invoke-WebRequest -Uri "http://127.0.0.1:$BackendPort/" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $hasTitle = $rootResponse.Content -like "*TECHA API Service*"
    Report-Result -Condition ($rootResponse.StatusCode -eq 200 -and $hasTitle) `
        -Description "Local Backend root GET / returned English landing page" `
        -Details "HTTP $($rootResponse.StatusCode) | Contains 'TECHA API Service'"
} catch {
    Report-Result -Condition $false `
        -Description "Local Backend root landing check failed" `
        -Details $_.Exception.Message
}

# 7. Public Port 80 & 443 Reachability
Write-Host "`n--- 7. Public HTTP / HTTPS Reachability ---" -ForegroundColor Yellow
$p80 = Test-NetConnection -ComputerName $Domain -Port 80 -InformationLevel Quiet
Report-Result -Condition $p80 `
    -Description "Public HTTP Port 80 is reachable on $Domain" `
    -Details "IIS should redirect port 80 to HTTPS 443"

$p443 = Test-NetConnection -ComputerName $Domain -Port 443 -InformationLevel Quiet
Report-Result -Condition $p443 `
    -Description "Public HTTPS Port 443 is reachable on $Domain" `
    -Details "Secured with TLS certificate"

# 8. Unintended External Exposure of Private Ports
Write-Host "`n--- 8. Security Boundary: Private Port Exposure ---" -ForegroundColor Yellow
$feExternal = Test-NetConnection -ComputerName $ExpectedIP -Port $FrontendPort -InformationLevel Quiet -WarningAction SilentlyContinue
Report-Result -Condition (-not $feExternal) `
    -Description "Private Frontend port $FrontendPort is NOT exposed to public internet" `
    -Details "Loopback binding verified (accessible only via IIS reverse proxy)"

$beExternal = Test-NetConnection -ComputerName $ExpectedIP -Port $BackendPort -InformationLevel Quiet -WarningAction SilentlyContinue
Report-Result -Condition (-not $beExternal) `
    -Description "Private Backend port $BackendPort is NOT exposed to public internet" `
    -Details "Loopback binding verified (accessible only via IIS reverse proxy)"

# Summary
Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host " DEPLOYMENT CHECK SUMMARY: $checksPassed Passed, $checksFailed Failed" -ForegroundColor Cyan
Write-Host "======================================================================`n" -ForegroundColor Cyan

if ($checksFailed -gt 0) {
    exit 1
} else {
    exit 0
}
