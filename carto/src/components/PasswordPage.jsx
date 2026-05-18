// Page de connexion — accès protégé par mot de passe
// Mot de passe en dur (usage interne uniquement) : "clairbois2026"
import { useState } from 'react'

export default function PasswordPage({ onAcces }) {
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState(false)

  function handleSoumission(e) {
    e.preventDefault()
    if (motDePasse === 'clairbois2026') {
      setErreur(false)
      onAcces()
    } else {
      setErreur(true)
      setMotDePasse('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#092C6A]">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-sm flex flex-col items-center gap-6">

        {/* Logo / Identité */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-16 h-16 rounded-full bg-[#092C6A] flex items-center justify-center">
            <span className="text-white font-bold text-2xl select-none">CB</span>
          </div>
          <h1 className="text-[#092C6A] text-xl font-bold leading-tight">
            Fondation Clair Bois
          </h1>
          <p className="text-gray-500 text-sm">
            Cartographie des places de stage
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSoumission} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="mot-de-passe"
              className="text-sm font-semibold text-gray-700"
            >
              Mot de passe
            </label>
            <input
              id="mot-de-passe"
              type="password"
              value={motDePasse}
              onChange={(e) => {
                setMotDePasse(e.target.value)
                setErreur(false)
              }}
              placeholder="Entrez le mot de passe"
              autoFocus
              className={`
                w-full px-4 py-2.5 rounded-lg border text-sm
                focus:outline-none focus:ring-2 focus:ring-[#2EA3F2]
                transition-colors
                ${erreur
                  ? 'border-[#E74C3C] bg-red-50 text-[#E74C3C]'
                  : 'border-gray-300 bg-white text-gray-800'
                }
              `}
            />
            {erreur && (
              <p className="text-[#E74C3C] text-xs mt-0.5">
                Mot de passe incorrect. Réessayez.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="
              w-full py-2.5 rounded-lg
              bg-[#092C6A] hover:bg-[#2EA3F2]
              text-white font-semibold text-sm
              transition-colors duration-200
              cursor-pointer
            "
          >
            Accéder
          </button>
        </form>

        {/* Pied de page discret */}
        <p className="text-gray-400 text-xs text-center">
          Accès réservé au personnel interne
        </p>
      </div>
    </div>
  )
}
