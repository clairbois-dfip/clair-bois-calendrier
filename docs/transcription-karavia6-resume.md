# Résumé de la réunion Karavia du 6 mai 2026

> Source : `docs/transcription-karavia6.txt` (2229 lignes, ~103 minutes)
> Présents : Miles (Karim), Rosina Karavia, Benoît (IT, ~10-11 min seulement)

---

## Décisions clés

### 1. Cartographie — priorité absolue sur tout le reste

Rosina le dit explicitement autour de 42 min : la cartographie prend la **priorité sur la mise en place des nouveaux systèmes de stages** car elle a perdu sa personne référente interne (qui lui indiquait les places disponibles) et n'a plus aucune visibilité sur l'état d'occupation réel. La cartographie doit être opérationnelle pour qu'elle puisse la présenter aux secteurs et co-construire les données réelles.

**Délai cible :** terminée et prête à présenter avant la semaine du 18 mai. Miles s'engage à finir les modifications fin de semaine (semaine du 6 mai).

### 2. Modifications concrètes demandées sur la cartographie

**Labels / types de places :**
- Remplacer les lettres génériques A, B, C, D par les vraies catégories : **FPRA**, **AFP-CFC**, **Stage** (ou **Stage/Mesure**), **CEA**
- Si plusieurs places du même type dans un secteur : Stage 1, Stage 2, FPRA 1, FPRA 2, etc.
- Enlever le mot "Tablier" (dit "Table") des cercles
- Enlever la molette de zoom (ou la rendre optionnelle)

**Code couleur revu — système à 3 couleurs :**
- **Vert** : place libre, aucun stage prévu sur toute l'année
- **Rouge** : place occupée *aujourd'hui*
- **Orange** : place occupée *à une date future* (pas aujourd'hui) — c'est le "statut intermédiaire"

Le code couleur par type de place (violet AFP-CFC, vert FPRA, etc.) **reste sur le titre/label** du cercle, pas sur la couleur d'état. Un seul système de couleur d'état suffit (vert/rouge/orange).

**Temporalité — comment ça fonctionne :**
- Vue par défaut = **aujourd'hui**
- Rouge = occupé aujourd'hui
- Orange = pas occupé aujourd'hui mais des stages sont prévus dans le futur (ex. Thomas du 4 au 5 juillet, Adeline en semaine de début août)
- Au survol d'un cercle orange → afficher la liste des créneaux réservés (nom + dates)
- Cela remplace le calendrier de saisie existant : plus besoin du calendrier séparé

**Nouvelles catégories de places (uniquement Pôle enfance-adolescence et Pôle adulte) :**
- Ajouter deux nouveaux types de rond : **App.non-DFIP** et **Stagiaire-MSP/MSTS**
- Ces secteurs accueillent des apprentis classiques (budget propre de la fondation) en plus des apprentis DFIP
- Les appartements et secteurs restaurant/nettoyage ne concernent que le DFIP → pas de changement là

**Mode consultation uniquement pour la cartographie :**
- La cartographie reste **en lecture seule** pour tous les utilisateurs
- Toutes les modifications (réservation, blocage, validation) se font depuis la **SharePoint List des demandes**
- Exception : Rosina pourra ajouter un commentaire manuel "réservé Rosina du 11 au 25 fév." directement dans la SharePoint List de la carto pour bloquer une place sans créer de demande formelle

**Onglet caché / accès :**
- La cartographie restera sur le site Internet, dans un **onglet caché** protégé par mot de passe
- Elle n'est pas publique — réservée à l'usage interne DFiP RH

### 3. Architecture des données de la cartographie — deux SharePoint Lists distinctes

Miles propose et Rosina valide :
- **SP List "contenant"** (alias "carto") : structure des secteurs/appartements, nombre de places max par type, pas d'infos personnelles — c'est cette liste qui alimente l'affichage visuel de la cartographie
- **SP List "contenu"** (alias "demandes") : toutes les demandes de stage reçues (via formulaire, site React, ou PDF AI), avec toutes les données personnelles (AVS, objectifs, tailles, etc.) — c'est depuis cette liste que Rosina valide et que la carto se met à jour

Les deux listes sont liées par un **lookup** : la liste des demandes pointe vers la carto, pas l'inverse. Conséquence importante : modifier la carto directement ne met pas à jour les demandes.

### 4. Temporalité et cycle de vie d'un stagiaire dans le système

Une demande = une période. Quand un stagiaire change de statut (ex. stage → mesure d'orientation → formation AFP), cela crée une **nouvelle demande** dans la SP List, avec le même stagiaire (même ID/AVS), nouvelles dates et nouveau type. Ce mécanisme :
- Libère automatiquement la place précédente (devient verte à la fin du stage)
- Bloque la nouvelle place (devient orange ou rouge selon les dates)
- Conserve l'historique complet : toutes les demandes de Dupont sont filtrables par nom/AVS

Flux d'upgrade de statut proposé par Miles : Rosina crée une nouvelle demande depuis la SP List des demandes, y tape le nom ou l'AVS du stagiaire existant, sélectionne le nouveau type (mesure d'orientation, formation, etc.), met les dates, et valide.

### 5. Canal PDF/AI Builder pour les documents OCAS

**Décision définitive : c'est du PDF, pas du Word.**

Rosina confirme qu'elle reçoit des **PDF** de l'OCAS (pas des Word) — ce qui est une bonne nouvelle car AI Builder gère mieux les PDF. Le flux prévu :
1. Rosina dépose le PDF OCAS dans un dossier SharePoint "Réception AI"
2. AI Builder (entraîné sur plusieurs exemplaires réels → Miles a besoin de PDF réels pour améliorer le modèle) extrait les champs : AVS, nom, prénom, date naissance, nom conseillère AI, type de mesure
3. Le flux Power Automate crée/met à jour la demande dans la SP List
4. Le flux peut aussi pré-compléter les documents Word de bilan/rapport dans le dossier du stagiaire avec les données extraites (faisable, à confirmer avec AI Builder)
5. Le PDF est conservé dans le dossier du stagiaire (sous /Administratif)

**Différence de comportement selon l'origine de la demande :**
- Demande via formulaire web → mail automatique de demande de documents complémentaires envoyé au stagiaire
- Demande via PDF AI → **pas** de mail automatique de demande de docs ; à la place, un mail différent type "Bonjour, nous avons bien reçu votre dossier de l'AI, voici les documents manquants, vous serez contacté pour une rencontre"

### 6. Suivi per-stagiaire dans OneNote

Rosina veut un **dossier de suivi individuel** pour chaque stagiaire, accessible à toute l'équipe, en remplacement/complément des fichiers Excel actuels. Concept : une page OneNote par stagiaire, structurée en sections :
- Informations générales (coordonnées, conseillère AI, tailles, curateur/curatrice, personne de contact urgence) — **alimentées automatiquement** par Power Automate lors de la validation
- Stages/Mesures (dates, secteur, objectifs) — tab "Stage 1", "Stage 2", etc. alimentés à la validation
- Lien direct vers le dossier Évaluation/Bilans (pas les bilans eux-mêmes, juste un hyperlien)
- Zone de saisie manuelle : absences, observations, notes d'équipe

**Contrainte technique :** le connecteur OneNote dans Power Automate est **Premium** (comme AI Builder). Miles confirme que le connecteur OneNote Business existe bien et permet : créer section, créer page, mettre à jour contenu de page. Mais cela nécessite la licence Power Automate Premium.

**Prototype :** les deux (Rosina et Miles) vont construire chacun un prototype OneNote cette semaine et les comparer lors du rendez-vous du mardi 19 mai à 15h30.

### 7. Licences Power Automate Premium — urgence remontée à Benoît (IT)

Autour de 10-11 min : Rosina interpelle Benoît (responsable IT de la fondation, qui part) sur deux points urgents :
1. **Power Automate Premium** : c'est l'urgence n°1. Rosina dit que si on lui refuse ça, elle part. Elle mentionne ~10 CHF/an. Benoît dit qu'il va envoyer un mail. C'est lui qui dit "go" ou pas côté IT.
2. **Infomaniac (hébergement)** : Benoît doit clarifier si l'hébergement actuel de la fondation sur Infomaniac est suffisant ou s'il faut quelque chose de plus.

Rosina a déjà le soutien de son chef François pour le coût (il paie). Benoît = décideur IT final.

### 8. Carte globale demandée par François (boss de Rosina)

François (chef de Rosina) a demandé une **cartographie globale** incluant **tous** les apprentis de la fondation, y compris les apprentis classiques (non-DFIP). Rosina transmet la demande.

Miles : c'est faisable, ça grossira la carto existante avec une catégorie supplémentaire et un nouveau code couleur. Potentiellement un **deuxième mois de travail** garanti.

### 9. Hébergement Infomaniac

Rosina confirme qu'elle a elle-même hébergé un site sur Infomaniac et connaît les trois types d'hébergement. Pour le projet Clair-Bois : si la fondation a déjà un site associé, on rajoute simplement un sous-chemin. Miles peut déjà avancer le développement en local indépendamment de la résolution de l'hébergement — c'est la phase finale.

### 10. Flux de validation et notifications en cascade (vision cible)

Une fois un stage validé par Rosina, un seul flux Power Automate peut tout déclencher :
- Mise à jour de la cartographie
- Mise à jour du OneNote du stagiaire
- Email de confirmation au stagiaire/professeur
- Email d'information au responsable de secteur
- Email de demande d'uniforme (au responsable uniforme)
- Email de demande de programmation repas (au responsable repas)

Si les dates sont modifiées après validation (retour du secteur, changement de camp, etc.) → Rosina retourne dans la SP List, modifie les dates, revalide → le flux (polling toutes les 2 minutes) détecte le changement et renvoie tous les mails avec les nouvelles dates (mail corrigé uniquement si dates modifiées, pas répétition complète).

**Repas : gestion manuelle maintenue** pour l'instant (trop complexe à automatiser entièrement). Mais on peut automatiser une notification email vers le gestionnaire des repas à chaque validation.

### 11. Uniformes : intégration dans le flux de validation

La demande d'uniforme sera déclenchée automatiquement lors de la validation du stage, dans le même flux. Si les dates changent, la correction part aussi automatiquement.

### 12. Alertes hebdomadaires de suivi (chaque lundi)

Rosina demande un mécanisme d'alerte automatique le lundi matin pour :
- Demandes de stage dans moins de 2 semaines et pas encore traitées
- Informations manquantes dans des dossiers existants
- Tout statut encore "en cours" / non validé alors que la date approche

---

## Nouveaux éléments vs réunions précédentes

- **PDF, pas Word** pour l'OCAS : confirmation définitive (lors de la réunion 2, c'était encore en mode "Word ou PDF ?")
- **Cartographie prioritaire sur les flux** : inversion de la roadmap. Avant, on construisait les flux d'abord ; maintenant la carto doit être montrée aux secteurs en premier pour collecter les vraies données de capacité
- **Perte de la personne référente** interne à Clairbois : changement organisationnel qui rend la carto encore plus urgente
- **Catégorie App.non-DFIP** : nouvelle catégorie non mentionnée auparavant
- **OneNote** comme outil de suivi per-stagiaire : concept plus précis qu'avant (sections par période, alimentation automatique via PA)
- **Carte globale François** : nouvelle demande du chef hiérarchique, pas évoquée avant
- La cartographie est **en lecture seule** — toutes les modifs passent par la SP List

---

## Points non résolus

1. **Licence PA Premium** : Benoît doit confirmer (urgence n°1). Sans ça, les connecteurs AI Builder et OneNote ne fonctionnent pas.
2. **Infomaniac** : Benoît doit clarifier si l'hébergement actuel de la fondation supporte le projet.
3. **Données réelles des secteurs** : Rosina doit collecter auprès de chaque secteur le nombre exact de formateurs, places max par type, pour alimenter la SP List "contenant" de la carto. Rosina prévoit de faire ça par mail ou visite le mercredi matin (semaine du 6 mai), éventuellement déléguer à un collègue.
4. **PDF OCAS réels pour entraîner AI Builder** : Miles a besoin d'exemples de vrais PDF (pas toujours les mêmes) pour améliorer la reconnaissance des champs.
5. **Nouveau collaborateur (recrutement en cours)** : Rosina mentionne qu'un collègue pourrait être embauché pour gérer les stages à sa place. Miles doit prévoir que ce second utilisateur ait le même niveau d'accès (rôle équivalent à Rosina dans l'outil).
6. **Prototype OneNote** : les deux parties doivent produire un prototype pour le 19 mai.
7. **Document Word de bilan** : Rosina veut retravailler les modèles de bilans (rapport intermédiaire/final AI) pour que PA puisse les pré-compléter. À valider avec AI Builder.
8. **Extension de la mission en juin** : Rosina demande à son chef de prolonger la mission de Miles en juin. Pas encore confirmé.

---

## Prochaines actions

### Miles (Karim)
1. **Cette semaine** : appliquer les modifications sur la cartographie (labels FPRA/AFP-CFC/Stage/CEA, nouveau système couleurs vert/rouge/orange, retirer "Table", suppression ou simplification de la molette, ajout App.non-DFIP + Stagiaire-MSP sur Pôle enfance et Pôle adulte) — cible : fin de semaine du 9 mai
2. Construire un **prototype OneNote** de suivi per-stagiaire pour présentation au RDV du 19 mai
3. Préparer la **SP List "contenant"** (structure carto) avec les colonnes : secteur, appartement, type de place, places max — prête à être remplie par Rosina avec les vraies données
4. Configurer le **flux AI Builder sur PDF** dès que les PDF réels sont fournis par Rosina et dès que la licence PA Premium est accordée
5. **Envoyer un mail récapitulatif à Benoît** avec les deux points urgents : PA Premium + Infomaniac

### Rosina Karavia
1. **Cette semaine** : collecter les informations de capacité auprès de chaque secteur (nombre de formateurs, places max par type) — via mail, visite mercredi matin ou délégation à un collègue
2. **Cette semaine** : fournir à Miles des **exemples de PDF OCAS réels** pour entraîner AI Builder (au moins 5 PDF différents si possible)
3. **Semaine du 19 mai** : se libérer le mardi 19 à 15h30 pour le rendez-vous de revue (retour en présentiel)
4. Construire son propre **prototype OneNote** de suivi individuel et l'envoyer à Miles avant le 19 mai
5. Demander à son chef François la **prolongation de la mission en juin**
6. Relancer Benoît (IT) sur les deux points urgents : PA Premium + Infomaniac

### Benoît (IT)
1. **Urgent** : confirmer ou faire approuver la **licence Power Automate Premium**
2. **Urgent** : clarifier la question de l'hébergement **Infomaniac** (est-ce que ce que la fondation a est compatible avec ce projet ?)

---

## Rendez-vous suivant

**Mardi 19 mai 2026 à 15h30** — présentiel — revue de la carto finalisée + comparaison des prototypes OneNote
