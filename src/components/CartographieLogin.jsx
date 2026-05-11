import { useState } from 'react';
import { verifierMotDePasse } from '../utils/cartoAuth';

/**
 * CartographieLogin — Page de connexion pour acceder a la cartographie privee.
 *
 * La cartographie est reservee a la coordination DFIP (Karavia + collegues).
 * L'acces se fait par mot de passe partage. La verification est faite cote
 * client tant que le site tourne en local ; elle passera par un proxy serveur
 * quand le site sera heberge (Infomaniak / Azure).
 *
 * Props :
 *   - onLogin(token)  : callback appele avec le token quand l'auth reussit.
 *   - onCancel()      : callback pour revenir a la page d'accueil.
 */
function CartographieLogin({ onLogin, onCancel }) {
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [verificationEnCours, setVerificationEnCours] = useState(false);

  /**
   * Verifie le mot de passe saisi avec un leger delai artificiel (~200ms)
   * pour ralentir la force brute triviale et donner un retour visuel.
   */
  function handleSubmit(e) {
    e.preventDefault();
    if (verificationEnCours) return;
    setErreur('');
    setVerificationEnCours(true);

    setTimeout(() => {
      const token = verifierMotDePasse(motDePasse);
      if (token) {
        setVerificationEnCours(false);
        onLogin(token);
      } else {
        setVerificationEnCours(false);
        setErreur('Mot de passe incorrect');
      }
    }, 200);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 animate-fadeIn">
      {/* Bouton retour en haut a gauche */}
      <button
        type="button"
        onClick={onCancel}
        className="absolute top-4 left-4 text-sm text-cb-blue hover:text-cb-accent transition-colors cursor-pointer flex items-center gap-1"
      >
        <span aria-hidden="true">&larr;</span>
        <span>Retour a l'accueil du site</span>
      </button>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-200 p-8 sm:p-10">
        {/* Logo officiel Clair Bois */}
        <div className="flex justify-center mb-6">
          <img
            src={`${import.meta.env.BASE_URL}logo-clairbois.png`}
            alt="Logo Fondation Clair Bois"
            className="h-16 w-auto"
          />
        </div>

        {/* Titre + sous-titre */}
        <h1 className="text-2xl font-semibold text-cb-blue text-center">
          Cartographie des places
        </h1>
        <p className="text-sm text-slate-500 text-center mt-2 mb-8">
          Acces reserve a la coordination DFIP
        </p>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="carto-mdp" className="sr-only">
            Mot de passe
          </label>
          <input
            id="carto-mdp"
            type="password"
            value={motDePasse}
            onChange={(e) => {
              setMotDePasse(e.target.value);
              if (erreur) setErreur('');
            }}
            placeholder="Mot de passe"
            autoFocus
            autoComplete="current-password"
            disabled={verificationEnCours}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cb-accent focus:bg-white focus:ring-2 focus:ring-cb-accent-light transition-colors disabled:opacity-60"
          />

          {erreur && (
            <p className="mt-3 text-sm text-cb-red text-center" role="alert">
              {erreur}
            </p>
          )}

          <button
            type="submit"
            disabled={verificationEnCours || motDePasse.length === 0}
            className="w-full mt-5 py-3 rounded-lg font-semibold text-white bg-cb-blue hover:bg-cb-accent transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verificationEnCours ? 'Verification...' : 'Acceder a la cartographie'}
          </button>
        </form>

        {/* Avertissement discret */}
        <p className="mt-8 text-xs italic text-slate-400 text-center">
          Authentification locale — ne pas reutiliser un mot de passe sensible
        </p>
      </div>
    </div>
  );
}

export default CartographieLogin;
