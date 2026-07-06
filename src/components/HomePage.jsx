/**
 * HomePage.jsx — Ecran d'accueil : point d'entree de tous les parcours.
 *
 * Les deux parcours principaux sont intentionnellement separes en deux cartes distinctes
 * car ils s'adressent a des besoins differents et menent a des flux differents :
 *  - Modules metiers : decouverte libre, max 3 modules, semaine type (pas de dates fixes)
 *  - Stages : demande sur des dates precises dans un secteur choisi
 * Les melanger dans un seul formulaire creerait de la confusion pour l'utilisateur.
 *
 * Les boutons secondaires (visite, signalement) sont volontairement moins visibles :
 * ils concernent des cas rares et ne doivent pas concurrencer les parcours principaux.
 *
 * @param {Object}   props.data               - Donnees completes du planning (issues de planning.json)
 * @param {Function} props.onGoToModules       - Callback vers le parcours modules metiers
 * @param {Function} props.onGoToStages        - Callback vers le parcours stages
 * @param {Function} props.onGoToSignalement   - Callback vers le formulaire de signalement
 * @param {Function} props.onGoToVisite        - Callback vers le formulaire de demande de visite
 */
export default function HomePage({ data, onGoToModules, onGoToStages, onGoToSignalement, onGoToVisite }) {
  // Nombre de modules disponibles affiche dans la carte, 0 si la cle est absente du JSON
  const nbModules = data.modulesMetiers?.modules?.length || 0

  return (
    <div className="animate-fadeIn">
      {/* Introduction du site */}
      <div className="text-center mb-12 mt-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Plateforme d'inscription
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choisissez votre parcours : découvrez nos modules métiers pour une semaine d'immersion, ou inscrivez-vous directement à un stage.
        </p>
      </div>

      {/* Deux cartes principales cote a cote */}
      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        {/* Carte Modules Metiers : affichee seulement si la section existe dans planning.json */}
        {data.modulesMetiers && (
          <button
            onClick={onGoToModules}
            className="bg-gradient-to-br from-cb-blue to-cb-blue/80 rounded-xl p-6
                       text-center text-white hover:shadow-lg transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-cb-blue focus:ring-offset-2
                       cursor-pointer group"
          >
            <div className="flex flex-col items-center h-full">
              <img
                src={`${import.meta.env.BASE_URL}card-modules.jpg`}
                alt="Ateliers Clair Bois"
                className="w-full h-40 object-cover rounded-lg mb-4 opacity-90 group-hover:scale-105 transition-transform duration-300"
              />
              <h3 className="text-xl font-bold mb-2">Modules métiers</h3>
              <p className="text-white/80 text-sm flex-1">
                Semaine de découverte : choisissez jusqu'à 3 modules (cuisine, pâtisserie, technique…) et inscrivez-vous pour une semaine d'immersion.
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
                <span className="text-sm text-white/70">{nbModules} modules disponibles</span>
                <svg className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        )}

        {/* Carte Stages */}
        <button
          onClick={onGoToStages}
          className="bg-gradient-to-br from-cb-blue to-cb-blue/80 rounded-xl p-6
                     text-center text-white hover:shadow-lg transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-cb-blue focus:ring-offset-2
                     cursor-pointer group"
        >
          <div className="flex flex-col items-center h-full">
            <img
              src={`${import.meta.env.BASE_URL}illust-stages.svg`}
              alt=""
              className="w-32 h-32 mb-4 opacity-90 group-hover:scale-105 transition-transform duration-300"
            />
            <h3 className="text-xl font-bold mb-2">Demande de stage</h3>
            <p className="text-white/80 text-sm flex-1">
              Choisissez un secteur et vos dates souhaitées pour faire une demande de stage.
            </p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
              <span className="text-sm text-white/70">Calendrier & formulaire</span>
              <svg className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Boutons secondaires */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          onClick={onGoToVisite}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-cb-blue/30
                     bg-cb-blue-light text-cb-blue text-sm font-medium cursor-pointer
                     hover:bg-cb-blue/10 hover:border-cb-blue/50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Demande de visite
        </button>
        <button
          onClick={onGoToSignalement}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-orange-300
                     bg-orange-50 text-orange-700 text-sm font-medium cursor-pointer
                     hover:bg-orange-100 hover:border-orange-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Signaler une annulation ou un retard
        </button>
      </div>

    </div>
  )
}
