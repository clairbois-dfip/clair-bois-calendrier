/**
 * formConfig.js — Source de vérité déclarative du formulaire d'inscription.
 *
 * Ce fichier pilote entierement la structure du wizard : il suffit de modifier
 * FORM_CONFIGS pour ajouter, supprimer ou reordonner des etapes sans toucher
 * aux composants de rendu.
 *
 * La cle de chemin est construite a partir de trois signaux d'aiguillage :
 *   - parcours      : 'stages' | 'modules'
 *   - chemin.pourQui     : 'moi' | 'autre' (inscription propre ou par referent)
 *   - chemin.dejaInscrit : true | false (nouveau vs retour)
 */

/**
 * Table de routage du wizard : cheminKey -> etapes visibles.
 *
 * Chaque entree definit :
 *   - sections    : liste ordonnee des clefs de section a afficher
 *   - label       : titre court pour la barre de progression
 *   - description : phrase contextuelle visible dans l'en-tete
 *
 * Regle de derivation des sections :
 *   - 'referent' est prepend quand l'inscription se fait via un tiers ('autre')
 *   - 'stagiaire-retour' remplace 'stagiaire' + tout le reste quand dejaInscrit=true et pourQui='moi'
 *     (dossier deja connu, on ne re-saisit que l'essentiel)
 *   - Pour les modules, dejaInscrit n'existe pas : seul pourQui compte
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
  // Chemin court : la personne est deja connue, seuls les identifiants sont re-confirmes
  'stages-moi-oui': {
    sections: ['stagiaire-retour'],
    label: 'Retour à Clair-Bois',
    description: 'Vous avez déjà effectué un stage ou module chez Clair-Bois.',
  },
  // Un referent re-inscrit quelqu'un : dossier complet quand meme (la fondation ne lie pas les dossiers)
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

/**
 * Calcule la cle de routage a partir des reponses d'aiguillage.
 * Cette cle est aussi incluse dans le payload envoye a Power Automate
 * pour que le flow cote serveur sache quel chemin a ete emprunte.
 */
export function getCheminKey(parcours, chemin) {
  if (parcours === 'modules') {
    return `modules-${chemin.pourQui}`
  }
  return `stages-${chemin.pourQui}-${chemin.dejaInscrit ? 'oui' : 'non'}`
}

/**
 * Retourne la configuration du wizard pour un couple parcours/chemin donne.
 * Fallback sur 'stages-moi-non' si la cle n'existe pas (ne devrait pas arriver en prod).
 */
export function getFormConfig(parcours, chemin) {
  const key = getCheminKey(parcours, chemin)
  return FORM_CONFIGS[key] || FORM_CONFIGS['stages-moi-non']
}

/** Libelles affiches dans la barre de progression et dans le recapitulatif */
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

/**
 * Etat initial vide du formulaire.
 * Centralise ici pour garantir qu'aucun champ n'est undefined au premier rendu,
 * ce qui evite les avertissements React sur les inputs non-controles.
 */
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
  reseau_medical: '',
  pointure: '',
  taille_tshirt: '',
  taille_pantalon: '',

  // Déclaration
  declaration_charte: '',
  declaration_engagement: '',
}
