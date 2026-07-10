import { useState, useEffect, useCallback } from 'react'
import ChampsEtape from './formulaire/ChampsEtape'
import {
  TYPES_CHAMP,
  LISTES_CIBLES,
  cleChamp,
  champsDeLEtape,
  deplacerChamp,
  reordonnerChampVers,
  mettreAJourChamp,
  ajouterChamp,
  supprimerChamp,
  ajouterEtape,
  mettreAJourEtape,
  deplacerEtape,
  supprimerEtape,
  suggererColonneSP,
  validerColonneSP,
  colonnesDeLaListe,
  questionsPrealablesDe,
  ajouterQuestionPrealable,
  mettreAJourQuestionPrealable,
  supprimerQuestionPrealable,
  parserOptions,
  optionsVersTexte,
  chargerSchema,
  telechargerSchema,
  publierSchema,
  getGithubPat,
  setGithubPat,
} from '../utils/schemaFormulaires'
import { normaliserTheme, appliquerTheme, themePourFormulaire } from '../utils/themes'
import EditeurTheme from './EditeurTheme'

/**
 * Conditions d'affichage d'une étape, formulées simplement. Elles s'appuient
 * sur les réponses posées AVANT le formulaire d'inscription (aiguillage :
 * « pour moi / pour quelqu'un d'autre », « stage / modules »). Les formulaires
 * autonomes (signalement, visite) n'ont pas d'aiguillage → « Toujours ».
 */
const CONDITIONS_ETAPE = [
  { valeur: '', label: 'Toujours afficher cette étape' },
  { valeur: 'pourQui=autre', label: "Seulement si un·e référent·e remplit (pas le ou la stagiaire)" },
  { valeur: 'pourQui=moi', label: 'Seulement si le ou la stagiaire remplit lui-même' },
  { valeur: 'parcours=stages', label: 'Seulement pour une demande de stage' },
  { valeur: 'parcours=modules', label: 'Seulement pour les modules métiers' },
]

/**
 * Le champ pilote-t-il une condition donnée ? (la condition commence par
 * `champPayload=` ou `champPayload!=`). Sert à détecter les dépendances.
 */
function conditionPiloteePar(condition, champPayload) {
  if (!condition) return false
  const gauche = condition.split(/!?=/)[0].trim()
  return gauche === champPayload
}

/**
 * Éléments (questions et étapes) dont l'affichage dépend d'un champ pilote.
 * @returns {string[]} libellés lisibles des dépendants.
 */
function elementsDependantDe(schema, champPayload) {
  const champs = (schema.champs || [])
    .filter((c) => c.champPayload !== champPayload && conditionPiloteePar(c.condition, champPayload))
    .map((c) => `la question « ${c.label} »`)
  const etapes = (schema.etapes || [])
    .filter((e) => conditionPiloteePar(e.conditionAffichage, champPayload))
    .map((e) => `l'étape « ${e.titre} »`)
  return [...champs, ...etapes]
}

/**
 * EditeurFormulaires — Mode édition des formulaires (CMS interne).
 *
 * Expérience type Jotform pour la coordination DFIP : chaque champ du
 * formulaire est affiché tel qu'il apparaîtra, dans un cadre cliquable.
 * Cliquer un cadre le sélectionne : une barre d'outils (monter/descendre/
 * supprimer) et un panneau de propriétés apparaissent.
 *
 * RÈGLE D'OR (pédagogie Rosina) : chaque champ possède un identifiant
 * technique `colonneSP` = nom interne de la colonne SharePoint cible.
 * C'est ce nom qui permet à Power Automate d'écrire la réponse dans la
 * bonne colonne. Ajouter un champ ici = créer AUSSI la colonne dans la
 * liste SharePoint (rappel affiché en jaune).
 *
 * Publication : commit direct de public/formulaire-schema.json sur GitHub
 * (token fine-grained saisi à la première publication, gardé pour la
 * session uniquement). GitHub Pages redéploie — les modifications sont
 * historisées dans git, sans aucune connexion à Power Automate.
 *
 * Props :
 *   - onGoHome() : retour à l'accueil du site (sans déconnexion).
 *   - onLogout() : déconnexion du mode édition + retour accueil.
 */
function EditeurFormulaires({ onGoHome, onLogout }) {
  const [schema, setSchema] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreurChargement, setErreurChargement] = useState('')
  const [formulaireActif, setFormulaireActif] = useState('inscription')
  const [cleSelection, setCleSelection] = useState(null)
  const [etapeOuverte, setEtapeOuverte] = useState(null) // panneau réglages d'étape
  const [vue, setVue] = useState('formulaires') // 'formulaires' | 'theme'
  const [dragCle, setDragCle] = useState(null) // champ en cours de glissement
  const [dropInfo, setDropInfo] = useState(null) // { cle, avant } : cible de dépôt
  const [modifie, setModifie] = useState(false)
  const [publication, setPublication] = useState({ enCours: false, succes: '', erreur: '' })
  const [patVisible, setPatVisible] = useState(false)
  const [patSaisi, setPatSaisi] = useState('')

  /* Chargement initial du schéma (fichier statique du site). */
  useEffect(() => {
    chargerSchema()
      .then((s) => setSchema(s))
      .catch((e) => setErreurChargement(e.message))
      .finally(() => setChargement(false))
  }, [])

  /* Garde-fou : avertir avant de quitter la page avec des modifications non publiées. */
  useEffect(() => {
    if (!modifie) return
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [modifie])

  /** Applique une transformation au schéma et marque l'état « modifié ». */
  const appliquer = useCallback((transformation) => {
    setSchema((s) => transformation(s))
    setModifie(true)
    setPublication({ enCours: false, succes: '', erreur: '' })
  }, [])

  if (chargement) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cb-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (erreurChargement || !schema) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-white border border-red-200 rounded-xl p-8 text-center">
        <p className="text-cb-red font-semibold mb-2">Impossible d'ouvrir l'éditeur</p>
        <p className="text-sm text-gray-500">{erreurChargement}</p>
      </div>
    )
  }

  const etapesActives = (schema.etapes || [])
    .filter((e) => e.formulaire === formulaireActif)
    .sort((a, b) => a.ordre - b.ordre)

  // Questions préalables du formulaire actif (posées avant le formulaire).
  const prealablesActives = questionsPrealablesDe(schema, formulaireActif)

  // Conditions d'étape proposées = presets + réponses aux questions préalables.
  const conditionsEtapeDisponibles = [
    ...CONDITIONS_ETAPE,
    ...prealablesActives.flatMap((q) =>
      (q.options || []).map((o) => ({
        valeur: `${q.cle}=${o.value}`,
        label: `Si « ${q.label} » = ${o.label}`,
      }))
    ),
  ]

  /* Un champ est stocké en SP ssi il vise une liste. Les champs sans liste
   * (consentements, textes informatifs, docs renvoyés séparément) n'ont ni
   * colonne à créer ni identifiant à valider. */
  const estStockeSP = (c) => !!(c.listeCible && c.listeCible.trim())

  /* Champs marqués « nouveau » ET stockés = colonnes SharePoint à créer. */
  const colonnesACreer = schema.champs.filter((c) => c.nouveau && estStockeSP(c))

  /* Listes hors référentiel officiel = nouvelles listes SP à créer. */
  const listesACreer = [...new Set(schema.champs.map((c) => c.listeCible))].filter((l) => l && !LISTES_CIBLES.includes(l))

  /* Erreurs bloquantes pour la publication (identifiants SP invalides/dupliqués),
   * uniquement pour les champs réellement stockés en SharePoint. */
  const erreursColonnes = schema.champs
    .filter(estStockeSP)
    .map((c) => {
      const autres = colonnesDeLaListe(schema, c.listeCible, cleChamp(c))
      const res = validerColonneSP(c.colonneSP, autres)
      return res.valide ? null : `${c.label || c.champPayload} : ${res.message}`
    })
    .filter(Boolean)

  /* ── Actions ─────────────────────────────────────────── */

  function publier(pat) {
    setPublication({ enCours: true, succes: '', erreur: '' })
    publierSchema(schema, pat)
      .then(({ commitUrl }) => {
        setGithubPat(pat)
        setModifie(false)
        setPublication({
          enCours: false,
          succes: `Publié ! Le site se met à jour dans ~1 minute.${commitUrl ? '' : ''}`,
          erreur: '',
        })
      })
      .catch((e) => setPublication({ enCours: false, succes: '', erreur: e.message }))
  }

  function handlePublier() {
    if (erreursColonnes.length > 0) return
    const pat = getGithubPat()
    if (pat) {
      publier(pat)
    } else {
      setPatSaisi('')
      setPatVisible(true)
    }
  }

  function handleSupprimer(champ) {
    // On INFORME (sans jamais interdire) : c'est l'admin qui décide, et le
    // flux Power Automate ignore un champ manquant sans planter.
    const dependants = elementsDependantDe(schema, champ.champPayload)
    const message = dependants.length > 0
      ? `⚠️ Supprimer « ${champ.label} » ?\n\nD'autres éléments dépendent de ce champ et ne s'afficheront plus :\n` +
        dependants.map((d) => `  • ${d}`).join('\n') +
        `\n\nSupprimer quand même ?`
      : `Supprimer la question « ${champ.label} » ?\n\nLa colonne SharePoint « ${champ.colonneSP || '—'} » n'est pas supprimée — seule la question disparaît du formulaire.`
    if (!window.confirm(message)) return
    setCleSelection(null)
    appliquer((s) => supprimerChamp(s, cleChamp(champ)))
  }

  function handleAjouter(etapeCle) {
    // Calcul déterministe depuis le schéma courant : la nouvelle clé est
    // connue AVANT le setState, donc la sélection suit à coup sûr.
    const { schema: s2, champ } = ajouterChamp(schema, etapeCle)
    appliquer(() => s2)
    setCleSelection(cleChamp(champ))
  }

  function handleAjouterEtape() {
    const { schema: s2, etape } = ajouterEtape(schema, formulaireActif)
    appliquer(() => s2)
    setEtapeOuverte(etape.cle) // ouvre le panneau pour renommer tout de suite
  }

  /** Déplace une étape vers un autre formulaire existant (place en fin) + suit la vue. */
  function handleChangerFormulaireEtape(etape, nouveauFormulaire) {
    appliquer((s) => {
      const duForm = (s.etapes || []).filter((e) => e.formulaire === nouveauFormulaire)
      const ordre = duForm.length ? Math.max(...duForm.map((e) => e.ordre ?? 0)) + 1 : 1
      return mettreAJourEtape(s, etape.cle, { formulaire: nouveauFormulaire, ordre })
    })
    setFormulaireActif(nouveauFormulaire)
  }

  function handleSupprimerEtape(etape, nbQuestions) {
    if (nbQuestions > 0) {
      window.alert('Déplacez ou supprimez d\'abord les questions de cette étape.')
      return
    }
    if (!window.confirm(`Supprimer l'étape « ${etape.titre} » ?`)) return
    setEtapeOuverte(null)
    appliquer((s) => supprimerEtape(s, etape.cle))
  }

  /* ── Questions préalables ── */
  function handleAjouterPrealable() {
    appliquer((s) => ajouterQuestionPrealable(s, formulaireActif).schema)
  }
  function handleSupprimerPrealable(question) {
    const dependants = (schema.etapes || [])
      .filter((e) => conditionPiloteePar(e.conditionAffichage, question.cle))
      .map((e) => `l'étape « ${e.titre} »`)
    const msg = dependants.length
      ? `Supprimer la question préalable « ${question.label} » ?\n\nCes éléments en dépendent et redeviendront « toujours affichés » :\n${dependants.map((d) => '  • ' + d).join('\n')}\n\nSupprimer quand même ?`
      : `Supprimer la question préalable « ${question.label} » ?`
    if (!window.confirm(msg)) return
    appliquer((s) => supprimerQuestionPrealable(s, question.cle))
  }

  /** Fin d'un glisser-déposer : réordonne le champ vers la cible survolée. */
  function handleDrop() {
    if (dragCle && dropInfo && dragCle !== dropInfo.cle) {
      appliquer((s) => reordonnerChampVers(s, dragCle, dropInfo.cle, dropInfo.avant))
    }
    setDragCle(null)
    setDropInfo(null)
  }

  /**
   * Change le thème DU FORMULAIRE actif : stocké dans schema.themes[cle] ET
   * appliqué en direct (aperçu). Chaque formulaire a son propre thème.
   */
  function handleThemeChange(theme) {
    const t = normaliserTheme(theme)
    appliquerTheme(t)
    appliquer((s) => ({ ...s, themes: { ...(s.themes || {}), [formulaireActif]: t } }))
  }

  /* ── Rendu ───────────────────────────────────────────── */

  return (
    <div className="animate-fadeIn pb-24">
      {/* Barre d'en-tête de l'éditeur */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-white/95 backdrop-blur border-b border-gray-200 mb-6">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold text-cb-blue mr-auto">
            {vue === 'theme' ? '🎨 Thème du formulaire' : '✏️ Édition des formulaires'}
            {modifie && (
              <span className="ml-2 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5 align-middle">
                modifications non publiées
              </span>
            )}
          </h1>
          {/* Bascule Formulaires / Thème */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => setVue('formulaires')}
              className={`px-3 py-1.5 transition-colors cursor-pointer ${vue === 'formulaires' ? 'bg-cb-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Formulaires
            </button>
            <button
              type="button"
              onClick={() => {
                setVue('theme')
                // Aperçu direct : applique le thème du formulaire sélectionné.
                appliquerTheme(themePourFormulaire(schema, formulaireActif))
              }}
              className={`px-3 py-1.5 transition-colors cursor-pointer ${vue === 'theme' ? 'bg-cb-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Thème
            </button>
          </div>
          {/* Sélecteur de formulaire, commun aux deux vues (édition des champs OU du thème) */}
          <select
            value={formulaireActif}
            onChange={(e) => {
              const cle = e.target.value
              setFormulaireActif(cle)
              setCleSelection(null)
              // En vue thème : aperçu direct du thème de ce formulaire.
              if (vue === 'theme') appliquerTheme(themePourFormulaire(schema, cle))
            }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white cursor-pointer"
            aria-label="Formulaire à éditer"
          >
            {(schema.formulaires || []).map((f) => (
              <option key={f.cle} value={f.cle}>{f.titre}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handlePublier}
            disabled={!modifie || publication.enCours || erreursColonnes.length > 0}
            className="text-sm font-semibold text-white bg-cb-blue hover:bg-cb-accent rounded-lg px-4 py-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {publication.enCours ? 'Publication…' : 'Publier'}
          </button>
          <button
            type="button"
            onClick={() => telechargerSchema(schema)}
            className="text-sm text-cb-blue border border-cb-blue/40 hover:bg-cb-blue-light rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
            title="Enregistre le fichier JSON sur l'ordinateur (secours si la publication échoue)"
          >
            Télécharger
          </button>
          <button
            type="button"
            onClick={onGoHome}
            className="text-sm text-gray-500 hover:text-cb-blue transition-colors cursor-pointer"
          >
            Voir le site
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="text-sm text-gray-400 hover:text-cb-red transition-colors cursor-pointer"
          >
            Quitter
          </button>
        </div>
        {/* Messages de publication */}
        {(publication.succes || publication.erreur) && (
          <div className="max-w-3xl mx-auto mt-2">
            {publication.succes && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">✅ {publication.succes}</p>
            )}
            {publication.erreur && (
              <p className="text-sm text-cb-red bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">⚠️ {publication.erreur}</p>
            )}
          </div>
        )}
        {erreursColonnes.length > 0 && (
          <div className="max-w-3xl mx-auto mt-2">
            <p className="text-sm text-cb-red bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
              Publication bloquée — corrigez d'abord : {erreursColonnes[0]}
            </p>
          </div>
        )}
      </div>

      {/* ── Vue THÈME (par formulaire) ── */}
      {vue === 'theme' && (
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-gray-500 mb-3">
            Vous modifiez l'apparence du formulaire <strong>« {(schema.formulaires || []).find((f) => f.cle === formulaireActif)?.titre }</strong> ».
            Chaque formulaire peut avoir son propre thème — changez de formulaire dans le menu en haut.
          </p>
          <EditeurTheme
            themeCourant={themePourFormulaire(schema, formulaireActif)}
            onChange={handleThemeChange}
          />
        </div>
      )}

      {/* ── Vue FORMULAIRES ── */}
      {vue === 'formulaires' && (
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Pédagogie : la règle d'or de l'identifiant SharePoint */}
        <div className="bg-cb-blue-light/60 border border-cb-blue/20 rounded-xl p-4 text-sm text-cb-blue">
          <p className="font-semibold mb-1">Comment ça marche</p>
          <p>
            Cliquez sur une question pour la modifier, glissez la poignée ⠿ pour la déplacer, ou supprimez-la.
            La plupart des questions ont un <strong>identifiant SharePoint</strong> (ex. <code className="bg-white/70 rounded px-1">TaillePantalon</code>) :
            c'est lui qui relie la réponse à la bonne colonne de la liste SharePoint —
            <strong> si vous ajoutez une question stockée, créez aussi la colonne du même nom.</strong>{' '}
            Certaines questions n'ont <em>pas</em> de colonne (case de consentement, texte informatif) :
            réglez cela avec l'interrupteur « Réponse enregistrée dans SharePoint ? ».
            Quand tout est prêt, cliquez « Publier » — le site se met à jour tout seul.
          </p>
        </div>

        {/* Rappel des NOUVELLES LISTES SharePoint à créer */}
        {listesACreer.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm text-amber-900">
            <p className="font-semibold mb-1">🗂️ Nouvelle(s) liste(s) SharePoint à créer</p>
            <ul className="list-disc ml-5 space-y-0.5">
              {listesACreer.map((l) => (
                <li key={l}>
                  Créez une liste SharePoint nommée <strong>{l}</strong>, puis ajoutez-y les colonnes des questions qui la visent.
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rappel des colonnes SharePoint à créer */}
        {colonnesACreer.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 text-sm text-yellow-800">
            <p className="font-semibold mb-1">⚠️ Colonnes à créer dans SharePoint</p>
            <ul className="list-disc ml-5 space-y-0.5">
              {colonnesACreer.map((c) => (
                <li key={cleChamp(c)}>
                  <code className="bg-white/70 rounded px-1">{c.colonneSP}</code> dans la liste <strong>{c.listeCible}</strong>
                  {' '}(question « {c.label} »)
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Questions préalables : posées AVANT le formulaire, pour conditionner les étapes */}
        <section className="bg-purple-50/50 border border-purple-200 rounded-xl p-4">
          <h2 className="text-base font-bold text-purple-800 mb-1">Questions préalables</h2>
          <p className="text-xs text-purple-700/80 mb-3">
            Posées sur un écran <strong>avant</strong> le formulaire. Leur réponse permet ensuite de décider,
            dans les réglages d'une étape (« Quand afficher cette étape ? »), si celle-ci est nécessaire.
          </p>
          <div className="space-y-3">
            {prealablesActives.map((q) => (
              <div key={q.cle} className="bg-white border border-purple-100 rounded-lg p-3 grid gap-2">
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-500 mb-1">Question</span>
                  <input
                    type="text"
                    value={q.label}
                    onChange={(e) => appliquer((s) => mettreAJourQuestionPrealable(s, q.cle, { label: e.target.value }))}
                    className={CLASSES_INPUT_PROP}
                  />
                </label>
                <div className="flex items-end gap-2">
                  <label className="block flex-1">
                    <span className="block text-xs font-semibold text-gray-500 mb-1">Réponses possibles (une par ligne)</span>
                    <textarea
                      rows={2}
                      value={optionsVersTexte(q.options)}
                      onChange={(e) => appliquer((s) => mettreAJourQuestionPrealable(s, q.cle, { options: parserOptions(e.target.value) }))}
                      className={CLASSES_INPUT_PROP + ' font-mono text-xs resize-y'}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSupprimerPrealable(q)}
                    className="shrink-0 text-sm px-2.5 py-2 rounded-lg border border-red-200 text-cb-red bg-white hover:bg-red-50 cursor-pointer"
                    title="Supprimer cette question préalable"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAjouterPrealable}
            className="mt-3 w-full border-2 border-dashed border-purple-300 hover:border-purple-500 text-purple-600 rounded-xl py-2.5 text-sm font-medium transition-colors cursor-pointer"
          >
            + Ajouter une question préalable
          </button>
        </section>

        {/* Les étapes du formulaire actif */}
        {etapesActives.map((etape, indexEtape) => {
          const champs = champsDeLEtape(schema, etape.cle)
          const reglagesOuverts = etapeOuverte === etape.cle
          return (
            <section key={etape.cle} aria-label={`Étape ${etape.titre}`}>
              <div className="flex items-center justify-between mb-2 gap-2">
                <h2 className="text-base font-bold text-gray-700">
                  {etape.titre}
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    {champs.length} question{champs.length > 1 ? 's' : ''}
                    {etape.conditionAffichage ? ` — affichée si ${etape.conditionAffichage}` : ''}
                  </span>
                </h2>
                <button
                  type="button"
                  onClick={() => setEtapeOuverte(reglagesOuverts ? null : etape.cle)}
                  className={`shrink-0 text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    reglagesOuverts ? 'border-cb-accent text-cb-accent bg-white' : 'border-gray-200 text-gray-400 bg-white hover:border-cb-accent hover:text-cb-accent'
                  }`}
                  aria-expanded={reglagesOuverts}
                >
                  ✎ Étape
                </button>
              </div>

              {/* Réglages de l'étape : titre, intro, ordre, suppression */}
              {reglagesOuverts && (
                <div className="mb-3 bg-white border-2 border-cb-accent rounded-xl p-4 grid gap-3">
                  <Propriete label="Titre de l'étape">
                    <input
                      type="text"
                      value={etape.titre}
                      onChange={(e) => appliquer((s) => mettreAJourEtape(s, etape.cle, { titre: e.target.value }))}
                      className={CLASSES_INPUT_PROP}
                    />
                  </Propriete>
                  <Propriete label="Texte d'introduction (bandeau au-dessus des questions — laisser vide si inutile)">
                    <textarea
                      rows={2}
                      value={etape.intro || ''}
                      onChange={(e) => appliquer((s) => mettreAJourEtape(s, etape.cle, { intro: e.target.value }))}
                      className={CLASSES_INPUT_PROP + ' resize-y'}
                    />
                  </Propriete>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Propriete label="Formulaire auquel cette étape appartient">
                      <select
                        value={etape.formulaire}
                        onChange={(e) => handleChangerFormulaireEtape(etape, e.target.value)}
                        className={CLASSES_INPUT_PROP + ' cursor-pointer'}
                      >
                        {(schema.formulaires || []).map((f) => (
                          <option key={f.cle} value={f.cle}>{f.titre}</option>
                        ))}
                      </select>
                    </Propriete>
                    <Propriete label="Quand afficher cette étape ?">
                      <select
                        value={conditionsEtapeDisponibles.some((c) => c.valeur === (etape.conditionAffichage || '')) ? (etape.conditionAffichage || '') : '__perso'}
                        onChange={(e) => {
                          const v = e.target.value
                          appliquer((s) => mettreAJourEtape(s, etape.cle, { conditionAffichage: v === '__perso' ? (etape.conditionAffichage || 'champ=valeur') : (v || null) }))
                        }}
                        className={CLASSES_INPUT_PROP + ' cursor-pointer'}
                      >
                        {conditionsEtapeDisponibles.map((c) => (
                          <option key={c.valeur || 'toujours'} value={c.valeur}>{c.label}</option>
                        ))}
                        <option value="__perso">Personnalisé (avancé)…</option>
                      </select>
                    </Propriete>
                  </div>
                  {/* Champ libre visible uniquement si la condition n'est pas un preset */}
                  {etape.conditionAffichage && !conditionsEtapeDisponibles.some((c) => c.valeur === etape.conditionAffichage) && (
                    <Propriete label="Condition personnalisée (avancé)">
                      <input
                        type="text"
                        value={etape.conditionAffichage}
                        onChange={(e) => appliquer((s) => mettreAJourEtape(s, etape.cle, { conditionAffichage: e.target.value || null }))}
                        placeholder="Ex : parcours=stages"
                        className={CLASSES_INPUT_PROP + ' font-mono text-xs'}
                      />
                    </Propriete>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Propriete label="Style du bandeau">
                      <select
                        value={etape.tonalite || 'info'}
                        onChange={(e) => appliquer((s) => mettreAJourEtape(s, etape.cle, { tonalite: e.target.value === 'info' ? undefined : e.target.value }))}
                        className={CLASSES_INPUT_PROP + ' cursor-pointer'}
                      >
                        <option value="info">Informatif (bleu)</option>
                        <option value="attention">Attention (orange)</option>
                      </select>
                    </Propriete>
                    <div className="flex gap-1 ml-auto self-end">
                      <button
                        type="button"
                        disabled={indexEtape === 0}
                        onClick={() => appliquer((s) => deplacerEtape(s, etape.cle, -1))}
                        className="text-sm px-2.5 py-2 rounded-lg border border-gray-200 bg-white hover:border-cb-accent disabled:opacity-30 cursor-pointer"
                        title="Monter l'étape"
                      >↑</button>
                      <button
                        type="button"
                        disabled={indexEtape === etapesActives.length - 1}
                        onClick={() => appliquer((s) => deplacerEtape(s, etape.cle, 1))}
                        className="text-sm px-2.5 py-2 rounded-lg border border-gray-200 bg-white hover:border-cb-accent disabled:opacity-30 cursor-pointer"
                        title="Descendre l'étape"
                      >↓</button>
                      <button
                        type="button"
                        onClick={() => handleSupprimerEtape(etape, champs.length)}
                        className={`text-sm px-2.5 py-2 rounded-lg border bg-white cursor-pointer ${
                          champs.length > 0 ? 'border-gray-200 text-gray-300' : 'border-red-200 text-cb-red hover:bg-red-50'
                        }`}
                        title={champs.length > 0 ? "Videz l'étape de ses questions avant de la supprimer" : "Supprimer l'étape"}
                      >🗑</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {champs.map((champ, index) => (
                  <CadreChamp
                    key={cleChamp(champ)}
                    champ={champ}
                    schema={schema}
                    selectionne={cleChamp(champ) === cleSelection}
                    premier={index === 0}
                    dernier={index === champs.length - 1}
                    /* Glisser-déposer */
                    enGlissement={dragCle === cleChamp(champ)}
                    dropAvant={dropInfo?.cle === cleChamp(champ) && dropInfo.avant && dragCle !== cleChamp(champ)}
                    dropApres={dropInfo?.cle === cleChamp(champ) && !dropInfo.avant && dragCle !== cleChamp(champ)}
                    onDragStartCarte={() => setDragCle(cleChamp(champ))}
                    onDragOverCarte={(avant) => {
                      if (dragCle && dragCle !== cleChamp(champ)) {
                        setDropInfo((d) => (d?.cle === cleChamp(champ) && d.avant === avant ? d : { cle: cleChamp(champ), avant }))
                      }
                    }}
                    onDropCarte={handleDrop}
                    onDragEndCarte={() => { setDragCle(null); setDropInfo(null) }}
                    onSelect={() =>
                      setCleSelection(cleChamp(champ) === cleSelection ? null : cleChamp(champ))
                    }
                    onMonter={() => appliquer((s) => deplacerChamp(s, cleChamp(champ), -1))}
                    onDescendre={() => appliquer((s) => deplacerChamp(s, cleChamp(champ), 1))}
                    onSupprimer={() => handleSupprimer(champ)}
                    onModifier={(maj) => {
                      appliquer((s) => mettreAJourChamp(s, cleChamp(champ), maj))
                      // Si la clé du champ change (payload), suivre la sélection.
                      if (maj.champPayload && maj.champPayload !== champ.champPayload) {
                        setCleSelection(`${champ.etape}:${maj.champPayload}`)
                      }
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleAjouter(etape.cle)}
                className="mt-2 w-full border-2 border-dashed border-gray-300 hover:border-cb-accent hover:text-cb-accent text-gray-400 rounded-xl py-2.5 text-sm font-medium transition-colors cursor-pointer"
              >
                + Ajouter une question dans « {etape.titre} »
              </button>
            </section>
          )
        })}

        {/* Ajouter une étape entière au formulaire actif */}
        <button
          type="button"
          onClick={handleAjouterEtape}
          className="w-full border-2 border-dashed border-cb-accent/40 hover:border-cb-accent text-cb-accent rounded-xl py-3 text-sm font-semibold transition-colors cursor-pointer"
        >
          + Ajouter une étape à ce formulaire
        </button>
      </div>
      )}

      {/* Boîte de dialogue : saisie du token GitHub à la première publication */}
      {patVisible && (
        <div className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-bold text-cb-blue mb-2">Clé de publication GitHub</h3>
            <p className="text-sm text-gray-600 mb-4">
              Pour publier, collez la clé de publication qui vous a été transmise
              (elle reste sur cet ordinateur, uniquement pour cette session).
            </p>
            <input
              type="password"
              value={patSaisi}
              onChange={(e) => setPatSaisi(e.target.value)}
              placeholder="github_pat_…"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-cb-blue focus:ring-2 focus:ring-cb-blue/20 outline-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setPatVisible(false)}
                className="text-sm text-gray-500 px-3 py-2 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={patSaisi.trim().length < 10}
                onClick={() => {
                  setPatVisible(false)
                  publier(patSaisi.trim())
                }}
                className="text-sm font-semibold text-white bg-cb-blue hover:bg-cb-accent rounded-lg px-4 py-2 transition-colors cursor-pointer disabled:opacity-40"
              >
                Publier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * CadreChamp — Un champ du formulaire dans son cadre (style Jotform).
 *
 * Réordonnancement par GLISSER-DÉPOSER : on attrape la poignée (⠿) et on
 * dépose le champ où l'on veut ; un liseré indique la position d'insertion.
 * De petites flèches ↑↓ restent disponibles (précision + accessibilité
 * clavier). Cliquer le champ l'ouvre pour l'éditer.
 */
function CadreChamp({
  champ,
  schema,
  selectionne,
  premier,
  dernier,
  enGlissement,
  dropAvant,
  dropApres,
  onDragStartCarte,
  onDragOverCarte,
  onDropCarte,
  onDragEndCarte,
  onSelect,
  onMonter,
  onDescendre,
  onSupprimer,
  onModifier,
}) {
  return (
    <div className={enGlissement ? 'opacity-40' : ''}>
      {/* Liseré d'insertion AVANT ce champ */}
      <div className={`h-0.5 rounded-full mb-1 transition-colors ${dropAvant ? 'bg-cb-accent' : 'bg-transparent'}`} />

      <div
        className={`rounded-xl border-2 transition-all ${
          selectionne
            ? 'border-cb-accent bg-white shadow-md'
            : 'border-transparent bg-white hover:border-gray-200 shadow-sm'
        }`}
        /* Zone de dépôt : autorise le drop et calcule avant/après selon la position */
        onDragOver={(e) => {
          e.preventDefault()
          const r = e.currentTarget.getBoundingClientRect()
          onDragOverCarte(e.clientY < r.top + r.height / 2)
        }}
        onDrop={(e) => { e.preventDefault(); onDropCarte() }}
      >
        {/* Ligne : poignée (glisser) + flèches (précision) à gauche, aperçu cliquable à droite */}
        <div className="flex items-stretch">
          <div
            className="flex flex-col items-center justify-center gap-1 pl-2 pr-1 py-2 shrink-0"
            /* Toute la colonne gauche est la source du glisser-déposer */
            draggable
            onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStartCarte() }}
            onDragEnd={onDragEndCarte}
          >
            <span
              className="w-7 h-6 flex items-center justify-center text-gray-400 cursor-grab active:cursor-grabbing select-none"
              title="Glisser pour déplacer cette question où vous voulez"
              aria-hidden="true"
            >
              ⠿
            </span>
            <button
              type="button"
              onClick={onMonter}
              disabled={premier}
              className="w-7 h-6 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:border-cb-accent hover:text-cb-accent disabled:opacity-25 disabled:hover:border-gray-200 cursor-pointer disabled:cursor-not-allowed text-xs"
              title="Monter d'un cran"
              aria-label={`Monter la question ${champ.label}`}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={onDescendre}
              disabled={dernier}
              className="w-7 h-6 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:border-cb-accent hover:text-cb-accent disabled:opacity-25 disabled:hover:border-gray-200 cursor-pointer disabled:cursor-not-allowed text-xs"
              title="Descendre d'un cran"
              aria-label={`Descendre la question ${champ.label}`}
            >
              ↓
            </button>
          </div>

          {/* Zone cliquable : aperçu du champ tel qu'il apparaît dans le formulaire */}
          <div
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect()
              }
            }}
            className="flex-1 min-w-0 p-4 pl-2 cursor-pointer"
            aria-label={`Modifier la question ${champ.label}`}
            aria-expanded={selectionne}
          >
            <ApercuChamp champ={champ} />
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {champ.listeCible && champ.listeCible.trim() ? (
                <>
                  <span className="text-[11px] font-mono text-gray-400 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">
                    {champ.colonneSP}
                  </span>
                  <span className="text-[11px] text-gray-400">liste {champ.listeCible}</span>
                </>
              ) : (
                <span className="text-[11px] text-gray-400 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">
                  non enregistrée dans SharePoint
                </span>
              )}
              {champ.condition && (
                <span className="text-[11px] text-purple-500 bg-purple-50 border border-purple-100 rounded px-1.5 py-0.5">
                  si {champ.condition}
                </span>
              )}
              {champ.nouveau && (
                <span className="text-[11px] text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-1.5 py-0.5">
                  colonne SP à créer
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Barre d'outils + panneau de propriétés (champ sélectionné) */}
        {selectionne && (
          <div className="border-t border-gray-100">
            <div className="flex items-center gap-1 px-3 py-2 bg-gray-50/60">
              <span className="text-xs text-gray-400">Glissez la poignée ⠿ à gauche pour déplacer la question.</span>
              <button
                type="button"
                onClick={onSupprimer}
                className="ml-auto text-sm px-2.5 py-1 rounded-lg border border-red-200 text-cb-red bg-white hover:bg-red-50 cursor-pointer"
                title="Supprimer la question"
              >
                🗑 Supprimer
              </button>
            </div>
            <PanneauProprietes champ={champ} schema={schema} onModifier={onModifier} />
          </div>
        )}
      </div>

      {/* Liseré d'insertion APRÈS ce champ */}
      <div className={`h-0.5 rounded-full mt-1 transition-colors ${dropApres ? 'bg-cb-accent' : 'bg-transparent'}`} />
    </div>
  )
}

/**
 * ApercuChamp — Rendu du champ tel qu'il apparaîtra dans le formulaire.
 * Réutilise ChampsEtape, LE moteur des vrais formulaires : l'aperçu est
 * fidèle par construction, quel que soit le type (checkbox, multiselect,
 * nombre…). Les conditions d'options sont neutralisées pour montrer TOUTES
 * les options à l'éditrice (contexte pourQui=autre simulé).
 */
function ApercuChamp({ champ }) {
  const apercu = { ...champ, condition: null }
  return (
    <div className="pointer-events-none">
      <ChampsEtape
        champs={[apercu]}
        data={{}}
        errors={{}}
        onChange={() => {}}
        valeurs={{ pourQui: 'autre', parcours: 'stages' }}
      />
    </div>
  )
}

/** Ligne label + contrôle du panneau de propriétés. */
function Propriete({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-500 mb-1">{label}</span>
      {children}
    </label>
  )
}

const CLASSES_INPUT_PROP =
  'w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:border-cb-blue focus:ring-2 focus:ring-cb-blue/20 outline-none'

/**
 * PanneauProprietes — Édition des propriétés du champ sélectionné.
 * Les modifications s'appliquent immédiatement (l'aperçu au-dessus suit).
 */
function PanneauProprietes({ champ, schema, onModifier }) {
  const aOptions = champ.type === 'select' || champ.type === 'radio'
  // Une réponse est enregistrée en SharePoint ssi une liste cible est renseignée.
  // Sinon (case de consentement, texte informatif, doc renvoyé plus tard…) :
  // pas de colonne, pas d'identifiant à valider, pas de rappel de création.
  const stockeSP = !!(champ.listeCible && champ.listeCible.trim())
  const autresColonnes = stockeSP ? colonnesDeLaListe(schema, champ.listeCible, cleChamp(champ)) : []
  const validation = stockeSP ? validerColonneSP(champ.colonneSP, autresColonnes) : { valide: true, message: '' }

  return (
    <div className="px-4 py-4 grid gap-4 sm:grid-cols-2 bg-white rounded-b-xl">
      <div className="sm:col-span-2">
        <Propriete label="Question (label affiché)">
          <input
            type="text"
            value={champ.label}
            onChange={(e) => onModifier({ label: e.target.value })}
            className={CLASSES_INPUT_PROP}
          />
        </Propriete>
      </div>

      <Propriete label="Type de réponse">
        <select
          value={champ.type}
          onChange={(e) => {
            const type = e.target.value
            const maj = { type }
            // Nouveau type à options sans options existantes : en proposer deux.
            if ((type === 'select' || type === 'radio') && (!champ.options || champ.options.length === 0)) {
              maj.options = [
                { value: 'Oui', label: 'Oui' },
                { value: 'Non', label: 'Non' },
              ]
            }
            onModifier(maj)
          }}
          className={CLASSES_INPUT_PROP + ' cursor-pointer'}
        >
          {TYPES_CHAMP.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </Propriete>

      <Propriete label="Réponse obligatoire">
        <button
          type="button"
          onClick={() => onModifier({ obligatoire: !champ.obligatoire })}
          className={`w-full px-3 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
            champ.obligatoire
              ? 'border-cb-blue bg-cb-blue-light text-cb-blue'
              : 'border-gray-300 bg-white text-gray-500'
          }`}
        >
          {champ.obligatoire ? 'Oui — obligatoire *' : 'Non — facultative'}
        </button>
      </Propriete>

      {aOptions && (
        <div className="sm:col-span-2">
          <Propriete label="Choix proposés (un par ligne — « valeur | libellé affiché » si différents)">
            <textarea
              rows={Math.min(8, Math.max(3, (champ.options || []).length + 1))}
              value={optionsVersTexte(champ.options)}
              onChange={(e) => onModifier({ options: parserOptions(e.target.value) })}
              className={CLASSES_INPUT_PROP + ' font-mono text-xs resize-y'}
            />
          </Propriete>
          <p className="text-[11px] text-gray-400 mt-1">
            ⚠️ La <em>valeur</em> (avant le « | ») doit correspondre exactement au choix de la colonne SharePoint.
            Un 3<sup>e</sup> segment optionnel = condition d'affichage de l'option (ex. <code>Oui - curateur complète | Oui — c'est le curateur qui complète | pourQui=autre</code>).
          </p>
        </div>
      )}

      <Propriete label="Placeholder (texte gris d'exemple)">
        <input
          type="text"
          value={champ.placeholder || ''}
          onChange={(e) => onModifier({ placeholder: e.target.value })}
          className={CLASSES_INPUT_PROP}
        />
      </Propriete>

      <Propriete label="Aide (petit texte à droite du label)">
        <input
          type="text"
          value={champ.aide || ''}
          onChange={(e) => onModifier({ aide: e.target.value })}
          className={CLASSES_INPUT_PROP}
        />
      </Propriete>

      {/* Bloc technique : enregistrement SP (optionnel) + condition */}
      <div className="sm:col-span-2 border-t border-gray-100 pt-3 grid gap-4 sm:grid-cols-2">
        {/* Interrupteur : cette réponse va-t-elle dans SharePoint ? */}
        <div className="sm:col-span-2">
          <Propriete label="Réponse enregistrée dans SharePoint ?">
            <button
              type="button"
              onClick={() =>
                onModifier(stockeSP ? { listeCible: '', nouveau: undefined } : { listeCible: 'Stagiaire' })
              }
              className={`w-full px-3 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer text-left ${
                stockeSP ? 'border-cb-blue bg-cb-blue-light text-cb-blue' : 'border-gray-300 bg-white text-gray-500'
              }`}
            >
              {stockeSP
                ? 'Oui — la réponse est écrite dans une colonne SharePoint'
                : 'Non — pas de colonne (ex. case de consentement, texte informatif)'}
            </button>
          </Propriete>
          {!stockeSP && (
            <p className="text-[11px] text-gray-400 mt-1">
              La question s'affiche et peut rester obligatoire, mais sa réponse n'est pas stockée en base
              (utile pour une charte lue/renvoyée séparément, une consigne, une case « je m'engage à… »).
            </p>
          )}
        </div>

        {/* Identifiant + liste : seulement si la réponse est stockée */}
        {stockeSP && (
          <>
            <div>
              <Propriete label="Identifiant SharePoint (colonne)">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={champ.colonneSP}
                    onChange={(e) => onModifier({ colonneSP: e.target.value })}
                    className={`${CLASSES_INPUT_PROP} font-mono ${validation.valide ? '' : 'border-cb-red bg-red-50'}`}
                  />
                  <button
                    type="button"
                    onClick={() => onModifier({ colonneSP: suggererColonneSP(champ.label) })}
                    className="shrink-0 text-xs px-2 rounded-lg border border-gray-300 text-gray-500 hover:border-cb-accent hover:text-cb-accent cursor-pointer"
                    title="Proposer un identifiant à partir de la question"
                  >
                    Suggérer
                  </button>
                </div>
              </Propriete>
              {!validation.valide && (
                <p className="text-[11px] text-cb-red mt-1" role="alert">{validation.message}</p>
              )}
            </div>

            <Propriete label="Liste SharePoint alimentée">
              <input
                list="listes-sp-connues"
                value={champ.listeCible}
                onChange={(e) => onModifier({ listeCible: e.target.value.replace(/[^A-Za-z0-9]/g, '') })}
                className={CLASSES_INPUT_PROP}
                placeholder="Stagiaire, Demande… ou une nouvelle liste"
              />
              <datalist id="listes-sp-connues">
                {[...new Set([...LISTES_CIBLES, ...(schema.champs || []).map((c) => c.listeCible).filter(Boolean)])].map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
              {champ.listeCible && !LISTES_CIBLES.includes(champ.listeCible) && (
                <p className="text-[11px] text-amber-700 mt-1">Nouvelle liste — pensez à la créer dans SharePoint.</p>
              )}
            </Propriete>
          </>
        )}

        <div className="sm:col-span-2">
          <Propriete label="Condition d'affichage (avancé — laisser vide si toujours visible)">
            <input
              type="text"
              value={champ.condition || ''}
              onChange={(e) => onModifier({ condition: e.target.value || null })}
              placeholder="Ex : sous_curatelle=Oui*  ·  inscrit_ai!=Non  ·  parcours=stages"
              className={CLASSES_INPUT_PROP + ' font-mono text-xs'}
            />
          </Propriete>
        </div>
      </div>
    </div>
  )
}

export default EditeurFormulaires
