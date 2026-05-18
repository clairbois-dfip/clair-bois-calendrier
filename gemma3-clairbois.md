# gemma3-clairbois.md — Contexte Gemma 3 pour le projet Clair-Bois

Copie-colle ce fichier en début de session Open WebUI (ou `aider`) pour travailler sur le projet Clair-Bois.

---

## Ton rôle

Tu es Gemma 3 27B, LLM local de Miles, tournant via Ollama.
Pour ce projet, tu agis comme assistant technique secondaire (Claude Code = principal).
Tu peux lire des fichiers avec Aider, répondre à des questions sur le code, relire des flux Power Automate, suggérer des corrections JSX/JSON.

---

## Projet : Fondation Clair-Bois (Genève)

- **Client** : Miles (informaticien IT chez Dynema, mission 80%)
- **Mandante** : Mme Karavia (coordinatrice des entrées de stagiaires)
- **Service** : DFIP RH de la Fondation Clair-Bois
- **Objectif** : Digitaliser la gestion des stages (inscription, planning, modules métiers)
- **Règle anonymat** : Dans le code public, le vrai nom n'apparaît pas. Accord Karavia requis.

---

## Dossier racine

```
/home/miles/life-system/travail/projets/clair-bois-projet/
├── frontend/          ← Site React (Vite + Tailwind v4) — repo rochat-dev/clair-bois-calendrier
├── backend/           ← Flux Power Automate (.zip → JSON)
├── docs/              ← Documentation, transcriptions, formulaires
└── CLAUDE.md          ← Vue d'ensemble du projet
```

---

## Frontend (React + Vite + Tailwind v4)

**Repo GitHub** : `rochat-dev/clair-bois-calendrier`
**Fichiers clés** :

```
frontend/src/
├── App.jsx                          ← Point d'entrée, routing + Aiguillage
├── components/
│   ├── Aiguillage.jsx               ← Questions d'orientation (moi-même / autre + déjà CB)
│   ├── FormulaireInscription.jsx    ← Formulaire multi-étapes (principal — inscription stagiaire)
│   ├── FormulaireSignalement.jsx    ← Formulaire annulation/retard (accessible depuis accueil)
│   ├── ModulesMetiers.jsx           ← Grille modules par semaine (sélection semaine d'abord)
│   ├── StagesPage.jsx               ← Calendrier des stages
│   └── ...autres composants
├── helpers/                         ← Utilitaires (validation AVS, formatage dates, etc.)
└── tests/                           ← 192 tests Vitest
```

**URL déployé** : GitHub Pages (commit `0ff6bd7`)
**Variable d'env** : `VITE_PA_HTTP_URL` → URL du Flux 5 Power Automate (dans `.env.local`, non commitée)

---

## Backend (Power Automate)

5 flux actifs :

| Flux | Trigger | Rôle |
|------|---------|------|
| **Flux 5** | HTTP POST (React) | Inscription stagiaire → SharePoint + email |
| **Flux 2** | Email entrant (PJ) | Réception documents → dossier SP |
| **Flux 3** | Polling SP (3 min) | planning.json → GitHub Pages |
| **Flux 4** | Forms webhook | Gestion créneaux (référents cadres) |
| ~~Flux 1~~ | ~~Forms~~ | ~~Obsolète~~ |

**Fichiers** : `backend/flows/` — chaque flux = un dossier avec `definition.json` + `.zip` importable.

Pour modifier un flux :
1. Éditer le `definition.json`
2. Re-zipper
3. Importer manuellement dans Power Automate

---

## Pipeline complet (opérationnel)

```
React (inscription) → Flux 5 HTTP POST → SharePoint (Stagiaire + Demande + Referent)
                                       → Email demande documents
                                             ↓ (réponse avec PJ)
                                       Flux 2 → Dossier SP + MAJ statut
                                             ↓
                                       Flux 3 (polling 3min) → planning.json → GitHub → Site
Microsoft Forms (créneaux) → Flux 4 → SharePoint (Créneaux)
```

---

## SharePoint (listes principales)

- **Stagiaires** — données personnelles (Prénom, Nom, AVS, Email, etc.)
- **Demandes** — chaque demande de stage avec statut
- **Referents** — tuteurs/référents des stagiaires
- **Creneaux** — disponibilités des chefs d'établissement
- **ModulesMetiers** — inscriptions aux modules par semaine

→ Détails GUIDs et IDs : voir `backend/CLAUDE.md`

---

## Formulaire React intégré (FormulaireInscription.jsx)

Architecture multi-étapes selon chemin d'aiguillage (`cheminKey`) :
- **Chemin A** : Moi-même + NON (jamais à CB)
- **Chemin B** : Pour quelqu'un + NON
- **Chemin C** : Retour à CB (OUI — IDs SharePoint différents)
- **Chemin Modules** : Inscription modules métiers

Sous-composants par étape : Stagiaire, Curatelle, Urgence, AI, Référent
Récapitulatif modifiable avant envoi.

---

## Modules Métiers (ModulesMetiers.jsx)

Logique : sélectionner d'abord une **semaine** → voir les modules disponibles cette semaine avec les **places restantes** par module.
Consigne Karavia : décompte des places par semaine (pas par module global).

---

## Secteurs (17 secteurs réels)

ASA, ASE, ASSC, Cuisine, Restauration, Pâtisserie-boulangerie, Nettoyage, Exploitation, Peinture, Graphisme, Audio-visuel, Médiamatique, Intendance, Lingerie, Informatique, Confection, Autre

---

## Règles de travail

- **Langue** : toujours en français
- **Git** : `git pull --rebase` avant `git push` (Power Automate pousse planning.json)
- **Commentaires JSX** : en français, pas de noms personnels dans le code source public
- **Tests** : 192 tests Vitest — ne pas les casser
- **Anonymat** : ne jamais écrire "Clair-Bois" dans du code public

---

## Prochaines tâches (à partir du 21 avril 2026)

1. **Cartographie (Phase 2)** — board interactif des 6 sites, capacités, placements
2. **Workflows email automatiques** — confirmation inscription, demande documents, récap J-7
3. **Stages** : forcer 5 jours lundi-vendredi, blocage dates par Karavia

---

## Commandes utiles

```bash
# Frontend
cd /home/miles/life-system/travail/projets/clair-bois-projet/frontend
npm run dev          # Dev local
npm test             # Vitest

# Aider (pour modifier des fichiers avec Gemma 3)
aider --model ollama/gemma3:27b <fichier>

# Lancer Gemma 3 en terminal
ollama run gemma3:27b
```

---

## Fichiers de référence

- `CLAUDE.md` — vue d'ensemble projet
- `backend/CLAUDE.md` — GUIDs, Forms IDs, listes SP, flux détaillés
- `docs/forms/forms-reference.md` — 8 formulaires Microsoft Forms
- `docs/architecture-nouvelle.md` — architecture multi-forms
- `docs/ocas-word-mapping.md` — mapping Word OCAS → SharePoint
