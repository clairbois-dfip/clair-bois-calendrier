/**
 * Tests unitaires — Utilitaires du CMS de formulaires (schemaFormulaires.js).
 *
 * Couvre : suggestion et validation d'identifiants SharePoint, clé unique
 * de champ, réordonnancement au sein d'une étape, ajout/suppression/mise à
 * jour immuables, parsing des options, sérialisation et encodage base64.
 */
import { describe, it, expect } from 'vitest'
import {
  cleChamp,
  suggererColonneSP,
  validerColonneSP,
  colonnesDeLaListe,
  champsDeLEtape,
  deplacerChamp,
  mettreAJourChamp,
  ajouterChamp,
  supprimerChamp,
  parserOptions,
  optionsVersTexte,
  serialiserSchema,
  encoderBase64Utf8,
} from '../utils/schemaFormulaires'

// ──────────────────────────────────────────────
// Données de test
// ──────────────────────────────────────────────
const SCHEMA = {
  version: 1,
  formulaires: [{ cle: 'inscription', titre: 'Inscription' }],
  etapes: [{ cle: 'stagiaire', titre: 'Stagiaire', ordre: 1, formulaire: 'inscription' }],
  champs: [
    { colonneSP: 'Nom', champPayload: 'nom', listeCible: 'Stagiaire', etape: 'stagiaire', ordre: 10, label: 'Nom' },
    { colonneSP: 'Prenom', champPayload: 'prenom', listeCible: 'Stagiaire', etape: 'stagiaire', ordre: 20, label: 'Prénom' },
    { colonneSP: 'AVS', champPayload: 'avs', listeCible: 'Stagiaire', etape: 'stagiaire', ordre: 30, label: 'Numéro AVS' },
    // Même colonneSP « Nom » mais sur une AUTRE liste : autorisé.
    { colonneSP: 'Nom', champPayload: 'nom', listeCible: 'Signalement', etape: 'signalement', ordre: 10, label: 'Nom' },
  ],
}

// ──────────────────────────────────────────────
// suggererColonneSP — label français → PascalCase ASCII
// ──────────────────────────────────────────────
describe('suggererColonneSP', () => {
  it('convertit un label français en PascalCase sans accents', () => {
    expect(suggererColonneSP('Taille de pantalon')).toBe('TailleDePantalon')
    expect(suggererColonneSP('Numéro AVS')).toBe('NumeroAVS')
    expect(suggererColonneSP("Date d'entrée souhaitée")).toBe('DateDEntreeSouhaitee')
  })
  it('retire toute ponctuation et tronque à 24 caractères', () => {
    expect(suggererColonneSP('Nom (du curateur) !')).toBe('NomDuCurateur')
    expect(suggererColonneSP('Un label vraiment beaucoup trop long pour SharePoint')).toHaveLength(24)
  })
  it('retourne une chaîne vide pour un label vide ou invalide', () => {
    expect(suggererColonneSP('')).toBe('')
    expect(suggererColonneSP(null)).toBe('')
  })
})

// ──────────────────────────────────────────────
// validerColonneSP — règle R1 + unicité par liste
// ──────────────────────────────────────────────
describe('validerColonneSP', () => {
  it('accepte un PascalCase ASCII valide', () => {
    expect(validerColonneSP('TaillePantalon', []).valide).toBe(true)
  })
  it('refuse accents, espaces et vide', () => {
    expect(validerColonneSP('Taille pantalon', []).valide).toBe(false)
    expect(validerColonneSP('Numéro', []).valide).toBe(false)
    expect(validerColonneSP('', []).valide).toBe(false)
  })
  it('refuse un identifiant commençant par un chiffre ou trop long', () => {
    expect(validerColonneSP('1Nom', []).valide).toBe(false)
    expect(validerColonneSP('A'.repeat(25), []).valide).toBe(false)
  })
  it("refuse un doublon sur la même liste", () => {
    const res = validerColonneSP('Nom', ['Nom', 'Prenom'])
    expect(res.valide).toBe(false)
    expect(res.message).toContain('déjà utilisé')
  })
})

// ──────────────────────────────────────────────
// cleChamp / colonnesDeLaListe
// ──────────────────────────────────────────────
describe('cleChamp et colonnesDeLaListe', () => {
  it('construit une clé unique étape:payload', () => {
    expect(cleChamp(SCHEMA.champs[0])).toBe('stagiaire:nom')
    expect(cleChamp(SCHEMA.champs[3])).toBe('signalement:nom')
  })
  it('liste les colonnes par liste SP en excluant le champ courant', () => {
    expect(colonnesDeLaListe(SCHEMA, 'Stagiaire', 'stagiaire:nom')).toEqual(['Prenom', 'AVS'])
    expect(colonnesDeLaListe(SCHEMA, 'Signalement')).toEqual(['Nom'])
  })
})

// ──────────────────────────────────────────────
// deplacerChamp — réordonnancement immuable
// ──────────────────────────────────────────────
describe('deplacerChamp', () => {
  it('descend un champ et renumérote 10/20/30', () => {
    const s2 = deplacerChamp(SCHEMA, 'stagiaire:nom', 1)
    const ordres = champsDeLEtape(s2, 'stagiaire').map((c) => c.champPayload)
    expect(ordres).toEqual(['prenom', 'nom', 'avs'])
    expect(champsDeLEtape(s2, 'stagiaire').map((c) => c.ordre)).toEqual([10, 20, 30])
  })
  it('ne fait rien si le champ est déjà en bord de liste', () => {
    expect(deplacerChamp(SCHEMA, 'stagiaire:nom', -1)).toBe(SCHEMA)
    expect(deplacerChamp(SCHEMA, 'stagiaire:avs', 1)).toBe(SCHEMA)
  })
  it('ne modifie pas le schéma original (immutabilité)', () => {
    deplacerChamp(SCHEMA, 'stagiaire:nom', 1)
    expect(SCHEMA.champs[0].ordre).toBe(10)
  })
})

// ──────────────────────────────────────────────
// mettreAJourChamp / ajouterChamp / supprimerChamp
// ──────────────────────────────────────────────
describe('mutations du schéma', () => {
  it('met à jour uniquement le champ ciblé', () => {
    const s2 = mettreAJourChamp(SCHEMA, 'stagiaire:nom', { label: 'Nom de famille' })
    expect(s2.champs[0].label).toBe('Nom de famille')
    // Le « Nom » du signalement (autre étape) n'est pas touché.
    expect(s2.champs[3].label).toBe('Nom')
  })
  it('ajoute un champ en fin d\'étape avec un identifiant provisoire unique', () => {
    const { schema: s2, champ } = ajouterChamp(SCHEMA, 'stagiaire')
    expect(champ.ordre).toBe(40)
    expect(champ.nouveau).toBe(true)
    expect(champ.colonneSP).toBe('NouveauChamp1')
    expect(s2.champs).toHaveLength(5)
  })
  it('supprime un champ par sa clé sans toucher les homonymes', () => {
    const s2 = supprimerChamp(SCHEMA, 'stagiaire:nom')
    expect(s2.champs).toHaveLength(3)
    expect(s2.champs.some((c) => cleChamp(c) === 'signalement:nom')).toBe(true)
  })
})

// ──────────────────────────────────────────────
// parserOptions / optionsVersTexte — aller-retour
// ──────────────────────────────────────────────
describe('options', () => {
  it('parse « valeur | label » et valeur seule', () => {
    expect(parserOptions('Oui\nSoeur | Sœur\n')).toEqual([
      { value: 'Oui', label: 'Oui' },
      { value: 'Soeur', label: 'Sœur' },
    ])
  })
  it('fait l\'aller-retour texte ↔ options sans perte', () => {
    const options = [
      { value: 'Non', label: 'Non' },
      { value: 'Thérapeute', label: 'Un·e thérapeute (psychologue, psychiatre, etc.)' },
    ]
    expect(parserOptions(optionsVersTexte(options))).toEqual(options)
  })
  it('ignore les lignes vides', () => {
    expect(parserOptions('\n\nOui\n\n')).toEqual([{ value: 'Oui', label: 'Oui' }])
  })
})

// ──────────────────────────────────────────────
// Sérialisation / encodage
// ──────────────────────────────────────────────
describe('sérialisation et encodage', () => {
  it('sérialise avec un horodatage updatedAt', () => {
    const json = JSON.parse(serialiserSchema(SCHEMA))
    expect(json.updatedAt).toBeTruthy()
    expect(json.champs).toHaveLength(4)
  })
  it('encode l\'UTF-8 (accents) en base64 valide', () => {
    const encode = encoderBase64Utf8('Sœur — Époux·se à l\'AVS')
    expect(() => atob(encode)).not.toThrow()
    // Décodage inverse pour vérifier l'intégrité.
    const octets = Uint8Array.from(atob(encode), (c) => c.charCodeAt(0))
    expect(new TextDecoder().decode(octets)).toBe('Sœur — Époux·se à l\'AVS')
  })
})
