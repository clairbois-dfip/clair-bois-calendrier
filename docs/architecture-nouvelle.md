# Nouvelle architecture — Multi-formulaires + Word AI

> Mise à jour 17 mars 2026 — Suite aux réunions Karavia du 9 et 14 mars

---

## Changement majeur

**Avant** : 1 seul formulaire Forms (Form 7 — "Demande de stage - partenaire") → 1 seul Flux 1

**Après** : 7 formulaires spécialisés + canal Word AI → plusieurs flux Power Automate

---

## Les 2 canaux d'entrée

### Canal 1 : Site React → Microsoft Forms (partenaires, enseignants, stagiaires)
```
Site React
  ├─ Modules métiers
  │    ├─ "Pour moi-même" → Form 6 (modules-participant)
  │    └─ "Pour quelqu'un d'autre" → Form 2 (modules-partenaire)
  │
  └─ Demande de stage
       ├─ "Déjà inscrit ? NON"
       │    ├─ "Moi-même" → Form 1 (stage-stagiaire)       [Chemin A]
       │    └─ "Quelqu'un d'autre" → Form 7 (stage-partenaire) [Chemin B]
       │
       └─ "Déjà inscrit ? OUI"
            ├─ "Moi-même" → Form 3 (Retour à CB)            [Chemin C]
            └─ "Quelqu'un d'autre" → Form 7 (stage-partenaire) [Chemin D]
```

### Canal 2 : Word AI (conseillers AI/OCAS)
```
Conseillère AI envoie Word OCAS
  ├─ Par email (à adresse dédiée ou adresse Karavia)
  │    └─ Flux email → extrait Word → dossier SP "Réception AI"
  │         └─ Flux extraction déclenché
  │
  └─ Par drag & drop (Karavia dépose dans SharePoint)
       └─ Flux extraction déclenché directement

Flux extraction :
  1. Lire tableau Word (Word Online connector)
  2. Extraire : AVS, nom, prénom, date naissance, adresse, etc.
  3. Vérifier AVS dans SP
  4. Créer/MAJ Stagiaire
  5. Créer Demande (source: "AI/OCAS")
  6. Créer dossier SP + copier Word dans /Administratif
  7. Envoyer email au stagiaire (mail de l'assuré)
     → Lien Form 5 (Demande stage AI) pour compléter
     → OU lien Form 4 (Infos complémentaires)
```

---

## Questions d'aiguillage sur le site React

### Question 1 : "Je remplis ce formulaire..."
- **Pour moi-même** (stagiaire)
- **Pour quelqu'un d'autre** (référent/partenaire)

### Question 2 : "Avez-vous déjà été inscrit(e) chez Clair-Bois ?"
- **OUI** → chemin raccourci
- **NON** → formulaire complet

Ces 2 questions s'affichent APRÈS le choix Modules/Stage et AVANT la redirection vers Forms.

---

## Flux Power Automate à construire/adapter

### Flux existants (à adapter)
| Flux | État | Modification |
|------|------|-------------|
| Flux 1 | Opérationnel | Adapter le déclencheur pour Form 7 uniquement (stage-partenaire) |
| Flux 2 | Opérationnel | Inchangé (réception pièces jointes par email) |
| Flux 3 | Opérationnel | Ajouter trigger sur Creneaux + adapter comptage |
| Flux 4 | Opérationnel | Inchangé (gestion créneaux) |

### Nouveaux flux à créer
| Flux | Déclencheur | Action |
|------|-------------|--------|
| Flux Stage Stagiaire | Form 1 soumis | Créer/MAJ Stagiaire + Demande (pas de référent) |
| Flux Modules Participant | Form 6 soumis | Créer/MAJ Stagiaire + Demande (type: Module) |
| Flux Modules Partenaire | Form 2 soumis | Créer/MAJ Stagiaire + Référent + Demande (type: Module) |
| Flux Retour CB | Form 3 soumis | **⚠ IDs différents !** MAJ Stagiaire + nouvelle Demande |
| Flux Stage AI | Form 5 soumis | Similaire Flux 1, envoyé après Word AI |
| Flux Complément | Form 4 soumis | MAJ Stagiaire existant (AVS = clé) |
| Flux Word AI (email) | Email avec PJ Word @ocas.ch | Extraire Word → Stagiaire + Demande + Dossier SP |
| Flux Word AI (SP) | Nouveau fichier dans dossier "Réception AI" | Extraire Word → Stagiaire + Demande + Dossier SP |

---

## Secteurs réels (remplacent les 6 inventés)

Fournis par Karavia le 14 mars 2026 :

1. ASA
2. ASE
3. ASSC
4. Cuisine
5. Restauration
6. Pâtisserie-boulangerie
7. Nettoyage
8. Exploitation
9. Peinture
10. Graphisme
11. Audio-visuel
12. Médiamatique
13. Intendance
14. Lingerie
15. Informatique
16. Confection
17. Autre

→ À mettre à jour dans `StagesPage.jsx` (remplacer les 6 secteurs inventés).

---

## Réception du Word AI — Décisions prises

1. **Mode préféré par Karavia** : réception par **email** (automatique, pas de drag&drop manuel)
2. **Alternative** : drag & drop dans un dossier SharePoint dédié ("Réception AI")
3. **Les deux modes sont possibles** en parallèle
4. **Adresse email** : à déterminer (adresse dédiée vs adresse Karavia) — Karavia doit en discuter avec François (son responsable)
5. **Le Word AI est conservé** : après extraction, il est copié dans le dossier du stagiaire sous /Administratif
6. **Flux enchaînés** : email → déposer dans SP → extraction déclenchée → dossier créé
7. **Connecteur Word** : Word Online (pas premium normalement), à vérifier

---

## HIN (Health Info Net AG)

- Système suisse de messagerie cryptée pour le secteur de la santé
- Les conseillers AI envoient le formulaire Word OCAS **par HIN**
- HIN s'intègre à Outlook → les mails arrivent dans la boîte Outlook normale
- Power Automate peut donc capter ces mails comme n'importe quel email Outlook
- Pas besoin de connecteur HIN spécial

---

## Impact sur le site React

### À modifier
1. **StagesPage.jsx** : remplacer les 6 secteurs par les 17 réels
2. **Ajouter composant d'aiguillage** : 2 questions avant redirection Forms
3. **Différencier les URLs Forms** : selon les réponses aux 2 questions, rediriger vers le bon formulaire
4. **ModulesMetiers.jsx** : adapter la redirection (Form 6 si "moi-même", Form 2 si "partenaire")

### Inchangé
- HomePage.jsx (2 cartes : Modules / Stage)
- Calendrier (SecteurCalendar, WeekDetail)
- Header, Breadcrumb, InfoBulle
