/**
 * generate-ocas-samples.js — Génère 5 exemplaires remplis du formulaire OCAS V4
 * pour l'entraînement du modèle AI Builder.
 *
 * Usage : node generate-ocas-samples.js
 * Sortie : backend/ocas-samples/OCAS_Sample_N_Nom_Prenom.docx
 */

const AdmZip = require('adm-zip')
const fs     = require('fs')
const path   = require('path')

const SOURCE = path.join(__dirname, '../docs/Formulaire de demande GLOBAL_OCAS_fillin en dur_V4.docx')
const OUTDIR = path.join(__dirname, 'ocas-samples')

if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR)

// ── 5 fausses personnes (données fictives, aucun lien avec la réalité) ──
const SAMPLES = [
  {
    NAVSAS:    '756.1234.5678.90',
    NOMAS:     'Favre',
    PRENAS:    'Bernard',
    DANAAS:    '12.03.1985',
    TITRAS:    'M.',
    RUE_NO_AS: 'Rue du Lac 14',
    NPAAS:     '1201',
    LOCAAS:    'Genève',
    NTELAS:    '+41 79 123 45 67',
    MAILAS:    'bernard.favre@example.ch',
    NTELRE:    '+41 22 345 67 89',
    EMAIRE:    'conseiller1@ocas-ge.ch',
  },
  {
    NAVSAS:    '756.2345.6789.01',
    NOMAS:     'Dupont',
    PRENAS:    'Marie',
    DANAAS:    '27.08.1992',
    TITRAS:    'Mme',
    RUE_NO_AS: 'Avenue de la Gare 5',
    NPAAS:     '1003',
    LOCAAS:    'Lausanne',
    NTELAS:    '+41 78 234 56 78',
    MAILAS:    'marie.dupont@example.ch',
    NTELRE:    '+41 21 456 78 90',
    EMAIRE:    'conseiller2@ocas-vd.ch',
  },
  {
    NAVSAS:    '756.3456.7890.12',
    NOMAS:     'Müller',
    PRENAS:    'Lucas',
    DANAAS:    '05.11.1988',
    TITRAS:    'M.',
    RUE_NO_AS: 'Chemin des Fleurs 8',
    NPAAS:     '1205',
    LOCAAS:    'Genève',
    NTELAS:    '+41 76 345 67 89',
    MAILAS:    'lucas.muller@example.ch',
    NTELRE:    '+41 22 567 89 01',
    EMAIRE:    'conseiller3@ocas-ge.ch',
  },
  {
    NAVSAS:    '756.4567.8901.23',
    NOMAS:     'Rochat',
    PRENAS:    'Sophie',
    DANAAS:    '19.06.1995',
    TITRAS:    'Mme',
    RUE_NO_AS: 'Route de Frontenex 22',
    NPAAS:     '1207',
    LOCAAS:    'Genève',
    NTELAS:    '+41 79 456 78 90',
    MAILAS:    'sophie.rochat@example.ch',
    NTELRE:    '+41 22 678 90 12',
    EMAIRE:    'conseillere4@ocas-ge.ch',
  },
  {
    NAVSAS:    '756.5678.9012.34',
    NOMAS:     'Girard',
    PRENAS:    'Thomas',
    DANAAS:    '30.01.1979',
    TITRAS:    'M.',
    RUE_NO_AS: 'Rue de Rive 3',
    NPAAS:     '1204',
    LOCAAS:    'Genève',
    NTELAS:    '+41 77 567 89 01',
    MAILAS:    'thomas.girard@example.ch',
    NTELRE:    '+41 22 789 01 23',
    EMAIRE:    'conseiller5@ocas-ge.ch',
  },
]

// Remplace un code OCAS simple par sa valeur
function rep(xml, code, val) {
  return xml.split(`<w:t>${code}</w:t>`).join(`<w:t>${val}</w:t>`)
}

// Remplace un champ FILLIN (begin/instrText/separate/default/end) par un run simple
function replaceFillin(xml, fillCode, val) {
  const instrMarker = `FILLIN  ${fillCode}`
  const instrIdx = xml.indexOf(instrMarker)
  if (instrIdx === -1) {
    console.warn(`  ⚠️  FILLIN ${fillCode} introuvable`)
    return xml
  }
  // Remonte jusqu'au run contenant <w:fldChar w:fldCharType="begin"/>
  const beginTag = '<w:fldChar w:fldCharType="begin"/>'
  const beginTagIdx = xml.lastIndexOf(beginTag, instrIdx)
  const beginRunStart = xml.lastIndexOf('<w:r ', beginTagIdx)

  // Avance jusqu'à la fin du run contenant <w:fldChar w:fldCharType="end"/>
  const endTag = '<w:fldChar w:fldCharType="end"/>'
  const endTagIdx = xml.indexOf(endTag, instrIdx)
  const endRunEnd = xml.indexOf('</w:r>', endTagIdx) + 6

  const replacement = `<w:r><w:rPr><w:rFonts w:eastAsia="Arial" w:cstheme="minorHAnsi"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:highlight w:val="yellow"/></w:rPr><w:t>${val}</w:t></w:r>`
  return xml.substring(0, beginRunStart) + replacement + xml.substring(endRunEnd)
}

SAMPLES.forEach((data, i) => {
  const zip = new AdmZip(SOURCE)
  let xml = zip.readAsText('word/document.xml')

  xml = rep(xml, 'NAVSAS',    data.NAVSAS)
  xml = rep(xml, 'NOMAS',     data.NOMAS)
  xml = rep(xml, 'PRENAS',    data.PRENAS)
  xml = rep(xml, 'DANAAS',    data.DANAAS)
  xml = rep(xml, 'TITRAS',    data.TITRAS)
  xml = rep(xml, 'RUE_NO_AS', data.RUE_NO_AS)
  xml = rep(xml, 'NPAAS',     data.NPAAS)
  xml = rep(xml, 'LOCAAS',    data.LOCAAS)
  xml = rep(xml, 'NTELAS',    data.NTELAS)
  xml = rep(xml, 'NTELRE',    data.NTELRE)
  xml = rep(xml, 'EMAIRE',    data.EMAIRE)

  // MAILAS est un champ FILLIN — nécessite un remplacement structurel
  xml = replaceFillin(xml, 'MAILAS', data.MAILAS)

  zip.updateFile('word/document.xml', Buffer.from(xml, 'utf8'))

  const outPath = path.join(OUTDIR, `OCAS_Sample_${i + 1}_${data.NOMAS}_${data.PRENAS}.docx`)
  zip.writeZip(outPath)
  console.log(`✅ ${path.basename(outPath)}`)
})

console.log(`\n📁 Fichiers .docx dans : ${OUTDIR}`)
console.log('→ Convertir en PDF avec : libreoffice --headless --convert-to pdf --outdir ocas-samples ocas-samples/*.docx')
