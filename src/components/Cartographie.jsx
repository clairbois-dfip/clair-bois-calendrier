/**
 * Cartographie.jsx — Vue privee des places de stage par plan metier.
 *
 * Chaque plan metier regroupe des tables (etablissements/secteurs) avec
 * des places typees (FPRA, AFP/CFC, Stage/Mes., CEA, App.non-DFIP, MSP/MSTS).
 *
 * Systeme de couleurs statut (decisions reunions Karavia, 6 mai 2026) :
 *   Vert   = aucun stage prevu sur toute l'annee
 *   Rouge  = occupe aujourd'hui (dateDebut <= today <= dateFin)
 *   Orange = libre aujourd'hui mais reservations futures enregistrees
 *
 * Le type de place s'affiche directement dans le cercle (ex. "FPra", "Stage 1").
 * Les poles Educatif enfance-ado et adulte ont deux categories supplementaires :
 * App.non-DFIP et MSP/MSTS (apprentis/stagiaires hors DFIP, budget fondation).
 *
 * Donnees mock — seront remplacees par carto.json pousse via Power Automate
 * depuis les SP Lists "contenant" (structure) et "demandes" (occupations).
 *
 * @param {Function} props.onGoHome — retour a la page d'accueil du site
 * @param {Function} props.onLogout — deconnexion (efface le token)
 */
import { useState, useRef, useEffect } from 'react'
import {
  UtensilsCrossed,
  ChefHat,
  Shirt,
  Wrench,
  GraduationCap,
  Home,
  ChevronRight,
  ChevronLeft,
  LogOut,
} from 'lucide-react'

// ──────────────────────────────────────────────
// Types de places
// ──────────────────────────────────────────────

const TYPES_PLACE = {
  FPRA:           { label: 'FPra',         long: 'Formation pratique' },
  AFP_CFC:        { label: 'AFP/CFC',      long: 'AFP ou CFC (formateur OFPC requis)' },
  STAGE:          { label: 'Stage/Mes.',   long: "Stage ou mesure d'orientation" },
  CEA:            { label: 'CEA',          long: 'Contrat en emploi adapté' },
  APP_NON_DFIP:   { label: 'App.non-DFIP', long: 'Apprenti hors DFIP (budget fondation)' },
  STAGIAIRE_MSTS: { label: 'MSP/MSTS',    long: 'Stagiaire MSP ou MSTS' },
}

// ──────────────────────────────────────────────
// Sites Clair-Bois
// ──────────────────────────────────────────────

const SITES = {
  CBC: { nom: 'Chambesy',   couleur: '#2563eb' },
  CBL: { nom: 'Lancy',      couleur: '#7c3aed' },
  CBG: { nom: 'Gradelle',   couleur: '#059669' },
  CBM: { nom: 'Minoteries', couleur: '#d97706' },
  CBP: { nom: 'Pinchat',    couleur: '#dc2626' },
  CBT: { nom: 'Tourbillon', couleur: '#0891b2' },
}

// ──────────────────────────────────────────────
// Helpers de creation de places mock
// ──────────────────────────────────────────────

function placeLibre(type) {
  return { type, occupee: false, reservationsFutures: [] }
}

function placeOccupee(type, prenom, dateDebut, dateFin) {
  return { type, occupee: true, prenom, dateDebut, dateFin }
}

// Place libre aujourd'hui mais avec reservations futures (orange)
function placeOrange(type, reservationsFutures) {
  return { type, occupee: false, reservationsFutures }
}

// ──────────────────────────────────────────────
// Statut d'une place individuelle
// ──────────────────────────────────────────────

function statutPlace(place) {
  if (place.occupee) return 'rouge'
  if (place.reservationsFutures?.length > 0) return 'orange'
  return 'vert'
}

// ──────────────────────────────────────────────
// Mapping SP → codes internes React
// ──────────────────────────────────────────────

const TYPE_SP_TO_CODE = {
  'FPRA':         'FPRA',
  'AFP_CFC':      'AFP_CFC',
  'Stage/Mes.':   'STAGE',
  'CEA':          'CEA',
  'App.non-DFIP': 'APP_NON_DFIP',
  'MSP/MSTS':     'STAGIAIRE_MSTS',
}

const ETAB_TO_SITE = {
  Chambesy:   'CBC',
  Lancy:      'CBL',
  Gradelle:   'CBG',
  Minoteries: 'CBM',
  Pinchat:    'CBP',
  Tourbillon: 'CBT',
}

const PLAN_CONFIG = {
  'Restauration':     { id: 'restauration',    icone: UtensilsCrossed, nom: 'Restauration',                        description: 'Service en salle, restaurants et pâtisserie-boulangerie' },
  'Cuisine':          { id: 'cuisine',          icone: ChefHat,         nom: 'Cuisine',                             description: 'Brigades de cuisine des cinq établissements' },
  'Lingerie':         { id: 'lingerie',         icone: Shirt,           nom: 'Lingerie',                            description: 'Lingerie et confection' },
  'Technique':        { id: 'technique',        icone: Wrench,          nom: 'Technique',                           description: 'Exploitation, nettoyage, peinture, audio-visuel, graphisme, médiamatique, informatique, ateliers' },
  'Educatif-Enfance': { id: 'educatif-enfance', icone: GraduationCap,   nom: 'Éducatif — Pôle enfance-adolescence', description: 'Classes et groupes des écoles spécialisées' },
  'Educatif-Adulte':  { id: 'educatif-adulte',  icone: Home,            nom: 'Éducatif — Pôle adulte',              description: 'Appartements et centres de jour pour adultes' },
}

// ──────────────────────────────────────────────
// Transformation carto.json → structure React
// ──────────────────────────────────────────────

function buildPlaces(placesMax, reservations) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const places = []

  for (const [spKey, total] of Object.entries(placesMax)) {
    if (total === 0) continue
    const code = TYPE_SP_TO_CODE[spKey]
    if (!code) continue

    const resOfType = reservations.filter((r) => r.type === spKey)

    const courantes = resOfType.filter((r) => {
      const d = new Date(r.dateDebut); d.setHours(0, 0, 0, 0)
      const f = new Date(r.dateFin);   f.setHours(23, 59, 59, 999)
      return d <= today && today <= f
    })

    const futures = resOfType.filter((r) => {
      const d = new Date(r.dateDebut); d.setHours(0, 0, 0, 0)
      return d > today
    })

    let remaining = total
    for (const r of courantes) {
      if (remaining <= 0) break
      places.push(placeOccupee(code, r.prenom, r.dateDebut, r.dateFin))
      remaining--
    }
    for (const r of futures) {
      if (remaining <= 0) break
      places.push(placeOrange(code, [{ prenom: r.prenom, dateDebut: r.dateDebut, dateFin: r.dateFin }]))
      remaining--
    }
    for (let i = 0; i < remaining; i++) {
      places.push(placeLibre(code))
    }
  }

  return places
}

function cartoJsonToPlans(data) {
  if (!data?.tables) return []
  const planMap = {}

  for (const table of data.tables) {
    const cfg = PLAN_CONFIG[table.plan]
    if (!cfg) continue
    if (!planMap[table.plan]) planMap[table.plan] = { ...cfg, tables: [] }

    const site = ETAB_TO_SITE[table.etablissement]
    if (!site) continue

    planMap[table.plan].tables.push({
      site,
      secteur: table.secteur,
      commentaire: table.commentaire || '',
      places: buildPlaces(table.placesMax, table.reservations),
    })
  }

  return Object.keys(PLAN_CONFIG).filter((k) => planMap[k]).map((k) => planMap[k])
}

// ──────────────────────────────────────────────
// Helpers de calcul
// ──────────────────────────────────────────────

function toutesLesPlaces(plan) {
  return plan.tables.flatMap((t) => t.places)
}

function decompteParType(plan) {
  const initial = { FPRA: 0, AFP_CFC: 0, STAGE: 0, CEA: 0, APP_NON_DFIP: 0, STAGIAIRE_MSTS: 0 }
  return toutesLesPlaces(plan)
    .filter((p) => !p.occupee)
    .reduce((acc, p) => {
      if (p.type in acc) acc[p.type]++
      return acc
    }, initial)
}

function totalParType(plan) {
  return toutesLesPlaces(plan).reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1
    return acc
  }, {})
}

function statsGlobales(plans) {
  const toutes = plans.flatMap((p) => toutesLesPlaces(p))
  const total = toutes.length
  const libres = toutes.filter((p) => !p.occupee).length
  const occupees = total - libres
  const pourcentageOccupation = total > 0 ? Math.round((occupees / total) * 100) : 0
  return { total, libres, occupees, pourcentageOccupation }
}

function statutCouleur(plan) {
  const places = toutesLesPlaces(plan)
  if (places.length === 0) return 'gris'
  const libres = places.filter((p) => !p.occupee).length
  const ratio = libres / places.length
  if (libres === 0) return 'rouge'
  if (ratio > 0.5) return 'vert'
  return 'orange'
}

const COULEURS_BLOC = {
  vert:   { bg: 'bg-cb-green-light',  border: 'border-cb-green',  text: 'text-cb-green',  dot: 'bg-cb-green',  bandeau: 'bg-cb-green',  libelle: 'Disponibilités bonnes' },
  orange: { bg: 'bg-cb-orange-light', border: 'border-cb-orange', text: 'text-cb-orange', dot: 'bg-cb-orange', bandeau: 'bg-cb-orange', libelle: 'Quelques places' },
  rouge:  { bg: 'bg-cb-red-light',    border: 'border-cb-red',    text: 'text-cb-red',    dot: 'bg-cb-red',    bandeau: 'bg-cb-red',    libelle: 'Complet' },
  gris:   { bg: 'bg-cb-gray-light',   border: 'border-cb-gray',   text: 'text-cb-gray',   dot: 'bg-cb-gray',   bandeau: 'bg-cb-gray',   libelle: 'Sans données' },
}

function formatDateCourt(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' })
}

const COULEURS_STAT = {
  FPRA:           { num: 'text-pink-600',   bg: 'bg-pink-50',   border: 'border-pink-200' },
  AFP_CFC:        { num: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  STAGE:          { num: 'text-sky-600',    bg: 'bg-sky-50',    border: 'border-sky-200' },
  CEA:            { num: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  APP_NON_DFIP:   { num: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-200' },
  STAGIAIRE_MSTS: { num: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
}

// ──────────────────────────────────────────────
// Composant — Header sticky stats globales
// ──────────────────────────────────────────────

function statutCouleurStats(stats) {
  if (stats.total === 0) return 'gris'
  if (stats.libres === 0) return 'rouge'
  if (stats.libres / stats.total > 0.5) return 'vert'
  return 'orange'
}

function HeaderStatsGlobales({ stats }) {
  const { total, libres, occupees, pourcentageOccupation } = stats
  const couleur = COULEURS_BLOC[statutCouleurStats(stats)]

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-cb-blue leading-none">{total}</span>
          <span className="text-xs uppercase tracking-wide font-semibold text-gray-500">places</span>
        </div>

        <span className="hidden sm:inline-block w-px h-6 bg-gray-200" aria-hidden="true" />

        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold leading-none ${couleur.text}`}>{libres}</span>
          <span className="text-xs uppercase tracking-wide font-semibold text-gray-500">libres</span>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gray-500 leading-none">{occupees}</span>
          <span className="text-xs uppercase tracking-wide font-semibold text-gray-500">occupées</span>
        </div>

        <div className="flex-1 min-w-[180px] flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${couleur.bandeau}`}
              style={{ width: `${pourcentageOccupation}%` }}
              aria-hidden="true"
            />
          </div>
          <span className={`text-sm font-bold tabular-nums whitespace-nowrap ${couleur.text}`}>
            {pourcentageOccupation}%
            <span className="text-[10px] uppercase tracking-wide font-semibold text-gray-500 ml-1">
              occupation
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Composant — Carte d'un plan metier (vue 1)
// ──────────────────────────────────────────────

function CartePlan({ plan, onOuvrir, cardRef }) {
  const places = toutesLesPlaces(plan)
  const total = places.length
  const libres = places.filter((p) => !p.occupee).length
  const decompte = decompteParType(plan)
  const totaux = totalParType(plan)
  const couleur = COULEURS_BLOC[statutCouleur(plan)]

  const typesPresents = Object.keys(TYPES_PLACE).filter((t) => (totaux[t] || 0) > 0)

  const Icone = plan.icone

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={(e) => onOuvrir(plan.id, e.currentTarget)}
      className={`group relative text-left rounded-2xl border-2 ${couleur.border} bg-white
                  overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5
                  transition-all duration-300 cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-cb-blue focus:ring-offset-2
                  flex flex-col h-full`}
    >
      <div className={`h-1.5 w-full flex-shrink-0 ${couleur.bandeau}`} aria-hidden="true" />

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className={`flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300 ${couleur.text}`}
            aria-hidden="true"
          >
            <Icone size={32} strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{plan.nom}</h3>
            <p className="text-xs text-gray-500 mt-1 leading-snug">{plan.description}</p>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-bold ${couleur.text} leading-none`}>{libres}</span>
          <span className="text-sm text-gray-600">
            place{libres > 1 ? 's' : ''} libre{libres > 1 ? 's' : ''} sur {total}
          </span>
        </div>

        <div className={`grid gap-2 ${typesPresents.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {typesPresents.map((type) => {
            const stat = COULEURS_STAT[type]
            const libresType = decompte[type] || 0
            const totalType = totaux[type] || 0
            return (
              <div
                key={type}
                className={`rounded-lg border ${stat.border} ${stat.bg} px-2 py-2 text-center`}
              >
                <div className={`text-xl font-bold ${stat.num} leading-none`}>
                  {libresType}
                  <span className="text-xs text-gray-400 font-normal">/{totalType}</span>
                </div>
                <div className="text-[10px] uppercase tracking-wide font-semibold text-gray-600 mt-1">
                  {TYPES_PLACE[type].label}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">{plan.tables.length} table{plan.tables.length > 1 ? 's' : ''}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-cb-blue
                           group-hover:gap-2 transition-all">
            Ouvrir le plan
            <ChevronRight size={14} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </button>
  )
}

// ──────────────────────────────────────────────
// Composant — Place individuelle
//
// Le type s'affiche dans le cercle (ex. "FPra", "Stage 1").
// La couleur indique le statut :
//   Vert   = libre toute l'annee
//   Rouge  = occupe aujourd'hui
//   Orange = libre aujourd'hui, reservations futures
//
// Tooltip :
//   Rouge  → prenom + dates
//   Orange → liste des reservations planifiees
//   Vert   → aucun tooltip
// ──────────────────────────────────────────────

function Place({ place, label, commentaire }) {
  const [visible, setVisible] = useState(false)
  const [posBas, setPosBas] = useState(false)
  const refSiege = useRef(null)
  const statut = statutPlace(place)

  function ouvrir() {
    if (statut === 'vert') return
    if (refSiege.current) {
      const r = refSiege.current.getBoundingClientRect()
      setPosBas(r.top < 120)
    }
    setVisible(true)
  }
  function fermer() { setVisible(false) }

  const couleurFond =
    statut === 'rouge'  ? 'bg-cb-red text-white border-cb-red shadow-md' :
    statut === 'orange' ? 'bg-cb-orange text-white border-cb-orange shadow-md' :
                          'bg-cb-green text-white border-cb-green shadow-md carto-seat-pulse'

  // Taille de police selon longueur du label
  const len = label.length
  const textSize =
    len > 9 ? 'text-[7px]' :
    len > 6 ? 'text-[9px]' :
    len > 4 ? 'text-[10px]' :
              'text-xs'

  return (
    <div className="relative inline-flex flex-col items-center">
      <button
        ref={refSiege}
        type="button"
        onMouseEnter={ouvrir}
        onMouseLeave={fermer}
        onFocus={ouvrir}
        onBlur={fermer}
        className={`w-12 h-12 rounded-full border-2 ${couleurFond}
                    font-bold flex items-center justify-center text-center
                    leading-tight px-1 transition-transform duration-200
                    ${statut !== 'vert' ? 'cursor-help hover:scale-110' : 'cursor-default'}
                    focus:outline-none focus:ring-2 focus:ring-cb-blue focus:ring-offset-2`}
        title={commentaire || undefined}
        aria-label={
          (statut === 'rouge'
            ? `Place occupée par ${place.prenom}, du ${formatDateCourt(place.dateDebut)} au ${formatDateCourt(place.dateFin)}`
            : statut === 'orange'
              ? `Place libre avec ${place.reservationsFutures.length} réservation(s) prévue(s) — ${label}`
              : `Place libre — ${TYPES_PLACE[place.type].long}`
          ) + (commentaire ? ` — Note: ${commentaire}` : '')
        }
      >
        <span className={`${textSize} font-bold`}>{label}</span>
      </button>

      {visible && (
        <div
          role="tooltip"
          className={`absolute left-1/2 z-50 w-56 p-3 bg-gray-900 text-white text-xs leading-relaxed
                      rounded-lg shadow-xl pointer-events-none
                      ${posBas ? 'top-full mt-2 carto-tooltip-in-bottom' : 'bottom-full mb-2 carto-tooltip-in'}`}
          style={{ transform: 'translateX(-50%)' }}
        >
          {statut === 'rouge' ? (
            <>
              <div className="font-bold text-sm mb-1">{place.prenom}</div>
              <div className="text-gray-300">
                Du <span className="font-semibold text-white">{formatDateCourt(place.dateDebut)}</span>{' '}
                au <span className="font-semibold text-white">{formatDateCourt(place.dateFin)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="font-semibold text-sm mb-2 text-orange-300">Réservations planifiées</div>
              {place.reservationsFutures.map((r, i) => (
                <div key={i} className="flex flex-wrap gap-x-1.5 mb-1 last:mb-0">
                  <span className="font-semibold text-white">{r.prenom}</span>
                  <span className="text-gray-400">
                    du {formatDateCourt(r.dateDebut)} au {formatDateCourt(r.dateFin)}
                  </span>
                </div>
              ))}
            </>
          )}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-0 h-0
                        border-l-[6px] border-l-transparent
                        border-r-[6px] border-r-transparent
                        ${posBas
                          ? 'bottom-full border-b-[6px] border-b-gray-900'
                          : 'top-full border-t-[6px] border-t-gray-900'}`}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Composant — Table (etablissement + secteur)
//
// Calcule le label de chaque place : type + numero si
// plusieurs places du meme type dans la meme table.
// Ex. deux STAGE → "Stage/Mes. 1" et "Stage/Mes. 2".
// ──────────────────────────────────────────────

function Table({ table }) {
  const site = SITES[table.site]
  const places = table.places
  const libres = places.filter((p) => !p.occupee).length
  const total = places.length

  // Compte combien de fois chaque type apparait dans cette table
  const typeTotaux = places.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1
    return acc
  }, {})

  // Assigne un index croissant par type pour la numerotation
  const typeIdx = {}
  const placesAvecLabel = places.map((p) => {
    typeIdx[p.type] = (typeIdx[p.type] || 0) + 1
    const label = typeTotaux[p.type] > 1
      ? `${TYPES_PLACE[p.type].label} ${typeIdx[p.type]}`
      : TYPES_PLACE[p.type].label
    return { ...p, _label: label }
  })

  let rangeeHaut = []
  let rangeeBas = []
  if (placesAvecLabel.length <= 4) {
    rangeeHaut = placesAvecLabel
  } else {
    const moitie = Math.ceil(placesAvecLabel.length / 2)
    rangeeHaut = placesAvecLabel.slice(0, moitie)
    rangeeBas = placesAvecLabel.slice(moitie)
  }

  const ratio = total > 0 ? libres / total : 0
  const bordureTable =
    libres === 0 ? 'border-cb-red/30' :
    ratio > 0.5  ? 'border-cb-green/30' :
                   'border-cb-orange/30'

  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white font-bold text-xs flex-shrink-0"
            style={{ backgroundColor: site.couleur }}
          >
            {table.site}
          </span>
          <div className="min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 leading-tight truncate">{site.nom}</h4>
            <p className="text-xs text-gray-500 truncate">{table.secteur}</p>
          </div>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0
                      ${libres === 0
                        ? 'bg-cb-red-light text-cb-red'
                        : ratio > 0.5
                          ? 'bg-cb-green-light text-cb-green'
                          : 'bg-cb-orange-light text-cb-orange'}`}
        >
          {libres}/{total}
        </span>
      </div>

      {rangeeHaut.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-3">
          {rangeeHaut.map((p, i) => (
            <Place key={`h-${i}`} place={p} label={p._label} commentaire={table.commentaire} />
          ))}
        </div>
      )}

      {/* Bloc central de la table (sans le mot "Tablee") */}
      <div
        className={`relative mx-auto rounded-full border-2 border-dashed ${bordureTable}
                    bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-50
                    flex items-center justify-center text-center px-5 py-3 my-1 shadow-inner`}
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(180, 130, 70, 0.05) 0 2px, transparent 2px 14px), linear-gradient(to bottom, #fef9f0, #fdf3e0)',
        }}
      >
        <div className="text-sm font-bold text-gray-800 leading-tight">
          {site.nom} — {table.secteur}
        </div>
      </div>

      {rangeeBas.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mt-3">
          {rangeeBas.map((p, i) => (
            <Place key={`b-${i}`} place={p} label={p._label} commentaire={table.commentaire} />
          ))}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Composant — Legende des types (vue detail)
// ──────────────────────────────────────────────

function LegendePlaces({ typesPresents }) {
  if (typesPresents.length === 0) return null

  const legendeCouleurs = [
    { statut: 'vert',   bg: 'bg-cb-green',  label: 'Libre' },
    { statut: 'orange', bg: 'bg-cb-orange', label: 'Réservations futures' },
    { statut: 'rouge',  bg: 'bg-cb-red',    label: 'Occupé aujourd\'hui' },
  ]

  return (
    <div className="border-t border-gray-200 pt-5 mt-8 space-y-4">
      {/* Legende couleurs statut */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Statut des places
        </p>
        <div className="flex flex-wrap gap-3">
          {legendeCouleurs.map(({ statut, bg, label }) => (
            <div key={statut} className="inline-flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full ${bg} flex-shrink-0`} aria-hidden="true" />
              <span className="text-xs text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legende types de places */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Types de places
        </p>
        <div className="flex flex-wrap gap-2.5">
          {typesPresents.map((type) => (
            <div
              key={type}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm"
            >
              <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                {TYPES_PLACE[type].label}
              </span>
              <span className="text-xs text-gray-600">{TYPES_PLACE[type].long}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Composant — Vue detail d'un plan
// ──────────────────────────────────────────────

function VueDetailPlan({ plan, onRetour }) {
  const places = toutesLesPlaces(plan)
  const total = places.length
  const libres = places.filter((p) => !p.occupee).length
  const decompte = decompteParType(plan)
  const totaux = totalParType(plan)
  const couleur = COULEURS_BLOC[statutCouleur(plan)]

  const typesPresents = Object.keys(TYPES_PLACE).filter((t) => (totaux[t] || 0) > 0)

  const Icone = plan.icone

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <button
        type="button"
        onClick={onRetour}
        className="group inline-flex items-center gap-2 text-sm font-semibold text-white
                   bg-cb-blue hover:bg-cb-blue/90 active:bg-cb-blue
                   px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer mb-5"
      >
        <ChevronLeft size={16} strokeWidth={2} className="transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
        Retour aux plans
      </button>

      <div className={`relative rounded-2xl border-2 ${couleur.border} ${couleur.bg} overflow-hidden mb-6 shadow-sm`}>
        <div className={`h-2 w-full ${couleur.bandeau}`} aria-hidden="true" />
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4 mb-4">
            <span className={`flex-shrink-0 ${couleur.text}`} aria-hidden="true">
              <Icone size={52} strokeWidth={2} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] uppercase tracking-wider font-bold text-cb-blue/70">
                  Plan métier
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${couleur.bg} ${couleur.text} border ${couleur.border}`}>
                  {couleur.libelle}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{plan.nom}</h2>
              <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-white/70 rounded-lg border border-gray-200 px-3 py-2">
              <div className={`text-2xl font-bold ${couleur.text} leading-none`}>
                {libres}
                <span className="text-sm text-gray-400 font-normal">/{total}</span>
              </div>
              <div className="text-[10px] uppercase tracking-wide font-semibold text-gray-600 mt-1">
                Total libres
              </div>
            </div>
            {typesPresents.map((type) => {
              const stat = COULEURS_STAT[type]
              return (
                <div key={type} className="bg-white/70 rounded-lg border border-gray-200 px-3 py-2">
                  <div className={`text-2xl font-bold ${stat.num} leading-none`}>
                    {decompte[type] || 0}
                    <span className="text-sm text-gray-400 font-normal">/{totaux[type] || 0}</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-wide font-semibold text-gray-600 mt-1">
                    {TYPES_PLACE[type].label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plan.tables.map((t, i) => (
          <Table key={i} table={t} />
        ))}
      </div>

      <LegendePlaces typesPresents={typesPresents} />
    </div>
  )
}

// ──────────────────────────────────────────────
// Overlay anime "boom ca entre"
// ──────────────────────────────────────────────

function OverlayPlan({ rect, fermeture, onFermetureFinie, children }) {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1
  const style = rect
    ? {
        '--carto-x': `${rect.left}px`,
        '--carto-y': `${rect.top}px`,
        '--carto-scale-x': `${Math.max(rect.width / vw, 0.05)}`,
        '--carto-scale-y': `${Math.max(rect.height / vh, 0.05)}`,
      }
    : {}

  function handleAnimationEnd(e) {
    if (fermeture && e.target === e.currentTarget && onFermetureFinie) {
      onFermetureFinie()
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm
                    ${fermeture ? 'carto-zoom-out' : 'carto-fade-bg'}`}
        style={fermeture ? { animationDuration: '320ms' } : {}}
        aria-hidden="true"
      />
      <div
        className={`fixed inset-0 z-50 bg-gradient-to-b from-white via-white to-gray-50
                    overflow-y-auto ${fermeture ? 'carto-zoom-out' : 'carto-zoom-in'}`}
        style={style}
        onAnimationEnd={handleAnimationEnd}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </>
  )
}

// ──────────────────────────────────────────────
// Composant principal
// ──────────────────────────────────────────────

export default function Cartographie({ onGoHome, onLogout }) {
  const [plans, setPlans] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(false)
  const [vueDetail, setVueDetail] = useState(null)
  const [rectOrigine, setRectOrigine] = useState(null)
  const [fermeture, setFermeture] = useState(false)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}carto.json`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((data) => { setPlans(cartoJsonToPlans(data)); setChargement(false) })
      .catch(() => { setErreur(true); setChargement(false) })
  }, [])

  useEffect(() => {
    if (vueDetail) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [vueDetail])

  useEffect(() => {
    if (fermeture) {
      const t = setTimeout(() => {
        setVueDetail(null)
        setRectOrigine(null)
        setFermeture(false)
      }, 400)
      return () => clearTimeout(t)
    }
  }, [fermeture])

  const planActif = vueDetail ? plans.find((p) => p.id === vueDetail) : null
  const stats = statsGlobales(plans)

  if (chargement) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm animate-fadeIn">
      Chargement de la cartographie…
    </div>
  )

  if (erreur) return (
    <div className="flex items-center justify-center h-64 text-cb-red text-sm">
      Erreur de chargement — rechargez la page.
    </div>
  )

  function ouvrirPlan(id, element) {
    if (element && element.getBoundingClientRect) {
      setRectOrigine(element.getBoundingClientRect())
    } else {
      setRectOrigine(null)
    }
    setFermeture(false)
    setVueDetail(id)
  }

  function fermerPlan() { setFermeture(true) }

  function fermetureFinie() {
    setVueDetail(null)
    setRectOrigine(null)
    setFermeture(false)
  }

  return (
    <div className="animate-fadeIn">
      <HeaderStatsGlobales stats={stats} />

      <div className="flex items-center justify-between gap-3 mt-6 mb-4 flex-wrap">
        <button
          type="button"
          onClick={onGoHome}
          className="inline-flex items-center gap-2 text-sm font-medium text-white bg-cb-blue hover:bg-cb-blue/90
                     px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
          Retour à l'accueil
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-cb-red
                     hover:bg-cb-red/5 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
        >
          <LogOut size={14} strokeWidth={2} />
          Déconnexion
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Cartographie des places
        </h2>
        <p className="text-gray-600 text-sm max-w-xl mx-auto">
          Vue d'ensemble des places de stage, formation pratique, AFP/CFC et CEA
          par plan métier — état pour la semaine en cours.
        </p>
        <p className="text-[11px] uppercase tracking-wide text-cb-blue/70 font-semibold mt-2">
          Vue privée — Coordination DFIP
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <CartePlan key={plan.id} plan={plan} onOuvrir={ouvrirPlan} />
        ))}
      </div>

      {planActif && (
        <OverlayPlan
          rect={rectOrigine}
          fermeture={fermeture}
          onFermetureFinie={fermetureFinie}
        >
          <VueDetailPlan plan={planActif} onRetour={fermerPlan} />
        </OverlayPlan>
      )}

      <p className="text-center text-[11px] text-gray-400 mt-8">
        Données mises à jour automatiquement via Power Automate
      </p>
    </div>
  )
}