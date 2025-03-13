#!/bin/bash

# Script de déploiement pour la Marketplace Web
# Ce script permet de déployer le frontend et le backend sur le serveur distant

# Configuration
SERVER="market@market.quantum-dream.net"
PORT="4022"
REMOTE_DIR="/var/www/marketplace"
FRONTEND_DIR="market/frontend"
BACKEND_DIR="market/backend"
APPS_DIR="apps"

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

# Fonction pour vérifier si la commande précédente a réussi
check_status() {
  if [ $? -eq 0 ]; then
    success "$1"
  else
    error "$2"
    exit 1
  fi
}

# Fonction pour déployer le frontend
deploy_frontend() {
  info "Déploiement du frontend..."
  
  # Construire le frontend
  info "Construction du frontend..."
  cd "$FRONTEND_DIR" || exit
  npm install
  npm run build
  check_status "Frontend construit avec succès" "Erreur lors de la construction du frontend"
  
  # Créer un tarball du build
  info "Création de l'archive du frontend..."
  cd build || exit
  tar -czf ../../frontend-build.tar.gz .
  check_status "Archive du frontend créée avec succès" "Erreur lors de la création de l'archive du frontend"
  cd ../..
  
  # Transférer le tarball sur le serveur
  info "Transfert du frontend vers le serveur..."
  scp -P "$PORT" frontend-build.tar.gz "$SERVER:~/"
  check_status "Frontend transféré avec succès" "Erreur lors du transfert du frontend"
  
  # Déployer le frontend sur le serveur
  info "Déploiement du frontend sur le serveur..."
  ssh -p "$PORT" "$SERVER" "mkdir -p $REMOTE_DIR/frontend && \
                           tar -xzf ~/frontend-build.tar.gz -C $REMOTE_DIR/frontend && \
                           rm ~/frontend-build.tar.gz"
  check_status "Frontend déployé avec succès" "Erreur lors du déploiement du frontend"
  
  # Nettoyer
  rm frontend-build.tar.gz
  
  success "Déploiement du frontend terminé"
}

# Fonction pour déployer le backend
deploy_backend() {
  info "Déploiement du backend..."
  
  # Créer un tarball du backend
  info "Création de l'archive du backend..."
  cd "$BACKEND_DIR" || exit
  tar --exclude="node_modules" --exclude=".env" -czf ../../backend-build.tar.gz .
  check_status "Archive du backend créée avec succès" "Erreur lors de la création de l'archive du backend"
  cd ../..
  
  # Transférer le tarball sur le serveur
  info "Transfert du backend vers le serveur..."
  scp -P "$PORT" backend-build.tar.gz "$SERVER:~/"
  check_status "Backend transféré avec succès" "Erreur lors du transfert du backend"
  
  # Déployer le backend sur le serveur
  info "Déploiement du backend sur le serveur..."
  ssh -p "$PORT" "$SERVER" "mkdir -p $REMOTE_DIR/backend && \
                           tar -xzf ~/backend-build.tar.gz -C $REMOTE_DIR/backend && \
                           cd $REMOTE_DIR/backend && \
                           npm install --production && \
                           pm2 restart marketplace-api || pm2 start server.js --name marketplace-api && \
                           rm ~/backend-build.tar.gz"
  check_status "Backend déployé avec succès" "Erreur lors du déploiement du backend"
  
  # Nettoyer
  rm backend-build.tar.gz
  
  success "Déploiement du backend terminé"
}

# Fonction pour déployer une application spécifique
deploy_app() {
  APP_NAME=$1
  
  if [ -z "$APP_NAME" ]; then
    error "Nom de l'application non spécifié"
    return 1
  fi
  
  APP_DIR="$APPS_DIR/$APP_NAME"
  
  if [ ! -d "$APP_DIR" ]; then
    error "L'application $APP_NAME n'existe pas"
    return 1
  fi
  
  info "Déploiement de l'application $APP_NAME..."
  
  # Déployer le frontend de l'application
  if [ -d "$APP_DIR/public" ]; then
    info "Déploiement du frontend de l'application $APP_NAME..."
    
    # Créer un tarball du frontend de l'application
    info "Création de l'archive du frontend de l'application..."
    cd "$APP_DIR/public" || exit
    tar -czf ../../../app-frontend-build.tar.gz .
    check_status "Archive du frontend de l'application créée avec succès" "Erreur lors de la création de l'archive du frontend de l'application"
    cd ../../..
    
    # Transférer le tarball sur le serveur
    info "Transfert du frontend de l'application vers le serveur..."
    scp -P "$PORT" app-frontend-build.tar.gz "$SERVER:~/"
    check_status "Frontend de l'application transféré avec succès" "Erreur lors du transfert du frontend de l'application"
    
    # Déployer le frontend de l'application sur le serveur
    info "Déploiement du frontend de l'application sur le serveur..."
    ssh -p "$PORT" "$SERVER" "mkdir -p $REMOTE_DIR/apps/$APP_NAME/public && \
                             tar -xzf ~/app-frontend-build.tar.gz -C $REMOTE_DIR/apps/$APP_NAME/public && \
                             rm ~/app-frontend-build.tar.gz"
    check_status "Frontend de l'application déployé avec succès" "Erreur lors du déploiement du frontend de l'application"
    
    # Nettoyer
    rm app-frontend-build.tar.gz
  fi
  
  # Déployer le backend de l'application
  if [ -d "$APP_DIR/backend" ]; then
    info "Déploiement du backend de l'application $APP_NAME..."
    
    # Créer un tarball du backend de l'application
    info "Création de l'archive du backend de l'application..."
    cd "$APP_DIR/backend" || exit
    tar --exclude="node_modules" --exclude=".env" -czf ../../../app-backend-build.tar.gz .
    check_status "Archive du backend de l'application créée avec succès" "Erreur lors de la création de l'archive du backend de l'application"
    cd ../../..
    
    # Transférer le tarball sur le serveur
    info "Transfert du backend de l'application vers le serveur..."
    scp -P "$PORT" app-backend-build.tar.gz "$SERVER:~/"
    check_status "Backend de l'application transféré avec succès" "Erreur lors du transfert du backend de l'application"
    
    # Déployer le backend de l'application sur le serveur
    info "Déploiement du backend de l'application sur le serveur..."
    ssh -p "$PORT" "$SERVER" "mkdir -p $REMOTE_DIR/apps/$APP_NAME/backend && \
                             tar -xzf ~/app-backend-build.tar.gz -C $REMOTE_DIR/apps/$APP_NAME/backend && \
                             cd $REMOTE_DIR/apps/$APP_NAME/backend && \
                             npm install --production && \
                             pm2 restart $APP_NAME-api || pm2 start server.js --name $APP_NAME-api && \
                             rm ~/app-backend-build.tar.gz"
    check_status "Backend de l'application déployé avec succès" "Erreur lors du déploiement du backend de l'application"
    
    # Nettoyer
    rm app-backend-build.tar.gz
  fi
  
  success "Déploiement de l'application $APP_NAME terminé"
}

# Fonction pour déployer toute la marketplace
deploy_all() {
  info "Déploiement complet de la marketplace..."
  
  # Déployer le frontend
  deploy_frontend
  
  # Déployer le backend
  deploy_backend
  
  # Déployer toutes les applications
  for app in "$APPS_DIR"/*; do
    if [ -d "$app" ]; then
      APP_NAME=$(basename "$app")
      deploy_app "$APP_NAME"
    fi
  done
  
  success "Déploiement complet de la marketplace terminé"
}

# Menu principal
show_menu() {
  echo -e "${BLUE}=== Script de déploiement de la Marketplace Web ===${NC}"
  echo "1. Déployer le frontend"
  echo "2. Déployer le backend"
  echo "3. Déployer une application spécifique"
  echo "4. Déployer toute la marketplace"
  echo "5. Quitter"
  echo -n "Votre choix: "
  read -r choice
  
  case $choice in
    1) deploy_frontend ;;
    2) deploy_backend ;;
    3)
      echo -n "Nom de l'application à déployer: "
      read -r app_name
      deploy_app "$app_name"
      ;;
    4) deploy_all ;;
    5) exit 0 ;;
    *) error "Choix invalide" ;;
  esac
  
  echo ""
  show_menu
}

# Vérifier si le script est exécuté avec des arguments
if [ $# -gt 0 ]; then
  case $1 in
    frontend) deploy_frontend ;;
    backend) deploy_backend ;;
    app)
      if [ -z "$2" ]; then
        error "Nom de l'application non spécifié"
        exit 1
      fi
      deploy_app "$2"
      ;;
    all) deploy_all ;;
    *)
      error "Argument invalide: $1"
      echo "Usage: $0 [frontend|backend|app <app_name>|all]"
      exit 1
      ;;
  esac
else
  # Afficher le menu interactif
  show_menu
fi
