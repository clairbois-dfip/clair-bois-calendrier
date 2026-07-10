/**
 * EtapeReferent.jsx — Etape "referent" du parcours d'inscription.
 *
 * Affichée uniquement quand pourQui === 'autre' (un tiers inscrit le
 * stagiaire). Champs rendus dynamiquement depuis le schéma des formulaires
 * (public/formulaire-schema.json, mode édition #edition) ; seul le décor
 * (bannière) reste ici.
 */
import ChampsEtape from './ChampsEtape'
import { champsVisibles } from '../../utils/formulaireDynamique'

export default function EtapeReferent({ schema, data, errors, onChange, onBlur, contexte = {} }) {
  const valeurs = { ...data, ...contexte }
  const champs = champsVisibles(schema, 'referent', valeurs)

  return (
    <div className="space-y-4">
      <div className="bg-cb-blue-light/50 rounded-lg p-3 text-sm text-cb-blue">
        En tant que référent·e, veuillez renseigner vos coordonnées professionnelles.
      </div>
      <ChampsEtape champs={champs} data={data} errors={errors} onChange={onChange} onBlur={onBlur} valeurs={valeurs} />
    </div>
  )
}
