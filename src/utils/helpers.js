/**
 * helpers.js — Fonctions utilitaires du calendrier Clair-Bois.
 *
 * Ce fichier contient toute la logique metier du frontend :
 *  - Transformation des donnees Power Automate → structure React
 *  - Calcul des statuts de disponibilite (vert/orange/rouge)
 *  - Agregation des creneaux chevauchants par semaine
 *  - Generation des URLs d'inscription pre-remplies (Microsoft Forms)
 *  - Calculs de dates ISO (semaines, calendrier mensuel)
 */

// ===================================================================
// STATUTS DE DISPONIBILITE
// ===================================================================

/**
 * Retourne les classes CSS Tailwind pour le fond + texte selon le statut.
 * Utilise dans les badges, en-tetes et indicateurs visuels.
 *
 * @param {'available'|'almost_full'|'full'|string} status
 * @returns {string} Classes Tailwind (ex: "bg-cb-green text-white")
 */
export function getStatusColor(status) {
  switch (status) {
    case 'available':
      return 'bg-cb-green text-white'
    case 'almost_full':
      return 'bg-cb-orange text-white'
    case 'full':
      return 'bg-cb-red text-white'
    default:
      return 'bg-cb-gray text-white'
  }
}

/**
 * Retourne les classes CSS pour un fond leger (cartes du calendrier).
 * Fond pastel + bordure coloree selon le statut.
 */
export function getStatusBgLight(status) {
  switch (status) {
    case 'available':
      return 'bg-cb-green-light border-cb-green'
    case 'almost_full':
      return 'bg-cb-orange-light border-cb-orange'
    case 'full':
      return 'bg-cb-red-light border-cb-red'
    default:
      return 'bg-cb-gray-light border-cb-gray'
  }
}

/** Retourne le libelle francais du statut de disponibilite */
export function getStatusLabel(status) {
  switch (status) {
    case 'available':
      return 'Disponible'
    case 'almost_full':
      return 'Presque complet'
    case 'full':
      return 'Complet'
    default:
      return 'Non défini'
  }
}

/**
 * Calcule le statut de disponibilite a partir du nombre de places.
 * Regle : >50% libre = vert, 1-50% = orange, 0 = rouge.
 *
 * @param {number} totalSlots  - Nombre total de places du creneau
 * @param {number} usedSlots   - Nombre de places deja occupees
 * @returns {'available'|'almost_full'|'full'}
 */
export function computeStatus(totalSlots, usedSlots) {
  const available = totalSlots - usedSlots
  if (available <= 0) return 'full'
  if (available / totalSlots > 0.5) return 'available'
  return 'almost_full'
}

// ===================================================================
// FORMATAGE DES DATES
// ===================================================================

/** Formate une date ISO (ex: "2026-03-01") en francais : "1 mars 2026" */
export function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('fr-CH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Formate une date ISO en format court : "1 mars" (sans l'annee) */
export function formatDateShort(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('fr-CH', {
    day: 'numeric',
    month: 'short',
  })
}

/** Retourne le nom du mois en francais : "mars 2026" */
export function getMonthName(month, year) {
  const date = new Date(year, month, 1)
  return date.toLocaleDateString('fr-CH', { month: 'long', year: 'numeric' })
}

// ===================================================================
// CALCULS DE PLACES ET DEDUPLICATION
// ===================================================================

/** Compte le nombre de semaines non completes dans un secteur */
export function countAvailableWeeks(secteur) {
  return secteur.weeks.filter((w) => w.status !== 'full').length
}

/**
 * Deduplique les semaines par creneau unique (startDate + endDate).
 * Un meme creneau couvrant plusieurs semaines genere des doublons
 * dans le tableau weeks[] — cette fonction les elimine pour le comptage
 * correct des places sur la page etablissement.
 */
export function getUniqueCreneaux(weeks) {
  const seen = new Map()
  for (const w of weeks) {
    const key = `${w.startDate}-${w.endDate}`
    if (!seen.has(key)) {
      seen.set(key, w)
    }
  }
  return Array.from(seen.values())
}

/**
 * Agrege les semaines par (annee, numero de semaine ISO) pour gerer
 * les creneaux chevauchants. Quand plusieurs creneaux couvrent la meme
 * semaine dans un secteur, cette fonction les regroupe.
 *
 * Resultat : un objet indexe par "annee-numSemaine", contenant :
 *  - creneaux[]  : liste des creneaux individuels (dedupliques)
 *  - totalSlots   : somme des places de tous les creneaux
 *  - usedSlots    : somme des places utilisees
 *  - status       : statut agrege (vert/orange/rouge)
 *
 * Utilise par SecteurCalendar pour afficher "S13 (2)" quand
 * 2 creneaux se chevauchent sur la semaine 13.
 *
 * @param {Array} weeks - Tableau de semaines du secteur
 * @returns {Object} Index { "2026-13": { weekNumber, creneaux[], totalSlots, ... } }
 */
export function aggregateWeekCreneaux(weeks) {
  const map = {}
  for (const w of weeks) {
    const key = `${w.year}-${w.weekNumber}`
    if (!map[key]) {
      map[key] = {
        weekNumber: w.weekNumber,
        year: w.year,
        creneaux: [],
        totalSlots: 0,
        usedSlots: 0,
        status: 'unknown',
      }
    }
    // Eviter les doublons : meme creneau qui couvre cette semaine
    const already = map[key].creneaux.some(
      (c) => c.startDate === w.startDate && c.endDate === w.endDate
    )
    if (!already) {
      map[key].creneaux.push(w)
      map[key].totalSlots += w.totalSlots
      map[key].usedSlots += w.usedSlots
    }
  }
  // Calculer le statut agrege de chaque semaine
  for (const key of Object.keys(map)) {
    map[key].status = computeStatus(map[key].totalSlots, map[key].usedSlots)
  }
  return map
}

// ===================================================================
// URL D'INSCRIPTION PRE-REMPLIE (MICROSOFT FORMS)
// ===================================================================

/**
 * Construit l'URL du formulaire d'inscription avec les champs pre-remplis.
 * Les IDs correspondent aux vrais champs du Microsoft Forms d'inscription :
 *  - r2876f0c9... → Etablissement souhaite
 *  - r1faa50a6... → Secteur souhaite
 *  - r50efe780... → Date de debut souhaitee
 *
 * @param {string} baseUrl       - URL de base du formulaire Forms
 * @param {string} etablissement - Nom de l'etablissement
 * @param {string} secteur       - Nom du secteur
 * @param {string} startDate     - Date de debut (format ISO)
 * @returns {string} URL complete avec parametres encodes
 */
export function buildFormsUrl(baseUrl, etablissement, secteur, startDate) {
  const e = encodeURIComponent
  return `${baseUrl}?r2876f0c952f44887946296b4c95367a3=${e(etablissement)}&r1faa50a65150406b95d3a62e45550e40=${e(secteur)}&r50efe78018854247bf6e734db7188d70=${e(startDate)}`
}

// ===================================================================
// CALCULS DE DATES ISO
// ===================================================================

/**
 * Retourne le numero de semaine ISO 8601 pour une date donnee.
 * La semaine 1 est celle qui contient le premier jeudi de l'annee.
 */
export function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
}

/** Retourne la date du lundi d'une semaine ISO donnee */
export function getMondayOfWeek(weekNumber, year) {
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (weekNumber - 1) * 7)
  return monday
}

// ===================================================================
// GENERATION DE LA GRILLE CALENDRIER
// ===================================================================

/**
 * Genere les jours d'un mois pour l'affichage en grille calendrier.
 * Retourne un tableau de Date ou null (jours vides avant le 1er du mois).
 * La semaine commence le lundi (standard europeen).
 */
export function getCalendarDays(month, year) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Decalage pour que lundi = 0 (au lieu de dimanche = 0 en JS)
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const days = []

  // Cases vides avant le premier jour du mois
  for (let i = 0; i < startDow; i++) {
    days.push(null)
  }

  // Jours effectifs du mois
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }

  return days
}

/** Decoupe un tableau de jours en sous-tableaux de 7 (semaines) */
export function groupByWeeks(calendarDays) {
  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }
  return weeks
}

// ===================================================================
// TRANSFORMATION DES DONNEES POWER AUTOMATE → REACT
// ===================================================================

/** Genere un identifiant URL-friendly a partir d'un nom (ex: "Ateliers de Pinchat" → "ateliers-de-pinchat") */
function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Transforme le format plat genere par Power Automate (Flux 3) en
 * structure hierarchique utilisee par les composants React.
 *
 * Format d'entree (Power Automate) :
 *   { creneaux: [{ etablissement, secteur, dateDebut, dateFin, placesTotal, placesUtilisees }] }
 *
 * Format de sortie (React) :
 *   { etablissements: [{ name, secteurs: [{ name, weeks: [{ weekNumber, totalSlots, ... }] }] }] }
 *
 * Pour chaque creneau, la fonction genere une entree par semaine ISO couverte
 * (un creneau du 1er au 14 mars = entrees pour S10, S11).
 *
 * Retrocompatibilite : si le JSON contient deja "etablissements", il est retourne tel quel.
 *
 * @param {Object} flat - Donnees brutes depuis planning.json
 * @returns {Object} Donnees structurees pour les composants React
 */
export function transformPlanningData(flat) {
  // Retrocompatibilite avec l'ancien format (mock de developpement)
  if (flat.etablissements) return flat

  const { lastUpdated, formsUrl, formsUrlNouvelEtablissement, formsUrlNouveauSecteur, creneaux } = flat

  // Construire la hierarchie etablissements > secteurs
  const etabMap = {}
  for (const c of creneaux) {
    // Creer l'etablissement s'il n'existe pas encore
    if (!etabMap[c.etablissement]) {
      etabMap[c.etablissement] = {
        id: slugify(c.etablissement),
        name: c.etablissement,
        description: c.description || '',
        icon: c.icon || '',
        secteursMap: {},
      }
    } else {
      // Completer description/icon si fournis par un autre creneau
      if (c.description && !etabMap[c.etablissement].description) {
        etabMap[c.etablissement].description = c.description
      }
      if (c.icon && !etabMap[c.etablissement].icon) {
        etabMap[c.etablissement].icon = c.icon
      }
    }

    const etab = etabMap[c.etablissement]

    // Creer le secteur s'il n'existe pas encore
    if (!etab.secteursMap[c.secteur]) {
      etab.secteursMap[c.secteur] = {
        id: slugify(c.secteur),
        name: c.secteur,
        description: '',
        weeks: [],
      }
    }

    // Generer une entree par semaine ISO couverte par ce creneau
    const startD = new Date(c.dateDebut + 'T00:00:00')
    const endD = new Date(c.dateFin + 'T00:00:00')
    let cursor = new Date(startD)

    while (cursor <= endD) {
      const wn = getISOWeekNumber(cursor)

      // Gerer le cas ou la semaine ISO chevauche le changement d'annee
      const cMonth = cursor.getMonth()
      const cYear = cursor.getFullYear()
      const yr =
        cMonth === 0 && wn > 50
          ? cYear - 1         // Janvier mais semaine 52/53 → annee precedente
          : cMonth === 11 && wn === 1
            ? cYear + 1       // Decembre mais semaine 1 → annee suivante
            : cYear

      etab.secteursMap[c.secteur].weeks.push({
        weekNumber: wn,
        year: yr,
        startDate: c.dateDebut,
        endDate: c.dateFin,
        totalSlots: c.placesTotal,
        usedSlots: c.placesUtilisees,
        status: computeStatus(c.placesTotal, c.placesUtilisees),
      })

      // Avancer au lundi de la semaine suivante
      const curDow = cursor.getDay() || 7
      cursor.setDate(cursor.getDate() + (8 - curDow))
    }
  }

  // Convertir les maps en tableaux pour les composants React
  const etablissements = Object.values(etabMap).map((etab) => ({
    id: etab.id,
    name: etab.name,
    description: etab.description,
    icon: etab.icon,
    secteurs: Object.values(etab.secteursMap),
  }))

  return {
    lastUpdated,
    formsUrl,
    formsUrlNouvelEtablissement,
    formsUrlNouveauSecteur,
    modulesMetiers: flat.modulesMetiers || null,
    organization: {
      name: 'Fondation Clair Bois',
      logo: 'assets/logo-clair-bois.png',
      description: 'Calendrier des disponibilités de stage pour les référents externes',
    },
    etablissements,
  }
}
