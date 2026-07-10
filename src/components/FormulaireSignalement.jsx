/**
 * FormulaireSignalement.jsx — Formulaire de signalement d'annulation ou de retard.
 *
 * Formulaire autonome, hors du flux multi-etapes d'inscription.
 * Accessible directement depuis la page d'accueil sans etre connecte.
 * L'objectif est de permettre un signalement rapide (moins de 1 minute),
 * d'ou le nombre de champs reduit au strict necessaire.
 *
 * Envoi via Power Automate HTTP (VITE_PA_HTTP_URL). Si la variable
 * n'est pas definie (dev local), passe en mode demo avec log console.
 *
 * Champs : nom, prenom, tel, email, motif (Annulation|Retard), commentaire
 *
 * Props :
 *   onGoHome — retour a la page d'accueil apres envoi ou annulation
 */
import { useState } from 'react'
import ChampsEtape, { IntroEtape } from './formulaire/ChampsEtape'
import Confirmation from './formulaire/Confirmation'
import {
  champsDeLEtape, champsVisibles, validerChamp, validerEtape, collecterPayload,
  etapesDuFormulaire,
} from '../utils/formulaireDynamique'

export default function FormulaireSignalement({ schema, onGoHome }) {
  // Étapes du formulaire signalement (une seule aujourd'hui — la
  // coordination peut en ajouter via le mode édition)
  const etapes = etapesDuFormulaire(schema, 'signalement')

  const [formData, setFormData] = useState(() => {
    // Un input contrôlé par champ du schéma, initialisé à '' (ou [] en multi)
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

  /** Met a jour un champ et efface son erreur si elle existait deja */
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  /** Valide un champ au blur (validateur dérivé du schéma) */
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

  /** Valide toutes les étapes du schéma avant envoi */
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

  /** Envoie le signalement vers Power Automate ou simule l'envoi en mode demo */
  const handleSubmit = async () => {
    if (!validateAll()) return
    setIsSubmitting(true)
    try {
      const payload = {
        type: 'signalement',
        dateEnvoi: new Date().toISOString(),
        // Seuls les champs remplis sont envoyés (pas de clés vides)
        ...collecterPayload(schema, etapes.map((e) => e.cle), formData, {}),
      }

      const httpUrl = import.meta.env.VITE_PA_HTTP_URL
      // En dev local (sans .env.local), on simule un envoi reussi
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
        <div className="space-y-6">
          {etapes.map((etape, i) => (
            <div key={etape.cle} className="space-y-4">
              {/* Le titre de section n'apparaît que s'il y a plusieurs étapes */}
              {etapes.length > 1 && (
                <h3 className="text-sm font-bold text-cb-blue uppercase tracking-wide">{etape.titre}</h3>
              )}
              <IntroEtape etape={etape} />
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
          <a href="mailto:dfip@clairbois.ch" className="text-cb-blue hover:underline">
            dfip@clairbois.ch
          </a>
        </p>
      </div>
    </div>
  )
}
