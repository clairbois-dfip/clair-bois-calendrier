/**
 * EtapeUrgence.jsx — Etape "contact d'urgence" du parcours d'inscription.
 *
 * Champs rendus dynamiquement depuis le schéma des formulaires
 * (public/formulaire-schema.json, mode édition #edition) ; seul le décor
 * (bannière orange) reste ici.
 */
import ChampsEtape from './ChampsEtape'
import { champsVisibles } from '../../utils/formulaireDynamique'

export default function EtapeUrgence({ schema, data, errors, onChange, onBlur, contexte = {} }) {
  const valeurs = { ...data, ...contexte }
  const champs = champsVisibles(schema, 'urgence', valeurs)

  return (
    <div className="space-y-4">
      <div className="bg-cb-orange-light rounded-lg p-3 text-sm text-yellow-800">
        Veuillez indiquer une personne de confiance que nous pouvons contacter en cas d'urgence.
      </div>
      <ChampsEtape champs={champs} data={data} errors={errors} onChange={onChange} onBlur={onBlur} valeurs={valeurs} />
    </div>
  )
}
