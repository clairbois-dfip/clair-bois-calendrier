const fs = require('fs');
const AdmZip = require('adm-zip');

// =============================================
// CONSTANTES
// =============================================
const SP_SITE = 'https://fondationclairbois.sharepoint.com/sites/DFIP-SiteEquipe';
const CRENEAUX_GUID = '3e2deb27-f496-410f-be74-281eb2b0c079';
const FLOW_GUID = 'f4c82a19-7d5e-4b3a-9f1c-8e6d2a0b5c47';
const FLOW_ID = 'b7a91c3d-2e4f-5060-8172-93a4b5c6d7e8';

// Form "Gestion des créneaux"
const FORM_ID = 'xHCDs-bUs02BAzAeleTkDMe8lTmeXlRCg3CpMGKKIxdUMVIwUkI1MlNIMzA0SlhKQ0tXV0RKSUNOQi4u';

// Champs du formulaire
const FIELD_ETABLISSEMENT = 'rb1c6311a61044eb184fa3270fd065e32';
const FIELD_SECTEUR = 'r69f254172ecd4baa9c92b2ef2d86f48c';
const FIELD_DATE_DEBUT = 'reee4e33cc677406885a947061d7d9cde';
const FIELD_DATE_FIN = 'r77ae6366339446f39c90be5aa93b3a71';
const FIELD_PLACES = 'r673220bf96894b43b6cd98c623c6d0fe';
const FIELD_TYPE_CRENEAU = 'rd79308a2436b46d7be9921d3eed3ca79';
const FIELD_NOM_MODULE = 'rc347ff44177743a8b9561f6d6f9eed2c';
const FIELD_DESCRIPTION = 'r43c3849ff3284246a7c68d571f7ca3df';
const FIELD_MOT_DE_PASSE = 'rce9b9c542c0d455a8c01298b063332fe';
const MOT_DE_PASSE = 'ClairBois#Creneaux94!';

// Métadonnées environnement
const TENANT_ID = 'b38370c4-d4e6-4db3-8103-301e95e4e40c';
const CREATOR_ID = '3995bcc7-5e9e-4254-8370-a930628a2317';

// GUIDs connexions (depuis Flux 1)
const CONN_FORMS = 'bdeb5556-a627-4e30-bc7c-fd0915978877';
const CONN_SP = 'c1e11ff6-1671-4f41-a2e2-6986289998fd';
const API_FORMS = '607ecd1d-8ed5-4906-b390-ef1c71282796';
const API_SP = '2e6b970c-dc5b-4920-8b1a-981b957283d0';

// =============================================
// DEFINITION.JSON
// =============================================
const definition = {
  name: FLOW_ID,
  id: `/providers/Microsoft.Flow/flows/${FLOW_ID}`,
  type: "Microsoft.Flow/flows",
  properties: {
    apiId: "/providers/Microsoft.PowerApps/apis/shared_logicflows",
    displayName: "Flux 4 - Gestion des cr\u00e9neaux",
    definition: {
      metadata: {
        creator: {
          id: CREATOR_ID,
          type: "User",
          tenantId: TENANT_ID
        },
        clientLastModifiedTime: new Date().toISOString(),
        connectionKeySavedTimeKey: new Date().toISOString()
      },
      "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
      contentVersion: "1.0.0.0",
      parameters: {
        "$authentication": { defaultValue: {}, type: "SecureObject" },
        "$connections": { defaultValue: {}, type: "Object" }
      },
      triggers: {
        "Lorsqu'une_nouvelle_r\u00e9ponse_est_envoy\u00e9e": {
          splitOn: "@triggerOutputs()?['body/value']",
          type: "OpenApiConnectionWebhook",
          inputs: {
            parameters: {
              form_id: FORM_ID
            },
            host: {
              apiId: "/providers/Microsoft.PowerApps/apis/shared_microsoftforms",
              connectionName: "shared_microsoftforms",
              operationId: "CreateFormWebhook"
            },
            authentication: "@parameters('$authentication')"
          }
        }
      },
      actions: {
        // 1. Obtenir les détails de la réponse
        "Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse": {
          runAfter: {},
          type: "OpenApiConnection",
          inputs: {
            parameters: {
              form_id: FORM_ID,
              response_id: "@triggerOutputs()?['body/resourceData/responseId']"
            },
            host: {
              apiId: "/providers/Microsoft.PowerApps/apis/shared_microsoftforms",
              connectionName: "shared_microsoftforms",
              operationId: "GetFormResponseById"
            },
            authentication: "@parameters('$authentication')"
          },
          description: "R\u00e9cup\u00e8re les d\u00e9tails de la r\u00e9ponse au formulaire Gestion des cr\u00e9neaux"
        },

        // 2. Vérifier le mot de passe
        "V\u00e9rifier_mot_de_passe": {
          runAfter: { "Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse": ["Succeeded"] },
          type: "If",
          expression: {
            and: [{
              equals: [
                `@outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/${FIELD_MOT_DE_PASSE}']`,
                MOT_DE_PASSE
              ]
            }]
          },
          actions: {
            // 3. Créer le créneau (seulement si mot de passe correct)
            "Cr\u00e9er_Cr\u00e9neau": {
              runAfter: {},
              type: "OpenApiConnection",
              inputs: {
                parameters: {
                  dataset: SP_SITE,
                  table: CRENEAUX_GUID,
                  "item/Etablissement": `@replace(outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/${FIELD_ETABLISSEMENT}'], '+', ' ')`,
                  "item/Description": `@outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/${FIELD_DESCRIPTION}']`,
                  "item/Secteur": `@replace(outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/${FIELD_SECTEUR}'], '+', ' ')`,
                  "item/DateDebut": `@outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/${FIELD_DATE_DEBUT}']`,
                  "item/DateFin": `@outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/${FIELD_DATE_FIN}']`,
                  "item/PlacesTotal": `@int(outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/${FIELD_PLACES}'])`,
                  "item/TypeCreneau/Value": `@outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/${FIELD_TYPE_CRENEAU}']`,
                  "item/Nomdumodule": `@outputs('Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse')?['body/${FIELD_NOM_MODULE}']`
                },
                host: {
                  apiId: "/providers/Microsoft.PowerApps/apis/shared_sharepointonline",
                  connectionName: "shared_sharepointonline",
                  operationId: "PostItem"
                },
                authentication: "@parameters('$authentication')"
              },
              description: "Cr\u00e9e un nouveau cr\u00e9neau dans la liste SharePoint Creneaux\nPlacesTotal converti de texte en nombre avec int()"
            }
          },
          else: { actions: {} },
          description: "V\u00e9rifie le mot de passe avant de cr\u00e9er le cr\u00e9neau\nMot de passe incorrect = soumission ignor\u00e9e"
        }
      },
      outputs: {}
    },
    connectionReferences: {
      shared_microsoftforms: {
        connectionName: "shared-microsoftform-d85e5621-5e28-4214-b672-097e0a4a02ff",
        source: "Embedded",
        id: "/providers/Microsoft.PowerApps/apis/shared_microsoftforms",
        tier: "NotSpecified",
        apiName: "microsoftforms",
        isProcessSimpleApiReferenceConversionAlreadyDone: false
      },
      shared_sharepointonline: {
        connectionName: "shared-sharepointonl-9d5444a2-e35b-4b0c-a114-8022d6b1ace5",
        source: "Embedded",
        id: "/providers/Microsoft.PowerApps/apis/shared_sharepointonline",
        tier: "NotSpecified",
        apiName: "sharepointonline",
        isProcessSimpleApiReferenceConversionAlreadyDone: false
      }
    },
    flowFailureAlertSubscribed: false,
    isManaged: false
  }
};

// =============================================
// SAUVEGARDER LES FICHIERS
// =============================================

const base = 'C:/Users/karim/PowerAutomate-Agent/flux4-work';
const flowPath = `${base}/Microsoft.Flow/flows/${FLOW_GUID}`;

// definition.json
fs.writeFileSync(`${flowPath}/definition.json`, JSON.stringify(definition));
console.log('definition.json saved!');

// connectionsMap.json (Forms + SharePoint)
fs.writeFileSync(`${flowPath}/connectionsMap.json`, JSON.stringify({
  shared_microsoftforms: CONN_FORMS,
  shared_sharepointonline: CONN_SP
}));
console.log('connectionsMap.json saved!');

// apisMap.json (GUIDs de ressource du manifest)
fs.writeFileSync(`${flowPath}/apisMap.json`, JSON.stringify({
  shared_microsoftforms: API_FORMS,
  shared_sharepointonline: API_SP
}));
console.log('apisMap.json saved!');

// Microsoft.Flow/flows/manifest.json
fs.writeFileSync(`${base}/Microsoft.Flow/flows/manifest.json`, JSON.stringify({
  packageSchemaVersion: "1.0",
  flowAssets: { assetPaths: [FLOW_GUID] }
}));
console.log('flows/manifest.json saved!');

// manifest.json (racine)
const manifest = {
  schema: "1.0",
  details: {
    displayName: "Flux 4 - Gestion des cr\u00e9neaux",
    description: "Cr\u00e9e des cr\u00e9neaux dans SharePoint depuis le formulaire Microsoft Forms",
    createdTime: new Date().toISOString(),
    packageTelemetryId: "flux4-gestion-creneaux",
    creator: "N/A",
    sourceEnvironment: ""
  },
  resources: {
    [FLOW_GUID]: {
      type: "Microsoft.Flow/flows",
      suggestedCreationType: "New",
      creationType: "Existing, New, Update",
      details: { displayName: "Flux 4 - Gestion des cr\u00e9neaux" },
      configurableBy: "User",
      hierarchy: "Root",
      dependsOn: [API_FORMS, API_SP, CONN_FORMS, CONN_SP]
    },
    [API_FORMS]: {
      id: "/providers/Microsoft.PowerApps/apis/shared_microsoftforms",
      name: "shared_microsoftforms",
      type: "Microsoft.PowerApps/apis",
      suggestedCreationType: "Existing",
      details: {
        displayName: "Microsoft Forms",
        iconUri: "https://conn-afd-prod-endpoint-bmc9bqahasf3grgk.b01.azurefd.net/releases/v1.0.1769/1.0.1769.4361/microsoftforms/icon.png"
      },
      configurableBy: "System",
      hierarchy: "Child",
      dependsOn: []
    },
    [API_SP]: {
      id: "/providers/Microsoft.PowerApps/apis/shared_sharepointonline",
      name: "shared_sharepointonline",
      type: "Microsoft.PowerApps/apis",
      suggestedCreationType: "Existing",
      details: {
        displayName: "SharePoint",
        iconUri: "https://conn-afd-prod-endpoint-bmc9bqahasf3grgk.b01.azurefd.net/releases/v1.0.1769/1.0.1769.4361/sharepointonline/icon.png"
      },
      configurableBy: "System",
      hierarchy: "Child",
      dependsOn: []
    },
    [CONN_FORMS]: {
      type: "Microsoft.PowerApps/apis/connections",
      suggestedCreationType: "Existing",
      creationType: "Existing",
      details: {
        displayName: "stagiaire.dfip@clairbois.ch",
        iconUri: "https://conn-afd-prod-endpoint-bmc9bqahasf3grgk.b01.azurefd.net/releases/v1.0.1769/1.0.1769.4361/microsoftforms/icon.png"
      },
      configurableBy: "User",
      hierarchy: "Child",
      dependsOn: [API_FORMS]
    },
    [CONN_SP]: {
      type: "Microsoft.PowerApps/apis/connections",
      suggestedCreationType: "Existing",
      creationType: "Existing",
      details: {
        displayName: "stagiaire.dfip@clairbois.ch",
        iconUri: "https://conn-afd-prod-endpoint-bmc9bqahasf3grgk.b01.azurefd.net/releases/v1.0.1769/1.0.1769.4361/sharepointonline/icon.png"
      },
      configurableBy: "User",
      hierarchy: "Child",
      dependsOn: [API_SP]
    }
  }
};
fs.writeFileSync(`${base}/manifest.json`, JSON.stringify(manifest));
console.log('manifest.json (root) saved!');

// =============================================
// REPACKAGER LE ZIP
// =============================================
console.log('\nRepackaging zip...');
const zip = new AdmZip();

zip.addLocalFile(`${flowPath}/apisMap.json`, `Microsoft.Flow/flows/${FLOW_GUID}`);
zip.addLocalFile(`${flowPath}/connectionsMap.json`, `Microsoft.Flow/flows/${FLOW_GUID}`);
zip.addLocalFile(`${flowPath}/definition.json`, `Microsoft.Flow/flows/${FLOW_GUID}`);
zip.addLocalFile(`${base}/Microsoft.Flow/flows/manifest.json`, 'Microsoft.Flow/flows');
zip.addLocalFile(`${base}/manifest.json`, '');
zip.writeZip('C:/Users/karim/PowerAutomate-Agent/flux4-gestion-creneaux.zip');

// Vérification
const check = new AdmZip('C:/Users/karim/PowerAutomate-Agent/flux4-gestion-creneaux.zip');
console.log('\nZIP contents:');
check.getEntries().forEach(e => console.log('  ' + e.entryName, e.header.size));

console.log('\n=== FLUX 4 SUMMARY ===');
console.log('Name: Flux 4 - Gestion des cr\u00e9neaux');
console.log('Form: Gestion des cr\u00e9neaux');
console.log('Trigger: Nouvelle r\u00e9ponse au formulaire');
console.log('Actions:');
console.log('  1. Obtenir_les_d\u00e9tails_de_la_r\u00e9ponse (Forms)');
console.log('  2. Cr\u00e9er_Cr\u00e9neau (SP PostItem -> liste Creneaux)');
console.log('\nChamps:');
console.log('  Etablissement -> texte');
console.log('  Secteur -> texte');
console.log('  DateDebut -> date');
console.log('  DateFin -> date');
console.log('  PlacesTotal -> int() conversion');
console.log('\nOutput: flux4-gestion-creneaux.zip');
