<div align="center">

# <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#2563eb"/><path d="M2 17L12 22L22 17" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> SOINS+

**Plateforme cloud de formation continue dédiée aux prestataires de soins indépendants en Belgique**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-202020?logo=fastify&logoColor=white)](https://www.fastify.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?logo=Stripe&logoColor=white)](https://stripe.com/)

</div>

---

## <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 3V21M3 9H21" stroke="currentColor" stroke-width="2"/></svg> Vue d'ensemble

SOINS+ est une plateforme complète de formation continue conçue spécifiquement pour les prestataires de soins indépendants en Belgique. Cette solution MVP offre un système de gestion de formations, d'abonnements et d'administration complet.

### <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Architecture Monorepo

| Dossier | Description | Technologies |
| --- | --- | --- |
| `apps/api` | Backend API REST | Fastify + Prisma + Stripe/Postmark/Sentry |
| `apps/web` | Frontend React | React + Vite (utilisateur, admin, formateur) |
| `packages/shared` | Code partagé | Types TypeScript, schémas Zod, SDK API |
| `infra/ci` | CI/CD | GitHub Actions (déploiement Azure/Vercel) |
| `docs/` | Documentation | API, architecture, design system |

---

## <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Fonctionnalités principales

### <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#10b981"/></svg> Authentification & Sécurité
- Inscription avec upload de diplôme (scan antivirus ClamAV)
- Authentification JWT avec refresh tokens
- Chiffrement des données sensibles (numéro INAMI)
- Conformité RGPD

### <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#10b981"/></svg> Abonnements & Paiements
- Intégration Stripe complète (Checkout + Billing Portal)
- Plans mensuels et annuels
- Gestion des abonnements et historique des paiements
- Webhooks Stripe automatisés

### <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#10b981"/></svg> Catalogue de Formations
- Catalogue complet avec filtres avancés (type, accréditation, date, thème)
- Recherche en temps réel
- Gestion des formations vidéo, présentielles et distancielles
- Badges "NOUVEAU" et statuts d'accréditation

### <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#10b981"/></svg> Parcours d'Apprentissage
- Navigation par chapitres avec lecteur vidéo
- Validation automatique de progression
- QCM avec seuil configurable (défaut 80%)
- Génération automatique d'attestations PDF
- Historique complet des formations

### <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#10b981"/></svg> Administration
- Dashboard analytics avec graphiques
- Gestion complète des formations (CRUD)
- Duplication de formations
- Réorganisation drag & drop des chapitres
- Import de présences via CSV
- Export de rapports (CSV/PDF)

---

## <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Prérequis

- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/></svg> **Node.js** 20+ 
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/></svg> **pnpm** 9+
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/></svg> **PostgreSQL** 15+ (Supabase/Azure Database)
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/></svg> **Redis** (optionnel, pour le cache)
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/></svg> **ClamAV** (optionnel, pour le scan antivirus)

### Services tiers requis
- **Stripe** (paiements)
- **Postmark** (emails transactionnels)
- **Sentry** (monitoring d'erreurs)
- **Microsoft Clarity** (analytics)

---

## <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M8 5V3C8 2.44772 8.44772 2 9 2H15C15.5523 2 16 2.44772 16 3V5H19C19.5523 5 20 5.44772 20 6C20 6.55228 19.5523 7 19 7H18V19C18 20.1046 17.1046 21 16 21H8C6.89543 21 6 20.1046 6 19V7H5C4.44772 7 4 6.55228 4 6C4 5.44772 4.44772 5 5 5H8ZM10 4V5H14V4H10ZM8 7V19H16V7H8Z" fill="currentColor"/></svg> Installation & Démarrage

### 1. Cloner le dépôt

```bash
git clone https://github.com/OliverThys/Soins-plus.git
cd Soins-plus
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configurer les variables d'environnement

Copiez les fichiers d'exemple et configurez vos variables :

```bash
# Backend
cp apps/api/env.example apps/api/.env

# Frontend
cp apps/web/env.example apps/web/.env
```

Consultez les fichiers `env.example` pour la liste complète des variables requises.

### 4. Configurer la base de données

```bash
cd apps/api
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma seed
```

### 5. Lancer l'application

```bash
# Depuis la racine du projet
pnpm dev  # Lance l'API et le frontend simultanément
```

L'API sera accessible sur `http://localhost:3000` et le frontend sur `http://localhost:5173`.

---

## <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg> Scripts disponibles

```bash
# Développement
pnpm dev              # Lance API + frontend en mode développement

# Build
pnpm build            # Build de tous les packages

# Qualité de code
pnpm lint             # Lint de tous les packages
pnpm format           # Formatage avec Prettier
pnpm test             # Exécution des tests

# Base de données (depuis apps/api)
pnpm prisma migrate   # Créer une migration
pnpm prisma generate  # Générer le client Prisma
pnpm prisma seed      # Peupler la base de données
```

---

## <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Stack technique

### Frontend
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><rect x="3" y="3" width="18" height="18" rx="2" fill="#61DAFB"/><path d="M12 8V16M8 12H16" stroke="white" stroke-width="2" stroke-linecap="round"/></svg> **React 18** - Bibliothèque UI
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#646CFF"/></svg> **Vite** - Build tool et dev server
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#CA4245"/></svg> **React Router** - Routing
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FF4154"/></svg> **TanStack Query** - Gestion d'état serveur
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FF6B6B"/></svg> **Recharts** - Visualisation de données

### Backend
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#202020"/></svg> **Fastify** - Framework web rapide
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#2D3748"/></svg> **Prisma** - ORM moderne
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#336791"/></svg> **PostgreSQL** - Base de données relationnelle
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#DC382D"/></svg> **Redis** - Cache et queues
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#F59E0B"/></svg> **BullMQ** - Gestion de queues

### Services & Outils
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#626CD9"/></svg> **Stripe** - Paiements
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FFD700"/></svg> **Postmark** - Emails transactionnels
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#362D59"/></svg> **Sentry** - Monitoring d'erreurs
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#0078D4"/></svg> **Microsoft Clarity** - Analytics

---

## <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Déploiement

### API (Azure App Service)
- Déploiement via Docker via `infra/ci/api-deploy.yml`
- Migrations Prisma automatisées (`pnpm prisma migrate deploy`)
- Variables d'environnement configurées dans Azure Portal

### Frontend (Vercel)
- Déploiement automatique via `infra/ci/web-deploy.yml`
- Build optimisé avec Vite
- Variables d'environnement préfixées `VITE_`

### Infrastructure
- **Base de données** : PostgreSQL (Supabase/Azure Database)
- **Stockage** : Azure Blob Storage (diplômes avec SAS)
- **Cache** : Redis (optionnel)
- **Monitoring** : Sentry + Azure Monitor

---

## <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Documentation

- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/></svg> [`docs/architecture.md`](docs/architecture.md) - Diagrammes et flux métiers
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/></svg> [`docs/api.md`](docs/api.md) - Endpoints REST et webhooks
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/></svg> [`docs/design-system.md`](docs/design-system.md) - Fondations UI
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/></svg> [`DEMARRAGE-RAPIDE.md`](DEMARRAGE-RAPIDE.md) - Guide de démarrage rapide
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/></svg> [`FONCTIONNALITES-IMPLÉMENTÉES.md`](FONCTIONNALITES-IMPLÉMENTÉES.md) - Liste des fonctionnalités

---

## <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg> Sécurité & Conformité

- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#10b981"/></svg> **RGPD** : Stockage UE, champs chiffrés (INAMI, diplômes)
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#10b981"/></svg> **HTTPS** obligatoire (certificats gérés par l'hébergeur)
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#10b981"/></svg> **Scan antivirus** sur upload de diplômes (ClamAV)
- <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#10b981"/></svg> **JWT** avec rotation de tokens et refresh automatique

---

## <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Roadmap

### <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#10b981"/></svg> Implémenté
- Authentification sécurisée (JWT + refresh)
- Catalogue formations multi-filtres
- Parcours vidéo + QCM + attestations PDF automatiques
- Dashboard analytics admin
- Cache Redis
- Scan antivirus
- Gestion complète des abonnements

### <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 16H11V14H13V16ZM13 12H11V8H13V12Z" fill="#F59E0B"/></svg> En cours
- Gamification et réseau social
- Applications mobiles natives
- Optimisation avancée des images (WebP/AVIF)

---

## <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 16H11V14H13V16ZM13 12H11V8H13V12Z" fill="currentColor"/></svg> Contribution

Les contributions sont les bienvenues ! Merci de respecter le code de conduite et de créer une issue avant de soumettre une pull request majeure.

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Licence

Ce projet est privé et propriétaire. Tous droits réservés.

---

<div align="center">

**Maintenu avec <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle;"><path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="#ef4444"/></svg> par l'équipe Soins+ Tech**

</div>
