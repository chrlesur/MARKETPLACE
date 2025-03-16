#!/usr/bin/env node

/**
 * Script pour ajouter ou mettre à jour une application dans la base de données
 * 
 * Ce script permet d'ajouter une nouvelle application à la marketplace ou de mettre à jour
 * une application existante à partir d'un fichier JSON.
 * 
 * Usage: node add-app.js [options]
 * 
 * Options:
 *   --file <path>          Chemin vers le fichier JSON de l'application (requis)
 *   --update               Mettre à jour une application existante au lieu d'en créer une nouvelle
 *   --id <id>              ID de l'application à mettre à jour (requis si --update est spécifié)
 *   --mongodb-uri <uri>    URI de connexion MongoDB (défaut: mongodb://localhost:27017/marketplace)
 *   --help                 Afficher l'aide
 */

const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Fonction pour analyser les arguments de la ligne de commande
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    file: null,
    update: false,
    id: null,
    mongodbUri: 'mongodb://127.0.0.1:27017/marketplace'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--file' && i + 1 < args.length) {
      options.file = args[++i];
    } else if (arg === '--update') {
      options.update = true;
    } else if (arg === '--id' && i + 1 < args.length) {
      options.id = args[++i];
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
Usage: node add-app.js [options]

Options:
  --file <path>          Chemin vers le fichier JSON de l'application (requis)
  --update               Mettre à jour une application existante au lieu d'en créer une nouvelle
  --id <id>              ID de l'application à mettre à jour (requis si --update est spécifié)
  --mongodb-uri <uri>    URI de connexion MongoDB (défaut: mongodb://localhost:27017/marketplace)
  --help                 Afficher l'aide
  `);
}

// Fonction pour journaliser les actions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const coloredMessage = getColoredMessage(message, type);
  
  console.log(`[${timestamp}] ${coloredMessage}`);
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

// Fonction pour valider les données de l'application
function validateAppData(appData) {
  // Vérifier les champs requis
  const requiredFields = [
    'name',
    'slug',
    'description.short',
    'description.full',
    'developer.name',
    'category',
    'images.icon',
    'pricing.type',
    'url'
  ];
  
  for (const field of requiredFields) {
    const value = getNestedProperty(appData, field);
    
    if (value === undefined || value === null || value === '') {
      throw new Error(`Le champ ${field} est requis`);
    }
  }
  
  // Vérifier les types de données
  if (typeof appData.name !== 'string') {
    throw new Error('Le nom doit être une chaîne de caractères');
  }
  
  if (typeof appData.slug !== 'string') {
    throw new Error('Le slug doit être une chaîne de caractères');
  }
  
  if (typeof appData.description !== 'object') {
    throw new Error('La description doit être un objet');
  }
  
  if (typeof appData.developer !== 'object') {
    throw new Error('Le développeur doit être un objet');
  }
  
  if (!Array.isArray(appData.tags)) {
    throw new Error('Les tags doivent être un tableau');
  }
  
  if (typeof appData.images !== 'object') {
    throw new Error('Les images doivent être un objet');
  }
  
  if (typeof appData.pricing !== 'object') {
    throw new Error('La tarification doit être un objet');
  }
  
  if (!['free', 'paid', 'subscription'].includes(appData.pricing.type)) {
    throw new Error('Le type de tarification doit être "free", "paid" ou "subscription"');
  }
  
  // Vérifier le format du slug
  if (!/^[a-z0-9-]+$/.test(appData.slug)) {
    throw new Error('Le slug doit contenir uniquement des lettres minuscules, des chiffres et des tirets');
  }
  
  return true;
}

// Fonction pour obtenir une propriété imbriquée
function getNestedProperty(obj, path) {
  return path.split('.').reduce((prev, curr) => {
    return prev && prev[curr];
  }, obj);
}

// Fonction pour ajouter une application
async function addApp(options) {
  log('Démarrage de l\'ajout d\'une application');
  
  // Vérifier si le fichier existe
  if (!options.file) {
    throw new Error('Le chemin du fichier JSON est requis');
  }
  
  if (!fs.existsSync(options.file)) {
    throw new Error(`Le fichier ${options.file} n'existe pas`);
  }
  
  // Lire le fichier JSON
  log(`Lecture du fichier ${options.file}`);
  const appDataRaw = fs.readFileSync(options.file, 'utf8');
  let appData;
  
  try {
    appData = JSON.parse(appDataRaw);
  } catch (error) {
    throw new Error(`Erreur lors de l'analyse du fichier JSON: ${error.message}`);
  }
  
  // Valider les données de l'application
  log('Validation des données de l\'application');
  validateAppData(appData);
  
  // Connexion à MongoDB
  log(`Connexion à MongoDB: ${options.mongodbUri}`);
  const client = new MongoClient(options.mongodbUri, { useUnifiedTopology: true });
  
  try {
    await client.connect();
    log('Connexion à MongoDB établie avec succès', 'success');
    
    const db = client.db();
    
    // Vérifier si la catégorie existe
    if (typeof appData.category === 'string' && !ObjectId.isValid(appData.category)) {
      // Si la catégorie est spécifiée par son slug
      const category = await db.collection('categories').findOne({ slug: appData.category });
      
      if (!category) {
        throw new Error(`La catégorie ${appData.category} n'existe pas`);
      }
      
      appData.category = category._id;
    } else if (typeof appData.category === 'string' && ObjectId.isValid(appData.category)) {
      // Si la catégorie est spécifiée par son ID
      const category = await db.collection('categories').findOne({ _id: new ObjectId(appData.category) });
      
      if (!category) {
        throw new Error(`La catégorie avec l'ID ${appData.category} n'existe pas`);
      }
      
      appData.category = new ObjectId(appData.category);
    }
    
    if (options.update) {
      // Mettre à jour une application existante
      if (!options.id) {
        throw new Error('L\'ID de l\'application est requis pour la mise à jour');
      }
      
      // Vérifier si l'application existe
      const appExists = await db.collection('apps').findOne({ _id: new ObjectId(options.id) });
      
      if (!appExists) {
        throw new Error(`L'application avec l'ID ${options.id} n'existe pas`);
      }
      
      log(`Mise à jour de l'application ${appData.name} (ID: ${options.id})`);
      
      // Mettre à jour l'application
      const result = await db.collection('apps').updateOne(
        { _id: new ObjectId(options.id) },
        { 
          $set: {
            ...appData,
            updatedAt: new Date()
          }
        }
      );
      
      log(`Application ${appData.name} mise à jour avec succès`, 'success');
    } else {
      // Ajouter une nouvelle application
      
      // Vérifier si le slug est déjà utilisé
      const slugExists = await db.collection('apps').findOne({ slug: appData.slug });
      
      if (slugExists) {
        throw new Error(`Le slug ${appData.slug} est déjà utilisé par une autre application`);
      }
      
      log(`Ajout de l'application ${appData.name}`);
      
      // Ajouter des champs par défaut
      appData.ratings = appData.ratings || [];
      appData.downloads = appData.downloads || 0;
      appData.views = appData.views || 0;
      appData.createdAt = new Date();
      appData.updatedAt = new Date();
      
      // Ajouter l'application
      const result = await db.collection('apps').insertOne(appData);
      
      log(`Application ${appData.name} ajoutée avec succès (ID: ${result.insertedId})`, 'success');
    }
  } catch (error) {
    log(`Erreur: ${error.message}`, 'error');
    throw error;
  } finally {
    await client.close();
    log('Connexion à MongoDB fermée');
  }
}

// Exécuter la fonction principale
const options = parseArgs();

addApp(options)
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Erreur:', error.message);
    process.exit(1);
  });
