# Marketplace Web

Une plateforme moderne et élégante permettant de présenter, distribuer et gérer diverses applications web.

## Présentation

La Marketplace Web est une plateforme centralisée qui permet aux utilisateurs de découvrir, installer et utiliser diverses applications web. Chaque application est autonome avec son propre frontend et backend, tout en étant intégrée de manière cohérente dans l'écosystème de la marketplace.

Cette plateforme offre :
- Un catalogue d'applications organisé par catégories
- Un système d'authentification centralisé
- Une interface utilisateur moderne et responsive
- Une API backend robuste pour la gestion des applications et des utilisateurs

## État du projet

Le projet est en cours de développement. Voici ce qui a été réalisé jusqu'à présent :

- ✅ Création de la structure du projet
- ✅ Mise en place du script de déploiement
- ✅ Documentation initiale (expression de besoin, mockup)
- ✅ Configuration du serveur distant
- ✅ Déploiement initial des fichiers de base

Prochaines étapes :
- Développement du frontend React
- Développement du backend Express/MongoDB
- Intégration de l'application exemple Transkryptor
- Tests et déploiement complet

## Structure du projet

```
marketplace/
├── market/                # Code principal de la marketplace
│   ├── frontend/          # Interface utilisateur React
│   └── backend/           # API backend Node.js/Express
├── apps/                  # Applications intégrées à la marketplace
│   └── transkryptor/      # Application exemple de transcription audio
├── docs/                  # Documentation
└── scripts/               # Scripts utilitaires (déploiement, etc.)
```

## Technologies utilisées

### Frontend
- React.js
- Material UI
- Context API pour la gestion d'état
- React Router pour la navigation
- Axios pour les requêtes HTTP

### Backend
- Node.js
- Express.js
- MongoDB (avec Mongoose)
- JWT pour l'authentification
- Validation avec express-validator

### Infrastructure
- Nginx comme serveur web et proxy inverse
- PM2 pour la gestion des processus Node.js
- Scripts bash pour le déploiement

## Installation et démarrage

### Prérequis
- Node.js 18.0.0 ou supérieur
- MongoDB
- npm ou yarn

### Backend

1. Accédez au répertoire du backend :
   ```bash
   cd market/backend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement :
   - Copiez le fichier `.env.example` en `.env`
   - Remplissez les valeurs requises

4. Démarrez le serveur en mode développement :
   ```bash
   npm run dev
   ```

### Frontend

1. Accédez au répertoire du frontend :
   ```bash
   cd market/frontend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Démarrez le serveur de développement :
   ```bash
   npm start
   ```

## Applications intégrées

### Transkryptor

Transkryptor est une application de transcription audio et d'analyse de contenu utilisant l'intelligence artificielle. Elle permet de convertir des fichiers audio en texte et d'analyser ce texte pour en extraire des informations pertinentes.

#### Fonctionnalités principales
- Transcription audio vers texte via l'API OpenAI Whisper
- Analyse de texte avec Claude d'Anthropic
- Génération de synthèses et d'extractions de faits
- Interface utilisateur intuitive et responsive

#### Intégration avec la marketplace
L'application Transkryptor a été optimisée pour s'intégrer parfaitement à la marketplace :
- Accès direct via l'URL `/transkryptor/`
- Interface utilisateur adaptée au style de la marketplace
- Gestion optimisée des fichiers audio volumineux
- Barres de progression améliorées pour le suivi des traitements

#### Améliorations récentes
- Correction de l'URL d'accès pour permettre une redirection directe depuis la marketplace
- Optimisation de la route `/transcribe` pour un traitement plus efficace des fichiers audio
- Amélioration de l'interface utilisateur (largeur adaptative, boutons centrés, barres de progression)
- Installation automatique des dépendances requises lors du déploiement

Pour plus d'informations, consultez le [README de Transkryptor](apps/transkryptor/README.md).

## Déploiement

Le déploiement est géré par le script `scripts/deploy.sh`. Ce script permet de déployer le frontend, le backend et les applications sur le serveur distant.

```bash
# Déployer toute la marketplace
./scripts/deploy.sh all

# Déployer uniquement le frontend
./scripts/deploy.sh frontend

# Déployer uniquement le backend
./scripts/deploy.sh backend

# Déployer une application spécifique
./scripts/deploy.sh app transkryptor
```

## Documentation

Pour plus d'informations sur l'architecture et les fonctionnalités de la marketplace, consultez les documents suivants :

- [Expression de besoin](docs/expression_de_besoin.md)
- [Mockup interactif](docs/marketplace_mockup.html)

## Licence

Ce projet est fourni sous licence propriétaire. Tous droits réservés.

## Auteur

Christophe LESUR
