/**
 * HomePage.jsx — Ecran 1 : Page d'accueil.
 *
 * Affiche deux parcours principaux :
 *  1. Modules metiers — semaine type de decouverte (max 3 modules)
 *  2. Stages — choix du secteur puis calendrier de dates
 *
 * @param {Object} props.data            - Donnees completes du planning
 * @param {Function} props.onGoToModules - Callback pour aller aux modules metiers
 * @param {Function} props.onGoToStages  - Callback pour aller aux stages
 */

export default function HomePage({ data, onGoToModules, onGoToStages, onGoToSignalement }) {
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
        {/* Carte Modules Metiers */}
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

      {/* Bouton signalement d'urgence (annulation / retard) */}
      <div className="flex justify-center mb-8">
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
