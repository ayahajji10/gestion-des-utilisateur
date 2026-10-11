<#
.SYNOPSIS
    Script de démarrage pour le Frontend Angular sous Windows (Sans Docker).
.DESCRIPTION
    Installe les dépendances si nécessaire et lance le serveur de développement local.
#>

param (
    [int]$Port = 4200
)

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Démarrage du Frontend Angular (Node.js / ng serve)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Vérification de Node.js et npm
$nodeVer = node -v 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Error "Node.js n'est pas accessible dans le PATH."
    exit 1
}
Write-Host "[OK] Node.js détecté : $($nodeVer.Trim())" -ForegroundColor Green

# 2. Vérification de node_modules
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = "$projectRoot\frontend"
Set-Location $frontendDir

if (-not (Test-Path "$frontendDir\node_modules")) {
    Write-Host "[INFO] node_modules absent. Installation des dépendances via npm install..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "[OK] node_modules présent." -ForegroundColor Green
}

# 3. Vérification de la disponibilité du backend
$backendReachable = Test-NetConnection -ComputerName "localhost" -Port 8081 -InformationLevel Quiet -ErrorAction SilentlyContinue
if (-not $backendReachable) {
    Write-Host "[INFO] Le backend sur http://localhost:8081 n'est pas encore détecté." -ForegroundColor Yellow
    Write-Host "Pensez à le démarrer avec .\start-backend.ps1." -ForegroundColor Yellow
} else {
    Write-Host "[OK] Backend actif sur http://localhost:8081." -ForegroundColor Green
}

Write-Host "`nLancement du serveur Angular sur http://localhost:$Port...`n" -ForegroundColor Cyan
npx ng serve --port $Port --open
