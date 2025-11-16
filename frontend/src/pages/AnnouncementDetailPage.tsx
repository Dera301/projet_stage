import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAnnouncement } from '../contexts/AnnouncementContext';
import { useAuth } from '../contexts/AuthContext';
import { useCINVerification } from '../hooks/useCINVerification';
import CINVerificationModal from '../components/CINVerificationModal';
import { 
  UserIcon, 
  CalendarIcon, 
  PhoneIcon,
  AcademicCapIcon,
  HomeIcon,
  HeartIcon,
  ShareIcon,
  FlagIcon,
  EyeIcon,
  ChatBubbleLeftEllipsisIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon as ChatIcon
  
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMessage } from '../contexts/MessageContext';
import toast from 'react-hot-toast';

const AnnouncementDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { announcements } = useAnnouncement();
  const { user } = useAuth();
  const { 
    showVerificationModal, 
    setShowVerificationModal, 
    checkVerification 
  } = useCINVerification();
  const [loading, setLoading] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState<any | null>(null);
  const [similarAnnouncements, setSimilarAnnouncements] = React.useState<any[]>([]);
  const [isSaved, setIsSaved] = React.useState(false);
  const [showContactForm, setShowContactForm] = React.useState(false);
  const [contactMessage, setContactMessage] = React.useState('');
  const { sendMessage } = useMessage();
  const [showFull, setShowFull] = useState(false);
  const maxChars = 300; // nombre de caractères visibles avant "Afficher plus"

  // !! SUPPRESSION DES LIGNES 'isLong' ET 'displayedText' D'ICI
  

  React.useEffect(() => {
    const fromContext = announcements.find(a => String(a.id) === String(id));
    if (fromContext) { 
      setAnnouncement(fromContext); 
      loadSimilarAnnouncements(fromContext);
      return; 
    }

    const fetchOne = async () => {
      setLoading(true);
      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE_URL}/api/announcements/get_by_id/${id}`);
        const data = await res.json();
        
        if (res.ok && data.success) {
          setAnnouncement(data.data);
          loadSimilarAnnouncements(data.data);
        } else {
          // Si data.success est false ou la réponse n'est pas ok, mais que data.data est null
          setAnnouncement(null); // S'assurer que l'état est null si l'annonce n'est pas trouvée
        }
      } catch (e) {
        console.error('Erreur chargement annonce:', e);
        setAnnouncement(null); // Gérer les erreurs réseau en mettant à null
      } finally { setLoading(false); }
    };
    fetchOne();
  }, [id, announcements]);

  const loadSimilarAnnouncements = (currentAnnouncement: any) => {
    // S'assurer que currentAnnouncement et son auteur existent avant de filtrer
    if (!currentAnnouncement || !currentAnnouncement.author) {
      setSimilarAnnouncements([]);
      return;
    }
    
    const similar = announcements
      .filter(a => 
        String(a.id) !== String(id) && 
        a.author?.userType === 'student' &&
        // Ajouter un filtre de sécurité
        a.author?.id !== currentAnnouncement.author?.id
      )
      .slice(0, 4);
    setSimilarAnnouncements(similar);
  };

  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return '/api/placeholder/400/300';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return `http://localhost${imageUrl}`;
    return imageUrl;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) { // Vérifier si la date est valide
        return "Date invalide";
      }
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Date indisponible";
    }
  };

  const handleShare = async () => {
    if (!announcement) return; // S'assurer que l'annonce existe
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Annonce de ${announcement.author?.firstName} ${announcement.author?.lastName}`,
          text: announcement.content,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Partage annulé');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers !'); // Utiliser toast pour la cohérence
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // Implémenter la sauvegarde en base de données
  };

  const handleReport = () => {
    // Implémenter le signalement
    toast.success('Fonctionnalité de signalement à implémenter'); // Utiliser toast
  };

  const handleSendMessage = async () => {
    if (!contactMessage.trim()) {
      toast.error('Veuillez saisir un message');
      return;
    }
    // S'assurer que l'auteur existe
    if (!announcement?.author?.id) {
      toast.error('Impossible de contacter cet utilisateur');
      return;
    }

    try {
      await sendMessage(announcement.author.id, contactMessage);
      setContactMessage('');
      setShowContactForm(false);
      toast.success('Message envoyé avec succès !');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: `/announcements/${id}` } });
      return;
    }
    
    // Vérifier la vérification CIN avant d'afficher le formulaire de contact
    if (!checkVerification(e)) {
      return;
    }
    
    setShowContactForm(true);
  };

  // --- VÉRIFICATIONS (GUARD CLAUSES) ---

  if (!id) return <div className="p-6">Annonce invalide</div>;
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  // Si le chargement est terminé et que l'annonce est TOUJOURS null
  if (!announcement) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-gray-700 mb-4 text-lg">Annonce introuvable.</div>
        <button onClick={() => navigate(-1)} className="btn-secondary">Retour</button>
      </div>
    </div>
  );

  // --- DÉCLARATIONS SÉCURISÉES ---
  // A ce stade, 'announcement' n'est plus null.

  const isLong = announcement.content.length > maxChars;
  const displayedText = showFull
    ? announcement.content
    : announcement.content.slice(0, maxChars) + (isLong ? '...' : '');

  const isOwn = user && Number(announcement.author?.id) === Number(user.id);
  
  let daysAgo = 0;
  try {
    daysAgo = Math.floor((new Date().getTime() - new Date(announcement.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  } catch (e) {
    // Laisser daysAgo à 0 en cas de date invalide
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      {/* Modal de vérification CIN */}
      <CINVerificationModal 
        isOpen={showVerificationModal} 
        onClose={() => setShowVerificationModal(false)}
        backButtonText="Retour à l'annonce"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête amélioré */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link to="/" className="hover:text-primary-600 transition-colors">Accueil</Link>
            <span>›</span>
            <Link to="/announcements" className="hover:text-primary-600 transition-colors">Annonces</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Détails de l'annonce</span>
          </nav>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Recherche de colocation
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="w-5 h-5" />
                  <span>Publiée {daysAgo <= 0 ? "aujourd'hui" : `il y a ${daysAgo} jour${daysAgo > 1 ? 's' : ''}`}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <EyeIcon className="w-5 h-5" />
                  <span>{announcement.views || 0} vues</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                className={`p-3 rounded-full border transition-all ${
                  isSaved 
                    ? 'bg-red-50 border-red-200 text-red-600' 
                    : 'bg-white border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500'
                }`}
                title={isSaved ? "Retirer des favoris" : "Sauvegarder"}
              >
                <HeartIcon className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-3 rounded-full bg-white border border-gray-300 text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-all"
                title="Partager"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
              {!isOwn && (
                <button
                  onClick={handleReport}
                  className="p-3 rounded-full bg-white border border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600 transition-all"
                  title="Signaler"
                >
                  <FlagIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Contenu principal - 3 colonnes */}
          <div className="lg:col-span-3 space-y-8">
            {/* Carte principale */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* En-tête de l'annonce */}
              <div className="p-8 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                      <UserIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {announcement.author ? `${announcement.author.firstName} ${announcement.author.lastName}` : 'Utilisateur inconnu'}
                      </h2>
                      <div className="flex items-center space-x-4 text-gray-600 mt-2">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span className="text-sm">{formatDate(announcement.createdAt)}</span>
                        </div>
                        {announcement.budget && (
                          <div className="flex items-center space-x-1">
                            <CurrencyDollarIcon className="w-4 h-4" />
                            <span className="text-sm font-semibold text-primary-600">
                              Budget: {Number(announcement.budget).toLocaleString()} Ar/mois
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {announcement.budget && (
                    <div className="text-right bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-4 border border-primary-200">
                      <div className="text-sm text-gray-600">Budget maximum</div>
                      <div className="text-3xl font-bold text-primary-600">
                        {Number(announcement.budget).toLocaleString()} Ar
                      </div>
                      <div className="text-xs text-gray-500">/mois</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Galerie d'images améliorée */}
              {announcement.images && announcement.images.length > 0 && (
                <div className="p-8 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Galerie photos</h3>
                    <span className="text-sm text-gray-500">{announcement.images.length} photo(s)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {announcement.images.map((img: string, idx: number) => (
                      <div 
                        key={idx}
                        className={`relative rounded-xl overflow-hidden cursor-pointer transform transition-all hover:scale-105 ${
                          idx === 0 ? 'md:col-span-2 lg:col-span-2' : ''
                        }`}
                        onClick={() => window.open(getImageUrl(img), '_blank')}
                      >
                        <img 
                          src={getImageUrl(img)} 
                          alt={`annonce ${idx + 1}`} 
                          className="w-full h-64 object-cover"
                        />
                        {idx === 0 && (
                          <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Photo principale
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="p-8 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-primary-600" />
                  <span>Description de la recherche</span>
                </h3>

                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8">
                  <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap break-words">
                    {displayedText}
                  </p>

                  {isLong && (
                    <button
                      onClick={() => setShowFull(!showFull)}
                      className="mt-4 text-primary-600 hover:text-primary-800 font-medium transition-colors"
                    >
                      {showFull ? 'Afficher moins ▲' : 'Afficher plus ▼'}
                    </button>
                  )}
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Préférences de colocation */}
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <HomeIcon className="w-5 h-5 text-primary-600" />
                      <span>Préférences de colocation</span>
                    </h4>
                    <div className="space-y-3">
                      {announcement.preferences?.length > 0 ? (
                        announcement.preferences.map((pref: string, index: number) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            <span className="text-gray-700">{pref}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 italic">Aucune préférence spécifique mentionnée</p>
                      )}
                    </div>
                  </div>

                  {/* Informations étudiantes */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                      <span>Informations étudiantes</span>
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-gray-700">Statut:</span>
                        <span className="font-semibold text-gray-900">
                          {announcement.author?.userType === 'student' ? '🎓 Étudiant' : 'Non spécifié'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-gray-700">Université:</span>
                        <span className="font-semibold text-gray-900">
                          {announcement.university || 'Non spécifiée'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700">Année d'étude:</span>
                        <span className="font-semibold text-gray-900">
                          {announcement.studyYear || 'Non spécifiée'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section annonces similaires */}
            {similarAnnouncements.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Annonces similaires</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {similarAnnouncements.map(similar => (
                    <Link
                      key={similar.id}
                      to={`/announcements/${similar.id}`}
                      className="group border border-gray-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {similar.author?.firstName} {similar.author?.lastName}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(similar.createdAt), { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-2 mb-2">
                        {similar.content}
                      </p>
                      {similar.budget && (
                        <div className="text-primary-600 font-semibold text-sm">
                          Budget: {Number(similar.budget).toLocaleString()} Ar/mois
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - 1 colonne */}
          <div className="space-y-6">
            {/* Carte de contact améliorée */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacter {announcement.author?.firstName}</h3>
              
              {isOwn ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="w-8 h-8 text-primary-600" />
                  </div>
                  <p className="text-gray-600 mb-4">C'est votre annonce</p>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full btn-primary py-3"
                  >
                    Gérer mes annonces
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-green-800 text-center">
                      📍 Recherche active dans votre région
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (checkVerification(e)) {
                          setShowContactForm(true);
                        }
                      }}
                      className="flex-1 btn-primary flex items-center justify-center space-x-2"
                    >
                      <ChatIcon className="w-4 h-4" />
                      <span>Contacter</span>
                    </button>
                    
                    {announcement.author?.phone && (
                      <a 
                        href={`tel:${announcement.author.phone}`}
                        className="w-full btn-secondary py-3 flex items-center justify-center space-x-2 text-lg"
                      >
                        <PhoneIcon className="w-5 h-5" />
                        <span>Appeler maintenant</span>
                      </a>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 space-y-2">
                      <p>💡 Présentez-vous brièvement dans votre message</p>
                      <p>🏠 Précisez vos disponibilités pour une visite</p>
                      <p>💰 Négociez le budget si nécessaire</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Statistiques améliorées */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques de l'annonce</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center space-x-2">
                    <EyeIcon className="w-4 h-4" />
                    <span>Vues totales:</span>
                  </span>
                  <span className="font-semibold text-gray-900">{announcement.views || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center space-x-2">
                    <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                    <span>Messages reçus:</span>
                  </span>
                  <span className="font-semibold text-gray-900">{announcement.messageCount || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 flex items-center space-x-2">
                    <HeartIcon className="w-4 h-4" />
                    <span>Favoris:</span>
                  </span>
                  <span className="font-semibold text-gray-900">{announcement.favoriteCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Conseils pour propriétaires */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg border border-orange-200 p-6">
              <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center space-x-2">
                <BuildingOfficeIcon className="w-5 h-5" />
                <span>Pour les propriétaires</span>
              </h3>
              <div className="space-y-3 text-sm text-orange-800">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p>Cet étudiant recherche activement une colocation</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p>Répondez rapidement pour maximiser vos chances</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p>Préparez les informations sur votre logement</p>
                </div>
              </div>
            </div>

            {/* Guide de sécurité */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">🔒 Sécurité</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• Rencontrez-vous dans un lieu public</p>
                <p>• Vérifiez l'identité de l'interlocuteur</p>
                <p>• Utilisez notre messagerie sécurisée</p>
                <p>• Signalez tout comportement suspect</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation en bas */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
          <button 
            onClick={() => navigate(-1)} 
            className="btn-secondary flex items-center space-x-2 px-6 py-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour aux annonces</span>
          </button>
        </div>
      </div>
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Envoyer un message à {announcement.author?.firstName}
              </h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
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
                onClick={handleSendMessage}
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
    </div>
  );
};

export default AnnouncementDetailPage;