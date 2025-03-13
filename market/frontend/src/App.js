import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AnimatePresence } from 'framer-motion';

// Composants de mise en page
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Composants communs
import ErrorBoundary from './components/common/ErrorBoundary';
import AnimatedPage from './components/common/AnimatedPage';
import SkeletonLoader from './components/common/SkeletonLoader';
import ScrollToTop from './components/common/ScrollToTop';
import BackToTop from './components/common/BackToTop';

// Routes d'administration
import AdminRoutes from './components/admin/AdminRoutes';

// Contextes
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

// Chargement paresseux des pages pour améliorer les performances
const HomePage = lazy(() => import('./pages/HomePage'));
const AppsPage = lazy(() => import('./pages/AppsPage'));
const AppDetailPage = lazy(() => import('./pages/AppDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Composant pour les routes protégées
const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  
  if (!isLoggedIn()) {
    // Rediriger vers la page de connexion avec l'URL de retour
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return children;
};

// Composant pour le chargement des pages
const PageLoader = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '50vh' 
  }}>
    <CircularProgress />
  </Box>
);

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <ScrollToTop />
            {isAdminRoute ? (
              // Routes d'administration
              <AdminRoutes />
            ) : (
              // Routes publiques
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
                <Header />
                <Box component="main" sx={{ flexGrow: 1 }}>
                  <BackToTop threshold={300} />
                  <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                      <Route path="/" element={
                        <Suspense fallback={<PageLoader />}>
                          <AnimatedPage>
                            <HomePage />
                          </AnimatedPage>
                        </Suspense>
                      } />
                      <Route path="/apps" element={
                        <Suspense fallback={<PageLoader />}>
                          <AnimatedPage>
                            <AppsPage />
                          </AnimatedPage>
                        </Suspense>
                      } />
                      <Route path="/apps/:appId" element={
                        <Suspense fallback={<PageLoader />}>
                          <AnimatedPage>
                            <AppDetailPage />
                          </AnimatedPage>
                        </Suspense>
                      } />
                      <Route path="/login" element={
                        <Suspense fallback={<PageLoader />}>
                          <AnimatedPage>
                            <LoginPage />
                          </AnimatedPage>
                        </Suspense>
                      } />
                      <Route path="/register" element={
                        <Suspense fallback={<PageLoader />}>
                          <AnimatedPage>
                            <RegisterPage />
                          </AnimatedPage>
                        </Suspense>
                      } />
                      <Route path="/profile" element={
                        <PrivateRoute>
                          <Suspense fallback={<PageLoader />}>
                            <AnimatedPage>
                              <ProfilePage />
                            </AnimatedPage>
                          </Suspense>
                        </PrivateRoute>
                      } />
                      <Route path="*" element={
                        <Suspense fallback={<PageLoader />}>
                          <AnimatedPage>
                            <NotFoundPage />
                          </AnimatedPage>
                        </Suspense>
                      } />
                    </Routes>
                  </AnimatePresence>
                </Box>
                <Footer />
              </Box>
            )}
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
