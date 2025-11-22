# Script d'installation de Stripe CLI pour Windows
# Ce script telecharge et installe Stripe CLI

Write-Host "Installation de Stripe CLI..." -ForegroundColor Cyan
Write-Host ""

# Creer un dossier pour Stripe CLI
$stripeDir = "$env:USERPROFILE\stripe-cli"
if (-not (Test-Path $stripeDir)) {
    New-Item -ItemType Directory -Path $stripeDir -Force | Out-Null
}

# URL de telechargement (derniere version stable)
$downloadUrl = "https://github.com/stripe/stripe-cli/releases/download/v2.40.0/stripe_2.40.0_windows_x86_64.zip"
$zipPath = "$env:TEMP\stripe-cli.zip"
$extractPath = "$env:TEMP\stripe-cli-extract"

Write-Host "Telechargement de Stripe CLI..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -UseBasicParsing
    Write-Host "Telechargement reussi" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors du telechargement: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Telechargement manuel:" -ForegroundColor Yellow
    Write-Host "   1. Allez sur: https://github.com/stripe/stripe-cli/releases/latest" -ForegroundColor White
    Write-Host "   2. Telechargez: stripe_X.X.X_windows_x86_64.zip" -ForegroundColor White
    Write-Host "   3. Extrayez stripe.exe dans: $stripeDir" -ForegroundColor White
    Write-Host "   4. Ajoutez $stripeDir a votre PATH" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "Extraction..." -ForegroundColor Yellow
if (Test-Path $extractPath) {
    Remove-Item $extractPath -Recurse -Force
}
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

# Trouver stripe.exe dans l'archive
$stripeExe = Get-ChildItem -Path $extractPath -Filter "stripe.exe" -Recurse | Select-Object -First 1

if ($stripeExe) {
    Copy-Item $stripeExe.FullName -Destination "$stripeDir\stripe.exe" -Force
    Write-Host "Stripe CLI installe dans: $stripeDir" -ForegroundColor Green
} else {
    Write-Host "stripe.exe non trouve dans l'archive" -ForegroundColor Red
    exit 1
}

# Ajouter au PATH utilisateur
Write-Host ""
Write-Host "Ajout au PATH..." -ForegroundColor Yellow
$currentPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
if ($currentPath -notlike "*$stripeDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$stripeDir", [EnvironmentVariableTarget]::User)
    $env:Path += ";$stripeDir"
    Write-Host "Ajoute au PATH" -ForegroundColor Green
} else {
    Write-Host "Deja dans le PATH" -ForegroundColor Green
}

# Nettoyer
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
Remove-Item $extractPath -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Installation terminee !" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Cyan
Write-Host "   1. Fermez et rouvrez votre terminal PowerShell" -ForegroundColor White
Write-Host "   2. Executez: stripe login" -ForegroundColor White
Write-Host "   3. Connectez-vous avec votre compte Stripe" -ForegroundColor White
Write-Host "   4. Lancez: npm run stripe:webhook" -ForegroundColor White
Write-Host ""
