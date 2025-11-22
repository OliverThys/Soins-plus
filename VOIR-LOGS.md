# 📋 Comment voir les logs du backend

## Méthode 1 : Logs améliorés dans le terminal (Recommandé)

Quand vous lancez `pnpm dev`, les logs du backend sont maintenant plus visibles avec des séparateurs :

```
============================================================
🚀 DÉMARRAGE DU SERVEUR SOINS+ API
============================================================
📋 Configuration:
   - Port: 4000
   - Frontend URL: http://localhost:5173
   - Node Env: development
   - Database: ✅ Configurée
============================================================

✅ Connexion à la base de données réussie

============================================================
✅ SOINS+ API DÉMARRÉE AVEC SUCCÈS
   URL: http://0.0.0.0:4000
   - Health check: http://0.0.0.0:4000/healthz
   - API docs: http://0.0.0.0:4000/documentation
============================================================
```

## Méthode 2 : Filtrer les logs avec PowerShell

Dans le terminal où `pnpm dev` tourne, vous pouvez filtrer les logs du backend :

```powershell
# Voir uniquement les logs du backend (cherche les lignes avec "API" ou "SOINS+")
# Les logs apparaîtront en temps réel
```

## Méthode 3 : Lancer le backend séparément

Si vous voulez voir uniquement les logs du backend :

```powershell
# Terminal 1 : Backend uniquement
cd apps/api
pnpm dev

# Terminal 2 : Frontend uniquement  
cd apps/web
pnpm dev
```

## Méthode 4 : Vérifier que le backend tourne

```powershell
# Vérifier le port
netstat -ano | findstr :4000

# Tester la connexion
curl http://localhost:4000/healthz

# Voir les processus Node.js
Get-Process node | Select-Object Id, ProcessName, StartTime
```

## 🔍 Dépannage

Si vous ne voyez pas les logs du backend dans `pnpm dev` :

1. Vérifiez que le backend démarre : cherchez les lignes avec "🚀 DÉMARRAGE"
2. Vérifiez les erreurs : cherchez les lignes avec "❌"
3. Vérifiez le port : si le port 4000 est occupé, le backend essaiera 4001, 4002, etc.

## 📝 Note

Les logs sont maintenant formatés avec des séparateurs `=====` pour être plus facilement repérables dans la sortie de `turbo run dev --parallel`.

