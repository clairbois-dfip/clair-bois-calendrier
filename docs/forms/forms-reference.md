# Référence complète des 8 formulaires Microsoft Forms

> Données extraites le 17 mars 2026 via F12 Network → formapi. Tous ont `AllowPrefill: true`.

---

## Vue d'ensemble

| # | Nom | Réponses | Connecté à | Usage |
|---|-----|----------|------------|-------|
| 1 | Demande de stage - stagiaire | 0 | **NOUVEAU** — pas encore de flux | Stagiaire remplit pour lui-même (pas de section référent) |
| 2 | Modules métiers - partenaire | 0 | **NOUVEAU** — pas encore de flux | Référent inscrit un participant aux modules métiers |
| 3 | Retour à CB | 0 | **NOUVEAU** — pas encore de flux | Formulaire raccourci (~10 q.) pour stagiaire déjà connu → **IDs DIFFÉRENTS** |
| 4 | Informations complémentaires | 0 | **NOUVEAU** — pas encore de flux | Compléter un dossier existant (après Word AI ou retour) |
| 5 | Demande de stage (AI) | 0 | **NOUVEAU** — pas encore de flux | Envoyé au stagiaire après réception du Word AI |
| 6 | Modules métiers - participant.e | 0 | **NOUVEAU** — pas encore de flux | Participant s'inscrit lui-même aux modules métiers |
| 7 | Demande de stage - partenaire | 34 | **Flux 1 actuel** | Formulaire ORIGINAL (34 réponses), référent inscrit un stagiaire |
| 8 | Gestion des créneaux | 8 | **Flux 4 actuel** | Référents cadres — inchangé |

---

## URLs publiques (liens de soumission)

| # | Nom | URL |
|---|-----|-----|
| 1 | Demande de stage - stagiaire | `https://forms.office.com/e/pcHEHRRk6x` |
| 2 | Modules métiers - partenaire | `https://forms.office.com/e/rTA3ZiwUVb` |
| 3 | Retour à CB | `https://forms.office.com/e/WMBW4GWVdW` |
| 4 | Informations complémentaires | `https://forms.office.com/e/F1iaPsWCrJ` |
| 5 | Demande de stage (AI) | `https://forms.office.com/e/n7R6gBkbAg` |
| 6 | Modules métiers - participant.e | `https://forms.office.com/e/2TwtdawF7s` |
| 7 | Demande de stage - partenaire | `https://forms.office.com/e/3SZvXC6kb5` |
| 8 | Gestion des créneaux | `https://forms.office.com/e/QwUpv5Nugn` |

---

## Form IDs

| # | Nom | Form ID (pour déclencheur PA) |
|---|-----|------|
| 1 | Demande de stage - stagiaire | `xHCDs-bUs02BAzAeleTkDMe8lTmeXlRCg3CpMGKKIxdUN0ZTWE5QVkxFR1gyNUdOT0daQ1g5S0Y3WS4u` |
| 2 | Modules métiers - partenaire | `xHCDs-bUs02BAzAeleTkDMe8lTmeXlRCg3CpMGKKIxdUMVJPU043WU5KTkU5VUM1VjBNOEZWN0xCSC4u` |
| 3 | Retour à CB | `xHCDs-bUs02BAzAeleTkDMe8lTmeXlRCg3CpMGKKIxdUMDNHS0ZJVTg0NDk3MVM1MUk4N0ZYVFJVUy4u` |
| 4 | Informations complémentaires | `xHCDs-bUs02BAzAeleTkDMe8lTmeXlRCg3CpMGKKIxdUMExOSzNUMkxCNkJZUkxLOFVCUTlHWUZVUS4u` |
| 5 | Demande de stage (AI) | `xHCDs-bUs02BAzAeleTkDMe8lTmeXlRCg3CpMGKKIxdUMldYWVFPN1ZOSTBIOU02TlkwMTZCNVhHWS4u` |
| 6 | Modules métiers - participant.e | `xHCDs-bUs02BAzAeleTkDMe8lTmeXlRCg3CpMGKKIxdUM0RFRU1YOFI3NkJKRVNaVlg2WEtZWUdRQi4u` |
| 7 | Demande de stage - partenaire | `xHCDs-bUs02BAzAeleTkDMe8lTmeXlRCg3CpMGKKIxdUQllQODVJS0wwV01RM0cwSk1RSTlHUEVPVi4u` |
| 8 | Gestion des créneaux | `xHCDs-bUs02BAzAeleTkDMe8lTmeXlRCg3CpMGKKIxdUMVIwUkI1MlNIMzA0SlhKQ0tXV0RKSUNOQi4u` |

---

## IDs partagés entre formulaires (majorité des forms sauf Retour à CB)

### Stagiaire
| Champ | ID | Présent dans |
|-------|-----|-------------|
| Nom | `r0a5286e1e9484d7fb4917b0e17aafdde` | Forms 1, 2, 5, 6, 7 |
| Prénom | `r51eac184630a40c582dda502c5159dcc` | Forms 1, 2, 5, 6, 7 |
| Sexe | `re65d57924f8c4271b6e502134e2fe906` | Forms 1, 2, 5, 6, 7 |
| Date naissance | `rd674de1f8204491083de8ccfdeb0fd6e` | Forms 1, 2, 5, 6, 7 |
| AVS | `rddc7676789f4474ea2ffd68f6388dfd9` | Forms 1, 2, 5, 6, 7 |
| Tél | `ra15151fc6895428ab11b24c3de424a0b` | Forms 1, 2, 5, 6, 7 |
| Email | `r93aa4aa6613d4e11b7afe37712f9a362` | Forms 1, 2, 5, 6, 7 |
| Adresse | `r67388c86f7c64c26bc75af14ac4ac699` | Forms 1, 2, 5, 6, 7 |
| NPA | `ra4388b28125744569c060e3ef31cace9` | Forms 1, 2, 5, 6, 7 |

### Urgence
| Champ | ID | Présent dans |
|-------|-----|-------------|
| Nom | `rb96ff7c4a7c74c06855477eedf3982d1` | Forms 1, 2, 5, 6, 7 |
| Prénom | `r5ff75960203844a0bb3a3e26224b291f` | Forms 1, 2, 5, 6, 7 |
| Lien | `r0bd85bffee0e45c09d739fe4b871955d` | Forms 1, 2, 5, 6, 7 |
| Tél | `ra2f1dfb031ca48e18d8a3d64688dde45` | Forms 1, 2, 5, 6, 7 |

### AI (Assurance Invalidité)
| Champ | ID | Présent dans |
|-------|-----|-------------|
| Nom conseiller | `r0819bfe19533497a8b944b20dc3bcf02` | Forms 1, 2, 5, 6, 7 |
| Prénom conseiller | `r32c41d36df3a400eb0408d77919da6e5` | Forms 1, 2, 5, 6, 7 |
| Tél conseiller | `rfd6b36d0309d4e59b2906e0f79c73ac3` | Forms 1, 2, 5, 6, 7 |
| Email conseiller | `r75e583eba6eb4fc292b260baf6d18e32` | Forms 1, 2, 5, 6, 7 |

### Curatelle
| Champ | ID | Présent dans |
|-------|-----|-------------|
| Sous curatelle | `r60b463d8e39146869c8669ea35bc36da` | Forms 1, 2, 5, 6, 7 |
| Type | `r669b127914f84e47a35e1275bb176dd1` | Forms 1, 2, 5, 6, 7 |
| Nom | `r1a6a753b75fd4e5b9fedcac9e4cd04e0` | Forms 1, 2, 5, 6, 7 |
| Prénom | `rb42f90e162eb4f32b31ddf16011f7125` | Forms 1, 2, 5, 6, 7 |
| Tél | `r7456ee13e9374b6891e1d7bb7cf3fd42` | Forms 1, 2, 5, 6, 7 |
| Email | `re11798a485d14196969cc71183cbc488` | Forms 1, 2, 5, 6, 7 |

### Référent (uniquement forms "partenaire")
| Champ | ID | Présent dans |
|-------|-----|-------------|
| Partenaire | `r62ce4825b9d641f1b0c916fdab1dc246` | Forms 2, 7 |
| Nom | `r8426975aa0714f2ebdf559aca82adb75` | Forms 2, 7 |
| Prénom | `r99d854c49c994916a8656e5c39cd8997` | Forms 2, 7 |
| Tél | `r7ed3be9bf05c452c8887b6e39c0400b6` | Forms 2, 7 |
| Email | `rb05d7471e33c4db1818de26dd59ca4dd` | Forms 2, 7 |
| Fonction | `rbc98f1f0` (abrégé) | Forms 2, 7 |

### Champs nouveaux (pas dans le form original #7)
| Champ | ID | Présent dans |
|-------|-----|-------------|
| Formation | `rde2a10c5` | Forms 1, 2, 5, 6 |
| Pour qui (moi/autre) | `r279198a1deae49b5b010b443a2e0eeed` | Form 5 (AI) |

---

## ⚠ ATTENTION : Form 3 "Retour à CB" — IDs COMPLÈTEMENT DIFFÉRENTS

Ce formulaire a été créé from scratch (pas dupliqué). **Tous les IDs sont différents !**

### Stagiaire (Retour à CB)
| Champ | ID standard | ID Retour à CB |
|-------|-------------|----------------|
| Nom | `r0a5286e1` | `r2d57262b` |
| Prénom | `r51eac184` | `r70a04427` |
| AVS | `rddc76767` | `r7d6876e9` |
| Sexe | `re65d5792` | `r3b64879b` |
| Date naissance | `rd674de1f` | `r47cc48fa` |

### Demandeur (Retour à CB — pas un "référent" classique)
| Champ | ID |
|-------|-----|
| Nom | `r58571777` |
| Prénom | `rdfff073d` |
| Tél | `ra8f4b351` |
| Email | `rbb80c340` |
| Fonction | `r64c00ae2` |

**Implication** : Le flux Power Automate pour "Retour à CB" devra utiliser ces IDs spécifiques, pas les IDs standard.

---

## Form 4 — Informations complémentaires

Ce form est destiné à compléter un dossier existant. La plupart des champs sont optionnels.
Utilise les mêmes IDs que les autres forms (pas comme Retour à CB).

**Usage** : après réception du Word AI → PA crée le dossier avec les infos du Word → envoie ce formulaire au stagiaire par email → le stagiaire complète ce qui manque (taille vêtements, urgence, etc.)

---

## Formulaire 8 — Gestion des créneaux (inchangé)

| Champ | ID |
|-------|-----|
| Établissement | `rb1c6311a61044eb184fa3270fd065e32` |
| Secteur | `r69f254172ecd4baa9c92b2ef2d86f48c` |
| Description | `r43c3849ff3284246a7c68d571f7ca3df` |
| Date début | `reee4e33cc677406885a947061d7d9cde` |
| Date fin | `r77ae6366339446f39c90be5aa93b3a71` |
| Nb places | `r673220bf96894b43b6cd98c623c6d0fe` |
| Type créneau | `rd79308a2436b46d7be9921d3eed3ca79` |
| Nom module | `rc347ff44177743a8b9561f6d6f9eed2c` |
| Mot de passe | `rce9b9c542c0d455a8c01298b063332fe` |

---

## Matrice : quel formulaire pour quel chemin ?

| Chemin | Condition | Formulaire | Flux PA |
|--------|-----------|------------|---------|
| A | NON + Moi-même (stage) | Form 1 (stage-stagiaire) | Nouveau flux "Flux Stage Stagiaire" |
| B | NON + Référent (stage) | Form 7 (stage-partenaire) | Flux 1 existant (à adapter) |
| C | OUI + Moi-même (retour) | Form 3 (Retour à CB) | Nouveau flux "Flux Retour" |
| D | OUI + Référent | Form 7 (stage-partenaire) | Flux 1 existant |
| E | Lien direct Karavia | Form 7 ou Form 3 | Selon le cas |
| F | Word AI reçu | Aucun form (extraction Word) | Nouveau flux "Flux Word AI" |
| — | Modules (moi-même) | Form 6 (modules-participant) | Nouveau flux "Flux Modules Participant" |
| — | Modules (partenaire) | Form 2 (modules-partenaire) | Nouveau flux "Flux Modules Partenaire" |
| — | Compléter dossier | Form 4 (infos complémentaires) | Nouveau flux "Flux Complément" |
| — | AI (form envoyé au stagiaire) | Form 5 (demande stage AI) | Nouveau flux "Flux Stage AI" |

---

## Analyse : formulaires manquants ou inutiles ?

### Aucun formulaire n'est inutile
Les 8 formulaires couvrent bien tous les cas de figure :
- **Stage** : Forms 1 (stagiaire), 5 (AI→stagiaire), 7 (partenaire)
- **Modules** : Forms 2 (partenaire), 6 (participant)
- **Retour** : Form 3 (raccourci)
- **Complément** : Form 4 (après Word AI ou retour)
- **Créneaux** : Form 8 (inchangé)

### Formulaire potentiellement manquant
- **"Retour à CB - partenaire"** : si un référent réinscrit un stagiaire déjà connu, il n'y a pas de formulaire raccourci pour ce cas. Il utiliserait le Form 7 complet, et PA ferait le MAJ (chemin D existant). → **Pas bloquant**, c'est acceptable.
