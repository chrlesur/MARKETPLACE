# Backend de la Marketplace Web

Ce projet contient le code backend (API) de la Marketplace Web, une plateforme moderne et élégante permettant de présenter, distribuer et gérer diverses applications web.

## Technologies utilisées

- Node.js
- Express.js
- MongoDB (avec Mongoose)
- JWT pour l'authentification
- Autres : cors, helmet, compression, morgan, etc.

## Structure du projet

```
backend/
├── config/              # Configuration (base de données, etc.)
├── controllers/         # Contrôleurs pour gérer la logique métier
├── middleware/          # Middleware personnalisés
├── models/              # Modèles de données (Mongoose)
├── routes/              # Routes API
├── .env                 # Variables d'environnement
├── package.json         # Dépendances et scripts
└── server.js            # Point d'entrée du serveur
```

## Installation

```bash
# Installer les dépendances
npm install
```

## Développement

```bash
# Démarrer le serveur en mode développement
npm run dev
```

Le serveur sera accessible à l'adresse [http://localhost:3001](http://localhost:3001).

## Production

```bash
# Démarrer le serveur en mode production
npm start
```

## Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
PORT=3001
NODE_ENV=development
JWT_SECRET=votre_secret_jwt
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb://localhost:27017/marketplace
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

> **Note :** Si `MONGODB_URI` n'est pas défini, l'application utilisera par défaut `mongodb://localhost:27017/marketplace`.

## API Endpoints

### Authentification

- `POST /api/auth/register` - Inscription d'un nouvel utilisateur
- `POST /api/auth/login` - Connexion d'un utilisateur
- `GET /api/auth/me` - Récupérer les informations de l'utilisateur connecté

### Applications

- `GET /api/apps` - Récupérer toutes les applications
- `GET /api/apps/:id` - Récupérer une application spécifique
- `POST /api/apps` - Créer une nouvelle application (admin)
- `PUT /api/apps/:id` - Mettre à jour une application (admin)
- `DELETE /api/apps/:id` - Supprimer une application (admin)

### Catégories

- `GET /api/categories` - Récupérer toutes les catégories
- `GET /api/categories/:id` - Récupérer une catégorie spécifique
- `POST /api/categories` - Créer une nouvelle catégorie (admin)
- `PUT /api/categories/:id` - Mettre à jour une catégorie (admin)
- `DELETE /api/categories/:id` - Supprimer une catégorie (admin)

### Utilisateurs

- `GET /api/users` - Récupérer tous les utilisateurs (admin)
- `GET /api/users/:id` - Récupérer un utilisateur spécifique (admin)
- `PUT /api/users/:id` - Mettre à jour un utilisateur (admin ou propriétaire)
- `DELETE /api/users/:id` - Supprimer un utilisateur (admin ou propriétaire)

## Connexion à MongoDB

L'application se connecte automatiquement à MongoDB au démarrage. La configuration de connexion se trouve dans le fichier `config/db.js`. Les fonctionnalités principales incluent :

- Connexion automatique à la base de données spécifiée par `MONGODB_URI`
- Création automatique des collections requises si elles n'existent pas
- Gestion robuste des erreurs et reconnexion automatique
- Journalisation détaillée pour faciliter le débogage

En cas de problème de connexion, vérifiez que :
- MongoDB est installé et en cours d'exécution
- L'URI de connexion est correct
- Les permissions sont correctement configurées

## Déploiement

Le déploiement est géré par le script `scripts/deploy.sh` à la racine du projet. Ce script permet de déployer le backend sur le serveur distant.

```bash
# Déployer tout le projet
./scripts/deploy.sh all

# Déployer uniquement le backend
./scripts/deploy.sh backend
```

## Bonnes pratiques

- Utiliser les contrôleurs pour la logique métier
- Utiliser les middleware pour la validation et l'authentification
- Documenter les endpoints API
- Gérer correctement les erreurs

## Gestion des applications

La Marketplace inclut un système complet de gestion des applications qui permet d'initialiser la base de données, d'ajouter des applications et de les gérer.

### Scripts disponibles

- `scripts/manage-apps.sh` : Script principal pour la gestion des applications
- `docs/mongodb/init-mongodb.js` : Script d'initialisation de MongoDB
- `docs/mongodb/add-app.js` : Script pour ajouter ou mettre à jour une application
- `docs/mongodb/app-templates.js` : Script pour générer des templates d'applications
- `docs/mongodb/manage-apps.js` : Script pour gérer les applications existantes

### Documentation

Pour plus d'informations sur la gestion des applications, consultez le document [docs/mongodb/app-management.md](../docs/mongodb/app-management.md) qui explique en détail :

- Le processus d'initialisation de MongoDB
- Les différentes méthodes pour ajouter des applications
- La gestion des applications existantes
- Des exemples concrets avec NotePad et Transkryptor
- Les procédures de dépannage
