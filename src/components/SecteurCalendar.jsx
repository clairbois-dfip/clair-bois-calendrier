/**
 * SecteurCalendar.jsx — Ecran 3 : Calendrier mensuel d'un secteur.
 *
 * Affiche un calendrier en grille avec navigation mois par mois.
 * Structure de la grille : 8 colonnes (Sem. + Lun a Dim).
 *
 * Code couleur des semaines :
 *  - Vert   : >50% des places disponibles
 *  - Orange  : 1-50% des places
 *  - Rouge   : complet
 *  - Gris    : pas de creneau cette semaine
 *
 * Gestion des creneaux chevauchants :
 *  Quand plusieurs creneaux couvrent la meme semaine, le numero de semaine
 *  affiche le nombre entre parentheses (ex: "S13 (2)"). Les creneaux sont
 *  agreges par aggregateWeekCreneaux() dans helpers.js.
 *
 * Au clic sur une semaine coloree, l'utilisateur accede au detail (WeekDetail).
 *
 * @param {Object}   props.etablissement        - L'etablissement parent
 * @param {Object}   props.secteur              - Le secteur selectionne
 * @param {string}   props.formsUrlNouveauSecteur - URL du formulaire "Gestion des creneaux"
 * @param {Function} props.onSelectWeek         - Callback quand une semaine est cliquee
 * @param {Function} props.onBackToEtablissement - Retour au niveau etablissement
 * @param {Function} props.onBackToHome         - Retour a l'accueil
 */
import { useState } from 'react'
import Breadcrumb from './Breadcrumb'
import InfoBulle from './InfoBulle'
import {
  getCalendarDays,
  groupByWeeks,
  getMonthName,
  getISOWeekNumber,
  getStatusColor,
  getStatusBgLight,
  aggregateWeekCreneaux,
} from '../utils/helpers'

export default function SecteurCalendar({
  etablissement,
  secteur,
  formsUrlNouveauSecteur,
  onSelectWeek,
  onBackToEtablissement,
  onBackToHome,
}) {
  // Initialiser le calendrier au mois courant
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())

  /* Fil d'Ariane : Accueil > Etablissement > Secteur */
  const breadcrumbItems = [
    { label: 'Accueil', onClick: onBackToHome },
    { label: etablissement.name, onClick: onBackToEtablissement },
    { label: secteur.name },
  ]

  /* --- Navigation entre les mois --- */
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // Index des semaines agregeant les creneaux chevauchants.
  // Cle : "annee-numSemaine" (ex: "2026-13"), Valeur : { creneaux[], totalSlots, ... }
  const weekIndex = aggregateWeekCreneaux(secteur.weeks)

  // Generer la grille du calendrier pour le mois affiche
  const calendarDays = getCalendarDays(currentMonth, currentYear)
  const calendarWeeks = groupByWeeks(calendarDays)

  // En-tetes des jours (semaine commencant le lundi)
  const joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <div className="animate-fadeIn">
      <Breadcrumb items={breadcrumbItems} />

      {/* Bouton retour */}
      <button
        onClick={onBackToEtablissement}
        className="inline-flex items-center gap-2 text-sm font-medium text-white bg-cb-blue hover:bg-cb-blue/90
                   px-4 py-2 rounded-lg transition-colors cursor-pointer mt-6 mb-4"
        aria-label="Retour à l'établissement"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour
      </button>

      {/* Titre du secteur */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{secteur.name}</h2>
        <p className="text-gray-500">{secteur.description}</p>
      </div>

      {/* Carte du calendrier */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Barre de navigation du mois (< mois annee >) */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Mois précédent"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h3 className="text-lg font-semibold text-gray-900 capitalize">
            {getMonthName(currentMonth, currentYear)}
          </h3>

          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Mois suivant"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Grille du calendrier (8 colonnes : Sem + 7 jours) */}
        <div className="p-2 md:p-4">
          {/* En-tetes des jours de la semaine */}
          <div className="grid grid-cols-8 gap-1 mb-1">
            <div className="text-xs font-medium text-gray-400 text-center py-1">Sem.</div>
            {joursSemaine.map((jour) => (
              <div key={jour} className="text-xs font-medium text-gray-400 text-center py-1">
                {jour}
              </div>
            ))}
          </div>

          {/* Lignes du calendrier (une par semaine) */}
          {calendarWeeks.map((week, weekIdx) => {
            // Trouver le premier jour reel de cette semaine pour determiner le numero ISO
            const firstRealDay = week.find((d) => d !== null)
            if (!firstRealDay) return null

            const weekNum = getISOWeekNumber(firstRealDay)

            // Gerer le cas ou la semaine ISO chevauche le changement d'annee
            const weekYear = firstRealDay.getMonth() === 0 && weekNum > 50
              ? firstRealDay.getFullYear() - 1
              : firstRealDay.getMonth() === 11 && weekNum === 1
                ? firstRealDay.getFullYear() + 1
                : firstRealDay.getFullYear()

            // Chercher les donnees de disponibilite pour cette semaine
            const weekData = weekIndex[`${weekYear}-${weekNum}`]
            const hasData = !!weekData

            // Completer la semaine a 7 jours (cases vides en fin de mois)
            const paddedWeek = [...week]
            while (paddedWeek.length < 7) paddedWeek.push(null)

            return (
              <div
                key={weekIdx}
                className={`grid grid-cols-8 gap-1 mb-1 rounded-lg transition-all duration-200 ${
                  hasData
                    ? 'cursor-pointer hover:scale-[1.02] hover:shadow-sm'
                    : ''
                }`}
                onClick={() => hasData && onSelectWeek(weekData)}
                role={hasData ? 'button' : undefined}
                tabIndex={hasData ? 0 : undefined}
                onKeyDown={(e) => {
                  if (hasData && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    onSelectWeek(weekData)
                  }
                }}
                aria-label={
                  hasData
                    ? `Semaine ${weekNum}${weekData.creneaux.length > 1 ? ` (${weekData.creneaux.length} créneaux)` : ''} — ${weekData.totalSlots - weekData.usedSlots} places disponibles`
                    : undefined
                }
              >
                {/* Colonne "Sem." : numero de semaine ISO + nombre de creneaux si >1 */}
                <div
                  className={`text-xs text-center py-2 rounded-l-lg font-medium ${
                    hasData ? getStatusColor(weekData.status) : 'text-gray-300'
                  }`}
                >
                  S{weekNum}{hasData && weekData.creneaux.length > 1 ? ` (${weekData.creneaux.length})` : ''}
                </div>

                {/* Cellules des 7 jours de la semaine */}
                {paddedWeek.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`text-sm text-center py-2 ${
                      dayIdx === 6 ? 'rounded-r-lg' : ''
                    } ${
                      day === null
                        ? ''
                        : hasData
                          ? getStatusBgLight(weekData.status) + ' border'
                          : 'text-gray-400'
                    } ${
                      // Marqueur "aujourd'hui" : cercle bleu autour du jour actuel
                      day && day.toDateString() === new Date().toDateString()
                        ? 'font-bold ring-2 ring-cb-blue rounded'
                        : ''
                    }`}
                  >
                    {day ? day.getDate() : ''}
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Legende du code couleur */}
        <div className="flex flex-wrap gap-4 px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cb-green" />
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cb-orange" />
            <span>Presque complet</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cb-red" />
            <span>Complet</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cb-gray" />
            <span>Pas de données</span>
          </div>
        </div>
      </div>

      {/* Bouton "Ajouter un creneau" pour les referents cadres.
          L'URL pre-remplit l'etablissement (rb1c6311a...) et le secteur (r69f25417...) */}
      {formsUrlNouveauSecteur && (
        <div className="mt-4 text-center">
          <a
            href={`${formsUrlNouveauSecteur}&rb1c6311a61044eb184fa3270fd065e32=${encodeURIComponent(etablissement.name)}&r69f254172ecd4baa9c92b2ef2d86f48c=${encodeURIComponent(secteur.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-cb-blue
                       transition-colors group py-2 px-4 rounded-lg hover:bg-cb-blue/5"
          >
            <span className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300
                             group-hover:border-cb-blue flex items-center justify-center
                             transition-colors shrink-0">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <span>Ajouter un créneau pour {secteur.name}</span>
            <InfoBulle>
              <p className="font-semibold mb-1">Espace référent cadre</p>
              <p>Vous êtes <strong>responsable de ce secteur</strong> ? Proposez un nouveau créneau de stage. Un <strong>code d'accès</strong> vous sera demandé.</p>
            </InfoBulle>
          </a>
        </div>
      )}
    </div>
  )
}
