import { useState } from 'react'
import ChampFormulaire from './formulaire/ChampFormulaire'
import { optionsVisibles } from '../utils/formulaireDynamique'

/**
 * RienARemplir — Écran affiché quand les réponses aux questions préalables
 * masquent TOUTES les étapes d'un formulaire : il n'y a rien à saisir, donc
 * rien à envoyer (on n'affiche jamais un formulaire vide avec un bouton
 * d'envoi actif).
 */
export function RienARemplir({ onGoHome }) {
  return (
    <div className="animate-fadeIn -mx-4 -mt-6 -mb-6 px-4 pt-6 pb-10 min-h-screen"
         style={{ background: 'var(--cb-form-bg, linear-gradient(160deg, #e3ecfa 0%, #ede4f3 30%, #f5f0fa 50%, #e8f0f8 80%, #dce8f5 100%))' }}>
      <div className="max-w-lg mx-auto mt-16 bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
        <div className="w-14 h-14 bg-cb-green-light rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-cb-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Rien à remplir dans votre situation</h2>
        <p className="text-sm text-gray-500 mb-6">
          D'après vos réponses, ce formulaire ne vous concerne pas — aucune information
          n'est à transmettre.
        </p>
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-cb-blue text-white rounded-lg font-medium hover:bg-cb-blue/90 transition-colors cursor-pointer"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  )
}

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
export default function QuestionsPrealables({ questions, titre, onValider, onRetour, contexte = {} }) {
  const [reponses, setReponses] = useState({})
  // Les options d'une question peuvent porter une condition (3e segment du
  // mode édition) : on ne montre que les visibles, et une question sans
  // aucune option visible est ignorée (elle ne doit jamais bloquer l'écran).
  const affichees = questions
    .map((q) => ({ ...q, optionsFiltrees: optionsVisibles({ options: q.options }, contexte) }))
    .filter((q) => q.optionsFiltrees.length > 0)
  const complet = affichees.every((q) => reponses[q.cle])

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
        {affichees.map((q) => (
          <ChampFormulaire
            key={q.cle}
            label={q.label}
            name={q.cle}
            type="radio-group"
            value={reponses[q.cle] || ''}
            onChange={(name, value) => setReponses((r) => ({ ...r, [name]: value }))}
            required
            helpText={q.aide || ''}
            options={q.optionsFiltrees}
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
