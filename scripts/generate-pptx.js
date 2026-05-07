const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "Karim Rochat";
pres.company = "Fondation Clair-Bois";
pres.title = "Calendrier des disponibilités de stage - Clair-Bois";

// ============================================================
// COULEURS & STYLES
// ============================================================
const COLORS = {
  blue: "2563EB",
  blueDark: "1E40AF",
  blueLight: "DBEAFE",
  green: "16A34A",
  greenLight: "DCFCE7",
  orange: "EA580C",
  orangeLight: "FFF7ED",
  red: "DC2626",
  redLight: "FEE2E2",
  gray: "6B7280",
  grayLight: "F3F4F6",
  grayDark: "374151",
  white: "FFFFFF",
  dark: "111827",
};

function addFooter(slide, num, total) {
  slide.addText(`Fondation Clair-Bois — Mars 2026`, {
    x: 0.5, y: 6.9, w: 8, h: 0.4,
    fontSize: 9, color: COLORS.gray, fontFace: "Calibri",
  });
  slide.addText(`${num}/${total}`, {
    x: 11, y: 6.9, w: 1.8, h: 0.4,
    fontSize: 9, color: COLORS.gray, fontFace: "Calibri", align: "right",
  });
}

const TOTAL_SLIDES = 11;

// ============================================================
// SLIDE 1 : PAGE DE TITRE
// ============================================================
let slide = pres.addSlide();
slide.background = { color: COLORS.blue };
slide.addText("Calendrier des disponibilites\nde stage", {
  x: 1, y: 1.5, w: 11, h: 2.5,
  fontSize: 40, fontFace: "Calibri", color: COLORS.white, bold: true,
  align: "center", lineSpacingMultiple: 1.2,
});
slide.addText("Fondation Clair-Bois, Geneve", {
  x: 1, y: 4, w: 11, h: 0.8,
  fontSize: 22, fontFace: "Calibri", color: COLORS.blueLight, align: "center",
});
slide.addText("Presentation a Mme Karavia — 9 mars 2026", {
  x: 1, y: 5, w: 11, h: 0.6,
  fontSize: 16, fontFace: "Calibri", color: COLORS.blueLight, align: "center",
});
slide.addText("Projet realise par Karim Rochat & Miles (IT)", {
  x: 1, y: 5.8, w: 11, h: 0.5,
  fontSize: 13, fontFace: "Calibri", color: COLORS.blueLight, align: "center", italic: true,
});

// ============================================================
// SLIDE 2 : LE PROBLEME
// ============================================================
slide = pres.addSlide();
addFooter(slide, 2, TOTAL_SLIDES);
slide.addText("Le besoin", {
  x: 0.5, y: 0.3, w: 12, h: 0.8,
  fontSize: 30, fontFace: "Calibri", color: COLORS.blueDark, bold: true,
});
slide.addShape(pres.ShapeType.line, {
  x: 0.5, y: 1.05, w: 2, h: 0, line: { color: COLORS.blue, width: 3 },
});

// Problèmes actuels
const problemes = [
  { icon: "X", text: "Pas de visibilite sur les places de stage disponibles" },
  { icon: "X", text: "Les referents externes (ecoles, AI) appellent pour savoir s'il y a de la place" },
  { icon: "X", text: "Mme Karavia gere les demandes manuellement par email/telephone" },
  { icon: "X", text: "Aucun suivi centralise des inscriptions et des documents" },
];

problemes.forEach((p, i) => {
  slide.addShape(pres.ShapeType.ellipse, {
    x: 0.7, y: 1.5 + i * 0.9, w: 0.35, h: 0.35,
    fill: { color: COLORS.redLight }, line: { color: COLORS.red, width: 1 },
  });
  slide.addText("X", {
    x: 0.7, y: 1.5 + i * 0.9, w: 0.35, h: 0.35,
    fontSize: 12, fontFace: "Calibri", color: COLORS.red, bold: true, align: "center", valign: "middle",
  });
  slide.addText(p.text, {
    x: 1.3, y: 1.5 + i * 0.9, w: 11, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: COLORS.grayDark,
  });
});

// Solution
slide.addShape(pres.ShapeType.roundRect, {
  x: 0.5, y: 5.3, w: 12.3, h: 1.3,
  fill: { color: COLORS.greenLight }, line: { color: COLORS.green, width: 1.5 },
  rectRadius: 0.15,
});
slide.addText("La solution : un site web calendrier accessible a tous, anonyme, qui se met a jour automatiquement quand une inscription est faite.", {
  x: 0.8, y: 5.4, w: 11.8, h: 1.1,
  fontSize: 16, fontFace: "Calibri", color: COLORS.green, bold: true, valign: "middle",
});

// ============================================================
// SLIDE 3 : VUE D'ENSEMBLE DE LA SOLUTION
// ============================================================
slide = pres.addSlide();
addFooter(slide, 3, TOTAL_SLIDES);
slide.addText("Comment ca marche ?", {
  x: 0.5, y: 0.3, w: 12, h: 0.8,
  fontSize: 30, fontFace: "Calibri", color: COLORS.blueDark, bold: true,
});
slide.addShape(pres.ShapeType.line, {
  x: 0.5, y: 1.05, w: 2, h: 0, line: { color: COLORS.blue, width: 3 },
});

// Pipeline visuel - 4 boîtes avec flèches
const steps = [
  { title: "Site web\nCalendrier", sub: "Le referent externe\nconsulte les places", color: COLORS.blue, bg: COLORS.blueLight },
  { title: "Formulaire\nMicrosoft Forms", sub: "Il s'inscrit en ligne\n(43 questions)", color: COLORS.orange, bg: COLORS.orangeLight },
  { title: "Traitement\nautomatique", sub: "Power Automate\ncree le dossier", color: COLORS.green, bg: COLORS.greenLight },
  { title: "SharePoint\n+ Dossier", sub: "Donnees stockees\ndocuments classes", color: COLORS.blueDark, bg: COLORS.blueLight },
];

steps.forEach((s, i) => {
  const xPos = 0.4 + i * 3.25;
  // Boîte principale
  slide.addShape(pres.ShapeType.roundRect, {
    x: xPos, y: 1.5, w: 2.8, h: 2,
    fill: { color: s.bg }, line: { color: s.color, width: 2 }, rectRadius: 0.15,
  });
  slide.addText(s.title, {
    x: xPos, y: 1.6, w: 2.8, h: 1,
    fontSize: 16, fontFace: "Calibri", color: s.color, bold: true, align: "center", valign: "middle",
  });
  slide.addText(s.sub, {
    x: xPos, y: 2.6, w: 2.8, h: 0.8,
    fontSize: 11, fontFace: "Calibri", color: COLORS.gray, align: "center", valign: "top",
  });

  // Flèche entre les boîtes
  if (i < 3) {
    slide.addText(">", {
      x: xPos + 2.8, y: 2, w: 0.45, h: 1,
      fontSize: 28, fontFace: "Calibri", color: COLORS.gray, bold: true, align: "center", valign: "middle",
    });
  }
});

// Ligne retour (boucle)
slide.addShape(pres.ShapeType.roundRect, {
  x: 0.4, y: 4.2, w: 12.5, h: 1.5,
  fill: { color: COLORS.grayLight }, line: { color: "D1D5DB", width: 1 }, rectRadius: 0.15,
});
slide.addText("Boucle automatique", {
  x: 0.6, y: 4.25, w: 3, h: 0.4,
  fontSize: 13, fontFace: "Calibri", color: COLORS.blue, bold: true,
});
slide.addText("Quand quelqu'un s'inscrit, le site se met a jour tout seul en quelques minutes.\nLes places disponibles diminuent automatiquement. Aucune action manuelle requise.", {
  x: 0.6, y: 4.65, w: 12, h: 0.9,
  fontSize: 13, fontFace: "Calibri", color: COLORS.grayDark,
});

// Note anonyme
slide.addShape(pres.ShapeType.roundRect, {
  x: 0.4, y: 6, w: 12.5, h: 0.7,
  fill: { color: COLORS.blueLight }, rectRadius: 0.1,
});
slide.addText("Le site est 100% anonyme — pas besoin de compte Microsoft pour consulter les disponibilites.", {
  x: 0.6, y: 6, w: 12, h: 0.7,
  fontSize: 13, fontFace: "Calibri", color: COLORS.blue, bold: true, valign: "middle",
});

// ============================================================
// SLIDE 4 : ECRAN 1 — PAGE D'ACCUEIL
// ============================================================
slide = pres.addSlide();
addFooter(slide, 4, TOTAL_SLIDES);
slide.addText("Ecran 1 — Choix de l'etablissement", {
  x: 0.5, y: 0.3, w: 12, h: 0.8,
  fontSize: 28, fontFace: "Calibri", color: COLORS.blueDark, bold: true,
});
slide.addShape(pres.ShapeType.line, {
  x: 0.5, y: 1.05, w: 2, h: 0, line: { color: COLORS.blue, width: 3 },
});

// Simuler l'écran
slide.addShape(pres.ShapeType.roundRect, {
  x: 0.5, y: 1.3, w: 7.5, h: 5.2,
  fill: { color: COLORS.grayLight }, line: { color: "D1D5DB", width: 1 }, rectRadius: 0.15,
});

// Titre dans l'écran
slide.addText("Calendrier des disponibilites de stage", {
  x: 0.8, y: 1.5, w: 7, h: 0.5,
  fontSize: 14, fontFace: "Calibri", color: COLORS.dark, bold: true, align: "center",
});
slide.addText("Choisissez un etablissement", {
  x: 0.8, y: 2, w: 7, h: 0.4,
  fontSize: 11, fontFace: "Calibri", color: COLORS.gray, align: "center",
});

// Cartes établissements simulées
const etabs = [
  { name: "Blanchisserie Tourbillon", icon: "T-shirt", places: "7 places", color: COLORS.green },
  { name: "Ateliers de Pinchat", icon: "Cuisine", places: "4 places", color: COLORS.green },
  { name: "Ateliers des Minoteries", icon: "Bureau", places: "2 places", color: COLORS.orange },
];

etabs.forEach((e, i) => {
  const yPos = 2.7 + i * 1.1;
  slide.addShape(pres.ShapeType.roundRect, {
    x: 1, y: yPos, w: 6.5, h: 0.9,
    fill: { color: COLORS.white }, line: { color: "E5E7EB", width: 1 }, rectRadius: 0.1,
  });
  slide.addText(e.name, {
    x: 1.3, y: yPos + 0.05, w: 4, h: 0.45,
    fontSize: 13, fontFace: "Calibri", color: COLORS.dark, bold: true,
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.8, y: yPos + 0.25, w: 1.5, h: 0.4,
    fill: { color: e.color === COLORS.green ? COLORS.greenLight : COLORS.orangeLight },
    rectRadius: 0.08,
  });
  slide.addText(e.places, {
    x: 5.8, y: yPos + 0.25, w: 1.5, h: 0.4,
    fontSize: 10, fontFace: "Calibri", color: e.color, bold: true, align: "center", valign: "middle",
  });
});

// Carte "Ajouter"
slide.addShape(pres.ShapeType.roundRect, {
  x: 1, y: 6, w: 6.5, h: 0.35,
  fill: { color: COLORS.white }, line: { color: COLORS.gray, width: 1, dashType: "dash" }, rectRadius: 0.08,
});
slide.addText("+ Ajouter un etablissement (referent cadre)", {
  x: 1, y: 6, w: 6.5, h: 0.35,
  fontSize: 9, fontFace: "Calibri", color: COLORS.gray, align: "center", valign: "middle",
});

// Annotations à droite
slide.addText("Ce que voit le visiteur :", {
  x: 8.5, y: 1.5, w: 4.3, h: 0.4,
  fontSize: 14, fontFace: "Calibri", color: COLORS.blue, bold: true,
});

const annotations1 = [
  "Tous les etablissements de la fondation",
  "Nombre de places disponibles par etablissement",
  "Indicateur couleur (vert/orange/rouge)",
  "Bouton discret pour les referents cadres (protege par mot de passe)",
  "Date de derniere mise a jour",
];
annotations1.forEach((a, i) => {
  slide.addText(`${i + 1}. ${a}`, {
    x: 8.5, y: 2.1 + i * 0.7, w: 4.3, h: 0.65,
    fontSize: 12, fontFace: "Calibri", color: COLORS.grayDark,
  });
});

// ============================================================
// SLIDE 5 : ECRAN 2 — CHOIX DU SECTEUR
// ============================================================
slide = pres.addSlide();
addFooter(slide, 5, TOTAL_SLIDES);
slide.addText("Ecran 2 — Choix du secteur", {
  x: 0.5, y: 0.3, w: 12, h: 0.8,
  fontSize: 28, fontFace: "Calibri", color: COLORS.blueDark, bold: true,
});
slide.addShape(pres.ShapeType.line, {
  x: 0.5, y: 1.05, w: 2, h: 0, line: { color: COLORS.blue, width: 3 },
});

// Simuler l'écran
slide.addShape(pres.ShapeType.roundRect, {
  x: 0.5, y: 1.3, w: 7.5, h: 5,
  fill: { color: COLORS.grayLight }, line: { color: "D1D5DB", width: 1 }, rectRadius: 0.15,
});

// Fil d'Ariane
slide.addText("Accueil  >  Blanchisserie Tourbillon", {
  x: 0.8, y: 1.4, w: 7, h: 0.35,
  fontSize: 10, fontFace: "Calibri", color: COLORS.blue,
});

// Titre
slide.addText("Blanchisserie Tourbillon", {
  x: 0.8, y: 1.8, w: 7, h: 0.5,
  fontSize: 16, fontFace: "Calibri", color: COLORS.dark, bold: true,
});
slide.addText("Choisissez un secteur de stage", {
  x: 0.8, y: 2.3, w: 7, h: 0.35,
  fontSize: 11, fontFace: "Calibri", color: COLORS.gray,
});

// Cartes secteurs
const secteurs = [
  { name: "Lavage", places: "5/7", pct: 70, color: COLORS.green },
  { name: "Repassage", places: "1/4", pct: 25, color: COLORS.orange },
];

secteurs.forEach((s, i) => {
  const yPos = 2.9 + i * 1.5;
  slide.addShape(pres.ShapeType.roundRect, {
    x: 1, y: yPos, w: 6.5, h: 1.2,
    fill: { color: COLORS.white }, line: { color: "E5E7EB", width: 1 }, rectRadius: 0.1,
  });
  slide.addText(s.name, {
    x: 1.3, y: yPos + 0.05, w: 3.5, h: 0.4,
    fontSize: 14, fontFace: "Calibri", color: COLORS.dark, bold: true,
  });
  // Badge places
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.5, y: yPos + 0.1, w: 1.8, h: 0.35,
    fill: { color: s.color === COLORS.green ? COLORS.greenLight : COLORS.orangeLight },
    rectRadius: 0.08,
  });
  slide.addText(`${s.places} places`, {
    x: 5.5, y: yPos + 0.1, w: 1.8, h: 0.35,
    fontSize: 10, fontFace: "Calibri", color: s.color, bold: true, align: "center", valign: "middle",
  });
  // Barre de progression
  slide.addShape(pres.ShapeType.roundRect, {
    x: 1.3, y: yPos + 0.65, w: 5.9, h: 0.15,
    fill: { color: "E5E7EB" }, rectRadius: 0.05,
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 1.3, y: yPos + 0.65, w: 5.9 * (s.pct / 100), h: 0.15,
    fill: { color: s.color }, rectRadius: 0.05,
  });
  slide.addText(`${s.places.split("/")[0]} places disponibles`, {
    x: 1.3, y: yPos + 0.85, w: 5, h: 0.25,
    fontSize: 9, fontFace: "Calibri", color: COLORS.gray,
  });
});

// Annotations
slide.addText("Ce que voit le visiteur :", {
  x: 8.5, y: 1.5, w: 4.3, h: 0.4,
  fontSize: 14, fontFace: "Calibri", color: COLORS.blue, bold: true,
});
const annotations2 = [
  "Fil d'Ariane cliquable pour naviguer",
  "Liste des secteurs de l'etablissement",
  "Barre de progression visuelle",
  "Nombre de places en temps reel",
  "Bouton \"Ajouter un secteur\" pour les responsables",
];
annotations2.forEach((a, i) => {
  slide.addText(`${i + 1}. ${a}`, {
    x: 8.5, y: 2.1 + i * 0.7, w: 4.3, h: 0.65,
    fontSize: 12, fontFace: "Calibri", color: COLORS.grayDark,
  });
});

// ============================================================
// SLIDE 6 : ECRAN 3 — CALENDRIER
// ============================================================
slide = pres.addSlide();
addFooter(slide, 6, TOTAL_SLIDES);
slide.addText("Ecran 3 — Calendrier mensuel", {
  x: 0.5, y: 0.3, w: 12, h: 0.8,
  fontSize: 28, fontFace: "Calibri", color: COLORS.blueDark, bold: true,
});
slide.addShape(pres.ShapeType.line, {
  x: 0.5, y: 1.05, w: 2, h: 0, line: { color: COLORS.blue, width: 3 },
});

// Écran simulé
slide.addShape(pres.ShapeType.roundRect, {
  x: 0.5, y: 1.3, w: 7.5, h: 5,
  fill: { color: COLORS.grayLight }, line: { color: "D1D5DB", width: 1 }, rectRadius: 0.15,
});

// Navigation mois
slide.addText("<   Mars 2026   >", {
  x: 0.8, y: 1.5, w: 7, h: 0.5,
  fontSize: 15, fontFace: "Calibri", color: COLORS.dark, bold: true, align: "center",
});

// En-têtes jours
const jours = ["Sem.", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
jours.forEach((j, i) => {
  slide.addText(j, {
    x: 0.8 + i * 0.85, y: 2.1, w: 0.85, h: 0.3,
    fontSize: 8, fontFace: "Calibri", color: COLORS.gray, align: "center", bold: true,
  });
});

// Semaines simulées avec couleurs
const weeks = [
  { num: "S10", days: ["2", "3", "4", "5", "6", "7", "8"], status: COLORS.green, bg: COLORS.greenLight },
  { num: "S11", days: ["9", "10", "11", "12", "13", "14", "15"], status: COLORS.orange, bg: COLORS.orangeLight },
  { num: "S12", days: ["16", "17", "18", "19", "20", "21", "22"], status: COLORS.gray, bg: COLORS.grayLight },
  { num: "S13 (2)", days: ["23", "24", "25", "26", "27", "28", "29"], status: COLORS.green, bg: COLORS.greenLight },
  { num: "S14", days: ["30", "31", "", "", "", "", ""], status: COLORS.red, bg: COLORS.redLight },
];

weeks.forEach((w, wi) => {
  const yPos = 2.5 + wi * 0.65;
  // Numéro semaine
  slide.addText(w.num, {
    x: 0.8, y: yPos, w: 0.85, h: 0.55,
    fontSize: 9, fontFace: "Calibri", color: w.status, bold: true, align: "center", valign: "middle",
  });
  // Jours
  w.days.forEach((d, di) => {
    if (d) {
      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.65 + di * 0.85, y: yPos + 0.05, w: 0.75, h: 0.45,
        fill: { color: w.bg }, line: { color: w.status === COLORS.gray ? "D1D5DB" : w.status, width: 0.5 },
        rectRadius: 0.05,
      });
    }
    slide.addText(d, {
      x: 1.65 + di * 0.85, y: yPos + 0.05, w: 0.75, h: 0.45,
      fontSize: 10, fontFace: "Calibri", color: d ? COLORS.dark : COLORS.white, align: "center", valign: "middle",
    });
  });
});

// Légende
const legendItems = [
  { label: "Disponible", color: COLORS.green },
  { label: "Presque complet", color: COLORS.orange },
  { label: "Complet", color: COLORS.red },
  { label: "Pas de donnees", color: COLORS.gray },
];
legendItems.forEach((l, i) => {
  slide.addShape(pres.ShapeType.ellipse, {
    x: 0.8 + i * 1.8, y: 5.8, w: 0.2, h: 0.2,
    fill: { color: l.color },
  });
  slide.addText(l.label, {
    x: 1.05 + i * 1.8, y: 5.75, w: 1.5, h: 0.3,
    fontSize: 9, fontFace: "Calibri", color: COLORS.grayDark,
  });
});

// Annotations
slide.addText("Ce que voit le visiteur :", {
  x: 8.5, y: 1.5, w: 4.3, h: 0.4,
  fontSize: 14, fontFace: "Calibri", color: COLORS.blue, bold: true,
});
const annotations3 = [
  "Calendrier mois par mois avec navigation",
  "Chaque semaine est coloree selon la disponibilite",
  "\"S13 (2)\" = 2 creneaux cette semaine",
  "Clic sur une semaine = voir le detail",
  "Le jour actuel est marque en bleu",
  "Bouton \"Ajouter un creneau\" pour les responsables",
];
annotations3.forEach((a, i) => {
  slide.addText(`${i + 1}. ${a}`, {
    x: 8.5, y: 2.1 + i * 0.7, w: 4.3, h: 0.65,
    fontSize: 12, fontFace: "Calibri", color: COLORS.grayDark,
  });
});

// ============================================================
// SLIDE 7 : ECRAN 4 — DETAIL & INSCRIPTION
// ============================================================
slide = pres.addSlide();
addFooter(slide, 7, TOTAL_SLIDES);
slide.addText("Ecran 4 — Detail et inscription", {
  x: 0.5, y: 0.3, w: 12, h: 0.8,
  fontSize: 28, fontFace: "Calibri", color: COLORS.blueDark, bold: true,
});
slide.addShape(pres.ShapeType.line, {
  x: 0.5, y: 1.05, w: 2, h: 0, line: { color: COLORS.blue, width: 3 },
});

// Écran simulé
slide.addShape(pres.ShapeType.roundRect, {
  x: 0.5, y: 1.3, w: 7.5, h: 5.3,
  fill: { color: COLORS.grayLight }, line: { color: "D1D5DB", width: 1 }, rectRadius: 0.15,
});

// Header vert
slide.addShape(pres.ShapeType.roundRect, {
  x: 1.5, y: 1.6, w: 5.5, h: 0.8,
  fill: { color: COLORS.greenLight }, line: { color: COLORS.green, width: 1 }, rectRadius: 0.1,
});
slide.addText("Semaine 10", {
  x: 1.7, y: 1.6, w: 5, h: 0.45,
  fontSize: 16, fontFace: "Calibri", color: COLORS.green, bold: true,
});
slide.addText("2 mars — 6 mars 2026", {
  x: 1.7, y: 2, w: 5, h: 0.35,
  fontSize: 11, fontFace: "Calibri", color: COLORS.green,
});

// Places
slide.addText("5", {
  x: 1.7, y: 2.7, w: 1, h: 0.6,
  fontSize: 32, fontFace: "Calibri", color: COLORS.dark, bold: true,
});
slide.addText("/ 7 places", {
  x: 2.5, y: 2.9, w: 2, h: 0.4,
  fontSize: 13, fontFace: "Calibri", color: COLORS.gray,
});

// Barre de progression
slide.addShape(pres.ShapeType.roundRect, {
  x: 1.7, y: 3.4, w: 5, h: 0.2,
  fill: { color: "E5E7EB" }, rectRadius: 0.05,
});
slide.addShape(pres.ShapeType.roundRect, {
  x: 1.7, y: 3.4, w: 3.5, h: 0.2,
  fill: { color: COLORS.green }, rectRadius: 0.05,
});
slide.addText("2 occupees                                               5 libres", {
  x: 1.7, y: 3.65, w: 5, h: 0.25,
  fontSize: 8, fontFace: "Calibri", color: COLORS.gray,
});

// Infos secteur
slide.addShape(pres.ShapeType.roundRect, {
  x: 1.7, y: 4.1, w: 5, h: 0.8,
  fill: { color: COLORS.grayLight }, rectRadius: 0.08,
});
slide.addText("Etablissement : Blanchisserie Tourbillon\nSecteur : Lavage", {
  x: 1.9, y: 4.15, w: 4.6, h: 0.7,
  fontSize: 11, fontFace: "Calibri", color: COLORS.grayDark,
});

// Bouton S'inscrire
slide.addShape(pres.ShapeType.roundRect, {
  x: 1.7, y: 5.2, w: 5, h: 0.6,
  fill: { color: COLORS.green }, rectRadius: 0.1,
});
slide.addText("S'inscrire pour cette semaine", {
  x: 1.7, y: 5.2, w: 5, h: 0.6,
  fontSize: 14, fontFace: "Calibri", color: COLORS.white, bold: true, align: "center", valign: "middle",
});

// Annotations
slide.addText("Ce que voit le visiteur :", {
  x: 8.5, y: 1.5, w: 4.3, h: 0.4,
  fontSize: 14, fontFace: "Calibri", color: COLORS.blue, bold: true,
});
const annotations4 = [
  "Detail de la semaine selectionnee",
  "Nombre de places en grand",
  "Barre de progression (occupe / libre)",
  "Rappel de l'etablissement et du secteur",
  "Bouton vert \"S'inscrire\" qui ouvre le formulaire",
  "Le formulaire est pre-rempli automatiquement (etablissement, secteur, date)",
];
annotations4.forEach((a, i) => {
  slide.addText(`${i + 1}. ${a}`, {
    x: 8.5, y: 2.1 + i * 0.7, w: 4.3, h: 0.65,
    fontSize: 12, fontFace: "Calibri", color: COLORS.grayDark,
  });
});

// ============================================================
// SLIDE 8 : PIPELINE AUTOMATIQUE (le coeur du système)
// ============================================================
slide = pres.addSlide();
addFooter(slide, 8, TOTAL_SLIDES);
slide.addText("Le systeme automatique (en coulisse)", {
  x: 0.5, y: 0.3, w: 12, h: 0.8,
  fontSize: 28, fontFace: "Calibri", color: COLORS.blueDark, bold: true,
});
slide.addShape(pres.ShapeType.line, {
  x: 0.5, y: 1.05, w: 2, h: 0, line: { color: COLORS.blue, width: 3 },
});

// Flux 1
slide.addShape(pres.ShapeType.roundRect, {
  x: 0.3, y: 1.4, w: 3, h: 2.2,
  fill: { color: COLORS.blueLight }, line: { color: COLORS.blue, width: 1.5 }, rectRadius: 0.12,
});
slide.addText("Flux 1", {
  x: 0.3, y: 1.45, w: 3, h: 0.35,
  fontSize: 14, fontFace: "Calibri", color: COLORS.blue, bold: true, align: "center",
});
slide.addText("Inscription stage", {
  x: 0.3, y: 1.75, w: 3, h: 0.3,
  fontSize: 11, fontFace: "Calibri", color: COLORS.blue, align: "center",
});
slide.addText("- Recoit le formulaire\n- Verifie si le stagiaire existe\n- Cree Stagiaire + Demande\n- Envoie email avec N° dossier", {
  x: 0.5, y: 2.15, w: 2.6, h: 1.3,
  fontSize: 10, fontFace: "Calibri", color: COLORS.grayDark,
});

// Flux 2
slide.addShape(pres.ShapeType.roundRect, {
  x: 3.55, y: 1.4, w: 3, h: 2.2,
  fill: { color: COLORS.orangeLight }, line: { color: COLORS.orange, width: 1.5 }, rectRadius: 0.12,
});
slide.addText("Flux 2", {
  x: 3.55, y: 1.45, w: 3, h: 0.35,
  fontSize: 14, fontFace: "Calibri", color: COLORS.orange, bold: true, align: "center",
});
slide.addText("Reception documents", {
  x: 3.55, y: 1.75, w: 3, h: 0.3,
  fontSize: 11, fontFace: "Calibri", color: COLORS.orange, align: "center",
});
slide.addText("- Recoit les pieces jointes\n- Cree le dossier du stagiaire\n- Classe les documents\n- Met a jour le statut", {
  x: 3.75, y: 2.15, w: 2.6, h: 1.3,
  fontSize: 10, fontFace: "Calibri", color: COLORS.grayDark,
});

// Flux 3
slide.addShape(pres.ShapeType.roundRect, {
  x: 6.8, y: 1.4, w: 3, h: 2.2,
  fill: { color: COLORS.greenLight }, line: { color: COLORS.green, width: 1.5 }, rectRadius: 0.12,
});
slide.addText("Flux 3", {
  x: 6.8, y: 1.45, w: 3, h: 0.35,
  fontSize: 14, fontFace: "Calibri", color: COLORS.green, bold: true, align: "center",
});
slide.addText("Mise a jour du site", {
  x: 6.8, y: 1.75, w: 3, h: 0.3,
  fontSize: 11, fontFace: "Calibri", color: COLORS.green, align: "center",
});
slide.addText("- Lit les creneaux SharePoint\n- Compte les places restantes\n- Genere le planning\n- Publie sur le site web", {
  x: 7, y: 2.15, w: 2.6, h: 1.3,
  fontSize: 10, fontFace: "Calibri", color: COLORS.grayDark,
});

// Flux 4
slide.addShape(pres.ShapeType.roundRect, {
  x: 10.05, y: 1.4, w: 3, h: 2.2,
  fill: { color: "F3E8FF" }, line: { color: "9333EA", width: 1.5 }, rectRadius: 0.12,
});
slide.addText("Flux 4", {
  x: 10.05, y: 1.45, w: 3, h: 0.35,
  fontSize: 14, fontFace: "Calibri", color: "9333EA", bold: true, align: "center",
});
slide.addText("Gestion creneaux", {
  x: 10.05, y: 1.75, w: 3, h: 0.3,
  fontSize: 11, fontFace: "Calibri", color: "9333EA", align: "center",
});
slide.addText("- Referent cadre soumet\n- Verifie le mot de passe\n- Cree le creneau dans SP\n- Le site se met a jour", {
  x: 10.25, y: 2.15, w: 2.6, h: 1.3,
  fontSize: 10, fontFace: "Calibri", color: COLORS.grayDark,
});

// Flèches entre flux
[3.3, 6.55, 9.8].forEach(x => {
  slide.addText(">", {
    x: x, y: 2, w: 0.3, h: 1,
    fontSize: 22, fontFace: "Calibri", color: COLORS.gray, bold: true, align: "center", valign: "middle",
  });
});

// SharePoint au milieu en bas
slide.addShape(pres.ShapeType.roundRect, {
  x: 2.5, y: 4.2, w: 8.3, h: 1.2,
  fill: { color: COLORS.blueLight }, line: { color: COLORS.blueDark, width: 2 }, rectRadius: 0.12,
});
slide.addText("SharePoint — Base de donnees centrale", {
  x: 2.5, y: 4.25, w: 8.3, h: 0.4,
  fontSize: 14, fontFace: "Calibri", color: COLORS.blueDark, bold: true, align: "center",
});

// Tables SP
const tables = [
  { name: "Stagiaire", desc: "35 champs" },
  { name: "Demande", desc: "10 champs" },
  { name: "Referent", desc: "7 champs" },
  { name: "Creneaux", desc: "7 champs" },
];
tables.forEach((t, i) => {
  const xPos = 3 + i * 1.9;
  slide.addShape(pres.ShapeType.roundRect, {
    x: xPos, y: 4.7, w: 1.7, h: 0.6,
    fill: { color: COLORS.white }, line: { color: COLORS.blueDark, width: 1 }, rectRadius: 0.08,
  });
  slide.addText(`${t.name}\n(${t.desc})`, {
    x: xPos, y: 4.7, w: 1.7, h: 0.6,
    fontSize: 10, fontFace: "Calibri", color: COLORS.blueDark, bold: true, align: "center", valign: "middle",
  });
});

// Bibliothèque documents
slide.addShape(pres.ShapeType.roundRect, {
  x: 2.5, y: 5.7, w: 8.3, h: 0.8,
  fill: { color: COLORS.grayLight }, line: { color: COLORS.gray, width: 1 }, rectRadius: 0.1,
});
slide.addText("Bibliotheque de documents SharePoint  —  Stagiaires Doc / {AVS} / Dossier personnalise", {
  x: 2.7, y: 5.7, w: 8, h: 0.8,
  fontSize: 12, fontFace: "Calibri", color: COLORS.grayDark, valign: "middle",
});

// ============================================================
// SLIDE 9 : LES LISTES SHAREPOINT
// ============================================================
slide = pres.addSlide();
addFooter(slide, 9, TOTAL_SLIDES);
slide.addText("Les donnees dans SharePoint", {
  x: 0.5, y: 0.3, w: 12, h: 0.8,
  fontSize: 28, fontFace: "Calibri", color: COLORS.blueDark, bold: true,
});
slide.addShape(pres.ShapeType.line, {
  x: 0.5, y: 1.05, w: 2, h: 0, line: { color: COLORS.blue, width: 3 },
});

// Table Stagiaire
slide.addShape(pres.ShapeType.roundRect, {
  x: 0.3, y: 1.3, w: 6.2, h: 3.2,
  fill: { color: COLORS.white }, line: { color: COLORS.blue, width: 2 }, rectRadius: 0.12,
});
slide.addText("Liste Stagiaire (donnees personnelles)", {
  x: 0.3, y: 1.35, w: 6.2, h: 0.4,
  fontSize: 13, fontFace: "Calibri", color: COLORS.blue, bold: true, align: "center",
});
slide.addText(
  "Nom, Prenom, Date de naissance, AVS\n" +
  "Telephone, Email, Adresse, NPA\n" +
  "Personne d'urgence (nom, tel, lien)\n" +
  "Curatelle (type, coordonnees curateur)\n" +
  "Assurance invalidite (conseiller AI)\n" +
  "Parcours scolaire, Tests, Reseau\n" +
  "Taille t-shirt, pantalon, pointure\n" +
  "~ 35 champs au total",
  {
    x: 0.5, y: 1.85, w: 5.8, h: 2.5,
    fontSize: 11, fontFace: "Calibri", color: COLORS.grayDark, lineSpacingMultiple: 1.3,
  }
);

// Table Demande
slide.addShape(pres.ShapeType.roundRect, {
  x: 6.8, y: 1.3, w: 6.2, h: 1.8,
  fill: { color: COLORS.white }, line: { color: COLORS.green, width: 2 }, rectRadius: 0.12,
});
slide.addText("Liste Demande (1 stagiaire = N demandes)", {
  x: 6.8, y: 1.35, w: 6.2, h: 0.4,
  fontSize: 13, fontFace: "Calibri", color: COLORS.green, bold: true, align: "center",
});
slide.addText(
  "Etablissement, Secteur, Date souhaitee\n" +
  "Objectif du stage, Deja stagie ?\n" +
  "Statut : En attente > Documents recus > Valide\n" +
  "Lien vers Stagiaire + Referent",
  {
    x: 7, y: 1.85, w: 5.8, h: 1.2,
    fontSize: 11, fontFace: "Calibri", color: COLORS.grayDark, lineSpacingMultiple: 1.3,
  }
);

// Table Referent
slide.addShape(pres.ShapeType.roundRect, {
  x: 6.8, y: 3.3, w: 6.2, h: 1.2,
  fill: { color: COLORS.white }, line: { color: COLORS.orange, width: 2 }, rectRadius: 0.12,
});
slide.addText("Liste Referent", {
  x: 6.8, y: 3.35, w: 6.2, h: 0.4,
  fontSize: 13, fontFace: "Calibri", color: COLORS.orange, bold: true, align: "center",
});
slide.addText(
  "Partenaire, Fonction, Nom, Prenom\nTelephone, Email, Lien vers Stagiaire",
  {
    x: 7, y: 3.8, w: 5.8, h: 0.6,
    fontSize: 11, fontFace: "Calibri", color: COLORS.grayDark, lineSpacingMultiple: 1.3,
  }
);

// Table Creneaux
slide.addShape(pres.ShapeType.roundRect, {
  x: 0.3, y: 4.8, w: 6.2, h: 1.4,
  fill: { color: COLORS.white }, line: { color: "9333EA", width: 2 }, rectRadius: 0.12,
});
slide.addText("Liste Creneaux (capacite d'accueil)", {
  x: 0.3, y: 4.85, w: 6.2, h: 0.4,
  fontSize: 13, fontFace: "Calibri", color: "9333EA", bold: true, align: "center",
});
slide.addText(
  "Etablissement, Secteur, Date debut, Date fin\n" +
  "Nombre de places, Type (Stage / Module metier)\n" +
  "Places utilisees = comptees automatiquement",
  {
    x: 0.5, y: 5.3, w: 5.8, h: 0.8,
    fontSize: 11, fontFace: "Calibri", color: COLORS.grayDark, lineSpacingMultiple: 1.3,
  }
);

// Bibliothèque docs
slide.addShape(pres.ShapeType.roundRect, {
  x: 6.8, y: 4.8, w: 6.2, h: 1.4,
  fill: { color: COLORS.white }, line: { color: COLORS.grayDark, width: 2 }, rectRadius: 0.12,
});
slide.addText("Bibliotheque de documents", {
  x: 6.8, y: 4.85, w: 6.2, h: 0.4,
  fontSize: 13, fontFace: "Calibri", color: COLORS.grayDark, bold: true, align: "center",
});
slide.addText(
  "1 dossier par stagiaire (classe par AVS)\n" +
  "Sous-dossiers : Administratif, Contrats,\nMedical, Evaluation, Ecole, Stages...\n" +
  "Documents renommes automatiquement",
  {
    x: 7, y: 5.3, w: 5.8, h: 0.8,
    fontSize: 11, fontFace: "Calibri", color: COLORS.grayDark, lineSpacingMultiple: 1.3,
  }
);

// ============================================================
// SLIDE 10 : AVANCEMENT
// ============================================================
slide = pres.addSlide();
addFooter(slide, 10, TOTAL_SLIDES);
slide.addText("Etat d'avancement", {
  x: 0.5, y: 0.3, w: 12, h: 0.8,
  fontSize: 28, fontFace: "Calibri", color: COLORS.blueDark, bold: true,
});
slide.addShape(pres.ShapeType.line, {
  x: 0.5, y: 1.05, w: 2, h: 0, line: { color: COLORS.blue, width: 3 },
});

// FAIT
slide.addText("Termine", {
  x: 0.5, y: 1.2, w: 6, h: 0.5,
  fontSize: 18, fontFace: "Calibri", color: COLORS.green, bold: true,
});

const done = [
  "Site web calendrier en ligne (accessible a tous)",
  "Formulaire d'inscription complet (43 questions)",
  "4 flux Power Automate automatiques",
  "Listes SharePoint configurees (Stagiaire, Demande, Referent, Creneaux)",
  "Dossier stagiaire cree et organise automatiquement",
  "Gestion des documents (pieces jointes classees par AVS)",
  "Code couleur des disponibilites (vert/orange/rouge)",
  "Gestion des creneaux chevauchants",
  "Boutons pour les referents cadres (protege par mot de passe)",
  "Pipeline complet teste et operationnel",
];

done.forEach((d, i) => {
  const col = i < 5 ? 0 : 1;
  const row = i < 5 ? i : i - 5;
  slide.addText("V", {
    x: 0.5 + col * 6.3, y: 1.8 + row * 0.6, w: 0.3, h: 0.3,
    fontSize: 12, fontFace: "Calibri", color: COLORS.green, bold: true,
  });
  slide.addText(d, {
    x: 0.9 + col * 6.3, y: 1.8 + row * 0.6, w: 5.5, h: 0.55,
    fontSize: 11, fontFace: "Calibri", color: COLORS.grayDark,
  });
});

// RESTE
slide.addText("A valider / discuter (aujourd'hui)", {
  x: 0.5, y: 5, w: 12, h: 0.5,
  fontSize: 18, fontFace: "Calibri", color: COLORS.orange, bold: true,
});

const todo = [
  "Mise a jour automatique quand un nouveau creneau est ajoute",
  "Configuration des etablissements (descriptions, icones)",
  "Gestion des modules metiers (stage vs. module)",
  "Formulaire pour ajouter un nouvel etablissement",
];

todo.forEach((t, i) => {
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.5, y: 5.55 + i * 0.42, w: 0.25, h: 0.25,
    fill: { color: COLORS.white }, line: { color: COLORS.orange, width: 1.5 }, rectRadius: 0.04,
  });
  slide.addText(t, {
    x: 0.9, y: 5.5 + i * 0.42, w: 12, h: 0.4,
    fontSize: 11, fontFace: "Calibri", color: COLORS.grayDark,
  });
});

// ============================================================
// SLIDE 11 : DEMO EN DIRECT
// ============================================================
slide = pres.addSlide();
slide.background = { color: COLORS.blue };
slide.addText("Demo en direct", {
  x: 1, y: 1.5, w: 11, h: 1.5,
  fontSize: 44, fontFace: "Calibri", color: COLORS.white, bold: true, align: "center",
});
slide.addText("rochat-dev.github.io/clair-bois-calendrier", {
  x: 1, y: 3.2, w: 11, h: 0.8,
  fontSize: 20, fontFace: "Calibri", color: COLORS.blueLight, align: "center",
});

// Parcours démo
slide.addShape(pres.ShapeType.roundRect, {
  x: 2, y: 4.3, w: 9, h: 2.5,
  fill: { color: COLORS.blueDark }, rectRadius: 0.15,
});
slide.addText(
  "Parcours de demonstration :\n\n" +
  "1.  Ouvrir le site > choisir un etablissement\n" +
  "2.  Choisir un secteur > voir le calendrier\n" +
  "3.  Cliquer une semaine > voir le detail\n" +
  "4.  Cliquer \"S'inscrire\" > formulaire pre-rempli\n" +
  "5.  Verifier dans SharePoint : Stagiaire + Demande crees !",
  {
    x: 2.3, y: 4.4, w: 8.5, h: 2.3,
    fontSize: 15, fontFace: "Calibri", color: COLORS.blueLight, lineSpacingMultiple: 1.3,
  }
);

// ============================================================
// GENERER LE FICHIER
// ============================================================
const outputPath = "C:/Users/karim/Presentation-ClairBois-Karavia.pptx";
pres.writeFile({ fileName: outputPath })
  .then(() => console.log(`PowerPoint genere : ${outputPath}`))
  .catch((err) => console.error("Erreur:", err));
