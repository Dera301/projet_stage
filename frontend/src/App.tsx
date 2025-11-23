import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { PropertyProvider } from './contexts/PropertyContext';
import { MessageProvider } from './contexts/MessageContext';
import { AnnouncementProvider } from './contexts/AnnouncementContext';
import PageTransition from './components/PageTransition';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import PropertyListPage from './pages/PropertyListPage';
import CreatePropertyPage from './pages/CreatePropertyPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import AnnouncementDetailPage from './pages/AnnouncementDetailPage';
import CreateAnnouncementPage from './pages/CreateAnnouncementPage';
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CINVerificationPage from './pages/CINVerificationPage';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import EditPropertyPage from './pages/EditPropertyPage';
import EditAnnouncementPage from './pages/EditAnnouncementPage';
import CINVerificationBanner from './components/CINVerificationBanner';
import ScrollToTopButton from './components/ScrollToTopButton';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminRegisterPage from './pages/AdminRegisterPage';
import AppointmentsPage from './pages/AppointmentsPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

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

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      {!isAdminAuthPage && <Navbar />}
      {!isAdminAuthPage && <CINVerificationBanner />}
      
      {/* 🔥 CORRECTION : Main container avec gestion du débordement */}
      <main className="flex-grow w-full overflow-x-hidden pt-16">
        <div className="w-full max-w-full overflow-x-hidden">
          <AnimatePresence mode="wait" initial={false}>
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
          </AnimatePresence>
        </div>
      </main>

      {!isAdminAuthPage && (
        <div className="w-full overflow-x-hidden">
          <Footer />
        </div>
      )}
      
      {!isAdminAuthPage && <ScrollToTopButton />}
      
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
    <AuthProvider>
      <PropertyProvider>
        <MessageProvider>
          <AnnouncementProvider>
            <Router>
              {/* 🔥 CORRECTION : Container principal avec gestion du débordement */}
              <div className="w-full overflow-x-hidden">
                <AppContent />
              </div>
            </Router>
          </AnnouncementProvider>
        </MessageProvider>
      </PropertyProvider>
    </AuthProvider>
  );
}

export default App;