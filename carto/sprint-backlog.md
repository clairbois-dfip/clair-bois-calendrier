# Sprint Backlog — carto-clairbois

**Projet** : Cartographie interactive des places de stage — Fondation Clair-Bois
**Scrum Master** : Miles Karim Rochat
**Date de création** : 21 avril 2026
**Statut** : Sprint 1 en cours

---

## Product Vision

Un board interne visuel — façon "plan de table de mariage" — permettant à Karavia et aux coordinateurs de la Fondation Clair-Bois de visualiser en un coup d'oeil l'occupation des places de stage par secteur. Chaque secteur est une table, chaque place est un siège coloré (vert = libre, rouge = occupé). L'outil est séparé du formulaire d'inscription existant, protégé par mot de passe, et destiné à un usage 100% interne.

---

## User Stories

### US-01 — Vue principale des secteurs

**En tant que** coordinatrice (Karavia),
**je veux** voir une grille de blocs représentant chaque secteur avec un décompte places libres / occupées et un code couleur global,
**afin de** identifier en un coup d'oeil les secteurs saturés ou disponibles sans avoir à ouvrir SharePoint.

**Critères d'acceptation :**
- [ ] Les 6 secteurs sont affichés sous forme de cartes : Restauration, Lingerie, Cuisine, Technique, Éducatif pôle adulte, Éducatif pôle enfance-adolescence
- [ ] Chaque carte affiche : nom du secteur, nombre de places libres, nombre de places occupées, total
- [ ] Couleur de la carte : vert si au moins 1 place libre, orange si < 20% libres, rouge si tout est occupé
- [ ] L'affichage est lisible sur écran d'ordinateur (pas mobile-first pour cet outil interne)

---

### US-02 — Zoom secteur avec places individuelles

**En tant que** coordinatrice,
**je veux** cliquer sur un secteur pour voir toutes les places individuelles avec leur état (libre/occupé),
**afin de** choisir où placer un nouveau stagiaire ou vérifier la disponibilité précise.

**Critères d'acceptation :**
- [ ] Un clic sur une carte secteur ouvre une vue détaillée (modal ou panneau latéral)
- [ ] Chaque place est représentée par un "siège" coloré : vert = libre, rouge = occupé
- [ ] Les places libres et occupées sont clairement distinguables sans dépendre uniquement de la couleur (label ou icône accessible)
- [ ] Un bouton "Retour" ou fermeture permet de revenir à la vue principale

---

### US-03 — Popup d'informations sur une place occupée

**En tant que** coordinatrice,
**je veux** survoler (hover) ou cliquer une place occupée pour voir le détail du stagiaire,
**afin de** connaître rapidement qui occupe cette place et jusqu'à quand.

**Critères d'acceptation :**
- [ ] Hover ou clic sur une place occupée affiche un tooltip / popover
- [ ] Le popover contient : prénom + nom du stagiaire, dates de début et fin, type de stage (CEA / Formation pratique / AFP-CFC / Stage)
- [ ] Le popover se ferme en cliquant ailleurs ou en quittant le survol
- [ ] Sur une place libre, le popover indique simplement "Place disponible"

---

### US-04 — Types de places

**En tant que** coordinatrice,
**je veux** distinguer visuellement le type de stage associé à chaque place,
**afin de** comprendre quelle catégorie d'apprenant est placée dans quel secteur.

**Critères d'acceptation :**
- [ ] Les 4 types sont supportés : CEA, Formation pratique (FP), AFP/CFC, Stage
- [ ] Chaque type a une couleur de badge ou une icône distincte visible dans le popover
- [ ] Un filtre ou une légende est disponible sur la vue principale

---

### US-05 — Authentification par mot de passe

**En tant qu'** administrateur interne,
**je veux** protéger l'accès au board par un mot de passe simple,
**afin d'** éviter qu'un utilisateur externe accède aux données des stagiaires.

**Critères d'acceptation :**
- [ ] Une page de login s'affiche avant tout contenu
- [ ] Saisie d'un mot de passe unique (pas de gestion de comptes)
- [ ] Le mot de passe est vérifié côté client (sprint 1 : hash SHA-256 dans les env vars)
- [ ] La session est maintenue via `sessionStorage` (disparaît à la fermeture du navigateur)
- [ ] Après 3 tentatives échouées, un délai de 10 secondes est imposé

---

### US-06 — Connexion SharePoint via Power Automate

**En tant que** coordinatrice,
**je veux** que le board se mette à jour automatiquement quand je confirme un stage dans SharePoint,
**afin de** ne pas avoir à mettre à jour manuellement deux outils distincts.

**Critères d'acceptation :**
- [ ] Un flux Power Automate pousse les données de placement vers un endpoint ou un fichier JSON accessible
- [ ] Le board recharge les données au moins toutes les 5 minutes (polling)
- [ ] Les stages normaux uniquement sont affichés (pas les modules métiers)
- [ ] En cas d'erreur de fetch, un message discret informe l'utilisateur sans bloquer l'affichage

---

### US-07 — Vue temporelle : semaine en cours

**En tant que** coordinatrice,
**je veux** que le board affiche les occupations de la semaine en cours par défaut,
**afin de** voir l'état actuel sans avoir à filtrer manuellement.

**Critères d'acceptation :**
- [ ] Par défaut, seuls les stages actifs cette semaine sont comptabilisés comme "occupés"
- [ ] La semaine affichée est visible (ex : "Semaine du 21 au 25 avril 2026")
- [ ] Une navigation semaine précédente / semaine suivante est disponible (optionnelle sprint 1, mock data)

---

## Sprint 1 — Scope (MVP avec mock data)

**Objectif** : board fonctionnel et démontrable à Karavia avec données fictives, sans connexion SharePoint.

**Durée estimée** : 2–3 jours de développement

### Stories incluses dans Sprint 1

| Story | Priorité | Estimation | Statut |
|-------|----------|------------|--------|
| US-01 — Vue principale secteurs | Must have | 3h | A faire |
| US-02 — Zoom secteur / places individuelles | Must have | 4h | A faire |
| US-03 — Popup stagiaire | Must have | 2h | A faire |
| US-04 — Types de places (légende + badge) | Should have | 1h | A faire |
| US-05 — Auth mot de passe simple | Must have | 2h | A faire |
| US-07 — Affichage semaine en cours | Could have | 1h | A faire |

**Total estimé : ~13h**

### Ce qui est explicitement hors scope Sprint 1

- Connexion SharePoint / Power Automate (US-06)
- Déploiement en production
- Navigation multi-semaines complète
- Gestion des modules métiers (volontairement exclus)
- Export PDF ou impression

### Mock data Sprint 1

Fichier `src/data/mock-placements.json` avec :
- 6 secteurs, ~5–10 places par secteur
- Stagiaires fictifs avec prénoms et noms anonymisés (ex : "A. Dubois")
- Dates couvrant la semaine en cours
- Répartition équilibrée libre/occupé pour démonstration

---

## Sprint 2 — Scope (connexion réelle + déploiement)

**Objectif** : board connecté à SharePoint, déployé dans l'infrastructure Clair-Bois, utilisable en production.

**Durée estimée** : 3–4 jours de développement + coordination IT

### Stories incluses dans Sprint 2

| Story | Priorité | Estimation | Notes |
|-------|----------|------------|-------|
| US-06 — Connexion SharePoint via Power Automate | Must have | 6h | Nouveau flux PA (polling 5min) |
| US-05 — Auth renforcée (hash côté serveur ou Azure) | Should have | 3h | Remplace auth client-only |
| Déploiement (Azure SWA ou GitHub Pages) | Must have | 2h | Selon décision réunion IT |
| Documentation utilisateur (guide Karavia) | Must have | 1h | 1 page max, captures d'écran |
| Navigation semaines (précédente / suivante) | Could have | 2h | Si demandée par Karavia |
| Refresh automatique visible (indicateur) | Should have | 1h | Timestamp "dernière mise à jour" |

**Total estimé : ~15h**

### Points de coordination Sprint 2

- Valider avec l'équipe IT (Benoit & José) l'hébergement cible
- Créer le flux Power Automate de cartographie (distinct du Flux 3 planning.json)
- Confirmer avec Karavia les colonnes SharePoint à exposer (nom, dates, secteur, type)
- S'assurer que les données personnelles des stagiaires sont traitées conformément aux règles internes

---

## Definition of Done

### DoD globale (applicable à toutes les stories)

- [ ] La story est développée, testée manuellement dans le navigateur
- [ ] Le code est committé sur la branche `carto-dev` (pas directement sur `main`)
- [ ] Les composants React sont en français (labels, placeholders, messages d'erreur)
- [ ] Aucune donnée personnelle réelle dans le code source ou les commits
- [ ] Pas de `console.error` non traité en production
- [ ] Le composant s'affiche correctement sur un écran 1920x1080 (usage bureau interne)

### DoD Sprint 1 spécifique

- [ ] Le board est navigable avec mock data sans erreur
- [ ] La démo est faisable devant Karavia en 5 minutes
- [ ] Le fichier mock data est facilement remplaçable par des données réelles (interface claire)

### DoD Sprint 2 spécifique

- [ ] Les données affichées correspondent à celles de SharePoint (vérification croisée)
- [ ] Le mot de passe de production n'est pas dans le code source (variable d'environnement)
- [ ] Karavia peut accéder au board depuis son poste Clair-Bois sans intervention technique

---

## Architecture technique

### Stack Sprint 1

| Couche | Choix | Justification |
|--------|-------|---------------|
| Framework | React 19 + Vite | Cohérent avec le frontend existant (`../frontend/`) |
| Styles | Tailwind CSS v4 | Cohérent avec le reste du projet |
| Routing | React Router v7 | Page login + page board |
| State | useState / useContext | Pas de besoin Redux pour cette taille |
| Data Sprint 1 | JSON statique (`mock-placements.json`) | Pas de backend requis pour le MVP |
| Data Sprint 2 | fetch polling sur endpoint Power Automate | Cohérent avec l'archi existante (Flux 3) |
| Auth | SHA-256 hash en env var (Sprint 1) | Simple, suffisant pour usage interne |
| Déploiement | GitHub Pages (Sprint 1) / Azure SWA (Sprint 2) | Selon décision IT |

### Structure des fichiers

```
carto/
├── sprint-backlog.md         ← Ce fichier
├── src/
│   ├── main.jsx
│   ├── App.jsx               ← Router : /login → /board
│   ├── components/
│   │   ├── LoginPage.jsx     ← Auth mot de passe
│   │   ├── BoardView.jsx     ← Grille des secteurs (US-01)
│   │   ├── SecteurCard.jsx   ← Carte d'un secteur
│   │   ├── SecteurModal.jsx  ← Vue détaillée places (US-02)
│   │   ├── PlaceTooltip.jsx  ← Popup stagiaire (US-03)
│   │   ├── WeekHeader.jsx    ← Affichage semaine (US-07)
│   │   └── Legende.jsx       ← Codes couleur et types
│   ├── data/
│   │   └── mock-placements.json  ← Mock data Sprint 1
│   ├── hooks/
│   │   └── usePlacements.js  ← Fetch data (mock ou API)
│   └── utils/
│       └── auth.js           ← Logique mot de passe
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### Schéma de données (mock-placements.json)

```json
{
  "semaine": "2026-04-21",
  "secteurs": [
    {
      "id": "restauration",
      "nom": "Restauration",
      "capacite": 8,
      "places": [
        {
          "id": "rest-01",
          "statut": "occupee",
          "stagiaire": {
            "prenom": "A.",
            "nom": "Dubois",
            "dateDebut": "2026-04-14",
            "dateFin": "2026-04-25",
            "typeStage": "FP"
          }
        },
        {
          "id": "rest-02",
          "statut": "libre",
          "stagiaire": null
        }
      ]
    }
  ]
}
```

**Types de stage valides** : `"CEA"` | `"FP"` | `"AFP_CFC"` | `"Stage"`

---

## Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Colonnes SharePoint non exposables (RGPD interne) | Moyen | Haut | Confirmer avec IT avant Sprint 2 |
| Karavia change le périmètre des secteurs | Moyen | Moyen | Mock data extensible, secteurs en config |
| Délai validation Azure SWA par IT | Haut | Moyen | GitHub Pages comme fallback Sprint 2 |
| Données personnelles dans le code | Faible | Haut | Jamais de vraies données en dev, mock only |

---

## Références

- Réunion Karavia du 13 avril 2026 : `docs/transcription-karavia3.txt`
- Prototype cartographie existant : `travail/projets/portfolio-miles/` (composant `network-canvas`)
- Architecture flux : `docs/architecture-nouvelle.md`
- Frontend existant (référence stack) : `../frontend/`
