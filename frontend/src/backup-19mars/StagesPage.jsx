/**
 * StagesPage.jsx — Parcours "Demande de stage".
 *
 * Flow : 1) Choisir un secteur → 2) Calendrier avec selection de plage
 *        (14 jours apres aujourd'hui grises) → 3) S'inscrire (prefill Forms)
 */
import { useState } from 'react'
import { formatDate, getCalendarDays, groupByWeeks } from '../utils/helpers'

const JOURS_COURT = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

const SECTEURS = [
  { id: 'asa', nom: 'ASA', icon: '🤝', description: 'Assistant·e socio-éducatif·ve — accompagnement au quotidien' },
  { id: 'ase', nom: 'ASE', icon: '👥', description: 'Assistant·e socio-éducatif·ve — encadrement éducatif' },
  { id: 'assc', nom: 'ASSC', icon: '🏥', description: 'Assistant·e en soins et santé communautaire' },
  { id: 'cuisine', nom: 'Cuisine', icon: '🍳', description: 'Préparation des repas et apprentissage culinaire' },
  { id: 'restauration', nom: 'Restauration', icon: '🍽️', description: 'Service en salle et gestion de la restauration' },
  { id: 'patisserie-boulangerie', nom: 'Pâtisserie-boulangerie', icon: '🥐', description: 'Confection de pains, viennoiseries et pâtisseries' },
  { id: 'nettoyage', nom: 'Nettoyage', icon: '🧹', description: 'Entretien des locaux et hygiène professionnelle' },
  { id: 'exploitation', nom: 'Exploitation', icon: '🏢', description: 'Gestion et maintenance des bâtiments' },
  { id: 'peinture', nom: 'Peinture', icon: '🎨', description: 'Travaux de peinture intérieure et extérieure' },
  { id: 'graphisme', nom: 'Graphisme', icon: '🖌️', description: 'Création graphique et mise en page' },
  { id: 'audio-visuel', nom: 'Audio-visuel', icon: '🎬', description: 'Production vidéo, son et montage' },
  { id: 'mediamatique', nom: 'Médiamatique', icon: '💻', description: 'Communication numérique et multimédia' },
  { id: 'intendance', nom: 'Intendance', icon: '🏠', description: 'Gestion du ménage et de l\'économie domestique' },
  { id: 'lingerie', nom: 'Lingerie', icon: '👕', description: 'Blanchisserie, repassage et entretien du linge' },
  { id: 'informatique', nom: 'Informatique', icon: '🖥️', description: 'Support technique et développement informatique' },
  { id: 'confection', nom: 'Confection', icon: '🧵', description: 'Couture, retouches et travaux textiles' },
  { id: 'autre', nom: 'Autre', icon: '📋', description: 'Autre secteur — précisez dans le formulaire' },
]

function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isBetween(date, start, end) {
  if (!start || !end) return false
  return date >= start && date <= end
}

/** URLs des formulaires selon le chemin d'aiguillage */
const FORMS_URLS = {
  // Stage + moi-même + NON → Form 1 (stage-stagiaire)
  'stages-moi-non': 'https://forms.office.com/e/pcHEHRRk6x',
  // Stage + référent + NON → Form 7 (stage-partenaire)
  'stages-autre-non': 'https://forms.office.com/e/3SZvXC6kb5',
  // Stage + moi-même + OUI → Form 3 (Retour à CB)
  'stages-moi-oui': 'https://forms.office.com/e/WMBW4GWVdW',
  // Stage + référent + OUI → Form 7 (stage-partenaire) — même form, PA gère le doublon
  'stages-autre-oui': 'https://forms.office.com/e/3SZvXC6kb5',
}

export default function StagesPage({ formsUrl, chemin, onBack }) {
  const [selectedSecteur, setSelectedSecteur] = useState(null)
  const [rangeStart, setRangeStart] = useState(null)
  const [rangeEnd, setRangeEnd] = useState(null)

  // Calendrier : mois courant affiché
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const minDate = new Date(today)
  minDate.setDate(minDate.getDate() + 14)

  const [viewMonth, setViewMonth] = useState(minDate.getMonth())
  const [viewYear, setViewYear] = useState(minDate.getFullYear())

  const calendarDays = getCalendarDays(viewMonth, viewYear)
  const weeks = groupByWeeks(calendarDays)

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('fr-CH', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const isDisabled = (date) => {
    if (!date) return true
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d < minDate
  }

  const handleDayClick = (date) => {
    if (!date || isDisabled(date)) return
    if (!rangeStart || (rangeStart && rangeEnd)) {
      // Premier clic ou reset
      setRangeStart(date)
      setRangeEnd(null)
    } else {
      // Deuxième clic
      if (date < rangeStart) {
        setRangeStart(date)
        setRangeEnd(rangeStart)
      } else {
        setRangeEnd(date)
      }
    }
  }

  const getDayClasses = (date) => {
    if (!date) return ''
    if (isDisabled(date)) return 'text-gray-300 cursor-not-allowed'

    const isStart = rangeStart && isSameDay(date, rangeStart)
    const isEnd = rangeEnd && isSameDay(date, rangeEnd)
    const inRange = rangeStart && rangeEnd && isBetween(date, rangeStart, rangeEnd)

    if (isStart || isEnd) return 'bg-cb-blue text-white font-bold rounded-lg'
    if (inRange) return 'bg-cb-blue/15 text-cb-blue font-medium'
    return 'hover:bg-gray-100 cursor-pointer text-gray-700'
  }

  const buildStageUrl = () => {
    if (!selectedSecteur || !rangeStart) return '#'
    // Déterminer le bon formulaire selon le chemin d'aiguillage
    const cheminKey = `stages-${chemin.pourQui}-${chemin.dejaInscrit ? 'oui' : 'non'}`
    const base = FORMS_URLS[cheminKey] || formsUrl
    const e = encodeURIComponent
    const secteurStr = selectedSecteur.nom
    const dateDebut = toDateStr(rangeStart)
    const dateFin = rangeEnd ? toDateStr(rangeEnd) : dateDebut
    // IDs de pré-remplissage (communs à la plupart des forms)
    return `${base}?r1faa50a65150406b95d3a62e45550e40=${e(secteurStr)}&r50efe78018854247bf6e734db7188d70=${e(dateDebut)}&r77ae6366339446f39c90be5aa93b3a71=${e(dateFin)}`
  }

  const resetAll = () => {
    setSelectedSecteur(null)
    setRangeStart(null)
    setRangeEnd(null)
  }

  // Etape 1 : choix du secteur
  if (!selectedSecteur) {
    return (
      <div className="animate-fadeIn">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-cb-blue hover:text-cb-blue/80 mb-4 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour à l'accueil
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Demande de stage
          </h2>
          <p className="text-gray-600 text-sm">
            Choisissez le secteur dans lequel vous souhaitez effectuer votre stage.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTEURS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSecteur(sec)}
              className="bg-white rounded-xl border-2 border-gray-200 p-5 text-left
                         hover:border-cb-green hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{sec.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-cb-green transition-colors">
                    {sec.nom}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{sec.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-cb-green text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Choisir ce secteur
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Etape 2 : calendrier avec selection de plage
  return (
    <div className="animate-fadeIn">
      <button
        onClick={resetAll}
        className="flex items-center gap-1.5 text-sm text-cb-blue hover:text-cb-blue/80 mb-4 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Changer de secteur
      </button>

      {/* En-tete */}
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          {selectedSecteur.icon} {selectedSecteur.nom}
        </h2>
        <p className="text-gray-600 text-sm">
          Sélectionnez vos dates de stage souhaitées. Les 14 prochains jours ne sont pas disponibles.
        </p>
      </div>

      {/* Résumé sélection */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex-1 min-w-0">
            {!rangeStart ? (
              <p className="text-sm text-gray-500">Cliquez sur une date pour définir le début de votre stage</p>
            ) : !rangeEnd ? (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Début :</span> {formatDate(toDateStr(rangeStart))}
                <span className="text-gray-400 ml-2">— Cliquez sur une autre date pour la fin</span>
              </p>
            ) : (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Du</span> {formatDate(toDateStr(rangeStart))}
                <span className="font-medium"> au</span> {formatDate(toDateStr(rangeEnd))}
              </p>
            )}
          </div>
          {rangeStart && (
            <div className="flex gap-2">
              <button
                onClick={() => { setRangeStart(null); setRangeEnd(null) }}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg cursor-pointer transition-colors"
              >
                Réinitialiser
              </button>
              <a
                href={buildStageUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 bg-cb-green text-white rounded-lg font-medium
                           hover:bg-cb-green/90 transition-colors whitespace-nowrap no-underline text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                S'inscrire
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Navigation mois */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-gray-900 capitalize">{monthLabel}</h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {JOURS_COURT.map((j) => (
            <div key={j} className="p-2 text-center text-xs font-semibold text-gray-500 bg-gray-50">
              {j}
            </div>
          ))}
        </div>

        {/* Grille jours */}
        <div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => (
                <button
                  key={di}
                  onClick={() => handleDayClick(day)}
                  disabled={!day || isDisabled(day)}
                  className={`p-3 text-center text-sm transition-all duration-150 border-b border-r border-gray-50
                    ${getDayClasses(day)}
                    ${!day ? 'invisible' : ''}
                    ${isSameDay(day, today) && !isDisabled(day) ? 'ring-1 ring-inset ring-gray-300' : ''}
                  `}
                >
                  {day ? day.getDate() : ''}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 flex flex-wrap gap-4 justify-center text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-200" />
          Non disponible (14 jours)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-cb-blue" />
          Date sélectionnée
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-cb-blue/15" />
          Période de stage
        </div>
      </div>
    </div>
  )
}
