# Prompt pour Claude Sonnet 3.7 - Étape 4 : Implémentation des pages publiques

## Contexte du projet

Tu travailles sur une Marketplace Web qui permet aux utilisateurs de découvrir, évaluer et télécharger des applications web. Les étapes 1, 2 et 3 du projet ont été complétées avec succès :
- Étape 1 : Création d'un service API de base et d'un service d'authentification
- Étape 2 : Création des services API spécifiques pour les applications, catégories et utilisateurs
- Étape 3 : Mise à jour des composants d'administration pour utiliser les services API

Maintenant, tu dois implémenter les pages publiques manquantes et mettre à jour la page d'accueil pour utiliser les données réelles au lieu des données fictives.

## État actuel du projet

### Services API

- **Service API de base** (`api.js`) : Fournit une instance Axios configurée avec des intercepteurs pour l'authentification et la gestion des erreurs, ainsi que des méthodes utilitaires pour les opérations CRUD.
- **Service d'authentification** (`auth.service.js`) : Gère les opérations liées à l'authentification des utilisateurs.
- **Service des applications** (`apps.service.js`) : Gère les opérations liées aux applications.
- **Service des catégories** (`categories.service.js`) : Gère les opérations liées aux catégories.
- **Service des utilisateurs** (`users.service.js`) : Gère les opérations liées aux utilisateurs.

### Pages existantes

- **HomePage** : Page d'accueil qui utilise actuellement des données fictives.
- **NotFoundPage** : Page 404 pour les routes non trouvées.

### Routes à implémenter

Les routes suivantes sont définies dans `App.js` mais ne sont pas encore implémentées :
- `/apps` : Page de liste des applications
- `/apps/:appId` : Page de détail d'une application
- `/login` : Page de connexion
- `/register` : Page d'inscription
- `/profile` : Page de profil utilisateur

## Ta mission

Tu dois implémenter les pages publiques manquantes et mettre à jour la page d'accueil pour utiliser les services API au lieu des données fictives. Cela implique :

1. Mettre à jour la page d'accueil pour utiliser les données réelles
2. Créer la page de liste des applications
3. Créer la page de détail d'une application
4. Créer les pages d'authentification (connexion et inscription)
5. Créer la page de profil utilisateur
6. Mettre à jour le fichier `App.js` pour activer les routes

## Tâches spécifiques

### 1. Mise à jour de `HomePage.js`

- Remplacer les données fictives (`featuredApps` et `popularCategories`) par des appels aux services API
- Utiliser le service des applications pour récupérer les applications vedettes et populaires
- Utiliser le service des catégories pour récupérer les catégories populaires
- Gérer les états de chargement et d'erreur
- Améliorer l'expérience utilisateur avec des skeleton loaders

### 2. Création de `AppsPage.js`

Créer une page de liste des applications avec les fonctionnalités suivantes :
- Affichage des applications avec pagination
- Filtrage par catégorie, prix, etc.
- Barre de recherche
- Tri par popularité, date, etc.
- Gestion des états de chargement et d'erreur

### 3. Création de `AppDetailPage.js`

Créer une page de détail d'une application avec les fonctionnalités suivantes :
- Affichage des informations détaillées de l'application
- Galerie d'images
- Système d'évaluation et de commentaires
- Bouton de téléchargement/achat
- Gestion des états de chargement et d'erreur

### 4. Création de `LoginPage.js` et `RegisterPage.js`

Créer des pages d'authentification avec les fonctionnalités suivantes :
- Formulaire de connexion avec validation
- Formulaire d'inscription avec validation
- Gestion des erreurs d'authentification
- Redirection après connexion/inscription réussie

### 5. Création de `ProfilePage.js`

Créer une page de profil utilisateur avec les fonctionnalités suivantes :
- Affichage des informations de l'utilisateur
- Formulaire de modification des informations
- Historique des téléchargements/achats
- Gestion des évaluations
- Gestion des états de chargement et d'erreur

### 6. Mise à jour de `App.js`

- Décommenter les routes pour les nouvelles pages
- Ajouter des routes protégées pour les pages qui nécessitent une authentification

## Spécifications techniques

### Gestion des états

Chaque page doit gérer les états suivants :
- **Chargement** : Afficher un skeleton loader ou un indicateur de chargement pendant les appels API
- **Erreur** : Afficher un message d'erreur en cas d'échec des appels API
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

### Authentification

L'authentification doit être gérée de manière cohérente :
- Utiliser le service d'authentification pour les opérations de connexion et d'inscription
- Protéger les routes qui nécessitent une authentification
- Afficher des messages d'erreur explicites en cas d'échec de l'authentification

### Responsive design

Toutes les pages doivent être responsive et s'adapter aux différentes tailles d'écran :
- Utiliser les composants Material UI pour le responsive design
- Tester les pages sur différentes tailles d'écran
- Optimiser l'expérience utilisateur sur mobile

## Exemple de code

Voici un exemple de mise à jour pour `HomePage.js` :

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  // ... importations existantes ...
  Skeleton
} from '@mui/material';

// Importer les services API
import { getApps } from '../services/apps.service';
import { getCategories } from '../services/categories.service';

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  // États pour les données
  const [featuredApps, setFeaturedApps] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Charger les données au chargement du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer les applications vedettes
        const appsResult = await getApps({
          isFeatured: true,
          limit: 3
        });
        
        // Récupérer les catégories populaires
        const categoriesResult = await getCategories();
        
        // Trier les catégories par nombre d'applications
        const sortedCategories = categoriesResult
          .sort((a, b) => b.appsCount - a.appsCount)
          .slice(0, 6);
        
        setFeaturedApps(appsResult.apps);
        setPopularCategories(sortedCategories);
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // ... reste du code ...
  
  // Afficher un skeleton loader pendant le chargement
  if (loading) {
    return (
      <Box>
        {/* Section Hero avec skeleton loader */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: 'white',
            py: { xs: 8, md: 12 },
            mb: 6
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Skeleton variant="text" width="80%" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                <Skeleton variant="text" width="100%" height={30} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                <Skeleton variant="text" width="90%" height={30} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 4 }} />
                <Skeleton variant="rectangular" width="100%" height={56} sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }} />
              </Grid>
              {!isMobile && (
                <Grid item xs={12} md={6}>
                  <Skeleton variant="rectangular" width="100%" height={400} sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                </Grid>
              )}
            </Grid>
          </Container>
        </Box>
        
        {/* Autres sections avec skeleton loaders */}
        {/* ... */}
      </Box>
    );
  }
  
  // Afficher un message d'erreur
  if (error) {
    return (
      <Box sx={{ py: 3 }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </Container>
      </Box>
    );
  }
  
  // ... reste du code ...
};

export default HomePage;
```

## Livrables attendus

1. Mise à jour de `HomePage.js` pour utiliser les services API
2. Création de `AppsPage.js` pour la liste des applications
3. Création de `AppDetailPage.js` pour le détail d'une application
4. Création de `LoginPage.js` pour la connexion
5. Création de `RegisterPage.js` pour l'inscription
6. Création de `ProfilePage.js` pour le profil utilisateur
7. Mise à jour de `App.js` pour activer les routes

## Ressources utiles

- [Documentation de React Router](https://reactrouter.com/en/main)
- [Documentation de Material UI](https://mui.com/material-ui/getting-started/overview/)
- [Documentation de React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [Gestion des formulaires avec React](https://reactjs.org/docs/forms.html)

## Contraintes

- Le code doit être bien commenté et suivre les bonnes pratiques
- Les composants doivent gérer correctement les états de chargement et d'erreur
- Les formulaires doivent valider les entrées avant de les envoyer à l'API
- Les pages doivent être responsive et s'adapter aux différentes tailles d'écran
- Les routes protégées doivent rediriger vers la page de connexion si l'utilisateur n'est pas authentifié

## Prochaines étapes

Une fois les pages publiques implémentées, nous améliorerons l'expérience utilisateur avec des fonctionnalités supplémentaires comme :
- Système de recherche avancée
- Filtres dynamiques
- Système de recommandation
- Intégration de paiement
