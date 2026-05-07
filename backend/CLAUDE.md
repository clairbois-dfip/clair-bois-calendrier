# Clair-Bois — Backend Power Automate

## Git

- **Repo** : `rochat-dev/life-system` (mono-repo)
- **Chemin** : `travail/projets/clair-bois-projet/backend/`
- **Branche de travail** : `rochat-dev` (partagée avec autre PC) — `main` reste stable
- **Pull** : `git -C ~/life-system pull origin rochat-dev`
- **Push** : `git -C ~/life-system push origin rochat-dev`

> Ce sous-projet fait partie de `clair-bois-projet/`. Voir `../CLAUDE.md` pour la vue d'ensemble et le plan d'évolution.

## À lire en premier

Ce fichier contient la documentation technique et métier des flux Power Automate.

---

## État des flux au 6 mai 2026

| Flux | Trigger | État | GUID |
|------|---------|------|------|
| **Flux 5** | HTTP POST | ACTIF — gère stages + modules (9/9 tests ✅) | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| **Flux 2** | Email entrant (PJ) | ACTIF | `b865cf6d-dfdf-4b46-8df0-5d0e82baed17` |
| **Flux 3** | Polling SP (3 min) | ACTIF | `e03bb264-eb3c-4ebd-bd63-87a78c083b68` |
| **Flux 4** | Forms webhook | ACTIF | `f4c82a19-7d5e-4b3a-9f1c-8e6d2a0b5c47` |
| ~~**Flux 1**~~ | ~~Forms webhook~~ | OBSOLÈTE — remplacé par Flux 5 | `8affe7f1-3296-48a2-a2cb-1de6832d8997` |

**Tests automatisés** : `test-flux5.js` couvre 9 cas (5 stages : moi/autre × nouveau/existant + curatelle+AI ; 4 modules : moi/autre × 1/3 modules) — **9/9 ✅** (4 mai 2026).

---

## Objectif du projet

Modifier les flux Power Automate de la Fondation Clair-Bois (service DFIP RH) en éditant leurs fichiers JSON, puis les repackager en `.zip` prêts à être importés dans Power Automate via "Package d'importation (hérité)".

**Principe de travail :**
1. Déziper le flux concerné
2. Modifier **uniquement** `definition.json`
3. Rezipper en conservant exactement la même structure
4. Livrer le `.zip` à l'utilisateur qui l'importe manuellement

---

## Structure du projet

```
/
├── CLAUDE.md                                         ← ce fichier (documentation complète)
├── TestsForm.txt                                     ← données de test pour les 2 branches du formulaire
├── LeFormulaireActuel.pdf                            ← capture du formulaire Forms (16 pages)
├── flux-inscriptions-export_20260304152634.zip       ← Flux 1 original (export Power Automate)
├── flux-inscriptions-modifie.zip                     ← Flux 1 modifié (prêt à importer)
├── reception-piece-jointes_20260304155127.zip        ← Flux 2 original (export Power Automate)
├── reception-piece-jointes-modifie.zip               ← Flux 2 modifié (prêt à importer)
├── flux3-planning-modifie.zip                        ← Flux 3 modifié (prêt à importer)
├── flux4-gestion-creneaux.zip                        ← Flux 4 modifié (prêt à importer)
├── flux5-http-inscription.zip                        ← Flux 5 HTTP trigger (ACTIF — remplace Flux 1)
├── build-flux5-http.js                               ← Script de construction du Flux 5
├── test-flux5.js                                     ← Tests automatisés Flux 5 (9/9 ✅ — 4 mai 2026)
├── FLUX-REFERENCE.md                                 ← Référence complète des flux, IDs, mapping React→SP
├── build-flux3.js                                    ← Script de construction du Flux 3
├── build-flux4.js                                    ← Script de construction du Flux 4
├── add-creneauID.js                                  ← Script d'ajout CreneauID au Flux 1
├── flux1-work-fix/                                   ← Dossier de travail Flux 1
├── flux3-work/                                       ← Dossier de travail Flux 3
├── flux4-work/                                       ← Dossier de travail Flux 4
└── captures/                                         ← Captures d'écran de test
```

**Projet lié** : `C:\Users\karim\clair-bois-calendrier` — Frontend React (GitHub Pages)

---

## Structure interne des zips

```
MonFlux.zip
└── Microsoft.Flow/
    └── flows/
        └── {FLOW-GUID}/
            ├── definition.json       ← fichier principal à modifier
            ├── connectionsMap.json   ← à mettre à jour si nouveaux connecteurs
            └── apisMap.json          ← à mettre à jour si nouveaux connecteurs
    └── manifest.json                 ← à mettre à jour si nouveau flux
└── manifest.json                     ← à mettre à jour si nouveau flux
```

### Format des maps (IMPORTANT — leçon apprise)
- **apisMap.json** : mappe les noms de connecteurs vers les **GUIDs de ressource du manifest** (PAS les chemins API)
  - Correct : `{"shared_sharepointonline":"2e6b970c-dc5b-4920-8b1a-981b957283d0"}`
  - Incorrect : `{"shared_sharepointonline":"/providers/Microsoft.PowerApps/apis/shared_sharepointonline"}`
- **connectionsMap.json** : mappe les noms de connecteurs vers les **GUIDs de connexion du manifest**
  - Exemple : `{"shared_sharepointonline":"c1e11ff6-1671-4f41-a2e2-6986289998fd"}`
- Quand un flux original n'utilise pas un connecteur, ces fichiers sont vides `{}` — il faut les remplir manuellement

---

## IDs techniques de l'environnement (à conserver impérativement)

### Flux 5 — "Flux 5 - HTTP Inscription React" (ACTIF — remplace Flux 1)
- **FLOW-GUID** : `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- **Flow ID** : `f5a1b2c3-d4e5-f678-90ab-cdef12345678`
- **Trigger** : HTTP POST (Request/Http) — URL générée par PA
- **Connexions** :
  - `shared_sharepointonline` → `c1e11ff6-1671-4f41-a2e2-6986289998fd`
  - `shared_office365` → `15b1713b-141c-4abf-b406-9781ffafdbdb`
- **Script** : `build-flux5-http.js`
- **Zip** : `flux5-http-inscription.zip`
- **Tests** : `test-flux5.js` — 9 cas couvrant toutes les branches (stages×moi/autre×nouveau/existant + curatelle+AI + modules×moi/autre×1/3 modules) — 9/9 ✅

**Logique (mise à jour mai 2026)** :
1. Check AVS → MAJ ou Créer Stagiaire
2. Condition `parcours` = `stages` ou `modules` :
   - **stages** : Requête_Creneau (lookup par Secteur+date) → Créer_Demande (TypeDemande='Stage', CreneauID, ReferentContact)
   - **modules** : Foreach sur `triggerBody()?['modules']` → pour chaque module : Créer_Demande_Module (TypeDemande='Module métier', Secteur=module.nom, Etablissement=module.site, DateDebutSouhaitee=module.dateDebut, ReferentContact) — **SANS lookup créneau** (fix bug OData é→timeout 504)
3. Si `pourQui=autre` → Créer Referent (une seule fois)
4. Email demande documents → HTTP 200

**Champ `ReferentContact`** (texte) : `"Prénom Nom — Partenaire"` si pourQui=autre, `"Aucun"` si moi
**Testé** : 19 mars 2026 (stages), 4 mai 2026 (modules + 9 tests automatisés)

### ~~Flux 1 — "Flux inscriptions" (OBSOLÈTE — remplacé par Flux 5)~~
- **FLOW-GUID** : `8affe7f1-3296-48a2-a2cb-1de6832d8997`
- **Flow ID** : `85126746-e078-44c9-be31-df21319d1c48`
- **Connexions** :
  - `shared_microsoftforms` → `bdeb5556-a627-4e30-bc7c-fd0915978877`
  - `shared_sharepointonline` → `c1e11ff6-1671-4f41-a2e2-6986289998fd`
  - `shared_office365` → `15b1713b-141c-4abf-b406-9781ffafdbdb`

### Flux 2 — "réception des pièces jointes"
- **FLOW-GUID** : `b865cf6d-dfdf-4b46-8df0-5d0e82baed17`
- **Flow ID** : `5584f91b-2235-4050-98d8-7efe607cc5c4`
- **Connexions** :
  - `shared_sharepointonline` → `c1e11ff6-1671-4f41-a2e2-6986289998fd`
  - `shared_office365` → `15b1713b-141c-4abf-b406-9781ffafdbdb`

### Flux 3 — "Flux 3 - Génération planning.json"
- **FLOW-GUID** : `e03bb264-eb3c-4ebd-bd63-87a78c083b68`
- **Flow ID** : `4065c32b-b091-48a8-9755-fec5c13365dd`
- **Connexions** :
  - `shared_sharepointonline` → `c1e11ff6-1671-4f41-a2e2-6986289998fd`
- **GitHub repo** : `rochat-dev/clair-bois-calendrier`
- **GitHub fichier** : `public/planning.json`
- **Trigger** : polling toutes les 3 minutes sur liste Demande

### Flux 4 — "Flux 4 - Gestion des créneaux"
- **FLOW-GUID** : `f4c82a19-7d5e-4b3a-9f1c-8e6d2a0b5c47`
- **Flow ID** : `b7a91c3d-2e4f-5060-8172-93a4b5c6d7e8`
- **Connexions** :
  - `shared_microsoftforms` → `bdeb5556-a627-4e30-bc7c-fd0915978877`
  - `shared_sharepointonline` → `c1e11ff6-1671-4f41-a2e2-6986289998fd`
- **Form** : "Gestion des créneaux" (`xHCDs-...SUNOQi4u`)
- **Script de build** : `build-flux4.js`
- **Zip** : `flux4-gestion-creneaux.zip`
- **Actions** : Obtenir réponse → Vérifier mot de passe → Créer_Créneau (PostItem → liste Creneaux)
- **Mot de passe** : vérifié côté flux (soumission ignorée si incorrect)

### Listes SharePoint (état au 6 mai 2026)
| Liste | GUID | État |
|-------|------|------|
| **Stagiaire** | `bf357221-7e74-4905-9b58-b4ea22f79de0` | ACTIVE |
| **Demande** | `9616ee1d-dd0b-44fd-a1c4-34187ebaa9f8` | ACTIVE |
| **Referent** | `7a31b912-99af-4415-bfc9-f2ae1cb19c00` | ACTIVE |
| **Creneaux** | `3e2deb27-f496-410f-be74-281eb2b0c079` | ACTIVE |
| **Cartographie** | — | NON CRÉÉE (à faire pour Flux 6) — schéma à définir : Site, Pole, NomStructure, Type, Accueil, Formateurs, CapacitesParType, Commentaire |

### Connexions (référence complète)
| Connecteur | GUID Connexion (`connectionsMap`) | GUID API (`apisMap`) |
|-----------|-----------------------------------|----------------------|
| `shared_sharepointonline` | `c1e11ff6-1671-4f41-a2e2-6986289998fd` | `2e6b970c-dc5b-4920-8b1a-981b957283d0` |
| `shared_office365` | `15b1713b-141c-4abf-b406-9781ffafdbdb` | `c70bccb1-c5b8-4d65-afa0-ce6031f446c5` |
| `shared_microsoftforms` | `bdeb5556-a627-4e30-bc7c-fd0915978877` | `607ecd1d-8ed5-4906-b390-ef1c71282796` |

### Tenant / Environnement
- **Tenant** : `b38370c4-d4e6-4db3-8103-301e95e4e40c`
- **Creator ID** : `3995bcc7-5e9e-4254-8370-a930628a2317`
- **SharePoint site** : `https://fondationclairbois.sharepoint.com/sites/DFIP-SiteEquipe`
- **Email flux** : `stagiaire.dfip@clairbois.ch`

---

## Règles impératives

### Pour modifier definition.json
1. **Ne jamais changer** les GUIDs de flux, les IDs de connexion, le tenantId, le creatorId
2. **Conserver** tous les `connectionName` existants (`shared_microsoftforms`, `shared_sharepointonline`, `shared_office365`)
3. **Les noms d'actions sont en français** avec underscores (ex: `Envoyer_une_requête_HTTP_à_SharePoint`)
4. **Les caractères spéciaux** dans les clés JSON sont encodés en Unicode (ex: `é` → `\u00e9`) — laisser Python/json.dump gérer ça automatiquement
5. **Ne jamais modifier** `connectionsMap.json`, `apisMap.json`, `manifest.json`
6. Après modification, **valider le JSON** avant de rezipper

### Règles métier
- Le renommage des fichiers/dossiers se fait de l'intérieur vers l'extérieur
- L'objet du mail masque l'AVS : format `[AVS-756.XXXX.XXXX.{2 derniers chiffres} D°{DemandeID}]`
- Le flux 2 parse le D° (ID Demande) depuis l'objet du mail, puis récupère le StagiaireID via lookup Demande
- Le champ Curatelle est booléen dans SharePoint mais texte dans Forms → conversion avec `equals(..., 'Oui')`
- Le champ Mail dans la liste Stagiaire utilise **toujours** l'email du stagiaire (`r93aa4aa6`), dans les 2 branches
- Le champ Secteur est de type **texte** (pas choix) dans SharePoint → pas de `/Value`
- Le champ DejaStage est **booléen** dans SharePoint → conversion avec `equals(..., 'Oui')` (comme Curatelle)
- Le champ AssuranceInvalidite est de type **Choix** dans SharePoint → utiliser `/Value`
- Les anciens IDs curatelle (`r0819bfe`, `r32c41d3`, `rfd6b36d`, `r75e583e`) correspondent maintenant aux champs **AI conseiller** (réassignés par Mme Karavia)
- Les nouveaux IDs curatelle sont : `r1a6a753b`, `rb42f90e1`, `r7456ee13`, `re11798a4`, `r669b1279`
- Les lookups SP de type "chercher" utilisent le format `item/NomColonne/Id` (pas l'entier directement)

---

## Bugs connus

### OData "é" — timeout 504 sur lookup créneau (mai 2026)
- **Symptôme** : un filtre OData contenant un caractère accentué (ex: `Secteur eq 'Tourbillon Découverte'`) provoque un **400 Bad Request** côté SharePoint, suivi de **4 retries automatiques** par Power Automate, aboutissant à un **timeout 504**.
- **Contexte** : déclenché par `Requête_Creneau` dans Flux 5 lorsqu'un module métier contient un nom accentué.
- **Contournement actuel** : le lookup créneau est **désactivé pour les modules** (Foreach sans `Requête_Creneau`). Une Demande est créée par module avec `Secteur=module.nom`, sans `CreneauID`.
- **À résoudre proprement** : encoder l'accent en URI (`%C3%A9`) ou passer par un filtre Search/CAML, ou normaliser les noms de modules sans accents en SP.

---

## Fichiers obsolètes à supprimer

Une fois la stabilité de Flux 5 confirmée, ces artefacts peuvent être nettoyés :

### Zips obsolètes
- `flux-inscriptions-export_20260304152634.zip` — export original Flux 1 (remplacé par Flux 5)
- `reception-piece-jointes_20260304155127.zip` — export original Flux 2 (le zip modifié est suffisant)
- `Test_20260306125936.zip` — test inutile
- `flux3b-trigger-creneaux.zip` — variante Flux 3 non utilisée

### Scripts obsolètes
- `build-flux3b.js` — variante non retenue
- `modify-flux1.js` — ancien script (Flux 1 obsolète)
- `modify-flux2.js` — ancien script

### Dossiers de travail temporaires
- `flux1-extract/`
- `flux1-work-fix/`
- `flux2-work/`
- `flux3-work/`
- `flux3b-work/`
- `flux4-work/`

---

## Workflow de modification (à suivre à chaque tâche)

```bash
# 1. Déziper
unzip flux-inscriptions-export_*.zip -d flux1-work

# 2. Identifier le FLOW-GUID
ls flux1-work/Microsoft.Flow/flows/

# 3. Modifier definition.json
# ... modifications ...

# 4. Valider le JSON
python3 -m json.tool flux1-work/Microsoft.Flow/flows/{GUID}/definition.json > /dev/null

# 5. Rezipper en conservant la structure exacte
cd flux1-work && zip -r ../flux1-modifie.zip . && cd ..

# 6. Livrer flux1-modifie.zip à l'utilisateur
```

---

## Procédure d'import (côté utilisateur — pour info)

1. Power Automate → Mes flux → Importer → Package d'importation (hérité)
2. Uploader le `.zip`
3. Pour chaque connecteur rouge → cliquer le crayon → sélectionner la connexion `stagiaire.dfip@clairbois.ch`
4. Pour le flux → choisir "Mettre à jour" → sélectionner le flux existant
5. Cliquer Importer

---

## Patterns d'expressions Power Automate utilisés dans ces flux

```
# Lire un champ de réponse Forms
outputs('Obtenir_les_détails_de_la_réponse')?['body/{field_id}']

# Concaténer pour URI SharePoint
concat('_api/web/lists/getbytitle(''Stagiaire'')/items?$filter=AVS eq ''', variables('varAVS'), '''')

# Extraire ID depuis objet mail (ex: "N°42]")
first(split(split(triggerOutputs()?['body/subject'],'N°')[1],']'))

# Masquage AVS dans objet mail
concat('[AVS-756.XXXX.XXXX.', substring(body/AVS, sub(length(body/AVS), 2)), ' N°', body/ID, '] Documents requis pour ', body/Nom, ' ', body/Prenom)
```

---

## Mapping complet des champs Microsoft Forms → IDs

> Extrait directement de l'API Forms le 05/03/2026. À mettre à jour si Mme Karavia modifie le formulaire (procédure : ouvrir Forms en édition → F12 → Network → recharger → cliquer la requête `forms(xHCDs...)` → Response → copier tout → fournir à Claude pour extraction).
> **AllowPrefill activé** — les champs peuvent être préremplis via URL (`?{fieldId}={value}`).

**ID du formulaire** : `xHCDs-bUs02BAzAeleTkDMe8lTmeXlRCg3CpMGKKIxdUQllQODVJS0wwV01RM0cwSk1RSTlHUEVPVi4u`

### Section Préliminaire
| Label | ID | Type |
|---|---|---|
| Je remplis ce formulaire pour: | `r279198a1deae49b5b010b443a2e0eeed` | Choice |
| Ma demande de stage concerne le secteur suivant: | `r1faa50a65150406b95d3a62e45550e40` | Choice |

### Section Référent (quand "Quelqu'un d'autre")
| Label | ID | Type |
|---|---|---|
| Partenaire | `r62ce4825b9d641f1b0c916fdab1dc246` | TextField |
| Nom (référent) | `r8426975aa0714f2ebdf559aca82adb75` | TextField |
| Prénom (référent) | `r99d854c49c994916a8656e5c39cd8997` | TextField |
| Numéro de téléphone (référent) | `r7ed3be9bf05c452c8887b6e39c0400b6` | TextField |
| Adresse e-mail (référent) | `rb05d7471e33c4db1818de26dd59ca4dd` | TextField |
| Fonction | `r64c00ae2bfff4f4a8bbd99885ea40d9c` | Choice |

### Section Stagiaire
| Label | ID | Type |
|---|---|---|
| Nom | `r0a5286e1e9484d7fb4917b0e17aafdde` | TextField |
| Prénom | `r51eac184630a40c582dda502c5159dcc` | TextField |
| Sexe | `re65d57924f8c4271b6e502134e2fe906` | Choice |
| Date de naissance | `rd674de1f8204491083de8ccfdeb0fd6e` | DateTime |
| Numéro AVS | `rddc7676789f4474ea2ffd68f6388dfd9` | TextField |
| Numéro de téléphone (stagiaire) | `ra15151fc6895428ab11b24c3de424a0b` | TextField |
| Adresse e-mail (stagiaire) | `r93aa4aa6613d4e11b7afe37712f9a362` | TextField |
| Adresse postale | `r67388c86f7c64c26bc75af14ac4ac699` | TextField |
| NPA/Localité | `ra4388b28125744569c060e3ef31cace9` | TextField |

### Section Urgence
| Label | ID | Type |
|---|---|---|
| Nom (urgence) | `rb96ff7c4a7c74c06855477eedf3982d1` | TextField |
| Prénom (urgence) | `r5ff75960203844a0bb3a3e26224b291f` | TextField |
| Lien (urgence) | `r0bd85bffee0e45c09d739fe4b871955d` | Choice |
| Numéro de téléphone (urgence) | `ra2f1dfb031ca48e18d8a3d64688dde45` | TextField |

### Section Stage / Planning (préremplis depuis le calendrier)
| Label | ID | Type |
|---|---|---|
| Établissement souhaité | `r2876f0c952f44887946296b4c95367a3` | TextField |
| Date de début souhaitée | `r50efe78018854247bf6e734db7188d70` | DateTime |
| Déjà stagié dans ce secteur? | `r9385fc308c554ca68e57f904c4d65bdd` | Choice |
| Objectif du stage | `rf8524324a2184a329c4351ff39b771d7` | TextField |
| Limitations fonctionnelles | `ra96b2095ead84cf086d63f5b7bb8842f` | TextField |
| Parcours scolaire | `r1b0cf13f9a9c4e5389a6475b485121e7` | TextField |
| Tests déjà effectués | `rf7189c8f653c40999800b94e591fbe3f` | Choice |
| Réseau (thérapeute, médecin...) | `r27377ab8dd76443f97ea08c29cfe8f6d` | Choice |

### Section Assurance Invalidité (AI)
| Label | ID | Type |
|---|---|---|
| Inscrit à l'Assurance Invalidité | `ra974f77cc1bf40a0832c11f85d0cad2d` | Choice |
| Nom conseiller.ère AI | `r0819bfe19533497a8b944b20dc3bcf02` | TextField |
| Prénom conseiller.ère AI | `r32c41d36df3a400eb0408d77919da6e5` | TextField |
| Tél conseiller.ère AI | `rfd6b36d0309d4e59b2906e0f79c73ac3` | TextField |
| Email conseiller.ère AI | `r75e583eba6eb4fc292b260baf6d18e32` | TextField |

### Section Curatelle
| Label | ID | Type |
|---|---|---|
| Sous curatelle? | `r60b463d8e39146869c8669ea35bc36da` | Choice |
| Curateur.trice (type) | `r669b127914f84e47a35e1275bb176dd1` | Choice |
| Nom curateur.trice | `r1a6a753b75fd4e5b9fedcac9e4cd04e0` | TextField |
| Prénom curateur.trice | `rb42f90e162eb4f32b31ddf16011f7125` | TextField |
| Tél curateur.trice | `r7456ee13e9374b6891e1d7bb7cf3fd42` | TextField |
| Email curateur.trice | `re11798a485d14196969cc71183cbc488` | TextField |

### Section Uniforme
| Label | ID | Type |
|---|---|---|
| Taille t-shirt/chemise | `r7d55b2fb08c94ca8aca66a96b0b6c8be` | TextField |
| Taille pantalon | `r96a1290db28d402686ee34174d4990a9` | TextField |
| Pointure | `r89d1d8e6dafa40e2abbceef073d253dc` | TextField |

### Section Admin
| Label | ID | Type |
|---|---|---|
| Charte (lien) | `rc5f8accc0a9849d288d0258a002a9915` | Ranking |
| Déclaration sur l'honneur | `recb489fb113f4fad9a447e29b34dc4f3` | Choice |

---

## FLUX 1 : "Flux inscription Stage"

### Architecture globale (état actuel — 05/03/2026, avec séparation Stagiaire/Demande)

```
Formulaire soumis
  └─ Condition_1 : "Moi-même" ?
       ├─ VRAI (stagiaire)
       │   └─ Condition filtre mail (r93aa4aa6 → @clair-bois.ch OU rochat.vdge)
       │       └─ HTTP check AVS → Condition_3 (existe ?)
       │           ├─ VRAI → MAJ Stagiaire → Créer_Demande → Email (D°{DemandeID})
       │           └─ FAUX → Créer Stagiaire → Créer_Demande_1 → Email (D°{DemandeID})
       │
       └─ FAUX (référent)
           └─ Condition_2 filtre mail (rb05d7471 → @clair-bois.ch OU rochat.vdge)
               └─ HTTP check AVS → Condition_4 (existe ?)
                   ├─ VRAI → MAJ Stagiaire → Créer_Référent_1 → Créer_Demande_2 → Email (D°{DemandeID})
                   └─ FAUX → Créer Stagiaire → Créer_Référent → Créer_Demande_3 → Email (D°{DemandeID})
```

### Actions Créer_Demande (4 actions, liste `9616ee1d`)
Champs communs : StagiaireID/Id (lookup), Etablissement, Secteur, DateDebutSouhaitee, ObjectifStage, DejaStage (booléen), Statut/Value = "En attente des documents", Limitations, ParcoursScolaire
- Branches Référent (`Créer_Demande_2`, `Créer_Demande_3`) : + ReferentID/Id (lookup)
- Branches Moi-même (`Créer_Demande`, `Créer_Demande_1`) : ReferentID vide

### Déclencheur
- **Type** : `Lorsqu'une nouvelle réponse est envoyée` (Microsoft Forms)
- **Form ID** : `xHCDs-bUs02BAzAeleTkDMe8lTmeXlRCg3CpMGKKIxdUQllQODVJS0wwV01RM0cwSk1RSTlHUEVPVi4u`

### Étape 1 : Obtenir les détails de la réponse
- Action standard Microsoft Forms `GetFormResponseById`

### Étape 2 : Condition 1 — "Stagiaire ou Référent ?"
- **Expression** : `outputs('Obtenir_les_détails_de_la_réponse')?['body/r279198a1deae49b5b010b443a2e0eeed']` est égal à `Moi-même`
- **Vrai** = Le stagiaire remplit pour lui-même
- **Faux** = Un référent (assistant social, etc.) remplit pour le stagiaire

### Branche VRAI (Stagiaire — "Moi-même")

#### Condition — Filtre mail autorisé
- **Type** : OU
- `outputs('Obtenir_les_détails_de_la_réponse')?['body/r93aa4aa6613d4e11b7afe37712f9a362']` contient `@clair-bois.ch`
- `outputs('Obtenir_les_détails_de_la_réponse')?['body/r93aa4aa6613d4e11b7afe37712f9a362']` contient `rochat.vdge`

##### Si autorisé → Vrai :

**Envoyer une requête HTTP à SharePoint** (vérifier si AVS existe déjà)
- Site : `https://fondationclairbois.sharepoint.com/sites/DFIP-SiteEquipe`
- Méthode : GET
- URI : `concat('_api/web/lists/getbytitle(''Stagiaire'')/items?$select=Id,AVS&$filter=AVS eq ''', outputs('Obtenir_les_détails_de_la_réponse')?['body/rddc7676789f4474ea2ffd68f6388dfd9'], '''')`

**Condition 3** — L'AVS existe-t-il ?
- Expression : `length(body('Envoyer_une_requête_HTTP_à_SharePoint')?['d']?['results'])` est supérieur à `0`

**Si Vrai (existe déjà) → Mettre à jour l'élément** :
- Liste : `Stagiaire` (ID de table : `bf357221-7e74-4905-9b58-b4ea22f79de0`)
- ID : `first(body('Envoyer_une_requête_HTTP_à_SharePoint')?['d']?['results'])?['Id']`
- Tous les champs mappés (voir mapping Forms → SP ci-dessous)
- Puis **Envoyer un e-mail (V2) 2** avec objet :
```
concat('[AVS-756.XXXX.XXXX.', substring(outputs('Obtenir_les_détails_de_la_réponse')?['body/rddc7676789f4474ea2ffd68f6388dfd9'], sub(length(outputs('Obtenir_les_détails_de_la_réponse')?['body/rddc7676789f4474ea2ffd68f6388dfd9']), 2)), ' N°', first(body('Envoyer_une_requête_HTTP_à_SharePoint')?['d']?['results'])?['Id'], '] Documents requis pour ', outputs('Obtenir_les_détails_de_la_réponse')?['body/r0a5286e1e9484d7fb4917b0e17aafdde'], ' ', outputs('Obtenir_les_détails_de_la_réponse')?['body/r51eac184630a40c582dda502c5159dcc'])
```
- Destinataire : `outputs('Obtenir_les_détails_de_la_réponse')?['body/r93aa4aa6613d4e11b7afe37712f9a362']`

**Si Faux (n'existe pas) → Créer un élément** :
- Liste : `Stagiaire`
- Tous les champs mappés (voir mapping Forms → SP ci-dessous)
- Puis **Envoyer un e-mail (V2)** avec objet :
```
concat('[AVS-756.XXXX.XXXX.', substring(outputs('Créer_un_élément')?['body/AVS'], sub(length(outputs('Créer_un_élément')?['body/AVS']), 2)), ' N°', outputs('Créer_un_élément')?['body/ID'], '] Documents requis pour ', outputs('Créer_un_élément')?['body/Nom'], ' ', outputs('Créer_un_élément')?['body/Prenom'])
```
- Destinataire : `outputs('Obtenir_les_détails_de_la_réponse')?['body/r93aa4aa6613d4e11b7afe37712f9a362']`

### Branche FAUX (Référent — "Quelqu'un d'autre")

#### Condition 2 — Filtre mail autorisé (email du RÉFÉRENT)
- **Type** : OU
- `outputs('Obtenir_les_détails_de_la_réponse')?['body/rb05d7471e33c4db1818de26dd59ca4dd']` contient `@clair-bois.ch`
- `outputs('Obtenir_les_détails_de_la_réponse')?['body/rb05d7471e33c4db1818de26dd59ca4dd']` contient `rochat.vdge`

##### Si autorisé → même logique que branche Vrai :
- Requête HTTP pour vérifier AVS existant (`Envoyer_une_requête_HTTP_à_SharePoint_1`)
- Condition 4 : existe ou pas
- Si existe → Mettre à jour l'élément 1 → **Créer_un_élément_Référent_1** → Envoyer un e-mail (V2) 1 1
- Si n'existe pas → Créer un élément 1 → **Créer_un_élément_Référent** → Envoyer un e-mail (V2) 1

#### Actions Referent (branche référent uniquement)
Après chaque action Stagiaire (créer ou mettre à jour), une action **Créer un élément** insère une entrée dans la liste SP **Referent** (`7a31b912-99af-4415-bfc9-f2ae1cb19c00`).

Champs Referent :
| Colonne | Source Forms |
|---|---|
| Partenaire | `r62ce4825b9d641f1b0c916fdab1dc246` |
| Fonction/Value | `r64c00ae2bfff4f4a8bbd99885ea40d9c` |
| Nom | `r8426975aa0714f2ebdf559aca82adb75` |
| Prenom | `r99d854c49c994916a8656e5c39cd8997` |
| NumTel | `r7ed3be9bf05c452c8887b6e39c0400b6` |
| Mail | `rb05d7471e33c4db1818de26dd59ca4dd` |
| StagiaireID/Id | ID du stagiaire créé/existant (lookup) |

Le lookup `StagiaireID/Id` utilise :
- Après création : `outputs('Créer_un_élément_1')?['body/ID']`
- Après MAJ : `first(body('Envoyer_une_requête_HTTP_à_SharePoint_1')?['d']?['results'])?['Id']`

**Différence clé** : le destinataire du mail est le **référent** :
`outputs('Obtenir_les_détails_de_la_réponse')?['body/rb05d7471e33c4db1818de26dd59ca4dd']`

### Corps du mail (identique dans toutes les branches)
```html
<p>Bonjour,<br><br>Merci d'avoir pré-inscrit {Nom} {Prénom}.<br><br>Veuillez s'il vous plaît <b>répondre</b> à ce mail avec les documents en pièce jointe.<br><br>- Copie de votre pièce d'identité<br>- Copie de la charte signée<br><br>Avec nos meilleures salutations,<br><br>Clair-Bois<br><br><i>Attention : Cette adresse ne peut pas recevoir de Mail en dehors d'une réponse</i></p>
```
Note : {Nom} et {Prénom} doivent être dynamiques (outputs du Créer/Mettre à jour).

### Mapping Forms → SharePoint liste "Stagiaire" (~35 champs)

Champs identiques dans les 2 branches (4 actions : Créer + Mettre à jour × 2 branches) :

| Colonne SharePoint | Identifiant Forms | Remarques |
|---|---|---|
| Nom | `r0a5286e1e9484d7fb4917b0e17aafdde` | |
| Prenom | `r51eac184630a40c582dda502c5159dcc` | |
| Sexe/Value | `re65d57924f8c4271b6e502134e2fe906` | Choix : Masculin, Féminin |
| DateNaissance | `rd674de1f8204491083de8ccfdeb0fd6e` | DateTime |
| NumTel | `ra15151fc6895428ab11b24c3de424a0b` | |
| Mail | `r93aa4aa6613d4e11b7afe37712f9a362` | **Email du stagiaire** dans les 2 branches |
| Adresse | `r67388c86f7c64c26bc75af14ac4ac699` | |
| NpaLocalite | `ra4388b28125744569c060e3ef31cace9` | |
| AVS | `rddc7676789f4474ea2ffd68f6388dfd9` | |
| Statut/Value | Toujours `En attente des documents` | Choix (4 options : En attente des documents, Documents réceptionnés, Validé, Annulé) |
| Secteur | `r1faa50a65150406b95d3a62e45550e40` | **Texte** (pas choix SP) |
| Etablissement | `r2876f0c952f44887946296b4c95367a3` | Texte — prérempli depuis calendrier |
| DateDebutSouhaitee | `r50efe78018854247bf6e734db7188d70` | Date — prérempli depuis calendrier |
| DejaStage | `if(equals(...r9385fc308...,'Oui'),true,false)` | Booléen SP, conversion depuis texte Forms |
| AssuranceInvalidite/Value | `ra974f77cc1bf40a0832c11f85d0cad2d` | Choix SP (4 options) |
| UrgenceLien | `r0bd85bffee0e45c09d739fe4b871955d` | |
| UrgenceNom | `rb96ff7c4a7c74c06855477eedf3982d1` | |
| UrgencePrenom | `r5ff75960203844a0bb3a3e26224b291f` | |
| UrgenceTel | `ra2f1dfb031ca48e18d8a3d64688dde45` | |
| Curatelle (Oui/Non) | `if(equals(...r60b463d8...,'Oui'),true,false)` | Booléen SP, conversion depuis texte Forms |
| CuratelleType/Value | `r669b127914f84e47a35e1275bb176dd1` | Choix (Privé, OPAD, Autre) |
| CuratelleNom | `r1a6a753b75fd4e5b9fedcac9e4cd04e0` | **Nouveaux IDs curatelle** |
| CuratellePrenom | `rb42f90e162eb4f32b31ddf16011f7125` | |
| CuratelleTel | `r7456ee13e9374b6891e1d7bb7cf3fd42` | |
| CuratelleMail | `re11798a485d14196969cc71183cbc488` | |
| AIConseillerNom | `r0819bfe19533497a8b944b20dc3bcf02` | **Anciens IDs curatelle** réassignés par Mme Karavia |
| AIConseillerPrenom | `r32c41d36df3a400eb0408d77919da6e5` | |
| AIConseillerTel | `rfd6b36d0309d4e59b2906e0f79c73ac3` | |
| AIConseillerMail | `r75e583eba6eb4fc292b260baf6d18e32` | |
| ObjectifStage | `rf8524324a2184a329c4351ff39b771d7` | |
| Limitations | `ra96b2095ead84cf086d63f5b7bb8842f` | |
| ParcoursScolaire | `r1b0cf13f9a9c4e5389a6475b485121e7` | |
| Tests | `rf7189c8f653c40999800b94e591fbe3f` | |
| Reseau | `r27377ab8dd76443f97ea08c29cfe8f6d` | |
| TailleTshirt | `r7d55b2fb08c94ca8aca66a96b0b6c8be` | |
| TaillePantalon | `r96a1290db28d402686ee34174d4990a9` | |
| Pointure | `r89d1d8e6dafa40e2abbceef073d253dc` | |

L'expression générale pour chaque champ est :
```
outputs('Obtenir_les_détails_de_la_réponse')?['body/{identifiant}']
```

---

## FLUX 2 : "Réception des pièces jointes"

### Déclencheur
- **Type** : `À l'arrivée d'un nouvel e-mail (V3)`
- **Paramètres avancés** :
  - Inclure des pièces jointes : Oui
  - Filtre d'objet : `AVS-`
  - Avec pièces jointes uniquement : Oui
- **Connexion** : `stagiaire.dfip@clairbois.ch`

### Étape 1 : Initialiser la variable `varDemandeID`
- Nom : `varDemandeID`
- Type : Chaîne
- Valeur : `first(split(split(triggerOutputs()?['body/subject'],'D°')[1],']'))`
  - Extrait le DemandeID depuis l'objet du mail (ex: `[AVS-756.XXXX.XXXX.67 D°3]` → `3`)

### Étape 2 : Requête_HTTP_Demande
- **But** : Récupérer la Demande par ID pour obtenir le StagiaireIDId (lookup)
- Méthode : GET
- URI : `concat('_api/web/lists(guid''9616ee1d-dd0b-44fd-a1c4-34187ebaa9f8'')/items?$select=Id,StagiaireIDId&$filter=Id eq ', variables('varDemandeID'))`

### Étape 3 : Envoyer une requête HTTP à SharePoint 2
- **But** : Récupérer Nom, Prénom et AVS du stagiaire via le StagiaireID de la Demande
- Site : `https://fondationclairbois.sharepoint.com/sites/DFIP-SiteEquipe`
- Méthode : GET
- URI : `concat('_api/web/lists/getbytitle(''Stagiaire'')/items?$select=Id,Nom,Prenom,AVS&$filter=Id eq ', first(body('Requête_HTTP_Demande')?['d']?['results'])?['StagiaireIDId'])`

### Étape 4 : Variables dérivées
- **varNom** : `first(body('Envoyer_une_requête_HTTP_à_SharePoint_2')?['d']?['results'])?['Nom']`
- **varPrenom** : `first(body('Envoyer_une_requête_HTTP_à_SharePoint_2')?['d']?['results'])?['Prenom']`
- **varNomPrenom** : `concat(variables('varNom'),' ',variables('varPrenom'))`
- **varAVS** : `first(body('Envoyer_une_requête_HTTP_à_SharePoint_2')?['d']?['results'])?['AVS']` (vrai AVS récupéré depuis SharePoint, pas depuis l'objet du mail)

### Étape 5 : Envoyer une requête HTTP à SharePoint 3
- **But** : Vérifier si le dossier du stagiaire existe déjà
- Méthode : GET
- URI : `concat('_api/web/GetFolderByServerRelativeUrl(''/sites/DFIP-SiteEquipe/Stagiaires%20Doc/'', variables('varAVS'), ''')')`

### Étape 6 : Condition — Le dossier existe ?
- **Expression** : Code du statut de la requête HTTP 3 est égal à `404`
- **Vrai (404 — n'existe pas)** :

  **a) Créer le dossier racine AVS** (Envoyer requête HTTP SharePoint 7)
  - Méthode : POST
  - URI : `_api/web/folders/add('/sites/DFIP-SiteEquipe/Stagiaires%20Doc/{varAVS}')`
  - En-têtes : Accept: application/json, Content-Type: application/json

  **b) Copier le dossier modèle** (action "Copier le dossier")
  - Source : `/Documents partages/8. Modèle dossier_NOM Prénom`
  - Destination : `/Stagiaires Doc/{varAVS}`
  - Si existe déjà : Replace

  **c) Renommer les fichiers dans 1. Administratif** (de l'intérieur vers l'extérieur)

  Renommer `NOM Prénom - Suivi.docx` :
  ```
  concat('_api/web/GetFileByServerRelativeUrl(''/sites/DFIP-SiteEquipe/Stagiaires%20Doc/', variables('varAVS'), '/8.%20Mod%C3%A8le%20dossier_NOM%20Pr%C3%A9nom/1.%20Administratif/NOM%20Pr%C3%A9nom%20-%20Suivi.docx'')/MoveTo(newurl=''/sites/DFIP-SiteEquipe/Stagiaires%20Doc/', variables('varAVS'), '/8.%20Mod%C3%A8le%20dossier_NOM%20Pr%C3%A9nom/1.%20Administratif/', variables('varNom'), '%20', variables('varPrenom'), '%20-%20Suivi.docx'',flags=1)')
  ```

  Renommer `NOM Prénom - Demande uniforme.docx` :
  ```
  concat('_api/web/GetFileByServerRelativeUrl(''/sites/DFIP-SiteEquipe/Stagiaires%20Doc/', variables('varAVS'), '/8.%20Mod%C3%A8le%20dossier_NOM%20Pr%C3%A9nom/1.%20Administratif/NOM%20Pr%C3%A9nom%20-%20Demande%20uniforme.docx'')/MoveTo(newurl=''/sites/DFIP-SiteEquipe/Stagiaires%20Doc/', variables('varAVS'), '/8.%20Mod%C3%A8le%20dossier_NOM%20Pr%C3%A9nom/1.%20Administratif/', variables('varNom'), '%20', variables('varPrenom'), '%20-%20Demande%20uniforme.docx'',flags=1)')
  ```

  **d) Renommer le dossier racine** :
  ```
  concat('_api/web/GetFolderByServerRelativeUrl(''/sites/DFIP-SiteEquipe/Stagiaires%20Doc/', variables('varAVS'), '/8.%20Mod%C3%A8le%20dossier_NOM%20Pr%C3%A9nom'')/MoveTo(''/sites/DFIP-SiteEquipe/Stagiaires%20Doc/', variables('varAVS'), '/8.%20Mod%C3%A8le%20dossier_', variables('varNom'), '%20', variables('varPrenom'), ''')')
  ```

- **Faux (200 — existe déjà)** : 0 action (passer directement aux pièces jointes)

### Étape 7 : Appliquer à chacun (pièces jointes)
- **Boucle sur** : `triggerOutputs()?['body/attachments']` (Pièces jointes)
- **Action** : Envoyer une requête HTTP à SharePoint 1
  - Méthode : POST
  - URI :
  ```
  concat('_api/web/GetFolderByServerRelativeUrl(''/sites/DFIP-SiteEquipe/Stagiaires%20Doc/', variables('varAVS'), '/8.%20Mod%C3%A8le%20dossier_', variables('varNom'), '%20', variables('varPrenom'), '/1.%20Administratif'')/Files/Add(url=''', items('Appliquer_à_chacun')?['name'], ''',overwrite=true)')
  ```
  - En-têtes : Accept: application/json
  - Corps : `items('Appliquer_à_chacun')?['contentBytes']`

### Étape 8 : MAJ_Statut_Demande
- **But** : Mettre à jour la Demande après réception des documents
- **Type** : PatchItem (Update item SharePoint)
- **Liste** : Demande (`9616ee1d-dd0b-44fd-a1c4-34187ebaa9f8`)
- **ID** : `int(variables('varDemandeID'))`
- **Champs** :
  - `Statut/Value` → `Documents réceptionnés`
  - `DateReceptionDocs` → `utcNow()`

---

## Structure SharePoint

### Liste "Stagiaire" (données personnelles uniquement)
- ID table : `bf357221-7e74-4905-9b58-b4ea22f79de0`
- Colonnes : Nom, Prenom, Sexe (Choix), DateNaissance, NumTel, Mail, Adresse, NpaLocalite, AVS, UrgenceLien, UrgenceNom, UrgencePrenom, UrgenceTel, Curatelle (Oui/Non), CuratelleType (Choix), CuratelleNom, CuratellePrenom, CuratelleTel, CuratelleMail, Limitations, ParcoursScolaire, Tests (Choix), Reseau (Choix — **activer sélection multiple**), TailleTshirt, TaillePantalon, Pointure, AssuranceInvalidite (Choix: 4 options), AIConseillerNom, AIConseillerPrenom, AIConseillerTel, AIConseillerMail, DateReceptionDocs (date)
- **Colonnes SUPPRIMÉES** (déplacées vers Demande) : Statut, ObjectifStage, Secteur, DejaStage, Etablissement, DateDebutSouhaitee

### Liste "Demande" (une par demande — relation 1:N avec Stagiaire)
- ID table : `9616ee1d-dd0b-44fd-a1c4-34187ebaa9f8`
- Colonnes : StagiaireID (lookup → Stagiaire), ReferentID (lookup → Referent, vide si Moi-même), **ReferentContact** (texte: "Prénom Nom — Partenaire" ou "Aucun"), **TypeDemande** (Choix: "Stage" / "Module métier"), Etablissement (texte), Secteur (texte), DateDebutSouhaitee (date), ObjectifStage (texte multiligne), DejaStage (Oui/Non), **Statut** (Choix: "En attente des documents", "Documents réceptionnés", "Confirmé", "Annulé" — "Validé" supprimé), Limitations (texte multiligne), ParcoursScolaire (texte multiligne)
- **DejaStage** : SharePoint affiche "vide" pour false → c'est normal, vide = Non
- **Modules** : 1 Demande par module (Secteur=nom module, Etablissement=site module), pas de CreneauID
- **Bug OData é** : un filtre OData avec `é` (ex: "Tourbillon Découverte") dans l'URL cause un 400 SP → PA retry 4× → timeout 504. Contournement : ne pas faire de lookup créneau pour les modules.

### Liste "Referent"
- ID table : `7a31b912-99af-4415-bfc9-f2ae1cb19c00`
- Colonnes : Partenaire (texte), Fonction (Choix), Nom (texte), Prenom (texte), NumTel (texte), Mail (texte), StagiaireID (lookup vers liste Stagiaire)

### Liste "Creneaux" (capacité d'accueil par semaine/secteur)
- ID table : `3e2deb27-f496-410f-be74-281eb2b0c079`
- Colonnes : Etablissement (texte), Secteur (texte), DateDebut (date), DateFin (date), PlacesTotal (nombre), TypeCreneau (Choix: "Stage", "Module métier"), NomModule (texte, vide si Stage classique)
- Pas de PlacesUtilisées : comptage dynamique via les Demandes liées

### Bibliothèque de documents
- **Documents partagés** contient `8. Modèle dossier_NOM Prénom` (template) avec sous-dossiers :
  1. Administratif (contient : Charte.pdf, Déclaration engagement.pdf, Fiche entrée.xltx, NOM Prénom - Demande uniforme.docx, NOM Prénom - Suivi.docx, sous-dossier Recrutement)
  2. Contrat - Résiliation - Courriers RH
  3. Mesures - Salaires - IJ
  4. Médical
  5. Evaluation
  6. Ecole professionnelle
  7. Stages - Travail externe

- **Stagiaires Doc** contient les dossiers créés par le flux, organisés par numéro AVS

### Connection References
- `shared_microsoftforms` : Microsoft Forms
- `shared_sharepointonline` : SharePoint Online
- `shared_office365` : Office 365 Outlook

---

## Évolutions — Journal des modifications

### 05/03/2026 (matin) — Enrichissement complet du Flux 1

**Champs Stagiaire** : ~10 → ~35 champs par action (Créer + Mettre à jour × 2 branches)

**Nouveaux mappings ajoutés** :
- Section urgence (4 champs), curatelle (6 champs, nouveaux IDs), stage (6 champs), uniforme (3 champs)
- Champs AI : AIConseillerNom/Prenom/Tel/Mail (anciens IDs curatelle réassignés par Mme Karavia)
- Nouveaux champs Karavia : Secteur, AssuranceInvalidite, DejaStage

**Actions Referent** : 2 nouvelles actions `Créer_un_élément_Référent` et `Créer_un_élément_Référent_1` insèrent des entrées dans la liste SP Referent (GUID `7a31b912`) avec lookup `StagiaireID/Id` vers Stagiaire

**Bugs corrigés** :
1. Mail branche stagiaire : `rb05d7471` (référent) → `r93aa4aa6` (stagiaire)
2. Mail branche référent pour Stagiaire.Mail : idem → `r93aa4aa6` (email du stagiaire)
3. Condition_2 filtre : `r75e583e` (email AI) → `rb05d7471` (email référent) pour les 2 checks OR
4. Secteur : `/Value` retiré (colonne texte, pas choix)
5. DejaStage : corrigé texte → booléen (`if(equals(...,'Oui'),true,false)`) — colonne Oui/Non dans SP
6. AssuranceInvalidite : booléen → choix texte (4 options réelles)
7. Lookup Referent : format `item/StagiaireID/Id` (objet, pas entier)
8. `MailReferent` retiré de la liste Stagiaire (redondant avec liste Referent)

### 05/03/2026 (après-midi) — Séparation Stagiaire / Demande (architecture 1:N)

**Contexte** : Mme Karavia a indiqué qu'un stagiaire peut avoir plusieurs demandes de stage (dates différentes, modules métiers). L'ancienne architecture écrasait les données à chaque soumission.

**Nouvelles listes SharePoint créées** :
- **Demande** (`9616ee1d`) : StagiaireID, ReferentID, Etablissement, Secteur, DateDebutSouhaitee, ObjectifStage, DejaStage, Statut, Limitations, ParcoursScolaire
- **Creneaux** (`3e2deb27`) : Etablissement, Secteur, DateDebut, DateFin, PlacesTotal, TypeCreneau, NomModule

**Modifications Flux 1** :
- Retiré 4 champs stage-spécifiques des 4 actions Stagiaire : Statut, ObjectifStage, Secteur, DejaStage
- Ajouté 4 actions `Créer_Demande` (une par chemin) écrivant dans la liste Demande
- Email : `N°{StagiaireID}` → `D°{DemandeID}` (le Flux 2 devra parser D° au lieu de N°)
- Colonnes supprimées de la liste Stagiaire : Statut, ObjectifStage, Secteur, DejaStage, Etablissement, DateDebutSouhaitee

**Test "Moi-même" réussi** : Stagiaire + Demande créés correctement.

**Problèmes résolus** :
- ✅ Reseau multi-select : 3 replace() imbriqués pour convertir Forms `["a","b"]` → SP `[{"Value":"a"},{"Value":"b"}]`
- DejaStage = false affiché comme vide dans SP → comportement normal des booléens SP

### 06/03/2026 — Modification Flux 2 (réception pièces jointes)

**Modifications** :
- `varAVS` → `varDemandeID` : parse `D°{ID}` depuis l'objet du mail (au lieu de tout le bloc AVS)
- Nouvelle action `Requête_HTTP_Demande` : récupère Demande par ID → StagiaireIDId (lookup)
- Requête Stagiaire : filtre par `Id eq {StagiaireIDId}` (au lieu de `AVS eq {masqué}`)
- Nouvelle variable `varAVS` : vrai AVS complet récupéré depuis SharePoint Stagiaire
- Nouvelle action `MAJ_Statut_Demande` (PatchItem) : Statut → "Documents réceptionnés" + DateReceptionDocs = utcNow()
- Descriptions ajoutées à toutes les actions

**Test réussi** : Statut Demande mis à jour + DateReceptionDocs renseignée correctement.

### 06/03/2026 (après-midi) — Flux 3 + Frontend transform + Automatisation

**Flux 3 créé** : "Flux 3 - Génération planning.json"
- Lit tous les Créneaux et Demandes depuis SharePoint
- Pour chaque créneau, compte les Demandes liées (CreneauID, Statut ≠ Annulé)
- Génère un JSON plat et le pousse sur GitHub via l'API Contents
- Trigger : automatique sur création/modification d'une Demande (polling SP, `OpenApiConnection` + `GetOnUpdatedItems`)
- Actions : GET_Creneaux → GET_Demandes → Init_varCreneaux → Boucle (Filtrer_Demandes + Ajouter_au_tableau) → Compose_JSON → GET_SHA_GitHub → Push_GitHub
- Fix timezone : `convertFromUtc(..., 'Romance Standard Time')` avant `formatDateTime` pour les dates

**Frontend (clair-bois-calendrier)** :
- `transformPlanningData()` dans helpers.js : convertit le format plat PA → hiérarchique React
- Rétrocompatible : détecte si le JSON a déjà `etablissements` (ancien mock)
- weekNumber calculé depuis `dateFin` (pas `dateDebut` qui peut être un dimanche)
- startDate = lundi de la semaine ISO (calculé depuis dateFin)
- `buildFormsUrl()` : utilise `encodeURIComponent` avec les vrais IDs Forms
- Marqueur "aujourd'hui" (bleu) conservé sur le calendrier

**Flux 1 mis à jour** :
- `replace(Etablissement, '+', ' ')` sur les 4 Créer_Demande + Requête_HTTP_Creneaux
- Corrige le `+` injecté par Microsoft Forms dans les URL pré-remplies

**Bugs corrigés** :
- apisMap.json : doit contenir des GUIDs de ressource (pas des chemins API)
- connectionsMap.json : doit contenir les GUIDs de connexion (pas vide)
- Trigger SP : type `OpenApiConnection` avec `recurrence` (pas `OpenApiConnectionNotification`)
- Timezone PA : `convertFromUtc` vers 'Romance Standard Time' pour dates CET

**Pipeline complet testé** : Site → Forms → Flux 1 → Demande SP → Flux 3 (auto) → GitHub → Site mis à jour

### 07/03/2026 — Flux 4 + Créneaux chevauchants + Bouton "Ajouter un créneau"

**Flux 4 créé** : "Flux 4 - Gestion des créneaux"
- Trigger : webhook sur formulaire "Gestion des créneaux"
- Vérifie le mot de passe avant de créer
- Crée un item dans la liste SP Creneaux (Etablissement, Secteur, DateDebut, DateFin, PlacesTotal, TypeCreneau, NomModule)
- `replace('+', ' ')` sur Etablissement et Secteur (fix encodage Forms URL)
- `int()` sur PlacesTotal (conversion texte → nombre)
- Pipeline complet : Forms → Flux 4 → Creneaux SP → Flux 3 (polling 3min) → planning.json → Site

**Frontend (clair-bois-calendrier)** :
- `aggregateWeekCreneaux()` dans helpers.js : agrège les semaines par `year-weekNumber`, déduplique par `startDate+endDate`, calcule totaux et statut
- SecteurCalendar : `weekIndex` utilise l'agrégation (remplace l'ancien index qui écrasait), affiche `S13 (2)` pour les semaines multi-créneaux
- WeekDetail : rétrocompatible (`week.creneaux || [week]`), affiche chaque créneau avec sa barre de progression et son bouton "S'inscrire"
- Composant `ProgressBar` extrait dans WeekDetail pour réutilisation
- Bouton "Ajouter un créneau pour {secteur}" sous le calendrier, pré-remplit établissement + secteur dans le formulaire "Gestion des créneaux"

**Formulaire "Gestion des créneaux"** (Microsoft Forms — opérationnel) :
- ID : `xHCDs-bUs02BAzAeleTkDMe8lTmeXlRCg3CpMGKKIxdUMVIwUkI1MlNIMzA0SlhKQ0tXV0RKSUNOQi4u`
- AllowPrefill activé
- Champs : Établissement (`rb1c6311a61044eb184fa3270fd065e32`), Secteur (`r69f254172ecd4baa9c92b2ef2d86f48c`), Description (`r43c3849ff3284246a7c68d571f7ca3df`), Date début (`reee4e33cc677406885a947061d7d9cde`), Date fin (`r77ae6366339446f39c90be5aa93b3a71`), Nombre places (`r673220bf96894b43b6cd98c623c6d0fe`), Type créneau (`rd79308a2436b46d7be9921d3eed3ca79` — Stage/Module métier), Nom module (`rc347ff44177743a8b9561f6d6f9eed2c`), Mot de passe (`rce9b9c542c0d455a8c01298b063332fe`)

### TODO — État du projet (deadline ~30 mars 2026)

#### Terminé
1. ✅ Créer liste Demande
2. ✅ Nettoyer liste Stagiaire
3. ✅ Créer liste Creneaux
4. ✅ Modifier Flux 1 (séparation Stagiaire/Demande)
5. ✅ Test branche Moi-même
6. ✅ Activer sélection multiple sur Reseau (fix multi-select Forms → SP)
7. ✅ Test branche "Quelqu'un d'autre" (Référent)
8. ✅ Modifier Flux 2 : parser D° au lieu de N°, MAJ Demande.Statut + DateReceptionDocs
9. ✅ Créneau test dans Creneaux
10. ✅ Mettre à jour `buildFormsUrl()` avec les vrais IDs Forms
11. ✅ Flux 3 : génération planning.json depuis Creneaux + comptage Demandes
12. ✅ Automatiser Flux 3 (trigger SP sur liste Demande)
13. ✅ Frontend : transformPlanningData() (plat PA → hiérarchique React)
14. ✅ Fix replace('+', ' ') sur Etablissement dans Flux 1
15. ✅ Gestion visuelle des créneaux chevauchants dans le calendrier
16. ✅ Bouton "Ajouter un créneau" sur SecteurCalendar (pré-remplissage Forms)
17. ✅ Formulaire "Gestion des créneaux" (Microsoft Forms) opérationnel

18. ✅ Flux 4 : traitement auto du formulaire "Gestion des créneaux" → liste Creneaux SP (avec vérification mdp)

#### Reste à faire (à valider avec la mandante le 09/03)
19. ⬜ Trigger Flux 3 aussi sur liste Creneaux (quand un créneau est ajouté/modifié)
20. ⬜ Config dynamique des établissements (descriptions/icônes depuis SP au lieu de hardcodé)
21. ⬜ Logique modules métiers (TypeCreneau + NomModule)
22. ⬜ Formulaire référents cadres pour établissements (+ Flux associé)

---

## Flux à créer (TODO prioritaire — 6 mai 2026)

### Flux 6 — Cartographie HTTP GET (CRITIQUE — débloque la carto live)
- **Trigger** : HTTP GET (appelé depuis le frontend via `VITE_PA_CARTO_URL`)
- **Actions** :
  1. GET liste **Cartographie** (toutes les places typées par site/pôle/structure)
  2. GET liste **Demande** filtrée `Statut eq 'Confirmé'` (placements actifs)
  3. Compose JSON consolidé (places + occupants)
  4. Response 200 avec le JSON
- **Pattern réutilisable** : trigger HTTP du Flux 5, compose JSON du Flux 3
- **Prérequis bloquant** : créer la liste SP **Cartographie** (schéma à définir : Site, Pole, NomStructure, Type, Accueil, Formateurs, CapacitesParType, Commentaire)
- **Estimation** : 2-3 h
- **Référence frontend** : section "Cartographie privée" du `frontend/CLAUDE.md`

### Flux Confirmation Rosina (CRITIQUE — workflow Rosina)
- **Trigger** : MAJ item liste **Demande**, condition `Statut → 'Confirmé'`
- **Actions** :
  1. Email confirmation au stagiaire
  2. Email Intendance/Lingerie (commande uniforme : prénom, taille, site, date essayage)
  3. Trigger refresh Cartographie (signal frontend ou poke endpoint Flux 6)
- **Estimation** : 3-4 h
- **Référence** : `docs/transcription-karavia3.txt` lignes 140-150

### Flux Signalement (séparer du Flux 5)
- **Trigger** : HTTP POST avec `type: 'signalement'`
- **Source actuelle** : `FormulaireSignalement.jsx` envoie déjà ce payload, mais le Flux 5 ne le gère pas (silencieusement ignoré).
- **Actions** :
  1. Email notification Rosina (annulation/retard)
  2. Log dans une liste SP dédiée (à créer)
- **Estimation** : 1-2 h

### Flux OCAS Word AI (réception externe partenaires AI)
- **Trigger** : email HIN avec Word OCAS attaché OU upload SharePoint folder
- **Actions** : extraction Word → mapping vers Stagiaire + Demande (cf. `docs/ocas-word-mapping.md`)
- **Estimation** : 4-6 h
- **Blocage** : connecteur Word PA Premium nécessaire ? À confirmer avec IT (Benoit/José).
