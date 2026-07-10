/**
 * EditeurTheme.jsx — Panneau « Thème du formulaire » du mode édition (un thème par formulaire).
 *
 * La coordination choisit un thème proposé (dont l'officiel Clair Bois,
 * toujours conservé en premier) ou personnalise les couleurs de marque et
 * la police. Le thème est appliqué EN DIRECT (tout le site se recolore) et
 * stocké dans le schéma ; il se publie comme le reste.
 *
 * Périmètre : couleur primaire (marine), accent (boutons), police, fond des
 * formulaires. Les couleurs du calendrier (vert/orange/rouge/gris) restent
 * fixes — ce sont des codes de disponibilité, pas de la décoration.
 *
 * Props :
 *   themeCourant : le thème actuel du schéma (peut être partiel).
 *   onChange(theme) : appelé à chaque modification (applique + stocke).
 */
import { useState } from 'react'
import { THEMES, normaliserTheme, deriverFond, melangeBlanc } from '../utils/themes'

const POLICES = [
  { valeur: "'Open Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", nom: 'Open Sans (officielle)' },
  { valeur: "'Nunito', 'Open Sans', system-ui, sans-serif", nom: 'Nunito (arrondie, chaleureuse)' },
  { valeur: "'Poppins', 'Open Sans', system-ui, sans-serif", nom: 'Poppins (géométrique, moderne)' },
  { valeur: "'Inter', 'Open Sans', system-ui, sans-serif", nom: 'Inter (sobre, lisible)' },
]

/** Vignette de prévisualisation d'un thème (couleurs + fond). */
function VignetteTheme({ theme, actif, onClick }) {
  const t = normaliserTheme(theme)
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={`text-left rounded-xl border-2 overflow-hidden transition-all cursor-pointer ${
        actif ? 'border-cb-accent shadow-md' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="h-16 relative" style={{ background: t.fondFormulaire }}>
        <div className="absolute inset-0 flex items-center gap-2 px-3">
          <span className="w-7 h-7 rounded-full border border-white/60" style={{ background: t.primaire }} />
          <span className="w-7 h-7 rounded-full border border-white/60" style={{ background: t.accent }} />
          <span className="ml-auto text-[11px] px-2 py-1 rounded-md text-white font-medium" style={{ background: t.accent, fontFamily: t.police }}>
            Bouton
          </span>
        </div>
      </div>
      <div className="px-3 py-2 bg-white flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700" style={{ fontFamily: t.police }}>{t.nom}</span>
        {actif && <span className="text-xs text-cb-accent font-semibold">✓ actif</span>}
      </div>
    </button>
  )
}

/** Sélecteur de couleur (pastille + hex éditable). */
function ChoixCouleur({ label, valeur, onChange }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-500 mb-1">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer bg-white p-0.5"
          aria-label={label}
        />
        <input
          type="text"
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 px-2.5 py-2 rounded-lg border border-gray-300 text-sm font-mono focus:border-cb-blue focus:ring-2 focus:ring-cb-blue/20 outline-none"
        />
      </div>
    </label>
  )
}

export default function EditeurTheme({ themeCourant, onChange }) {
  const courant = normaliserTheme(themeCourant)
  const [personnalise, setPersonnalise] = useState(false)

  /** Applique un thème proposé (copie ses valeurs). */
  const choisirPreset = (preset) => {
    setPersonnalise(false)
    onChange({ ...preset })
  }

  /** Modifie un champ de marque en gardant les autres ; recalcule les dérivés. */
  const modifier = (patch) => {
    const base = { ...courant, ...patch, cle: 'personnalise', nom: 'Personnalisé' }
    // Recalcule les variantes claires et le fond quand une couleur change,
    // pour rester cohérent sans surcharger l'utilisatrice de réglages.
    if (patch.primaire) base.primaireLight = melangeBlanc(patch.primaire, 0.86)
    if (patch.accent) base.accentLight = melangeBlanc(patch.accent, 0.86)
    if (patch.primaire || patch.accent) {
      base.fondFormulaire = deriverFond(base.primaire, base.accent)
    }
    onChange(base)
  }

  const estPreset = THEMES.some((t) => t.cle === courant.cle) && !personnalise

  return (
    <div className="space-y-6">
      <div className="bg-cb-blue-light/60 border border-cb-blue/20 rounded-xl p-4 text-sm text-cb-blue">
        <p className="font-semibold mb-1">Personnalisez l'apparence de ce formulaire</p>
        <p>
          Choisissez un thème ou créez le vôtre — il s'applique à <strong>ce formulaire</strong> (aperçu
          en direct). Les couleurs du calendrier (vert / orange / rouge) ne bougent pas — ce sont des
          repères de disponibilité. Cliquez <strong>Publier</strong> pour enregistrer.
        </p>
      </div>

      {/* Thèmes proposés */}
      <div>
        <h2 className="text-base font-bold text-gray-700 mb-3">Thèmes proposés</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((t) => (
            <VignetteTheme
              key={t.cle}
              theme={t}
              actif={estPreset && courant.cle === t.cle}
              onClick={() => choisirPreset(t)}
            />
          ))}
        </div>
      </div>

      {/* Personnalisation */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-700">Personnaliser</h2>
          {!estPreset && (
            <span className="text-xs text-cb-accent font-semibold bg-cb-accent-light rounded-full px-2 py-0.5">thème sur mesure</span>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ChoixCouleur label="Couleur principale (header, titres)" valeur={courant.primaire} onChange={(v) => modifier({ primaire: v })} />
          <ChoixCouleur label="Couleur d'action (boutons)" valeur={courant.accent} onChange={(v) => modifier({ accent: v })} />
          <label className="block sm:col-span-2">
            <span className="block text-xs font-semibold text-gray-500 mb-1">Police</span>
            <select
              value={courant.police}
              onChange={(e) => modifier({ police: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white cursor-pointer focus:border-cb-blue focus:ring-2 focus:ring-cb-blue/20 outline-none"
              style={{ fontFamily: courant.police }}
            >
              {POLICES.map((p) => (
                <option key={p.nom} value={p.valeur} style={{ fontFamily: p.valeur }}>{p.nom}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Aperçu concret */}
      <div>
        <h2 className="text-base font-bold text-gray-700 mb-3">Aperçu</h2>
        <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ fontFamily: courant.police }}>
          <div className="px-4 py-3 text-white font-semibold" style={{ background: courant.primaire }}>
            Fondation Clair Bois
          </div>
          <div className="p-5 space-y-3" style={{ background: courant.fondFormulaire }}>
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <p className="text-sm font-medium" style={{ color: courant.primaire }}>Exemple de champ</p>
              <input readOnly value="Marie Dupont" className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: courant.accent }} />
              <div className="flex gap-2">
                <button type="button" className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: courant.primaire }}>Précédent</button>
                <button type="button" className="px-4 py-2 rounded-lg text-white text-sm font-medium ml-auto" style={{ background: courant.accent }}>Envoyer</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
