# Services API de la Marketplace

Ce répertoire contient les services API utilisés pour communiquer avec le backend de la Marketplace.

## Service API de base (`api.js`)

Le fichier `api.js` fournit une instance Axios configurée pour communiquer avec le backend. Il gère l'authentification via JWT, les erreurs et les timeouts.

### Fonctionnalités principales

- **Configuration automatique** de l'URL de base en fonction de l'environnement
- **Gestion de l'authentification** via JWT (ajout automatique du token aux en-têtes)
- **Gestion des erreurs** avec messages personnalisés et redirection vers la page de connexion en cas d'erreur d'authentification
- **Timeouts** configurés à 10 secondes par défaut
- **Débogage** avec logs détaillés en mode développement
- **Méthodes utilitaires** pour les opérations CRUD standard

### Utilisation de base

```javascript
// Importer l'instance Axios configurée
import api from '../services/api';

// Utiliser l'instance directement
const fetchData = async () => {
  try {
    const response = await api.get('/endpoint');
    return response.data;
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

### Utilisation des méthodes utilitaires

```javascript
// Importer les méthodes utilitaires
import { get, post, put, del } from '../services/api';

// Utiliser les méthodes utilitaires (qui retournent directement les données)
const fetchData = async () => {
  try {
    // GET avec paramètres
    const data = await get('/users', { page: 1, limit: 10 });
    
    // POST avec données
    const newUser = await post('/users', { name: 'John', email: 'john@example.com' });
    
    // PUT avec données
    const updatedUser = await put('/users/123', { name: 'John Doe' });
    
    // DELETE
    const result = await del('/users/123');
    
    return data;
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

### Fonctions d'authentification

```javascript
// Importer les fonctions d'authentification
import { isAuthenticated, logout } from '../services/api';

// Vérifier si l'utilisateur est authentifié
if (isAuthenticated()) {
  // L'utilisateur est authentifié
}

// Déconnecter l'utilisateur
logout();
```

### Fonctions de débogage

```javascript
// Importer les fonctions de débogage
import { logDebug, logError } from '../services/api';

// Afficher un message de débogage (uniquement en développement)
logDebug('Message de débogage', { data: 'Données supplémentaires' });

// Afficher un message d'erreur (uniquement en développement)
logError('Message d'erreur', new Error('Erreur'));
```

### Gestion des erreurs

Le service API gère automatiquement les erreurs courantes :

- **401 Unauthorized** : Redirection vers la page de connexion
- **403 Forbidden** : Message d'erreur indiquant un manque de droits
- **404 Not Found** : Message d'erreur indiquant que la ressource n'existe pas
- **500 Internal Server Error** : Message d'erreur serveur générique
- **Timeout** : Message d'erreur indiquant que la requête a pris trop de temps
- **Erreurs réseau** : Message d'erreur indiquant un problème de connexion

Les erreurs sont formatées de manière cohérente avec la structure suivante :

```javascript
{
  message: 'Message d'erreur formaté',
  originalError: error, // L'erreur originale d'Axios
  status: 404, // Le code HTTP (si disponible)
  data: { ... }, // Les données de réponse (si disponibles)
  url: '/api/users', // L'URL de la requête
  method: 'GET' // La méthode HTTP utilisée
}
```

## Intégration avec le contexte d'authentification

Pour intégrer ce service API avec le contexte d'authentification existant (`AuthContext.js`), remplacez les appels commentés par des appels utilisant ce service API.

Exemple :

```javascript
// Avant (données fictives)
const login = async (email, password) => {
  try {
    // const response = await axios.post('http://localhost:3001/api/auth/login', { email, password });
    // const { token, user } = response.data;
    
    // Données fictives
    const token = 'fake-jwt-token';
    const user = { ... };
    
    // ...
  } catch (err) {
    // ...
  }
};

// Après (données réelles)
import { post } from '../services/api';

const login = async (email, password) => {
  try {
    const { token, user } = await post('/auth/login', { email, password });
    
    // ...
  } catch (err) {
    // ...
  }
};
```

## Service d'authentification (`auth.service.js`)

Le fichier `auth.service.js` fournit des fonctions pour gérer l'authentification des utilisateurs. Il utilise le service API de base pour communiquer avec le backend.

### Fonctionnalités principales

- **Connexion** et **inscription** des utilisateurs
- **Déconnexion** des utilisateurs
- **Récupération des informations** de l'utilisateur connecté
- **Vérification de l'authentification** et des rôles

### Utilisation

```javascript
// Importer les fonctions d'authentification
import { login, register, logout, getCurrentUser, isLoggedIn, isAdmin } from '../services/auth.service';

// Connexion d'un utilisateur
const handleLogin = async (email, password) => {
  try {
    const user = await login(email, password);
    console.log('Utilisateur connecté:', user);
  } catch (error) {
    console.error('Erreur de connexion:', error);
  }
};

// Inscription d'un utilisateur
const handleRegister = async (name, email, password) => {
  try {
    const user = await register(name, email, password);
    console.log('Utilisateur inscrit:', user);
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
  }
};

// Déconnexion d'un utilisateur
const handleLogout = async () => {
  try {
    await logout();
    console.log('Utilisateur déconnecté');
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
  }
};

// Récupération des informations de l'utilisateur connecté
const fetchCurrentUser = async () => {
  try {
    const user = await getCurrentUser();
    console.log('Utilisateur actuel:', user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
  }
};

// Vérification de l'authentification
if (isLoggedIn()) {
  console.log('L\'utilisateur est connecté');
}

// Vérification du rôle administrateur
if (isAdmin()) {
  console.log('L\'utilisateur est un administrateur');
}
```

## Service des applications (`apps.service.js`)

Le fichier `apps.service.js` fournit des fonctions pour gérer les opérations liées aux applications. Il utilise le service API de base pour communiquer avec le backend.

### Fonctionnalités principales

- **Récupération** des applications avec filtrage, pagination et tri
- **Création**, **mise à jour** et **suppression** des applications (admin)
- Gestion des **évaluations** des applications
- Suivi des **téléchargements**

### Utilisation

```javascript
// Importer les fonctions du service des applications
import { 
  getApps, 
  getAppById, 
  getAppBySlug, 
  createApp, 
  updateApp, 
  deleteApp, 
  addRating, 
  deleteRating, 
  incrementDownloads 
} from '../services/apps.service';

// Récupérer toutes les applications avec filtrage et pagination
const fetchApps = async () => {
  try {
    const result = await getApps({ 
      page: 1, 
      limit: 10, 
      category: '60d21b4667d0d8992e610c85',
      search: 'éditeur',
      sort: 'popular'
    });
    console.log('Applications:', result.apps);
    console.log('Total:', result.total);
  } catch (error) {
    console.error('Erreur lors de la récupération des applications:', error);
  }
};

// Récupérer une application par son ID
const fetchAppById = async (id) => {
  try {
    const app = await getAppById(id);
    console.log('Application:', app);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'application:', error);
  }
};

// Récupérer une application par son slug
const fetchAppBySlug = async (slug) => {
  try {
    const app = await getAppBySlug(slug);
    console.log('Application:', app);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'application:', error);
  }
};

// Créer une nouvelle application (admin)
const handleCreateApp = async (appData) => {
  try {
    const newApp = await createApp(appData);
    console.log('Application créée:', newApp);
  } catch (error) {
    console.error('Erreur lors de la création de l\'application:', error);
  }
};

// Mettre à jour une application (admin)
const handleUpdateApp = async (id, appData) => {
  try {
    const updatedApp = await updateApp(id, appData);
    console.log('Application mise à jour:', updatedApp);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'application:', error);
  }
};

// Supprimer une application (admin)
const handleDeleteApp = async (id) => {
  try {
    await deleteApp(id);
    console.log('Application supprimée');
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'application:', error);
  }
};

// Ajouter une évaluation à une application
const handleAddRating = async (appId, rating, comment) => {
  try {
    const result = await addRating(appId, rating, comment);
    console.log('Évaluation ajoutée:', result);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'évaluation:', error);
  }
};

// Supprimer une évaluation d'une application
const handleDeleteRating = async (appId) => {
  try {
    await deleteRating(appId);
    console.log('Évaluation supprimée');
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'évaluation:', error);
  }
};

// Incrémenter le compteur de téléchargements
const handleDownload = async (appId) => {
  try {
    await incrementDownloads(appId);
    console.log('Téléchargement comptabilisé');
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation du compteur:', error);
  }
};
```

## Service des catégories (`categories.service.js`)

Le fichier `categories.service.js` fournit des fonctions pour gérer les opérations liées aux catégories. Il utilise le service API de base pour communiquer avec le backend.

### Fonctionnalités principales

- **Récupération** des catégories avec filtrage
- **Création**, **mise à jour** et **suppression** des catégories (admin)

### Utilisation

```javascript
// Importer les fonctions du service des catégories
import { 
  getCategories, 
  getCategoryById, 
  getCategoryBySlug, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../services/categories.service';

// Récupérer toutes les catégories
const fetchCategories = async () => {
  try {
    const categories = await getCategories({ isActive: true });
    console.log('Catégories:', categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
  }
};

// Récupérer une catégorie par son ID
const fetchCategoryById = async (id) => {
  try {
    const category = await getCategoryById(id);
    console.log('Catégorie:', category);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
  }
};

// Récupérer une catégorie par son slug
const fetchCategoryBySlug = async (slug) => {
  try {
    const category = await getCategoryBySlug(slug);
    console.log('Catégorie:', category);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
  }
};

// Créer une nouvelle catégorie (admin)
const handleCreateCategory = async (categoryData) => {
  try {
    const newCategory = await createCategory(categoryData);
    console.log('Catégorie créée:', newCategory);
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
  }
};

// Mettre à jour une catégorie (admin)
const handleUpdateCategory = async (id, categoryData) => {
  try {
    const updatedCategory = await updateCategory(id, categoryData);
    console.log('Catégorie mise à jour:', updatedCategory);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
  }
};

// Supprimer une catégorie (admin)
const handleDeleteCategory = async (id) => {
  try {
    await deleteCategory(id);
    console.log('Catégorie supprimée');
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
  }
};
```

## Service des utilisateurs (`users.service.js`)

Le fichier `users.service.js` fournit des fonctions pour gérer les opérations liées aux utilisateurs. Il utilise le service API de base pour communiquer avec le backend.

### Fonctionnalités principales

- **Récupération** des utilisateurs avec pagination (admin)
- **Mise à jour** et **suppression** des utilisateurs

### Utilisation

```javascript
// Importer les fonctions du service des utilisateurs
import { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
} from '../services/users.service';

// Récupérer tous les utilisateurs (admin)
const fetchUsers = async () => {
  try {
    const result = await getUsers({ 
      page: 1, 
      limit: 10, 
      search: 'john',
      role: 'user'
    });
    console.log('Utilisateurs:', result.users);
    console.log('Total:', result.total);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
  }
};

// Récupérer un utilisateur par son ID
const fetchUserById = async (id) => {
  try {
    const user = await getUserById(id);
    console.log('Utilisateur:', user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
  }
};

// Mettre à jour un utilisateur
const handleUpdateUser = async (id, userData) => {
  try {
    const updatedUser = await updateUser(id, userData);
    console.log('Utilisateur mis à jour:', updatedUser);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
  }
};

// Supprimer un utilisateur (admin)
const handleDeleteUser = async (id) => {
  try {
    await deleteUser(id);
    console.log('Utilisateur supprimé');
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
  }
};
```

## Prochaines étapes

1. Intégrer ces services API avec les composants existants
2. Remplacer les données fictives par des données réelles dans les composants
3. Ajouter des tests unitaires pour les services API
