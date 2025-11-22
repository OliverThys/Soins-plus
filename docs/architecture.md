# Architecture SOINS+

## Vue d'ensemble

- **Frontend** : React + Vite + React Router. Trois espaces (utilisateur, administration, formateur) pilotés par des layouts distincts, mais partagent un design system commun (`packages/shared/ui`).
- **Backend** : Fastify + Prisma + PostgreSQL. Architecture hexagonale avec modules `auth`, `billing`, `catalog`, `learning`, `legal`, `messaging`, `content`.
- **Infra** : Azure App Service (API) + Azure PostgreSQL + Vercel (frontend). Stockage fichiers diplômes dans Azure Blob (SAS). Monitoring Sentry + logs Azure Monitor.

## Flux critiques

1. **Inscription / abonnement**
   - Upload diplôme → Blob storage (scan antivirus) → URL stockée.
   - Création utilisateur + Stripe Checkout → webhook `customer.subscription.created`.
   - Postmark envoie confirmation + déclenchement Clarity tag côté front.

2. **Parcours vidéo**
   - Lecture vidéo (Mux player) → progression par chapitres via events.
   - Lancement = validation auto. QCM final (seuil paramétrable).
   - Si réussite → génération PDF (PDFKit) + email Postmark + stockage historique.

3. **Administration formations**
   - CRUD formations + chapitres + QCM via interface React admin.
   - Export listes participants en CSV/PDF via service `reporting`.
   - Formateurs valident présences → déclenchement attestation.

## Sécurité

- JWT access 15 min + refresh 7 jours, stockage httpOnly + rotation.
- Chiffrement champ `nationalRegistry` (numéro INAMI) avec `crypto.scrypt`.
- Scan antivirus sur upload diplôme (hook stub + TODO ClamAV/Azure Defender).
- RGPD : registre traitements + suppression compte (droit à l'oubli) via job queue.

## Performance

- Front : code-splitting par rôle, Suspense + lazy routes.
- API : cache Redis (à brancher) pour catalogue + actualités.
- Jobs asynchrones via BullMQ (emails, PDF, rappels).

## Monitoring

- Sentry (front + back) initialisé au bootstrap.
- Microsoft Clarity injecté côté utilisateur uniquement.
- Healthchecks `/healthz` + `/readyz` pour Azure.

