/**
 * build-flux-word-ai.js — Flux "Canal 2 : Réception OCAS Word → AI Builder → SharePoint"
 * v4 — paramètres réels extraits de ExempleFlux_20260504160406.zip
 *
 * Connecteurs confirmés :
 *   - SP HTTP v2 : _api/v2.0/drives/{driveId}/root:/{path}:/content?format=pdf  (non-premium)
 *   - AI Builder : shared_commondataserviceforapps / aibuilderpredict_formsprocessing
 *
 * Pipeline :
 *   1. Trigger SP OnNewFile → "Stagiaires Doc/Réception AI"
 *   2. SP HTTP GET v2 → convertit .docx en PDF (non-premium)
 *   3. AI Builder Dataverse → extrait 13 champs OCAS
 *   4. SP check AVS → create ou update Stagiaire
 *   5. SP create Demande
 *   6. Office 365 → email Rosina
 */

const fs       = require('fs')
const archiver = require('archiver')
const path     = require('path')

// ── IDs techniques ──────────────────────────────────────────────────────────
const SP_SITE        = 'https://fondationclairbois.sharepoint.com/sites/DFIP-SiteEquipe'
const SP_SITE_BASE   = 'https://fondationclairbois.sharepoint.com'
const LIST_STAGIAIRE = 'bf357221-7e74-4905-9b58-b4ea22f79de0'
const LIST_DEMANDE   = '9616ee1d-dd0b-44fd-a1c4-34187ebaa9f8'
const TENANT_ID      = 'b38370c4-d4e6-4db3-8103-301e95e4e40c'
const CREATOR_ID     = '3995bcc7-5e9e-4254-8370-a930628a2317'
const MODEL_ID       = '36f088e4-134b-4f56-b0c6-c301abd962b6'  // OCAS-V4 publié

// DriveId "Stagiaires Doc" (vérifié via _api/v2.0/drives le 04.05.2026)
const DRIVE_ID = 'b!OmXUJimCl0KgeQhj_qNKC5a8dvXNzeVEk678U606MwfuG53yJ0TBSK9d2167_0xd'

// Connexions SP + Office 365 (existantes, partagées avec Flux 5)
const API_SP    = '2e6b970c-dc5b-4920-8b1a-981b957283d0'
const API_O365  = 'c70bccb1-c5b8-4d65-afa0-ce6031f446c5'
const CONN_SP   = 'c1e11ff6-1671-4f41-a2e2-6986289998fd'
const CONN_O365 = '15b1713b-141c-4abf-b406-9781ffafdbdb'

// AI Builder — GUIDs réels extraits de ExempleFlux_20260504160406.zip
const API_AIB  = '113baf1d-17ca-4a3b-b258-397734f3437f'  // shared_commondataserviceforapps
const CONN_AIB = '63e66129-77f1-4e86-824d-6a8fb111d130'  // AI Builder DFIP

const FLOW_GUID = 'd9e0f1a2-b3c4-5678-defa-012345678901'
const FLOW_ID   = 'e9f0a1b2-c3d4-5678-efab-012345678901'

const SP_LIBRARY     = 'Stagiaires Doc'
const SP_FOLDER_PATH = '/Réception AI'

// ── Helpers ─────────────────────────────────────────────────────────────────
const sp   = (op) => ({ apiId: '/providers/Microsoft.PowerApps/apis/shared_sharepointonline',       connectionName: 'shared_sharepointonline',       operationId: op })
const o365 = (op) => ({ apiId: '/providers/Microsoft.PowerApps/apis/shared_office365',              connectionName: 'shared_office365',              operationId: op })
const cds  = (op) => ({ apiId: '/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps', connectionName: 'shared_commondataserviceforapps', operationId: op })
const auth = "@parameters('$authentication')"

// Accès aux champs extraits par AI Builder
function f(field) {
  return `@{coalesce(body('Traiter_les_documents')?['responsev2']?['value']?['fields']?['${field}']?['value'], '')}`
}

function dateNaissanceISO() {
  const d = `body('Traiter_les_documents')?['responsev2']?['value']?['fields']?['Date_naissance']?['value']`
  return `@{if(greater(length(coalesce(${d}, '')), 9), concat(substring(${d}, 6, 4), '-', substring(${d}, 3, 2), '-', substring(${d}, 0, 2)), null)}`
}

function npaLocalite() {
  return `@{concat(coalesce(body('Traiter_les_documents')?['responsev2']?['value']?['fields']?['NPA']?['value'], ''), ' ', coalesce(body('Traiter_les_documents')?['responsev2']?['value']?['fields']?['Localite']?['value'], ''))}`
}

function sexeSP() {
  return `@{if(equals(coalesce(body('Traiter_les_documents')?['responsev2']?['value']?['fields']?['Genre']?['value'], ''), 'M.'), 'Masculin', 'Féminin')}`
}

function champsStag() {
  return {
    'item/Nom':              f('Nom'),
    'item/Prenom':           f('Prenom'),
    'item/Mail':             f('E_mail'),
    'item/NumTel':           f('Telephone'),
    'item/Adresse':          f('Adresse'),
    'item/NpaLocalite':      npaLocalite(),
    'item/Sexe/Value':       sexeSP(),
    'item/DateNaissance':    dateNaissanceISO(),
    'item/AIConseillerNom':  f('Nom_conseiller'),
    'item/AIConseillerTel':  f('Tel_conseiller'),
    'item/AIConseillerMail': f('E_mail_conseiller'),
  }
}

function emailRosina() {
  return [
    '<p>Bonjour,<br><br>',
    'Un nouveau <b>formulaire OCAS Word</b> a été traité automatiquement par AI Builder.<br><br>',
    `<b>Fichier :</b> @{triggerOutputs()?['body/Name']}<br><br>`,
    '<b>Données extraites :</b><br>',
    `• AVS : ${f('AVS')}<br>`,
    `• Nom : ${f('Nom')} ${f('Prenom')}<br>`,
    `• Naissance : ${f('Date_naissance')}<br>`,
    `• Email : ${f('E_mail')}<br>`,
    `• Téléphone : ${f('Telephone')}<br>`,
    `• Adresse : ${f('Adresse')}, ${f('NPA')} ${f('Localite')}<br>`,
    `• Conseiller AI : ${f('Nom_conseiller')} — ${f('Tel_conseiller')} — ${f('E_mail_conseiller')}<br><br>`,
    `<a href="@{concat('${SP_SITE_BASE}/sites/DFIP-SiteEquipe/Lists/Stagiaire/EditForm.aspx?ID=', variables('varStagiaireID'))}">Ouvrir fiche Stagiaire</a><br>`,
    `<a href="@{concat('${SP_SITE_BASE}/sites/DFIP-SiteEquipe/Lists/Demande/EditForm.aspx?ID=', body('Creer_Demande_OCAS')?['ID'])}">Ouvrir Demande</a><br><br>`,
    'Clair-Bois — Système automatique Canal 2 OCAS</p>',
  ].join('')
}

// ── Définition du flux ───────────────────────────────────────────────────────
const definition = {
  name: FLOW_ID,
  id: `/providers/Microsoft.Flow/flows/${FLOW_ID}`,
  type: 'Microsoft.Flow/flows',
  properties: {
    apiId: '/providers/Microsoft.PowerApps/apis/shared_logicflows',
    displayName: 'Flux Word AI - Canal 2 OCAS v4',
    definition: {
      metadata: {
        creator: { id: CREATOR_ID, type: 'User', tenantId: TENANT_ID },
        provisioningMethod: 'FromDefinition',
        failureAlertSubscription: true,
        clientLastModifiedTime: new Date().toISOString(),
        creationSource: 'Portal',
        modifiedSources: 'Portal',
      },
      $schema: 'https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#',
      contentVersion: '1.0.0.0',
      parameters: {
        $authentication: { defaultValue: {}, type: 'SecureObject' },
        $connections:    { defaultValue: {}, type: 'Object' },
      },

      triggers: {
        Quand_un_fichier_est_cree: {
          type: 'OpenApiConnection',
          recurrence: { frequency: 'Minute', interval: 3 },
          splitOn: "@triggerBody()?['value']",
          inputs: {
            parameters: {
              dataset:  SP_SITE,
              folderId: `${SP_LIBRARY}${SP_FOLDER_PATH}`,
            },
            host:           sp('OnNewFile'),
            authentication: auth,
          },
        },
      },

      actions: {

        // ── 1. Conversion .docx → PDF via SP REST v2 (non-premium) ───────────
        // Equivalent à GET /drives/{id}/root:/path/file.docx:/content?format=pdf
        // Retourne le contenu binaire (base64) du PDF — même résultat que Word Online GetFilePDF
        Convertir_en_PDF: {
          runAfter: {},
          type: 'OpenApiConnection',
          inputs: {
            parameters: {
              dataset:            SP_SITE,
              'parameters/method': 'GET',
              'parameters/uri':    `@{concat('_api/v2.0/drives/${DRIVE_ID}/root:/R%C3%A9ception%20AI/', encodeUriComponent(triggerOutputs()?['body/Name']), ':/content?format=pdf')}`,
            },
            host:           sp('HttpRequest'),
            authentication: auth,
          },
          description: 'Conversion Word→PDF via SP REST API v2 — non-premium, équivalent Word Online GetFilePDF',
        },

        // ── 2. AI Builder — extraction des 13 champs OCAS-V4 ────────────────
        // Connecteur réel : shared_commondataserviceforapps (vérifié ExempleFlux 04.05.2026)
        // Opération réelle : aibuilderpredict_formsprocessing
        Traiter_les_documents: {
          runAfter: { Convertir_en_PDF: ['Succeeded'] },
          type: 'OpenApiConnection',
          inputs: {
            parameters: {
              recordId:                   MODEL_ID,
              'item/requestv2/mimeType':  'application/pdf',
              'item/requestv2/base64Encoded': "@body('Convertir_en_PDF')",
              'item/source': `{ "consumptionSource": "PowerAutomate", "partnerSource": "AIBuilder", "consumptionSourceVersion": "Flow", "partnerSourceVersion": "${FLOW_ID}" }`,
            },
            host:           cds('aibuilderpredict_formsprocessing'),
            authentication: auth,
          },
          description: 'Extraction AVS, Nom, Prenom, Date_naissance, Adresse, NPA, Localite, Telephone, Genre, E_mail, Nom_conseiller, Tel_conseiller, E_mail_conseiller',
        },

        // ── 3. Variable StagiaireID ─────────────────────────────────────────
        Init_varStagiaireID: {
          runAfter: { Traiter_les_documents: ['Succeeded'] },
          type: 'InitializeVariable',
          inputs: {
            variables: [{ name: 'varStagiaireID', type: 'integer', value: 0 }],
          },
        },

        // ── 4. Check doublon AVS ─────────────────────────────────────────────
        Verifier_AVS_SP: {
          runAfter: { Init_varStagiaireID: ['Succeeded'] },
          type: 'OpenApiConnection',
          inputs: {
            parameters: {
              dataset:             SP_SITE,
              'parameters/method': 'GET',
              'parameters/uri':    `@{concat('_api/web/lists/getbytitle(''Stagiaire'')/items?$select=Id,AVS&$filter=AVS eq ''', body('Traiter_les_documents')?['responsev2']?['value']?['fields']?['AVS']?['value'], '''')}`,
            },
            host:           sp('HttpRequest'),
            authentication: auth,
          },
        },

        // ── 5. Create ou Update Stagiaire ────────────────────────────────────
        Condition_AVS_existe: {
          runAfter: { Verifier_AVS_SP: ['Succeeded'] },
          type: 'If',
          expression: {
            greater: [
              "@length(body('Verifier_AVS_SP')?['d']?['results'])",
              0,
            ],
          },
          actions: {
            Maj_Stagiaire: {
              runAfter: {},
              type: 'OpenApiConnection',
              inputs: {
                parameters: {
                  dataset: SP_SITE,
                  table:   LIST_STAGIAIRE,
                  id:      `@first(body('Verifier_AVS_SP')?['d']?['results'])?['Id']`,
                  ...champsStag(),
                },
                host:           sp('PatchItem'),
                authentication: auth,
              },
            },
            Set_StagiaireID_Existant: {
              runAfter: { Maj_Stagiaire: ['Succeeded'] },
              type: 'SetVariable',
              inputs: { name: 'varStagiaireID', value: `@first(body('Verifier_AVS_SP')?['d']?['results'])?['Id']` },
            },
          },
          else: {
            actions: {
              Creer_Stagiaire: {
                runAfter: {},
                type: 'OpenApiConnection',
                inputs: {
                  parameters: {
                    dataset:    SP_SITE,
                    table:      LIST_STAGIAIRE,
                    'item/AVS': f('AVS'),
                    ...champsStag(),
                  },
                  host:           sp('PostItem'),
                  authentication: auth,
                },
              },
              Set_StagiaireID_Nouveau: {
                runAfter: { Creer_Stagiaire: ['Succeeded'] },
                type: 'SetVariable',
                inputs: { name: 'varStagiaireID', value: `@body('Creer_Stagiaire')?['ID']` },
              },
            },
          },
        },

        // ── 6. Créer la Demande ──────────────────────────────────────────────
        Creer_Demande_OCAS: {
          runAfter: { Condition_AVS_existe: ['Succeeded'] },
          type: 'OpenApiConnection',
          inputs: {
            parameters: {
              dataset:                  SP_SITE,
              table:                    LIST_DEMANDE,
              'item/StagiaireID/Id':    `@variables('varStagiaireID')`,
              'item/TypeDemande/Value': 'Stage',
              'item/ReferentContact':   `@{concat(coalesce(body('Traiter_les_documents')?['responsev2']?['value']?['fields']?['Nom_conseiller']?['value'], 'Conseiller OCAS'), ' — AI OCAS')}`,
              'item/Secteur':           'À définir',
              'item/Statut/Value':      'En attente des documents',
              'item/ObjectifStage':     `@{concat('Canal 2 OCAS — ', triggerOutputs()?['body/Name'])}`,
            },
            host:           sp('PostItem'),
            authentication: auth,
          },
        },

        // ── 7. Email Rosina ──────────────────────────────────────────────────
        Email_Rosina: {
          runAfter: { Creer_Demande_OCAS: ['Succeeded'] },
          type: 'OpenApiConnection',
          inputs: {
            parameters: {
              'emailMessage/To':         'stagiaire.dfip@clairbois.ch',
              'emailMessage/Subject':    `@{concat('[OCAS] ', coalesce(body('Traiter_les_documents')?['responsev2']?['value']?['fields']?['Nom']?['value'], '?'), ' ', coalesce(body('Traiter_les_documents')?['responsev2']?['value']?['fields']?['Prenom']?['value'], '?'), ' — ', triggerOutputs()?['body/Name'])}`,
              'emailMessage/Body':       emailRosina(),
              'emailMessage/Importance': 'High',
            },
            host:           o365('SendEmailV2'),
            authentication: auth,
          },
        },

      },
      outputs: {},
    },

    connectionReferences: {
      shared_sharepointonline: {
        connectionName: 'shared-sharepointonl-9d5444a2-e35b-4b0c-a114-8022d6b1ace5',
        source: 'Embedded',
        id: '/providers/Microsoft.PowerApps/apis/shared_sharepointonline',
        tier: 'NotSpecified',
        apiName: 'sharepointonline',
      },
      shared_office365: {
        connectionName: 'shared-office365-8dbff9e2-9647-451f-91d1-c3bf46cb4559',
        source: 'Embedded',
        id: '/providers/Microsoft.PowerApps/apis/shared_office365',
        tier: 'NotSpecified',
        apiName: 'office365',
      },
      // AI Builder via Common Data Service (vérifié ExempleFlux 04.05.2026)
      shared_commondataserviceforapps: {
        connectionName: 'shared-commondataser-6dfd26e9-4593-4321-9556-4c7cd4c61c27',
        source: 'Embedded',
        id: '/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps',
        tier: 'NotSpecified',
        apiName: 'commondataserviceforapps',
      },
    },
    flowFailureAlertSubscribed: false,
    isManaged: false,
  },
}

// ── Manifest ─────────────────────────────────────────────────────────────────
const manifest = {
  schema: '1.0',
  details: {
    displayName: 'Flux Word AI - Canal 2 OCAS v4',
    description: 'Word OCAS → SP v2 PDF → AI Builder CDS → SP Stagiaire+Demande → Email Rosina',
    createdTime: new Date().toISOString(),
    packageTelemetryId: 'flux-word-ai-canal2-v4',
    creator: 'N/A',
    sourceEnvironment: '',
  },
  resources: {
    [FLOW_GUID]: {
      type: 'Microsoft.Flow/flows',
      suggestedCreationType: 'New',
      creationType: 'Existing, New, Update',
      details: { displayName: 'Flux Word AI - Canal 2 OCAS v4' },
      configurableBy: 'User',
      hierarchy: 'Root',
      dependsOn: [API_SP, CONN_SP, API_O365, CONN_O365, API_AIB, CONN_AIB],
    },
    [API_SP]: {
      id: '/providers/Microsoft.PowerApps/apis/shared_sharepointonline',
      name: 'shared_sharepointonline',
      type: 'Microsoft.PowerApps/apis',
      suggestedCreationType: 'Existing',
      details: { displayName: 'SharePoint' },
      configurableBy: 'System',
      hierarchy: 'Child',
      dependsOn: [],
    },
    [CONN_SP]: {
      type: 'Microsoft.PowerApps/apis/connections',
      suggestedCreationType: 'Existing',
      creationType: 'Existing',
      details: { displayName: 'stagiaire.dfip@clairbois.ch' },
      configurableBy: 'User',
      hierarchy: 'Child',
      dependsOn: [API_SP],
    },
    [API_O365]: {
      id: '/providers/Microsoft.PowerApps/apis/shared_office365',
      name: 'shared_office365',
      type: 'Microsoft.PowerApps/apis',
      suggestedCreationType: 'Existing',
      details: { displayName: 'Office 365 Outlook' },
      configurableBy: 'System',
      hierarchy: 'Child',
      dependsOn: [],
    },
    [CONN_O365]: {
      type: 'Microsoft.PowerApps/apis/connections',
      suggestedCreationType: 'Existing',
      creationType: 'Existing',
      details: { displayName: 'stagiaire.dfip@clairbois.ch' },
      configurableBy: 'User',
      hierarchy: 'Child',
      dependsOn: [API_O365],
    },
    [API_AIB]: {
      id: '/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps',
      name: 'shared_commondataserviceforapps',
      type: 'Microsoft.PowerApps/apis',
      suggestedCreationType: 'Existing',
      details: { displayName: 'AI Builder (Common Data Service)' },
      configurableBy: 'System',
      hierarchy: 'Child',
      dependsOn: [],
    },
    [CONN_AIB]: {
      type: 'Microsoft.PowerApps/apis/connections',
      suggestedCreationType: 'Existing',
      creationType: 'Existing',
      details: { displayName: 'AI Builder DFIP' },
      configurableBy: 'User',
      hierarchy: 'Child',
      dependsOn: [API_AIB],
    },
  },
}

const apisMap = {
  shared_sharepointonline:        API_SP,
  shared_office365:               API_O365,
  shared_commondataserviceforapps: API_AIB,
}

const connectionsMap = {
  shared_sharepointonline:        CONN_SP,
  shared_office365:               CONN_O365,
  shared_commondataserviceforapps: CONN_AIB,
}

const flowsManifest = {
  packageSchemaVersion: '1.0',
  flowAssets: { assetPaths: [FLOW_GUID] },
}

// ── Build ZIP ────────────────────────────────────────────────────────────────
const outputPath = path.join(__dirname, 'flux-word-ai.zip')
const output     = fs.createWriteStream(outputPath)
const archive    = archiver('zip', { zlib: { level: 9 } })

archive.pipe(output)
archive.append(JSON.stringify(manifest, null, 2),       { name: 'manifest.json' })
archive.append(JSON.stringify(flowsManifest, null, 2),  { name: 'Microsoft.Flow/flows/manifest.json' })
archive.append(JSON.stringify(apisMap, null, 2),        { name: `Microsoft.Flow/flows/${FLOW_GUID}/apisMap.json` })
archive.append(JSON.stringify(connectionsMap, null, 2), { name: `Microsoft.Flow/flows/${FLOW_GUID}/connectionsMap.json` })
archive.append(JSON.stringify(definition, null, 2),     { name: `Microsoft.Flow/flows/${FLOW_GUID}/definition.json` })
archive.finalize()
output.on('close', () => {
  console.log(`✅ flux-word-ai.zip généré (${archive.pointer()} bytes)`)
  console.log('\n📋 À l\'import :')
  console.log('   • SP + Office 365 + AI Builder DFIP → auto-reconnectés (GUIDs réels inclus)')
  console.log('   • Aucune connexion Word Online requise — conversion via SP API v2')
})
archive.on('error', (err) => { throw err })
