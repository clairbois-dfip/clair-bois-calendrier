/**
 * Confirmation.jsx — Écran post-envoi (succès ou erreur).
 */

export default function Confirmation({ result, onGoHome, onRetry }) {
  if (result === 'success') {
    return (
      <div className="animate-fadeIn text-center py-8">
        <div className="w-16 h-16 bg-cb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-cb-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Demande envoyée avec succès !
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Votre demande a bien été transmise à la Fondation Clair-Bois.
          Vous serez contacté·e prochainement pour la suite du processus.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onGoHome}
            className="px-6 py-2.5 bg-cb-blue text-white rounded-lg font-medium
                       hover:bg-cb-blue/90 transition-colors cursor-pointer"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  // Erreur
  return (
    <div className="animate-fadeIn text-center py-8">
      <div className="w-16 h-16 bg-cb-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-cb-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Une erreur est survenue
      </h3>
      <p className="text-gray-600 mb-2 max-w-md mx-auto">
        Votre demande n'a pas pu être envoyée. Veuillez réessayer.
      </p>
      <p className="text-sm text-gray-400 mb-6">
        Si le problème persiste, contactez-nous à{' '}
        <a href="mailto:stagiaire.dfip@clairbois.ch" className="text-cb-blue hover:underline">
          stagiaire.dfip@clairbois.ch
        </a>
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-cb-blue text-white rounded-lg font-medium
                     hover:bg-cb-blue/90 transition-colors cursor-pointer"
        >
          Réessayer
        </button>
        <button
          onClick={onGoHome}
          className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg font-medium
                     hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  )
}
