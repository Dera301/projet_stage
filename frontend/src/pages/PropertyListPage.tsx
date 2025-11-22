import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useProperty } from '../contexts/PropertyContext';
import { Property } from '../types';
import { 
  MapPinIcon, 
  CurrencyDollarIcon, 
  UsersIcon,
  HomeIcon,
  StarIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon as ChatIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { getImageUrl } from '../config';

const PropertyListPage: React.FC = () => {
  const { properties, loading } = useProperty();
  const { user } = useAuth();
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date-desc');
  const [filters, setFilters] = useState({
    district: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    availableRooms: ''
  });

  const districts = [
    'Analakely', 'Ambohijatovo', 'Ankadifotsy', 'Ankatso', 'Antaninarenina',
    'Behoririka', 'Isoraka', 'Mahamasina', 'Tsaralalana', '67ha'
  ];

  const propertyTypes = [
    { value: 'apartment', label: 'Appartement' },
    { value: 'house', label: 'Maison' },
    { value: 'studio', label: 'Studio' }
  ];

  useEffect(() => {
    // S'assurer que properties est un tableau avant de l'utiliser
    if (!properties || !Array.isArray(properties)) {
      setFilteredProperties([]);
      return;
    }

    let filtered = [...properties];

    // Appliquer les filtres
    if (filters.district) {
      filtered = filtered.filter(p => p.district === filters.district);
    }
    if (filters.propertyType) {
      filtered = filtered.filter(p => p.propertyType === filters.propertyType);
    }
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= Number(filters.maxPrice));
    }
    if (filters.availableRooms) {
      filtered = filtered.filter(p => p.availableRooms >= Number(filters.availableRooms));
    }

    // Appliquer le tri
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      default:
        break;
    }

    setFilteredProperties(filtered);
  }, [properties, filters, sortBy]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      district: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      availableRooms: ''
    });
  };

  

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tous les logements
          </h1>
          <p className="text-gray-600">
            Découvrez tous les logements disponibles pour la colocation à Antananarivo
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center space-x-2"
              >
                <FunnelIcon className="w-5 h-5" />
                <span>Filtres</span>
              </button>
              
              <select
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
                className="input-field"
              >
                <option value="">Tous les quartiers</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>

              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="input-field"
              >
                <option value="">Tous les types</option>
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Trier par:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field text-sm"
              >
                <option value="date-desc">Plus récent</option>
                <option value="date-asc">Plus ancien</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix min (Ar)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix max (Ar)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="input-field"
                    placeholder="500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chambres min
                  </label>
                  <select
                    value={filters.availableRooms}
                    onChange={(e) => handleFilterChange('availableRooms', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Toutes</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="btn-secondary w-full"
                  >
                    Effacer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {filteredProperties.length} logement(s) trouvé(s)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img
                      src={getImageUrl(property.images?.[0])}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/400/300';
                      }}
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {property.title}
                      </h3>
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <HeartIcon className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      <span className="text-sm">{property.address}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-primary-600">
                        <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                        <span className="font-semibold">{property.price?.toLocaleString()} Ar</span>
                        <span className="text-gray-500 text-sm ml-1">/mois</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <UsersIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm">{property.availableRooms}/{property.totalRooms} ch.</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {property.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {property.amenities?.slice(0, 3).map((amenity) => (
                        <span key={amenity} className="badge badge-primary text-xs">
                          {amenity}
                        </span>
                      ))}
                      {property.amenities && property.amenities.length > 3 && (
                        <span className="badge badge-primary text-xs">
                          +{property.amenities.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-primary-600 font-medium text-sm">
                            {property.owner?.firstName?.[0] || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {property.owner?.firstName} {property.owner?.lastName}
                          </p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/properties/${property.id}`}
                          className="btn-primary text-sm"
                        >
                          Voir détails
                        </Link>
                        {user && Number(property.ownerId) === Number(user.id) ? null : (
                          <Link
                            to={`/messages?to=${property.ownerId}&prefill=${encodeURIComponent(`Bonjour, je suis intéressé(e) par votre logement "${property.title}".\n\nLogement: ${window.location.origin}/properties/${property.id}`)}`}
                            className="btn-secondary text-sm flex items-center space-x-1"
                            title="Contacter le propriétaire"
                          >
                            <ChatIcon className="w-4 h-4" />
                            <span>Contacter</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="text-center py-12">
                <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {properties && properties.length > 0 ? 'Aucun logement correspond aux filtres' : 'Aucun logement disponible'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {properties && properties.length > 0 ? 'Essayez de modifier vos critères de recherche' : 'Revenez plus tard pour découvrir de nouveaux logements'}
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Effacer les filtres
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyListPage;