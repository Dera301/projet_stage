import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiJson, getImageUrl as getImageUrlFromConfig } from '../config';
import { 
  UsersIcon, 
  ChatBubbleLeftRightIcon as ChatIcon,
  IdentificationIcon,
  CheckIcon,
  XMarkIcon,
  BellIcon,
  HomeIcon,
  MapPinIcon,
  ShieldCheckIcon,
  Cog6ToothIcon as CogIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon as LogoutIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Ajouter le type pour activeTab
type ActiveTab = 'dashboard' | 'users' | 'announcements' | 'cin' | 'notifications' | 'properties' | 'settings';

const AdminPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>('users');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [props, setProps] = useState<any[]>([]);
  const [anns, setAnns] = useState<any[]>([]);
  const [cinToVerify, setCinToVerify] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{open: boolean, type: 'user' | 'announcement' | 'property' | null, id: string | null, reason: string}>({
    open: false,
    type: null,
    id: null,
    reason: ''
  });
  const [userModal, setUserModal] = useState<{open: boolean, user: any | null}>({
    open: false,
    user: null
  });
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalAnnouncements: 0,
    pendingVerifications: 0,
    newUsersToday: 0,
    activeListings: 0
  });
  const [cinRejectModal, setCinRejectModal] = useState<{open: boolean, userId: string | null, reason: string}>({
    open: false,
    userId: null,
    reason: ''
  });

  useEffect(() => {
    loadData();
    loadStats();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      setStats({
        totalUsers: users.length,
        totalProperties: props.length,
        totalAnnouncements: anns.length,
        pendingVerifications: cinToVerify.length,
        newUsersToday: users.filter(u => {
          const createdAt = new Date(u.createdAt || u.created_at);
          return new Date().toDateString() === createdAt.toDateString();
        }).length,
        activeListings: props.filter(p => p.isAvailable).length
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger toutes les listes une fois pour alimenter les badges de la sidebar
      const [usersData, annsData, propsData, cinData] = await Promise.all([
        apiGet('/api/admin/users_list'),
        apiGet('/api/admin/announcements_list'),
        apiGet('/api/admin/properties_list'),
        apiGet('/api/admin/cin_to_verify')
      ]);

      // Traiter les utilisateurs
      if (usersData.success) {
        setUsers(usersData.data || []);
      } else {
        console.warn('Erreur chargement utilisateurs:', usersData.message);
        setUsers([]);
      }

      // Traiter les annonces
      if (annsData.success) {
        setAnns(annsData.data || []);
      } else {
        console.warn('Erreur chargement annonces:', annsData.message);
        setAnns([]);
      }

      // Traiter les propriétés
      if (propsData.success) {
        setProps(propsData.data || []);
      } else {
        console.warn('Erreur chargement propriétés:', propsData.message);
        setProps([]);
      }

      // Traiter les CIN à vérifier
      console.log('Réponse CIN complète:', cinData);
      if (cinData.success) {
        if (cinData.data?.cinToVerify && Array.isArray(cinData.data.cinToVerify)) {
          setCinToVerify(cinData.data.cinToVerify);
        } else if (cinData.data && Array.isArray(cinData.data)) {
          setCinToVerify(cinData.data);
        } else if (cinData.cinToVerify && Array.isArray(cinData.cinToVerify)) {
          setCinToVerify(cinData.cinToVerify);
        } else if (Array.isArray(cinData)) {
          setCinToVerify(cinData);
        } else {
          console.warn('Structure de réponse CIN inattendue:', cinData);
          setCinToVerify([]);
        }
      } else {
        console.warn('Erreur chargement CIN à vérifier:', cinData.message);
        setCinToVerify([]);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir l'URL de l'image - utilise celle de config.ts
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return '/api/placeholder/400/300';
    // Utiliser la fonction de config.ts qui gère mieux les URLs Cloudinary
    const url = getImageUrlFromConfig(imageUrl);
    return url || '/api/placeholder/400/300';
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-gray-900">Chargement...</div></div>;
  if (user.userType !== 'admin') return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-gray-900">Accès refusé</div></div>;

  const handleDeleteUser = async () => {
    if (!deleteModal.id || !deleteModal.reason) {
      toast.error('Veuillez saisir une raison');
      return;
    }

    try {
      const data = await apiJson(`/api/admin/user_delete/${deleteModal.id}`, 'DELETE');
      
      if (data.success) {
        toast.success('Utilisateur supprimé avec succès');
        setUsers(prev => prev.filter(u => u.id !== deleteModal.id));
        setDeleteModal({ open: false, type: null, id: null, reason: '' });
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!deleteModal.id || !deleteModal.reason) {
      toast.error('Veuillez saisir une raison');
      return;
    }

    try {
      const data = await apiJson(`/api/admin/announcement_delete_with_reason/${deleteModal.id}`, 'DELETE', {
        reason: deleteModal.reason
      });
      
      if (data.success) {
        toast.success('Annonce supprimée avec succès');
        setAnns(prev => prev.filter(a => a.id !== deleteModal.id));
        setDeleteModal({ open: false, type: null, id: null, reason: '' });
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteProperty = async () => {
    if (!deleteModal.id || !deleteModal.reason) {
      toast.error('Veuillez saisir une raison');
      return;
    }

    try {
      const data = await apiJson(`/api/properties/delete/${deleteModal.id}`, 'DELETE');
      if (data.success) {
        toast.success('Logement supprimé avec succès');
        setProps(prev => prev.filter(p => p.id !== deleteModal.id));
        setDeleteModal({ open: false, type: null, id: null, reason: '' });
        setSelectedProperty(null);
      } else {
        toast.error(data.message || 'Suppression impossible');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleVerifyCIN = async (userId: string, approved: boolean, reason?: string) => {
    try {
      const payload: any = { verified: approved };
      if (!approved && reason) {
        payload.reason = reason;
      }
      const data = await apiJson(`/api/admin/cin_verify/${userId}`, 'PUT', payload);
      
      if (data.success) {
        toast.success(approved ? 'CIN vérifiée avec succès' : 'CIN rejetée');
        setCinToVerify(prev => prev.filter(c => c.id !== userId));
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, cinVerified: approved, isVerified: approved } : u));
        setCinRejectModal({ open: false, userId: null, reason: '' });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la vérification');
    }
  };

  const handleRejectCINClick = (userId: string) => {
    setCinRejectModal({ open: true, userId, reason: '' });
  };

  const pendingCinCount = cinToVerify.length;
  const newUsersCount = users.filter(u => {
    const createdAt = new Date(u.createdAt || u.created_at);
    const now = new Date();
    const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  }).length;

  const getUserActivityScore = (u: any) => {
    const userId = String(u.id);
    const userPropsCount = props.filter(p => {
      const ownerId = p.ownerId || p.owner_id || p.userId || p.user_id;
      return ownerId && String(ownerId) === userId;
    }).length;

    const userAnnsCount = anns.filter(a => {
      const authorId = a.author?.id || a.userId || a.user_id;
      return authorId && String(authorId) === userId;
    }).length;

    return userPropsCount + userAnnsCount;
  };

  const handleAdminLogout = async () => {
    try {
      await logout();
      navigate('/admin-login');
    } catch (e) {
      console.error('Erreur déconnexion admin:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              {/* Menu hamburger pour mobile */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Bars3Icon className="w-6 h-6 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
                <p className="text-sm text-gray-600">Panneau de gestion</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAdminLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogoutIcon className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500">Administrateur</p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation latérale et contenu */}
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-8">
          {/* Sidebar - Overlay sur mobile, normale sur desktop */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div className={`${sidebarOpen ? 'fixed' : 'hidden'} lg:block lg:relative inset-y-0 left-0 z-50 w-64 bg-white lg:bg-transparent shadow-lg lg:shadow-none flex-shrink-0`}>
            <div className="flex items-center justify-between p-4 lg:hidden border-b">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <nav className="space-y-2 p-4 lg:p-0">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <ChartBarIcon className="w-5 h-5" />
                <span className="font-medium">Tableau de bord</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('users');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'users' 
                    ? 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <UsersIcon className="w-5 h-5" />
                <span className="font-medium">Utilisateurs</span>
                <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {users.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('properties');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'properties' 
                    ? 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <HomeIcon className="w-5 h-5" />
                <span className="font-medium">Logements</span>
                <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {props.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('announcements');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'announcements' 
                    ? 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <ChatIcon className="w-5 h-5" />
                <span className="font-medium">Annonces</span>
                <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {anns.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('cin');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'cin' 
                    ? 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <IdentificationIcon className="w-5 h-5" />
                <span className="font-medium">Vérifications CIN</span>
                {cinToVerify.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {cinToVerify.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('settings');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === 'settings' 
                    ? 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <CogIcon className="w-5 h-5" />
                <span className="font-medium">Paramètres</span>
              </button>
            </nav>

            {/* Statistiques rapides */}
            <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Aperçu rapide</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Nouveaux utilisateurs</span>
                  <span className="text-sm font-semibold text-green-600">+{stats.newUsersToday}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">En attente</span>
                  <span className="text-sm font-semibold text-red-600">{stats.pendingVerifications}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Actifs</span>
                  <span className="text-sm font-semibold text-blue-600">{stats.activeListings}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">

            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Cartes de statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Utilisateurs totaux</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <UserGroupIcon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                      <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                      <span>+12% ce mois</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Logements actifs</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <BuildingStorefrontIcon className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                      <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                      <span>+8% ce mois</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Annonces</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalAnnouncements}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                      <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                      <span>+15% ce mois</span>
                    </div>
                  </div>
                </div>

                {/* Alertes et actions rapides */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Alertes */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                      <span>Alertes en attente</span>
                    </h3>
                    <div className="space-y-3">
                      {cinToVerify.length > 0 && (
                        <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <IdentificationIcon className="w-5 h-5 text-yellow-600" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">{cinToVerify.length} CIN à vérifier</p>
                              <p className="text-xs text-yellow-600">Action requise</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab('cin')}
                            className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full hover:bg-yellow-200 transition-colors"
                          >
                            Vérifier
                          </button>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <BellIcon className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">{stats.newUsersToday} nouveaux utilisateurs aujourd'hui</p>
                            <p className="text-xs text-blue-600">Dernières 24h</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('users')}
                          className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          Voir
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setActiveTab('users')}
                        className="p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
                      >
                        <UsersIcon className="w-6 h-6 text-gray-600 mb-2" />
                        <p className="text-sm font-medium text-gray-900">Gérer utilisateurs</p>
                        <p className="text-xs text-gray-600">Voir et modifier</p>
                      </button>
                      <button
                        onClick={() => setActiveTab('properties')}
                        className="p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
                      >
                        <HomeIcon className="w-6 h-6 text-gray-600 mb-2" />
                        <p className="text-sm font-medium text-gray-900">Logements</p>
                        <p className="text-xs text-gray-600">{props.length} publiés</p>
                      </button>
                      <button
                        onClick={() => setActiveTab('announcements')}
                        className="p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
                      >
                        <ChatIcon className="w-6 h-6 text-gray-600 mb-2" />
                        <p className="text-sm font-medium text-gray-900">Annonces</p>
                        <p className="text-xs text-gray-600">{anns.length} actives</p>
                      </button>
                      <button
                        onClick={() => setActiveTab('cin')}
                        className="p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
                      >
                        <ShieldCheckIcon className="w-6 h-6 text-gray-600 mb-2" />
                        <p className="text-sm font-medium text-gray-900">Vérifications</p>
                        <p className="text-xs text-gray-600">{cinToVerify.length} en attente</p>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Activité récente */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Activité récente</h3>
                  <p className="text-xs text-gray-500 mb-4">Histogramme basé sur le nombre de logements et d'annonces par utilisateur.</p>
                  {(() => {
                    const recentUsers = users.slice(0, 5);
                    const maxActivity = recentUsers.reduce((max, u) => {
                      const score = getUserActivityScore(u);
                      return score > max ? score : max;
                    }, 0);

                    return (
                      <div className="space-y-3">
                        {recentUsers.map(user => {
                          const activityScore = getUserActivityScore(user);
                          const widthPercent = maxActivity > 0 ? (activityScore / maxActivity) * 100 : 0;
                          return (
                            <div key={user.id} className="py-3 border-b border-gray-100 last:border-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-700">
                                      {user.firstName[0]}{user.lastName[0]}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                    <p className="text-xs text-gray-500">Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
                                  </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  user.userType === 'admin' ? 'bg-purple-100 text-purple-800' :
                                  user.userType === 'owner' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {user.userType}
                                </span>
                              </div>
                              <div className="mt-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[11px] text-gray-500">Score activité</span>
                                  <span className="text-[11px] text-gray-600 font-medium">{activityScore}</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-2 bg-blue-500 rounded-full transition-all"
                                    style={{ width: `${widthPercent}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Gestion des Utilisateurs</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600 border-b border-gray-200">
                        <th className="p-3">ID</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Nom</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Vérifié</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr 
                          key={u.id} 
                          className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setUserModal({ open: true, user: u })}
                        >
                          <td className="p-3 text-gray-900 bg-white">{u.id}</td>
                          <td className="p-3 text-gray-900 bg-white">{u.email}</td>
                          <td className="p-3 text-gray-900 bg-white">{u.firstName} {u.lastName}</td>
                          <td className="p-3 bg-white">
                            <span className={`badge ${u.userType === 'admin' ? 'badge-primary' : u.userType === 'owner' ? 'badge-warning' : 'badge-success'}`}>
                              {u.userType}
                            </span>
                          </td>
                          <td className="p-3">
                            {(u.isVerified || u.is_verified || u.cinVerified || u.cin_verified) ? (
                              <span className="badge badge-success">✓ Vérifié</span>
                            ) : (
                              <span className="badge badge-warning">Non vérifié</span>
                            )}
                          </td>
                          <td className="p-3 bg-white" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setDeleteModal({ open: true, type: 'user', id: u.id, reason: '' })}
                              className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                              title="Supprimer l'utilisateur"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'announcements' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-dark-900">Annonces Étudiantes</h2>
                {selectedAnnouncement ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setSelectedAnnouncement(null)}
                      className="btn-secondary text-sm mb-4 flex items-center space-x-2"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      <span>Retour à la liste</span>
                    </button>
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="mb-4">
                        <span className="text-xs text-gray-500">ID: {selectedAnnouncement.id}</span>
                        <h3 className="text-lg font-semibold text-gray-900 mt-2">
                          Auteur: {selectedAnnouncement.author?.firstName} {selectedAnnouncement.author?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Publiée le: {new Date(selectedAnnouncement.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      
                      {/* Images de l'annonce */}
                      {selectedAnnouncement.images && selectedAnnouncement.images.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Images de l'annonce:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {selectedAnnouncement.images.map((image: string, index: number) => (
                              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                <img
                                  src={getImageUrl(image)}
                                  alt={`Annonce ${index + 1}`}
                                  className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(getImageUrl(image), '_blank')}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Contenu:</h4>
                        <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{selectedAnnouncement.content}</p>
                      </div>
                      
                      {selectedAnnouncement.budget && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Budget:</h4>
                          <p className="text-lg font-semibold text-primary-600">
                            {selectedAnnouncement.budget.toLocaleString()} Ar/mois
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setDeleteModal({ open: true, type: 'announcement', id: selectedAnnouncement.id, reason: '' })}
                          className="btn-danger text-sm flex items-center space-x-2"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          <span>Supprimer cette annonce</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {anns.map(a => (
                      <div 
                        key={a.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-shadow hover:shadow-md"
                        onClick={() => setSelectedAnnouncement(a)}
                      >
                        {/* Image de l'annonce */}
                        {a.images && a.images.length > 0 && (
                          <div className="mb-3">
                            <img
                              src={getImageUrl(a.images[0])}
                              alt="Annonce"
                              className="w-full h-40 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        <div className="mb-2">
                          <span className="text-xs text-gray-500">ID: {a.id}</span>
                        </div>
                        
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                          {a.author?.firstName} {a.author?.lastName}
                        </h3>
                        
                        <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                          {a.content}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {new Date(a.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                          <span>
                            {Array.isArray(a.images) ? `${a.images.length} image(s)` : '0 image'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <button
                            onClick={() => setSelectedAnnouncement(a)}
                            className="btn-secondary text-xs"
                          >
                            Détails
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModal({ open: true, type: 'announcement', id: a.id, reason: '' });
                            }}
                            className="btn-danger text-xs"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                    {anns.length === 0 && (
                      <p className="text-gray-600 text-center py-8 col-span-full">Aucune annonce</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'properties' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-dark-900">Appartements Publiés</h2>
                {selectedProperty ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setSelectedProperty(null)}
                      className="btn-secondary text-sm mb-4 flex items-center space-x-2"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      <span>Retour à la liste</span>
                    </button>
                    <div className="border border-dark-200 rounded-lg p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-dark-900">{selectedProperty.title}</h3>
                        <p className="text-sm text-dark-500 mt-1">ID: {selectedProperty.id}</p>
                        <p className="text-sm text-dark-500">Propriétaire ID: {selectedProperty.ownerId}</p>
                      </div>
                      
                      {/* Images de la propriété */}
                      {selectedProperty.images && selectedProperty.images.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-dark-700 mb-3">Images du logement:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {selectedProperty.images.map((image: string, index: number) => (
                              <div key={index} className="border border-dark-200 rounded-lg overflow-hidden">
                                <img
                                  src={getImageUrl(image)}
                                  alt={`${selectedProperty.title} ${index + 1}`}
                                  className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(getImageUrl(image), '_blank')}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <span className="text-sm font-medium text-dark-700">Prix:</span>
                          <p className="text-dark-900 text-lg font-semibold">{selectedProperty.price?.toLocaleString()} Ar/mois</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-dark-700">District:</span>
                          <p className="text-dark-900">{selectedProperty.district || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-dark-700">Adresse:</span>
                          <p className="text-dark-900">{selectedProperty.address || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-dark-700">Type:</span>
                          <p className="text-dark-900">
                            {selectedProperty.propertyType === 'apartment' ? 'Appartement' : 
                            selectedProperty.propertyType === 'house' ? 'Maison' : 'Studio'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-dark-700">Chambres:</span>
                          <p className="text-dark-900">{selectedProperty.availableRooms}/{selectedProperty.totalRooms}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-dark-700">Statut:</span>
                          <p className={selectedProperty.isAvailable ? 'badge badge-success' : 'badge badge-danger'}>
                            {selectedProperty.isAvailable ? 'Disponible' : 'Occupé'}
                          </p>
                        </div>
                      </div>
                      
                      {selectedProperty.description && (
                        <div className="mb-4">
                          <span className="text-sm font-medium text-dark-700">Description:</span>
                          <p className="text-dark-900 mt-1 bg-dark-50 p-3 rounded-lg">{selectedProperty.description}</p>
                        </div>
                      )}
                      
                      {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                        <div className="mb-4">
                          <span className="text-sm font-medium text-dark-700">Équipements:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedProperty.amenities.map((amenity: string, index: number) => (
                              <span key={index} className="badge badge-primary text-xs">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-6 pt-4 border-t border-dark-200">
                        <button
                          onClick={() => setDeleteModal({ open: true, type: 'property', id: selectedProperty.id, reason: '' })}
                          className="btn-danger text-sm flex items-center space-x-2"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          <span>Supprimer ce logement</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {props.map(p => (
                      <div 
                        key={p.id} 
                        className="border border-dark-200 rounded-lg p-4 hover:bg-dark-50 cursor-pointer transition-shadow hover:shadow-md"
                        onClick={async () => {
                          try {
                            const data = await apiGet(`/api/properties/get_by_id/${p.id}`);
                            if (data.success) {
                              setSelectedProperty(data.data);
                            }
                          } catch (error) {
                            toast.error('Erreur lors du chargement du logement');
                          }
                        }}
                      >
                        {/* Image de la propriété */}
                        {p.images && p.images.length > 0 && (
                          <div className="mb-3 relative">
                            <img
                              src={getImageUrl(p.images[0])}
                              alt={p.title}
                              className="w-full h-40 object-cover rounded-lg"
                            />
                            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                              {p.propertyType === 'apartment' ? '🏢' : p.propertyType === 'house' ? '🏠' : '🏡'}
                            </div>
                          </div>
                        )}
                        
                        <div className="mb-2">
                          <span className="text-xs text-dark-500">ID: {p.id}</span>
                        </div>
                        
                        <h3 className="text-sm font-semibold text-dark-900 mb-2 line-clamp-2">
                          {p.title || 'Sans titre'}
                        </h3>
                        
                        <div className="flex items-center text-dark-600 mb-2 text-xs">
                          <MapPinIcon className="w-3 h-3 mr-1" />
                          <span className="line-clamp-1">{p.address || p.district || 'Adresse non spécifiée'}</span>
                        </div>
                        
                        <p className="text-lg font-bold text-primary-600 mb-3">
                          {p.price?.toLocaleString()} Ar/mois
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-dark-500">
                          <span>
                            {p.availableRooms}/{p.totalRooms} ch.
                          </span>
                          <span className={`badge ${p.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                            {p.isAvailable ? 'Disponible' : 'Occupé'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <button
                            className="btn-secondary text-xs"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const data = await apiGet(`/api/properties/get_by_id/${p.id}`);
                                if (data.success) {
                                  setSelectedProperty(data.data);
                                }
                              } catch (error) {
                                toast.error('Erreur lors du chargement du logement');
                              }
                            }}
                          >
                            Détails
                          </button>
                          <button
                            className="btn-danger text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModal({ open: true, type: 'property', id: p.id, reason: '' });
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                    {props.length === 0 && (
                      <p className="text-dark-600 text-center py-8 col-span-full">Aucun appartement publié</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cin' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-dark-900">CIN à Vérifier</h2>
                {cinToVerify.length === 0 ? (
                  <p className="text-dark-600 text-center py-8">Aucune CIN en attente de vérification</p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {cinToVerify.map(cin => (
                      <div
                        key={cin.id}
                        className={`border rounded-lg p-6 ${
                          cin.isExpired ? 'border-red-500 bg-red-50' : 'border-dark-200'
                        }`}
                      >
                        <div className="mb-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-dark-900 mb-1">
                                {cin.firstName} {cin.lastName}
                              </h3>
                              <p className="text-sm text-dark-600 mb-1">{cin.email}</p>
                              <div className="bg-dark-100 rounded p-2 mt-2">
                                <p className="text-sm font-medium text-dark-700">
                                  Numéro CIN: <span className="font-bold text-dark-900">{cin.cinNumber || 'Non renseigné'}</span>
                                </p>
                              </div>
                              {cin.isExpired && (
                                <p className="text-xs text-red-600 mt-2 font-medium bg-red-100 p-2 rounded">
                                  ⚠️ Délai de 24h dépassé - Compte éligible à suppression
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4 mb-4">
                          {cin.cinRectoImagePath ? (
                            <div>
                              <p className="text-sm font-medium text-dark-700 mb-2">Recto de la CIN</p>
                              <div className="relative">
                                <img
                                  src={getImageUrl(cin.cinRectoImagePath)}
                                  alt="CIN Recto"
                                  className="w-full h-64 object-contain bg-dark-50 rounded border-2 border-dark-200 hover:border-primary-400 transition-colors cursor-zoom-in"
                                  onError={(e) => {
                                    console.error('Erreur chargement image CIN recto:', cin.cinRectoImagePath);
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = '/api/placeholder/300/200';
                                  }}
                                  onClick={() => {
                                    const url = getImageUrl(cin.cinRectoImagePath);
                                    if (url) window.open(url, '_blank');
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-100 rounded p-4 text-center">
                              <p className="text-sm text-gray-600">Image recto non disponible</p>
                            </div>
                          )}
                          {cin.cinVersoImagePath ? (
                            <div>
                              <p className="text-sm font-medium text-dark-700 mb-2">Verso de la CIN</p>
                              <div className="relative">
                                <img
                                  src={getImageUrl(cin.cinVersoImagePath)}
                                  alt="CIN Verso"
                                  className="w-full h-64 object-contain bg-dark-50 rounded border-2 border-dark-200 hover:border-primary-400 transition-colors cursor-zoom-in"
                                  onError={(e) => {
                                    console.error('Erreur chargement image CIN verso:', cin.cinVersoImagePath);
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = '/api/placeholder/300/200';
                                  }}
                                  onClick={() => {
                                    const url = getImageUrl(cin.cinVersoImagePath);
                                    if (url) window.open(url, '_blank');
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-100 rounded p-4 text-center">
                              <p className="text-sm text-gray-600">Image verso non disponible</p>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-3 pt-4 border-t border-dark-200">
                          <button
                            onClick={() => handleVerifyCIN(cin.id, true)}
                            className="flex-1 btn-primary text-sm flex items-center justify-center space-x-2"
                          >
                            <CheckIcon className="w-5 h-5" />
                            <span>Approuver</span>
                          </button>
                          <button
                            onClick={() => handleRejectCINClick(cin.id)}
                            className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-2"
                          >
                            <XMarkIcon className="w-5 h-5" />
                            <span>Rejeter</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4 text-dark-900 flex items-center space-x-2">
                    <BellIcon className="w-6 h-6" />
                    <span>Notifications</span>
                  </h2>
                  
                  <div className="space-y-4">
                    {pendingCinCount > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-900 mb-2">
                          {pendingCinCount} CIN en attente de vérification
                        </h3>
                        <button
                          onClick={() => setActiveTab('cin')}
                          className="text-sm text-yellow-700 hover:text-yellow-900 underline"
                        >
                          Voir les CIN à vérifier
                        </button>
                      </div>
                    )}

                    {newUsersCount > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">
                          {newUsersCount} nouveau(x) utilisateur(s) dans les dernières 24h
                        </h3>
                        <button
                          onClick={() => setActiveTab('users')}
                          className="text-sm text-blue-700 hover:text-blue-900 underline"
                        >
                          Voir les utilisateurs
                        </button>
                      </div>
                    )}

                    {pendingCinCount === 0 && newUsersCount === 0 && (
                      <p className="text-dark-600 text-center py-8">Aucune notification</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center space-x-2">
                    <CogIcon className="w-6 h-6" />
                    <span>Paramètres de la plateforme</span>
                  </h2>

                  <div className="space-y-6">
                    {/* Section Conditions d'utilisation */}
                    <section className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Conditions d'utilisation</h3>
                      <p className="text-gray-700 mb-4">
                        Gérez les conditions d'utilisation de la plateforme. Les utilisateurs doivent accepter ces conditions lors de l'inscription.
                      </p>
                      <div className="flex space-x-3">
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary"
                        >
                          <DocumentTextIcon className="w-5 h-5 inline mr-2" />
                          Voir les conditions
                        </a>
                        <button
                          onClick={() => window.open('/terms', '_blank')}
                          className="btn-primary"
                        >
                          Modifier
                        </button>
                      </div>
                    </section>

                    {/* Section Politique de confidentialité */}
                    <section className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Politique de confidentialité</h3>
                      <p className="text-gray-700 mb-4">
                        Gérez la politique de confidentialité de la plateforme. Cette politique explique comment nous collectons et utilisons les données.
                      </p>
                      <div className="flex space-x-3">
                        <a
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary"
                        >
                          <DocumentTextIcon className="w-5 h-5 inline mr-2" />
                          Voir la politique
                        </a>
                        <button
                          onClick={() => window.open('/privacy', '_blank')}
                          className="btn-primary"
                        >
                          Modifier
                        </button>
                      </div>
                    </section>

                    {/* Section Paramètres généraux */}
                    <section className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres généraux</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Vérification CIN obligatoire</p>
                            <p className="text-sm text-gray-600">Les propriétaires doivent vérifier leur CIN pour publier</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Notifications par email</p>
                            <p className="text-sm text-gray-600">Envoyer des notifications par email aux utilisateurs</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Messages automatiques</p>
                            <p className="text-sm text-gray-600">Envoyer des messages automatiques pour les actions admin</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </section>

                    {/* Section Mode maintenance */}
                    <section className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Mode maintenance</h3>
                      <p className="text-gray-700 mb-4">
                        Activez le mode maintenance pour effectuer des mises à jour sans que les utilisateurs puissent accéder à la plateforme.
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Activer le mode maintenance</p>
                          <p className="text-sm text-gray-600">La plateforme sera inaccessible aux utilisateurs non administrateurs</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      {false && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Mode maintenance actif</strong> - Les utilisateurs verront un message de maintenance lors de leur connexion.
                          </p>
                        </div>
                      )}
                    </section>

                    {/* Section Configuration email */}
                    <section className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration email</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Serveur SMTP
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="smtp.example.com"
                            defaultValue="smtp.gmail.com"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Port
                            </label>
                            <input
                              type="number"
                              className="input-field"
                              placeholder="587"
                              defaultValue="587"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email expéditeur
                            </label>
                            <input
                              type="email"
                              className="input-field"
                              placeholder="noreply@example.com"
                            />
                          </div>
                        </div>
                        <button className="btn-primary">
                          Tester la configuration email
                        </button>
                      </div>
                    </section>

                    {/* Section Sécurité */}
                    <section className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de sécurité</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Authentification à deux facteurs (2FA)</p>
                            <p className="text-sm text-gray-600">Recommandé pour les comptes administrateurs</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Limite de tentatives de connexion</p>
                            <p className="text-sm text-gray-600">Bloquer après 5 tentatives échouées</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Journalisation des actions admin</p>
                            <p className="text-sm text-gray-600">Enregistrer toutes les actions administratives</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </section>

                    {/* Section Sauvegarde */}
                    <section className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sauvegarde et restauration</h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-900">Dernière sauvegarde</p>
                              <p className="text-sm text-blue-700">Il y a 2 heures - Taille: 45.2 MB</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button className="btn-primary">
                            Créer une sauvegarde maintenant
                          </button>
                          <button className="btn-secondary">
                            Restaurer depuis une sauvegarde
                          </button>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <p className="font-medium text-gray-900">Sauvegarde automatique</p>
                            <p className="text-sm text-gray-600">Sauvegarder la base de données quotidiennement</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </section>

                    {/* Section API et intégrations */}
                    <section className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">API et intégrations</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Clé API Cloudinary
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="password"
                              className="input-field flex-1"
                              placeholder="••••••••••••"
                              defaultValue="••••••••••••"
                            />
                            <button className="btn-secondary">
                              Afficher
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Utilisée pour l'upload d'images</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Webhook URL (optionnel)
                          </label>
                          <input
                            type="url"
                            className="input-field"
                            placeholder="https://example.com/webhook"
                          />
                          <p className="text-xs text-gray-500 mt-1">URL pour recevoir les notifications d'événements</p>
                        </div>
                      </div>
                    </section>

                    {/* Section Statistiques */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques de la plateforme</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Utilisateurs totaux</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Logements actifs</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Annonces actives</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalAnnouncements}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Vérifications en attente</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.pendingVerifications}</p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            )}

            {/* User Modal */}
            {userModal.open && userModal.user && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-dark-100 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-dark-900">
                      Informations de l'utilisateur
                    </h3>
                    <button
                      onClick={() => setUserModal({ open: false, user: null })}
                      className="text-dark-600 hover:text-dark-900"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* ... (contenu du modal utilisateur) ... */}
                  </div>
                </div>
              </div>
            )}

            {/* Delete Modal */}
            {deleteModal.open && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-dark-100 rounded-lg max-w-md w-full p-6">
                  <h3 className="text-lg font-semibold text-dark-900 mb-4">
                    Supprimer {deleteModal.type === 'user' ? 'l\'utilisateur' : 
                            deleteModal.type === 'announcement' ? 'l\'annonce' : 'le logement'}
                  </h3>
                  <p className="text-sm text-dark-700 mb-4">
                    Veuillez saisir la raison de la suppression {deleteModal.type === 'user' || deleteModal.type === 'announcement' ? '(sera envoyée par email):' : ':'}
                  </p>
                  <textarea
                    value={deleteModal.reason}
                    onChange={(e) => setDeleteModal({ ...deleteModal, reason: e.target.value })}
                    className="input-field w-full mb-4"
                    rows={4}
                    placeholder="Raison de la suppression..."
                  />
                  <div className="flex space-x-3 justify-end">
                    <button
                      onClick={() => setDeleteModal({ open: false, type: null, id: null, reason: '' })}
                      className="btn-secondary"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        if (deleteModal.type === 'user') handleDeleteUser();
                        else if (deleteModal.type === 'announcement') handleDeleteAnnouncement();
                        else if (deleteModal.type === 'property') handleDeleteProperty();
                      }}
                      className="btn-danger"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CIN Reject Modal */}
            {cinRejectModal.open && cinRejectModal.userId && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Rejeter la vérification CIN
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Veuillez saisir la raison du rejet (sera envoyée à l'utilisateur) :
                  </p>
                  <textarea
                    value={cinRejectModal.reason}
                    onChange={(e) => setCinRejectModal({ ...cinRejectModal, reason: e.target.value })}
                    className="input-field w-full mb-4"
                    rows={4}
                    placeholder="Raison du rejet..."
                    required
                  />
                  <div className="flex space-x-3 justify-end">
                    <button
                      onClick={() => setCinRejectModal({ open: false, userId: null, reason: '' })}
                      className="btn-secondary"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        if (!cinRejectModal.reason.trim()) {
                          toast.error('Veuillez saisir une raison');
                          return;
                        }
                        handleVerifyCIN(cinRejectModal.userId!, false, cinRejectModal.reason);
                      }}
                      className="btn-danger"
                    >
                      Rejeter
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default AdminPage;
