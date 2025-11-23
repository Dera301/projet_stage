import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProperty } from '../contexts/PropertyContext';
import { useAnnouncement } from '../contexts/AnnouncementContext';
import { TrashIcon } from '@heroicons/react/24/solid';
import { apiGet } from '../config';
import { useMessage } from '../contexts/MessageContext';
import {
  HomeIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon as ChatIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  MapPinIcon,
  PhotoIcon,
  IdentificationIcon,
  ExclamationTriangleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { properties, userProperties, deleteProperty,  } = useProperty(); // Maintenant deleteProperty est disponible
  const { userAnnouncements, deleteAnnouncement, updateAnnouncement, fetchUserAnnouncements } = useAnnouncement();
  const { conversations } = useMessage();
  const [deleteLoading, setDeleteLoading] = React.useState<string | null>(null);
  const [editingAnnId, setEditingAnnId] = React.useState<number | null>(null);
  const [editAnnContent, setEditAnnContent] = React.useState<string>('');
  const [showFullMap, setShowFullMap] = React.useState<Record<number, boolean>>({});
  const [stats, setStats] = React.useState<Array<{
    name: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: React.ReactNode;
  }>>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = React.useState(false); // Nouvel état

  React.useEffect(() => {
    const loadUserAnnouncements = async () => {
      if (user?.userType === 'student') {
        setLoadingAnnouncements(true);
        try {
          await fetchUserAnnouncements();
        } catch (error) {
          console.error('Erreur chargement annonces:', error);
        } finally {
          setLoadingAnnouncements(false);
        }
      }
    };

    loadUserAnnouncements();
  }, [user, fetchUserAnnouncements]); // Dépendances


  React.useEffect(() => {
    if (!user) return; // attendre que l'utilisateur soit présent
    const loadStats = async () => {
      try {
        const statsPath = user.userType === 'admin' ? '/api/properties/stats' : '/api/properties/stats_public';
        const data = await apiGet(statsPath);
        if (!data.success) return;
        const s = data.data || {};
        if (user.userType === 'owner') {
          const totalOwnerProps = userProperties.length || (s.totalProperties || 0);
          const availableOwnerProps = userProperties.length
            ? userProperties.filter(p => p.isAvailable).length
            : (s.availableProperties ?? s.totalProperties ?? 0);

          setStats([
            {
              name: 'Logements publiés',
              value: String(totalOwnerProps),
              change: availableOwnerProps > 0
                ? `${availableOwnerProps} disponibles`
                : 'Aucun disponible',
              changeType: totalOwnerProps > 0 ? 'positive' : 'neutral',
              icon: <HomeIcon className="w-6 h-6" />
            },
            {
              name: 'Messages reçus',
              value: String(s.messagesReceived || 0),
              changeType: 'neutral',
              icon: <ChatIcon className="w-6 h-6" />
            },
          ]);
        } else {
          setStats([
            {
              name: 'Messages reçus',
              value: String(s.messagesReceived || 0),
              changeType: 'neutral',
              icon: <ChatIcon className="w-6 h-6" />
            },
            {
              name: 'Logements disponibles',
              value: String((s.availableProperties ?? s.totalProperties ?? 0) || 0),
              changeType: 'positive',
              icon: <HomeIcon className="w-6 h-6" />
            },
          ]);
        }
      } catch (e) {
        console.error('Erreur chargement stats:', e);
      }
    };
    loadStats();
  }, [user, setStats, userProperties]);

  // Pagination pour les logements du propriétaire
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(userProperties.length / pageSize));
  const paginatedUserProperties = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return userProperties.slice(start, start + pageSize);
  }, [userProperties, currentPage]);

  // Always declare hooks before any conditional returns
  const recentStudentProperties = React.useMemo(() => {
    const sorted = [...(properties || [])].sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
    return sorted.slice(0, 3);
  }, [properties]);

  const recentActivities = React.useMemo(() => {
    return (conversations || []).slice(0, 5).map((c) => {
      const sender = c.lastMessage?.sender?.firstName ? `${c.lastMessage?.sender?.firstName} ${c.lastMessage?.sender?.lastName || ''}`.trim() : 'Utilisateur';
      const title = c.lastMessage ? `Nouveau message de ${sender}` : 'Conversation mise à jour';
      const description = c.lastMessage?.content || '';
      const time = (c.lastMessage?.createdAt || c.updatedAt).toLocaleString('fr-FR');
      return {
        id: c.id,
        title,
        description,
        time,
        icon: <ChatIcon className="w-5 h-5" />
      } as any;
    });
  }, [conversations]);


   // Vérification CIN - Permettre l'accès pendant 24h
  const isWithinGracePeriod = user?.accountActivationDeadline 
    ? new Date() < new Date(user.accountActivationDeadline)
    : false;

  // Bloquer seulement si le délai de 24h est dépassé ET que la CIN n'est pas vérifiée
  if (user?.userType === 'owner' && !user?.cinVerified && !isWithinGracePeriod && !user?.cinPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Vérification Requise
          </h2>
          <p className="text-gray-600 mb-4">
            Pour publier des annonces, vous devez d'abord vérifier votre carte d'identité nationale.
            Cette mesure permet d'assurer la sécurité et la confiance sur notre plateforme.
          </p>
          <div className="space-y-3">                       
            <Link
              to="/cin-verification"
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <IdentificationIcon className="w-5 h-5" />
              <span>Vérifier mon CIN</span>
            </Link>
            <Link
              to="/logements"
              className="w-full btn-secondary"
            >
              Parcourir les logements
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  

  const handleDeleteProperty = async (propertyId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce logement ? Cette action est irréversible.')) {
      return;
    }

    setDeleteLoading(propertyId);
    try {
      await deleteProperty(propertyId);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du logement');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSaveAnnouncement = async () => {
    if (!editingAnnId) return;
    try {
      await updateAnnouncement(editingAnnId, { content: editAnnContent });
      setEditingAnnId(null);
      setEditAnnContent('');
    } catch (e) {
      // handled by context toast
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!window.confirm('Supprimer cette annonce ?')) return;
    try {
      await deleteAnnouncement(id);
    } catch (e) {}
  };

  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return '/api/placeholder/400/300';
    
    if (imageUrl.startsWith('http')) return imageUrl;
    
    if (imageUrl.startsWith('/')) {
      return `http://localhost${imageUrl}`;
    }
    
    return imageUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {user.firstName} !
          </h1>
          <p className="text-gray-600 mt-2">
            Voici un aperçu de votre activité sur ColocAntananarivo
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-transform hover:scale-[1.01]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <div className="text-primary-600">
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Student Announcements CRUD */}
            {user.userType === 'student' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Mes annonces</h2>
                  <Link to="/create-announcement" className="btn-primary text-sm flex items-center space-x-2">
                    <PlusIcon className="w-4 h-4" />
                    <span>Nouvelle annonce</span>
                  </Link>
                </div>
                
                {loadingAnnouncements ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : userAnnouncements.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    Vous n'avez pas encore publié d'annonce.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userAnnouncements.map((a) => (
                      <div key={a.id} className="border border-gray-200 rounded-lg p-4">
                        {editingAnnId === a.id ? (
                          <div className="space-y-3">
                            <textarea
                              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                              rows={3}
                              value={editAnnContent}
                              onChange={(e) => setEditAnnContent(e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                              <button onClick={handleSaveAnnouncement} className="btn-primary text-sm">Enregistrer</button>
                              <button onClick={() => setEditingAnnId(null)} className="btn-secondary text-sm">Annuler</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-4">
                                {(() => {
                                  const isLong = (a.content || '').length > 220;
                                  const showFull = !!showFullMap[a.id];
                                  const displayedText = showFull ? a.content : (isLong ? `${(a.content || '').slice(0, 220)}...` : a.content);
                                  return (
                                    <>
                                      <p className="text-gray-800 leading-relaxed text-base whitespace-pre-wrap break-all md:break-words max-w-full overflow-hidden">{displayedText}</p>
                                      {isLong && (
                                        <button
                                          onClick={() => setShowFullMap(prev => ({ ...prev, [a.id]: !prev[a.id] }))}
                                          className="mt-3 text-primary-600 hover:text-primary-800 font-medium transition-colors text-sm"
                                        >
                                          {showFull ? 'Afficher moins ▲' : 'Afficher plus ▼'}
                                        </button>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(a.createdAt).toLocaleString('fr-FR')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link 
                                to={`/edit-announcement/${a.id}`}
                                className="btn-primary text-sm flex items-center space-x-1"
                              >
                                <PencilIcon className="w-4 h-4" />
                                <span>Modifier</span>
                              </Link>
                              <button 
                                onClick={() => handleDeleteAnnouncement(a.id)} 
                                className="btn-danger text-sm flex items-center gap-1"
                              >
                                <TrashIcon className="w-4 h-4" />
                                Supprimer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {userProperties.length > pageSize && (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <button
                          type="button"
                          className="text-sm text-gray-600 hover:text-primary-600 disabled:opacity-50"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        >
                          Précédent
                        </button>
                        <div className="text-sm text-gray-600">
                          Page {currentPage} / {totalPages}
                        </div>
                        <button
                          type="button"
                          className="text-sm text-gray-600 hover:text-primary-600 disabled:opacity-50"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        >
                          Suivant
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.userType === 'owner' ? (
                <>
                  <Link
                    to="/create-property"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <PlusIcon className="w-8 h-8 text-primary-600 mr-4" />
                    <div>
                      <h3 className="font-medium text-gray-900">Publier un logement</h3>
                      <p className="text-sm text-gray-600">Ajouter un nouveau logement </p>
                    </div>
                  </Link>
                  <Link
                    to="/messages"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <ChatIcon className="w-8 h-8 text-primary-600 mr-4" />
                    <div>
                      <h3 className="font-medium text-gray-900">Messages</h3>
                      <p className="text-sm text-gray-600">Voir les conversations</p>
                    </div>
                  </Link>
                  {/* AJOUTER POUR LES PROPRIÉTAIRES */}
                  <Link
                    to="/appointments"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <CalendarIcon className="w-8 h-8 text-primary-600 mr-4" />
                    <div>
                      <h3 className="font-medium text-gray-900">Visites planifiées</h3>
                      <p className="text-sm text-gray-600">Gérer les rendez-vous</p>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/logements"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <HomeIcon className="w-8 h-8 text-primary-600 mr-4" />
                    <div>
                      <h3 className="font-medium text-gray-900">Rechercher un logement</h3>
                      <p className="text-sm text-gray-600">Trouver votre colocation idéale</p>
                    </div>
                  </Link>
                  <Link
                    to="/messages"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <ChatIcon className="w-8 h-8 text-primary-600 mr-4" />
                    <div>
                      <h3 className="font-medium text-gray-900">Messages</h3>
                      <p className="text-sm text-gray-600">Contacter les propriétaires</p>
                    </div>
                  </Link>
                  {/* AJOUTER POUR LES ÉTUDIANTS */}
                  <Link
                    to="/appointments"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <CalendarIcon className="w-8 h-8 text-primary-600 mr-4" />
                    <div>
                      <h3 className="font-medium text-gray-900">Mes visites planifiées</h3>
                      <p className="text-sm text-gray-600">Voir mes rendez-vous</p>
                    </div>
                  </Link>
                </>
              )}
            </div>
            </div>

            {/* My Properties Section - Only for Owners */}
            {user.userType === 'owner' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Mes logements publiés</h2>
                </div>

                {userProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun logement publié
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Commencez par publier votre premier logement pour le proposer en colocation
                    </p>
                    <Link
                      to="/create-property"
                      className="btn-primary inline-flex items-center space-x-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      <span>Publier un logement</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {paginatedUserProperties.map((property) => (
                      <div key={property.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row">
                          {/* Property Image */}
                          <div className="md:w-48 h-48 bg-gray-200 flex-shrink-0">
                            {property.images && property.images.length > 0 ? (
                              <img
                                src={getImageUrl(property.images[0])}
                                alt={property.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/api/placeholder/400/300';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <PhotoIcon className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Property Details */}
                          <div className="flex-1 p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                  {property.title}
                                </h3>
                                <div className="flex items-center text-gray-600 mb-2">
                                  <MapPinIcon className="w-4 h-4 mr-1" />
                                  <span className="text-sm">{property.address}</span>
                                </div>
                              </div>
                              <span className={`badge ${property.isAvailable ? 'badge-success' : 'badge-warning'} ml-4`}>
                                {property.isAvailable ? 'Disponible' : 'Occupé'}
                              </span>
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
                            
                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <div className="flex items-center space-x-3">
                                <Link
                                  to={`/properties/${property.id}`}
                                  className="btn-secondary text-sm flex items-center space-x-1"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                  <span>Voir</span>
                                </Link>
                                <Link
                                  to={`/edit-property/${property.id}`}
                                  className="btn-primary text-sm flex items-center space-x-1"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                  <span>Modifier</span>
                                </Link>
                              </div>
                              <button
                                onClick={() => handleDeleteProperty(property.id)}
                                disabled={deleteLoading === property.id}
                                className="btn-danger text-sm flex items-center space-x-1 disabled:opacity-50"
                              >
                                {deleteLoading === property.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <TrashIcon className="w-4 h-4" />
                                )}
                                <span>Supprimer</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recent Properties for Students */}
            {user.userType === 'student' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Logements récents</h2>
                  <Link
                    to="/logements"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Voir tout
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentStudentProperties.map((property) => (
                    <div key={property.id} className="flex items-center p-4 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 mr-3">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={getImageUrl(property.images[0])}
                            alt={property.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = '/api/placeholder/100/100'; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{property.title}</h3>
                        <p className="text-sm text-gray-600 truncate">{property.address}</p>
                        <p className="text-sm text-gray-500">
                          {property.availableRooms} chambre(s) • {property.price.toLocaleString()} Ar/mois
                        </p>
                      </div>
                      <Link
                        to={`/properties/${property.id}`}
                        className="ml-3 text-primary-600 hover:text-primary-700 flex-shrink-0"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Activité récente</h2>
                <BellIcon className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 p-2 bg-primary-100 rounded-lg">
                      <div className="text-primary-600">
                        {activity.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Complétion du profil</h2>
              {(() => {
                const hasBasicInfo = !!(user.firstName && user.lastName && user.phone);
                const hasAvatar = !!user.avatar;
                const hasBio = !!user.bio;
                const hasCin = !!user.cinVerified;

                const stepsTotal = 4;
                const completedSteps = [hasBasicInfo, hasAvatar, hasBio, hasCin].filter(Boolean).length;
                const completion = Math.round((completedSteps / stepsTotal) * 100);

                return (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Profil</span>
                        <span className="text-gray-900">{completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${completion}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        {(hasBasicInfo ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <ClockIcon className="w-4 h-4 text-yellow-500 mr-2" />
                        ))}
                        <span className="text-gray-600">Informations de base</span>
                      </div>
                      <div className="flex items-center text-sm">
                        {(hasAvatar ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <ClockIcon className="w-4 h-4 text-yellow-500 mr-2" />
                        ))}
                        <span className="text-gray-600">Photo de profil</span>
                      </div>
                      <div className="flex items-center text-sm">
                        {(hasBio ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <ClockIcon className="w-4 h-4 text-yellow-500 mr-2" />
                        ))}
                        <span className="text-gray-600">Description personnelle</span>
                      </div>
                      <div className="flex items-center text-sm">
                        {(hasCin ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <XCircleIcon className="w-4 h-4 text-gray-400 mr-2" />
                        ))}
                        <span className="text-gray-600">Vérification d'identité</span>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="block w-full text-center btn-primary text-sm"
                    >
                      Compléter le profil
                    </Link>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
