# Prompt pour Claude Sonnet 3.7 - Étape 3 : Mise à jour des composants d'administration

## Contexte du projet

Tu travailles sur une Marketplace Web qui permet aux utilisateurs de découvrir, évaluer et télécharger des applications web. Les étapes 1 et 2 du projet ont été complétées avec succès, avec la création d'un service API de base, d'un service d'authentification, et des services API spécifiques pour les applications, catégories et utilisateurs.

Maintenant, tu dois mettre à jour les composants d'administration pour utiliser ces services API au lieu des données fictives.

## État actuel du projet

### Services API

- **Service API de base** (`api.js`) : Fournit une instance Axios configurée avec des intercepteurs pour l'authentification et la gestion des erreurs, ainsi que des méthodes utilitaires pour les opérations CRUD.
- **Service d'authentification** (`auth.service.js`) : Gère les opérations liées à l'authentification des utilisateurs.
- **Service des applications** (`apps.service.js`) : Gère les opérations liées aux applications.
- **Service des catégories** (`categories.service.js`) : Gère les opérations liées aux catégories.
- **Service des utilisateurs** (`users.service.js`) : Gère les opérations liées aux utilisateurs.

### Composants d'administration

Les composants d'administration suivants utilisent actuellement des données fictives et doivent être mis à jour pour utiliser les services API :

- **AdminDashboardPage** : Tableau de bord avec statistiques
- **AdminAppsPage** : Liste des applications avec filtrage, pagination et actions
- **AdminAppFormPage** : Formulaire de création/édition d'une application
- **AdminCategoriesPage** : Liste des catégories avec actions
- **AdminUsersPage** : Liste des utilisateurs avec actions

## Ta mission

Tu dois mettre à jour les composants d'administration pour utiliser les services API au lieu des données fictives. Cela implique :

1. Remplacer les données fictives par des appels aux services API
2. Gérer les états de chargement et d'erreur
3. Implémenter les opérations CRUD réelles (création, mise à jour, suppression)
4. Améliorer l'expérience utilisateur avec des retours visuels

## Tâches spécifiques

### 1. Mise à jour de `AdminAppsPage.js`

- Remplacer les données fictives (`mockApps`) par un appel à `getApps` du service des applications
- Implémenter la pagination réelle avec les paramètres de l'API
- Implémenter le filtrage et la recherche avec les paramètres de l'API
- Implémenter la suppression réelle avec `deleteApp` du service des applications
- Gérer les états de chargement et d'erreur

### 2. Mise à jour de `AdminAppFormPage.js`

- Remplacer les données fictives (`mockCategories`) par un appel à `getCategories` du service des catégories
- En mode édition, remplacer les données fictives par un appel à `getAppById` du service des applications
- Implémenter la création et la mise à jour réelles avec `createApp` et `updateApp` du service des applications
- Gérer les états de chargement, d'erreur et de succès

### 3. Mise à jour de `AdminCategoriesPage.js`

- Remplacer les données fictives par un appel à `getCategories` du service des catégories
- Implémenter la suppression réelle avec `deleteCategory` du service des catégories
- Gérer les états de chargement et d'erreur

### 4. Mise à jour de `AdminUsersPage.js`

- Remplacer les données fictives par un appel à `getUsers` du service des utilisateurs
- Implémenter la pagination réelle avec les paramètres de l'API
- Implémenter la suppression réelle avec `deleteUser` du service des utilisateurs
- Gérer les états de chargement et d'erreur

### 5. Mise à jour de `AdminDashboardPage.js`

- Remplacer les statistiques fictives par des données réelles
- Implémenter des appels API pour récupérer les statistiques
- Gérer les états de chargement et d'erreur

## Spécifications techniques

### Gestion des états

Chaque composant doit gérer les états suivants :

- **Chargement** : Afficher un indicateur de chargement pendant les appels API
- **Erreur** : Afficher un message d'erreur en cas d'échec des appels API
- **Succès** : Afficher un message de succès après une opération réussie
- **Données vides** : Afficher un message approprié lorsqu'aucune donnée n'est disponible

### Gestion des erreurs

Les erreurs doivent être gérées de manière cohérente :

- Utiliser un bloc try/catch pour chaque appel API
- Afficher un message d'erreur explicite à l'utilisateur
- Journaliser les erreurs pour le débogage

### Pagination

La pagination doit être implémentée de manière cohérente :

- Utiliser les paramètres `page` et `limit` pour les appels API
- Mettre à jour les contrôles de pagination en fonction des résultats
- Afficher le nombre total d'éléments et de pages

### Filtrage et recherche

Le filtrage et la recherche doivent être implémentés de manière cohérente :

- Utiliser les paramètres appropriés pour les appels API
- Mettre à jour les résultats en temps réel
- Gérer les états de chargement pendant les recherches

## Exemple de code

Voici un exemple de mise à jour pour `AdminAppsPage.js` :

```javascript
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  // ... importations existantes ...
} from '@mui/material';
import {
  // ... importations existantes ...
} from '@mui/icons-material';

// Importer le service des applications
import { getApps, deleteApp } from '../services/apps.service';

const AdminAppsPage = () => {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  const [totalApps, setTotalApps] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Fonction pour charger les applications
  const loadApps = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appel au service des applications
      const result = await getApps({
        page: page + 1, // L'API commence à 1, MUI commence à 0
        limit: rowsPerPage,
        search: searchTerm
      });
      
      setApps(result.apps);
      setTotalApps(result.pagination.total);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des applications');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les applications au chargement du composant et lorsque les paramètres changent
  useEffect(() => {
    loadApps();
  }, [page, rowsPerPage, searchTerm]);
  
  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Recherche
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  // Suppression
  const handleDeleteClick = (app) => {
    setAppToDelete(app);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      
      // Appel au service des applications pour supprimer l'application
      await deleteApp(appToDelete.id);
      
      // Recharger les applications
      await loadApps();
      
      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: 'Application supprimée avec succès',
        severity: 'success'
      });
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression de l\'application');
      
      // Afficher un message d'erreur
      setSnackbar({
        open: true,
        message: err.message || 'Erreur lors de la suppression de l\'application',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setAppToDelete(null);
    }
  };
  
  // ... reste du code ...
};

export default AdminAppsPage;
```

## Livrables attendus

1. Mise à jour de `AdminAppsPage.js` pour utiliser le service des applications
2. Mise à jour de `AdminAppFormPage.js` pour utiliser les services des applications et des catégories
3. Mise à jour de `AdminCategoriesPage.js` pour utiliser le service des catégories
4. Mise à jour de `AdminUsersPage.js` pour utiliser le service des utilisateurs
5. Mise à jour de `AdminDashboardPage.js` pour utiliser des données réelles

## Ressources utiles

- [Documentation de React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [Documentation de Material UI](https://mui.com/material-ui/getting-started/overview/)
- [Gestion des erreurs en React](https://reactjs.org/docs/error-boundaries.html)

## Contraintes

- Le code doit être bien commenté et suivre les bonnes pratiques
- Les composants doivent gérer correctement les états de chargement et d'erreur
- Les formulaires doivent valider les entrées avant de les envoyer à l'API
- Les messages d'erreur doivent être explicites et aider l'utilisateur à résoudre le problème

## Prochaines étapes

Une fois les composants d'administration mis à jour, nous implémenterons les pages publiques manquantes (liste des applications, détail d'une application, etc.) et les connecterons également aux services API.
