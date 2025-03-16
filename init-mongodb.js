/**
 * Script d'initialisation de la base de données MongoDB pour la Marketplace
 * 
 * Ce script crée un compte administrateur et ajoute les applications Transkryptor et NotePad
 * à la base de données MongoDB.
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// URI de connexion à MongoDB
const mongoURI = 'mongodb://localhost:27017/marketplace';

// Fonction pour initialiser la base de données
async function initDatabase() {
  let client;
  
  try {
    console.log('Connexion à MongoDB...');
    client = new MongoClient(mongoURI);
    await client.connect();
    console.log('Connexion à MongoDB établie avec succès');
    
    const db = client.db();
    
    // Créer les collections si elles n'existent pas
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const requiredCollections = ['users', 'apps', 'categories'];
    for (const collection of requiredCollections) {
      if (!collectionNames.includes(collection)) {
        console.log(`Création de la collection ${collection}...`);
        await db.createCollection(collection);
        console.log(`Collection ${collection} créée avec succès`);
      }
    }
    
    // Créer un compte administrateur
    const usersCollection = db.collection('users');
    const adminUser = await usersCollection.findOne({ email: 'admin@marketplace.com' });
    
    if (!adminUser) {
      console.log('Création du compte administrateur...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await usersCollection.insertOne({
        name: 'Administrateur',
        email: 'admin@marketplace.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Compte administrateur créé avec succès');
      console.log('Email: admin@marketplace.com');
      console.log('Mot de passe: admin123');
    } else {
      console.log('Le compte administrateur existe déjà');
    }
    
    // Créer les catégories
    const categoriesCollection = db.collection('categories');
    const categories = [
      {
        name: 'Productivité',
        slug: 'productivite',
        description: 'Applications pour améliorer votre productivité',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Outils',
        slug: 'outils',
        description: 'Outils utilitaires pour diverses tâches',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    for (const category of categories) {
      const existingCategory = await categoriesCollection.findOne({ slug: category.slug });
      
      if (!existingCategory) {
        console.log(`Création de la catégorie ${category.name}...`);
        await categoriesCollection.insertOne(category);
        console.log(`Catégorie ${category.name} créée avec succès`);
      } else {
        console.log(`La catégorie ${category.name} existe déjà`);
      }
    }
    
    // Récupérer les IDs des catégories
    const productivityCategory = await categoriesCollection.findOne({ slug: 'productivite' });
    const toolsCategory = await categoriesCollection.findOne({ slug: 'outils' });
    
    // Créer les applications
    const appsCollection = db.collection('apps');
    const apps = [
      {
        name: 'Transkryptor',
        slug: 'transkryptor',
        description: {
          short: 'Application de transcription audio et d\'analyse de contenu utilisant l\'IA',
          full: 'Transkryptor est une application web pour la transcription audio, l\'analyse de transcriptions et la génération de synthèses. Elle utilise des modèles d\'IA avancés pour fournir des transcriptions précises et des analyses détaillées.'
        },
        developer: {
          name: 'Christophe LESUR',
          website: 'https://quantum-dream.net',
          email: 'contact@quantum-dream.net'
        },
        category: productivityCategory ? productivityCategory._id : null,
        tags: ['transcription', 'audio', 'ia', 'analyse'],
        images: {
          icon: '/transkryptor/icon.png',
          banner: '/transkryptor/banner.png',
          screenshots: [
            {
              url: '/transkryptor/screenshot1.png',
              caption: 'Interface principale'
            }
          ]
        },
        pricing: {
          type: 'free',
          price: 0,
          currency: 'EUR'
        },
        url: '/transkryptor',
        version: '1.0.0',
        requirements: 'Navigateur web moderne',
        isActive: true,
        isFeatured: true,
        downloads: 0,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'NotePad',
        slug: 'notepad',
        description: {
          short: 'Application simple de prise de notes',
          full: 'NotePad est une application web légère pour la prise de notes. Elle permet de créer, modifier et organiser facilement vos notes. Parfaite pour les listes de tâches, les idées rapides ou les notes de réunion.'
        },
        developer: {
          name: 'Marketplace Team',
          website: 'https://market.quantum-dream.net',
          email: 'contact@quantum-dream.net'
        },
        category: toolsCategory ? toolsCategory._id : null,
        tags: ['notes', 'texte', 'organisation'],
        images: {
          icon: '/notepad/icon.png',
          banner: '/notepad/banner.png',
          screenshots: [
            {
              url: '/notepad/screenshot1.png',
              caption: 'Interface principale'
            }
          ]
        },
        pricing: {
          type: 'free',
          price: 0,
          currency: 'EUR'
        },
        url: '/notepad',
        version: '1.0.0',
        requirements: 'Navigateur web moderne',
        isActive: true,
        isFeatured: true,
        downloads: 0,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    for (const app of apps) {
      const existingApp = await appsCollection.findOne({ slug: app.slug });
      
      if (!existingApp) {
        console.log(`Création de l'application ${app.name}...`);
        await appsCollection.insertOne(app);
        console.log(`Application ${app.name} créée avec succès`);
      } else {
        console.log(`L'application ${app.name} existe déjà`);
      }
    }
    
    console.log('Initialisation de la base de données terminée avec succès');
    
  } catch (error) {
    console.error(`Erreur lors de l'initialisation de la base de données: ${error.message}`);
    console.error(error.stack);
  } finally {
    if (client) {
      await client.close();
      console.log('Connexion à MongoDB fermée');
    }
  }
}

// Exécuter la fonction d'initialisation
initDatabase()
  .then(() => {
    console.log('Script terminé');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erreur inattendue:', error);
    process.exit(1);
  });
