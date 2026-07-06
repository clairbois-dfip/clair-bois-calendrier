/**
 * EtapeStagiaire.jsx — Etape "donnees personnelles" du parcours d'inscription.
 *
 * Place dans le parcours : premiere etape (ou deuxieme si referent).
 * Deux variantes controlees par la prop isRetour :
 *
 *   isRetour = false (defaut) : inscription complete
 *     Champs : nom, prenom, sexe, date naissance, AVS, tel, email, adresse, NPA, formation
 *     La formation renseigne si le stagiaire envisage d'entrer en apprentissage,
 *     ce qui conditionne le type de suivi propose par la fondation.
 *
 *   isRetour = true : stagiaire deja connu en base
 *     Champs reduits (nom, prenom, sexe, naissance, AVS, tel, email) suffisants
 *     pour identifier le dossier existant sans ressaisir toutes les donnees.
 */
import ChampFormulaire from './ChampFormulaire'

export default function EtapeStagiaire({ data, errors, onChange, onBlur, isRetour = false }) {
  // Formulaire allege : juste assez pour retrouver un dossier existant
  if (isRetour) {
    return (
      <div className="space-y-4">
        <div className="bg-cb-blue-light/50 rounded-lg p-3 text-sm text-cb-blue">
          Vous avez déjà un dossier chez Clair-Bois. Nous avons besoin de quelques informations
          pour retrouver votre dossier.
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ChampFormulaire label="Nom" name="nom" value={data.nom} onChange={onChange} onBlur={onBlur} error={errors.nom} required />
          <ChampFormulaire label="Prénom" name="prenom" value={data.prenom} onChange={onChange} onBlur={onBlur} error={errors.prenom} required />
        </div>

        <ChampFormulaire
          label="Sexe"
          name="sexe"
          type="radio-group"
          value={data.sexe}
          onChange={onChange}
          error={errors.sexe}
          required
          options={[
            { value: 'Masculin', label: 'Masculin' },
            { value: 'Féminin', label: 'Féminin' },
          ]}
        />

        <ChampFormulaire
          label="Date de naissance"
          name="date_naissance"
          type="date"
          value={data.date_naissance}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.date_naissance}
          required
        />

        <ChampFormulaire
          label="Numéro AVS"
          name="avs"
          type="text"
          value={data.avs}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.avs}
          required
          placeholder="756.XXXX.XXXX.XX"
          helpText="13 chiffres, commence par 756"
          autoFormat={null}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <ChampFormulaire label="Téléphone" name="tel" type="tel" value={data.tel} onChange={onChange} onBlur={onBlur} error={errors.tel} required placeholder="+41 XX XXX XX XX" />
          <ChampFormulaire label="Email" name="email" type="email" value={data.email} onChange={onChange} onBlur={onBlur} error={errors.email} required placeholder="exemple@email.ch" />
        </div>
      </div>
    )
  }

  // Inscription complete : tous les champs necessaires a la creation du dossier
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <ChampFormulaire label="Nom" name="nom" value={data.nom} onChange={onChange} onBlur={onBlur} error={errors.nom} required />
        <ChampFormulaire label="Prénom" name="prenom" value={data.prenom} onChange={onChange} onBlur={onBlur} error={errors.prenom} required />
      </div>

      <ChampFormulaire
        label="Sexe"
        name="sexe"
        type="radio-group"
        value={data.sexe}
        onChange={onChange}
        error={errors.sexe}
        required
        options={[
          { value: 'Masculin', label: 'Masculin' },
          { value: 'Féminin', label: 'Féminin' },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ChampFormulaire
          label="Date de naissance"
          name="date_naissance"
          type="date"
          value={data.date_naissance}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.date_naissance}
          required
        />
        <ChampFormulaire
          label="Numéro AVS"
          name="avs"
          type="text"
          value={data.avs}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.avs}
          required
          placeholder="756.XXXX.XXXX.XX"
          helpText="13 chiffres, commence par 756"
          autoFormat={null}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ChampFormulaire
          label="Téléphone"
          name="tel"
          type="tel"
          value={data.tel}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.tel}
          required
          placeholder="+41 XX XXX XX XX"
        />
        <ChampFormulaire
          label="Email"
          name="email"
          type="email"
          value={data.email}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.email}
          required
          placeholder="exemple@email.ch"
        />
      </div>

      <ChampFormulaire
        label="Adresse"
        name="adresse"
        value={data.adresse}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.adresse}
        required
        placeholder="Rue et numéro"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ChampFormulaire
          label="NPA"
          name="npa"
          value={data.npa}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.npa}
          required
          placeholder="1205"
          helpText="Code postal (4 chiffres)"
        />
        <ChampFormulaire
          label="Envisage d'entrer en formation"
          name="formation"
          type="select"
          value={data.formation}
          onChange={onChange}
          error={errors.formation}
          required
          options={[
            { value: 'Non', label: 'Non' },
            { value: 'Oui, cette année', label: 'Oui, cette année' },
            { value: 'Oui, l\'année prochaine', label: 'Oui, l\'année prochaine' },
          ]}
        />
      </div>
    </div>
  )
}
