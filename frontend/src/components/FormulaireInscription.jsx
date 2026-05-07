/**
 * FormulaireInscription.jsx — Orchestrateur multi-étapes du formulaire Clair-Bois.
 *
 * S'adapte selon le chemin d'aiguillage (parcours + chemin).
 * Gère : navigation entre étapes, validation, soumission, récapitulatif.
 *
 * Props :
 *   parcours    — 'stages' | 'modules'
 *   chemin      — { pourQui: 'moi'|'autre', dejaInscrit: bool }
 *   contextData — { secteur, dateDebut, dateFin } OU { modules: [{mod, semaine}] }
 *   onBack      — retour à la page précédente (stages/modules)
 *   onGoHome    — retour à l'accueil
 */
import { useState } from 'react'
import { getFormConfig, getCheminKey, SECTION_LABELS, INITIAL_DATA } from '../utils/formConfig'
import {
  validateRequired, validateAVS, validatePhone, validatePhoneOptional,
  validateNPA, validateEmail, validateEmailOptional, validateDateNaissance,
} from '../utils/validation'
import { formatDate } from '../utils/helpers'
import EtapeStagiaire from './formulaire/EtapeStagiaire'
import EtapeCuratelle from './formulaire/EtapeCuratelle'
import EtapeUrgence from './formulaire/EtapeUrgence'
import EtapeAI from './formulaire/EtapeAI'
import EtapeReferent from './formulaire/EtapeReferent'
import EtapeComplementaire from './formulaire/EtapeComplementaire'
import EtapeDeclaration from './formulaire/EtapeDeclaration'
import Recapitulatif from './formulaire/Recapitulatif'
import Confirmation from './formulaire/Confirmation'

/** Règles de validation par champ */
const VALIDATORS = {
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
  deja_stages_secteur: validateRequired,
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
}

/** Champs requis par section */
const SECTION_FIELDS = {
  referent: ['referent_partenaire', 'referent_nom', 'referent_prenom', 'referent_tel', 'referent_email', 'referent_fonction'],
  stagiaire: ['nom', 'prenom', 'sexe', 'date_naissance', 'avs', 'tel', 'email', 'adresse', 'npa', 'formation'],
  'stagiaire-retour': ['nom', 'prenom', 'sexe', 'date_naissance', 'avs', 'tel', 'email'],
  curatelle: ['sous_curatelle'],  // Les champs curateur sont conditionnels
  urgence: ['urgence_nom', 'urgence_prenom', 'urgence_lien', 'urgence_tel'],
  ai: ['inscrit_ai'],  // Les champs conseiller AI sont conditionnels
  complementaire: ['parcours_scolaire', 'limitations', 'deja_tests', 'deja_stages_secteur', 'reseau_medical'],
  declaration: ['declaration_charte', 'declaration_engagement'],
}

/** Champs conditionnels curatelle (requis seulement si sous_curatelle.startsWith('Oui')) */
const CURATELLE_FIELDS = ['curatelle_type', 'curatelle_nom', 'curatelle_prenom', 'curatelle_tel', 'curatelle_email']

/** Champs conditionnels AI (requis seulement si inscrit_ai === 'Oui' ou 'Demande en cours') */
const AI_FIELDS = ['ai_nom', 'ai_prenom', 'ai_tel', 'ai_email', 'ai_office']

export default function FormulaireInscription({ parcours, chemin, contextData, onBack, onGoHome }) {
  const config = getFormConfig(parcours, chemin)
  const cheminKey = getCheminKey(parcours, chemin)
  const { sections } = config

  const [formData, setFormData] = useState({ ...INITIAL_DATA })
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null) // 'success' | 'error' | null

  // Étapes = sections + récap
  const totalSteps = sections.length + 1 // +1 pour le récapitulatif
  const isRecap = currentStep === sections.length
  const currentSection = isRecap ? null : sections[currentStep]

  /** Met à jour un champ du formulaire */
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  /** Valide un champ au blur */
  const handleBlur = (name) => {
    const validator = VALIDATORS[name]
    if (validator) {
      const result = validator(formData[name])
      if (!result.valid) {
        setErrors(prev => ({ ...prev, [name]: result.message }))
      }
    }
  }

  /** Valide tous les champs de l'étape courante */
  const validateStep = () => {
    if (isRecap) return true

    const section = sections[currentStep]
    let fields = [...(SECTION_FIELDS[section] || [])]

    // Curatelle : ajouter les champs conditionnels si "Oui" (les 2 variantes)
    if (section === 'curatelle' && formData.sous_curatelle && formData.sous_curatelle.startsWith('Oui')) {
      fields = [...fields, ...CURATELLE_FIELDS]
    }

    // AI : ajouter les champs conseiller si inscrit (toute réponse sauf "Non")
    if (section === 'ai' && formData.inscrit_ai && formData.inscrit_ai !== 'Non') {
      fields = [...fields, ...AI_FIELDS]
    }

    // Complémentaire : objectif_stage requis seulement pour les stages
    if (section === 'complementaire' && parcours === 'stages') {
      fields = [...fields, 'objectif_stage']
    }

    const newErrors = {}
    let valid = true

    for (const field of fields) {
      const validator = VALIDATORS[field]
      if (validator) {
        const result = validator(formData[field])
        if (!result.valid) {
          newErrors[field] = result.message
          valid = false
        }
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }))
    return valid
  }

  /** Passer à l'étape suivante */
  const nextStep = () => {
    if (!validateStep()) return
    setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /** Revenir à l'étape précédente */
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /** Aller directement à une étape (depuis le récap) */
  const goToStep = (step) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /** Construire le payload pour Power Automate */
  const buildPayload = () => {
    const payload = {
      cheminKey,
      parcours,
      pourQui: chemin.pourQui,
      dejaInscrit: chemin.dejaInscrit,
      dateEnvoi: new Date().toISOString(),
    }

    // Contexte stage/modules
    if (parcours === 'stages' && contextData) {
      payload.secteur = contextData.secteur
      payload.dateDebut = contextData.dateDebut
      payload.dateFin = contextData.dateFin
    }
    if (parcours === 'modules' && contextData?.modules) {
      payload.modules = contextData.modules.map(m => ({
        nom: m.mod.nom,
        site: m.mod.site,
        semaine: m.semaine.semaine,
        dateDebut: m.semaine.dateDebut,
        dateFin: m.semaine.dateFin,
      }))
    }

    // Données du formulaire (seulement les sections visibles)
    for (const section of sections) {
      const fields = SECTION_FIELDS[section] || []
      for (const field of fields) {
        if (formData[field]) payload[field] = formData[field]
      }
      // Champs conditionnels curatelle
      if (section === 'curatelle' && formData.sous_curatelle && formData.sous_curatelle.startsWith('Oui')) {
        for (const field of CURATELLE_FIELDS) {
          if (formData[field]) payload[field] = formData[field]
        }
      }
      // Champs conditionnels AI
      if (section === 'ai' && formData.inscrit_ai && formData.inscrit_ai !== 'Non') {
        for (const field of AI_FIELDS) {
          if (formData[field]) payload[field] = formData[field]
        }
        if (formData.ai_mesure) payload.ai_mesure = formData.ai_mesure
      }
      // Champs complémentaires : objectif_stage seulement pour stages
      if (section === 'complementaire' && parcours === 'stages' && formData.objectif_stage) {
        payload.objectif_stage = formData.objectif_stage
      }
      // Tailles (optionnels)
      if (section === 'complementaire') {
        for (const field of ['pointure', 'taille_tshirt', 'taille_pantalon']) {
          if (formData[field]) payload[field] = formData[field]
        }
      }
    }

    return payload
  }

  /** Envoyer la demande */
  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const payload = buildPayload()
      const httpUrl = import.meta.env.VITE_PA_HTTP_URL

      if (!httpUrl) {
        // Mode démo : pas d'URL configurée → simuler un succès
        console.log('Mode démo — payload:', JSON.stringify(payload, null, 2))
        await new Promise(r => setTimeout(r, 1500))
        setSubmitResult('success')
        return
      }

      const response = await fetch(httpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error(`Erreur ${response.status}`)
      setSubmitResult('success')
    } catch (err) {
      console.error('Erreur envoi:', err)
      setSubmitResult('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Rendu ---

  // Écran de confirmation post-envoi
  if (submitResult) {
    return (
      <div className="animate-fadeIn">
        <Confirmation
          result={submitResult}
          onGoHome={onGoHome}
          onRetry={() => setSubmitResult(null)}
        />
      </div>
    )
  }

  // Contexte affiché en haut
  const contextLabel = parcours === 'stages'
    ? `${contextData?.secteur || 'Stage'} — ${contextData?.dateDebut ? formatDate(contextData.dateDebut) : ''} ${contextData?.dateFin ? 'au ' + formatDate(contextData.dateFin) : ''}`
    : contextData?.modules
      ? `${contextData.modules.length} module${contextData.modules.length > 1 ? 's' : ''} sélectionné${contextData.modules.length > 1 ? 's' : ''}`
      : 'Modules métiers'

  return (
    <div className="animate-fadeIn -mx-4 -mt-6 -mb-6 px-4 pt-6 pb-10 min-h-screen"
         style={{ background: 'linear-gradient(160deg, #e3ecfa 0%, #ede4f3 30%, #f5f0fa 50%, #e8f0f8 80%, #dce8f5 100%)' }}>
      {/* Retour — étape précédente ou confirmation quitter */}
      <button
        onClick={() => {
          if (currentStep > 0) {
            prevStep()
          } else {
            if (window.confirm('Voulez-vous vraiment quitter le formulaire ? Vos données saisies seront perdues.')) {
              onBack()
            }
          }
        }}
        className="inline-flex items-center gap-2 text-sm font-medium text-white bg-cb-blue hover:bg-cb-blue/90
                   px-4 py-2 rounded-lg transition-colors cursor-pointer mt-6 mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {currentStep > 0 ? 'Étape précédente' : 'Quitter le formulaire'}
      </button>

      {/* En-tête */}
      <div className="text-center mb-4">
        <p className="text-sm font-medium text-cb-blue mb-1">{config.label}</p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          {isRecap ? 'Récapitulatif' : SECTION_LABELS[currentSection] || 'Formulaire'}
        </h2>
        <p className="text-gray-500 text-sm">{contextLabel}</p>
      </div>

      {/* Barre de progression */}
      <div className="mb-6">
        {/* Étapes en ligne avec traits continus */}
        <div className="flex items-center mb-2">
          {[...sections, '_recap'].map((sec, idx) => {
            const isLast = idx === sections.length
            const isDone = idx < currentStep
            const isCurrent = isLast ? isRecap : idx === currentStep

            const circleClass = isDone
              ? 'bg-cb-green text-white shadow-sm'
              : isCurrent
                ? 'bg-cb-blue text-white ring-4 ring-cb-blue/20 shadow-md'
                : 'bg-cb-orange/80 text-white shadow-sm'

            const lineClass = idx <= currentStep ? 'bg-cb-green' : 'bg-cb-orange/40'

            return (
              <div key={sec} className="flex items-center" style={{ flex: isLast ? '0 0 auto' : '1 1 0%' }}>
                {/* Cercle */}
                <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 ${circleClass}`}>
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isLast ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : idx + 1}
                </div>
                {/* Trait après (sauf dernier) */}
                {!isLast && (
                  <div className={`flex-1 h-1 rounded-full mx-1 transition-colors duration-300 ${lineClass}`} />
                )}
              </div>
            )
          })}
        </div>
        {/* Indicateur étape courante (mobile-friendly) */}
        <p className="text-center text-xs text-gray-400">
          Étape {Math.min(currentStep + 1, sections.length + 1)} / {sections.length + 1}
          {' — '}
          <span className="text-cb-blue font-medium">
            {isRecap ? 'Récapitulatif' : SECTION_LABELS[currentSection]}
          </span>
        </p>
      </div>

      {/* Contenu de l'étape */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 mb-4 shadow-sm">
        <div className="animate-fadeIn" key={currentStep}>
          {currentSection === 'referent' && (
            <EtapeReferent data={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} />
          )}
          {(currentSection === 'stagiaire') && (
            <EtapeStagiaire data={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} />
          )}
          {currentSection === 'stagiaire-retour' && (
            <EtapeStagiaire data={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} isRetour />
          )}
          {currentSection === 'curatelle' && (
            <EtapeCuratelle data={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} pourQui={chemin.pourQui} />
          )}
          {currentSection === 'urgence' && (
            <EtapeUrgence data={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} />
          )}
          {currentSection === 'ai' && (
            <EtapeAI data={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} pourQui={chemin.pourQui} />
          )}
          {currentSection === 'complementaire' && (
            <EtapeComplementaire data={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} parcours={parcours} />
          )}
          {currentSection === 'declaration' && (
            <EtapeDeclaration data={formData} errors={errors} onChange={handleChange} />
          )}
          {isRecap && (
            <Recapitulatif
              data={formData}
              contextData={contextData}
              parcours={parcours}
              sections={sections}
              onEdit={goToStep}
            />
          )}
        </div>
      </div>

      {/* Boutons navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={currentStep === 0 ? () => {
            if (window.confirm('Voulez-vous vraiment quitter le formulaire ? Vos données saisies seront perdues.')) {
              onBack()
            }
          } : prevStep}
          className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300
                     rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {currentStep === 0 ? 'Annuler' : 'Précédent'}
        </button>

        {isRecap ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-cb-accent text-white rounded-lg font-medium
                       hover:bg-cb-accent/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Envoyer ma demande
              </>
            )}
          </button>
        ) : (
          <button
            onClick={nextStep}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cb-blue text-white rounded-lg font-medium
                       hover:bg-cb-blue/90 transition-colors cursor-pointer"
          >
            Suivant
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Contact en cas de besoin */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">
          Besoin d'aide ?{' '}
          <a href="mailto:stagiaire.dfip@clairbois.ch" className="text-cb-blue hover:underline">
            stagiaire.dfip@clairbois.ch
          </a>
        </p>
      </div>
    </div>
  )
}
