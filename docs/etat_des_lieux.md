# État des lieux de la Marketplace Web

*Date : 13/03/2025*

## Table des matières

1. [Architecture globale](#architecture-globale)
2. [Frontend](#frontend)
   - [Interface d'administration](#interface-dadministration)
   - [Interface publique](#interface-publique)
   - [Authentification](#authentification)
   - [État du déploiement](#état-du-déploiement-frontend)
3. [Backend](#backend)
   - [API RESTful](#api-restful)
   - [Modèles de données](#modèles-de-données)
   - [Sécurité](#sécurité)
   - [État du déploiement](#état-du-déploiement-backend)
4. [Applications intégrées](#applications-intégrées)
   - [Transkryptor](#transkryptor)
5. [Infrastructure de déploiement](#infrastructure-de-déploiement)
   - [Serveur](#serveur)
   - [Script de déploiement](#script-de-déploiement)
6. [Prochaines étapes recommandées](#prochaines-étapes-recommandées)

## Architecture globale

La marketplace est structurée en trois composants principaux :

1. **Frontend** : Application React.js avec Material UI
2. **Backend** : API Node.js/Express avec MongoDB
3. **Applications intégrées** : Applications tierces comme Transkryptor

L'architecture suit un modèle client-serveur classique avec une séparation claire entre le frontend et le backend. Le frontend communique avec le backend via des API RESTful. Les applications tierces sont intégrées à la marketplace via des routes dédiées.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│   MongoDB   │
│  (React.js) │◀────│  (Express)  │◀────│  (Database) │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│ Applications│     │  External   │
│  intégrées  │     │    APIs     │
└─────────────┘     └─────────────┘
```

## Frontend

### Technologies utilisées

- **React.js** (v18.2.0) : Bibliothèque JavaScript pour construire l'interface utilisateur
- **React Router** (v6.22.1) : Gestion du routage côté client
- **Material UI** (v5.15.10) : Bibliothèque de composants UI
- **Axios** (v1.6.7) : Client HTTP pour les requêtes API
- **JWT Decode** (v4.0.0) : Décodage des tokens JWT

### Interface d'administration

L'interface d'administration est accessible à l'URL `/admin` et comprend les sections suivantes :

- **Tableau de bord** : Affichage des statistiques globales (nombre d'applications, catégories, utilisateurs, etc.)
- **Applications** : Gestion des applications (liste, création, édition, suppression)
- **Catégories** : Gestion des catégories (liste, création, édition, suppression)
- **Utilisateurs** : Gestion des utilisateurs (liste, création, édition, suppression)
- **Paramètres** : Configuration générale de la marketplace

L'interface d'administration utilise un layout commun avec une barre latérale de navigation et une barre supérieure. Les routes sont protégées par un middleware d'authentification qui vérifie si l'utilisateur est connecté et a le rôle d'administrateur.

### Interface publique

L'interface publique est accessible à l'URL racine `/` et comprend actuellement :

- **Page d'accueil** : Page principale avec plusieurs sections :
  - Section hero avec barre de recherche
  - Section des catégories populaires
  - Section d'application vedette
  - Section des applications populaires
  - Section CTA (Call to Action)

Les routes suivantes sont définies mais pas encore implémentées :
- `/apps` : Liste des applications
- `/apps/:appId` : Détail d'une application
- `/login` : Page de connexion
- `/register` : Page d'inscription
- `/profile` : Profil utilisateur

### Authentification

L'authentification est gérée via un contexte React (`AuthContext`) qui fournit :

- Fonctions de connexion, inscription et déconnexion
- État de l'utilisateur courant
- État de chargement et erreurs

Actuellement, l'authentification utilise des données fictives. Les appels API réels sont commentés dans le code.

### État du déploiement (Frontend)

- **URL** : https://market.quantum-dream.net
- **Répertoire** : /var/www/marketplace/frontend
- **Serveur web** : Nginx avec SSL (Let's Encrypt)
- **Problèmes connus** : 
  - Erreur CSP pour le chargement des polices Google Fonts
  - Certaines ressources (comme favicon.ico et logo192.png) sont manquantes

## Backend

### Technologies utilisées

- **Node.js** (v18+) : Environnement d'exécution JavaScript
- **Express** (v4.18.2) : Framework web
- **Mongoose** (v8.1.3) : ODM pour MongoDB
- **JWT** (v9.0.2) : Gestion des tokens d'authentification
- **bcryptjs** (v2.4.3) : Hachage des mots de passe
- **express-validator** (v7.0.1) : Validation des entrées

### API RESTful

Le backend expose les API suivantes :

#### Authentification (`/api/auth`)

- `POST /api/auth/register` : Inscription d'un nouvel utilisateur
- `POST /api/auth/login` : Connexion d'un utilisateur
- `GET /api/auth/me` : Récupération des informations de l'utilisateur connecté
- `POST /api/auth/logout` : Déconnexion (côté client uniquement)

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

#### Autres

- `GET /api/test` : Route de test pour vérifier que l'API fonctionne
- `POST /test-keys` : Validation des clés API (utilisée par Transkryptor)

### Modèles de données

#### Utilisateur (`User`)

```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: String ('user' or 'admin'),
  avatar: String,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  isActive: Boolean,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}
```

#### Application (`App`)

```javascript
{
  name: String,
  slug: String,
  description: {
    short: String,
    full: String
  },
  developer: {
    name: String,
    website: String,
    email: String
  },
  category: ObjectId (ref: 'Category'),
  tags: [String],
  images: {
    icon: String,
    banner: String,
    screenshots: [{
      url: String,
      caption: String
    }]
  },
  pricing: {
    type: String ('free', 'paid', 'subscription'),
    price: Number,
    currency: String,
    trialDays: Number
  },
  url: String,
  apiEndpoint: String,
  version: String,
  requirements: String,
  isActive: Boolean,
  isFeatured: Boolean,
  ratings: [{
    user: ObjectId (ref: 'User'),
    rating: Number,
    comment: String,
    createdAt: Date
  }],
  downloads: Number,
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Catégorie (`Category`)

```javascript
{
  name: String,
  slug: String,
  description: String,
  icon: String,
  color: String,
  isActive: Boolean,
  order: Number,
  parent: ObjectId (ref: 'Category'),
  createdAt: Date,
  updatedAt: Date
}
```

### Sécurité

- **Authentification** : Utilisation de JWT (JSON Web Tokens) pour l'authentification
- **Autorisation** : Middleware pour vérifier les rôles (utilisateur, administrateur)
- **Hachage des mots de passe** : Utilisation de bcrypt pour hacher les mots de passe
- **Validation des entrées** : Utilisation d'express-validator pour valider les entrées
- **Protection contre les attaques courantes** : Utilisation de helmet pour sécuriser les en-têtes HTTP

### État du déploiement (Backend)

- **URL** : https://market.quantum-dream.net/api
- **Répertoire** : /var/www/marketplace/backend
- **Process manager** : PM2 pour assurer la persistance
- **Base de données** : MongoDB (configuration non vérifiée)

## Applications intégrées

### Transkryptor

Transkryptor est une application web pour la transcription audio, l'analyse de transcriptions et la génération de synthèses.

#### Fonctionnalités

- **Transcription audio** : Support des fichiers au format M4A
- **Analyse de transcription** : Analyse approfondie du contenu transcrit
- **Génération de synthèse** : Création de résumés concis et informatifs
- **Validation des clés API** : Test des clés API OpenAI et Anthropic
- **Suivi de progression** : Affichage en temps réel de la progression

#### Technologies utilisées

- **Frontend** : HTML, CSS, JavaScript
- **Backend** : Node.js, Express
- **APIs externes** : OpenAI Whisper API, Anthropic Claude API

#### Intégration

- **URL** : https://market.quantum-dream.net/transkryptor
- **Répertoire** : /var/www/marketplace/apps/transkryptor
- **Configuration Nginx** : Alias vers le répertoire public de Transkryptor

## Infrastructure de déploiement

### Serveur

- **Nom d'hôte** : market.quantum-dream.net
- **Port SSH** : 4022
- **Utilisateur** : market
- **Système d'exploitation** : Linux (probablement CentOS/RHEL basé sur la présence de SELinux)
- **Serveur web** : Nginx avec SSL (Let's Encrypt)
- **Process manager** : PM2 pour les applications Node.js

### Script de déploiement

Un script de déploiement (`scripts/deploy.sh`) est disponible pour automatiser le déploiement du frontend, du backend et des applications intégrées.

#### Fonctionnalités

- **Déploiement du frontend** :
  - Création d'une archive des fichiers source
  - Transfert de l'archive sur le serveur
  - Compilation du frontend sur le serveur
  - Configuration de Nginx
  - Gestion des permissions et contextes SELinux

- **Déploiement du backend** :
  - Création d'une archive des fichiers source
  - Transfert de l'archive sur le serveur
  - Installation des dépendances
  - Redémarrage de l'application via PM2

- **Déploiement des applications** :
  - Déploiement du frontend et du backend des applications
  - Configuration spécifique pour chaque application

## Prochaines étapes recommandées

1. **Implémentation des pages publiques manquantes** :
   - Page de liste des applications (AppsPage)
   - Page de détail d'une application (AppDetailPage)
   - Page de connexion (LoginPage)
   - Page d'inscription (RegisterPage)
   - Page de profil utilisateur (ProfilePage)
   - Page des catégories (CategoriesPage)

2. **Connexion du frontend au backend** :
   - Création des services API pour communiquer avec le backend
   - Remplacement des données fictives par des données réelles
   - Implémentation de l'authentification réelle

3. **Amélioration de l'expérience utilisateur** :
   - Correction des problèmes de Content Security Policy pour les polices Google Fonts
   - Ajout d'indicateurs de chargement
   - Gestion des erreurs et messages de feedback

4. **Intégration d'autres applications** :
   - Ajout d'autres applications à la marketplace
   - Amélioration de l'intégration de Transkryptor

5. **Tests et optimisation** :
   - Ajout de tests unitaires et d'intégration
   - Optimisation des performances
   - Amélioration de la sécurité
