import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CINVerificationResult {
  isVerified: boolean;
  isPending: boolean;
  requiresVerification: boolean;
  showVerificationModal: boolean;
  setShowVerificationModal: (show: boolean) => void;
  checkVerification: (e?: React.MouseEvent) => boolean;
  onClickHandler: (e: React.MouseEvent, path: string) => void;
}

export const useCINVerification = (): CINVerificationResult => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  const isVerified = user?.cinVerified || user?.cin_verified || false;
  const isPending = user?.cinPending || !!user?.cin_verification_requested_at;
  const requiresVerification = user?.userType === 'owner' && !isVerified && !isPending;

  // Vérifier la vérification CIN si nécessaire
  const checkVerification = useCallback((e?: React.MouseEvent): boolean => {
    if (e) {
      e.preventDefault();
    }
    
    // Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return false;
    }
    
    // Vérifier si la vérification CIN est requise
    if (requiresVerification) {
      setShowVerificationModal(true);
      return false;
    }
    
    // Si l'utilisateur est connecté et vérifié, on retourne true
    return true;
  }, [requiresVerification, user, navigate]);

  return {
    isVerified,
    isPending,
    requiresVerification,
    showVerificationModal,
    setShowVerificationModal,
    checkVerification,
    // Ajout d'un gestionnaire de clic pour les liens
    onClickHandler: (e: React.MouseEvent, path: string) => {
      if (checkVerification(e)) {
        navigate(path);
      }
    }
  };
};

export default useCINVerification;
