# Diagnostic des erreurs ERR_CONNECTION_REFUSED

## 🔍 Problème

Le serveur API ne démarre pas, ce qui cause les erreurs `ERR_CONNECTION_REFUSED` dans le frontend.

## ✅ Solutions

### 1. Vérifier que le serveur démarre

Dans le terminal où vous avez lancé `pnpm dev`, vous devriez voir :
```
@soins-plus/api:dev: > @soins-plus/api@0.1.0 dev
@soins-plus/api:dev: > tsx watch src/main.ts
@soins-plus/api:dev: SOINS+ API running at http://0.0.0.0:4000
```

Si vous ne voyez pas ce message, le serveur ne démarre pas.

### 2. Vérifier les variables d'environnement

Le serveur nécessite ces variables dans `apps/api/.env` :

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/soinsplus"
JWT_ACCESS_SECRET="votre-secret-jwt-access"
JWT_REFRESH_SECRET="votre-secret-jwt-refresh"
FRONTEND_URL="http://localhost:5173"
PORT=4000
```

**Si une de ces variables manque, le serveur ne démarrera pas.**

### 3. Vérifier les erreurs dans le terminal

Regardez les erreurs dans le terminal où `pnpm dev` est lancé. Les erreurs courantes sont :

#### Erreur : `Missing environment variable`
**Solution :** Créez le fichier `apps/api/.env` avec toutes les variables requises.

#### Erreur : `Cannot find package 'ioredis'` ou `Cannot find package 'node-clamav'`
**Solution :** Les imports sont maintenant dynamiques, donc cette erreur ne devrait plus se produire. Si elle persiste :
```bash
pnpm --filter @soins-plus/api add ioredis node-clamav sharp csv-parse
```

#### Erreur : `Error: connect ECONNREFUSED` (base de données)
**Solution :** Vérifiez que PostgreSQL est démarré et que `DATABASE_URL` est correct.

#### Erreur : `Prisma Client not generated`
**Solution :** 
```bash
cd apps/api
pnpm generate
```

### 4. Vérifier que le port 4000 est libre

Si le port 4000 est déjà utilisé, changez-le dans `apps/api/.env` :
```env
PORT=4001
```

Et mettez à jour `apps/web/.env.local` :
```env
VITE_API_URL=http://localhost:4001
```

### 5. Redémarrer proprement

1. Arrêtez `pnpm dev` (Ctrl+C)
2. Supprimez les processus Node.js restants si nécessaire
3. Relancez :
```bash
pnpm dev
```

## 🧪 Test rapide

Pour tester si le serveur répond, ouvrez un nouveau terminal et exécutez :

```bash
curl http://localhost:4000/healthz
```

Vous devriez recevoir : `{"status":"ok"}`

Si vous obtenez `curl: (7) Failed to connect`, le serveur n'est pas démarré.

## 📝 Checklist

- [ ] Fichier `apps/api/.env` existe avec toutes les variables requises
- [ ] PostgreSQL est démarré et accessible
- [ ] Le port 4000 est libre
- [ ] `pnpm generate` a été exécuté dans `apps/api`
- [ ] Aucune erreur dans le terminal du serveur
- [ ] Le message "SOINS+ API running at..." apparaît dans les logs

## 🆘 Si le problème persiste

1. Partagez les logs complets du terminal où `pnpm dev` est lancé
2. Vérifiez que tous les fichiers `.env` sont bien créés
3. Vérifiez que les dépendances sont installées : `pnpm install`

