/**
 * ModulesMetiers.jsx — Vue "Semaine type" des modules metiers.
 *
 * Flow : 1) Voir la grille des modules → 2) Cliquer un module → choisir une semaine
 *        → 3) Repeter pour max 3 modules → 4) S'inscrire (1 seul formulaire)
 *
 * Chaque module peut etre associe a une semaine differente.
 * Un seul formulaire est soumis a la fin avec toutes les associations.
 */
import { useState } from 'react'
import { formatDate } from '../utils/helpers'

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

/** URLs des formulaires selon le chemin d'aiguillage */
const MODULES_FORMS_URLS = {
  // Modules + moi-même → Form 6 (modules-participant)
  'moi': 'https://forms.office.com/e/2TwtdawF7s',
  // Modules + référent → Form 2 (modules-partenaire)
  'autre': 'https://forms.office.com/e/rTA3ZiwUVb',
}

export default function ModulesMetiers({ modulesMetiers, formsUrl, chemin, onBack }) {
  const { modules, semaines, maxSelection, formsUrlModules } = modulesMetiers
  // selected = [{ mod, semaine }] — chaque entree lie un module a une semaine
  const [selected, setSelected] = useState([])
  // Module en cours de choix de semaine (popup)
  const [pickingWeekFor, setPickingWeekFor] = useState(null)

  const modulesByJour = groupByJour(modules)

  const modKey = (mod) => `${mod.nom}-${mod.site}`

  const getSelection = (mod) =>
    selected.find(s => modKey(s.mod) === modKey(mod))

  const isModuleSelected = (mod) => !!getSelection(mod)

  const handleModuleClick = (mod) => {
    if (isModuleSelected(mod)) {
      // Deselectionner
      setSelected(selected.filter(s => modKey(s.mod) !== modKey(mod)))
      return
    }
    if (selected.length >= maxSelection) return
    // Ouvrir le choix de semaine
    setPickingWeekFor(mod)
  }

  const assignWeek = (semaine) => {
    if (!pickingWeekFor) return
    setSelected([...selected, { mod: pickingWeekFor, semaine }])
    setPickingWeekFor(null)
  }

  const removeSelection = (mod) => {
    setSelected(selected.filter(s => modKey(s.mod) !== modKey(mod)))
  }

  const buildInscriptionUrl = () => {
    // Choisir le bon formulaire selon l'aiguillage (moi-même vs référent)
    const base = (chemin ? MODULES_FORMS_URLS[chemin.pourQui] : null) || formsUrlModules || formsUrl
    // Encode chaque module avec sa semaine dans le champ modules
    const modulesStr = selected
      .map(s => `${s.mod.nom} (${s.mod.site}) — S${s.semaine.semaine} du ${s.semaine.dateDebut} au ${s.semaine.dateFin}`)
      .join(', ')
    return `${base}?rc347ff44177743a8b9561f6d6f9eed2c=${encodeURIComponent(modulesStr)}`
  }

  return (
    <div className="animate-fadeIn">
      {/* Retour accueil */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-cb-blue hover:text-cb-blue/80 mb-4 cursor-pointer"
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
          Sélectionnez 1 à {maxSelection} modules puis associez chacun à une semaine.
        </p>
      </div>

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
            <a
              href={buildInscriptionUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cb-green text-white rounded-lg font-medium
                         hover:bg-cb-green/90 transition-colors whitespace-nowrap no-underline"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              S'inscrire
            </a>
          )}
        </div>
      </div>

      {/* Grille semaine type */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
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
                <div key={jour} className="relative border-l border-gray-200" style={{ height: HEURES.length * 60 }}>
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
                        className={`absolute left-1 right-1 rounded-lg p-2 text-left transition-all duration-200
                          ${canSelect ? 'cursor-pointer hover:scale-[1.02] hover:shadow-md' : 'cursor-not-allowed opacity-50'}
                          ${isSel ? 'ring-3 ring-cb-blue ring-offset-1 shadow-lg scale-[1.02]' : ''}
                        `}
                        style={{
                          top: top + 1,
                          height: height - 2,
                          backgroundColor: isSel ? mod.couleur : mod.couleur + 'cc',
                          color: 'white',
                        }}
                        title={`${mod.nom} — ${mod.site} (${available} place${available > 1 ? 's' : ''} disponible${available > 1 ? 's' : ''})`}
                      >
                        <div className="flex flex-col justify-between h-full overflow-hidden">
                          <div>
                            <p className="font-bold text-sm leading-tight drop-shadow-sm">{mod.nom}</p>
                            <p className="text-xs opacity-90 drop-shadow-sm">{mod.site}</p>
                          </div>
                          {isSel && sel ? (
                            <p className="text-xs font-semibold mt-1 bg-white/30 rounded px-1 inline-block w-fit">S{sel.semaine.semaine}</p>
                          ) : (
                            <p className="text-xs opacity-80 mt-1">{available}/{mod.placesTotal} pl.</p>
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

      {/* Popup choix de semaine */}
      {pickingWeekFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setPickingWeekFor(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {pickingWeekFor.nom} ({pickingWeekFor.site})
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Pour quelle semaine souhaitez-vous suivre ce module ?
            </p>

            <div className="grid gap-2">
              {semaines.map((sem) => (
                <button
                  key={sem.semaine}
                  onClick={() => assignWeek(sem)}
                  className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200
                             hover:border-cb-blue hover:bg-cb-blue-light transition-all duration-200
                             cursor-pointer text-left group"
                >
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-cb-blue transition-colors">
                      Semaine {sem.semaine}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(sem.dateDebut)} — {formatDate(sem.dateFin)}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-cb-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>

            <button
              onClick={() => setPickingWeekFor(null)}
              className="mt-4 w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
