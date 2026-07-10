/*
 * editionAuth.js — Authentification du mode édition des formulaires (CMS).
 *
 * Même principe que cartoAuth.js : mot de passe partagé vérifié côté client,
 * token de session opaque en sessionStorage. Cette barrière protège des
 * curieux, pas d'un attaquant qui lit le bundle — la véritable protection
 * en ÉCRITURE est le token GitHub fine-grained, saisi par l'utilisatrice
 * et jamais présent dans le code ni dans le build (voir schemaFormulaires.js).
 * En production (Infomaniak, août 2026), la vérification passera par un
 * proxy serveur.
 */

const CLE_TOKEN = 'cb-edition-token';

/** Durée de vie d'une session d'édition : 24 h (même choix que la carto). */
const DUREE_VIE_TOKEN_MS = 24 * 60 * 60 * 1000;

/**
 * Liste des mots de passe valides, lue depuis VITE_EDIT_PASSWORDS (CSV).
 * Fallback 'edition2026' uniquement en dev ; en prod sans variable → [].
 *
 * @returns {string[]} Mots de passe acceptés.
 */
export function getMotsDePasseValides() {
  const brut = import.meta.env.VITE_EDIT_PASSWORDS;
  if (brut && typeof brut === 'string') {
    return brut
      .split(',')
      .map((mdp) => mdp.trim())
      .filter((mdp) => mdp.length > 0);
  }
  if (import.meta.env.DEV) {
    return ['edition2026'];
  }
  return [];
}

/**
 * Vérifie un mot de passe et retourne un token de session, ou null.
 *
 * @param {string} mdpClair Mot de passe saisi.
 * @returns {string|null} Token si valide.
 */
export function verifierMotDePasse(mdpClair) {
  if (typeof mdpClair !== 'string' || mdpClair.length === 0) {
    return null;
  }
  const index = getMotsDePasseValides().indexOf(mdpClair.trim());
  if (index === -1) {
    return null;
  }
  return btoa(JSON.stringify({ ts: Date.now(), idx: index }));
}

/** Stocke le token de session d'édition. */
export function setToken(token) {
  if (typeof token !== 'string' || token.length === 0) return;
  try {
    sessionStorage.setItem(CLE_TOKEN, token);
  } catch {
    // sessionStorage indisponible : on ignore.
  }
}

/** Récupère le token courant ou null. */
export function getToken() {
  try {
    return sessionStorage.getItem(CLE_TOKEN);
  } catch {
    return null;
  }
}

/** Efface le token (déconnexion du mode édition). */
export function clearToken() {
  try {
    sessionStorage.removeItem(CLE_TOKEN);
  } catch {
    // Ignorer.
  }
}

/**
 * Une session d'édition valide est-elle en cours ?
 *
 * @returns {boolean}
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
