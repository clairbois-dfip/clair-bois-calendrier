import { useState } from 'react';
import { verifierMotDePasse } from '../utils/editionAuth';

/**
 * EditionLogin — Page de connexion au mode édition des formulaires (CMS).
 *
 * Réservé à la coordination DFIP. Même pattern que CartographieLogin :
 * mot de passe partagé vérifié côté client (VITE_EDIT_PASSWORDS), en
 * attendant le proxy serveur de l'hébergement Infomaniak. Accès par
 * l'URL directe #edition — aucun lien depuis le site public.
 *
 * Props :
 *   - onLogin(token) : callback appelé quand l'authentification réussit.
 *   - onCancel()     : retour à l'accueil du site.
 */
function EditionLogin({ onLogin, onCancel }) {
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [verificationEnCours, setVerificationEnCours] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (verificationEnCours) return;
    setErreur('');
    setVerificationEnCours(true);

    // Léger délai artificiel : retour visuel + frein à la force brute triviale.
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
      <button
        type="button"
        onClick={onCancel}
        className="absolute top-4 left-4 text-sm text-cb-blue hover:text-cb-accent transition-colors cursor-pointer flex items-center gap-1"
      >
        <span aria-hidden="true">&larr;</span>
        <span>Retour à l'accueil du site</span>
      </button>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-200 p-8 sm:p-10">
        <div className="flex justify-center mb-6">
          <img
            src={`${import.meta.env.BASE_URL}logo-clairbois.png`}
            alt="Logo Fondation Clair Bois"
            className="h-16 w-auto"
          />
        </div>

        <h1 className="text-2xl font-semibold text-cb-blue text-center">
          Édition des formulaires
        </h1>
        <p className="text-sm text-slate-500 text-center mt-2 mb-8">
          Accès réservé à la coordination DFIP
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="edition-mdp" className="sr-only">
            Mot de passe
          </label>
          <input
            id="edition-mdp"
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
            {verificationEnCours ? 'Vérification...' : "Accéder à l'éditeur"}
          </button>
        </form>

        <p className="mt-8 text-xs italic text-slate-400 text-center">
          Authentification locale — ne pas réutiliser un mot de passe sensible
        </p>
      </div>
    </div>
  );
}

export default EditionLogin;
