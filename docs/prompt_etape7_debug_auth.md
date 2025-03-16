# Prompt pour Claude Sonnet 3.7 - Étape 7 (Debug) : Débogage de l'authentification entre la Marketplace et les applications

## Contexte du problème

La Marketplace Web permet aux utilisateurs de découvrir, évaluer et télécharger diverses applications web. Récemment, un problème d'authentification a été identifié : lorsqu'un utilisateur tente d'accéder à l'application NotePad, il est correctement redirigé vers la page de connexion, mais après s'être authentifié, il est redirigé vers une page 404 au lieu de l'application NotePad.

Ce problème empêche les utilisateurs d'accéder aux applications intégrées à la Marketplace, ce qui constitue une fonctionnalité essentielle de la plateforme.

## État actuel du projet

### Infrastructure

- **Frontend React** : Interface utilisateur de la Marketplace
- **Backend Node.js/Express** : API pour la Marketplace
- **Applications intégrées** : NotePad et Transkryptor
- **Nginx** : Serveur web qui gère les routes et les redirections

### Authentification actuelle

Le système d'authentification actuel fonctionne comme suit :

1. L'utilisateur accède à une application (ex: `/notepad`)
2. Le module d'authentification partagé (`apps/shared/auth.js`) vérifie si l'utilisateur est authentifié
3. Si non authentifié, l'utilisateur est redirigé vers `/login?redirect=/notepad`
4. Après l'authentification, l'utilisateur devrait être redirigé vers `/notepad`
5. Actuellement, cette redirection échoue et mène à une page 404

## Ta mission

Tu dois déboguer et résoudre le problème d'authentification entre la Marketplace et les applications intégrées, en particulier NotePad. Cela implique :

1. Identifier précisément où se situe le problème dans le flux d'authentification
2. Corriger les fichiers pertinents pour résoudre le problème
3. Tester la solution pour s'assurer que l'authentification fonctionne correctement
4. Documenter les changements et les solutions

## Tâches spécifiques

### 1. Analyse et débogage

Commence par analyser en profondeur le flux d'authentification actuel :

- Examine les fichiers d'authentification partagés (`apps/shared/auth.js`)
- Examine comment l'authentification est intégrée dans NotePad (`apps/notepad/public/js/marketplace-integration.js`)
- Vérifie la configuration Nginx pour les routes de NotePad (`config/nginx/marketplace.conf`)
- Analyse le comportement de redirection après l'authentification

Ajoute des logs de débogage stratégiques pour suivre le flux d'authentification :

```javascript
// Exemple d'ajout de logs dans apps/shared/auth.js
const redirectToLogin = (redirectPath = window.location.pathname) => {
  console.log('Redirection vers login. Path:', redirectPath);
  window.location.href = `/login?redirect=${encodeURIComponent(redirectPath)}`;
};
```

### 2. Problèmes potentiels à vérifier

Voici les problèmes potentiels que tu dois vérifier :

#### a. Problèmes de redirection

- Vérifier si la redirection après l'authentification préserve correctement le chemin d'origine
- Vérifier si les slashs finaux (`/notepad` vs `/notepad/`) causent des problèmes
- Vérifier si l'encodage/décodage des URL fonctionne correctement

#### b. Problèmes de configuration Nginx

- Vérifier si les règles de location pour `/notepad` sont correctement définies
- Vérifier si les redirections sont correctement configurées
- Vérifier si les fichiers statiques sont correctement servis

#### c. Problèmes de gestion des tokens JWT

- Vérifier si le token JWT est correctement stocké dans localStorage
- Vérifier si le token est correctement transmis entre les applications
- Vérifier si le token est correctement validé

#### d. Problèmes de chemins relatifs

- Vérifier si les chemins relatifs dans l'application NotePad fonctionnent correctement
- Vérifier si les imports de modules partagés fonctionnent correctement

### 3. Solutions à implémenter

En fonction des problèmes identifiés, implémente les solutions appropriées :

#### a. Correction du flux de redirection

Si le problème est lié à la redirection :

```javascript
// Exemple de correction dans apps/shared/auth.js
const redirectToLogin = (redirectPath = window.location.pathname) => {
  // Normaliser le chemin de redirection
  const normalizedPath = redirectPath.endsWith('/') ? redirectPath : `${redirectPath}/`;
  window.location.href = `/login?redirect=${encodeURIComponent(normalizedPath)}`;
};
```

#### b. Mise à jour de la configuration Nginx

Si le problème est lié à la configuration Nginx :

```nginx
# Exemple de correction dans config/nginx/marketplace.conf
location ^~ /notepad/ {
    alias /var/www/marketplace/apps/notepad/public/;
    try_files $uri $uri/ /notepad/index.html;
    add_header X-Debug-Path $request_filename;
}

# Assurer que /notepad sans slash final redirige correctement
location = /notepad {
    return 301 $scheme://$host/notepad/;
}
```

#### c. Amélioration de la gestion des tokens

Si le problème est lié à la gestion des tokens :

```javascript
// Exemple de correction dans apps/shared/auth.js
const getUserInfo = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Vérifier si le token est expiré
    const expiration = payload.exp * 1000;
    if (Date.now() >= expiration) {
      console.warn('Token expiré, suppression du token');
      localStorage.removeItem('token');
      return null;
    }
    
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    localStorage.removeItem('token');
    return null;
  }
};
```

#### d. Correction des chemins relatifs

Si le problème est lié aux chemins relatifs :

```html
<!-- Exemple de correction dans apps/notepad/public/index.html -->
<!-- Remplacer -->
<script type="module" src="js/marketplace-integration.js"></script>
<!-- Par -->
<script type="module" src="/notepad/js/marketplace-integration.js"></script>
```

### 4. Tests à effectuer

Après avoir implémenté les corrections, teste rigoureusement le flux d'authentification :

1. **Test de base** : Accéder à `/notepad` sans être authentifié, se connecter, et vérifier la redirection
2. **Test avec différentes URL** : Tester avec `/notepad`, `/notepad/`, et d'autres variations
3. **Test de déconnexion/reconnexion** : Se déconnecter puis se reconnecter pour vérifier que le flux fonctionne
4. **Test avec différents navigateurs** : Tester sur Chrome, Firefox, etc.
5. **Test de persistance** : Vérifier si l'authentification persiste après un rafraîchissement de la page

### 5. Documentation

Documente clairement les problèmes identifiés et les solutions implémentées :

- Crée un fichier `docs/auth_debug_resolution.md` expliquant le problème et la solution
- Mets à jour les commentaires dans le code pour expliquer les changements
- Ajoute des notes sur les pièges potentiels pour les développeurs futurs

## Spécifications techniques

### Fichiers clés à examiner et potentiellement modifier

1. **Authentification partagée** :
   - `apps/shared/auth.js` : Module d'authentification partagé
   - `apps/shared/navbar.js` : Barre de navigation partagée

2. **Application NotePad** :
   - `apps/notepad/public/index.html` : Page principale de NotePad
   - `apps/notepad/public/js/marketplace-integration.js` : Intégration avec la Marketplace
   - `apps/notepad/public/js/app.js` : Application NotePad

3. **Configuration Nginx** :
   - `config/nginx/marketplace.conf` : Configuration Nginx pour la Marketplace

4. **Backend de la Marketplace** :
   - `market/backend/middleware/auth.js` : Middleware d'authentification
   - `market/backend/controllers/auth.controller.js` : Contrôleur d'authentification

### Outils de débogage à utiliser

1. **Console du navigateur** : Pour voir les logs et les erreurs JavaScript
2. **Onglet Réseau des outils de développement** : Pour suivre les redirections et les requêtes
3. **Onglet Application des outils de développement** : Pour examiner localStorage et les cookies
4. **Logs Nginx** : Pour voir les erreurs côté serveur

## Exemples de code

### Exemple 1 : Script de débogage pour suivre le flux d'authentification

```javascript
// debug-auth.js - À inclure temporairement dans les pages pour le débogage
(function() {
  // Fonction pour logger avec timestamp
  const logWithTime = (message, data) => {
    const time = new Date().toISOString();
    console.log(`[${time}] ${message}`, data || '');
  };
  
  // Intercepter les redirections
  const originalAssign = window.location.assign;
  window.location.assign = function(url) {
    logWithTime('Redirection avec assign vers:', url);
    return originalAssign.apply(this, arguments);
  };
  
  const originalReplace = window.location.replace;
  window.location.replace = function(url) {
    logWithTime('Redirection avec replace vers:', url);
    return originalReplace.apply(this, arguments);
  };
  
  // Surveiller localStorage
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    logWithTime(`localStorage.setItem('${key}')`, value.length > 100 ? value.substring(0, 100) + '...' : value);
    return originalSetItem.apply(this, arguments);
  };
  
  const originalGetItem = localStorage.getItem;
  localStorage.getItem = function(key) {
    const value = originalGetItem.apply(this, arguments);
    logWithTime(`localStorage.getItem('${key}')`, value ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : null);
    return value;
  };
  
  // Informations sur la page actuelle
  logWithTime('Page chargée', {
    url: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash
  });
  
  // Vérifier l'authentification
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      logWithTime('Utilisateur authentifié', {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        expires: new Date(payload.exp * 1000).toISOString()
      });
    } catch (error) {
      logWithTime('Erreur lors de la lecture du token', error);
    }
  } else {
    logWithTime('Utilisateur non authentifié');
  }
})();
```

### Exemple 2 : Correction du flux de redirection dans l'authentification

```javascript
/**
 * Initialise l'authentification pour une application tierce
 * Cette fonction doit être appelée au chargement de l'application
 * @param {Object} options - Options d'initialisation
 * @returns {Object|null} Informations de l'utilisateur ou null si non authentifié
 */
const initAuth = (options = {}) => {
  const {
    requireAuth = true,
    requiredRole = null,
    onSuccess = null,
    onFailure = null
  } = options;
  
  console.log('Initialisation de l\'authentification', {
    requireAuth,
    requiredRole,
    currentPath: window.location.pathname
  });
  
  // Vérifier si l'utilisateur est authentifié
  if (!isAuthenticated()) {
    console.log('Utilisateur non authentifié');
    
    if (requireAuth) {
      // Extraire le chemin de redirection
      let redirectPath = window.location.pathname;
      
      // Normaliser le chemin (s'assurer qu'il se termine par un slash si nécessaire)
      if (redirectPath.match(/^\/[^\/]+$/) && !redirectPath.endsWith('/')) {
        redirectPath = `${redirectPath}/`;
      }
      
      console.log('Redirection vers la page de connexion avec redirectPath:', redirectPath);
      
      if (onFailure) onFailure('Non authentifié');
      redirectToLogin(redirectPath);
    }
    return null;
  }
  
  // Récupérer les informations de l'utilisateur
  const user = getUserInfo();
  console.log('Utilisateur authentifié:', user);
  
  // Vérifier le rôle si nécessaire
  if (requiredRole && user.role !== requiredRole) {
    console.log('Rôle insuffisant:', { required: requiredRole, actual: user.role });
    
    if (requireAuth) {
      if (onFailure) onFailure('Rôle insuffisant');
      redirectToLogin();
    }
    return null;
  }
  
  // Appeler la fonction de succès si elle existe
  if (onSuccess) {
    console.log('Appel du callback de succès');
    onSuccess(user);
  }
  
  return user;
};
```

## Ressources utiles

- [Documentation de JWT](https://jwt.io/introduction)
- [Documentation de Nginx sur la configuration des locations](https://nginx.org/en/docs/http/ngx_http_core_module.html#location)
- [Guide sur le débogage des redirections dans le navigateur](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [Documentation sur localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

## Contraintes

- Les modifications doivent être minimales et ciblées pour résoudre spécifiquement le problème d'authentification
- Le code doit rester compatible avec les navigateurs modernes (Chrome, Firefox, Safari, Edge)
- La solution doit fonctionner pour toutes les applications intégrées, pas seulement NotePad
- Les modifications ne doivent pas introduire de nouveaux problèmes de sécurité

## Prochaines étapes

Une fois le problème d'authentification résolu, nous pourrons passer à l'amélioration de l'interface d'administration et à l'ajout de fonctionnalités avancées pour la gestion des applications.
