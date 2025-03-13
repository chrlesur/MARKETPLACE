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
    // Vérifier si l'URI MongoDB est défini
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.log('MongoDB URI non défini. Fonctionnement en mode mémoire.');
      return;
    }

    // Options de connexion
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    // Connexion à MongoDB
    const conn = await mongoose.connect(mongoURI, options);

    console.log(`MongoDB connecté: ${conn.connection.host}`);

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

  } catch (err) {
    console.error(`Erreur de connexion à MongoDB: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
