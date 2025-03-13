# Prompt pour Claude Sonnet 3.7 - Étape 7 : Tests et optimisation

## Contexte du projet

Tu travailles sur une Marketplace Web qui permet aux utilisateurs de découvrir, évaluer et télécharger des applications web. Les étapes 1 à 6 du projet ont été complétées avec succès :
- Étape 1 : Création d'un service API de base et d'un service d'authentification
- Étape 2 : Création des services API spécifiques pour les applications, catégories et utilisateurs
- Étape 3 : Mise à jour des composants d'administration pour utiliser les services API
- Étape 4 : Implémentation des pages publiques et mise à jour de la page d'accueil
- Étape 5 : Amélioration de l'expérience utilisateur
- Étape 6 : Intégration de Transkryptor, création de NotePad, et amélioration de l'infrastructure

Maintenant, tu dois ajouter des tests et optimiser les performances de l'application.

## État actuel du projet

### Applications

- **Marketplace** : Application principale avec frontend React et backend Node.js/Express/MongoDB
- **Transkryptor** : Application de transcription audio et d'analyse de contenu utilisant l'IA
- **NotePad** : Application simple de prise de notes

### Infrastructure

- **MongoDB** : Base de données installée et configurée sur le serveur
- **Nginx** : Configuration optimisée pour servir les applications
- **PM2** : Gestionnaire de processus pour les applications Node.js

### Problèmes identifiés

1. **Manque de tests** : Absence de tests unitaires et d'intégration
2. **Performances à optimiser** : Chargement des pages et des ressources à améliorer
3. **Sécurité à renforcer** : Audit de sécurité à effectuer
4. **Dépendances à mettre à jour** : Certaines dépendances peuvent être obsolètes ou contenir des vulnérabilités

## Ta mission

Tu dois ajouter des tests et optimiser les performances de l'application. Cela implique :

1. Ajouter des tests unitaires pour les services API et les composants React
2. Ajouter des tests d'intégration pour les flux utilisateur
3. Optimiser les performances de l'application
4. Améliorer la sécurité
5. Mettre à jour les dépendances

## Tâches spécifiques

### 1. Tests unitaires

#### Services API

- Créer des tests pour le service API de base (`api.js`)
- Créer des tests pour le service d'authentification (`auth.service.js`)
- Créer des tests pour les services des applications, catégories et utilisateurs
- Utiliser Jest et Supertest pour tester les API

#### Composants React

- Créer des tests pour les composants communs (`ErrorBoundary`, `AnimatedPage`, etc.)
- Créer des tests pour les composants d'application (`AppGallery`, `RatingForm`, etc.)
- Créer des tests pour les contextes (`AuthContext`, `ToastContext`, etc.)
- Utiliser React Testing Library et Jest pour tester les composants

### 2. Tests d'intégration

- Créer des tests pour les flux utilisateur (inscription, connexion, navigation, etc.)
- Créer des tests pour les formulaires (création d'application, évaluation, etc.)
- Créer des tests pour les interactions entre les composants
- Utiliser Cypress pour les tests d'intégration

### 3. Optimisation des performances

- Implémenter le lazy loading des composants avec React.lazy et Suspense
- Optimiser le code splitting pour réduire la taille du bundle
- Optimiser les images avec des formats modernes (WebP, AVIF)
- Mettre en place une stratégie de cache pour les ressources statiques
- Optimiser les requêtes API avec la pagination et le filtrage côté serveur

### 4. Amélioration de la sécurité

- Effectuer un audit de sécurité avec OWASP ZAP ou un outil similaire
- Corriger les vulnérabilités identifiées
- Renforcer la protection contre les attaques XSS, CSRF, etc.
- Améliorer la gestion des tokens JWT (rotation, révocation, etc.)

### 5. Mise à jour des dépendances

- Analyser les dépendances avec npm audit ou un outil similaire
- Mettre à jour les dépendances obsolètes ou vulnérables
- Tester l'application après chaque mise à jour importante
- Documenter les changements de version et les incompatibilités

## Spécifications techniques

### Tests unitaires

- Utiliser Jest comme framework de test
- Utiliser React Testing Library pour tester les composants React
- Utiliser Supertest pour tester les API
- Viser une couverture de code d'au moins 70%

### Tests d'intégration

- Utiliser Cypress pour les tests d'intégration
- Créer des scénarios de test pour les flux utilisateur principaux
- Tester sur différents navigateurs (Chrome, Firefox, Safari)
- Tester sur différentes tailles d'écran (desktop, tablet, mobile)

### Optimisation des performances

- Utiliser Lighthouse pour mesurer les performances
- Viser un score Lighthouse d'au moins 90 pour les performances
- Utiliser React.lazy et Suspense pour le chargement paresseux
- Utiliser React.memo pour éviter les rendus inutiles
- Utiliser useCallback et useMemo pour optimiser les fonctions et les calculs

### Sécurité

- Suivre les recommandations OWASP Top 10
- Utiliser Helmet pour configurer les en-têtes de sécurité
- Mettre en place une politique de mot de passe forte
- Implémenter la limitation de débit pour les API sensibles

## Exemples de code

### Exemple 1 : Test unitaire pour un service API

```javascript
// __tests__/services/auth.service.test.js
import { login, register, logout, getCurrentUser } from '../../src/services/auth.service';
import api from '../../src/services/api';

// Mock du service API
jest.mock('../../src/services/api', () => ({
  post: jest.fn(),
  get: jest.fn(),
  logDebug: jest.fn(),
  logError: jest.fn()
}));

describe('Auth Service', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
    
    // Mock de localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
  });
  
  describe('login', () => {
    it('should call api.post with correct parameters', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockResponse = { token: 'fake-token', user: { id: 1, name: 'Test User', email } };
      api.post.mockResolvedValue(mockResponse);
      
      // Act
      const result = await login(email, password);
      
      // Assert
      expect(api.post).toHaveBeenCalledWith('/auth/login', { email, password });
      expect(window.localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.user));
      expect(result).toEqual(mockResponse.user);
    });
    
    it('should handle login error', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrong-password';
      const mockError = new Error('Invalid credentials');
      api.post.mockRejectedValue(mockError);
      
      // Act & Assert
      await expect(login(email, password)).rejects.toThrow(mockError);
      expect(api.logError).toHaveBeenCalled();
    });
  });
  
  // Autres tests pour register, logout, getCurrentUser...
});
```

### Exemple 2 : Test unitaire pour un composant React

```javascript
// __tests__/components/common/ErrorBoundary.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../../src/components/common/ErrorBoundary';

// Composant qui génère une erreur
const ThrowError = () => {
  throw new Error('Test error');
  return null;
};

describe('ErrorBoundary', () => {
  // Supprimer les logs d'erreur de la console pendant les tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });
  
  it('should render children when there is no error', () => {
    // Arrange & Act
    render(
      <ErrorBoundary>
        <div data-testid="child">Child component</div>
      </ErrorBoundary>
    );
    
    // Assert
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
  
  it('should render error message when there is an error', () => {
    // Arrange & Act
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    // Assert
    expect(screen.getByText(/une erreur est survenue/i)).toBeInTheDocument();
    expect(screen.getByText(/rafraîchir la page/i)).toBeInTheDocument();
  });
});
```

### Exemple 3 : Test d'intégration avec Cypress

```javascript
// cypress/integration/auth.spec.js
describe('Authentication', () => {
  beforeEach(() => {
    // Visiter la page d'accueil avant chaque test
    cy.visit('/');
  });
  
  it('should allow a user to login', () => {
    // Cliquer sur le bouton de connexion
    cy.get('[data-testid="login-button"]').click();
    
    // Vérifier que nous sommes sur la page de connexion
    cy.url().should('include', '/login');
    
    // Remplir le formulaire de connexion
    cy.get('[data-testid="email-input"]').type('user@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    
    // Soumettre le formulaire
    cy.get('[data-testid="login-form"]').submit();
    
    // Vérifier que nous sommes redirigés vers la page d'accueil
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // Vérifier que l'utilisateur est connecté
    cy.get('[data-testid="user-menu"]').should('be.visible');
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').should('be.visible');
  });
  
  it('should show an error message for invalid credentials', () => {
    // Cliquer sur le bouton de connexion
    cy.get('[data-testid="login-button"]').click();
    
    // Remplir le formulaire avec des identifiants invalides
    cy.get('[data-testid="email-input"]').type('user@example.com');
    cy.get('[data-testid="password-input"]').type('wrong-password');
    
    // Soumettre le formulaire
    cy.get('[data-testid="login-form"]').submit();
    
    // Vérifier que le message d'erreur est affiché
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'Identifiants invalides');
  });
});
```

### Exemple 4 : Optimisation avec React.lazy et Suspense

```javascript
// src/App.js
import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// Composants de mise en page
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Chargement paresseux des pages
const HomePage = lazy(() => import('./pages/HomePage'));
const AppsPage = lazy(() => import('./pages/AppsPage'));
const AppDetailPage = lazy(() => import('./pages/AppDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Routes d'administration
const AdminRoutes = lazy(() => import('./components/admin/AdminRoutes'));

// Contexte d'authentification
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

// Composant de chargement
const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Suspense fallback={<Loading />}>
            {isAdminRoute ? (
              // Routes d'administration
              <AdminRoutes />
            ) : (
              // Routes publiques
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                <Box component="main" sx={{ flexGrow: 1 }}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/apps" element={<AppsPage />} />
                    <Route path="/apps/:appId" element={<AppDetailPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Box>
                <Footer />
              </Box>
            )}
          </Suspense>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
```

## Livrables attendus

1. **Tests unitaires** :
   - Tests pour les services API
   - Tests pour les composants React
   - Tests pour les contextes

2. **Tests d'intégration** :
   - Tests pour les flux utilisateur
   - Tests pour les formulaires
   - Tests pour les interactions entre les composants

3. **Optimisations de performance** :
   - Lazy loading des composants
   - Code splitting
   - Optimisation des images
   - Mise en cache des ressources statiques

4. **Améliorations de sécurité** :
   - Rapport d'audit de sécurité
   - Corrections des vulnérabilités
   - Configuration des en-têtes de sécurité

5. **Mises à jour des dépendances** :
   - Rapport d'audit des dépendances
   - Liste des dépendances mises à jour
   - Documentation des changements

## Ressources utiles

- [Documentation de Jest](https://jestjs.io/docs/getting-started)
- [Documentation de React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Documentation de Cypress](https://docs.cypress.io/guides/overview/why-cypress)
- [Documentation de Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## Contraintes

- Les tests doivent être automatisés et exécutables via des commandes npm
- Les optimisations ne doivent pas compromettre la fonctionnalité ou l'accessibilité
- Les mises à jour de dépendances doivent être testées pour éviter les régressions
- Le code doit rester bien commenté et suivre les bonnes pratiques
- Les tests doivent couvrir au moins 70% du code

## Prochaines étapes

Une fois les tests ajoutés et les performances optimisées, nous finaliserons la documentation et préparerons le déploiement final de la marketplace.
