# Prompt pour Claude Sonnet 3.7 - Étape 7 : Gestion des applications de la Marketplace

## Contexte du projet

Tu travailles sur une Marketplace Web qui permet aux utilisateurs de découvrir, évaluer et télécharger des applications web. Les étapes précédentes du projet ont été complétées avec succès, notamment la correction des problèmes de connexion à MongoDB.

Maintenant, tu dois implémenter un système complet de gestion des applications pour la Marketplace, en suivant le plan d'action détaillé dans le document `docs/etape7_applications_management.md`.

## État actuel du projet

### Infrastructure

- **MongoDB** : Base de données installée et configurée sur le serveur
- **Backend Node.js/Express** : API fonctionnelle avec connexion à MongoDB
- **Frontend React** : Interface utilisateur fonctionnelle
- **Script de déploiement** : Script `scripts/deploy.sh` pour déployer le frontend, le backend et les applications

### Problèmes identifiés

1. L'initialisation de la base de données MongoDB n'est pas automatisée
2. L'ajout d'applications à la marketplace est complexe et manuel
3. Il n'existe pas de documentation claire sur le processus d'ajout d'applications
4. Les utilisateurs sans connaissances techniques ont du mal à ajouter des applications

## Ta mission

Tu dois implémenter un système complet de gestion des applications pour la Marketplace, en suivant les étapes définies dans le plan d'action. Cela implique :

1. Créer un script d'initialisation de MongoDB
2. Modifier le script de déploiement pour ajouter des fonctions de gestion des applications
3. Créer des scripts utilitaires pour la gestion des applications
4. Gérer les dépendances nécessaires
5. Renforcer la sécurité
6. Créer une documentation complète
7. Implémenter des tests de validation

## Tâches spécifiques

### 1. Script d'initialisation de MongoDB

Crée un script `init-mongodb.js` dans le répertoire `docs/mongodb/` qui :
- Accepte des paramètres en ligne de commande pour les identifiants administrateur
- Vérifie si l'initialisation a déjà été effectuée
- Crée les collections nécessaires (users, apps, categories)
- Ajoute un compte administrateur
- Ajoute des catégories de base (Productivité, Outils)
- Ajoute l'application NotePad comme application de démonstration
- Journalise clairement les actions effectuées
- Inclut une option pour réinitialiser la base de données (avec confirmation)

### 2. Modification du script de déploiement

Modifie le script `scripts/deploy.sh` pour ajouter :

- Une fonction `init_mongodb` qui :
  - Demande interactivement les identifiants administrateur
  - Vérifie si l'initialisation a déjà été effectuée
  - Transfère et exécute le script d'initialisation
  - Gère les erreurs et affiche des messages clairs
  - Inclut une option pour forcer la réinitialisation

- Des fonctions pour la gestion des applications :
  - `add_app_interactive` : Guide interactif pour ajouter une application
  - `auto_register_app` : Génération automatique basée sur le dossier de l'application
  - `register_app_from_template` : Utilisation de modèles prédéfinis
  - `deploy_app` : Commande tout-en-un pour déployer et enregistrer une application
  - `remove_app` : Fonction pour supprimer une application de la base de données
  - `list_apps` : Fonction pour lister les applications enregistrées

### 3. Scripts utilitaires pour la gestion des applications

Crée les scripts suivants dans le répertoire `docs/mongodb/` :

- `add-app.js` :
  - Fonction pour ajouter une application à partir d'un fichier JSON
  - Fonction pour mettre à jour une application existante
  - Vérification de l'existence de l'application
  - Validation des données d'entrée
  - Gestion des images et des ressources

- `app-templates.js` :
  - Modèles prédéfinis pour différents types d'applications
  - Fonction pour générer un fichier JSON à partir d'un modèle
  - Fonction pour extraire des informations du dossier de l'application

- `manage-apps.js` :
  - Fonction pour lister les applications
  - Fonction pour supprimer une application
  - Fonction pour activer/désactiver une application
  - Fonction pour mettre en avant une application

### 4. Documentation

Crée un document `docs/mongodb/app-management.md` qui explique :
- Le processus d'initialisation de MongoDB
- Comment ajouter une nouvelle application (avec différentes méthodes)
- Des exemples concrets avec NotePad et Transkryptor
- Les commandes disponibles et leur utilisation
- Les procédures de dépannage pour les problèmes courants

Mets également à jour le fichier `market/backend/README.md` pour référencer cette nouvelle documentation.

## Spécifications techniques

### Script d'initialisation de MongoDB

Le script doit :
- Utiliser la bibliothèque MongoDB native ou Mongoose
- Gérer les erreurs de manière robuste
- Fournir des messages clairs sur les actions effectuées
- Vérifier l'existence des collections avant de les créer
- Vérifier l'existence des utilisateurs avant de les créer
- Accepter des paramètres en ligne de commande (avec des valeurs par défaut)

### Fonctions de gestion des applications

Les fonctions doivent :
- Être intégrées au script de déploiement existant
- Suivre le même style et les mêmes conventions
- Fournir des messages clairs sur les actions effectuées
- Gérer les erreurs de manière robuste
- Être documentées dans le script lui-même

### Scripts utilitaires

Les scripts doivent :
- Être modulaires et réutilisables
- Accepter des paramètres en ligne de commande
- Fournir une aide en ligne
- Gérer les erreurs de manière robuste
- Être documentés dans le script lui-même

### Documentation

La documentation doit :
- Être claire et accessible aux utilisateurs non techniques
- Inclure des exemples concrets
- Expliquer les différentes méthodes d'ajout d'applications
- Fournir des procédures de dépannage
- Être bien structurée et facile à naviguer

## Exemples de code

### Exemple de script d'initialisation de MongoDB

```javascript
/**
 * Script d'initialisation de MongoDB pour la Marketplace
 * 
 * Ce script initialise la base de données MongoDB avec les collections,
 * les utilisateurs et les applications nécessaires.
 * 
 * Usage: node init-mongodb.js [options]
 * 
 * Options:
 *   --admin-email <email>     Email de l'administrateur (défaut: admin@marketplace.com)
 *   --admin-password <pwd>    Mot de passe de l'administrateur (défaut: admin123)
 *   --force                   Forcer la réinitialisation même si déjà initialisée
 *   --help                    Afficher l'aide
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Analyser les arguments de la ligne de commande
const args = process.argv.slice(2);
const options = {
  adminEmail: 'admin@marketplace.com',
  adminPassword: 'admin123',
  force: false
};

// Fonction principale
async function initMongoDB() {
  // Code d'initialisation...
}

// Exécuter la fonction principale
initMongoDB()
  .then(() => {
    console.log('Initialisation terminée avec succès');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erreur lors de l\'initialisation:', error);
    process.exit(1);
  });
```

### Exemple de fonction pour le script de déploiement

```bash
# Fonction pour initialiser MongoDB
init_mongodb() {
  info "Initialisation de MongoDB..."
  
  # Demander les informations d'identification de l'administrateur
  read -p "Email de l'administrateur [admin@marketplace.com]: " admin_email
  admin_email=${admin_email:-admin@marketplace.com}
  
  read -s -p "Mot de passe de l'administrateur [admin123]: " admin_password
  echo ""
  admin_password=${admin_password:-admin123}
  
  # Vérifier si l'initialisation a déjà été effectuée
  # ...
  
  # Transférer et exécuter le script d'initialisation
  # ...
}
```

## Ressources utiles

- [Documentation de MongoDB](https://docs.mongodb.com/)
- [Documentation de Mongoose](https://mongoosejs.com/docs/)
- [Documentation de Bash](https://www.gnu.org/software/bash/manual/bash.html)
- [Documentation de Node.js](https://nodejs.org/en/docs/)

## Contraintes

- Le code doit être bien commenté et suivre les bonnes pratiques
- Les scripts doivent être robustes et gérer les erreurs de manière appropriée
- La documentation doit être claire et accessible aux utilisateurs non techniques
- Les fonctionnalités doivent être testées avant d'être considérées comme terminées
- Le système doit être sécurisé et protégé contre les attaques courantes

## Prochaines étapes

Une fois ce système de gestion des applications implémenté, nous pourrons passer à l'étape suivante du projet, qui consistera à améliorer l'interface d'administration et à ajouter des fonctionnalités avancées pour la gestion des applications.
