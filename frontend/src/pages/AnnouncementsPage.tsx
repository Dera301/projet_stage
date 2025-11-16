import React, { useMemo, useState } from 'react';
import { useAnnouncement } from '../contexts/AnnouncementContext';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChatBubbleLeftRightIcon as ChatIcon, PhotoIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import useCINVerification from '../hooks/useCINVerification';
import CINVerificationModal from '../components/CINVerificationModal';

const AnnouncementsPage: React.FC = () => {
  const { announcements, loading } = useAnnouncement();
  const { user } = useAuth();
  const navigate = useNavigate();

  // États locaux
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  // Récupération des états de vérification CIN
  const { 
    checkVerification, 
    showVerificationModal, 
    setShowVerificationModal 
  } = useCINVerification();

  // Fonction pour obtenir l'URL d'une image
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return '/api/placeholder/400/300';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return `http://localhost${imageUrl}`;
    return imageUrl;
  };

  // Filtrer les annonces en fonction de la recherche
  const filteredAnnouncements = useMemo(() => {
    if (!searchQuery) return announcements;
    
    return announcements.filter(announcement => 
      announcement.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.author?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.author?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [announcements, searchQuery]);

  // Pagination des annonces
  const paginatedAnnouncements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAnnouncements.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAnnouncements, currentPage]);

  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Modal de vérification CIN */}
      <CINVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        backButtonText="Retour aux annonces"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Barre de recherche */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher une annonce par contenu ou nom d'auteur..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Annonces des étudiants</h1>
            <p className="text-gray-600">Recherches de colocation publiées par les étudiants</p>
          </div>
          {user?.userType === 'student' && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (checkVerification(e)) {
                  navigate('/create-announcement');
                }
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Publier une annonce</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-24">
            <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Aucune annonce trouvée' : 'Aucune annonce pour le moment'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Essayez avec d\'autres termes de recherche' : 'Soyez le premier à publier une annonce de colocation.'}
            </p>
            {user?.userType === 'student' && !searchQuery && (
              <Link to="/create-announcement" className="btn-primary">Publier</Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedAnnouncements.map((a) => (
              <div key={a.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
                
                {a.images && a.images.length > 0 ? (
                  <img src={getImageUrl(a.images[0])} alt="annonce" className="w-full h-40 object-cover" />

                ) : (
                  <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                    <PhotoIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900 truncate">
                        {a.author ? `${a.author.firstName} ${a.author.lastName}` : 'Utilisateur inconnu'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true, locale: fr })}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3 mb-3">{a.content}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex gap-2 flex-1">
                      <Link 
                        to={`/announcements/${a.id}`}
                        className="btn-secondary flex-1 text-center"
                      >
                        Voir détails
                      </Link>
                      {/* Bouton Modifier si l'utilisateur est l'auteur */}
                      {user && Number(a.author?.id) === Number(user.id) && (
                        <button
                          onClick={() => navigate(`/edit-announcement/${a.id}`)}
                          className="btn-primary flex items-center justify-center space-x-2 flex-1"
                          title="Modifier mon annonce"
                        >
                          <span>Modifier</span>
                        </button>
                      )}
                      {/* Bouton Contacter si l'utilisateur n'est pas l'auteur */}
                      {user && Number(a.author?.id) === Number(user.id) ? null : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (!checkVerification(e)) return;
                            
                            if (a.author?.id) {
                              const link = `${window.location.origin}/announcements/${a.id}`;
                              const prefill = `Bonjour ${a.author.firstName}, je suis intéressé(e) par votre annonce.\n\nAnnonce: ${link}`;
                              navigate(`/messages?to=${a.author.id}&prefill=${encodeURIComponent(prefill)}`);
                            } else {
                              console.error('Impossible de contacter: auteur non disponible');
                              alert('Impossible de contacter cet utilisateur pour le moment');
                            }
                          }}
                          className="btn-primary flex items-center justify-center space-x-2 flex-1"
                        >
                          <ChatIcon className="w-4 h-4" />
                          <span>Contacter</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                </div>
              </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Précédent
                </button>
                
                <span className="text-gray-600">
                  Page {currentPage} sur {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Suivant
                </button>
              </div>
            )}
            </>
          )}
          
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-24">
            <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Aucune annonce trouvée' : 'Aucune annonce pour le moment'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Essayez avec d\'autres termes de recherche' : 'Soyez le premier à publier une annonce de colocation.'}
            </p>
            {user?.userType === 'student' && !searchQuery && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  if (checkVerification(e)) {
                    navigate('/create-announcement');
                  }
                }}
                className="btn-primary"
              >
                Publier
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedAnnouncements.map((a) => (
                <div key={a.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
                  {a.images && a.images.length > 0 ? (
                    <img src={getImageUrl(a.images[0])} alt="annonce" className="w-full h-40 object-cover" />
                  ) : (
                    <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                      <PhotoIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-900 truncate">
                          {a.author ? `${a.author.firstName} ${a.author.lastName}` : 'Utilisateur inconnu'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true, locale: fr })}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3 mb-3">{a.content}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex gap-2 flex-1">
                        <Link 
                          to={`/announcements/${a.id}`}
                          className="btn-secondary flex-1 text-center"
                        >
                          Voir détails
                        </Link>
                        {/* Bouton Modifier si l'utilisateur est l'auteur */}
                        {user && Number(a.author?.id) === Number(user.id) && (
                          <button
                            onClick={() => navigate(`/edit-announcement/${a.id}`)}
                            className="btn-primary flex items-center justify-center space-x-2 flex-1"
                            title="Modifier mon annonce"
                          >
                            <span>Modifier</span>
                          </button>
                        )}
                        {/* Bouton Contacter si l'utilisateur n'est pas l'auteur */}
                        {user && Number(a.author?.id) !== Number(user.id) && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (!checkVerification(e)) return;
                              
                              if (a.author?.id) {
                                const link = `${window.location.origin}/announcements/${a.id}`;
                                const prefill = `Bonjour ${a.author.firstName}, je suis intéressé(e) par votre annonce.\n\nAnnonce: ${link}`;
                                navigate(`/messages?to=${a.author.id}&prefill=${encodeURIComponent(prefill)}`);
                              } else {
                                console.error('Impossible de contacter: auteur non disponible');
                                alert('Impossible de contacter cet utilisateur pour le moment');
                              }
                            }}
                            className="btn-primary flex items-center justify-center space-x-2 flex-1"
                          >
                            <ChatIcon className="w-4 h-4" />
                            <span>Contacter</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Précédent
                </button>
                
                <span className="text-gray-600">
                  Page {currentPage} sur {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
