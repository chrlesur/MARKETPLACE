/**
 * Configuration de la connexion à la base de données MongoDB
 * 
 * Ce fichier gère la connexion à MongoDB en utilisant Mongoose.
 * Il est conçu pour être importé dans server.js pour établir la connexion.
 */

const mongoose = require('mongoose');

// Fonction pour se connecter à MongoDB
const connectDB = async () => {
  try {
    // Vérifier si l'URI MongoDB est défini, sinon utiliser une valeur par défaut
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace';
    
    console.log('Tentative de connexion à MongoDB...');
    
    // Options de connexion
    const options = {
      // Ajout de timeouts pour éviter les blocages
      serverSelectionTimeoutMS: 5000, // Timeout de 5 secondes pour la sélection du serveur
      socketTimeoutMS: 45000, // Timeout de 45 secondes pour les opérations
      connectTimeoutMS: 10000, // Timeout de 10 secondes pour la connexion initiale
      // Autres options utiles
      retryWrites: true, // Réessayer les opérations d'écriture en cas d'échec
      family: 4 // Forcer IPv4
    };
    
    // Connexion à MongoDB
    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`MongoDB connecté: ${conn.connection.host}`);
    
    // Vérifier que les collections existent
    const collections = await conn.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(`Collections disponibles: ${collectionNames.join(', ') || 'aucune'}`);
    
    // Créer les collections si elles n'existent pas
    const requiredCollections = ['apps', 'categories', 'users'];
    for (const collection of requiredCollections) {
      if (!collectionNames.includes(collection)) {
        console.log(`Collection ${collection} non trouvée, création en cours...`);
        await conn.connection.db.createCollection(collection);
        console.log(`Collection ${collection} créée avec succès`);
      }
    }
    
    // Gestion des erreurs après la connexion initiale
    mongoose.connection.on('error', (err) => {
      console.error(`Erreur MongoDB: ${err.message}`);
    });
    
    // Gestion de la déconnexion
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB déconnecté');
    });
    
    // Gestion de la reconnexion
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnecté');
    });
    
    // Gestion de la fermeture propre de la connexion lors de l'arrêt de l'application
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Connexion MongoDB fermée suite à l\'arrêt de l\'application');
      process.exit(0);
    });
    
    return conn;
  } catch (err) {
    console.error(`Erreur de connexion à MongoDB: ${err.message}`);
    
    // Fournir des informations plus détaillées sur l'erreur
    if (err.name === 'MongoServerSelectionError') {
      console.error('Impossible de se connecter au serveur MongoDB. Vérifiez que le service est en cours d\'exécution.');
    } else if (err.name === 'MongoNetworkError') {
      console.error('Erreur réseau lors de la connexion à MongoDB. Vérifiez la connectivité réseau.');
    }
    
    // En mode développement, afficher la stack trace complète
    if (process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
    
    // Sortir du processus en cas d'erreur de connexion en production
    if (process.env.NODE_ENV === 'production') {
      console.error('Arrêt du serveur en raison d\'une erreur de connexion à MongoDB');
      process.exit(1);
    }
    
    throw err;
  }
};

module.exports = connectDB;
