/**
 * Tests unitaires — Fonctions utilitaires helpers.js (calendrier Clair-Bois).
 *
 * Couvre : transformation des donnees, statuts de disponibilite, agregation
 * des creneaux, construction d'URLs, calculs de dates ISO, deduplication,
 * formatage de dates, generation de calendrier, regroupement par semaines,
 * couleurs de fond.
 */
import { describe, it, expect } from 'vitest'
import {
  transformPlanningData,
  aggregateWeekCreneaux,
  buildFormsUrl,
  computeStatus,
  getISOWeekNumber,
  getUniqueCreneaux,
  formatDate,
  formatDateShort,
  getCalendarDays,
  groupByWeeks,
  getStatusBgLight,
  getStatusColor,
  getStatusLabel,
  getMonthName,
  countAvailableWeeks,
  getMondayOfWeek,
} from '../utils/helpers'

// ──────────────────────────────────────────────
// computeStatus — Seuils de disponibilite
// ──────────────────────────────────────────────
describe('computeStatus', () => {
  it('retourne "available" quand plus de 50% des places sont libres', () => {
    // 8 places sur 10 libres = 80% → vert
    expect(computeStatus(10, 2)).toBe('available')
  })

  it('retourne "available" a la limite stricte de >50%', () => {
    // 6 places sur 10 libres = 60% → vert
    expect(computeStatus(10, 4)).toBe('available')
  })

  it('retourne "almost_full" a exactement 50%', () => {
    // 5 places sur 10 libres = 50% (pas strictement >50%) → orange
    expect(computeStatus(10, 5)).toBe('almost_full')
  })

  it('retourne "almost_full" quand 1-50% des places sont libres', () => {
    // 2 places sur 10 libres = 20% → orange
    expect(computeStatus(10, 8)).toBe('almost_full')
  })

  it('retourne "almost_full" quand il reste exactement 1 place', () => {
    expect(computeStatus(10, 9)).toBe('almost_full')
  })

  it('retourne "full" quand toutes les places sont prises', () => {
    expect(computeStatus(10, 10)).toBe('full')
  })

  it('retourne "full" quand les places utilisees depassent le total', () => {
    // Cas limite : surbooking
    expect(computeStatus(5, 7)).toBe('full')
  })

  it('retourne "full" quand le total est 0', () => {
    expect(computeStatus(0, 0)).toBe('full')
  })
})

// ──────────────────────────────────────────────
// getStatusBgLight — Fond pastel selon le statut
// ──────────────────────────────────────────────
describe('getStatusBgLight', () => {
  it('retourne les classes vertes pour "available"', () => {
    expect(getStatusBgLight('available')).toBe('bg-cb-green-light border-cb-green')
  })

  it('retourne les classes orange pour "almost_full"', () => {
    expect(getStatusBgLight('almost_full')).toBe('bg-cb-orange-light border-cb-orange')
  })

  it('retourne les classes rouges pour "full"', () => {
    expect(getStatusBgLight('full')).toBe('bg-cb-red-light border-cb-red')
  })

  it('retourne les classes grises par defaut pour un statut inconnu', () => {
    expect(getStatusBgLight('inconnu')).toBe('bg-cb-gray-light border-cb-gray')
  })

  it('retourne les classes grises si le statut est undefined', () => {
    expect(getStatusBgLight(undefined)).toBe('bg-cb-gray-light border-cb-gray')
  })
})

// ──────────────────────────────────────────────
// getStatusColor — Fond plein selon le statut
// ──────────────────────────────────────────────
describe('getStatusColor', () => {
  it('retourne les classes vertes pour "available"', () => {
    expect(getStatusColor('available')).toBe('bg-cb-green text-white')
  })

  it('retourne les classes orange pour "almost_full"', () => {
    expect(getStatusColor('almost_full')).toBe('bg-cb-orange text-white')
  })

  it('retourne les classes rouges pour "full"', () => {
    expect(getStatusColor('full')).toBe('bg-cb-red text-white')
  })

  it('retourne les classes grises par defaut', () => {
    expect(getStatusColor('xyz')).toBe('bg-cb-gray text-white')
  })
})

// ──────────────────────────────────────────────
// getStatusLabel — Libelle francais du statut
// ──────────────────────────────────────────────
describe('getStatusLabel', () => {
  it('retourne "Disponible" pour available', () => {
    expect(getStatusLabel('available')).toBe('Disponible')
  })

  it('retourne "Presque complet" pour almost_full', () => {
    expect(getStatusLabel('almost_full')).toBe('Presque complet')
  })

  it('retourne "Complet" pour full', () => {
    expect(getStatusLabel('full')).toBe('Complet')
  })

  it('retourne "Non défini" pour un statut inconnu', () => {
    expect(getStatusLabel('autre')).toBe('Non défini')
  })
})

// ──────────────────────────────────────────────
// formatDate — Formatage date ISO en francais
// ──────────────────────────────────────────────
describe('formatDate', () => {
  it('formate une date ISO en francais (jour mois annee)', () => {
    const result = formatDate('2026-03-01')
    // Le format fr-CH donne "1 mars 2026" (sans zero initial)
    expect(result).toContain('1')
    expect(result).toMatch(/mars/i)
    expect(result).toContain('2026')
  })

  it('formate correctement une date en fin d\'annee', () => {
    const result = formatDate('2026-12-25')
    expect(result).toContain('25')
    expect(result).toMatch(/d[eé]c/i)
    expect(result).toContain('2026')
  })

  it('formate correctement le premier janvier', () => {
    const result = formatDate('2026-01-01')
    expect(result).toContain('1')
    expect(result).toMatch(/janv/i)
    expect(result).toContain('2026')
  })
})

// ──────────────────────────────────────────────
// formatDateShort — Format court sans annee
// ──────────────────────────────────────────────
describe('formatDateShort', () => {
  it('formate une date sans l\'annee', () => {
    const result = formatDateShort('2026-03-15')
    expect(result).toContain('15')
    expect(result).toMatch(/mars|mar/i)
    // On verifie que l'annee n'est pas presente
    expect(result).not.toContain('2026')
  })
})

// ──────────────────────────────────────────────
// getISOWeekNumber — Numero de semaine ISO 8601
// ──────────────────────────────────────────────
describe('getISOWeekNumber', () => {
  it('retourne la semaine 1 pour le 5 janvier 2026 (lundi)', () => {
    // Le 5 janvier 2026 est un lundi, semaine 2
    // Le 1er janvier 2026 est un jeudi → semaine 1
    expect(getISOWeekNumber(new Date(2026, 0, 1))).toBe(1)
  })

  it('retourne la bonne semaine pour une date en milieu d\'annee', () => {
    // 23 mars 2026 est un lundi → semaine 13
    expect(getISOWeekNumber(new Date(2026, 2, 23))).toBe(13)
  })

  it('gere le passage d\'annee (31 dec 2025 = semaine 1 de 2026)', () => {
    // Le 31 decembre 2025 est un mercredi
    // Le 1er janvier 2026 est un jeudi → semaine 1 de 2026
    // Donc le 31 dec 2025 = semaine 1 de 2026
    expect(getISOWeekNumber(new Date(2025, 11, 31))).toBe(1)
  })

  it('retourne semaine 52 ou 53 pour fin decembre selon l\'annee', () => {
    // Le 28 decembre 2026 est un lundi → semaine 53 de 2026
    const wn = getISOWeekNumber(new Date(2026, 11, 28))
    expect(wn).toBeGreaterThanOrEqual(52)
    expect(wn).toBeLessThanOrEqual(53)
  })

  it('retourne semaine 10 pour le 2 mars 2026', () => {
    expect(getISOWeekNumber(new Date(2026, 2, 2))).toBe(10)
  })
})

// ──────────────────────────────────────────────
// getUniqueCreneaux — Deduplication par startDate+endDate
// ──────────────────────────────────────────────
describe('getUniqueCreneaux', () => {
  it('supprime les doublons ayant les memes dates de debut et fin', () => {
    const weeks = [
      { startDate: '2026-03-02', endDate: '2026-03-06', totalSlots: 3 },
      { startDate: '2026-03-02', endDate: '2026-03-06', totalSlots: 3 },
      { startDate: '2026-03-09', endDate: '2026-03-13', totalSlots: 5 },
    ]
    const result = getUniqueCreneaux(weeks)
    expect(result).toHaveLength(2)
  })

  it('conserve tous les creneaux quand ils sont differents', () => {
    const weeks = [
      { startDate: '2026-03-02', endDate: '2026-03-06' },
      { startDate: '2026-03-09', endDate: '2026-03-13' },
      { startDate: '2026-03-16', endDate: '2026-03-20' },
    ]
    const result = getUniqueCreneaux(weeks)
    expect(result).toHaveLength(3)
  })

  it('retourne un tableau vide si l\'entree est vide', () => {
    expect(getUniqueCreneaux([])).toHaveLength(0)
  })

  it('garde le premier doublon rencontre (pas le dernier)', () => {
    const weeks = [
      { startDate: '2026-03-02', endDate: '2026-03-06', totalSlots: 3 },
      { startDate: '2026-03-02', endDate: '2026-03-06', totalSlots: 99 },
    ]
    const result = getUniqueCreneaux(weeks)
    expect(result).toHaveLength(1)
    expect(result[0].totalSlots).toBe(3)
  })
})

// ──────────────────────────────────────────────
// getCalendarDays — Generation de la grille mensuelle
// ──────────────────────────────────────────────
describe('getCalendarDays', () => {
  it('genere les jours de mars 2026 (commence un dimanche → 6 cases vides)', () => {
    // Le 1er mars 2026 est un dimanche → decalage lundi = 6
    const days = getCalendarDays(2, 2026)
    // 6 nulls + 31 jours = 37 elements
    expect(days).toHaveLength(37)
    // Les 6 premiers sont null (cases vides avant le dimanche)
    for (let i = 0; i < 6; i++) {
      expect(days[i]).toBeNull()
    }
    // Le 7e element est le 1er mars
    expect(days[6]).toBeInstanceOf(Date)
    expect(days[6].getDate()).toBe(1)
  })

  it('genere les jours de janvier 2026 (commence un jeudi → 3 cases vides)', () => {
    // Le 1er janvier 2026 est un jeudi → decalage lundi = 3
    const days = getCalendarDays(0, 2026)
    expect(days[0]).toBeNull()
    expect(days[1]).toBeNull()
    expect(days[2]).toBeNull()
    expect(days[3]).toBeInstanceOf(Date)
    expect(days[3].getDate()).toBe(1)
  })

  it('genere les jours de fevrier 2026 (pas d\'annee bissextile → 28 jours)', () => {
    const days = getCalendarDays(1, 2026)
    const realDays = days.filter((d) => d !== null)
    expect(realDays).toHaveLength(28)
  })

  it('genere les jours de fevrier 2028 (annee bissextile → 29 jours)', () => {
    const days = getCalendarDays(1, 2028)
    const realDays = days.filter((d) => d !== null)
    expect(realDays).toHaveLength(29)
  })

  it('commence par le bon nombre de nulls quand le mois debute un lundi', () => {
    // Juin 2026 commence un lundi → 0 cases vides
    const days = getCalendarDays(5, 2026)
    expect(days[0]).toBeInstanceOf(Date)
    expect(days[0].getDate()).toBe(1)
  })
})

// ──────────────────────────────────────────────
// groupByWeeks — Decoupage en sous-tableaux de 7
// ──────────────────────────────────────────────
describe('groupByWeeks', () => {
  it('decoupe un tableau de 35 elements en 5 semaines', () => {
    const input = Array.from({ length: 35 }, (_, i) => i)
    const weeks = groupByWeeks(input)
    expect(weeks).toHaveLength(5)
    expect(weeks[0]).toHaveLength(7)
  })

  it('gere un reste inferieur a 7 dans la derniere semaine', () => {
    // 37 elements → 5 semaines de 7 + 1 semaine de 2
    const input = Array.from({ length: 37 }, (_, i) => i)
    const weeks = groupByWeeks(input)
    expect(weeks).toHaveLength(6)
    expect(weeks[5]).toHaveLength(2)
  })

  it('retourne un tableau vide si l\'entree est vide', () => {
    expect(groupByWeeks([])).toHaveLength(0)
  })

  it('retourne une seule semaine si moins de 7 elements', () => {
    const weeks = groupByWeeks([1, 2, 3])
    expect(weeks).toHaveLength(1)
    expect(weeks[0]).toEqual([1, 2, 3])
  })
})

// ──────────────────────────────────────────────
// buildFormsUrl — Construction d'URL pre-remplie
// ──────────────────────────────────────────────
describe('buildFormsUrl', () => {
  const BASE = 'https://forms.office.com/e/test123'

  it('construit une URL avec les parametres encodes', () => {
    const url = buildFormsUrl(BASE, 'Pinchat', 'ASA', '2026-03-02')
    expect(url).toContain(BASE)
    expect(url).toContain('Pinchat')
    expect(url).toContain('ASA')
    expect(url).toContain('2026-03-02')
  })

  it('encode correctement les caracteres speciaux (espaces, accents)', () => {
    const url = buildFormsUrl(BASE, 'Ateliers de Pinchat', 'Pâtisserie-boulangerie', '2026-03-02')
    // Les espaces doivent etre encodes
    expect(url).not.toContain(' ')
    expect(url).toContain(encodeURIComponent('Ateliers de Pinchat'))
    expect(url).toContain(encodeURIComponent('Pâtisserie-boulangerie'))
  })

  it('contient les bons IDs de champs Microsoft Forms', () => {
    const url = buildFormsUrl(BASE, 'Test', 'Test', '2026-01-01')
    // IDs reels du formulaire d'inscription
    expect(url).toContain('r2876f0c952f44887946296b4c95367a3')
    expect(url).toContain('r1faa50a65150406b95d3a62e45550e40')
    expect(url).toContain('r50efe78018854247bf6e734db7188d70')
  })

  it('place les parametres dans le bon ordre', () => {
    const url = buildFormsUrl(BASE, 'Etab', 'Sect', 'Date')
    const parts = url.split('?')[1].split('&')
    // Premier parametre = etablissement, deuxieme = secteur, troisieme = date
    expect(parts[0]).toContain('Etab')
    expect(parts[1]).toContain('Sect')
    expect(parts[2]).toContain('Date')
  })
})

// ──────────────────────────────────────────────
// aggregateWeekCreneaux — Regroupement par semaine ISO
// ──────────────────────────────────────────────
describe('aggregateWeekCreneaux', () => {
  it('regroupe deux creneaux sur la meme semaine', () => {
    const weeks = [
      { weekNumber: 13, year: 2026, startDate: '2026-03-23', endDate: '2026-03-27', totalSlots: 3, usedSlots: 1 },
      { weekNumber: 13, year: 2026, startDate: '2026-03-24', endDate: '2026-03-28', totalSlots: 5, usedSlots: 2 },
    ]
    const result = aggregateWeekCreneaux(weeks)
    expect(result['2026-13']).toBeDefined()
    expect(result['2026-13'].creneaux).toHaveLength(2)
    expect(result['2026-13'].totalSlots).toBe(8)
    expect(result['2026-13'].usedSlots).toBe(3)
  })

  it('deduplique les creneaux identiques (meme startDate+endDate)', () => {
    const weeks = [
      { weekNumber: 13, year: 2026, startDate: '2026-03-23', endDate: '2026-03-27', totalSlots: 3, usedSlots: 1 },
      { weekNumber: 13, year: 2026, startDate: '2026-03-23', endDate: '2026-03-27', totalSlots: 3, usedSlots: 1 },
    ]
    const result = aggregateWeekCreneaux(weeks)
    expect(result['2026-13'].creneaux).toHaveLength(1)
    expect(result['2026-13'].totalSlots).toBe(3)
  })

  it('separe les creneaux de semaines differentes', () => {
    const weeks = [
      { weekNumber: 13, year: 2026, startDate: '2026-03-23', endDate: '2026-03-27', totalSlots: 3, usedSlots: 1 },
      { weekNumber: 14, year: 2026, startDate: '2026-03-30', endDate: '2026-04-03', totalSlots: 5, usedSlots: 0 },
    ]
    const result = aggregateWeekCreneaux(weeks)
    expect(Object.keys(result)).toHaveLength(2)
    expect(result['2026-13']).toBeDefined()
    expect(result['2026-14']).toBeDefined()
  })

  it('calcule le statut agrege correctement (vert si >50% libre)', () => {
    const weeks = [
      { weekNumber: 10, year: 2026, startDate: '2026-03-02', endDate: '2026-03-06', totalSlots: 10, usedSlots: 2 },
    ]
    const result = aggregateWeekCreneaux(weeks)
    expect(result['2026-10'].status).toBe('available')
  })

  it('calcule le statut agrege correctement (rouge si complet)', () => {
    const weeks = [
      { weekNumber: 10, year: 2026, startDate: '2026-03-02', endDate: '2026-03-06', totalSlots: 3, usedSlots: 3 },
    ]
    const result = aggregateWeekCreneaux(weeks)
    expect(result['2026-10'].status).toBe('full')
  })

  it('retourne un objet vide si le tableau est vide', () => {
    expect(Object.keys(aggregateWeekCreneaux([])).length).toBe(0)
  })
})

// ──────────────────────────────────────────────
// transformPlanningData — Conversion plat → hierarchique
// ──────────────────────────────────────────────
describe('transformPlanningData', () => {
  // Donnees de test representant le format plat Power Automate
  const FLAT_DATA = {
    lastUpdated: '2026-03-07T10:00:00',
    formsUrl: 'https://forms.office.com/test',
    formsUrlNouvelEtablissement: 'https://forms.office.com/etab',
    formsUrlNouveauSecteur: 'https://forms.office.com/sect',
    creneaux: [
      {
        etablissement: 'Ateliers de Pinchat',
        secteur: 'ASA',
        description: 'Description test',
        icon: '🏭',
        dateDebut: '2026-03-02',
        dateFin: '2026-03-06',
        placesTotal: 3,
        placesUtilisees: 1,
      },
      {
        etablissement: 'Ateliers de Pinchat',
        secteur: 'Cuisine',
        dateDebut: '2026-03-09',
        dateFin: '2026-03-13',
        placesTotal: 5,
        placesUtilisees: 0,
      },
    ],
  }

  it('retourne les donnees telles quelles si "etablissements" existe (retrocompatibilite)', () => {
    const oldFormat = { etablissements: [{ name: 'Test' }] }
    const result = transformPlanningData(oldFormat)
    expect(result).toBe(oldFormat)
  })

  it('genere la structure hierarchique correcte', () => {
    const result = transformPlanningData(FLAT_DATA)
    expect(result.etablissements).toBeDefined()
    expect(result.etablissements).toHaveLength(1)
    expect(result.etablissements[0].name).toBe('Ateliers de Pinchat')
  })

  it('cree les secteurs sous l\'etablissement', () => {
    const result = transformPlanningData(FLAT_DATA)
    const etab = result.etablissements[0]
    expect(etab.secteurs).toHaveLength(2)
    const noms = etab.secteurs.map((s) => s.name)
    expect(noms).toContain('ASA')
    expect(noms).toContain('Cuisine')
  })

  it('genere un slug URL-friendly pour l\'ID', () => {
    const result = transformPlanningData(FLAT_DATA)
    expect(result.etablissements[0].id).toBe('ateliers-de-pinchat')
  })

  it('conserve les metadonnees (lastUpdated, formsUrl, etc.)', () => {
    const result = transformPlanningData(FLAT_DATA)
    expect(result.lastUpdated).toBe(FLAT_DATA.lastUpdated)
    expect(result.formsUrl).toBe(FLAT_DATA.formsUrl)
    expect(result.formsUrlNouvelEtablissement).toBe(FLAT_DATA.formsUrlNouvelEtablissement)
    expect(result.formsUrlNouveauSecteur).toBe(FLAT_DATA.formsUrlNouveauSecteur)
  })

  it('ajoute l\'objet organization avec le nom de la fondation', () => {
    const result = transformPlanningData(FLAT_DATA)
    expect(result.organization).toBeDefined()
    expect(result.organization.name).toBe('Fondation Clair Bois')
  })

  it('genere des semaines (weeks) pour chaque creneau', () => {
    const result = transformPlanningData(FLAT_DATA)
    const asa = result.etablissements[0].secteurs.find((s) => s.name === 'ASA')
    // Le creneau du 2 au 6 mars 2026 couvre la semaine 10 uniquement
    expect(asa.weeks.length).toBeGreaterThanOrEqual(1)
    expect(asa.weeks[0].weekNumber).toBeDefined()
    expect(asa.weeks[0].totalSlots).toBe(3)
    expect(asa.weeks[0].usedSlots).toBe(1)
  })

  it('calcule le statut de chaque semaine generee', () => {
    const result = transformPlanningData(FLAT_DATA)
    const asa = result.etablissements[0].secteurs.find((s) => s.name === 'ASA')
    // 3 places, 1 utilisee → 66% libre → available
    expect(asa.weeks[0].status).toBe('available')
  })

  it('genere plusieurs semaines pour un creneau couvrant 2+ semaines', () => {
    const data = {
      lastUpdated: '2026-03-07T10:00:00',
      formsUrl: '',
      creneaux: [
        {
          etablissement: 'Test',
          secteur: 'S1',
          dateDebut: '2026-03-02',
          dateFin: '2026-03-13', // 2 semaines (S10 + S11)
          placesTotal: 4,
          placesUtilisees: 1,
        },
      ],
    }
    const result = transformPlanningData(data)
    const s1 = result.etablissements[0].secteurs[0]
    // Doit couvrir au moins 2 semaines
    expect(s1.weeks.length).toBeGreaterThanOrEqual(2)
  })

  it('recupere la description et l\'icone de l\'etablissement', () => {
    const result = transformPlanningData(FLAT_DATA)
    expect(result.etablissements[0].description).toBe('Description test')
    expect(result.etablissements[0].icon).toBe('🏭')
  })

  it('gere les creneaux sans description ni icone', () => {
    const data = {
      lastUpdated: '',
      formsUrl: '',
      creneaux: [
        {
          etablissement: 'Vide',
          secteur: 'S1',
          dateDebut: '2026-03-02',
          dateFin: '2026-03-06',
          placesTotal: 2,
          placesUtilisees: 0,
        },
      ],
    }
    const result = transformPlanningData(data)
    expect(result.etablissements[0].description).toBe('')
    expect(result.etablissements[0].icon).toBe('')
  })

  it('inclut modulesMetiers si present dans les donnees source', () => {
    const data = {
      ...FLAT_DATA,
      modulesMetiers: { semaines: [] },
    }
    const result = transformPlanningData(data)
    expect(result.modulesMetiers).toEqual({ semaines: [] })
  })

  it('met modulesMetiers a null si absent des donnees source', () => {
    const result = transformPlanningData(FLAT_DATA)
    expect(result.modulesMetiers).toBeNull()
  })
})

// ──────────────────────────────────────────────
// getMonthName — Nom du mois en francais
// ──────────────────────────────────────────────
describe('getMonthName', () => {
  it('retourne le nom du mois en francais avec l\'annee', () => {
    const result = getMonthName(2, 2026) // mars 2026
    expect(result).toMatch(/mars/i)
    expect(result).toContain('2026')
  })
})

// ──────────────────────────────────────────────
// countAvailableWeeks — Comptage des semaines non completes
// ──────────────────────────────────────────────
describe('countAvailableWeeks', () => {
  it('compte les semaines dont le statut n\'est pas "full"', () => {
    const secteur = {
      weeks: [
        { status: 'available' },
        { status: 'almost_full' },
        { status: 'full' },
        { status: 'available' },
      ],
    }
    expect(countAvailableWeeks(secteur)).toBe(3)
  })

  it('retourne 0 si toutes les semaines sont completes', () => {
    const secteur = {
      weeks: [{ status: 'full' }, { status: 'full' }],
    }
    expect(countAvailableWeeks(secteur)).toBe(0)
  })

  it('retourne le total si aucune semaine n\'est complete', () => {
    const secteur = {
      weeks: [{ status: 'available' }, { status: 'almost_full' }],
    }
    expect(countAvailableWeeks(secteur)).toBe(2)
  })
})

// ──────────────────────────────────────────────
// getMondayOfWeek — Lundi d'une semaine ISO
// ──────────────────────────────────────────────
describe('getMondayOfWeek', () => {
  it('retourne un lundi (jour de la semaine = 1)', () => {
    const monday = getMondayOfWeek(13, 2026)
    expect(monday.getDay()).toBe(1)
  })

  it('retourne la bonne date pour la semaine 1 de 2026', () => {
    // La semaine 1 de 2026 commence le lundi 29 decembre 2025
    const monday = getMondayOfWeek(1, 2026)
    expect(monday.getDay()).toBe(1)
  })

  it('retourne une date coherente pour la semaine 10 de 2026', () => {
    const monday = getMondayOfWeek(10, 2026)
    // Doit etre en mars 2026
    expect(monday.getMonth()).toBe(2) // mars = index 2
    expect(monday.getDay()).toBe(1)
  })
})
