/*
 * schemaFormulaires.js — Utilitaires du CMS de formulaires.
 *
 * Le schéma des formulaires vit dans public/formulaire-schema.json :
 * 1 entrée = 1 champ, avec pour clé technique `colonneSP` = nom interne
 * de la colonne SharePoint cible (contrat avec Power Automate, cf.
 * docs/SCHEMA.md). L'éditeur (mode édition, EditeurFormulaires.jsx)
 * manipule ce schéma puis le publie directement sur GitHub via l'API
 * Contents — GitHub Pages redéploie, aucune autre infrastructure requise.
 *
 * Le token GitHub (PAT fine-grained limité au repo du site) est saisi par
 * l'utilisatrice au moment de publier et conservé en sessionStorage
 * uniquement : il n'apparaît jamais dans le code, le bundle ou le repo.
 */

/** Dépôt et fichier cibles de la publication. */
export const GITHUB_REPO = 'clairbois-dfip/clair-bois-calendrier';
export const SCHEMA_PATH = 'public/formulaire-schema.json';
const CLE_PAT = 'cb-edition-github-pat';

/**
 * Types de champ du schéma (mêmes valeurs que la future liste SP
 * FormulaireSchema, cf. docs/SCHEMA.md §3.10). Le type 'radio' du schéma
 * correspond au type 'radio-group' de ChampFormulaire.jsx.
 */
export const TYPES_CHAMP = [
  { value: 'text', label: 'Texte (une ligne)' },
  { value: 'textarea', label: 'Texte long (plusieurs lignes)' },
  { value: 'select', label: 'Liste déroulante' },
  { value: 'radio', label: 'Boutons de choix' },
  { value: 'multiselect', label: 'Choix multiples (pastilles)' },
  { value: 'checkbox', label: 'Case à cocher' },
  { value: 'number', label: 'Nombre' },
  { value: 'date', label: 'Date' },
  { value: 'tel', label: 'Téléphone' },
  { value: 'email', label: 'Email' },
];

/** Listes SharePoint qu'un champ peut alimenter. */
export const LISTES_CIBLES = ['Stagiaire', 'Demande', 'Referent', 'Signalement', 'Visite'];

/**
 * Clé UNIQUE d'un champ dans le schéma.
 * `colonneSP` seul ne suffit pas : « Nom » existe sur Stagiaire, Referent
 * ET Signalement. Le couple étape + champPayload est unique par construction.
 *
 * @param {object} champ
 * @returns {string} ex. 'stagiaire:nom'
 */
export function cleChamp(champ) {
  return `${champ.etape}:${champ.champPayload}`;
}

/* ────────────────────────────────────────────
 * Identifiant SharePoint (colonneSP)
 * ──────────────────────────────────────────── */

/**
 * Suggère un identifiant de colonne SharePoint depuis un label français.
 * Règle SCHEMA.md R1 : PascalCase ASCII strict, ≤ 24 caractères.
 * Ex. « Taille de pantalon » → « TailleDePantalon » ; « N° AVS » → « NAvs ».
 *
 * @param {string} label Label affiché du champ.
 * @returns {string} Suggestion d'identifiant (peut être vide si label vide).
 */
export function suggererColonneSP(label) {
  if (!label || typeof label !== 'string') return '';
  const sansAccents = label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // retire les diacritiques (é → e)
  const mots = sansAccents
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const pascal = mots
    .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
    .join('');
  return pascal.slice(0, 24);
}

/**
 * Valide un identifiant de colonne SP (règle R1 + unicité PAR LISTE :
 * « Nom » peut exister à la fois sur Stagiaire et sur Referent, mais pas
 * deux fois sur la même liste).
 *
 * @param {string} nom Identifiant proposé.
 * @param {string[]} existants Identifiants déjà pris SUR LA MÊME LISTE (hors champ courant).
 * @returns {{ valide: boolean, message: string }}
 */
export function validerColonneSP(nom, existants = []) {
  if (!nom || !nom.trim()) {
    return { valide: false, message: "L'identifiant SharePoint est obligatoire." };
  }
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(nom)) {
    return {
      valide: false,
      message: 'Lettres et chiffres uniquement, sans accent ni espace (ex. TaillePantalon).',
    };
  }
  if (nom.length > 24) {
    return { valide: false, message: '24 caractères maximum.' };
  }
  if (existants.includes(nom)) {
    return { valide: false, message: `« ${nom} » est déjà utilisé sur cette liste SharePoint.` };
  }
  return { valide: true, message: '' };
}

/**
 * Identifiants de colonnes déjà pris sur une liste SP donnée,
 * en excluant un champ (celui en cours d'édition).
 *
 * @param {object} schema Schéma complet.
 * @param {string} listeCible Nom de la liste SP.
 * @param {string} [cleExclue] Clé (cleChamp) du champ à exclure.
 * @returns {string[]}
 */
export function colonnesDeLaListe(schema, listeCible, cleExclue) {
  return (schema?.champs || [])
    .filter((c) => c.listeCible === listeCible && cleChamp(c) !== cleExclue)
    .map((c) => c.colonneSP);
}

/* ────────────────────────────────────────────
 * Manipulation du schéma
 * ──────────────────────────────────────────── */

/**
 * Champs d'une étape donnée, triés par ordre croissant.
 *
 * @param {object} schema Schéma complet.
 * @param {string} etape Clé d'étape (ex. 'stagiaire').
 * @returns {object[]} Champs triés.
 */
export function champsDeLEtape(schema, etape) {
  return (schema?.champs || [])
    .filter((c) => c.etape === etape)
    .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
}

/**
 * Déplace un champ d'un cran vers le haut ou le bas AU SEIN de son étape.
 * Retourne un NOUVEAU schéma (immutabilité React) ; les ordres de l'étape
 * sont renumérotés 10, 20, 30… pour garder de la place aux insertions.
 *
 * @param {object} schema Schéma complet.
 * @param {string} cle Clé unique du champ (cleChamp).
 * @param {-1|1} direction -1 = monter, 1 = descendre.
 * @returns {object} Nouveau schéma (identique si déplacement impossible).
 */
export function deplacerChamp(schema, cle, direction) {
  const champ = (schema?.champs || []).find((c) => cleChamp(c) === cle);
  if (!champ) return schema;
  const groupe = champsDeLEtape(schema, champ.etape);
  const index = groupe.findIndex((c) => cleChamp(c) === cle);
  const cible = index + direction;
  if (cible < 0 || cible >= groupe.length) return schema;

  const reordonne = [...groupe];
  [reordonne[index], reordonne[cible]] = [reordonne[cible], reordonne[index]];
  const nouveauxOrdres = new Map(reordonne.map((c, i) => [cleChamp(c), (i + 1) * 10]));

  return {
    ...schema,
    champs: schema.champs.map((c) =>
      nouveauxOrdres.has(cleChamp(c)) ? { ...c, ordre: nouveauxOrdres.get(cleChamp(c)) } : c
    ),
  };
}

/**
 * Met à jour un champ (fusion partielle) et retourne un nouveau schéma.
 *
 * @param {object} schema Schéma complet.
 * @param {string} cle Clé unique actuelle du champ (cleChamp).
 * @param {object} maj Propriétés à fusionner (peut inclure un nouveau colonneSP).
 * @returns {object} Nouveau schéma.
 */
export function mettreAJourChamp(schema, cle, maj) {
  return {
    ...schema,
    champs: schema.champs.map((c) => (cleChamp(c) === cle ? { ...c, ...maj } : c)),
  };
}

/**
 * Ajoute un champ vide en fin d'étape et retourne { schema, champ }.
 *
 * @param {object} schema Schéma complet.
 * @param {string} etape Étape d'accueil.
 * @returns {{ schema: object, champ: object }}
 */
export function ajouterChamp(schema, etape) {
  const groupe = champsDeLEtape(schema, etape);
  const dernierOrdre = groupe.length ? groupe[groupe.length - 1].ordre ?? 0 : 0;
  // Identifiant provisoire unique — l'utilisatrice le remplace en nommant le champ.
  const payloads = new Set(schema.champs.map((c) => c.champPayload));
  const colonnes = new Set(schema.champs.map((c) => c.colonneSP));
  let n = 1;
  while (payloads.has(`nouveau_champ_${n}`) || colonnes.has(`NouveauChamp${n}`)) n += 1;
  const champ = {
    colonneSP: `NouveauChamp${n}`,
    champPayload: `nouveau_champ_${n}`,
    listeCible: etape === 'signalement' ? 'Signalement' : 'Stagiaire',
    label: 'Nouveau champ',
    type: 'text',
    options: [],
    etape,
    ordre: dernierOrdre + 10,
    obligatoire: false,
    condition: null,
    placeholder: '',
    aide: '',
    nouveau: true, // marqueur : rappelle qu'une colonne SP est à créer
  };
  return { schema: { ...schema, champs: [...schema.champs, champ] }, champ };
}

/**
 * Supprime un champ et retourne un nouveau schéma.
 *
 * @param {object} schema Schéma complet.
 * @param {string} cle Clé unique du champ (cleChamp).
 * @returns {object} Nouveau schéma.
 */
export function supprimerChamp(schema, cle) {
  return { ...schema, champs: schema.champs.filter((c) => cleChamp(c) !== cle) };
}

/**
 * Convertit le texte du panneau « Options » (une valeur par ligne)
 * en tableau [{ value, label, condition? }] consommé par ChampFormulaire.
 * Syntaxes : « valeur », « valeur | Label affiché »,
 * « valeur | Label | condition » (ex. `pourQui=autre` — option contextuelle).
 *
 * @param {string} texte Contenu du textarea.
 * @returns {{value: string, label: string, condition?: string}[]}
 */
export function parserOptions(texte) {
  if (!texte) return [];
  return texte
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((ligne) => {
      const [valeur, label, condition] = ligne.split('|').map((p) => p.trim());
      const option = { value: valeur, label: label || valeur };
      if (condition) option.condition = condition;
      return option;
    });
}

/**
 * Convertit un tableau d'options en texte éditable (une valeur par ligne,
 * « valeur | label » si le label diffère, « valeur | label | condition »
 * si l'option est contextuelle — l'aller-retour ne perd RIEN).
 *
 * @param {{value: string, label: string, condition?: string}[]} options
 * @returns {string}
 */
export function optionsVersTexte(options) {
  if (!Array.isArray(options)) return '';
  return options
    .map((o) => {
      if (o.condition) return `${o.value} | ${o.label || o.value} | ${o.condition}`;
      return o.label && o.label !== o.value ? `${o.value} | ${o.label}` : o.value;
    })
    .join('\n');
}

/* ────────────────────────────────────────────
 * Manipulation des ÉTAPES (sections)
 * ──────────────────────────────────────────── */

/**
 * Ajoute une étape vide en fin de formulaire. La clé technique est générée
 * (unique, stable) — les champs y font référence, elle ne se renomme pas ;
 * seul le titre affiché est éditable.
 *
 * @param {object} schema Schéma complet.
 * @param {string} formulaire Clé du formulaire d'accueil.
 * @returns {{ schema: object, etape: object }}
 */
export function ajouterEtape(schema, formulaire) {
  const existantes = new Set((schema.etapes || []).map((e) => e.cle));
  let n = 1;
  while (existantes.has(`${formulaire}-etape-${n}`)) n += 1;
  const duFormulaire = (schema.etapes || []).filter((e) => e.formulaire === formulaire);
  const etape = {
    cle: `${formulaire}-etape-${n}`,
    titre: 'Nouvelle étape',
    ordre: duFormulaire.length ? Math.max(...duFormulaire.map((e) => e.ordre ?? 0)) + 1 : 1,
    formulaire,
    conditionAffichage: null,
    intro: '',
  };
  return { schema: { ...schema, etapes: [...(schema.etapes || []), etape] }, etape };
}

/**
 * Met à jour une étape (titre, intro…) et retourne un nouveau schéma.
 * La clé technique n'est jamais modifiée (les champs y sont rattachés).
 */
export function mettreAJourEtape(schema, cle, maj) {
  const { cle: _ignore, ...reste } = maj;
  return {
    ...schema,
    etapes: schema.etapes.map((e) => (e.cle === cle ? { ...e, ...reste } : e)),
  };
}

/**
 * Déplace une étape d'un cran au sein de son formulaire (renumérotation 1..n).
 */
export function deplacerEtape(schema, cle, direction) {
  const etape = (schema.etapes || []).find((e) => e.cle === cle);
  if (!etape) return schema;
  const groupe = schema.etapes
    .filter((e) => e.formulaire === etape.formulaire)
    .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
  const index = groupe.findIndex((e) => e.cle === cle);
  const cible = index + direction;
  if (cible < 0 || cible >= groupe.length) return schema;
  const reordonne = [...groupe];
  [reordonne[index], reordonne[cible]] = [reordonne[cible], reordonne[index]];
  const ordres = new Map(reordonne.map((e, i) => [e.cle, i + 1]));
  return {
    ...schema,
    etapes: schema.etapes.map((e) => (ordres.has(e.cle) ? { ...e, ordre: ordres.get(e.cle) } : e)),
  };
}

/**
 * Supprime une étape — UNIQUEMENT si aucun champ ne s'y trouve encore
 * (le composant demande de déplacer/supprimer les questions d'abord).
 *
 * @returns {object} Nouveau schéma (inchangé si l'étape contient des champs).
 */
export function supprimerEtape(schema, cle) {
  if ((schema.champs || []).some((c) => c.etape === cle)) return schema;
  return { ...schema, etapes: schema.etapes.filter((e) => e.cle !== cle) };
}

/* ────────────────────────────────────────────
 * Chargement / téléchargement / publication
 * ──────────────────────────────────────────── */

/**
 * Charge le schéma depuis le site (fichier statique public/).
 *
 * @returns {Promise<object>} Schéma parsé.
 */
export async function chargerSchema() {
  const res = await fetch(import.meta.env.BASE_URL + 'formulaire-schema.json', {
    cache: 'no-cache',
  });
  if (!res.ok) throw new Error('Impossible de charger le schéma des formulaires.');
  return res.json();
}

/**
 * Télécharge le schéma courant comme fichier JSON (solution de secours
 * si la publication GitHub n'est pas possible : envoyer le fichier par email).
 *
 * @param {object} schema Schéma à sérialiser.
 */
export function telechargerSchema(schema) {
  const blob = new Blob([serialiserSchema(schema)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'formulaire-schema.json';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Sérialise le schéma avec un horodatage de modification.
 *
 * @param {object} schema
 * @returns {string} JSON indenté.
 */
export function serialiserSchema(schema) {
  const { ...reste } = schema;
  return JSON.stringify({ ...reste, updatedAt: new Date().toISOString() }, null, 2) + '\n';
}

/** Stocke le PAT GitHub pour la session (jamais en localStorage ni dans le code). */
export function setGithubPat(pat) {
  try {
    sessionStorage.setItem(CLE_PAT, pat);
  } catch {
    // Ignorer.
  }
}

/** Récupère le PAT GitHub de la session, ou null. */
export function getGithubPat() {
  try {
    return sessionStorage.getItem(CLE_PAT);
  } catch {
    return null;
  }
}

/**
 * Encode une chaîne UTF-8 en base64 (l'API GitHub Contents exige du base64 ;
 * btoa seul casse sur les accents).
 *
 * @param {string} texte
 * @returns {string}
 */
export function encoderBase64Utf8(texte) {
  const octets = new TextEncoder().encode(texte);
  let binaire = '';
  octets.forEach((o) => {
    binaire += String.fromCharCode(o);
  });
  return btoa(binaire);
}

/**
 * Publie le schéma sur GitHub (commit direct sur main du repo du site).
 * GitHub Pages redéploie automatiquement — les modifications sont donc
 * historisées dans git et récupérables par le développeur.
 *
 * @param {object} schema Schéma à publier.
 * @param {string} pat Token GitHub fine-grained (Contents lecture/écriture).
 * @returns {Promise<{commitUrl: string}>}
 * @throws {Error} Message en français prêt à afficher.
 */
export async function publierSchema(schema, pat) {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${SCHEMA_PATH}`;
  const entetes = {
    Authorization: `Bearer ${pat}`,
    Accept: 'application/vnd.github+json',
  };

  // 1. Récupérer le SHA actuel du fichier (absent si première publication).
  let sha;
  const resGet = await fetch(`${url}?ref=main`, { headers: entetes });
  if (resGet.status === 401 || resGet.status === 403) {
    throw new Error('Token GitHub refusé — vérifiez le token (ou sa date d\'expiration).');
  }
  if (resGet.ok) {
    sha = (await resGet.json()).sha;
  } else if (resGet.status !== 404) {
    throw new Error(`GitHub a répondu ${resGet.status} — réessayez dans un instant.`);
  }

  // 2. Commit du nouveau contenu.
  const resPut = await fetch(url, {
    method: 'PUT',
    headers: { ...entetes, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `MAJ schéma des formulaires (mode édition) — ${new Date().toLocaleString('fr-CH')}`,
      content: encoderBase64Utf8(serialiserSchema(schema)),
      branch: 'main',
      ...(sha ? { sha } : {}),
    }),
  });
  if (resPut.status === 409) {
    throw new Error(
      'Conflit : le fichier a été modifié entre-temps. Rechargez la page puis refaites vos modifications.'
    );
  }
  if (!resPut.ok) {
    throw new Error(`Échec de la publication (GitHub ${resPut.status}). Vos modifications ne sont PAS perdues : utilisez « Télécharger » en secours.`);
  }
  const corps = await resPut.json();
  return { commitUrl: corps.commit?.html_url || '' };
}
