const fs = require('fs');
const AdmZip = require('adm-zip');

// Lire le flux test existant pour récupérer les IDs et le token GitHub
const defPath = '/home/miles/projets/clair-bois/backend/flux3-work/Microsoft.Flow/flows/e03bb264-eb3c-4ebd-bd63-87a78c083b68/definition.json';
const testData = JSON.parse(fs.readFileSync(defPath, 'utf8'));

// Extraire le token GitHub du flux test
const githubToken = testData.properties.definition.actions.GET_SHA_GitHub.inputs.headers.Authorization;
const GITHUB_REPO = 'clairbois-dfip/clair-bois-calendrier';
const GITHUB_FILE = 'public/planning.json';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`;

const SP_SITE = 'https://fondationclairbois.sharepoint.com/sites/DFIP-SiteEquipe';
const CRENEAUX_GUID = '3e2deb27-f496-410f-be74-281eb2b0c079';
const DEMANDE_GUID = '9616ee1d-dd0b-44fd-a1c4-34187ebaa9f8';
const FORMS_URL = 'https://forms.office.com/e/3SZvXC6kb5';

// Conserver les métadonnées du flux test
const meta = testData.properties.definition.metadata;

// =============================================
// CONSTRUIRE LE NOUVEAU DEFINITION.JSON
// =============================================

const definition = {
  name: testData.name,
  id: testData.id,
  type: testData.type,
  properties: {
    apiId: testData.properties.apiId,
    displayName: "Flux 3 - G\u00e9n\u00e9ration planning.json",
    definition: {
      metadata: meta,
      "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
      contentVersion: "1.0.0.0",
      parameters: {
        "$authentication": { defaultValue: {}, type: "SecureObject" },
        "$connections": { defaultValue: {}, type: "Object" }
      },
      triggers: {
        "manual": {
          type: "Request",
          kind: "Button",
          inputs: { schema: { type: "object", properties: {}, required: [] } }
        }
      },
      actions: {
        // =============================================
        // 1. GET tous les Créneaux depuis SharePoint
        // =============================================
        "GET_Creneaux": {
          runAfter: {},
          type: "OpenApiConnection",
          inputs: {
            parameters: {
              dataset: SP_SITE,
              "parameters/method": "GET",
              "parameters/uri": `_api/web/lists(guid'${CRENEAUX_GUID}')/items?$select=Id,Etablissement,Secteur,DateDebut,DateFin,PlacesTotal,Description,Icone&$top=5000`
            },
            host: {
              apiId: "/providers/Microsoft.PowerApps/apis/shared_sharepointonline",
              connectionName: "shared_sharepointonline",
              operationId: "HttpRequest"
            },
            authentication: "@parameters('$authentication')"
          },
          description: "R\u00e9cup\u00e8re tous les cr\u00e9neaux depuis la liste SharePoint"
        },

        // =============================================
        // 2. GET toutes les Demandes (avec CreneauIDId)
        // =============================================
        "GET_Demandes": {
          runAfter: { "GET_Creneaux": ["Succeeded"] },
          type: "OpenApiConnection",
          inputs: {
            parameters: {
              dataset: SP_SITE,
              "parameters/method": "GET",
              "parameters/uri": `_api/web/lists(guid'${DEMANDE_GUID}')/items?$select=Id,CreneauIDId,Statut&$top=5000`
            },
            host: {
              apiId: "/providers/Microsoft.PowerApps/apis/shared_sharepointonline",
              connectionName: "shared_sharepointonline",
              operationId: "HttpRequest"
            },
            authentication: "@parameters('$authentication')"
          },
          description: "R\u00e9cup\u00e8re toutes les Demandes avec leur CreneauIDId et Statut"
        },

        // =============================================
        // 3. Initialiser varCreneaux (tableau vide)
        // =============================================
        "Init_varCreneaux": {
          runAfter: { "GET_Demandes": ["Succeeded"] },
          type: "InitializeVariable",
          inputs: {
            variables: [{
              name: "varCreneaux",
              type: "array",
              value: []
            }]
          },
          description: "Tableau qui contiendra les cr\u00e9neaux avec le comptage des places"
        },

        // =============================================
        // 4. Boucle sur chaque créneau
        // =============================================
        "Appliquer_\u00e0_chaque_cr\u00e9neau": {
          foreach: "@body('GET_Creneaux')?['d']?['results']",
          actions: {
            // 4a. Filtrer les Demandes liées à ce créneau (non annulées)
            "Filtrer_Demandes": {
              type: "Query",
              inputs: {
                from: "@body('GET_Demandes')?['d']?['results']",
                where: "@and(equals(item()?['CreneauIDId'], items('Appliquer_\u00e0_chaque_cr\u00e9neau')?['Id']), not(equals(item()?['Statut'], 'Annul\u00e9')))"
              },
              description: "Filtre les Demandes li\u00e9es \u00e0 ce cr\u00e9neau (Statut \u2260 Annul\u00e9)"
            },
            // 4b. Ajouter le créneau au tableau avec le comptage
            "Ajouter_au_tableau": {
              runAfter: { "Filtrer_Demandes": ["Succeeded"] },
              type: "AppendToArrayVariable",
              inputs: {
                name: "varCreneaux",
                value: {
                  etablissement: "@items('Appliquer_\u00e0_chaque_cr\u00e9neau')?['Etablissement']",
                  secteur: "@items('Appliquer_\u00e0_chaque_cr\u00e9neau')?['Secteur']",
                  dateDebut: "@formatDateTime(items('Appliquer_\u00e0_chaque_cr\u00e9neau')?['DateDebut'], 'yyyy-MM-dd')",
                  dateFin: "@formatDateTime(items('Appliquer_\u00e0_chaque_cr\u00e9neau')?['DateFin'], 'yyyy-MM-dd')",
                  placesTotal: "@items('Appliquer_\u00e0_chaque_cr\u00e9neau')?['PlacesTotal']",
                  placesUtilisees: "@length(body('Filtrer_Demandes'))",
                  description: "@items('Appliquer_\u00e0_chaque_cr\u00e9neau')?['Description']",
                  icon: "@items('Appliquer_\u00e0_chaque_cr\u00e9neau')?['Icone']"
                }
              },
              description: "Ajoute le cr\u00e9neau avec placesUtilisees = nb de Demandes li\u00e9es"
            }
          },
          runAfter: { "Init_varCreneaux": ["Succeeded"] },
          type: "Foreach",
          description: "Pour chaque cr\u00e9neau, compte les Demandes li\u00e9es et construit l'entr\u00e9e"
        },

        // =============================================
        // 5. Composer le JSON final
        // =============================================
        "Compose_JSON": {
          runAfter: { "Appliquer_\u00e0_chaque_cr\u00e9neau": ["Succeeded"] },
          type: "Compose",
          inputs: {
            lastUpdated: "@utcNow()",
            formsUrl: FORMS_URL,
            formsUrlNouvelEtablissement: "https://forms.office.com/pages/responsepage.aspx?id=xHCDs-bUs02BAzAeleTkDMe8lTmeXlRCg3CpMGKKIxdUMVIwUkI1MlNIMzA0SlhKQ0tXV0RKSUNOQi4u",
            formsUrlNouveauSecteur: "https://forms.office.com/pages/responsepage.aspx?id=xHCDs-bUs02BAzAeleTkDMe8lTmeXlRCg3CpMGKKIxdUMVIwUkI1MlNIMzA0SlhKQ0tXV0RKSUNOQi4u",
            config: {},
            creneaux: "@variables('varCreneaux')",
            modulesMetiers: {
              formsUrlModules: FORMS_URL,
              maxSelection: 3,
              semaines: [
                { semaine: 20, annee: 2026, dateDebut: "2026-05-11", dateFin: "2026-05-15" },
                { semaine: 40, annee: 2026, dateDebut: "2026-09-28", dateFin: "2026-10-02" },
                { semaine: 44, annee: 2026, dateDebut: "2026-10-26", dateFin: "2026-10-30" },
                { semaine: 49, annee: 2026, dateDebut: "2026-11-30", dateFin: "2026-12-04" }
              ],
              modules: [
                { nom: "Cuisine",      site: "CBP", jour: "lundi",    heureDebut: "08:00", heureFin: "11:00", placesTotal: 3, placesUtilisees: 0, couleur: "#e67e22" },
                { nom: "Cuisine",      site: "CBM", jour: "mercredi", heureDebut: "08:00", heureFin: "11:00", placesTotal: 2, placesUtilisees: 0, couleur: "#e67e22" },
                { nom: "Lingerie",     site: "CBL", jour: "mardi",    heureDebut: "08:00", heureFin: "11:00", placesTotal: 2, placesUtilisees: 0, couleur: "#8e44ad" },
                { nom: "P\u00e2tisserie",  site: "CBM", jour: "mercredi", heureDebut: "08:00", heureFin: "11:00", placesTotal: 4, placesUtilisees: 0, couleur: "#f1c40f" },
                { nom: "Audiovisuel",  site: "CBM", jour: "mercredi", heureDebut: "11:00", heureFin: "14:00", placesTotal: 2, placesUtilisees: 0, couleur: "#27ae60" },
                { nom: "Nettoyage",    site: "CBM", jour: "jeudi",    heureDebut: "08:00", heureFin: "11:00", placesTotal: 2, placesUtilisees: 0, couleur: "#e74c3c" },
                { nom: "Nettoyage",    site: "CBP", jour: "lundi",    heureDebut: "14:00", heureFin: "17:00", placesTotal: 3, placesUtilisees: 0, couleur: "#e74c3c" },
                { nom: "Technique",    site: "CBL", jour: "vendredi", heureDebut: "08:00", heureFin: "11:00", placesTotal: 3, placesUtilisees: 0, couleur: "#2c3e50" },
                { nom: "Restauration", site: "CBP", jour: "vendredi", heureDebut: "11:00", heureFin: "14:00", placesTotal: 3, placesUtilisees: 0, couleur: "#e91e8b" },
                { nom: "Graphisme",    site: "CBP", jour: "jeudi",    heureDebut: "14:00", heureFin: "17:00", placesTotal: 2, placesUtilisees: 0, couleur: "#f39c12" },
                { nom: "Ateliers",     site: "CBP", jour: "lundi",    heureDebut: "14:00", heureFin: "17:00", placesTotal: 2, placesUtilisees: 0, couleur: "#00bcd4" }
              ]
            }
          },
          description: "Construit le planning.json final (format plat, transform\u00e9 par le frontend)"
        },

        // =============================================
        // 6. Récupérer le SHA actuel du fichier GitHub
        // =============================================
        "GET_SHA_GitHub": {
          runAfter: { "Compose_JSON": ["Succeeded"] },
          type: "Http",
          inputs: {
            uri: GITHUB_API,
            method: "GET",
            headers: {
              Authorization: githubToken,
              "User-Agent": "PowerAutomate"
            }
          },
          description: "R\u00e9cup\u00e8re le SHA du fichier actuel (n\u00e9cessaire pour update GitHub API)"
        },

        // =============================================
        // 7. Push planning.json vers GitHub
        // =============================================
        "Push_GitHub": {
          runAfter: { "GET_SHA_GitHub": ["Succeeded"] },
          type: "Http",
          inputs: {
            uri: GITHUB_API,
            method: "PUT",
            headers: {
              Authorization: githubToken,
              "Content-Type": "application/json",
              "User-Agent": "PowerAutomate"
            },
            body: {
              message: "MAJ planning.json depuis Power Automate",
              content: "@{base64(string(outputs('Compose_JSON')))}",
              sha: "@body('GET_SHA_GitHub')?['sha']"
            }
          },
          runtimeConfiguration: { contentTransfer: { transferMode: "Chunked" } },
          description: "Met \u00e0 jour planning.json sur GitHub (d\u00e9clenche auto-deploy GitHub Pages)"
        }
      },
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
fs.writeFileSync(defPath, JSON.stringify(definition));
console.log('definition.json saved!');

// =============================================
// METTRE À JOUR manifest.json (racine)
// =============================================
const manifestPath = '/home/miles/projets/clair-bois/backend/flux3-work/manifest.json';
const manifest = {
  schema: "1.0",
  details: {
    displayName: "Flux 3 - G\u00e9n\u00e9ration planning.json",
    description: "G\u00e9n\u00e8re planning.json depuis SP Creneaux + Demandes et push sur GitHub",
    createdTime: new Date().toISOString(),
    packageTelemetryId: "flux3-planning-json",
    creator: "N/A",
    sourceEnvironment: ""
  },
  resources: {
    "e03bb264-eb3c-4ebd-bd63-87a78c083b68": {
      type: "Microsoft.Flow/flows",
      suggestedCreationType: "Update",
      creationType: "Existing, New, Update",
      details: { displayName: "Flux 3 - G\u00e9n\u00e9ration planning.json" },
      configurableBy: "User",
      hierarchy: "Root",
      dependsOn: [
        "2e6b970c-dc5b-4920-8b1a-981b957283d0",
        "c1e11ff6-1671-4f41-a2e2-6986289998fd"
      ]
    },
    "2e6b970c-dc5b-4920-8b1a-981b957283d0": {
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
    "c1e11ff6-1671-4f41-a2e2-6986289998fd": {
      type: "Microsoft.PowerApps/apis/connections",
      suggestedCreationType: "Existing",
      creationType: "Existing",
      details: {
        displayName: "stagiaire.dfip@clairbois.ch",
        iconUri: "https://conn-afd-prod-endpoint-bmc9bqahasf3grgk.b01.azurefd.net/releases/v1.0.1769/1.0.1769.4361/sharepointonline/icon.png"
      },
      configurableBy: "User",
      hierarchy: "Child",
      dependsOn: ["2e6b970c-dc5b-4920-8b1a-981b957283d0"]
    }
  }
};
fs.writeFileSync(manifestPath, JSON.stringify(manifest));
console.log('manifest.json saved!');

// =============================================
// METTRE À JOUR flows/manifest.json
// =============================================
const flowsManifest = '/home/miles/projets/clair-bois/backend/flux3-work/Microsoft.Flow/flows/manifest.json';
fs.writeFileSync(flowsManifest, JSON.stringify({
  packageSchemaVersion: "1.0",
  flowAssets: { assetPaths: ["e03bb264-eb3c-4ebd-bd63-87a78c083b68"] }
}));
console.log('flows/manifest.json saved!');

// =============================================
// REPACKAGER LE ZIP
// =============================================
console.log('\nRepackaging zip...');
const zip = new AdmZip();
const base = '/home/miles/projets/clair-bois/backend/flux3-work';
const flowGuid = 'e03bb264-eb3c-4ebd-bd63-87a78c083b68';
const flowPath = `Microsoft.Flow/flows/${flowGuid}`;

zip.addLocalFile(`${base}/${flowPath}/apisMap.json`, flowPath);
zip.addLocalFile(`${base}/${flowPath}/connectionsMap.json`, flowPath);
zip.addLocalFile(`${base}/${flowPath}/definition.json`, flowPath);
zip.addLocalFile(`${base}/Microsoft.Flow/flows/manifest.json`, 'Microsoft.Flow/flows');
zip.addLocalFile(`${base}/manifest.json`, '');
zip.writeZip('/home/miles/projets/clair-bois/backend/flux3-planning-modifie.zip');

// Vérification
const check = new AdmZip('/home/miles/projets/clair-bois/backend/flux3-planning-modifie.zip');
console.log('\nZIP contents:');
check.getEntries().forEach(e => console.log('  ' + e.entryName, e.header.size));

console.log('\n=== FLUX 3 SUMMARY ===');
console.log('Name: Flux 3 - G\u00e9n\u00e9ration planning.json');
console.log('Trigger: Manual button');
console.log('Actions:');
console.log('  1. GET_Creneaux (SP HTTP)');
console.log('  2. GET_Demandes (SP HTTP)');
console.log('  3. Init_varCreneaux (array)');
console.log('  4. Appliquer_\u00e0_chaque_cr\u00e9neau (loop)');
console.log('     \u2192 Filtrer_Demandes (count per cr\u00e9neau)');
console.log('     \u2192 Ajouter_au_tableau (build flat entry)');
console.log('  5. Compose_JSON (final planning.json)');
console.log('  6. GET_SHA_GitHub (get current file SHA)');
console.log('  7. Push_GitHub (PUT to GitHub API)');
console.log('\nOutput format: FLAT (frontend will transform to hierarchical)');
console.log('File: public/planning.json on GitHub');
