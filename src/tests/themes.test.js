/**
 * Tests unitaires — Système de thèmes (themes.js).
 *
 * Couvre : mélange avec blanc, dérivation de fond, normalisation d'un
 * thème partiel, application des variables CSS, intégrité du thème officiel.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  THEMES,
  melangeBlanc,
  deriverFond,
  themeParDefaut,
  normaliserTheme,
  appliquerTheme,
} from '../utils/themes'

describe('melangeBlanc', () => {
  it('éclaircit une couleur vers le blanc', () => {
    expect(melangeBlanc('#000000', 0)).toBe('#000000')
    expect(melangeBlanc('#000000', 1)).toBe('#ffffff')
    expect(melangeBlanc('#000000', 0.5)).toBe('#808080')
  })
  it('gère les hex à 3 caractères', () => {
    expect(melangeBlanc('#000', 1)).toBe('#ffffff')
  })
  it('renvoie l\'entrée inchangée si le hex est invalide (saisie en cours)', () => {
    expect(melangeBlanc('#0', 0.5)).toBe('#0')
    expect(melangeBlanc('pas-un-hex', 0.5)).toBe('pas-un-hex')
  })
  it('accepte un hex sans dièse et en majuscules', () => {
    expect(melangeBlanc('ABCDEF', 0)).toBe('#abcdef')
  })
})

describe('deriverFond', () => {
  it('produit un dégradé linéaire à partir des deux couleurs', () => {
    const fond = deriverFond('#092C6A', '#2EA3F2')
    expect(fond.startsWith('linear-gradient(160deg')).toBe(true)
    expect(fond).toContain('#')
  })
})

describe('thème officiel Clair Bois', () => {
  it('est le premier du catalogue et garde ses valeurs exactes', () => {
    const officiel = THEMES[0]
    expect(officiel.cle).toBe('clairbois')
    expect(officiel.primaire).toBe('#092C6A')
    expect(officiel.accent).toBe('#2EA3F2')
    expect(officiel.primaireLight).toBe('#dbeafe')
    expect(officiel.accentLight).toBe('#e0f2fe')
    expect(officiel.fondFormulaire).toContain('#e3ecfa')
  })
  it('themeParDefaut renvoie une COPIE de l\'officiel', () => {
    const d = themeParDefaut()
    expect(d.cle).toBe('clairbois')
    d.primaire = '#000000'
    expect(THEMES[0].primaire).toBe('#092C6A') // non muté
  })
  it('les 6 thèmes ont tous les champs requis', () => {
    for (const t of THEMES) {
      expect(t.cle).toBeTruthy()
      expect(t.nom).toBeTruthy()
      expect(t.primaire).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(t.accent).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(t.police).toBeTruthy()
      expect(t.fondFormulaire).toContain('gradient')
    }
  })
})

describe('normaliserTheme', () => {
  it('complète un thème partiel (variantes claires + fond dérivés)', () => {
    const t = normaliserTheme({ primaire: '#102030', accent: '#40A0FF' })
    expect(t.primaireLight).toMatch(/^#[0-9A-Fa-f]{6}$/)
    expect(t.accentLight).toMatch(/^#[0-9A-Fa-f]{6}$/)
    expect(t.fondFormulaire).toContain('gradient')
    expect(t.police).toBeTruthy()
    expect(t.cle).toBe('personnalise')
  })
  it('retombe sur l\'officiel si l\'entrée est invalide', () => {
    expect(normaliserTheme(null).cle).toBe('clairbois')
    expect(normaliserTheme(undefined).primaire).toBe('#092C6A')
  })
  it('préserve les valeurs explicites fournies', () => {
    const t = normaliserTheme({ ...THEMES[1] })
    expect(t.cle).toBe('ocean')
    expect(t.primaire).toBe(THEMES[1].primaire)
  })
})

describe('appliquerTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('style')
  })
  it('surcharge les variables CSS de marque sur la racine', () => {
    appliquerTheme(THEMES[1]) // Océan
    const root = document.documentElement.style
    expect(root.getPropertyValue('--color-cb-blue')).toBe('#0E4D64')
    expect(root.getPropertyValue('--color-cb-accent')).toBe('#17B0C4')
    expect(root.getPropertyValue('--cb-police')).toContain('Nunito')
    expect(root.getPropertyValue('--cb-form-bg')).toContain('gradient')
  })
  it('n\'affecte JAMAIS les couleurs sémantiques (vert/orange/rouge/gris)', () => {
    appliquerTheme(THEMES[2]) // Forêt (primaire verte)
    const root = document.documentElement.style
    // Les variables de statut ne sont pas touchées par le thème
    expect(root.getPropertyValue('--color-cb-green')).toBe('')
    expect(root.getPropertyValue('--color-cb-red')).toBe('')
    expect(root.getPropertyValue('--color-cb-orange')).toBe('')
  })
  it('applique le défaut si aucun thème fourni', () => {
    appliquerTheme(undefined)
    expect(document.documentElement.style.getPropertyValue('--color-cb-blue')).toBe('#092C6A')
  })
})
