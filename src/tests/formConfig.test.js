/**
 * Tests unitaires — Configuration du formulaire par chemin d'aiguillage.
 *
 * Vérifie que chaque chemin a les bonnes sections, dans le bon ordre.
 */
import { describe, it, expect } from 'vitest'
import { FORM_CONFIGS, getCheminKey, getFormConfig, SECTION_LABELS, INITIAL_DATA } from '../utils/formConfig'

// ──────────────────────────────────────────────
// getCheminKey
// ──────────────────────────────────────────────
describe('getCheminKey', () => {
  it('stages + moi + non inscrit → stages-moi-non', () => {
    expect(getCheminKey('stages', { pourQui: 'moi', dejaInscrit: false })).toBe('stages-moi-non')
  })
  it('stages + autre + non inscrit → stages-autre-non', () => {
    expect(getCheminKey('stages', { pourQui: 'autre', dejaInscrit: false })).toBe('stages-autre-non')
  })
  it('stages + moi + déjà inscrit → stages-moi-oui', () => {
    expect(getCheminKey('stages', { pourQui: 'moi', dejaInscrit: true })).toBe('stages-moi-oui')
  })
  it('stages + autre + déjà inscrit → stages-autre-oui', () => {
    expect(getCheminKey('stages', { pourQui: 'autre', dejaInscrit: true })).toBe('stages-autre-oui')
  })
  it('modules + moi → modules-moi', () => {
    expect(getCheminKey('modules', { pourQui: 'moi' })).toBe('modules-moi')
  })
  it('modules + autre → modules-autre', () => {
    expect(getCheminKey('modules', { pourQui: 'autre' })).toBe('modules-autre')
  })
})

// ──────────────────────────────────────────────
// Sections par chemin
// ──────────────────────────────────────────────
describe('FORM_CONFIGS — sections correctes', () => {
  it('stages-moi-non : stagiaire → curatelle → urgence → ai → complémentaire → déclaration', () => {
    expect(FORM_CONFIGS['stages-moi-non'].sections).toEqual([
      'stagiaire', 'curatelle', 'urgence', 'ai', 'complementaire', 'declaration'
    ])
  })

  it('stages-autre-non : commence par referent', () => {
    const s = FORM_CONFIGS['stages-autre-non'].sections
    expect(s[0]).toBe('referent')
    expect(s).toContain('stagiaire')
    expect(s).toContain('declaration')
  })

  it('stages-moi-oui (retour) : seulement stagiaire-retour', () => {
    expect(FORM_CONFIGS['stages-moi-oui'].sections).toEqual(['stagiaire-retour'])
  })

  it('stages-autre-oui : commence par referent + toutes les étapes', () => {
    const s = FORM_CONFIGS['stages-autre-oui'].sections
    expect(s[0]).toBe('referent')
    expect(s.length).toBe(7)
  })

  it('modules-moi : pas de referent', () => {
    const s = FORM_CONFIGS['modules-moi'].sections
    expect(s).not.toContain('referent')
    expect(s).toContain('stagiaire')
    expect(s).toContain('declaration')
  })

  it('modules-autre : commence par referent', () => {
    expect(FORM_CONFIGS['modules-autre'].sections[0]).toBe('referent')
  })
})

// ──────────────────────────────────────────────
// getFormConfig fallback
// ──────────────────────────────────────────────
describe('getFormConfig', () => {
  it('retourne la config pour un chemin existant', () => {
    const config = getFormConfig('stages', { pourQui: 'moi', dejaInscrit: false })
    expect(config.label).toBe('Demande de stage')
  })

  it('fallback vers stages-moi-non si chemin inconnu', () => {
    const config = getFormConfig('inconnu', { pourQui: 'xxx' })
    expect(config).toEqual(FORM_CONFIGS['stages-moi-non'])
  })
})

// ──────────────────────────────────────────────
// SECTION_LABELS complet
// ──────────────────────────────────────────────
describe('SECTION_LABELS', () => {
  it('couvre toutes les sections utilisées dans les configs', () => {
    const allSections = new Set()
    Object.values(FORM_CONFIGS).forEach(c => c.sections.forEach(s => allSections.add(s)))

    for (const section of allSections) {
      expect(SECTION_LABELS[section]).toBeDefined()
    }
  })
})

// ──────────────────────────────────────────────
// INITIAL_DATA complet
// ──────────────────────────────────────────────
describe('INITIAL_DATA', () => {
  const champsAttendus = [
    // Stagiaire
    'nom', 'prenom', 'sexe', 'date_naissance', 'avs', 'tel', 'email', 'adresse', 'npa', 'formation',
    // Curatelle
    'sous_curatelle', 'curatelle_type', 'curatelle_nom', 'curatelle_prenom', 'curatelle_tel', 'curatelle_email',
    // Urgence
    'urgence_nom', 'urgence_prenom', 'urgence_lien', 'urgence_tel',
    // AI
    'inscrit_ai', 'ai_nom', 'ai_prenom', 'ai_tel', 'ai_email', 'ai_office', 'ai_mesure',
    // Référent
    'referent_partenaire', 'referent_nom', 'referent_prenom', 'referent_tel', 'referent_email', 'referent_fonction',
    // Complémentaire
    'objectif_stage', 'parcours_scolaire', 'limitations', 'deja_tests', 'deja_stages_secteur', 'reseau_medical',
    'pointure', 'taille_tshirt', 'taille_pantalon',
    // Déclaration
    'declaration_charte', 'declaration_engagement',
  ]

  it('contient tous les champs attendus', () => {
    for (const champ of champsAttendus) {
      expect(INITIAL_DATA).toHaveProperty(champ)
    }
  })

  it('tous les champs sont initialisés à vide', () => {
    for (const val of Object.values(INITIAL_DATA)) {
      expect(val).toBe('')
    }
  })
})
