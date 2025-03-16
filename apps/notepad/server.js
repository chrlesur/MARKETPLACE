/**
 * Serveur pour l'application NotePad
 * Ce serveur sert les fichiers statiques de l'application
 * 
 * @author Marketplace Team
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Créer l'application Express
const app = express();

// Configurer CORS
app.use(cors());

// Middleware de logging pour déboguer les requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Configurer le middleware pour parser le JSON
app.use(express.json());

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Route pour servir index.html
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    return res.status(404).send('Fichier index.html non trouvé');
  }
  
  res.sendFile(indexPath);
});

// Route pour vérifier l'état du serveur
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Le serveur NotePad fonctionne correctement',
    timestamp: new Date().toISOString()
  });
});

// Gérer les routes inconnues
app.use((req, res) => {
  // Pour les requêtes API, renvoyer une erreur JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'Route non trouvée',
      path: req.path
    });
  }
  
  // Pour les autres requêtes, renvoyer index.html (pour le routage côté client)
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gérer les erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  
  // Pour les requêtes API, renvoyer une erreur JSON
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({
      error: 'Erreur serveur',
      message: err.message
    });
  }
  
  // Pour les autres requêtes, renvoyer une page d'erreur HTML
  res.status(500).send(`
    <html>
      <head>
        <title>Erreur serveur</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .error-container {
            max-width: 600px;
            margin: 50px auto;
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
          }
          h1 {
            color: #dc3545;
          }
          .back-link {
            display: inline-block;
            margin-top: 20px;
            color: #007bff;
            text-decoration: none;
          }
          .back-link:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>Erreur serveur</h1>
          <p>Une erreur est survenue lors du traitement de votre requête.</p>
          <p>Message d'erreur: ${err.message}</p>
          <a href="/" class="back-link">Retour à l'accueil</a>
        </div>
      </body>
    </html>
  `);
});

// Définir le port
const PORT = process.env.PORT || 3003;

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur NotePad démarré sur le port ${PORT}`);
});
