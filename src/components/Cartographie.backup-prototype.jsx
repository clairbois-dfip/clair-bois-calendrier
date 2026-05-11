/**
 * Cartographie.jsx — Board interactif des sites Clair-Bois.
 *
 * Affiche les 6 sites de la fondation organises en 2 poles,
 * avec pour chaque secteur/structure : accueil DFIP, capacites,
 * formateurs, et commentaires par place.
 *
 * Donnees en dur pour le prototype — a remplacer par une source
 * dynamique (SharePoint / JSON) en production.
 *
 * @param {Function} props.onGoHome — retour a la page d'accueil
 */
import { useState } from 'react'

// ──────────────────────────────────────────────
// Donnees prototype — structure des 6 sites
// ──────────────────────────────────────────────

const POLES = [
  {
    nom: 'Pôle enfance et adolescence',
    sites: [
      {
        code: 'CBC',
        nom: 'Chambésy',
        couleur: '#2563eb',
        structures: [
          { nom: 'Groupe A', type: 'groupe', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 1, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Groupe B', type: 'groupe', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 1, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Cuisine', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 3, capaciteApprentis: { afp: 1, cfc: 1, fpra: 0, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Exploitation', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Nettoyage', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
        ],
      },
      {
        code: 'CBL',
        nom: 'Lancy',
        couleur: '#7c3aed',
        structures: [
          { nom: 'Classe A', type: 'classe', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 1, cfc: 0, fpra: 1, precision: 'ASA' }, capaciteAutres: 0, commentaire: '' },
          { nom: 'Classe B', type: 'classe', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 1, cfc: 0, fpra: 1, precision: 'ASE' }, capaciteAutres: 0, commentaire: '' },
          { nom: 'Classe C', type: 'classe', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 1, fpra: 1, precision: 'ASSC' }, capaciteAutres: 0, commentaire: '' },
          { nom: 'Classe D', type: 'classe', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 1, cfc: 0, fpra: 0, precision: 'ASA' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Classe E', type: 'classe', accueil: false, formateurs: 0, capaciteDFIP: 0, capaciteApprentis: { afp: 0, cfc: 0, fpra: 0, precision: '' }, capaciteAutres: 0, commentaire: 'Pas d\'accueil cette année' },
          { nom: 'Classe F', type: 'classe', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 1, cfc: 0, fpra: 1, precision: 'ASE' }, capaciteAutres: 0, commentaire: '' },
          { nom: 'Cuisine', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 3, capaciteApprentis: { afp: 1, cfc: 1, fpra: 0, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Exploitation', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Nettoyage', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Lingerie', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 1, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 0, commentaire: '' },
        ],
      },
    ],
  },
  {
    nom: 'Pôle adultes',
    sites: [
      {
        code: 'CBG',
        nom: 'Gradelle',
        couleur: '#059669',
        structures: [
          { nom: 'Appartement 1', type: 'appartement', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 1, cfc: 0, fpra: 1, precision: 'ASE' }, capaciteAutres: 0, commentaire: '' },
          { nom: 'Appartement 2', type: 'appartement', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 1, cfc: 0, fpra: 1, precision: 'ASA' }, capaciteAutres: 0, commentaire: '' },
          { nom: 'Appartement 3', type: 'appartement', accueil: false, formateurs: 0, capaciteDFIP: 0, capaciteApprentis: { afp: 0, cfc: 0, fpra: 0, precision: '' }, capaciteAutres: 0, commentaire: 'Réservé interne' },
          { nom: 'Appartement 4', type: 'appartement', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 1, fpra: 1, precision: 'ASSC' }, capaciteAutres: 0, commentaire: '' },
          { nom: 'Centre de jour', type: 'secteur', accueil: true, formateurs: 2, capaciteDFIP: 4, capaciteApprentis: { afp: 2, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
        ],
      },
      {
        code: 'CBM',
        nom: 'Minoteries',
        couleur: '#d97706',
        structures: [
          { nom: 'Appartement 2ème', type: 'appartement', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 1, cfc: 0, fpra: 1, precision: 'ASA' }, capaciteAutres: 0, commentaire: '' },
          { nom: 'Appartement 3ème', type: 'appartement', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 1, fpra: 1, precision: 'ASE' }, capaciteAutres: 0, commentaire: '' },
          { nom: 'Appartement 4ème', type: 'appartement', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 1, cfc: 0, fpra: 0, precision: 'ASSC' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Appartement 5ème', type: 'appartement', accueil: false, formateurs: 0, capaciteDFIP: 0, capaciteApprentis: { afp: 0, cfc: 0, fpra: 0, precision: '' }, capaciteAutres: 0, commentaire: 'En travaux' },
          { nom: 'Centre de jour', type: 'secteur', accueil: true, formateurs: 2, capaciteDFIP: 3, capaciteApprentis: { afp: 1, cfc: 1, fpra: 0, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Restaurant', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 3, capaciteApprentis: { afp: 1, cfc: 1, fpra: 0, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Cuisine', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 3, capaciteApprentis: { afp: 1, cfc: 1, fpra: 0, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Nettoyage', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Exploitation', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Audio-visuel', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
        ],
      },
      {
        code: 'CBP',
        nom: 'Pinchat',
        couleur: '#dc2626',
        structures: [
          { nom: 'Appartement 5A', type: 'appartement', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 1, cfc: 0, fpra: 1, precision: 'ASA' }, capaciteAutres: 0, commentaire: '' },
          { nom: 'Appartement 5B', type: 'appartement', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 1, fpra: 1, precision: 'ASE' }, capaciteAutres: 0, commentaire: '' },
          { nom: 'Appartement 5C', type: 'appartement', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 1, cfc: 0, fpra: 0, precision: 'ASSC' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Appartement 5D', type: 'appartement', accueil: false, formateurs: 0, capaciteDFIP: 0, capaciteApprentis: { afp: 0, cfc: 0, fpra: 0, precision: '' }, capaciteAutres: 0, commentaire: 'Non disponible' },
          { nom: 'Appartement 5E', type: 'appartement', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 1, cfc: 0, fpra: 1, precision: 'ASA' }, capaciteAutres: 0, commentaire: '' },
          { nom: 'Appartement 5F', type: 'appartement', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 1, fpra: 1, precision: 'ASE' }, capaciteAutres: 0, commentaire: '' },
          { nom: 'Appartement 5GH', type: 'appartement', accueil: true, formateurs: 2, capaciteDFIP: 3, capaciteApprentis: { afp: 1, cfc: 1, fpra: 1, precision: 'ASA/ASE' }, capaciteAutres: 0, commentaire: '' },
          { nom: 'Centre de jour 1', type: 'secteur', accueil: true, formateurs: 2, capaciteDFIP: 4, capaciteApprentis: { afp: 2, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Centre de jour 2', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 3, capaciteApprentis: { afp: 1, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'La Passerelle', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 1, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 0, commentaire: '' },
          { nom: 'Restaurant', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 3, capaciteApprentis: { afp: 1, cfc: 1, fpra: 0, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Cuisine', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 3, capaciteApprentis: { afp: 1, cfc: 1, fpra: 0, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Nettoyage', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Exploitation', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Peinture', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Couture', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Graphisme', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Médiamatique', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Ateliers', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 0, fpra: 1, precision: '' }, capaciteAutres: 1, commentaire: '' },
          { nom: 'Pâtisserie-boulangerie', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 3, capaciteApprentis: { afp: 1, cfc: 1, fpra: 0, precision: '' }, capaciteAutres: 1, commentaire: '' },
        ],
      },
      {
        code: 'CBT',
        nom: 'Tourbillon',
        couleur: '#0891b2',
        structures: [
          { nom: 'Informatique', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 0, cfc: 1, fpra: 1, precision: '' }, capaciteAutres: 0, commentaire: '' },
          { nom: 'Employé·e de commerce', type: 'secteur', accueil: true, formateurs: 1, capaciteDFIP: 2, capaciteApprentis: { afp: 1, cfc: 1, fpra: 0, precision: '' }, capaciteAutres: 0, commentaire: '' },
        ],
      },
    ],
  },
]

// ──────────────────────────────────────────────
// Icones par type de structure
// ──────────────────────────────────────────────

const TYPE_ICONS = {
  groupe: '👥',
  classe: '🎓',
  appartement: '🏠',
  secteur: '🔧',
}

// ──────────────────────────────────────────────
// Composant — Carte d'une structure
// ──────────────────────────────────────────────

function StructureCard({ structure, siteCouleur }) {
  const { nom, type, accueil, formateurs, capaciteDFIP, capaciteApprentis, capaciteAutres, commentaire } = structure
  const totalApprentis = capaciteApprentis.afp + capaciteApprentis.cfc + capaciteApprentis.fpra

  return (
    <div className={`rounded-lg border-2 p-3 transition-all duration-200 ${
      accueil
        ? 'border-gray-200 bg-white hover:shadow-md'
        : 'border-gray-100 bg-gray-50 opacity-60'
    }`}>
      {/* En-tete */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{TYPE_ICONS[type] || '📋'}</span>
          <h4 className="font-semibold text-sm text-gray-900">{nom}</h4>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          accueil
            ? 'bg-cb-green/10 text-cb-green'
            : 'bg-gray-200 text-gray-500'
        }`}>
          {accueil ? 'OUI' : 'NON'}
        </span>
      </div>

      {accueil ? (
        <>
          {/* Indicateurs */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="text-center p-1.5 bg-blue-50 rounded">
              <p className="text-lg font-bold text-blue-700">{formateurs}</p>
              <p className="text-[10px] text-blue-500 leading-tight">Formateur{formateurs > 1 ? 's' : ''}</p>
            </div>
            <div className="text-center p-1.5 bg-green-50 rounded">
              <p className="text-lg font-bold text-green-700">{capaciteDFIP}</p>
              <p className="text-[10px] text-green-500 leading-tight">Places DFIP</p>
            </div>
            <div className="text-center p-1.5 bg-orange-50 rounded">
              <p className="text-lg font-bold text-orange-700">{capaciteAutres}</p>
              <p className="text-[10px] text-orange-500 leading-tight">CEA / Stage</p>
            </div>
          </div>

          {/* Detail apprentis */}
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <span className="font-medium">Apprentis ({totalApprentis}) :</span>
            {capaciteApprentis.afp > 0 && <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-medium">AFP {capaciteApprentis.afp}</span>}
            {capaciteApprentis.cfc > 0 && <span className="bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-medium">CFC {capaciteApprentis.cfc}</span>}
            {capaciteApprentis.fpra > 0 && <span className="bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded font-medium">FPra {capaciteApprentis.fpra}</span>}
            {capaciteApprentis.precision && <span className="text-gray-400">({capaciteApprentis.precision})</span>}
          </div>
        </>
      ) : (
        /* Structure qui n'accueille pas */
        commentaire && (
          <p className="text-xs text-gray-400 italic">{commentaire}</p>
        )
      )}

      {/* Commentaire (si accueil actif + commentaire) */}
      {accueil && commentaire && (
        <p className="text-xs text-gray-400 italic mt-1.5 pt-1.5 border-t border-gray-100">{commentaire}</p>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Composant — Carte d'un site
// ──────────────────────────────────────────────

function SiteCard({ site }) {
  const [expanded, setExpanded] = useState(true)
  const totalDFIP = site.structures.reduce((sum, s) => sum + s.capaciteDFIP, 0)
  const totalFormateurs = site.structures.reduce((sum, s) => sum + s.formateurs, 0)
  const nbAccueil = site.structures.filter(s => s.accueil).length

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      {/* En-tete du site */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
               style={{ backgroundColor: site.couleur }}>
            {site.code}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900">{site.nom}</h3>
            <p className="text-xs text-gray-500">
              {nbAccueil}/{site.structures.length} structures actives · {totalFormateurs} formateurs · {totalDFIP} places DFIP
            </p>
          </div>
        </div>
        <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Grille des structures */}
      {expanded && (
        <div className="p-4 pt-0 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {site.structures.map((structure) => (
            <StructureCard key={structure.nom} structure={structure} siteCouleur={site.couleur} />
          ))}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Composant principal
// ──────────────────────────────────────────────

export default function Cartographie({ onGoHome }) {
  const [filtrePole, setFiltrePole] = useState(null)

  const polesAffiches = filtrePole !== null ? [POLES[filtrePole]] : POLES

  // Totaux globaux
  const allSites = POLES.flatMap(p => p.sites)
  const totalStructures = allSites.reduce((sum, s) => sum + s.structures.length, 0)
  const totalDFIP = allSites.reduce((sum, s) => sum + s.structures.reduce((a, st) => a + st.capaciteDFIP, 0), 0)
  const totalFormateurs = allSites.reduce((sum, s) => sum + s.structures.reduce((a, st) => a + st.formateurs, 0), 0)

  return (
    <div className="animate-fadeIn">
      {/* Retour accueil */}
      <button
        onClick={onGoHome}
        className="inline-flex items-center gap-2 text-sm font-medium text-white bg-cb-blue hover:bg-cb-blue/90
                   px-4 py-2 rounded-lg transition-colors cursor-pointer mt-6 mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour à l'accueil
      </button>

      {/* En-tete */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Cartographie des sites
        </h2>
        <p className="text-gray-600 text-sm max-w-lg mx-auto">
          Vue d'ensemble des capacités d'accueil DFIP par site et par structure.
        </p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-cb-blue">{allSites.length}</p>
          <p className="text-xs text-gray-500">Sites</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-cb-green">{totalDFIP}</p>
          <p className="text-xs text-gray-500">Places DFIP totales</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{totalFormateurs}</p>
          <p className="text-xs text-gray-500">Formateurs</p>
        </div>
      </div>

      {/* Filtres par pole */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFiltrePole(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
            ${filtrePole === null
              ? 'bg-cb-blue text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Tous les pôles
        </button>
        {POLES.map((pole, idx) => (
          <button
            key={pole.nom}
            onClick={() => setFiltrePole(filtrePole === idx ? null : idx)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
              ${filtrePole === idx
                ? 'bg-cb-blue text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {pole.nom}
          </button>
        ))}
      </div>

      {/* Poles et sites */}
      <div className="space-y-6">
        {polesAffiches.map((pole) => (
          <div key={pole.nom}>
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-1 h-6 bg-cb-blue rounded-full" />
              {pole.nom}
            </h3>
            <div className="space-y-3">
              {pole.sites.map((site) => (
                <SiteCard key={site.code} site={site} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legende */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Légende</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="bg-cb-green/10 text-cb-green font-bold px-1.5 py-0.5 rounded text-[10px]">OUI</span>
            Accueille des candidats DFIP
          </div>
          <div className="flex items-center gap-1.5">
            <span className="bg-indigo-100 text-indigo-600 font-medium px-1.5 py-0.5 rounded text-[10px]">AFP</span>
            Attestation fédérale
          </div>
          <div className="flex items-center gap-1.5">
            <span className="bg-purple-100 text-purple-600 font-medium px-1.5 py-0.5 rounded text-[10px]">CFC</span>
            Certificat fédéral
          </div>
          <div className="flex items-center gap-1.5">
            <span className="bg-pink-100 text-pink-600 font-medium px-1.5 py-0.5 rounded text-[10px]">FPra</span>
            Formation pratique
          </div>
        </div>
      </div>

      {/* Note prototype */}
      <p className="text-center text-xs text-gray-300 mt-4">
        Prototype — les données affichées sont fictives et seront remplacées par les données réelles.
      </p>
    </div>
  )
}
