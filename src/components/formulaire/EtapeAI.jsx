/**
 * EtapeAI.jsx — Informations Assurance Invalidité (AI).
 *
 * Question conditionnelle : inscrit à l'AI ?
 * Si Oui ou Demande en cours → affiche les champs du conseiller AI.
 * Si Non → message vert, passer à la suite.
 */
import ChampFormulaire from './ChampFormulaire'

export default function EtapeAI({ data, errors, onChange, onBlur, pourQui = 'moi' }) {
  // Options AI : un partenaire/référent a l'option "conseiller AI complète"
  const aiOptions = pourQui === 'autre'
    ? [
        { value: 'Oui - conseiller AI complète', label: 'Oui — c\'est le conseiller AI qui complète' },
        { value: 'Oui', label: 'Oui' },
        { value: 'Non', label: 'Non' },
        { value: 'Demande en cours', label: 'Demande en cours' },
      ]
    : [
        { value: 'Oui', label: 'Oui' },
        { value: 'Non', label: 'Non' },
        { value: 'Demande en cours', label: 'Demande en cours' },
      ]

  return (
    <div className="space-y-4">
      <ChampFormulaire
        label="Inscrit·e à l'Assurance Invalidité"
        name="inscrit_ai"
        type="radio-group"
        value={data.inscrit_ai}
        onChange={onChange}
        error={errors.inscrit_ai}
        required
        options={aiOptions}
      />

      {(data.inscrit_ai && data.inscrit_ai !== 'Non') && (
        <div className="animate-fadeIn space-y-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-700">Coordonnées du conseiller·ère AI</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <ChampFormulaire label="Nom du conseiller AI" name="ai_nom" value={data.ai_nom} onChange={onChange} onBlur={onBlur} error={errors.ai_nom} placeholder="Nom" required />
            <ChampFormulaire label="Prénom du conseiller AI" name="ai_prenom" value={data.ai_prenom} onChange={onChange} onBlur={onBlur} error={errors.ai_prenom} placeholder="Prénom" required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ChampFormulaire label="Téléphone" name="ai_tel" type="tel" value={data.ai_tel} onChange={onChange} onBlur={onBlur} error={errors.ai_tel} placeholder="+41 XX XXX XX XX" required />
            <ChampFormulaire label="Email" name="ai_email" type="email" value={data.ai_email} onChange={onChange} onBlur={onBlur} error={errors.ai_email} placeholder="conseiller@ai.ch" required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ChampFormulaire label="Office AI" name="ai_office" value={data.ai_office} onChange={onChange} onBlur={onBlur} error={errors.ai_office} placeholder="Ex: OAI Genève" required />
            <ChampFormulaire label="Mesure AI" name="ai_mesure" value={data.ai_mesure} onChange={onChange} onBlur={onBlur} error={errors.ai_mesure} placeholder="Ex: Mesure de réinsertion" />
          </div>
        </div>
      )}

      {data.inscrit_ai === 'Non' && (
        <div className="animate-fadeIn bg-green-50 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Pas d'AI — vous pouvez passer à l'étape suivante.
        </div>
      )}
    </div>
  )
}
