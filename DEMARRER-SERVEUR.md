# Comment démarrer le serveur API

## 🚨 Problème actuel

Le serveur API n'est **pas démarré**, ce qui cause les erreurs `ERR_CONNECTION_REFUSED` toutes les secondes.

## ✅ Solution : Démarrer le serveur

### Option 1 : Démarrer avec pnpm dev (recommandé)

Depuis la **racine du projet** :

```bash
pnpm dev
```

Cela démarre à la fois :
- Le serveur API sur `http://localhost:4000`
- Le frontend sur `http://localhost:5173`

### Option 2 : Démarrer uniquement l'API

Depuis la racine du projet :

```bash
cd apps/api
pnpm dev
```

## 🔍 Vérifier que le serveur est démarré

Vous devriez voir dans le terminal :

```
@soins-plus/api:dev: > tsx watch src/main.ts
@soins-plus/api:dev: {"level":30,"time":...","msg":"Server listening at http://0.0.0.0:4000"}
@soins-plus/api:dev: {"level":30,"time":...","msg":"SOINS+ API running at http://0.0.0.0:4000"}
```

## ⚠️ Si le serveur ne démarre pas

### 1. Vérifier les variables d'environnement

Assurez-vous que `apps/api/.env` existe et contient :

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/soinsplus"
JWT_ACCESS_SECRET="dev-secret-key-change-in-production-12345"
JWT_REFRESH_SECRET="dev-refresh-secret-key-change-in-production-12345"
FRONTEND_URL="http://localhost:5173"
PORT=4000
```

### 2. Vérifier que PostgreSQL est démarré

Si vous utilisez PostgreSQL localement, assurez-vous qu'il est démarré.

### 3. Vérifier les erreurs dans le terminal

Regardez les messages d'erreur dans le terminal où vous lancez `pnpm dev`.

## 📝 Corrections appliquées

J'ai configuré React Query pour :
- ✅ Ne pas réessayer en boucle si le serveur n'est pas disponible
- ✅ Désactiver le refetch automatique au focus de la fenêtre
- ✅ Limiter les tentatives de reconnexion

Une fois le serveur démarré, les erreurs disparaîtront automatiquement.

