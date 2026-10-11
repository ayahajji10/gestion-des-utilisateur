<#
.SYNOPSIS
    Script de démarrage pour le Backend Spring Boot sous Windows (Sans Docker).
.DESCRIPTION
    Vérifie la disponibilité de PostgreSQL et de Keycloak, puis lance l'application.
#>

param (
    [int]$DbPort = 5433,
    [string]$DbUser = "postgres",
    [string]$DbPassword = "postgres"
)

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Démarrage du Backend Spring Boot (Java 21 / Maven)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Vérification de Maven
$mvnVersion = mvn -version 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Error "Maven (mvn) n'est pas accessible dans le PATH."
    exit 1
}
Write-Host "[OK] Maven disponible." -ForegroundColor Green

# 2. Détection du port PostgreSQL
$pg5433 = Test-NetConnection -ComputerName "localhost" -Port $DbPort -InformationLevel Quiet -ErrorAction SilentlyContinue
if (-not $pg5433) {
    Write-Host "[INFO] Le port $DbPort n'est pas ouvert, tentative sur le port standard 5432..." -ForegroundColor Yellow
    $pg5432 = Test-NetConnection -ComputerName "localhost" -Port 5432 -InformationLevel Quiet -ErrorAction SilentlyContinue
    if ($pg5432) {
        $DbPort = 5432
        Write-Host "[OK] PostgreSQL détecté sur le port 5432." -ForegroundColor Green
    } else {
        Write-Host "[ATTENTION] Aucun serveur PostgreSQL ne répond sur les ports 5432 ou 5433." -ForegroundColor Yellow
        Write-Host "Assurez-vous que le service Windows PostgreSQL est démarré (ex: Start-Service postgresql-x64-18)." -ForegroundColor Yellow
    }
} else {
    Write-Host "[OK] PostgreSQL actif sur le port $DbPort." -ForegroundColor Green
}

# 3. Vérification de Keycloak
$kcReachable = Test-NetConnection -ComputerName "localhost" -Port 8080 -InformationLevel Quiet -ErrorAction SilentlyContinue
if (-not $kcReachable) {
    Write-Host "[ATTENTION] Keycloak ne semble pas encore démarré sur http://localhost:8080." -ForegroundColor Yellow
    Write-Host "Vous pouvez lancer Keycloak dans un autre terminal via .\start-keycloak.ps1." -ForegroundColor Yellow
} else {
    Write-Host "[OK] Keycloak détecté sur le port 8080." -ForegroundColor Green
}

# 4. Export des variables d'environnement pour le démarrage Spring Boot
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:$DbPort/user_management_db"
$env:SPRING_DATASOURCE_USERNAME = $DbUser
$env:SPRING_DATASOURCE_PASSWORD = $DbPassword
$env:KEYCLOAK_AUTH_SERVER_URL = "http://localhost:8080"
$env:KEYCLOAK_ISSUER_URI = "http://localhost:8080/realms/user-management-realm"
$env:KEYCLOAK_JWK_SET_URI = "http://localhost:8080/realms/user-management-realm/protocol/openid-connect/certs"
$env:KEYCLOAK_REALM = "user-management-realm"
$env:KEYCLOAK_CLIENT_ID = "user-management-backend"
$env:KEYCLOAK_CLIENT_SECRET = "backend-secret-key-for-dev"
$env:BACKEND_PORT = "8081"
$env:SPRING_PROFILES_ACTIVE = "local"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = "$projectRoot\backend"

Set-Location $backendDir
Write-Host "`nLancement de Spring Boot sur http://localhost:8081...`n" -ForegroundColor Cyan
mvn spring-boot:run
