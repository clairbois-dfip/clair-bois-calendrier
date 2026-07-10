/**
 * Tests unitaires — Moteur des formulaires dynamiques (formulaireDynamique.js).
 *
 * Cible : collecterPayload (dont l'exclusion des champs « sans SharePoint »),
 * evaluerCondition, et validerChamp pour un champ non stocké.
 */
import { describe, it, expect } from 'vitest'
import {
  collecterPayload,
  evaluerCondition,
  validerChamp,
  champsVisibles,
} from '../utils/formulaireDynamique'

const SCHEMA = {
  etapes: [{ cle: 'e1', titre: 'E1', ordre: 1, formulaire: 'inscription' }],
  champs: [
    { colonneSP: 'Nom', champPayload: 'nom', listeCible: 'Stagiaire', etape: 'e1', ordre: 10, type: 'text', obligatoire: true },
    // Case de consentement SANS SharePoint (listeCible vide)
    { colonneSP: '', champPayload: 'declaration_charte', listeCible: '', etape: 'e1', ordre: 20, type: 'checkbox', obligatoire: true },
    // Champ conditionnel stocké
    { colonneSP: 'CuratelleNom', champPayload: 'curatelle_nom', listeCible: 'Stagiaire', etape: 'e1', ordre: 30, type: 'text', obligatoire: true, condition: 'sous_curatelle=Oui*' },
  ],
}

describe('collecterPayload', () => {
  it('inclut les champs remplis ET destinés à SharePoint', () => {
    const p = collecterPayload(SCHEMA, ['e1'], { nom: 'Dupont', declaration_charte: 'Oui' }, {})
    expect(p.nom).toBe('Dupont')
  })

  it('EXCLUT un champ sans SharePoint même s\'il est rempli (consentement)', () => {
    const p = collecterPayload(SCHEMA, ['e1'], { nom: 'Dupont', declaration_charte: 'Oui' }, {})
    expect(p).not.toHaveProperty('declaration_charte')
  })

  it('n\'envoie pas les champs vides ni les champs cachés par condition', () => {
    const p = collecterPayload(SCHEMA, ['e1'], { nom: 'Dupont', curatelle_nom: 'Muller' }, {})
    // curatelle_nom caché car sous_curatelle != Oui
    expect(p).not.toHaveProperty('curatelle_nom')
  })

  it('envoie un champ conditionnel stocké quand sa condition est remplie', () => {
    const p = collecterPayload(SCHEMA, ['e1'], { nom: 'D', curatelle_nom: 'Muller', sous_curatelle: 'Oui' }, {})
    expect(p.curatelle_nom).toBe('Muller')
  })
})

describe('validerChamp — champ sans SP reste validable', () => {
  it('un consentement obligatoire non coché est invalide (gate de soumission)', () => {
    const charte = SCHEMA.champs.find((c) => c.champPayload === 'declaration_charte')
    expect(validerChamp(charte, '').valid).toBe(false)
    expect(validerChamp(charte, 'Oui').valid).toBe(true)
  })
})

describe('evaluerCondition', () => {
  it('gère égalité, préfixe (*), différence (!=) et vide', () => {
    expect(evaluerCondition(null, {})).toBe(true)
    expect(evaluerCondition('parcours=stages', { parcours: 'stages' })).toBe(true)
    expect(evaluerCondition('sous_curatelle=Oui*', { sous_curatelle: 'Oui - curateur complète' })).toBe(true)
    expect(evaluerCondition('inscrit_ai!=Non', { inscrit_ai: 'Oui' })).toBe(true)
    expect(evaluerCondition('inscrit_ai!=Non', { inscrit_ai: '' })).toBe(false)
  })
})

describe('champsVisibles', () => {
  it('masque un champ dont la condition n\'est pas remplie', () => {
    const visibles = champsVisibles(SCHEMA, 'e1', { sous_curatelle: 'Non' }).map((c) => c.champPayload)
    expect(visibles).toContain('nom')
    expect(visibles).not.toContain('curatelle_nom')
  })
})
