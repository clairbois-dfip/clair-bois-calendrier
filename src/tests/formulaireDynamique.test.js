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
  etapesDuFormulaire,
} from '../utils/formulaireDynamique'
import schemaReel from '../../public/formulaire-schema.json'

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

/*
 * NON-RÉGRESSION — le schéma RÉELLEMENT livré (public/formulaire-schema.json)
 * conserve les validations métier qui étaient codées en dur avant le rendu
 * dynamique. Ces tests échouent si un champPayload est renommé dans le CMS
 * de façon à « décrocher » sa règle (ex. l'âge minimum 15 ans du stagiaire,
 * le format AVS 756…). C'est le garde-fou demandé après le passage au
 * rendu dynamique.
 */
describe('non-régression : le schéma livré garde les validations historiques', () => {
  const champParPayload = (p) => schemaReel.champs.find((c) => c.champPayload === p)
  // Date de naissance relative à aujourd'hui → test robuste dans le temps.
  const ilYaAns = (n) => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - n)
    return d.toISOString().slice(0, 10)
  }

  const casInvalides = [
    ['date_naissance', ilYaAns(10), /15 ans/],       // âge minimum 15
    ['date_naissance', ilYaAns(-5), /futur/i],       // date dans le futur
    ['avs', '123.4567.8901.23', /756/],              // ne commence pas par 756
    ['avs', '756.1234', /13 chiffres|Format/],       // trop court
    ['tel', 'pas un numéro', /Format|téléphone/i],   // format invalide
    ['email', 'arobase-manquant', /valide|email/i],  // pas d'@
    ['npa', '12', /4 chiffres/],                     // NPA trop court
  ]
  it.each(casInvalides)('rejette %s = "%s"', (payload, valeur, motif) => {
    const champ = champParPayload(payload)
    expect(champ, `champ « ${payload} » absent du schéma livré`).toBeTruthy()
    const res = validerChamp(champ, valeur)
    expect(res.valid).toBe(false)
    expect(res.message).toMatch(motif)
  })

  const casValides = [
    ['date_naissance', ilYaAns(20)],
    ['avs', '756.1234.5678.90'],
    ['tel', '+41 79 123 45 67'],
    ['email', 'stagiaire@example.ch'],
    ['npa', '1205'],
  ]
  it.each(casValides)('accepte %s = "%s"', (payload, valeur) => {
    const champ = champParPayload(payload)
    expect(champ).toBeTruthy()
    expect(validerChamp(champ, valeur).valid).toBe(true)
  })
})

/*
 * NON-RÉGRESSION — affichage conditionnel des ÉTAPES et CHAMPS du schéma
 * réel, tel qu'il était figé avant le CMS (étape référent réservée au
 * « pour quelqu'un d'autre », objectif de stage réservé au parcours stages,
 * sous-blocs curatelle / AI).
 */
describe('non-régression : conditions d\'affichage du schéma livré', () => {
  it('l\'étape « référent » n\'apparaît que si pourQui=autre', () => {
    const pourMoi = etapesDuFormulaire(schemaReel, 'inscription', { pourQui: 'moi' }).map((e) => e.cle)
    const pourAutre = etapesDuFormulaire(schemaReel, 'inscription', { pourQui: 'autre' }).map((e) => e.cle)
    expect(pourMoi).not.toContain('referent')
    expect(pourAutre).toContain('referent')
  })

  it('objectif_stage disparaît en parcours modules, réapparaît en stages', () => {
    const champ = schemaReel.champs.find((c) => c.champPayload === 'objectif_stage')
    expect(champ).toBeTruthy()
    const enModules = champsVisibles(schemaReel, champ.etape, { parcours: 'modules' }).map((c) => c.champPayload)
    const enStages = champsVisibles(schemaReel, champ.etape, { parcours: 'stages' }).map((c) => c.champPayload)
    expect(enModules).not.toContain('objectif_stage')
    expect(enStages).toContain('objectif_stage')
  })

  it('les sous-champs curatelle sont masqués sauf si sous_curatelle commence par « Oui »', () => {
    const etape = schemaReel.champs.find((c) => c.champPayload === 'curatelle_nom')?.etape
    const masques = champsVisibles(schemaReel, etape, { sous_curatelle: 'Non' }).map((c) => c.champPayload)
    const visibles = champsVisibles(schemaReel, etape, { sous_curatelle: 'Oui - curateur complète' }).map((c) => c.champPayload)
    expect(masques).not.toContain('curatelle_nom')
    expect(visibles).toContain('curatelle_nom')
  })

  it('les coordonnées du conseiller AI apparaissent dès que inscrit_ai ≠ Non', () => {
    const etape = schemaReel.champs.find((c) => c.champPayload === 'ai_email')?.etape
    const sansAI = champsVisibles(schemaReel, etape, { inscrit_ai: 'Non' }).map((c) => c.champPayload)
    const avecAI = champsVisibles(schemaReel, etape, { inscrit_ai: 'Oui' }).map((c) => c.champPayload)
    expect(sansAI).not.toContain('ai_email')
    expect(avecAI).toContain('ai_email')
  })
})
