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

function AppContent() {
  const location = useLocation();
  const isAdminAuthPage = location.pathname.startsWith('/admin/login') || location.pathname.startsWith('/admin/register');

  // Smooth scroll to top on route change
  React.useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminAuthPage && <Navbar />}
      {!isAdminAuthPage && <CINVerificationBanner />}
      <main className="flex-grow">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            {/* Routes Admin (sans Navbar/Footer) */}
            <Route path="/admin/login" element={<PageTransition><AdminLoginPage /></PageTransition>} />
            <Route path="/admin/register" element={<PageTransition><AdminRegisterPage /></PageTransition>} />
                    
            {/* Routes publiques */}
            <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
            <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
            <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
            <Route path="/logements" element={<PageTransition><SearchPage /></PageTransition>} />
            <Route path="/properties/:id" element={<PageTransition><PropertyDetailPage /></PageTransition>} />
            <Route path="/properties" element={<PageTransition><PropertyListPage /></PageTransition>} />
            <Route path="/edit-property/:id" element={<PageTransition><EditPropertyPage /></PageTransition>} />
            <Route path="/edit-announcement/:id" element={<PageTransition><EditAnnouncementPage /></PageTransition>} />
            <Route path="/cin-verification" element={<PageTransition><CINVerificationPage /></PageTransition>} />
            <Route path="/appointments" element={<PageTransition><AppointmentsPage /></PageTransition>} />
            <Route path="/admin" element={
              <PageTransition>
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              </PageTransition>
            } />
            <Route path="/announcements" element={<PageTransition><AnnouncementsPage /></PageTransition>} />
            <Route path="/announcements/:id" element={<PageTransition><AnnouncementDetailPage /></PageTransition>} />
            <Route path="/create-announcement" element={
              <PageTransition>
                <ProtectedRoute>
                  <CreateAnnouncementPage />
                </ProtectedRoute>
              </PageTransition>
            } />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <PageTransition>
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              </PageTransition>
            } />
            <Route path="/create-property" element={
              <PageTransition>
                <ProtectedRoute>
                  <CreatePropertyPage />
                </ProtectedRoute>
              </PageTransition>
            } />
            <Route path="/profile" element={
              <PageTransition>
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              </PageTransition>
            } />
            <Route path="/messages" element={
              <PageTransition>
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              </PageTransition>
            } />
          </Routes>
        </AnimatePresence>
      </main>
        {!isAdminAuthPage && <Footer />}
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
              <AppContent />
            </Router>
          </AnnouncementProvider>
        </MessageProvider>
      </PropertyProvider>
    </AuthProvider>
  );
}

export default App;
