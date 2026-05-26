/**
 * Tests unitaires — Composant Cartographie (refonte plans metiers).
 *
 * Verifie le rendu de la vue d'ensemble (5 plans), la navigation
 * vers la vue detail d'un plan, le rendu des places typees et
 * des deux poles du plan Educatif.
 *
 * Note : l'animation d'expansion (rect capture + transitions CSS)
 * n'est pas testee — non fiable en JSDOM. On mocke
 * `getBoundingClientRect` pour eviter les NaN dans les variables CSS.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import Cartographie from '../components/Cartographie'

// ──────────────────────────────────────────────
// Props par defaut
// ──────────────────────────────────────────────

const DEFAULT_PROPS = {
  onGoHome: vi.fn(),
  onLogout: vi.fn(),
}

// ──────────────────────────────────────────────
// Mock de getBoundingClientRect (utilise pour
// l'animation d'overlay — JSDOM renvoie tout a 0
// par defaut, ce qui ne gene pas mais on stabilise).
// ──────────────────────────────────────────────

let originalGetBoundingClientRect

beforeEach(() => {
  DEFAULT_PROPS.onGoHome.mockClear()
  DEFAULT_PROPS.onLogout.mockClear()
  originalGetBoundingClientRect = Element.prototype.getBoundingClientRect
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    x: 100,
    y: 100,
    width: 300,
    height: 200,
    top: 100,
    left: 100,
    right: 400,
    bottom: 300,
    toJSON: () => {},
  }))
})

afterEach(() => {
  Element.prototype.getBoundingClientRect = originalGetBoundingClientRect
})

// ──────────────────────────────────────────────
// Helpers — recupere la carte d'un plan via son
// titre h3 (le bouton englobe le h3 ; on remonte
// jusqu'au <button> ancetre).
// ──────────────────────────────────────────────

function getCartePlanButton(nom) {
  const titre = screen.getByRole('heading', { level: 3, name: nom })
  return titre.closest('button')
}

// ──────────────────────────────────────────────
// Tests — Vue d'ensemble
// ──────────────────────────────────────────────

describe("Cartographie — vue d'ensemble", () => {
  it('rend le titre principal "Cartographie des places"', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Cartographie des places' }),
    ).toBeInTheDocument()
  })

  it('affiche les 6 cartes de plan metier', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Restauration' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Cuisine' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Lingerie' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Technique' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Educatif — Pole enfance-adolescence' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Educatif — Pole adulte' })).toBeInTheDocument()
  })

  it('affiche les 6 plans dans l\'ordre attendu (deux poles Educatif en dernier)', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    const titres = screen
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent)
    expect(titres).toEqual([
      'Restauration',
      'Cuisine',
      'Lingerie',
      'Technique',
      'Educatif — Pole enfance-adolescence',
      'Educatif — Pole adulte',
    ])
  })

  it('chaque carte affiche un decompte de places libres "X place(s) libre(s) sur Y"', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    // 6 cartes => 6 mentions du pattern "place(s) libre(s) sur Y"
    const decomptes = screen.getAllByText(/place[s]? libre[s]? sur \d+/i)
    expect(decomptes.length).toBe(6)
  })

  it('chaque carte affiche un bouton "Ouvrir le plan"', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    expect(screen.getAllByText('Ouvrir le plan')).toHaveLength(6)
  })

  it("le bouton \"Retour a l'accueil\" est present et appelle onGoHome", () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    const bouton = screen.getByRole('button', { name: /Retour a l'accueil/i })
    expect(bouton).toBeInTheDocument()
    fireEvent.click(bouton)
    expect(DEFAULT_PROPS.onGoHome).toHaveBeenCalledTimes(1)
  })

  it('le bouton "Deconnexion" est present et appelle onLogout', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    const bouton = screen.getByRole('button', { name: /Deconnexion/i })
    expect(bouton).toBeInTheDocument()
    fireEvent.click(bouton)
    expect(DEFAULT_PROPS.onLogout).toHaveBeenCalledTimes(1)
  })

  it('affiche la mention "Vue privee — Coordination DFIP"', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    expect(screen.getByText(/Vue privee/i)).toBeInTheDocument()
  })

  it('affiche la note de pied sur la mise a jour automatique Power Automate', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    expect(
      screen.getByText(/Donnees mises a jour automatiquement via Power Automate/i),
    ).toBeInTheDocument()
  })
})

// ──────────────────────────────────────────────
// Tests — Navigation vers le detail
// ──────────────────────────────────────────────

describe('Cartographie — navigation', () => {
  it('cliquer sur une carte de plan ouvre la vue detail', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    fireEvent.click(getCartePlanButton('Restauration'))

    // La vue detail expose un h2 avec le nom du plan en grand
    expect(
      screen.getByRole('heading', { level: 2, name: 'Restauration' }),
    ).toBeInTheDocument()
    // Et le label "Plan metier" au-dessus du titre
    expect(screen.getByText('Plan metier')).toBeInTheDocument()
  })

  it('la vue detail rend une boite role=dialog (overlay modal)', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    fireEvent.click(getCartePlanButton('Cuisine'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('le bouton "Retour aux plans" est present dans la vue detail', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    fireEvent.click(getCartePlanButton('Lingerie'))
    expect(screen.getByRole('button', { name: /Retour aux plans/i })).toBeInTheDocument()
  })

  it('cliquer sur "Retour aux plans" passe l\'overlay en mode fermeture (animation inverse)', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    fireEvent.click(getCartePlanButton('Technique'))

    const dialog = screen.getByRole('dialog')
    // Avant : animation d'entree
    expect(dialog.className).toMatch(/carto-zoom-in/)

    fireEvent.click(screen.getByRole('button', { name: /Retour aux plans/i }))

    // Apres : animation inverse (le demontage final est gere par
    // onAnimationEnd qui n'est pas declenche en JSDOM — on ne le teste pas).
    expect(dialog.className).toMatch(/carto-zoom-out/)
  })

  it("cliquer sur \"Retour a l'accueil\" appelle onGoHome", () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /Retour a l'accueil/i }))
    expect(DEFAULT_PROPS.onGoHome).toHaveBeenCalledTimes(1)
  })

  it('cliquer sur "Deconnexion" appelle onLogout', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /Deconnexion/i }))
    expect(DEFAULT_PROPS.onLogout).toHaveBeenCalledTimes(1)
  })
})

// ──────────────────────────────────────────────
// Tests — Places typees dans la vue detail
// ──────────────────────────────────────────────

describe('Cartographie — places', () => {
  it("dans la vue detail, les libelles de type FPra / AFP-CFC / Stage / CEA sont rendus", () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    fireEvent.click(getCartePlanButton('Restauration'))

    const dialog = screen.getByRole('dialog')
    // Les libelles apparaissent dans les stats du header et la legende
    // Stage s'affiche desormais "Stage/Mes." (stage ou mesure d'orientation)
    expect(within(dialog).getAllByText('FPra').length).toBeGreaterThan(0)
    expect(within(dialog).getAllByText('AFP/CFC').length).toBeGreaterThan(0)
    expect(within(dialog).getAllByText('Stage/Mes.').length).toBeGreaterThan(0)
    expect(within(dialog).getAllByText('CEA').length).toBeGreaterThan(0)
  })

  it('chaque table d\'etablissement a un nom de site visible', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    fireEvent.click(getCartePlanButton('Restauration'))
    const dialog = screen.getByRole('dialog')

    // Restauration touche Minoteries (CBM) et Pinchat (CBP)
    expect(within(dialog).getAllByText('Minoteries').length).toBeGreaterThan(0)
    expect(within(dialog).getAllByText('Pinchat').length).toBeGreaterThan(0)
  })

  it('les sieges des places exposent un aria-label distinguant occupees et libres', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    fireEvent.click(getCartePlanButton('Restauration'))
    const dialog = screen.getByRole('dialog')

    // Au moins une place libre (aria-label commence par "Place X libre")
    const sieges = within(dialog).getAllByRole('button')
    const labels = sieges.map((b) => b.getAttribute('aria-label') || '')
    const occupees = labels.filter((l) => /occupee par/i.test(l))
    // "Place libre —..." (vert) ou "Place libre avec X reservation(s)..." (orange)
    const libres = labels.filter((l) => /^place libre/i.test(l))

    expect(occupees.length).toBeGreaterThan(0)
    expect(libres.length).toBeGreaterThan(0)
  })

  it('chaque table affiche son ratio places libres / total (ex. "3/7")', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    fireEvent.click(getCartePlanButton('Cuisine'))
    const dialog = screen.getByRole('dialog')
    // Le badge ratio "X/Y" apparait sur chaque table
    const ratios = within(dialog).getAllByText(/^\d+\/\d+$/)
    expect(ratios.length).toBeGreaterThan(0)
  })
})

// ──────────────────────────────────────────────
// Tests — Plan Educatif (deux poles)
// ──────────────────────────────────────────────

describe('Cartographie — educatif', () => {
  it('le plan Pole enfance-adolescence rend des tables de Chambesy et Lancy', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    fireEvent.click(getCartePlanButton('Educatif — Pole enfance-adolescence'))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getAllByText('Chambesy').length).toBeGreaterThan(0)
    expect(within(dialog).getAllByText('Lancy').length).toBeGreaterThan(0)
  })

  it('le plan Pole adulte rend des tables de Gradelle', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    fireEvent.click(getCartePlanButton('Educatif — Pole adulte'))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getAllByText('Gradelle').length).toBeGreaterThan(0)
  })

  it('les poles educatif affichent les types App.non-DFIP et MSP/MSTS', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    fireEvent.click(getCartePlanButton('Educatif — Pole enfance-adolescence'))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getAllByText('App.non-DFIP').length).toBeGreaterThan(0)
    expect(within(dialog).getAllByText('MSP/MSTS').length).toBeGreaterThan(0)
  })

  it('un plan non-educatif n\'affiche pas les types App.non-DFIP ni MSP/MSTS', () => {
    render(<Cartographie {...DEFAULT_PROPS} />)
    fireEvent.click(getCartePlanButton('Cuisine'))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).queryByText('App.non-DFIP')).not.toBeInTheDocument()
    expect(within(dialog).queryByText('MSP/MSTS')).not.toBeInTheDocument()
  })
})
