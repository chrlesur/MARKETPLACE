# Prompt pour Claude Sonnet 3.7 - Étape 2 : Services API spécifiques

## Contexte du projet

Tu travailles sur une Marketplace Web qui permet aux utilisateurs de découvrir, évaluer et télécharger des applications web. L'étape 1 du projet a été complétée avec succès, avec la création d'un service API de base (`api.js`), d'un service d'authentification (`auth.service.js`), et la mise à jour du contexte d'authentification.

Maintenant, tu dois créer les services API spécifiques pour les autres entités : applications, catégories et utilisateurs.


## État actuel du projet

### Services existants

- **Service API de base** (`api.js`) : Fournit une instance Axios configurée avec des intercepteurs pour l'authentification et la gestion des erreurs, ainsi que des méthodes utilitaires pour les opérations CRUD.
- **Service d'authentification** (`auth.service.js`) : Gère les opérations liées à l'authentification des utilisateurs (connexion, inscription, déconnexion, etc.).

### Backend

Le backend expose les API suivantes :

#### Applications (`/api/apps`)

- `GET /api/apps` : Récupération de toutes les applications (avec filtrage, pagination et tri)
- `GET /api/apps/:id` : Récupération d'une application par son ID
- `GET /api/apps/slug/:slug` : Récupération d'une application par son slug
- `POST /api/apps` : Création d'une nouvelle application (admin)
- `PUT /api/apps/:id` : Mise à jour d'une application (admin)
- `DELETE /api/apps/:id` : Suppression d'une application (admin)
- `POST /api/apps/:id/ratings` : Ajout d'une évaluation à une application
- `DELETE /api/apps/:id/ratings` : Suppression d'une évaluation d'une application
- `POST /api/apps/:id/download` : Incrémentation du compteur de téléchargements

#### Catégories (`/api/categories`)

- `GET /api/categories` : Récupération de toutes les catégories
- `GET /api/categories/:id` : Récupération d'une catégorie par son ID
- `GET /api/categories/slug/:slug` : Récupération d'une catégorie par son slug
- `POST /api/categories` : Création d'une nouvelle catégorie (admin)
- `PUT /api/categories/:id` : Mise à jour d'une catégorie (admin)
- `DELETE /api/categories/:id` : Suppression d'une catégorie (admin)

#### Utilisateurs (`/api/users`)

- `GET /api/users` : Récupération de tous les utilisateurs (admin)
- `GET /api/users/:id` : Récupération d'un utilisateur par son ID
- `PUT /api/users/:id` : Mise à jour d'un utilisateur
- `DELETE /api/users/:id` : Suppression d'un utilisateur (admin)

## Ta mission

Tu dois créer trois services API spécifiques pour les entités principales de la marketplace :

1. **Service des applications** (`apps.service.js`) : Pour gérer les opérations liées aux applications
2. **Service des catégories** (`categories.service.js`) : Pour gérer les opérations liées aux catégories
3. **Service des utilisateurs** (`users.service.js`) : Pour gérer les opérations liées aux utilisateurs

Chaque service doit utiliser le service API de base (`api.js`) pour communiquer avec le backend et suivre la même structure que le service d'authentification (`auth.service.js`).

## Tâches spécifiques

### 1. Service des applications (`apps.service.js`)

Créer un service qui expose les fonctions suivantes :

- `getApps(params)` : Récupérer toutes les applications avec filtrage, pagination et tri
- `getAppById(id)` : Récupérer une application par son ID
- `getAppBySlug(slug)` : Récupérer une application par son slug
- `createApp(appData)` : Créer une nouvelle application (admin)
- `updateApp(id, appData)` : Mettre à jour une application (admin)
- `deleteApp(id)` : Supprimer une application (admin)
- `addRating(appId, rating, comment)` : Ajouter une évaluation à une application
- `deleteRating(appId)` : Supprimer une évaluation d'une application
- `incrementDownloads(appId)` : Incrémenter le compteur de téléchargements

### 2. Service des catégories (`categories.service.js`)

Créer un service qui expose les fonctions suivantes :

- `getCategories(params)` : Récupérer toutes les catégories avec filtrage
- `getCategoryById(id)` : Récupérer une catégorie par son ID
- `getCategoryBySlug(slug)` : Récupérer une catégorie par son slug
- `createCategory(categoryData)` : Créer une nouvelle catégorie (admin)
- `updateCategory(id, categoryData)` : Mettre à jour une catégorie (admin)
- `deleteCategory(id)` : Supprimer une catégorie (admin)

### 3. Service des utilisateurs (`users.service.js`)

Créer un service qui expose les fonctions suivantes :

- `getUsers(params)` : Récupérer tous les utilisateurs avec pagination (admin)
- `getUserById(id)` : Récupérer un utilisateur par son ID
- `updateUser(id, userData)` : Mettre à jour un utilisateur
- `deleteUser(id)` : Supprimer un utilisateur (admin)

## Spécifications techniques

### Structure des services

Chaque service doit suivre la même structure que le service d'authentification :

1. **En-tête de documentation** : Commentaires expliquant le rôle du service
2. **Importations** : Importer les fonctions nécessaires du service API de base
3. **Constantes** : Définir les constantes utilisées dans le service
4. **Fonctions utilitaires** : Fonctions internes utilisées par le service
5. **Fonctions principales** : Fonctions exposées par le service
6. **Exportations** : Exporter les fonctions publiques

### Gestion des erreurs

Chaque fonction doit gérer les erreurs de manière cohérente :

1. Utiliser un bloc try/catch
2. Journaliser les erreurs avec `logError`
3. Propager les erreurs pour qu'elles puissent être gérées par les composants

### Documentation

Chaque fonction doit être documentée avec des commentaires JSDoc :

```javascript
/**
 * Description de la fonction
 * @param {Type} paramName - Description du paramètre
 * @returns {Type} Description de la valeur de retour
 * @throws {Error} Description des erreurs possibles
 */
```

## Exemple de code

Voici un exemple de structure pour le service des applications :

```javascript
/**
 * Service des applications
 * 
 * Ce service gère les opérations liées aux applications :
 * récupération, création, mise à jour, suppression, etc.
 * 
 * @module services/apps
 * @author Marketplace Team
 * @version 1.0.0
 */

import { get, post, put, del, logDebug, logError } from './api';

// ========================================================================
// Fonctions principales
// ========================================================================

/**
 * Récupère toutes les applications avec filtrage, pagination et tri
 * @param {Object} params - Paramètres de filtrage, pagination et tri
 * @param {number} [params.page=1] - Numéro de page
 * @param {number} [params.limit=10] - Nombre d'éléments par page
 * @param {string} [params.category] - ID de la catégorie pour filtrer
 * @param {string} [params.search] - Terme de recherche
 * @param {string} [params.sort] - Champ de tri (newest, oldest, name_asc, name_desc, popular, rating)
 * @returns {Promise<Object>} Résultat paginé avec les applications et les informations de pagination
 * @throws {Error} En cas d'échec de la récupération
 */
const getApps = async (params = {}) => {
  try {
    logDebug('Récupération des applications', params);
    
    // Appel à l'API pour récupérer les applications
    const data = await get('/apps', params);
    
    logDebug('Applications récupérées', data);
    
    return data;
  } catch (error) {
    logError('Erreur lors de la récupération des applications', error);
    throw error;
  }
};

// Autres fonctions...

// ========================================================================
// Exportations
// ========================================================================

export {
  getApps,
  getAppById,
  getAppBySlug,
  createApp,
  updateApp,
  deleteApp,
  addRating,
  deleteRating,
  incrementDownloads
};
```

## Livrables attendus

1. Un fichier `apps.service.js` dans `market/frontend/src/services/` avec le code complet
2. Un fichier `categories.service.js` dans `market/frontend/src/services/` avec le code complet
3. Un fichier `users.service.js` dans `market/frontend/src/services/` avec le code complet
4. Mise à jour du fichier `README.md` dans `market/frontend/src/services/` pour documenter les nouveaux services

## Ressources utiles

- [Documentation d'Axios](https://axios-http.com/docs/intro)
- [Documentation de JSDoc](https://jsdoc.app/)
- [Bonnes pratiques pour les services API](https://blog.logrocket.com/axios-vs-fetch-best-http-requests/)

## Contraintes

- Le code doit être bien commenté et suivre les bonnes pratiques
- Les services doivent être réutilisables par tous les composants
- Les services doivent gérer les erreurs de manière cohérente
- Les services doivent suivre la même structure que le service d'authentification

## Prochaines étapes

Une fois ces services API spécifiques créés, ils seront utilisés pour mettre à jour les composants d'administration et implémenter les pages publiques manquantes.
