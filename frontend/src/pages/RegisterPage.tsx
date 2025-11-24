import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import SimpleCaptcha from '../components/SimpleCaptcha';

const logoSrc = `${process.env.PUBLIC_URL}/logo_colo.svg`;

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'student' as 'student' | 'owner',
    university: '',
    studyLevel: '',
    budget: 0,
    profileImage: null as File | null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'budget' ? Number(value) : value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        profileImage: e.target.files[0]
      });
    }
  };

  const validateEmail = async (email: string): Promise<boolean> => {
    // 1. Vérification basique du format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    const [localPart, domain] = email.split('@');

    // 2. Longueur raisonnable de la partie locale (avant @)
    if (!localPart || localPart.length < 3 || localPart.length > 64) {
      return false;
    }

    // 3. Quelques cas invalides simples
    if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
      return false;
    }

    // 4. Vérifier si c'est un email Google (Gmail)
    const normalizedDomain = domain?.toLowerCase();
    const googleDomains = ['gmail.com', 'googlemail.com'];

    if (googleDomains.includes(normalizedDomain || '')) {
      // Ici on ne peut PAS vérifier réellement si l'adresse existe côté client.
      // En production, cette vérification doit être faite côté backend via un service tiers ou Google API.
      return true;
    }

    // 5. Pour les autres domaines, on reste sur les vérifications de format
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaVerified) {
      toast.error('Veuillez compléter la vérification CAPTCHA');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await register(registerData);
      
      if (response?.success && response.pendingId) {
        toast.success('Un code de vérification a été envoyé à votre adresse email');
        navigate(`/verify-account?pendingId=${response.pendingId}&email=${encodeURIComponent(formData.email)}`);
        return;
      }

      if (response?.success) {
        toast.success('Verifiez votre boite mail pour finaliser votre compte.');
        navigate('/verify-account');
      }
    } catch (error) {
      // L'erreur est déjà gérée dans le contexte
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img src={logoSrc} alt="ColocAntananarivo" className="h-12 w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Type d'utilisateur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Je suis un(e) :
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative">
                  <input
                    type="radio"
                    name="userType"
                    value="student"
                    checked={formData.userType === 'student'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.userType === 'student' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-900">Étudiant(e)</div>
                      <div className="text-sm text-gray-500">Je cherche un logement</div>
                    </div>
                  </div>
                </label>
                <label className="relative">
                  <input
                    type="radio"
                    name="userType"
                    value="owner"
                    checked={formData.userType === 'owner'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.userType === 'owner' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-900">Propriétaire</div>
                      <div className="text-sm text-gray-500">Je loue un logement</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Numéro de téléphone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="+261 34 12 345 67"
              />
            </div>

            {/* Photo de profil */}
            <div>
              <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">
                Photo de profil (optionnel)
              </label>
              <input
                id="profileImage"
                name="profileImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input-field mt-1"
              />
              {formData.profileImage && (
                <p className="text-xs text-gray-500 mt-1">{formData.profileImage.name}</p>
              )}
            </div>

            {/* Champs spécifiques aux étudiants */}
            {formData.userType === 'student' && (
              <>
                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                    Université / École
                  </label>
                  <select
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className="input-field mt-1"
                  >
                    <option value="">Sélectionnez votre université</option>
                    <option value="Université d'Antananarivo">Université d'Antananarivo</option>
                    <option value="École Supérieure Polytechnique">École Supérieure Polytechnique</option>
                    <option value="Institut National des Sciences Comptables">Institut National des Sciences Comptables</option>
                    <option value="École de Médecine">École de Médecine</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="studyLevel" className="block text-sm font-medium text-gray-700">
                    Niveau d'études
                  </label>
                  <select
                    id="studyLevel"
                    name="studyLevel"
                    value={formData.studyLevel}
                    onChange={handleChange}
                    className="input-field mt-1"
                  >
                    <option value="">Sélectionnez votre niveau</option>
                    <option value="Licence 1">Licence 1</option>
                    <option value="Licence 2">Licence 2</option>
                    <option value="Licence 3">Licence 3</option>
                    <option value="Master 1">Master 1</option>
                    <option value="Master 2">Master 2</option>
                    <option value="Doctorat">Doctorat</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                    Budget mensuel (Ar) *
                  </label>
                  <input
                    id="budget"
                    name="budget"
                    type="number"
                    required
                    min="0"
                    value={formData.budget || ''}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="150000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Votre budget mensuel pour la colocation</p>
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Confirmez votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              J'accepte les{' '}
              <Link
                to="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-500"
              >
                conditions d'utilisation
              </Link>{' '}
              et la{' '}
              <Link
                to="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-500"
              >
                politique de confidentialité
              </Link>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vérification CAPTCHA *
            </label>
            <SimpleCaptcha onVerify={setCaptchaVerified} />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création du compte...
                </div>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
