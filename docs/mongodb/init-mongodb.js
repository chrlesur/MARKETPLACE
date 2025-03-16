#!/usr/bin/env node

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
 *   --add-missing             Ajouter uniquement les données manquantes
 *   --mongodb-uri <uri>       URI de connexion MongoDB (défaut: mongodb://localhost:27017/marketplace)
 *   --help                    Afficher l'aide
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Fonction pour analyser les arguments de la ligne de commande
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    adminEmail: 'admin@marketplace.com',
    adminPassword: 'admin123',
    force: false,
    addMissing: false,
    mongodbUri: 'mongodb://127.0.0.1:27017/marketplace'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--admin-email' && i + 1 < args.length) {
      options.adminEmail = args[++i];
    } else if (arg === '--admin-password' && i + 1 < args.length) {
      options.adminPassword = args[++i];
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--add-missing') {
      options.addMissing = true;
    } else if (arg === '--mongodb-uri' && i + 1 < args.length) {
      options.mongodbUri = args[++i];
    } else if (arg === '--help') {
      showHelp();
      process.exit(0);
    }
  }

  return options;
}

// Fonction pour afficher l'aide
function showHelp() {
  console.log(`
Usage: node init-mongodb.js [options]

Options:
  --admin-email <email>     Email de l'administrateur (défaut: admin@marketplace.com)
  --admin-password <pwd>    Mot de passe de l'administrateur (défaut: admin123)
  --force                   Forcer la réinitialisation même si déjà initialisée
  --add-missing             Ajouter uniquement les données manquantes
  --mongodb-uri <uri>       URI de connexion MongoDB (défaut: mongodb://localhost:27017/marketplace)
  --help                    Afficher l'aide
  `);
}

// Fonction pour journaliser les actions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const coloredMessage = getColoredMessage(message, type);
  
  console.log(`[${timestamp}] ${coloredMessage}`);
  
  // Écrire également dans un fichier de log
  fs.appendFileSync('mongodb-init.log', `[${timestamp}] [${type.toUpperCase()}] ${message}\n`);
}

// Fonction pour colorer les messages
function getColoredMessage(message, type) {
  const colors = {
    info: '\x1b[36m%s\x1b[0m',    // Cyan
    success: '\x1b[32m%s\x1b[0m',  // Vert
    warning: '\x1b[33m%s\x1b[0m',  // Jaune
    error: '\x1b[31m%s\x1b[0m'     // Rouge
  };
  
  if (colors[type]) {
    return colors[type].replace('%s', message);
  }
  
  return message;
}

// Fonction pour hacher un mot de passe
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Fonction principale d'initialisation
async function initMongoDB(options) {
  log('Démarrage de l\'initialisation de MongoDB');
  
  // Connexion à MongoDB
  log(`Connexion à MongoDB: ${options.mongodbUri}`);
  const client = new MongoClient(options.mongodbUri, { useUnifiedTopology: true });
  
  try {
    await client.connect();
    log('Connexion à MongoDB établie avec succès', 'success');
    
    const db = client.db();
    
    // Vérifier si l'initialisation a déjà été effectuée
    const usersCount = await db.collection('users').countDocuments();
    
    if (usersCount > 0 && !options.force && !options.addMissing) {
      log(`La base de données est déjà initialisée (${usersCount} utilisateurs trouvés)`, 'warning');
      log('Utilisez l\'option --force pour réinitialiser ou --add-missing pour ajouter les données manquantes', 'warning');
      return;
    }
    
    // Réinitialiser la base de données si demandé
    if (options.force) {
      log('Réinitialisation de la base de données...', 'warning');
      await db.collection('users').drop().catch(() => {});
      await db.collection('categories').drop().catch(() => {});
      await db.collection('apps').drop().catch(() => {});
      log('Collections supprimées avec succès', 'success');
    }
    
    // Créer les collections si elles n'existent pas
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('users')) {
      log('Création de la collection users');
      await db.createCollection('users');
    }
    
    if (!collectionNames.includes('categories')) {
      log('Création de la collection categories');
      await db.createCollection('categories');
    }
    
    if (!collectionNames.includes('apps')) {
      log('Création de la collection apps');
      await db.createCollection('apps');
    }
    
    // Ajouter un compte administrateur
    const adminExists = await db.collection('users').findOne({ email: options.adminEmail });
    
    if (!adminExists || options.force) {
      log(`Création du compte administrateur: ${options.adminEmail}`);
      
      const hashedPassword = await hashPassword(options.adminPassword);
      
      const admin = {
        name: 'Administrateur',
        email: options.adminEmail,
        password: hashedPassword,
        role: 'admin',
        avatar: 'default-avatar.png',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
        isActive: true
      };
      
      if (adminExists && options.force) {
        await db.collection('users').deleteOne({ email: options.adminEmail });
      }
      
      await db.collection('users').insertOne(admin);
      log('Compte administrateur créé avec succès', 'success');
    } else {
      log(`Le compte administrateur ${options.adminEmail} existe déjà`, 'info');
    }
    
    // Ajouter des catégories de base
    const categories = [
      {
        name: 'Productivité',
        slug: 'productivite',
        description: 'Applications pour améliorer votre productivité et votre organisation',
        icon: 'productivity-icon.png',
        color: '#4f46e5',
        isActive: true,
        order: 1,
        parent: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Outils',
        slug: 'outils',
        description: 'Outils utilitaires pour diverses tâches',
        icon: 'tools-icon.png',
        color: '#0ea5e9',
        isActive: true,
        order: 2,
        parent: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    for (const category of categories) {
      const categoryExists = await db.collection('categories').findOne({ slug: category.slug });
      
      if (!categoryExists || options.force) {
        log(`Création de la catégorie: ${category.name}`);
        
        if (categoryExists && options.force) {
          await db.collection('categories').deleteOne({ slug: category.slug });
        }
        
        await db.collection('categories').insertOne(category);
        log(`Catégorie ${category.name} créée avec succès`, 'success');
      } else {
        log(`La catégorie ${category.name} existe déjà`, 'info');
      }
    }
    
    // Récupérer l'ID de la catégorie Outils
    const outilsCategory = await db.collection('categories').findOne({ slug: 'outils' });
    
    if (!outilsCategory) {
      throw new Error('La catégorie Outils n\'a pas été trouvée');
    }
    
    // Ajouter l'application NotePad comme application de démonstration
    const notepadExists = await db.collection('apps').findOne({ slug: 'notepad' });
    
    if (!notepadExists || options.force) {
      log('Création de l\'application NotePad');
      
      const notepad = {
        name: 'NotePad',
        slug: 'notepad',
        description: {
          short: 'Éditeur de notes simple et efficace',
          full: 'NotePad est un éditeur de notes simple et efficace qui vous permet de créer, modifier et organiser vos notes facilement. Il offre une interface intuitive et des fonctionnalités de mise en forme pour améliorer votre productivité.'
        },
        developer: {
          name: 'Marketplace Team',
          website: 'https://marketplace.example.com',
          email: 'contact@marketplace.example.com'
        },
        category: outilsCategory._id,
        tags: ['notes', 'éditeur', 'texte', 'productivité'],
        images: {
          icon: '/apps/notepad/icon.png',
          banner: '/apps/notepad/banner.png',
          screenshots: [
            {
              url: '/apps/notepad/screenshot1.png',
              caption: 'Interface principale'
            },
            {
              url: '/apps/notepad/screenshot2.png',
              caption: 'Édition de note'
            }
          ]
        },
        pricing: {
          type: 'free',
          price: 0,
          currency: 'EUR',
          trialDays: 0
        },
        url: '/notepad',
        apiEndpoint: '',
        version: '1.0.0',
        requirements: 'Navigateur web moderne',
        isActive: true,
        isFeatured: true,
        ratings: [],
        downloads: 0,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      if (notepadExists && options.force) {
        await db.collection('apps').deleteOne({ slug: 'notepad' });
      }
      
      await db.collection('apps').insertOne(notepad);
      log('Application NotePad créée avec succès', 'success');
    } else {
      log('L\'application NotePad existe déjà', 'info');
    }
    
    log('Initialisation de MongoDB terminée avec succès', 'success');
  } catch (error) {
    log(`Erreur lors de l'initialisation: ${error.message}`, 'error');
    throw error;
  } finally {
    await client.close();
    log('Connexion à MongoDB fermée');
  }
}

// Exécuter la fonction principale
const options = parseArgs();

initMongoDB(options)
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Erreur lors de l\'initialisation:', error);
    process.exit(1);
  });
