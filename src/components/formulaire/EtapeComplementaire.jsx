/**
 * EtapeComplementaire.jsx — Etape "informations complementaires".
 *
 * Champs rendus dynamiquement depuis le schéma des formulaires
 * (public/formulaire-schema.json, mode édition #edition).
 * Le champ objectif_stage porte la condition `parcours=stages` dans le
 * schéma : il disparaît automatiquement du parcours modules.
 */
import ChampsEtape, { IntroEtape } from './ChampsEtape'
import { champsVisibles, etapeParCle } from '../../utils/formulaireDynamique'

export default function EtapeComplementaire({ schema, data, errors, onChange, onBlur, contexte = {} }) {
  const valeurs = { ...data, ...contexte }
  const champs = champsVisibles(schema, 'complementaire', valeurs)

  return (
    <div className="space-y-4">
      <IntroEtape etape={etapeParCle(schema, 'complementaire')} />
      <ChampsEtape champs={champs} data={data} errors={errors} onChange={onChange} onBlur={onBlur} valeurs={valeurs} />
    </div>
  )
}
