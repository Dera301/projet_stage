import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageContext';
import CINVerificationModal from './CINVerificationModal';
import { useCINVerification } from '../hooks/useCINVerification';
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon as LogoutIcon, 
  Bars3Icon as MenuIcon, 
  XMarkIcon as XIcon,
  ChatBubbleLeftRightIcon as ChatIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const logoSrc = `${process.env.PUBLIC_URL}/logo_colo.svg`;

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { conversations } = useMessage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  
  // Vérification CIN
  const {
    showVerificationModal,
    setShowVerificationModal,
    checkVerification,
    requiresVerification,
    onClickHandler
  } = useCINVerification();
  
  // Gestion des clics sur les liens protégés
  const handleProtectedAction = useCallback((e: React.MouseEvent, path: string) => {
    if (requiresVerification) {
      e.preventDefault();
      setShowVerificationModal(true);
      return false;
    }
    navigate(path);
    return true;
  }, [requiresVerification, navigate, setShowVerificationModal]);

  const [badgeHidden, setBadgeHidden] = useState(false);

  useEffect(() => {
    if (!user || badgeHidden) {
      setUnreadMessagesCount(0);
      return;
    }

    const totalUnread = conversations.reduce((acc, conv) => {
      const last = conv.lastMessage;
      if (!last) return acc;

      const isFromOther = String(last.senderId) !== String(user.id);
      const isUnread = !last.isRead;

      // Si le dernier message est non lu et vient de l'autre, on compte 1
      return acc + (isFromOther && isUnread ? 1 : 0);
    }, 0);

    setUnreadMessagesCount(totalUnread);
  }, [conversations, user, badgeHidden]);

  useEffect(() => {
  if (!user) return;

  const hasNewUnread = conversations.some(conv => {
    const last = conv.lastMessage;
    if (!last) return false;
    const isFromOther = String(last.senderId) !== String(user.id);
    return isFromOther && !last.isRead;
  });

  if (hasNewUnread) {
    setBadgeHidden(false);
  }
}, [conversations, user]);
  // Fonction de déconnexion

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Fonction pour déterminer si un lien est actif
  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  // Fonction pour formater le badge de message comme Messenger
  const formatMessageBadge = (count: number) => {
    if (count === 0) return null;
    if (count > 99) return '99+';
    return count.toString();
  };

  // Style pour les liens actifs
  const getLinkClass = (path: string) => {
    const baseClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
    const activeClass = "text-primary-600 bg-primary-50 border-b-2 border-primary-600";
    const inactiveClass = "text-gray-700 hover:text-primary-600 hover:bg-gray-50";
    
    return `${baseClass} ${isActiveLink(path) ? activeClass : inactiveClass}`;
  };

  // Masquer complètement la navbar publique pour les comptes administrateurs
  if (user && user.userType === 'admin') {
    return null;
  }

  return (
    <>
      <CINVerificationModal 
        isOpen={showVerificationModal} 
        onClose={() => {
          setShowVerificationModal(false);
        }}
        backButtonText="Fermer"
      />
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/logo_colo.svg" alt="ColocAntananarivo" className="h-20 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className={getLinkClass('/')}
            >
              Accueil
            </Link>
            
            {/* Lien Dashboard visible seulement si connecté */}
            {user && (
              <Link 
                to="/dashboard" 
                className={getLinkClass('/dashboard')}
              >
                Dashboard
              </Link>
            )}
            
            <Link 
              to="/logements" 
              className={getLinkClass('/logements')}
            >
              Logements
            </Link>
            <Link 
              to="/announcements" 
              className={getLinkClass('/announcements')}
            >
              Annonces
            </Link>
            
            <Link 
              to="/about" 
              className={getLinkClass('/about')}
            >
              À propos
            </Link>
            <Link 
              to="/contact" 
              className={getLinkClass('/contact')}
            >
              Contact
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                {user.userType === 'owner' && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (checkVerification(e)) {
                        navigate('/create-property');
                      }
                    }}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Publier</span>
                  </button>
                )}

                {user.userType === 'student' && (
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
                
                {/* Badge de messages style Messenger */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    checkVerification(e) && navigate('/messages');
                  }}
                  className="relative p-2 text-gray-600 hover:text-primary-600 rounded-full hover:bg-gray-100"
                >
                  <ChatIcon className="h-6 w-6" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {formatMessageBadge(unreadMessagesCount)}
                    </span>
                  )}
                </button>
                
                <div className="relative group">
                  <button className={`
                    flex items-center space-x-2 p-2 rounded-md transition-colors
                    ${isActiveLink('/profile') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'}
                  `}>
                    {user.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium max-w-24 truncate">
                      {user.firstName}
                    </span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                    >
                      Tableau de bord
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                    >
                      Mon profil
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors"
                    >
                      <LogoutIcon className="w-4 h-4 inline mr-2" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={getLinkClass('/login')}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 p-2 rounded-md transition-colors"
            >
              {isMenuOpen ? (
                <XIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2 border border-gray-200">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActiveLink('/') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              
              {/* Lien Dashboard dans le menu mobile si connecté */}
              {user && (
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActiveLink('/dashboard') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              
              <Link
                to="/logements"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActiveLink('/logements') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Logements
              </Link>
              <Link
                to="/announcements"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActiveLink('/announcements') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Annonces
              </Link>
              
              <Link
                to="/about"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActiveLink('/about') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                À propos
              </Link>
              <Link
                to="/contact"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActiveLink('/contact') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {user ? (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt="avatar" className="w-5 h-5 rounded-full object-cover mr-3" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                        )}
                        <span className="text-sm font-medium text-gray-900 max-w-32 truncate">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                      {/* Badge mobile */}
                      {unreadMessagesCount > 0 && (
                        <button 
                          onClick={(e) => handleProtectedAction(e, '/messages')}
                          className="relative"
                        >
                          <span className={`
                            bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center
                          `}>
                            {formatMessageBadge(unreadMessagesCount)}
                          </span>
                        </button>
                      )}
                    </div>
                    
                    <Link
                      to="/dashboard"
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActiveLink('/dashboard') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Tableau de bord
                    </Link>
                    <Link
                      to="/profile"
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActiveLink('/profile') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mon profil
                    </Link>
                    <button 
                      onClick={(e) => {
                        onClickHandler(e, '/messages');
                        setIsMenuOpen(false);
                      }}
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center justify-between ${
                        isActiveLink('/messages') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>Messages</span>
                      {unreadMessagesCount > 0 && (
                        <span className={`
                          bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center
                        `}>
                          {formatMessageBadge(unreadMessagesCount)}
                        </span>
                      )}
                    </button>
                    {user.userType === 'owner' && (
                      <button
                        onClick={(e) => {
                          onClickHandler(e, '/create-property');
                          setIsMenuOpen(false);
                        }}
                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          isActiveLink('/create-property') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                        }`}
                      >
                        Publier un logement
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      Déconnexion
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <Link
                    to="/login"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActiveLink('/login') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary block text-center mx-3 mt-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
};

export default Navbar;