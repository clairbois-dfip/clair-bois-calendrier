/**
 * FormulaireSignalement.jsx — Formulaire de signalement d'urgence.
 *
 * Permet a un participant (stages ou modules) de signaler rapidement
 * une annulation ou un retard. Formulaire court, une seule page,
 * independant du formulaire d'inscription multi-etapes.
 *
 * Reutilise ChampFormulaire et Confirmation pour la coherence visuelle.
 *
 * Props :
 *   onGoHome — retour a la page d'accueil
 */
import { useState } from 'react'
import ChampFormulaire from './formulaire/ChampFormulaire'
import Confirmation from './formulaire/Confirmation'
import { validateRequired, validatePhone, validateEmail } from '../utils/validation'

/** Champs du formulaire et leurs regles de validation */
const VALIDATORS = {
  nom: validateRequired,
  prenom: validateRequired,
  tel: validatePhone,
  email: validateEmail,
  motif: validateRequired,
}

/** Options du champ motif */
const MOTIF_OPTIONS = [
  { value: 'Annulation', label: 'Annulation' },
  { value: 'Retard', label: 'Retard' },
]

/** Donnees initiales du formulaire */
const INITIAL_DATA = {
  nom: '',
  prenom: '',
  tel: '',
  email: '',
  motif: '',
  commentaire: '',
}

export default function FormulaireSignalement({ onGoHome }) {
  const [formData, setFormData] = useState({ ...INITIAL_DATA })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null)

  /** Met a jour un champ du formulaire */
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
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

  /** Valide tous les champs obligatoires avant envoi */
  const validateAll = () => {
    const newErrors = {}
    let valid = true
    for (const [field, validator] of Object.entries(VALIDATORS)) {
      const result = validator(formData[field])
      if (!result.valid) {
        newErrors[field] = result.message
        valid = false
      }
    }
    setErrors(newErrors)
    return valid
  }

  /** Envoyer le signalement */
  const handleSubmit = async () => {
    if (!validateAll()) return
    setIsSubmitting(true)
    try {
      const payload = {
        type: 'signalement',
        dateEnvoi: new Date().toISOString(),
        ...formData,
      }

      const httpUrl = import.meta.env.VITE_PA_HTTP_URL
      if (!httpUrl) {
        console.log('Mode démo — signalement:', JSON.stringify(payload, null, 2))
        await new Promise(r => setTimeout(r, 1000))
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
      console.error('Erreur envoi signalement:', err)
      setSubmitResult('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Ecran de confirmation post-envoi
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

  return (
    <div className="animate-fadeIn -mx-4 -mt-6 -mb-6 px-4 pt-6 pb-10 min-h-screen"
         style={{ background: 'linear-gradient(160deg, #e3ecfa 0%, #ede4f3 30%, #f5f0fa 50%, #e8f0f8 80%, #dce8f5 100%)' }}>
      {/* Retour a l'accueil */}
      <button
        onClick={onGoHome}
        className="inline-flex items-center gap-2 text-sm font-medium text-white bg-cb-blue hover:bg-cb-blue/90
                   px-4 py-2 rounded-lg transition-colors cursor-pointer mt-6 mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour à l'accueil
      </button>

      {/* En-tete */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Signaler une annulation ou un retard
        </h2>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          Remplissez ce formulaire pour nous prévenir rapidement.
          Nous traiterons votre signalement dans les plus brefs délais.
        </p>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 mb-4 shadow-sm max-w-lg mx-auto">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ChampFormulaire
              label="Nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.nom}
              required
              placeholder="Dupont"
            />
            <ChampFormulaire
              label="Prénom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.prenom}
              required
              placeholder="Marie"
            />
          </div>

          <ChampFormulaire
            label="Téléphone"
            name="tel"
            type="tel"
            value={formData.tel}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.tel}
            required
            placeholder="+41 79 123 45 67"
            helpText="Format suisse"
          />

          <ChampFormulaire
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            required
            placeholder="marie.dupont@gmail.com"
          />

          <ChampFormulaire
            label="Motif"
            name="motif"
            type="select"
            value={formData.motif}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.motif}
            required
            options={MOTIF_OPTIONS}
            placeholder="Sélectionnez un motif"
          />

          <ChampFormulaire
            label="Commentaire"
            name="commentaire"
            type="textarea"
            value={formData.commentaire}
            onChange={handleChange}
            placeholder="Précisions supplémentaires (facultatif)"
          />
        </div>
      </div>

      {/* Bouton d'envoi */}
      <div className="flex justify-center">
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
              Envoyer le signalement
            </>
          )}
        </button>
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
