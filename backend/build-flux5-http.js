/**
 * build-flux5-http.js — Construit le Flux 5 : HTTP trigger pour formulaire React.
 *
 * Gère deux parcours :
 *   STAGES  → 1 Demande (TypeDemande=Stage) liée à 1 Créneau par secteur+date
 *   MODULES → N Demandes (TypeDemande=Module métier), 1 par module sélectionné,
 *             chacune liée à son propre Créneau (NomModule+date)
 *
 * Logique commune :
 *   1. Check AVS → MAJ ou Créer Stagiaire
 *   2. Condition parcours (stages / modules)
 *   3. Email demande de documents
 *   4. Réponse HTTP 200
 *
 * Usage : node build-flux5-http.js
 * Sortie : flux5-http-inscription.zip
 */

const fs = require('fs')
const archiver = require('archiver')
const path = require('path')

// ── IDs techniques ──
const SP_SITE = 'https://fondationclairbois.sharepoint.com/sites/DFIP-SiteEquipe'
const LIST_STAGIAIRE = 'bf357221-7e74-4905-9b58-b4ea22f79de0'
const LIST_DEMANDE   = '9616ee1d-dd0b-44fd-a1c4-34187ebaa9f8'
const LIST_REFERENT  = '7a31b912-99af-4415-bfc9-f2ae1cb19c00'
const LIST_CRENEAUX  = '3e2deb27-f496-410f-be74-281eb2b0c079'
const TENANT_ID  = 'b38370c4-d4e6-4db3-8103-301e95e4e40c'
const CREATOR_ID = '3995bcc7-5e9e-4254-8370-a930628a2317'

const API_SP   = '2e6b970c-dc5b-4920-8b1a-981b957283d0'
const API_O365 = 'c70bccb1-c5b8-4d65-afa0-ce6031f446c5'
const CONN_SP  = 'c1e11ff6-1671-4f41-a2e2-6986289998fd'
const CONN_O365 = '15b1713b-141c-4abf-b406-9781ffafdbdb'

const FLOW_GUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const FLOW_ID   = 'f5a1b2c3-d4e5-f678-90ab-cdef12345678'

// ── Helpers expressions PA ──
const t    = (f) => `@triggerBody()?['${f}']`
const sp   = (op) => ({ apiId: '/providers/Microsoft.PowerApps/apis/shared_sharepointonline', connectionName: 'shared_sharepointonline', operationId: op })
const o365 = (op) => ({ apiId: '/providers/Microsoft.PowerApps/apis/shared_office365', connectionName: 'shared_office365', operationId: op })
const auth = "@parameters('$authentication')"

// ── Champs Stagiaire ──
function stagiaireFields() {
  return {
    'item/Nom': t('nom'),
    'item/Prenom': t('prenom'),
    'item/Sexe/Value': t('sexe'),
    'item/DateNaissance': t('date_naissance'),
    'item/NumTel': t('tel'),
    'item/Mail': t('email'),
    'item/Adresse': t('adresse'),
    'item/NpaLocalite': t('npa'),
    'item/AVS': t('avs'),
    'item/UrgenceLien/Value': t('urgence_lien'),
    'item/UrgenceNom': t('urgence_nom'),
    'item/UrgencePrenom': t('urgence_prenom'),
    'item/UrgenceTel': t('urgence_tel'),
    'item/Curatelle': "@if(or(equals(triggerBody()?['sous_curatelle'], 'Oui'), startsWith(coalesce(triggerBody()?['sous_curatelle'], ''), 'Oui')), true, false)",
    'item/CuratelleType/Value': t('curatelle_type'),
    'item/CuratelleNom': t('curatelle_nom'),
    'item/CuratellePrenom': t('curatelle_prenom'),
    'item/CuratelleTel': t('curatelle_tel'),
    'item/CuratelleMail': t('curatelle_email'),
    'item/Limitations': t('limitations'),
    'item/ParcoursScolaire': t('parcours_scolaire'),
    'item/Tests/Value': t('deja_tests'),
    'item/TailleTshirt': t('taille_tshirt'),
    'item/TaillePantalon': t('taille_pantalon'),
    'item/Pointure': t('pointure'),
    'item/AssuranceInvalidite/Value': t('inscrit_ai'),
    'item/AIConseillerNom': t('ai_nom'),
    'item/AIConseillerPrenom': t('ai_prenom'),
    'item/AIConseillerTel': t('ai_tel'),
    'item/AIConseillerMail': t('ai_email'),
  }
}

// Expression PA : "Prénom Nom — Partenaire" si pourQui=autre, sinon "Aucun"
const referentContact = "@if(equals(triggerBody()?['pourQui'], 'autre'), concat(triggerBody()?['referent_prenom'], ' ', triggerBody()?['referent_nom'], ' — ', triggerBody()?['referent_partenaire']), 'Aucun')"

// ── Champs Demande — parcours STAGES ──
function demandeFieldsStage(stagiaireIdExpr, creneauActionName) {
  return {
    'item/StagiaireID/Id': stagiaireIdExpr,
    'item/TypeDemande/Value': 'Stage',
    'item/ReferentContact': referentContact,
    'item/Secteur': t('secteur'),
    'item/DateDebutSouhaitee': t('dateDebut'),
    'item/ObjectifStage': t('objectif_stage'),
    'item/DejaStage': "@if(equals(triggerBody()?['deja_stages_secteur'], 'Oui'), true, false)",
    'item/Statut/Value': 'En attente des documents',
    'item/Limitations': t('limitations'),
    'item/ParcoursScolaire': t('parcours_scolaire'),
    'item/CreneauID/Id': `@first(body('${creneauActionName}')?['d']?['results'])?['Id']`,
  }
}

// ── Champs Demande — parcours MODULES (1 demande par module dans le foreach) ──
// foreachName : nom du Foreach PA (ex: 'Pour_Chaque_Module_Existant')
// CreneauID non renseigné : les entrées SP Creneaux pour modules n'existent pas encore,
// et le filtre OData sur NomModule (avec accents) provoque des timeouts SP.
function demandeFieldsModule(stagiaireIdExpr, foreachName) {
  return {
    'item/StagiaireID/Id': stagiaireIdExpr,
    'item/TypeDemande/Value': 'Module métier',
    'item/ReferentContact': referentContact,
    'item/Etablissement': `@items('${foreachName}')?['site']`,
    'item/Secteur': `@items('${foreachName}')?['nom']`,
    'item/DateDebutSouhaitee': `@items('${foreachName}')?['dateDebut']`,
    'item/Statut/Value': 'En attente des documents',
    'item/Limitations': t('limitations'),
    'item/ParcoursScolaire': t('parcours_scolaire'),
  }
}

// ── Champs Referent ──
function referentFields(stagiaireIdExpr) {
  return {
    'item/Partenaire': t('referent_partenaire'),
    'item/Fonction/Value': t('referent_fonction'),
    'item/Nom': t('referent_nom'),
    'item/Prenom': t('referent_prenom'),
    'item/NumTel': t('referent_tel'),
    'item/Mail': t('referent_email'),
    'item/StagiaireID/Id': stagiaireIdExpr,
  }
}

// ── Corps email documents ──
function emailBody() {
  return `<p>Bonjour,<br><br>Merci pour votre demande de pré-inscription pour @{triggerBody()?['prenom']} @{triggerBody()?['nom']}.<br><br>Veuillez s'il vous plaît <b>répondre</b> à ce mail avec les documents en pièce jointe.<br><br>- Copie de la pièce d'identité<br>- Copie de la charte signée<br><br>Avec nos meilleures salutations,<br><br>Clair-Bois<br><br><i>Attention : Cette adresse ne peut pas recevoir de Mail en dehors d'une réponse</i></p>`
}

const emailTo = `@if(equals(triggerBody()?['pourQui'], 'autre'), triggerBody()?['referent_email'], triggerBody()?['email'])`

// ─────────────────────────────────────────────────────────────────────────────
// BLOCS RÉUTILISABLES
// Chaque fonction retourne un objet d'actions PA prêt à être spread dans actions{}
// ─────────────────────────────────────────────────────────────────────────────

// Recherche créneau STAGE (runAfter configurable)
function creneauStageAction(name, runAfterKey) {
  return {
    [name]: {
      runAfter: runAfterKey ? { [runAfterKey]: ['Succeeded'] } : {},
      type: 'OpenApiConnection',
      inputs: {
        parameters: {
          dataset: SP_SITE,
          'parameters/method': 'GET',
          'parameters/uri': `@concat('_api/web/lists(guid''${LIST_CRENEAUX}'')/items?$select=Id&$filter=Secteur eq ''', triggerBody()?['secteur'], ''' and DateDebut le ''', triggerBody()?['dateDebut'], ''' and DateFin ge ''', triggerBody()?['dateDebut'], '''&$top=1')`,
        },
        host: sp('HttpRequest'),
        authentication: auth,
      },
      description: 'Cherche le créneau Stage matching (Secteur + date dans la plage)',
    },
  }
}

// Branche STAGES complète (créneau → demande → referent → email)
// stagId : expression qui retourne l'ID du stagiaire
// suffix : 'Existant' ou 'Nouveau'
function stagesBranch(suffix, stagId, runAfterFirst) {
  const creneauName  = `Requete_HTTP_Creneaux_${suffix}`
  const demandeNom   = `Creer_Demande_Stage_${suffix}`
  const condRefNom   = `Condition_Referent_Stage_${suffix}`
  const creerRefNom  = `Creer_Referent_Stage_${suffix}`
  const emailNom     = `Email_Stage_${suffix}`

  return {
    ...creneauStageAction(creneauName, runAfterFirst),

    [demandeNom]: {
      runAfter: { [creneauName]: ['Succeeded'] },
      type: 'OpenApiConnection',
      inputs: {
        parameters: { dataset: SP_SITE, table: LIST_DEMANDE, ...demandeFieldsStage(stagId, creneauName) },
        host: sp('PostItem'),
        authentication: auth,
      },
      description: `Crée la Demande Stage (${suffix})`,
    },

    [condRefNom]: {
      runAfter: { [demandeNom]: ['Succeeded'] },
      type: 'If',
      expression: { and: [{ equals: [t('pourQui'), 'autre'] }] },
      actions: {
        [creerRefNom]: {
          type: 'OpenApiConnection',
          inputs: {
            parameters: { dataset: SP_SITE, table: LIST_REFERENT, ...referentFields(stagId) },
            host: sp('PostItem'),
            authentication: auth,
          },
          description: `Crée le Référent Stage (${suffix})`,
        },
      },
      else: { actions: {} },
      description: 'Si pourQui=autre → créer Référent',
    },

    [emailNom]: {
      runAfter: { [condRefNom]: ['Succeeded'] },
      type: 'OpenApiConnection',
      inputs: {
        parameters: {
          'emailMessage/To': emailTo,
          'emailMessage/Subject': `@concat('[AVS-756.XXXX.XXXX.', substring(triggerBody()?['avs'], sub(length(triggerBody()?['avs']), 2)), ' D°', outputs('${demandeNom}')?['body/ID'], '] Documents requis pour ', triggerBody()?['nom'], ' ', triggerBody()?['prenom'])`,
          'emailMessage/Body': emailBody(),
          'emailMessage/Importance': 'Normal',
        },
        host: o365('SendEmailV2'),
        authentication: auth,
      },
      description: 'Email demande de documents (stage)',
    },
  }
}

// Branche MODULES complète (referent → foreach[créneau + demande] → email)
// stagId : expression qui retourne l'ID du stagiaire
// suffix : 'Existant' ou 'Nouveau'
function modulesBranch(suffix, stagId, runAfterFirst) {
  const condRefNom   = `Condition_Referent_Module_${suffix}`
  const creerRefNom  = `Creer_Referent_Module_${suffix}`
  const foreachNom   = `Pour_Chaque_Module_${suffix}`
  const demandeNom   = `Creer_Demande_Module_${suffix}`
  const emailNom     = `Email_Modules_${suffix}`

  return {
    // 1. Referent d'abord (si pourQui=autre), une seule fois pour toute la soumission
    [condRefNom]: {
      runAfter: runAfterFirst ? { [runAfterFirst]: ['Succeeded'] } : {},
      type: 'If',
      expression: { and: [{ equals: [t('pourQui'), 'autre'] }] },
      actions: {
        [creerRefNom]: {
          type: 'OpenApiConnection',
          inputs: {
            parameters: { dataset: SP_SITE, table: LIST_REFERENT, ...referentFields(stagId) },
            host: sp('PostItem'),
            authentication: auth,
          },
          description: `Crée le Référent Modules (${suffix})`,
        },
      },
      else: { actions: {} },
      description: 'Si pourQui=autre → créer Référent (modules)',
    },

    // 2. Foreach : 1 itération par module sélectionné (max 3)
    //    Crée 1 Demande par module (sans lookup créneau — noms avec accents causent timeout SP)
    [foreachNom]: {
      runAfter: { [condRefNom]: ['Succeeded'] },
      type: 'Foreach',
      foreach: `@triggerBody()?['modules']`,
      actions: {
        [demandeNom]: {
          runAfter: {},
          type: 'OpenApiConnection',
          inputs: {
            parameters: { dataset: SP_SITE, table: LIST_DEMANDE, ...demandeFieldsModule(stagId, foreachNom) },
            host: sp('PostItem'),
            authentication: auth,
          },
          description: `Crée la Demande Module (${suffix}) — 1 par module sélectionné`,
        },
      },
      description: `Boucle sur les modules sélectionnés (max 3) — crée 1 Demande par module`,
    },

    // 3. Email récapitulatif après la boucle
    [emailNom]: {
      runAfter: { [foreachNom]: ['Succeeded'] },
      type: 'OpenApiConnection',
      inputs: {
        parameters: {
          'emailMessage/To': emailTo,
          'emailMessage/Subject': `@concat('[Modules métiers] Inscription de ', triggerBody()?['prenom'], ' ', triggerBody()?['nom'], ' — ', string(length(triggerBody()?['modules'])), ' module(s)')`,
          'emailMessage/Body': emailBody(),
          'emailMessage/Importance': 'Normal',
        },
        host: o365('SendEmailV2'),
        authentication: auth,
      },
      description: 'Email récapitulatif inscription modules',
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DÉFINITION DU FLUX
// ─────────────────────────────────────────────────────────────────────────────
const definition = {
  name: FLOW_ID,
  id: `/providers/Microsoft.Flow/flows/${FLOW_ID}`,
  type: 'Microsoft.Flow/flows',
  properties: {
    apiId: '/providers/Microsoft.PowerApps/apis/shared_logicflows',
    displayName: 'Flux 5 - HTTP Inscription (Formulaire React)',
    definition: {
      metadata: {
        workflowEntityId: null,
        processAdvisorMetadata: null,
        flowChargedByPaygo: null,
        flowclientsuspensionreason: 'None',
        flowclientsuspensiontime: null,
        flowclientsuspensionreasondetails: null,
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
        $connections: { defaultValue: {}, type: 'Object' },
      },
      triggers: {
        manual: {
          type: 'Request',
          kind: 'Http',
          inputs: {
            schema: {
              type: 'object',
              properties: {
                cheminKey: { type: 'string' },
                parcours: { type: 'string' },
                pourQui: { type: 'string' },
                dejaInscrit: { type: 'boolean' },
                dateEnvoi: { type: 'string' },
                // Contexte stage
                secteur: { type: 'string' },
                dateDebut: { type: 'string' },
                dateFin: { type: 'string' },
                // Contexte modules (tableau, 1 à 3 éléments)
                // { nom, site, semaine, dateDebut, dateFin }
                modules: { type: 'array' },
                // Stagiaire
                nom: { type: 'string' },
                prenom: { type: 'string' },
                sexe: { type: 'string' },
                date_naissance: { type: 'string' },
                avs: { type: 'string' },
                tel: { type: 'string' },
                email: { type: 'string' },
                adresse: { type: 'string' },
                npa: { type: 'string' },
                formation: { type: 'string' },
                // Curatelle
                sous_curatelle: { type: 'string' },
                curatelle_type: { type: 'string' },
                curatelle_nom: { type: 'string' },
                curatelle_prenom: { type: 'string' },
                curatelle_tel: { type: 'string' },
                curatelle_email: { type: 'string' },
                // Urgence
                urgence_nom: { type: 'string' },
                urgence_prenom: { type: 'string' },
                urgence_lien: { type: 'string' },
                urgence_tel: { type: 'string' },
                // AI
                inscrit_ai: { type: 'string' },
                ai_nom: { type: 'string' },
                ai_prenom: { type: 'string' },
                ai_tel: { type: 'string' },
                ai_email: { type: 'string' },
                ai_office: { type: 'string' },
                ai_mesure: { type: 'string' },
                // Complémentaire
                objectif_stage: { type: 'string' },
                parcours_scolaire: { type: 'string' },
                limitations: { type: 'string' },
                deja_tests: { type: 'string' },
                deja_stages_secteur: { type: 'string' },
                reseau_medical: { type: 'string' },
                pointure: { type: 'string' },
                taille_tshirt: { type: 'string' },
                taille_pantalon: { type: 'string' },
                // Déclaration
                declaration_charte: { type: 'string' },
                declaration_engagement: { type: 'string' },
                // Référent
                referent_partenaire: { type: 'string' },
                referent_nom: { type: 'string' },
                referent_prenom: { type: 'string' },
                referent_tel: { type: 'string' },
                referent_email: { type: 'string' },
                referent_fonction: { type: 'string' },
              },
            },
          },
          description: 'Reçoit le JSON du formulaire React intégré (stages et modules)',
        },
      },
      actions: {

        // ── 1. Check AVS ────────────────────────────────────────────────────
        Check_AVS: {
          runAfter: {},
          type: 'OpenApiConnection',
          inputs: {
            parameters: {
              dataset: SP_SITE,
              'parameters/method': 'GET',
              'parameters/uri': `@concat('_api/web/lists/getbytitle(''Stagiaire'')/items?$select=Id,AVS&$filter=AVS eq ''', triggerBody()?['avs'], '''')`,
            },
            host: sp('HttpRequest'),
            authentication: auth,
          },
          description: 'Vérifie si cet AVS existe déjà dans la liste Stagiaire',
        },

        // ── 2. AVS existe ? ──────────────────────────────────────────────────
        Condition_AVS_Existe: {
          runAfter: { Check_AVS: ['Succeeded'] },
          type: 'If',
          expression: { and: [{ greater: ["@length(body('Check_AVS')?['d']?['results'])", 0] }] },
          description: 'AVS existe ? → MAJ ou Créer Stagiaire puis router sur parcours',

          // ── VRAI : stagiaire existant ──────────────────────────────────────
          actions: {
            MAJ_Stagiaire: {
              runAfter: {},
              type: 'OpenApiConnection',
              inputs: {
                parameters: {
                  dataset: SP_SITE,
                  table: LIST_STAGIAIRE,
                  id: "@first(body('Check_AVS')?['d']?['results'])?['Id']",
                  ...stagiaireFields(),
                },
                host: sp('PatchItem'),
                authentication: auth,
              },
              description: 'MAJ du stagiaire existant (AVS trouvé)',
            },

            // Condition sur le parcours — après MAJ Stagiaire
            Condition_Parcours_Existant: {
              runAfter: { MAJ_Stagiaire: ['Succeeded'] },
              type: 'If',
              expression: { and: [{ equals: [t('parcours'), 'stages'] }] },
              description: 'Parcours stages ou modules ? (stagiaire existant)',

              // Stages
              actions: stagesBranch('Existant', "@first(body('Check_AVS')?['d']?['results'])?['Id']", null),

              // Modules
              else: {
                actions: modulesBranch('Existant', "@first(body('Check_AVS')?['d']?['results'])?['Id']", null),
              },
            },
          },

          // ── FAUX : nouveau stagiaire ───────────────────────────────────────
          else: {
            actions: {
              Creer_Stagiaire: {
                runAfter: {},
                type: 'OpenApiConnection',
                inputs: {
                  parameters: { dataset: SP_SITE, table: LIST_STAGIAIRE, ...stagiaireFields() },
                  host: sp('PostItem'),
                  authentication: auth,
                },
                description: 'Crée un nouveau stagiaire',
              },

              // Condition sur le parcours — après création Stagiaire
              Condition_Parcours_Nouveau: {
                runAfter: { Creer_Stagiaire: ['Succeeded'] },
                type: 'If',
                expression: { and: [{ equals: [t('parcours'), 'stages'] }] },
                description: 'Parcours stages ou modules ? (nouveau stagiaire)',

                // Stages
                actions: stagesBranch('Nouveau', "@outputs('Creer_Stagiaire')?['body/ID']", null),

                // Modules
                else: {
                  actions: modulesBranch('Nouveau', "@outputs('Creer_Stagiaire')?['body/ID']", null),
                },
              },
            },
          },
        },

        // ── 3. Réponse HTTP 200 ───────────────────────────────────────────────
        Reponse_HTTP: {
          runAfter: { Condition_AVS_Existe: ['Succeeded'] },
          type: 'Response',
          kind: 'Http',
          inputs: {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: { success: true, message: 'Demande enregistrée avec succès' },
          },
          description: 'Réponse HTTP 200 au frontend React',
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
    },
    flowFailureAlertSubscribed: false,
    isManaged: false,
  },
}

// ── Manifest racine ──
const manifest = {
  schema: '1.0',
  details: {
    displayName: 'Flux 5 - HTTP Inscription React',
    description: 'Reçoit les inscriptions (stages et modules) du formulaire React via HTTP POST',
    createdTime: new Date().toISOString(),
    packageTelemetryId: 'flux5-http-react-inscription',
    creator: 'N/A',
    sourceEnvironment: '',
  },
  resources: {
    [FLOW_GUID]: {
      type: 'Microsoft.Flow/flows',
      suggestedCreationType: 'New',
      creationType: 'Existing, New, Update',
      details: { displayName: 'Flux 5 - HTTP Inscription React' },
      configurableBy: 'User',
      hierarchy: 'Root',
      dependsOn: [API_SP, CONN_SP, API_O365, CONN_O365],
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
  },
}

const apisMap = {
  shared_sharepointonline: API_SP,
  shared_office365: API_O365,
}

const connectionsMap = {
  shared_sharepointonline: CONN_SP,
  shared_office365: CONN_O365,
}

const flowsManifest = {
  packageSchemaVersion: '1.0',
  flowAssets: { assetPaths: [FLOW_GUID] },
}

// ── Construction du ZIP ──
const outputPath = path.join(__dirname, 'flux5-http-inscription.zip')
const output = fs.createWriteStream(outputPath)
const archive = archiver('zip', { zlib: { level: 9 } })

archive.pipe(output)

archive.append(JSON.stringify(manifest, null, 2),      { name: 'manifest.json' })
archive.append(JSON.stringify(flowsManifest, null, 2), { name: 'Microsoft.Flow/flows/manifest.json' })
archive.append(JSON.stringify(apisMap, null, 2),       { name: `Microsoft.Flow/flows/${FLOW_GUID}/apisMap.json` })
archive.append(JSON.stringify(connectionsMap, null, 2),{ name: `Microsoft.Flow/flows/${FLOW_GUID}/connectionsMap.json` })
archive.append(JSON.stringify(definition, null, 2),    { name: `Microsoft.Flow/flows/${FLOW_GUID}/definition.json` })

archive.finalize()
output.on('close', () => console.log(`✅ flux5-http-inscription.zip généré (${archive.pointer()} bytes)`))
archive.on('error', (err) => { throw err })
