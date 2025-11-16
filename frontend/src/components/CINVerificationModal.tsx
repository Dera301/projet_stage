import React from 'react';
import { XMarkIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface CINVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
}

const CINVerificationModal: React.FC<CINVerificationModalProps> = ({
  isOpen,
  onClose,
  showBackButton = true,
  backButtonText = 'Retour',
  onBackClick
}) => {
  
  const handleClose = () => {
    onClose();
  };

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <IdentificationIcon className="h-8 w-8 text-yellow-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Vérification Requise
          </h3>
          
          <p className="text-gray-600 mb-6">
            Vous devez vérifier votre CIN avant de pouvoir accéder à cette fonctionnalité.
          </p>
          
          <div className="space-y-3">
            <Link
              to="/cin-verification"
              onClick={onClose}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Vérifier mon CIN
            </Link>
            
            {showBackButton && (
              <button
                type="button"
                onClick={handleBack}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {backButtonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CINVerificationModal;
