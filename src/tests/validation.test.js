/**
 * Tests unitaires — Fonctions de validation du formulaire Clair-Bois.
 *
 * Couvre : AVS, téléphone, NPA, email, date de naissance, champ requis,
 * formatage AVS et téléphone.
 */
import { describe, it, expect } from 'vitest'
import {
  validateRequired, validateAVS, validatePhone, validatePhoneOptional,
  validateNPA, validateEmail, validateEmailOptional, validateDateNaissance,
  validateDate, validateNumber,
  formatAVS, formatPhone,
} from '../utils/validation'

// ──────────────────────────────────────────────
// Données de test falsifiées
// ──────────────────────────────────────────────
const FAKE = {
  avs_valide: '756.1234.5678.97',
  avs_sans_points: '7561234567897',
  avs_trop_court: '756.1234.5678',
  avs_mauvais_prefix: '123.4567.8901.23',
  avs_lettres: '756.ABCD.EFGH.IJ',

  tel_valide_plus41: '+41 79 123 45 67',
  tel_valide_0: '079 123 45 67',
  tel_compact: '0791234567',
  tel_trop_court: '+41 79 123',
  tel_invalide: '1234',

  email_valide: 'jean.dupont@clairbois.ch',
  email_invalide_no_at: 'jean.dupont.clairbois.ch',
  email_invalide_no_domain: 'jean@',
  email_vide: '',

  npa_valide: '1205',
  npa_geneve: '1201',
  npa_trop_court: '120',
  npa_trop_long: '12050',
  npa_lettres: 'ABCD',

  date_valide: '2000-05-15',
  date_trop_jeune: '2020-01-01',
  date_future: '2030-01-01',
  date_trop_vieux: '1910-01-01',
}

// ──────────────────────────────────────────────
// validateRequired
// ──────────────────────────────────────────────
describe('validateRequired', () => {
  it('refuse une valeur vide', () => {
    expect(validateRequired('').valid).toBe(false)
  })
  it('refuse null', () => {
    expect(validateRequired(null).valid).toBe(false)
  })
  it('refuse un espace seul', () => {
    expect(validateRequired('   ').valid).toBe(false)
  })
  it('accepte une valeur non vide', () => {
    expect(validateRequired('Jean').valid).toBe(true)
  })
})

// ──────────────────────────────────────────────
// validateAVS
// ──────────────────────────────────────────────
describe('validateAVS', () => {
  it('accepte un AVS valide avec points', () => {
    expect(validateAVS(FAKE.avs_valide).valid).toBe(true)
  })
  it('accepte un AVS valide sans points', () => {
    expect(validateAVS(FAKE.avs_sans_points).valid).toBe(true)
  })
  it('refuse un AVS trop court', () => {
    const r = validateAVS(FAKE.avs_trop_court)
    expect(r.valid).toBe(false)
    expect(r.message).toContain('13 chiffres')
  })
  it('refuse un AVS sans prefix 756', () => {
    const r = validateAVS(FAKE.avs_mauvais_prefix)
    expect(r.valid).toBe(false)
    expect(r.message).toContain('756')
  })
  it('refuse un AVS avec lettres', () => {
    expect(validateAVS(FAKE.avs_lettres).valid).toBe(false)
  })
  it('refuse un AVS vide', () => {
    expect(validateAVS('').valid).toBe(false)
  })
})

// ──────────────────────────────────────────────
// validatePhone
// ──────────────────────────────────────────────
describe('validatePhone', () => {
  it('accepte +41 79 123 45 67', () => {
    expect(validatePhone(FAKE.tel_valide_plus41).valid).toBe(true)
  })
  it('accepte 079 123 45 67', () => {
    expect(validatePhone(FAKE.tel_valide_0).valid).toBe(true)
  })
  it('accepte 0791234567 compact', () => {
    expect(validatePhone(FAKE.tel_compact).valid).toBe(true)
  })
  it('refuse un numéro trop court', () => {
    expect(validatePhone(FAKE.tel_trop_court).valid).toBe(false)
  })
  it('refuse 1234', () => {
    expect(validatePhone(FAKE.tel_invalide).valid).toBe(false)
  })
  it('refuse une valeur vide', () => {
    expect(validatePhone('').valid).toBe(false)
  })
})

// ──────────────────────────────────────────────
// validatePhoneOptional
// ──────────────────────────────────────────────
describe('validatePhoneOptional', () => {
  it('accepte une valeur vide', () => {
    expect(validatePhoneOptional('').valid).toBe(true)
  })
  it('valide un numéro valide', () => {
    expect(validatePhoneOptional(FAKE.tel_valide_plus41).valid).toBe(true)
  })
  it('refuse un numéro invalide', () => {
    expect(validatePhoneOptional(FAKE.tel_invalide).valid).toBe(false)
  })
})

// ──────────────────────────────────────────────
// validateNPA
// ──────────────────────────────────────────────
describe('validateNPA', () => {
  it('accepte 1205', () => {
    expect(validateNPA(FAKE.npa_valide).valid).toBe(true)
  })
  it('accepte 1201', () => {
    expect(validateNPA(FAKE.npa_geneve).valid).toBe(true)
  })
  it('refuse un NPA trop court', () => {
    expect(validateNPA(FAKE.npa_trop_court).valid).toBe(false)
  })
  it('refuse un NPA trop long', () => {
    expect(validateNPA(FAKE.npa_trop_long).valid).toBe(false)
  })
  it('refuse des lettres', () => {
    expect(validateNPA(FAKE.npa_lettres).valid).toBe(false)
  })
  it('refuse un NPA vide', () => {
    expect(validateNPA('').valid).toBe(false)
  })
})

// ──────────────────────────────────────────────
// validateEmail
// ──────────────────────────────────────────────
describe('validateEmail', () => {
  it('accepte un email valide', () => {
    expect(validateEmail(FAKE.email_valide).valid).toBe(true)
  })
  it('refuse un email sans @', () => {
    expect(validateEmail(FAKE.email_invalide_no_at).valid).toBe(false)
  })
  it('refuse un email sans domaine complet', () => {
    expect(validateEmail(FAKE.email_invalide_no_domain).valid).toBe(false)
  })
  it('refuse un email vide', () => {
    expect(validateEmail('').valid).toBe(false)
  })
})

// ──────────────────────────────────────────────
// validateEmailOptional
// ──────────────────────────────────────────────
describe('validateEmailOptional', () => {
  it('accepte un email vide', () => {
    expect(validateEmailOptional('').valid).toBe(true)
  })
  it('valide un email valide', () => {
    expect(validateEmailOptional(FAKE.email_valide).valid).toBe(true)
  })
  it('refuse un email invalide', () => {
    expect(validateEmailOptional(FAKE.email_invalide_no_at).valid).toBe(false)
  })
})

// ──────────────────────────────────────────────
// validateDateNaissance
// ──────────────────────────────────────────────
describe('validateDateNaissance', () => {
  it('accepte une date valide (25 ans)', () => {
    expect(validateDateNaissance(FAKE.date_valide).valid).toBe(true)
  })
  it('refuse une date trop jeune (<15 ans)', () => {
    // La regle metier est passee de 14 a 15 ans dans validation.js
    const r = validateDateNaissance(FAKE.date_trop_jeune)
    expect(r.valid).toBe(false)
    expect(r.message).toContain('15 ans')
  })
  it('refuse une date future', () => {
    const r = validateDateNaissance(FAKE.date_future)
    expect(r.valid).toBe(false)
    expect(r.message).toContain('futur')
  })
  it('refuse une date trop ancienne (>99 ans)', () => {
    const r = validateDateNaissance(FAKE.date_trop_vieux)
    expect(r.valid).toBe(false)
  })
  it('refuse une valeur vide', () => {
    expect(validateDateNaissance('').valid).toBe(false)
  })
})

// ──────────────────────────────────────────────
// formatAVS
// ──────────────────────────────────────────────
describe('formatAVS', () => {
  it('formate 7561234567897 en 756.1234.5678.97', () => {
    expect(formatAVS('7561234567897')).toBe('756.1234.5678.97')
  })
  it('formate partiellement 7561234', () => {
    expect(formatAVS('7561234')).toBe('756.1234')
  })
  it('tronque à 13 chiffres max', () => {
    expect(formatAVS('75612345678901234')).toBe('756.1234.5678.90')
  })
  it('retourne vide pour vide', () => {
    expect(formatAVS('')).toBe('')
  })
})

// ──────────────────────────────────────────────
// formatPhone
// ──────────────────────────────────────────────
describe('formatPhone', () => {
  it('formate 0791234567 en 079 123 45 67', () => {
    expect(formatPhone('0791234567')).toBe('079 123 45 67')
  })
  it('formate +41791234567 en +41 79 123 45 67', () => {
    expect(formatPhone('+41791234567')).toBe('+41 79 123 45 67')
  })
})

// ──────────────────────────────────────────────
// validateDate — règles configurables (mode édition)
// ──────────────────────────────────────────────
describe('validateDate (règles configurables du CMS)', () => {
  const ilYaAns = (n) => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - n)
    return d.toISOString().slice(0, 10)
  }
  it('sans règle : accepte toute date bien formée (passé comme futur)', () => {
    expect(validateDate('2030-01-01', {}).valid).toBe(true)
    expect(validateDate('1950-01-01', {}).valid).toBe(true)
  })
  it('refuse une date vide ou mal formée', () => {
    expect(validateDate('', {}).valid).toBe(false)
    expect(validateDate('pas-une-date', {}).valid).toBe(false)
  })
  it('ageMin : refuse en dessous, accepte au-dessus, message paramétré', () => {
    const r = validateDate(ilYaAns(12), { ageMin: 16 })
    expect(r.valid).toBe(false)
    expect(r.message).toContain('16 ans')
    expect(validateDate(ilYaAns(20), { ageMin: 16 }).valid).toBe(true)
  })
  it('ageMax : refuse au-dessus', () => {
    const r = validateDate(ilYaAns(70), { ageMax: 65 })
    expect(r.valid).toBe(false)
    expect(r.message).toContain('65')
    expect(validateDate(ilYaAns(40), { ageMax: 65 }).valid).toBe(true)
  })
  it('interditFutur : refuse une date future, accepte le passé', () => {
    expect(validateDate('2099-01-01', { interditFutur: true }).valid).toBe(false)
    expect(validateDate('2099-01-01', { interditFutur: true }).message).toMatch(/futur/i)
    expect(validateDate(ilYaAns(1), { interditFutur: true }).valid).toBe(true)
  })
  it('les règles historiques de la date de naissance sont reproductibles (15/99/futur)', () => {
    const regles = { ageMin: 15, ageMax: 99, interditFutur: true }
    expect(validateDate(ilYaAns(10), regles).valid).toBe(false)
    expect(validateDate(ilYaAns(10), regles).message).toContain('15 ans')
    expect(validateDate('2099-01-01', regles).valid).toBe(false)
    expect(validateDate(ilYaAns(120), regles).valid).toBe(false)
    expect(validateDate(ilYaAns(20), regles).valid).toBe(true)
  })
})

// ──────────────────────────────────────────────
// validateNumber — bornes configurables (mode édition)
// ──────────────────────────────────────────────
describe('validateNumber (règles configurables du CMS)', () => {
  it('refuse vide ou non numérique (message historique « Nombre requis »)', () => {
    expect(validateNumber('', {}).valid).toBe(false)
    expect(validateNumber('', {}).message).toBe('Nombre requis')
    expect(validateNumber('abc', {}).valid).toBe(false)
  })
  it('sans règle : accepte tout nombre, y compris 0 et négatif', () => {
    expect(validateNumber('0', {}).valid).toBe(true)
    expect(validateNumber('-3', {}).valid).toBe(true)
  })
  it('min : refuse en dessous (ex. historique nombre d\'élèves ≥ 1)', () => {
    expect(validateNumber('0', { min: 1 }).valid).toBe(false)
    expect(validateNumber('0', { min: 1 }).message).toContain('1')
    expect(validateNumber('12', { min: 1 }).valid).toBe(true)
  })
  it('max : refuse au-dessus', () => {
    expect(validateNumber('40', { max: 30 }).valid).toBe(false)
    expect(validateNumber('25', { max: 30 }).valid).toBe(true)
  })
})
