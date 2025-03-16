#!/bin/bash

# Script pour corriger l'URL de l'application Transkryptor dans la base de données
# Ce script utilise mongosh pour mettre à jour l'URL de l'application Transkryptor
# pour qu'elle pointe vers l'application web au lieu d'un fichier à télécharger.

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher un message d'information
info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

# Fonction pour afficher un message de succès
success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Fonction pour afficher un message d'erreur
error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour afficher un message d'avertissement
warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# URI de connexion MongoDB
MONGODB_URI="mongodb://127.0.0.1:27017/marketplace"

# Analyser les arguments de la ligne de commande
while [[ $# -gt 0 ]]; do
  case $1 in
    --mongodb-uri)
      MONGODB_URI="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --mongodb-uri <uri>    URI de connexion MongoDB (défaut: mongodb://127.0.0.1:27017/marketplace)"
      echo "  --help                 Afficher l'aide"
      exit 0
      ;;
    *)
      error "Option inconnue: $1"
      exit 1
      ;;
  esac
done

info "Démarrage de la correction de l'URL de l'application Transkryptor"
info "Connexion à MongoDB: $MONGODB_URI"

# Commande mongosh pour mettre à jour l'URL
MONGOSH_COMMAND="
  // Rechercher l'application Transkryptor
  const app = db.apps.findOne({ slug: 'transkryptor' });
  
  if (!app) {
    print('L\\'application Transkryptor n\\'a pas été trouvée dans la base de données');
    quit(1);
  }
  
  print('Application Transkryptor trouvée (ID: ' + app._id + ')');
  print('URL actuelle: ' + app.url);
  
  // Mettre à jour l'URL
  const newUrl = '/transkryptor/';
  
  if (app.url === newUrl) {
    print('L\\'URL est déjà correcte, aucune modification nécessaire');
    quit(0);
  }
  
  print('Mise à jour de l\\'URL: ' + app.url + ' -> ' + newUrl);
  
  // Mettre à jour l'application
  const result = db.apps.updateOne(
    { _id: app._id },
    { 
      \$set: {
        url: newUrl,
        updatedAt: new Date()
      }
    }
  );
  
  if (result.modifiedCount === 1) {
    print('URL de l\\'application Transkryptor mise à jour avec succès');
  } else {
    print('Aucune modification n\\'a été effectuée');
  }
"

# Exécuter la commande mongosh
info "Exécution de la commande mongosh"
mongosh "$MONGODB_URI" --eval "$MONGOSH_COMMAND"

# Vérifier le code de retour
if [ $? -eq 0 ]; then
  success "Opération terminée avec succès"
else
  error "Erreur lors de l'exécution de la commande mongosh"
  exit 1
fi
