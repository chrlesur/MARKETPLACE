# Prompt pour Claude Sonnet 3.7 - Étape 6 : Intégration d'applications tierces

## Contexte du projet

Tu travailles sur une Marketplace Web qui permet aux utilisateurs de découvrir, évaluer et télécharger des applications web. Les étapes 1 à 5 du projet ont été complétées avec succès :
- Étape 1 : Création d'un service API de base et d'un service d'authentification
- Étape 2 : Création des services API spécifiques pour les applications, catégories et utilisateurs
- Étape 3 : Mise à jour des composants d'administration pour utiliser les services API
- Étape 4 : Implémentation des pages publiques et mise à jour de la page d'accueil
- Étape 5 : Amélioration de l'expérience utilisateur

Maintenant, tu dois intégrer des applications tierces à la marketplace, en améliorant l'intégration de Transkryptor et en créant une nouvelle application de démonstration.

## État actuel du projet

### Applications existantes

- **Transkryptor** : Application de transcription audio et d'analyse de contenu utilisant l'IA, déjà intégrée à la marketplace mais nécessitant des améliorations.

### Infrastructure de déploiement

- **Script de déploiement** (`scripts/deploy.sh`) : Script permettant de déployer le frontend, le backend et les applications tierces sur le serveur distant.
- **Configuration Nginx** : Configuration pour servir la marketplace et les applications tierces.

### Problèmes identifiés

1. **Intégration basique de Transkryptor** : L'application est accessible via une route dédiée, mais l'intégration avec la marketplace est minimale.
2. **Manque d'authentification partagée** : Les utilisateurs doivent se connecter séparément à chaque application.
3. **Incohérence visuelle** : Le style de Transkryptor ne correspond pas à celui de la marketplace.
4. **Navigation non optimale** : La navigation entre la marketplace et les applications tierces n'est pas fluide.

## Ta mission

Tu dois améliorer l'intégration des applications tierces à la marketplace et créer une nouvelle application de démonstration. Cela implique :

1. Améliorer l'intégration de Transkryptor
2. Créer une nouvelle application de démonstration (NotePad)
3. Mettre à jour le script de déploiement
4. Mettre à jour la configuration Nginx

## Tâches spécifiques

### 1. Amélioration de l'intégration de Transkryptor

- **Harmonisation du style** : Mettre à jour les styles CSS de Transkryptor pour correspondre à ceux de la marketplace
- **Authentification partagée** : Implémenter un système d'authentification partagée entre la marketplace et Transkryptor
- **Navigation améliorée** : Ajouter des liens de navigation entre la marketplace et Transkryptor
- **Intégration des notifications** : Utiliser le système de notification de la marketplace dans Transkryptor

### 2. Création d'une application NotePad

Créer une application simple de prise de notes avec les fonctionnalités suivantes :
- **Interface utilisateur** : Créer une interface utilisateur pour la création, l'édition et la suppression de notes
- **Stockage des données** : Implémenter un système de stockage des notes (localStorage ou backend)
- **Fonctionnalités de base** : Création, édition, suppression et recherche de notes
- **Fonctionnalités avancées** : Formatage du texte, tags, partage de notes
- **Intégration avec la marketplace** : Authentification partagée, style cohérent, navigation fluide

### 3. Mise à jour du script de déploiement

- **Amélioration de la gestion des applications** : Optimiser le déploiement des applications tierces
- **Ajout d'options de déploiement** : Ajouter des options pour le déploiement spécifique de certaines parties des applications
- **Optimisation du processus de déploiement** : Réduire le temps de déploiement et améliorer la fiabilité

### 4. Mise à jour de la configuration Nginx

- **Ajout de routes pour NotePad** : Configurer Nginx pour servir la nouvelle application
- **Optimisation des en-têtes** : Améliorer les en-têtes de sécurité et de cache
- **Configuration des redirections** : Optimiser les redirections entre les applications

## Spécifications techniques

### Structure des applications

Chaque application tierce doit suivre la structure suivante :
```
apps/
  nom-app/
    public/           # Frontend de l'application
      index.html
      css/
      js/
    server.js         # Serveur Node.js (si nécessaire)
    package.json      # Dépendances
    README.md         # Documentation
```

### Authentification partagée

L'authentification partagée doit être implémentée en utilisant les tokens JWT :
- Le token JWT est stocké dans le localStorage
- Les applications tierces vérifient la validité du token
- Si le token est invalide ou expiré, l'utilisateur est redirigé vers la page de connexion de la marketplace

### Style cohérent

Pour assurer une cohérence visuelle :
- Utiliser les mêmes couleurs, polices et composants UI que la marketplace
- Créer un fichier CSS partagé pour les styles communs
- Adapter les composants spécifiques à chaque application tout en maintenant une apparence cohérente

### Navigation fluide

Pour améliorer la navigation entre les applications :
- Ajouter un menu de navigation commun
- Implémenter des liens directs entre les applications
- Conserver le contexte lors du passage d'une application à l'autre

## Exemples de code

### Exemple 1 : Authentification partagée

```javascript
// Fichier auth.js pour les applications tierces

/**
 * Vérifie si l'utilisateur est authentifié
 * @returns {boolean} Vrai si l'utilisateur est authentifié
 */
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Vérifier si le token est expiré
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiration = payload.exp * 1000; // Convertir en millisecondes
    
    if (Date.now() >= expiration) {
      localStorage.removeItem('token');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    localStorage.removeItem('token');
    return false;
  }
};

/**
 * Redirige vers la page de connexion de la marketplace
 */
const redirectToLogin = () => {
  const currentPath = window.location.pathname;
  window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
};

/**
 * Récupère les informations de l'utilisateur à partir du token
 * @returns {Object|null} Informations de l'utilisateur ou null si non authentifié
 */
const getUserInfo = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    return null;
  }
};

export { isAuthenticated, redirectToLogin, getUserInfo };
```

### Exemple 2 : Structure de base de l'application NotePad

```javascript
// Structure des fichiers pour l'application NotePad

// apps/notepad/public/index.html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NotePad - Marketplace</title>
  <link rel="stylesheet" href="/notepad/css/styles.css">
</head>
<body>
  <div id="app"></div>
  <script src="/notepad/js/auth.js"></script>
  <script src="/notepad/js/app.js"></script>
</body>
</html>

// apps/notepad/public/js/app.js
document.addEventListener('DOMContentLoaded', () => {
  // Vérifier si l'utilisateur est authentifié
  if (!isAuthenticated()) {
    redirectToLogin();
    return;
  }
  
  // Initialiser l'application
  initApp();
});

function initApp() {
  const app = document.getElementById('app');
  
  // Récupérer les informations de l'utilisateur
  const user = getUserInfo();
  
  // Créer l'interface utilisateur
  app.innerHTML = `
    <header class="notepad-header">
      <h1>NotePad</h1>
      <div class="user-info">
        <span>Bonjour, ${user.name}</span>
        <a href="/" class="btn-link">Retour à la Marketplace</a>
      </div>
    </header>
    
    <main class="notepad-main">
      <div class="sidebar">
        <button id="new-note" class="btn-primary">Nouvelle note</button>
        <div id="notes-list" class="notes-list"></div>
      </div>
      
      <div class="editor">
        <div class="editor-toolbar">
          <button id="save-note" class="btn-secondary">Enregistrer</button>
          <button id="delete-note" class="btn-danger">Supprimer</button>
        </div>
        <textarea id="note-content" placeholder="Écrivez votre note ici..."></textarea>
      </div>
    </main>
  `;
  
  // Initialiser les gestionnaires d'événements
  initEventListeners();
  
  // Charger les notes existantes
  loadNotes();
}

// Autres fonctions pour la gestion des notes...
```

### Exemple 3 : Mise à jour de la configuration Nginx

```nginx
# Configuration pour l'application NotePad
location /notepad {
    alias /var/www/marketplace/apps/notepad/public;
    try_files $uri $uri/ /notepad/index.html;
    
    # Configuration de sécurité
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";
}
```

## Livrables attendus

1. **Transkryptor amélioré** :
   - Styles CSS mis à jour
   - Système d'authentification partagée
   - Navigation améliorée

2. **Application NotePad** :
   - Interface utilisateur complète
   - Fonctionnalités de base (CRUD pour les notes)
   - Intégration avec la marketplace

3. **Script de déploiement mis à jour** :
   - Optimisation du déploiement des applications
   - Nouvelles options de déploiement

4. **Configuration Nginx mise à jour** :
   - Routes pour NotePad
   - Optimisation des en-têtes et des redirections

## Ressources utiles

- [Documentation de localStorage](https://developer.mozilla.org/fr/docs/Web/API/Window/localStorage)
- [Documentation de JWT](https://jwt.io/introduction)
- [Documentation de Nginx](https://nginx.org/en/docs/)
- [Tutoriel sur la création d'une application de notes](https://www.taniarascia.com/javascript-mvc-todo-app/)

## Contraintes

- Les applications tierces doivent fonctionner même si la marketplace est indisponible
- Le code doit être bien commenté et suivre les bonnes pratiques
- Les applications doivent être responsive et s'adapter aux différentes tailles d'écran
- L'authentification partagée doit être sécurisée et respecter les bonnes pratiques

## Prochaines étapes

Une fois les applications tierces intégrées, nous ajouterons des tests et optimiserons les performances de l'ensemble de la marketplace.
