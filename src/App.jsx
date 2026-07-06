/**
 * App.jsx — Composant racine de l'application Calendrier Clair-Bois.
 *
 * Responsabilites :
 *  1. Charger le fichier planning.json au demarrage (une seule fois)
 *  2. Transformer les donnees brutes (format Power Automate) en structure hierarchique
 *  3. Gerer la navigation entre tous les ecrans via un systeme d'etat simple (pas de React Router)
 *
 * Le choix de useState plutot que React Router evite la gestion d'URL et simplifie
 * le deploiement sur GitHub Pages (pas de fallback 404 a configurer).
 *
 * Navigation (valeurs possibles de currentView) :
 *  - "home"               → HomePage             : choix du parcours
 *  - "etablissement"      → EtablissementPage    : choix du secteur dans un etablissement
 *  - "secteur"            → SecteurCalendar      : calendrier mensuel d'un secteur
 *  - "week"               → WeekDetail           : detail d'une semaine et inscription
 *  - "aiguillage"         → Aiguillage           : 2 questions avant stages ou modules
 *  - "modules"            → ModulesMetiers       : grille des modules semaine type
 *  - "stages"             → StagesPage           : calendrier stages par secteur
 *  - "formulaire"         → FormulaireInscription: formulaire integre (stages et modules)
 *  - "signalement"        → FormulaireSignalement: annulation ou retard
 *  - "visite"             → FormulaireVisite     : demande de visite (enseignants)
 *  - "cartographie-login" → CartographieLogin    : connexion requise avant la carto
 *  - "cartographie"       → Cartographie         : carte des sites (acces protege)
 */
import { useState, useEffect } from 'react'
import { transformPlanningData } from './utils/helpers'
import Header from './components/Header'
import HomePage from './components/HomePage'
import EtablissementPage from './components/EtablissementPage'
import SecteurCalendar from './components/SecteurCalendar'
import WeekDetail from './components/WeekDetail'
import ModulesMetiers from './components/ModulesMetiers'
import StagesPage from './components/StagesPage'
import Aiguillage from './components/Aiguillage'
import FormulaireInscription from './components/FormulaireInscription'
import FormulaireSignalement from './components/FormulaireSignalement'
import FormulaireVisite from './components/FormulaireVisite'
import Cartographie from './components/Cartographie'
import CartographieLogin from './components/CartographieLogin'
import Footer from './components/Footer'
import { setToken, clearToken, isAuthenticated } from './utils/cartoAuth'

function App() {
  /* --- Etat du chargement des donnees --- */
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /* --- Etat de la navigation entre ecrans --- */
  // Initialisation paresseuse : le hash #carto permet un lien direct vers la cartographie
  // (utile pour les admins qui bookmarkent la page). Le token est verifie immediatement
  // pour ne pas afficher le login si la session est deja active.
  const [currentView, setCurrentView] = useState(() => {
    if (window.location.hash === '#carto') {
      return isAuthenticated() ? 'cartographie' : 'cartographie-login'
    }
    return 'home'
  })
  const [selectedEtablissement, setSelectedEtablissement] = useState(null)
  const [selectedSecteur, setSelectedSecteur] = useState(null)
  const [selectedWeek, setSelectedWeek] = useState(null)
  /* --- Aiguillage : parcours choisi + réponses aux 2 questions --- */
  const [aiguillageParcours, setAiguillageParcours] = useState(null) // 'stages' | 'modules'
  const [chemin, setChemin] = useState(null) // { pourQui: 'moi'|'autre', dejaInscrit: bool }
  /* --- Formulaire intégré : contexte (secteur+dates ou modules+semaines) --- */
  const [formulaireContext, setFormulaireContext] = useState(null)
  // Contexte en attente quand l'utilisateur clique "S'inscrire" depuis WeekDetail :
  // on doit passer par l'aiguillage avant d'afficher le formulaire, donc on met
  // le contexte creneau en attente jusqu'a ce que l'aiguillage soit resolu.
  const [pendingWeekContext, setPendingWeekContext] = useState(null)
  /* --- Cartographie privee : etat d'authentification --- */
  const [cartoTokenValide, setCartoTokenValide] = useState(() => isAuthenticated())

  /**
   * Chargement initial de planning.json.
   * Le fichier est genere automatiquement par le Flux 3 Power Automate
   * et pousse sur GitHub. Le cache est desactive pour toujours obtenir
   * la version la plus recente.
   */
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'planning.json', { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error('Erreur lors du chargement des données')
        return res.json()
      })
      .then((json) => {
        // Transforme le format plat (Power Automate) en hierarchie etablissements > secteurs > semaines
        setData(transformPlanningData(json))
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  /* --- Fonctions de navigation ---
   * Chaque goTo* est un callback passe en prop aux composants enfants.
   * Ce pattern centralise toute la logique de navigation dans App pour
   * eviter que les enfants n'aient connaissance de la structure globale.
   */

  /** Retour a la page d'accueil et reinitialisation complete de tous les etats de selection */
  const goToHome = () => {
    setCurrentView('home')
    setSelectedEtablissement(null)
    setSelectedSecteur(null)
    setSelectedWeek(null)
    setAiguillageParcours(null)
    setChemin(null)
  }

  /** Selection d'un etablissement → affiche ses secteurs */
  const goToEtablissement = (etab) => {
    setSelectedEtablissement(etab)
    setSelectedSecteur(null)
    setSelectedWeek(null)
    setCurrentView('etablissement')
  }

  /** Selection d'un secteur → affiche le calendrier mensuel */
  const goToSecteur = (secteur) => {
    setSelectedSecteur(secteur)
    setSelectedWeek(null)
    setCurrentView('secteur')
  }

  /** Selection d'une semaine → affiche le detail avec bouton d'inscription */
  const goToWeek = (week) => {
    setSelectedWeek(week)
    setCurrentView('week')
  }

  /** Retour au niveau etablissement (depuis le calendrier) */
  const goBackToEtablissement = () => {
    setSelectedSecteur(null)
    setSelectedWeek(null)
    setCurrentView('etablissement')
  }

  /** Retour au calendrier (depuis le detail semaine) */
  const goBackToSecteur = () => {
    setSelectedWeek(null)
    setCurrentView('secteur')
  }

  /** Navigation vers les modules metiers (passe d'abord par l'aiguillage) */
  const goToModules = () => {
    setAiguillageParcours('modules')
    setChemin(null)
    setCurrentView('aiguillage')
    setSelectedEtablissement(null)
    setSelectedSecteur(null)
    setSelectedWeek(null)
  }

  /** Navigation vers les stages (passe d'abord par l'aiguillage) */
  const goToStages = () => {
    setAiguillageParcours('stages')
    setChemin(null)
    setCurrentView('aiguillage')
    setSelectedEtablissement(null)
    setSelectedSecteur(null)
    setSelectedWeek(null)
  }

  /**
   * Inscription depuis WeekDetail : met le contexte creneau en attente,
   * puis passe par l'aiguillage. Une fois les 2 questions repondues,
   * handleAiguillageResult recupere pendingWeekContext pour afficher le formulaire.
   */
  const goToAiguillageFromWeek = (creneau) => {
    setPendingWeekContext({
      secteur: selectedSecteur.name,
      dateDebut: creneau.startDate,
      dateFin: creneau.endDate,
    })
    setAiguillageParcours('stages')
    setChemin(null)
    setCurrentView('aiguillage')
  }

  /**
   * Callback declenche a la fin de l'aiguillage.
   * Si un contexte semaine etait en attente (pendingWeekContext), on va directement
   * au formulaire. Sinon on affiche la liste stages ou modules selon le parcours choisi.
   */
  const handleAiguillageResult = (result) => {
    setChemin(result)
    if (pendingWeekContext) {
      setFormulaireContext(pendingWeekContext)
      setPendingWeekContext(null)
      setCurrentView('formulaire')
    } else {
      setCurrentView(aiguillageParcours) // 'stages' ou 'modules'
    }
  }

  /** Navigation vers le formulaire de signalement d'urgence */
  const goToSignalement = () => {
    setCurrentView('signalement')
  }

  /** Navigation vers le formulaire de demande de visite */
  const goToVisite = () => {
    setCurrentView('visite')
  }

  /**
   * Navigation vers la cartographie privee.
   * Verifie le token : si valide, affiche directement la carto ;
   * sinon, affiche d'abord la page de connexion.
   */
  const goToCartographie = () => {
    if (isAuthenticated()) {
      setCartoTokenValide(true)
      setCurrentView('cartographie')
    } else {
      setCartoTokenValide(false)
      setCurrentView('cartographie-login')
    }
  }

  /** Callback succes du login carto : stocke le token et passe a la vue carto */
  const handleCartoLogin = (token) => {
    setToken(token)
    setCartoTokenValide(true)
    setCurrentView('cartographie')
  }

  /** Deconnexion explicite depuis la carto : efface le token et retour accueil */
  const handleCartoLogout = () => {
    clearToken()
    setCartoTokenValide(false)
    setCurrentView('home')
  }

  /** Navigation vers le formulaire intégré (depuis StagesPage ou ModulesMetiers) */
  const goToFormulaire = (contextData) => {
    setFormulaireContext(contextData)
    setCurrentView('formulaire')
  }

  /**
   * Retour depuis le formulaire vers la page precedente.
   * Si l'utilisateur venait de WeekDetail, on y retourne ; sinon on revient
   * sur la liste stages ou modules selon le parcours en cours.
   */
  const goBackFromFormulaire = () => {
    setFormulaireContext(null)
    setCurrentView(selectedWeek ? 'week' : aiguillageParcours)
  }

  /* --- Ecran de chargement (spinner) --- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cb-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement du calendrier...</p>
        </div>
      </div>
    )
  }

  /* --- Ecran d'erreur (si planning.json inaccessible) --- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-red-200 max-w-md">
          <p className="text-cb-red font-semibold mb-2">Erreur de chargement</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-cb-blue text-white rounded-lg hover:bg-cb-blue/90 transition-colors cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  /* --- Rendu principal : header + ecran actif selon currentView --- */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header organization={data.organization} />

      <main className="max-w-5xl mx-auto px-4 py-6 flex-1">
        {/* Ecran 1 : Page d'accueil — choix du parcours */}
        {currentView === 'home' && (
          <HomePage data={data} onGoToModules={goToModules} onGoToStages={goToStages} onGoToSignalement={goToSignalement} onGoToVisite={goToVisite} />
        )}

        {/* Ecran 2 : Page etablissement — choix du secteur */}
        {currentView === 'etablissement' && selectedEtablissement && (
          <EtablissementPage
            etablissement={selectedEtablissement}
            formsUrlNouveauSecteur={data.formsUrlNouveauSecteur}
            onSelectSecteur={goToSecteur}
            onBack={goToHome}
          />
        )}

        {/* Ecran 3 : Calendrier mensuel du secteur */}
        {currentView === 'secteur' && selectedEtablissement && selectedSecteur && (
          <SecteurCalendar
            etablissement={selectedEtablissement}
            secteur={selectedSecteur}
            formsUrlNouveauSecteur={data.formsUrlNouveauSecteur}
            onSelectWeek={goToWeek}
            onBackToEtablissement={goBackToEtablissement}
            onBackToHome={goToHome}
          />
        )}

        {/* Ecran 4 : Detail de la semaine + bouton d'inscription */}
        {currentView === 'week' && selectedEtablissement && selectedSecteur && selectedWeek && (
          <WeekDetail
            etablissement={selectedEtablissement}
            secteur={selectedSecteur}
            week={selectedWeek}
            onInscription={goToAiguillageFromWeek}
            onBackToCalendar={goBackToSecteur}
            onBackToEtablissement={goBackToEtablissement}
            onBackToHome={goToHome}
          />
        )}

        {/* Ecran Aiguillage : 2 questions avant Stages/Modules */}
        {currentView === 'aiguillage' && aiguillageParcours && (
          <Aiguillage
            parcours={aiguillageParcours}
            onResult={handleAiguillageResult}
            onBack={goToHome}
          />
        )}

        {/* Ecran 5 : Modules metiers — grille semaine type */}
        {currentView === 'modules' && data.modulesMetiers && chemin && (
          <ModulesMetiers
            modulesMetiers={data.modulesMetiers}
            formsUrl={data.formsUrl}
            chemin={chemin}
            onBack={goToHome}
            onGoToFormulaire={goToFormulaire}
          />
        )}

        {/* Ecran 6 : Stages — choix secteur + calendrier dates */}
        {currentView === 'stages' && chemin && (
          <StagesPage
            formsUrl={data.formsUrl}
            chemin={chemin}
            onBack={goToHome}
            onGoToFormulaire={goToFormulaire}
          />
        )}

        {/* Ecran 7 : Signalement d'urgence (annulation / retard) */}
        {currentView === 'signalement' && (
          <FormulaireSignalement onGoHome={goToHome} />
        )}

        {/* Ecran 9 : Demande de visite (enseignants) */}
        {currentView === 'visite' && (
          <FormulaireVisite onGoHome={goToHome} />
        )}

        {/* Ecran 8a : Page de connexion a la cartographie privee */}
        {currentView === 'cartographie-login' && (
          <CartographieLogin onLogin={handleCartoLogin} onCancel={goToHome} />
        )}

        {/* Ecran 8b : Cartographie des sites (acces protege par mot de passe) */}
        {currentView === 'cartographie' && cartoTokenValide && (
          <Cartographie onGoHome={goToHome} onLogout={handleCartoLogout} />
        )}

        {/* Ecran 8 : Formulaire intégré */}
        {currentView === 'formulaire' && chemin && formulaireContext && (
          <FormulaireInscription
            parcours={aiguillageParcours}
            chemin={chemin}
            contextData={formulaireContext}
            onBack={goBackFromFormulaire}
            onGoHome={goToHome}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
