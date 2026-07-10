/**
 * FormulaireInscription.jsx — Orchestrateur du wizard multi-etapes.
 *
 * Architecture wizard :
 *   1. getFormConfig() derive la liste ordonnee de sections a afficher depuis
 *      (parcours + chemin). Ce tableau "sections" est la source de verite de
 *      l'ordre et du nombre d'etapes.
 *   2. currentStep est un index dans sections[]. La derniere etape (index
 *      sections.length) est toujours le recapitulatif.
 *   3. Chaque section est rendue par son composant Etape* dedie.
 *   4. La soumission HTTP (handleSubmit) envoie un payload JSON vers Power Automate
 *      via VITE_PA_HTTP_URL. Sans cette variable d'environnement, le formulaire
 *      tourne en mode demo (log console, succes simule).
 *
 * Etapes conditionnelles selon chemin.parcours :
 *   - 'referent'         : present uniquement si chemin.pourQui === 'autre'
 *   - 'stagiaire-retour' : remplace toutes les autres sections si dejaInscrit === true
 *     et pourQui === 'moi' (chemin court, dossier deja connu)
 *   - 'objectif_stage'   : champ present dans complementaire uniquement pour 'stages'
 *
 * Props :
 *   parcours    : 'stages' | 'modules'
 *   chemin      : { pourQui: 'moi'|'autre', dejaInscrit: bool }
 *   contextData : { secteur, dateDebut, dateFin } pour stages
 *                 { modules: [{mod, semaine}] } pour modules
 *   onBack      : rappele quand l'utilisateur quitte le formulaire (etape 0)
 *   onGoHome    : rappele apres confirmation ou depuis l'ecran final
 */
import { useState } from 'react'
import { getFormConfig, getCheminKey, SECTION_LABELS } from '../utils/formConfig'
import {
  donneesInitiales, validerChamp, validerEtape, collecterPayload, champsVisibles,
  etapesDuFormulaire,
} from '../utils/formulaireDynamique'
import { formatDate } from '../utils/helpers'
import { questionsPrealablesDe } from '../utils/schemaFormulaires'
import EtapeGenerique from './formulaire/EtapeGenerique'
import QuestionsPrealables from './QuestionsPrealables'
import EtapeStagiaire from './formulaire/EtapeStagiaire'
import EtapeCuratelle from './formulaire/EtapeCuratelle'
import EtapeUrgence from './formulaire/EtapeUrgence'
import EtapeAI from './formulaire/EtapeAI'
import EtapeReferent from './formulaire/EtapeReferent'
import EtapeComplementaire from './formulaire/EtapeComplementaire'
import EtapeDeclaration from './formulaire/EtapeDeclaration'
import Recapitulatif from './formulaire/Recapitulatif'
import Confirmation from './formulaire/Confirmation'

// Les champs, leurs conditions et leurs validateurs sont désormais dérivés
// du schéma des formulaires (public/formulaire-schema.json — mode édition
// #edition). Voir utils/formulaireDynamique.js pour le moteur.

export default function FormulaireInscription({ schema, parcours, chemin, contextData, onBack, onGoHome }) {
  // La config garde le libellé/description du chemin d'aiguillage
  const config = getFormConfig(parcours, chemin)
  // cheminKey est inclus dans le payload pour que Power Automate sache quel flux declencher
  const cheminKey = getCheminKey(parcours, chemin)

  // Questions préalables (mode édition) : posées AVANT le formulaire, leurs
  // réponses conditionnent l'affichage des étapes. Le chemin court « retour »
  // n'a qu'une étape → on saute les préalables.
  const questionsPrealables = cheminKey === 'stages-moi-oui' ? [] : questionsPrealablesDe(schema, 'inscription')
  const [prealables, setPrealables] = useState(questionsPrealables.length ? null : {})

  // Contexte injecté dans l'évaluation des conditions du schéma
  // (aiguillage + réponses aux questions préalables).
  const contexte = { parcours, pourQui: chemin.pourQui, ...(prealables || {}) }

  // Les SECTIONS du wizard viennent du SCHÉMA (mode édition #edition) :
  // une étape ajoutée/réordonnée par la coordination apparaît automatiquement.
  // Exception : le chemin court « retour à Clair-Bois » garde sa section figée.
  const etapesInscription = etapesDuFormulaire(schema, 'inscription', contexte)
  const sections = cheminKey === 'stages-moi-oui'
    ? ['stagiaire-retour']
    : etapesInscription.map((e) => e.cle)
  // Titres affichés (barre de progression, en-têtes) : schéma d'abord,
  // libellés historiques en secours (stagiaire-retour n'est pas dans le schéma)
  const titresEtapes = new Map(etapesInscription.map((e) => [e.cle, e.titre]))
  const titreSection = (cle) => titresEtapes.get(cle) || SECTION_LABELS[cle] || cle
  const etapeCourante = (cle) => etapesInscription.find((e) => e.cle === cle)

  const [formData, setFormData] = useState(() => donneesInitiales(schema))
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null) // 'success' | 'error' | null

  // Le recapitulatif est une pseudo-etape apres la derniere section
  const totalSteps = sections.length + 1
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

  /** Valide un champ au blur (validateur dérivé du schéma) */
  const handleBlur = (name) => {
    const champ = champsVisibles(schema, currentSection, { ...formData, ...contexte })
      .find(c => c.champPayload === name)
    if (!champ) return
    const result = validerChamp(champ, formData[name])
    if (!result.valid) {
      setErrors(prev => ({ ...prev, [name]: result.message }))
    }
  }

  /**
   * Valide tous les champs VISIBLES de l'etape courante (conditions du
   * schéma évaluées : curatelle, AI, parcours) avant de passer a la suivante.
   * Retourne true si l'etape est valide, false sinon (et popule errors).
   */
  const validateStep = () => {
    if (isRecap) return true
    const { valid, errors: newErrors } = validerEtape(schema, sections[currentStep], formData, contexte)
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

  /**
   * Construit le payload JSON envoye a Power Automate.
   *
   * Structure :
   *   - Metadonnees de routage (cheminKey, parcours, pourQui, dejaInscrit, dateEnvoi)
   *   - Contexte de la demande (secteur+dates pour stages, liste modules pour modules)
   *   - Champs formulaire : seules les sections visibles sont incluses, et seuls
   *     les champs remplis sont ajoutes (pas de cles vides dans le payload)
   *
   * Les champs conditionnels (curatelle, AI, objectif_stage, tailles) suivent
   * la meme logique que validateStep pour rester coherents.
   */
  const buildPayload = () => {
    const payload = {
      cheminKey,
      parcours,
      pourQui: chemin.pourQui,
      dejaInscrit: chemin.dejaInscrit,
      dateEnvoi: new Date().toISOString(),
    }

    // Contexte stage ou modules selectionnes (non saisi dans le formulaire, vient du flux precedent)
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

    // Champs des sections affichees, filtres par les conditions du schéma
    // (curatelle, AI, parcours) — seuls les champs remplis sont inclus.
    Object.assign(payload, collecterPayload(schema, sections, formData, contexte))

    return payload
  }

  /**
   * Envoie le payload vers Power Automate via HTTP POST (trigger de flux).
   * L'URL est lue depuis VITE_PA_HTTP_URL pour ne pas exposer le webhook en clair dans le code.
   * Sans cette variable, le formulaire tourne en mode demo (log + succes simule).
   */
  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const payload = buildPayload()
      const httpUrl = import.meta.env.VITE_PA_HTTP_URL

      if (!httpUrl) {
        // Mode demo : permet de tester le formulaire sans flux Power Automate configure
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

  // Écran des questions préalables (avant le wizard) — tant que non répondues
  if (questionsPrealables.length > 0 && prealables === null) {
    return (
      <QuestionsPrealables
        questions={questionsPrealables}
        titre={config.label}
        onValider={(reponses) => setPrealables(reponses)}
        onRetour={onBack}
      />
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
         style={{ background: 'var(--cb-form-bg, linear-gradient(160deg, #e3ecfa 0%, #ede4f3 30%, #f5f0fa 50%, #e8f0f8 80%, #dce8f5 100%))' }}>
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
          {isRecap ? 'Récapitulatif' : titreSection(currentSection)}
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
            {isRecap ? 'Récapitulatif' : titreSection(currentSection)}
          </span>
        </p>
      </div>

      {/* Contenu de l'étape */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 mb-4 shadow-sm">
        <div className="animate-fadeIn" key={currentStep}>
          {currentSection === 'referent' && (
            <EtapeReferent schema={schema} contexte={contexte} data={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} />
          )}
          {(currentSection === 'stagiaire') && (
            <EtapeStagiaire schema={schema} contexte={contexte} data={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} />
          )}
          {currentSection === 'stagiaire-retour' && (
            <EtapeStagiaire schema={schema} contexte={contexte} data={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} isRetour />
          )}
          {currentSection === 'curatelle' && (
            <EtapeCuratelle schema={schema} contexte={contexte} data={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} />
          )}
          {currentSection === 'urgence' && (
            <EtapeUrgence schema={schema} contexte={contexte} data={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} />
          )}
          {currentSection === 'ai' && (
            <EtapeAI schema={schema} contexte={contexte} data={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} />
          )}
          {currentSection === 'complementaire' && (
            <EtapeComplementaire schema={schema} contexte={contexte} data={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} />
          )}
          {currentSection === 'declaration' && (
            <EtapeDeclaration schema={schema} contexte={contexte} data={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} />
          )}
          {/* Étape AJOUTÉE par la coordination (aucun composant dédié) : rendu générique */}
          {!isRecap && !SECTION_LABELS[currentSection] && etapeCourante(currentSection) && (
            <EtapeGenerique
              schema={schema}
              etape={etapeCourante(currentSection)}
              contexte={contexte}
              data={formData}
              errors={errors}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          )}
          {isRecap && (
            <Recapitulatif
              schema={schema}
              data={formData}
              contextData={contextData}
              parcours={parcours}
              pourQui={chemin.pourQui}
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

    </div>
  )
}
