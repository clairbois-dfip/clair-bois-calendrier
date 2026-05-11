/**
 * EtablissementPage.jsx — Ecran 2 : Page d'un etablissement.
 *
 * Affiche les secteurs de stage disponibles dans l'etablissement selectionne.
 * Chaque carte de secteur montre :
 *  - Le nom du secteur
 *  - Le ratio places disponibles / places totales (badge couleur)
 *  - Une barre de progression visuelle
 *  - Un statut global (vert = >50%, orange = 1-50%, rouge = complet)
 *
 * Comprend aussi un bouton "Ajouter un secteur" (referent cadre) qui ouvre
 * le formulaire Microsoft Forms avec le nom de l'etablissement pre-rempli.
 *
 * @param {Object}   props.etablissement        - L'etablissement selectionne
 * @param {string}   props.formsUrlNouveauSecteur - URL du formulaire "Gestion des creneaux"
 * @param {Function} props.onSelectSecteur      - Callback quand un secteur est choisi
 * @param {Function} props.onBack               - Callback pour retourner a l'accueil
 */
import Breadcrumb from './Breadcrumb'
import InfoBulle from './InfoBulle'
import { getStatusColor, getUniqueCreneaux } from '../utils/helpers'

export default function EtablissementPage({
  etablissement,
  formsUrlNouveauSecteur,
  onSelectSecteur,
  onBack,
}) {
  /* Fil d'Ariane : Accueil > Nom de l'etablissement */
  const breadcrumbItems = [
    { label: 'Accueil', onClick: onBack },
    { label: etablissement.name },
  ]

  return (
    <div className="animate-fadeIn">
      <Breadcrumb items={breadcrumbItems} onNavigate={onBack} />

      {/* Bouton retour */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-white bg-cb-blue hover:bg-cb-blue/90
                   px-4 py-2 rounded-lg transition-colors cursor-pointer mt-6 mb-4"
        aria-label="Retour à l'accueil"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour
      </button>

      {/* En-tete de l'etablissement (icone + nom + description) */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl" role="img" aria-hidden="true">
          {etablissement.icon}
        </span>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{etablissement.name}</h2>
          <p className="text-gray-500">{etablissement.description}</p>
        </div>
      </div>

      {/* Titre de la grille des secteurs */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Choisissez un secteur de stage
      </h3>

      {/* Grille des cartes secteurs (responsive : 1/2 colonnes) */}
      <div className="grid gap-4 sm:grid-cols-2">
        {etablissement.secteurs.map((secteur) => {
          // Dedupliquer les creneaux pour un comptage correct des places
          const creneaux = getUniqueCreneaux(secteur.weeks)
          const availablePlaces = creneaux.reduce((sum, w) => sum + Math.max(0, w.totalSlots - w.usedSlots), 0)
          const totalPlaces = creneaux.reduce((sum, w) => sum + w.totalSlots, 0)

          // Determiner le statut global du secteur pour la couleur
          let globalStatus = 'full'
          if (totalPlaces > 0 && availablePlaces / totalPlaces > 0.5) globalStatus = 'available'
          else if (availablePlaces > 0) globalStatus = 'almost_full'

          return (
            <button
              key={secteur.id}
              onClick={() => onSelectSecteur(secteur)}
              className="bg-white rounded-xl border border-gray-200 p-5 text-left
                         hover:border-cb-blue hover:shadow-md transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-cb-blue focus:ring-offset-2
                         cursor-pointer group"
              aria-label={`Voir le calendrier de ${secteur.name}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 group-hover:text-cb-blue transition-colors">
                  {secteur.name}
                </h4>
                {/* Badge avec ratio de places et couleur du statut */}
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(globalStatus)}`}
                >
                  {availablePlaces}/{totalPlaces} place{totalPlaces > 1 ? 's' : ''}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-3">{secteur.description}</p>

              {/* Barre de progression visuelle (largeur proportionnelle aux places disponibles) */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    globalStatus === 'available'
                      ? 'bg-cb-green'
                      : globalStatus === 'almost_full'
                        ? 'bg-cb-orange'
                        : 'bg-cb-red'
                  }`}
                  style={{
                    width: `${totalPlaces > 0 ? (availablePlaces / totalPlaces) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {availablePlaces} place{availablePlaces > 1 ? 's' : ''} disponible{availablePlaces > 1 ? 's' : ''}
              </p>
            </button>
          )
        })}

        {/* Carte "Ajouter un secteur" pour les referents cadres.
            L'URL du formulaire est enrichie du nom de l'etablissement en parametre
            (ID Forms rb1c6311a...) pour pre-remplir le champ. */}
        <a
          href={`${formsUrlNouveauSecteur}&rb1c6311a61044eb184fa3270fd065e32=${encodeURIComponent(etablissement.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border-2 border-dashed border-gray-300 p-5 text-center
                     hover:border-cb-blue hover:bg-cb-blue-light transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-cb-blue focus:ring-offset-2
                     cursor-pointer group flex flex-col items-center justify-center gap-3 min-h-[120px]"
          aria-label="Proposer un nouveau secteur"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-cb-blue/10 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-cb-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-500 group-hover:text-cb-blue transition-colors text-sm inline-flex items-center gap-1.5">
              Ajouter un secteur
              <InfoBulle>
                <p className="font-semibold mb-1">Espace réservé aux responsables</p>
                <p>Vous êtes <strong>responsable de secteur</strong> dans cet établissement ? Vous pouvez proposer un nouveau secteur de stage. Un <strong>code d'accès</strong> vous sera demandé pour valider votre demande.</p>
              </InfoBulle>
            </p>
            <p className="text-xs text-gray-400 mt-1">Espace référent cadre</p>
          </div>
        </a>
      </div>
    </div>
  )
}
