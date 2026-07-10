/**
 * Recapitulatif.jsx — Ecran de verification avant soumission.
 *
 * Les lignes affichées sont dérivées dynamiquement du schéma des
 * formulaires (labels + ordre + conditions identiques aux étapes), si bien
 * que tout champ ajouté par la coordination apparaît automatiquement ici.
 *
 * Chaque section dispose d'un bouton "Modifier" qui téléporte l'utilisateur
 * directement à l'étape correspondante (via onEdit(stepIndex)).
 * Le contexte (secteur+dates ou modules) est affiché en lecture seule.
 * Les sections sans aucune valeur renseignée sont masquées.
 */
import { formatDate } from '../../utils/helpers'
import { SECTION_LABELS } from '../../utils/formConfig'
import { champsVisibles } from '../../utils/formulaireDynamique'

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

/** Valeur affichée pour un champ du schéma (dates formatées, cases → mention lisible). */
function valeurAffichee(champ, brute) {
  if (!brute) return ''
  if (champ.type === 'date') return formatDate(brute)
  if (champ.type === 'checkbox') return brute === 'Oui' ? 'Lu et accepté' : ''
  return brute
}

export default function Recapitulatif({ schema, data, contextData, parcours, pourQui, sections, onEdit }) {
  const valeurs = { ...data, parcours, pourQui }

  // Bloc contexte (lecture seule, pas de bouton Modifier)
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

      {/* Sections du formulaire, dérivées du schéma */}
      {sections.map((sectionKey, idx) => (
        <Section
          key={sectionKey}
          title={SECTION_LABELS[sectionKey] || sectionKey}
          fields={champsVisibles(schema, sectionKey, valeurs).map((champ) => ({
            label: champ.label.length > 60 ? `${champ.label.slice(0, 57)}…` : champ.label,
            value: valeurAffichee(champ, data[champ.champPayload]),
          }))}
          onEdit={onEdit}
          stepIndex={idx}
        />
      ))}
    </div>
  )
}
