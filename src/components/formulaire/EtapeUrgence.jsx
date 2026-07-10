/**
 * EtapeUrgence.jsx — Etape "contact d'urgence" du parcours d'inscription.
 *
 * Champs rendus dynamiquement depuis le schéma des formulaires
 * (public/formulaire-schema.json, mode édition #edition) ; seul le décor
 * (bannière orange) reste ici.
 */
import ChampsEtape, { IntroEtape } from './ChampsEtape'
import { champsVisibles, etapeParCle } from '../../utils/formulaireDynamique'

export default function EtapeUrgence({ schema, data, errors, onChange, onBlur, contexte = {} }) {
  const valeurs = { ...data, ...contexte }
  const champs = champsVisibles(schema, 'urgence', valeurs)

  return (
    <div className="space-y-4">
      <IntroEtape etape={etapeParCle(schema, 'urgence')} />
      <ChampsEtape champs={champs} data={data} errors={errors} onChange={onChange} onBlur={onBlur} valeurs={valeurs} />
    </div>
  )
}
