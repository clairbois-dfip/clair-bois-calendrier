/**
 * formConfig.js — Configuration déclarative du formulaire par chemin d'aiguillage.
 *
 * Définit quelles étapes/sections sont visibles selon le parcours de l'utilisateur.
 * Le chemin est construit à partir de :
 *   - aiguillageParcours : 'stages' | 'modules'
 *   - chemin.pourQui     : 'moi' | 'autre'
 *   - chemin.dejaInscrit : true | false
 */

/**
 * Configuration par cheminKey.
 * - sections : tableau ordonné des étapes visibles
 * - label    : titre affiché dans la barre de progression
 * - description : sous-titre contextuel
 */
export const FORM_CONFIGS = {
  'stages-moi-non': {
    sections: ['stagiaire', 'curatelle', 'urgence', 'ai', 'complementaire', 'declaration'],
    label: 'Demande de stage',
    description: 'Nouvelle inscription — je m\'inscris moi-même.',
  },
  'stages-autre-non': {
    sections: ['referent', 'stagiaire', 'curatelle', 'urgence', 'ai', 'complementaire', 'declaration'],
    label: 'Demande de stage',
    description: 'Nouvelle inscription — par un·e référent·e.',
  },
  'stages-moi-oui': {
    sections: ['stagiaire-retour'],
    label: 'Retour à Clair-Bois',
    description: 'Vous avez déjà effectué un stage ou module chez Clair-Bois.',
  },
  'stages-autre-oui': {
    sections: ['referent', 'stagiaire', 'curatelle', 'urgence', 'ai', 'complementaire', 'declaration'],
    label: 'Demande de stage',
    description: 'Réinscription — par un·e référent·e.',
  },
  'modules-moi': {
    sections: ['stagiaire', 'curatelle', 'urgence', 'ai', 'complementaire', 'declaration'],
    label: 'Modules métiers',
    description: 'Inscription aux modules métiers — pour moi-même.',
  },
  'modules-autre': {
    sections: ['referent', 'stagiaire', 'curatelle', 'urgence', 'ai', 'complementaire', 'declaration'],
    label: 'Modules métiers',
    description: 'Inscription aux modules métiers — par un·e référent·e.',
  },
}

/** Construit la clé de chemin à partir du parcours et des réponses d'aiguillage */
export function getCheminKey(parcours, chemin) {
  if (parcours === 'modules') {
    return `modules-${chemin.pourQui}`
  }
  return `stages-${chemin.pourQui}-${chemin.dejaInscrit ? 'oui' : 'non'}`
}

/** Retourne la config du formulaire pour un chemin donné */
export function getFormConfig(parcours, chemin) {
  const key = getCheminKey(parcours, chemin)
  return FORM_CONFIGS[key] || FORM_CONFIGS['stages-moi-non']
}

/** Labels des sections pour la barre de progression */
export const SECTION_LABELS = {
  'referent': 'Référent·e',
  'stagiaire': 'Stagiaire',
  'stagiaire-retour': 'Stagiaire',
  'curatelle': 'Curatelle',
  'urgence': 'Urgence',
  'ai': 'Assurance AI',
  'complementaire': 'Compléments',
  'declaration': 'Déclaration',
}

/** Champs initiaux vides pour chaque section */
export const INITIAL_DATA = {
  // Référent
  referent_partenaire: '',
  referent_nom: '',
  referent_prenom: '',
  referent_tel: '',
  referent_email: '',
  referent_fonction: '',

  // Stagiaire
  nom: '',
  prenom: '',
  sexe: '',
  date_naissance: '',
  avs: '',
  tel: '',
  email: '',
  adresse: '',
  npa: '',
  formation: '',

  // Curatelle
  sous_curatelle: '',
  curatelle_type: '',
  curatelle_nom: '',
  curatelle_prenom: '',
  curatelle_tel: '',
  curatelle_email: '',

  // Urgence
  urgence_nom: '',
  urgence_prenom: '',
  urgence_lien: '',
  urgence_tel: '',

  // AI
  inscrit_ai: '',
  ai_nom: '',
  ai_prenom: '',
  ai_tel: '',
  ai_email: '',
  ai_office: '',
  ai_mesure: '',

  // Complémentaire
  objectif_stage: '',
  parcours_scolaire: '',
  limitations: '',
  deja_tests: '',
  deja_stages_secteur: '',
  reseau_medical: '',
  pointure: '',
  taille_tshirt: '',
  taille_pantalon: '',

  // Déclaration
  declaration_charte: '',
  declaration_engagement: '',
}
