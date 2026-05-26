/**
 * Aiguillage.jsx — Questions d'aiguillage avant redirection vers le formulaire.
 *
 * 2 questions posées sur le site (pas dans Forms) :
 *  1. "Je remplis pour moi-même" / "Pour quelqu'un d'autre"
 *  2. "Déjà inscrit chez Clair-Bois ?" OUI / NON
 *
 * Les réponses déterminent vers quel formulaire Forms rediriger.
 *
 * @param {'stages'|'modules'} props.parcours - Parcours choisi sur la HomePage
 * @param {Function} props.onResult           - Callback avec { pourQui, dejaInscrit }
 * @param {Function} props.onBack             - Retour à la HomePage
 */
import { useState } from 'react'

export default function Aiguillage({ parcours, onResult, onBack }) {
  // null = question 1, après réponse = question 2
  const [pourQui, setPourQui] = useState(null)

  const titresParcours = {
    stages: 'Demande de stage',
    modules: 'Modules métiers',
  }

  // Question 1 : pour qui ?
  if (pourQui === null) {
    return (
      <div className="animate-fadeIn">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-cb-blue hover:text-cb-blue/80 mb-6 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour à l'accueil
        </button>

        <div className="text-center mb-8">
          <p className="text-sm font-medium text-cb-blue mb-2">{titresParcours[parcours]}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Je remplis ce formulaire...
          </h2>
          <p className="text-gray-500 text-sm">
            Cette information nous permet de vous orienter vers le bon formulaire.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
          {/* Pour moi-même — pour modules, saute directement la Q2 */}
          <button
            onClick={() => {
              if (parcours === 'modules') {
                onResult({ pourQui: 'moi', dejaInscrit: false })
              } else {
                setPourQui('moi')
              }
            }}
            className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center
                       hover:border-cb-blue hover:shadow-lg transition-all duration-200
                       cursor-pointer group flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-xl bg-cb-blue/10 flex items-center justify-center mb-4
                            group-hover:bg-cb-blue/20 transition-colors">
              <svg className="w-6 h-6 text-cb-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-cb-blue transition-colors mb-1">
              Pour moi-même
            </h3>
            <p className="text-sm text-gray-500">
              Je suis le ou la stagiaire et je m'inscris en mon propre nom.
            </p>
          </button>

          {/* Pour quelqu'un d'autre — pour modules, saute directement la Q2 */}
          <button
            onClick={() => {
              if (parcours === 'modules') {
                onResult({ pourQui: 'autre', dejaInscrit: false })
              } else {
                setPourQui('autre')
              }
            }}
            className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center
                       hover:border-cb-blue hover:shadow-lg transition-all duration-200
                       cursor-pointer group flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-xl bg-cb-blue/10 flex items-center justify-center mb-4
                            group-hover:bg-cb-blue/20 transition-colors">
              <svg className="w-6 h-6 text-cb-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-cb-blue transition-colors mb-1">
              Pour quelqu'un d'autre
            </h3>
            <p className="text-sm text-gray-500">
              Je suis un·e référent·e, enseignant·e ou partenaire et j'inscris un·e stagiaire.
            </p>
          </button>
        </div>
      </div>
    )
  }

  // Question 2 : déjà inscrit ?
  return (
    <div className="animate-fadeIn">
      <button
        onClick={() => setPourQui(null)}
        className="flex items-center gap-1.5 text-sm text-cb-blue hover:text-cb-blue/80 mb-6 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour
      </button>

      <div className="text-center mb-8">
        <p className="text-sm font-medium text-cb-blue mb-2">
          {titresParcours[parcours]} — {pourQui === 'moi' ? 'Pour moi-même' : 'Pour quelqu\'un d\'autre'}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {pourQui === 'moi'
            ? 'Avez-vous déjà été inscrit·e chez Clair-Bois ?'
            : 'La personne a-t-elle déjà été inscrite chez Clair-Bois ?'}
        </h2>
        <p className="text-gray-500 text-sm">
          Stage ou module métier, même il y a plusieurs années.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
        {/* OUI */}
        <button
          onClick={() => onResult({ pourQui, dejaInscrit: true })}
          className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center
                     hover:border-green-500 hover:shadow-lg transition-all duration-200
                     cursor-pointer group flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4
                          group-hover:bg-green-100 transition-colors">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors mb-1">
            Oui
          </h3>
          <p className="text-sm text-gray-500">
            {pourQui === 'moi'
              ? 'J\'ai déjà effectué un stage ou un module métier chez Clair-Bois.'
              : 'Cette personne a déjà été inscrite chez Clair-Bois.'}
          </p>
        </button>

        {/* NON */}
        <button
          onClick={() => onResult({ pourQui, dejaInscrit: false })}
          className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center
                     hover:border-gray-400 hover:shadow-lg transition-all duration-200
                     cursor-pointer group flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4
                          group-hover:bg-gray-200 transition-colors">
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors mb-1">
            Non, c'est la première fois
          </h3>
          <p className="text-sm text-gray-500">
            {pourQui === 'moi'
              ? 'C\'est ma première inscription chez Clair-Bois.'
              : 'Cette personne n\'a jamais été inscrite chez Clair-Bois.'}
          </p>
        </button>
      </div>
    </div>
  )
}
