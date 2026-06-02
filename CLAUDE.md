# Projet Clair-Bois — Gestion des stages et modules métiers

## Git

- **Repo** : `rochat-dev/life-system` (mono-repo)
- **Chemin** : `travail/projets/clair-bois-projet/`
- **Branche de travail** : `rochat-dev` (partagée avec autre PC) — `main` reste stable
- **Pull** : `git -C ~/life-system pull origin rochat-dev`
- **Push** : `git -C ~/life-system push origin rochat-dev`

Toujours communiquer en français avec l'utilisateur.

## Vue d'ensemble

Projet pour la Fondation Clair-Bois (Genève), service DFIP RH.
- **Mandante** : Madame Karavia (coordinatrice des entrées de stagiaires)
- **Deadline initiale** : 30 mars 2026 (formellement dépassée — projet poursuivi en mission intérim)
- **Statut contractuel** : mission intérim 80% pour 2 mois (estimation fin ~mi-juin 2026), présence jeudi/vendredi sur site
- **Fenêtre de livraison restante** : ~6 semaines

## Structure du projet

```
clair-bois-projet/
├── frontend/          ← Site React (calendrier + modules métiers)
│   └── Repo: rochat-dev/clair-bois-calendrier
├── backend/           ← Scripts Power Automate (4 flux JSON + nouveaux à créer)
│   └── Repo: rochat-dev/PowerAutomate-Agent
├── docs/              ← Documentation & livrables
│   ├── forms/                             ← Référence des 8 formulaires Forms
│   │   └── forms-reference.md             ← IDs, champs, matrice chemins
│   ├── architecture-nouvelle.md           ← Nouvelle archi multi-forms + Word AI
│   ├── transcription2-resume.md           ← Résumé réunion 14 mars 2026
│   ├── ocas-word-mapping.md               ← Mapping champs Word OCAS → SharePoint
│   ├── flux-cas-figures.html              ← Diagramme flux (chemins A-E + cas spécial)
│   ├── presentation-reunion-IT.html      ← Présentation réunion IT 24 mars (12 slides)
│   ├── Formulaire de demande GLOBAL_OCAS_fillin en dur_V4.docx  ← Word AI/OCAS
│   ├── transcription-karavia.txt          ← Transcription réunion 9 mars 2026
│   ├── transcription-karavia2.txt         ← Transcription réunion 14 mars 2026
│   ├── screens/                           ← Captures Teams Karavia
│   ├── SemaineModuleMetier.png            ← Visuel semaine type modules
│   ├── Passation_DSI_ClairBois.pdf
│   └── Presentation-ClairBois-Karavia.pptx
├── scripts/           ← Scripts utilitaires
└── CLAUDE.md          ← Ce fichier
```

## Pipeline automatique (opérationnel — 19 mars 2026)

```
Formulaire React (inscription) → Flux 5 (HTTP POST) → SharePoint (Stagiaire + Demande + Referent)
                                                     → Email demande documents
                                                           ↓ (réponse avec PJ)
                                                     Flux 2 → Dossier SP + MAJ statut
                                                           ↓
                                                     Flux 3 (polling) → planning.json → GitHub → Site
Microsoft Forms (créneaux)     → Flux 4 → SharePoint (Creneaux)
```

### Flux actifs
| Flux | Trigger | Rôle |
|------|---------|------|
| **Flux 5** | HTTP POST (React) | Inscription stagiaire → SP + email |
| **Flux 2** | Email entrant (PJ) | Réception documents → dossier SP |
| **Flux 3** | Polling SP (3min) | planning.json → GitHub |
| **Flux 4** | Forms webhook | Gestion créneaux (référents cadres) |
| ~~Flux 1~~ | ~~Forms webhook~~ | ~~Obsolète — remplacé par Flux 5~~ |

### Points ouverts (à clarifier)
- **Creneaux** : à repenser — plus de mécanisme pour les chefs d'établissement/secteur
- **Etablissement** : colonne potentiellement obsolète — c'est Karavia qui décide le placement
- **DejaStage / Limitations** : à confirmer si encore pertinent dans les nouveaux formulaires
- **Word AI (OCAS)** : canal email HIN à implémenter ultérieurement

## Architecture multi-formulaires (17 mars 2026)

**Changement majeur** : passage de 1 formulaire → 8 formulaires spécialisés + canal Word AI.

### Les 8 formulaires Forms
| # | Nom | Usage |
|---|-----|-------|
| 1 | Demande de stage - stagiaire | Chemin A (NON + Moi-même) |
| 2 | Modules métiers - partenaire | Référent inscrit aux modules |
| 3 | Retour à CB | Chemin C (OUI — **IDs DIFFÉRENTS !**) |
| 4 | Informations complémentaires | Compléter dossier existant |
| 5 | Demande de stage (AI) | Envoyé au stagiaire après Word AI |
| 6 | Modules métiers - participant.e | Participant s'inscrit lui-même |
| 7 | Demande de stage - partenaire | ORIGINAL (Flux 1 actuel) |
| 8 | Gestion des créneaux | Inchangé (Flux 4) |

→ Détails complets : `docs/forms/forms-reference.md`

### 2 canaux d'entrée
1. **Site React → Forms** : partenaires, enseignants, stagiaires
2. **Word AI (OCAS)** : conseillers AI envoient un Word structuré par email/HIN

→ Détails : `docs/architecture-nouvelle.md`

### Questions d'aiguillage (FAIT — 17 mars)
1. "Je remplis pour moi-même / pour quelqu'un d'autre"
2. "Déjà inscrit chez Clair-Bois ? OUI / NON" (sautée pour modules métiers)

→ Composant `Aiguillage.jsx`, intégré dans `App.jsx`

## Secteurs réels (17 vrais secteurs — FAIT)

ASA, ASE, ASSC, Cuisine, Restauration, Pâtisserie-boulangerie, Nettoyage, Exploitation, Peinture, Graphisme, Audio-visuel, Médiamatique, Intendance, Lingerie, Informatique, Confection, Autre

→ Implémentés dans StagesPage.jsx (remplacent les 6 inventés)

### Migration Forms → Formulaire intégré (DÉCIDÉ — 19 mars)
- **Problème** : Microsoft Forms trop limité (pas de validation AVS, pas de logique conditionnelle, 8 forms à maintenir, modules+semaines impossible à pré-remplir)
- **Solution adoptée** : formulaire React intégré dans le site → POST vers PA HTTP trigger → SharePoint
- **Hébergement cible** : Azure Static Web Apps dans le tenant Microsoft Clair-Bois (URL: claribois.ch)
- **Sécurité** : Azure Function comme proxy en prod (URL trigger cachée côté serveur)
- **Doc comparaison** : `docs/comparaison-forms.html`
- **Backup pré-modifications** : `frontend/src/backup-19mars/`

## État actuel (26 mai 2026)

- **Site actif et déployé** sur GitHub Pages (commit `0ff6bd7`) — en mode démo (sans connexion PA réelle)
- **Pipeline opérationnel** : React → Flux 5 HTTP → SP → Flux 3 → GitHub → Site (inchangé)
- **Frontend FAIT** : aiguillage, 17 secteurs, formulaire React intégré multi-étapes
- **Cartographie refonte plans métier (19 mai 2026)** — 9 plans data-driven depuis `PlanMetierCarto` SP :
  - **9 plans métier** : Restauration, **Boulangerie/Pâtisserie** (NOUVEAU), Cuisine, Lingerie et Confection, **Services Généraux** (ex-Technique), **Multimédia** (noms officiels Minoteries : EXECO, Atypique, C'REDAC', Atypique-Médiamatique), **Administration et Informatique** (Tourbillon), Éducatif Pôle enfance-adolescence, Éducatif Pôle adulte (Gradelle + CB2000 NOUVEAU + Pinchat apps 5A→5G + Minoteries)
  - **Data-driven** : `Cartographie.jsx` lit `data.plans[]` depuis `carto.json` — plus de `PLAN_CONFIG` hardcodé
  - **Icônes emoji** depuis SP `PlanMetierCarto.Icone` (plus de Lucide React sauf navigation)
  - **4e couleur gris** = place indisponible (`PlacesIndisp_FPRA` dans SP `PlacesCarto`)
  - **Bulle commentaire** (badge "!") sur les tables ayant un commentaire non vide
  - Métaphore table+sièges conservée, animation "boom ça entre", header stats globales
  - `CartographieLogin.jsx` + `cartoAuth.js`, token sessionStorage 24h, CSV `VITE_CARTO_PASSWORDS`
  - Détails complets : `frontend/CLAUDE.md` section "Cartographie privée"
- **SP Lists refonte carto (19 mai 2026)** :
  - **`PlanMetierCarto`** : référentiel des 9 plans métier (Titre clé, Icone emoji, Description, Ordre)
  - **`PlacesCarto`** : remplace `Cartographie` — PlanMetier (Lookup→PlanMetierCarto), Etablissement, Secteur, PlacesMax_FPRA/AFP_CFC/Stage_Mes/CEA/AppNonDFIP/MSTS, **PlacesIndisp_FPRA**, Commentaire
- **Flux 6 — Flux Carto** ✅ (26 mai 2026) — `flux-carto.zip` généré, 8 actions :
  - GET `PlanMetierCarto` (9 plans avec emoji) + GET `PlacesCarto` avec `$expand=PlanMetier`
  - GET `Demande` Statut='Confirmé', Loop PlacesCarto, Compose `{ generatedAt, plans[], tables[] }`, Push GitHub
  - **À importer dans PA** : remplace ancienne version (si existante)
- **Flux 5 étendu (mai 2026)** : gère désormais stages ET modules métiers → SP (Stagiaire + Demande[s] + Referent + Email)
  - Modules : 1 Demande par module sélectionné (max 3), Foreach sans lookup créneau (fix bug timeout 504 OData)
  - TypeDemande (Choice: Stage / Module métier) dans SP Demande
  - ReferentContact (texte: "Prénom Nom — Partenaire" ou "Aucun") pour visibilité Rosina
  - Statut Demande : "Confirmé" (remplace "Validé" — supprimé)
- **WeekDetail.jsx corrigé** : bouton "S'inscrire" connecté au formulaire React (via `onInscription` + `pendingWeekContext` dans App.jsx)
- **9/9 tests Flux 5** (`backend/test-flux5.js`) couvrant toutes les branches (stages + modules) ✅
- **222 tests Vitest** au total côté frontend (helpers, validation, formConfig, formulaire, modules, signalement, **29 tests cartographie** inclus, tous passants)
- **Présentation IT créée** : `docs/presentation-reunion-IT.html` (12 slides, laser pointer, popups techniques)
- **Modules métiers refondus** : sélection semaine d'abord → grille modules avec places par semaine (consigne Rosina)
- **Formulaire signalement** : annulation/retard accessible depuis la page d'accueil (`FormulaireSignalement.jsx`)
- **Flux global visuel** : `docs/flux-global.html` — graphe interactif vis-network (acteurs, flux PA, listes SP)

### Sécurité — Hébergement et variables d'environnement (mis à jour 8 mai 2026)

#### Architecture cible : Vercel (décidé 8 mai 2026)

**Deux déploiements distincts :**
- **GitHub Pages** (`rochat-dev/clair-bois-calendrier`) → site public : calendrier, modules métiers, formulaire inscription (mode démo sans PA réelle)
- **Vercel** (`rochat-dev/clair-bois-calendrier`) → cartographie privée uniquement, accessible à la racine `/` avec mot de passe

**Principe Vercel :** les variables sans préfixe `VITE_` ne sont JAMAIS compilées dans le bundle JS — elles restent côté serveur (serverless functions / middleware).

#### Variables d'environnement Vercel (côté serveur — jamais dans le bundle)

| Variable | Valeur | Usage |
|---|---|---|
| `PA_HTTP_URL` | URL trigger Flux 5 PA | Proxy `/api/inscription` → PA |
| `CARTO_PASSWORD` | mot de passe(s) carto | Vérifié dans `/api/login` (middleware Edge) |
| `CARTO_JWT_SECRET` | secret aléatoire (32 chars) | Signature du cookie httpOnly |

#### Variables locales (frontend/.env.local — jamais commitées)

```bash
VITE_PA_HTTP_URL=https://prod-xx.westeurope.logic.azure.com/...  # dev local uniquement
VITE_CARTO_PASSWORDS=motdepasse1,motdepasse2                     # dev local uniquement
```

#### Architecture Vercel — flux sécurisés

```
# Carto (Vercel)
Visiteur → / → middleware Edge → pas de cookie valide → /login
Visiteur → / → middleware Edge → cookie valide → Cartographie.jsx
POST /api/login → vérifie CARTO_PASSWORD (serveur) → pose cookie httpOnly signé (CARTO_JWT_SECRET)

# Formulaire inscription (Vercel, quand connecté)
React → POST /api/inscription → serverless function lit PA_HTTP_URL (serveur) → relaye vers PA → retourne réponse
```

#### Fichiers à créer pour Vercel

- `frontend/middleware.js` — Edge Middleware : protège `/` et toutes les routes, vérifie cookie
- `frontend/api/login.js` — serverless function : POST {password} → vérifie CARTO_PASSWORD → cookie httpOnly
- `frontend/api/inscription.js` — serverless function : POST payload → relaye vers PA_HTTP_URL
- `frontend/vercel.json` — config : SPA rewrite, headers sécurité

#### Routing : carto à la racine, pas liée depuis le site principal

- La carto Vercel est une URL séparée (ex: `clair-bois-carto.vercel.app`) — pas de lien depuis `HomePage.jsx`
- Supprimer le bouton "Cartographie" de `HomePage.jsx` avant déploiement Vercel
- Quand on visite la racine `/` → directement la page de login carto
- `vercel.json` redirige `/` vers `/cartographie` (ou middleware redirige directement)

#### Workflow de test local (inchangé)

```bash
# frontend/.env.local
VITE_PA_HTTP_URL=https://prod-xx.westeurope.logic.azure.com/...
VITE_CARTO_PASSWORDS=motdepasse1,motdepasse2
npm run dev   # formulaire connecté au vrai Flux 5, carto avec mdp local
```

### Legacy code / points ouverts
- ~~**`WeekDetail.jsx`** : bouton "S'inscrire" redirige encore vers Microsoft Forms~~ — **CORRIGÉ (mai 2026)** : connecté au formulaire React via `onInscription` + `pendingWeekContext`
- **Flux 4 créneaux** : encore sur Microsoft Forms (Forms webhook) — pas encore migré vers HTTP trigger React
- **`MODULES_FORMS_URLS`** dans `ModulesMetiers.jsx` : code mort (les modules sont 100% intégrés) — à nettoyer
- **FormulaireSignalement** : envoie un POST vers Flux 5 mais celui-ci ne gère pas `type: 'signalement'` — prévoir un Flux Signalement séparé
- **`frontend/src/backup-19mars/`** : backup pré-migration Forms → React, à archiver/supprimer
- **`Cartographie.backup-prototype.jsx`** : ancien prototype carto avant refonte 6 mai, à supprimer

### Décisions prises (19–23 mars 2026)
- **Migration Forms → formulaire React intégré : FAIT** — formulaire opérationnel avec Flux 5
- **Karavia a validé** le comparatif et demande validation IT (Benoit & José)
- **Réunion IT mardi 24 mars** — présenter deux décisions : 1) hébergement, 2) Forms vs intégré
- **URL corrigée** : clairbois.ch (pas claribois.ch)
- **Word AI arrive par email HIN** (Health Info Net AG, messagerie sécurisée santé suisse)
- **Consignes Karavia** reçues dans `docs/Projet - consignes Karavia.docx` — confirment essentiellement ce qui est déjà fait
- **Cartographie (Phase 2)** : fonctionnalité demandée par Karavia — tableau interactif des 6 sites, capacités, placements

### Décisions prises (réunion Karavia — 13 avril 2026)
Source : `docs/transcription-karavia3.txt` (lignes 1-300) + `docs/transcription-karavia3.json`
- **Cartographie : analogie "plan de table de mariage"** — par métier (Restauration, Cuisine, Lingerie, Technique, Éducatif), avec tables = établissements et sièges = places typées (FPra / AFP-CFC / Stage / CEA), code couleur vert/rouge.
- **Plan Éducatif en dernier** — Karavia ne veut pas qu'on commence par ASA/ASE/ASSC. Le plan Éducatif est lui-même divisé en deux pôles : enfance-adolescence et adulte.
- **Page privée par mot de passe** — accès réservé à la coordination DFIP. En attendant un proxy serveur (Infomaniak/Azure), authentification **côté client** via `sessionStorage` (token 24h, mots de passe CSV dans `VITE_CARTO_PASSWORDS`). Limite assumée et documentée.
- **Plusieurs mots de passe possibles** — un par utilisateur de la coordination (CSV), index encodé dans le token pour traçabilité future.
- ~~**Pattern Flux 5 retenu pour la carto**~~ — **ANNULÉ (8 mai 2026)** : remplacé par pattern Flux 3 (push `carto.json` → GitHub). Voir décisions 8 mai 2026.

### Décisions prises (6 mai 2026)
- **Refonte cartographie privée** — implémentation des 6 plans métier (avec Éducatif éclaté en 2 pôles), métaphore table+sièges aboutie, animation "boom ça entre", header sticky de stats globales, données mock variées vert/orange/rouge. 24 tests Vitest dédiés, tous passants.
- **Suppression de la carto isolée** — un projet carto isolé avait été créé sur le PC fixe (commit `3392661 Clair-Bois : carto isolée avec PasswordPage ajoutée` sur `rochat-dev`). Après comparaison avec la version intégrée, **décision de garder uniquement la version intégrée** (métaphore table+sièges, animation immersive, notion d'établissement, multi-mdp, sessionStorage). La version isolée a été supprimée du local et reste à supprimer de la branche `rochat-dev` au prochain commit.


### Décisions prises (réunion Karavia — 8 mai 2026)
Source : `docs/transcription-karavia6.txt` + `docs/transcription-karavia6-resume.md`

- **Cartographie = priorité absolue** — Rosina a perdu sa référente interne, plus de visibilité sur les places. Carto à présenter aux secteurs avant le **18 mai** pour co-construire les vraies données de capacité.
- **Modifications visuelles carto (cette semaine) :**
  - Remplacer A/B/C/D par les vrais types : **FPra**, **AFP-CFC**, **Stage**, **CEA** (Stage 1/Stage 2 si plusieurs du même type)
  - Supprimer le mot "Table" des cercles, supprimer/simplifier la molette de zoom
  - Système couleur **3 états** : Vert = libre / Rouge = occupé aujourd'hui / **Orange = réservé à date future** (tooltip au survol : prénom + dates)
  - Ajouter deux nouveaux types uniquement sur **Pôle enfance-adolescence et Pôle adulte** : `App.non-DFIP` et `Stagiaire-MSP/MSTS`
  - Carto en **lecture seule** — toutes les modifications passent par la SP List des demandes
- **Pattern Flux Carto = Flux 3 (push JSON), pas HTTP GET** : le Flux Carto pousse `carto.json` sur GitHub comme Flux 3 pousse `planning.json`. Aucune URL exposée dans le bundle → compatible GitHub Pages. `carto.json` contient : secteur, type de place, **prénom uniquement** (pas nom, pas AVS), dates début/fin.
- **Canal OCAS = PDF, pas Word** — confirmation définitive. AI Builder entraîné à 99% sur 5 exemples. Besoin de vrais PDF de Rosina pour améliorer le modèle.
- **Cycle de vie stagiaire** : une Demande = une période. Upgrade (stage → mesure → formation) = nouvelle Demande même stagiaire (même AVS). Libère la place précédente, bloque la nouvelle.
- **Flux Confirmation en cascade** : validation → email stagiaire + secteur + intendance (uniforme) + repas + MAJ OneNote. Re-déclenché si dates modifiées.
- **Alertes hebdomadaires lundi** : flux scheduler → demandes urgentes non traitées, dossiers incomplets.
- **Suivi per-stagiaire OneNote** : connecteur OneNote Business (Premium). Prototype pour le **19 mai 15h30** (RDV présentiel). Dépend licence PA.
- **Carte globale François** : étendre la carto à tous les apprentis y compris non-DFIP — potentiellement 2e mois de mission.
- **Licences PA Premium** : Benoît (IT) interpellé directement — urgence n°1. ~10 CHF/an. Sans ça : AI Builder, OneNote, nouveaux flux bloqués.
- **Hébergement** : non bloquant pour la carto (pattern Flux 3). Benoît confirme compatibilité Infomaniac pour la suite.

### Décisions prises (réunion Karavia — 19 mai 2026)
Source : `docs/transcription-karavia7-resume.md`

- **9 plans métier** (au lieu de 6) — Boulangerie/Pâtisserie séparée de Restauration, Technique → Services Généraux, Multimédia + Administration et Informatique ajoutés
- **Noms officiels Minoteries (Multimédia)** : Audiovisuel→EXECO, Graphisme→Atypique, Rédac→C'REDAC', Médiamatique→Atypique-Médiamatique
- **Éducatif Pôle adulte enrichi** : CB2000 (nouvel établissement, 1 secteur), appartements Pinchat 5A→5G, Gradelle 1→4, Minoteries 2e→5e
- **4e couleur gris** = place indisponible (formateur en arrêt longue durée) — colonne `PlacesIndisp_FPRA`
- **Bulle commentaire** (badge "!") par table
- **Cercles plus grands**, label "Table" supprimé
- **PlanMetierCarto** créée (référentiel plans) + **PlacesCarto** créée (remplace Cartographie) avec PlanMetier Lookup
- **Dates de stage simplifiées** : suppression "date début souhaitée" ET "date début confirmée" séparées → UN seul champ DateDebut + DateFin
- **PA Premium confirmé** (~36 CHF/an) — migration flux vers compte DFIP dédié (adresse à confirmer avec François/Laure)
- **Infomaniak** : Rosina contacte Magali Martin pour coordonnées hébergement Node.js
- **Formulaire demande de visite** (3e type, pour enseignants) — champs définis, à créer

### Présentation IT (24 mars 2026)
- **Fichier** : `docs/presentation-reunion-IT.html` — ouvrir dans un navigateur
- **12 slides** avec laser pointer rouge, popups techniques (11 panneaux), navigation clavier/souris
- **Décision 1** : Hébergement (GitHub Pages vs Azure SWA dans le tenant Clair-Bois)
- **Décision 2** : Microsoft Forms (8 forms + 8 flux) vs formulaire intégré React (1 form + 1 flux)
- **Slide stats** : gain de temps ~85%, réduction d'erreurs (AVS, doublons, emails, dossiers)
- **Slide continuité** : maintenance post-stage, disponibilité pour contrat freelance

### Architecture formulaire intégré
```
DÉVELOPPEMENT :  React → fetch(PA_HTTP_TRIGGER_URL) → SharePoint
PRODUCTION   :  React → /api/inscription (Azure Function) → SharePoint
```
- UN seul composant formulaire intelligent (`FormulaireInscription.jsx`) qui s'adapte selon le chemin d'aiguillage
- Sous-composants par étape : Stagiaire, Curatelle, Urgence, AI, Référent
- Récapitulatif modifiable avant envoi
- UN seul flux PA HTTP trigger côté backend (reçoit `cheminKey` pour router la logique)
- URL du trigger dans `.env.local` (non commitée), via `import.meta.env.VITE_PA_HTTP_URL`

### Consignes Karavia (12 avril 2026)
Source : `docs/Projet - consignes Karavia.docx`
- ~~Décompte places sur semaines et non sur modules~~ (FAIT — refonte flow ModulesMetiers)
- ~~Bouton signalement annulation/retard~~ (FAIT — FormulaireSignalement.jsx)
- ~~Dernière inscription possible à J-7~~ (FAIT — déjà implémenté)
- **Cartographie (Phase 2)** — board interactif des 6 sites, capacités, placements
- **Workflows email automatiques** — confirmation inscription, demande documents, récap J-7
- **Stages** : griser/bloquer WE, forcer 5 jours lundi-vendredi, blocage dates par Karavia

### Flux de confirmation Rosina (réunion 13 avril 2026 — à implémenter)

Process réel validé avec Rosina :
1. Rosina va dans SP Demande → filtre "non traités"
2. Elle consulte la **Cartographie** (places libres + formateur dispo par type : stage/AFP-CFC/formation pratique/CEA)
3. Elle change le statut d'une Demande en **"Confirmé"** (colonne visuelle rouge → vert)
4. **Flux Confirmation** se déclenche automatiquement (polling SP) :
   - Email confirmation → stagiaire
   - Mise à jour Carto (place → rouge avec nom + dates)
   - Commande uniforme → service Intendance/Lingerie (champs : prénom, taille, site de travail, date essayage)

### Réception inscriptions externes (27 avril 2026)

La majorité des référents vient de l'AI (Assurance Invalidité) et possèdent leurs propres formulaires d'inscription. Deux canaux de réception à construire :
1. **Canal Word AI (OCAS/HIN)** — déjà prévu dans l'architecture (voir `docs/ocas-word-mapping.md`) — non construit
2. **Canal générique** — endpoint HTTP que des systèmes externes peuvent appeler — à définir

Le point central reste le même : toutes les inscriptions arrivent dans SP → Rosina valide → Flux Confirmation.

### Prochaines étapes (priorisées — 10 mai 2026)

#### CRITIQUE / Refonte plans métier 19 mai 2026 — FAIT ✅
1. ~~**Modifications visuelles carto**~~ ✅ (10 mai) — labels FPra/AFP-CFC/Stage/CEA dans les cercles, système 3 couleurs (vert/rouge/orange), App.non-DFIP + MSP/MSTS sur Pôles enfance-ado et adulte, `commentaire` par table (tooltip au survol des cercles)
2. ~~**SP Lists PlacesCarto + PlanMetierCarto créées**~~ ✅ (19 mai) — PlanMetierCarto : 9 plans (Titre, Icone emoji, Description, Ordre) — PlacesCarto : remplace Cartographie, PlanMetier Lookup, PlacesIndisp_FPRA
3. ~~**Flux 6 — Flux Carto (Power Automate)**~~ ✅ (26 mai) — `flux-carto.zip` généré, 8 actions (GET PlanMetierCarto + GET PlacesCarto $expand + GET Demande Confirmée + Loop + Compose `{generatedAt, plans[], tables[]}` + Push GitHub)
4. ~~**Cartographie.jsx data-driven**~~ ✅ (26 mai) — PLAN_CONFIG supprimé, emojis, `cartoJsonToPlans()` lit `data.plans[]`
5. ~~**carto.json nouveau format**~~ ✅ (26 mai) — `{ generatedAt, plans: [{titre, nom, icone, description, ordre}], tables: [{plan, etablissement, secteur, commentaire, placesMax, placesIndisponibles, reservations}] }`
6. **Déploiement Vercel** — une fois Flux 6 testé en prod et données réelles validées

**Format carto.json (en production)** :
```json
{
  "generatedAt": "2026-05-26T...",
  "plans": [
    { "titre": "Restauration", "nom": "Restauration", "icone": "🍽️", "description": "...", "ordre": 1 }
  ],
  "tables": [
    {
      "plan": "Restauration",
      "etablissement": "Minoteries",
      "secteur": "Restaurant",
      "commentaire": "",
      "placesMax": { "FPRA": 2, "AFP_CFC": 1, "Stage/Mes.": 3, "CEA": 1, "App.non-DFIP": 0, "MSP/MSTS": 0 },
      "placesIndisponibles": { "FPRA": 0 },
      "reservations": [{ "type": "FPRA", "prenom": "Marie", "dateDebut": "2026-04-20", "dateFin": "2026-04-24" }]
    }
  ]
}
```

**Mapping colonnes PlacesCarto → clés React** :
- `PlacesMax_FPRA` → `FPRA` | `PlacesMax_AFP_CFC` → `AFP_CFC` | `PlacesMax_Stage_Mes` → `Stage/Mes.`
- `PlacesMax_CEA` → `CEA` | `PlacesMax_AppNonDFIP` → `App.non-DFIP` | `PlacesMax_MSTS` → `MSP/MSTS`
- `PlacesIndisp_FPRA` → `placesIndisponibles.FPRA` (cercles gris dans React)

#### CRITIQUE / Dès que PA Premium confirmé (Benoît)
6. **Flux Confirmation Rosina** — déclenché par MAJ `Demande.Statut='Confirmé'` → email stagiaire + secteur + intendance + repas + MAJ OneNote
7. **Canal PDF AI Builder (OCAS)** — drop PDF dans dossier SP → AI Builder extrait champs → crée/MAJ Demande + Stagiaire. Besoin de vrais PDF de Rosina pour entraîner le modèle.
8. **Flux Signalement** — séparer du Flux 5, HTTP POST `type:'signalement'` → SP Signalements + email Rosina

#### Important
9. Refonte emails automatiques (confirmation, demande documents, relance J-7, alertes lundi)
10. Suivi per-stagiaire OneNote — prototype pour le 19 mai (RDV 15h30)
11. Proxy sécurisé URL PA (Azure Function ou Infomaniak) — non bloquant pour la carto

#### Nice to have
12. Sauvegarde `sessionStorage` anti-perte de saisie formulaire
13. Vérification doublon AVS avant submit (frontend)
14. Migration Flux 4 créneaux : Forms → HTTP trigger React
15. Nettoyage code mort (`MODULES_FORMS_URLS`, `frontend/src/backup-19mars/`, `Cartographie.backup-prototype.jsx`)

#### Étapes terminées (référence)
- ~~Griser les week-ends~~ ✅
- ~~Construire le formulaire React intégré~~ ✅ (multi-étapes + validation + récap)
- ~~Créer le flux PA HTTP trigger~~ ✅ (Flux 5 opérationnel)
- ~~Présentation IT~~ ✅ (`docs/presentation-reunion-IT.html`)
- ~~Refonte modules métiers : semaine d'abord~~ ✅
- ~~Formulaire signalement urgence~~ ✅
- ~~Connexion locale~~ ✅ (`.env.local` + `npm run dev` + 9/9 tests)
- ~~Corriger `WeekDetail.jsx`~~ ✅ (bouton connecté via `pendingWeekContext`)
- ~~Cartographie Phase 2 — frontend~~ ✅ (6 plans, login mdp, animations, 24 tests — 6 mai 2026)
- ~~Refonte visuelle carto~~ ✅ (labels typés dans cercles, 3 couleurs, commentaire tooltip, App.non-DFIP/MSP-MSTS — 10 mai 2026)
- ~~SP List "Cartographie" créée~~ ✅ (11 colonnes, 37 lignes CSV prêt — 10 mai 2026)

## Blocages connus (26 mai 2026)

- **PA Premium** : confirmé ~36 CHF/an (non-profit via Benoît) + compte DFIP dédié en cours de validation avec François/Laure. Migration des flux (export/import, ~2-4h) dès adresse confirmée. Bloque encore : AI Builder (PDF OCAS), OneNote connector.
- **Hébergement Infomaniak** : Rosina contacte Magali Martin pour coordonnées. Option : utiliser compte existant clairbois.ch (si Node.js dispo) ou ouvrir nouveau compte (~150 CHF/an). Non bloquant pour la carto (pattern Flux 3 = carto.json statique).
- **Vrais PDF OCAS de Rosina** : nécessaires pour entraîner le modèle AI Builder.
- **Flux Carto — import PA** : `flux-carto.zip` généré, à importer dans PA (Créer en tant que nouveau). Connecteurs SP + GitHub à configurer manuellement après import.
- **Flux Confirmation Rosina** : non encore construit — déclenché par `Demande.Statut='Confirmé'` → email stagiaire + intendance + MAJ OneNote.
- **Adresse DFIP dédiée** : Rosina doit confirmer avec François/Laure — bloque la migration des flux.

## Documentation

- ~~`transcription-karavia3-resume.md`~~ — à créer (résumé 13 avril)
- `transcription-karavia6-resume.md` ✅ (résumé 6 mai 2026 — créé le 8 mai)
- Doc Flux 5 détaillée (`.md`)
- Doc Cartographie privée (`.md` ou `.html`)

## Références transcriptions

- `docs/transcription-karavia.txt` — réunion 9 mars 2026
- `docs/transcription-karavia2.txt` — réunion 14 mars 2026
- `docs/transcription-karavia3.txt` + `.json` — réunion 13 avril 2026
- `docs/transcription-karavia6.txt` — réunion 6 mai 2026
- `docs/transcription-karavia6-resume.md` — résumé structuré réunion 6 mai
- `docs/transcription2-resume.md` — résumé structuré réunion 14 mars
## ⚠️ CRITIQUE — Fichiers à éditer (ne pas confondre)

Le repo a DEUX copies de certains composants. Le CI build depuis la **racine** (`vite.config.js` à la racine). Toujours éditer les fichiers sous `src/` à la racine :

| À éditer | À NE PAS éditer |
|---|---|
| `src/components/Cartographie.jsx` | ~~`frontend/src/components/Cartographie.jsx`~~ |
| `src/components/CartographieLogin.jsx` | ~~`frontend/src/components/CartographieLogin.jsx`~~ |
| `src/utils/cartoAuth.js` | ~~`frontend/src/utils/cartoAuth.js`~~ |
| `src/index.css` | ~~`frontend/src/index.css`~~ |
| `public/carto.json` | ~~`frontend/public/carto.json`~~ |

Le dossier `frontend/` est un vestige de refactorisation — il n'est PAS utilisé par le build CI.
Vérifier toujours avec `cat vite.config.js` pour confirmer la racine du build.

## Conventions

- **Git** : `git stash && git fetch clairbois-dfip && git rebase clairbois-dfip/main && git stash pop` avant chaque push (Power Automate pousse carto.json en continu)
- **Deploy** : `git push clairbois-dfip main` — JAMAIS `git push origin main` pour le prod
- **Frontend** : React 19 + Vite + Tailwind v4, 100% français, mobile-first
- **Backend** : Édition JSON des flux, repackage en .zip pour import manuel
- **Documentation** : Commentaires JSDoc en français, pas de mention de Claude ou Karim
- **Langue** : Toujours communiquer en français

## Référence détaillée

- Frontend : voir `frontend/CLAUDE.md` pour les composants, IDs Forms, helpers
- Backend : voir `backend/CLAUDE.md` pour les flux, GUIDs, listes SharePoint
- Formulaires : voir `docs/forms/forms-reference.md` pour les 8 forms et leurs IDs
- Architecture : voir `docs/architecture-nouvelle.md` pour le nouveau design multi-forms
- Word OCAS : voir `docs/ocas-word-mapping.md` pour le mapping des champs
- Transcriptions : voir `docs/transcription-karavia.txt`, `docs/transcription-karavia2.txt` et `docs/transcription-karavia3.txt` (réunion 13 avril 2026)
- Transcription JSON avec timecodes : `docs/transcription-karavia3.json`
- Flux de cas : voir `docs/flux-cas-figures.html` (ouvrir dans un navigateur)
- Présentation IT : voir `docs/presentation-reunion-IT.html` (12 slides, ouvrir dans un navigateur)
