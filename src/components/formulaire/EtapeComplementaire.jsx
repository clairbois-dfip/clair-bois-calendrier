/**
 * EtapeComplementaire.jsx — Etape "informations complementaires" du parcours d'inscription.
 *
 * Place dans le parcours : avant-derniere etape, apres AI et curatelle.
 * Regroupe les donnees de profil approfondies necessaires a la coordination
 * pedagogique et medicale (champs alignes sur les formulaires internes Karavia).
 *
 * Champs :
 *   - Objectif du stage     → uniquement si parcours = "stages" (pas pour les modules)
 *   - Parcours scolaire     → historique et difficultes identifiees
 *   - Limitations           → physiques, cognitives, relationnelles — guide l'encadrant
 *   - Tests                 → evite de refaire des evaluations deja existantes
 *   - Stages anterieurs     → libelle adapte selon le type de parcours
 *   - Reseau medical        → permet a la fondation d'anticiper les besoins de suivi
 *   - Tailles               → optionnel, utile pour la preparation des equipements
 */
import ChampFormulaire from './ChampFormulaire'

export default function EtapeComplementaire({ data, errors, onChange, onBlur, parcours = 'stages' }) {
  return (
    <div className="space-y-4">
      {/* L'objectif est specifique aux stages ; les modules ont un cadre predetermine */}
      {parcours === 'stages' && (
        <ChampFormulaire
          label="Quel est l'objectif du stage ?"
          name="objectif_stage"
          type="textarea"
          value={data.objectif_stage}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.objectif_stage}
          required
          placeholder="Décrivez l'objectif du stage..."
        />
      )}

      <ChampFormulaire
        label="Parcours scolaire (difficultés particulières ?)"
        name="parcours_scolaire"
        type="textarea"
        value={data.parcours_scolaire}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.parcours_scolaire}
        required
        placeholder="Décrivez le parcours scolaire..."
      />

      <ChampFormulaire
        label="Limitations fonctionnelles, physiques, cognitives ou autres (troubles de la concentration, difficultés relationnelles, taux d'activité réduit, limitation de port de charge, etc.)"
        name="limitations"
        type="textarea"
        value={data.limitations}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.limitations}
        required
        placeholder="Indiquez les limitations éventuelles..."
      />

      <ChampFormulaire
        label="A déjà fait des tests"
        name="deja_tests"
        type="select"
        value={data.deja_tests}
        onChange={onChange}
        error={errors.deja_tests}
        required
        options={[
          { value: 'Non', label: 'Non' },
          { value: 'Oui, d\'évaluation et de diagnostic', label: 'Oui, d\'évaluation et de diagnostic (dys, TDAH, TSA, etc.)' },
          { value: 'Oui, d\'évaluation du niveau scolaire', label: 'Oui, d\'évaluation du niveau scolaire et des aptitudes (EVA, EVAtech, TAF, etc.)' },
        ]}
      />

      {/* Le libelle change selon le parcours pour rester pertinent contextuellement */}
      <ChampFormulaire
        label={parcours === 'stages' ? 'A déjà effectué des stages dans ce secteur ?' : 'A déjà effectué des stages ?'}
        name="deja_stages_secteur"
        type="radio-group"
        value={data.deja_stages_secteur}
        onChange={onChange}
        error={errors.deja_stages_secteur}
        required
        options={[
          { value: 'Oui', label: 'Oui' },
          { value: 'Non', label: 'Non' },
        ]}
      />

      <ChampFormulaire
        label="Réseau médical (passé ou présent)"
        name="reseau_medical"
        type="select"
        value={data.reseau_medical}
        onChange={onChange}
        error={errors.reseau_medical}
        required
        options={[
          { value: 'Aucun médecin ou thérapeute', label: 'Aucun médecin ou thérapeute' },
          { value: 'Médecin généraliste', label: 'Un·e médecin généraliste' },
          { value: 'Thérapeute', label: 'Un·e thérapeute (psychologue, psychiatre, etc.)' },
          { value: 'Logothérapeute', label: 'Un·e logothérapeute' },
          { value: 'Autre', label: 'Autre' },
        ]}
      />

      <div className="border-t border-gray-200 pt-4 mt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Tailles (optionnel)</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <ChampFormulaire label="Pointure" name="pointure" value={data.pointure} onChange={onChange} onBlur={onBlur} error={errors.pointure} placeholder="Ex: 42" />
          <ChampFormulaire label="Taille t-shirt" name="taille_tshirt" value={data.taille_tshirt} onChange={onChange} onBlur={onBlur} error={errors.taille_tshirt} placeholder="Ex: M, L, XL" />
          <ChampFormulaire label="Taille pantalon" name="taille_pantalon" value={data.taille_pantalon} onChange={onChange} onBlur={onBlur} error={errors.taille_pantalon} placeholder="Ex: 40" />
        </div>
      </div>
    </div>
  )
}
