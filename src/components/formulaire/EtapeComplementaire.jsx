/**
 * EtapeComplementaire.jsx — Etape "informations complementaires".
 *
 * Champs rendus dynamiquement depuis le schéma des formulaires
 * (public/formulaire-schema.json, mode édition #edition).
 * Le champ objectif_stage porte la condition `parcours=stages` dans le
 * schéma : il disparaît automatiquement du parcours modules.
 */
import ChampsEtape from './ChampsEtape'
import { champsVisibles } from '../../utils/formulaireDynamique'

export default function EtapeComplementaire({ schema, data, errors, onChange, onBlur, contexte = {} }) {
  const valeurs = { ...data, ...contexte }
  const champs = champsVisibles(schema, 'complementaire', valeurs)

  return (
    <ChampsEtape champs={champs} data={data} errors={errors} onChange={onChange} onBlur={onBlur} valeurs={valeurs} />
  )
}
