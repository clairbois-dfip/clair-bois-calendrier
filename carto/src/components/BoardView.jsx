import { UtensilsCrossed, Shirt, ChefHat, Wrench, Home, GraduationCap, LogOut } from 'lucide-react'
import mockData from '../data/mock-carto.json'
import { getSecteurById } from '../data/secteurs-config.js'
import { TYPES_PLACES, getTypePlaceConfig } from '../data/types-places.js'

// ─── Icônes SVG par secteur ───────────────────────────────────────────────────

const SECTEUR_ICONS = {
  restauration:      UtensilsCrossed,
  lingerie:          Shirt,
  cuisine:           ChefHat,
  technique:         Wrench,
  'educatif-adulte': Home,
  'educatif-enfance': GraduationCap,
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function calcStats(places) {
  const total    = places.length
  const occupees = places.filter((p) => p.statut === 'occupé').length
  return { total, occupees, libres: total - occupees }
}

function typesDistincts(places) {
  const codes  = [...new Set(places.map((p) => p.type))]
  const ordres = Object.fromEntries(Object.values(TYPES_PLACES).map((t) => [t.code, t.ordre]))
  return codes.sort((a, b) => (ordres[a] ?? 99) - (ordres[b] ?? 99))
}

// Retourne les couleurs d'état selon disponibilité
function etatCouleurs(stats) {
  if (stats.libres === 0)                              return { label: 'Complet',    bg: '#fee2e2', text: '#b91c1c', bar: '#ef4444' }
  if (stats.libres / stats.total < 0.3)               return { label: '< 30% libre', bg: '#ffedd5', text: '#c2410c', bar: '#f97316' }
  return                                                      { label: 'Disponible',  bg: '#dcfce7', text: '#15803d', bar: '#22c55e' }
}

// ─── Badge type de place ──────────────────────────────────────────────────────

function BadgeType({ code }) {
  const cfg = getTypePlaceConfig(code)
  return (
    <span
      className="inline-block rounded-md px-2 py-0.5 text-xs font-semibold border"
      style={{ backgroundColor: cfg.couleurFond, color: cfg.couleurTexte, borderColor: cfg.couleurBordure }}
    >
      {cfg.labelCourt}
    </span>
  )
}

// ─── Carte secteur ────────────────────────────────────────────────────────────

function CarteSecteur({ secteurData, onClick, index }) {
  const config = getSecteurById(secteurData.id) ?? { couleur: secteurData.couleur, icone: '' }
  const stats  = calcStats(secteurData.places)
  const etat   = etatCouleurs(stats)
  const types  = typesDistincts(secteurData.places)
  const pct    = stats.total > 0 ? Math.round((stats.occupees / stats.total) * 100) : 0
  const Icon   = SECTEUR_ICONS[secteurData.id] ?? Home

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(secteurData)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(secteurData)}
      className="group relative rounded-2xl overflow-hidden bg-white border border-gray-100
                 shadow-sm cursor-pointer select-none outline-none
                 transition-all duration-200
                 hover:-translate-y-1 hover:shadow-xl
                 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#092C6A]"
      style={{
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Glow overlay au hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${config.couleur}18 0%, transparent 65%)` }}
      />

      {/* En-tête coloré */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ backgroundColor: config.couleur }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Icon size={18} color="white" strokeWidth={2} />
          </div>
          <h3 className="text-white font-bold text-sm leading-tight truncate">
            {secteurData.nom}
          </h3>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ml-2"
          style={{ backgroundColor: etat.bg, color: etat.text }}
        >
          {etat.label}
        </span>
      </div>

      {/* Corps */}
      <div className="px-5 py-4 space-y-3 bg-white">
        {/* Compteur */}
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold tabular-nums" style={{ color: etat.text }}>
            {stats.libres}
          </span>
          <span className="text-sm font-medium text-gray-600">
            libre{stats.libres !== 1 ? 's' : ''} sur {stats.total}
          </span>
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: etat.bar }}
          />
        </div>
        <p className="text-xs font-medium text-gray-600 -mt-1">
          {stats.occupees} occupée{stats.occupees !== 1 ? 's' : ''} ({pct}%)
        </p>

        {/* Types de places */}
        {types.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {types.map((code) => <BadgeType key={code} code={code} />)}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function BoardView({ onOuvrirSecteur, onDeconnexion }) {
  const toutesLesPlaces  = mockData.secteurs.flatMap((s) => s.places)
  const statsGlobales    = calcStats(toutesLesPlaces)
  const pctGlobal        = statsGlobales.total > 0 ? Math.round((statsGlobales.occupees / statsGlobales.total) * 100) : 0

  const secteursOrdonnes = [...mockData.secteurs].sort((a, b) => {
    const cfgA = getSecteurById(a.id)
    const cfgB = getSecteurById(b.id)
    return (cfgA?.ordre ?? 99) - (cfgB?.ordre ?? 99)
  })

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="sticky top-0 z-10 px-6 py-4 shadow-md" style={{ backgroundColor: '#092C6A' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-9 h-9 rounded-full bg-white flex items-center justify-center">
              <span className="text-[#092C6A] font-bold text-sm select-none">CB</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-lg leading-tight">Cartographie des places</h1>
              <p className="text-white/65 text-xs mt-0.5 truncate">{mockData.semaine}</p>
            </div>
          </div>
          <button
            onClick={onDeconnexion}
            className="shrink-0 flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 active:bg-white/30 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
          >
            <LogOut size={15} strokeWidth={2} />
            Se déconnecter
          </button>
        </div>
      </header>

      {/* Stats globales */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-gray-800">{statsGlobales.total}</span>
            <span className="text-sm text-gray-500">places</span>
          </div>
          <div className="h-5 w-px bg-gray-200 hidden sm:block" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-green-600">{statsGlobales.libres}</span>
            <span className="text-sm text-gray-500">libre{statsGlobales.libres !== 1 ? 's' : ''}</span>
          </div>
          <div className="h-5 w-px bg-gray-200 hidden sm:block" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-gray-500">{statsGlobales.occupees}</span>
            <span className="text-sm text-gray-500">occupée{statsGlobales.occupees !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex-1 min-w-[100px] flex items-center gap-3">
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="h-2 rounded-full bg-[#092C6A] transition-all duration-700" style={{ width: `${pctGlobal}%` }} />
            </div>
            <span className="text-sm font-semibold text-[#092C6A] shrink-0">{pctGlobal}%</span>
          </div>
        </div>
      </div>

      {/* Grille */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {secteursOrdonnes.map((secteur, i) => (
            <CarteSecteur
              key={secteur.id}
              secteurData={secteur}
              onClick={onOuvrirSecteur}
              index={i}
            />
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-gray-400">
          Données mises à jour le{' '}
          {new Date(mockData.lastUpdated).toLocaleDateString('fr-CH', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </main>
    </div>
  )
}
