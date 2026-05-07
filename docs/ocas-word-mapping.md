# Mapping du formulaire Word OCAS (AI)

> Source : `docs/Formulaire de demande GLOBAL_OCAS_fillin en dur_V4.docx`
> Ce document est envoyé par les conseillers AI (via HIN) pour demander un stage à Clair-Bois.

---

## Structure du document

Le Word est organisé en **tableaux** avec des champs identifiés par des codes internes (ex: NAVSAS, NOMAS).
Ces codes sont utilisés par les informaticiens de l'OCAS pour repérer les champs. Nous pouvons faire de même dans Power Automate.

---

## Champs extractibles → Mapping vers SharePoint

### Section "Mandant" (conseiller AI)
| Champ Word | Code OCAS | Colonne SP | Notes |
|-----------|-----------|------------|-------|
| Office AI (OAI) | — | Source (nouveau) | Ex: "OAI Genève" |
| Nom conseiller | — | AIConseillerNom | |
| Prénom conseiller | — | AIConseillerPrenom | |
| Email conseiller | — | AIConseillerMail | |
| Tél conseiller | — | AIConseillerTel | |

### Section "Assuré" (stagiaire)
| Champ Word | Code OCAS | Colonne SP | Notes |
|-----------|-----------|------------|-------|
| Numéro AVS | NAVSAS | AVS | **Clé unique** |
| Nom | NOMAS | Nom | |
| Prénom | PRNAS | Prenom | |
| Date naissance | DTNAS | DateNaissance | |
| Sexe | — | Sexe | |
| Adresse 1 | ADR1AS | Adresse | |
| Adresse 2 | ADR2AS | (concaténer avec Adresse) | |
| NPA | NPAAS | NpaLocalite | |
| Localité | LOCAS | (concaténer avec NPA) | |
| Tél | TELAS | NumTel | |
| Email | — | Mail | |

### Section "Représentant légal"
| Champ Word | Code OCAS | Colonne SP | Notes |
|-----------|-----------|------------|-------|
| Nom | — | CuratelleNom (si applicable) | |
| Prénom | — | CuratellePrenom | |
| Tél | — | CuratelleTel | |
| Adresse | — | (non mappé actuellement) | |

### Section "Niveau scolaire"
| Champ Word | Code OCAS | Colonne SP | Notes |
|-----------|-----------|------------|-------|
| Formation | — | ParcoursScolaire | |
| Sous contrat ? | — | (nouveau champ ?) | |

### Section "Mesures AI"
| Champ Word | Code OCAS | Colonne SP | Notes |
|-----------|-----------|------------|-------|
| Type mesure | — | (nouveau : TypeMesure) | Ex: "Visite", "Stage découverte" |
| Date début | — | DateDebutSouhaitee | |
| Date fin | — | (nouveau : DateFinSouhaitee) | |
| Objectifs | — | ObjectifStage | |
| Limitations | — | Limitations | |

---

## Champs manquants dans le Word (vs notre Forms complet)

Ces infos devront être complétées par le stagiaire via Form 4 ou 5 :

- Contact urgence (nom, prénom, lien, tél)
- Curatelle (type, détails) — sauf si "représentant légal" = curateur
- Taille vêtements (t-shirt, pantalon, pointure)
- Tests déjà effectués
- Réseau (thérapeute, médecin)
- Charte signée
- Déclaration sur l'honneur
- Pièce d'identité

---

## Faisabilité technique de l'extraction

### Méthode : Word Online connector (Power Automate)
1. **Trigger** : nouveau fichier dans dossier SharePoint "Réception AI"
2. **Action** : "Lire le contenu du fichier Word" (Word Online connector)
3. **Extraction** : les champs dans les tableaux Word peuvent être lus via les propriétés de contenu
4. **Alternative** : si le connector Word ne suffit pas, on peut :
   - Convertir en PDF puis OCR (plus complexe)
   - Utiliser un script Office (Office Scripts) pour lire les tableaux
   - Utiliser AI Builder (premium) pour extraction intelligente

### Prérequis
- Connecteur Word Online : **pas premium** (inclus dans la licence standard)
- Le Word doit être déposé dans SharePoint (pas sur un disque local)
- Le format tableau doit être constant (pas de cellules fusionnées imprévisibles)

### Risques
- Si le format du Word change → le flux casse (à monitorer)
- Les champs vides dans le Word → colonnes vides dans SP (normal, complétées plus tard)
