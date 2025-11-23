import React, { useRef, useState } from 'react';
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
import { apiUpload } from '../config'; // ← Importer apiUpload directement
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    university: user?.university || '',
    studyLevel: user?.studyLevel || '',
    budget: user?.budget || 0,
    preferences: user?.preferences || [],
    cinNumber: user?.cinNumber || '',
    cinVerified: user?.cinVerified || false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      if (updateProfile) {
        await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
        university: formData.university,
        studyLevel: formData.studyLevel,
        budget: Number(formData.budget) || 0,
        } as any);
      }
      setIsEditing(false);
    } catch (error) {
      // toast handled in context
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const [isUploading, setIsUploading] = useState(false);

  const uploadImageToServer = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const data = await apiUpload('/api/upload/image', formData);
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de l\'upload');
      }
      
      return data.data?.url || data.data?.path || '';
    } catch (error: any) {
      console.error('Erreur upload:', error);
      throw new Error(error.message || 'Erreur lors de l\'upload');
    }
  };

  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) { 
      toast.error(`${file.name} n'est pas une image valide`); 
      return; 
    }
    
    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) { 
      toast.error(`${file.name} est trop volumineux (max 5MB)`); 
      return; 
    }
    
    setIsUploading(true);
    const toastId = 'avatar-upload';
    
    try {
      toast.loading('Téléchargement de la photo...', { id: toastId });
      
      // Télécharger l'image
      const url = await uploadImageToServer(file);
      
      if (!url) {
        throw new Error('Aucune URL valide retournée après l\'upload');
      }
      
      console.log('URL de l\'image uploadée:', url);
      
      // Mettre à jour le profil avec la nouvelle URL d'avatar
      if (updateProfile) {
        console.log('Mise à jour du profil avec l\'URL:', url);
        await updateProfile({ avatar: url });
        if (user) {
          setUser({ ...user, avatar: url });
        }
      }
      
      toast.success('Photo de profil mise à jour avec succès', { id: toastId });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'avatar:', error);
      
      // Afficher un message d'erreur plus détaillé
      let errorMessage = 'Échec du téléchargement de la photo';
      
      if (error.message) {
        if (error.message.includes('400') || error.message.includes('Bad Request')) {
          errorMessage = 'Erreur de validation. Veuillez réessayer avec une autre image.';
        } else if (error.message.includes('413') || error.message.includes('trop volumineux')) {
          errorMessage = 'L\'image est trop volumineuse. Taille maximale: 5MB';
        } else if (error.message.includes('500') || error.message.includes('Erreur serveur')) {
          errorMessage = 'Erreur du serveur. Veuillez réessayer plus tard.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage, { id: toastId, duration: 5000 });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      preferences: user?.preferences || [],
      cinNumber: user?.cinNumber || '',
      cinVerified: user?.cinVerified || false
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

  // Calcul de la complétion du profil (même logique que dans DashboardPage)
  const hasBasicInfo = !!(user.firstName && user.lastName && user.phone);
  const hasAvatar = !!user.avatar;
  const hasBio = !!user.bio;
  const hasCin = !!user.cinVerified;

  const stepsTotal = 4;
  const completedSteps = [hasBasicInfo, hasAvatar, hasBio, hasCin].filter(Boolean).length;
  const profileCompletion = Math.round((completedSteps / stepsTotal) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white text-gray-900 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-white rounded-full overflow-hidden flex items-center justify-center">
                    {isUploading ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    ) : user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to default avatar if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/default-avatar.png';
                        }}
                      />
                    ) : (
                      <UserIcon className="w-12 h-12 text-primary-600" />
                    )}
                  </div>
                  <button 
                    onClick={handleAvatarClick} 
                    disabled={isUploading}
                    className={`absolute bottom-0 right-0 ${isUploading ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'} text-white p-2 rounded-full transition-colors`}
                  >
                    {isUploading ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <CameraIcon className="w-4 h-4" />
                    )}
                  </button>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp" 
                    className="hidden" 
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                  />
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
                <div className="card bg-white border border-gray-200">
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
                        <p className="text-gray-700">{user.bio || 'Aucune description disponible'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Statut CIN
                      </label>
                      <div className="flex items-center space-x-2">
                        {user.cinVerified ? (
                          <span className="badge badge-success">✓ CIN Vérifiée</span>
                        ) : user.cinPending ? (
                          <div className="flex items-center space-x-2">
                            <span className="badge badge-info">⏳ Vérification en cours</span>
                            <span className="text-sm text-gray-600">
                              En attente de validation par un administrateur
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="badge badge-warning">CIN Non vérifiée</span>
                            <Link
                              to="/cin-verification"
                              className="font-medium underline text-yellow-700 hover:text-yellow-600"
                            >
                              Vérifier maintenant →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations spécifiques aux étudiants */}
                {user.userType === 'student' && (
                  <div className="card bg-white border border-gray-200">
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
                <div className="card bg-white text-gray-900 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Membre depuis</span>
                      <span className="font-medium">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profil complété</span>
                      <span className="font-medium">{profileCompletion}%</span>
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
                  <div className="card bg-white text-gray-900 border border-gray-200">
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