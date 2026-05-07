const fs = require('fs');

const defPath = 'C:/Users/karim/PowerAutomate-Agent/flux1-work-fix/Microsoft.Flow/flows/8affe7f1-3296-48a2-a2cb-1de6832d8997/definition.json';
const data = JSON.parse(fs.readFileSync(defPath, 'utf8'));

const c1 = data.properties.definition.actions.Condition_1;
const cMail = c1.actions.Condition;
const c3 = cMail.actions.Condition_3;
const c2 = c1.else.actions.Condition_2;
const c4 = c2.actions.Condition_4;

// === ACTIONS RACINE ===
data.properties.definition.actions["Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse"].description =
  "R\u00e9cup\u00e8re toutes les r\u00e9ponses du formulaire Microsoft Forms";

c1.description = "Stagiaire ou R\u00e9f\u00e9rent ?\nVrai = Moi-m\u00eame (stagiaire remplit pour lui)\nFaux = Quelqu'un d'autre (r\u00e9f\u00e9rent remplit pour un stagiaire)";

// === BRANCHE MOI-MÊME ===
cMail.description = "Filtre email autoris\u00e9 (branche Moi-m\u00eame)\nVrai = email stagiaire contient @clair-bois.ch OU rochat.vdge\nFaux = email non autoris\u00e9 → aucune action";

cMail.actions["Envoyer_une_requ\u00eate_HTTP_\u00e0_SharePoint"].description =
  "V\u00e9rifie si l'AVS existe d\u00e9j\u00e0 dans la liste Stagiaire\nGET → filtre par AVS";

c3.description = "L'AVS existe-t-il d\u00e9j\u00e0 dans Stagiaire ?\nVrai = MAJ du stagiaire existant\nFaux = Cr\u00e9ation d'un nouveau stagiaire";

// Path 1: Moi-même + MAJ
c3.actions["Mettre_\u00e0_jour_l'\u00e9l\u00e9ment"].description =
  "MAJ Stagiaire existant (branche Moi-m\u00eame)\nMet \u00e0 jour les donn\u00e9es personnelles uniquement\n(les champs stage sont sur la liste Demande)";

c3.actions["Cr\u00e9er_Demande"].description =
  "Cr\u00e9e une nouvelle Demande de stage\nListe: Demande | Lookup: StagiaireID → stagiaire existant\nStatut = 'En attente des documents'\nPas de ReferentID (branche Moi-m\u00eame)";

c3.actions["Envoyer_un_e-mail_(V2)_2"].description =
  "Email de demande de documents au STAGIAIRE\nObjet: [AVS-756.XXXX.XXXX.xx D\u00b0{DemandeID}]\nDestinataire: email du stagiaire";

// Path 2: Moi-même + CREATE
c3.else.actions["Cr\u00e9er_un_\u00e9l\u00e9ment"].description =
  "Cr\u00e9e un nouveau Stagiaire (branche Moi-m\u00eame)\nDonn\u00e9es personnelles uniquement\n(les champs stage sont sur la liste Demande)";

c3.else.actions["Cr\u00e9er_Demande_1"].description =
  "Cr\u00e9e une nouvelle Demande de stage\nListe: Demande | Lookup: StagiaireID → nouveau stagiaire\nStatut = 'En attente des documents'\nPas de ReferentID (branche Moi-m\u00eame)";

c3.else.actions["Envoyer_un_e-mail_(V2)"].description =
  "Email de demande de documents au STAGIAIRE\nObjet: [AVS-756.XXXX.XXXX.xx D\u00b0{DemandeID}]\nDestinataire: email du stagiaire";

// === BRANCHE RÉFÉRENT ===
c2.description = "Filtre email autoris\u00e9 (branche R\u00e9f\u00e9rent)\nVrai = email r\u00e9f\u00e9rent contient @clair-bois.ch OU rochat.vdge\nFaux = email non autoris\u00e9 → aucune action";

c2.actions["Envoyer_une_requ\u00eate_HTTP_\u00e0_SharePoint_1"].description =
  "V\u00e9rifie si l'AVS du stagiaire existe d\u00e9j\u00e0 dans la liste Stagiaire\nGET → filtre par AVS";

c4.description = "L'AVS existe-t-il d\u00e9j\u00e0 dans Stagiaire ?\nVrai = MAJ du stagiaire existant\nFaux = Cr\u00e9ation d'un nouveau stagiaire";

// Path 3: Référent + MAJ
c4.actions["Mettre_\u00e0_jour_l'\u00e9l\u00e9ment_1"].description =
  "MAJ Stagiaire existant (branche R\u00e9f\u00e9rent)\nMet \u00e0 jour les donn\u00e9es personnelles uniquement";

c4.actions["Cr\u00e9er_un_\u00e9l\u00e9ment_R\u00e9f\u00e9rent_1"].description =
  "Cr\u00e9e une entr\u00e9e R\u00e9f\u00e9rent dans la liste Referent\nLookup: StagiaireID → stagiaire existant";

c4.actions["Cr\u00e9er_Demande_2"].description =
  "Cr\u00e9e une nouvelle Demande de stage\nListe: Demande | Lookups: StagiaireID + ReferentID\nStatut = 'En attente des documents'";

c4.actions["Envoyer_un_e-mail_(V2)_1_1"].description =
  "Email de demande de documents au R\u00c9F\u00c9RENT\nObjet: [AVS-756.XXXX.XXXX.xx D\u00b0{DemandeID}]\nDestinataire: email du r\u00e9f\u00e9rent";

// Path 4: Référent + CREATE
c4.else.actions["Cr\u00e9er_un_\u00e9l\u00e9ment_1"].description =
  "Cr\u00e9e un nouveau Stagiaire (branche R\u00e9f\u00e9rent)\nDonn\u00e9es personnelles uniquement";

c4.else.actions["Cr\u00e9er_un_\u00e9l\u00e9ment_R\u00e9f\u00e9rent"].description =
  "Cr\u00e9e une entr\u00e9e R\u00e9f\u00e9rent dans la liste Referent\nLookup: StagiaireID → nouveau stagiaire";

c4.else.actions["Cr\u00e9er_Demande_3"].description =
  "Cr\u00e9e une nouvelle Demande de stage\nListe: Demande | Lookups: StagiaireID + ReferentID\nStatut = 'En attente des documents'";

c4.else.actions["Envoyer_un_e-mail_(V2)_1"].description =
  "Email de demande de documents au R\u00c9F\u00c9RENT\nObjet: [AVS-756.XXXX.XXXX.xx D\u00b0{DemandeID}]\nDestinataire: email du r\u00e9f\u00e9rent";

// Sauvegarder
fs.writeFileSync(defPath, JSON.stringify(data));
console.log('Descriptions ajoutées à toutes les actions !');

// Repackager
const AdmZip = require('adm-zip');
const zip = new AdmZip();
const base = 'C:/Users/karim/PowerAutomate-Agent/flux1-work-fix';
zip.addLocalFile(base + '/Microsoft.Flow/flows/8affe7f1-3296-48a2-a2cb-1de6832d8997/apisMap.json', 'Microsoft.Flow/flows/8affe7f1-3296-48a2-a2cb-1de6832d8997');
zip.addLocalFile(base + '/Microsoft.Flow/flows/8affe7f1-3296-48a2-a2cb-1de6832d8997/connectionsMap.json', 'Microsoft.Flow/flows/8affe7f1-3296-48a2-a2cb-1de6832d8997');
zip.addLocalFile(base + '/Microsoft.Flow/flows/8affe7f1-3296-48a2-a2cb-1de6832d8997/definition.json', 'Microsoft.Flow/flows/8affe7f1-3296-48a2-a2cb-1de6832d8997');
zip.addLocalFile(base + '/Microsoft.Flow/flows/manifest.json', 'Microsoft.Flow/flows');
zip.addLocalFile(base + '/manifest.json', '');
zip.writeZip('C:/Users/karim/PowerAutomate-Agent/flux-inscriptions-modifie.zip');
console.log('ZIP repackagé !');
