# 🔐 Comptes de test SOINS+

Tous les comptes de test utilisent le **même mot de passe** : `SoinsPlus2025!`

---

## 👤 Comptes principaux

### 🔴 Administrateur
- **Email** : `admin@soins.plus`
- **Mot de passe** : `SoinsPlus2025!`
- **Rôle** : Admin
- **Accès** : Administration complète (dashboard, formations, utilisateurs, analytics, etc.)

### 👨‍🏫 Formateur 1
- **Email** : `formateur@soins.plus`
- **Mot de passe** : `SoinsPlus2025!`
- **Rôle** : User (avec profil formateur)
- **Accès** : Espace formateur (formations assignées, validation présences)

### 👨‍🏫 Formateur 2
- **Email** : `formateur2@soins.plus`
- **Mot de passe** : `SoinsPlus2025!`
- **Rôle** : User (avec profil formateur)
- **Accès** : Espace formateur

### 👤 Utilisateur standard
- **Email** : `utilisateur@soins.plus`
- **Mot de passe** : `SoinsPlus2025!`
- **Rôle** : User
- **Accès** : Espace utilisateur (catalogue, mes formations, profil)

---

## 🎭 Comptes mockés (avec données de test)

### 🔴 Admin Mock (recommandé pour tester l'admin)
- **Email** : `adminmock@soins.plus`
- **Mot de passe** : `SoinsPlus2025!`
- **Rôle** : Admin
- **Accès** : Administration complète
- **Données** :
  - ✅ 2 formations complétées avec certificats
  - 🔄 1 formation en cours (66% complétée)
  - 📅 2 formations à venir
  - 🎫 3 tickets juridiques (résolu, en cours, ouvert)

### 👤 User Mock (recommandé pour tester l'utilisateur)
- **Email** : `usermock@soins.plus`
- **Mot de passe** : `SoinsPlus2025!`
- **Rôle** : User
- **Accès** : Espace utilisateur uniquement
- **Données** :
  - ✅ 2 formations complétées avec certificats
  - 🔄 1 formation en cours (33% complétée)
  - 📅 2 formations à venir
  - 🎫 Plusieurs tickets juridiques

---

## 📋 Récapitulatif rapide

| Email | Mot de passe | Rôle | Usage recommandé |
|-------|--------------|------|------------------|
| `admin@soins.plus` | `SoinsPlus2025!` | Admin | Administration de base |
| `adminmock@soins.plus` | `SoinsPlus2025!` | Admin | **Test admin avec données** ⭐ |
| `formateur@soins.plus` | `SoinsPlus2025!` | User | Test formateur |
| `formateur2@soins.plus` | `SoinsPlus2025!` | User | Test formateur |
| `utilisateur@soins.plus` | `SoinsPlus2025!` | User | Test utilisateur de base |
| `usermock@soins.plus` | `SoinsPlus2025!` | User | **Test utilisateur avec données** ⭐ |

---

## 🚀 Comment utiliser ces comptes

1. **Lancer l'application** :
   ```bash
   pnpm dev
   ```

2. **Ouvrir le frontend** : http://localhost:5173

3. **Se connecter** avec l'un des comptes ci-dessus

4. **Tester les fonctionnalités** selon le rôle :
   - **Admin** : Dashboard analytics, gestion formations, gestion utilisateurs, tickets juridiques
   - **Formateur** : Formations assignées, validation présences
   - **Utilisateur** : Catalogue, inscriptions, progression, certificats

---

## ⚠️ Important

- Ces comptes sont créés automatiquement lors du `pnpm prisma seed`
- Le mot de passe est le même pour tous : `SoinsPlus2025!`
- Les comptes mockés (`adminmock` et `usermock`) contiennent des données de test complètes
- Pour créer ces comptes, exécutez :
  ```bash
  cd apps/api
  pnpm prisma seed
  ```

---

## 🔍 Vérifier les comptes dans la base de données

Pour vérifier que les comptes existent :

```bash
cd apps/api
pnpm prisma studio
```

Ou utiliser le script de test :

```bash
cd apps/api
tsx prisma/test-login.ts
```

---

**Dernière mise à jour** : Janvier 2025

