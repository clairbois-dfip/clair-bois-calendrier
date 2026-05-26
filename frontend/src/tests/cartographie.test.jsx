/**
 * Tests unitaires — Composant Cartographie (refonte plans metiers 19 mai 2026).
 *
 * Verifie le rendu de la vue d'ensemble (9 plans), la navigation
 * vers la vue detail d'un plan, le rendu des places typees,
 * le 4e etat gris (indisponible), la bulle commentaire et
 * les deux poles du plan Educatif.
 *
 * Le composant charge carto.json via fetch — ce module est mocke
 * avant chaque test via `global.fetch`. Les assertions utilisent
 * `waitFor` pour attendre la resolution de la promesse.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within, waitFor, act } from '@testing-library/react'
import Cartographie from '../components/Cartographie'
import cartoData from '../../public/carto.json'

// ──────────────────────────────────────────────
// Props par defaut
// ──────────────────────────────────────────────

const DEFAULT_PROPS = {
  onGoHome: vi.fn(),
  onLogout: vi.fn(),
}

// ──────────────────────────────────────────────
// Mock fetch + getBoundingClientRect
// ──────────────────────────────────────────────

let originalGetBoundingClientRect

beforeEach(() => {
  DEFAULT_PROPS.onGoHome.mockClear()
  DEFAULT_PROPS.onLogout.mockClear()

  // Mock fetch pour retourner le vrai carto.json
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => cartoData,
  })

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
  vi.clearAllMocks()
})

// ──────────────────────────────────────────────
// Helper — rendu + attente du chargement
// ──────────────────────────────────────────────

async function renderCarto() {
  render(<Cartographie {...DEFAULT_PROPS} />)
  // Attend que le premier plan soit visible (fin du chargement)
  await waitFor(() => screen.getByRole('heading', { level: 3, name: /Restauration/i }))
}

function getCartePlanButton(nom) {
  const titre = screen.getByRole('heading', { level: 3, name: nom })
  return titre.closest('button')
}

// ──────────────────────────────────────────────
// Tests — Vue d'ensemble
// ──────────────────────────────────────────────

describe("Cartographie — vue d'ensemble", () => {
  it('rend le titre principal "Cartographie des places"', async () => {
    await renderCarto()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Cartographie des places' }),
    ).toBeInTheDocument()
  })

  it('affiche les 9 cartes de plan metier', async () => {
    await renderCarto()
    expect(screen.getByRole('heading', { level: 3, name: /Restauration/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Boulangerie/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Cuisine/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Lingerie/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Services/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Multim/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Administration/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /enfance/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /adulte/i })).toBeInTheDocument()
  })

  it('affiche les 9 plans dans l\'ordre attendu', async () => {
    await renderCarto()
    const titres = screen
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent)
    expect(titres).toEqual([
      'Restauration',
      'Boulangerie / Pâtisserie',
      'Cuisine',
      'Lingerie et Confection',
      'Services Généraux',
      'Multimédia',
      'Administration et Informatique',
      'Éducatif — Pôle enfance-adolescence',
      'Éducatif — Pôle adulte',
    ])
  })

  it('chaque carte affiche un decompte de places libres "X place(s) libre(s) sur Y"', async () => {
    await renderCarto()
    const decomptes = screen.getAllByText(/place[s]? libre[s]? sur \d+/i)
    expect(decomptes.length).toBe(9)
  })

  it('chaque carte affiche un bouton "Ouvrir le plan"', async () => {
    await renderCarto()
    expect(screen.getAllByText('Ouvrir le plan')).toHaveLength(9)
  })

  it("le bouton \"Retour a l'accueil\" est present et appelle onGoHome", async () => {
    await renderCarto()
    const bouton = screen.getByRole('button', { name: /Retour.*accueil/i })
    expect(bouton).toBeInTheDocument()
    fireEvent.click(bouton)
    expect(DEFAULT_PROPS.onGoHome).toHaveBeenCalledTimes(1)
  })

  it('le bouton "Deconnexion" est present et appelle onLogout', async () => {
    await renderCarto()
    const bouton = screen.getByRole('button', { name: /connexion/i })
    expect(bouton).toBeInTheDocument()
    fireEvent.click(bouton)
    expect(DEFAULT_PROPS.onLogout).toHaveBeenCalledTimes(1)
  })

  it('affiche la mention "Vue privee — Coordination DFIP"', async () => {
    await renderCarto()
    expect(screen.getByText(/Coordination DFIP/i)).toBeInTheDocument()
  })

  it('affiche la note de pied sur la mise a jour automatique Power Automate', async () => {
    await renderCarto()
    expect(screen.getByText(/Power Automate/i)).toBeInTheDocument()
  })
})

// ──────────────────────────────────────────────
// Tests — Navigation vers le detail
// ──────────────────────────────────────────────

describe('Cartographie — navigation', () => {
  it('cliquer sur une carte de plan ouvre la vue detail', async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Restauration'))

    expect(
      screen.getByRole('heading', { level: 2, name: 'Restauration' }),
    ).toBeInTheDocument()
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText(/Plan m.tier/i)).toBeInTheDocument()
  })

  it('la vue detail rend une boite role=dialog (overlay modal)', async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Cuisine'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('le bouton "Retour aux plans" est present dans la vue detail', async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Lingerie et Confection'))
    expect(screen.getByRole('button', { name: /Retour aux plans/i })).toBeInTheDocument()
  })

  it('cliquer sur "Retour aux plans" passe l\'overlay en mode fermeture', async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Services Généraux'))

    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toMatch(/carto-zoom-in/)

    fireEvent.click(screen.getByRole('button', { name: /Retour aux plans/i }))
    expect(dialog.className).toMatch(/carto-zoom-out/)
  })

  it("cliquer sur \"Retour a l'accueil\" appelle onGoHome", async () => {
    await renderCarto()
    fireEvent.click(screen.getByRole('button', { name: /Retour.*accueil/i }))
    expect(DEFAULT_PROPS.onGoHome).toHaveBeenCalledTimes(1)
  })

  it('cliquer sur "Deconnexion" appelle onLogout', async () => {
    await renderCarto()
    fireEvent.click(screen.getByRole('button', { name: /connexion/i }))
    expect(DEFAULT_PROPS.onLogout).toHaveBeenCalledTimes(1)
  })
})

// ──────────────────────────────────────────────
// Tests — Places typees dans la vue detail
// ──────────────────────────────────────────────

describe('Cartographie — places', () => {
  it("dans la vue detail Restauration, les libelles FPra / AFP-CFC / Stage/Mes. / CEA sont rendus", async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Restauration'))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getAllByText('FPra').length).toBeGreaterThan(0)
    expect(within(dialog).getAllByText('AFP/CFC').length).toBeGreaterThan(0)
    expect(within(dialog).getAllByText('Stage/Mes.').length).toBeGreaterThan(0)
    expect(within(dialog).getAllByText('CEA').length).toBeGreaterThan(0)
  })

  it('Restauration affiche Minoteries et Pinchat', async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Restauration'))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getAllByText('Minoteries').length).toBeGreaterThan(0)
    expect(within(dialog).getAllByText('Pinchat').length).toBeGreaterThan(0)
  })

  it('Boulangerie / Patisserie affiche Pain Chat et Boulangerie (Pinchat + Minoteries)', async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Boulangerie / Pâtisserie'))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getAllByText('Pinchat').length).toBeGreaterThan(0)
    expect(within(dialog).getAllByText('Minoteries').length).toBeGreaterThan(0)
  })

  it('chaque table affiche son ratio places libres / total (ex. "3/7")', async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Cuisine'))
    const dialog = screen.getByRole('dialog')
    const ratios = within(dialog).getAllByText(/^\d+\/\d+$/)
    expect(ratios.length).toBeGreaterThan(0)
  })

  it('Multimedia affiche les secteurs officiels Minoteries (EXECO, Atypique)', async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Multimédia'))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getByText('EXECO')).toBeInTheDocument()
    expect(within(dialog).getByText('Atypique')).toBeInTheDocument()
  })

  it('Administration et Informatique affiche Tourbillon', async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Administration et Informatique'))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getAllByText('Tourbillon').length).toBeGreaterThan(0)
  })
})

// ──────────────────────────────────────────────
// Tests — Etat gris (indisponible)
// ──────────────────────────────────────────────

describe('Cartographie — etat gris (indisponible)', () => {
  it('une place indisponible a un aria-label contenant "indisponible"', async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Boulangerie / Pâtisserie'))
    const dialog = screen.getByRole('dialog')

    const sieges = within(dialog).getAllByRole('button')
    const labels = sieges.map((b) => b.getAttribute('aria-label') || '')
    const indisponibles = labels.filter((l) => /indisponible/i.test(l))

    expect(indisponibles.length).toBeGreaterThan(0)
  })

  it('la legende inclut l\'entree "Indisponible"', async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Boulangerie / Pâtisserie'))

    expect(screen.getByText('Indisponible')).toBeInTheDocument()
  })
})

// ──────────────────────────────────────────────
// Tests — Bulle commentaire sur la table
// ──────────────────────────────────────────────

describe('Cartographie — bulle commentaire', () => {
  it('une table avec commentaire affiche le badge aria-label "Note :"', async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Boulangerie / Pâtisserie'))
    const dialog = screen.getByRole('dialog')

    // La table Boulangerie Minoteries a un commentaire dans carto.json
    const badge = within(dialog).getByLabelText(/^Note\s*:/i)
    expect(badge).toBeInTheDocument()
  })
})

// ──────────────────────────────────────────────
// Tests — Plan Educatif (deux poles)
// ──────────────────────────────────────────────

describe('Cartographie — educatif', () => {
  it('le plan Pole enfance-adolescence rend des tables de Chambesy et Lancy', async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Éducatif — Pôle enfance-adolescence'))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getAllByText('Chambézy').length).toBeGreaterThan(0)
    expect(within(dialog).getAllByText('Lancy').length).toBeGreaterThan(0)
  })

  it('le plan Pole adulte rend des tables de Gradelle', async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Éducatif — Pôle adulte'))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getAllByText('Gradelle').length).toBeGreaterThan(0)
  })

  it('le plan Pole adulte rend CB2000 (nouvel etablissement)', async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Éducatif — Pôle adulte'))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getAllByText('CB2000').length).toBeGreaterThan(0)
  })

  it('les poles educatif affichent les types App.non-DFIP et MSP/MSTS', async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Éducatif — Pôle enfance-adolescence'))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getAllByText('App.non-DFIP').length).toBeGreaterThan(0)
    expect(within(dialog).getAllByText('MSP/MSTS').length).toBeGreaterThan(0)
  })

  it('un plan non-educatif n\'affiche pas les types App.non-DFIP ni MSP/MSTS', async () => {
    await renderCarto()
    fireEvent.click(getCartePlanButton('Cuisine'))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).queryByText('App.non-DFIP')).not.toBeInTheDocument()
    expect(within(dialog).queryByText('MSP/MSTS')).not.toBeInTheDocument()
  })
})
