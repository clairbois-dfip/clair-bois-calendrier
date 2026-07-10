/**
 * EtapeCuratelle.jsx — Etape "curatelle" du parcours d'inscription.
 *
 * Champs rendus dynamiquement depuis le schéma des formulaires.
 * Structure préservée de l'historique :
 *   - champ pilote (sous_curatelle) rendu en premier ; son option
 *     « curateur complète » n'apparaît que si pourQui=autre (condition
 *     d'option portée par le schéma) ;
 *   - les champs conditionnels (condition sous_curatelle=Oui*) sont
 *     regroupés dans un bloc gris « Informations du curateur » ;
 *   - réponse « Non » → message vert, aucun champ supplémentaire.
 */
import ChampsEtape from './ChampsEtape'
import { champsDeLEtape, champsVisibles, evaluerCondition } from '../../utils/formulaireDynamique'

export default function EtapeCuratelle({ schema, data, errors, onChange, onBlur, contexte = {} }) {
  const valeurs = { ...data, ...contexte }
  const visibles = champsVisibles(schema, 'curatelle', valeurs)
  // Partition : les champs SANS condition pilotent, ceux AVEC condition
  // forment le bloc curateur (visible seulement quand leur condition passe).
  const pilotes = visibles.filter((c) => !c.condition)
  const conditionnels = visibles.filter((c) => c.condition)
  // « Non » explicite → message rassurant (comportement historique)
  const tousConditionnelsMasques =
    champsDeLEtape(schema, 'curatelle').some((c) => c.condition && !evaluerCondition(c.condition, valeurs))

  return (
    <div className="space-y-4">
      <ChampsEtape champs={pilotes} data={data} errors={errors} onChange={onChange} onBlur={onBlur} valeurs={valeurs} />

      {conditionnels.length > 0 && (
        <div className="animate-fadeIn space-y-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-700">Informations du curateur ou de la curatrice</p>
          <ChampsEtape champs={conditionnels} data={data} errors={errors} onChange={onChange} onBlur={onBlur} valeurs={valeurs} />
        </div>
      )}

      {data.sous_curatelle === 'Non' && tousConditionnelsMasques && (
        <div className="animate-fadeIn bg-green-50 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Pas de curatelle — vous pouvez passer à l'étape suivante.
        </div>
      )}
    </div>
  )
}
