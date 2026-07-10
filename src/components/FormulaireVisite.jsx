/**
 * FormulaireVisite.jsx — Formulaire de demande de visite pour enseignants.
 *
 * Formulaire autonome, hors du flux multi-etapes d'inscription.
 * Destine aux enseignants ou educateurs qui souhaitent faire visiter
 * la fondation a leur classe avant d'envisager un stage.
 *
 * Depuis juillet 2026, les champs ET les sections sont rendus dynamiquement
 * depuis public/formulaire-schema.json (formulaire 'visite', 4 étapes-cartes)
 * — éditables par la coordination via le mode édition (#edition).
 * Le champ contactAI porte la condition `demandeAI=Validée` dans le schéma.
 *
 * Contrairement au signalement, il n'y a pas de mode demo : VITE_PA_HTTP_URL
 * doit etre configure pour que l'envoi fonctionne.
 *
 * Props :
 *   schema   — schéma des formulaires (chargé par App.jsx)
 *   onGoHome — retour a la page d'accueil apres envoi ou annulation
 */
import { useState } from 'react'
import ChampsEtape, { IntroEtape } from './formulaire/ChampsEtape'
import Confirmation from './formulaire/Confirmation'
import {
  champsDeLEtape, champsVisibles, validerChamp, validerEtape, collecterPayload,
  etapesDuFormulaire,
} from '../utils/formulaireDynamique'

export default function FormulaireVisite({ schema, onGoHome }) {
  // Étapes du formulaire visite = les cartes-sections affichées
  const etapes = etapesDuFormulaire(schema, 'visite')

  const [formData, setFormData] = useState(() => {
    const data = {}
    for (const etape of etapes) {
      for (const champ of champsDeLEtape(schema, etape.cle)) {
        data[champ.champPayload] = champ.type === 'multiselect' ? [] : ''
      }
    }
    return data
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null)

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleBlur = (name) => {
    for (const etape of etapes) {
      const champ = champsDeLEtape(schema, etape.cle).find(c => c.champPayload === name)
      if (champ) {
        const result = validerChamp(champ, formData[name])
        if (!result.valid) setErrors(prev => ({ ...prev, [name]: result.message }))
        return
      }
    }
  }

  /** Valide toutes les sections (les conditions du schéma s'appliquent). */
  const validateAll = () => {
    let valid = true
    const newErrors = {}
    for (const etape of etapes) {
      const res = validerEtape(schema, etape.cle, formData, {})
      if (!res.valid) {
        valid = false
        Object.assign(newErrors, res.errors)
      }
    }
    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async () => {
    if (!validateAll()) return
    setIsSubmitting(true)
    try {
      const httpUrl = import.meta.env.VITE_PA_HTTP_URL
      if (!httpUrl) throw new Error('URL non configurée')
      const payload = {
        type: 'visite',
        dateEnvoi: new Date().toISOString(),
        ...collecterPayload(schema, etapes.map((e) => e.cle), formData, {}),
      }
      const response = await fetch(httpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error(`Erreur ${response.status}`)
      setSubmitResult('success')
    } catch {
      setSubmitResult('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitResult) {
    return (
      <div className="animate-fadeIn">
        <Confirmation result={submitResult} onGoHome={onGoHome} onRetry={() => setSubmitResult(null)} />
      </div>
    )
  }

  return (
    <div className="animate-fadeIn -mx-4 -mt-6 -mb-6 px-4 pt-6 pb-10 min-h-screen"
         style={{ background: 'var(--cb-form-bg, linear-gradient(160deg, #e3ecfa 0%, #ede4f3 30%, #f5f0fa 50%, #e8f0f8 80%, #dce8f5 100%))' }}>

      <button
        onClick={onGoHome}
        className="inline-flex items-center gap-2 text-sm font-medium text-white bg-cb-blue
                   hover:bg-cb-blue/90 px-4 py-2 rounded-lg transition-colors cursor-pointer mt-6 mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour à l'accueil
      </button>

      {/* En-tête */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-cb-blue-light rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-cb-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Demande de visite
        </h2>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          Vous souhaitez faire visiter la Fondation Clair Bois à votre classe ?
          Remplissez ce formulaire et nous vous recontacterons.
        </p>
      </div>

      {/* Sections dérivées du schéma : une carte par étape */}
      {etapes.map((etape) => (
        <div key={etape.cle} className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 mb-4 shadow-sm max-w-lg mx-auto">
          <h3 className="text-sm font-bold text-cb-blue uppercase tracking-wide mb-4">{etape.titre}</h3>
          {etape.intro && <div className="mb-4"><IntroEtape etape={etape} /></div>}
          <ChampsEtape
            champs={champsVisibles(schema, etape.cle, formData)}
            data={formData}
            errors={errors}
            onChange={handleChange}
            onBlur={handleBlur}
            valeurs={formData}
          />
        </div>
      ))}

      {/* Bouton envoi */}
      <div className="flex justify-center max-w-lg mx-auto">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-cb-accent text-white rounded-lg font-medium
                     hover:bg-cb-accent/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed w-full justify-center"
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
              Envoyer ma demande de visite
            </>
          )}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">
          Questions ?{' '}
          <a href="mailto:dfip@clairbois.ch" className="text-cb-blue hover:underline">
            dfip@clairbois.ch
          </a>
        </p>
      </div>
    </div>
  )
}
