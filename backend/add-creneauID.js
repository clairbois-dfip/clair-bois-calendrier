const fs = require('fs');

const defPath = 'C:/Users/karim/PowerAutomate-Agent/flux1-work-fix/Microsoft.Flow/flows/8affe7f1-3296-48a2-a2cb-1de6832d8997/definition.json';
const data = JSON.parse(fs.readFileSync(defPath, 'utf8'));

const actions = data.properties.definition.actions;
const CRENEAUX_LIST_GUID = '3e2deb27-f496-410f-be74-281eb2b0c079';
const SP_SITE = 'https://fondationclairbois.sharepoint.com/sites/DFIP-SiteEquipe';

// Shortcut pour les champs Forms
const FORMS = "outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')";
const ETAB_FIELD = `${FORMS}?['body/r2876f0c952f44887946296b4c95367a3']`;
const SECTEUR_FIELD = `${FORMS}?['body/r1faa50a65150406b95d3a62e45550e40']`;
const DATE_FIELD = `${FORMS}?['body/r50efe78018854247bf6e734db7188d70']`;

// ==========================================
// 1. Ajouter Requête_HTTP_Creneaux
//    Cherche le créneau matching par Etablissement + Secteur + DateDebut/DateFin
//    Placé AVANT Condition_1, APRES Obtenir_les_détails_de_la_réponse
// ==========================================
console.log('1. Adding Requ\u00eate_HTTP_Creneaux');

actions['Requ\u00eate_HTTP_Creneaux'] = {
  runAfter: { 'Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse': ['Succeeded'] },
  type: 'OpenApiConnection',
  inputs: {
    parameters: {
      dataset: SP_SITE,
      'parameters/method': 'GET',
      'parameters/uri': `@concat('_api/web/lists(guid''${CRENEAUX_LIST_GUID}'')/items?$select=Id&$filter=Etablissement eq ''', ${ETAB_FIELD}, ''' and Secteur eq ''', ${SECTEUR_FIELD}, ''' and DateDebut le ''', ${DATE_FIELD}, ''' and DateFin ge ''', ${DATE_FIELD}, '''&$top=1')`,
    },
    host: {
      apiId: '/providers/Microsoft.PowerApps/apis/shared_sharepointonline',
      connectionName: 'shared_sharepointonline',
      operationId: 'HttpRequest',
    },
    authentication: "@parameters('$authentication')",
  },
  description: "Cherche le cr\u00e9neau matching (Etablissement + Secteur + date dans la plage)\nR\u00e9sultat utilis\u00e9 pour le lookup CreneauID sur la Demande",
};

// ==========================================
// 2. Modifier Condition_1 runAfter
//    Ancien : Obtenir_les_détails_de_la_réponse
//    Nouveau : Requête_HTTP_Creneaux
// ==========================================
console.log('2. Changing Condition_1 runAfter \u2192 Requ\u00eate_HTTP_Creneaux');
actions['Condition_1'].runAfter = {
  'Requ\u00eate_HTTP_Creneaux': ['Succeeded']
};

// ==========================================
// 3. Ajouter item/CreneauID/Id aux 4 Créer_Demande
// ==========================================
const creneauIdExpr = "@first(body('Requ\u00eate_HTTP_Creneaux')?['d']?['results'])?['Id']";

const c1 = actions.Condition_1;
const c3 = c1.actions.Condition.actions.Condition_3;
const c4 = c1.else.actions.Condition_2.actions.Condition_4;

const demandeActions = [
  { action: c3.actions['Cr\u00e9er_Demande'], name: 'Cr\u00e9er_Demande' },
  { action: c3.else.actions['Cr\u00e9er_Demande_1'], name: 'Cr\u00e9er_Demande_1' },
  { action: c4.actions['Cr\u00e9er_Demande_2'], name: 'Cr\u00e9er_Demande_2' },
  { action: c4.else.actions['Cr\u00e9er_Demande_3'], name: 'Cr\u00e9er_Demande_3' },
];

for (const { action, name } of demandeActions) {
  action.inputs.parameters['item/CreneauID/Id'] = creneauIdExpr;
  console.log(`3. Added item/CreneauID/Id to ${name}`);
}

// ==========================================
// Sauvegarde
// ==========================================
fs.writeFileSync(defPath, JSON.stringify(data));
console.log('\n=== definition.json saved! ===');

// ==========================================
// Repackager le zip
// ==========================================
console.log('\nRepackaging zip...');
const AdmZip = require('adm-zip');
const zip = new AdmZip();
const base = 'C:/Users/karim/PowerAutomate-Agent/flux1-work-fix';
const flowGuid = '8affe7f1-3296-48a2-a2cb-1de6832d8997';
const flowPath = `Microsoft.Flow/flows/${flowGuid}`;

zip.addLocalFile(`${base}/${flowPath}/apisMap.json`, flowPath);
zip.addLocalFile(`${base}/${flowPath}/connectionsMap.json`, flowPath);
zip.addLocalFile(`${base}/${flowPath}/definition.json`, flowPath);
zip.addLocalFile(`${base}/Microsoft.Flow/flows/manifest.json`, 'Microsoft.Flow/flows');
zip.addLocalFile(`${base}/manifest.json`, '');
zip.writeZip('C:/Users/karim/PowerAutomate-Agent/flux-inscriptions-modifie.zip');

// Vérification
const check = new AdmZip('C:/Users/karim/PowerAutomate-Agent/flux-inscriptions-modifie.zip');
console.log('\nZIP contents:');
check.getEntries().forEach(e => console.log('  ' + e.entryName, e.header.size));

console.log('\n=== Summary ===');
console.log('- Added Requ\u00eate_HTTP_Creneaux (query by Etab + Secteur + date range)');
console.log('- Condition_1 now runs after Requ\u00eate_HTTP_Creneaux');
console.log('- Added item/CreneauID/Id to all 4 Cr\u00e9er_Demande actions');
console.log('- If no cr\u00e9neau matches, CreneauID will be null (acceptable)');
