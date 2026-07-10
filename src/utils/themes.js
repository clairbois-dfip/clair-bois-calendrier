/*
 * themes.js — Système de thèmes visuels des formulaires (CMS).
 *
 * Un thème = un jeu de couleurs de MARQUE + une police + un fond de
 * formulaire. Il est stocké dans le schéma (`schema.theme`) et voyage donc
 * avec formulaire-schema.json : publier un thème fonctionne exactement comme
 * publier un champ.
 *
 * Mécanisme : Tailwind v4 génère les utilitaires `cb-*` à partir de
 * variables CSS (`--color-cb-blue`, etc.). `appliquerTheme` surcharge ces
 * variables sur la racine du document → tout le site se recolore en direct,
 * sans recompilation.
 *
 * PÉRIMÈTRE VOLONTAIRE : le thème pilote la couleur PRIMAIRE (marine : header,
 * titres, navigation), l'ACCENT (boutons d'action, focus), la POLICE et le
 * FOND des formulaires. Les couleurs SÉMANTIQUES du calendrier — vert (libre),
 * orange (partiel), rouge (complet), gris (fermé) — restent FIXES : les
 * modifier changerait le sens du code de disponibilité.
 */

/**
 * Mélange une couleur hex avec du blanc (ratio 0..1 = part de blanc).
 * Tolérant : accepte #rgb / #rrggbb (avec ou sans #, toute casse). Si l'entrée
 * n'est pas un hex valide (ex. saisie manuelle en cours de frappe), la
 * renvoie telle quelle plutôt que de produire une couleur cassée.
 */
export function melangeBlanc(hex, ratioBlanc) {
  const m = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec((hex || '').trim());
  if (!m) return typeof hex === 'string' ? hex : '#ffffff';
  let n = m[1];
  if (n.length === 3) n = n.split('').map((c) => c + c).join('');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const mix = (c) => Math.round(c + (255 - c) * ratioBlanc);
  const hx = (c) => mix(c).toString(16).padStart(2, '0');
  return `#${hx(r)}${hx(g)}${hx(b)}`;
}

/** Dérive un fond de formulaire doux à partir des couleurs primaire + accent. */
export function deriverFond(primaire, accent) {
  const a = melangeBlanc(primaire, 0.9);
  const b = melangeBlanc(accent, 0.9);
  const c = melangeBlanc(accent, 0.94);
  return `linear-gradient(160deg, ${a} 0%, ${b} 30%, ${c} 50%, ${a} 80%, ${melangeBlanc(primaire, 0.86)} 100%)`;
}

/**
 * Catalogue des thèmes proposés. Le PREMIER est l'officiel Clair Bois —
 * ses valeurs sont EXACTEMENT celles d'avant l'éditeur de thème (index.css
 * @theme + gradient historique des formulaires), à ne jamais modifier.
 */
export const THEMES = [
  {
    cle: 'clairbois',
    nom: 'Clair Bois — officiel',
    primaire: '#092C6A',
    primaireLight: '#dbeafe',
    accent: '#2EA3F2',
    accentLight: '#e0f2fe',
    police: "'Open Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fondFormulaire: 'linear-gradient(160deg, #e3ecfa 0%, #ede4f3 30%, #f5f0fa 50%, #e8f0f8 80%, #dce8f5 100%)',
  },
  {
    cle: 'ocean',
    nom: 'Océan',
    primaire: '#0E4D64',
    primaireLight: '#d5eef2',
    accent: '#17B0C4',
    accentLight: '#dbf4f8',
    police: "'Nunito', 'Open Sans', system-ui, sans-serif",
    fondFormulaire: 'linear-gradient(160deg, #e0f0f3 0%, #e6f4f0 30%, #eef8f5 50%, #e2f1f4 80%, #d6ebef 100%)',
  },
  {
    cle: 'foret',
    nom: 'Forêt',
    primaire: '#1F513A',
    primaireLight: '#dcefe2',
    accent: '#3FA55F',
    accentLight: '#e2f3e8',
    police: "'Poppins', 'Open Sans', system-ui, sans-serif",
    fondFormulaire: 'linear-gradient(160deg, #e6f2e8 0%, #eaf5e6 30%, #f1f8ea 50%, #e6f3e9 80%, #dbefdf 100%)',
  },
  {
    cle: 'aubergine',
    nom: 'Aubergine',
    primaire: '#3E2A63',
    primaireLight: '#eae3f6',
    accent: '#8A63D2',
    accentLight: '#efe9fb',
    police: "'Inter', 'Open Sans', system-ui, sans-serif",
    fondFormulaire: 'linear-gradient(160deg, #ece5f5 0%, #efe4f3 30%, #f5f0fa 50%, #ece6f6 80%, #e2dbf2 100%)',
  },
  {
    cle: 'terracotta',
    nom: 'Terracotta',
    primaire: '#7A3B25',
    primaireLight: '#f5e5dd',
    accent: '#E07A3F',
    accentLight: '#fbe9dd',
    police: "'Nunito', 'Open Sans', system-ui, sans-serif",
    fondFormulaire: 'linear-gradient(160deg, #f7ece4 0%, #f7ebe2 30%, #faf3ea 50%, #f6eee6 80%, #f2e5db 100%)',
  },
  {
    cle: 'ardoise',
    nom: 'Ardoise',
    primaire: '#243244',
    primaireLight: '#e1e6ee',
    accent: '#3B82F6',
    accentLight: '#e2edfd',
    police: "'Inter', 'Open Sans', system-ui, sans-serif",
    fondFormulaire: 'linear-gradient(160deg, #e9edf3 0%, #eaeef5 30%, #f1f4f9 50%, #e8edf5 80%, #dfe5ef 100%)',
  },
];

/** Thème par défaut (l'officiel). */
export function themeParDefaut() {
  return { ...THEMES[0] };
}

/**
 * Complète un thème partiel (issu du schéma ou d'une personnalisation) :
 * dérive les variantes -light et le fond manquants, garantit une police.
 */
export function normaliserTheme(t) {
  if (!t || typeof t !== 'object') return themeParDefaut();
  const base = themeParDefaut();
  const primaire = t.primaire || base.primaire;
  const accent = t.accent || base.accent;
  return {
    cle: t.cle || 'personnalise',
    nom: t.nom || 'Personnalisé',
    primaire,
    accent,
    primaireLight: t.primaireLight || melangeBlanc(primaire, 0.86),
    accentLight: t.accentLight || melangeBlanc(accent, 0.86),
    police: t.police || base.police,
    fondFormulaire: t.fondFormulaire || deriverFond(primaire, accent),
  };
}

/**
 * Applique un thème en surchargeant les variables CSS sur la racine du
 * document (les utilitaires Tailwind `cb-*` s'y réfèrent → recoloration
 * immédiate). N'affecte JAMAIS les couleurs sémantiques du calendrier.
 *
 * @param {object} theme Thème (partiel accepté — normalisé ici).
 */
export function appliquerTheme(theme) {
  const t = normaliserTheme(theme);
  const root = document.documentElement;
  root.style.setProperty('--color-cb-blue', t.primaire);
  root.style.setProperty('--color-cb-blue-light', t.primaireLight);
  root.style.setProperty('--color-cb-accent', t.accent);
  root.style.setProperty('--color-cb-accent-light', t.accentLight);
  root.style.setProperty('--cb-police', t.police);
  root.style.setProperty('--cb-form-bg', t.fondFormulaire);
}
