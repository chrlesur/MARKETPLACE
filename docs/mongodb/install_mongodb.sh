#!/bin/bash

# Script d'installation de MongoDB pour la Marketplace Web
# Ce script installe MongoDB 7.0.x sur un serveur RedHat/CentOS 9.x

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

# Vérifier si le script est exécuté en tant que root
if [ "$EUID" -ne 0 ]; then
  error "Ce script doit être exécuté en tant que root ou avec sudo"
  exit 1
fi

# Vérifier la distribution Linux
if [ ! -f /etc/redhat-release ]; then
  error "Ce script est conçu pour RedHat/CentOS 9.x"
  exit 1
fi

# Vérifier la version de RedHat/CentOS
VERSION_ID=$(grep -oP '(?<=VERSION_ID=")[^"]+' /etc/os-release)
MAJOR_VERSION=$(echo $VERSION_ID | cut -d. -f1)
if [ "$MAJOR_VERSION" -ne 9 ]; then
  warning "Ce script est conçu pour RedHat/CentOS 9.x, mais vous utilisez la version $VERSION_ID"
  read -p "Voulez-vous continuer ? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Étape 1 : Ajouter le référentiel MongoDB
info "Ajout du référentiel MongoDB..."
cat > /etc/yum.repos.d/mongodb-org-7.0.repo << 'EOL'
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOL
success "Référentiel MongoDB ajouté avec succès"

# Étape 2 : Installer MongoDB et MongoDB Shell
info "Installation de MongoDB et MongoDB Shell..."
dnf clean all
dnf makecache
dnf install -y mongodb-org mongodb-mongosh
success "MongoDB et MongoDB Shell installés avec succès"

# Vérifier que MongoDB Shell est installé
if command -v mongosh &> /dev/null; then
  success "MongoDB Shell (mongosh) est installé correctement"
  mongosh --version
else
  error "MongoDB Shell (mongosh) n'est pas installé correctement"
  info "Tentative d'installation séparée de MongoDB Shell..."
  dnf install -y mongodb-mongosh
  
  if command -v mongosh &> /dev/null; then
    success "MongoDB Shell (mongosh) installé avec succès"
  else
    error "Échec de l'installation de MongoDB Shell"
    exit 1
  fi
fi

# Étape 3 : Configurer MongoDB
info "Configuration de MongoDB..."
# Sauvegarde de la configuration originale
cp /etc/mongod.conf /etc/mongod.conf.bak

# Mise à jour de la configuration
cat > /etc/mongod.conf << 'EOL'
# mongod.conf

# for documentation of all options see:
#   http://docs.mongodb.org/manual/reference/configuration-options/

# where to write logging data.
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

# Where and how to store data.
storage:
  dbPath: /var/lib/mongo

# how the process runs
processManagement:
  timeZoneInfo: /usr/share/zoneinfo

# network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1  # Écoute uniquement sur localhost pour la sécurité
EOL
success "MongoDB configuré avec succès"

# Étape 4 : Démarrer et activer MongoDB
info "Démarrage de MongoDB..."
systemctl start mongod
systemctl enable mongod
success "MongoDB démarré et activé avec succès"

# Étape 5 : Vérifier l'installation
info "Vérification de l'installation..."
if systemctl is-active --quiet mongod; then
  success "MongoDB est en cours d'exécution"
else
  error "MongoDB n'est pas en cours d'exécution"
  exit 1
fi

# Étape 6 : Créer les collections pour la marketplace
info "Création des collections pour la marketplace..."
mongosh --eval 'use marketplace; db.createCollection("apps"); db.createCollection("categories"); db.createCollection("users");'
success "Collections créées avec succès"

# Étape 7 : Configurer le service marketplace-api pour utiliser MongoDB
info "Configuration du service marketplace-api..."
if command -v pm2 &> /dev/null; then
  # Arrêter le service marketplace-api s'il est en cours d'exécution
  pm2 stop marketplace-api 2>/dev/null || true
  
  # Démarrer le service avec la variable d'environnement MONGODB_URI
  MONGODB_URI="mongodb://localhost:27017/marketplace" pm2 start /var/www/marketplace/backend/server.js --name marketplace-api
  
  # Sauvegarder la configuration PM2
  pm2 save
  
  success "Service marketplace-api configuré avec succès"
else
  warning "PM2 n'est pas installé, impossible de configurer le service marketplace-api"
fi

success "Installation et configuration de MongoDB terminées avec succès"
echo "MongoDB est maintenant installé et configuré pour la Marketplace Web"
echo "URI de connexion : mongodb://localhost:27017/marketplace"
