/**
 * App.jsx — Composant racine de l'application Calendrier Clair-Bois.
 *
 * Responsabilites :
 *  1. Charger le fichier planning.json au demarrage (une seule fois)
 *  2. Transformer les donnees brutes (format Power Automate) en structure hierarchique
 *  3. Gerer la navigation entre les 4 ecrans via un systeme d'etat simple
 *
 * Navigation (sans React Router, geree par useState) :
 *  - "home"          → HomePage           : choix de l'etablissement
 *  - "etablissement" → EtablissementPage  : choix du secteur
 *  - "secteur"       → SecteurCalendar    : calendrier mensuel
 *  - "week"          → WeekDetail         : detail d'une semaine + inscription
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

function App() {
  /* --- Etat du chargement des donnees --- */
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /* --- Etat de la navigation entre ecrans --- */
  const [currentView, setCurrentView] = useState('home')
  const [selectedEtablissement, setSelectedEtablissement] = useState(null)
  const [selectedSecteur, setSelectedSecteur] = useState(null)
  const [selectedWeek, setSelectedWeek] = useState(null)
  /* --- Aiguillage : parcours choisi + réponses aux 2 questions --- */
  const [aiguillageParcours, setAiguillageParcours] = useState(null) // 'stages' | 'modules'
  const [chemin, setChemin] = useState(null) // { pourQui: 'moi'|'autre', dejaInscrit: bool }

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

  /* --- Fonctions de navigation --- */

  /** Retour a la page d'accueil (reinitialise toutes les selections) */
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

  /** Callback quand l'aiguillage est terminé → affiche le bon composant */
  const handleAiguillageResult = (result) => {
    setChemin(result)
    setCurrentView(aiguillageParcours) // 'stages' ou 'modules'
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
    <div className="min-h-screen bg-gray-50">
      <Header organization={data.organization} />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Ecran 1 : Page d'accueil — choix du parcours */}
        {currentView === 'home' && (
          <HomePage data={data} onGoToModules={goToModules} onGoToStages={goToStages} />
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
            formsUrl={data.formsUrl}
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
          />
        )}

        {/* Ecran 6 : Stages — choix secteur + calendrier dates */}
        {currentView === 'stages' && chemin && (
          <StagesPage
            formsUrl={data.formsUrl}
            chemin={chemin}
            onBack={goToHome}
          />
        )}
      </main>
    </div>
  )
}

export default App
