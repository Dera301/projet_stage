import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserIcon, 
  PencilIcon, 
  CameraIcon,
  PhoneIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    university: user?.university || '',
    studyLevel: user?.studyLevel || '',
    budget: user?.budget || 0,
    preferences: user?.preferences || []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      // Simulation de la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profil mis à jour avec succès !');
      setIsEditing(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      university: user?.university || '',
      studyLevel: user?.studyLevel || '',
      budget: user?.budget || 0,
      preferences: user?.preferences || []
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-primary-600" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors">
                    <CameraIcon className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-primary-100">
                    {user.userType === 'student' ? 'Étudiant(e)' : 'Propriétaire'}
                  </p>
                  {user.isVerified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                      ✓ Compte vérifié
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-primary-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <PencilIcon className="w-4 h-4" />
                <span>{isEditing ? 'Annuler' : 'Modifier'}</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Informations personnelles */}
              <div className="lg:col-span-2 space-y-6">
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="input-field"
                          />
                        ) : (
                          <p className="text-gray-900">{user.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="input-field"
                          />
                        ) : (
                          <p className="text-gray-900">{user.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="flex items-center space-x-2">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="input-field"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <PhoneIcon className="w-5 h-5 text-gray-400" />
                          <p className="text-gray-900">{user.phone}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        À propos de moi
                      </label>
                      {isEditing ? (
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          rows={4}
                          className="input-field"
                          placeholder="Parlez-nous de vous..."
                        />
                      ) : (
                        <p className="text-gray-900">{user.bio || 'Aucune description disponible'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informations spécifiques aux étudiants */}
                {user.userType === 'student' && (
                  <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations académiques</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Université / École
                        </label>
                        {isEditing ? (
                          <select
                            name="university"
                            value={formData.university}
                            onChange={handleChange}
                            className="input-field"
                          >
                            <option value="">Sélectionnez votre université</option>
                            <option value="Université d'Antananarivo">Université d'Antananarivo</option>
                            <option value="École Supérieure Polytechnique">École Supérieure Polytechnique</option>
                            <option value="Institut National des Sciences Comptables">Institut National des Sciences Comptables</option>
                            <option value="École de Médecine">École de Médecine</option>
                            <option value="Autre">Autre</option>
                          </select>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                            <p className="text-gray-900">{user.university || 'Non spécifié'}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Niveau d'études
                        </label>
                        {isEditing ? (
                          <select
                            name="studyLevel"
                            value={formData.studyLevel}
                            onChange={handleChange}
                            className="input-field"
                          >
                            <option value="">Sélectionnez votre niveau</option>
                            <option value="Licence 1">Licence 1</option>
                            <option value="Licence 2">Licence 2</option>
                            <option value="Licence 3">Licence 3</option>
                            <option value="Master 1">Master 1</option>
                            <option value="Master 2">Master 2</option>
                            <option value="Doctorat">Doctorat</option>
                          </select>
                        ) : (
                          <p className="text-gray-900">{user.studyLevel || 'Non spécifié'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Budget mensuel (Ar)
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="150000"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                            <p className="text-gray-900">{user.budget ? `${user.budget.toLocaleString()} Ar` : 'Non spécifié'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Statistiques */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Membre depuis</span>
                      <span className="font-medium">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profil complété</span>
                      <span className="font-medium">85%</span>
                    </div>
                    {user.userType === 'student' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recherches</span>
                        <span className="font-medium">12</span>
                      </div>
                    )}
                    {user.userType === 'owner' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Logements publiés</span>
                        <span className="font-medium">3</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Préférences */}
                {user.userType === 'student' && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Préférences</h3>
                    <div className="space-y-2">
                      {user.preferences && user.preferences.length > 0 ? (
                        user.preferences.map((preference, index) => (
                          <span key={index} className="badge badge-primary">
                            {preference}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">Aucune préférence définie</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {isEditing && (
                  <div className="card">
                    <div className="space-y-3">
                      <button
                        onClick={handleSave}
                        className="w-full btn-primary"
                      >
                        Sauvegarder
                      </button>
                      <button
                        onClick={handleCancel}
                        className="w-full btn-secondary"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
