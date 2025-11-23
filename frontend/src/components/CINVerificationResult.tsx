// src/components/CINVerificationResult.tsx
import React from 'react';
import { CINData } from '../services/cinVerificationService';

interface CINVerificationResultProps {
  cinData?: CINData; // Rendre optionnel
  confidence: number;
  validationErrors: string[];
  onConfirm: () => void;
  onRetry: () => void;
}

const CINVerificationResult: React.FC<CINVerificationResultProps> = ({
  cinData,
  confidence,
  validationErrors,
  onConfirm,
  onRetry
}) => {
  // Données par défaut si cinData est undefined
  const safeCINData: CINData = cinData || {
    numeroCIN: 'Non disponible',
    nom: 'Non disponible',
    prenoms: 'Non disponible',
    dateNaissance: 'Non disponible',
    lieuNaissance: 'Non disponible',
    adresse: 'Non disponible',
    profession: 'Non disponible',
    pere: 'Non disponible',
    mere: 'Non disponible',
    dateDelivrance: 'Non disponible',
    lieuDelivrance: 'Non disponible',
  };

  const isSuccess = validationErrors.length === 0 && confidence >= 70;

  // Fonction utilitaire pour déterminer la classe CSS en fonction de la valeur du champ
  const getFieldClassName = (value: string) => {
    if (value.includes('Non disponible') || value.includes('Erreur') || value.includes('À extraire')) {
      return 'text-orange-600 bg-orange-50';
    }
    return 'text-gray-900 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className={`text-center mb-6 p-4 rounded-lg ${
        isSuccess ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <h3 className={`text-xl font-bold ${
          isSuccess ? 'text-green-900' : 'text-yellow-900'
        }`}>
          {isSuccess ? '✅ Vérification réussie !' : '⚠️ Vérification nécessite attention'}
        </h3>
        <p className={`mt-2 ${isSuccess ? 'text-green-700' : 'text-yellow-700'}`}>
          {isSuccess 
            ? 'Votre CIN a été vérifiée avec succès. Vous pouvez maintenant publier des annonces.'
            : 'Des problèmes ont été détectés lors de la vérification.'
          }
        </p>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-4">
        📋 Données extraites de votre CIN
      </h3>

      {/* Affichage des données extraites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Numéro CIN</label>
          <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
            {safeCINData.numeroCIN}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <p className={`mt-1 text-sm p-2 rounded ${getFieldClassName(safeCINData.nom)}`}>
            {safeCINData.nom}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Prénoms</label>
          <p className={`mt-1 text-sm p-2 rounded ${getFieldClassName(safeCINData.prenoms)}`}>
            {safeCINData.prenoms}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
          <p className={`mt-1 text-sm p-2 rounded ${getFieldClassName(safeCINData.dateNaissance)}`}>
            {safeCINData.dateNaissance}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Lieu de naissance</label>
          <p className={`mt-1 text-sm p-2 rounded ${getFieldClassName(safeCINData.lieuNaissance)}`}>
            {safeCINData.lieuNaissance}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Adresse</label>
          <p className={`mt-1 text-sm p-2 rounded ${getFieldClassName(safeCINData.adresse)}`}>
            {safeCINData.adresse}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Profession</label>
          <p className={`mt-1 text-sm p-2 rounded ${getFieldClassName(safeCINData.profession)}`}>
            {safeCINData.profession}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Père</label>
          <p className={`mt-1 text-sm p-2 rounded ${getFieldClassName(safeCINData.pere)}`}>
            {safeCINData.pere}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Mère</label>
          <p className={`mt-1 text-sm p-2 rounded ${getFieldClassName(safeCINData.mere)}`}>
            {safeCINData.mere}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Date délivrance</label>
          <p className={`mt-1 text-sm p-2 rounded ${getFieldClassName(safeCINData.dateDelivrance)}`}>
            {safeCINData.dateDelivrance}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Lieu délivrance</label>
          <p className={`mt-1 text-sm p-2 rounded ${getFieldClassName(safeCINData.lieuDelivrance)}`}>
            {safeCINData.lieuDelivrance}
          </p>
        </div>
      </div>

      {/* Score de confiance */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Score de confiance de l'IA: {confidence.toFixed(1)}%
          </label>
          <span className={`text-xs font-medium px-2 py-1 rounded ${
            confidence >= 80 ? 'bg-green-100 text-green-800' :
            confidence >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
          }`}>
            {confidence >= 80 ? 'Excellent' : confidence >= 60 ? 'Bon' : 'Faible'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full ${
              confidence >= 80 ? 'bg-green-500' : 
              confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${confidence}%` }}
          ></div>
        </div>
      </div>

      {/* Erreurs de validation */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Problèmes détectés:
          </h4>
          <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Légende pour les couleurs */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Légende:
        </h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2"></div>
            <span className="text-gray-700">Donnée extraite</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded mr-2"></div>
            <span className="text-orange-700">Donnée manquante ou erreur d'extraction</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-4 pt-4 border-t border-gray-200">
        <button
          onClick={onRetry}
          className="flex-1 btn-secondary flex items-center justify-center space-x-2"
        >
          <span>📸</span>
          <span>Reprendre les photos</span>
        </button>
        
        <button
          onClick={onConfirm}
          className={`flex-1 flex items-center justify-center space-x-2 ${
            isSuccess 
              ? 'btn-primary' 
              : 'bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50'
          }`}
        >
          <span>{isSuccess ? '✅' : '⚠️'}</span>
          <span>{isSuccess ? 'Confirmer et continuer' : 'Continuer malgré les erreurs'}</span>
        </button>
      </div>
    </div>
  );
};

export default CINVerificationResult;