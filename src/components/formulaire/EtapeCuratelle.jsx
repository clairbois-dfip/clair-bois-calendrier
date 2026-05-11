/**
 * EtapeCuratelle.jsx — Section curatelle conditionnelle.
 *
 * Si "Oui" → affiche les champs du curateur avec animation.
 * Si "Non" → passe directement à l'étape suivante.
 */
import ChampFormulaire from './ChampFormulaire'

export default function EtapeCuratelle({ data, errors, onChange, onBlur, pourQui = 'moi' }) {
  // Options curatelle : le stagiaire lui-même n'a que Oui/Non
  // Un partenaire/référent a aussi l'option "curateur complète"
  const curatOptions = pourQui === 'autre'
    ? [
        { value: 'Oui', label: 'Oui' },
        { value: 'Oui - curateur complète', label: 'Oui — c\'est le curateur qui complète' },
        { value: 'Non', label: 'Non' },
      ]
    : [
        { value: 'Oui', label: 'Oui' },
        { value: 'Non', label: 'Non' },
      ]

  return (
    <div className="space-y-4">
      <ChampFormulaire
        label="Le ou la stagiaire est sous curatelle :"
        name="sous_curatelle"
        type="radio-group"
        value={data.sous_curatelle}
        onChange={onChange}
        error={errors.sous_curatelle}
        required
        options={curatOptions}
      />

      {(data.sous_curatelle === 'Oui' || data.sous_curatelle === 'Oui - curateur complète') && (
        <div className="animate-fadeIn space-y-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-700">Informations du curateur ou de la curatrice</p>

          <ChampFormulaire
            label="Curateur·trice"
            name="curatelle_type"
            type="select"
            value={data.curatelle_type}
            onChange={onChange}
            error={errors.curatelle_type}
            required
            options={[
              { value: 'OPAD', label: 'OPAD' },
              { value: 'SPMI', label: 'SPMI' },
              { value: 'Mère', label: 'Mère' },
              { value: 'Père', label: 'Père' },
              { value: 'Avocat', label: 'Avocat' },
              { value: 'Autre', label: 'Autre' },
            ]}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <ChampFormulaire label="Nom du curateur" name="curatelle_nom" value={data.curatelle_nom} onChange={onChange} onBlur={onBlur} error={errors.curatelle_nom} required />
            <ChampFormulaire label="Prénom du curateur" name="curatelle_prenom" value={data.curatelle_prenom} onChange={onChange} onBlur={onBlur} error={errors.curatelle_prenom} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ChampFormulaire label="Téléphone" name="curatelle_tel" type="tel" value={data.curatelle_tel} onChange={onChange} onBlur={onBlur} error={errors.curatelle_tel} required placeholder="+41 XX XXX XX XX" />
            <ChampFormulaire label="Email" name="curatelle_email" type="email" value={data.curatelle_email} onChange={onChange} onBlur={onBlur} error={errors.curatelle_email} required placeholder="curateur@email.ch" />
          </div>
        </div>
      )}

      {data.sous_curatelle === 'Non' && (
        <div className="animate-fadeIn bg-green-50 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Pas de curatelle — vous pouvez passer à l'étape suivante.
        </div>
      )}
    </div>
  )
}
