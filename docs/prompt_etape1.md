# Prompt pour Claude Sonnet 3.7 - Étape 1 : Service API de base

## Contexte du projet

Tu travailles sur une Marketplace Web qui permet aux utilisateurs de découvrir, évaluer et télécharger des applications web. Le projet est structuré en trois composants principaux :
1. **Frontend** : Application React.js avec Material UI
2. **Backend** : API Node.js/Express avec MongoDB
3. **Applications intégrées** : Applications tierces comme Transkryptor

Le frontend et le backend sont actuellement déployés sur un serveur, mais ils ne sont pas encore connectés. Le frontend utilise des données fictives pour l'affichage, et nous devons maintenant le connecter au backend via des services API.

## État actuel du projet

### Frontend
- Utilise React 18.2.0, React Router 6.22.1, Material UI 5.15.10
- Interface d'administration fonctionnelle avec données fictives
- Page d'accueil implémentée
- Contexte d'authentification configuré mais utilisant des données fictives

### Backend
- API RESTful avec Express
- Routes pour l'authentification, les applications, les catégories et les utilisateurs
- Modèles de données complets pour les utilisateurs, applications et catégories
- Middleware d'authentification avec JWT

### Répertoire des services
- Le répertoire `market/frontend/src/services/` existe mais est vide
- Nous devons y créer les services API pour communiquer avec le backend

## Ta mission

Tu dois créer un service API de base avec Axios qui servira de fondation pour tous les autres services API spécifiques. Ce service doit être capable de :
1. Communiquer avec le backend
2. Gérer l'authentification via JWT
3. Gérer les erreurs et les timeouts
4. Rafraîchir les tokens d'authentification

## Tâches spécifiques

1. Créer un fichier `api.js` dans `market/frontend/src/services/`
2. Configurer une instance Axios avec l'URL de base
3. Implémenter la gestion des en-têtes d'authentification
4. Ajouter la gestion des erreurs et des timeouts
5. Créer un intercepteur pour le rafraîchissement des tokens

## Spécifications techniques

### URL de base
- En développement : `http://localhost:3001/api`
- En production : `/api` (relatif au domaine actuel)

### Authentification
- Les tokens JWT sont stockés dans le localStorage
- Le token doit être inclus dans l'en-tête `Authorization` sous la forme `Bearer [token]`
- Si le token est expiré, le service doit rediriger vers la page de connexion

### Gestion des erreurs
- Intercepter les erreurs 401 (Non autorisé) et rediriger vers la page de connexion
- Intercepter les erreurs 403 (Interdit) et afficher un message approprié
- Gérer les erreurs réseau et les timeouts
- Retourner des messages d'erreur formatés de manière cohérente

### Timeouts
- Configurer un timeout de 10 secondes pour les requêtes

## Exemple de code

Voici un exemple de structure pour le fichier `api.js` :

```javascript
import axios from 'axios';

// Déterminer l'URL de base en fonction de l'environnement
const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

// Créer une instance Axios avec la configuration de base
const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gérer les erreurs ici
    return Promise.reject(error);
  }
);

export default api;
```

## Livrables attendus

1. Un fichier `api.js` dans `market/frontend/src/services/` avec le code complet
2. Une documentation des fonctionnalités du service API

## Ressources utiles

- [Documentation d'Axios](https://axios-http.com/docs/intro)
- [Documentation de JWT](https://jwt.io/introduction)
- [Gestion des erreurs en React](https://reactjs.org/docs/error-boundaries.html)

## Contraintes

- Le code doit être bien commenté et suivre les bonnes pratiques
- Le service doit être réutilisable par tous les autres services API
- Le service doit être testé manuellement pour s'assurer qu'il fonctionne correctement

## Prochaines étapes

Une fois ce service API de base créé, nous l'utiliserons pour implémenter les services API spécifiques pour l'authentification, les applications, les catégories et les utilisateurs.
