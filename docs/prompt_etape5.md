# Prompt pour Claude Sonnet 3.7 - Étape 5 : Amélioration de l'expérience utilisateur

## Contexte du projet

Tu travailles sur une Marketplace Web qui permet aux utilisateurs de découvrir, évaluer et télécharger des applications web. Les étapes 1 à 4 du projet ont été complétées avec succès :
- Étape 1 : Création d'un service API de base et d'un service d'authentification
- Étape 2 : Création des services API spécifiques pour les applications, catégories et utilisateurs
- Étape 3 : Mise à jour des composants d'administration pour utiliser les services API
- Étape 4 : Implémentation des pages publiques et mise à jour de la page d'accueil

Maintenant, tu dois améliorer l'expérience utilisateur en ajoutant des animations, des transitions, des optimisations de performance et en corrigeant les problèmes de Content Security Policy.

## État actuel du projet

### Pages et composants

- **Pages publiques** : HomePage, AppsPage, AppDetailPage, LoginPage, RegisterPage, ProfilePage
- **Pages d'administration** : AdminDashboardPage, AdminAppsPage, AdminAppFormPage, AdminCategoriesPage, AdminUsersPage
- **Composants réutilisables** : TabPanel, RatingForm, RatingsList, AppInfo, AppGallery, AppTabs

### Problèmes identifiés

1. **Problèmes de Content Security Policy** : Certaines ressources externes (polices, images) sont bloquées par la CSP
2. **Manque d'indicateurs de chargement** : Les utilisateurs ne savent pas toujours quand une action est en cours
3. **Gestion des erreurs basique** : Les messages d'erreur ne sont pas toujours contextuels
4. **Interface mobile perfectible** : Certains éléments ne s'adaptent pas parfaitement aux petits écrans
5. **Manque d'animations et de transitions** : L'interface manque de fluidité et de dynamisme

## Ta mission

Tu dois améliorer l'expérience utilisateur en résolvant les problèmes identifiés et en ajoutant des fonctionnalités pour rendre l'interface plus agréable et intuitive. Cela implique :

1. Corriger les problèmes de Content Security Policy
2. Ajouter des indicateurs de chargement et des skeleton loaders
3. Améliorer la gestion des erreurs
4. Optimiser l'interface pour les appareils mobiles
5. Ajouter des animations et des transitions

## Tâches spécifiques

### 1. Correction des problèmes de Content Security Policy

- Créer un fichier de configuration Nginx pour définir les en-têtes CSP appropriés
- Ajouter les domaines autorisés pour les polices, images, etc.
- Mettre à jour les balises meta dans le fichier `index.html`
- Tester la configuration avec différentes ressources externes

### 2. Ajout d'indicateurs de chargement

- Améliorer les skeleton loaders existants pour les rendre plus réalistes
- Ajouter des indicateurs de chargement pour les actions (boutons, formulaires)
- Implémenter des transitions de chargement entre les pages
- Ajouter des indicateurs de progression pour les téléchargements

### 3. Amélioration de la gestion des erreurs

- Créer un composant `ErrorBoundary` pour capturer les erreurs React
- Améliorer les messages d'erreur pour les rendre plus contextuels
- Ajouter un système de notification (toasts) pour les erreurs et les succès
- Implémenter une stratégie de retry pour les appels API échoués

### 4. Optimisation pour les appareils mobiles

- Revoir les layouts pour les adapter aux petits écrans
- Améliorer la navigation mobile (menu hamburger, swipe, etc.)
- Optimiser les formulaires pour les écrans tactiles
- Tester et corriger les problèmes spécifiques aux appareils mobiles

### 5. Ajout d'animations et de transitions

- Ajouter des transitions entre les pages
- Animer les changements d'état (apparition/disparition d'éléments)
- Ajouter des effets de hover et de focus
- Implémenter des animations pour les actions (clic, validation, etc.)

## Spécifications techniques

### Content Security Policy

La configuration CSP doit autoriser :
- Les polices web (Google Fonts, etc.)
- Les images externes (placeholder.com, etc.)
- Les scripts internes et les styles
- Les connexions WebSocket pour le développement

Exemple de configuration :
```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
  font-src 'self' https://fonts.gstatic.com; 
  img-src 'self' data: https://via.placeholder.com; 
  connect-src 'self' ws: wss:;
```

### Animations et transitions

Utiliser les outils suivants pour les animations :
- CSS Transitions pour les effets simples
- CSS Animations pour les effets plus complexes
- React Transition Group pour les transitions de composants
- Framer Motion pour les animations avancées

### Optimisation mobile

Suivre ces principes pour l'optimisation mobile :
- Design "mobile-first" pour les nouveaux composants
- Utilisation des breakpoints Material UI (xs, sm, md, lg, xl)
- Tests sur différentes tailles d'écran
- Optimisation des contrôles pour les écrans tactiles

## Exemples de code

### Exemple 1 : Composant ErrorBoundary

```jsx
import React, { Component } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h5" component="h2">
                Une erreur est survenue
              </Typography>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              Nous sommes désolés, une erreur inattendue s'est produite. Veuillez réessayer ou contacter le support si le problème persiste.
            </Typography>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, overflow: 'auto' }}>
                <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => window.location.reload()}>
                Rafraîchir la page
              </Button>
              <Button variant="contained" onClick={() => window.history.back()}>
                Retour à la page précédente
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Exemple 2 : Système de notification (Toast)

```jsx
import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

// Créer le contexte
const ToastContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useToast = () => useContext(ToastContext);

// Fournisseur du contexte
export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success', 'info', 'warning', 'error'
    duration: 6000
  });

  const showToast = (message, severity = 'info', duration = 6000) => {
    setToast({
      open: true,
      message,
      severity,
      duration
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  // Fonctions utilitaires pour les différents types de toasts
  const success = (message, duration) => showToast(message, 'success', duration);
  const info = (message, duration) => showToast(message, 'info', duration);
  const warning = (message, duration) => showToast(message, 'warning', duration);
  const error = (message, duration) => showToast(message, 'error', duration);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, success, info, warning, error }}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={toast.duration}
        onClose={hideToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={hideToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
```

### Exemple 3 : Animation de transition de page

```jsx
import { motion } from 'framer-motion';

// Variantes d'animation pour les transitions de page
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -20
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

// Composant de page avec animation
const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
```

## Livrables attendus

1. Fichier de configuration Nginx pour la Content Security Policy
2. Composant `ErrorBoundary` pour la gestion des erreurs React
3. Contexte `ToastContext` pour les notifications
4. Composant `AnimatedPage` pour les transitions de page
5. Améliorations des composants existants pour ajouter des animations et des transitions
6. Optimisations pour les appareils mobiles
7. Documentation des améliorations apportées

## Ressources utiles

- [Documentation de Material UI](https://mui.com/material-ui/getting-started/overview/)
- [Documentation de React Transition Group](https://reactcommunity.org/react-transition-group/)
- [Documentation de Framer Motion](https://www.framer.com/motion/)
- [Guide sur la Content Security Policy](https://developer.mozilla.org/fr/docs/Web/HTTP/CSP)
- [Optimisation des performances React](https://reactjs.org/docs/optimizing-performance.html)

## Contraintes

- Les animations ne doivent pas nuire aux performances de l'application
- Les améliorations doivent être compatibles avec tous les navigateurs modernes
- Le code doit être bien commenté et suivre les bonnes pratiques
- Les composants doivent rester modulaires et réutilisables
- L'accessibilité doit être prise en compte (ARIA, contraste, etc.)

## Prochaines étapes

Une fois l'expérience utilisateur améliorée, nous intégrerons des applications tierces à la marketplace et ajouterons des fonctionnalités avancées comme un système de recommandation et une intégration de paiement.
