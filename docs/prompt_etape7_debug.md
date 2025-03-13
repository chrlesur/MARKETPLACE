# Prompt pour Claude Sonnet 3.7 - Étape 7 (Partie 1) : Débogage de la connexion MongoDB

## Contexte du problème

La Marketplace Web rencontre actuellement des problèmes critiques avec le backend. Toutes les requêtes API renvoient des erreurs 500 (Internal Server Error), ce qui empêche l'application de fonctionner correctement. Les logs d'erreur indiquent que le problème est probablement lié à la connexion à MongoDB, qui a été récemment installé sur le serveur.

Voici quelques exemples d'erreurs observées dans la console du navigateur :

```
GET https://market.quantum-dream.net/api/apps?isFeatured=true&limit=3 500 (Internal Server Error)
GET https://market.quantum-dream.net/api/apps?page=1&limit=9&sort=popular 500 (Internal Server Error)
GET https://market.quantum-dream.net/api/categories 500 (Internal Server Error)
```

Les erreurs contiennent le message : "Une erreur est survenue sur le serveur. Veuillez réessayer plus tard."

## État actuel du projet

### Infrastructure

- **MongoDB** : Récemment installé sur le serveur via le script `install_mongodb.sh`
- **Backend Node.js/Express** : Configuré pour se connecter à MongoDB, mais rencontre des erreurs
- **PM2** : Utilisé pour gérer le processus du backend

### Fichiers pertinents

- **market/backend/config/db.js** : Configuration de la connexion à MongoDB
- **market/backend/server.js** : Point d'entrée du backend
- **docs/mongodb/install_mongodb.sh** : Script d'installation de MongoDB
- **docs/mongodb/README.md** : Documentation sur l'installation et la configuration de MongoDB

## Ta mission

Tu dois déboguer et résoudre les problèmes de connexion à MongoDB pour que le backend puisse fonctionner correctement. Cela implique :

1. Analyser la configuration de connexion à MongoDB
2. Vérifier l'installation de MongoDB sur le serveur
3. Identifier et corriger les erreurs dans le code
4. Tester la connexion à MongoDB
5. Redémarrer le backend avec la configuration corrigée

## Tâches spécifiques

### 1. Analyse de la configuration de connexion à MongoDB

- Examiner le fichier `market/backend/config/db.js` pour identifier les problèmes potentiels
- Vérifier que l'URI de connexion est correcte
- Vérifier que les options de connexion sont appropriées
- Identifier les erreurs de syntaxe ou les problèmes de configuration

### 2. Vérification de l'installation de MongoDB

- Créer un script pour vérifier que MongoDB est correctement installé et en cours d'exécution sur le serveur
- Vérifier que les collections nécessaires ont été créées
- Vérifier les permissions et l'accessibilité de la base de données

### 3. Correction des erreurs dans le code

- Corriger les erreurs identifiées dans le fichier `db.js`
- Améliorer la gestion des erreurs pour fournir des messages plus détaillés
- Ajouter des logs pour faciliter le débogage

### 4. Test de la connexion à MongoDB

- Créer un script de test pour vérifier la connexion à MongoDB
- Tester les opérations CRUD de base pour s'assurer que tout fonctionne correctement
- Vérifier que les requêtes API fonctionnent correctement

### 5. Redémarrage du backend

- Mettre à jour la configuration PM2 si nécessaire
- Redémarrer le backend avec la nouvelle configuration
- Vérifier que les requêtes API fonctionnent correctement

## Spécifications techniques

### Configuration de MongoDB

La configuration de connexion à MongoDB doit inclure :

- L'URI de connexion correcte : `mongodb://localhost:27017/marketplace`
- Les options de connexion appropriées :
  - `useNewUrlParser: true` (si nécessaire selon la version de MongoDB)
  - `useUnifiedTopology: true` (si nécessaire selon la version de MongoDB)
  - Timeout approprié
  - Retry approprié
- Une gestion robuste des erreurs

### Gestion des erreurs

La gestion des erreurs doit être améliorée pour :

- Fournir des messages d'erreur plus détaillés
- Logger les erreurs avec suffisamment de contexte pour faciliter le débogage
- Gérer les cas spécifiques comme les timeouts, les erreurs d'authentification, etc.

### Vérification de l'installation

Le script de vérification de l'installation doit :

- Vérifier que le service MongoDB est en cours d'exécution
- Vérifier que la base de données `marketplace` existe
- Vérifier que les collections nécessaires existent
- Vérifier que les permissions sont correctes

## Exemples de code

### Exemple 1 : Configuration de connexion à MongoDB corrigée

```javascript
// market/backend/config/db.js
const mongoose = require('mongoose');
const logger = require('../utils/logger'); // Assurez-vous que ce module existe ou créez-le

// URI de connexion à MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace';

// Options de connexion
const options = {
  useNewUrlParser: true, // Pour les versions plus anciennes de MongoDB
  useUnifiedTopology: true, // Pour les versions plus anciennes de MongoDB
  serverSelectionTimeoutMS: 5000, // Timeout de 5 secondes pour la sélection du serveur
  socketTimeoutMS: 45000, // Timeout de 45 secondes pour les opérations
  connectTimeoutMS: 10000, // Timeout de 10 secondes pour la connexion initiale
  retryWrites: true, // Réessayer les opérations d'écriture en cas d'échec
  family: 4 // Forcer IPv4
};

// Fonction de connexion à MongoDB
const connectDB = async () => {
  try {
    logger.info('Tentative de connexion à MongoDB...');
    
    const conn = await mongoose.connect(mongoURI, options);
    
    logger.info(`MongoDB connecté: ${conn.connection.host}`);
    
    // Vérifier que les collections existent
    const collections = await conn.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    logger.info(`Collections disponibles: ${collectionNames.join(', ')}`);
    
    // Créer les collections si elles n'existent pas
    const requiredCollections = ['apps', 'categories', 'users'];
    for (const collection of requiredCollections) {
      if (!collectionNames.includes(collection)) {
        logger.warn(`Collection ${collection} non trouvée, création en cours...`);
        await conn.connection.db.createCollection(collection);
        logger.info(`Collection ${collection} créée avec succès`);
      }
    }
    
    return conn;
  } catch (error) {
    logger.error(`Erreur de connexion à MongoDB: ${error.message}`);
    
    // Fournir des informations plus détaillées sur l'erreur
    if (error.name === 'MongoServerSelectionError') {
      logger.error('Impossible de se connecter au serveur MongoDB. Vérifiez que le service est en cours d\'exécution.');
    } else if (error.name === 'MongoNetworkError') {
      logger.error('Erreur réseau lors de la connexion à MongoDB. Vérifiez la connectivité réseau.');
    }
    
    // En mode développement, afficher la stack trace complète
    if (process.env.NODE_ENV === 'development') {
      logger.error(error.stack);
    }
    
    // Sortir du processus en cas d'erreur de connexion en production
    if (process.env.NODE_ENV === 'production') {
      logger.error('Arrêt du serveur en raison d\'une erreur de connexion à MongoDB');
      process.exit(1);
    }
    
    throw error;
  }
};

module.exports = connectDB;
```

### Exemple 2 : Script de vérification de l'installation de MongoDB

```javascript
// scripts/check-mongodb.js
const { MongoClient } = require('mongodb');

// URI de connexion à MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace';

// Fonction pour vérifier l'installation de MongoDB
const checkMongoDB = async () => {
  let client;
  
  try {
    console.log('Vérification de l\'installation de MongoDB...');
    
    // Connexion à MongoDB
    client = new MongoClient(mongoURI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    await client.connect();
    console.log('Connexion à MongoDB réussie');
    
    // Vérifier la version de MongoDB
    const adminDb = client.db('admin');
    const serverInfo = await adminDb.command({ serverStatus: 1 });
    console.log(`Version de MongoDB: ${serverInfo.version}`);
    
    // Vérifier que la base de données marketplace existe
    const dbs = await client.db().admin().listDatabases();
    const dbNames = dbs.databases.map(db => db.name);
    
    if (dbNames.includes('marketplace')) {
      console.log('Base de données marketplace trouvée');
    } else {
      console.warn('Base de données marketplace non trouvée');
    }
    
    // Vérifier que les collections nécessaires existent
    const db = client.db('marketplace');
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(`Collections disponibles: ${collectionNames.join(', ')}`);
    
    const requiredCollections = ['apps', 'categories', 'users'];
    for (const collection of requiredCollections) {
      if (collectionNames.includes(collection)) {
        console.log(`Collection ${collection} trouvée`);
      } else {
        console.warn(`Collection ${collection} non trouvée`);
      }
    }
    
    // Vérifier que nous pouvons effectuer des opérations CRUD
    const testCollection = db.collection('test');
    
    // Créer
    const insertResult = await testCollection.insertOne({ test: 'test', date: new Date() });
    console.log(`Insertion réussie: ${insertResult.insertedId}`);
    
    // Lire
    const findResult = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log(`Lecture réussie: ${findResult.test}`);
    
    // Mettre à jour
    const updateResult = await testCollection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { test: 'test updated' } }
    );
    console.log(`Mise à jour réussie: ${updateResult.modifiedCount} document modifié`);
    
    // Supprimer
    const deleteResult = await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log(`Suppression réussie: ${deleteResult.deletedCount} document supprimé`);
    
    // Supprimer la collection de test
    await db.dropCollection('test');
    
    console.log('Vérification de MongoDB terminée avec succès');
    return true;
  } catch (error) {
    console.error(`Erreur lors de la vérification de MongoDB: ${error.message}`);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('Impossible de se connecter au serveur MongoDB. Vérifiez que le service est en cours d\'exécution.');
    } else if (error.name === 'MongoNetworkError') {
      console.error('Erreur réseau lors de la connexion à MongoDB. Vérifiez la connectivité réseau.');
    }
    
    console.error(error.stack);
    return false;
  } finally {
    if (client) {
      await client.close();
      console.log('Connexion à MongoDB fermée');
    }
  }
};

// Exécuter la vérification
checkMongoDB()
  .then(success => {
    if (success) {
      console.log('MongoDB est correctement installé et configuré');
      process.exit(0);
    } else {
      console.error('Des problèmes ont été détectés avec l\'installation de MongoDB');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Erreur inattendue:', error);
    process.exit(1);
  });
```

### Exemple 3 : Module de journalisation pour le débogage

```javascript
// market/backend/utils/logger.js
const fs = require('fs');
const path = require('path');

// Créer le répertoire de logs s'il n'existe pas
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Fichier de log
const logFile = path.join(logsDir, 'server.log');

// Niveaux de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Niveau de log actuel (basé sur l'environnement)
const currentLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Fonction pour écrire dans le fichier de log
const writeToFile = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  
  fs.appendFile(logFile, logMessage, (err) => {
    if (err) {
      console.error(`Erreur lors de l'écriture dans le fichier de log: ${err.message}`);
    }
  });
};

// Fonction pour formater les objets
const formatObject = (obj) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return `[Objet non sérialisable: ${error.message}]`;
  }
};

// Fonctions de log
const logger = {
  error: (message, ...args) => {
    if (levels[currentLevel] >= levels.error) {
      const formattedMessage = `ERROR: ${message} ${args.map(arg => typeof arg === 'object' ? formatObject(arg) : arg).join(' ')}`;
      console.error(formattedMessage);
      writeToFile(formattedMessage);
    }
  },
  
  warn: (message, ...args) => {
    if (levels[currentLevel] >= levels.warn) {
      const formattedMessage = `WARN: ${message} ${args.map(arg => typeof arg === 'object' ? formatObject(arg) : arg).join(' ')}`;
      console.warn(formattedMessage);
      writeToFile(formattedMessage);
    }
  },
  
  info: (message, ...args) => {
    if (levels[currentLevel] >= levels.info) {
      const formattedMessage = `INFO: ${message} ${args.map(arg => typeof arg === 'object' ? formatObject(arg) : arg).join(' ')}`;
      console.info(formattedMessage);
      writeToFile(formattedMessage);
    }
  },
  
  debug: (message, ...args) => {
    if (levels[currentLevel] >= levels.debug) {
      const formattedMessage = `DEBUG: ${message} ${args.map(arg => typeof arg === 'object' ? formatObject(arg) : arg).join(' ')}`;
      console.debug(formattedMessage);
      writeToFile(formattedMessage);
    }
  }
};

module.exports = logger;
```

### Exemple 4 : Mise à jour du fichier server.js pour une meilleure gestion des erreurs

```javascript
// market/backend/server.js (extrait)
const express = require('express');
const connectDB = require('./config/db');
const logger = require('./utils/logger'); // Assurez-vous que ce module existe ou créez-le

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Connexion à MongoDB
connectDB()
  .then(() => {
    logger.info('Connexion à MongoDB établie');
    
    // Routes
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/apps', require('./routes/apps.routes'));
    app.use('/api/categories', require('./routes/categories.routes'));
    app.use('/api/users', require('./routes/users.routes'));
    
    // Middleware pour gérer les erreurs
    app.use((err, req, res, next) => {
      logger.error(`Erreur: ${err.message}`, err);
      
      // Envoyer une réponse d'erreur appropriée
      res.status(err.status || 500).json({
        message: process.env.NODE_ENV === 'production' 
          ? 'Erreur serveur' 
          : err.message
      });
    });
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      logger.info(`Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch(err => {
    logger.error(`Erreur lors de la connexion à MongoDB: ${err.message}`, err);
    process.exit(1);
  });
```

## Livrables attendus

1. **Fichier `db.js` corrigé** : Configuration de connexion à MongoDB corrigée
2. **Module de journalisation** : Module pour faciliter le débogage
3. **Script de vérification** : Script pour vérifier l'installation de MongoDB
4. **Documentation** : Documentation sur les problèmes rencontrés et les solutions apportées

## Ressources utiles

- [Documentation de MongoDB](https://docs.mongodb.com/)
- [Documentation de Mongoose](https://mongoosejs.com/docs/guide.html)
- [Guide de débogage Node.js](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [Bonnes pratiques pour la gestion des erreurs en Node.js](https://www.joyent.com/node-js/production/design/errors)

## Contraintes

- Les modifications doivent être compatibles avec la version de MongoDB installée sur le serveur
- Les modifications ne doivent pas compromettre la sécurité de l'application
- Les logs doivent être suffisamment détaillés pour faciliter le débogage, mais ne doivent pas contenir d'informations sensibles
- Le code doit être bien commenté et suivre les bonnes pratiques

## Prochaines étapes

Une fois les problèmes de connexion à MongoDB résolus, nous pourrons passer à l'étape 7 complète : Tests et optimisation de l'application.
