import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProperty } from '../contexts/PropertyContext';
import { 
  HomeIcon, 
  PlusIcon, 
  EyeIcon, 
  ChatBubbleLeftRightIcon as ChatIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { properties } = useProperty();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const userProperties = properties.filter(p => p.ownerId === user.id);
  const recentProperties = properties.slice(0, 3);

  const stats = user.userType === 'student' ? [
    {
      name: 'Recherches effectuées',
      value: '12',
      change: '+2 cette semaine',
      changeType: 'positive',
      icon: <TrendingUpIcon className="w-6 h-6" />
    },
    {
      name: 'Messages reçus',
      value: '8',
      change: '+3 aujourd\'hui',
      changeType: 'positive',
      icon: <ChatIcon className="w-6 h-6" />
    },
    {
      name: 'Visites planifiées',
      value: '3',
      change: '2 cette semaine',
      changeType: 'neutral',
      icon: <CalendarIcon className="w-6 h-6" />
    },
    {
      name: 'Favoris',
      value: '5',
      change: '+1 cette semaine',
      changeType: 'positive',
      icon: <CheckCircleIcon className="w-6 h-6" />
    }
  ] : [
    {
      name: 'Logements publiés',
      value: userProperties.length.toString(),
      change: '+1 ce mois',
      changeType: 'positive',
      icon: <HomeIcon className="w-6 h-6" />
    },
    {
      name: 'Demandes reçues',
      value: '15',
      change: '+5 cette semaine',
      changeType: 'positive',
      icon: <UsersIcon className="w-6 h-6" />
    },
    {
      name: 'Revenus mensuels',
      value: '450,000 Ar',
      change: '+12% ce mois',
      changeType: 'positive',
      icon: <CurrencyDollarIcon className="w-6 h-6" />
    },
    {
      name: 'Taux d\'occupation',
      value: '85%',
      change: '+5% ce mois',
      changeType: 'positive',
      icon: <TrendingUpIcon className="w-6 h-6" />
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'message',
      title: 'Nouveau message de Marie Rakoto',
      description: 'Intéressée par votre logement à Analakely',
      time: 'Il y a 2 heures',
      icon: <ChatIcon className="w-5 h-5" />
    },
    {
      id: 2,
      type: 'visit',
      title: 'Visite planifiée',
      description: 'Jean Dupont souhaite visiter demain à 14h',
      time: 'Il y a 4 heures',
      icon: <CalendarIcon className="w-5 h-5" />
    },
    {
      id: 3,
      type: 'application',
      title: 'Nouvelle candidature',
      description: 'Sofia Andriamalala a postulé pour votre logement',
      time: 'Il y a 1 jour',
      icon: <UsersIcon className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                        <p className="text-sm text-gray-600">Ajouter une nouvelle annonce</p>
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
                  </>
                ) : (
                  <>
                    <Link
                      to="/search"
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
                  </>
                )}
              </div>
            </div>

            {/* Recent Properties */}
            {user.userType === 'owner' && userProperties.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Mes logements</h2>
                  <Link
                    to="/properties"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Voir tout
                  </Link>
                </div>
                <div className="space-y-4">
                  {userProperties.slice(0, 3).map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{property.title}</h3>
                        <p className="text-sm text-gray-600">{property.address}</p>
                        <p className="text-sm text-gray-500">
                          {property.availableRooms} chambre(s) disponible(s) • {property.price.toLocaleString()} Ar/mois
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`badge ${property.isAvailable ? 'badge-success' : 'badge-warning'}`}>
                          {property.isAvailable ? 'Disponible' : 'Occupé'}
                        </span>
                        <Link
                          to={`/properties/${property.id}`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Properties for Students */}
            {user.userType === 'student' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Logements récents</h2>
                  <Link
                    to="/properties"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Voir tout
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentProperties.map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{property.title}</h3>
                        <p className="text-sm text-gray-600">{property.address}</p>
                        <p className="text-sm text-gray-500">
                          {property.availableRooms} chambre(s) • {property.price.toLocaleString()} Ar/mois
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/properties/${property.id}`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                      </div>
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
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Profil</span>
                    <span className="text-gray-900">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-gray-600">Informations de base</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-gray-600">Photo de profil</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <ClockIcon className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="text-gray-600">Description personnelle</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <XCircleIcon className="w-4 h-4 text-gray-400 mr-2" />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
