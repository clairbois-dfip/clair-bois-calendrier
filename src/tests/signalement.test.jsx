/**
 * Tests unitaires — Composant FormulaireSignalement.
 *
 * Verifie le rendu, la validation des champs, la soumission
 * et l'affichage de la confirmation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FormulaireSignalement from '../components/FormulaireSignalement'

const DEFAULT_PROPS = {
  onGoHome: vi.fn(),
}

// ──────────────────────────────────────────────
// Tests — Rendu initial
// ──────────────────────────────────────────────

describe('FormulaireSignalement — rendu', () => {
  it('affiche le titre du formulaire', () => {
    render(<FormulaireSignalement {...DEFAULT_PROPS} />)
    expect(screen.getByText('Signaler une annulation ou un retard')).toBeInTheDocument()
  })

  it('affiche les champs obligatoires', () => {
    render(<FormulaireSignalement {...DEFAULT_PROPS} />)
    expect(screen.getByLabelText(/Nom/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Prénom/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Téléphone/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Motif/)).toBeInTheDocument()
  })

  it('affiche le champ commentaire facultatif', () => {
    render(<FormulaireSignalement {...DEFAULT_PROPS} />)
    expect(screen.getByLabelText(/Commentaire/)).toBeInTheDocument()
  })

  it('affiche le bouton d\'envoi', () => {
    render(<FormulaireSignalement {...DEFAULT_PROPS} />)
    expect(screen.getByText('Envoyer le signalement')).toBeInTheDocument()
  })

  it('affiche le bouton retour a l\'accueil', () => {
    render(<FormulaireSignalement {...DEFAULT_PROPS} />)
    expect(screen.getByText("Retour à l'accueil")).toBeInTheDocument()
  })
})

// ──────────────────────────────────────────────
// Tests — Validation
// ──────────────────────────────────────────────

describe('FormulaireSignalement — validation', () => {
  it('affiche des erreurs si le formulaire est soumis vide', () => {
    render(<FormulaireSignalement {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByText('Envoyer le signalement'))
    // Au moins les champs obligatoires doivent afficher une erreur
    expect(screen.getAllByText(/obligatoire|requis/i).length).toBeGreaterThan(0)
  })

  it('valide le champ nom au blur', () => {
    render(<FormulaireSignalement {...DEFAULT_PROPS} />)
    const nomInput = screen.getByLabelText(/^Nom/)
    fireEvent.focus(nomInput)
    fireEvent.blur(nomInput)
    expect(screen.getByText(/obligatoire|requis/i)).toBeInTheDocument()
  })
})

// ──────────────────────────────────────────────
// Tests — Saisie
// ──────────────────────────────────────────────

describe('FormulaireSignalement — saisie', () => {
  it('permet de remplir le nom et le prenom', () => {
    render(<FormulaireSignalement {...DEFAULT_PROPS} />)
    const nomInput = screen.getByLabelText(/^Nom/)
    const prenomInput = screen.getByLabelText(/Prénom/)
    fireEvent.change(nomInput, { target: { value: 'Dupont' } })
    fireEvent.change(prenomInput, { target: { value: 'Marie' } })
    expect(nomInput.value).toBe('Dupont')
    expect(prenomInput.value).toBe('Marie')
  })

  it('permet de selectionner un motif', () => {
    render(<FormulaireSignalement {...DEFAULT_PROPS} />)
    const motifSelect = screen.getByLabelText(/Motif/)
    fireEvent.change(motifSelect, { target: { value: 'Annulation' } })
    expect(motifSelect.value).toBe('Annulation')
  })
})

// ──────────────────────────────────────────────
// Tests — Soumission
// ──────────────────────────────────────────────

describe('FormulaireSignalement — soumission', () => {
  function fillForm() {
    const nomInput = screen.getByLabelText(/^Nom/)
    const prenomInput = screen.getByLabelText(/Prénom/)
    const telInput = screen.getByLabelText(/Téléphone/)
    const emailInput = screen.getByLabelText(/Email/)
    const motifSelect = screen.getByLabelText(/Motif/)

    fireEvent.change(nomInput, { target: { value: 'Dupont' } })
    fireEvent.change(prenomInput, { target: { value: 'Marie' } })
    fireEvent.change(telInput, { target: { value: '+41 79 123 45 67' } })
    fireEvent.change(emailInput, { target: { value: 'marie@test.ch' } })
    fireEvent.change(motifSelect, { target: { value: 'Annulation' } })
  }

  it('affiche la confirmation apres envoi reussi (mode demo)', async () => {
    render(<FormulaireSignalement {...DEFAULT_PROPS} />)
    fillForm()
    fireEvent.click(screen.getByText('Envoyer le signalement'))

    await waitFor(() => {
      expect(screen.getByText(/envoyée avec succès/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('appelle onGoHome depuis la confirmation', async () => {
    const onGoHome = vi.fn()
    render(<FormulaireSignalement onGoHome={onGoHome} />)
    fillForm()
    fireEvent.click(screen.getByText('Envoyer le signalement'))

    await waitFor(() => {
      expect(screen.getByText(/envoyée avec succès/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    fireEvent.click(screen.getByText("Retour à l'accueil"))
    expect(onGoHome).toHaveBeenCalled()
  })
})

// ──────────────────────────────────────────────
// Tests — Navigation
// ──────────────────────────────────────────────

describe('FormulaireSignalement — navigation', () => {
  it('appelle onGoHome au clic sur le bouton retour', () => {
    const onGoHome = vi.fn()
    render(<FormulaireSignalement onGoHome={onGoHome} />)
    // Le premier bouton "Retour" est celui en haut du formulaire
    const retourButtons = screen.getAllByText("Retour à l'accueil")
    fireEvent.click(retourButtons[0])
    expect(onGoHome).toHaveBeenCalled()
  })
})
