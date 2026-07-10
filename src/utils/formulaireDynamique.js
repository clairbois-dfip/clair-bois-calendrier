/*
 * formulaireDynamique.js — Moteur de rendu des formulaires depuis le schéma.
 *
 * Depuis juillet 2026, les champs des formulaires ne sont plus codés en dur
 * dans les composants EtapeXxx : ils sont décrits dans
 * public/formulaire-schema.json, édité par la coordination via le mode
 * édition (#edition). Ce module fournit tout ce qu'il faut pour rendre,
 * valider et sérialiser un formulaire depuis ce schéma en préservant le
 * comportement historique (conditions curatelle/AI, chemin retour,
 * champs optionnels, conversion des cases à cocher).
 */
import {
  validateRequired, validateAVS, validatePhone, validatePhoneOptional,
  validateNPA, validateEmail, validateEmailOptional, validateDateNaissance,
} from './validation'

/**
 * Validateurs par clé de payload — comportement HISTORIQUE conservé à
 * l'identique (mêmes fonctions qu'avant la refonte dynamique).
 * Un champ ajouté par la coordination sans entrée ici reçoit
 * validateRequired s'il est marqué obligatoire dans le schéma.
 */
export const VALIDATEURS = {
  // Stagiaire
  nom: validateRequired,
  prenom: validateRequired,
  sexe: validateRequired,
  date_naissance: validateDateNaissance,
  avs: validateAVS,
  tel: validatePhone,
  email: validateEmail,
  adresse: validateRequired,
  npa: validateNPA,
  localite: validateRequired,
  formation: validateRequired,
  // Curatelle
  sous_curatelle: validateRequired,
  curatelle_type: validateRequired,
  curatelle_nom: validateRequired,
  curatelle_prenom: validateRequired,
  curatelle_tel: validatePhone,
  curatelle_email: validateEmail,
  // Urgence
  urgence_nom: validateRequired,
  urgence_prenom: validateRequired,
  urgence_lien: validateRequired,
  urgence_tel: validatePhone,
  // AI
  inscrit_ai: validateRequired,
  ai_tel: validatePhoneOptional,
  ai_email: validateEmailOptional,
  // Complémentaire
  objectif_stage: validateRequired,
  parcours_scolaire: validateRequired,
  limitations: validateRequired,
  deja_tests: validateRequired,
  reseau_medical: validateRequired,
  // Déclaration
  declaration_charte: validateRequired,
  declaration_engagement: validateRequired,
  // Référent
  referent_partenaire: validateRequired,
  referent_nom: validateRequired,
  referent_prenom: validateRequired,
  referent_tel: validatePhone,
  referent_email: validateEmail,
  referent_fonction: validateRequired,
  // Signalement (nom/prenom/tel/email partagés ci-dessus)
  motif: validateRequired,
}

/**
 * Champs historiquement affichés « requis » mais JAMAIS bloquants
 * (aucun validateur avant la refonte — comportement conservé pour ne pas
 * durcir le formulaire par surprise).
 */
const SANS_VALIDATION_HISTORIQUE = new Set(['ai_nom', 'ai_prenom', 'ai_office', 'ai_mesure'])

/**
 * Chemin « retour à Clair-Bois » (stages-moi-oui) : sous-ensemble figé des
 * champs de l'étape stagiaire suffisant pour identifier un dossier existant.
 */
export const CHAMPS_RETOUR = ['nom', 'prenom', 'sexe', 'date_naissance', 'avs', 'tel', 'email']

/**
 * Évalue une condition d'affichage du schéma.
 * Syntaxes supportées (les seules utilisées par les formulaires) :
 *   - null / ''            → toujours visible
 *   - 'champ=valeur'       → égalité stricte
 *   - 'champ=Prefixe*'     → commence par (ex. sous_curatelle=Oui*)
 *   - 'champ!=valeur'      → différent ET non vide (comportement historique
 *                            du bloc AI : visible si inscrit_ai renseigné ≠ Non)
 *
 * @param {string|null} condition Condition du champ (ou d'une option).
 * @param {object} valeurs Fusion des données du formulaire et du contexte
 *                         ({ ...formData, parcours, pourQui }).
 * @returns {boolean}
 */
export function evaluerCondition(condition, valeurs) {
  if (!condition || !condition.trim()) return true
  const neg = condition.includes('!=')
  const [champ, attendu = ''] = condition.split(neg ? '!=' : '=').map((s) => s.trim())
  const valeur = (valeurs?.[champ] ?? '').toString()
  if (neg) {
    return valeur !== '' && valeur !== attendu
  }
  if (attendu.endsWith('*')) {
    return valeur.startsWith(attendu.slice(0, -1))
  }
  return valeur === attendu
}

/**
 * Champs d'une étape, triés, SANS filtrage de condition.
 * Gère la pseudo-étape 'stagiaire-retour' (sous-ensemble de 'stagiaire').
 *
 * @param {object} schema Schéma des formulaires.
 * @param {string} etapeCle Clé d'étape (ou 'stagiaire-retour').
 * @returns {object[]}
 */
export function champsDeLEtape(schema, etapeCle) {
  const cible = etapeCle === 'stagiaire-retour' ? 'stagiaire' : etapeCle
  let champs = (schema?.champs || [])
    .filter((c) => c.etape === cible)
    .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
  if (etapeCle === 'stagiaire-retour') {
    champs = champs.filter((c) => CHAMPS_RETOUR.includes(c.champPayload))
  }
  return champs
}

/**
 * Champs VISIBLES d'une étape : conditions évaluées contre données + contexte.
 *
 * @param {object} schema Schéma des formulaires.
 * @param {string} etapeCle Clé d'étape.
 * @param {object} valeurs { ...formData, parcours, pourQui }.
 * @returns {object[]}
 */
export function champsVisibles(schema, etapeCle, valeurs) {
  return champsDeLEtape(schema, etapeCle).filter((c) => evaluerCondition(c.condition, valeurs))
}

/**
 * Options d'un champ filtrées par leurs conditions éventuelles
 * (ex. « Oui - curateur complète » visible seulement si pourQui=autre).
 *
 * @param {object} champ Champ du schéma.
 * @param {object} valeurs Contexte + données.
 * @returns {{value: string, label: string}[]}
 */
export function optionsVisibles(champ, valeurs) {
  return (champ.options || []).filter((o) => evaluerCondition(o.condition, valeurs))
}

/**
 * Validateur effectif d'un champ (comportement historique préservé) :
 *   1. entrée VALIDATEURS si elle existe ;
 *   2. sinon validateRequired si obligatoire (sauf exceptions historiques) ;
 *   3. sinon aucun.
 * Un champ NON obligatoire et vide est toujours valide (les validateurs de
 * format ne s'appliquent qu'à une valeur saisie).
 *
 * @param {object} champ Champ du schéma.
 * @param {string} valeur Valeur courante.
 * @returns {{ valid: boolean, message: string }}
 */
export function validerChamp(champ, valeur) {
  const validateur = VALIDATEURS[champ.champPayload]
  if (!champ.obligatoire && (!valeur || !valeur.toString().trim())) {
    return { valid: true, message: '' }
  }
  if (validateur) return validateur(valeur)
  if (champ.obligatoire && !SANS_VALIDATION_HISTORIQUE.has(champ.champPayload)) {
    return validateRequired(valeur)
  }
  return { valid: true, message: '' }
}

/**
 * Valide tous les champs visibles d'une étape.
 *
 * @returns {{ valid: boolean, errors: object }} erreurs par champPayload.
 */
export function validerEtape(schema, etapeCle, formData, contexte) {
  const valeurs = { ...formData, ...contexte }
  const errors = {}
  let valid = true
  for (const champ of champsVisibles(schema, etapeCle, valeurs)) {
    const res = validerChamp(champ, formData[champ.champPayload])
    if (!res.valid) {
      errors[champ.champPayload] = res.message
      valid = false
    }
  }
  return { valid, errors }
}

/**
 * État initial du formulaire : toutes les clés de payload du schéma à ''.
 * Garantit des inputs contrôlés dès le premier rendu, y compris pour les
 * champs ajoutés par la coordination après coup.
 *
 * @param {object} schema Schéma des formulaires.
 * @returns {object}
 */
export function donneesInitiales(schema) {
  const data = {}
  for (const champ of schema?.champs || []) {
    data[champ.champPayload] = ''
  }
  return data
}

/**
 * Collecte les valeurs à envoyer pour une liste de sections visibles :
 * seuls les champs visibles (conditions) ET remplis sont inclus — aucune
 * clé vide dans le payload (comportement historique).
 *
 * @param {object} schema Schéma des formulaires.
 * @param {string[]} sections Sections affichées (ordre du wizard).
 * @param {object} formData Données saisies.
 * @param {object} contexte { parcours, pourQui }.
 * @returns {object} Fragment de payload { champPayload: valeur }.
 */
export function collecterPayload(schema, sections, formData, contexte) {
  const valeurs = { ...formData, ...contexte }
  const fragment = {}
  for (const section of sections) {
    for (const champ of champsVisibles(schema, section, valeurs)) {
      const valeur = formData[champ.champPayload]
      if (valeur) fragment[champ.champPayload] = valeur
    }
  }
  return fragment
}
