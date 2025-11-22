# Liste des fonctionnalités manquantes - SOINS+

Comparaison avec l'offre Sparkle - Ordre logique de conception

## Phase 1 : Fondations & Infrastructure

### 1.1. Configuration et services tiers
- [ ] **Upload réel de diplôme** (actuellement juste un champ URL)
  - Intégration Azure Blob Storage ou S3
  - Interface d'upload avec drag & drop
  - Validation du format (PDF, images)
  - Scan antivirus (ClamAV ou Azure Defender)
  - Génération d'URL signée (SAS) pour accès sécurisé

- [ ] **Intégration Microsoft Clarity**
  - Injection du script Clarity côté frontend
  - Configuration des événements personnalisés
  - Tracking des conversions (inscriptions, abonnements)

- [ ] **Service d'envoi d'emails Postmark complet**
  - Configuration Postmark
  - Templates d'emails (confirmation inscription, rappels, attestations)
  - Gestion des bounces et spam
  - Webhook Postmark pour gestion des bounces

### 1.2. Page vitrine / Landing page
- [ ] **Page d'accueil publique optimisée**
  - Présentation claire de SOINS+
  - Call-to-action pour inscription
  - Design conforme à l'offre Sparkle
  - Responsive mobile-first

## Phase 2 : Authentification & Abonnements

### 2.1. Intégration Stripe complète
- [ ] **Création session Stripe Checkout lors de l'inscription**
  - Création du customer Stripe
  - Génération de la session Checkout
  - Redirection vers Stripe
  - Gestion du retour après paiement

- [ ] **Gestion de l'abonnement utilisateur**
  - Page de gestion d'abonnement
  - Mettre fin à l'abonnement (annulation)
  - Changer de plan (mensuel/annuel)
  - Voir l'historique des paiements

- [ ] **Notifications de renouvellement d'abonnement**
  - Email automatique avant renouvellement (7 jours avant)
  - Email de confirmation après renouvellement
  - Email d'alerte en cas d'échec de paiement

- [ ] **Webhooks Stripe complets**
  - `customer.subscription.deleted` (gestion annulation)
  - `invoice.payment_succeeded` (confirmation paiement)
  - `invoice.payment_failed` (notification échec)
  - `customer.subscription.updated` (changement de plan)

### 2.2. Gestion du profil utilisateur
- [ ] **Modification complète du profil**
  - Édition nom, prénom, pseudo, téléphone
  - Modification du mot de passe
  - Upload/modification du diplôme
  - Validation des modifications

## Phase 3 : Module Formation - Fonctionnalités utilisateur

### 3.1. Catalogue de formations
- [ ] **Badge "NOUVEAU" sur les formations récentes**
  - Logique de détection (formations créées < 30 jours)
  - Affichage visuel du badge

- [ ] **Amélioration de la recherche et filtres**
  - Recherche full-text optimisée
  - Filtres combinables (type + accréditation + date + thème)
  - Tri par pertinence, date, popularité

### 3.2. Parcours vidéo
- [ ] **Lecteur vidéo amélioré**
  - Contrôles avancés (vitesse lecture, sous-titres)
  - Timeline avec marqueurs de chapitres
  - Mode plein écran optimisé
  - Sauvegarde automatique de la position

- [ ] **Progression détaillée**
  - Indicateur visuel par chapitre
  - Pourcentage de complétion global
  - Temps restant estimé

### 3.3. Statistiques et suivi
- [ ] **Statistiques générales utilisateur**
  - Nombre de formations (en cours, terminées, à venir)
  - Heures de formation complétées
  - Objectif annuel et progression
  - Graphiques de progression

### 3.4. Rappels automatiques
- [ ] **Système de rappels email complet**
  - Rappel 7 jours avant formation présentielle
  - Rappel 1 jour avant formation présentielle
  - Rappel pour formations vidéo non complétées
  - Configuration des préférences de rappels

## Phase 4 : Module Formation - Administration

### 4.1. Gestion des formations
- [ ] **CRUD complet des formations**
  - Création avec tous les champs requis
  - Édition complète
  - Suppression avec confirmation
  - Duplication de formation

- [ ] **Gestion des chapitres vidéo**
  - Upload de vidéos par chapitre
  - Réorganisation des chapitres (drag & drop)
  - Édition des métadonnées (titre, durée, description)

- [ ] **Gestion des QCM**
  - Interface complète de création/édition QCM
  - Gestion des questions multiples
  - Configuration du seuil de validation
  - Prévisualisation du QCM

### 4.2. Gestion des participants
- [ ] **Export des listes de participants**
  - Export CSV avec toutes les données
  - Export PDF formaté
  - Filtres par statut (inscrit, présent, absent)
  - Export par formation ou global

- [ ] **Gestion avancée des présences**
  - Marquage en masse
  - Import de présence (CSV)
  - Historique des modifications

### 4.3. Génération d'attestations
- [ ] **Génération automatique améliorée**
  - Template PDF personnalisable
  - Informations complètes (date, durée, formateur)
  - Signature numérique
  - Envoi automatique par email après validation

## Phase 5 : Interface Formateur

### 5.1. Dashboard formateur
- [ ] **Vue d'ensemble des formations assignées**
  - Liste des formations à venir
  - Nombre de participants par formation
  - Actions rapides (valider présence, envoyer attestation)

### 5.2. Validation des présences
- [ ] **Interface de validation optimisée**
  - Liste des participants avec photos/profils
  - Validation individuelle ou en masse
  - Commentaires optionnels
  - Déclenchement automatique de l'attestation

## Phase 6 : Module Juridique

### 6.1. FAQ juridique
- [ ] **Gestion complète du contenu FAQ**
  - CRUD complet (création, édition, suppression)
  - Catégorisation avancée
  - Recherche dans la FAQ
  - Statistiques de consultation

### 6.2. Formulaire de contact juridique
- [ ] **Système de tickets/rendez-vous**
  - Enregistrement des demandes
  - Suivi des demandes
  - Notifications admin
  - Intégration avec système de rendez-vous

## Phase 7 : Actualités & Contenu

### 7.1. Gestion des actualités
- [ ] **CRUD complet des actualités**
  - Édition avec formatage riche (WYSIWYG)
  - Images et médias
  - Planification de publication
  - Catégories et tags

- [ ] **Affichage optimisé**
  - Page détail d'une actualité
  - Partage social
  - Archives par date/catégorie

## Phase 8 : Monitoring & Analytics

### 8.1. Outils de monitoring
- [ ] **Sentry complet**
  - Configuration des alertes
  - Groupement des erreurs
  - Performance monitoring
  - Release tracking

- [ ] **Microsoft Clarity**
  - Heatmaps
  - Session recordings
  - Analytics comportementaux
  - Funnels de conversion

### 8.2. Dashboard analytics admin
- [ ] **Statistiques d'utilisation**
  - Nombre d'utilisateurs actifs
  - Formations les plus populaires
  - Taux de complétion
  - Revenus (abonnements)

## Phase 9 : Optimisations & Finitions

### 9.1. Performance
- [ ] **Cache Redis**
  - Cache du catalogue de formations
  - Cache des actualités
  - Cache des statistiques

- [ ] **Optimisation des images**
  - Compression automatique
  - Formats modernes (WebP, AVIF)
  - Lazy loading

### 9.2. UX/UI
- [ ] **Design system complet**
  - Composants réutilisables
  - Animations et transitions
  - Accessibilité (WCAG 2.1)

- [ ] **Responsive mobile**
  - Optimisation mobile-first
  - Navigation tactile
  - Performance mobile

### 9.3. Sécurité
- [ ] **Renforcement sécurité**
  - Rate limiting
  - CSRF protection
  - Validation stricte des inputs
  - Audit de sécurité

---

## Résumé par priorité

### 🔴 Critique (MVP)
1. Upload réel de diplôme
2. Intégration Stripe Checkout complète
3. Gestion d'abonnement (annulation)
4. Notifications de renouvellement
5. Rappels automatiques formations
6. Export CSV/PDF participants
7. Microsoft Clarity

### 🟡 Important (Post-MVP)
8. Statistiques utilisateur complètes
9. Gestion QCM complète
10. Template PDF personnalisable
11. Postmark complet
12. Page vitrine optimisée

### 🟢 Amélioration (Nice to have)
13. Cache Redis
14. Dashboard analytics admin
15. Système de tickets juridique
16. Formatage riche actualités

