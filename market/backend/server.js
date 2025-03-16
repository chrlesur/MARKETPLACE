/**
 * Serveur principal pour l'API de la Marketplace Web
 * 
 * Ce fichier configure et démarre le serveur Express qui gère toutes les routes API
 * pour la marketplace, y compris l'authentification, la gestion des applications, etc.
 */

// Importation des dépendances
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');

// Importation de la fonction de connexion à MongoDB
const connectDB = require('./config/db');

// Chargement des variables d'environnement
dotenv.config();

// Création de l'application Express
const app = express();

// Configuration du port
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Permet les requêtes cross-origin
app.use(helmet()); // Sécurité HTTP
app.use(compression()); // Compression des réponses
app.use(morgan('dev')); // Logging des requêtes
app.use(express.json()); // Parsing du JSON
app.use(express.urlencoded({ extended: true })); // Parsing des URL encodées

// Connexion à MongoDB
connectDB()
  .then(() => {
    console.log('Connexion à MongoDB établie avec succès');
    
    // Routes API (chargées après la connexion à MongoDB)
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/apps', require('./routes/apps.routes'));
    app.use('/api/categories', require('./routes/categories.routes'));
    app.use('/api/users', require('./routes/users.routes'));

    // Route de test pour vérifier que l'API fonctionne
    app.get('/api/test', (req, res) => {
      res.json({ message: 'API Marketplace Web fonctionne correctement!' });
    });

    // Route pour les clés API (utilisée par Transkryptor)
    app.post('/test-keys', (req, res) => {
      const { openaiKey, anthropicKey } = req.body;
      
      // Simulation de validation des clés API
      const isOpenAIValid = openaiKey && openaiKey.startsWith('sk-');
      const isAnthropicValid = anthropicKey && anthropicKey.startsWith('sk-');
      
      res.json({
        openai: {
          valid: isOpenAIValid,
          message: isOpenAIValid ? 'Clé OpenAI valide' : 'Clé OpenAI invalide'
        },
        anthropic: {
          valid: isAnthropicValid,
          message: isAnthropicValid ? 'Clé Anthropic valide' : 'Clé Anthropic invalide'
        }
      });
    });

    // Gestion des erreurs 404
    app.use((req, res, next) => {
      res.status(404).json({ message: 'Route non trouvée' });
    });

    // Gestion des erreurs globales
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ 
        message: 'Erreur serveur',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log(`API accessible à l'adresse: http://localhost:${PORT}/api`);
    });
  })
  .catch(err => {
    console.error(`Erreur lors de la connexion à MongoDB: ${err.message}`);
    process.exit(1);
  });

// Gestion de l'arrêt propre du serveur
process.on('SIGINT', () => {
  console.log('Arrêt du serveur...');
  process.exit(0);
});

module.exports = app;
