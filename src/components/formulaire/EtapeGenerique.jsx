/**
 * EtapeGenerique.jsx — Rendu d'une étape SANS composant dédié.
 *
 * C'est le composant qui rend possibles les étapes AJOUTÉES par la
 * coordination dans le mode édition : toute étape du schéma dont la clé
 * n'est pas connue du wizard (referent, stagiaire, curatelle…) est rendue
 * ici — bannière d'introduction éditable + champs du schéma.
 */
import ChampsEtape, { IntroEtape } from './ChampsEtape'
import { champsVisibles } from '../../utils/formulaireDynamique'

export default function EtapeGenerique({ schema, etape, data, errors, onChange, onBlur, contexte = {} }) {
  const valeurs = { ...data, ...contexte }
  const champs = champsVisibles(schema, etape.cle, valeurs)

  return (
    <div className="space-y-4">
      <IntroEtape etape={etape} />
      <ChampsEtape champs={champs} data={data} errors={errors} onChange={onChange} onBlur={onBlur} valeurs={valeurs} />
    </div>
  )
}
