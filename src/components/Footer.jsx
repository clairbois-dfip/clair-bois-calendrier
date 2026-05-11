/**
 * Footer.jsx — Pied de page du site, coherent avec clairbois.ch.
 * Fond sombre (#434343), texte clair, colonnes identiques au site officiel.
 */
export default function Footer() {
  return (
    <footer className="bg-[#434343] text-gray-300 mt-12">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <h3 className="text-white font-semibold mb-2">Fondation Clair Bois</h3>
            <p className="text-sm leading-relaxed">
              Rte de la Galaise 17a<br />
              1228 Plan-Les-Ouates
            </p>
            <p className="text-sm mt-1.5">Tél. 022 884 38 80</p>
            <a
              href="https://clairbois.ch/politique-de-confidentialite/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors mt-2 inline-block"
            >
              Politique de confidentialité
            </a>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Foyers et Ecoles</h3>
            <ul className="text-sm space-y-0.5">
              <li>Clair Bois-Chambésy</li>
              <li>Clair Bois-Lancy</li>
              <li>Clair Bois-Gradelle</li>
              <li>Clair Bois-Minoteries</li>
              <li>Clair Bois-Pinchat</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Entreprises sociales</h3>
            <ul className="text-sm space-y-0.5">
              <li>Ateliers graphisme et vidéo</li>
              <li>Blanchisserie Pinchat</li>
              <li>Blanchisserie Tourbillon</li>
              <li>Restaurant Clair d'arve</li>
              <li>Restaurant Clair de lune</li>
              <li>Traiteur</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
