<#
.SYNOPSIS
    Script de démarrage pour Keycloak sous Windows (Sans Docker).
.DESCRIPTION
    Recherche l'installation Keycloak locale ou le dossier spécifié,
    définit les identifiants admin et lance le serveur en mode dev avec import du realm.
#>

param (
    [string]$KeycloakPath = ""
)

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Démarrage de Keycloak sur Windows (Mode Standalone Local)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Vérification de Java
try {
    $javaProc = Start-Process -FilePath "java" -ArgumentList "-version" -NoNewWindow -Wait -PassThru
    if ($javaProc.ExitCode -ne 0) {
        Write-Error "Java n'est pas accessible. Veuillez installer OpenJDK 17 ou 21."
        exit 1
    }
    Write-Host "[OK] Java détecté avec succès." -ForegroundColor Green
} catch {
    Write-Error "Java n'est pas accessible dans le PATH. Veuillez installer OpenJDK 17 ou 21."
    exit 1
}

# 1.1 Vérification si Keycloak écoute déjà sur le port 8080
$kcRunning = Test-NetConnection -ComputerName "localhost" -Port 8080 -InformationLevel Quiet -ErrorAction SilentlyContinue
if ($kcRunning) {
    Write-Host "[OK] Keycloak est déjà démarré et actif sur http://localhost:8080 !" -ForegroundColor Green
    Write-Host "Le serveur fonctionne correctement. Vous pouvez accéder à la console sur http://localhost:8080/admin." -ForegroundColor Green
    exit 0
}

# 2. Localisation de Keycloak
$candidates = @(
    $KeycloakPath,
    # Keycloak 26.5.5 - extraction avec sous-dossier imbriqué
    "$env:USERPROFILE\Downloads\keycloak-26.5.5\keycloak-26.5.5",
    # Keycloak 26.5.5 - extraction directe (sans sous-dossier)
    "$env:USERPROFILE\Downloads\keycloak-26.5.5",
    # Keycloak 26.4.7 - extraction avec sous-dossier imbriqué
    "$env:USERPROFILE\Downloads\keycloak-26.4.7\keycloak-26.4.7",
    # Keycloak 26.4.7 - extraction directe
    "$env:USERPROFILE\Downloads\keycloak-26.4.7",
    "C:\Users\user\Downloads\keycloak-26.5.5\keycloak-26.5.5",
    "C:\Users\user\Downloads\keycloak-26.5.5",
    "C:\Users\user\Downloads\keycloak-26.4.7\keycloak-26.4.7",
    "C:\Users\user\Downloads\keycloak-26.4.7",
    "C:\keycloak-24.0.5",
    "C:\keycloak-26.5.5",
    "C:\keycloak-26.4.7",
    "C:\keycloak-*"
)

$kcBin = $null
$kcHome = $null

foreach ($cand in $candidates) {
    if (-not $cand) { continue }
    if (Test-Path "$cand\bin\kc.bat") {
        $kcHome = $cand
        $kcBin = "$cand\bin\kc.bat"
        break
    }
}


if (-not $kcBin) {
    Write-Host "`n[INFO] Aucun dossier Keycloak détecté automatiquement." -ForegroundColor Yellow
    Write-Host "Veuillez télécharger Keycloak 24 (ou version compatible) depuis :" -ForegroundColor Yellow
    Write-Host "https://github.com/keycloak/keycloak/releases/download/24.0.5/keycloak-24.0.5.zip`n" -ForegroundColor Yellow
    $kcInput = Read-Host "Entrez le chemin vers le dossier racine de Keycloak décompressé (ex: C:\keycloak-24.0.5)"
    if ($kcInput -and (Test-Path "$kcInput\bin\kc.bat")) {
        $kcHome = $kcInput
        $kcBin = "$kcInput\bin\kc.bat"
    } else {
        Write-Error "Fichier kc.bat introuvable dans le chemin spécifié : $kcInput"
        exit 1
    }
}

Write-Host "[OK] Dossier Keycloak trouvé : $kcHome" -ForegroundColor Green

# 3. Préparation des variables admin (Compatibilité Keycloak 24 à 26+)
$adminUser = if ($env:KEYCLOAK_ADMIN) { $env:KEYCLOAK_ADMIN } else { "admin" }
$adminPass = if ($env:KEYCLOAK_ADMIN_PASSWORD) { $env:KEYCLOAK_ADMIN_PASSWORD } else { "admin" }

$env:KEYCLOAK_ADMIN = $adminUser
$env:KEYCLOAK_ADMIN_PASSWORD = $adminPass
$env:KC_BOOTSTRAP_ADMIN_USERNAME = $adminUser
$env:KC_BOOTSTRAP_ADMIN_PASSWORD = $adminPass

# 4. Localisation du fichier realm-export.json
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$realmPath = "$projectRoot\realm-export.json"

Write-Host "Démarrage de Keycloak sur http://localhost:8080..." -ForegroundColor Cyan
Write-Host "Identifiants d'administration configurés : $adminUser / $adminPass" -ForegroundColor Yellow

if (Test-Path $realmPath) {
    Write-Host "[OK] Configuration du realm détectée : $realmPath" -ForegroundColor Green
    $importDir = "$kcHome\data\import"
    if (-not (Test-Path $importDir)) {
        New-Item -ItemType Directory -Path $importDir -Force | Out-Null
    }
    Copy-Item -Path $realmPath -Destination "$importDir\realm-export.json" -Force
    Write-Host "[OK] Fichier copié dans $importDir\realm-export.json pour import automatique." -ForegroundColor Green
    & "$kcBin" start-dev --import-realm
} else {
    & "$kcBin" start-dev
}
