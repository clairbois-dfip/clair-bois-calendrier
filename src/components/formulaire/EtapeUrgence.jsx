/**
 * EtapeUrgence.jsx — Contact d'urgence.
 *
 * Personne à contacter en cas d'urgence (nom, prénom, lien, téléphone).
 */
import ChampFormulaire from './ChampFormulaire'

export default function EtapeUrgence({ data, errors, onChange, onBlur }) {
  return (
    <div className="space-y-4">
      <div className="bg-cb-orange-light rounded-lg p-3 text-sm text-yellow-800">
        Veuillez indiquer une personne de confiance que nous pouvons contacter en cas d'urgence.
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ChampFormulaire label="Nom" name="urgence_nom" value={data.urgence_nom} onChange={onChange} onBlur={onBlur} error={errors.urgence_nom} required />
        <ChampFormulaire label="Prénom" name="urgence_prenom" value={data.urgence_prenom} onChange={onChange} onBlur={onBlur} error={errors.urgence_prenom} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ChampFormulaire
          label="Lien avec le ou la stagiaire"
          name="urgence_lien"
          type="select"
          value={data.urgence_lien}
          onChange={onChange}
          error={errors.urgence_lien}
          required
          options={[
            { value: 'Père', label: 'Père' },
            { value: 'Mère', label: 'Mère' },
            { value: 'Soeur', label: 'Sœur' },
            { value: 'Frère', label: 'Frère' },
            { value: 'Epoux·se', label: 'Époux·se' },
            { value: 'Ami·e', label: 'Ami·e' },
            { value: 'Autre', label: 'Autre' },
          ]}
        />
        <ChampFormulaire
          label="Téléphone"
          name="urgence_tel"
          type="tel"
          value={data.urgence_tel}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.urgence_tel}
          required
          placeholder="+41 XX XXX XX XX"
        />
      </div>
    </div>
  )
}
