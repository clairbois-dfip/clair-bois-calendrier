/**
 * ModulesMetiers.jsx — Vue "Semaine type" des modules metiers.
 *
 * Flow : 1) Choisir une semaine → 2) Voir la grille des modules avec places
 *        disponibles pour cette semaine → 3) Selectionner 1 a N modules
 *        → 4) S'inscrire (1 seul formulaire).
 *
 * Les places affichees correspondent a la semaine selectionnee.
 * Changer de semaine permet de voir d'autres disponibilites.
 */
import { useState } from 'react'
import { formatDate } from '../utils/helpers'

const MODULE_ICONS = {
  'Cuisine': '🍳',
  'Lingerie': '🫧',
  'Pâtisserie': '🧁',
  'Audiovisuel': '🎬',
  'Nettoyage': '🧹',
  'Technique': '🏗️',
  'Restauration': '🍽️',
  'Graphisme': '💻',
  'Ateliers': '🎥',
}

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']
const JOURS_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
const HEURES = Array.from({ length: 10 }, (_, i) => i + 7)

function getModuleStyle(mod) {
  const startH = parseInt(mod.heureDebut.split(':')[0])
  const endH = parseInt(mod.heureFin.split(':')[0])
  const top = (startH - 7) * 60
  const height = (endH - startH) * 60
  return { top, height }
}

function groupByJour(modules) {
  const grouped = {}
  JOURS.forEach(j => { grouped[j] = [] })
  modules.forEach(mod => {
    if (grouped[mod.jour]) grouped[mod.jour].push(mod)
  })
  return grouped
}

/**
 * Verifie si une semaine est trop proche pour s'inscrire (delai J-7).
 * @param {Object} semaine — objet semaine avec dateDebut
 * @returns {boolean} true si l'inscription est fermee
 */
function isSemaineTooSoon(semaine) {
  const debut = new Date(semaine.dateDebut + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const minDate = new Date(today)
  minDate.setDate(minDate.getDate() + 7)
  return debut < minDate
}

/** URLs des formulaires selon le chemin d'aiguillage */
const MODULES_FORMS_URLS = {
  // Modules + moi-meme → Form 6 (modules-participant)
  'moi': 'https://forms.office.com/e/2TwtdawF7s',
  // Modules + referent → Form 2 (modules-partenaire)
  'autre': 'https://forms.office.com/e/rTA3ZiwUVb',
}

export default function ModulesMetiers({ modulesMetiers, formsUrl, chemin, onBack, onGoToFormulaire }) {
  const { modules, semaines, maxSelection, formsUrlModules } = modulesMetiers
  // selected = [{ mod, semaine }] — chaque entree lie un module a une semaine
  const [selected, setSelected] = useState([])
  // Semaine actuellement selectionnee pour voir les modules disponibles
  const [selectedWeek, setSelectedWeek] = useState(null)

  const modulesByJour = groupByJour(modules)

  const modKey = (mod) => `${mod.nom}-${mod.site}`

  const getSelection = (mod) =>
    selected.find(s => modKey(s.mod) === modKey(mod))

  const isModuleSelected = (mod) => !!getSelection(mod)

  /** Clic sur un module dans la grille (la semaine est deja choisie) */
  const handleModuleClick = (mod) => {
    if (isModuleSelected(mod)) {
      setSelected(selected.filter(s => modKey(s.mod) !== modKey(mod)))
      return
    }
    if (selected.length >= maxSelection || !selectedWeek) return
    setSelected([...selected, { mod, semaine: selectedWeek }])
  }

  const removeSelection = (mod) => {
    setSelected(selected.filter(s => modKey(s.mod) !== modKey(mod)))
  }

  return (
    <div className="animate-fadeIn">
      {/* Retour accueil */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-white bg-cb-blue hover:bg-cb-blue/90
                   px-4 py-2 rounded-lg transition-colors cursor-pointer mt-6 mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour à l'accueil
      </button>

      {/* En-tete */}
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Modules métiers
        </h2>
        <p className="text-gray-600 text-sm">
          {selectedWeek
            ? `Sélectionnez 1 à ${maxSelection} modules pour la semaine ${selectedWeek.semaine}.`
            : 'Choisissez d\u2019abord une semaine pour voir les modules disponibles.'}
        </p>
      </div>

      {/* Selection de la semaine */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-3">
          {selectedWeek ? 'Semaine sélectionnée' : 'Quelle semaine vous intéresse ?'}
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {semaines.map((sem) => {
            const tooSoon = isSemaineTooSoon(sem)
            const isActive = selectedWeek && selectedWeek.semaine === sem.semaine

            return (
              <button
                key={sem.semaine}
                onClick={() => !tooSoon && setSelectedWeek(sem)}
                disabled={tooSoon}
                className={`flex items-center justify-between p-3 rounded-lg border-2 text-left transition-all duration-200
                  ${tooSoon
                    ? 'border-gray-100 bg-gray-50 cursor-not-allowed'
                    : isActive
                      ? 'border-cb-blue bg-cb-blue-light ring-2 ring-cb-blue cursor-pointer'
                      : 'border-gray-200 hover:border-cb-blue hover:bg-cb-blue-light cursor-pointer group'
                  }`}
              >
                <div>
                  <p className={`font-semibold transition-colors ${
                    tooSoon ? 'text-gray-400'
                    : isActive ? 'text-cb-blue'
                    : 'text-gray-900 group-hover:text-cb-blue'
                  }`}>
                    Semaine {sem.semaine}
                  </p>
                  <p className={`text-xs ${tooSoon ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDate(sem.dateDebut)} — {formatDate(sem.dateFin)}
                  </p>
                  {tooSoon && (
                    <p className="text-xs text-cb-red font-medium mt-0.5">Inscription fermée (J-7)</p>
                  )}
                </div>
                {isActive && (
                  <div className="w-5 h-5 bg-cb-blue rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {!tooSoon && !isActive && (
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-cb-blue transition-colors flex-shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grille des modules — visible uniquement apres selection d'une semaine */}
      {selectedWeek && (
        <>
          {/* Barre de selection + bouton inscription */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">
                  {selected.length === 0
                    ? 'Cliquez sur un module pour le sélectionner'
                    : `${selected.length}/${maxSelection} module${selected.length > 1 ? 's' : ''} sélectionné${selected.length > 1 ? 's' : ''}`}
                </p>
                {selected.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selected.map((s) => (
                      <span
                        key={modKey(s.mod)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: s.mod.couleur }}
                      >
                        {s.mod.nom} ({s.mod.site}) — S{s.semaine.semaine}
                        <button
                          onClick={() => removeSelection(s.mod)}
                          className="ml-0.5 hover:opacity-70 cursor-pointer"
                          aria-label={`Retirer ${s.mod.nom}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {selected.length > 0 && (
                <button
                  onClick={() => onGoToFormulaire({ modules: selected })}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-cb-accent text-white rounded-lg font-medium
                             hover:bg-cb-accent/90 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  S'inscrire
                </button>
              )}
            </div>
          </div>

          {/* Grille semaine type — elargie au-dela du conteneur parent */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-visible -mx-32 px-0">
            <div>
              <div className="min-w-[700px]">
                {/* En-tete jours */}
                <div className="grid grid-cols-[70px_repeat(5,1fr)] border-b border-gray-200">
                  <div className="p-3 bg-gray-50 text-xs font-medium text-gray-500 text-center">
                    Horaire
                  </div>
                  {JOURS_LABELS.map((jour) => (
                    <div key={jour} className="p-3 bg-gray-50 text-sm font-semibold text-gray-700 text-center border-l border-gray-200">
                      {jour}
                    </div>
                  ))}
                </div>

                {/* Corps */}
                <div className="grid grid-cols-[70px_repeat(5,1fr)]">
                  <div className="relative">
                    {HEURES.map((h) => (
                      <div key={h} className="h-[60px] border-b border-gray-100 flex items-start justify-center pt-1">
                        <span className="text-xs text-gray-400">{`${h}:00`}</span>
                      </div>
                    ))}
                  </div>

                  {JOURS.map((jour) => (
                    <div key={jour} className="relative border-l border-gray-200 overflow-visible" style={{ height: HEURES.length * 60 + 6 }}>
                      {HEURES.map((h) => (
                        <div key={h} className="absolute w-full border-b border-gray-100" style={{ top: (h - 7) * 60 + 60, height: 0 }} />
                      ))}

                      {modulesByJour[jour].map((mod) => {
                        const { top, height } = getModuleStyle(mod)
                        const isSel = isModuleSelected(mod)
                        const sel = getSelection(mod)
                        const available = mod.placesTotal - mod.placesUtilisees
                        const canSelect = isSel || selected.length < maxSelection

                        return (
                          <button
                            key={modKey(mod)}
                            onClick={() => canSelect && handleModuleClick(mod)}
                            className={`absolute left-1 right-1 rounded-lg p-2 transition-all duration-200 overflow-hidden
                              ${canSelect ? 'cursor-pointer hover:shadow-md hover:brightness-105' : 'cursor-not-allowed opacity-50'}
                              ${isSel ? 'ring-3 ring-cb-blue ring-offset-2 shadow-lg' : ''}
                            `}
                            style={{
                              top: top + 1,
                              height: height - 2,
                              backgroundColor: mod.couleur,
                              color: 'white',
                            }}
                            title={`${mod.nom} — ${mod.site} (${available} place${available > 1 ? 's' : ''} disponible${available > 1 ? 's' : ''})`}
                          >
                            <div className="flex flex-col items-center justify-between h-full overflow-hidden text-center">
                              <div className="pt-1">
                                <p className="font-bold text-sm leading-tight drop-shadow-sm">{mod.nom}</p>
                                <p className="text-xs opacity-90 drop-shadow-sm">{mod.site}</p>
                              </div>
                              <span className="text-5xl drop-shadow-sm">{MODULE_ICONS[mod.nom] || '📋'}</span>
                              {isSel && sel ? (
                                <p className="text-xs font-semibold bg-white/30 rounded px-1 mb-1">S{sel.semaine.semaine}</p>
                              ) : (
                                <p className="text-xs font-bold opacity-90 mb-1">Place{available > 1 ? 's' : ''} restante{available > 1 ? 's' : ''} : {available}</p>
                              )}
                            </div>
                            {isSel && (
                              <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-cb-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legende */}
          <div className="mt-3 flex flex-wrap gap-3 justify-center">
            {modules.filter((m, i, arr) => arr.findIndex(a => a.nom === m.nom) === i).map((mod) => (
              <div key={mod.nom} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: mod.couleur }} />
                {mod.nom}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
