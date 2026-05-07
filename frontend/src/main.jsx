/**
 * Point d'entree de l'application React — Calendrier Clair-Bois.
 * Monte le composant racine <App /> dans l'element #root du index.html.
 * StrictMode active les verifications supplementaires en developpement.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
