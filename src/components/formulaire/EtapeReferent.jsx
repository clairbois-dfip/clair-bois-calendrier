/**
 * EtapeReferent.jsx — Informations du référent (partenaire / enseignant).
 *
 * Affiché uniquement quand chemin.pourQui === 'autre'.
 * Le référent est la personne qui inscrit le stagiaire.
 */
import ChampFormulaire from './ChampFormulaire'

export default function EtapeReferent({ data, errors, onChange, onBlur }) {
  return (
    <div className="space-y-4">
      <div className="bg-cb-blue-light/50 rounded-lg p-3 text-sm text-cb-blue">
        En tant que référent·e, veuillez renseigner vos coordonnées professionnelles.
      </div>

      <ChampFormulaire
        label="Organisation / Partenaire"
        name="referent_partenaire"
        value={data.referent_partenaire}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.referent_partenaire}
        required
        placeholder="Ex: SGIPA, ORIF, École spécialisée..."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ChampFormulaire label="Votre nom" name="referent_nom" value={data.referent_nom} onChange={onChange} onBlur={onBlur} error={errors.referent_nom} required />
        <ChampFormulaire label="Votre prénom" name="referent_prenom" value={data.referent_prenom} onChange={onChange} onBlur={onBlur} error={errors.referent_prenom} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ChampFormulaire label="Votre téléphone" name="referent_tel" type="tel" value={data.referent_tel} onChange={onChange} onBlur={onBlur} error={errors.referent_tel} required placeholder="+41 XX XXX XX XX" />
        <ChampFormulaire label="Votre email" name="referent_email" type="email" value={data.referent_email} onChange={onChange} onBlur={onBlur} error={errors.referent_email} required placeholder="nom@organisation.ch" />
      </div>

      <ChampFormulaire
        label="Votre fonction"
        name="referent_fonction"
        type="select"
        value={data.referent_fonction}
        onChange={onChange}
        error={errors.referent_fonction}
        required
        options={[
          { value: 'Enseignant·e', label: 'Enseignant·e' },
          { value: 'Éducateur·trice', label: 'Éducateur·trice' },
          { value: 'Conseiller·ère AI', label: 'Conseiller·ère AI' },
          { value: 'Conseiller·ère en Insertion', label: 'Conseiller·ère en Insertion' },
          { value: 'Curateur·trice', label: 'Curateur·trice' },
          { value: 'Parent', label: 'Parent' },
          { value: 'Autre', label: 'Autre' },
        ]}
      />
    </div>
  )
}
