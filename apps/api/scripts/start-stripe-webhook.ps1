# Script PowerShell pour lancer Stripe CLI et forwarder les webhooks
# Usage: .\scripts\start-stripe-webhook.ps1

Write-Host "Demarrage de Stripe CLI pour les webhooks locaux..." -ForegroundColor Cyan
Write-Host ""

# Verifier si Stripe CLI est installe
$stripeDir = "$env:USERPROFILE\stripe-cli"
$stripeExe = "$stripeDir\stripe.exe"

# Ajouter au PATH de la session actuelle
if (Test-Path $stripeExe) {
    $env:Path += ";$stripeDir"
    $stripeCmd = "stripe"
} else {
    # Essayer de trouver stripe dans le PATH
    try {
        $null = Get-Command stripe -ErrorAction Stop
        $stripeCmd = "stripe"
    } catch {
        Write-Host "Stripe CLI n'est pas installe." -ForegroundColor Red
        Write-Host ""
        Write-Host "Installez-le avec:" -ForegroundColor Yellow
        Write-Host "  cd apps/api" -ForegroundColor White
        Write-Host "  powershell -ExecutionPolicy Bypass -File scripts/install-stripe-cli.ps1" -ForegroundColor White
        Write-Host ""
        Write-Host "Ou telechargez depuis: https://github.com/stripe/stripe-cli/releases" -ForegroundColor White
        exit 1
    }
}

try {
    $stripeVersion = & $stripeCmd --version 2>&1
    Write-Host "Stripe CLI detecte: $stripeVersion" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors de la verification de Stripe CLI" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Forwarding des webhooks vers: http://localhost:4000/webhooks/stripe" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Copiez le 'whsec_...' qui s'affichera ci-dessous" -ForegroundColor Yellow
Write-Host "   et utilisez-le comme STRIPE_WEBHOOK_SECRET dans votre configuration." -ForegroundColor Yellow
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arreter." -ForegroundColor Gray
Write-Host ""

# Lancer Stripe CLI
& $stripeCmd listen --forward-to localhost:4000/webhooks/stripe
