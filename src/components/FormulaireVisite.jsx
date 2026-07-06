/**
 * FormulaireVisite.jsx — Formulaire de demande de visite pour enseignants.
 *
 * Formulaire autonome, hors du flux multi-etapes d'inscription.
 * Destine aux enseignants ou educateurs qui souhaitent faire visiter
 * la fondation a leur classe avant d'envisager un stage.
 * Contrairement au signalement, il n'y a pas de mode demo : VITE_PA_HTTP_URL
 * doit etre configure pour que l'envoi fonctionne.
 *
 * Logique conditionnelle notable :
 *   contactAI s'affiche uniquement si demandeAI = "validee", car les
 *   coordonnees du conseiller ne sont pertinentes qu'a ce stade avance.
 *   La validation cote client reflete cette meme regle (voir validateAll).
 *
 * Sections : coordonnees, groupe, secteurs d'interet (multi-select), contexte projet
 *
 * Props :
 *   onGoHome — retour a la page d'accueil apres envoi ou annulation
 */
import { useState } from 'react'
import ChampFormulaire from './formulaire/ChampFormulaire'
import Confirmation from './formulaire/Confirmation'
import { validateRequired, validatePhone, validateEmail } from '../utils/validation'

const SECTEURS_OPTIONS = [
  'ASA', 'ASE', 'ASSC', 'Cuisine', 'Restauration', 'Pâtisserie-boulangerie',
  'Nettoyage', 'Exploitation', 'Peinture', 'Graphisme', 'Audio-visuel',
  'Médiamatique', 'Intendance', 'Lingerie', 'Informatique', 'Confection', 'Autre',
]

const AVANCEMENT_OPTIONS = [
  { value: 'debut',    label: 'Début — exploration des possibilités' },
  { value: 'en-cours', label: 'En cours — quelques pistes identifiées' },
  { value: 'plusieurs-cibles', label: 'Plusieurs cibles — comparaison en cours' },
  { value: 'avance',   label: 'Avancé — piste solide, orientation proche' },
]

const AI_OPTIONS = [
  { value: 'non-faite', label: 'Non faite' },
  { value: 'en-cours',  label: 'En cours' },
  { value: 'validee',   label: 'Validée' },
]

const VALIDATORS = {
  nom:          validateRequired,
  prenom:       validateRequired,
  fonction:     validateRequired,
  etablissement: validateRequired,
  email:        validateEmail,
  tel:          validatePhone,
  nbEleves:     (v) => v && parseInt(v) > 0 ? { valid: true } : { valid: false, message: 'Nombre requis' },
  nbEnseignants:(v) => v && parseInt(v) > 0 ? { valid: true } : { valid: false, message: 'Nombre requis' },
  avancement:   validateRequired,
  demandeAI:    validateRequired,
}

const INITIAL_DATA = {
  nom: '', prenom: '', fonction: '', etablissement: '',
  email: '', tel: '',
  nbEleves: '', nbEnseignants: '',
  profilEleves: '',
  secteursInteret: [],
  stagesAnterieurs: '',
  avancement: '',
  demandeAI: '',
  contactAI: '',
}

export default function FormulaireVisite({ onGoHome }) {
  const [formData, setFormData] = useState({ ...INITIAL_DATA })
  const [errors, setErrors]     = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null)

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleBlur = (name) => {
    const validator = VALIDATORS[name]
    if (validator) {
      const result = validator(formData[name])
      if (!result.valid) setErrors(prev => ({ ...prev, [name]: result.message }))
    }
  }

  // Bascule l'inclusion d'un secteur dans la selection multiple
  const toggleSecteur = (secteur) => {
    setFormData(prev => {
      const list = prev.secteursInteret
      return {
        ...prev,
        secteursInteret: list.includes(secteur)
          ? list.filter(s => s !== secteur)
          : [...list, secteur],
      }
    })
  }

  const validateAll = () => {
    const newErrors = {}
    let valid = true
    for (const [field, validator] of Object.entries(VALIDATORS)) {
      const result = validator(formData[field])
      if (!result.valid) { newErrors[field] = result.message; valid = false }
    }
    // contactAI n'est obligatoire que si la demande AI est deja validee
    if (formData.demandeAI === 'validee' && !formData.contactAI.trim()) {
      newErrors.contactAI = 'Coordonnées requises si demande validée'
      valid = false
    }
    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async () => {
    if (!validateAll()) return
    setIsSubmitting(true)
    try {
      const httpUrl = import.meta.env.VITE_PA_HTTP_URL
      if (!httpUrl) throw new Error('URL non configurée')
      const response = await fetch(httpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'visite', ...formData }),
      })
      if (!response.ok) throw new Error(`Erreur ${response.status}`)
      setSubmitResult('success')
    } catch {
      setSubmitResult('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitResult) {
    return (
      <div className="animate-fadeIn">
        <Confirmation result={submitResult} onGoHome={onGoHome} onRetry={() => setSubmitResult(null)} />
      </div>
    )
  }

  return (
    <div className="animate-fadeIn -mx-4 -mt-6 -mb-6 px-4 pt-6 pb-10 min-h-screen"
         style={{ background: 'linear-gradient(160deg, #e3ecfa 0%, #e4f0ea 30%, #f0f5ea 50%, #e8f0f8 80%, #dce8f5 100%)' }}>

      <button
        onClick={onGoHome}
        className="inline-flex items-center gap-2 text-sm font-medium text-white bg-cb-blue
                   hover:bg-cb-blue/90 px-4 py-2 rounded-lg transition-colors cursor-pointer mt-6 mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour à l'accueil
      </button>

      {/* En-tête */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-cb-blue-light rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-cb-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Demande de visite
        </h2>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          Vous souhaitez faire visiter la Fondation Clair Bois à votre classe ?
          Remplissez ce formulaire et nous vous recontacterons.
        </p>
      </div>

      {/* Section 1 — Coordonnées */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 mb-4 shadow-sm max-w-lg mx-auto">
        <h3 className="text-sm font-bold text-cb-blue uppercase tracking-wide mb-4">Vos coordonnées</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ChampFormulaire label="Nom" name="nom" value={formData.nom}
              onChange={handleChange} onBlur={handleBlur} error={errors.nom} required placeholder="Dupont" />
            <ChampFormulaire label="Prénom" name="prenom" value={formData.prenom}
              onChange={handleChange} onBlur={handleBlur} error={errors.prenom} required placeholder="Marie" />
          </div>
          <ChampFormulaire label="Fonction" name="fonction" value={formData.fonction}
            onChange={handleChange} onBlur={handleBlur} error={errors.fonction} required
            placeholder="Enseignant·e spécialisé·e, éducateur·trice…" />
          <ChampFormulaire label="Établissement / École" name="etablissement" value={formData.etablissement}
            onChange={handleChange} onBlur={handleBlur} error={errors.etablissement} required
            placeholder="École de la Jonction, Centre ORIF…" />
          <div className="grid grid-cols-2 gap-4">
            <ChampFormulaire label="Email" name="email" type="email" value={formData.email}
              onChange={handleChange} onBlur={handleBlur} error={errors.email} required
              placeholder="marie.dupont@edu.ge.ch" />
            <ChampFormulaire label="Téléphone" name="tel" type="tel" value={formData.tel}
              onChange={handleChange} onBlur={handleBlur} error={errors.tel} required
              placeholder="+41 79 123 45 67" helpText="Format suisse" />
          </div>
        </div>
      </div>

      {/* Section 2 — Le groupe */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 mb-4 shadow-sm max-w-lg mx-auto">
        <h3 className="text-sm font-bold text-cb-blue uppercase tracking-wide mb-4">Le groupe</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ChampFormulaire label="Nombre d'élèves" name="nbEleves" type="number" value={formData.nbEleves}
              onChange={handleChange} onBlur={handleBlur} error={errors.nbEleves} required placeholder="12" />
            <ChampFormulaire label="Enseignants accompagnants" name="nbEnseignants" type="number"
              value={formData.nbEnseignants} onChange={handleChange} onBlur={handleBlur}
              error={errors.nbEnseignants} required placeholder="2" />
          </div>
          <ChampFormulaire label="Profil des élèves" name="profilEleves" type="textarea"
            value={formData.profilEleves} onChange={handleChange}
            placeholder="Âge, besoins particuliers, contexte de formation… (facultatif)" />
        </div>
      </div>

      {/* Section 3 — Secteurs d'intérêt */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 mb-4 shadow-sm max-w-lg mx-auto">
        <h3 className="text-sm font-bold text-cb-blue uppercase tracking-wide mb-1">Secteurs d'intérêt</h3>
        <p className="text-xs text-gray-400 mb-4">Sélectionnez un ou plusieurs secteurs (facultatif)</p>
        <div className="flex flex-wrap gap-2">
          {SECTEURS_OPTIONS.map((s) => {
            const selected = formData.secteursInteret.includes(s)
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSecteur(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all cursor-pointer
                  ${selected
                    ? 'bg-cb-blue border-cb-blue text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-cb-blue/40'}`}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>

      {/* Section 4 — Contexte du projet */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 mb-4 shadow-sm max-w-lg mx-auto">
        <h3 className="text-sm font-bold text-cb-blue uppercase tracking-wide mb-4">Contexte du projet de formation</h3>
        <div className="space-y-4">
          <ChampFormulaire
            label="Stages antérieurs à Clair Bois ou ailleurs ?"
            name="stagesAnterieurs"
            type="radio-group"
            value={formData.stagesAnterieurs}
            onChange={handleChange}
            options={[{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }]}
          />
          <ChampFormulaire
            label="Où en est le projet de formation ?"
            name="avancement"
            type="select"
            value={formData.avancement}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.avancement}
            required
            options={AVANCEMENT_OPTIONS}
            placeholder="Sélectionnez une étape"
          />
          <ChampFormulaire
            label="Demande AI (Assurance Invalidité)"
            name="demandeAI"
            type="select"
            value={formData.demandeAI}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.demandeAI}
            required
            options={AI_OPTIONS}
            placeholder="Sélectionnez un statut"
          />
          {/* Champ conditionnel : visible seulement si demandeAI = "validee"
              pour ne pas demander une info inexistante a ce stade */}
          {formData.demandeAI === 'validee' && (
            <ChampFormulaire
              label="Coordonnées de la conseillère AI"
              name="contactAI"
              value={formData.contactAI}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.contactAI}
              required
              placeholder="Nom, téléphone ou email"
            />
          )}
        </div>
      </div>

      {/* Bouton envoi */}
      <div className="flex justify-center max-w-lg mx-auto">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-cb-accent text-white rounded-lg font-medium
                     hover:bg-cb-accent/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed w-full justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Envoyer ma demande de visite
            </>
          )}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">
          Questions ?{' '}
          <a href="mailto:dfip@clairbois.ch" className="text-cb-blue hover:underline">
            dfip@clairbois.ch
          </a>
        </p>
      </div>
    </div>
  )
}
