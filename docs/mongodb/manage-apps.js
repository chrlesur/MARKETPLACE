#!/usr/bin/env node

/**
 * Script pour gérer les applications dans la base de données
 * 
 * Ce script permet de lister, supprimer, activer/désactiver et mettre en avant
 * des applications dans la marketplace.
 * 
 * Usage: node manage-apps.js <command> [options]
 * 
 * Commands:
 *   list                  Lister les applications
 *   remove                Supprimer une application
 *   toggle-status         Activer/désactiver une application
 *   toggle-featured       Mettre en avant une application
 * 
 * Options pour list:
 *   --category <slug>     Filtrer par catégorie
 *   --active <true|false> Filtrer par statut actif
 *   --featured <true|false> Filtrer par mise en avant
 *   --format <json|table> Format de sortie (défaut: table)
 * 
 * Options pour remove, toggle-status, toggle-featured:
 *   --id <id>             ID de l'application
 *   --slug <slug>         Slug de l'application (alternative à --id)
 * 
 * Options pour toggle-status:
 *   --active <true|false> Statut actif (requis)
 * 
 * Options pour toggle-featured:
 *   --featured <true|false> Mise en avant (requis)
 * 
 * Options globales:
 *   --mongodb-uri <uri>   URI de connexion MongoDB (défaut: mongodb://localhost:27017/marketplace)
 *   --help                Afficher l'aide
 * 
 * Exemples:
 *   node manage-apps.js list
 *   node manage-apps.js list --category outils --active true
 *   node manage-apps.js remove --id 5f8a3b2c1d9e8f7a6b5c4d3e
 *   node manage-apps.js toggle-status --slug notepad --active false
 *   node manage-apps.js toggle-featured --id 5f8a3b2c1d9e8f7a6b5c4d3e --featured true
 */

const { MongoClient, ObjectId } = require('mongodb');

// Fonction pour analyser les arguments de la ligne de commande
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    command: null,
    id: null,
    slug: null,
    category: null,
    active: null,
    featured: null,
    format: 'table',
    mongodbUri: 'mongodb://127.0.0.1:27017/marketplace'
  };

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    process.exit(0);
  }

  options.command = args[0];

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--id' && i + 1 < args.length) {
      options.id = args[++i];
    } else if (arg === '--slug' && i + 1 < args.length) {
      options.slug = args[++i];
    } else if (arg === '--category' && i + 1 < args.length) {
      options.category = args[++i];
    } else if (arg === '--active' && i + 1 < args.length) {
      options.active = args[++i] === 'true';
    } else if (arg === '--featured' && i + 1 < args.length) {
      options.featured = args[++i] === 'true';
    } else if (arg === '--format' && i + 1 < args.length) {
      options.format = args[++i];
    } else if (arg === '--mongodb-uri' && i + 1 < args.length) {
      options.mongodbUri = args[++i];
    }
  }

  return options;
}

// Fonction pour afficher l'aide
function showHelp() {
  console.log(`
Usage: node manage-apps.js <command> [options]

Commands:
  list                  Lister les applications
  remove                Supprimer une application
  toggle-status         Activer/désactiver une application
  toggle-featured       Mettre en avant une application

Options pour list:
  --category <slug>     Filtrer par catégorie
  --active <true|false> Filtrer par statut actif
  --featured <true|false> Filtrer par mise en avant
  --format <json|table> Format de sortie (défaut: table)

Options pour remove, toggle-status, toggle-featured:
  --id <id>             ID de l'application
  --slug <slug>         Slug de l'application (alternative à --id)

Options pour toggle-status:
  --active <true|false> Statut actif (requis)

Options pour toggle-featured:
  --featured <true|false> Mise en avant (requis)

Options globales:
  --mongodb-uri <uri>   URI de connexion MongoDB (défaut: mongodb://localhost:27017/marketplace)
  --help                Afficher l'aide

Exemples:
  node manage-apps.js list
  node manage-apps.js list --category outils --active true
  node manage-apps.js remove --id 5f8a3b2c1d9e8f7a6b5c4d3e
  node manage-apps.js toggle-status --slug notepad --active false
  node manage-apps.js toggle-featured --id 5f8a3b2c1d9e8f7a6b5c4d3e --featured true
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

// Fonction pour formater une table
function formatTable(data, columns) {
  if (data.length === 0) {
    return 'Aucune donnée à afficher';
  }
  
  // Déterminer la largeur de chaque colonne
  const columnWidths = {};
  
  for (const column of columns) {
    columnWidths[column.key] = column.name.length;
    
    for (const row of data) {
      const value = String(row[column.key] || '');
      columnWidths[column.key] = Math.max(columnWidths[column.key], value.length);
    }
  }
  
  // Créer la ligne d'en-tête
  let header = '';
  let separator = '';
  
  for (const column of columns) {
    header += column.name.padEnd(columnWidths[column.key] + 2);
    separator += '-'.repeat(columnWidths[column.key]) + '  ';
  }
  
  // Créer les lignes de données
  const rows = data.map(row => {
    let line = '';
    
    for (const column of columns) {
      const value = String(row[column.key] || '');
      line += value.padEnd(columnWidths[column.key] + 2);
    }
    
    return line;
  });
  
  // Assembler la table
  return [header, separator, ...rows].join('\n');
}

// Fonction pour lister les applications
async function listApps(options) {
  log('Récupération de la liste des applications');
  
  // Connexion à MongoDB
  log(`Connexion à MongoDB: ${options.mongodbUri}`);
  const client = new MongoClient(options.mongodbUri, { useUnifiedTopology: true });
  
  try {
    await client.connect();
    log('Connexion à MongoDB établie avec succès', 'success');
    
    const db = client.db();
    
    // Construire le filtre
    const filter = {};
    
    if (options.category) {
      // Récupérer l'ID de la catégorie à partir du slug
      const category = await db.collection('categories').findOne({ slug: options.category });
      
      if (!category) {
        throw new Error(`La catégorie ${options.category} n'existe pas`);
      }
      
      filter.category = category._id;
    }
    
    if (options.active !== null) {
      filter.isActive = options.active;
    }
    
    if (options.featured !== null) {
      filter.isFeatured = options.featured;
    }
    
    // Récupérer les applications
    const apps = await db.collection('apps').find(filter).toArray();
    
    // Récupérer les catégories pour afficher les noms
    const categories = await db.collection('categories').find().toArray();
    const categoriesMap = {};
    
    for (const category of categories) {
      categoriesMap[category._id] = category.name;
    }
    
    // Formater les données
    const formattedApps = apps.map(app => ({
      id: app._id,
      name: app.name,
      slug: app.slug,
      category: categoriesMap[app.category] || 'Inconnue',
      version: app.version,
      active: app.isActive ? 'Oui' : 'Non',
      featured: app.isFeatured ? 'Oui' : 'Non',
      downloads: app.downloads,
      views: app.views,
      ratings: app.ratings ? app.ratings.length : 0,
      createdAt: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Inconnue'
    }));
    
    // Afficher les résultats
    if (options.format === 'json') {
      console.log(JSON.stringify(formattedApps, null, 2));
    } else {
      const columns = [
        { key: 'name', name: 'Nom' },
        { key: 'slug', name: 'Slug' },
        { key: 'category', name: 'Catégorie' },
        { key: 'version', name: 'Version' },
        { key: 'active', name: 'Actif' },
        { key: 'featured', name: 'En avant' },
        { key: 'downloads', name: 'Téléchargements' },
        { key: 'views', name: 'Vues' },
        { key: 'ratings', name: 'Évaluations' },
        { key: 'createdAt', name: 'Créé le' }
      ];
      
      console.log(formatTable(formattedApps, columns));
    }
    
    log(`${formattedApps.length} applications trouvées`, 'success');
  } catch (error) {
    log(`Erreur: ${error.message}`, 'error');
    throw error;
  } finally {
    await client.close();
    log('Connexion à MongoDB fermée');
  }
}

// Fonction pour supprimer une application
async function removeApp(options) {
  if (!options.id && !options.slug) {
    throw new Error('L\'ID ou le slug de l\'application est requis');
  }
  
  log(`Suppression de l'application ${options.id || options.slug}`);
  
  // Connexion à MongoDB
  log(`Connexion à MongoDB: ${options.mongodbUri}`);
  const client = new MongoClient(options.mongodbUri, { useUnifiedTopology: true });
  
  try {
    await client.connect();
    log('Connexion à MongoDB établie avec succès', 'success');
    
    const db = client.db();
    
    // Construire le filtre
    const filter = {};
    
    if (options.id) {
      filter._id = new ObjectId(options.id);
    } else {
      filter.slug = options.slug;
    }
    
    // Vérifier si l'application existe
    const app = await db.collection('apps').findOne(filter);
    
    if (!app) {
      throw new Error(`L'application ${options.id || options.slug} n'existe pas`);
    }
    
    // Demander confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question(`Êtes-vous sûr de vouloir supprimer l'application "${app.name}" ? (o/N) `, async (answer) => {
      readline.close();
      
      if (answer.toLowerCase() === 'o') {
        // Supprimer l'application
        const result = await db.collection('apps').deleteOne(filter);
        
        if (result.deletedCount === 1) {
          log(`Application "${app.name}" supprimée avec succès`, 'success');
        } else {
          log(`Erreur lors de la suppression de l'application "${app.name}"`, 'error');
        }
      } else {
        log('Suppression annulée', 'warning');
      }
      
      await client.close();
      log('Connexion à MongoDB fermée');
    });
  } catch (error) {
    log(`Erreur: ${error.message}`, 'error');
    await client.close();
    log('Connexion à MongoDB fermée');
    throw error;
  }
}

// Fonction pour activer/désactiver une application
async function toggleAppStatus(options) {
  if (!options.id && !options.slug) {
    throw new Error('L\'ID ou le slug de l\'application est requis');
  }
  
  if (options.active === null) {
    throw new Error('Le statut actif est requis (--active true|false)');
  }
  
  log(`${options.active ? 'Activation' : 'Désactivation'} de l'application ${options.id || options.slug}`);
  
  // Connexion à MongoDB
  log(`Connexion à MongoDB: ${options.mongodbUri}`);
  const client = new MongoClient(options.mongodbUri, { useUnifiedTopology: true });
  
  try {
    await client.connect();
    log('Connexion à MongoDB établie avec succès', 'success');
    
    const db = client.db();
    
    // Construire le filtre
    const filter = {};
    
    if (options.id) {
      filter._id = new ObjectId(options.id);
    } else {
      filter.slug = options.slug;
    }
    
    // Vérifier si l'application existe
    const app = await db.collection('apps').findOne(filter);
    
    if (!app) {
      throw new Error(`L'application ${options.id || options.slug} n'existe pas`);
    }
    
    // Mettre à jour le statut
    const result = await db.collection('apps').updateOne(
      filter,
      { $set: { isActive: options.active } }
    );
    
    if (result.modifiedCount === 1) {
      log(`Application "${app.name}" ${options.active ? 'activée' : 'désactivée'} avec succès`, 'success');
    } else {
      log(`Aucune modification nécessaire pour l'application "${app.name}"`, 'warning');
    }
  } catch (error) {
    log(`Erreur: ${error.message}`, 'error');
    throw error;
  } finally {
    await client.close();
    log('Connexion à MongoDB fermée');
  }
}

// Fonction pour mettre en avant une application
async function toggleAppFeatured(options) {
  if (!options.id && !options.slug) {
    throw new Error('L\'ID ou le slug de l\'application est requis');
  }
  
  if (options.featured === null) {
    throw new Error('La mise en avant est requise (--featured true|false)');
  }
  
  log(`${options.featured ? 'Mise en avant' : 'Retrait de la mise en avant'} de l'application ${options.id || options.slug}`);
  
  // Connexion à MongoDB
  log(`Connexion à MongoDB: ${options.mongodbUri}`);
  const client = new MongoClient(options.mongodbUri, { useUnifiedTopology: true });
  
  try {
    await client.connect();
    log('Connexion à MongoDB établie avec succès', 'success');
    
    const db = client.db();
    
    // Construire le filtre
    const filter = {};
    
    if (options.id) {
      filter._id = new ObjectId(options.id);
    } else {
      filter.slug = options.slug;
    }
    
    // Vérifier si l'application existe
    const app = await db.collection('apps').findOne(filter);
    
    if (!app) {
      throw new Error(`L'application ${options.id || options.slug} n'existe pas`);
    }
    
    // Mettre à jour la mise en avant
    const result = await db.collection('apps').updateOne(
      filter,
      { $set: { isFeatured: options.featured } }
    );
    
    if (result.modifiedCount === 1) {
      log(`Application "${app.name}" ${options.featured ? 'mise en avant' : 'retirée de la mise en avant'} avec succès`, 'success');
    } else {
      log(`Aucune modification nécessaire pour l'application "${app.name}"`, 'warning');
    }
  } catch (error) {
    log(`Erreur: ${error.message}`, 'error');
    throw error;
  } finally {
    await client.close();
    log('Connexion à MongoDB fermée');
  }
}

// Fonction principale
async function main() {
  try {
    const options = parseArgs();
    
    switch (options.command) {
      case 'list':
        await listApps(options);
        break;
      case 'remove':
        await removeApp(options);
        break;
      case 'toggle-status':
        await toggleAppStatus(options);
        break;
      case 'toggle-featured':
        await toggleAppFeatured(options);
        break;
      default:
        log(`Commande inconnue: ${options.command}`, 'error');
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter la fonction principale
main();
