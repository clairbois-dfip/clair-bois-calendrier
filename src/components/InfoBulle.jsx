/**
 * InfoBulle.jsx — Tooltip d'information contextuelle.
 *
 * Petit cercle "?" qui affiche une bulle d'explication au survol (desktop)
 * ou au clic (mobile). Utilisee a cote des boutons "Ajouter" pour informer
 * que l'action est reservee aux referents cadres et protegee par mot de passe.
 *
 * Comportement :
 *  - Desktop : apparait au survol (mouseEnter/mouseLeave)
 *  - Mobile  : apparait au clic, se ferme au clic en dehors
 *  - Position : au-dessus de l'icone, centree horizontalement
 *
 * @param {ReactNode} props.children - Contenu HTML de la bulle
 */
import { useState, useRef, useEffect } from 'react'

export default function InfoBulle({ children }) {
  const [visible, setVisible] = useState(false)
  const bulleRef = useRef(null)

  // Fermer la bulle quand l'utilisateur clique en dehors (mobile)
  useEffect(() => {
    if (!visible) return
    const handleClickOutside = (e) => {
      if (bulleRef.current && !bulleRef.current.contains(e.target)) {
        setVisible(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [visible])

  return (
    <span className="relative inline-flex" ref={bulleRef}>
      {/* Icone "?" declencheur */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setVisible(!visible)
        }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="w-5 h-5 rounded-full bg-gray-200 hover:bg-cb-blue/20 text-gray-400
                   hover:text-cb-blue flex items-center justify-center text-xs font-bold
                   transition-colors cursor-pointer focus:outline-none focus:ring-2
                   focus:ring-cb-blue focus:ring-offset-1"
        aria-label="Plus d'informations"
      >
        ?
      </button>

      {/* Bulle d'information (positionnee au-dessus) */}
      {visible && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                      w-64 p-3 bg-gray-900 text-white text-xs leading-relaxed
                      rounded-lg shadow-lg animate-fadeIn"
          role="tooltip"
        >
          {children}
          {/* Fleche pointant vers le bas */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                          border-l-[6px] border-l-transparent
                          border-r-[6px] border-r-transparent
                          border-t-[6px] border-t-gray-900" />
        </div>
      )}
    </span>
  )
}
