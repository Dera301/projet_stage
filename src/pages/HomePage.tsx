import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  MapPinIcon, 
  ShieldCheckIcon,
  MagnifyingGlassIcon as SearchIcon,
  ChatBubbleLeftRightIcon as ChatIcon,
  StarIcon,
  HeartIcon,
  
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useProperty } from '../contexts/PropertyContext';
import { Property } from '../types';

const HomePage: React.FC = () => {
  const { properties, loading } = useProperty();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [latestProperty, setLatestProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (properties && properties.length > 0) {
      // Trier par date de création (plus récent en premier)
      const sortedProperties = [...properties].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Prendre les 6 propriétés les plus récentes
      setFeaturedProperties(sortedProperties.slice(0, 6));
      
      // La propriété la plus récente pour la bannière
      setLatestProperty(sortedProperties[0]);
    }
  }, [properties]);

  const features = [
    {
      icon: <HomeIcon className="w-8 h-8 text-primary-600" />,
      title: "Logements de qualité",
      description: "Découvrez des logements soigneusement sélectionnés dans les meilleurs quartiers d'Antananarivo."
    },
    {
      icon: <UsersIcon className="w-8 h-8 text-primary-600" />,
      title: "Colocataires compatibles",
      description: "Trouvez des colocataires qui partagent vos centres d'intérêt et votre mode de vie."
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8 text-primary-600" />,
      title: "Sécurité garantie",
      description: "Tous nos utilisateurs sont vérifiés pour assurer votre sécurité et votre tranquillité."
    },
    {
      icon: <ChatIcon className="w-8 h-8 text-primary-600" />,
      title: "Communication facile",
      description: "Discutez directement avec les propriétaires et futurs colocataires via notre messagerie intégrée."
    }
  ];

  const districts = [
    "Analakely", "Ambohijatovo", "Ankadifotsy", "Ankatso", "Antaninarenina",
    "Behoririka", "Isoraka", "Mahamasina", "Tsaralalana", "67ha"
  ];

  const testimonials = [
    {
      name: "Marie Rakoto",
      role: "Étudiante en Médecine",
      content: "Grâce à ColocAntananarivo, j'ai trouvé une colocation parfaite près de mon université. L'équipe est très professionnelle !",
      rating: 5
    },
    {
      name: "Jean Rasoa",
      role: "Propriétaire",
      content: "Excellente plateforme pour louer mes logements. Les étudiants sont sérieux et les paiements sont sécurisés.",
      rating: 5
    },
    {
      name: "Sofia Andriamalala",
      role: "Étudiante en Informatique",
      content: "Interface intuitive et logements de qualité. Je recommande vivement cette plateforme !",
      rating: 5
    }
  ];

  // Fonction utilitaire pour les URLs d'images
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return '/api/placeholder/400/300';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) {
      return `http://localhost${imageUrl}`;
    }
    return imageUrl;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Trouvez votre colocation idéale à Antananarivo
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              La plateforme de référence pour les étudiants qui cherchent un logement abordable 
              et des colocataires compatibles dans la capitale malgache.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/properties"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <SearchIcon className="w-5 h-5" />
                <span>Rechercher un logement</span>
              </Link>
              <Link
                to="/create-property"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Publier un logement
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Property Banner */}
      {latestProperty && (
        <section className="py-12 bg-gradient-to-r from-gray-900 to-primary-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                🎉 Nouveau logement disponible !
              </h2>
              <p className="text-primary-200">Découvrez notre dernière annonce</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                <div className="relative">
                  <img
                    src={getImageUrl(latestProperty.images?.[0])}
                    alt={latestProperty.title}
                    className="w-full h-80 object-cover rounded-xl shadow-2xl"
                    onError={(e) => {
                      e.currentTarget.src = '/api/placeholder/600/400';
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Nouveau
                  </div>
                </div>
                
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">{latestProperty.title}</h3>
                  
                  <div className="flex items-center text-primary-200 mb-3">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    <span>{latestProperty.district} • {latestProperty.address}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <UsersIcon className="w-5 h-5 text-primary-300" />
                      <span>{latestProperty.availableRooms}/{latestProperty.totalRooms} chambres</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <HomeIcon className="w-5 h-5 text-primary-300" />
                      <span className="capitalize">
                        {latestProperty.propertyType === 'apartment' ? 'Appartement' : 
                         latestProperty.propertyType === 'house' ? 'Maison' : 'Studio'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-3xl font-bold text-primary-200">
                      {latestProperty.price?.toLocaleString()} Ar
                      <span className="text-lg text-primary-300">/mois</span>
                    </div>
                    <div className="text-sm bg-primary-600 px-3 py-1 rounded-full">
                      Caution: {latestProperty.deposit?.toLocaleString()} Ar
                    </div>
                  </div>
                  
                  <p className="text-primary-200 mb-6 line-clamp-3">
                    {latestProperty.description}
                  </p>
                  
                  <div className="flex space-x-4">
                    <Link
                      to={`/properties/${latestProperty.id}`}
                      className="flex-1 bg-primary-500 hover:bg-primary-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <span>Voir les détails</span>
                      
                    </Link>
                    <button className="p-3 border-2 border-primary-400 text-primary-200 hover:bg-primary-400 hover:text-white rounded-lg transition-colors duration-200">
                      <HeartIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Logements populaires
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez nos annonces les plus récentes et trouvez la colocation parfaite
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative">
                    <img
                      src={getImageUrl(property.images?.[0])}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/400/300';
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-full text-xs font-semibold">
                      {property.propertyType === 'apartment' ? '🏢 Appartement' : 
                       property.propertyType === 'house' ? '🏠 Maison' : '🏡 Studio'}
                    </div>
                    <button className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors">
                      <HeartIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="p-6">
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
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      <span className="text-sm">{property.district}</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {property.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <UsersIcon className="w-4 h-4" />
                          <span>{property.availableRooms}/{property.totalRooms} ch.</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
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
                    
                    <Link
                      to={`/properties/${property.id}`}
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      <span>Voir détails</span>
                      
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun logement disponible pour le moment
              </h3>
              <p className="text-gray-600 mb-4">
                Soyez le premier à publier votre logement !
              </p>
              <Link
                to="/create-property"
                className="btn-primary"
              >
                Publier un logement
              </Link>
            </div>
          )}

          {featuredProperties.length > 0 && (
            <div className="text-center">
              <Link
                to="/properties"
                className="btn-primary text-lg px-8 py-3"
              >
                Voir tous les logements
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Logements disponibles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">1200+</div>
              <div className="text-gray-600">Étudiants inscrits</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">300+</div>
              <div className="text-gray-600">Colocations réussies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">15</div>
              <div className="text-gray-600">Quartiers couverts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir ColocAntananarivo ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nous facilitons la recherche de logement étudiant avec des outils modernes et une approche humaine.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-2xl hover:bg-primary-50 transition-colors">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Districts Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Quartiers couverts
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trouvez des logements dans les meilleurs quartiers d'Antananarivo, proches des universités et des transports.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {districts.map((district, index) => (
              <div key={index} className="bg-white rounded-lg p-4 text-center hover:bg-primary-50 transition-colors cursor-pointer border border-gray-200 hover:border-primary-300">
                <MapPinIcon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <span className="text-gray-900 font-medium">{district}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez les témoignages de nos utilisateurs satisfaits.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à trouver votre colocation ?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Rejoignez des milliers d'étudiants qui ont déjà trouvé leur logement idéal sur notre plateforme.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Commencer maintenant
            </Link>
            <Link
              to="/properties"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Voir les logements
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;