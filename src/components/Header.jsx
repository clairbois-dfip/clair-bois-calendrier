/**
 * Header.jsx — En-tete principal du site.
 * Affiche le logo officiel Clair-Bois et le nom de la fondation.
 * Present sur tous les ecrans de l'application.
 *
 * @param {Object} props.organization - Informations de la fondation { name, logo, description }
 */
export default function Header({ organization }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
        <img
          src={`${import.meta.env.BASE_URL}logo-clairbois.png`}
          alt="Logo Fondation Clair Bois"
          className="h-12 w-auto shrink-0"
        />
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">
            {organization?.name || 'Fondation Clair Bois'}
          </h1>
          <p className="text-sm text-gray-500 hidden sm:block">
            Plateforme d'inscription — Stages et modules métiers
          </p>
        </div>
      </div>
    </header>
  )
}
