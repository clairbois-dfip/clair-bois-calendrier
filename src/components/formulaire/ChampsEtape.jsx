/**
 * ChampsEtape.jsx — Rendu générique d'une liste de champs du schéma.
 *
 * Brique commune du rendu dynamique : chaque étape lui passe la liste des
 * champs (déjà filtrés par condition via champsVisibles) et ce composant
 * les rend avec ChampFormulaire, en respectant :
 *   - la mise en page : les champs « demi-largeur » consécutifs sont
 *     appariés dans une grille 2 colonnes ; textarea/radio/checkbox et les
 *     champs marqués largeur='pleine' occupent toute la largeur ;
 *   - le type 'radio' du schéma → 'radio-group' de ChampFormulaire ;
 *   - le type 'checkbox' → case à cocher stylée (valeur 'Oui'/'' comme
 *     l'historique EtapeDeclaration : toutes les valeurs du payload sont
 *     des strings) ;
 *   - les options conditionnelles (optionsVisibles).
 *
 * Props :
 *   champs   : champs du schéma à rendre (ordre respecté)
 *   data     : données du formulaire
 *   errors   : erreurs par champPayload
 *   onChange : (name, value) => void
 *   onBlur   : (name) => void
 *   valeurs  : { ...data, parcours, pourQui } pour les conditions d'options
 */
import ChampFormulaire from './ChampFormulaire'
import { optionsVisibles } from '../../utils/formulaireDynamique'

/** Un champ occupe-t-il toute la largeur ? */
function estPleineLargeur(champ) {
  if (champ.largeur === 'pleine') return true
  if (champ.largeur === 'demi') return false
  return champ.type === 'textarea' || champ.type === 'radio' || champ.type === 'checkbox'
}

/** Case à cocher (reprend le rendu historique d'EtapeDeclaration). */
function CaseACocher({ champ, data, errors, onChange }) {
  const name = champ.champPayload
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer group">
        {/* Conversion booléen → string 'Oui' pour uniformité avec le payload */}
        <input
          type="checkbox"
          checked={data[name] === 'Oui'}
          onChange={(e) => onChange(name, e.target.checked ? 'Oui' : '')}
          className="mt-1 w-4 h-4 rounded border-gray-300 text-cb-blue focus:ring-cb-blue cursor-pointer"
        />
        <span className="text-sm text-gray-700 group-hover:text-gray-900">
          {champ.label}
          {champ.obligatoire && <span className="text-cb-red ml-0.5">*</span>}
        </span>
      </label>
      {errors[name] && (
        <p className="text-xs text-cb-red flex items-center gap-1 ml-7 mt-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errors[name]}
        </p>
      )}
    </div>
  )
}

/** Rend UN champ du schéma via la brique historique ChampFormulaire. */
function Champ({ champ, data, errors, onChange, onBlur, valeurs }) {
  if (champ.type === 'checkbox') {
    return <CaseACocher champ={champ} data={data} errors={errors} onChange={onChange} />
  }
  const name = champ.champPayload
  return (
    <ChampFormulaire
      label={champ.label}
      name={name}
      type={champ.type === 'radio' ? 'radio-group' : champ.type}
      value={data[name] ?? ''}
      onChange={onChange}
      onBlur={onBlur}
      error={errors[name]}
      required={champ.obligatoire}
      placeholder={champ.placeholder || ''}
      helpText={champ.aide || ''}
      options={optionsVisibles(champ, valeurs)}
    />
  )
}

export default function ChampsEtape({ champs, data, errors, onChange, onBlur, valeurs }) {
  // Appariement : les champs demi-largeur consécutifs vont par deux dans
  // une grille ; un champ pleine largeur « casse » la paire en cours.
  const blocs = []
  let paire = []
  const viderPaire = () => {
    if (paire.length) {
      blocs.push({ type: 'paire', champs: paire })
      paire = []
    }
  }
  for (const champ of champs) {
    if (estPleineLargeur(champ)) {
      viderPaire()
      blocs.push({ type: 'plein', champs: [champ] })
    } else {
      paire.push(champ)
      if (paire.length === 2) viderPaire()
    }
  }
  viderPaire()

  return (
    <div className="space-y-4">
      {blocs.map((bloc, i) =>
        bloc.type === 'paire' && bloc.champs.length === 2 ? (
          <div key={i} className="grid gap-4 sm:grid-cols-2">
            {bloc.champs.map((champ) => (
              <Champ key={champ.champPayload} champ={champ} data={data} errors={errors} onChange={onChange} onBlur={onBlur} valeurs={valeurs} />
            ))}
          </div>
        ) : (
          bloc.champs.map((champ) => (
            <Champ key={champ.champPayload} champ={champ} data={data} errors={errors} onChange={onChange} onBlur={onBlur} valeurs={valeurs} />
          ))
        )
      )}
    </div>
  )
}
