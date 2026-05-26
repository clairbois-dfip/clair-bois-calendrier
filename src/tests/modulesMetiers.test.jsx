/**
 * Tests unitaires — Composant ModulesMetiers.
 *
 * Verifie le flow : selection de semaine → affichage de la grille
 * des modules → selection / deselection → inscription.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ModulesMetiers from '../components/ModulesMetiers'

// ──────────────────────────────────────────────
// Donnees de test
// ──────────────────────────────────────────────

/** Semaines disponibles — une passee (trop proche), deux futures */
const SEMAINES = [
  { semaine: 11, annee: 2026, dateDebut: '2026-03-09', dateFin: '2026-03-13' },
  { semaine: 40, annee: 2026, dateDebut: '2026-09-28', dateFin: '2026-10-02' },
  { semaine: 44, annee: 2026, dateDebut: '2026-10-26', dateFin: '2026-10-30' },
]

/** Modules metiers representant une semaine type */
const MODULES = [
  { nom: 'Cuisine', site: 'CBP', jour: 'lundi', heureDebut: '08:00', heureFin: '11:00', placesTotal: 3, placesUtilisees: 0, couleur: '#e67e22' },
  { nom: 'Lingerie', site: 'CBL', jour: 'mardi', heureDebut: '08:00', heureFin: '11:00', placesTotal: 2, placesUtilisees: 1, couleur: '#8e44ad' },
  { nom: 'Nettoyage', site: 'CBM', jour: 'jeudi', heureDebut: '08:00', heureFin: '11:00', placesTotal: 2, placesUtilisees: 2, couleur: '#e74c3c' },
]

const DEFAULT_PROPS = {
  modulesMetiers: {
    modules: MODULES,
    semaines: SEMAINES,
    maxSelection: 3,
    formsUrlModules: 'https://forms.example.com',
  },
  formsUrl: 'https://forms.example.com',
  chemin: null,
  onBack: vi.fn(),
  onGoToFormulaire: vi.fn(),
}

// ──────────────────────────────────────────────
// Tests — Selection de semaine
// ──────────────────────────────────────────────

describe('ModulesMetiers — selection de semaine', () => {
  it('affiche les semaines disponibles au chargement', () => {
    render(<ModulesMetiers {...DEFAULT_PROPS} />)
    expect(screen.getByText('Semaine 11')).toBeInTheDocument()
    expect(screen.getByText('Semaine 40')).toBeInTheDocument()
    expect(screen.getByText('Semaine 44')).toBeInTheDocument()
  })

  it('n\'affiche pas la grille des modules avant la selection d\'une semaine', () => {
    render(<ModulesMetiers {...DEFAULT_PROPS} />)
    expect(screen.queryByText('Cuisine')).not.toBeInTheDocument()
    expect(screen.queryByText('Lingerie')).not.toBeInTheDocument()
  })

  it('affiche le message d\'instruction pour choisir une semaine', () => {
    render(<ModulesMetiers {...DEFAULT_PROPS} />)
    expect(screen.getByText(/Choisissez d\u2019abord une semaine/)).toBeInTheDocument()
  })

  it('desactive les semaines trop proches (delai J-7)', () => {
    render(<ModulesMetiers {...DEFAULT_PROPS} />)
    const sem11Button = screen.getByText('Semaine 11').closest('button')
    expect(sem11Button).toBeDisabled()
  })

  it('permet de cliquer sur une semaine future valide', () => {
    render(<ModulesMetiers {...DEFAULT_PROPS} />)
    const sem40Button = screen.getByText('Semaine 40').closest('button')
    expect(sem40Button).not.toBeDisabled()
  })
})

// ──────────────────────────────────────────────
// Tests — Affichage des modules apres selection de semaine
// ──────────────────────────────────────────────

describe('ModulesMetiers — grille des modules', () => {
  it('affiche la grille apres selection d\'une semaine', () => {
    render(<ModulesMetiers {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByText('Semaine 40').closest('button'))
    // Les noms apparaissent dans la grille et dans la legende
    expect(screen.getAllByText('Cuisine').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Lingerie').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Nettoyage').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche les places restantes sur chaque module', () => {
    render(<ModulesMetiers {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByText('Semaine 40').closest('button'))
    expect(screen.getByText('Places restantes : 3')).toBeInTheDocument()
    expect(screen.getByText('Place restante : 1')).toBeInTheDocument()
  })

  it('met a jour le sous-titre avec le numero de semaine', () => {
    render(<ModulesMetiers {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByText('Semaine 40').closest('button'))
    expect(screen.getByText(/Sélectionnez 1 à 3 modules pour la semaine 40/)).toBeInTheDocument()
  })
})

// ──────────────────────────────────────────────
// Tests — Selection et deselection de modules
// ──────────────────────────────────────────────

describe('ModulesMetiers — selection de modules', () => {
  function renderWithWeek() {
    const result = render(<ModulesMetiers {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByText('Semaine 40').closest('button'))
    return result
  }

  it('selectionne un module au clic', () => {
    renderWithWeek()
    const cuisineBtn = screen.getByTitle(/Cuisine — CBP/)
    fireEvent.click(cuisineBtn)
    expect(screen.getByText(/1\/3 module sélectionné/)).toBeInTheDocument()
    expect(screen.getByText(/Cuisine \(CBP\) — S40/)).toBeInTheDocument()
  })

  it('deselectionne un module au second clic', () => {
    renderWithWeek()
    const cuisineBtn = screen.getByTitle(/Cuisine — CBP/)
    fireEvent.click(cuisineBtn)
    fireEvent.click(cuisineBtn)
    expect(screen.getByText('Cliquez sur un module pour le sélectionner')).toBeInTheDocument()
  })

  it('permet de selectionner plusieurs modules', () => {
    renderWithWeek()
    fireEvent.click(screen.getByTitle(/Cuisine — CBP/))
    fireEvent.click(screen.getByTitle(/Lingerie — CBL/))
    expect(screen.getByText(/2\/3 modules sélectionnés/)).toBeInTheDocument()
  })

  it('affiche le bouton S\'inscrire quand un module est selectionne', () => {
    renderWithWeek()
    expect(screen.queryByText("S'inscrire")).not.toBeInTheDocument()
    fireEvent.click(screen.getByTitle(/Cuisine — CBP/))
    expect(screen.getByText("S'inscrire")).toBeInTheDocument()
  })

  it('appelle onGoToFormulaire avec les modules selectionnes', () => {
    const onGoToFormulaire = vi.fn()
    render(<ModulesMetiers {...DEFAULT_PROPS} onGoToFormulaire={onGoToFormulaire} />)
    fireEvent.click(screen.getByText('Semaine 40').closest('button'))
    fireEvent.click(screen.getByTitle(/Cuisine — CBP/))
    fireEvent.click(screen.getByText("S'inscrire"))
    expect(onGoToFormulaire).toHaveBeenCalledWith({
      modules: [
        expect.objectContaining({
          mod: expect.objectContaining({ nom: 'Cuisine', site: 'CBP' }),
          semaine: expect.objectContaining({ semaine: 40 }),
        }),
      ],
    })
  })

  it('retire un module via le bouton de suppression dans la barre', () => {
    renderWithWeek()
    fireEvent.click(screen.getByTitle(/Cuisine — CBP/))
    const retirer = screen.getByRole('button', { name: /Retirer Cuisine/ })
    fireEvent.click(retirer)
    expect(screen.queryByText(/Cuisine \(CBP\) — S40/)).not.toBeInTheDocument()
  })
})

// ──────────────────────────────────────────────
// Tests — Navigation
// ──────────────────────────────────────────────

describe('ModulesMetiers — navigation', () => {
  it('appelle onBack au clic sur le bouton retour', () => {
    const onBack = vi.fn()
    render(<ModulesMetiers {...DEFAULT_PROPS} onBack={onBack} />)
    fireEvent.click(screen.getByText("Retour à l'accueil"))
    expect(onBack).toHaveBeenCalled()
  })

  it('permet de changer de semaine apres selection', () => {
    render(<ModulesMetiers {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByText('Semaine 40').closest('button'))
    expect(screen.getByText(/semaine 40/)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Semaine 44').closest('button'))
    expect(screen.getByText(/semaine 44/)).toBeInTheDocument()
  })
})
