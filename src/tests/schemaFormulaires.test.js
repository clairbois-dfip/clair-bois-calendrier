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
  reordonnerChampVers,
  mettreAJourChamp,
  ajouterChamp,
  supprimerChamp,
  ajouterEtape,
  mettreAJourEtape,
  deplacerEtape,
  questionsPrealablesDe,
  ajouterQuestionPrealable,
  mettreAJourQuestionPrealable,
  supprimerQuestionPrealable,
  supprimerEtape,
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
// reordonnerChampVers — glisser-déposer
// ──────────────────────────────────────────────
describe('reordonnerChampVers', () => {
  it('dépose un champ AVANT une cible (nom → avant… lui-même via avs)', () => {
    // avs déposé avant nom : ordre attendu avs, nom, prenom
    const s2 = reordonnerChampVers(SCHEMA, 'stagiaire:avs', 'stagiaire:nom', true)
    expect(champsDeLEtape(s2, 'stagiaire').map((c) => c.champPayload)).toEqual(['avs', 'nom', 'prenom'])
    expect(champsDeLEtape(s2, 'stagiaire').map((c) => c.ordre)).toEqual([10, 20, 30])
  })
  it('dépose un champ APRÈS une cible (nom → après avs)', () => {
    const s2 = reordonnerChampVers(SCHEMA, 'stagiaire:nom', 'stagiaire:avs', false)
    expect(champsDeLEtape(s2, 'stagiaire').map((c) => c.champPayload)).toEqual(['prenom', 'avs', 'nom'])
  })
  it('ne fait rien si source == cible', () => {
    expect(reordonnerChampVers(SCHEMA, 'stagiaire:nom', 'stagiaire:nom', true)).toBe(SCHEMA)
  })
  it('refuse de déplacer entre deux étapes différentes', () => {
    expect(reordonnerChampVers(SCHEMA, 'stagiaire:nom', 'signalement:nom', true)).toBe(SCHEMA)
  })
  it('n\'altère pas le schéma original (immutabilité)', () => {
    reordonnerChampVers(SCHEMA, 'stagiaire:avs', 'stagiaire:nom', true)
    expect(SCHEMA.champs[0].champPayload).toBe('nom')
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
// Étapes — ajout, édition, ordre, suppression
// ──────────────────────────────────────────────
describe('gestion des étapes', () => {
  const S = {
    ...SCHEMA,
    etapes: [
      { cle: 'stagiaire', titre: 'Stagiaire', ordre: 1, formulaire: 'inscription' },
      { cle: 'urgence', titre: 'Urgence', ordre: 2, formulaire: 'inscription' },
      { cle: 'signalement', titre: 'Signalement', ordre: 1, formulaire: 'signalement' },
    ],
  }

  it('ajoute une étape en fin de formulaire avec une clé unique', () => {
    const { schema: s2, etape } = ajouterEtape(S, 'inscription')
    expect(etape.cle).toBe('inscription-etape-1')
    expect(etape.ordre).toBe(3)
    expect(etape.formulaire).toBe('inscription')
    expect(s2.etapes).toHaveLength(4)
  })

  it('met à jour le titre et l\'intro sans jamais toucher la clé', () => {
    const s2 = mettreAJourEtape(S, 'urgence', { titre: 'Contact d\'urgence', intro: 'Bandeau', cle: 'piratage' })
    const e = s2.etapes.find(x => x.cle === 'urgence')
    expect(e.titre).toBe('Contact d\'urgence')
    expect(e.intro).toBe('Bandeau')
    expect(s2.etapes.some(x => x.cle === 'piratage')).toBe(false)
  })

  it('déplace une étape au sein de SON formulaire uniquement', () => {
    const s2 = deplacerEtape(S, 'urgence', -1)
    const ordres = s2.etapes.filter(e => e.formulaire === 'inscription').sort((a, b) => a.ordre - b.ordre).map(e => e.cle)
    expect(ordres).toEqual(['urgence', 'stagiaire'])
    // Le signalement n'est pas renuméroté
    expect(s2.etapes.find(e => e.cle === 'signalement').ordre).toBe(1)
  })

  it('refuse de supprimer une étape qui contient encore des champs', () => {
    expect(supprimerEtape(S, 'stagiaire')).toBe(S)
  })

  it('supprime une étape vide', () => {
    const s2 = supprimerEtape(S, 'urgence')
    expect(s2.etapes.some(e => e.cle === 'urgence')).toBe(false)
  })
})

// ──────────────────────────────────────────────
// Questions préalables (posées avant le formulaire)
// ──────────────────────────────────────────────
describe('questions préalables', () => {
  const S = { ...SCHEMA, questionsPrealables: [] }

  it('ajoute une question préalable Oui/Non avec une clé unique', () => {
    const { schema: s2, question } = ajouterQuestionPrealable(S, 'inscription')
    expect(question.cle).toBe('prealable_1')
    expect(question.formulaire).toBe('inscription')
    expect(question.options.map((o) => o.value)).toEqual(['Oui', 'Non'])
    expect(s2.questionsPrealables).toHaveLength(1)
  })

  it('génère des clés distinctes à chaque ajout', () => {
    let s2 = ajouterQuestionPrealable(S, 'inscription').schema
    s2 = ajouterQuestionPrealable(s2, 'inscription').schema
    expect(s2.questionsPrealables.map((q) => q.cle)).toEqual(['prealable_1', 'prealable_2'])
  })

  it('met à jour le libellé sans toucher la clé', () => {
    const s1 = ajouterQuestionPrealable(S, 'inscription').schema
    const s2 = mettreAJourQuestionPrealable(s1, 'prealable_1', { label: 'Déjà inscrit ?', cle: 'piratage' })
    expect(s2.questionsPrealables[0].label).toBe('Déjà inscrit ?')
    expect(s2.questionsPrealables[0].cle).toBe('prealable_1')
  })

  it('filtre par formulaire et supprime par clé', () => {
    let s2 = ajouterQuestionPrealable(S, 'inscription').schema
    s2 = ajouterQuestionPrealable(s2, 'signalement').schema
    expect(questionsPrealablesDe(s2, 'inscription')).toHaveLength(1)
    const s3 = supprimerQuestionPrealable(s2, 'prealable_1')
    expect(questionsPrealablesDe(s3, 'inscription')).toHaveLength(0)
    expect(questionsPrealablesDe(s3, 'signalement')).toHaveLength(1)
  })

  it('supprimer une question purge les conditions dépendantes (étapes, champs, options)', () => {
    let s2 = ajouterQuestionPrealable(S, 'inscription').schema
    s2 = {
      ...s2,
      etapes: [
        { cle: 'e1', titre: 'Dépendante', ordre: 1, formulaire: 'inscription', conditionAffichage: 'prealable_1=Oui' },
        { cle: 'e2', titre: 'Autre', ordre: 2, formulaire: 'inscription', conditionAffichage: 'pourQui=autre' },
      ],
      champs: [
        { champPayload: 'c1', etape: 'e1', ordre: 10, type: 'text', condition: 'prealable_1=Non' },
        {
          champPayload: 'c2', etape: 'e1', ordre: 20, type: 'radio', condition: 'pourQui=autre',
          options: [
            { value: 'A', label: 'A', condition: 'prealable_1=Oui' },
            { value: 'B', label: 'B' },
          ],
        },
      ],
    }
    const s3 = supprimerQuestionPrealable(s2, 'prealable_1')
    // L'étape qui dépendait de la question redevient toujours visible…
    expect(s3.etapes.find((e) => e.cle === 'e1').conditionAffichage).toBeNull()
    // …les autres conditions d'étape ne sont pas touchées.
    expect(s3.etapes.find((e) => e.cle === 'e2').conditionAffichage).toBe('pourQui=autre')
    // Les conditions de CHAMP pilotées par la question sont purgées…
    expect(s3.champs.find((c) => c.champPayload === 'c1').condition).toBeNull()
    // …pas celles pilotées par autre chose.
    expect(s3.champs.find((c) => c.champPayload === 'c2').condition).toBe('pourQui=autre')
    // Les conditions d'OPTION pilotées par la question sont retirées (l'option reste).
    const options = s3.champs.find((c) => c.champPayload === 'c2').options
    expect(options.map((o) => o.value)).toEqual(['A', 'B'])
    expect(options[0].condition).toBeUndefined()
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
