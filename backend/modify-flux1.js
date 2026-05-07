const fs = require('fs');

const defPath = 'C:/Users/karim/PowerAutomate-Agent/flux1-work-fix/Microsoft.Flow/flows/8affe7f1-3296-48a2-a2cb-1de6832d8997/definition.json';
const data = JSON.parse(fs.readFileSync(defPath, 'utf8'));

const DEMANDE_LIST = '9616ee1d-dd0b-44fd-a1c4-34187ebaa9f8';
const SP_SITE = 'https://fondationclairbois.sharepoint.com/sites/DFIP-SiteEquipe';

// Champs à retirer des actions Stagiaire (déplacés vers Demande)
const FIELDS_TO_REMOVE = ['item/Statut/Value', 'item/ObjectifStage', 'item/Secteur', 'item/DejaStage'];

function removeStageFields(params) {
  for (const f of FIELDS_TO_REMOVE) {
    if (f in params) {
      delete params[f];
      console.log('  Removed: ' + f);
    } else {
      console.log('  WARNING: ' + f + ' not found!');
    }
  }
}

function makeDemandeAction(stagiaireIdExpr, referentIdExpr, runAfterName) {
  const p = {
    dataset: SP_SITE,
    table: DEMANDE_LIST,
    'item/StagiaireID/Id': stagiaireIdExpr,
    'item/Etablissement': "@outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/r2876f0c952f44887946296b4c95367a3']",
    'item/Secteur': "@outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/r1faa50a65150406b95d3a62e45550e40']",
    'item/DateDebutSouhaitee': "@outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/r50efe78018854247bf6e734db7188d70']",
    'item/ObjectifStage': "@outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/rf8524324a2184a329c4351ff39b771d7']",
    'item/DejaStage': "@if(equals(outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/r9385fc308c554ca68e57f904c4d65bdd'], 'Oui'), true, false)",
    'item/Statut/Value': 'En attente des documents',
    'item/Limitations': "@outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/ra96b2095ead84cf086d63f5b7bb8842f']",
    'item/ParcoursScolaire': "@outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/r1b0cf13f9a9c4e5389a6475b485121e7']",
  };
  if (referentIdExpr) {
    p['item/ReferentID/Id'] = referentIdExpr;
  }
  return {
    runAfter: { [runAfterName]: ['Succeeded'] },
    type: 'OpenApiConnection',
    inputs: {
      parameters: p,
      host: {
        apiId: '/providers/Microsoft.PowerApps/apis/shared_sharepointonline',
        connectionName: 'shared_sharepointonline',
        operationId: 'PostItem',
      },
      authentication: "@parameters('$authentication')",
    },
  };
}

// Navigation dans l'arbre d'actions
const c1 = data.properties.definition.actions.Condition_1;
const cMail = c1.actions.Condition;
const c3 = cMail.actions.Condition_3;
const c2 = c1.else.actions.Condition_2;
const c4 = c2.actions.Condition_4;

// ==========================================
// PATH 1: Moi-m\u00eame + AVS existe (MAJ)
// ==========================================
console.log('\n--- Path 1: Moi-meme + MAJ ---');
const maj = c3.actions["Mettre_\u00e0_jour_l'\u00e9l\u00e9ment"];
removeStageFields(maj.inputs.parameters);

c3.actions["Cr\u00e9er_Demande"] = makeDemandeAction(
  "@first(body('Envoyer_une_requ\u00eate_HTTP_\u00e0_SharePoint')?['d']?['results'])?['Id']",
  null,
  "Mettre_\u00e0_jour_l'\u00e9l\u00e9ment"
);
console.log('  Added: Creer_Demande');

const email1 = c3.actions['Envoyer_un_e-mail_(V2)_2'];
email1.runAfter = { "Cr\u00e9er_Demande": ['Succeeded'] };
email1.inputs.parameters['emailMessage/Subject'] =
  "@concat('[AVS-756.XXXX.XXXX.', substring(outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/rddc7676789f4474ea2ffd68f6388dfd9'], sub(length(outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/rddc7676789f4474ea2ffd68f6388dfd9']), 2)), ' D\u00b0', outputs('Cr\u00e9er_Demande')?['body/ID'], '] Documents requis pour ', outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/r0a5286e1e9484d7fb4917b0e17aafdde'], ' ', outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/r51eac184630a40c582dda502c5159dcc'])";
console.log('  Updated email: N -> D, runAfter -> Creer_Demande');

// ==========================================
// PATH 2: Moi-m\u00eame + AVS n'existe pas (CREATE)
// ==========================================
console.log('\n--- Path 2: Moi-meme + CREATE ---');
const creer = c3.else.actions["Cr\u00e9er_un_\u00e9l\u00e9ment"];
removeStageFields(creer.inputs.parameters);

c3.else.actions["Cr\u00e9er_Demande_1"] = makeDemandeAction(
  "@outputs('Cr\u00e9er_un_\u00e9l\u00e9ment')?['body/ID']",
  null,
  "Cr\u00e9er_un_\u00e9l\u00e9ment"
);
console.log('  Added: Creer_Demande_1');

const email2 = c3.else.actions['Envoyer_un_e-mail_(V2)'];
email2.runAfter = { "Cr\u00e9er_Demande_1": ['Succeeded'] };
email2.inputs.parameters['emailMessage/Subject'] =
  "@concat('[AVS-756.XXXX.XXXX.', substring(outputs('Cr\u00e9er_un_\u00e9l\u00e9ment')?['body/AVS'], sub(length(outputs('Cr\u00e9er_un_\u00e9l\u00e9ment')?['body/AVS']), 2)), ' D\u00b0', outputs('Cr\u00e9er_Demande_1')?['body/ID'], '] Documents requis pour ', outputs('Cr\u00e9er_un_\u00e9l\u00e9ment')?['body/Nom'], ' ', outputs('Cr\u00e9er_un_\u00e9l\u00e9ment')?['body/Prenom'])";
console.log('  Updated email: N -> D, runAfter -> Creer_Demande_1');

// ==========================================
// PATH 3: R\u00e9f\u00e9rent + AVS existe (MAJ)
// ==========================================
console.log('\n--- Path 3: Referent + MAJ ---');
const maj1 = c4.actions["Mettre_\u00e0_jour_l'\u00e9l\u00e9ment_1"];
removeStageFields(maj1.inputs.parameters);

c4.actions["Cr\u00e9er_Demande_2"] = makeDemandeAction(
  "@first(body('Envoyer_une_requ\u00eate_HTTP_\u00e0_SharePoint_1')?['d']?['results'])?['Id']",
  "@outputs('Cr\u00e9er_un_\u00e9l\u00e9ment_R\u00e9f\u00e9rent_1')?['body/ID']",
  "Cr\u00e9er_un_\u00e9l\u00e9ment_R\u00e9f\u00e9rent_1"
);
console.log('  Added: Creer_Demande_2 (with ReferentID)');

const email3 = c4.actions['Envoyer_un_e-mail_(V2)_1_1'];
email3.runAfter = { "Cr\u00e9er_Demande_2": ['Succeeded'] };
email3.inputs.parameters['emailMessage/Subject'] =
  "@concat('[AVS-756.XXXX.XXXX.', substring(outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/rddc7676789f4474ea2ffd68f6388dfd9'], sub(length(outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/rddc7676789f4474ea2ffd68f6388dfd9']), 2)), ' D\u00b0', outputs('Cr\u00e9er_Demande_2')?['body/ID'], '] Documents requis pour ', outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/r0a5286e1e9484d7fb4917b0e17aafdde'], ' ', outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/r51eac184630a40c582dda502c5159dcc'])";
console.log('  Updated email: N -> D, runAfter -> Creer_Demande_2');

// ==========================================
// PATH 4: R\u00e9f\u00e9rent + AVS n'existe pas (CREATE)
// ==========================================
console.log('\n--- Path 4: Referent + CREATE ---');
const creer1 = c4.else.actions["Cr\u00e9er_un_\u00e9l\u00e9ment_1"];
removeStageFields(creer1.inputs.parameters);

c4.else.actions["Cr\u00e9er_Demande_3"] = makeDemandeAction(
  "@outputs('Cr\u00e9er_un_\u00e9l\u00e9ment_1')?['body/ID']",
  "@outputs('Cr\u00e9er_un_\u00e9l\u00e9ment_R\u00e9f\u00e9rent')?['body/ID']",
  "Cr\u00e9er_un_\u00e9l\u00e9ment_R\u00e9f\u00e9rent"
);
console.log('  Added: Creer_Demande_3 (with ReferentID)');

const email4 = c4.else.actions['Envoyer_un_e-mail_(V2)_1'];
email4.runAfter = { "Cr\u00e9er_Demande_3": ['Succeeded'] };
email4.inputs.parameters['emailMessage/Subject'] =
  "@concat('[AVS-756.XXXX.XXXX.', substring(outputs('Cr\u00e9er_un_\u00e9l\u00e9ment_1')?['body/AVS'], sub(length(outputs('Cr\u00e9er_un_\u00e9l\u00e9ment_1')?['body/AVS']), 2)), ' D\u00b0', outputs('Cr\u00e9er_Demande_3')?['body/ID'], '] Documents requis pour ', outputs('Cr\u00e9er_un_\u00e9l\u00e9ment_1')?['body/Nom'], ' ', outputs('Cr\u00e9er_un_\u00e9l\u00e9ment_1')?['body/Prenom'])";
console.log('  Updated email: N -> D, runAfter -> Creer_Demande_3');

// Sauvegarde
fs.writeFileSync(defPath, JSON.stringify(data));
console.log('\n=== definition.json saved! ===');
console.log('Summary:');
console.log('- 16 fields removed from 4 Stagiaire actions (4 x 4)');
console.log('- 4 Creer_Demande actions added');
console.log('- 4 email subjects changed N -> D with Demande ID');
console.log('- 4 email runAfter chains updated');
