# Modules partagés pour les applications tierces

Ce dossier contient des modules partagés qui peuvent être utilisés par toutes les applications tierces intégrées à la marketplace. Ces modules permettent d'assurer une cohérence visuelle et fonctionnelle entre les applications et la marketplace.

## Modules disponibles

### 1. Module d'authentification (`auth.js`)

Ce module permet aux applications tierces d'utiliser le système d'authentification de la marketplace.

```javascript
import { 
  isAuthenticated, 
  redirectToLogin, 
  getUserInfo, 
  hasRole, 
  logout, 
  addAuthHeader, 
  initAuth 
} from './auth.js';

// Vérifier si l'utilisateur est authentifié
if (isAuthenticated()) {
  // L'utilisateur est authentifié
  const user = getUserInfo();
  console.log(`Bonjour, ${user.name}`);
} else {
  // Rediriger vers la page de connexion
  redirectToLogin();
}

// Initialiser l'authentification avec des options
const user = initAuth({
  requireAuth: true,
  requiredRole: 'admin',
  onSuccess: (user) => {
    console.log(`Authentification réussie pour ${user.name}`);
  },
  onFailure: (reason) => {
    console.error(`Échec de l'authentification: ${reason}`);
  }
});
```

### 2. Module de notifications (`notifications.js`)

Ce module permet d'afficher des notifications cohérentes avec le style de la marketplace.

```javascript
import { 
  showSuccess, 
  showError, 
  showInfo, 
  showWarning, 
  closeAll 
} from './notifications.js';

// Afficher une notification de succès
showSuccess('Opération réussie !');

// Afficher une notification d'erreur
showError('Une erreur est survenue.');

// Afficher une notification d'information
showInfo('Voici une information importante.');

// Afficher une notification d'avertissement
showWarning('Attention, cette action est irréversible.');

// Fermer toutes les notifications
closeAll();
```

### 3. Styles partagés (`styles.css`)

Ce fichier contient des styles CSS communs pour assurer une cohérence visuelle avec la marketplace.

```html
<link rel="stylesheet" href="/shared/styles.css">
```

Les styles incluent :
- Variables CSS (couleurs, typographie, espacement, etc.)
- Styles de base (reset, typographie, etc.)
- Composants (boutons, cartes, formulaires, etc.)
- Utilitaires (marges, padding, flexbox, etc.)
- Responsive design

### 4. Composant de navigation (`navbar.js`)

Ce module permet d'ajouter une barre de navigation cohérente avec la marketplace.

```javascript
import { createNavbar } from './navbar.js';

// Créer une barre de navigation
createNavbar({
  appName: 'Mon Application',
  appIcon: '/images/icon.png',
  menuItems: [
    { label: 'Accueil', url: '/', active: true },
    { label: 'À propos', url: '/about' },
    { 
      label: 'Paramètres', 
      onClick: () => {
        console.log('Paramètres cliqués');
      }
    }
  ],
  containerId: 'navbar-container',
  showHomeLink: true,
  showUserInfo: true
});
```

## Utilisation dans une application tierce

Pour utiliser ces modules dans une application tierce, vous devez d'abord les importer dans votre application.

### Exemple d'intégration complète

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mon Application</title>
  
  <!-- Styles partagés -->
  <link rel="stylesheet" href="/shared/styles.css">
  
  <!-- Styles spécifiques à l'application -->
  <link rel="stylesheet" href="css/app.css">
</head>
<body>
  <!-- Conteneur pour la barre de navigation -->
  <div id="navbar-container"></div>
  
  <!-- Contenu de l'application -->
  <div class="container">
    <h1>Mon Application</h1>
    <p>Bienvenue dans mon application !</p>
    
    <button id="successBtn" class="btn btn-primary">Afficher une notification de succès</button>
    <button id="errorBtn" class="btn btn-outline-primary">Afficher une notification d'erreur</button>
  </div>
  
  <!-- Scripts -->
  <script type="module">
    // Importer les modules partagés
    import { initAuth, getUserInfo } from '/shared/auth.js';
    import { showSuccess, showError } from '/shared/notifications.js';
    import { createNavbar } from '/shared/navbar.js';
    
    // Initialiser l'authentification
    const user = initAuth({
      requireAuth: true,
      onSuccess: (user) => {
        console.log(`Authentification réussie pour ${user.name}`);
        
        // Créer la barre de navigation
        createNavbar({
          appName: 'Mon Application',
          appIcon: '/images/icon.png',
          menuItems: [
            { label: 'Accueil', url: '/', active: true },
            { label: 'À propos', url: '/about' }
          ]
        });
        
        // Afficher un message de bienvenue
        showSuccess(`Bienvenue, ${user.name} !`);
      }
    });
    
    // Ajouter des gestionnaires d'événements pour les boutons
    document.getElementById('successBtn').addEventListener('click', () => {
      showSuccess('Opération réussie !');
    });
    
    document.getElementById('errorBtn').addEventListener('click', () => {
      showError('Une erreur est survenue.');
    });
  </script>
</body>
</html>
```

## Bonnes pratiques

1. **Toujours vérifier l'authentification** : Utilisez `initAuth()` au chargement de votre application pour vérifier si l'utilisateur est authentifié.

2. **Utiliser les styles partagés** : Utilisez les classes CSS fournies dans `styles.css` pour assurer une cohérence visuelle avec la marketplace.

3. **Ajouter une barre de navigation** : Utilisez `createNavbar()` pour ajouter une barre de navigation cohérente avec la marketplace.

4. **Utiliser les notifications** : Utilisez les fonctions de notification pour informer l'utilisateur des actions réussies ou des erreurs.

5. **Gérer les erreurs d'authentification** : Utilisez `redirectToLogin()` pour rediriger l'utilisateur vers la page de connexion en cas d'erreur d'authentification.

## Support

Pour toute question ou problème concernant ces modules, veuillez contacter l'équipe de développement de la marketplace.
