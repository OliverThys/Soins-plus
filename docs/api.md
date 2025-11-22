# API SOINS+

Base URL : `https://api.soins-plus.com/v1`

## Authentification

| Méthode | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Inscription + création abonnement Stripe |
| POST | `/auth/login` | Connexion |
| POST | `/auth/refresh` | Renouvellement token |
| POST | `/auth/password/forgot` | Envoi email reset |
| POST | `/auth/password/reset` | Reset mot de passe |

## Utilisateurs

- `GET /me` : profil courant
- `PATCH /me` : mise à jour profil (+ upload diplôme)
- `GET /me/trainings` : formations (en cours, terminées, à venir)
- `GET /me/certificates/:id` : téléchargement PDF

## Catalogue

- `GET /trainings` avec query `type`, `theme`, `accreditation`, `date`, `search`
- `GET /trainings/:id`
- `POST /trainings/:id/enroll` (auth + abonnement actif)

## Parcours vidéo

- `GET /trainings/:id/chapters`
- `POST /trainings/:id/chapters/:chapterId/progress`
- `POST /trainings/:id/quiz/submit`

## Administration

- `POST /admin/trainings` CRUD complet
- `POST /admin/trainings/:id/chapters`
- `POST /admin/trainings/:id/quiz`
- `GET /admin/trainings/:id/participants?format=csv|pdf`
- `POST /admin/trainers` CRUD
- `GET /admin/users`
- `PATCH /admin/users/:id` activation/suppression
- `POST /admin/content/news` CRUD news & FAQ

## Interface Formateur

- `GET /trainer/trainings`
- `GET /trainer/trainings/:id/participants`
- `POST /trainer/trainings/:id/attendance`

## Webhooks

- `POST /webhooks/stripe` : événements abonnements/facturation
- `POST /webhooks/postmark` : bounce/spam

## Statut

- `/healthz` : dépendances externes
- `/readyz` : migrations appliquées

