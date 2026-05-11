/**
 * Tests unitaires — Composants du formulaire Clair-Bois.
 *
 * Teste le rendu de chaque étape avec données falsifiées,
 * les conditions d'affichage, et la navigation.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EtapeStagiaire from '../components/formulaire/EtapeStagiaire'
import EtapeCuratelle from '../components/formulaire/EtapeCuratelle'
import EtapeUrgence from '../components/formulaire/EtapeUrgence'
import EtapeAI from '../components/formulaire/EtapeAI'
import EtapeReferent from '../components/formulaire/EtapeReferent'
import EtapeComplementaire from '../components/formulaire/EtapeComplementaire'
import EtapeDeclaration from '../components/formulaire/EtapeDeclaration'
import ChampFormulaire from '../components/formulaire/ChampFormulaire'
import { INITIAL_DATA } from '../utils/formConfig'

// ──────────────────────────────────────────────
// Données de test falsifiées — Stagiaire complet
// ──────────────────────────────────────────────
const FAKE_STAGIAIRE = {
  ...INITIAL_DATA,
  nom: 'Dupont',
  prenom: 'Marie',
  sexe: 'Féminin',
  date_naissance: '1998-03-15',
  avs: '756.1234.5678.97',
  tel: '+41 79 123 45 67',
  email: 'marie.dupont@gmail.com',
  adresse: 'Rue de Carouge 42',
  npa: '1205',
  formation: 'Oui, cette année',
}

const FAKE_REFERENT = {
  ...INITIAL_DATA,
  referent_partenaire: 'SGIPA',
  referent_nom: 'Martin',
  referent_prenom: 'Pierre',
  referent_tel: '+41 22 345 67 89',
  referent_email: 'p.martin@sgipa.ch',
  referent_fonction: 'Éducateur·trice',
}

const FAKE_CURATELLE_OUI = {
  ...INITIAL_DATA,
  sous_curatelle: 'Oui',
  curatelle_type: 'OPAD',
  curatelle_nom: 'Muller',
  curatelle_prenom: 'Anna',
  curatelle_tel: '+41 22 111 22 33',
  curatelle_email: 'anna.muller@opad.ch',
}

const FAKE_AI_OUI = {
  ...INITIAL_DATA,
  inscrit_ai: 'Oui',
  ai_nom: 'Bernasconi',
  ai_prenom: 'Luca',
  ai_tel: '+41 58 462 00 00',
  ai_email: 'l.bernasconi@oai-ge.ch',
  ai_office: 'OAI Genève',
  ai_mesure: 'Mesure de réinsertion',
}

const noop = () => {}
const mockOnChange = vi.fn()
const mockOnBlur = vi.fn()

// ──────────────────────────────────────────────
// ChampFormulaire
// ──────────────────────────────────────────────
describe('ChampFormulaire', () => {
  it('affiche le label et le champ text', () => {
    render(<ChampFormulaire label="Nom" name="nom" value="" onChange={noop} />)
    expect(screen.getByLabelText(/Nom/)).toBeInTheDocument()
  })

  it('affiche l\'astérisque quand required', () => {
    render(<ChampFormulaire label="Nom" name="nom" value="" onChange={noop} required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('affiche le message d\'erreur', () => {
    render(<ChampFormulaire label="Nom" name="nom" value="" onChange={noop} error="Ce champ est obligatoire." />)
    expect(screen.getByText('Ce champ est obligatoire.')).toBeInTheDocument()
  })

  it('affiche le helpText', () => {
    render(<ChampFormulaire label="AVS" name="avs" value="" onChange={noop} helpText="13 chiffres" />)
    expect(screen.getByText('13 chiffres')).toBeInTheDocument()
  })

  it('rend un select avec les options', () => {
    render(
      <ChampFormulaire
        label="Sexe" name="sexe" type="select" value="" onChange={noop}
        options={[{ value: 'Masculin', label: 'Masculin' }, { value: 'Féminin', label: 'Féminin' }]}
      />
    )
    expect(screen.getByText('Masculin')).toBeInTheDocument()
    expect(screen.getByText('Féminin')).toBeInTheDocument()
  })

  it('rend des radio-group', () => {
    render(
      <ChampFormulaire
        label="Choix" name="choix" type="radio-group" value="" onChange={noop}
        options={[{ value: 'A', label: 'Option A' }, { value: 'B', label: 'Option B' }]}
      />
    )
    expect(screen.getByText('Option A')).toBeInTheDocument()
    expect(screen.getByText('Option B')).toBeInTheDocument()
  })

  it('appelle onChange avec le bon name et value', () => {
    render(<ChampFormulaire label="Nom" name="nom" value="" onChange={mockOnChange} />)
    fireEvent.change(screen.getByLabelText(/Nom/), { target: { value: 'Dupont' } })
    expect(mockOnChange).toHaveBeenCalledWith('nom', 'Dupont')
  })
})

// ──────────────────────────────────────────────
// EtapeStagiaire
// ──────────────────────────────────────────────
describe('EtapeStagiaire', () => {
  it('affiche tous les champs en version complète', () => {
    const { container } = render(<EtapeStagiaire data={INITIAL_DATA} errors={{}} onChange={noop} onBlur={noop} />)
    expect(container.querySelector('#nom')).toBeInTheDocument()
    expect(container.querySelector('#prenom')).toBeInTheDocument()
    expect(screen.getByText('Masculin')).toBeInTheDocument()
    expect(screen.getByText('Féminin')).toBeInTheDocument()
    expect(container.querySelector('#date_naissance')).toBeInTheDocument()
    expect(container.querySelector('#avs')).toBeInTheDocument()
    expect(container.querySelector('#tel')).toBeInTheDocument()
    expect(container.querySelector('#email')).toBeInTheDocument()
    expect(container.querySelector('#adresse')).toBeInTheDocument()
    expect(container.querySelector('#npa')).toBeInTheDocument()
    expect(container.querySelector('#formation')).toBeInTheDocument()
  })

  it('n\'affiche PAS "Autre" dans les options de sexe', () => {
    render(<EtapeStagiaire data={INITIAL_DATA} errors={{}} onChange={noop} onBlur={noop} />)
    expect(screen.queryByText('Autre')).not.toBeInTheDocument()
  })

  it('affiche la version retour avec tél et email', () => {
    const { container } = render(<EtapeStagiaire data={INITIAL_DATA} errors={{}} onChange={noop} onBlur={noop} isRetour />)
    expect(container.querySelector('#nom')).toBeInTheDocument()
    expect(container.querySelector('#avs')).toBeInTheDocument()
    expect(container.querySelector('#tel')).toBeInTheDocument()
    expect(container.querySelector('#email')).toBeInTheDocument()
    // Ne doit PAS avoir adresse, NPA, formation
    expect(container.querySelector('#adresse')).not.toBeInTheDocument()
    expect(container.querySelector('#npa')).not.toBeInTheDocument()
  })

  it('formation est un select (pas un champ texte)', () => {
    render(<EtapeStagiaire data={INITIAL_DATA} errors={{}} onChange={noop} onBlur={noop} />)
    expect(screen.getByText('Oui, cette année')).toBeInTheDocument()
    expect(screen.getByText("Oui, l'année prochaine")).toBeInTheDocument()
  })
})

// ──────────────────────────────────────────────
// EtapeCuratelle
// ──────────────────────────────────────────────
describe('EtapeCuratelle', () => {
  it('affiche Oui/Non pour pourQui=moi', () => {
    render(<EtapeCuratelle data={INITIAL_DATA} errors={{}} onChange={noop} onBlur={noop} pourQui="moi" />)
    expect(screen.getByText('Oui')).toBeInTheDocument()
    expect(screen.getByText('Non')).toBeInTheDocument()
    expect(screen.queryByText(/curateur qui complète/)).not.toBeInTheDocument()
  })

  it('affiche 3 options pour pourQui=autre', () => {
    render(<EtapeCuratelle data={INITIAL_DATA} errors={{}} onChange={noop} onBlur={noop} pourQui="autre" />)
    expect(screen.getByText('Oui')).toBeInTheDocument()
    expect(screen.getByText('Non')).toBeInTheDocument()
    expect(screen.getByText(/curateur qui complète/)).toBeInTheDocument()
  })

  it('affiche les champs curateur si sous_curatelle=Oui', () => {
    render(<EtapeCuratelle data={FAKE_CURATELLE_OUI} errors={{}} onChange={noop} onBlur={noop} />)
    expect(screen.getByText('Informations du curateur ou de la curatrice')).toBeInTheDocument()
    expect(screen.getByText('OPAD')).toBeInTheDocument()
  })

  it('cache les champs curateur si sous_curatelle=Non', () => {
    const data = { ...INITIAL_DATA, sous_curatelle: 'Non' }
    render(<EtapeCuratelle data={data} errors={{}} onChange={noop} onBlur={noop} />)
    expect(screen.queryByText('Informations du curateur ou de la curatrice')).not.toBeInTheDocument()
    expect(screen.getByText(/Pas de curatelle/)).toBeInTheDocument()
  })

  it('affiche les champs si curateur complète', () => {
    const data = { ...INITIAL_DATA, sous_curatelle: 'Oui - curateur complète' }
    render(<EtapeCuratelle data={data} errors={{}} onChange={noop} onBlur={noop} />)
    expect(screen.getByText('Informations du curateur ou de la curatrice')).toBeInTheDocument()
  })
})

// ──────────────────────────────────────────────
// EtapeUrgence
// ──────────────────────────────────────────────
describe('EtapeUrgence', () => {
  it('affiche les bons choix de lien', () => {
    render(<EtapeUrgence data={INITIAL_DATA} errors={{}} onChange={noop} onBlur={noop} />)
    expect(screen.getByText('Père')).toBeInTheDocument()
    expect(screen.getByText('Mère')).toBeInTheDocument()
    expect(screen.getByText('Soeur')).toBeInTheDocument()
    expect(screen.getByText('Frère')).toBeInTheDocument()
    expect(screen.getByText('Epoux·se')).toBeInTheDocument()
    expect(screen.getByText('Ami·e')).toBeInTheDocument()
    // Ne doit PAS avoir les anciens choix
    expect(screen.queryByText('Parent')).not.toBeInTheDocument()
    expect(screen.queryByText('Conjoint·e')).not.toBeInTheDocument()
    expect(screen.queryByText('Tuteur·rice')).not.toBeInTheDocument()
  })
})

// ──────────────────────────────────────────────
// EtapeAI
// ──────────────────────────────────────────────
describe('EtapeAI', () => {
  it('affiche Oui/Non/Demande pour pourQui=moi', () => {
    render(<EtapeAI data={INITIAL_DATA} errors={{}} onChange={noop} onBlur={noop} pourQui="moi" />)
    expect(screen.getByText('Oui')).toBeInTheDocument()
    expect(screen.getByText('Non')).toBeInTheDocument()
    expect(screen.getByText('Demande en cours')).toBeInTheDocument()
    expect(screen.queryByText(/conseiller AI qui complète/)).not.toBeInTheDocument()
  })

  it('affiche 4 options pour pourQui=autre', () => {
    render(<EtapeAI data={INITIAL_DATA} errors={{}} onChange={noop} onBlur={noop} pourQui="autre" />)
    expect(screen.getByText(/conseiller AI qui complète/)).toBeInTheDocument()
    expect(screen.getByText('Demande en cours')).toBeInTheDocument()
  })

  it('affiche les champs conseiller si inscrit_ai=Oui', () => {
    render(<EtapeAI data={FAKE_AI_OUI} errors={{}} onChange={noop} onBlur={noop} />)
    expect(screen.getByText('Coordonnées du conseiller·ère AI')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Bernasconi')).toBeInTheDocument()
  })

  it('cache les champs si inscrit_ai=Non', () => {
    const data = { ...INITIAL_DATA, inscrit_ai: 'Non' }
    render(<EtapeAI data={data} errors={{}} onChange={noop} onBlur={noop} />)
    expect(screen.queryByText('Coordonnées du conseiller·ère AI')).not.toBeInTheDocument()
    expect(screen.getByText(/Pas d'AI/)).toBeInTheDocument()
  })

  it('affiche les champs si Demande en cours', () => {
    const data = { ...INITIAL_DATA, inscrit_ai: 'Demande en cours' }
    render(<EtapeAI data={data} errors={{}} onChange={noop} onBlur={noop} />)
    expect(screen.getByText('Coordonnées du conseiller·ère AI')).toBeInTheDocument()
  })

  it('affiche les champs si conseiller AI complète', () => {
    const data = { ...INITIAL_DATA, inscrit_ai: 'Oui - conseiller AI complète' }
    render(<EtapeAI data={data} errors={{}} onChange={noop} onBlur={noop} />)
    expect(screen.getByText('Coordonnées du conseiller·ère AI')).toBeInTheDocument()
  })
})

// ──────────────────────────────────────────────
// EtapeReferent
// ──────────────────────────────────────────────
describe('EtapeReferent', () => {
  it('affiche tous les champs dont fonction en select', () => {
    render(<EtapeReferent data={INITIAL_DATA} errors={{}} onChange={noop} onBlur={noop} />)
    expect(screen.getByLabelText(/Organisation/)).toBeInTheDocument()
    expect(screen.getByText('Enseignant·e')).toBeInTheDocument()
    expect(screen.getByText('Éducateur·trice')).toBeInTheDocument()
    expect(screen.getByText('Conseiller·ère AI')).toBeInTheDocument()
    expect(screen.getByText('Conseiller·ère en Insertion')).toBeInTheDocument()
    expect(screen.getByText('Curateur·trice')).toBeInTheDocument()
  })
})

// ──────────────────────────────────────────────
// EtapeComplementaire
// ──────────────────────────────────────────────
describe('EtapeComplementaire', () => {
  it('affiche objectif du stage pour parcours=stages', () => {
    render(<EtapeComplementaire data={INITIAL_DATA} errors={{}} onChange={noop} onBlur={noop} parcours="stages" />)
    expect(screen.getByLabelText(/objectif du stage/i)).toBeInTheDocument()
  })

  it('cache objectif du stage pour parcours=modules', () => {
    render(<EtapeComplementaire data={INITIAL_DATA} errors={{}} onChange={noop} onBlur={noop} parcours="modules" />)
    expect(screen.queryByLabelText(/objectif du stage/i)).not.toBeInTheDocument()
  })

  it('affiche les champs tailles (optionnels)', () => {
    render(<EtapeComplementaire data={INITIAL_DATA} errors={{}} onChange={noop} onBlur={noop} />)
    expect(screen.getByLabelText(/Pointure/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Taille t-shirt/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Taille pantalon/)).toBeInTheDocument()
  })

  it('affiche les options de tests', () => {
    render(<EtapeComplementaire data={INITIAL_DATA} errors={{}} onChange={noop} onBlur={noop} />)
    expect(screen.getByText(/évaluation et de diagnostic/)).toBeInTheDocument()
    expect(screen.getByText(/évaluation du niveau scolaire/)).toBeInTheDocument()
  })
})

// ──────────────────────────────────────────────
// EtapeDeclaration
// ──────────────────────────────────────────────
describe('EtapeDeclaration', () => {
  it('affiche les 2 cases à cocher', () => {
    render(<EtapeDeclaration data={INITIAL_DATA} errors={{}} onChange={noop} />)
    expect(screen.getByText(/Charte pour la prévention/)).toBeInTheDocument()
    expect(screen.getByText(/Déclaration d'engagement personnelle/)).toBeInTheDocument()
  })

  it('les checkboxes sont cochées quand data = Oui', () => {
    const data = { ...INITIAL_DATA, declaration_charte: 'Oui', declaration_engagement: 'Oui' }
    render(<EtapeDeclaration data={data} errors={{}} onChange={noop} />)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[1]).toBeChecked()
  })

  it('affiche les erreurs', () => {
    render(<EtapeDeclaration data={INITIAL_DATA} errors={{ declaration_charte: 'Obligatoire', declaration_engagement: 'Obligatoire' }} onChange={noop} />)
    expect(screen.getAllByText('Obligatoire')).toHaveLength(2)
  })
})
