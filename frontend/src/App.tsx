import React, { lazy, Suspense, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { PropertyProvider } from './contexts/PropertyContext';
import { MessageProvider } from './contexts/MessageContext';
import { AnnouncementProvider } from './contexts/AnnouncementContext';
import ErrorBoundary from './components/ErrorBoundary';

// Composants de chargement
import PageTransition from './components/PageTransition';
import LoadingSpinner from './components/LoadingSpinner';

// Chargement paresseux des pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const VerifyAccountPage = lazy(() => import('./pages/VerifyAccountPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'));
const PropertyListPage = lazy(() => import('./pages/PropertyListPage'));
const CreatePropertyPage = lazy(() => import('./pages/CreatePropertyPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const AnnouncementsPage = lazy(() => import('./pages/AnnouncementsPage'));
const AnnouncementDetailPage = lazy(() => import('./pages/AnnouncementDetailPage'));
const CreateAnnouncementPage = lazy(() => import('./pages/CreateAnnouncementPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CINVerificationPage = lazy(() => import('./pages/CINVerificationPage'));
const EditPropertyPage = lazy(() => import('./pages/EditPropertyPage'));
const EditAnnouncementPage = lazy(() => import('./pages/EditAnnouncementPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminRegisterPage = lazy(() => import('./pages/AdminRegisterPage'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));

// Composants UI
const Navbar = lazy(() => import('./components/Navbar'));
const Footer = lazy(() => import('./components/Footer'));
const FirstLoginGuide = lazy(() => import('./components/FirstLoginGuide'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const AdminRoute = lazy(() => import('./components/AdminRoute'));
const CINVerificationBanner = lazy(() => import('./components/CINVerificationBanner'));
const ScrollToTopButton = lazy(() => import('./components/ScrollToTopButton'));

// Composant de chargement par défaut
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="large" />
  </div>
);

function AppContent() {
  const location = useLocation();
  const isAdminAuthPage = location.pathname.startsWith('/admin/login') || location.pathname.startsWith('/admin/register');
  
  // Ajouter un padding-top pour compenser la navbar fixe
  React.useEffect(() => {
    document.documentElement.style.setProperty('--navbar-height', '64px');
  }, []);

  // Smooth scroll to top on route change
  React.useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // Mémoïser le contenu conditionnel pour éviter les rendus inutiles
  const navbarContent = useMemo(() => !isAdminAuthPage && (
    <Suspense fallback={null}>
      <Navbar />
      <CINVerificationBanner />
    </Suspense>
  ), [isAdminAuthPage]);

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      {navbarContent}
      
      {/* Main container avec gestion du débordement */}
      <main className="flex-grow w-full overflow-x-hidden pt-16">
        <div className="w-full max-w-full overflow-x-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <Suspense fallback={<LoadingFallback />}>
              <Routes location={location} key={location.pathname}>
                {/* Routes Admin (sans Navbar/Footer) */}
                <Route path="/admin/login" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <AdminLoginPage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/admin/register" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <AdminRegisterPage />
                    </div>
                  </PageTransition>
                } />                        
                {/* Routes publiques */}
                <Route path="/" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <HomePage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/login" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <LoginPage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/register" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <RegisterPage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/verify-account" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <VerifyAccountPage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/about" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <AboutPage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/contact" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <ContactPage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/terms" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <TermsPage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/privacy" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <PrivacyPage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/logements" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <SearchPage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/properties/:id" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <PropertyDetailPage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/properties" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <PropertyListPage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/edit-property/:id" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <EditPropertyPage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/edit-announcement/:id" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <EditAnnouncementPage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/cin-verification" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <CINVerificationPage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/appointments" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <AppointmentsPage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/admin" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <AdminRoute>
                        <AdminPage />
                      </AdminRoute>
                    </div>
                  </PageTransition>
                } />
                <Route path="/announcements" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <AnnouncementsPage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/announcements/:id" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <AnnouncementDetailPage />
                    </div>
                  </PageTransition>
                } />
                <Route path="/create-announcement" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <ProtectedRoute>
                        <CreateAnnouncementPage />
                      </ProtectedRoute>
                    </div>
                  </PageTransition>
                } />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    </div>
                  </PageTransition>
                } />
                <Route path="/create-property" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <ProtectedRoute>
                        <CreatePropertyPage />
                      </ProtectedRoute>
                    </div>
                  </PageTransition>
                } />
                <Route path="/profile" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    </div>
                  </PageTransition>
                } />
                <Route path="/messages" element={
                  <PageTransition>
                    <div className="w-full overflow-x-hidden">
                      <ProtectedRoute>
                        <MessagesPage />
                      </ProtectedRoute>
                    </div>
                  </PageTransition>
                } />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </div>
      </main>

      {!isAdminAuthPage && (
        <div className="w-full overflow-x-hidden">
          <Footer />
        </div>
      )}
      
      {!isAdminAuthPage && <ScrollToTopButton />}
      {!isAdminAuthPage && <FirstLoginGuide />}
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorBoundary>
        <Router>
          <AuthProvider>
            <PropertyProvider>
              <MessageProvider>
                <AnnouncementProvider>
                  <AppContent />
                </AnnouncementProvider>
              </MessageProvider>
            </PropertyProvider>
          </AuthProvider>
        </Router>
      </ErrorBoundary>
    </Suspense>
  );
}

export default App;