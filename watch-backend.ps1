# Script pour surveiller les logs du backend en temps réel
# Utilisation: .\watch-backend.ps1

Write-Host "🔍 Surveillance des logs du backend..." -ForegroundColor Cyan
Write-Host "Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Yellow
Write-Host ""

# Chercher les processus Node.js qui tournent sur le port 4000 ou qui contiennent "tsx watch"
$processes = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*Soins*" -or (Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue).OwningProcess -eq $_.Id
}

if ($processes) {
    Write-Host "✅ Processus backend trouvé(s):" -ForegroundColor Green
    $processes | ForEach-Object {
        Write-Host "   PID: $($_.Id) - $($_.Path)" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "Pour voir les logs en temps réel, regardez le terminal où vous avez lancé 'pnpm dev'" -ForegroundColor Yellow
} else {
    Write-Host "❌ Aucun processus backend trouvé" -ForegroundColor Red
    Write-Host "Lancez 'pnpm dev' depuis la racine du projet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Pour tester la connexion:" -ForegroundColor Cyan
Write-Host "  curl http://localhost:4000/healthz" -ForegroundColor White

