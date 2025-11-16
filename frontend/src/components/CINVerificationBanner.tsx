// CINVerificationBanner.tsx - version persistante
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IdentificationIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';

const CINVerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = React.useState(true);

  // Déterminer si l'utilisateur est vérifié (serveur)
  const isUserVerified = React.useMemo(() => {
    if (!user) return false;
    // Considère l'utilisateur vérifié si le compte est vérifié OU la CIN est vérifiée
    return Boolean(user.isVerified) || Boolean((user as any).is_verified) || Boolean(user.cinVerified) || Boolean((user as any).cin_verified);
  }, [user]);

  // Vérification en attente
  const isVerificationPending = React.useMemo(() => {
    if (!user || isUserVerified) return false;
    return Boolean((user as any).cinPending) || Boolean((user as any).cin_verification_requested_at);
  }, [user, isUserVerified]);

  // Charger la visibilité depuis localStorage et nettoyer si vérifié
  React.useEffect(() => {
    if (!user) return;
    const key = `banner_hidden_${user.id}`;
    const hidden = localStorage.getItem(key);
    if (isUserVerified) {
      // Si l'utilisateur est vérifié côté serveur, on force l'affichage à false
      // et on nettoie le cache local pour ne pas influencer d'autres sessions
      localStorage.removeItem(key);
      setIsVisible(false);
      return;
    }
    if (hidden === 'true') setIsVisible(false);
  }, [user, isUserVerified]);

  // Fonction de fermeture persistante
  const handleClose = () => {
    if (user) {
      localStorage.setItem(`banner_hidden_${user.id}`, 'true');
    }
    setIsVisible(false);
  };

  // Masquer si pas connecté, vérifié (serveur) ou invisible
  if (!user || isUserVerified || !isVisible) {
    return null;
  }

  // Banner "en attente"
  if (isVerificationPending) {
    return (
      <div className="fixed top-16 left-0 right-0 z-40 bg-blue-50 border-l-4 border-blue-400 p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-blue-400" />
            <p className="ml-3 text-sm text-blue-700">
              <strong>Vérification en cours :</strong> Votre demande est en attente de validation.
              {' '}
              <Link to="/profile" className="font-medium underline text-blue-700 hover:text-blue-600">
                Voir mon profil →
              </Link>
            </p>
          </div>
          <button onClick={handleClose} className="ml-auto pl-3">
            <XMarkIcon className="h-5 w-5 text-blue-400 hover:text-blue-600" />
          </button>
        </div>
      </div>
    );
  }

  // Banner "vérification requise"
  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-yellow-50 border-l-4 border-yellow-400 p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <IdentificationIcon className="h-5 w-5 text-yellow-400" />
          <p className="ml-3 text-sm text-yellow-700">
            <strong>Vérification requise :</strong> Veuillez vérifier votre carte d’identité.
            {' '}
            <Link to="/cin-verification" className="font-medium underline text-yellow-700 hover:text-yellow-600">
              Vérifier maintenant →
            </Link>
          </p>
        </div>
        <button onClick={handleClose} className="ml-auto pl-3">
          <XMarkIcon className="h-5 w-5 text-yellow-400 hover:text-yellow-600" />
        </button>
      </div>
    </div>
  );
};

export default CINVerificationBanner;
