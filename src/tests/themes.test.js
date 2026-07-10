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
  themePourFormulaire,
  themeDuSite,
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

describe('themePourFormulaire (un thème par formulaire, non figé)', () => {
  it('rend le thème propre à chaque formulaire depuis schema.themes', () => {
    const schema = {
      themes: {
        inscription: THEMES[4], // Terracotta
        signalement: THEMES[1], // Océan
      },
    }
    expect(themePourFormulaire(schema, 'inscription').primaire).toBe('#7A3B25')
    expect(themePourFormulaire(schema, 'signalement').primaire).toBe('#0E4D64')
  })

  it('les formulaires ne sont plus figés : chacun peut différer de l\'autre', () => {
    const schema = { themes: { inscription: THEMES[4], visite: THEMES[2] } }
    const insc = themePourFormulaire(schema, 'inscription')
    const visite = themePourFormulaire(schema, 'visite')
    expect(insc.primaire).not.toBe(visite.primaire)
  })

  it('retombe sur l\'officiel Clair Bois si le formulaire n\'a pas de thème', () => {
    const schema = { themes: { inscription: THEMES[4] } }
    expect(themePourFormulaire(schema, 'signalement').primaire).toBe('#092C6A')
  })

  it('rétro-compatibilité : à défaut de themes[cle], utilise l\'ancien theme global', () => {
    const schema = { theme: THEMES[3] } // Aubergine, ancien format global
    expect(themePourFormulaire(schema, 'inscription').primaire).toBe(THEMES[3].primaire)
  })

  it('officiel Clair Bois si ni themes ni theme', () => {
    expect(themePourFormulaire({}, 'inscription').primaire).toBe('#092C6A')
    expect(themePourFormulaire(undefined, 'inscription').primaire).toBe('#092C6A')
  })

  it('normalise un thème partiel (dérive -light et fond manquants)', () => {
    const schema = { themes: { inscription: { primaire: '#123456', accent: '#abcdef' } } }
    const t = themePourFormulaire(schema, 'inscription')
    expect(t.primaireLight).toMatch(/^#[0-9a-f]{6}$/i)
    expect(t.fondFormulaire).toContain('gradient')
  })
})

describe('themeDuSite (pages hors formulaire)', () => {
  it('utilise le theme global du schéma', () => {
    expect(themeDuSite({ theme: THEMES[1] }).primaire).toBe('#0E4D64')
  })
  it('officiel Clair Bois par défaut', () => {
    expect(themeDuSite({}).primaire).toBe('#092C6A')
    expect(themeDuSite(undefined).primaire).toBe('#092C6A')
  })
  it('ignore les thèmes par formulaire (indépendant de schema.themes)', () => {
    const schema = { themes: { inscription: THEMES[4] } }
    expect(themeDuSite(schema).primaire).toBe('#092C6A')
  })
})
