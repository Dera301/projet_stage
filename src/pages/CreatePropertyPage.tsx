import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperty } from '../contexts/PropertyContext';
import { useAuth } from '../contexts/AuthContext';
import { CreatePropertyData, ImageFile } from '../types';
import { 
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  MapPinIcon,
  MagnifyingGlassIcon
   // REMPLACEMENT de CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { MapIcon } from 'lucide-react';

interface Coordinates {
  lat: number;
  lng: number;
}

// Fonction d'upload d'image
const uploadImageToServer = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await fetch('http://localhost/Projet_stage/api/upload/image.php', {
      method: 'POST',
      body: formData
      // Pas de credentials pour les uploads de fichiers
    });
    
    console.log('📤 Status upload:', response.status);
    
    const text = await response.text();
    console.log('📤 Réponse brute:', text);
    
    // Nettoyer la réponse des éventuels warnings PHP
    const cleanText = text.replace(/<br\s*\/?>\s*<b>.*?<\/b><br\s*\/?>/g, '').trim();
    
    let data;
    try {
      data = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('❌ Impossible de parser JSON:', cleanText);
      throw new Error('Réponse invalide du serveur');
    }
    
    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de l\'upload');
    }
    
    return data.imageUrl || data.data?.imageUrl;
    
  } catch (error) {
    console.error('❌ Erreur upload:', error);
    throw new Error('Impossible d\'uploader l\'image: ' + (error as Error).message);
  }
};
const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadImageToServer(file));
  return Promise.all(uploadPromises);
};

const CreatePropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const { createProperty, loading } = useProperty();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<CreatePropertyData>({
    title: '',
    description: '',
    address: '',
    district: '',
    price: 0,
    deposit: 0,
    availableRooms: 1,
    totalRooms: 1,
    propertyType: 'apartment',
    amenities: [],
    images: []
  });

  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [tempCoordinates, setTempCoordinates] = useState<Coordinates | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
// AJOUTER CES 3 LIGNES ICI :
const [manualLat, setManualLat] = useState<string>('');
const [manualLng, setManualLng] = useState<string>('');
const [showManualInput, setShowManualInput] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const geocodingTimeoutRef = useRef<NodeJS.Timeout>();


  const districts = [
    'Analakely', 'Ambohijatovo', 'Ankadifotsy', 'Ankatso', 'Antaninarenina',
    'Behoririka', 'Isoraka', 'Mahamasina', 'Tsaralalana', '67ha'
  ];

  const amenitiesOptions = [
    'Internet', 'Eau chaude', 'Sécurité', 'Parking', 'Jardin', 'Climatisation',
    'Machine à laver', 'Cuisine équipée', 'Balcon', 'Ascenseur', 'Piscine', 'Gym'
  ];

  const propertyTypes = [
    { value: 'apartment', label: 'Appartement' },
    { value: 'house', label: 'Maison' },
    { value: 'studio', label: 'Studio' }
  ];

  const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    toast.error("La géolocalisation n'est pas supportée par votre navigateur");
    return;
  }

  setIsGeolocating(true);
  toast.loading("Récupération de votre position actuelle...");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      // ✅ Utilise la position GPS réelle
      setCoordinates({ lat: latitude, lng: longitude });
      setTempCoordinates({ lat: latitude, lng: longitude });

      // Reverse geocoding pour remplir adresse
      reverseGeocode(latitude, longitude);

      toast.dismiss();
      toast.success(`Position détectée : ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      setIsGeolocating(false);
    },
    (error) => {
      toast.dismiss();
      setIsGeolocating(false);
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          toast.error("Permission de géolocalisation refusée");
          break;
        case error.POSITION_UNAVAILABLE:
          toast.error("Position GPS indisponible");
          break;
        case error.TIMEOUT:
          toast.error("Timeout de la géolocalisation");
          break;
        default:
          toast.error("Erreur de géolocalisation inconnue");
      }
    },
    {
      enableHighAccuracy: true, // 🛰️ GPS haute précision
      timeout: 15000,           // 15 secondes max
      maximumAge: 0             // Pas de cache
    }
  );
  };

  // Reverse geocoding pour obtenir l'adresse à partir des coordonnées
  const reverseGeocode = async (lat: number, lng: number): Promise<void> => {
    try {
      // Utilisation de l'API Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      const data = await response.json();
      
      if (data && data.display_name) {
        const address = data.display_name;
        setFormData(prev => ({
          ...prev,
          address: address
        }));
        
        // Essayer de déterminer le quartier
        if (data.address) {
          const district = data.address.suburb || data.address.neighbourhood || data.address.quarter;
          if (district && districts.includes(district)) {
            setFormData(prev => ({
              ...prev,
              district: district
            }));
          }
        }
      }
    } catch (error) {
      console.error('Erreur reverse geocoding:', error);
    }
  };

  // Geocoding pour obtenir les coordonnées à partir de l'adresse
  const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=mg`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const firstResult = data[0];
        return {
          lat: parseFloat(firstResult.lat),
          lng: parseFloat(firstResult.lon)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erreur geocoding:', error);
      return null;
    }
  };

  // Recherche d'adresses avec suggestions
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=mg`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const suggestions = data.map((item: any) => item.display_name);
        setAddressSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Erreur recherche adresse:', error);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Gestion du changement d'adresse avec debounce
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      address: value
    }));

    // Clear previous timeout
    if (geocodingTimeoutRef.current) {
      clearTimeout(geocodingTimeoutRef.current);
    }

    // Set new timeout for address search
    geocodingTimeoutRef.current = setTimeout(() => {
      searchAddress(value);
    }, 500);
  };

  // Sélection d'une suggestion d'adresse
  const handleAddressSelect = async (suggestion: string) => {
    setFormData(prev => ({
      ...prev,
      address: suggestion
    }));
    setShowSuggestions(false);
    setAddressSuggestions([]);

    // Géocoder l'adresse sélectionnée
    toast.loading('Récupération des coordonnées...');
    const coords = await geocodeAddress(suggestion);
    
    if (coords) {
      setCoordinates(coords);
      setTempCoordinates(coords);
      toast.dismiss();
      toast.success('Adresse localisée sur la carte !');
    } else {
      toast.dismiss();
      toast.error('Impossible de localiser cette adresse');
    }
  };
  // Géolocalisation manuelle
  const handleManualGeolocate = async () => {
    if (!formData.address.trim()) {
      toast.error('Veuillez d\'abord saisir une adresse');
      return;
    }

    try {
      toast.loading('Recherche des coordonnées...');
      const coords = await geocodeAddress(formData.address);
      
      if (coords) {
        setCoordinates(coords);
        setTempCoordinates(coords);
        setIsMapModalOpen(true);
        toast.dismiss();
        toast.success('Coordonnées trouvées ! Ajustez la position sur la carte.');
      } else {
        toast.dismiss();
        toast.error('Impossible de trouver les coordonnées pour cette adresse');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Erreur lors de la géolocalisation');
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
  if (!mapRef.current || !coordinates) return;

  const rect = mapRef.current.getBoundingClientRect();
  const xRatio = (e.clientX - rect.left) / rect.width;
  const yRatio = (e.clientY - rect.top) / rect.height;

  // Déplacement local (petit ajustement autour de la position actuelle)
  const newCoords: Coordinates = {
    lat: coordinates.lat + (0.01 * (yRatio - 0.5)),
    lng: coordinates.lng + (0.01 * (xRatio - 0.5)),
  };

  setTempCoordinates(newCoords);
  };

  const confirmLocation = () => {
    if (tempCoordinates) {
      setCoordinates(tempCoordinates);
      toast.success('Emplacement confirmé !');
    }
    setIsMapModalOpen(false);
  };

  const handleManualCoordinatesSubmit = () => {
  const lat = parseFloat(manualLat);
  const lng = parseFloat(manualLng);
  
  if (isNaN(lat) || isNaN(lng)) {
    toast.error('Veuillez saisir des coordonnées valides');
    return;
  }
  
  if (lat < -90 || lat > 90) {
    toast.error('La latitude doit être entre -90 et 90');
    return;
  }
  
  if (lng < -180 || lng > 180) {
    toast.error('La longitude doit être entre -180 et 180');
    return;
  }
  
  const newCoords: Coordinates = { lat, lng };
  setCoordinates(newCoords);
  setTempCoordinates(newCoords);
  setShowManualInput(false);
  setManualLat('');
  setManualLng('');
  toast.success('Coordonnées manuelles enregistrées !');
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'deposit' || name === 'availableRooms' || name === 'totalRooms' 
        ? Number(value) 
        : value
    }));
  };

  const handleAmenityChange = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

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

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imageFiles[index].preview);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    toast.success('Image supprimée');
  };

  // Fonction pour uploader toutes les images
  const uploadAllImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];
    
    setIsUploading(true);
    try {
      const files = imageFiles.map(img => img.file);
      const imageUrls = await uploadMultipleImages(files);
      toast.success('Toutes les images ont été uploadées avec succès');
      return imageUrls;
    } catch (error: any) {
      toast.error(`Erreur lors de l'upload des images: ${error.message}`);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vous devez être connecté pour créer une propriété');
      navigate('/login');
      return;
    }

    // Validation des champs requis
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
    
    if (formData.deposit < 0) {
      toast.error('La caution ne peut pas être négative');
      return;
    }
    
    if (formData.availableRooms > formData.totalRooms) {
      toast.error('Le nombre de chambres disponibles ne peut pas être supérieur au total');
      return;
    }

    if (formData.availableRooms <= 0) {
      toast.error('Il doit y avoir au moins une chambre disponible');
      return;
    }

    if (imageFiles.length === 0) {
      toast.error('Veuillez ajouter au moins une image');
      return;
    }

    if (!coordinates) {
      toast.error('Veuillez confirmer la localisation sur la carte');
      return;
    }

    try {
      // Étape 1: Uploader toutes les images
      toast.loading('Upload des images en cours...');
      const uploadedImageUrls = await uploadAllImages();
      
      if (uploadedImageUrls.length === 0) {
        toast.error('Aucune image n\'a pu être uploadée');
        return;
      }

      toast.dismiss();
      
      // Étape 2: Créer la propriété avec les URLs permanentes
      await createProperty({
        ...formData,
        images: uploadedImageUrls,
        coordinates
      });
      
      // Nettoyer les URLs temporaires
      imageFiles.forEach(img => URL.revokeObjectURL(img.preview));
      
      toast.success('Propriété créée avec succès !');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.dismiss();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Publier un logement
          </h1>
          <p className="text-gray-600">
            Partagez votre logement avec des étudiants à la recherche d'une colocation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section Informations de base (garder le titre et description) */}
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
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Localisation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse complète *
                </label>
                <div className="relative">
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <input
                        ref={addressInputRef}
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleAddressChange}
                        className="input-field pr-10"
                        placeholder="Ex: Rue de l'Indépendance, Analakely, Antananarivo"
                        required
                        onFocus={() => {
                          if (addressSuggestions.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowSuggestions(false), 200);
                        }}
                      />
                      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    
                    {/* Bouton géolocalisation automatique */}
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="btn-secondary flex items-center space-x-2 whitespace-nowrap"
                      disabled={isGeolocating}
                      title="Utiliser ma position actuelle"
                    >
                      {isGeolocating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      ) : (
                        <MapIcon className="w-4 h-4" />
                      )}
                      <span>Ma position</span>
                    </button>

                    {/* Bouton géolocalisation manuelle */}
                    <button
                      type="button"
                      onClick={handleManualGeolocate}
                      className="btn-secondary flex items-center space-x-2 whitespace-nowrap"
                      disabled={!formData.address.trim()}
                      title="Localiser cette adresse"
                    >
                      <MapPinIcon className="w-4 h-4" />
                      <span>Localiser</span>
                    </button>
                  </div>

                  {/* Suggestions d'adresses */}
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {addressSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                          onClick={() => handleAddressSelect(suggestion)}
                        >
                          <div className="flex items-start space-x-2">
                            <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  <p>Commencez à taper pour voir les suggestions d'adresse</p>
                  <p>Ou sur "Mobile" utilisez "Ma position" pour détecter automatiquement votre localisation actuelle</p>
                </div>
              </div>

              {/* Section Coordonnées Géographiques */}
              {/* Section Coordonnées Géographiques */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation sur la carte
                </label>
                
                {/* REMPLACER TOUTE CETTE SECTION PAR : */}
                {/* Bouton pour saisie manuelle */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setShowManualInput(!showManualInput)}
                    className="btn-secondary flex items-center space-x-2 text-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Saisir les coordonnées manuellement</span>
                  </button>
                </div>

                {/* Formulaire de saisie manuelle */}
                {showManualInput && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-3">
                      Saisie manuelle des coordonnées
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">
                          Latitude *
                        </label>
                        <input
                          type="text"
                          value={manualLat}
                          onChange={(e) => setManualLat(e.target.value)}
                          className="input-field text-sm"
                          placeholder="Ex: -18.8792"
                        />
                        <p className="text-xs text-blue-600 mt-1">Entre -90 et 90</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">
                          Longitude *
                        </label>
                        <input
                          type="text"
                          value={manualLng}
                          onChange={(e) => setManualLng(e.target.value)}
                          className="input-field text-sm"
                          placeholder="Ex: 47.5079"
                        />
                        <p className="text-xs text-blue-600 mt-1">Entre -180 et 180</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button
                        type="button"
                        onClick={handleManualCoordinatesSubmit}
                        className="btn-primary text-sm px-3 py-2"
                      >
                        Valider les coordonnées
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowManualInput(false);
                          setManualLat('');
                          setManualLng('');
                        }}
                        className="btn-secondary text-sm px-3 py-2"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  {coordinates ? (
                    <div className="text-center">
                      <div className="w-full h-48 bg-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                        <div 
                          ref={mapRef}
                          className="w-full h-full bg-gradient-to-br from-blue-200 to-green-200 cursor-pointer relative"
                          onClick={handleMapClick}
                        >
                          <div 
                            className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2"
                            style={{
                              left: '50%',
                              top: '50%'
                            }}
                          >
                            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                            <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                          </div>
                          
                          <div className="absolute inset-0 opacity-20">
                            <div className="w-full h-px bg-gray-400 absolute top-1/3"></div>
                            <div className="w-full h-px bg-gray-400 absolute top-2/3"></div>
                            <div className="h-full w-px bg-gray-400 absolute left-1/3"></div>
                            <div className="h-full w-px bg-gray-400 absolute left-2/3"></div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        <p>Latitude: {coordinates.lat.toFixed(6)}</p>
                        <p>Longitude: {coordinates.lng.toFixed(6)}</p>
                      </div>
                      <div className="flex justify-center space-x-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setIsMapModalOpen(true)}
                          className="btn-secondary text-sm"
                        >
                          Ajuster sur la carte
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowManualInput(true)}
                          className="btn-secondary text-sm"
                        >
                          Modifier manuellement
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">
                        Aucune localisation définie
                      </p>
                      <p className="text-sm text-gray-400 mb-4">
                        Saisissez une adresse, utilisez "Ma position" ou entrez les coordonnées manuellement
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          className="btn-primary flex items-center space-x-2 text-sm"
                          disabled={isGeolocating}
                        >
                          {isGeolocating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Détection...</span>
                            </>
                          ) : (
                            <>
                              <MapIcon className="w-4 h-4" />
                              <span>Utiliser ma position</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowManualInput(true)}
                          className="btn-secondary flex items-center space-x-2 text-sm"
                        >
                          <PlusIcon className="w-4 h-4" />
                          <span>Saisir manuellement</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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

          {/* Amenities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Équipements</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenitiesOptions.map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
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
                  <span>Sélectionner des images</span>
                </button>
                
                <div className="flex-1 text-sm text-gray-500">
                  <p>Formats acceptés: JPG, PNG, WebP • Max 5MB par image • Maximum 10 images</p>
                  <p className="text-green-600 font-medium">Les images seront sauvegardées définitivement</p>
                </div>
              </div>

              {/* Compteur d'images */}
              {imageFiles.length > 0 && (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-sm font-medium text-blue-800">
                    {imageFiles.length} image(s) sélectionnée(s) sur 10 maximum
                  </span>
                  {isUploading && (
                    <div className="flex items-center space-x-2">
                      
                      <span className="text-xs text-blue-600">Upload en cours...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Grille d'aperçu des images */}
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imageFiles.map((image, index) => (
                    <div key={image.id} className="relative group bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.preview}
                        alt={`Aperçu ${index + 1}`}
                        className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                      />
                      
                      {/* Overlay au survol */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all transform scale-90 group-hover:scale-100"
                          title="Supprimer l'image"
                          disabled={isUploading}
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Info fichier en bas */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <p className="text-xs text-white truncate">
                          {image.file.name}
                        </p>
                        <p className="text-xs text-gray-300">
                          {(image.file.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                      
                      {/* Numéro de l'image */}
                      <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* État vide */}
              {imageFiles.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune image sélectionnée
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Ajoutez des photos attractives de votre logement
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary flex items-center space-x-2 mx-auto"
                    disabled={isUploading}
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Sélectionner des images</span>
                  </button>
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
              disabled={loading || isUploading || imageFiles.length === 0}
              className="btn-primary flex items-center space-x-2"
            >
              {(loading || isUploading) ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isUploading ? 'Upload...' : 'Publication...'}</span>
                </>
              ) : (
                'Publier le logement'
              )}
            </button>
          </div>
        </form>

        {/* Modal de la carte */}
        {isMapModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Ajuster la position sur la carte
                </h3>
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      // Pré-remplir avec les coordonnées actuelles si disponibles
                      if (tempCoordinates) {
                        setManualLat(tempCoordinates.lat.toString());
                        setManualLng(tempCoordinates.lng.toString());
                      }
                      setShowManualInput(true);
                      setIsMapModalOpen(false);
                    }}
                    className="btn-secondary flex items-center space-x-2 text-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Saisir les coordonnées manuellement</span>
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Cliquez sur la carte pour positionner le marqueur
                  </p>
                  <div className="text-xs text-gray-500">
                    {tempCoordinates && (
                      <p>Position actuelle: {tempCoordinates.lat.toFixed(6)}, {tempCoordinates.lng.toFixed(6)}</p>
                    )}
                  </div>
                </div>

                <div 
                  ref={mapRef}
                  className="w-full h-64 bg-gradient-to-br from-blue-200 to-green-200 rounded-lg cursor-pointer relative mb-4 border-2 border-gray-300"
                  onClick={handleMapClick}
                >
                  {tempCoordinates && (
                    <div 
                      className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: '50%',
                        top: '50%'
                      }}
                    >
                      <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                      <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-px bg-gray-400 absolute top-1/3"></div>
                    <div className="w-full h-px bg-gray-400 absolute top-2/3"></div>
                    <div className="h-full w-px bg-gray-400 absolute left-1/3"></div>
                    <div className="h-full w-px bg-gray-400 absolute left-2/3"></div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsMapModalOpen(false)}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={confirmLocation}
                    className="btn-primary"
                    disabled={!tempCoordinates}
                  >
                    Confirmer l'emplacement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePropertyPage;