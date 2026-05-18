import { useState } from 'react'
import { UtensilsCrossed, Shirt, ChefHat, Wrench, Home, GraduationCap, ArrowLeft } from 'lucide-react'
import { TYPES_PLACES_LIST, getTypePlaceConfig } from '../data/types-places.js'
import { getSecteurById } from '../data/secteurs-config.js'

// ─── Icônes SVG par secteur ───────────────────────────────────────────────────

const SECTEUR_ICONS = {
  restauration:       UtensilsCrossed,
  lingerie:           Shirt,
  cuisine:            ChefHat,
  technique:          Wrench,
  'educatif-adulte':  Home,
  'educatif-enfance': GraduationCap,
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function formaterDate(dateISO) {
  if (!dateISO) return '—'
  return new Date(dateISO).toLocaleDateString('fr-CH', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// Couleurs état selon nb de places libres
function etatCouleurs(libres, total) {
  if (libres === 0)                        return { bar: '#ef4444', text: '#b91c1c' }
  if (libres / total < 0.3)               return { bar: '#f97316', text: '#c2410c' }
  return                                          { bar: '#22c55e', text: '#15803d' }
}

// ─── Tooltip au hover ─────────────────────────────────────────────────────────

function TooltipPlace({ place }) {
  const estOccupe = place.statut === 'occupé'

  // Styles inline conservés pour le positionnement absolu
  const wrapStyle = {
    position: 'absolute',
    bottom: 'calc(100% + 10px)',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 50,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  }
  const arrowStyle = {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '7px solid transparent',
    borderRight: '7px solid transparent',
    borderTop: '7px solid white',
    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.08))',
  }

  if (!estOccupe) {
    return (
      <div style={wrapStyle}>
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md text-xs font-semibold text-green-700">
          Place disponible
        </div>
        <div style={arrowStyle} />
      </div>
    )
  }

  const { stagiaire } = place
  return (
    <div style={{ ...wrapStyle, minWidth: '190px', whiteSpace: 'normal' }}>
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm text-gray-900">
        <div className="font-bold text-gray-800 mb-0.5">{stagiaire.prenom} {stagiaire.nom}</div>
        <div className="text-xs text-gray-500 mb-2">{stagiaire.typeStage}</div>
        <div className="border-t border-gray-100 pt-2 text-xs text-gray-700">
          <span className="font-semibold">{formaterDate(stagiaire.dateDebut)}</span>
          <span className="text-gray-400 mx-1">→</span>
          <span className="font-semibold">{formaterDate(stagiaire.dateFin)}</span>
        </div>
      </div>
      <div style={arrowStyle} />
    </div>
  )
}

// ─── Carte place individuelle ─────────────────────────────────────────────────

function CartePlace({ place, estSurvole, onMouseEnter, onMouseLeave }) {
  const estOccupe  = place.statut === 'occupé'
  const typeConfig = getTypePlaceConfig(place.type)

  return (
    <div
      className="relative shrink-0"
      style={{ width: '120px', height: '120px' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {estSurvole && <TooltipPlace place={place} />}

      <div
        className="w-full h-full flex flex-col items-center justify-between p-2 rounded-xl border-2 transition-all duration-150 select-none"
        style={{
          backgroundColor: estOccupe ? '#fee2e2' : '#dcfce7',
          borderColor:     estOccupe ? '#ef4444' : '#22c55e',
          cursor:          estOccupe ? 'pointer' : 'default',
          transform:       estSurvole ? 'translateY(-2px)' : 'none',
          boxShadow:       estSurvole ? '0 6px 16px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {/* Badge type */}
        <span
          className="self-start rounded-md px-1.5 py-0.5 text-[10px] font-bold border leading-none"
          style={{
            backgroundColor: typeConfig.couleurFond,
            color:           typeConfig.couleurTexte,
            borderColor:     typeConfig.couleurBordure,
          }}
        >
          {typeConfig.labelCourt}
        </span>

        {/* Statut */}
        <span
          className="text-[11px] font-extrabold tracking-wide uppercase text-center"
          style={{ color: estOccupe ? '#dc2626' : '#16a34a' }}
        >
          {estOccupe ? 'OCCUPÉ' : 'LIBRE'}
        </span>

        {/* Prénom ou cercle */}
        <span
          className="text-[11px] font-semibold max-w-full truncate opacity-75"
          style={{ color: estOccupe ? '#ef4444' : '#22c55e' }}
        >
          {estOccupe && place.stagiaire ? place.stagiaire.prenom : '○'}
        </span>
      </div>
    </div>
  )
}

// ─── Groupe de places ─────────────────────────────────────────────────────────

function GroupePlaces({ titre, description, places, hoveredPlace, onHover }) {
  return (
    <div className="mb-7">
      {titre && (
        <div className="mb-3">
          <h3 className="text-sm font-bold text-gray-700">{titre}</h3>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
      )}
      <div className="flex flex-wrap gap-3.5">
        {places.map((place) => (
          <CartePlace
            key={place.id}
            place={place}
            estSurvole={hoveredPlace === place.id}
            onMouseEnter={() => onHover(place.id)}
            onMouseLeave={() => onHover(null)}
          />
        ))}
        {places.length === 0 && (
          <p className="text-sm text-gray-400 italic">Aucune place configurée dans ce groupe.</p>
        )}
      </div>
    </div>
  )
}

// ─── Légende des types de places ──────────────────────────────────────────────

function LegendePlaces() {
  return (
    <div className="border-t border-gray-100 pt-5 mt-8">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Légende — Types de places
      </p>
      <div className="flex flex-wrap gap-2.5">
        {TYPES_PLACES_LIST.map((type) => (
          <div
            key={type.code}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5"
          >
            <span
              className="rounded px-1.5 py-0.5 text-[11px] font-bold border"
              style={{
                backgroundColor: type.couleurFond,
                color:           type.couleurTexte,
                borderColor:     type.couleurBordure,
              }}
            >
              {type.labelCourt}
            </span>
            <span className="text-xs text-gray-500">{type.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function SecteurView({ secteur, onRetour }) {
  const [hoveredPlace, setHoveredPlace] = useState(null)

  const config            = getSecteurById(secteur.id)
  const couleurPrincipale = secteur.couleur ?? config?.couleur ?? '#6b7280'
  const Icon              = SECTEUR_ICONS[secteur.id] ?? Home

  const totalPlaces   = secteur.places?.length ?? 0
  const placesLibres  = secteur.places?.filter((p) => p.statut === 'libre').length ?? 0
  const placesOccupees = totalPlaces - placesLibres
  const pct           = totalPlaces > 0 ? Math.round((placesOccupees / totalPlaces) * 100) : 0
  const etat          = etatCouleurs(placesLibres, totalPlaces)

  const hasSousEntites = !!(secteur.sous_entites?.length > 0)

  let groupes = []
  if (hasSousEntites) {
    groupes = secteur.sous_entites.map((se) => ({
      id: se.id, titre: se.nom, description: se.description,
      places: (secteur.places ?? []).filter((p) => p.sous_entite === se.id),
    }))
    const orphelins = (secteur.places ?? []).filter((p) => !p.sous_entite)
    if (orphelins.length > 0) groupes.push({ id: 'autres', titre: 'Autres', description: null, places: orphelins })
  } else {
    groupes = [{ id: 'principal', titre: null, description: null, places: secteur.places ?? [] }]
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="sticky top-0 z-10 px-6 py-4 shadow-md" style={{ backgroundColor: '#092C6A' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">

          {/* Bouton retour */}
          <button
            onClick={onRetour}
            className="shrink-0 flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 active:bg-white/30 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Retour
          </button>

          {/* Titre centré */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${couleurPrincipale}40` }}>
              <Icon size={18} color="white" strokeWidth={2} />
            </div>
            <h1 className="text-white font-bold text-lg leading-tight truncate">{secteur.nom}</h1>
          </div>

          {/* Espace miroir */}
          <div className="shrink-0 w-24" />
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-5">

        {/* Résumé statistiques */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">

            {/* Compteurs */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tabular-nums" style={{ color: etat.text }}>{placesLibres}</span>
              <span className="text-sm text-gray-500">libre{placesLibres !== 1 ? 's' : ''}</span>
            </div>
            <div className="h-5 w-px bg-gray-200 hidden sm:block" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tabular-nums text-gray-500">{placesOccupees}</span>
              <span className="text-sm text-gray-500">occupée{placesOccupees !== 1 ? 's' : ''}</span>
            </div>
            <div className="h-5 w-px bg-gray-200 hidden sm:block" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tabular-nums text-gray-800">{totalPlaces}</span>
              <span className="text-sm text-gray-500">total</span>
            </div>

            {/* Barre de progression */}
            <div className="flex-1 min-w-[140px] flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: etat.bar }}
                />
              </div>
              <span className="text-sm font-semibold shrink-0" style={{ color: etat.text }}>{pct}% d'occupation</span>
            </div>
          </div>
        </div>

        {/* Grille des places */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">
            Places de stage
          </h2>

          {groupes.map((groupe, idx) => (
            <div key={groupe.id}>
              {idx > 0 && <div className="border-t border-gray-100 mb-6" />}
              <GroupePlaces
                titre={groupe.titre}
                description={groupe.description}
                places={groupe.places}
                hoveredPlace={hoveredPlace}
                onHover={setHoveredPlace}
              />
            </div>
          ))}

          {totalPlaces === 0 && (
            <p className="text-sm text-gray-400 italic text-center py-8">
              Aucune place configurée pour ce secteur.
            </p>
          )}

          <LegendePlaces />
        </div>

        {/* Timestamp */}
        <p className="text-center text-xs text-gray-400">
          Survolez une place occupée pour voir les détails du stagiaire.
        </p>
      </main>
    </div>
  )
}
