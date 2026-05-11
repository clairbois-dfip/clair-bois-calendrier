/**
 * build-flux-carto.js — Génère le ZIP Power Automate du Flux 6 (Flux Carto)
 *
 * Logique :
 *  1. GET SP "Cartographie"   → capacités max par table (Plan × Etab × Secteur)
 *  2. GET SP "Demande"        → filtre Statut='Confirmé' + Prenom stagiaire (expand)
 *  3. Pour chaque table : filtrer les Demandes correspondantes → construire l'objet table
 *  4. Composer carto.json    → { generatedAt, tables: [...] }
 *  5. GET SHA GitHub + Push  → met à jour public/carto.json sur GitHub
 *
 * Format carto.json émis (tables plates, React groupe par plan) :
 *  {
 *    generatedAt: "2026-05-11T...",
 *    tables: [
 *      {
 *        plan:          "Restauration",
 *        etablissement: "Minoteries",
 *        secteur:       "Restaurant",
 *        commentaire:   "",
 *        placesMax:     { FPRA:2, AFP_CFC:1, "Stage/Mes.":3, CEA:1, "App.non-DFIP":0, "MSP/MSTS":0 },
 *        reservations:  [{ type:"FPRA", prenom:"Marie", dateDebut:"2026-04-20", dateFin:"2026-04-24" }]
 *      }, ...
 *    ]
 *  }
 *
 * Usage : node build-flux-carto.js
 * Sortie : backend/flux-carto.zip  (à importer dans Power Automate)
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// ──────────────────────────────────────────────
// Constantes
// ──────────────────────────────────────────────

const BACKEND_DIR  = __dirname;
const OUTPUT_ZIP   = path.join(BACKEND_DIR, 'flux-carto.zip');
const FLUX3_ZIP    = path.join(BACKEND_DIR, 'flux3-planning-modifie.zip');
const WORK_SRC     = path.join(BACKEND_DIR, 'flux3b-work'); // fournit apisMap + connectionsMap

const FLOW_GUID    = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'; // UUID fixe Flux 6
const SP_SITE      = 'https://fondationclairbois.sharepoint.com/sites/DFIP-SiteEquipe';
const DEMANDE_GUID = '9616ee1d-dd0b-44fd-a1c4-34187ebaa9f8';

const GITHUB_REPO  = 'clairbois-dfip/clair-bois-calendrier';
const GITHUB_FILE  = 'public/carto.json';
const GITHUB_API   = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`;

// ──────────────────────────────────────────────
// Extraire le token GitHub depuis Flux 3 existant
// ──────────────────────────────────────────────

const flux3Zip = new AdmZip(FLUX3_ZIP);
let githubToken;
flux3Zip.getEntries().forEach(entry => {
  if (entry.entryName.endsWith('definition.json') && entry.entryName.includes('flows/')) {
    const def = JSON.parse(entry.getData().toString('utf8'));
    githubToken = def.properties.definition.actions.GET_SHA_GitHub.inputs.headers.Authorization;
  }
});
if (!githubToken) throw new Error('Token GitHub introuvable dans flux3-planning-modifie.zip');
console.log('Token GitHub extrait depuis Flux 3 ✓');

// ──────────────────────────────────────────────
// Lire apisMap + connectionsMap depuis flux3b-work
// (même environnement SP, réutilisables)
// ──────────────────────────────────────────────

const flowSrcDir  = path.join(WORK_SRC, 'Microsoft.Flow', 'flows', 'a3b7c91d-4e5f-6a7b-8c9d-0e1f2a3b4c5d');
const apisMap     = fs.readFileSync(path.join(flowSrcDir, 'apisMap.json'), 'utf8');
const connMap     = fs.readFileSync(path.join(flowSrcDir, 'connectionsMap.json'), 'utf8');
console.log('apisMap + connectionsMap lus depuis flux3b-work ✓');

// ──────────────────────────────────────────────
// DEFINITION.JSON — Flux Carto
// ──────────────────────────────────────────────

const definition = {
  name: `/${FLOW_GUID}`,
  id: `/${FLOW_GUID}`,
  type: 'Microsoft.Flow/flows',
  properties: {
    displayName: 'Flux 6 - Génération carto.json',
    definition: {
      $schema: 'https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#',
      contentVersion: '1.0.0.0',
      parameters: {
        $authentication: { defaultValue: {}, type: 'SecureObject' },
        $connections:    { defaultValue: {}, type: 'Object' }
      },

      // ── Déclencheur : récurrent toutes les heures ──────────────────────
      triggers: {
        Recurrence: {
          type: 'Recurrence',
          recurrence: { frequency: 'Hour', interval: 1 }
        }
      },

      actions: {

        // 1. GET SP "Cartographie" — capacités max (toutes les tables)
        GET_Cartographie: {
          runAfter: {},
          type: 'OpenApiConnection',
          inputs: {
            parameters: {
              dataset: SP_SITE,
              'parameters/method': 'GET',
              'parameters/uri': [
                "_api/web/lists/GetByTitle('Cartographie')/items",
                '?$select=Id,Title,Plan,Etablissement,Secteur,PlacesMax_FPRA,',
                'PlacesMax_AFP_CFC,PlacesMax_Stage_Mes,PlacesMax_CEA,',
                'PlacesMax_AppNonDFIP,PlacesMax_MSTS,Commentaire',
                '&$top=500'
              ].join('')
            },
            host: {
              apiId: '/providers/Microsoft.PowerApps/apis/shared_sharepointonline',
              connectionName: 'shared_sharepointonline',
              operationId: 'HttpRequest'
            },
            authentication: "@parameters('$authentication')"
          },
          description: 'Récupère toutes les tables de la SP List Cartographie'
        },

        // 2. GET SP "Demande" — uniquement les Confirmées + Prenom stagiaire
        GET_Demandes_Confirmees: {
          runAfter: { GET_Cartographie: ['Succeeded'] },
          type: 'OpenApiConnection',
          inputs: {
            parameters: {
              dataset: SP_SITE,
              'parameters/method': 'GET',
              'parameters/uri': [
                `_api/web/lists(guid'${DEMANDE_GUID}')/items`,
                '?$select=Id,Statut,PlanMetier,EtablissementConfirme,SecteurConfirme,',
                'TypePlace,DateDebutConfirmee,DateFinConfirmee,StagiaireID/Prenom',
                '&$expand=StagiaireID',
                "&$filter=Statut eq 'Confirmé'",
                '&$top=5000'
              ].join('')
            },
            host: {
              apiId: '/providers/Microsoft.PowerApps/apis/shared_sharepointonline',
              connectionName: 'shared_sharepointonline',
              operationId: 'HttpRequest'
            },
            authentication: "@parameters('$authentication')"
          },
          description: "Récupère les Demandes Confirmées avec Prénom stagiaire"
        },

        // 3. Initialiser le tableau des tables
        Init_varTables: {
          runAfter: { GET_Demandes_Confirmees: ['Succeeded'] },
          type: 'InitializeVariable',
          inputs: {
            variables: [{ name: 'varTables', type: 'array', value: [] }]
          }
        },

        // 4. Boucle sur chaque ligne de SP Cartographie
        "Loop_Cartographie": {
          runAfter: { Init_varTables: ['Succeeded'] },
          type: 'Foreach',
          foreach: "@body('GET_Cartographie')?['d']?['results']",
          description: 'Pour chaque table : filtre les réservations et construit l’objet table',

          actions: {

            // 4a. Filtrer les Demandes Confirmées pour cette table précise
            Filtrer_Demandes_Table: {
              type: 'Query',
              inputs: {
                from: "@body('GET_Demandes_Confirmees')?['d']?['results']",
                where: [
                  "@and(",
                  "equals(item()?['PlanMetier'], items('Loop_Cartographie')?['Plan']),",
                  "equals(item()?['EtablissementConfirme'], items('Loop_Cartographie')?['Etablissement']),",
                  "equals(item()?['SecteurConfirme'], items('Loop_Cartographie')?['Secteur'])",
                  ")"
                ].join('')
              },
              description: 'Filtre les Demandes pour (Plan + Etablissement + Secteur)'
            },

            // 4b. Projeter uniquement les champs utiles de chaque réservation
            Select_Reservations: {
              runAfter: { Filtrer_Demandes_Table: ['Succeeded'] },
              type: 'Select',
              inputs: {
                from: "@body('Filtrer_Demandes_Table')",
                select: {
                  type:      "@item()?['TypePlace']",
                  prenom:    "@item()?['StagiaireID']?['Prenom']",
                  dateDebut: "@if(empty(item()?['DateDebutConfirmee']), null, formatDateTime(item()?['DateDebutConfirmee'], 'yyyy-MM-dd'))",
                  dateFin:   "@if(empty(item()?['DateFinConfirmee']),   null, formatDateTime(item()?['DateFinConfirmee'],   'yyyy-MM-dd'))"
                }
              },
              description: 'Projette type, prénom, dateDébut, dateFin'
            },

            // 4c. Ajouter la table au tableau global
            Ajouter_Table: {
              runAfter: { Select_Reservations: ['Succeeded'] },
              type: 'AppendToArrayVariable',
              inputs: {
                name: 'varTables',
                value: {
                  plan:          "@items('Loop_Cartographie')?['Plan']",
                  etablissement: "@items('Loop_Cartographie')?['Etablissement']",
                  secteur:       "@items('Loop_Cartographie')?['Secteur']",
                  commentaire:   "@if(empty(items('Loop_Cartographie')?['Commentaire']), '', items('Loop_Cartographie')?['Commentaire'])",
                  placesMax: {
                    "FPRA":         "@items('Loop_Cartographie')?['PlacesMax_FPRA']",
                    "AFP_CFC":      "@items('Loop_Cartographie')?['PlacesMax_AFP_CFC']",
                    "Stage/Mes.":   "@items('Loop_Cartographie')?['PlacesMax_Stage_Mes']",
                    "CEA":          "@items('Loop_Cartographie')?['PlacesMax_CEA']",
                    "App.non-DFIP": "@items('Loop_Cartographie')?['PlacesMax_AppNonDFIP']",
                    "MSP/MSTS":     "@items('Loop_Cartographie')?['PlacesMax_MSTS']"
                  },
                  reservations: "@body('Select_Reservations')"
                }
              },
              description: 'Append {plan, etablissement, secteur, commentaire, placesMax, reservations}'
            }
          }
        },

        // 5. Composer le carto.json final
        Compose_JSON: {
          runAfter: { Loop_Cartographie: ['Succeeded'] },
          type: 'Compose',
          inputs: {
            generatedAt: "@utcNow()",
            tables:      "@variables('varTables')"
          },
          description: 'Construit le carto.json final (tables plates, React groupe par plan)'
        },

        // 6. GET SHA actuel de carto.json sur GitHub
        GET_SHA_GitHub: {
          runAfter: { Compose_JSON: ['Succeeded'] },
          type: 'Http',
          inputs: {
            uri:    GITHUB_API,
            method: 'GET',
            headers: {
              Authorization: githubToken,
              'User-Agent': 'PowerAutomate'
            }
          },
          description: 'Récupère le SHA du carto.json actuel sur GitHub'
        },

        // 7. Push carto.json vers GitHub
        Push_GitHub: {
          runAfter: { GET_SHA_GitHub: ['Succeeded'] },
          type: 'Http',
          inputs: {
            uri:    GITHUB_API,
            method: 'PUT',
            headers: {
              Authorization: githubToken,
              'Content-Type': 'application/json',
              'User-Agent': 'PowerAutomate'
            },
            body: {
              message: 'MAJ carto.json depuis Power Automate (Flux 6)',
              content: "@{base64(string(outputs('Compose_JSON')))}",
              sha:     "@body('GET_SHA_GitHub')?['sha']"
            }
          },
          runtimeConfiguration: { contentTransfer: { transferMode: 'Chunked' } },
          description: 'Met à jour public/carto.json sur GitHub'
        }
      },
      outputs: {}
    },
    connectionReferences: {
      shared_sharepointonline: {
        connectionName: 'shared-sharepointonl-9d5444a2-e35b-4b0c-a114-8022d6b1ace5',
        source: 'Embedded',
        id: '/providers/Microsoft.PowerApps/apis/shared_sharepointonline',
        tier: 'NotSpecified',
        apiName: 'sharepointonline',
        isProcessSimpleApiReferenceConversionAlreadyDone: false
      }
    },
    flowFailureAlertSubscribed: false,
    isManaged: false
  }
};

// ──────────────────────────────────────────────
// MANIFEST RACINE
// ──────────────────────────────────────────────

const manifest = {
  schema: '1.0',
  details: {
    displayName: 'Flux 6 - Génération carto.json',
    description: 'Génère carto.json depuis SP Cartographie + SP Demande (Confirmé) et push sur GitHub',
    createdTime: new Date().toISOString(),
    packageTelemetryId: 'flux6-carto-json',
    creator: 'N/A',
    sourceEnvironment: ''
  },
  resources: {
    [FLOW_GUID]: {
      type: 'Microsoft.Flow/flows',
      suggestedCreationType: 'New',
      creationType: 'New',
      details: { displayName: 'Flux 6 - Génération carto.json' },
      configurableBy: 'User',
      hierarchy: 'Root',
      dependsOn: [
        '2e6b970c-dc5b-4920-8b1a-981b957283d0',
        'c1e11ff6-1671-4f41-a2e2-6986289998fd'
      ]
    },
    '2e6b970c-dc5b-4920-8b1a-981b957283d0': {
      id: '/providers/Microsoft.PowerApps/apis/shared_sharepointonline',
      name: 'shared_sharepointonline',
      type: 'Microsoft.PowerApps/apis',
      suggestedCreationType: 'Existing',
      details: {
        displayName: 'SharePoint',
        iconUri: 'https://conn-afd-prod-endpoint-bmc9bqahasf3grgk.b01.azurefd.net/releases/v1.0.1769/1.0.1769.4361/sharepointonline/icon.png'
      },
      configurableBy: 'System',
      hierarchy: 'Child',
      dependsOn: []
    },
    'c1e11ff6-1671-4f41-a2e2-6986289998fd': {
      type: 'Microsoft.PowerApps/apis/connections',
      suggestedCreationType: 'Existing',
      creationType: 'Existing',
      details: {
        displayName: 'stagiaire.dfip@clairbois.ch',
        iconUri: 'https://conn-afd-prod-endpoint-bmc9bqahasf3grgk.b01.azurefd.net/releases/v1.0.1769/1.0.1769.4361/sharepointonline/icon.png'
      },
      configurableBy: 'User',
      hierarchy: 'Child',
      dependsOn: ['2e6b970c-dc5b-4920-8b1a-981b957283d0']
    }
  }
};

const flowsManifest = {
  packageSchemaVersion: '1.0',
  flowAssets: { assetPaths: [FLOW_GUID] }
};

// ──────────────────────────────────────────────
// PACKAGER LE ZIP
// ──────────────────────────────────────────────

const flowPath = `Microsoft.Flow/flows/${FLOW_GUID}`;
const zip = new AdmZip();

zip.addFile(`${flowPath}/definition.json`,          Buffer.from(JSON.stringify(definition, null, 2)));
zip.addFile(`${flowPath}/apisMap.json`,             Buffer.from(apisMap));
zip.addFile(`${flowPath}/connectionsMap.json`,      Buffer.from(connMap));
zip.addFile('Microsoft.Flow/flows/manifest.json',  Buffer.from(JSON.stringify(flowsManifest, null, 2)));
zip.addFile('manifest.json',                        Buffer.from(JSON.stringify(manifest, null, 2)));

zip.writeZip(OUTPUT_ZIP);
console.log(`\nZIP généré : ${OUTPUT_ZIP}`);

// Vérification
const check = new AdmZip(OUTPUT_ZIP);
console.log('\nContenu du ZIP :');
check.getEntries().forEach(e => console.log(`  ${e.entryName}  (${e.header.size} bytes)`));

console.log('\n=== FLUX 6 — FLUX CARTO ===');
console.log('Déclencheur : Récurrent toutes les 1 heure');
console.log('Actions :');
console.log('  1. GET_Cartographie         → SP "Cartographie" (GetByTitle)');
console.log('  2. GET_Demandes_Confirmees  → SP "Demande" Statut=Confirmé + Prenom');
console.log('  3. Init_varTables           → tableau vide');
console.log('  4. Loop_Cartographie        → pour chaque table :');
console.log('       Filtrer_Demandes_Table   (Plan + Etab + Secteur)');
console.log('       Select_Reservations      (type, prenom, dateDebut, dateFin)');
console.log('       Ajouter_Table            (placesMax + reservations)');
console.log('  5. Compose_JSON             → { generatedAt, tables }');
console.log('  6. GET_SHA_GitHub           → SHA carto.json actuel');
console.log('  7. Push_GitHub              → PUT public/carto.json');
console.log('\nFormat carto.json : tables plates, React groupe par plan et expande les places.');