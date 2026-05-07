const fs = require('fs');

const defPath = 'C:/Users/karim/PowerAutomate-Agent/flux2-work/Microsoft.Flow/flows/b865cf6d-dfdf-4b46-8df0-5d0e82baed17/definition.json';
const data = JSON.parse(fs.readFileSync(defPath, 'utf8'));

const actions = data.properties.definition.actions;
const DEMANDE_LIST_GUID = '9616ee1d-dd0b-44fd-a1c4-34187ebaa9f8';
const SP_SITE = 'https://fondationclairbois.sharepoint.com/sites/DFIP-SiteEquipe';

// ==========================================
// 1. Initialiser_la_variable : varAVS → varDemandeID
//    Ancien : first(split(split(subject,'AVS-')[1],']'))  → "756.XXXX.XXXX.88 D°3"
//    Nouveau : first(split(split(subject,'D°')[1],']'))   → "3"
// ==========================================
console.log('1. Changing Initialiser_la_variable: varAVS → varDemandeID');
actions['Initialiser_la_variable'].inputs.variables[0].name = 'varDemandeID';
actions['Initialiser_la_variable'].inputs.variables[0].value =
  "@first(split(split(triggerOutputs()?['body/subject'],'D\u00b0')[1],']'))";
actions['Initialiser_la_variable'].description =
  "Extrait le DemandeID depuis l'objet du mail\nFormat: [AVS-756.XXXX.XXXX.xx D\u00b0{ID}] \u2192 {ID}";

// ==========================================
// 2. Nouvelle action : Requête HTTP Demande
//    Query la liste Demande par ID pour obtenir StagiaireIDId
// ==========================================
console.log('2. Adding Requ\u00eate_HTTP_Demande');
actions['Requ\u00eate_HTTP_Demande'] = {
  runAfter: { 'Initialiser_la_variable': ['Succeeded'] },
  type: 'OpenApiConnection',
  inputs: {
    parameters: {
      dataset: SP_SITE,
      'parameters/method': 'GET',
      'parameters/uri': "@concat('_api/web/lists(guid''" + DEMANDE_LIST_GUID + "'')/items?$select=Id,StagiaireIDId&$filter=Id eq ', variables('varDemandeID'))",
    },
    host: {
      apiId: '/providers/Microsoft.PowerApps/apis/shared_sharepointonline',
      connectionName: 'shared_sharepointonline',
      operationId: 'HttpRequest',
    },
    authentication: "@parameters('$authentication')",
  },
  description: "R\u00e9cup\u00e8re la Demande par ID pour obtenir le StagiaireIDId (lookup)",
};

// ==========================================
// 3. Modifier Envoyer_une_requête_HTTP_à_SharePoint_2
//    Ancien : $filter=AVS eq varAVS, runAfter=Initialiser_la_variable
//    Nouveau : $filter=Id eq StagiaireIDId, runAfter=Requête_HTTP_Demande
// ==========================================
console.log('3. Modifying SP_2: filter by Stagiaire Id (from Demande lookup)');
actions['Envoyer_une_requ\u00eate_HTTP_\u00e0_SharePoint_2'].runAfter = {
  'Requ\u00eate_HTTP_Demande': ['Succeeded']
};
actions['Envoyer_une_requ\u00eate_HTTP_\u00e0_SharePoint_2'].inputs.parameters['parameters/uri'] =
  "@concat('_api/web/lists/getbytitle(''Stagiaire'')/items?$select=Id,Nom,Prenom,AVS&$filter=Id eq ', first(body('Requ\u00eate_HTTP_Demande')?['d']?['results'])?['StagiaireIDId'])";
actions['Envoyer_une_requ\u00eate_HTTP_\u00e0_SharePoint_2'].description =
  "R\u00e9cup\u00e8re Nom, Pr\u00e9nom et AVS du stagiaire via le StagiaireID de la Demande";

// ==========================================
// 4. Nouvelle variable : Initialiser_varAVS
//    Le vrai AVS complet depuis SharePoint (pas le masqué de l'objet)
//    Placée après varNomPrenom, avant la vérification du dossier
// ==========================================
console.log('4. Adding Initialiser_varAVS');
actions['Initialiser_varAVS'] = {
  runAfter: { 'Initialiser_la_variable_3': ['Succeeded'] },
  type: 'InitializeVariable',
  inputs: {
    variables: [{
      name: 'varAVS',
      type: 'string',
      value: "@first(body('Envoyer_une_requ\u00eate_HTTP_\u00e0_SharePoint_2')?['d']?['results'])?['AVS']",
    }]
  },
  description: "AVS r\u00e9el du stagiaire (r\u00e9cup\u00e9r\u00e9 depuis SharePoint)\nUtilis\u00e9 pour le chemin des dossiers",
};

// ==========================================
// 5. Modifier SP_3 runAfter : Initialiser_la_variable_3 → Initialiser_varAVS
// ==========================================
console.log('5. Changing SP_3 runAfter → Initialiser_varAVS');
actions['Envoyer_une_requ\u00eate_HTTP_\u00e0_SharePoint_3'].runAfter = {
  'Initialiser_varAVS': ['Succeeded']
};

// ==========================================
// 6. Nouvelle action : MAJ_Statut_Demande
//    Met à jour Demande : Statut → "Documents réceptionnés" + DateReceptionDocs
//    Placée après Appliquer_à_chacun (après upload des PJ)
// ==========================================
console.log('6. Adding MAJ_Statut_Demande (PatchItem)');
actions['MAJ_Statut_Demande'] = {
  runAfter: { 'Appliquer_\u00e0_chacun': ['Succeeded'] },
  type: 'OpenApiConnection',
  inputs: {
    parameters: {
      dataset: SP_SITE,
      table: DEMANDE_LIST_GUID,
      id: "@int(variables('varDemandeID'))",
      'item/Statut/Value': 'Documents r\u00e9ceptionn\u00e9s',
      'item/DateReceptionDocs': "@utcNow()",
    },
    host: {
      apiId: '/providers/Microsoft.PowerApps/apis/shared_sharepointonline',
      connectionName: 'shared_sharepointonline',
      operationId: 'PatchItem',
    },
    authentication: "@parameters('$authentication')",
  },
  description: "Met \u00e0 jour la Demande : Statut \u2192 'Documents r\u00e9ceptionn\u00e9s' + DateReceptionDocs = maintenant",
};

// ==========================================
// 7. Descriptions sur les actions existantes
// ==========================================
console.log('7. Adding descriptions to existing actions');

actions['Initialiser_la_variable_1'].description =
  "Nom du stagiaire (depuis SharePoint)";
actions['Initialiser_la_variable_2'].description =
  "Pr\u00e9nom du stagiaire (depuis SharePoint)";
actions['Initialiser_la_variable_3'].description =
  "Concat\u00e9nation Nom + Pr\u00e9nom (pour nommage dossiers/fichiers)";

// SP_3 already has description, let's enhance it
actions['Envoyer_une_requ\u00eate_HTTP_\u00e0_SharePoint_3'].description =
  "V\u00e9rifie si le dossier AVS du stagiaire existe d\u00e9j\u00e0 dans Stagiaires Doc\n404 = n'existe pas \u2192 cr\u00e9ation\n200 = existe d\u00e9j\u00e0 \u2192 skip";

// Condition
actions['Condition'].description =
  "404 = Le dossier n'a pas \u00e9t\u00e9 trouv\u00e9 \u2192 Vrai = On cr\u00e9e le dossier + copie mod\u00e8le + renommage\nFaux (200) = Dossier existe d\u00e9j\u00e0 \u2192 on passe directement aux pi\u00e8ces jointes";

actions['Condition'].actions['Envoyer_une_requ\u00eate_HTTP_\u00e0_SharePoint_7'].description =
  "Cr\u00e9e le dossier racine AVS dans Stagiaires Doc";
actions['Condition'].actions['Copier_le_dossier'].description =
  "Copie le mod\u00e8le '8. Mod\u00e8le dossier_NOM Pr\u00e9nom' dans le dossier AVS";
actions['Condition'].actions['Envoyer_une_requ\u00eate_HTTP_\u00e0_SharePoint'].description =
  "Renomme NOM Pr\u00e9nom - Suivi.docx avec le vrai nom du stagiaire";
actions['Condition'].actions['Envoyer_une_requ\u00eate_HTTP_\u00e0_SharePoint_4'].description =
  "Renomme NOM Pr\u00e9nom - Demande uniforme.docx avec le vrai nom du stagiaire";
actions['Condition'].actions['Envoyer_une_requ\u00eate_HTTP_\u00e0_SharePoint_6'].description =
  "Renomme le dossier mod\u00e8le '8. Mod\u00e8le dossier_NOM Pr\u00e9nom' \u2192 '8. Mod\u00e8le dossier_{Nom} {Pr\u00e9nom}'";

actions['Appliquer_\u00e0_chacun'].description =
  "Boucle sur chaque pi\u00e8ce jointe du mail et l'upload dans 1. Administratif";
actions['Appliquer_\u00e0_chacun'].actions['Envoyer_une_requ\u00eate_HTTP_\u00e0_SharePoint_1'].description =
  "Upload la pi\u00e8ce jointe dans le sous-dossier 1. Administratif du stagiaire";

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
const base = 'C:/Users/karim/PowerAutomate-Agent/flux2-work';
const flowGuid = 'b865cf6d-dfdf-4b46-8df0-5d0e82baed17';
const flowPath = `Microsoft.Flow/flows/${flowGuid}`;

zip.addLocalFile(`${base}/${flowPath}/apisMap.json`, flowPath);
zip.addLocalFile(`${base}/${flowPath}/connectionsMap.json`, flowPath);
zip.addLocalFile(`${base}/${flowPath}/definition.json`, flowPath);
zip.addLocalFile(`${base}/Microsoft.Flow/flows/manifest.json`, 'Microsoft.Flow/flows');
zip.addLocalFile(`${base}/manifest.json`, '');
zip.writeZip('C:/Users/karim/PowerAutomate-Agent/reception-piece-jointes-modifie.zip');

// Vérification
const check = new AdmZip('C:/Users/karim/PowerAutomate-Agent/reception-piece-jointes-modifie.zip');
console.log('\nZIP contents:');
check.getEntries().forEach(e => console.log('  ' + e.entryName, e.header.size));
console.log('\nDone!');

// Résumé
console.log('\n=== Summary ===');
console.log('- varAVS → varDemandeID (parse D° from subject)');
console.log('- Added Requête_HTTP_Demande (query Demande by ID → StagiaireIDId)');
console.log('- SP_2 now queries Stagiaire by Id (from Demande lookup), not by AVS');
console.log('- Added Initialiser_varAVS (real AVS from SharePoint)');
console.log('- Added MAJ_Statut_Demande (PatchItem: Statut + DateReceptionDocs)');
console.log('- Descriptions added to all actions');
