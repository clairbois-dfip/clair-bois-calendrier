/**
 * Recapitulatif.jsx — Ecran de verification avant soumission.
 *
 * Affiche toutes les donnees saisies groupees par section.
 * Chaque section dispose d'un bouton "Modifier" qui teleporte l'utilisateur
 * directement a l'etape correspondante (via onEdit(stepIndex)).
 *
 * Le contexte (secteur+dates ou modules selectionnes) est affiche en lecture seule :
 * il provient de l'aiguillage precedent et ne peut pas etre modifie ici.
 *
 * Les sections sans aucune valeur renseignee sont automatiquement masquees
 * pour ne pas surcharger l'ecran avec des blocs vides.
 */
import { formatDate } from '../../utils/helpers'
import { SECTION_LABELS } from '../../utils/formConfig'

function Section({ title, fields, onEdit, stepIndex }) {
  // Masquer la section entiere si aucune donnee n'a ete saisie (ex: curatelle non applicable)
  const hasData = fields.some(f => f.value && f.value.toString().trim())
  if (!hasData) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="relative px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 text-center">{title}</h4>
        {onEdit && (
          <button
            onClick={() => onEdit(stepIndex)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-cb-blue hover:text-cb-blue/80 font-medium cursor-pointer"
          >
            Modifier
          </button>
        )}
      </div>
      <div className="divide-y divide-gray-100">
        {fields.filter(f => f.value && f.value.toString().trim()).map((f) => (
          <div key={f.label} className="grid grid-cols-[1fr_1fr] items-start px-4 py-2.5">
            <span className="text-sm text-gray-500 text-left pr-4">{f.label}</span>
            <span className="text-sm font-medium text-gray-900">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Recapitulatif({ data, contextData, parcours, sections, onEdit }) {
  // Construction du bloc contexte (lecture seule, pas de bouton Modifier)
  const contextFields = []
  if (parcours === 'stages' && contextData) {
    if (contextData.secteur) contextFields.push({ label: 'Secteur', value: contextData.secteur })
    if (contextData.dateDebut) contextFields.push({ label: 'Date de début', value: formatDate(contextData.dateDebut) })
    if (contextData.dateFin) contextFields.push({ label: 'Date de fin', value: formatDate(contextData.dateFin) })
  }
  if (parcours === 'modules' && contextData?.modules) {
    contextData.modules.forEach((m, i) => {
      contextFields.push({
        label: `Module ${i + 1}`,
        value: `${m.mod.nom} (${m.mod.site}) — Semaine ${m.semaine.semaine}`,
      })
    })
  }

  // Table de correspondance section -> champs a afficher dans le recapitulatif.
  // Les champs conditionnels (curatelle, AI) sont inclus : Section les masque automatiquement
  // si leur valeur est vide, pas besoin de gerer la condition ici.
  const sectionFields = {
    referent: [
      { label: 'Organisation', value: data.referent_partenaire },
      { label: 'Nom', value: data.referent_nom },
      { label: 'Prénom', value: data.referent_prenom },
      { label: 'Téléphone', value: data.referent_tel },
      { label: 'Email', value: data.referent_email },
      { label: 'Fonction', value: data.referent_fonction },
    ],
    stagiaire: [
      { label: 'Nom', value: data.nom },
      { label: 'Prénom', value: data.prenom },
      { label: 'Sexe', value: data.sexe },
      { label: 'Date de naissance', value: data.date_naissance ? formatDate(data.date_naissance) : '' },
      { label: 'N° AVS', value: data.avs },
      { label: 'Téléphone', value: data.tel },
      { label: 'Email', value: data.email },
      { label: 'Adresse', value: data.adresse },
      { label: 'NPA', value: data.npa },
      { label: 'Formation', value: data.formation },
    ],
    'stagiaire-retour': [
      { label: 'Nom', value: data.nom },
      { label: 'Prénom', value: data.prenom },
      { label: 'Sexe', value: data.sexe },
      { label: 'Date de naissance', value: data.date_naissance ? formatDate(data.date_naissance) : '' },
      { label: 'N° AVS', value: data.avs },
      { label: 'Téléphone', value: data.tel },
      { label: 'Email', value: data.email },
    ],
    curatelle: [
      { label: 'Sous curatelle', value: data.sous_curatelle },
      { label: 'Type', value: data.curatelle_type },
      { label: 'Nom du curateur', value: data.curatelle_nom },
      { label: 'Prénom du curateur', value: data.curatelle_prenom },
      { label: 'Téléphone', value: data.curatelle_tel },
      { label: 'Email', value: data.curatelle_email },
    ],
    urgence: [
      { label: 'Nom', value: data.urgence_nom },
      { label: 'Prénom', value: data.urgence_prenom },
      { label: 'Lien', value: data.urgence_lien },
      { label: 'Téléphone', value: data.urgence_tel },
    ],
    ai: [
      { label: 'Inscrit·e AI', value: data.inscrit_ai },
      { label: 'Nom conseiller', value: data.ai_nom },
      { label: 'Prénom conseiller', value: data.ai_prenom },
      { label: 'Téléphone', value: data.ai_tel },
      { label: 'Email', value: data.ai_email },
      { label: 'Office AI', value: data.ai_office },
      { label: 'Mesure', value: data.ai_mesure },
    ],
    complementaire: [
      { label: 'Objectif du stage', value: data.objectif_stage },
      { label: 'Parcours scolaire', value: data.parcours_scolaire },
      { label: 'Limitations', value: data.limitations },
      { label: 'Tests effectués', value: data.deja_tests },
      { label: 'Stages déjà effectués', value: data.deja_stages_secteur },
      { label: 'Réseau médical', value: data.reseau_medical },
      { label: 'Pointure', value: data.pointure },
      { label: 'Taille t-shirt', value: data.taille_tshirt },
      { label: 'Taille pantalon', value: data.taille_pantalon },
    ],
    declaration: [
      { label: 'Charte prévention', value: data.declaration_charte === 'Oui' ? 'Lu et accepté' : '' },
      { label: 'Engagement personnel', value: data.declaration_engagement === 'Oui' ? 'Lu et accepté' : '' },
    ],
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-50 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Vérifiez vos informations avant d'envoyer votre demande. Vous pouvez modifier chaque section.
      </div>

      {/* Contexte (non modifiable ici — retour en arrière pour changer) */}
      {contextFields.length > 0 && (
        <Section
          title={parcours === 'stages' ? 'Stage demandé' : 'Modules sélectionnés'}
          fields={contextFields}
        />
      )}

      {/* Sections du formulaire */}
      {sections.map((sectionKey, idx) => (
        <Section
          key={sectionKey}
          title={SECTION_LABELS[sectionKey] || sectionKey}
          fields={sectionFields[sectionKey] || []}
          onEdit={onEdit}
          stepIndex={idx}
        />
      ))}
    </div>
  )
}
