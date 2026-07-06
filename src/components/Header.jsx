/**
 * Header.jsx — En-tete principal du site.
 * Affiche le logo officiel et le nom de la fondation.
 * Present sur tous les ecrans de l'application.
 *
 * La prop `organization` est passee depuis App.jsx apres le chargement de planning.json.
 * Elle permet d'afficher le nom tel qu'il est configure dans les donnees source
 * plutot qu'en dur dans le code, ce qui facilite la maintenance si le libelle change.
 * La valeur de repli garantit un affichage coherent pendant le chargement initial.
 *
 * @param {Object} props.organization        - Informations issues de planning.json
 * @param {string} props.organization.name   - Nom de la fondation a afficher dans le h1
 */
export default function Header({ organization }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
        {/* Le logo est servi depuis le dossier public via BASE_URL pour compatibilite GitHub Pages */}
        <img
          src={`${import.meta.env.BASE_URL}logo-clairbois.png`}
          alt="Logo Fondation Clair Bois"
          className="h-12 w-auto shrink-0"
        />
        <div>
          {/* Valeur de repli si organization n'est pas encore charge */}
          <h1 className="text-lg md:text-xl font-bold text-gray-900">
            {organization?.name || 'Fondation Clair Bois'}
          </h1>
          {/* Sous-titre masque sur mobile pour eviter l'encombrement */}
          <p className="text-sm text-gray-500 hidden sm:block">
            Plateforme d'inscription — Stages et modules métiers
          </p>
        </div>
      </div>
    </header>
  )
}
