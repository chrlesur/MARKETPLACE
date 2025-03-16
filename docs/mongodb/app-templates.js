#!/usr/bin/env node

/**
 * Script pour générer des templates d'applications
 * 
 * Ce script permet de générer des fichiers JSON à partir de modèles prédéfinis
 * ou d'extraire des informations du dossier d'une application.
 * 
 * Usage: node app-templates.js <command> [options]
 * 
 * Commands:
 *   generate    Générer un template
 *   extract     Extraire des informations d'une application
 * 
 * Options pour generate:
 *   --template <name>    Nom du template à utiliser (basic, spa, api)
 *   --name <name>        Nom de l'application
 *   --output <path>      Chemin de sortie du fichier JSON (défaut: ./app-config.json)
 * 
 * Options pour extract:
 *   --dir <path>         Dossier de l'application
 *   --output <path>      Chemin de sortie du fichier JSON (défaut: ./app-config.json)
 * 
 * Exemples:
 *   node app-templates.js generate --template basic --name "Mon App" --output mon-app.json
 *   node app-templates.js extract --dir ../apps/notepad --output notepad.json
 */

const fs = require('fs');
const path = require('path');

// Modèles prédéfinis
const templates = {
  // Template pour une application basique
  basic: {
    name: '',
    slug: '',
    description: {
      short: '',
      full: ''
    },
    developer: {
      name: 'Marketplace Team',
      website: 'https://marketplace.example.com',
      email: 'contact@marketplace.example.com'
    },
    category: 'outils',
    tags: ['outil', 'utilitaire'],
    images: {
      icon: '',
      banner: '',
      screenshots: []
    },
    pricing: {
      type: 'free',
      price: 0,
      currency: 'EUR',
      trialDays: 0
    },
    url: '',
    apiEndpoint: '',
    version: '1.0.0',
    requirements: 'Navigateur web moderne',
    isActive: true,
    isFeatured: false
  },
  
  // Template pour une Single Page Application
  spa: {
    name: '',
    slug: '',
    description: {
      short: '',
      full: ''
    },
    developer: {
      name: 'Marketplace Team',
      website: 'https://marketplace.example.com',
      email: 'contact@marketplace.example.com'
    },
    category: 'productivite',
    tags: ['spa', 'application', 'react'],
    images: {
      icon: '',
      banner: '',
      screenshots: []
    },
    pricing: {
      type: 'free',
      price: 0,
      currency: 'EUR',
      trialDays: 0
    },
    url: '',
    apiEndpoint: '',
    version: '1.0.0',
    requirements: 'Navigateur web moderne compatible avec ES6',
    isActive: true,
    isFeatured: false
  },
  
  // Template pour une application avec API
  api: {
    name: '',
    slug: '',
    description: {
      short: '',
      full: ''
    },
    developer: {
      name: 'Marketplace Team',
      website: 'https://marketplace.example.com',
      email: 'contact@marketplace.example.com'
    },
    category: 'outils',
    tags: ['api', 'service', 'backend'],
    images: {
      icon: '',
      banner: '',
      screenshots: []
    },
    pricing: {
      type: 'subscription',
      price: 9.99,
      currency: 'EUR',
      trialDays: 14
    },
    url: '',
    apiEndpoint: '',
    version: '1.0.0',
    requirements: 'Navigateur web moderne, compte utilisateur',
    isActive: true,
    isFeatured: false
  }
};

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

// Fonction pour générer un slug à partir d'un nom
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Fonction pour générer un template
function generateTemplate(templateName, appName, outputPath) {
  log(`Génération du template ${templateName} pour l'application "${appName}"`);
  
  // Vérifier si le template existe
  if (!templates[templateName]) {
    throw new Error(`Le template ${templateName} n'existe pas`);
  }
  
  // Créer une copie du template
  const appData = JSON.parse(JSON.stringify(templates[templateName]));
  
  // Remplir les informations de base
  appData.name = appName;
  appData.slug = generateSlug(appName);
  appData.description.short = `${appName} - Application générée à partir du template ${templateName}`;
  appData.description.full = `${appName} est une application générée à partir du template ${templateName}. Remplacez cette description par une description complète de votre application.`;
  appData.url = `/${appData.slug}`;
  appData.images.icon = `/apps/${appData.slug}/icon.png`;
  appData.images.banner = `/apps/${appData.slug}/banner.png`;
  
  // Ajouter des captures d'écran par défaut
  appData.images.screenshots = [
    {
      url: `/apps/${appData.slug}/screenshot1.png`,
      caption: 'Capture d\'écran 1'
    },
    {
      url: `/apps/${appData.slug}/screenshot2.png`,
      caption: 'Capture d\'écran 2'
    }
  ];
  
  // Écrire le fichier JSON
  const jsonData = JSON.stringify(appData, null, 2);
  fs.writeFileSync(outputPath, jsonData);
  
  log(`Template généré avec succès: ${outputPath}`, 'success');
  
  return appData;
}

// Fonction pour extraire des informations du dossier d'une application
function extractAppInfo(appDir, outputPath) {
  log(`Extraction des informations de l'application depuis ${appDir}`);
  
  // Vérifier si le dossier existe
  if (!fs.existsSync(appDir)) {
    throw new Error(`Le dossier ${appDir} n'existe pas`);
  }
  
  // Extraire le nom de l'application à partir du nom du dossier
  const appName = path.basename(appDir);
  const appSlug = generateSlug(appName);
  
  // Créer un objet pour stocker les informations de l'application
  const appData = {
    name: appName,
    slug: appSlug,
    description: {
      short: '',
      full: ''
    },
    developer: {
      name: 'Marketplace Team',
      website: 'https://marketplace.example.com',
      email: 'contact@marketplace.example.com'
    },
    category: 'outils',
    tags: [],
    images: {
      icon: `/apps/${appSlug}/icon.png`,
      banner: `/apps/${appSlug}/banner.png`,
      screenshots: []
    },
    pricing: {
      type: 'free',
      price: 0,
      currency: 'EUR',
      trialDays: 0
    },
    url: `/${appSlug}`,
    apiEndpoint: '',
    version: '1.0.0',
    requirements: 'Navigateur web moderne',
    isActive: true,
    isFeatured: false
  };
  
  // Lire le fichier package.json s'il existe
  const packageJsonPath = path.join(appDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    log('Lecture du fichier package.json');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Extraire les informations du package.json
      if (packageJson.name) {
        appData.name = packageJson.name.charAt(0).toUpperCase() + packageJson.name.slice(1);
      }
      
      if (packageJson.description) {
        appData.description.short = packageJson.description;
      }
      
      if (packageJson.version) {
        appData.version = packageJson.version;
      }
      
      if (packageJson.author) {
        if (typeof packageJson.author === 'string') {
          appData.developer.name = packageJson.author;
        } else if (typeof packageJson.author === 'object') {
          if (packageJson.author.name) {
            appData.developer.name = packageJson.author.name;
          }
          
          if (packageJson.author.email) {
            appData.developer.email = packageJson.author.email;
          }
          
          if (packageJson.author.url) {
            appData.developer.website = packageJson.author.url;
          }
        }
      }
      
      if (packageJson.keywords && Array.isArray(packageJson.keywords)) {
        appData.tags = packageJson.keywords;
      }
    } catch (error) {
      log(`Erreur lors de la lecture du package.json: ${error.message}`, 'warning');
    }
  }
  
  // Lire le fichier README.md s'il existe
  const readmePath = path.join(appDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    log('Lecture du fichier README.md');
    
    try {
      const readme = fs.readFileSync(readmePath, 'utf8');
      
      // Extraire le titre (première ligne commençant par #)
      const titleMatch = readme.match(/^#\s+(.+)$/m);
      if (titleMatch && titleMatch[1]) {
        appData.name = titleMatch[1];
      }
      
      // Extraire la description (premier paragraphe après le titre)
      const descriptionMatch = readme.match(/^#\s+.+\n\n(.+?)(\n\n|$)/s);
      if (descriptionMatch && descriptionMatch[1]) {
        appData.description.short = descriptionMatch[1].replace(/\n/g, ' ').trim();
      }
      
      // Utiliser tout le contenu du README comme description complète
      appData.description.full = readme;
    } catch (error) {
      log(`Erreur lors de la lecture du README.md: ${error.message}`, 'warning');
    }
  }
  
  // Vérifier si le dossier public existe
  const publicDir = path.join(appDir, 'public');
  if (fs.existsSync(publicDir) && fs.statSync(publicDir).isDirectory()) {
    log('Dossier public trouvé');
    
    // Vérifier si des captures d'écran existent
    const imagesDir = path.join(publicDir, 'images');
    if (fs.existsSync(imagesDir) && fs.statSync(imagesDir).isDirectory()) {
      log('Dossier images trouvé');
      
      try {
        const files = fs.readdirSync(imagesDir);
        
        // Rechercher des captures d'écran
        const screenshotFiles = files.filter(file => 
          file.match(/\.(png|jpg|jpeg|gif)$/i) && 
          file.match(/screenshot|screen|capture/i)
        );
        
        if (screenshotFiles.length > 0) {
          log(`${screenshotFiles.length} captures d'écran trouvées`);
          
          appData.images.screenshots = screenshotFiles.map((file, index) => ({
            url: `/apps/${appSlug}/images/${file}`,
            caption: `Capture d'écran ${index + 1}`
          }));
        }
        
        // Rechercher une icône
        const iconFiles = files.filter(file => 
          file.match(/\.(png|jpg|jpeg|gif|svg)$/i) && 
          file.match(/icon|logo|favicon/i)
        );
        
        if (iconFiles.length > 0) {
          log('Icône trouvée');
          appData.images.icon = `/apps/${appSlug}/images/${iconFiles[0]}`;
        }
        
        // Rechercher une bannière
        const bannerFiles = files.filter(file => 
          file.match(/\.(png|jpg|jpeg|gif)$/i) && 
          file.match(/banner|header|cover/i)
        );
        
        if (bannerFiles.length > 0) {
          log('Bannière trouvée');
          appData.images.banner = `/apps/${appSlug}/images/${bannerFiles[0]}`;
        }
      } catch (error) {
        log(`Erreur lors de la lecture du dossier images: ${error.message}`, 'warning');
      }
    }
  }
  
  // Écrire le fichier JSON
  const jsonData = JSON.stringify(appData, null, 2);
  fs.writeFileSync(outputPath, jsonData);
  
  log(`Informations extraites avec succès: ${outputPath}`, 'success');
  
  return appData;
}

// Fonction principale
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: node app-templates.js <command> [options]

Commands:
  generate    Générer un template
  extract     Extraire des informations d'une application

Options pour generate:
  --template <name>    Nom du template à utiliser (basic, spa, api)
  --name <name>        Nom de l'application
  --output <path>      Chemin de sortie du fichier JSON (défaut: ./app-config.json)

Options pour extract:
  --dir <path>         Dossier de l'application
  --output <path>      Chemin de sortie du fichier JSON (défaut: ./app-config.json)

Exemples:
  node app-templates.js generate --template basic --name "Mon App" --output mon-app.json
  node app-templates.js extract --dir ../apps/notepad --output notepad.json
    `);
    return;
  }
  
  const command = args[0];
  
  if (command === 'generate') {
    let templateName = null;
    let appName = null;
    let outputPath = './app-config.json';
    
    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--template' && i + 1 < args.length) {
        templateName = args[++i];
      } else if (arg === '--name' && i + 1 < args.length) {
        appName = args[++i];
      } else if (arg === '--output' && i + 1 < args.length) {
        outputPath = args[++i];
      }
    }
    
    if (!templateName) {
      log('Le nom du template est requis (--template)', 'error');
      process.exit(1);
    }
    
    if (!appName) {
      log('Le nom de l\'application est requis (--name)', 'error');
      process.exit(1);
    }
    
    try {
      generateTemplate(templateName, appName, outputPath);
    } catch (error) {
      log(`Erreur: ${error.message}`, 'error');
      process.exit(1);
    }
  } else if (command === 'extract') {
    let appDir = null;
    let outputPath = './app-config.json';
    
    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--dir' && i + 1 < args.length) {
        appDir = args[++i];
      } else if (arg === '--output' && i + 1 < args.length) {
        outputPath = args[++i];
      }
    }
    
    if (!appDir) {
      log('Le dossier de l\'application est requis (--dir)', 'error');
      process.exit(1);
    }
    
    try {
      extractAppInfo(appDir, outputPath);
    } catch (error) {
      log(`Erreur: ${error.message}`, 'error');
      process.exit(1);
    }
  } else {
    log(`Commande inconnue: ${command}`, 'error');
    process.exit(1);
  }
}

// Exécuter la fonction principale
main();
