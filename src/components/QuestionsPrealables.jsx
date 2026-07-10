import { useState } from 'react'
import ChampFormulaire from './formulaire/ChampFormulaire'

/**
 * QuestionsPrealables — Écran posé AVANT le formulaire.
 *
 * Affiche les questions préalables définies par la coordination (mode
 * édition). Leurs réponses décident ensuite si certaines étapes du
 * formulaire sont nécessaires (conditions d'étape, ex. `prealable_1=Non`).
 * Posé avant le wizard, cet écran ne perturbe pas la navigation.
 *
 * Props :
 *   questions : [{ cle, label, aide, options:[{value,label}] }]
 *   titre     : titre du formulaire (contexte)
 *   onValider(reponses) : appelé avec { cle: valeur } quand tout est répondu.
 *   onRetour() : retour en arrière (annuler).
 */
export default function QuestionsPrealables({ questions, titre, onValider, onRetour }) {
  const [reponses, setReponses] = useState({})
  const complet = questions.every((q) => reponses[q.cle])

  return (
    <div className="animate-fadeIn -mx-4 -mt-6 -mb-6 px-4 pt-6 pb-10 min-h-screen"
         style={{ background: 'var(--cb-form-bg, linear-gradient(160deg, #e3ecfa 0%, #ede4f3 30%, #f5f0fa 50%, #e8f0f8 80%, #dce8f5 100%))' }}>
      <button
        onClick={onRetour}
        className="inline-flex items-center gap-2 text-sm font-medium text-white bg-cb-blue hover:bg-cb-blue/90 px-4 py-2 rounded-lg transition-colors cursor-pointer mt-6 mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour
      </button>

      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Quelques questions rapides</h2>
        <p className="text-gray-500 text-sm">{titre} — pour n'afficher que ce qui vous concerne.</p>
      </div>

      <div className="max-w-lg mx-auto bg-white rounded-xl border border-gray-200 p-5 md:p-6 mb-4 shadow-sm space-y-5">
        {questions.map((q) => (
          <ChampFormulaire
            key={q.cle}
            label={q.label}
            name={q.cle}
            type="radio-group"
            value={reponses[q.cle] || ''}
            onChange={(name, value) => setReponses((r) => ({ ...r, [name]: value }))}
            required
            helpText={q.aide || ''}
            options={q.options || []}
          />
        ))}
      </div>

      <div className="max-w-lg mx-auto flex justify-end">
        <button
          onClick={() => onValider(reponses)}
          disabled={!complet}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-cb-blue text-white rounded-lg font-medium hover:bg-cb-blue/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuer
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
