import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProperty } from '../contexts/PropertyContext';
import { useMessage } from '../contexts/MessageContext';
import { 
  MapPinIcon, 
  CurrencyDollarIcon, 
  UsersIcon,
  HomeIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon as ChatIcon,
  CalendarIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Property } from '../types';

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { properties, fetchPropertyById } = useProperty();
  const { sendMessage } = useMessage();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState('');
  const [showMap, setShowMap] = useState(false);

  // Charger la propriété
  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Essayer d'abord de trouver la propriété dans le contexte
        const propertyFromContext = properties.find(p => p.id === id);
        if (propertyFromContext) {
          setProperty(propertyFromContext);
        } else {
          // Si pas trouvé dans le contexte, charger depuis l'API
          const propertyData = await fetchPropertyById(id);
          setProperty(propertyData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la propriété:', error);
        toast.error('Erreur lors du chargement du logement');
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id, properties, fetchPropertyById]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du logement...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Logement non trouvé</h2>
          <p className="text-gray-600 mb-4">Le logement que vous recherchez n'existe pas.</p>
          <Link to="/properties" className="btn-primary">
            Voir tous les logements
          </Link>
        </div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Veuillez saisir un message');
      return;
    }

    try {
      await sendMessage(property.ownerId, message);
      setMessage('');
      setShowContactForm(false);
      toast.success('Message envoyé avec succès !');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers');
    }
  };
  const getImageUrl = (imageUrl: string | undefined) => {
  if (!imageUrl) return '/api/placeholder/400/300';
  
  // Si l'URL est déjà une URL complète, la retourner telle quelle
  if (imageUrl.startsWith('http')) return imageUrl;
  
  // Si c'est un chemin relatif, le convertir en URL absolue
  if (imageUrl.startsWith('/')) {
    return `http://localhost${imageUrl}`;
  }
  
  return imageUrl;
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/properties"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Retour aux logements
            </Link>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite 
                    ? 'text-red-500 bg-red-50' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <HeartIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Images */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={getImageUrl(property.images?.[selectedImage])}
                  alt={property.title}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/800/600';
                  }}
                />
              </div>
              {property.images && property.images.length > 1 && (
                <div className="p-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {property.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index 
                            ? 'border-primary-500' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`${property.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/api/placeholder/80/80';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    <span>{property.address}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="badge badge-primary">
                      {property.propertyType === 'apartment' ? 'Appartement' : 
                       property.propertyType === 'house' ? 'Maison' : 'Studio'}
                    </span>
                    <span className={`badge ${property.isAvailable ? 'badge-success' : 'badge-warning'}`}>
                      {property.isAvailable ? 'Disponible' : 'Occupé'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-600">
                    {property.price?.toLocaleString()} Ar
                  </div>
                  <div className="text-gray-500">par mois</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Chambres</div>
                  <div className="font-semibold">{property.availableRooms}/{property.totalRooms}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Caution</div>
                  <div className="font-semibold">{property.deposit?.toLocaleString()} Ar</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <HomeIcon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Type</div>
                  <div className="font-semibold">
                    {property.propertyType === 'apartment' ? 'Appartement' : 
                     property.propertyType === 'house' ? 'Maison' : 'Studio'}
                  </div>
                </div>
                <div
                  className="text-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => setShowMap(!showMap)}
                  title="Voir sur la carte"
                >
                  <MapPinIcon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Quartier</div>
                  <div className="font-semibold">{property.district}</div>
                  <div className="text-xs text-primary-600 mt-1 underline">Voir sur la carte</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {property.description}
                </p>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Équipements</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities?.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
                {(!property.amenities || property.amenities.length === 0) && (
                  <p className="text-gray-500 col-span-3">Aucun équipement listé</p>
                )}
              </div>
            </div>

            {showMap && (
              <div className="my-6">
                <h4 className="text-md font-semibold mb-2">Emplacement sur la carte</h4>
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <iframe
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={
                      property.latitude && property.longitude
                        ? `https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=16&output=embed`
                        : `https://www.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed`
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Propriétaire</h3>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary-600 font-medium text-lg">
                    {property.owner?.firstName?.[0] || 'U'}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {property.owner?.firstName} {property.owner?.lastName}
                  </h4>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-500 ml-1">(4.8)</span>
                  </div>
                </div>
              </div>
              
              {property.owner?.isVerified && (
                <div className="flex items-center text-green-600 mb-4">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm">Propriétaire vérifié</span>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => setShowContactForm(!showContactForm)}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <ChatIcon className="w-4 h-4" />
                  <span>Contacter</span>
                </button>
                
                <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                  <PhoneIcon className="w-4 h-4" />
                  <span>Appeler</span>
                </button>
                
                <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Planifier une visite</span>
                </button>
              </div>
            </div>

            {/* Contact Form */}
            {showContactForm && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Envoyer un message</h3>
                <div className="space-y-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Bonjour, je suis intéressé(e) par votre logement..."
                    rows={4}
                    className="w-full input-field"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSendMessage}
                      className="flex-1 btn-primary"
                    >
                      Envoyer
                    </button>
                    <button
                      onClick={() => setShowContactForm(false)}
                      className="flex-1 btn-secondary"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Safety Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Conseils de sécurité</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Visitez toujours le logement avant de signer</li>
                <li>• Vérifiez l'identité du propriétaire</li>
                <li>• Ne payez jamais d'avance sans contrat</li>
                <li>• Utilisez notre messagerie sécurisée</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;