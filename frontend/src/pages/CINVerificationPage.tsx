// src/pages/CINVerificationPage.tsx - version simplifiée
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  CameraIcon,
  CheckCircleIcon,
  IdentificationIcon,
  ArrowLeftIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CINVerificationPage: React.FC = () => {
  const { verifyCIN, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cinNumber: '',
    cinRectoImage: null as File | null,
    cinVersoImage: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rectoPreview, setRectoPreview] = useState<string | null>(null);
  const [versoPreview, setVersoPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'cinRectoImage' | 'cinVersoImage') => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image valide (JPG, PNG)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, [field]: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (field === 'cinRectoImage') {
          setRectoPreview(e.target?.result as string);
        } else {
          setVersoPreview(e.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cinNumber || !formData.cinRectoImage || !formData.cinVersoImage) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (!/^\d{12}$/.test(formData.cinNumber)) {
      toast.error('Le numéro CIN doit contenir exactement 12 chiffres');
      return;
    }

    setIsLoading(true);
    try {
      await verifyCIN({
        cinNumber: formData.cinNumber,
        cinRectoImage: formData.cinRectoImage,
        cinVersoImage: formData.cinVersoImage,
      });
      
      // Attendre un peu pour que le toast s'affiche
      setTimeout(() => {
        setIsLoading(false);
        navigate('/dashboard');
      }, 1000);
      
    } catch (error: any) {
      setIsLoading(false);
      toast.error(error.message || 'Erreur lors de la vérification');
    }
  };

  const removeImage = (field: 'cinRectoImage' | 'cinVersoImage') => {
    setFormData(prev => ({ ...prev, [field]: null }));
    if (field === 'cinRectoImage') {
      setRectoPreview(null);
    } else {
      setVersoPreview(null);
    }
  };

  if (user?.cinVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Vérification CIN Réussie
          </h2>
          <p className="text-gray-600 mb-6">
            Votre carte d'identité nationale a été vérifiée avec succès.
            Vous pouvez maintenant publier des annonces.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Vérification de votre CIN
          </h1>
          <p className="text-gray-600 mt-2">
            Pour publier des annonces, nous devons vérifier votre identité en scannant les deux côtés de votre CIN
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-8">
            <IdentificationIcon className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">
              Vérification d'identité
            </h2>
            <p className="text-gray-600 mt-2">
              Téléchargez les photos des deux côtés de votre CIN
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Numéro CIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de CIN *
              </label>
              <input
                type="text"
                value={formData.cinNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, cinNumber: e.target.value }))}
                className="input-field"
                placeholder="Ex: 123456789012"
                required
                maxLength={12}
                pattern="\d{12}"
                title="Le numéro CIN doit contenir 12 chiffres"
              />
              <p className="text-xs text-gray-500 mt-1">
                Doit contenir exactement 12 chiffres
              </p>
            </div>

            {/* Photo du recto de la CIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo du recto de votre CIN *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'cinRectoImage')}
                  className="hidden"
                  id="cinRectoImage"
                  required
                />
                {rectoPreview ? (
                  <div className="relative">
                    <img
                      src={rectoPreview}
                      alt="Preview recto CIN"
                      className="mx-auto h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage('cinRectoImage')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <CameraIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="cinRectoImage" className="cursor-pointer block">
                    <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Cliquez pour télécharger une photo du recto de votre CIN
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Côté avec votre photo et informations personnelles
                    </p>
                  </label>
                )}
              </div>
            </div>

            {/* Photo du verso de la CIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo du verso de votre CIN *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'cinVersoImage')}
                  className="hidden"
                  id="cinVersoImage"
                  required
                />
                {versoPreview ? (
                  <div className="relative">
                    <img
                      src={versoPreview}
                      alt="Preview verso CIN"
                      className="mx-auto h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage('cinVersoImage')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <CameraIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="cinVersoImage" className="cursor-pointer block">
                    <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Cliquez pour télécharger une photo du verso de votre CIN
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Côté avec les informations complémentaires
                    </p>
                  </label>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Instructions importantes
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Assurez-vous que les deux photos soient nettes et lisibles</li>
                <li>• Téléchargez le recto (côté photo) et le verso de votre CIN</li>
                <li>• Utilisez un fond neutre et un bon éclairage</li>
                <li>• Évitez les reflets sur la carte</li>
                <li>• Format accepté : JPG, PNG (max 5MB)</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 btn-secondary"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.cinNumber || !formData.cinRectoImage || !formData.cinVersoImage}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Vérification en cours...</span>
                  </>
                ) : (
                  <>
                    <DocumentIcon className="w-5 h-5" />
                    <span>Vérifier ma CIN</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CINVerificationPage;