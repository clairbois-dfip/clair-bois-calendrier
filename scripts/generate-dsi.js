/**
 * generate-dsi.js — Génère le document de passation DSI pour le projet Clair-Bois.
 *
 * Usage : node generate-dsi.js
 * Sortie : Passation_DSI_ClairBois.pdf
 */
const PDFDocument = require('pdfkit')
const fs = require('fs')

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  autoFirstPage: true,
  info: {
    Title: 'Document de passation DSI — Calendrier des disponibilités de stage',
    Author: 'Fondation Clair-Bois',
    Subject: 'Passation technique et fonctionnelle',
  },
})

const stream = fs.createWriteStream('Passation_DSI_ClairBois.pdf')
doc.pipe(stream)

// Couleurs
const BLUE = '#1e3a5f'
const LIGHT_BLUE = '#e8f0fe'
const GRAY = '#666666'
const DARK = '#222222'
const WARNING_BG = '#fff7ed'
const WARNING_BORDER = '#f59e0b'

const LEFT = 50
const PAGE_WIDTH = 595.28 - 100

// ============================================================
// HELPERS
// ============================================================
function checkPageBreak(needed) {
  if (doc.y + needed > 760) doc.addPage()
}

function title(text, level = 1) {
  doc.moveDown(level === 1 ? 1.5 : 0.8)
  checkPageBreak(40)
  const sizes = { 1: 22, 2: 16, 3: 13 }
  doc.font('Helvetica-Bold').fontSize(sizes[level] || 13).fillColor(BLUE)
  doc.text(text, LEFT, doc.y, { width: PAGE_WIDTH })
  if (level === 1) {
    doc.moveDown(0.3)
    doc.moveTo(LEFT, doc.y).lineTo(LEFT + PAGE_WIDTH, doc.y).strokeColor(BLUE).lineWidth(1.5).stroke()
  }
  doc.moveDown(0.4)
  doc.fillColor(DARK)
}

function para(text) {
  checkPageBreak(30)
  doc.font('Helvetica').fontSize(10).fillColor(DARK)
  doc.text(text, LEFT, doc.y, { width: PAGE_WIDTH, align: 'justify', lineGap: 3 })
  doc.moveDown(0.3)
}

function bold(text) {
  checkPageBreak(20)
  doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK)
  doc.text(text, LEFT, doc.y, { width: PAGE_WIDTH })
}

function bullet(text) {
  checkPageBreak(25)
  doc.font('Helvetica').fontSize(10).fillColor(DARK)
  doc.text('  \u2022  ' + text, LEFT, doc.y, { width: PAGE_WIDTH, lineGap: 2, indent: 10 })
}

function numberedItem(num, text) {
  checkPageBreak(25)
  doc.font('Helvetica').fontSize(10).fillColor(DARK)
  doc.text(num + '. ' + text, LEFT + 15, doc.y, { width: PAGE_WIDTH - 15, lineGap: 2 })
}

function warningBox(text) {
  checkPageBreak(60)
  doc.font('Helvetica-Bold').fontSize(10)
  const h = doc.heightOfString(text, { width: PAGE_WIDTH - 40 }) + 24
  const boxY = doc.y + 5
  doc.save()
  doc.rect(LEFT, boxY, PAGE_WIDTH, h).fillColor(WARNING_BG).fill()
  doc.rect(LEFT, boxY, 4, h).fillColor(WARNING_BORDER).fill()
  doc.restore()
  doc.fillColor('#92400e').text(text, LEFT + 18, boxY + 12, { width: PAGE_WIDTH - 40 })
  doc.y = boxY + h + 10
  doc.fillColor(DARK)
}

function infoBox(titleText, bodyText) {
  checkPageBreak(70)
  doc.font('Helvetica').fontSize(10)
  const bh = doc.heightOfString(bodyText, { width: PAGE_WIDTH - 40 })
  const totalH = bh + 38
  const boxY = doc.y + 5
  doc.save()
  doc.rect(LEFT, boxY, PAGE_WIDTH, totalH).fillColor(LIGHT_BLUE).fill()
  doc.rect(LEFT, boxY, 4, totalH).fillColor(BLUE).fill()
  doc.restore()
  doc.font('Helvetica-Bold').fontSize(10).fillColor(BLUE)
  doc.text(titleText, LEFT + 18, boxY + 8, { width: PAGE_WIDTH - 40 })
  doc.font('Helvetica').fontSize(9.5).fillColor(DARK)
  doc.text(bodyText, LEFT + 18, doc.y + 2, { width: PAGE_WIDTH - 40 })
  doc.y = boxY + totalH + 10
}

function tableHeader(cols, widths) {
  checkPageBreak(25)
  const rowY = doc.y
  doc.save()
  doc.rect(LEFT, rowY, PAGE_WIDTH, 22).fillColor(BLUE).fill()
  doc.restore()
  let x = LEFT
  cols.forEach((col, i) => {
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#ffffff')
    doc.text(col, x + 5, rowY + 6, { width: widths[i] - 10, lineBreak: false })
    x += widths[i]
  })
  doc.y = rowY + 22
  doc.fillColor(DARK)
}

function tableRow(cols, widths, highlight) {
  let maxH = 18
  cols.forEach((col, i) => {
    doc.font('Helvetica').fontSize(8)
    const h = doc.heightOfString(col || '', { width: widths[i] - 10 })
    if (h + 10 > maxH) maxH = h + 10
  })
  checkPageBreak(maxH + 2)
  const rowY = doc.y
  doc.save()
  if (highlight) doc.rect(LEFT, rowY, PAGE_WIDTH, maxH).fillColor('#f8f9fa').fill()
  doc.rect(LEFT, rowY, PAGE_WIDTH, maxH).strokeColor('#dee2e6').lineWidth(0.5).stroke()
  doc.restore()
  let x = LEFT
  cols.forEach((col, i) => {
    doc.font('Helvetica').fontSize(8).fillColor(DARK)
    doc.text(col || '', x + 5, rowY + 5, { width: widths[i] - 10 })
    x += widths[i]
  })
  doc.y = rowY + maxH
}

// ============================================================
// PAGE DE GARDE
// ============================================================
doc.moveDown(6)
doc.font('Helvetica-Bold').fontSize(32).fillColor(BLUE)
doc.text('DOCUMENT DE PASSATION', LEFT, doc.y, { width: PAGE_WIDTH, align: 'center' })
doc.moveDown(0.5)
doc.font('Helvetica-Bold').fontSize(18).fillColor(BLUE)
doc.text('Direction des Systèmes d\'Information', LEFT, doc.y, { width: PAGE_WIDTH, align: 'center' })
doc.moveDown(2)
doc.font('Helvetica').fontSize(14).fillColor(GRAY)
doc.text('Calendrier des disponibilités de stage', LEFT, doc.y, { width: PAGE_WIDTH, align: 'center' })
doc.moveDown(0.5)
doc.font('Helvetica').fontSize(12).fillColor(GRAY)
doc.text('Fondation Clair-Bois — Genève', LEFT, doc.y, { width: PAGE_WIDTH, align: 'center' })
doc.moveDown(4)

doc.moveTo(150, doc.y).lineTo(445, doc.y).strokeColor(BLUE).lineWidth(2).stroke()
doc.moveDown(1.5)

doc.font('Helvetica').fontSize(11).fillColor(GRAY)
doc.text('Version : 1.0', LEFT, doc.y, { width: PAGE_WIDTH, align: 'center' })
doc.text('Date : Mars 2026', LEFT, doc.y, { width: PAGE_WIDTH, align: 'center' })
doc.text('Classification : Interne', LEFT, doc.y, { width: PAGE_WIDTH, align: 'center' })
doc.moveDown(6)

doc.font('Helvetica').fontSize(9).fillColor(GRAY)
doc.text('Ce document décrit l\'architecture technique, les flux de données et les procédures de maintenance du système de calendrier de stage de la Fondation Clair-Bois.', LEFT + 50, doc.y, { width: PAGE_WIDTH - 100, align: 'center' })

// ============================================================
// TABLE DES MATIÈRES
// ============================================================
doc.addPage()
doc.font('Helvetica-Bold').fontSize(22).fillColor(BLUE)
doc.text('Table des matières', LEFT, doc.y, { width: PAGE_WIDTH })
doc.moveDown(0.5)
doc.moveTo(LEFT, doc.y).lineTo(LEFT + PAGE_WIDTH, doc.y).strokeColor(BLUE).lineWidth(1.5).stroke()
doc.moveDown(1)

const toc = [
  [false, '1.', 'Présentation générale'],
  [false, '2.', 'Architecture du système'],
  [false, '3.', 'Stack technique'],
  [false, '4.', 'Structure des données SharePoint'],
  [false, '5.', 'Flux Power Automate'],
  [true,  '5.1', 'Flux 1 — Inscription des stagiaires'],
  [true,  '5.2', 'Flux 2 — Réception des pièces jointes'],
  [true,  '5.3', 'Flux 3 — Génération du planning'],
  [true,  '5.4', 'Flux 4 — Gestion des créneaux'],
  [false, '6.', 'Frontend React — Site web'],
  [false, '7.', 'Microsoft Forms'],
  [false, '8.', 'Pipeline de déploiement'],
  [false, '9.', 'Procédures de maintenance'],
  [false, '10.', 'Contacts et accès'],
  [false, '11.', 'Glossaire'],
]

toc.forEach(([sub, num, label]) => {
  const indent = sub ? 30 : 0
  doc.font(sub ? 'Helvetica' : 'Helvetica-Bold').fontSize(11).fillColor(DARK)
  doc.text(num + '  ' + label, LEFT + indent, doc.y, { width: PAGE_WIDTH - indent })
  doc.moveDown(0.15)
})

// ============================================================
// 1. PRÉSENTATION GÉNÉRALE
// ============================================================
doc.addPage()
title('1. Présentation générale')

para('La Fondation Clair-Bois accompagne des personnes en situation de handicap dans leur réorientation professionnelle à Genève (Suisse). Le système décrit dans ce document est un calendrier interactif en ligne permettant aux référents externes (écoles spécialisées, assurances, offices AI) de consulter les disponibilités de stage dans les différents établissements de la fondation et de procéder à l\'inscription des stagiaires.')

title('1.1 Objectifs du système', 2)
bullet('Permettre une consultation anonyme (sans compte Microsoft) des places de stage disponibles')
bullet('Centraliser les inscriptions via un formulaire Microsoft Forms unique (43 questions)')
bullet('Automatiser le traitement des inscriptions : création de fiches, gestion documentaire, mise à jour des disponibilités')
bullet('Offrir aux référents cadres un mécanisme pour gérer les créneaux de disponibilité')

title('1.2 Acteurs du système', 2)

const actorWidths = [120, 375]
tableHeader(['Acteur', 'Description'], actorWidths)
tableRow(['Référents externes', 'Personnes anonymes (écoles, assurances, AI) qui consultent le calendrier pour trouver une place et inscrire un stagiaire.'], actorWidths)
tableRow(['Référents cadres', 'Responsables de secteur dans chaque établissement. Définissent les capacités d\'accueil via le formulaire "Gestion des créneaux". Accès protégé par mot de passe.'], actorWidths, true)
tableRow(['Mme Karavia', 'Coordinatrice générale des entrées de stagiaires. Mandante du projet.'], actorWidths)
tableRow(['Service IT (DSI)', 'Maintenance technique, accès SharePoint et Power Automate, gestion des connexions.'], actorWidths, true)

title('1.3 Structure organisationnelle', 2)
para('Le système suit la hiérarchie suivante :')
para('Fondation > Établissements > Secteurs > Créneaux de disponibilité')
para('Les créneaux peuvent se chevaucher dans un même secteur (ex : deux stages différents couvrant la même semaine). Le système gère cette situation en agrégeant les créneaux par semaine ISO.')

// ============================================================
// 2. ARCHITECTURE DU SYSTÈME
// ============================================================
doc.addPage()
title('2. Architecture du système')

para('Le système repose sur une architecture hybride combinant des services Microsoft 365 (Power Automate, SharePoint, Forms) et un site web statique hébergé sur GitHub Pages.')

title('2.1 Vue d\'ensemble', 2)

infoBox('Architecture simplifiée',
  'Microsoft Forms > Power Automate (4 flux) > SharePoint (4 listes + 1 bibliothèque) > GitHub Pages (site React)')

title('2.2 Composants principaux', 2)

const compWidths = [130, 365]
tableHeader(['Composant', 'Rôle'], compWidths)
tableRow(['Microsoft Forms', 'Formulaire d\'inscription stagiaire (43 questions) + Formulaire "Gestion des créneaux" pour référents cadres'], compWidths)
tableRow(['Power Automate', '4 flux automatisés : inscription, documents, planning, créneaux'], compWidths, true)
tableRow(['SharePoint Online', '4 listes de données (Stagiaire, Demande, Referent, Creneaux) + bibliothèque de documents'], compWidths)
tableRow(['GitHub Pages', 'Hébergement du site web React (statique, pas de backend)'], compWidths, true)
tableRow(['GitHub Repository', 'Code source + fichier planning.json généré automatiquement'], compWidths)

title('2.3 Flux de données', 2)

numberedItem(1, 'Un référent externe consulte le calendrier sur le site web (GitHub Pages).')
numberedItem(2, 'Il clique sur "S\'inscrire" — redirigé vers Microsoft Forms (pré-rempli avec établissement, secteur, date).')
numberedItem(3, 'Le Flux 1 (Power Automate) crée automatiquement un Stagiaire et une Demande dans SharePoint.')
numberedItem(4, 'Un email est envoyé au référent avec les pièces justificatives à fournir.')
numberedItem(5, 'Le Flux 2 traite les pièces jointes reçues par email et les range dans SharePoint.')
numberedItem(6, 'Le Flux 3 (polling toutes les 3 min) recalcule les disponibilités et pousse planning.json sur GitHub.')
numberedItem(7, 'GitHub Pages redéploie automatiquement — le site est à jour.')

warningBox('Le site web ne contient aucune donnée personnelle. Seul le nombre de places disponibles/occupées est publié dans planning.json.')

// ============================================================
// 3. STACK TECHNIQUE
// ============================================================
doc.addPage()
title('3. Stack technique')

title('3.1 Frontend (site web)', 2)
const stackWidths = [140, 355]
tableHeader(['Technologie', 'Détail'], stackWidths)
tableRow(['React 19', 'Framework JavaScript pour l\'interface utilisateur'], stackWidths)
tableRow(['Vite', 'Outil de build et serveur de développement'], stackWidths, true)
tableRow(['Tailwind CSS v4', 'Framework CSS utilitaire (plugin @tailwindcss/vite)'], stackWidths)
tableRow(['GitHub Pages', 'Hébergement statique, déploiement automatique'], stackWidths, true)
tableRow(['Repository', 'github.com/rochat-dev/clair-bois-calendrier'], stackWidths)

title('3.2 Backend (automatisation)', 2)
tableHeader(['Technologie', 'Détail'], stackWidths)
tableRow(['Power Automate', '4 flux cloud (compte stagiaire.dfip@clairbois.ch)'], stackWidths)
tableRow(['SharePoint Online', 'Site d\'équipe DFIP (fondationclairbois.sharepoint.com/sites/DFIP-SiteEquipe)'], stackWidths, true)
tableRow(['Microsoft Forms', '2 formulaires avec AllowPrefill activé'], stackWidths)
tableRow(['GitHub API', 'API Contents pour le push automatique de planning.json'], stackWidths, true)

title('3.3 Décision architecturale : pas de backend dédié', 2)
para('Le formulaire d\'inscription (43 questions, données sensibles : AVS, curatelle, AI) reste sur Microsoft Forms car :')
bullet('Les données sensibles sont incompatibles avec un site statique GitHub Pages')
bullet('Power Automate est déjà branché sur le formulaire existant')
bullet('Le calendrier est la valeur ajoutée principale du projet, pas le formulaire')

infoBox('Conséquence', 'Le site est 100% statique (HTML/CSS/JS). Il n\'y a aucun serveur à maintenir. Le fichier planning.json est le seul lien entre Power Automate et le site web.')

// ============================================================
// 4. STRUCTURE DES DONNÉES SHAREPOINT
// ============================================================
doc.addPage()
title('4. Structure des données SharePoint')

para('Les données sont stockées dans 4 listes SharePoint sur le site d\'équipe DFIP, plus une bibliothèque de documents pour les dossiers stagiaires.')

title('4.1 Liste "Stagiaire"', 2)
bold('GUID : bf357221-7e74-4905-9b58-b4ea22f79de0')
doc.moveDown(0.3)
para('Contient les données personnelles des stagiaires. Un stagiaire peut avoir plusieurs demandes de stage (relation 1:N avec la liste Demande).')

const spWidths = [140, 100, 255]
tableHeader(['Colonne', 'Type', 'Remarques'], spWidths)
tableRow(['Nom, Prenom', 'Texte', ''], spWidths)
tableRow(['Sexe', 'Choix', 'Masculin, Féminin'], spWidths, true)
tableRow(['DateNaissance', 'Date', ''], spWidths)
tableRow(['NumTel, Mail', 'Texte', 'Mail = toujours l\'email du stagiaire'], spWidths, true)
tableRow(['Adresse, NpaLocalite', 'Texte', ''], spWidths)
tableRow(['AVS', 'Texte', 'Identifiant unique pour vérifier les doublons'], spWidths, true)
tableRow(['UrgenceNom/Prenom/Tel/Lien', 'Texte', 'Contact d\'urgence'], spWidths)
tableRow(['Curatelle', 'Oui/Non', 'Booléen (false affiché comme vide dans SP)'], spWidths, true)
tableRow(['CuratelleType', 'Choix', 'Privé, OPAD, Autre'], spWidths)
tableRow(['CuratelleNom/Prenom/Tel/Mail', 'Texte', 'Nouveaux IDs Forms depuis mars 2026'], spWidths, true)
tableRow(['AssuranceInvalidite', 'Choix', '4 options (Oui inscrit, Non, En cours, etc.)'], spWidths)
tableRow(['AIConseillerNom/Prenom/Tel/Mail', 'Texte', 'Anciens IDs curatelle réassignés'], spWidths, true)
tableRow(['TailleTshirt/Pantalon/Pointure', 'Texte', 'Uniformes'], spWidths)
tableRow(['Limitations, ParcoursScolaire', 'Texte multiligne', ''], spWidths, true)
tableRow(['Tests', 'Choix', 'Tests déjà effectués'], spWidths)
tableRow(['Reseau', 'Choix (multi)', 'Sélection multiple activée'], spWidths, true)

title('4.2 Liste "Demande"', 2)
bold('GUID : 9616ee1d-dd0b-44fd-a1c4-34187ebaa9f8')
doc.moveDown(0.3)
para('Une demande correspond à une inscription de stage. Relation 1:N avec Stagiaire (un stagiaire peut avoir plusieurs demandes pour des dates ou modules différents).')

tableHeader(['Colonne', 'Type', 'Remarques'], spWidths)
tableRow(['StagiaireID', 'Lookup', 'Référence vers la liste Stagiaire'], spWidths)
tableRow(['ReferentID', 'Lookup', 'Référence vers la liste Referent (vide si "Moi-même")'], spWidths, true)
tableRow(['Etablissement, Secteur', 'Texte', 'Pré-remplis depuis le calendrier'], spWidths)
tableRow(['DateDebutSouhaitee', 'Date', 'Pré-remplie depuis le calendrier'], spWidths, true)
tableRow(['ObjectifStage', 'Texte multiligne', ''], spWidths)
tableRow(['DejaStage', 'Oui/Non', 'Conversion Forms texte vers SP booléen'], spWidths, true)
tableRow(['Statut', 'Choix', '"En attente des documents", "Documents réceptionnés", "Validé", "Annulé"'], spWidths)
tableRow(['Limitations, ParcoursScolaire', 'Texte multiligne', 'Copie depuis le formulaire'], spWidths, true)
tableRow(['DateReceptionDocs', 'Date', 'Renseignée par le Flux 2'], spWidths)

title('4.3 Liste "Referent"', 2)
bold('GUID : 7a31b912-99af-4415-bfc9-f2ae1cb19c00')
doc.moveDown(0.3)

tableHeader(['Colonne', 'Type', 'Remarques'], spWidths)
tableRow(['Partenaire', 'Texte', 'Organisme du référent'], spWidths)
tableRow(['Fonction', 'Choix', 'Fonction professionnelle'], spWidths, true)
tableRow(['Nom, Prenom, NumTel, Mail', 'Texte', 'Coordonnées du référent'], spWidths)
tableRow(['StagiaireID', 'Lookup', 'Référence vers le stagiaire inscrit'], spWidths, true)

title('4.4 Liste "Creneaux"', 2)
bold('GUID : 3e2deb27-f496-410f-be74-281eb2b0c079')
doc.moveDown(0.3)
para('Définit les créneaux de disponibilité par secteur. Pas de colonne PlacesUtilisées : le comptage est dynamique (via les Demandes liées).')

tableHeader(['Colonne', 'Type', 'Remarques'], spWidths)
tableRow(['Etablissement, Secteur', 'Texte', 'Identifient le créneau'], spWidths)
tableRow(['DateDebut, DateFin', 'Date', 'Période du créneau'], spWidths, true)
tableRow(['PlacesTotal', 'Nombre', 'Capacité d\'accueil'], spWidths)
tableRow(['TypeCreneau', 'Choix', '"Stage" ou "Module métier"'], spWidths, true)
tableRow(['NomModule', 'Texte', 'Vide si Stage classique'], spWidths)

title('4.5 Bibliothèque de documents "Stagiaires Doc"', 2)
para('Chaque stagiaire dispose d\'un dossier organisé par numéro AVS contenant :')
bullet('1. Administratif (Charte, Déclaration, Fiche entrée, Suivi, Demande uniforme, Recrutement)')
bullet('2. Contrat - Résiliation - Courriers RH')
bullet('3. Mesures - Salaires - IJ')
bullet('4. Médical')
bullet('5. Évaluation')
bullet('6. École professionnelle')
bullet('7. Stages - Travail externe')

para('Le dossier est créé automatiquement par le Flux 2 à partir du modèle "8. Modèle dossier_NOM Prénom" dans Documents partagés. Les fichiers personnalisés (Suivi.docx, Demande uniforme.docx) sont renommés avec le nom du stagiaire.')

// ============================================================
// 5. FLUX POWER AUTOMATE
// ============================================================
doc.addPage()
title('5. Flux Power Automate')

para('Les 4 flux sont exécutés sous le compte stagiaire.dfip@clairbois.ch. Ils utilisent les connecteurs suivants :')

const connWidths = [180, 315]
tableHeader(['Connecteur', 'Connexion'], connWidths)
tableRow(['shared_microsoftforms', 'bdeb5556-a627-4e30-bc7c-fd0915978877'], connWidths)
tableRow(['shared_sharepointonline', 'c1e11ff6-1671-4f41-a2e2-6986289998fd'], connWidths, true)
tableRow(['shared_office365', '15b1713b-141c-4abf-b406-9781ffafdbdb'], connWidths)

doc.moveDown(0.5)

// --- FLUX 1 ---
title('5.1 Flux 1 — Inscription des stagiaires', 2)
bold('FLOW-GUID : 8affe7f1-3296-48a2-a2cb-1de6832d8997')
doc.moveDown(0.2)
bold('Déclencheur : Soumission du formulaire d\'inscription (Microsoft Forms)')
doc.moveDown(0.5)

para('Ce flux traite les nouvelles inscriptions. Il gère deux branches selon que le formulaire est rempli par le stagiaire lui-même ("Moi-même") ou par un référent ("Quelqu\'un d\'autre").')

title('Logique de traitement', 3)
numberedItem(1, 'Obtenir les détails de la réponse Forms')
numberedItem(2, 'Condition 1 : "Moi-même" ou "Quelqu\'un d\'autre" ?')
numberedItem(3, 'Filtre email autorisé (domaine @clair-bois.ch ou rochat.vdge)')
numberedItem(4, 'Vérification AVS existant via requête HTTP SharePoint')
numberedItem(5, 'Si AVS existe — Mise à jour du stagiaire ; sinon — Création')
numberedItem(6, 'Création d\'une Demande dans la liste Demande')
numberedItem(7, 'Si branche référent — Création d\'une entrée dans la liste Referent')
numberedItem(8, 'Envoi d\'un email avec objet formaté : [AVS-756.XXXX.XXXX.{2 derniers} D\u00b0{DemandeID}]')

doc.moveDown(0.3)

warningBox('Le champ Mail dans la liste Stagiaire utilise TOUJOURS l\'email du stagiaire (r93aa4aa6), dans les 2 branches. Le destinataire du mail est le référent dans la branche "Quelqu\'un d\'autre".')

title('Mapping des champs (35 champs par action)', 3)
para('Chaque action Stagiaire (Créer ou Mettre à jour, x 2 branches = 4 actions) mappe environ 35 champs depuis la réponse Forms vers la liste SharePoint Stagiaire. Les champs incluent : identité, contact, urgence, curatelle (nouveaux IDs), assurance invalidité, conseiller AI (anciens IDs réassignés), stage, uniformes.')

title('Conversions de type importantes', 3)
const convWidths = [160, 335]
tableHeader(['Champ', 'Conversion'], convWidths)
tableRow(['DejaStage', 'Texte Forms vers Booléen SP : if(equals(..., \'Oui\'), true, false)'], convWidths)
tableRow(['Curatelle', 'Texte Forms vers Booléen SP : if(equals(..., \'Oui\'), true, false)'], convWidths, true)
tableRow(['AssuranceInvalidite', 'Choix texte vers Choix SP avec /Value'], convWidths)
tableRow(['Secteur', 'Texte directement (PAS choix SP, pas de /Value)'], convWidths, true)
tableRow(['Etablissement', 'replace(\'+\', \' \') pour corriger l\'encodage Forms URL'], convWidths)
tableRow(['Reseau', '3 replace() imbriqués : Forms ["a","b"] vers SP [{"Value":"a"},{"Value":"b"}]'], convWidths, true)

// --- FLUX 2 ---
title('5.2 Flux 2 — Réception des pièces jointes', 2)
bold('FLOW-GUID : b865cf6d-dfdf-4b46-8df0-5d0e82baed17')
doc.moveDown(0.2)
bold('Déclencheur : Arrivée d\'un email contenant "AVS-" dans l\'objet + pièces jointes')
doc.moveDown(0.5)

para('Ce flux traite les pièces jointes envoyées par email en réponse au mail automatique du Flux 1. Il crée l\'arborescence de dossiers du stagiaire dans SharePoint et y range les documents.')

title('Logique de traitement', 3)
numberedItem(1, 'Extraction du DemandeID depuis l\'objet du mail (parse "D\u00b0{ID}" avec split)')
numberedItem(2, 'Requête HTTP Demande — récupérer StagiaireIDId (lookup)')
numberedItem(3, 'Requête HTTP Stagiaire — récupérer Nom, Prénom, AVS complet')
numberedItem(4, 'Vérifier si le dossier AVS existe dans Stagiaires Doc (code 404 = n\'existe pas)')
numberedItem(5, 'Si nouveau : créer dossier AVS, copier modèle, renommer fichiers (intérieur vers extérieur)')
numberedItem(6, 'Boucle sur chaque pièce jointe — upload dans /1. Administratif/')
numberedItem(7, 'MAJ Statut Demande — "Documents réceptionnés" + DateReceptionDocs = utcNow()')

doc.moveDown(0.3)
infoBox('Renommage des fichiers', 'Le renommage se fait de l\'intérieur vers l\'extérieur : d\'abord les fichiers (.docx), puis le dossier parent. Utilise l\'API MoveTo avec flags=1 (overwrite).')

// --- FLUX 3 ---
title('5.3 Flux 3 — Génération du planning', 2)
bold('FLOW-GUID : e03bb264-eb3c-4ebd-bd63-87a78c083b68')
doc.moveDown(0.2)
bold('Déclencheur : Polling toutes les 3 minutes sur la liste Demande')
doc.moveDown(0.5)

para('Ce flux génère le fichier planning.json qui alimente le site web. Il lit les créneaux et les demandes, calcule les places utilisées, et pousse le résultat sur GitHub via l\'API Contents.')

title('Logique de traitement', 3)
numberedItem(1, 'GET_Creneaux : récupérer tous les créneaux depuis SharePoint')
numberedItem(2, 'GET_Demandes : récupérer toutes les demandes (Statut différent de Annulé)')
numberedItem(3, 'Boucle sur chaque créneau : filtrer les demandes liées, compter les places utilisées')
numberedItem(4, 'Construire le tableau JSON avec les données de chaque créneau')
numberedItem(5, 'Compose_JSON : assembler le JSON final avec métadonnées (lastUpdated, URLs, config)')
numberedItem(6, 'GET_SHA_GitHub : récupérer le SHA actuel du fichier sur GitHub')
numberedItem(7, 'Push_GitHub : mettre à jour planning.json via l\'API Contents (PUT avec SHA)')

doc.moveDown(0.3)
warningBox('Les dates sont converties avec convertFromUtc(..., \'Romance Standard Time\') avant formatDateTime pour obtenir les dates en heure locale (CET/CEST).')

title('Format de planning.json', 3)
para('Le fichier est au format plat (un tableau de créneaux), transformé en hiérarchie côté frontend :')
const jsonWidths = [140, 355]
tableHeader(['Champ', 'Description'], jsonWidths)
tableRow(['lastUpdated', 'Horodatage ISO de la dernière génération'], jsonWidths)
tableRow(['formsUrl', 'URL du formulaire d\'inscription stagiaire'], jsonWidths, true)
tableRow(['formsUrlNouvelEtablissement', 'URL du formulaire pour proposer un établissement'], jsonWidths)
tableRow(['formsUrlNouveauSecteur', 'URL du formulaire "Gestion des créneaux"'], jsonWidths, true)
tableRow(['config', 'Descriptions et icônes des établissements (hardcodé)'], jsonWidths)
tableRow(['creneaux[]', 'Tableau : {établissement, secteur, dateDebut, dateFin, placesTotal, placesUtilisées}'], jsonWidths, true)

// --- FLUX 4 ---
title('5.4 Flux 4 — Gestion des créneaux', 2)
bold('FLOW-GUID : f4c82a19-7d5e-4b3a-9f1c-8e6d2a0b5c47')
doc.moveDown(0.2)
bold('Déclencheur : Soumission du formulaire "Gestion des créneaux"')
doc.moveDown(0.5)

para('Ce flux permet aux référents cadres de proposer de nouveaux créneaux de disponibilité. L\'accès est protégé par un mot de passe vérifié côté flux.')

title('Logique de traitement', 3)
numberedItem(1, 'Obtenir la réponse du formulaire "Gestion des créneaux"')
numberedItem(2, 'Vérifier le mot de passe (soumission ignorée si incorrect)')
numberedItem(3, 'Créer un item dans la liste SharePoint Creneaux')
numberedItem(4, 'Champs : Etablissement, Secteur, DateDebut, DateFin, PlacesTotal (int()), TypeCreneau, NomModule')
numberedItem(5, 'replace(\'+\', \' \') sur Etablissement et Secteur pour corriger l\'encodage URL')

doc.moveDown(0.3)
infoBox('Pipeline complet', 'Forms > Flux 4 > Creneaux SP > Flux 3 (polling 3 min) > planning.json > GitHub > Site web mis à jour automatiquement')

// ============================================================
// 6. FRONTEND REACT — SITE WEB
// ============================================================
doc.addPage()
title('6. Frontend React — Site web')

para('Le site est une application React monopage (SPA) hébergée sur GitHub Pages. Il lit planning.json au démarrage et affiche les disponibilités de stage.')

title('6.1 Architecture des composants', 2)

const compFileWidths = [160, 335]
tableHeader(['Fichier', 'Rôle'], compFileWidths)
tableRow(['App.jsx', 'Router principal : gère 4 états de navigation (home/établissement/calendar/week)'], compFileWidths)
tableRow(['Header.jsx', 'En-tête avec logo et nom de la fondation'], compFileWidths, true)
tableRow(['Breadcrumb.jsx', 'Fil d\'Ariane cliquable pour la navigation'], compFileWidths)
tableRow(['HomePage.jsx', 'Écran 1 : Liste des établissements avec places disponibles'], compFileWidths, true)
tableRow(['EtablissementPage.jsx', 'Écran 2 : Liste des secteurs avec barres de progression'], compFileWidths)
tableRow(['SecteurCalendar.jsx', 'Écran 3 : Calendrier mensuel avec code couleur par semaine'], compFileWidths, true)
tableRow(['WeekDetail.jsx', 'Écran 4 : Détail d\'une semaine + bouton inscription (multi-créneaux)'], compFileWidths)
tableRow(['InfoBulle.jsx', 'Tooltip hover/clic pour expliquer les actions référent cadre'], compFileWidths, true)
tableRow(['helpers.js', 'Fonctions utilitaires : couleurs, dates, agrégation, transformation JSON, URL Forms'], compFileWidths)

title('6.2 Code couleur des disponibilités', 2)

const colorWidths = [100, 120, 275]
tableHeader(['Couleur', 'Statut', 'Condition'], colorWidths)
tableRow(['Vert (cb-green)', 'Disponible', '> 50% des places disponibles'], colorWidths)
tableRow(['Orange (cb-orange)', 'Presque complet', '1-50% des places disponibles'], colorWidths, true)
tableRow(['Rouge (cb-red)', 'Complet', '0 places disponibles'], colorWidths)
tableRow(['Gris (cb-gray)', 'Pas de données', 'Aucun créneau cette semaine'], colorWidths, true)

title('6.3 Fonctions utilitaires clés', 2)

const fnWidths = [180, 315]
tableHeader(['Fonction', 'Description'], fnWidths)
tableRow(['transformPlanningData()', 'Convertit le JSON plat (PA) en hiérarchie (React). Rétrocompatible.'], fnWidths)
tableRow(['aggregateWeekCreneaux()', 'Agrège les créneaux chevauchants par semaine ISO. Déduplique par startDate+endDate.'], fnWidths, true)
tableRow(['buildFormsUrl()', 'Construit l\'URL pré-remplie pour le formulaire d\'inscription (vrais IDs Forms).'], fnWidths)
tableRow(['computeStatus()', 'Calcule le statut couleur (>50% = vert, 1-50% = orange, 0 = rouge).'], fnWidths, true)
tableRow(['getISOWeekNumber()', 'Numéro de semaine ISO avec gestion du chevauchement d\'année.'], fnWidths)
tableRow(['getUniqueCreneaux()', 'Déduplique les créneaux pour le comptage sur la page Établissement.'], fnWidths, true)

title('6.4 Boutons "Ajouter" pour référents cadres', 2)
para('Chaque écran offre un bouton discret (bordure pointillée + InfoBulle) permettant aux référents cadres de proposer des ajouts :')

const addWidths = [140, 355]
tableHeader(['Écran', 'Action / URL'], addWidths)
tableRow(['HomePage', '"Ajouter un établissement" vers formsUrlNouvelEtablissement'], addWidths)
tableRow(['EtablissementPage', '"Ajouter un secteur" vers formsUrlNouveauSecteur (pré-remplit établissement)'], addWidths, true)
tableRow(['SecteurCalendar', '"Ajouter un créneau" vers formsUrlNouveauSecteur (pré-remplit établissement + secteur)'], addWidths)

title('6.5 Gestion des créneaux chevauchants', 2)
para('Quand plusieurs créneaux couvrent la même semaine dans un secteur, le système :')
bullet('Agrège les créneaux via aggregateWeekCreneaux() (index par "année-numSemaine")')
bullet('Affiche le nombre de créneaux dans le calendrier : "S13 (2)"')
bullet('Détaille chaque créneau individuellement sur l\'écran WeekDetail avec sa propre barre de progression et son bouton d\'inscription')
bullet('Rétrocompatibilité : si week.creneaux n\'existe pas, le système traite week comme un créneau unique')

// ============================================================
// 7. MICROSOFT FORMS
// ============================================================
doc.addPage()
title('7. Microsoft Forms')

title('7.1 Formulaire d\'inscription stagiaire', 2)
bold('ID : xHCDs-bUs02BAzAeleTkDMe8lTmeXlRCg3CpMGKKIxdUQllQODVJS0wwV01RM0cwSk1RSTlHUEVPVi4u')
doc.moveDown(0.3)
para('Formulaire principal de 43 questions. AllowPrefill activé pour le pré-remplissage depuis le calendrier. Sections : Préliminaire, Référent (conditionnel), Stagiaire, Urgence, Stage/Planning, Assurance Invalidité, Curatelle, Uniforme, Admin.')

title('Champs pré-remplis depuis le calendrier', 3)
const prefillWidths = [180, 315]
tableHeader(['Champ', 'ID Forms'], prefillWidths)
tableRow(['Établissement souhaité', 'r2876f0c952f44887946296b4c95367a3'], prefillWidths)
tableRow(['Date de début souhaitée', 'r50efe78018854247bf6e734db7188d70'], prefillWidths, true)

title('7.2 Formulaire "Gestion des créneaux"', 2)
bold('ID : xHCDs-bUs02BAzAeleTkDMe8lTmeXlRCg3CpMGKKIxdUMVIwUkI1MlNIMzA0SlhKQ0tXV0RKSUNOQi4u')
doc.moveDown(0.3)
para('Formulaire pour les référents cadres. Protégé par mot de passe (vérifié côté Flux 4). AllowPrefill activé.')

const formsWidths = [180, 315]
tableHeader(['Champ', 'ID Forms'], formsWidths)
tableRow(['Établissement', 'rb1c6311a61044eb184fa3270fd065e32'], formsWidths)
tableRow(['Secteur', 'r69f254172ecd4baa9c92b2ef2d86f48c'], formsWidths, true)
tableRow(['Description', 'r43c3849ff3284246a7c68d571f7ca3df'], formsWidths)
tableRow(['Date de début', 'reee4e33cc677406885a947061d7d9cde'], formsWidths, true)
tableRow(['Date de fin', 'r77ae6366339446f39c90be5aa93b3a71'], formsWidths)
tableRow(['Nombre de places', 'r673220bf96894b43b6cd98c623c6d0fe'], formsWidths, true)
tableRow(['Type de créneau', 'rd79308a2436b46d7be9921d3eed3ca79 (Stage / Module métier)'], formsWidths)
tableRow(['Nom du module', 'rc347ff44177743a8b9561f6d6f9eed2c'], formsWidths, true)
tableRow(['Mot de passe', 'rce9b9c542c0d455a8c01298b063332fe'], formsWidths)

// ============================================================
// 8. PIPELINE DE DÉPLOIEMENT
// ============================================================
doc.addPage()
title('8. Pipeline de déploiement')

title('8.1 Déploiement du site web', 2)
para('Le site est déployé automatiquement sur GitHub Pages à chaque push sur la branche main :')

numberedItem(1, 'Le développeur pousse le code sur github.com/rochat-dev/clair-bois-calendrier')
numberedItem(2, 'GitHub Actions exécute le build (npm run build) et déploie le contenu de dist/')
numberedItem(3, 'Le site est accessible à l\'URL GitHub Pages configurée')
doc.moveDown(0.3)
para('Base URL configurée : /clair-bois-calendrier/')

title('8.2 Mise à jour automatique des données', 2)
para('Le fichier planning.json est mis à jour automatiquement par le Flux 3 :')

numberedItem(1, 'Le Flux 3 détecte un changement dans la liste Demande (polling 3 min)')
numberedItem(2, 'Il recalcule les disponibilités et construit le JSON')
numberedItem(3, 'Il récupère le SHA actuel du fichier sur GitHub (GET /contents/public/planning.json)')
numberedItem(4, 'Il pousse la nouvelle version via l\'API Contents (PUT avec SHA)')
numberedItem(5, 'GitHub Pages redéploie automatiquement le site')

doc.moveDown(0.3)
warningBox('Power Automate pousse régulièrement planning.json. Avant chaque push de code, il faut faire git pull --rebase pour éviter les conflits.')

title('8.3 Procédure d\'import des flux', 2)
para('Pour importer un flux modifié dans Power Automate :')

numberedItem(1, 'Power Automate — Mes flux — Importer — Package d\'importation (hérité)')
numberedItem(2, 'Uploader le fichier .zip du flux')
numberedItem(3, 'Pour chaque connecteur rouge — cliquer le crayon — sélectionner la connexion stagiaire.dfip@clairbois.ch')
numberedItem(4, 'Pour le flux — choisir "Mettre à jour" — sélectionner le flux existant')
numberedItem(5, 'Cliquer Importer')

// ============================================================
// 9. PROCÉDURES DE MAINTENANCE
// ============================================================
doc.addPage()
title('9. Procédures de maintenance')

title('9.1 Ajouter un nouvel établissement', 2)
numberedItem(1, 'Ajouter un ou plusieurs créneaux dans la liste SharePoint "Creneaux" avec le nom du nouvel établissement')
numberedItem(2, 'Ajouter la configuration (description, icône) dans la section "config" du Flux 3 (ou dans le code frontend en attendant)')
numberedItem(3, 'Le Flux 3 mettra à jour planning.json automatiquement')

title('9.2 Ajouter un créneau de disponibilité', 2)
para('Deux méthodes possibles :')
bullet('Via le formulaire "Gestion des créneaux" sur le site (bouton "Ajouter un créneau" — protégé par mot de passe)')
bullet('Directement dans la liste SharePoint "Creneaux" (pour les administrateurs)')
para('Dans les deux cas, le Flux 3 mettra à jour le site automatiquement dans les 3 minutes.')

title('9.3 Modifier le formulaire d\'inscription', 2)
warningBox('Toute modification du formulaire Forms nécessite de mettre à jour le mapping dans le Flux 1 (definition.json). Les IDs Forms changent si un champ est supprimé/recréé.')

para('Procédure pour récupérer les nouveaux IDs Forms :')
numberedItem(1, 'Ouvrir le formulaire en mode édition dans Microsoft Forms')
numberedItem(2, 'Ouvrir les DevTools du navigateur (F12) — onglet Network')
numberedItem(3, 'Recharger la page')
numberedItem(4, 'Chercher la requête contenant "forms(xHCDs...)" dans le réseau')
numberedItem(5, 'Copier la réponse JSON — elle contient tous les IDs des champs')

title('9.4 Surveiller les flux', 2)
para('Les flux peuvent échouer silencieusement. Vérifier régulièrement :')
bullet('Power Automate — Mes flux — Historique d\'exécution de chaque flux')
bullet('Les emails de notification d\'erreur (si configurés)')
bullet('La date "Dernière mise à jour" sur le site web (si elle est ancienne, le Flux 3 peut être en erreur)')

title('9.5 Renouvellement des connexions', 2)
para('Les connexions Power Automate (SharePoint, Forms, Office 365) peuvent expirer. Si un flux échoue avec une erreur d\'authentification :')
numberedItem(1, 'Aller dans Power Automate — Connexions')
numberedItem(2, 'Vérifier l\'état de chaque connexion sous stagiaire.dfip@clairbois.ch')
numberedItem(3, 'Si une connexion est en erreur — la supprimer et en recréer une avec le même compte')
numberedItem(4, 'Mettre à jour les flux pour utiliser la nouvelle connexion')

// ============================================================
// 10. CONTACTS ET ACCÈS
// ============================================================
doc.addPage()
title('10. Contacts et accès')

title('10.1 Comptes et accès', 2)

const accessWidths = [150, 345]
tableHeader(['Ressource', 'Accès'], accessWidths)
tableRow(['Power Automate', 'Compte : stagiaire.dfip@clairbois.ch'], accessWidths)
tableRow(['SharePoint', 'Site : fondationclairbois.sharepoint.com/sites/DFIP-SiteEquipe'], accessWidths, true)
tableRow(['GitHub', 'Repository : rochat-dev/clair-bois-calendrier'], accessWidths)
tableRow(['Email flux', 'stagiaire.dfip@clairbois.ch (réception pièces jointes)'], accessWidths, true)

title('10.2 IDs techniques critiques', 2)

const idsWidths = [200, 295]
tableHeader(['Élément', 'GUID / ID'], idsWidths)
tableRow(['Tenant Microsoft', 'b38370c4-d4e6-4db3-8103-301e95e4e40c'], idsWidths)
tableRow(['Flux 1 (Inscriptions)', '8affe7f1-3296-48a2-a2cb-1de6832d8997'], idsWidths, true)
tableRow(['Flux 2 (Documents)', 'b865cf6d-dfdf-4b46-8df0-5d0e82baed17'], idsWidths)
tableRow(['Flux 3 (Planning)', 'e03bb264-eb3c-4ebd-bd63-87a78c083b68'], idsWidths, true)
tableRow(['Flux 4 (Créneaux)', 'f4c82a19-7d5e-4b3a-9f1c-8e6d2a0b5c47'], idsWidths)
tableRow(['Liste Stagiaire', 'bf357221-7e74-4905-9b58-b4ea22f79de0'], idsWidths, true)
tableRow(['Liste Demande', '9616ee1d-dd0b-44fd-a1c4-34187ebaa9f8'], idsWidths)
tableRow(['Liste Referent', '7a31b912-99af-4415-bfc9-f2ae1cb19c00'], idsWidths, true)
tableRow(['Liste Creneaux', '3e2deb27-f496-410f-be74-281eb2b0c079'], idsWidths)
tableRow(['Connexion SharePoint', 'c1e11ff6-1671-4f41-a2e2-6986289998fd'], idsWidths, true)
tableRow(['Connexion Forms', 'bdeb5556-a627-4e30-bc7c-fd0915978877'], idsWidths)
tableRow(['Connexion Office 365', '15b1713b-141c-4abf-b406-9781ffafdbdb'], idsWidths, true)

// ============================================================
// 11. GLOSSAIRE
// ============================================================
doc.addPage()
title('11. Glossaire')

const glossWidths = [150, 345]
tableHeader(['Terme', 'Définition'], glossWidths)
tableRow(['Référent externe', 'Personne (école, assurance, AI) qui consulte le calendrier et inscrit un stagiaire'], glossWidths)
tableRow(['Référent cadre', 'Responsable de secteur dans un établissement, peut gérer les créneaux de disponibilité'], glossWidths, true)
tableRow(['Créneau', 'Période de disponibilité de stage dans un secteur (dateDebut à dateFin, nombre de places)'], glossWidths)
tableRow(['Demande', 'Inscription de stage d\'un stagiaire pour un créneau spécifique'], glossWidths, true)
tableRow(['planning.json', 'Fichier JSON généré automatiquement contenant les disponibilités (publié sur GitHub)'], glossWidths)
tableRow(['AllowPrefill', 'Option Forms permettant le pré-remplissage des champs via les paramètres URL'], glossWidths, true)
tableRow(['Polling', 'Vérification périodique (ici toutes les 3 min) des changements SharePoint par Power Automate'], glossWidths)
tableRow(['Lookup', 'Colonne SharePoint faisant référence à un item d\'une autre liste (relation)'], glossWidths, true)
tableRow(['DFIP', 'Direction Formation et Insertion Professionnelle (service de Clair-Bois)'], glossWidths)
tableRow(['SPA', 'Single Page Application — application web monopage (React)'], glossWidths, true)
tableRow(['SHA', 'Hash du fichier sur GitHub, nécessaire pour les mises à jour via l\'API Contents'], glossWidths)
tableRow(['ISO Week', 'Numéro de semaine selon la norme ISO 8601 (semaine commençant le lundi)'], glossWidths, true)

doc.moveDown(2)

// Footer
doc.moveTo(LEFT, doc.y).lineTo(LEFT + PAGE_WIDTH, doc.y).strokeColor(BLUE).lineWidth(1).stroke()
doc.moveDown(0.5)
doc.font('Helvetica').fontSize(9).fillColor(GRAY)
doc.text('Document de passation DSI — Fondation Clair-Bois — Mars 2026', LEFT, doc.y, { width: PAGE_WIDTH, align: 'center' })
doc.text('Ce document est confidentiel et destiné exclusivement au service informatique de la Fondation.', LEFT, doc.y, { width: PAGE_WIDTH, align: 'center' })

// Pas de numéros de page (évite les pages blanches fantômes de pdfkit bufferPages)

doc.end()

stream.on('finish', () => {
  console.log('PDF généré : Passation_DSI_ClairBois.pdf')
})
