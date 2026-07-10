/**
 * EtapeDeclaration.jsx — Etape "declaration" du parcours d'inscription.
 *
 * Les cases à cocher sont rendues dynamiquement depuis le schéma
 * (type 'checkbox' — conversion 'Oui'/'' gérée par ChampsEtape, identique
 * au comportement historique). Seule la bannière d'introduction reste ici.
 */
import ChampsEtape, { IntroEtape } from './ChampsEtape'
import { champsVisibles, etapeParCle } from '../../utils/formulaireDynamique'

export default function EtapeDeclaration({ schema, data, errors, onChange, onBlur, contexte = {} }) {
  const valeurs = { ...data, ...contexte }
  const champs = champsVisibles(schema, 'declaration', valeurs)

  return (
    <div className="space-y-5">
      <IntroEtape etape={etapeParCle(schema, 'declaration')} />
      <ChampsEtape champs={champs} data={data} errors={errors} onChange={onChange} onBlur={onBlur} valeurs={valeurs} />
    </div>
  )
}
