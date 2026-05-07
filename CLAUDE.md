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

## État actuel (6 mai 2026)

- **Site actif et déployé** sur GitHub Pages (commit `0ff6bd7`) — en mode démo (sans connexion PA réelle)
- **Pipeline opérationnel** : React → Flux 5 HTTP → SP → Flux 3 → GitHub → Site (inchangé)
- **Frontend FAIT** : aiguillage, 17 secteurs, formulaire React intégré multi-étapes
- **Cartographie privée refondue (6 mai 2026)** — analogie "plan de table de mariage" demandée par Karavia (réunion 13 avril) :
  - **6 plans métier** (Restauration, Cuisine, Lingerie, Technique, Éducatif Pôle enfance-adolescence, Éducatif Pôle adulte) — l'Éducatif est éclaté en deux plans distincts conformément à la transcription du 13 avril
  - **Métaphore visuelle** : tables centrales (motif bois) = établissements, sièges autour = places typées FPra/AFP-CFC/Stage/CEA (cercles colorés)
  - **Animation "boom ça entre"** au clic sur un plan : capture du rect du bouton + scale 480 ms easing out-expo
  - **Header sticky de stats globales** sur la vue d'ensemble carto, barre de progression avec couleur dynamique
  - **Données mock variées** : 4 plans verts, 2 oranges (Cuisine, Éducatif enfance), 1 rouge (Lingerie) — permet de visualiser les codes couleur
  - **Authentification** : `CartographieLogin.jsx` + `cartoAuth.js`, token sessionStorage 24h (clé `cb-carto-token`), mots de passe CSV via `VITE_CARTO_PASSWORDS`
  - **Icônes lucide-react** ajoutées (UtensilsCrossed, ChefHat, Shirt, Wrench, GraduationCap, Home, etc.)
  - Données mockées en dur — connexion Flux 6 PA prévue (`VITE_PA_CARTO_URL`)
  - Détails complets : `frontend/CLAUDE.md` section "Cartographie privée"
- **Flux 5 étendu (mai 2026)** : gère désormais stages ET modules métiers → SP (Stagiaire + Demande[s] + Referent + Email)
  - Modules : 1 Demande par module sélectionné (max 3), Foreach sans lookup créneau (fix bug timeout 504 OData)
  - TypeDemande (Choice: Stage / Module métier) dans SP Demande
  - ReferentContact (texte: "Prénom Nom — Partenaire" ou "Aucun") pour visibilité Rosina
  - Statut Demande : "Confirmé" (remplace "Validé" — supprimé)
- **WeekDetail.jsx corrigé** : bouton "S'inscrire" connecté au formulaire React (via `onInscription` + `pendingWeekContext` dans App.jsx)
- **9/9 tests Flux 5** (`backend/test-flux5.js`) couvrant toutes les branches (stages + modules) ✅
- **217 tests Vitest** au total côté frontend (helpers, validation, formConfig, formulaire, modules, signalement, **24 tests cartographie** inclus, tous passants)
- **Présentation IT créée** : `docs/presentation-reunion-IT.html` (12 slides, laser pointer, popups techniques)
- **Modules métiers refondus** : sélection semaine d'abord → grille modules avec places par semaine (consigne Rosina)
- **Formulaire signalement** : annulation/retard accessible depuis la page d'accueil (`FormulaireSignalement.jsx`)
- **Flux global visuel** : `docs/flux-global.html` — graphe interactif vis-network (acteurs, flux PA, listes SP)

### Sécurité — PA URL et hébergement (mis à jour 6 mai 2026)

**Risques sécurité majeurs identifiés :**
- `VITE_PA_HTTP_URL` : si déployée sans proxy, Vite la **bundle** dans le JS compilé → URL visible en clair sur GitHub Pages → spam possible du trigger PA
- `VITE_CARTO_PASSWORDS` : mots de passe en clair côté client (acceptable en local, à transposer côté serveur en prod)
- **Token cartographie en base64** (pas de crypto) — à remplacer par un JWT côté serveur

**Stratégie actuelle (correcte) :**
- GitHub Pages = mode démo (`VITE_PA_HTTP_URL` absent → simulation côté client)
- **Travail en local** : `.env.local` avec l'URL réelle → `npm run dev` → formulaire tape dans PA → écrit dans SP → pipeline complet
- La migration locale → Infomaniak/Azure peut se faire sans bloquer le travail

**Workflow de test local :**
```bash
# Dans frontend/.env.local (jamais commité)
VITE_PA_HTTP_URL=https://prod-xx.westeurope.logic.azure.com/...
VITE_CARTO_PASSWORDS=motdepasse1,motdepasse2

npm run dev   # → formulaire connecté au vrai Flux 5
```

**Production cible (post-validation IT) :**
```
React → /api/inscription (Azure Function ou proxy Infomaniak) → PA → SP
```
L'URL PA ne sera jamais dans le bundle client.

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
- **Pattern Flux 5 retenu pour la carto** (HTTP request live), pas Flux 3 (polling → GitHub) : la cartographie ne doit jamais être publiée sur un GitHub public et doit refléter l'état SP en temps réel.

### Décisions prises (6 mai 2026)
- **Refonte cartographie privée** — implémentation des 6 plans métier (avec Éducatif éclaté en 2 pôles), métaphore table+sièges aboutie, animation "boom ça entre", header sticky de stats globales, données mock variées vert/orange/rouge. 24 tests Vitest dédiés, tous passants.
- **Suppression de la carto isolée** — un projet carto isolé avait été créé sur le PC fixe (commit `3392661 Clair-Bois : carto isolée avec PasswordPage ajoutée` sur `rochat-dev`). Après comparaison avec la version intégrée, **décision de garder uniquement la version intégrée** (métaphore table+sièges, animation immersive, notion d'établissement, multi-mdp, sessionStorage). La version isolée a été supprimée du local et reste à supprimer de la branche `rochat-dev` au prochain commit.

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

### Prochaines étapes (priorisées — 6 mai 2026)

#### CRITIQUE / Bloquant
1. **Flux 6 PA HTTP GET** — Cartographie : récupère SP Cartographie + SP Demande (`Statut='Confirmé'`) → JSON live, à brancher sur `VITE_PA_CARTO_URL`
2. **Flux Confirmation Rosina** — déclenché par MAJ `Demande.Statut='Confirmé'` → email stagiaire + MAJ Carto + commande Intendance
3. **Flux Signalement** — séparer du Flux 5, déclenché par POST `type:'signalement'` depuis `FormulaireSignalement.jsx`
4. **Canal Word AI / OCAS** — extraction Word depuis email HIN ou folder SharePoint

#### Important
5. Refonte des emails automatiques (confirmation, demande de documents, relance J-7)
6. Vérification doublon stagiaire avant création (lookup AVS depuis frontend)
7. Proxy sécurisé URL PA (Azure Function ou Infomaniak)

#### Nice to have
8. Sauvegarde `sessionStorage` anti-perte de saisie sur le formulaire
9. Panel référent cadre (gestion dispos directe)
10. Configuration dynamique des établissements (depuis SP au lieu de hardcodé)
11. Nettoyage code mort (`MODULES_FORMS_URLS`, `frontend/src/backup-19mars/`, `Cartographie.backup-prototype.jsx`)

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

## Blocages connus (6 mai 2026)

- **Décision IT pendante** : Infomaniak vs Azure Static Web Apps pour l'hébergement
- **PA Premium à confirmer** : connecteur Word nécessaire pour OCAS
- **Crédits PA à valider** avant la création des Flux 6/7/8/9
- **Décisions Karavia en attente** : canal Word AI (email HIN vs folder SharePoint), modalités de blocage des dates par Karavia

## Documentation à créer

- `transcription-karavia3-resume.md` (résumé des décisions du 13 avril 2026)
- Doc Flux 5 détaillée (`.md`)
- Doc Cartographie privée (`.md` ou `.html`)

## Conventions

- **Git** : `git pull --rebase` avant chaque `git push` (Power Automate pousse planning.json)
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
