# Design System SOINS+

## Fondations

- **Typo** : `Inter` (UI), `Source Serif` (titres éditoriaux).
- **Palette** :
  - `primary` `#2F4BFF`
  - `accent` `#31C48D`
  - `warning` `#FFB020`
  - `danger` `#E02424`
  - `neutral` `#0F172A` → `#F8FAFC`
- **Rayons** : 12 px (cards), 999 px (badges).
- **Grille** : 8 px, mobile-first.

## Composants clés

- **AppShell** : header (logo, notifications, switch rôle) + sidebar par rôle.
- **Cards** :
  - `TrainingCard` : image, type, date, badge `NOUVEAU`.
  - `StatsCard` : KPI + mini sparkline.
- **Forms** : basés sur React Hook Form + Zod.
- **Tableaux** : DataGrid virtuel + export CSV/PDF.
- **VideoPlayer** : wrapper autour `react-player` + contrôles requis.
- **Quiz** : radio/checkbox + barre progression.

## Accessibilité

- Contraste min 4.5:1.
- Focus visible + navigation clavier.
- ARIA pour lecteur vidéo et quiz.

## Assets

- Logos exportés en SVG (`apps/web/src/assets`).
- Favicon + manifest PWA minimal.

