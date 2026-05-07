# Clair-Bois Calendrier

Calendrier interactif des disponibilités de stage de la **Fondation Clair-Bois** (Genève, Suisse).

## Description

Ce site web permet aux référents externes (écoles spécialisées, assurances, AI) de consulter les disponibilités de stage dans les différents établissements et secteurs de la Fondation Clair-Bois, qui accompagne des personnes en situation de handicap dans leur réorientation professionnelle.

## Fonctionnalités

- Vue par établissement et par secteur
- Calendrier mensuel avec code couleur (vert/orange/rouge/gris)
- Gestion des créneaux chevauchants (agrégation et affichage multi-créneaux)
- Vue détaillée par semaine avec barre de progression
- Lien d'inscription vers Microsoft Forms (pré-rempli)
- Boutons "Ajouter" pour les référents cadres (établissement, secteur, créneau)
- 100% dynamique : piloté par un fichier `planning.json` généré automatiquement
- Responsive mobile-first
- Accessible (WCAG AA)

## Stack technique

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- Hébergé sur [GitHub Pages](https://pages.github.com/)

## Installation

```bash
npm install
npm run dev
```

## Déploiement

```bash
npm run build
```

Le dossier `dist/` est déployé automatiquement sur GitHub Pages via GitHub Actions.

## Pipeline automatique

1. Un référent cadre crée un créneau via le formulaire Microsoft Forms "Gestion des créneaux"
2. **Flux 2 (Power Automate)** traite la soumission et met à jour la liste SharePoint "Creneaux"
3. **Flux 3 (Power Automate)** se déclenche automatiquement, recalcule les disponibilités et pousse `planning.json` sur ce repo
4. GitHub Pages redéploie → le site affiche les nouvelles données

Le fichier `public/planning.json` est donc **généré automatiquement** — ne pas le modifier manuellement.

## Licence

Projet interne — Fondation Clair-Bois, Genève.
