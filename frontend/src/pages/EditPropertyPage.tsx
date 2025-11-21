// EditPropertyPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Ajouter Link
import { useProperty } from '../contexts/PropertyContext';
import { useAuth } from '../contexts/AuthContext';
import { Property } from '../types';
import { apiUpload, getImageUrl } from '../config';
import { 
  PhotoIcon,
  ArrowLeftIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'; // Supprimer les icônes inutilisées
import toast from 'react-hot-toast';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

const EditPropertyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProperties, fetchPropertyById, loading } = useProperty();
  const { user } = useAuth();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    district: '',
    price: 0,
    deposit: 0,
    availableRooms: 1,
    totalRooms: 1,
    propertyType: 'apartment' as 'apartment' | 'house' | 'studio', // Corriger le type
    amenities: [] as string[],
    images: [] as string[],
    isAvailable: true,
    latitude: 0,
    longitude: 0
  });

  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const districts = [
    'Analakely', 'Ambohijatovo', 'Ankadifotsy', 'Ankatso', 'Antaninarenina',
    'Behoririka', 'Isoraka', 'Mahamasina', 'Tsaralalana', '67ha'
  ];

  // Supprimer amenitiesOptions non utilisé
  const propertyTypes = [
    { value: 'apartment', label: 'Appartement' },
    { value: 'house', label: 'Maison' },
    { value: 'studio', label: 'Studio' }
  ];

  // Charger la propriété à modifier
  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return;

      try {
        // Chercher d'abord dans les propriétés de l'utilisateur
        let propertyData = userProperties.find(p => p.id === id);
        
        // Si pas trouvé, charger depuis l'API
        if (!propertyData) {
          const fetchedProperty = await fetchPropertyById(id);
          propertyData = fetchedProperty || undefined;
        }

        if (propertyData) {
          setProperty(propertyData);
          setFormData({
            title: propertyData.title || '',
            description: propertyData.description || '',
            address: propertyData.address || '',
            district: propertyData.district || '',
            price: propertyData.price || 0,
            deposit: propertyData.deposit || 0,
            availableRooms: propertyData.availableRooms || 1,
            totalRooms: propertyData.totalRooms || 1,
            propertyType: propertyData.propertyType || 'apartment',
            amenities: propertyData.amenities || [],
            images: propertyData.images || [],
            isAvailable: propertyData.isAvailable !== false,
            latitude: propertyData.latitude || 0,
            longitude: propertyData.longitude || 0
          });
          setExistingImages(propertyData.images || []);
        } else {
          toast.error('Propriété non trouvée');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        toast.error('Erreur lors du chargement de la propriété');
        navigate('/dashboard');
      }
    };

    loadProperty();
  }, [id, userProperties, fetchPropertyById, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : name === 'price' || name === 'deposit' || name === 'availableRooms' || name === 'totalRooms' || name === 'latitude' || name === 'longitude'
        ? Number(value) 
        : value
    }));
  };

  // Supprimer handleAmenityChange non utilisé

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} n'est pas une image valide`);
        continue;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} est trop volumineux (max 5MB)`);
        continue;
      }
      
      if (imageFiles.length + newImages.length >= 10) {
        toast.error('Maximum 10 images autorisées');
        break;
      }
      
      const imageFile: ImageFile = {
        file: file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9)
      };
      
      newImages.push(imageFile);
    }
    
    if (newImages.length > 0) {
      setImageFiles(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} image(s) ajoutée(s) avec succès`);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(imageFiles[index].preview);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    toast.success('Image supprimée');
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    toast.success('Image supprimée');
  };

  // Fonction pour uploader les nouvelles images
  const uploadNewImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];
    
    setIsUploading(true);
    try {
      const uploadImageToServer = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('image', file);
        
        try {
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

      const uploadPromises = imageFiles.map(img => uploadImageToServer(img.file));
      const newImageUrls = await Promise.all(uploadPromises);
      
      // Filtrer les URLs nulles ou undefined
      const validImageUrls = newImageUrls.filter(url => url && url !== '');
      
      if (validImageUrls.length > 0) {
        toast.success(`${validImageUrls.length} image(s) uploadée(s) avec succès`);
      }
      
      return validImageUrls;
    } catch (error: any) {
      console.error('Erreur upload:', error);
      toast.error(`Erreur lors de l'upload des images: ${error.message}`);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!user || !property) {
    toast.error('Erreur: utilisateur non connecté ou propriété non chargée');
    return;
  }

  // Validation
  if (!formData.title.trim()) {
    toast.error('Le titre est requis');
    return;
  }
  
  if (!formData.description.trim()) {
    toast.error('La description est requise');
    return;
  }
  
  if (!formData.address.trim()) {
    toast.error('L\'adresse est requise');
    return;
  }
  
  if (!formData.district) {
    toast.error('Le quartier est requis');
    return;
  }
  
  if (formData.price <= 0) {
    toast.error('Le prix doit être supérieur à 0');
    return;
  }

  try {
    let finalImageUrls = [...existingImages];

    // Upload des nouvelles images si présentes
    if (imageFiles.length > 0) {
      toast.loading('Upload des nouvelles images...');
      const newImageUrls = await uploadNewImages();
      finalImageUrls = [...existingImages, ...newImageUrls];
      toast.dismiss();
    }

    const updateData = { ...formData, images: finalImageUrls };

    // CORRECTION: apiJson retourne directement les données parsées
    const { apiJson } = await import('../config');
    const data = await apiJson(`/api/properties/update/${property.id}`, 'PUT', updateData);

    // Vérifier directement le succès
    if (!data.success) {
      throw new Error(data.message || "Erreur inconnue lors de la mise à jour");
    }

    // Nettoyage
    imageFiles.forEach((img: ImageFile) => URL.revokeObjectURL(img.preview));
    toast.success('Propriété modifiée avec succès !');
    navigate('/dashboard');
    
  } catch (error) {
    console.error("Erreur lors de la modification:", error);

    // Vérifie que l'erreur est bien une instance d'Error
    if (error instanceof Error) {
      toast.error(`Erreur: ${error.message}`);
    } else {
      // Si c'est autre chose (ex: string ou objet brut)
      toast.error(`Erreur inconnue: ${String(error)}`);
    }
  }
};

  // Utilise la fonction centralisée getImageUrl de config

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              to="/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Retour
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Modifier le logement
          </h1>
          <p className="text-gray-600">
            Modifiez les informations de votre logement
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations de base</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de l'annonce *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex: Appartement 3 chambres à Analakely"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="input-field"
                  placeholder="Décrivez votre logement, ses avantages, le quartier..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de logement *
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  {propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quartier *
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Sélectionnez un quartier</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse complète *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex: Rue de l'Indépendance, Analakely, Antananarivo"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Logement disponible</span>
                </label>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tarification</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix mensuel (Ar) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ''}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="200000"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caution (Ar) *
                </label>
                <input
                  type="number"
                  name="deposit"
                  value={formData.deposit || ''}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="100000"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Rooms */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Chambres</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre total de chambres *
                </label>
                <input
                  type="number"
                  name="totalRooms"
                  value={formData.totalRooms}
                  onChange={handleChange}
                  className="input-field"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chambres disponibles *
                </label>
                <input
                  type="number"
                  name="availableRooms"
                  value={formData.availableRooms}
                  onChange={handleChange}
                  className="input-field"
                  min="1"
                  max={formData.totalRooms}
                  required
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Photos</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary flex items-center justify-center space-x-2 px-4 py-2"
                  disabled={isUploading || loading}
                >
                  <PhotoIcon className="w-5 h-5" />
                  <span>Ajouter des images</span>
                </button>
                
                <div className="flex-1 text-sm text-gray-500">
                  <p>Formats acceptés: JPG, PNG, WebP • Max 5MB par image</p>
                </div>
              </div>

              {/* Images existantes */}
              {existingImages.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Images actuelles</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative group bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={getImageUrl(image)}
                          alt={`${index + 1}`} 
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          title="Supprimer l'image"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nouvelles images */}
              {imageFiles.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Nouvelles images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imageFiles.map((image, index) => (
                      <div key={image.id} className="relative group bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image.preview}
                          alt={`${index + 1}`} 
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          title="Supprimer l'image"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
              disabled={loading || isUploading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || isUploading}
              className="btn-primary flex items-center space-x-2"
            >
              {(loading || isUploading) ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isUploading ? 'Upload...' : 'Modification...'}</span>
                </>
              ) : (
                'Modifier le logement'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPropertyPage;