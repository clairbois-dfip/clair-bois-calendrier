/**
 * EtapeDeclaration.jsx — Déclaration sur l'honneur + charte.
 *
 * Dernière étape avant le récapitulatif.
 * 2 cases à cocher obligatoires (conformes aux Forms Karavia).
 */
import ChampFormulaire from './ChampFormulaire'

export default function EtapeDeclaration({ data, errors, onChange }) {
  return (
    <div className="space-y-5">
      <div className="bg-cb-blue-light/50 rounded-lg p-3 text-sm text-cb-blue">
        Avant de finaliser votre demande, veuillez prendre connaissance des engagements suivants.
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={data.declaration_charte === 'Oui'}
            onChange={(e) => onChange('declaration_charte', e.target.checked ? 'Oui' : '')}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-cb-blue focus:ring-cb-blue cursor-pointer"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900">
            En cochant la présente, je déclare que le ou la stagiaire a lu la{' '}
            <strong>Charte pour la prévention des abus sexuels, de la maltraitance et d'autres formes de violation de l'intégrité</strong>.
          </span>
        </label>
        {errors.declaration_charte && (
          <p className="text-xs text-cb-red flex items-center gap-1 ml-7">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.declaration_charte}
          </p>
        )}

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={data.declaration_engagement === 'Oui'}
            onChange={(e) => onChange('declaration_engagement', e.target.checked ? 'Oui' : '')}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-cb-blue focus:ring-cb-blue cursor-pointer"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900">
            En cochant la présente, je déclare que le ou la stagiaire s'engage à lire, signer et nous envoyer la{' '}
            <strong>Déclaration d'engagement personnelle</strong> par courriel.
          </span>
        </label>
        {errors.declaration_engagement && (
          <p className="text-xs text-cb-red flex items-center gap-1 ml-7">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.declaration_engagement}
          </p>
        )}
      </div>
    </div>
  )
}
