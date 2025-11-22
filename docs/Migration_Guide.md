# 📋 Configuration complète du projet SOINS+

Ce fichier contient toutes les configurations nécessaires pour installer et configurer le projet SOINS+ sur un nouveau PC.

---

## 🔧 Prérequis système

### Logiciels à installer

1. **Node.js** (version 20 ou supérieure)
   - Télécharger depuis : https://nodejs.org/
   - Vérifier l'installation : `node --version`

2. **pnpm** (version 9 ou supérieure)
   - Installer via npm : `npm install -g pnpm@10.22.0`
   - Vérifier l'installation : `pnpm --version`

3. **PostgreSQL** (version 15 ou supérieure)
   - Option 1 : Installer localement
   - Option 2 : Utiliser Supabase (recommandé pour développement)
   - Option 3 : Utiliser Azure Database

4. **Git** (pour cloner le projet)
   - Télécharger depuis : https://git-scm.com/

### Services optionnels (recommandés)

- **Redis** (pour le cache) - Optionnel mais recommandé
- **ClamAV** (pour le scan antivirus) - Optionnel en développement

---

## 📦 Installation du projet

### 1. Cloner le dépôt

```bash
git clone https://github.com/OliverThys/Soins-plus.git
cd Soins-plus
```

### 2. Installer les dépendances

```bash
pnpm install
```

---

## 🔐 Configuration des variables d'environnement

### Backend (`apps/api/.env`)

Créez le fichier `apps/api/.env` avec le contenu suivant :

```env
# ============================================
# BASE DE DONNÉES
# ============================================
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
# Exemple Supabase: postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/soinsplus"

# ============================================
# SERVEUR
# ============================================
PORT=4000
FRONTEND_URL="http://localhost:5173"

# ============================================
# JWT (AUTHENTIFICATION)
# ============================================
# Générer avec: cd apps/api && pnpm generate-jwt-secrets
# Ou créer manuellement des chaînes aléatoires sécurisées (min 32 caractères)
JWT_ACCESS_SECRET="votre-secret-jwt-access-minimum-32-caracteres"
JWT_REFRESH_SECRET="votre-secret-jwt-refresh-minimum-32-caracteres"

# ============================================
# STRIPE (PAIEMENTS)
# ============================================
# Clés de test: https://dashboard.stripe.com/test/apikeys
# Clés de production: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY="sk_test_xxxxx"  # ou sk_live_xxxxx en production
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"  # Obtenu après configuration du webhook
STRIPE_PRICE_ID_MONTHLY="price_xxxxx"  # ID du prix mensuel dans Stripe
STRIPE_PRICE_ID_YEARLY="price_xxxxx"  # ID du prix annuel dans Stripe

# ============================================
# POSTMARK (EMAILS)
# ============================================
# Token API: https://account.postmarkapp.com/servers/xxxxx/api_tokens
POSTMARK_TOKEN="xxxxx"

# ============================================
# SENTRY (MONITORING D'ERREURS)
# ============================================
# DSN: https://sentry.io/settings/projects/soins-plus/keys/
SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"

# ============================================
# MICROSOFT CLARITY (ANALYTICS)
# ============================================
# Project ID: https://clarity.microsoft.com/projects
CLARITY_PROJECT_ID="xxxxx"

# ============================================
# STOCKAGE (AZURE BLOB STORAGE)
# ============================================
# URL du compte de stockage Azure
STORAGE_URL="https://storageaccount.blob.core.windows.net/diplomes"
# Signature d'accès partagé (SAS) - Optionnel en développement
STORAGE_SAS="?sv=2021-06-08&ss=b&srt=co&sp=rwdlacupx&se=2025-12-31T23:59:59Z&st=2025-01-01T00:00:00Z&spr=https&sig=xxxxx"

# ============================================
# REDIS (CACHE - OPTIONNEL)
# ============================================
# Format: redis://HOST:PORT ou redis://USER:PASSWORD@HOST:PORT
# Exemple local: redis://localhost:6379
# Exemple cloud: redis://default:password@redis.xxxxx.com:6379
REDIS_URL="redis://localhost:6379"

# ============================================
# CLAMAV (SCAN ANTIVIRUS - OPTIONNEL)
# ============================================
# En développement, peut être omis (les fichiers seront acceptés sans scan)
CLAMAV_HOST="localhost"
CLAMAV_PORT=3310
CLAMAV_TIMEOUT=30000
```

### Frontend (`apps/web/.env`)

Créez le fichier `apps/web/.env` avec le contenu suivant :

```env
# ============================================
# API BACKEND
# ============================================
# URL de l'API backend
# Développement: http://localhost:4000
# Production: https://api.soins-plus.com
VITE_API_URL="http://localhost:4000"

# ============================================
# SENTRY (MONITORING D'ERREURS)
# ============================================
# Même DSN que le backend (ou différent si projets séparés)
VITE_SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"

# ============================================
# MICROSOFT CLARITY (ANALYTICS)
# ============================================
# Même Project ID que le backend
VITE_CLARITY_ID="xxxxx"

# ============================================
# STRIPE (PAIEMENTS)
# ============================================
# Clé publique Stripe (pk_test_xxx ou pk_live_xxx)
VITE_STRIPE_PUBLIC_KEY="pk_test_xxxxx"
```

---

## 🗄️ Configuration de la base de données

### 1. Créer la base de données

#### Option A : Supabase (Recommandé pour développement)

1. Créer un compte sur https://supabase.com
2. Créer un nouveau projet
3. Récupérer la connection string dans Settings > Database > Connection string
4. Utiliser cette URL dans `DATABASE_URL`

#### Option B : PostgreSQL local

```bash
# Créer la base de données
createdb soinsplus

# Ou via psql
psql -U postgres
CREATE DATABASE soinsplus;
\q
```

### 2. Générer le client Prisma

```bash
cd apps/api
pnpm prisma generate
```

### 3. Appliquer les migrations

```bash
cd apps/api
pnpm prisma migrate deploy
# Ou pour développement:
pnpm prisma migrate dev
```

### 4. Initialiser la configuration de l'application

```bash
cd apps/api
pnpm init-config
```

### 5. (Optionnel) Peupler avec des données de test

```bash
cd apps/api
pnpm prisma seed
```

---

## 🔑 Génération des secrets JWT

Pour générer des secrets JWT sécurisés :

```bash
cd apps/api
pnpm generate-jwt-secrets
```

Cela créera deux secrets aléatoires que vous pouvez copier dans votre fichier `.env`.

---

## 💳 Configuration Stripe

### 1. Créer un compte Stripe

1. Aller sur https://stripe.com
2. Créer un compte (mode test pour développement)

### 2. Récupérer les clés API

1. Aller dans Developers > API keys
2. Copier la **Secret key** (sk_test_xxx) → `STRIPE_SECRET_KEY`
3. Copier la **Publishable key** (pk_test_xxx) → `VITE_STRIPE_PUBLIC_KEY`

### 3. Créer les produits et prix

1. Aller dans Products
2. Créer deux produits :
   - **Abonnement Mensuel** → Créer un prix récurrent mensuel
   - **Abonnement Annuel** → Créer un prix récurrent annuel
3. Copier les **Price IDs** (price_xxx) → `STRIPE_PRICE_ID_MONTHLY` et `STRIPE_PRICE_ID_YEARLY`

### 4. Configurer les webhooks

1. Aller dans Developers > Webhooks
2. Ajouter un endpoint : `http://localhost:4000/billing/webhooks/stripe` (ou votre URL de production)
3. Sélectionner les événements :
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copier le **Signing secret** (whsec_xxx) → `STRIPE_WEBHOOK_SECRET`

### 5. Tester les webhooks en local

```bash
cd apps/api
pnpm stripe:webhook
```

Ou manuellement avec Stripe CLI :

```bash
stripe listen --forward-to localhost:4000/billing/webhooks/stripe
```

---

## 📧 Configuration Postmark

### 1. Créer un compte Postmark

1. Aller sur https://postmarkapp.com
2. Créer un compte gratuit (100 emails/mois)

### 2. Créer un serveur

1. Créer un nouveau serveur
2. Récupérer le **Server API Token** → `POSTMARK_TOKEN`

### 3. Configurer les templates (optionnel)

Les templates d'emails peuvent être créés dans Postmark ou gérés dans le code.

---

## 🐛 Configuration Sentry

### 1. Créer un compte Sentry

1. Aller sur https://sentry.io
2. Créer un compte gratuit

### 2. Créer un projet

1. Créer un nouveau projet (Node.js pour backend, React pour frontend)
2. Récupérer le **DSN** → `SENTRY_DSN` et `VITE_SENTRY_DSN`

---

## 📊 Configuration Microsoft Clarity

### 1. Créer un compte Clarity

1. Aller sur https://clarity.microsoft.com
2. Se connecter avec un compte Microsoft

### 2. Créer un projet

1. Créer un nouveau projet
2. Récupérer le **Project ID** → `CLARITY_PROJECT_ID` et `VITE_CLARITY_ID`

---

## ☁️ Configuration Azure Blob Storage (optionnel)

### 1. Créer un compte de stockage Azure

1. Aller sur https://portal.azure.com
2. Créer un Storage Account
3. Créer un conteneur nommé `diplomes`

### 2. Générer une signature SAS (optionnel)

1. Aller dans le conteneur > Shared access tokens
2. Configurer les permissions (lecture/écriture)
3. Copier la signature → `STORAGE_SAS`

### 3. Récupérer l'URL

1. URL du conteneur → `STORAGE_URL`
2. Format : `https://storageaccount.blob.core.windows.net/diplomes`

---

## 🔴 Configuration Redis (optionnel mais recommandé)

### Option A : Redis local

```bash
# Windows (avec Chocolatey)
choco install redis-64

# Ou télécharger depuis: https://github.com/microsoftarchive/redis/releases

# Démarrer Redis
redis-server
```

### Option B : Redis cloud (Upstash, Redis Cloud, etc.)

1. Créer un compte sur un service Redis cloud
2. Récupérer la connection string → `REDIS_URL`

---

## 🦠 Configuration ClamAV (optionnel)

### Installation locale

```bash
# Windows (avec Chocolatey)
choco install clamav

# Démarrer ClamAV
clamd
```

En développement, ClamAV peut être omis. Les fichiers seront acceptés sans scan.

---

## 🚀 Démarrer le projet

### Développement

```bash
# Depuis la racine du projet
pnpm dev
```

Cela démarre :
- **API** : http://localhost:4000
- **Frontend** : http://localhost:5173

### Production

```bash
# Build
pnpm build

# Démarrer l'API
cd apps/api
pnpm start

# Le frontend doit être déployé sur Vercel ou similaire
```

---

## 👤 Comptes par défaut (après seed)

Après avoir exécuté `pnpm prisma seed`, vous pouvez vous connecter avec :

- **Email** : `admin@soins-plus.com`
- **Mot de passe** : Vérifier dans `apps/api/prisma/seed.ts`

---

## 📝 Commandes utiles

### Base de données

```bash
cd apps/api

# Générer le client Prisma
pnpm prisma generate

# Créer une nouvelle migration
pnpm prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations (production)
pnpm prisma migrate deploy

# Ouvrir Prisma Studio (interface graphique)
pnpm prisma studio

# Réinitialiser la base de données
pnpm prisma migrate reset

# Peupler avec des données de test
pnpm prisma seed
```

### Développement

```bash
# Lancer en mode développement
pnpm dev

# Linter
pnpm lint

# Formater le code
pnpm format

# Tests
pnpm test
```

### Scripts utiles

```bash
cd apps/api

# Générer les secrets JWT
pnpm generate-jwt-secrets

# Initialiser la configuration de l'app
pnpm init-config

# Créer un prix Stripe à 0€ (pour tests)
pnpm create-zero-price

# Ajouter des miniatures placeholder aux formations
pnpm add-placeholder-thumbnails

# Lancer le webhook Stripe en local
pnpm stripe:webhook
```

---

## 🔍 Vérification de la configuration

### Checklist avant de démarrer

- [ ] Node.js 20+ installé
- [ ] pnpm 9+ installé
- [ ] PostgreSQL configuré et accessible
- [ ] Fichier `apps/api/.env` créé avec toutes les variables
- [ ] Fichier `apps/web/.env` créé avec toutes les variables
- [ ] Base de données créée
- [ ] Migrations Prisma appliquées (`pnpm prisma migrate deploy`)
- [ ] Client Prisma généré (`pnpm prisma generate`)
- [ ] Configuration initialisée (`pnpm init-config`)
- [ ] Secrets JWT configurés
- [ ] (Optionnel) Redis configuré
- [ ] (Optionnel) ClamAV configuré

### Tester la connexion à la base de données

```bash
cd apps/api
pnpm prisma studio
```

Si Prisma Studio s'ouvre, la connexion fonctionne.

### Tester l'API

```bash
# Démarrer l'API
pnpm dev

# Dans un autre terminal, tester
curl http://localhost:4000/health
```

### Tester le frontend

```bash
# Démarrer le frontend (via pnpm dev)
# Ouvrir http://localhost:5173
```

---

## 🆘 Résolution de problèmes courants

### Erreur: "Cannot find module"

```bash
# Réinstaller toutes les dépendances
pnpm install
```

### Erreur: "DATABASE_URL is not set"

Vérifier que le fichier `apps/api/.env` existe et contient `DATABASE_URL`.

### Erreur: "Connection refused" (PostgreSQL)

1. Vérifier que PostgreSQL est démarré
2. Vérifier les credentials dans `DATABASE_URL`
3. Tester la connexion : `psql -U USER -d DATABASE -h HOST`

### Erreur: "JWT secret is too short"

Les secrets JWT doivent faire au moins 32 caractères. Utiliser `pnpm generate-jwt-secrets`.

### Erreur: "Stripe webhook signature verification failed"

Vérifier que `STRIPE_WEBHOOK_SECRET` correspond au secret du webhook configuré dans Stripe.

### Port déjà utilisé

Changer le port dans `apps/api/.env` :
```env
PORT=4001  # Au lieu de 4000
```

Penser à mettre à jour `VITE_API_URL` dans `apps/web/.env`.

---

## 📚 Documentation supplémentaire

- [`DEMARRAGE-RAPIDE.md`](DEMARRAGE-RAPIDE.md) - Guide de démarrage rapide
- [`docs/architecture.md`](docs/architecture.md) - Architecture du projet
- [`docs/api.md`](docs/api.md) - Documentation de l'API
- [`docs/design-system.md`](docs/design-system.md) - Design system
- [`FONCTIONNALITES-IMPLÉMENTÉES.md`](FONCTIONNALITES-IMPLÉMENTÉES.md) - Liste des fonctionnalités

---

## 🔐 Sécurité

⚠️ **IMPORTANT** : Ne jamais commiter les fichiers `.env` dans Git !

Les fichiers `.env` sont déjà dans `.gitignore`, mais vérifier qu'ils ne sont pas trackés :

```bash
git check-ignore apps/api/.env apps/web/.env
```

Si la commande ne retourne rien, les fichiers sont ignorés (c'est bien).

---

## 📞 Support

En cas de problème :
1. Vérifier les logs dans les terminaux
2. Vérifier que tous les services sont démarrés
3. Vérifier les variables d'environnement
4. Consulter la documentation dans le dossier `docs/`

---

**Dernière mise à jour** : Janvier 2025

