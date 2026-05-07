const fs = require('fs');
const AdmZip = require('adm-zip');

// =============================================
// Lire le Flux 3 existant pour copier toute la logique
// =============================================
const flux3Path = 'C:/Users/karim/PowerAutomate-Agent/flux3-work/Microsoft.Flow/flows/e03bb264-eb3c-4ebd-bd63-87a78c083b68/definition.json';
const flux3 = JSON.parse(fs.readFileSync(flux3Path, 'utf8'));

// Extraire le token GitHub et les actions du Flux 3
const flux3Actions = flux3.properties.definition.actions;

// =============================================
// CONSTANTES
// =============================================
const FLOW_GUID = 'a3b7c91d-4e5f-6a7b-8c9d-0e1f2a3b4c5d';
const FLOW_ID = 'c1d2e3f4-a5b6-7890-cdef-123456789abc';
const SP_SITE = 'https://fondationclairbois.sharepoint.com/sites/DFIP-SiteEquipe';
const CRENEAUX_GUID = '3e2deb27-f496-410f-be74-281eb2b0c079';
const TENANT_ID = 'b38370c4-d4e6-4db3-8103-301e95e4e40c';
const CREATOR_ID = '3995bcc7-5e9e-4254-8370-a930628a2317';
const API_SP = '2e6b970c-dc5b-4920-8b1a-981b957283d0';
const CONN_SP = 'c1e11ff6-1671-4f41-a2e2-6986289998fd';

// =============================================
// DEFINITION.JSON — Copie de Flux 3 avec trigger Creneaux
// =============================================
const definition = {
  name: FLOW_ID,
  id: `/providers/Microsoft.Flow/flows/${FLOW_ID}`,
  type: "Microsoft.Flow/flows",
  properties: {
    apiId: "/providers/Microsoft.PowerApps/apis/shared_logicflows",
    displayName: "Flux 3b - MAJ planning (trigger Cr\u00e9neaux)",
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
        // SEULE DIFFÉRENCE : trigger sur la liste Creneaux (au lieu de Demande)
        "Quand_un_cr\u00e9neau_est_cr\u00e9\u00e9_ou_modifi\u00e9": {
          type: "OpenApiConnection",
          inputs: {
            parameters: {
              dataset: SP_SITE,
              table: CRENEAUX_GUID
            },
            host: {
              apiId: "/providers/Microsoft.PowerApps/apis/shared_sharepointonline",
              connectionName: "shared_sharepointonline",
              operationId: "GetOnUpdatedItems"
            },
            authentication: "@parameters('$authentication')"
          },
          recurrence: {
            frequency: "Minute",
            interval: 3
          },
          splitOn: "@triggerOutputs()?['body/value']",
          description: "Se d\u00e9clenche quand un Cr\u00e9neau est cr\u00e9\u00e9 ou modifi\u00e9 (liste Creneaux)"
        }
      },
      // Réutiliser exactement les mêmes actions que Flux 3
      actions: flux3Actions,
      outputs: {}
    },
    connectionReferences: {
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
// SAUVEGARDER
// =============================================
const base = 'C:/Users/karim/PowerAutomate-Agent/flux3b-work';
const flowPath = `${base}/Microsoft.Flow/flows/${FLOW_GUID}`;

// definition.json
fs.writeFileSync(`${flowPath}/definition.json`, JSON.stringify(definition));
console.log('definition.json saved!');

// connectionsMap.json (SharePoint uniquement)
fs.writeFileSync(`${flowPath}/connectionsMap.json`, JSON.stringify({
  shared_sharepointonline: CONN_SP
}));
console.log('connectionsMap.json saved!');

// apisMap.json
fs.writeFileSync(`${flowPath}/apisMap.json`, JSON.stringify({
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
    displayName: "Flux 3b - MAJ planning (trigger Cr\u00e9neaux)",
    description: "Reg\u00e9n\u00e8re planning.json quand un cr\u00e9neau est cr\u00e9\u00e9/modifi\u00e9 dans SharePoint",
    createdTime: new Date().toISOString(),
    packageTelemetryId: "flux3b-trigger-creneaux",
    creator: "N/A",
    sourceEnvironment: ""
  },
  resources: {
    [FLOW_GUID]: {
      type: "Microsoft.Flow/flows",
      suggestedCreationType: "New",
      creationType: "Existing, New, Update",
      details: { displayName: "Flux 3b - MAJ planning (trigger Cr\u00e9neaux)" },
      configurableBy: "User",
      hierarchy: "Root",
      dependsOn: [API_SP, CONN_SP]
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
zip.writeZip('C:/Users/karim/PowerAutomate-Agent/flux3b-trigger-creneaux.zip');

// Vérification
const check = new AdmZip('C:/Users/karim/PowerAutomate-Agent/flux3b-trigger-creneaux.zip');
console.log('\nZIP contents:');
check.getEntries().forEach(e => console.log('  ' + e.entryName, e.header.size));

console.log('\n=== FLUX 3b SUMMARY ===');
console.log('Name: Flux 3b - MAJ planning (trigger Cr\u00e9neaux)');
console.log('Trigger: Cr\u00e9ation/modification dans liste Creneaux (polling 3 min)');
console.log('Actions: IDENTIQUES au Flux 3');
console.log('  1. GET_Creneaux');
console.log('  2. GET_Demandes');
console.log('  3. Init_varCreneaux');
console.log('  4. Boucle (Filtrer + Ajouter)');
console.log('  5. Compose_JSON');
console.log('  6. GET_SHA_GitHub');
console.log('  7. Push_GitHub');
console.log('\nDiff vs Flux 3: trigger sur Creneaux au lieu de Demande');
console.log('\nOutput: flux3b-trigger-creneaux.zip');
