/**
 * EtapeReferent.jsx — Etape "referent" du parcours d'inscription.
 *
 * Affichée uniquement quand pourQui === 'autre' (un tiers inscrit le
 * stagiaire). Champs rendus dynamiquement depuis le schéma des formulaires
 * (public/formulaire-schema.json, mode édition #edition) ; seul le décor
 * (bannière) reste ici.
 */
import ChampsEtape, { IntroEtape } from './ChampsEtape'
import { champsVisibles, etapeParCle } from '../../utils/formulaireDynamique'

export default function EtapeReferent({ schema, data, errors, onChange, onBlur, contexte = {} }) {
  const valeurs = { ...data, ...contexte }
  const champs = champsVisibles(schema, 'referent', valeurs)

  return (
    <div className="space-y-4">
      <IntroEtape etape={etapeParCle(schema, 'referent')} />
      <ChampsEtape champs={champs} data={data} errors={errors} onChange={onChange} onBlur={onBlur} valeurs={valeurs} />
    </div>
  )
}
