/**
 * WeekDetail.jsx — Ecran 4 : Detail d'une semaine avec inscription.
 *
 * Affiche le detail complet d'une semaine selectionnee dans le calendrier :
 *  - Resume global (places disponibles / totales, barre de progression)
 *  - Informations du secteur et de l'etablissement
 *  - Bouton d'inscription pointant vers Microsoft Forms (pre-rempli)
 *
 * Gestion des creneaux multiples :
 *  Quand plusieurs creneaux couvrent la meme semaine (agregation par
 *  aggregateWeekCreneaux dans helpers.js), chaque creneau est affiche
 *  individuellement avec sa propre barre de progression et son bouton
 *  d'inscription. Le resume en haut montre les totaux agreges.
 *
 * Retrocompatibilite :
 *  Si `week.creneaux` n'existe pas (ancien format JSON), le composant
 *  traite `week` comme un creneau unique via `week.creneaux || [week]`.
 *
 * @param {Object}   props.etablissement        - L'etablissement parent
 * @param {Object}   props.secteur              - Le secteur parent
 * @param {Object}   props.week                 - Donnees de la semaine (aggregees ou simples)
 * @param {string}   props.formsUrl             - URL de base du formulaire d'inscription
 * @param {Function} props.onBackToCalendar     - Retour au calendrier du secteur
 * @param {Function} props.onBackToEtablissement - Retour au niveau etablissement
 * @param {Function} props.onBackToHome         - Retour a l'accueil
 */
import Breadcrumb from './Breadcrumb'
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
  computeStatus,
} from '../utils/helpers'

/**
 * ProgressBar — Composant interne de barre de progression.
 *
 * Affiche visuellement le ratio de places disponibles sous forme de :
 *  - Un compteur grand format (ex: "5 / 8 places")
 *  - Une barre de progression coloree selon le statut
 *  - Un resume textuel (occupees / libres)
 *
 * @param {number} props.totalSlots - Nombre total de places du creneau
 * @param {number} props.usedSlots  - Nombre de places occupees
 * @param {string} props.status     - Statut couleur ('available' | 'almost_full' | 'full')
 */
function ProgressBar({ totalSlots, usedSlots, status }) {
  const available = totalSlots - usedSlots
  const percentage = totalSlots > 0 ? (available / totalSlots) * 100 : 0

  return (
    <div>
      <div className="flex items-end justify-between mb-2">
        <span className="text-3xl font-bold text-gray-900">{available}</span>
        <span className="text-gray-500">
          / {totalSlots} place{totalSlots > 1 ? 's' : ''}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-2">
        place{available > 1 ? 's' : ''} disponible{available > 1 ? 's' : ''}
      </p>

      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-700 ${
            status === 'available'
              ? 'bg-cb-green'
              : status === 'almost_full'
                ? 'bg-cb-orange'
                : 'bg-cb-red'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{usedSlots} occupée{usedSlots > 1 ? 's' : ''}</span>
        <span>{available} libre{available > 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}

export default function WeekDetail({
  etablissement,
  secteur,
  week,
  onInscription,
  onBackToCalendar,
  onBackToEtablissement,
  onBackToHome,
}) {
  const creneaux = week.creneaux || [week]
  const isMulti = creneaux.length > 1
  const available = week.totalSlots - week.usedSlots

  /* Fil d'Ariane : Accueil > Etablissement > Secteur > Semaine N */
  const breadcrumbItems = [
    { label: 'Accueil', onClick: onBackToHome },
    { label: etablissement.name, onClick: onBackToEtablissement },
    { label: secteur.name, onClick: onBackToCalendar },
    { label: `Semaine ${week.weekNumber}` },
  ]

  return (
    <div className="animate-fadeIn">
      <Breadcrumb items={breadcrumbItems} />

      {/* Bouton retour */}
      <button
        onClick={onBackToCalendar}
        className="inline-flex items-center gap-2 text-sm font-medium text-white bg-cb-blue hover:bg-cb-blue/90
                   px-4 py-2 rounded-lg transition-colors cursor-pointer mt-6 mb-4"
        aria-label="Retour au calendrier"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour au calendrier
      </button>

      {/* Carte détail semaine */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-lg mx-auto">
        {/* En-tete coloree selon le statut global de la semaine */}
        <div className={`px-6 py-4 ${getStatusColor(week.status)}`}>
          <h2 className="text-xl font-bold">
            Semaine {week.weekNumber}
          </h2>
          {isMulti ? (
            <p className="text-sm opacity-90">{creneaux.length} créneaux cette semaine</p>
          ) : (
            <p className="text-sm opacity-90">
              {formatDate(creneaux[0].startDate)} — {formatDate(creneaux[0].endDate)}
            </p>
          )}
        </div>

        <div className="p-6">
          {/* Badge de statut global (vert / orange / rouge) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Disponibilité</span>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(week.status)}`}
              >
                {getStatusLabel(week.status)}
              </span>
            </div>
          </div>

          {/* Barre de progression globale (totaux agreges) */}
          <div className="mb-6">
            <ProgressBar
              totalSlots={week.totalSlots}
              usedSlots={week.usedSlots}
              status={week.status}
            />
          </div>

          {/* Encart recapitulatif : etablissement + secteur */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Établissement :</span> {etablissement.name}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Secteur :</span> {secteur.name}
            </p>
            <p className="text-sm text-gray-500 mt-1">{secteur.description}</p>
          </div>

          {/* Mode creneau unique : bouton d'inscription ou message "complet" */}
          {!isMulti && (
            <>
              {available > 0 ? (
                <button
                  onClick={() => onInscription(creneaux[0])}
                  className="block w-full bg-cb-accent hover:bg-cb-accent/90 text-white text-center
                             font-semibold py-3 px-6 rounded-lg transition-colors duration-200
                             focus:outline-none focus:ring-2 focus:ring-cb-accent focus:ring-offset-2
                             cursor-pointer"
                >
                  S'inscrire pour cette semaine
                </button>
              ) : (
                <div
                  className="block w-full bg-gray-300 text-gray-500 text-center
                              font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
                >
                  Complet — Aucune place disponible
                </div>
              )}
            </>
          )}

          {/* Mode multi-creneaux : chaque creneau est affiche individuellement
              avec sa propre barre de progression et son bouton d'inscription */}
          {isMulti && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">
                Détail des créneaux
              </h3>
              {creneaux.map((c, i) => {
                const cAvailable = c.totalSlots - c.usedSlots
                const cStatus = computeStatus(c.totalSlots, c.usedSlots)

                return (
                  <div key={`${c.startDate}-${c.endDate}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-800">
                        {formatDate(c.startDate)} — {formatDate(c.endDate)}
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(cStatus)}`}
                      >
                        {getStatusLabel(cStatus)}
                      </span>
                    </div>

                    <ProgressBar totalSlots={c.totalSlots} usedSlots={c.usedSlots} status={cStatus} />

                    <div className="mt-3">
                      {cAvailable > 0 ? (
                        <button
                          onClick={() => onInscription(c)}
                          className="block w-full bg-cb-accent hover:bg-cb-accent/90 text-white text-center
                                     font-semibold py-2 px-4 rounded-lg transition-colors duration-200
                                     focus:outline-none focus:ring-2 focus:ring-cb-accent focus:ring-offset-2
                                     text-sm cursor-pointer"
                        >
                          S'inscrire
                        </button>
                      ) : (
                        <div
                          className="block w-full bg-gray-300 text-gray-500 text-center
                                      font-semibold py-2 px-4 rounded-lg cursor-not-allowed text-sm"
                        >
                          Complet
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
