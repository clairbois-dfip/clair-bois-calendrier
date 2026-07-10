/**
 * EtapeAI.jsx — Etape "Assurance Invalidité" du parcours d'inscription.
 *
 * Champs rendus dynamiquement depuis le schéma des formulaires.
 * Structure préservée de l'historique :
 *   - champ pilote (inscrit_ai) ; son option « conseiller AI complète »
 *     n'apparaît que si pourQui=autre (condition d'option du schéma) ;
 *   - les champs conditionnels (condition inscrit_ai!=Non) sont regroupés
 *     dans le bloc gris « Coordonnées du conseiller·ère AI » ;
 *   - réponse « Non » → message vert, aucun champ AI à remplir.
 */
import ChampsEtape from './ChampsEtape'
import { champsVisibles } from '../../utils/formulaireDynamique'

export default function EtapeAI({ schema, data, errors, onChange, onBlur, contexte = {} }) {
  const valeurs = { ...data, ...contexte }
  const visibles = champsVisibles(schema, 'ai', valeurs)
  const pilotes = visibles.filter((c) => !c.condition)
  const conditionnels = visibles.filter((c) => c.condition)

  return (
    <div className="space-y-4">
      <ChampsEtape champs={pilotes} data={data} errors={errors} onChange={onChange} onBlur={onBlur} valeurs={valeurs} />

      {conditionnels.length > 0 && (
        <div className="animate-fadeIn space-y-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-700">Coordonnées du conseiller·ère AI</p>
          <ChampsEtape champs={conditionnels} data={data} errors={errors} onChange={onChange} onBlur={onBlur} valeurs={valeurs} />
        </div>
      )}

      {data.inscrit_ai === 'Non' && (
        <div className="animate-fadeIn bg-green-50 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Pas d'AI — vous pouvez passer à l'étape suivante.
        </div>
      )}
    </div>
  )
}
