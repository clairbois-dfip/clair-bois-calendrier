/**
 * Cartographie.jsx — Vue privee des places de stage par plan metier.
 *
 * Inspiree d'un "plan de table de mariage" : chaque plan metier (Restauration,
 * Cuisine, Lingerie, Technique, Educatif enfance-adolescence, Educatif adulte)
 * regroupe des "tables" (etablissements et secteurs) dans lesquelles on visualise
 * les "places" (A, B, C...) typees et colorees selon l'occupation actuelle.
 *
 * Vue 1 — Style "stat cards" inspire de la HomePage : carte large par plan
 *         metier avec gros chiffres ventiles par type de place. Header sticky
 *         en haut avec les stats globales aggregees sur tous les plans.
 * Vue 2 — Detail d'un plan : tables centrales avec sieges disposes autour,
 *         tooltip stagiaire detaille au survol. Legende des types en bas.
 *
 * Animation "boom ca entre" : capture du boundingClientRect de la carte
 * cliquee, montage d'un overlay fixed inset-0 qui demarre dans la boite
 * d'origine (variables CSS --carto-x/--carto-y/--carto-scale-x/-y) puis
 * transitionne vers la pleine taille via @keyframes carto-zoom-in.
 * Animation inverse au retour. Voile sombre derriere pour focaliser.
 *
 * Donnees mock en dur — seront connectees a SharePoint via Power Automate
 * (mise a jour temps reel sur la semaine en cours).
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
// Types de places — libelles et couleurs
// ──────────────────────────────────────────────

const TYPES_PLACE = {
  FPRA: { label: 'FPra', long: 'Formation pratique', accent: 'bg-pink-100 text-pink-700' },
  AFP_CFC: { label: 'AFP/CFC', long: 'AFP ou CFC (formateur OFPC requis)', accent: 'bg-purple-100 text-purple-700' },
  STAGE: { label: 'Stage', long: 'Place de stage', accent: 'bg-sky-100 text-sky-700' },
  CEA: { label: 'CEA', long: 'Contrat en emploi adapte', accent: 'bg-amber-100 text-amber-700' },
}

// ──────────────────────────────────────────────
// Sites Clair-Bois — couleurs de badge
// ──────────────────────────────────────────────

const SITES = {
  CBC: { nom: 'Chambesy', couleur: '#2563eb' },
  CBL: { nom: 'Lancy', couleur: '#7c3aed' },
  CBG: { nom: 'Gradelle', couleur: '#059669' },
  CBM: { nom: 'Minoteries', couleur: '#d97706' },
  CBP: { nom: 'Pinchat', couleur: '#dc2626' },
  CBT: { nom: 'Tourbillon', couleur: '#0891b2' },
}

// ──────────────────────────────────────────────
// Helpers de generation de places mock
// ──────────────────────────────────────────────

/**
 * Cree une place libre.
 */
function placeLibre(code, type) {
  return { code, type, occupee: false }
}

/**
 * Cree une place occupee par un·e stagiaire fictif·ve.
 */
function placeOccupee(code, type, stagiaire, dateDebut, dateFin, typologie) {
  return { code, type, occupee: true, stagiaire, dateDebut, dateFin, typologie }
}

// ──────────────────────────────────────────────
// Donnees mock — 6 plans metiers
// (Educatif eclate en deux plans distincts : enfance-adolescence et adulte,
// suivant la consigne Karavia "educatif pole adulte, educatif pole
// enfance-adolescence" comme deux entites a part entiere.)
// ──────────────────────────────────────────────

const PLANS = [
  // ─── 1. Restauration ─────────────────────────
  {
    id: 'restauration',
    nom: 'Restauration',
    icone: UtensilsCrossed,
    description: 'Service en salle, restaurants et patisserie-boulangerie',
    tables: [
      {
        site: 'CBM',
        secteur: 'Restaurant',
        places: [
          placeLibre('A', 'FPRA'),
          placeOccupee('B', 'FPRA', 'Dupont Marie', '2026-04-20', '2026-04-24', 'Formation pratique'),
          placeLibre('C', 'AFP_CFC'),
          placeLibre('D', 'STAGE'),
          placeOccupee('E', 'STAGE', 'Martin Pierre', '2026-05-04', '2026-05-15', "Mesure d'orientation"),
          placeLibre('F', 'STAGE'),
          placeLibre('G', 'CEA'),
        ],
      },
      {
        site: 'CBP',
        secteur: 'Restaurant',
        places: [
          placeLibre('A', 'FPRA'),
          placeLibre('B', 'AFP_CFC'),
          placeOccupee('C', 'AFP_CFC', 'Bernard Sophie', '2026-04-01', '2026-06-30', 'CFC'),
          placeOccupee('D', 'STAGE', 'Lambert Lucas', '2026-04-20', '2026-04-30', 'Stage decouverte'),
          placeLibre('E', 'STAGE'),
          placeLibre('F', 'CEA'),
        ],
      },
      {
        site: 'CBP',
        secteur: 'Patisserie-boulangerie',
        places: [
          placeLibre('A', 'FPRA'),
          placeLibre('B', 'AFP_CFC'),
          placeOccupee('C', 'CEA', 'Petit Camille', '2026-04-06', '2026-06-26', 'Contrat emploi adapte'),
          placeOccupee('D', 'CEA', 'Rousseau Theo', '2026-04-06', '2026-06-26', 'Contrat emploi adapte'),
          placeLibre('E', 'CEA'),
          placeLibre('F', 'STAGE'),
        ],
      },
    ],
  },

  // ─── 2. Cuisine ─────────────────────────────
  {
    id: 'cuisine',
    nom: 'Cuisine',
    icone: ChefHat,
    description: 'Brigades de cuisine des cinq etablissements',
    tables: [
      {
        site: 'CBC',
        secteur: 'Cuisine',
        places: [
          placeOccupee('A', 'FPRA', 'Durand Anna', '2026-04-13', '2026-05-22', 'Formation pratique CFC'),
          placeOccupee('B', 'AFP_CFC', 'Moreau Julien', '2026-04-13', '2026-06-19', 'AFP'),
          placeOccupee('C', 'STAGE', 'Fontaine Hugo', '2026-04-20', '2026-05-01', 'Stage probatoire'),
          placeLibre('D', 'STAGE'),
        ],
      },
      {
        site: 'CBL',
        secteur: 'Cuisine',
        places: [
          placeOccupee('A', 'FPRA', 'Mercier Lea', '2026-05-04', '2026-06-12', 'Formation pratique AFP'),
          placeOccupee('B', 'AFP_CFC', 'Chevalier Antoine', '2026-04-01', '2026-06-30', 'Stage AFP (1ère année)'),
          placeLibre('C', 'STAGE'),
          placeOccupee('D', 'STAGE', 'Robin Sara', '2026-05-11', '2026-05-22', 'Stage decouverte'),
          placeOccupee('E', 'CEA', 'Vidal Tom', '2026-04-06', '2026-06-26', 'Contrat emploi adapte'),
        ],
      },
      {
        site: 'CBM',
        secteur: 'Cuisine',
        places: [
          placeOccupee('A', 'FPRA', 'Garcia Ines', '2026-04-15', '2026-05-15', 'Formation pratique'),
          placeOccupee('B', 'AFP_CFC', 'Schneider Alex', '2026-04-01', '2026-07-05', 'CFC'),
          placeOccupee('C', 'STAGE', 'Garcia Emma', '2026-05-18', '2026-05-29', 'Stage de réorientation'),
          placeOccupee('D', 'STAGE', 'Favre Lea', '2026-04-20', '2026-04-24', "Mesure d'orientation"),
          placeLibre('E', 'CEA'),
        ],
      },
      {
        site: 'CBP',
        secteur: 'Cuisine',
        places: [
          placeOccupee('A', 'FPRA', 'Roussel Nathan', '2026-04-13', '2026-05-29', 'Formation pratique CFC'),
          placeLibre('B', 'AFP_CFC'),
          placeOccupee('C', 'STAGE', 'Nguyen Tom', '2026-05-11', '2026-05-22', 'Stage decouverte'),
          placeLibre('D', 'STAGE'),
        ],
      },
    ],
  },

  // ─── 3. Lingerie ────────────────────────────
  {
    id: 'lingerie',
    nom: 'Lingerie',
    icone: Shirt,
    description: 'Lingerie et confection',
    tables: [
      {
        site: 'CBL',
        secteur: 'Lingerie',
        places: [
          placeOccupee('A', 'FPRA', 'Olivier Ines', '2026-04-13', '2026-05-22', 'Formation pratique AFP'),
          placeOccupee('B', 'FPRA', 'Da Silva Eva', '2026-04-20', '2026-06-30', 'Formation pratique'),
          placeOccupee('C', 'STAGE', 'Roy Ethan', '2026-04-20', '2026-04-30', 'Stage decouverte'),
          placeOccupee('D', 'STAGE', 'Carre Manon', '2026-05-11', '2026-05-22', "Mesure d'orientation"),
        ],
      },
      {
        site: 'CBP',
        secteur: 'Couture',
        places: [
          placeOccupee('A', 'FPRA', 'Faure Louis', '2026-05-04', '2026-06-12', 'Formation pratique CFC'),
          placeOccupee('B', 'STAGE', 'Aubert Jade', '2026-04-27', '2026-05-08', 'Stage probatoire'),
          placeOccupee('C', 'CEA', 'Andre Adam', '2026-04-06', '2026-06-26', 'Contrat emploi adapte'),
        ],
      },
    ],
  },

  // ─── 4. Technique ───────────────────────────
  {
    id: 'technique',
    nom: 'Technique',
    icone: Wrench,
    description: 'Exploitation, nettoyage, peinture, audio-visuel, graphisme, mediamatique, informatique, ateliers',
    tables: [
      {
        site: 'CBC',
        secteur: 'Exploitation',
        places: [
          placeLibre('A', 'FPRA'),
          placeOccupee('B', 'STAGE', 'Klein Noah', '2026-04-20', '2026-04-30', 'Stage decouverte'),
          placeLibre('C', 'STAGE'),
        ],
      },
      {
        site: 'CBC',
        secteur: 'Nettoyage',
        places: [
          placeLibre('A', 'FPRA'),
          placeLibre('B', 'STAGE'),
          placeLibre('C', 'CEA'),
        ],
      },
      {
        site: 'CBL',
        secteur: 'Nettoyage',
        places: [
          placeLibre('A', 'FPRA'),
          placeOccupee('B', 'FPRA', 'Riva Sara', '2026-04-01', '2026-06-30', 'Formation pratique'),
          placeLibre('C', 'STAGE'),
        ],
      },
      {
        site: 'CBM',
        secteur: 'Audio-visuel',
        places: [
          placeOccupee('A', 'AFP_CFC', 'Hoffmann Leo', '2026-04-01', '2026-07-05', 'AFP'),
          placeLibre('B', 'STAGE'),
          placeLibre('C', 'CEA'),
        ],
      },
      {
        site: 'CBP',
        secteur: 'Peinture',
        places: [
          placeLibre('A', 'FPRA'),
          placeLibre('B', 'STAGE'),
        ],
      },
      {
        site: 'CBP',
        secteur: 'Graphisme',
        places: [
          placeOccupee('A', 'AFP_CFC', 'Carvalho Maya', '2026-04-01', '2026-07-05', 'CFC'),
          placeLibre('B', 'STAGE'),
        ],
      },
      {
        site: 'CBP',
        secteur: 'Mediamatique',
        places: [
          placeLibre('A', 'AFP_CFC'),
          placeLibre('B', 'STAGE'),
        ],
      },
      {
        site: 'CBP',
        secteur: 'Ateliers',
        places: [
          placeLibre('A', 'FPRA'),
          placeLibre('B', 'STAGE'),
          placeOccupee('C', 'CEA', 'Tanner Jonas', '2026-04-06', '2026-06-26', 'Contrat emploi adapte'),
        ],
      },
      {
        site: 'CBT',
        secteur: 'Informatique',
        places: [
          placeLibre('A', 'AFP_CFC'),
          placeOccupee('B', 'AFP_CFC', 'Vidal Aisha', '2026-04-01', '2026-07-05', 'AFP'),
          placeLibre('C', 'STAGE'),
        ],
      },
      {
        site: 'CBT',
        secteur: 'Employe·e de commerce',
        places: [
          placeLibre('A', 'AFP_CFC'),
          placeLibre('B', 'STAGE'),
        ],
      },
    ],
  },

  // ─── 5. Educatif — Pole enfance-adolescence ──
  {
    id: 'educatif-enfance',
    nom: 'Educatif — Pole enfance-adolescence',
    icone: GraduationCap,
    description: 'Classes et groupes des ecoles specialisees',
    tables: [
      {
        site: 'CBC',
        secteur: 'Groupe A',
        places: [
          placeOccupee('A', 'FPRA', 'Dupont Marie', '2026-05-04', '2026-06-12', 'Formation pratique CFC'),
          placeOccupee('B', 'AFP_CFC', 'Berthold Lea', '2026-04-01', '2026-07-05', 'AFP'),
          placeOccupee('C', 'STAGE', 'Lambert Lucas', '2026-04-20', '2026-04-30', 'Stage decouverte'),
        ],
      },
      {
        site: 'CBC',
        secteur: 'Groupe B',
        places: [
          placeOccupee('A', 'FPRA', 'Petit Camille', '2026-04-13', '2026-05-29', 'Formation pratique AFP'),
          placeLibre('B', 'STAGE'),
        ],
      },
      {
        site: 'CBL',
        secteur: 'Classe A',
        places: [
          placeOccupee('A', 'FPRA', 'Sam Nicolas', '2026-04-20', '2026-04-24', "Mesure d'orientation"),
          placeOccupee('B', 'AFP_CFC', 'Bernard Sophie', '2026-04-01', '2026-06-30', 'Stage CFC'),
          placeLibre('C', 'STAGE'),
        ],
      },
      {
        site: 'CBL',
        secteur: 'Classe B',
        places: [
          placeOccupee('A', 'FPRA', 'Rousseau Theo', '2026-05-04', '2026-06-12', 'Formation pratique CFC'),
          placeOccupee('B', 'AFP_CFC', 'Fontaine Yasmine', '2026-04-01', '2026-07-05', 'CFC'),
          placeOccupee('C', 'STAGE', 'Martin Pierre', '2026-04-27', '2026-05-08', 'Stage probatoire'),
        ],
      },
      {
        site: 'CBL',
        secteur: 'Classe C',
        places: [
          placeLibre('A', 'FPRA'),
          placeOccupee('B', 'STAGE', 'Mercier Paul', '2026-05-18', '2026-05-29', 'Stage de réorientation'),
        ],
      },
      {
        site: 'CBL',
        secteur: 'Classe D',
        places: [
          placeOccupee('A', 'FPRA', 'Kadri Yanis', '2026-05-04', '2026-05-29', 'Formation pratique'),
          placeOccupee('B', 'STAGE', 'Robin Clara', '2026-04-13', '2026-04-24', 'Stage decouverte'),
        ],
      },
      {
        site: 'CBL',
        secteur: 'Classe E',
        places: [
          placeLibre('A', 'STAGE'),
          placeOccupee('B', 'STAGE', 'Vidal Maxime', '2026-04-20', '2026-05-01', "Mesure d'orientation"),
        ],
      },
      {
        site: 'CBL',
        secteur: 'Classe F',
        places: [
          placeLibre('A', 'FPRA'),
          placeOccupee('B', 'AFP_CFC', 'Garcia Diego', '2026-04-01', '2026-07-05', 'Stage AFP (2ème année)'),
          placeLibre('C', 'STAGE'),
        ],
      },
    ],
  },

  // ─── 6. Educatif — Pole adulte ───────────────
  {
    id: 'educatif-adulte',
    nom: 'Educatif — Pole adulte',
    icone: Home,
    description: 'Appartements et centres de jour pour adultes',
    tables: [
      {
        site: 'CBG',
        secteur: 'Appartement 1',
        places: [
          placeLibre('A', 'FPRA'),
          placeOccupee('B', 'STAGE', 'Wenger Aline', '2026-04-13', '2026-04-24', 'Stage decouverte'),
        ],
      },
      {
        site: 'CBG',
        secteur: 'Appartement 2',
        places: [
          placeLibre('A', 'AFP_CFC'),
          placeLibre('B', 'STAGE'),
        ],
      },
      {
        site: 'CBG',
        secteur: 'Centre de jour',
        places: [
          placeLibre('A', 'FPRA'),
          placeOccupee('B', 'AFP_CFC', 'Gomez Luna', '2026-04-01', '2026-07-05', 'AFP'),
          placeLibre('C', 'STAGE'),
          placeLibre('D', 'CEA'),
        ],
      },
      {
        site: 'CBM',
        secteur: 'Appartement 2eme',
        places: [
          placeLibre('A', 'FPRA'),
          placeLibre('B', 'STAGE'),
        ],
      },
      {
        site: 'CBM',
        secteur: 'Appartement 3eme',
        places: [
          placeOccupee('A', 'AFP_CFC', 'Burkhalter Nora', '2026-04-01', '2026-07-05', 'CFC'),
          placeLibre('B', 'STAGE'),
        ],
      },
      {
        site: 'CBM',
        secteur: 'Centre de jour',
        places: [
          placeLibre('A', 'FPRA'),
          placeLibre('B', 'STAGE'),
          placeLibre('C', 'CEA'),
        ],
      },
      {
        site: 'CBP',
        secteur: 'Appartement 5A',
        places: [
          placeOccupee('A', 'FPRA', 'Aebischer Sami', '2026-04-20', '2026-06-30', 'Formation pratique'),
          placeLibre('B', 'STAGE'),
        ],
      },
      {
        site: 'CBP',
        secteur: 'Appartement 5B',
        places: [
          placeLibre('A', 'AFP_CFC'),
          placeLibre('B', 'STAGE'),
        ],
      },
      {
        site: 'CBP',
        secteur: 'Centre de jour 1',
        places: [
          placeLibre('A', 'FPRA'),
          placeOccupee('B', 'AFP_CFC', 'Roy Maxence', '2026-04-01', '2026-07-05', 'CFC'),
          placeLibre('C', 'STAGE'),
          placeLibre('D', 'CEA'),
        ],
      },
      {
        site: 'CBP',
        secteur: 'La Passerelle',
        places: [
          placeLibre('A', 'FPRA'),
          placeLibre('B', 'STAGE'),
        ],
      },
    ],
  },
]

// ──────────────────────────────────────────────
// Helpers de calcul des decomptes
// ──────────────────────────────────────────────

/**
 * Aplatit toutes les places d'un plan.
 */
function toutesLesPlaces(plan) {
  return plan.tables.flatMap((t) => t.places)
}

/**
 * Compte les places libres d'un plan, ventilees par type.
 */
function decompteParType(plan) {
  const initial = { FPRA: 0, AFP_CFC: 0, STAGE: 0, CEA: 0 }
  return toutesLesPlaces(plan)
    .filter((p) => !p.occupee)
    .reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1
      return acc
    }, initial)
}

/**
 * Compte le total de places par type pour un plan.
 */
function totalParType(plan) {
  return toutesLesPlaces(plan).reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1
    return acc
  }, {})
}

/**
 * Calcule les statistiques globales agregees sur tous les plans.
 * Retourne total, libres, occupees, pourcentage d'occupation global.
 */
function statsGlobales(plans) {
  const toutes = plans.flatMap((p) => toutesLesPlaces(p))
  const total = toutes.length
  const libres = toutes.filter((p) => !p.occupee).length
  const occupees = total - libres
  const pourcentageOccupation = total > 0 ? Math.round((occupees / total) * 100) : 0
  return { total, libres, occupees, pourcentageOccupation }
}

/**
 * Determine la couleur globale d'un plan selon le ratio de places libres.
 * Rouge = tout occupe, orange = quelques libres, vert = > 50% libres.
 */
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
  vert: {
    bg: 'bg-cb-green-light',
    border: 'border-cb-green',
    text: 'text-cb-green',
    dot: 'bg-cb-green',
    bandeau: 'bg-cb-green',
    libelle: 'Disponibilites bonnes',
  },
  orange: {
    bg: 'bg-cb-orange-light',
    border: 'border-cb-orange',
    text: 'text-cb-orange',
    dot: 'bg-cb-orange',
    bandeau: 'bg-cb-orange',
    libelle: 'Quelques places',
  },
  rouge: {
    bg: 'bg-cb-red-light',
    border: 'border-cb-red',
    text: 'text-cb-red',
    dot: 'bg-cb-red',
    bandeau: 'bg-cb-red',
    libelle: 'Complet',
  },
  gris: {
    bg: 'bg-cb-gray-light',
    border: 'border-cb-gray',
    text: 'text-cb-gray',
    dot: 'bg-cb-gray',
    bandeau: 'bg-cb-gray',
    libelle: 'Sans donnees',
  },
}

// ──────────────────────────────────────────────
// Format date FR court (ex. 20 avr.)
// ──────────────────────────────────────────────

function formatDateCourt(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' })
}

// ──────────────────────────────────────────────
// Couleurs par type (pour les chiffres "stat")
// ──────────────────────────────────────────────

const COULEURS_STAT = {
  FPRA: { num: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
  AFP_CFC: { num: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  STAGE: { num: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
  CEA: { num: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
}

// ──────────────────────────────────────────────
// Composant — Header sticky des stats globales (vue d'ensemble)
// Style cb-blue / cb-accent, fond blanc/95 + backdrop-blur, discret.
// ──────────────────────────────────────────────

/**
 * Determine la couleur de statut a partir des stats agregees.
 * Memes seuils que statutCouleur(plan) pour coherence visuelle.
 */
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
        {/* Bloc total */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-cb-blue leading-none">{total}</span>
          <span className="text-xs uppercase tracking-wide font-semibold text-gray-500">places</span>
        </div>

        <span className="hidden sm:inline-block w-px h-6 bg-gray-200" aria-hidden="true" />

        {/* Bloc libres — chiffre dans la couleur du statut global */}
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold leading-none ${couleur.text}`}>{libres}</span>
          <span className="text-xs uppercase tracking-wide font-semibold text-gray-500">libres</span>
        </div>

        {/* Bloc occupees */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gray-500 leading-none">{occupees}</span>
          <span className="text-xs uppercase tracking-wide font-semibold text-gray-500">occupees</span>
        </div>

        {/* Barre de progression — couleur selon disponibilite globale */}
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
// Style "stat card" inspire de la HomePage : grandes cartes,
// gros chiffres, ombres douces, hover scale leger.
// ──────────────────────────────────────────────

function CartePlan({ plan, onOuvrir, cardRef }) {
  const places = toutesLesPlaces(plan)
  const total = places.length
  const libres = places.filter((p) => !p.occupee).length
  const decompte = decompteParType(plan)
  const totaux = totalParType(plan)
  const couleur = COULEURS_BLOC[statutCouleur(plan)]

  // Ne montre que les types presents pour ce plan
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
      {/* Bandeau de couleur statut en haut — colle au top, occupe toute la largeur de la carte */}
      <div className={`h-1.5 w-full flex-shrink-0 ${couleur.bandeau}`} aria-hidden="true" />

      {/* Corps de la carte — prend l'espace restant pour que les cartes alignees aient la meme hauteur */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* En-tete : icone + nom + description (le statut est porte par le bandeau colore + le gros chiffre) */}
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

        {/* Decompte global — gros chiffre */}
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-bold ${couleur.text} leading-none`}>{libres}</span>
          <span className="text-sm text-gray-600">
            place{libres > 1 ? 's' : ''} libre{libres > 1 ? 's' : ''} sur {total}
          </span>
        </div>

        {/* 4 stats par type, cote a cote */}
        <div className={`grid gap-2 ${typesPresents.length > 2 ? 'grid-cols-4' : 'grid-cols-2'}`}>
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

        {/* Pied de carte */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">{plan.tables.length} table{plan.tables.length > 1 ? 's' : ''}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-cb-blue
                           group-hover:gap-2 transition-all">
            Ouvrir le plan
            <ChevronRight
              size={14}
              strokeWidth={2}
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </button>
  )
}

// ──────────────────────────────────────────────
// Composant — Place individuelle (siege) avec tooltip
// Rendue comme un siege rond autour de la table.
// ──────────────────────────────────────────────

function Place({ place }) {
  const [visible, setVisible] = useState(false)
  const [posBas, setPosBas] = useState(false)
  const refSiege = useRef(null)
  const occ = place.occupee

  // Decide la position du tooltip (au-dessus par defaut, en dessous si haut d'ecran)
  function ouvrir() {
    if (refSiege.current) {
      const r = refSiege.current.getBoundingClientRect()
      setPosBas(r.top < 120)
    }
    setVisible(true)
  }
  function fermer() {
    setVisible(false)
  }

  const couleurFond = occ
    ? 'bg-cb-red text-white border-cb-red shadow-md'
    : 'bg-cb-green text-white border-cb-green shadow-md carto-seat-pulse'

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* Badge type au-dessus du siege */}
      <span
        className={`text-[9px] font-semibold mb-1 px-1.5 py-0.5 rounded ${TYPES_PLACE[place.type].accent}`}
      >
        {TYPES_PLACE[place.type].label}
      </span>

      {/* Siege rond */}
      <button
        ref={refSiege}
        type="button"
        onMouseEnter={ouvrir}
        onMouseLeave={fermer}
        onFocus={ouvrir}
        onBlur={fermer}
        className={`w-11 h-11 rounded-full border-2 ${couleurFond}
                    font-bold text-base flex items-center justify-center
                    transition-transform duration-200 cursor-help hover:scale-110
                    focus:outline-none focus:ring-2 focus:ring-cb-blue focus:ring-offset-2`}
        aria-label={
          occ
            ? `Place ${place.code} occupee par ${place.stagiaire}, du ${formatDateCourt(place.dateDebut)} au ${formatDateCourt(place.dateFin)}, ${place.typologie}`
            : `Place ${place.code} libre, type ${TYPES_PLACE[place.type].long}`
        }
      >
        {place.code}
      </button>

      {/* Tooltip */}
      {visible && (
        <div
          role="tooltip"
          className={`absolute left-1/2 z-50 w-60 p-3 bg-gray-900 text-white text-xs leading-relaxed
                      rounded-lg shadow-xl pointer-events-none
                      ${posBas ? 'top-full mt-2 carto-tooltip-in-bottom' : 'bottom-full mb-2 carto-tooltip-in'}`}
          style={{ transform: 'translateX(-50%)' }}
        >
          {occ ? (
            <>
              <div className="font-bold text-sm mb-1">{place.stagiaire}</div>
              <div className="text-gray-300 mb-1.5">
                Du <span className="font-semibold text-white">{formatDateCourt(place.dateDebut)}</span>{' '}
                au <span className="font-semibold text-white">{formatDateCourt(place.dateFin)}</span>
              </div>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${TYPES_PLACE[place.type].accent}`}
              >
                {place.typologie}
              </span>
            </>
          ) : (
            <>
              <div className="font-semibold text-sm mb-0.5">Place libre</div>
              <div className="text-gray-300">{TYPES_PLACE[place.type].long}</div>
            </>
          )}
          {/* Pointe (haut ou bas) */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-0 h-0
                        border-l-[6px] border-l-transparent
                        border-r-[6px] border-r-transparent
                        ${
                          posBas
                            ? 'bottom-full border-b-[6px] border-b-gray-900'
                            : 'top-full border-t-[6px] border-t-gray-900'
                        }`}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Composant — Une "table" (etablissement + secteur)
// Rendu : grand bloc arrondi style table de banquet
// (fond bois clair / cb-blue-light), nom au centre,
// sieges disposes en haut et en bas (ou tout autour si peu).
// ──────────────────────────────────────────────

function Table({ table }) {
  const site = SITES[table.site]
  const places = table.places
  const libres = places.filter((p) => !p.occupee).length
  const total = places.length

  // Pour evoquer une vraie table : on dispose les sieges en haut et bas
  // si on a plus de 4 places, sinon tout autour en wrap simple.
  let rangeeHaut = []
  let rangeeBas = []
  if (places.length <= 4) {
    rangeeHaut = places
  } else {
    const moitie = Math.ceil(places.length / 2)
    rangeeHaut = places.slice(0, moitie)
    rangeeBas = places.slice(moitie)
  }

  // Couleur de la table selon disponibilite
  const ratio = total > 0 ? libres / total : 0
  let bordureTable = 'border-cb-blue/20'
  if (libres === 0) bordureTable = 'border-cb-red/30'
  else if (ratio > 0.5) bordureTable = 'border-cb-green/30'
  else bordureTable = 'border-cb-orange/30'

  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* En-tete : badge site + secteur + decompte */}
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
                      ${
                        libres === 0
                          ? 'bg-cb-red-light text-cb-red'
                          : ratio > 0.5
                            ? 'bg-cb-green-light text-cb-green'
                            : 'bg-cb-orange-light text-cb-orange'
                      }`}
        >
          {libres}/{total}
        </span>
      </div>

      {/* Sieges du haut */}
      {rangeeHaut.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-3">
          {rangeeHaut.map((p) => (
            <Place key={`h-${p.code}`} place={p} />
          ))}
        </div>
      )}

      {/* La "table" elle-meme : grand bloc arrondi style banquet */}
      <div
        className={`relative mx-auto rounded-full border-2 border-dashed ${bordureTable}
                    bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-50
                    flex items-center justify-center text-center px-5 py-3 my-1
                    shadow-inner`}
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(180, 130, 70, 0.05) 0 2px, transparent 2px 14px), linear-gradient(to bottom, #fef9f0, #fdf3e0)',
        }}
      >
        <div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
            Tablee
          </div>
          <div className="text-sm font-bold text-gray-800 leading-tight">
            {table.site} — {table.secteur}
          </div>
        </div>
      </div>

      {/* Sieges du bas */}
      {rangeeBas.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mt-3">
          {rangeeBas.map((p) => (
            <Place key={`b-${p.code}`} place={p} />
          ))}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Composant — Legende des types de places (vue detail)
// Affichee en bas de chaque plan : pour chaque type present,
// un badge de la couleur d'accent + le libelle long.
// ──────────────────────────────────────────────

function LegendePlaces({ typesPresents }) {
  if (typesPresents.length === 0) return null
  return (
    <div className="border-t border-gray-200 pt-5 mt-8">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Legende — Types de places
      </p>
      <div className="flex flex-wrap gap-2.5">
        {typesPresents.map((type) => (
          <div
            key={type}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm"
          >
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${TYPES_PLACE[type].accent}`}
            >
              {TYPES_PLACE[type].label}
            </span>
            <span className="text-xs text-gray-700">{TYPES_PLACE[type].long}</span>
          </div>
        ))}
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
      {/* Bouton retour bien visible */}
      <button
        type="button"
        onClick={onRetour}
        className="group inline-flex items-center gap-2 text-sm font-semibold text-white
                   bg-cb-blue hover:bg-cb-blue/90 active:bg-cb-blue
                   px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer mb-5"
      >
        <ChevronLeft
          size={16}
          strokeWidth={2}
          className="transition-transform group-hover:-translate-x-0.5"
          aria-hidden="true"
        />
        Retour aux plans
      </button>

      {/* Header detail : grand titre + decompte + bandeau couleur */}
      <div
        className={`relative rounded-2xl border-2 ${couleur.border} ${couleur.bg} overflow-hidden mb-6 shadow-sm`}
      >
        <div className={`h-2 w-full ${couleur.bandeau}`} aria-hidden="true" />
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4 mb-4">
            <span className={`flex-shrink-0 ${couleur.text}`} aria-hidden="true">
              <Icone size={52} strokeWidth={2} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] uppercase tracking-wider font-bold text-cb-blue/70">
                  Plan metier
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${couleur.bg} ${couleur.text} border ${couleur.border}`}>
                  {couleur.libelle}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{plan.nom}</h2>
              <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
            </div>
          </div>

          {/* Stats globales */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
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

      {/* Tables — liste a plat (chaque plan est desormais cohérent : tables → places) */}
      <div className="grid gap-4 md:grid-cols-2">
        {plan.tables.map((t, i) => (
          <Table key={i} table={t} />
        ))}
      </div>

      {/* Legende des types de places presents dans ce plan */}
      <LegendePlaces typesPresents={typesPresents} />
    </div>
  )
}

// ──────────────────────────────────────────────
// Overlay anime "boom ca entre"
// ──────────────────────────────────────────────

/**
 * Overlay fixe qui demarre dans la boundingClientRect de la carte cliquee
 * (rect.x/y, rect.width/vw, rect.height/vh) puis transitionne vers la
 * pleine taille via les variables CSS et l'animation carto-zoom-in.
 *
 * @param {DOMRect} props.rect — rect d'origine (carte cliquee)
 * @param {boolean} props.fermeture — true => animation inverse
 * @param {Function} props.onFermetureFinie — callback fin d'animation inverse
 * @param {React.Node} props.children — contenu (VueDetailPlan)
 */
function OverlayPlan({ rect, fermeture, onFermetureFinie, children }) {
  // Position + scale d'origine. translate amene le coin (0,0) du fixed
  // a la position du coin haut-gauche de la carte d'origine, puis scale
  // reduit le contenu pour qu'il ait la meme taille apparente que la carte.
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
    // Ne reagit que sur la fin de l'animation de l'overlay lui-meme,
    // pas sur les animations enfants (sieges, tooltips). Path rapide :
    // declenche le demontage des que l'animation se termine normalement.
    if (fermeture && e.target === e.currentTarget && onFermetureFinie) {
      onFermetureFinie()
    }
  }

  return (
    <>
      {/* Voile de fond — apparait/disparait en fade pour focaliser */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm
                    ${fermeture ? 'carto-zoom-out' : 'carto-fade-bg'}`}
        style={fermeture ? { animationDuration: '320ms' } : {}}
        aria-hidden="true"
      />

      {/* Overlay contenu — anime en zoom in/out */}
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
  // null = vue d'ensemble, sinon id du plan affiche
  const [vueDetail, setVueDetail] = useState(null)
  // Rect d'origine de la carte cliquee, pour l'animation d'expansion
  const [rectOrigine, setRectOrigine] = useState(null)
  // Flag : l'overlay est en train de se refermer (animation inverse)
  const [fermeture, setFermeture] = useState(false)

  const planActif = vueDetail ? PLANS.find((p) => p.id === vueDetail) : null

  // Stats globales agregees sur tous les plans (vue d'ensemble uniquement)
  const stats = statsGlobales(PLANS)

  // Bloque le scroll du body pendant que l'overlay est ouvert
  useEffect(() => {
    if (vueDetail) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [vueDetail])

  // Garde-fou : si onAnimationEnd ne se declenche pas (event filtre,
  // animation non lancee, plateau d'animation, etc.), on force le
  // demontage apres la duree de l'animation carto-zoom-out (360ms +
  // marge). fermetureFinie() reste idempotent : ses set... a null sur
  // un etat deja a null sont sans effet.
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

  /**
   * Ouvre un plan : capture la rect de la carte cliquee
   * puis monte l'overlay anime.
   */
  function ouvrirPlan(id, element) {
    if (element && element.getBoundingClientRect) {
      setRectOrigine(element.getBoundingClientRect())
    } else {
      setRectOrigine(null)
    }
    setFermeture(false)
    setVueDetail(id)
  }

  /**
   * Demarre l'animation inverse (l'overlay se replie vers la rect d'origine)
   * puis demonte le composant en fin d'animation.
   */
  function fermerPlan() {
    setFermeture(true)
  }

  /**
   * Appele quand l'animation de fermeture est terminee (path rapide via
   * onAnimationEnd). Reste idempotent : appelable plusieurs fois sans
   * effet de bord (se conjugue avec le garde-fou setTimeout).
   */
  function fermetureFinie() {
    setVueDetail(null)
    setRectOrigine(null)
    setFermeture(false)
  }

  return (
    <div className="animate-fadeIn">
      {/* Header sticky : stats globales agregees (visible uniquement sur la vue d'ensemble) */}
      <HeaderStatsGlobales stats={stats} />

      {/* Barre superieure : retour + deconnexion */}
      <div className="flex items-center justify-between gap-3 mt-6 mb-4 flex-wrap">
        <button
          type="button"
          onClick={onGoHome}
          className="inline-flex items-center gap-2 text-sm font-medium text-white bg-cb-blue hover:bg-cb-blue/90
                     px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
          Retour a l'accueil
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-cb-red
                     hover:bg-cb-red/5 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
        >
          <LogOut size={14} strokeWidth={2} />
          Deconnexion
        </button>
      </div>

      {/* Titre principal de la vue d'ensemble */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Cartographie des places
        </h2>
        <p className="text-gray-600 text-sm max-w-xl mx-auto">
          Vue d'ensemble des places de stage, formation pratique, AFP/CFC et CEA
          par plan metier — etat pour la semaine en cours.
        </p>
        <p className="text-[11px] uppercase tracking-wide text-cb-blue/70 font-semibold mt-2">
          Vue privee — Coordination DFIP
        </p>
      </div>

      {/* Grille des plans metier (vue d'ensemble) */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <CartePlan key={plan.id} plan={plan} onOuvrir={ouvrirPlan} />
        ))}
      </div>

      {/* Overlay detail anime (boom ca entre) */}
      {planActif && (
        <OverlayPlan
          rect={rectOrigine}
          fermeture={fermeture}
          onFermetureFinie={fermetureFinie}
        >
          <VueDetailPlan plan={planActif} onRetour={fermerPlan} />
        </OverlayPlan>
      )}

      {/* Note en pied — mention du pipeline automatique */}
      <p className="text-center text-[11px] text-gray-400 mt-8">
        Donnees mises a jour automatiquement via Power Automate
      </p>
    </div>
  )
}
