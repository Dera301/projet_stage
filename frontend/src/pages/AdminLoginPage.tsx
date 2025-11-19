import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import SimpleCaptcha from '../components/SimpleCaptcha';
import toast from 'react-hot-toast';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Rediriger si l'utilisateur est déjà connecté et est admin
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    if (user.userType === 'admin') {
      setIsLoading(false);
      navigate('/admin', { replace: true });
    } else {
      setIsLoading(false);
      navigate('/', { replace: true });
      toast.error('Accès refusé. Vous devez être administrateur.');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaVerified) {
      toast.error('Veuillez compléter le CAPTCHA');
      return;
    }
    
    setIsLoading(true);

    try {
      await login(email, password);
      // La redirection sera gérée automatiquement par le useEffect qui surveille user
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la connexion');
      setIsLoading(false);
    }
    // Note: setIsLoading(false) sera appelé après la redirection ou en cas d'erreur
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShieldCheckIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-900">
            Connexion Administrateur
          </h2>
          <p className="mt-2 text-center text-sm text-dark-600">
            Accès réservé aux administrateurs
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-900">
                Adresse email administrateur
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field mt-1"
                placeholder="admin@coloc.tana"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-900">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-dark-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-dark-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 mb-2">
              Vérification CAPTCHA *
            </label>
            <SimpleCaptcha onVerify={setCaptchaVerified} />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !captchaVerified}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-dark-500">
            Vous n'êtes pas administrateur ?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
              Aller à la connexion utilisateur
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

