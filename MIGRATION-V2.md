# 🚀 Guide de migration vers la V2

La V1 a été taguée avec `v1.0.0` et est maintenant sécurisée sur GitHub.

---

## 📋 Options pour créer la V2

### Option 1 : Nouvelle branche Git (Recommandée) ⭐

**Avantages** :
- Garde l'historique Git complet
- Facile de revenir à la V1
- Permet de merger des fonctionnalités V1 dans V2 si besoin
- Une seule base de code à maintenir

**Comment faire** :
```bash
# Créer une nouvelle branche v2 depuis main
git checkout -b v2.0.0

# Ou créer une branche v2 depuis le tag v1.0.0
git checkout -b v2.0.0 v1.0.0

# Pousser la branche sur GitHub
git push -u origin v2.0.0
```

**Structure** :
```
main (V1) ──> v1.0.0 (tag)
  └──> v2.0.0 (branche V2)
```

---

### Option 2 : Nouveau dossier dans le même repo

**Avantages** :
- V1 et V2 complètement séparées
- Facile de comparer les deux versions
- Pas de risque de confusion

**Inconvénients** :
- Duplication de code
- Plus difficile à maintenir

**Comment faire** :
```bash
# Créer un dossier v2 à la racine
mkdir v2
cd v2

# Initialiser un nouveau projet ou copier la structure
# (selon votre approche)
```

**Structure** :
```
Soins-plus/
├── apps/          (V1)
├── packages/       (V1)
├── v2/            (V2)
│   ├── apps/
│   └── packages/
└── ...
```

---

### Option 3 : Nouveau dépôt Git séparé

**Avantages** :
- Complètement indépendant
- Historique Git propre pour V2
- Peut utiliser un nom différent (ex: `Soins-plus-v2`)

**Inconvénients** :
- Perte de l'historique V1
- Plus difficile de partager du code entre V1 et V2

**Comment faire** :
```bash
# Créer un nouveau dépôt sur GitHub
# Puis cloner et initialiser
git clone https://github.com/OliverThys/Soins-plus-v2.git
cd Soins-plus-v2
# Copier les fichiers nécessaires depuis V1 si besoin
```

---

### Option 4 : Monorepo avec workspace séparés

**Avantages** :
- V1 et V2 dans le même repo
- Partage de packages communs possible
- Structure claire

**Structure** :
```
Soins-plus/
├── v1/
│   ├── apps/
│   └── packages/
├── v2/
│   ├── apps/
│   └── packages/
└── shared/  (packages partagés)
```

---

## 🎯 Recommandation : Option 1 (Nouvelle branche)

**Pourquoi** :
- ✅ Garde tout l'historique
- ✅ Facile de revenir en arrière
- ✅ Permet de merger des features V1 dans V2
- ✅ Une seule base de code à maintenir
- ✅ Tags et releases clairs

---

## 📝 Étapes pour créer la V2 (Option 1)

### 1. Créer la branche V2

```bash
# Depuis la racine du projet
git checkout -b v2.0.0

# Ou depuis le tag V1 pour un départ propre
git checkout -b v2.0.0 v1.0.0
```

### 2. Mettre à jour les versions dans package.json

```bash
# Mettre à jour la version dans package.json racine
# De "0.1.0" à "2.0.0"
```

### 3. Créer un fichier CHANGELOG.md

```markdown
# Changelog

## [2.0.0] - 2025-01-XX
### Nouveau
- [Décrire les nouvelles fonctionnalités]

### Changements
- [Décrire les changements majeurs]

## [1.0.0] - 2025-01-XX
### Initial Release
- Version MVP complète
```

### 4. Pousser la branche

```bash
git push -u origin v2.0.0
```

### 5. Créer une Pull Request (optionnel)

Sur GitHub, créer une PR de `v2.0.0` vers `main` pour documenter les changements.

---

## 🔄 Workflow recommandé

### Développement V2

```bash
# Travailler sur la branche V2
git checkout v2.0.0

# Faire vos modifications
# ...

# Commiter
git add .
git commit -m "feat: Nouvelle fonctionnalité V2"

# Pousser
git push origin v2.0.0
```

### Si besoin de revenir à V1

```bash
# Revenir à la V1
git checkout main

# Ou revenir au tag V1.0.0
git checkout v1.0.0
```

### Merger des features V1 dans V2

```bash
# Sur la branche V2
git checkout v2.0.0

# Merger une feature de main
git merge main

# Résoudre les conflits si nécessaire
```

---

## 📦 Structure recommandée pour V2

Si vous voulez une structure complètement nouvelle :

```
Soins-plus/
├── apps/
│   ├── api/          (V1 - maintenu)
│   └── web/          (V1 - maintenu)
├── v2/               (Nouveau dossier pour V2)
│   ├── apps/
│   │   ├── api/      (V2 - nouveau)
│   │   └── web/      (V2 - nouveau)
│   └── packages/
└── packages/         (V1 - partagé si besoin)
```

---

## ✅ Checklist avant de commencer V2

- [x] V1 taguée avec `v1.0.0`
- [x] V1 poussée sur GitHub
- [ ] Décider de l'option (recommandé: Option 1)
- [ ] Créer la branche/dossier V2
- [ ] Mettre à jour les versions
- [ ] Créer un CHANGELOG.md
- [ ] Documenter les changements majeurs prévus
- [ ] Créer un README-V2.md avec les objectifs

---

## 🆘 Commandes utiles

```bash
# Voir toutes les branches
git branch -a

# Voir tous les tags
git tag

# Revenir à un tag spécifique
git checkout v1.0.0

# Créer une branche depuis un tag
git checkout -b v2.0.0 v1.0.0

# Comparer V1 et V2
git diff v1.0.0 v2.0.0

# Voir l'historique d'une branche
git log v2.0.0 --oneline
```

---

**Dernière mise à jour** : Janvier 2025

