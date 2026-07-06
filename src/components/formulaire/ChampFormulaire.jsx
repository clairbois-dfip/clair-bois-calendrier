/**
 * ChampFormulaire.jsx — Brique de base reusable pour tous les champs du formulaire.
 *
 * Un seul composant couvre les types : text, email, tel, date, select, textarea, radio-group.
 * L'appelant choisit le type via la prop `type` ; le rendu adapte automatiquement le markup.
 *
 * Feedback visuel tri-etat (rouge / vert / neutre) derive de `error` et `value` :
 *   - erreur     : bordure rouge + fond rose pale
 *   - valide     : bordure verte + fond vert pale
 *   - neutre     : bordure grise standard
 *
 * Props :
 *   label      : texte du label
 *   name       : identifiant du champ (relie label et input via htmlFor/id)
 *   type       : 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'radio-group'
 *   value      : valeur courante (controlled)
 *   onChange   : (name, value) => void
 *   onBlur     : (name) => void — declenche la validation a la perte de focus
 *   error      : message d'erreur (vide ou absent = pas d'erreur)
 *   required   : affiche l'asterisque rouge
 *   helpText   : indication courte affichee a droite du label
 *   options    : [{ value, label }] — pour select et radio-group
 *   autoFormat : fonction appliquee a chaque frappe (ex: formatAVS, formatPhone)
 */

export default function ChampFormulaire({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder = '',
  helpText = '',
  options = [],       // Pour select : [{ value, label }]
  disabled = false,
  autoFormat,          // Fonction de formatage automatique (ex: formatAVS)
}) {
  const handleChange = (e) => {
    let val = e.target.value
    if (autoFormat) {
      val = autoFormat(val)
    }
    onChange(name, val)
  }

  // Etat "valide" visuellement : valeur presente et aucune erreur active
  const isValid = !error && value && value.toString().trim() !== ''

  const inputClasses = `w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all duration-200 outline-none
    ${error
      ? 'border-cb-red bg-cb-red-light/30 focus:ring-2 focus:ring-cb-red/30'
      : isValid
        ? 'border-cb-green bg-cb-green-light/30 focus:ring-2 focus:ring-cb-green/20'
        : 'border-gray-300 bg-white focus:border-cb-blue focus:ring-2 focus:ring-cb-blue/20'
    }
    ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`

  return (
    <div className="space-y-1">
      {/* Label + texte d'aide sur la même ligne */}
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-cb-red ml-0.5">*</span>}
        </label>
        {helpText && (
          <span className="text-xs text-gray-400 shrink-0">{helpText}</span>
        )}
      </div>

      {/* Input */}
      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={onBlur ? () => onBlur(name) : undefined}
          disabled={disabled}
          className={inputClasses + ' cursor-pointer'}
        >
          <option value="">{placeholder || 'Sélectionnez...'}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={onBlur ? () => onBlur(name) : undefined}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className={inputClasses + ' resize-none'}
        />
      ) : type === 'radio-group' ? (
        // Le radio natif est cache (sr-only) pour permettre un style visuel personnalise
        // sous forme de boutons pleins. L'etat checked reste gere nativement, ce qui
        // garantit l'accessibilite clavier et lecteur d'ecran sans JS supplementaire.
        <div className="flex gap-3 pt-1">
          {options.map((opt) => (
            <label
              key={opt.value}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer
                transition-all duration-200 text-sm font-medium
                ${value === opt.value
                  ? 'border-cb-blue bg-cb-blue-light text-cb-blue'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={handleChange}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={onBlur ? () => onBlur(name) : undefined}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
        />
      )}

      {/* Message d'erreur */}
      {error && (
        <p className="text-xs text-cb-red flex items-center gap-1 mt-0.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
