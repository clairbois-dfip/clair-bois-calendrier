/**
 * Breadcrumb.jsx — Fil d'Ariane cliquable.
 * Affiche le chemin de navigation actuel (ex: Accueil > Blanchisserie > Lavage).
 * Les elements avec un onClick sont cliquables pour remonter dans la hierarchie.
 * Le dernier element (sans onClick) est affiche en gras comme page courante.
 *
 * @param {Array} props.items - Tableau d'objets { label: string, onClick?: function }
 */
export default function Breadcrumb({ items, onNavigate }) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {/* Separateur entre les niveaux */}
            {index > 0 && <span className="mx-1">/</span>}
            {item.onClick ? (
              /* Niveau cliquable (permet de remonter dans la navigation) */
              <button
                onClick={item.onClick}
                className="hover:text-cb-blue hover:underline transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ) : (
              /* Niveau actuel (non cliquable, en gras) */
              <span className="text-gray-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
