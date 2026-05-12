/*
 * cartoAuth.js — Utilitaires d'authentification pour la cartographie privee.
 *
 * La cartographie est une page interne reservee a la coordination DFIP.
 * Elle est protegee par un mot de passe partage. La verification se fait
 * actuellement cote client (acceptable en local). En production
 * (Infomaniak / Azure), la verification devra passer par un proxy serveur.
 *
 * Le token genere ici n'est PAS un secret cryptographique : c'est un simple
 * marqueur de session qui permet de distinguer les sessions ouvertes et
 * d'invalider les sessions trop anciennes (>24h).
 */

/** Cle utilisee dans sessionStorage pour stocker le token. */
const CLE_TOKEN = 'cb-carto-token';

/**
 * Duree de vie maximale d'un token (24 heures, en millisecondes).
 * Choisi pour couvrir une journee de travail complete sans relogin —
 * le sessionStorage etant deja invalide a la fermeture du navigateur,
 * on prend une marge confortable.
 */
const DUREE_VIE_TOKEN_MS = 24 * 60 * 60 * 1000;

/**
 * Liste des mots de passe valides, lue depuis VITE_CARTO_PASSWORDS (CSV).
 *
 * Comportement :
 *   - Variable presente : on parse le CSV (trim + filtre des entrees vides).
 *   - Variable absente en developpement (import.meta.env.DEV) :
 *     fallback ['carto2026'] pour faciliter les tests locaux.
 *   - Variable absente en production : retourne [] (refuse toute connexion,
 *     evite qu'un build casse permette un acces non controle).
 *
 * @returns {string[]} Liste des mots de passe acceptes.
 */
export function getMotsDePasseValides() {
  const brut = import.meta.env.VITE_CARTO_PASSWORDS;
  if (brut && typeof brut === 'string') {
    return brut
      .split(',')
      .map((mdp) => mdp.trim())
      .filter((mdp) => mdp.length > 0);
  }
  // Fallback uniquement en mode dev (Vite definit DEV automatiquement).
  if (import.meta.env.DEV) {
    return ['carto2026'];
  }
  // En production sans variable : refuser toute tentative.
  return [];
}

/**
 * Verifie un mot de passe en clair contre la liste des mots de passe valides.
 *
 * Le token genere encode le timestamp de creation et l'index du mot de passe
 * utilise. Encodage base64 (btoa) pour rester opaque a l'oeil nu, sans
 * pretendre offrir une securite cryptographique.
 *
 * @param {string} mdpClair Mot de passe saisi par l'utilisateur.
 * @returns {string|null} Token de session si valide, null sinon.
 */
export function verifierMotDePasse(mdpClair) {
  if (typeof mdpClair !== 'string' || mdpClair.length === 0) {
    return null;
  }
  const mdpTrimmed = mdpClair.trim();
  const motsValides = getMotsDePasseValides();
  const index = motsValides.indexOf(mdpTrimmed);
  if (index === -1) {
    return null;
  }
  const charge = JSON.stringify({ ts: Date.now(), idx: index });
  // btoa attend de l'ASCII ; les chiffres et accolades sont surs.
  return btoa(charge);
}

/**
 * Stocke le token dans sessionStorage (cle 'cb-carto-token').
 *
 * sessionStorage (et non localStorage) : la session est invalidee a la
 * fermeture de l'onglet/navigateur, ce qui est plus sur sur un poste
 * partage entre plusieurs utilisateurs de la coordination.
 *
 * @param {string} token Token a stocker.
 */
export function setToken(token) {
  if (typeof token !== 'string' || token.length === 0) return;
  try {
    sessionStorage.setItem(CLE_TOKEN, token);
  } catch {
    // sessionStorage indisponible (mode prive tres restreint) : on ignore.
  }
}

/**
 * Recupere le token courant ou null s'il n'existe pas.
 *
 * @returns {string|null} Token stocke ou null.
 */
export function getToken() {
  try {
    return sessionStorage.getItem(CLE_TOKEN);
  } catch {
    return null;
  }
}

/**
 * Efface le token stocke (deconnexion).
 */
export function clearToken() {
  try {
    sessionStorage.removeItem(CLE_TOKEN);
  } catch {
    // Ignorer si sessionStorage indisponible.
  }
}

/**
 * Verifie qu'un token existant est encore valide :
 *   - format correct (base64 → JSON avec ts numerique)
 *   - timestamp pas trop ancien (DUREE_VIE_TOKEN_MS)
 *
 * Si le token est present mais invalide ou expire, il est efface.
 *
 * @returns {boolean} true si une session valide est en cours.
 */
export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
  try {
    const charge = JSON.parse(atob(token));
    if (typeof charge.ts !== 'number') {
      clearToken();
      return false;
    }
    const age = Date.now() - charge.ts;
    if (age < 0 || age > DUREE_VIE_TOKEN_MS) {
      clearToken();
      return false;
    }
    return true;
  } catch {
    clearToken();
    return false;
  }
}
