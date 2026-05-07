# Référence des flux Power Automate — Clair-Bois

## Inventaire des fichiers ZIP

| Fichier ZIP | Flux | Statut | Déclencheur | Description |
|---|---|---|---|---|
| `flux-inscriptions-export_20260304152634.zip` | Flux 1 (original) | Archive | Forms webhook | Export brut PA |
| `flux-inscriptions-modifie.zip` | Flux 1 (modifié) | **Opérationnel** | Forms webhook | Inscription via Forms → SP |
| `reception-piece-jointes_20260304155127.zip` | Flux 2 (original) | Archive | Email entrant | Export brut PA |
| `reception-piece-jointes-modifie.zip` | Flux 2 (modifié) | **Opérationnel** | Email entrant | Pièces jointes → SP |
| `flux3-planning-modifie.zip` | Flux 3 | **Opérationnel** | Polling SP (3min) | planning.json → GitHub |
| `flux3b-trigger-creneaux.zip` | Flux 3b | Variante | Polling SP | Variante Flux 3 |
| `flux4-gestion-creneaux.zip` | Flux 4 | **Opérationnel** | Forms webhook | Gestion créneaux |
| `Test_20260306125936.zip` | Test | Test | — | Test initial |
| `flux5-http-inscription.zip` | **Flux 5 (NOUVEAU)** | **À importer** | HTTP POST | Formulaire React → SP |

## Structure d'un ZIP Power Automate

```
flux-xxx.zip
├── manifest.json                          ← Manifest racine (displayName, resources, dependsOn)
└── Microsoft.Flow/
    ├── manifest.json                      ← {"packageSchemaVersion":"1.0"}
    └── flows/
        ├── manifest.json                  ← {"flows":{"{GUID}":{"files":["definition.json"]}}}
        └── {FLOW-GUID}/
            ├── apisMap.json               ← Connecteur → GUID ressource manifest
            ├── connectionsMap.json         ← Connecteur → GUID connexion manifest
            └── definition.json            ← Logique du flux (triggers, actions, conditions)
```

## IDs techniques partagés

| Élément | GUID |
|---------|------|
| Tenant | `b38370c4-d4e6-4db3-8103-301e95e4e40c` |
| Creator | `3995bcc7-5e9e-4254-8370-a930628a2317` |
| SharePoint site | `https://fondationclairbois.sharepoint.com/sites/DFIP-SiteEquipe` |
| API SharePoint (apisMap) | `2e6b970c-dc5b-4920-8b1a-981b957283d0` |
| API Office 365 (apisMap) | `c70bccb1-c5b8-4d65-afa0-ce6031f446c5` |
| Conn SharePoint | `c1e11ff6-1671-4f41-a2e2-6986289998fd` |
| Conn Office 365 | `15b1713b-141c-4abf-b406-9781ffafdbdb` |

## Listes SharePoint

| Liste | GUID | Usage |
|-------|------|-------|
| Stagiaire | `bf357221-7e74-4905-9b58-b4ea22f79de0` | Données personnelles |
| Demande | `9616ee1d-dd0b-44fd-a1c4-34187ebaa9f8` | Demandes de stage/modules |
| Referent | `7a31b912-99af-4415-bfc9-f2ae1cb19c00` | Référents externes |
| Creneaux | `3e2deb27-f496-410f-be74-281eb2b0c079` | Créneaux de disponibilité |

## Scripts de construction

| Script | Flux cible | Description |
|--------|-----------|-------------|
| `modify-flux1.js` | Flux 1 | Modifications flux inscriptions |
| `modify-flux2.js` | Flux 2 | Modifications pièces jointes |
| `add-creneauID.js` | Flux 1 | Ajout lookup CreneauID |
| `build-flux3.js` | Flux 3 | Génération planning.json |
| `build-flux3b.js` | Flux 3b | Variante Flux 3 |
| `build-flux4.js` | Flux 4 | Gestion créneaux |
| `build-flux5-http.js` | **Flux 5** | **HTTP trigger (formulaire React)** |

## Mapping React → SharePoint (Flux 5)

### Payload JSON envoyé par le frontend

```json
{
  "cheminKey": "stages-moi-non",
  "parcours": "stages",
  "pourQui": "moi",
  "dejaInscrit": false,
  "dateEnvoi": "2026-03-19T...",
  "secteur": "Cuisine",
  "dateDebut": "2026-04-07",
  "dateFin": "2026-04-11",
  "nom": "Dupont",
  "prenom": "Marie",
  "sexe": "Féminin",
  "date_naissance": "1998-03-15",
  "avs": "756.1234.5678.97",
  "tel": "+41 79 123 45 67",
  "email": "marie@example.ch",
  "adresse": "Rue de Carouge 42",
  "npa": "1205",
  "formation": "Non",
  ...
}
```

### Liste Stagiaire

| Champ React | Colonne SharePoint | Type SP |
|---|---|---|
| nom | Nom | TextField |
| prenom | Prenom | TextField |
| sexe | Sexe | Choice (Value) |
| date_naissance | DateNaissance | DateTime |
| avs | AVS | TextField |
| tel | NumTel | TextField |
| email | Mail | TextField |
| adresse | Adresse | TextField |
| npa | NpaLocalite | TextField |
| formation | Formation | Choice (Value) |
| urgence_nom | UrgenceNom | TextField |
| urgence_prenom | UrgencePrenom | TextField |
| urgence_lien | UrgenceLien | Choice (Value) |
| urgence_tel | UrgenceTel | TextField |
| sous_curatelle | Curatelle | Boolean |
| curatelle_type | CuratelleType | Choice (Value) |
| curatelle_nom | CuratelleNom | TextField |
| curatelle_prenom | CuratellePrenom | TextField |
| curatelle_tel | CuratelleTel | TextField |
| curatelle_email | CuratelleMail | TextField |
| inscrit_ai | AssuranceInvalidite | Choice (Value) |
| ai_nom | AIConseillerNom | TextField |
| ai_prenom | AIConseillerPrenom | TextField |
| ai_tel | AIConseillerTel | TextField |
| ai_email | AIConseillerMail | TextField |
| limitations | Limitations | TextField |
| parcours_scolaire | ParcoursScolaire | TextField |
| deja_tests | Tests | Choice (Value) |
| pointure | Pointure | TextField |
| taille_tshirt | TailleTshirt | TextField |
| taille_pantalon | TaillePantalon | TextField |
| reseau_medical | Reseau | Multi-Choice |

### Liste Demande

| Champ React | Colonne SharePoint | Type SP |
|---|---|---|
| secteur | Secteur | TextField |
| dateDebut | DateDebutSouhaitee | DateTime |
| objectif_stage | ObjectifStage | TextField |
| deja_stages_secteur | DejaStage | Boolean |
| limitations | Limitations | TextField |
| parcours_scolaire | ParcoursScolaire | TextField |
| — | Statut | Choice ("En attente des documents") |
| — | StagiaireID | Lookup |
| — | ReferentID | Lookup (si pourQui=autre) |
| — | CreneauID | Lookup |

### Liste Referent (si pourQui=autre)

| Champ React | Colonne SharePoint | Type SP |
|---|---|---|
| referent_partenaire | Partenaire | TextField |
| referent_fonction | Fonction | Choice (Value) |
| referent_nom | Nom | TextField |
| referent_prenom | Prenom | TextField |
| referent_tel | NumTel | TextField |
| referent_email | Mail | TextField |
| — | StagiaireID | Lookup |
