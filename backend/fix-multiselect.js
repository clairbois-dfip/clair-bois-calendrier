const fs = require('fs');

const defPath = 'C:/Users/karim/PowerAutomate-Agent/flux1-work-fix/Microsoft.Flow/flows/8affe7f1-3296-48a2-a2cb-1de6832d8997/definition.json';
const data = JSON.parse(fs.readFileSync(defPath, 'utf8'));

const c1 = data.properties.definition.actions.Condition_1;
const c3 = c1.actions.Condition.actions.Condition_3;
const c4 = c1.else.actions.Condition_2.actions.Condition_4;

const actions = [
  c3.actions["Mettre_\u00e0_jour_l'\u00e9l\u00e9ment"],
  c3.else.actions["Cr\u00e9er_un_\u00e9l\u00e9ment"],
  c4.actions["Mettre_\u00e0_jour_l'\u00e9l\u00e9ment_1"],
  c4.else.actions["Cr\u00e9er_un_\u00e9l\u00e9ment_1"],
];

// Forms renvoie multi-select comme : ["Un.e thérapeute","Un.e logothérapeute"]
// SharePoint multi-choice attend :   [{"Value":"Un.e thérapeute"},{"Value":"Un.e logothérapeute"}]
//
// Transformation via 3 replace successifs :
//   '","'  →  '"},{"Value":"'
//   '["'   →  '[{"Value":"'
//   '"]'   →  '"}]'

const formsField = "outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/r27377ab8dd76443f97ea08c29cfe8f6d']";

const reseauExpr = `@json(replace(replace(replace(${formsField}, '","', '"},{"Value":"'), '["', '[{"Value":"'), '"]', '"}]'))`;

console.log('New Reseau expression:');
console.log(reseauExpr);
console.log('');

for (const action of actions) {
  const params = action.inputs.parameters;
  // Supprimer l'ancien format (qu'il soit /Value ou pas)
  let removed = false;
  if ('item/Reseau/Value' in params) { delete params['item/Reseau/Value']; removed = true; }
  if ('item/Reseau' in params) { delete params['item/Reseau']; removed = true; }
  // Ajouter le nouveau
  params['item/Reseau'] = reseauExpr;
  console.log('Updated Reseau in action');
}

fs.writeFileSync(defPath, JSON.stringify(data));
console.log('\nSaved! Now repackaging zip...');

// Repackager le zip directement
const AdmZip = require('adm-zip');
const zip = new AdmZip();
const base = 'C:/Users/karim/PowerAutomate-Agent/flux1-work-fix';
zip.addLocalFile(base + '/Microsoft.Flow/flows/8affe7f1-3296-48a2-a2cb-1de6832d8997/apisMap.json', 'Microsoft.Flow/flows/8affe7f1-3296-48a2-a2cb-1de6832d8997');
zip.addLocalFile(base + '/Microsoft.Flow/flows/8affe7f1-3296-48a2-a2cb-1de6832d8997/connectionsMap.json', 'Microsoft.Flow/flows/8affe7f1-3296-48a2-a2cb-1de6832d8997');
zip.addLocalFile(base + '/Microsoft.Flow/flows/8affe7f1-3296-48a2-a2cb-1de6832d8997/definition.json', 'Microsoft.Flow/flows/8affe7f1-3296-48a2-a2cb-1de6832d8997');
zip.addLocalFile(base + '/Microsoft.Flow/flows/manifest.json', 'Microsoft.Flow/flows');
zip.addLocalFile(base + '/manifest.json', '');
zip.writeZip('C:/Users/karim/PowerAutomate-Agent/flux-inscriptions-modifie.zip');

// Vérification
const check = new AdmZip('C:/Users/karim/PowerAutomate-Agent/flux-inscriptions-modifie.zip');
console.log('\nZIP contents:');
check.getEntries().forEach(e => console.log('  ' + e.entryName, e.header.size));
console.log('\nDone!');
