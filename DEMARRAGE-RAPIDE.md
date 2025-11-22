# Guide de démarrage rapide - SOINS+

## 🚀 Démarrage du projet

### 1. Installation des dépendances

```bash
# Depuis la racine du projet
pnpm install
```

### 2. Configuration des variables d'environnement

#### Backend (`apps/api/.env`)

Créez un fichier `.env` dans `apps/api/` avec au minimum :

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/soinsplus"
PORT=4000
JWT_ACCESS_SECRET="votre-secret-jwt-access"
JWT_REFRESH_SECRET="votre-secret-jwt-refresh"
FRONTEND_URL="http://localhost:5173"

# Optionnel (pour développement)
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_PRICE_ID_MONTHLY="price_xxx"
STRIPE_PRICE_ID_YEARLY="price_xxx"
POSTMARK_TOKEN="xxx"
SENTRY_DSN=""
CLARITY_PROJECT_ID=""
STORAGE_URL=""
STORAGE_SAS=""

# Redis (optionnel - cache désactivé si non configuré)
REDIS_URL="redis://localhost:6379"

# ClamAV (optionnel - scan désactivé en développement si non configuré)
CLAMAV_HOST="localhost"
CLAMAV_PORT=3310
```

#### Frontend (`apps/web/.env.local`)

Créez un fichier `.env.local` dans `apps/web/` avec :

```env
VITE_API_URL=http://localhost:4000
VITE_SENTRY_DSN=
VITE_CLARITY_ID=
VITE_STRIPE_PUBLIC_KEY=
```

### 3. Base de données

```bash
# Générer le client Prisma
cd apps/api
pnpm generate

# Appliquer les migrations
pnpm migrate

# (Optionnel) Remplir avec des données de test
pnpm seed
```

### 4. Démarrer le projet

```bash
# Depuis la racine du projet
pnpm dev
```

Cela démarre :
- **API** : http://localhost:4000
- **Frontend** : http://localhost:5173

## ⚠️ Résolution des erreurs

### Erreur `ERR_CONNECTION_REFUSED`

**Cause :** Le serveur API n'est pas démarré ou l'URL de l'API est incorrecte.

**Solution :**
1. Vérifiez que `pnpm dev` est bien lancé depuis la racine
2. Vérifiez que le fichier `apps/web/.env.local` contient `VITE_API_URL=http://localhost:4000`
3. Vérifiez que le port 4000 n'est pas déjà utilisé

### Erreur `Cannot find package 'ioredis'`

**Cause :** Les dépendances ne sont pas installées dans le bon workspace.

**Solution :**
```bash
# Réinstaller toutes les dépendances
pnpm install

# Ou installer spécifiquement dans l'API
pnpm --filter @soins-plus/api add ioredis node-clamav sharp csv-parse
```

### Erreur `Missing environment variable`

**Cause :** Variables d'environnement manquantes.

**Solution :** Créez les fichiers `.env` comme indiqué ci-dessus.

### Warning React Router `v7_startTransition`

**Cause :** Avertissement de dépréciation pour React Router v7.

**Solution :** Déjà corrigé dans le code. Le warning peut être ignoré.

## 📝 Notes importantes

- **Redis** : Optionnel. Le cache est désactivé si Redis n'est pas configuré.
- **ClamAV** : Optionnel. En développement, les fichiers sont acceptés sans scan si ClamAV n'est pas configuré.
- **Sharp** : Nécessite des build scripts. Exécutez `pnpm approve-builds sharp` si nécessaire.

## 🔑 Compte admin par défaut

Après avoir exécuté le seed, vous pouvez vous connecter avec :
- **Email** : admin@soins-plus.com (ou celui défini dans le seed)
- **Mot de passe** : Vérifiez le fichier `apps/api/prisma/seed.ts`

## 🆘 Support

En cas de problème :
1. Vérifiez les logs dans les terminaux (`pnpm dev`)
2. Vérifiez que tous les services sont démarrés
3. Vérifiez les variables d'environnement

## ✅ Corrections appliquées

- ✅ Dépendances ajoutées au `package.json` de l'API
- ✅ Warning React Router corrigé (v7_startTransition)
- ✅ URL API par défaut ajoutée dans `api.ts` (`http://localhost:4000`)
- ✅ Imports corrigés pour `ioredis` et `node-clamav`
- ✅ Guide de démarrage créé

**Important :** Créez les fichiers `.env` et `.env.local` comme indiqué ci-dessus avant de démarrer le projet.

