# Résumé de la réunion Karavia du 14 mars 2026

> Source : `docs/transcription-karavia2.txt` (525 lignes, ~41 minutes)
> Fichier audio : `docs/KaraviaComprehension2.mp4`

---

## Décisions clés

### 1. Deux canaux d'entrée distincts
- **Canal site/Forms** : pour les partenaires, enseignants, stagiaires directs
- **Canal Word AI** : pour les conseillers AI (OCAS) qui envoient un formulaire Word structuré
- Le site/Forms qu'on a construit **ne sera PAS pour l'AI**, mais pour tous les autres

### 2. Réception du Word AI
- **Karavia préfère** : réception automatique par **email** (pas drag & drop)
- Alternative : dossier SharePoint "Réception AI" pour drag & drop manuel
- **Les deux modes sont possibles** simultanément
- Email → flux 1 dépose le Word dans le dossier SP → flux 2 s'enclenche (extraction)
- **Adresse email** : Karavia doit consulter François (son responsable) pour décider entre adresse dédiée ou sa propre adresse
- Critère important : l'outil doit être **accessible aux collègues** (vacances, absences)

### 3. Extraction du Word
- Le Word OCAS est structuré en **tableaux** → extraction faisable via Word Online connector
- Champs à extraire : AVS, nom, prénom, date naissance, adresse, tél, email, représentant légal, niveau scolaire
- Le Word sera **conservé** dans le dossier du stagiaire sous /Administratif après extraction
- Il manque des infos dans le Word par rapport au Forms (curatelle, taille vêtements, etc.) → **formulaire complémentaire** envoyé au stagiaire
- Connecteur Word normalement pas premium, mais à vérifier

### 4. Logique de complétion AVS
- Après extraction du Word AI → création du dossier SP avec les données disponibles
- Le flux envoie un email au **stagiaire** (mail de l'assuré, pas de la conseillère AI)
- Le stagiaire reçoit un lien Forms pour **compléter** les infos manquantes
- Si le stagiaire remplit le Forms avec le même AVS → **pas de doublon**, ça complète/écrase le dossier existant
- Règle d'écrasement : les nouvelles données remplacent les anciennes (pas d'historisation, sauf si demandé)

### 5. Formulaires multiples
- Karavia va **créer plusieurs formulaires** adaptés à chaque cas de figure
- Un formulaire par chemin plutôt qu'un seul formulaire avec des branchements complexes
- Elle les crée elle-même ("c'est fait en deux secondes")
- Les 2 questions d'aiguillage ("pour moi/pour autrui" + "déjà inscrit ?") **sur le site React**, pas dans le Forms

### 6. Section Demande de stage
- Les stagiaires **choisissent** leurs dates de stage (c'est une **demande/souhait**, pas garanti)
- Les 14 jours grisés sont confirmés (délai minimum)
- Karavia **ne veut pas** que les stagiaires puissent prendre à moins de 14 jours

### 7. Conseillers AI — Impact sur le formulaire
- La section "Conseiller AI" dans le Forms **reste en place** (parfois remplie par enseignants/parents)
- Environ "la majorité" des demandes viennent de conseillers AI, mais pas 80%
- Le formulaire existant n'est **pas trop spécifique**, il reste pertinent

### 8. Divers
- Karavia doit **revoir le document flux-cas-figures.html** et valider les chemins
- Elle doit décider de l'adresse email (plénière le lendemain)
- Mention du "cas spécial" : stagiaire qui revient après 2 ans → couvert par le chemin C
- Karim va travailler sur le flux Word AI en priorité en attendant le retour de Karavia

---

## Prochaines actions (issues de cette réunion)

1. **Karavia** : crée les formulaires adaptés à chaque chemin ✅ (fait — les 7 forms existent)
2. **Karavia** : consulte François pour l'adresse email de réception Word AI ⏳
3. **Karavia** : relit le document flux-cas-figures.html et valide les chemins ⏳
4. **Karim** : construit le flux Word AI (extraction + création dossier) ⬜
5. **Karim** : adapte le site React avec les 2 questions d'aiguillage ⬜
6. **Karim** : met à jour les secteurs réels sur le site ⬜
7. **Karim** : adapte les flux PA pour chaque nouveau formulaire ⬜
