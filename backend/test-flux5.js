/**
 * test-flux5.js — Tests complets Flux 5 : tous les chemins
 *
 * Couvre toutes les branches de Flux 5 :
 *   AVS nouveau/existant × stages/modules × moi/autre × curatelle+AI
 *
 * AVS de test (à supprimer après validation) :
 *   756.1111.1111.11 → stage-moi-nouveau + stage-moi-existant
 *   756.2222.2222.22 → stage-autre-nouveau + stage-autre-existant
 *   756.3333.3333.33 → stage-curatelle-ai (champs optionnels)
 *   756.4444.4444.44 → modules-moi-nouveau + modules-moi-existant
 *   756.5555.5555.55 → modules-autre-nouveau + modules-autre-existant
 *
 * Usage :
 *   node test-flux5.js              → tous les tests (9 cas, dans l'ordre)
 *   node test-flux5.js <clé>        → un test précis
 *   node test-flux5.js stages       → groupe : tous les tests stages (5 cas)
 *   node test-flux5.js modules      → groupe : tous les tests modules (4 cas)
 *
 * Important : les tests "existant" utilisent le même AVS que le "nouveau"
 * qui précède — ils doivent tourner après (l'ordre par défaut le garantit).
 */

const fs    = require('fs')
const path  = require('path')
const https = require('https')
const http  = require('http')
const url   = require('url')

// ── Lire l'URL PA depuis frontend/.env.local ──
function readPaUrl() {
  const envPath = path.join(__dirname, '../frontend/.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ frontend/.env.local introuvable')
    process.exit(1)
  }
  const content = fs.readFileSync(envPath, 'utf8')
  const match = content.match(/VITE_PA_HTTP_URL=(.+)/)
  if (!match) {
    console.error('❌ VITE_PA_HTTP_URL absent dans .env.local')
    process.exit(1)
  }
  return match[1].trim()
}

// ── POST JSON ──
function postJson(paUrl, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload)
    const parsed = new url.URL(paUrl)
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }
    const lib = parsed.protocol === 'https:' ? https : http
    const req = lib.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => resolve({ status: res.statusCode, body: data }))
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ── Données de base communes ──
const stagiaireBase = {
  nom: 'Dupont',
  prenom: 'Marie',
  sexe: 'Féminin',
  date_naissance: '2000-06-15',
  tel: '+41799999999',
  email: 'rochat.vdge@gmail.com',
  adresse: '1 Rue du Test',
  npa: '1200 Genève',
  formation: 'Non',
  urgence_nom: 'ContactNom',
  urgence_prenom: 'ContactPrenom',
  urgence_lien: 'Mère',
  urgence_tel: '+41781111111',
  inscrit_ai: 'Non',
  sous_curatelle: 'Non',
  parcours_scolaire: 'Ecole obligatoire terminée',
  limitations: 'n/a',
  deja_tests: 'Non',
  pointure: '42',
  taille_tshirt: 'M',
  taille_pantalon: '40',
  dateEnvoi: new Date().toISOString(),
}

const referentBase = {
  referent_partenaire: 'OCAS',
  referent_fonction: 'Conseiller.ère en Insertion',
  referent_nom: 'Martin',
  referent_prenom: 'Jean',
  referent_tel: '+41788888888',
  referent_email: 'rochat.vdge@gmail.com',
}

const stageBase = {
  secteur: 'Cuisine',
  dateDebut: '2026-06-02',
  dateFin: '2026-06-06',
  objectif_stage: 'Découvrir le métier de cuisinier',
  deja_stages_secteur: 'Non',
}

const modulesUn = [
  { nom: 'Tourbillon Découverte', site: 'Blanchisserie Tourbillon', semaine: 'S10', dateDebut: '2026-06-02', dateFin: '2026-06-06' },
]

const modulesTrois = [
  { nom: 'Tourbillon Découverte', site: 'Blanchisserie Tourbillon',   semaine: 'S10', dateDebut: '2026-06-02', dateFin: '2026-06-06' },
  { nom: 'Cuisine atelier',        site: 'Ateliers de Pinchat',        semaine: 'S11', dateDebut: '2026-06-09', dateFin: '2026-06-13' },
  { nom: 'Graphisme découverte',   site: 'Ateliers des Minoteries',    semaine: 'S12', dateDebut: '2026-06-16', dateFin: '2026-06-20' },
]

// ── Définition des 9 cas de test ──
const TESTS = {

  // ────────────────────────────────────────────────────────────
  // STAGES
  // ────────────────────────────────────────────────────────────

  'stage-moi-nouveau': {
    label: 'Stage — moi-même — nouveau stagiaire (branche FAUX/stages/moi)',
    groupe: 'stages',
    payload: {
      ...stagiaireBase,
      avs: '756.1111.1111.11',
      ...stageBase,
      cheminKey: 'stages-moi-non',
      parcours: 'stages',
      pourQui: 'moi',
      dejaInscrit: false,
    },
  },

  'stage-moi-existant': {
    label: 'Stage — moi-même — stagiaire existant MAJ (branche VRAI/stages/moi)',
    groupe: 'stages',
    note: 'Dépend de stage-moi-nouveau (même AVS)',
    payload: {
      ...stagiaireBase,
      avs: '756.1111.1111.11',
      prenom: 'Marie-Mise-A-Jour',
      secteur: 'Pâtisserie-boulangerie',
      dateDebut: '2026-07-07',
      dateFin: '2026-07-11',
      objectif_stage: 'Stage de retour Clair-Bois',
      deja_stages_secteur: 'Oui',
      cheminKey: 'stages-moi-oui',
      parcours: 'stages',
      pourQui: 'moi',
      dejaInscrit: true,
    },
  },

  'stage-autre-nouveau': {
    label: 'Stage — référent — nouveau stagiaire (branche FAUX/stages/autre)',
    groupe: 'stages',
    payload: {
      ...stagiaireBase,
      avs: '756.2222.2222.22',
      nom: 'Favre',
      prenom: 'Lucas',
      sexe: 'Masculin',
      email: 'rochat.vdge@gmail.com',
      ...referentBase,
      ...stageBase,
      secteur: 'Restauration',
      cheminKey: 'stages-autre-non',
      parcours: 'stages',
      pourQui: 'autre',
      dejaInscrit: false,
    },
  },

  'stage-autre-existant': {
    label: 'Stage — référent — stagiaire existant MAJ (branche VRAI/stages/autre)',
    groupe: 'stages',
    note: 'Dépend de stage-autre-nouveau (même AVS)',
    payload: {
      ...stagiaireBase,
      avs: '756.2222.2222.22',
      nom: 'Favre',
      prenom: 'Lucas-MAJ',
      sexe: 'Masculin',
      email: 'rochat.vdge@gmail.com',
      ...referentBase,
      referent_nom: 'Martin-MAJ',
      ...stageBase,
      secteur: 'Graphisme',
      dateDebut: '2026-08-03',
      dateFin: '2026-08-07',
      cheminKey: 'stages-autre-oui',
      parcours: 'stages',
      pourQui: 'autre',
      dejaInscrit: true,
    },
  },

  'stage-curatelle-ai': {
    label: 'Stage — moi-même — avec curatelle + AI (champs optionnels)',
    groupe: 'stages',
    payload: {
      ...stagiaireBase,
      avs: '756.3333.3333.33',
      nom: 'Bernard',
      prenom: 'Sophie',
      email: 'rochat.vdge@gmail.com',
      ...stageBase,
      secteur: 'Lingerie',
      // Assurance Invalidité
      inscrit_ai: 'Oui',
      ai_nom: 'Rossi',
      ai_prenom: 'Anna',
      ai_tel: '+41763333333',
      ai_email: 'anna.rossi@ai.ch',
      // Curatelle
      sous_curatelle: 'Oui',
      curatelle_type: 'OPAD',
      curatelle_nom: 'Muller',
      curatelle_prenom: 'Sophie',
      curatelle_tel: '+41764444444',
      curatelle_email: 'sophie.muller@opad.ch',
      cheminKey: 'stages-moi-non',
      parcours: 'stages',
      pourQui: 'moi',
      dejaInscrit: false,
    },
  },

  // ────────────────────────────────────────────────────────────
  // MODULES MÉTIERS
  // ────────────────────────────────────────────────────────────

  'modules-moi-nouveau': {
    label: 'Modules — moi-même — nouveau stagiaire — 1 module (branche FAUX/modules/moi)',
    groupe: 'modules',
    payload: {
      ...stagiaireBase,
      avs: '756.4444.4444.44',
      nom: 'Rochet',
      prenom: 'Paul',
      email: 'rochat.vdge@gmail.com',
      modules: modulesUn,
      cheminKey: 'modules-moi',
      parcours: 'modules',
      pourQui: 'moi',
    },
  },

  'modules-moi-existant': {
    label: 'Modules — moi-même — stagiaire existant — 3 modules (branche VRAI/modules/moi)',
    groupe: 'modules',
    note: 'Dépend de modules-moi-nouveau (même AVS)',
    payload: {
      ...stagiaireBase,
      avs: '756.4444.4444.44',
      nom: 'Rochet',
      prenom: 'Paul-MAJ',
      email: 'rochat.vdge@gmail.com',
      modules: modulesTrois,
      cheminKey: 'modules-moi',
      parcours: 'modules',
      pourQui: 'moi',
    },
  },

  'modules-autre-nouveau': {
    label: 'Modules — référent — nouveau stagiaire (branche FAUX/modules/autre)',
    groupe: 'modules',
    payload: {
      ...stagiaireBase,
      avs: '756.5555.5555.55',
      nom: 'Muller',
      prenom: 'Hugo',
      email: 'rochat.vdge@gmail.com',
      ...referentBase,
      modules: modulesUn,
      cheminKey: 'modules-autre',
      parcours: 'modules',
      pourQui: 'autre',
    },
  },

  'modules-autre-existant': {
    label: 'Modules — référent — stagiaire existant — 3 modules (branche VRAI/modules/autre)',
    groupe: 'modules',
    note: 'Dépend de modules-autre-nouveau (même AVS)',
    payload: {
      ...stagiaireBase,
      avs: '756.5555.5555.55',
      nom: 'Muller',
      prenom: 'Hugo-MAJ',
      email: 'rochat.vdge@gmail.com',
      ...referentBase,
      referent_prenom: 'Jean-MAJ',
      modules: modulesTrois,
      cheminKey: 'modules-autre',
      parcours: 'modules',
      pourQui: 'autre',
    },
  },
}

// ── Runner ──
async function runTest(key, test, paUrl) {
  const note = test.note ? ` (${test.note})` : ''
  process.stdout.write(`\n▶ ${key} — ${test.label}${note}\n  → `)
  const start = Date.now()
  try {
    const { status, body } = await postJson(paUrl, test.payload)
    const elapsed = Date.now() - start
    if (status === 200) {
      console.log(`✅  HTTP ${status} (${elapsed}ms)`)
      return true
    } else {
      console.log(`❌  HTTP ${status} (${elapsed}ms)`)
      console.log('    Réponse:', body.substring(0, 200))
      return false
    }
  } catch (err) {
    console.log(`💥  Erreur réseau: ${err.message}`)
    return false
  }
}

async function main() {
  const paUrl = readPaUrl()
  console.log('🔗 URL PA :', paUrl.substring(0, 80) + '...\n')

  const filter = process.argv[2]

  let toRun
  if (!filter) {
    toRun = Object.entries(TESTS)
  } else if (filter === 'stages' || filter === 'modules') {
    toRun = Object.entries(TESTS).filter(([, t]) => t.groupe === filter)
  } else {
    toRun = Object.entries(TESTS).filter(([k]) => k === filter)
    if (toRun.length === 0) {
      console.error(`❌ Test inconnu: "${filter}"\nOptions: ${Object.keys(TESTS).join(', ')}\nGroupes: stages, modules`)
      process.exit(1)
    }
  }

  console.log(`Lancement de ${toRun.length} test(s)...\n`)

  let passed = 0
  for (const [key, test] of toRun) {
    const ok = await runTest(key, test, paUrl)
    if (ok) passed++
    if (toRun.length > 1) await new Promise(r => setTimeout(r, 2000))
  }

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`Résultat : ${passed}/${toRun.length} passés`)
  if (passed < toRun.length) process.exit(1)
}

main()
