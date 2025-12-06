import React, { memo, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../types';
import { getImageUrl } from '../config';
import { MapPinIcon, HeartIcon, UsersIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useCINVerification } from '../hooks/useCINVerification';
import { useAuth } from '../contexts/AuthContext';

interface PropertyCardProps {
  property: Property;
  onContactClick: (e: React.MouseEvent, property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = memo(({ property, onContactClick }) => {
  const { checkVerification } = useCINVerification();
  const { user } = useAuth();

  // Mémoïser les valeurs calculées
  const propertyTypeLabel = useMemo(() => {
    switch (property.propertyType) {
      case 'apartment': return '🏢 Appartement';
      case 'house': return '🏠 Maison';
      case 'studio': return '🏡 Studio';
      default: return property.propertyType;
    }
  }, [property.propertyType]);

  // Gestionnaire d'événements mémoïsé
  const handleContactClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (checkVerification(e)) {
      onContactClick(e, property);
    }
  }, [checkVerification, onContactClick, property]);

  // Vérifier si l'utilisateur est le propriétaire
  const isOwner = useMemo(() => 
    user && property && String(property.ownerId) === String(user.id),
    [user, property]
  );

  // Rendu du composant
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      {/* Image de la propriété avec chargement paresseux */}
      <div className="relative">
        <img
          src={getImageUrl(property.images?.[0])}
          alt={property.title}
          className="w-full h-48 object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-property.jpg';
          }}
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-full text-xs font-semibold">
          {propertyTypeLabel}
        </div>
        <button 
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors"
          aria-label="Ajouter aux favoris"
        >
          <HeartIcon className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1">
            {property.title}
          </h3>
          <div className="text-right">
            <div className="text-xl font-bold text-primary-600">
              {property.price?.toLocaleString()} Ar
            </div>
            <div className="text-xs text-gray-500">/mois</div>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="text-sm truncate">{property.district}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <UsersIcon className="w-4 h-4 flex-shrink-0" />
              <span>{property.availableRooms}/{property.totalRooms} ch.</span>
            </div>
            <div className="flex items-center space-x-1">
              <CalendarIcon className="w-4 h-4 flex-shrink-0" />
              <span>Disponible</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {property.amenities?.slice(0, 2).map((amenity, index) => (
            <span key={index} className="badge badge-primary text-xs">
              {amenity}
            </span>
          ))}
          {property.amenities && property.amenities.length > 2 && (
            <span className="badge badge-primary text-xs">
              +{property.amenities.length - 2}
            </span>
          )}
        </div>
        
        <div className="flex gap-2 mt-auto">
          <Link
            to={`/properties/${property.id}`}
            className="flex-1 btn-primary flex items-center justify-center space-x-2"
            aria-label={`Voir les détails de ${property.title}`}
          >
            <span>Voir détails</span>
          </Link>
          
          {!isOwner && (
            <button
              onClick={handleContactClick}
              className="flex-1 btn-secondary flex items-center justify-center space-x-2"
              aria-label="Contacter le propriétaire"
            >
              <span>Contacter</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Évite les rendus inutiles si les props n'ont pas changé
  return (
    prevProps.property.id === nextProps.property.id &&
    prevProps.property.availableRooms === nextProps.property.availableRooms
  );
});

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;
