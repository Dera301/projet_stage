
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  MapPinIcon, 
  ShieldCheckIcon,
  MagnifyingGlassIcon as SearchIcon,
  ChatBubbleLeftRightIcon as ChatIcon,
  StarIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import PropertyCard from '../components/PropertyCard';
import { useProperty } from '../contexts/PropertyContext';
import { useAnnouncement } from '../contexts/AnnouncementContext';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageContext';
import HeroBackground3D from '../components/HeroBackground3D';
import CINVerificationModal from '../components/CINVerificationModal';
import { useCINVerification } from '../hooks/useCINVerification';
import { FadeInOnScroll } from '../utils/animations';
import { Property } from '../types';
import toast from 'react-hot-toast';
import { apiGet, getImageUrl } from '../config';

const HomePage: React.FC = () => {
  const { properties, loading } = useProperty();
  const { announcements = [], loading: loadingAnnouncements } = useAnnouncement();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [latestProperty, setLatestProperty] = useState<Property | null>(null);
  // Filtrer les annonces pour n'afficher que celles qui sont valides
  const [latestAnnouncements, setLatestAnnouncements] = useState<any[]>([]);
  const [publicStats, setPublicStats] = useState<{ 
    totalProperties: number; 
    availableProperties: number; 
    totalUsers: number; 
    totalStudents: number; 
    totalOwners: number; 
  } | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 6;
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { sendMessage } = useMessage();
  const { showVerificationModal, setShowVerificationModal, checkVerification } = useCINVerification();
  

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

  useEffect(() => {
    if (announcements && announcements.length > 0) {
      const sorted = [...announcements].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLatestAnnouncements(sorted.slice(0, 6));
    } else {
      setLatestAnnouncements([]);
    }
  }, [announcements]);

  // Dans HomePage.tsx - Modifiez le useEffect des stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Utilisation de apiGet pour bénéficier de la gestion d'URL propre
        const data = await apiGet('api/properties/stats_public');
        
        if (data && data.success) {
          setPublicStats(data.data);
        }
      } catch (e) {
        console.error('Error loading stats:', e);
        // ignore pour la page d'accueil
      }
    };
    loadStats();
  }, []);

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


  // Filtrer les annonces pour n'afficher que celles qui sont valides
  const filteredAnnouncements = useMemo(() => {
    if (!announcements || !Array.isArray(announcements)) return [];
    return announcements.filter(a => a && a.id && a.author);
  }, [announcements]);
  
  const filteredProperties = useMemo(() => {
    if (!searchQuery) return featuredProperties;
    
    return featuredProperties.filter(property =>
      property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.district?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [featuredProperties, searchQuery]);

  // Fonction pour déterminer le type d'utilisateur ou afficher par défaut
  const renderHeroSection = () => {
    // Si l'utilisateur n'est pas connecté, afficher la version par défaut
    if (!user) {
      return (
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <HeroBackground3D />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
            <FadeInOnScroll>
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
                    to="/logements"
                    className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <SearchIcon className="w-5 h-5" />
                    <span>Rechercher un logement</span>
                  </Link>
                </div>
              </div>
            </FadeInOnScroll>
          </div>
        </section>
      );
    }

    // Si l'utilisateur est connecté, afficher selon son type
    if (user.userType === 'owner') {
      return (
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <HeroBackground3D />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
            <FadeInOnScroll>
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Bienvenue, {user.firstName} !
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
                  Gérez vos propriétés et connectez-vous avec des étudiants recherchant une colocation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/dashboard"
                    className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <SearchIcon className="w-5 h-5" />
                    <span>Tableau de bord</span>
                  </Link>
                  <Link
                    to="/create-property"
                    className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                  >
                    Publier un logement
                  </Link>
                </div>
              </div>
            </FadeInOnScroll>
          </div>
        </section>
      );
    }

    // Si l'utilisateur est un étudiant
    return (
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <HeroBackground3D />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <FadeInOnScroll>
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Bienvenue, {user.firstName} !
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
                Trouvez la colocation parfaite près de votre université à Antananarivo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/logements"
                  className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <SearchIcon className="w-5 h-5" />
                  <span>Rechercher un logement</span>
                </Link>
                <Link
                  to="/create-announcement"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  Publier une annonce
                </Link>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    );
  };

  const handleSendAnnouncementMessage = async (announcement: any) => {
  if (!contactMessage.trim()) {
    toast.error('Veuillez saisir un message');
    return;
  }

  try {
    await sendMessage(announcement.author.id, contactMessage);
    setContactMessage('');
    setShowContactForm(false);
    setSelectedAnnouncement(null);
  } catch (error) {
    toast.error('Erreur lors de l\'envoi du message');
  }
  };

// Fonction pour gérer l'envoi de message pour une propriété
  const handleSendPropertyMessage = async (property: Property) => {
    if (!contactMessage.trim()) {
      toast.error('Veuillez saisir un message');
      return;
    }

    try {
      await sendMessage(property.ownerId, contactMessage);
      setContactMessage('');
      setShowContactForm(false);
      setSelectedProperty(null);
      toast.success('Message envoyé avec succès !');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  // Fonction pour ouvrir le formulaire de contact pour une annonce
  const openContactFormForAnnouncement = (e: React.MouseEvent, announcement: any) => {
    e.preventDefault();
    if (!checkVerification(e)) {
      return;
    }
    setSelectedAnnouncement(announcement);
    setSelectedProperty(null);
    setShowContactForm(true);
    const link = `${window.location.origin}/announcements/${announcement.id}`;
    setContactMessage(`Bonjour ${announcement.author.firstName}, je suis intéressé(e) par votre annonce de recherche de colocation.\n\nAnnonce: ${link}`);
  };

  // Fonction pour ouvrir le formulaire de contact pour une propriété
  const openContactFormForProperty = useCallback((e: React.MouseEvent, property: Property) => {
    e.preventDefault();
    if (!user) {
      toast.error('Veuillez vous connecter pour contacter le propriétaire');
      return;
    }
    
    // Vérifier la vérification CIN avant d'afficher le formulaire de contact
    if (!checkVerification(e)) {
      return;
    }
    
    setSelectedProperty(property);
    setShowContactForm(true);
  }, [user, checkVerification]);

  // Fonction pour afficher le chargement
  const renderLoading = () => (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  const content = (
    <div className="min-h-screen">
      {/* Hero Section */}
      {renderHeroSection()}

      {/* Student Announcements Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll>
            <div className="flex items-center justify-between mb-8">
              <div className="text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Annonces des étudiants
                </h2>
                <p className="text-xl text-gray-600">
                  Recherches de colocation récentes
                </p>
              </div>
              <Link to="/announcements" className="btn-primary">Voir tout</Link>
            </div>
          </FadeInOnScroll>

          {loadingAnnouncements ? (
            renderLoading()
          ) : !filteredAnnouncements || filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune annonce disponible pour le moment.</p>
            </div>
          ) : filteredAnnouncements.length > 0 ? (
            <FadeInOnScroll>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAnnouncements.slice(0, 6).map((a) => (
                  <div key={a.id} className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
                    {a.images?.[0] && (
                      <img src={getImageUrl(a.images[0])} alt="annonce" className="w-full h-40 object-cover" />
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {a.author?.firstName} {a.author?.lastName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-3 mb-4">{a.content}</p>
                      <div className="flex gap-2">

                        <Link
                          to={`/announcements/${a.id}`}
                          className="btn-secondary"
                        >
                          Voir détails
                        </Link>

                        {user && Number(a.author?.id) === Number(user.id) ? null : (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (checkVerification(e)) {
                                openContactFormForAnnouncement(e, a);
                              }
                            }}
                            className="flex-1 btn-primary flex items-center justify-center space-x-2"
                          >
                            <ChatIcon className="w-4 h-4" />
                            <span>Contacter</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeInOnScroll>
          ) : (
            <div className="text-center py-12">
              <ChatIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune annonce récente</h3>
              <p className="text-gray-600 mb-4">Les annonces publiées par les étudiants apparaîtront ici.</p>
              <Link to="/announcements" className="btn-primary">Voir les annonces</Link>
            </div>
          )}

        </div>
      </section>

      {/* Latest Property Banner */}
      {latestProperty && (
        <section className="py-12 bg-gradient-to-r from-gray-900 to-primary-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Nouveau logement disponible !
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
                    <button className="p-3 border-2 border-primary-400 text-primary-200 hover:bg-primary-400 hover:text-white rounded-lg transition-colors">
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
    <FadeInOnScroll>
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Logements populaires
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          Découvrez nos annonces les plus récentes et trouvez la colocation parfaite
        </p>
        
        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un logement par titre, description ou quartier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </div>
    </FadeInOnScroll>

    {loading ? (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    ) : filteredProperties.length > 0 ? (
      <FadeInOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredProperties.slice(0, itemsPerPage).map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              onContactClick={openContactFormForProperty} 
            />
          ))}
        </div>
      </FadeInOnScroll>
    ) : (
      <div className="text-center py-12">
        <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchQuery ? 'Aucun logement trouvé' : 'Aucun logement disponible pour le moment'}
        </h3>
        <p className="text-gray-600 mb-4">
          {searchQuery ? 'Essayez avec d\'autres termes de recherche' : 'Soyez le premier à publier votre logement !'}
        </p>
        {!searchQuery && (
          <Link to="/create-property" className="btn-primary">
            Publier un logement
          </Link>
        )}
      </div>
    )}

    {filteredProperties.length > itemsPerPage && (
      <div className="text-center">
        <button
          onClick={() => navigate('/logements', { state: { searchQuery } })}
          className="btn-primary text-lg px-8 py-3"
        >
          Voir tous les logements ({filteredProperties.length})
        </button>
      </div>
    )}

    {!loading && featuredProperties.length > 0 && (
      <div className="text-center mt-8">
        <Link
          to="/logements"
          className="btn-primary text-lg px-8 py-3"
        >
          Voir tous les logements
        </Link>
      </div>
          )}
  </div>
</section>

      {/* Stats Section - valeurs dynamiques */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">{publicStats ? publicStats.availableProperties : '—'}</div>
              <div className="text-gray-600">Logements disponibles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">{publicStats ? publicStats.totalStudents : '—'}</div>
              <div className="text-gray-600">Étudiants inscrits</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">{publicStats ? publicStats.totalOwners : '—'}</div>
              <div className="text-gray-600">Propriétaires inscrits</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">{publicStats ? (publicStats.totalStudents + publicStats.totalOwners) : '—'}</div>
              <div className="text-gray-600">Utilisateurs totaux</div>
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

      {/* ⭐ NOUVELLE SECTION - Comment ça marche */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trouvez votre colocation en seulement 3 étapes simples
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Créez votre profil
              </h3>
              <p className="text-gray-600">
                Inscrivez-vous et complétez votre profil pour aider les propriétaires et colocataires à mieux vous connaître.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Trouvez ou proposez
              </h3>
              <p className="text-gray-600">
                Parcourez les annonces de colocation ou publiez la vôtre en quelques clics seulement.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Connectez-vous
              </h3>
              <p className="text-gray-600">
                Utilisez notre messagerie intégrée pour échanger et organiser des visites en toute sécurité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ⭐ NOUVELLE SECTION - Pour les Étudiants */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Spécialement conçu pour les étudiants
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                ColocAntananarivo comprend les besoins spécifiques des étudiants et propose des solutions adaptées à votre budget et votre mode de vie.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Budget étudiant</h4>
                    <p className="text-gray-600">
                      Des logements à des prix adaptés aux budgets étudiants
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Proche des universités</h4>
                    <p className="text-gray-600">
                      Localisations stratégiques près des campus et facultés
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Flexibilité</h4>
                    <p className="text-gray-600">
                      Contrats adaptés aux calendriers universitaires
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="/api/placeholder/600/400" 
                alt="Étudiants en colocation"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-lg">
                <div className="text-2xl font-bold text-primary-600">95%</div>
                <div className="text-gray-600">de satisfaction étudiante</div>
              </div>
            </div>
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

      {/* ⭐ NOUVELLE SECTION - FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir sur ColocAntananarivo
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Comment puis-je vérifier la fiabilité d'un propriétaire ?
              </h3>
              <p className="text-gray-600">
                Tous nos propriétaires sont vérifiés et notés par les anciens locataires. Vous pouvez consulter les avis et évaluations sur chaque profil.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quels sont les frais de service ?
              </h3>
              <p className="text-gray-600">
                L'inscription et la recherche de logement sont entièrement gratuites pour les étudiants. Seuls les propriétaires paient des frais modérés lors de la location effective.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Puis-je visiter les logements avant de m'engager ?
              </h3>
              <p className="text-gray-600">
                Absolument ! Nous encourageons les visites et vous pouvez organiser des rendez-vous directement via notre plateforme.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Comment sont gérés les conflits entre colocataires ?
              </h3>
              <p className="text-gray-600">
                Nous proposons un service de médiation et des ressources pour aider à résoudre les conflits de manière constructive.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/faq"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Voir toutes les questions →
            </Link>
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
            {!user && (
              <Link
                to="/register"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Commencer maintenant
              </Link>
            )}
            <Link
              to="/logements"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Voir les logements
            </Link>
          </div>
        </div>
      </section>
      {showContactForm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Envoyer un message
            </h3>
            <button
              onClick={() => setShowContactForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              À : {selectedAnnouncement 
                ? `${selectedAnnouncement.author.firstName} ${selectedAnnouncement.author.lastName}`
                : selectedProperty?.owner?.firstName 
                ? `${selectedProperty.owner.firstName} ${selectedProperty.owner.lastName}`
                : 'Propriétaire'
              }
            </p>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Tapez votre message..."
              rows={4}
              className="w-full input-field resize-none"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => {
                if (selectedAnnouncement) {
                  handleSendAnnouncementMessage(selectedAnnouncement);
                } else if (selectedProperty) {
                  handleSendPropertyMessage(selectedProperty);
                }
              }}
              className="flex-1 btn-primary"
              disabled={!contactMessage.trim()}
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
      {/* Modal de vérification CIN */}
      <CINVerificationModal 
        isOpen={showVerificationModal} 
        onClose={() => setShowVerificationModal(false)}
      />
    </div>
  );

  return content;
};

export default HomePage;