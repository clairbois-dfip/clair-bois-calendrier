# Clair-Bois Calendrier — Frontend

## Git

- **Repo** : `rochat-dev/life-system` (mono-repo)
- **Chemin** : `travail/projets/clair-bois-projet/frontend/`
- **Branche de travail** : `rochat-dev` (partagée avec autre PC) — `main` reste stable
- **Pull** : `git -C ~/life-system pull origin rochat-dev`
- **Push** : `git -C ~/life-system push origin rochat-dev`

> Ce sous-projet fait partie de `clair-bois-projet/`. Voir `../CLAUDE.md` pour la vue d'ensemble et le plan d'évolution.

Toujours communiquer en français avec l'utilisateur.

## Qui est le client
Miles, informaticien IT à la Fondation Clair-Bois à Genève (Suisse). Sa mandante est Madame Karavia, coordinatrice des entrées de stagiaires. **Deadline projet : ~30 mars 2026.**

## Contexte métier
La Fondation Clair-Bois accompagne des personnes en situation de handicap dans leur réorientation professionnelle. Ce site est un calendrier interactif anonyme permettant aux **référents externes** (écoles spécialisées, assurances, AI) de consulter les disponibilités de stage dans les différents établissements de la fondation.

### Les acteurs
- **Référents cadres** : responsables de secteur dans chaque établissement. Définissent les capacités d'accueil via le formulaire "Gestion des créneaux".
- **Référents externes** : personnes anonymes (sans compte Microsoft) qui consultent le calendrier pour trouver une place.
- **Madame Karavia** : coordinatrice générale des entrées.

### Structure organisationnelle
Fondation > Établissements > Secteurs > Créneaux de disponibilité (peuvent se chevaucher). Le système est 100% dynamique, piloté par `public/planning.json`.

## Stack technique
- React + Vite
- Tailwind CSS v4 (plugin @tailwindcss/vite)
- Déploiement GitHub Pages (base: `/clair-bois-calendrier/`)
- Pas de backend, pas de base de données
- Le site lit `planning.json` au démarrage
- Responsive mobile-first, tout en français

## Architecture des composants
```
src/
├── App.jsx              # Router principal, chargement du JSON, passage des props
├── main.jsx             # Point d'entrée React
├── index.css            # Tailwind + thème personnalisé (Open Sans, couleurs Clair Bois)
├── components/
│   ├── Header.jsx       # Header avec logo officiel Clair Bois
│   ├── Footer.jsx       # Pied de page 3 colonnes (adresse, foyers, entreprises)
│   ├── Breadcrumb.jsx   # Fil d'Ariane cliquable
│   ├── InfoBulle.jsx    # Tooltip hover/clic pour expliquer les actions référent cadre
│   ├── HomePage.jsx     # Écran 1 : choix parcours (modules métiers / stages / cartographie)
│   ├── Aiguillage.jsx   # Questions d'orientation (pour qui ? déjà inscrit ?)
│   ├── ModulesMetiers.jsx     # Semaine → grille modules avec places par semaine
│   ├── StagesPage.jsx         # Choix secteur (17 secteurs + illustrations) + calendrier
│   ├── EtablissementPage.jsx  # Écran : choix secteur par établissement
│   ├── SecteurCalendar.jsx    # Calendrier mensuel par secteur
│   ├── WeekDetail.jsx         # Détail semaine + inscription
│   ├── Cartographie.jsx       # Page privée : 6 plans métier "plan de table de mariage" (refonte 6 mai 2026)
│   ├── CartographieLogin.jsx  # Écran de connexion (mot de passe partagé) — style cb-blue, logo Clair Bois
│   ├── Cartographie.backup-prototype.jsx  # Ancien prototype board 6 sites (non importé — supprimable)
│   ├── FormulaireInscription.jsx  # Formulaire multi-étapes intégré
│   ├── FormulaireSignalement.jsx  # Signalement urgence (annulation/retard)
│   └── formulaire/            # Sous-composants du formulaire
│       ├── ChampFormulaire.jsx
│       ├── EtapeStagiaire.jsx
│       ├── EtapeCuratelle.jsx
│       ├── EtapeUrgence.jsx
│       ├── EtapeAI.jsx
│       ├── EtapeComplementaire.jsx
│       ├── EtapeReferent.jsx
│       ├── EtapeDeclaration.jsx
│       ├── Recapitulatif.jsx
│       └── Confirmation.jsx
├── utils/
│   ├── helpers.js       # Fonctions utilitaires (couleurs, dates, agrégation, etc.)
│   ├── validation.js    # Validation AVS, téléphone, NPA, email, date
│   ├── formConfig.js    # Configuration des sections par chemin d'aiguillage
│   └── cartoAuth.js     # Auth cartographie privée (token sessionStorage 24h, clé `cb-carto-token`)
├── tests/
│   ├── setup.js
│   ├── helpers.test.js          # 74 tests fonctions utilitaires
│   ├── validation.test.js       # 43 tests validation (AVS, tél, NPA, email, date)
│   ├── formConfig.test.js       # 17 tests configuration des sections
│   ├── formulaire.test.jsx      # 31 tests composants formulaire intégré
│   ├── modulesMetiers.test.jsx  # 16 tests flow semaine → modules
│   ├── signalement.test.jsx     # 12 tests formulaire signalement
│   └── cartographie.test.jsx    # 24 tests cartographie + login + cartoAuth (NEW 6 mai 2026)
└── public/
    ├── planning.json          # Données générées par Power Automate
    ├── logo-clairbois.png     # Logo officiel
    ├── card-modules.jpg       # Photo DFIP pour carte modules
    ├── illust-stages.svg      # Illustration carte stages
    ├── illust-moi.svg         # Illustration aiguillage "pour moi-même"
    ├── illust-autre.svg       # Illustration aiguillage "pour quelqu'un d'autre"
    └── secteurs/              # 17 illustrations SVG par secteur (Storyset, recolorisées #092C6A)
```

## Design — Intégration clairbois.ch (10 avril 2026)

Adaptation visuelle pour cohérence avec le site officiel WordPress/Divi :
- **Police** : Open Sans (Google Fonts) — identique à clairbois.ch
- **Couleur primaire** : `#092C6A` (cb-blue) — bleu marine officiel Clair Bois
- **Couleur accent** : `#2EA3F2` (cb-accent) — bleu clair pour CTA/boutons d'action
- **Logo** : logo officiel `logo-clairbois.png` (récupéré du site)
- **Footer** : 3 colonnes (adresse + foyers + entreprises sociales), fond `#434343`
- **Illustrations** : Storyset (Freepik), recolorisées en `#092C6A`, style Rafiki
- **Nom officiel** : "Fondation Clair Bois" (sans tiret)
- **Tests** : 217 tests Vitest (helpers, validation, formConfig, formulaire, modules, signalement, cartographie)
- **Icônes** : `lucide-react` (UtensilsCrossed, ChefHat, Shirt, Wrench, GraduationCap, Home, ChevronRight, ChevronLeft, LogOut) — utilisées dans la cartographie
- **Documentation** : `docs/architecture-frontend.html` — architecture interactive

## Couleurs du code de disponibilité
- **Vert** (`cb-green`) : >50% des places disponibles
- **Orange** (`cb-orange`) : 1-50% des places disponibles
- **Rouge** (`cb-red`) : complet (0 places)
- **Gris** (`cb-gray`) : pas de données / fermé

## Données

`public/planning.json` est **généré automatiquement** par le Flux 3 Power Automate et poussé sur GitHub via l'API Contents. Le frontend le transforme au chargement.

### Format du JSON (généré par PA — format plat)
```json
{
  "lastUpdated": "2026-03-07T...",
  "formsUrl": "https://forms.office.com/e/3SZvXC6kb5",
  "formsUrlNouvelEtablissement": "https://forms.office.com/...",
  "formsUrlNouveauSecteur": "https://forms.office.com/...",
  "config": { "Blanchisserie Tourbillon": { "description": "...", "icon": "👕" } },
  "creneaux": [
    { "etablissement": "...", "secteur": "...", "dateDebut": "2026-03-02", "dateFin": "2026-03-06", "placesTotal": 3, "placesUtilisees": 1 }
  ]
}
```

### Transformation frontend (helpers.js)
`transformPlanningData()` convertit le format plat en hiérarchique (`etablissements[].secteurs[].weeks[]`) pour les composants React. Rétrocompatible : si le JSON contient déjà `etablissements`, il est retourné tel quel.

### Gestion des créneaux chevauchants
Quand plusieurs créneaux couvrent la même semaine dans un secteur, `aggregateWeekCreneaux()` les regroupe par `year-weekNumber` avec déduplique par `startDate+endDate`. Le calendrier affiche `S13 (2)` et le détail (`WeekDetail`) liste chaque créneau individuellement avec sa propre barre de progression et son bouton d'inscription.

### Inscription depuis le calendrier (mai 2026)
`WeekDetail.jsx` reçoit `onInscription(creneau)` au lieu de `formsUrl`. Cliquer "S'inscrire" appelle `goToAiguillageFromWeek(creneau)` dans `App.jsx` qui :
1. Stocke `{ secteur, dateDebut, dateFin }` dans `pendingWeekContext`
2. Navigue vers l'écran Aiguillage (pour qui ? déjà inscrit ?)
3. Après l'aiguillage → `pendingWeekContext` est injecté dans `FormulaireInscription` comme `contextData`

### Liens Forms
- `formsUrl` : formulaire d'inscription stagiaire (réel, 43 questions, IDs Forms réels pour pré-remplissage)
- `formsUrlNouvelEtablissement` : formulaire référent cadre pour proposer un établissement
- `formsUrlNouveauSecteur` : formulaire "Gestion des créneaux" (réel) — utilisé aussi pour ajouter un créneau à un secteur existant

### IDs de pré-remplissage — Formulaire "Gestion des créneaux"
| Champ | ID Forms |
|---|---|
| Établissement | `rb1c6311a61044eb184fa3270fd065e32` |
| Secteur | `r69f254172ecd4baa9c92b2ef2d86f48c` |
| Description | `r43c3849ff3284246a7c68d571f7ca3df` |
| Date de début | `reee4e33cc677406885a947061d7d9cde` |
| Date de fin | `r77ae6366339446f39c90be5aa93b3a71` |
| Nombre de places | `r673220bf96894b43b6cd98c623c6d0fe` |
| Type de créneau | `rd79308a2436b46d7be9921d3eed3ca79` (Stage / Module métier) |
| Nom du module | `rc347ff44177743a8b9561f6d6f9eed2c` |
| Mot de passe | `rce9b9c542c0d455a8c01298b063332fe` |

### Pipeline automatique (opérationnel)
1. Référent externe s'inscrit via le calendrier → **formulaire intégré React** (plus Microsoft Forms)
2. Flux 5 (PA HTTP) crée Stagiaire + Demande(s) dans SharePoint + email docs
3. Flux 3 (PA) se déclenche automatiquement → recalcule les places → pousse planning.json sur GitHub
4. GitHub Pages redéploie → le site est à jour

### Boutons "Ajouter" pour référents cadres
Chaque écran offre un bouton discret (bordure pointillée + InfoBulle) permettant aux référents cadres de proposer :
- **HomePage** : "Ajouter un établissement" → `formsUrlNouvelEtablissement`
- **EtablissementPage** : "Ajouter un secteur" → `formsUrlNouveauSecteur` (pré-remplit établissement)
- **SecteurCalendar** : "Ajouter un créneau pour {secteur}" → `formsUrlNouveauSecteur` (pré-remplit établissement + secteur)

### Architecture formulaire intégré (19 mars 2026)
Le formulaire d'inscription est désormais intégré dans le site React (plus de redirection vers Microsoft Forms).

**Structure** :
```
src/components/
├── FormulaireInscription.jsx       ← Orchestrateur multi-étapes
├── formulaire/
│   ├── ChampFormulaire.jsx         ← Composant input réutilisable
│   ├── EtapeStagiaire.jsx          ← Identité + coordonnées
│   ├── EtapeCuratelle.jsx          ← Conditionnel (oui/non → champs curateur)
│   ├── EtapeUrgence.jsx            ← Contact d'urgence
│   ├── EtapeAI.jsx                 ← Infos assurance invalidité
│   ├── EtapeReferent.jsx           ← Si pourQui === 'autre'
│   ├── Recapitulatif.jsx           ← Relecture + modifier avant envoi
│   └── Confirmation.jsx            ← Succès / erreur post-envoi
src/utils/
├── validation.js                   ← AVS, tél suisse, NPA, email
└── formConfig.js                   ← Sections visibles par chemin d'aiguillage
```

**Soumission** :
- Dev/test : `fetch(import.meta.env.VITE_PA_HTTP_URL, { method: 'POST' })` — URL dans `.env.local`
- Production (Azure SWA) : `fetch('/api/inscription')` → Azure Function proxy → PA/SharePoint
- Le payload JSON inclut un champ `cheminKey` pour router la logique côté PA

**Hébergement cible** : Azure Static Web Apps (tenant Microsoft Clair-Bois)

## Cartographie privée (refonte 6 mai 2026)

Suite à la réunion du 13 avril 2026 (`docs/transcription-karavia3.txt`), le composant `Cartographie.jsx` a été **complètement refondu**. L'ancien prototype "board des 6 sites" est conservé en référence sous `Cartographie.backup-prototype.jsx` (non importé, supprimable). La nouvelle version implémente l'analogie demandée par Mme Karavia : un **plan de table de mariage** par métier, où chaque table = un établissement et chaque siège = une place de stage typée.

### Vue d'ensemble
- **Page privée** : protégée par mot de passe, réservée à la coordination DFIP (Karavia + collègues).
- **6 plans métier** (dans cet ordre, fixé par la transcription du 13 avril) :
  1. Restauration
  2. Cuisine
  3. Lingerie
  4. Technique
  5. Éducatif Pôle enfance-adolescence
  6. Éducatif Pôle adulte
  - Éducatif est volontairement **en dernier** (consigne Karavia : ne pas commencer par ASA/ASE/ASSC) et **éclaté en deux plans distincts** (enfance-adolescence et adulte) traités comme deux entités à part entière.
- **6 établissements** (CBC, CBL, CBG, CBM, CBP, CBT) représentés comme tables sur chaque plan métier concerné — motif "bois" pour la métaphore physique.
- **Sièges** = places typées **FPra / AFP-CFC / Stage / CEA** disposées autour de la table, codés vert (libre) / rouge (occupée). Les types **AFP** et **CFC** sont fusionnés en `AFP_CFC` conformément à la transcription Karavia (lignes 264-267 — "formateur OFPC requis").
- Hover/focus sur un siège rouge → **tooltip** avec nom du stagiaire, dates, typologie (Mesure d'orientation, Stage découverte, Formation pratique, AFP, CFC, Contrat emploi adapté).
- **~132 places mockées en dur** dans le composant : ~30 % occupées, réparties pour exposer les trois codes couleur — **4 plans verts, 2 oranges (Cuisine, Éducatif enfance), 1 rouge (Lingerie complète)**.

### Vue d'ensemble : header global + cartes par plan
- **Header sticky** en haut de la vue 1 : compteurs agrégés (Total places / Libres / Occupées) + barre de progression dont la couleur passe vert/orange/rouge selon le ratio libres/total (mêmes seuils que le calendrier : >50 % vert, 1-50 % orange, 0 % rouge).
- **Cartes "stat" par plan métier** (style HomePage) : grand chiffre `places libres / total`, ventilation par type (FPra / AFP-CFC / Stage / CEA), bandeau coloré selon ratio, icône `lucide-react` + chevron d'entrée.

### Architecture (composant + login + auth utility)

```
src/components/Cartographie.jsx        # Composant principal (6 plans, animations, tooltips)
src/components/CartographieLogin.jsx   # Écran de saisie mot de passe
src/utils/cartoAuth.js                 # getMotsDePasseValides, verifierMotDePasse,
                                       # setToken, getToken, clearToken, isAuthenticated
```

**Intégration `App.jsx`** : au clic sur la carte Cartographie depuis `HomePage`, `App.jsx` vérifie `isAuthenticated()` :
- Si OK → rend directement `<Cartographie>`.
- Sinon → rend d'abord `<CartographieLogin>`, puis `<Cartographie>` après succès.

`Cartographie` reçoit deux props :
- `onGoHome` : retour HomePage **sans** déconnexion (le token reste valide).
- `onLogout` : efface le token (`clearToken`) puis retour HomePage.

### Authentification (côté client, en attendant un proxy serveur)

| Élément | Valeur |
|---|---|
| Variable d'env | `VITE_CARTO_PASSWORDS` (CSV, dans `.env.local`) |
| Stockage token | `sessionStorage`, clé `cb-carto-token` |
| Format token | base64(`{ ts, idx }`) — pas un secret cryptographique |
| Durée de vie | **24 heures** (`DUREE_VIE_TOKEN_MS = 24 * 60 * 60 * 1000`) — couvre une journée de travail sans relogin |
| Fallback dev | `['carto2026']` si la variable est absente et `import.meta.env.DEV` |
| Fallback prod | `[]` (refuse toute connexion si la variable est absente du build) |

**Plusieurs mots de passe possibles** : un par utilisateur de la coordination DFIP (CSV séparé par virgules dans `VITE_CARTO_PASSWORDS`). L'index du mot de passe utilisé est encodé dans le token (utile pour traçabilité future si besoin).

**Limite assumée** : la vérification est côté client, donc visible dans le bundle. C'est **acceptable en local** (le poste de Karavia reste sur son PC pro) ; à déplacer vers un proxy serveur lors de la mise en prod (Infomaniak / Azure SWA) — même logique que pour `VITE_PA_HTTP_URL`.

`sessionStorage` (et non `localStorage`) → la session est invalidée à la fermeture de l'onglet, plus sûr sur poste partagé.

### Animation immersive "boom ça entre"

Au clic sur une carte de plan métier :
1. Capture du `boundingClientRect` du bouton cliqué.
2. Variables CSS injectées (`--carto-x`, `--carto-y`, `--carto-scale-x`, `--carto-scale-y`) qui positionnent l'overlay au rect d'origine.
3. Overlay `position: fixed inset-0` qui se **scale depuis le rect cliqué jusqu'au plein écran** (480ms, easing out-expo).
4. Voile sombre `backdrop-blur-sm` qui apparaît en parallèle (`carto-fade-bg`).

Animation **inverse** au "Retour aux plans" (zoom out vers le rect d'origine).

**Garde-fou bouton retour** : un `useEffect` arme un `setTimeout(400ms)` qui force le démontage de l'overlay si l'événement `onAnimationEnd` ne se déclenche pas (prévient le cas où l'animation est interrompue par un changement de focus/onglet et laisse l'utilisateur bloqué sur l'overlay).

**6 keyframes Tailwind/CSS ajoutés dans `src/index.css`** :
- `carto-zoom-in` / `carto-zoom-out` — entrée/sortie immersive d'un plan
- `carto-fade-bg` — voile sombre + blur
- `carto-seat-pulse` — pulsation discrète sur les sièges
- `carto-tooltip-in` / `carto-tooltip-in-bottom` — apparition tooltip nom/dates/typologie (deux variantes selon orientation auto)

### Variables d'environnement (carto — extrait `.env.local`)

```bash
# Cartographie privée (CSV de mots de passe acceptés)
VITE_CARTO_PASSWORDS=motdepasse1,motdepasse2,motdepasse3

# Prévu (pas encore implémenté) — Flux 6 PA HTTP GET retournant le JSON cartographie
# VITE_PA_CARTO_URL=https://prod-xx.westeurope.logic.azure.com/...
```

Comme pour `VITE_PA_HTTP_URL`, ces variables sont **bundlées** dans le build par Vite ; ne JAMAIS commiter `.env.local` ni publier un build avec ces valeurs sur GitHub Pages public. Vue d'ensemble de toutes les variables : section "Variables d'environnement" plus bas.

### Statut des données

- **Aujourd'hui (6 mai 2026)** : données mockées en dur dans `Cartographie.jsx` (~132 places réparties sur les 6 plans, dont ~30 % occupées pour exposer les codes couleur vert/orange/rouge).
- **Prévu (Flux 6 PA — pas encore créé)** :
  - PA HTTP GET → lit SP `Cartographie` + SP `Demande` filtrées sur `Statut="Confirmé"` → renvoie un JSON consolidé.
  - URL dans `VITE_PA_CARTO_URL`.
  - **Pattern Flux 5 (HTTP request live)** retenu, **pas Flux 3** (polling → GitHub) : la cartographie doit refléter l'état SP en temps réel et reste privée (jamais publiée sur GitHub Pages).

## Fonctionnalités Phase 2 (état au 6 mai 2026)
- ~~**Cartographie des sites/pôles** (board interactif capacités — demande Karavia)~~ — **FAIT côté frontend** (6 plans métier, login mot de passe, animations immersives, header stats global, mock data). Reste à brancher **Flux 6 PA** pour les données réelles (`VITE_PA_CARTO_URL`).
- **Workflows email automatiques** (confirmation inscription, demande documents, récap J-7) — à faire
- **Vérification doublon stagiaire via AVS** (appel PA → check SharePoint avant submit) — à faire
- **Sauvegarde sessionStorage anti-perte de saisie** dans le formulaire d'inscription — à faire
- **Panel référent cadre** pour gérer les disponibilités directement (alternative à Forms "Gestion des créneaux") — à faire

## Routeur interne (`App.jsx` — state `currentView`)

Le site utilise un router `useState` minimaliste plutôt que React Router. **11 vues** sont définies dans `App.jsx` (`setCurrentView(...)`) :

| # | Vue | Composant | Déclencheur |
|---|-----|-----------|-------------|
| 1 | `home` | `HomePage` | Démarrage / retour accueil |
| 2 | `etablissement` | `EtablissementPage` | Choix d'un établissement (parcours stages) |
| 3 | `secteur` | `SecteurCalendar` | Choix d'un secteur dans un établissement |
| 4 | `week` | `WeekDetail` | Clic sur une semaine du calendrier |
| 5 | `aiguillage` | `Aiguillage` | Avant inscription / depuis WeekDetail |
| 6 | `modules` | `ModulesMetiers` | Parcours modules métiers |
| 7 | `stages` | `StagesPage` | Parcours stages (17 secteurs) |
| 8 | `formulaire` | `FormulaireInscription` | Submit aiguillage → formulaire intégré |
| 9 | `signalement` | `FormulaireSignalement` | Bouton signalement annulation/retard |
| 10 | `cartographie-login` | `CartographieLogin` | Carto, pas encore authentifié |
| 11 | `cartographie` | `Cartographie` | Carto authentifiée (token valide) |

## Variables d'environnement (`.env.local`, jamais commité)

| Variable | Statut | Rôle |
|---|---|---|
| `VITE_PA_HTTP_URL` | **opérationnel** | URL Flux 5 — POST inscription/modules → SharePoint |
| `VITE_CARTO_PASSWORDS` | **opérationnel** (6 mai) | CSV des mots de passe carto privée (1 par utilisateur DFIP) |
| `VITE_PA_CARTO_URL` | **réservé / pas encore implémenté** | URL Flux 6 PA HTTP GET — JSON cartographie live (SP Cartographie + SP Demande filtrées `Statut=Confirmé`) |

**Vite bundle toutes les variables `VITE_*` dans le JS compilé.** Ne jamais publier un build `npm run build` contenant des URL/secrets sur GitHub Pages public — utiliser uniquement en local (`npm run dev`) ou derrière un proxy serveur (Azure Function / Infomaniak).

## Code mort & dette technique (à nettoyer)

- **`Cartographie.backup-prototype.jsx`** : ancien prototype board 6 sites, conservé pour référence après refonte du 6 mai. Non importé nulle part — suppression possible quand la nouvelle carto sera validée par Karavia.
- **`src/backup-19mars/`** : 8 fichiers pré-refonte du formulaire intégré (19 mars), jamais importés. À supprimer une fois le pipeline Flux 5 stabilisé en prod.
- **`MODULES_FORMS_URLS`** dans `ModulesMetiers.jsx` : constante + destructuration `formsUrlModules` héritées de la version Forms — jamais utilisées depuis la migration vers les modules intégrés. À supprimer.
- **`FormulaireSignalement` → Flux 5** : le composant envoie un POST vers `VITE_PA_HTTP_URL` avec `type: 'signalement'`, mais Flux 5 ne route pas ce type. Il faut **un Flux Signalement séparé** (à créer côté backend) — le frontend devra alors pointer sur une URL dédiée, ou Flux 5 devra accepter le branchement `type === 'signalement'`.
- **Tests manquants** : pas de tests Vitest pour `EtablissementPage`, `SecteurCalendar`, `WeekDetail`, `HomePage`, `CartographieLogin`. Couverture actuelle = utils + composants formulaire + cartographie + signalement + modules.

## Fonctions utilitaires clés (helpers.js)
- `transformPlanningData(flat)` : plat PA → hiérarchique React (rétrocompatible)
- `aggregateWeekCreneaux(weeks)` : agrège les semaines par `year-weekNumber`, déduplique par `startDate+endDate`, calcule totaux et statut
- `buildFormsUrl(baseUrl, etablissement, secteur, startDate)` : URL pré-remplie avec `encodeURIComponent` (IDs Forms réels)
- `computeStatus(totalSlots, usedSlots)` : calcule le statut couleur (>50% = vert, 1-50% = orange, 0 = rouge)
- `getISOWeekNumber(date)` : numéro de semaine ISO
- `getUniqueCreneaux(weeks)` : déduplique les semaines par `startDate+endDate` pour comptage sur EtablissementPage

## Principes de code
- Composants React bien découpés
- Code commenté en français
- Noms de variables explicites
- Le JSON est chargé UNE SEULE FOIS au démarrage
- Animations/transitions fluides
- 100% dynamique : ajouter un créneau dans SharePoint = apparition automatique sur le site
- Rétrocompatibilité : `week.creneaux || [week]` dans WeekDetail

**Projet lié** : `C:\Users\karim\PowerAutomate-Agent` — Backend Power Automate (Flux 1, 2, 3)
