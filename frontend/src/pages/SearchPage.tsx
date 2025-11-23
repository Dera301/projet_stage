import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProperty } from '../contexts/PropertyContext';
import { Property, SearchFilters } from '../types';
import { 
  MapPinIcon, 
  CurrencyDollarIcon, 
  UsersIcon,
  HomeIcon,
  FunnelIcon,
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const SearchPage: React.FC = () => {
  const { searchProperties, loading } = useProperty();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const districts = [
    'Analakely', 'Ambohijatovo', 'Ankadifotsy', 'Ankatso', 'Antaninarenina',
    'Behoririka', 'Isoraka', 'Mahamasina', 'Tsaralalana', '67ha'
  ];

  const amenities = [
    'Internet', 'Eau chaude', 'Sécurité', 'Parking', 'Jardin', 'Climatisation',
    'Machine à laver', 'Cuisine équipée', 'Balcon', 'Ascenseur'
  ];

  const propertyTypes = [
    { value: 'apartment', label: 'Appartement' },
    { value: 'house', label: 'Maison' },
    { value: 'studio', label: 'Studio' }
  ];

  // Fonction de recherche memoized
  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    try {
      const results = await searchProperties(searchFilters);
      setProperties(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setProperties([]);
      setHasSearched(true);
    }
  }, [searchProperties]);

  // Effet pour la recherche initiale
  useEffect(() => {
    // Recherche initiale seulement si pas encore effectuée
    if (!hasSearched) {
      performSearch(filters);
    }
  }, [filters, hasSearched, performSearch]);

  // Réinitialiser hasSearched quand les filtres changent significativement
  useEffect(() => {
    setHasSearched(false);
  }, [filters.district, filters.propertyType, filters.minPrice, filters.maxPrice, filters.availableRooms]);

  const handleSearch = () => {
    performSearch(filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setHasSearched(false);
  };

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return '/api/placeholder/400/300';
    
    if (imageUrl.startsWith('http')) return imageUrl;
    
    if (imageUrl.startsWith('/')) {
      return `http://localhost${imageUrl}`;
    }
    
    return imageUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Rechercher un logement
          </h1>
          <p className="text-gray-600">
            Trouvez la colocation idéale dans les meilleurs quartiers d'Antananarivo
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher par titre, adresse ou description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full input-field"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filtres</span>
            </button>
            <button
              onClick={handleSearch}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Effacer tout
                </button>
              </div>

              <div className="space-y-6">
                {/* Prix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix mensuel (Ar)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                      className="input-field text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                      className="input-field text-sm"
                    />
                  </div>
                </div>

                {/* Type de propriété */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de logement
                  </label>
                  <select
                    value={filters.propertyType || ''}
                    onChange={(e) => handleFilterChange('propertyType', e.target.value || undefined)}
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

                {/* Quartier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quartier
                  </label>
                  <select
                    value={filters.district || ''}
                    onChange={(e) => handleFilterChange('district', e.target.value || undefined)}
                    className="input-field"
                  >
                    <option value="">Tous les quartiers</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nombre de chambres */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chambres disponibles
                  </label>
                  <select
                    value={filters.availableRooms || ''}
                    onChange={(e) => handleFilterChange('availableRooms', e.target.value ? Number(e.target.value) : undefined)}
                    className="input-field"
                  >
                    <option value="">Toutes</option>
                    <option value="1">1 chambre</option>
                    <option value="2">2 chambres</option>
                    <option value="3">3 chambres</option>
                    <option value="4">4+ chambres</option>
                  </select>
                </div>

                {/* Équipements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Équipements
                  </label>
                  <div className="space-y-2">
                    {amenities.map((amenity) => (
                      <label key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.amenities?.includes(amenity) || false}
                          onChange={(e) => {
                            const currentAmenities = filters.amenities || [];
                            if (e.target.checked) {
                              handleFilterChange('amenities', [...currentAmenities, amenity]);
                            } else {
                              handleFilterChange('amenities', currentAmenities.filter(a => a !== amenity));
                            }
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {loading && !hasSearched ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">
                    {filteredProperties.length} logement(s) trouvé(s)
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Trier par:</span>
                    <select 
                      className="input-field text-sm"
                      value={filters.sort || ''}
                      onChange={(e) => handleFilterChange('sort', e.target.value || undefined)}
                    >
                      <option value="">Par défaut</option>
                      <option value="price ASC">Prix croissant</option>
                      <option value="price DESC">Prix décroissant</option>
                      <option value="createdAt DESC">Plus récent</option>
                      <option value="createdAt ASC">Plus ancien</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
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
                            <span className="font-semibold">{property.price.toLocaleString()} Ar</span>
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
                          {property.amenities.slice(0, 3).map((amenity) => (
                            <span key={amenity} className="badge badge-primary text-xs">
                              {amenity}
                            </span>
                          ))}
                          {property.amenities.length > 3 && (
                            <span className="badge badge-primary text-xs">
                              +{property.amenities.length - 3}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                              <span className="text-primary-600 font-medium text-sm">
                                {property.owner.firstName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {property.owner.firstName} {property.owner.lastName}
                              </p>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                                ))}
                                <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                              </div>
                            </div>
                          </div>
                          <Link
                            to={`/properties/${property.id}`}
                            className="btn-primary text-sm"
                          >
                            Voir détails
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProperties.length === 0 && hasSearched && (
                  <div className="text-center py-12">
                    <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun logement trouvé
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Essayez de modifier vos critères de recherche
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
      </div>
    </div>
  );
};

export default SearchPage;
