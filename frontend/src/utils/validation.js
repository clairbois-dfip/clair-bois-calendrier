/**
 * validation.js — Fonctions de validation pour le formulaire Clair-Bois.
 *
 * Chaque fonction retourne { valid: boolean, message: string }.
 * Message vide si valide.
 */

/** Champ obligatoire non vide */
export function validateRequired(value) {
  if (!value || !value.toString().trim()) {
    return { valid: false, message: 'Ce champ est obligatoire.' }
  }
  return { valid: true, message: '' }
}

/**
 * Numéro AVS suisse : 756.XXXX.XXXX.XX
 * Validation du format + chiffre de contrôle EAN-13.
 */
export function validateAVS(value) {
  if (!value || !value.trim()) {
    return { valid: false, message: 'Le numéro AVS est obligatoire.' }
  }

  // Accepter avec ou sans points/espaces
  const cleaned = value.replace(/[\s.]/g, '')

  if (!cleaned.startsWith('756')) {
    return { valid: false, message: 'Un numéro AVS suisse commence par 756.' }
  }

  if (!/^\d{13}$/.test(cleaned)) {
    return { valid: false, message: 'Format attendu : 756.XXXX.XXXX.XX (13 chiffres).' }
  }

  return { valid: true, message: '' }
}

/** Téléphone suisse : +41, 0XX, avec ou sans espaces */
export function validatePhone(value) {
  if (!value || !value.trim()) {
    return { valid: false, message: 'Le numéro de téléphone est obligatoire.' }
  }
  const cleaned = value.replace(/[\s\-().]/g, '')
  // +41XXXXXXXXX (12 chars) ou 0XXXXXXXXX (10 chars)
  if (/^\+41\d{9}$/.test(cleaned) || /^0\d{9}$/.test(cleaned)) {
    return { valid: true, message: '' }
  }
  return { valid: false, message: 'Format attendu : +41 XX XXX XX XX ou 0XX XXX XX XX.' }
}

/** Téléphone optionnel (vide = valide) */
export function validatePhoneOptional(value) {
  if (!value || !value.trim()) return { valid: true, message: '' }
  return validatePhone(value)
}

/** NPA suisse : 4 chiffres entre 1000 et 9999 */
export function validateNPA(value) {
  if (!value || !value.trim()) {
    return { valid: false, message: 'Le NPA est obligatoire.' }
  }
  const n = parseInt(value, 10)
  if (!/^\d{4}$/.test(value.trim()) || n < 1000 || n > 9999) {
    return { valid: false, message: 'Le NPA doit contenir 4 chiffres (ex: 1205).' }
  }
  return { valid: true, message: '' }
}

/** Email valide */
export function validateEmail(value) {
  if (!value || !value.trim()) {
    return { valid: false, message: 'L\'adresse email est obligatoire.' }
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(value.trim())) {
    return { valid: false, message: 'Veuillez entrer une adresse email valide.' }
  }
  return { valid: true, message: '' }
}

/** Email optionnel (vide = valide) */
export function validateEmailOptional(value) {
  if (!value || !value.trim()) return { valid: true, message: '' }
  return validateEmail(value)
}

/** Date de naissance : pas future, âge entre 14 et 99 ans */
export function validateDateNaissance(value) {
  if (!value || !value.trim()) {
    return { valid: false, message: 'La date de naissance est obligatoire.' }
  }
  const date = new Date(value + 'T00:00:00')
  if (isNaN(date.getTime())) {
    return { valid: false, message: 'Date invalide.' }
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (date > today) {
    return { valid: false, message: 'La date ne peut pas être dans le futur.' }
  }
  const age = Math.floor((today - date) / (365.25 * 24 * 60 * 60 * 1000))
  if (age < 14) {
    return { valid: false, message: 'L\'âge minimum est de 14 ans.' }
  }
  if (age > 99) {
    return { valid: false, message: 'Veuillez vérifier la date de naissance.' }
  }
  return { valid: true, message: '' }
}

/**
 * Formate un numéro AVS en ajoutant les points automatiquement.
 * 7561234567890 → 756.1234.5678.90
 */
export function formatAVS(value) {
  const digits = value.replace(/\D/g, '').slice(0, 13)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 11) return `${digits.slice(0, 3)}.${digits.slice(3, 7)}.${digits.slice(7)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 7)}.${digits.slice(7, 11)}.${digits.slice(11)}`
}

/**
 * Formate un numéro de téléphone suisse.
 * 0791234567 → 079 123 45 67
 */
export function formatPhone(value) {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('41') && digits.length >= 3) {
    const rest = digits.slice(2)
    if (rest.length <= 2) return `+41 ${rest}`
    if (rest.length <= 5) return `+41 ${rest.slice(0, 2)} ${rest.slice(2)}`
    if (rest.length <= 7) return `+41 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`
    return `+41 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 7)} ${rest.slice(7, 9)}`
  }
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  if (digits.length <= 8) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`
}
