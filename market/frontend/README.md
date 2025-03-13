# Frontend de la Marketplace Web

Ce projet contient le code frontend de la Marketplace Web, une plateforme moderne et élégante permettant de présenter, distribuer et gérer diverses applications web.

## Technologies utilisées

- React 18
- React Router v6
- Material UI v5
- Axios pour les requêtes HTTP
- JWT pour l'authentification

## Structure du projet

```
frontend/
├── public/              # Fichiers statiques
├── src/                 # Code source
│   ├── components/      # Composants réutilisables
│   │   ├── common/      # Composants génériques
│   │   └── layout/      # Composants de mise en page
│   ├── contexts/        # Contextes React (auth, thème)
│   ├── pages/           # Pages de l'application
│   ├── services/        # Services (API, etc.)
│   ├── utils/           # Utilitaires
│   ├── App.js           # Composant principal
│   ├── index.js         # Point d'entrée
│   ├── theme.js         # Configuration du thème
│   └── index.css        # Styles globaux
└── package.json         # Dépendances et scripts
```

## Installation

```bash
# Installer les dépendances
npm install
```

## Développement

```bash
# Démarrer le serveur de développement
npm start
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

## Build pour production

```bash
# Créer un build optimisé pour la production
npm run build
```

Les fichiers de build seront générés dans le dossier `build/`.

## Déploiement

Le déploiement est géré par le script `scripts/deploy.sh` à la racine du projet. Ce script permet de déployer le frontend sur le serveur distant.

```bash
# Depuis la racine du projet
./scripts/deploy.sh
```

## Fonctionnalités principales

- Catalogue d'applications
- Système d'authentification
- Thème clair/sombre
- Design responsive
- Interface utilisateur moderne et intuitive

## Bonnes pratiques

- Utiliser les composants Material UI pour maintenir une cohérence visuelle
- Suivre le modèle de conception des composants existants
- Utiliser les contextes pour gérer l'état global
- Documenter les composants et fonctions complexes
