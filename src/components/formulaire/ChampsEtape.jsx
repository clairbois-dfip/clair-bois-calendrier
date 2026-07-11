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

/**
 * IntroEtape — Bannière d'introduction d'une étape, pilotée par le schéma
 * (étape.intro, éditable dans le mode édition). Tonalité 'attention' =
 * bandeau orange (ex. contact d'urgence), sinon bleu informatif.
 * Ne rend rien si l'étape n'a pas d'intro.
 */
export function IntroEtape({ etape }) {
  if (!etape?.intro) return null
  const classes =
    etape.tonalite === 'attention'
      ? 'bg-cb-orange-light rounded-lg p-3 text-sm text-yellow-800'
      : 'bg-cb-blue-light/50 rounded-lg p-3 text-sm text-cb-blue'
  return <div className={classes}>{etape.intro}</div>
}

/** Un champ occupe-t-il toute la largeur ? */
function estPleineLargeur(champ) {
  if (champ.largeur === 'pleine') return true
  if (champ.largeur === 'demi') return false
  return champ.type === 'textarea' || champ.type === 'radio' || champ.type === 'checkbox' || champ.type === 'multiselect'
}

/** Multi-sélection en pastilles cliquables (reprend le rendu des secteurs de Visite). */
function MultiSelection({ champ, data, errors, onChange, valeurs }) {
  const name = champ.champPayload
  const selection = Array.isArray(data[name]) ? data[name] : []
  const basculer = (valeur) => {
    onChange(name, selection.includes(valeur) ? selection.filter((v) => v !== valeur) : [...selection, valeur])
  }
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="block text-sm font-medium text-gray-700">
          {champ.label}
          {champ.obligatoire && <span className="text-cb-red ml-0.5">*</span>}
        </span>
        {champ.aide && <span className="text-xs text-gray-400 shrink-0">{champ.aide}</span>}
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {optionsVisibles(champ, valeurs).map((opt) => {
          const actif = selection.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => basculer(opt.value)}
              aria-pressed={actif}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all cursor-pointer
                ${actif
                  ? 'bg-cb-blue border-cb-blue text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-cb-blue/40'}`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {errors[name] && <p className="text-xs text-cb-red mt-1">{errors[name]}</p>}
    </div>
  )
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
      {champ.aide && <p className="text-xs text-gray-400 ml-7 mt-0.5">{champ.aide}</p>}
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
  if (champ.type === 'multiselect') {
    return <MultiSelection champ={champ} data={data} errors={errors} onChange={onChange} valeurs={valeurs} />
  }
  const name = champ.champPayload
  return (
    <ChampFormulaire
      label={champ.label}
      name={name}
      /* 'radio' du schéma → 'radio-group' ; 'avs' → input texte (le format
         756.XXXX est vérifié par le moteur de validation, pas par le HTML) */
      type={champ.type === 'radio' ? 'radio-group' : champ.type === 'avs' ? 'text' : champ.type}
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
