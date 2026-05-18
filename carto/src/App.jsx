// Composant racine — navigation par state React (sans router externe)
import { useState } from 'react'
import PasswordPage from './components/PasswordPage.jsx'
import BoardView from './components/BoardView.jsx'
import SecteurView from './components/SecteurView.jsx'

// Vues disponibles : 'login' | 'board' | 'secteur'
export default function App() {
  const [vue, setVue] = useState('login')
  const [secteurActif, setSecteurActif] = useState(null)

  // Ouvrir la vue détaillée d'un secteur
  function ouvrirSecteur(secteur) {
    setSecteurActif(secteur)
    setVue('secteur')
  }

  // Retourner au board principal
  function retourBoard() {
    setSecteurActif(null)
    setVue('board')
  }

  return (
    <div className="min-h-screen font-['Open_Sans']">
      {vue === 'login' && (
        <PasswordPage onAcces={() => setVue('board')} />
      )}
      {vue === 'board' && (
        <BoardView onOuvrirSecteur={ouvrirSecteur} onDeconnexion={() => setVue('login')} />
      )}
      {vue === 'secteur' && (
        <SecteurView secteur={secteurActif} onRetour={retourBoard} />
      )}
    </div>
  )
}
