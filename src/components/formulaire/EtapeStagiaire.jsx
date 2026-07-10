/**
 * EtapeStagiaire.jsx — Etape "donnees personnelles" du parcours d'inscription.
 *
 * Depuis juillet 2026, les champs sont rendus dynamiquement depuis
 * public/formulaire-schema.json (mode édition #edition). Ce composant ne
 * garde que le décor : bannière du chemin retour et délégation à ChampsEtape.
 *
 * Deux variantes contrôlées par la prop isRetour :
 *   - false (défaut) : inscription complète (tous les champs de l'étape)
 *   - true : stagiaire déjà connu — sous-ensemble figé CHAMPS_RETOUR
 *     (juste assez pour retrouver le dossier existant)
 */
import ChampsEtape from './ChampsEtape'
import { champsVisibles } from '../../utils/formulaireDynamique'

export default function EtapeStagiaire({ schema, data, errors, onChange, onBlur, contexte = {}, isRetour = false }) {
  const valeurs = { ...data, ...contexte }
  const champs = champsVisibles(schema, isRetour ? 'stagiaire-retour' : 'stagiaire', valeurs)

  return (
    <div className="space-y-4">
      {isRetour && (
        <div className="bg-cb-blue-light/50 rounded-lg p-3 text-sm text-cb-blue">
          Vous avez déjà un dossier chez Clair-Bois. Nous avons besoin de quelques informations
          pour retrouver votre dossier.
        </div>
      )}
      <ChampsEtape champs={champs} data={data} errors={errors} onChange={onChange} onBlur={onBlur} valeurs={valeurs} />
    </div>
  )
}
