/**
 * types-places.js
 * Constantes et configuration des types de places de stage/formation.
 *
 * Nomenclature Fondation Clair Bois :
 * - CEA : Contrat Emploi Adapté — encadrement léger, aucune formation requise
 * - FP  : Formation Pratique — formateur requis (interne, sans agrément OFPC)
 * - AFP : Attestation Fédérale de Formation Professionnelle — formateur agréé OFPC obligatoire
 * - CFC : Certificat Fédéral de Capacité — formateur agréé OFPC obligatoire (niveau supérieur)
 * - Stage : Stage simple (découverte, orientation) — encadrement léger, sans formateur
 */

/** @typedef {Object} TypePlaceConfig
 * @property {string} code - Code court du type (clé unique)
 * @property {string} label - Libellé complet affiché sur le board
 * @property {string} labelCourt - Abréviation affichée sur les badges
 * @property {string} description - Description métier du type
 * @property {string} couleurFond - Couleur de fond du badge (hex ou classe Tailwind)
 * @property {string} couleurTexte - Couleur du texte du badge (hex ou classe Tailwind)
 * @property {string} couleurBordure - Couleur de bordure du badge
 * @property {boolean} formateurRequis - Indique si un formateur est nécessaire
 * @property {boolean} agrementOFPC - Indique si l'agrément OFPC est obligatoire
 * @property {number} ordre - Ordre d'affichage dans les légendes/filtres
 */

/** @type {Record<string, TypePlaceConfig>} */
export const TYPES_PLACES = {
  CEA: {
    code: "CEA",
    label: "Contrat Emploi Adapté",
    labelCourt: "CEA",
    description:
      "Contrat en milieu protégé avec encadrement léger. Aucune formation certifiante requise.",
    couleurFond: "#ede9fe",      // violet clair
    couleurTexte: "#5b21b6",     // violet foncé
    couleurBordure: "#c4b5fd",   // violet moyen
    formateurRequis: false,
    agrementOFPC: false,
    ordre: 1,
  },

  FP: {
    code: "FP",
    label: "Formation Pratique",
    labelCourt: "FP",
    description:
      "Immersion en milieu professionnel encadrée par un formateur interne. Agrément OFPC non requis.",
    couleurFond: "#dbeafe",      // bleu clair
    couleurTexte: "#1d4ed8",     // bleu foncé
    couleurBordure: "#93c5fd",   // bleu moyen
    formateurRequis: true,
    agrementOFPC: false,
    ordre: 2,
  },

  AFP: {
    code: "AFP",
    label: "Attestation Fédérale de Formation Professionnelle",
    labelCourt: "AFP",
    description:
      "Formation certifiante AFP. Formateur agréé OFPC obligatoire. Durée 2 ans.",
    couleurFond: "#e0e7ff",      // indigo clair
    couleurTexte: "#3730a3",     // indigo foncé
    couleurBordure: "#a5b4fc",   // indigo moyen
    formateurRequis: true,
    agrementOFPC: true,
    ordre: 3,
  },

  CFC: {
    code: "CFC",
    label: "Certificat Fédéral de Capacité",
    labelCourt: "CFC",
    description:
      "Formation certifiante CFC. Formateur agréé OFPC obligatoire. Durée 3–4 ans.",
    couleurFond: "#c7d2fe",      // indigo foncé (fond)
    couleurTexte: "#1e1b4b",     // indigo très foncé
    couleurBordure: "#6366f1",   // indigo saturé
    formateurRequis: true,
    agrementOFPC: true,
    ordre: 4,
  },

  Stage: {
    code: "Stage",
    label: "Stage",
    labelCourt: "Stage",
    description:
      "Stage d'observation, de découverte ou de mesure d'orientation. Encadrement léger, sans formateur attitré.",
    couleurFond: "#dcfce7",      // vert clair
    couleurTexte: "#15803d",     // vert foncé
    couleurBordure: "#86efac",   // vert moyen
    formateurRequis: false,
    agrementOFPC: false,
    ordre: 5,
  },
};

/**
 * Liste ordonnée des types de places (pour légendes, filtres, etc.)
 * @type {TypePlaceConfig[]}
 */
export const TYPES_PLACES_LIST = Object.values(TYPES_PLACES).sort(
  (a, b) => a.ordre - b.ordre
);

/**
 * Retourne la config d'un type de place par son code.
 * Retourne un type "inconnu" si le code n'est pas reconnu (sécurité UI).
 * @param {string} code - Code du type (ex: "CEA", "AFP")
 * @returns {TypePlaceConfig}
 */
export function getTypePlaceConfig(code) {
  return (
    TYPES_PLACES[code] ?? {
      code: code,
      label: code,
      labelCourt: code,
      description: "Type non reconnu",
      couleurFond: "#f3f4f6",
      couleurTexte: "#374151",
      couleurBordure: "#d1d5db",
      formateurRequis: false,
      agrementOFPC: false,
      ordre: 99,
    }
  );
}

/**
 * Codes des types nécessitant un formateur agréé OFPC.
 * Utile pour les alertes visuelles sur le board.
 * @type {string[]}
 */
export const TYPES_AVEC_AGREMENT_OFPC = TYPES_PLACES_LIST.filter(
  (t) => t.agrementOFPC
).map((t) => t.code);

export default TYPES_PLACES;
