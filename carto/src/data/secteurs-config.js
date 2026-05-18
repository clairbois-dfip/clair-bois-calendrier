/**
 * secteurs-config.js
 * Métadonnées de configuration des secteurs de la plateforme carto-clairbois.
 * Ces données sont utilisées pour l'affichage du board (couleurs, icônes, ordre).
 *
 * En production, les données d'occupation proviennent de SharePoint via Power Automate.
 * Ce fichier ne contient que la configuration statique (UI/UX).
 */

/** @typedef {Object} SousEntiteConfig
 * @property {string} id - Identifiant unique de la sous-entité
 * @property {string} nom - Nom court affiché sur le board
 * @property {string} description - Description longue pour tooltip/détail
 */

/** @typedef {Object} SecteurConfig
 * @property {string} id - Identifiant unique du secteur (correspond à mock-carto.json)
 * @property {string} nom - Nom affiché sur le board
 * @property {string} couleur - Couleur principale (hex) pour le header de carte
 * @property {string} couleurFond - Couleur de fond atténuée pour le corps de carte
 * @property {string} icone - Emoji représentant le secteur
 * @property {string} description - Description courte du secteur
 * @property {number} ordre - Ordre d'affichage sur le board (ascendant)
 * @property {boolean} hasSousEntites - Indique si le secteur a des sous-entités
 * @property {SousEntiteConfig[]} [sousEntites] - Sous-entités si applicable
 */

/** @type {SecteurConfig[]} */
export const SECTEURS_CONFIG = [
  {
    id: "restauration",
    nom: "Restauration",
    couleur: "#0891b2",
    couleurFond: "#f0f9ff",
    icone: "🍽️",
    description: "",
    ordre: 1,
    hasSousEntites: false,
  },
  {
    id: "lingerie",
    nom: "Lingerie",
    couleur: "#9333ea",
    couleurFond: "#f5f3ff",
    icone: "🧺",
    description: "",
    ordre: 2,
    hasSousEntites: false,
  },
  {
    id: "cuisine",
    nom: "Cuisine",
    couleur: "#4338ca",
    couleurFond: "#eef2ff",
    icone: "👨‍🍳",
    description: "",
    ordre: 3,
    hasSousEntites: false,
  },
  {
    id: "technique",
    nom: "Technique",
    couleur: "#0284c7",
    couleurFond: "#e0f2fe",
    icone: "🔧",
    description: "",
    ordre: 4,
    hasSousEntites: false,
  },
  {
    id: "educatif-adulte",
    nom: "Éducatif pôle adulte",
    couleur: "#0f766e",
    couleurFond: "#f0fdfa",
    icone: "🏠",
    description: "",
    ordre: 5,
    hasSousEntites: true,
    sousEntites: [
      {
        id: "adulte-appt",
        nom: "Appartements",
        description: "Foyers et appartements encadrés (multi-sites)",
      },
      {
        id: "adulte-cdj",
        nom: "Centres de jour",
        description: "Activités de jour (multi-sites)",
      },
    ],
  },
  {
    id: "educatif-enfance",
    nom: "Éducatif pôle enfance-adolescence",
    couleur: "#db2777",
    couleurFond: "#fce7f3",
    icone: "🎒",
    description: "",
    ordre: 6,
    hasSousEntites: true,
    sousEntites: [
      {
        id: "enfance-classe-a",
        nom: "Classes A (primaire)",
        description: "Enseignement spécialisé primaire",
      },
      {
        id: "enfance-classe-b",
        nom: "Classes B (cycle)",
        description: "Enseignement spécialisé cycle d'orientation",
      },
      {
        id: "enfance-classe-c",
        nom: "Classes C (transition)",
        description: "Classes de transition pré-professionnelle",
      },
    ],
  },
];

/**
 * Retourne la config d'un secteur par son identifiant.
 * @param {string} id - Identifiant du secteur
 * @returns {SecteurConfig | undefined}
 */
export function getSecteurById(id) {
  return SECTEURS_CONFIG.find((s) => s.id === id);
}

/**
 * Retourne les secteurs triés par ordre d'affichage.
 * @returns {SecteurConfig[]}
 */
export function getSecteursSorted() {
  return [...SECTEURS_CONFIG].sort((a, b) => a.ordre - b.ordre);
}

export default SECTEURS_CONFIG;
