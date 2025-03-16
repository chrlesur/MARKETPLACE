#!/bin/bash

# Script de déploiement pour la Marketplace Web
# Ce script permet de déployer le frontend et le backend sur le serveur distant

# Configuration
SERVER="market@market.quantum-dream.net"
PORT="4022"
REMOTE_DIR="/var/www/marketplace"

# Déterminer le chemin absolu du répertoire du script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Définir les chemins relatifs au répertoire racine du projet
FRONTEND_DIR="$PROJECT_ROOT/market/frontend"
BACKEND_DIR="$PROJECT_ROOT/market/backend"
APPS_DIR="$PROJECT_ROOT/apps"

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
  
  # Créer un tarball des fichiers source
  info "Création de l'archive du frontend..."
  cd "$FRONTEND_DIR" || exit
  # Exclure node_modules et build pour réduire la taille
  tar --exclude="node_modules" --exclude="build" -czf "$PROJECT_ROOT/frontend-source.tar.gz" .
  check_status "Archive du frontend créée avec succès" "Erreur lors de la création de l'archive du frontend"
  cd "$PROJECT_ROOT"
  
  # Utiliser la configuration Nginx existante
  info "Utilisation de la configuration Nginx existante..."
  cp "$PROJECT_ROOT/config/nginx/marketplace.conf" "$PROJECT_ROOT/nginx-marketplace.conf"
  check_status "Configuration Nginx copiée avec succès" "Erreur lors de la copie de la configuration Nginx"
  
  # Transférer les fichiers sur le serveur
  info "Transfert des fichiers vers le serveur..."
  scp -P "$PORT" frontend-source.tar.gz "$SERVER:~/"
  check_status "Frontend transféré avec succès" "Erreur lors du transfert du frontend"
  
  scp -P "$PORT" nginx-marketplace.conf "$SERVER:~/"
  check_status "Configuration Nginx transférée avec succès" "Erreur lors du transfert de la configuration Nginx"
  
  # Déployer et construire le frontend sur le serveur
  info "Déploiement et construction du frontend sur le serveur..."
  ssh -p "$PORT" "$SERVER" "mkdir -p $REMOTE_DIR/frontend-source && \
                           tar -xzf ~/frontend-source.tar.gz -C $REMOTE_DIR/frontend-source && \
                           cd $REMOTE_DIR/frontend-source && \
                           npm install && \
                           npm install framer-motion@10.16.4 && \
                           npm run build && \
                           rm -rf $REMOTE_DIR/frontend/* && \
                           mkdir -p $REMOTE_DIR/frontend && \
                           cp -r build/* $REMOTE_DIR/frontend/ && \
                           mkdir -p $REMOTE_DIR/frontend/static/images/avatar && \
                           cp -r public/static/images/avatar/* $REMOTE_DIR/frontend/static/images/avatar/ && \
                           sudo chmod -R 755 $REMOTE_DIR/frontend && \
                           sudo chown -R market:market $REMOTE_DIR/frontend && \
                           sudo restorecon -R $REMOTE_DIR/frontend && \
                           sudo cp ~/nginx-marketplace.conf /etc/nginx/conf.d/market.quantum-dream.net.conf && \
                           sudo nginx -t && \
                           sudo systemctl restart nginx && \
                           rm ~/frontend-source.tar.gz ~/nginx-marketplace.conf"
  check_status "Frontend déployé et construit avec succès" "Erreur lors du déploiement ou de la construction du frontend"
  
  # Nettoyer
  rm frontend-source.tar.gz
  rm -f nginx-marketplace.conf
  
  success "Déploiement du frontend terminé"
}

# Fonction pour déployer le backend
deploy_backend() {
  info "Déploiement du backend..."
  
  # Créer un tarball du backend
  info "Création de l'archive du backend..."
  cd "$BACKEND_DIR" || exit
  tar --exclude="node_modules" -czf "$PROJECT_ROOT/backend-build.tar.gz" .
  check_status "Archive du backend créée avec succès" "Erreur lors de la création de l'archive du backend"
  cd "$PROJECT_ROOT"
  
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
                           sudo npm install -g pm2 || true && \
                           pm2 restart marketplace-api || pm2 start server.js --name marketplace-api || sudo pm2 start server.js --name marketplace-api && \
                           rm ~/backend-build.tar.gz"
  check_status "Backend déployé avec succès" "Erreur lors du déploiement du backend"
  
  # Nettoyer
  rm backend-build.tar.gz
  
  success "Déploiement du backend terminé"
}

# Fonction pour déployer une application spécifique
deploy_app() {
  APP_NAME=$1
  COMPONENT=$2  # 'frontend', 'backend', ou vide pour les deux
  
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
  if [ -z "$COMPONENT" ] || [ "$COMPONENT" = "frontend" ]; then
    if [ -d "$APP_DIR/public" ]; then
      info "Déploiement du frontend de l'application $APP_NAME..."
      
      # Créer un tarball du frontend de l'application
      info "Création de l'archive du frontend de l'application..."
      cd "$APP_DIR" || exit
      tar -czf "$PROJECT_ROOT/app-frontend-build.tar.gz" --exclude="node_modules" public
      check_status "Archive du frontend de l'application créée avec succès" "Erreur lors de la création de l'archive du frontend de l'application"
      cd "$PROJECT_ROOT"
      
      # Transférer le tarball sur le serveur
      info "Transfert du frontend de l'application vers le serveur..."
      scp -P "$PORT" app-frontend-build.tar.gz "$SERVER:~/"
      check_status "Frontend de l'application transféré avec succès" "Erreur lors du transfert du frontend de l'application"
      
      # Déployer le frontend de l'application sur le serveur
      info "Déploiement du frontend de l'application sur le serveur..."
      ssh -p "$PORT" "$SERVER" "mkdir -p $REMOTE_DIR/apps/$APP_NAME && \
                               rm -rf $REMOTE_DIR/apps/$APP_NAME/public && \
                               mkdir -p $REMOTE_DIR/apps/$APP_NAME/public && \
                               tar -xzf ~/app-frontend-build.tar.gz -C $REMOTE_DIR/apps/$APP_NAME --strip-components=1 && \
                               sudo chmod -R 755 $REMOTE_DIR/apps/$APP_NAME/public && \
                               sudo chown -R market:market $REMOTE_DIR/apps/$APP_NAME/public && \
                               sudo restorecon -R $REMOTE_DIR/apps/$APP_NAME/public && \
                               rm ~/app-frontend-build.tar.gz"
      check_status "Frontend de l'application déployé avec succès" "Erreur lors du déploiement du frontend de l'application"
      
      # Nettoyer
      rm app-frontend-build.tar.gz
    else
      warning "Aucun frontend trouvé pour l'application $APP_NAME"
    fi
  fi
  
  # Déployer le backend de l'application
  if [ -z "$COMPONENT" ] || [ "$COMPONENT" = "backend" ]; then
    # Vérifier si l'application a un serveur.js à la racine ou un dossier backend
    if [ -f "$APP_DIR/server.js" ]; then
      info "Déploiement du serveur de l'application $APP_NAME..."
      
      # Créer un tarball du serveur de l'application
      info "Création de l'archive du serveur de l'application..."
      cd "$APP_DIR" || exit
      tar --exclude="node_modules" --exclude=".env" --exclude="public/uploads" -czf "$PROJECT_ROOT/app-server-build.tar.gz" .
      check_status "Archive du serveur de l'application créée avec succès" "Erreur lors de la création de l'archive du serveur de l'application"
      cd "$PROJECT_ROOT"
      
      # Transférer le tarball sur le serveur
      info "Transfert du serveur de l'application vers le serveur..."
      scp -P "$PORT" app-server-build.tar.gz "$SERVER:~/"
      check_status "Serveur de l'application transféré avec succès" "Erreur lors du transfert du serveur de l'application"
      
      # Déployer le serveur de l'application sur le serveur
      info "Déploiement du serveur de l'application sur le serveur..."
      ssh -p "$PORT" "$SERVER" "mkdir -p $REMOTE_DIR/apps/$APP_NAME && \
                               tar -xzf ~/app-server-build.tar.gz -C $REMOTE_DIR/apps/$APP_NAME && \
                               cd $REMOTE_DIR/apps/$APP_NAME && \
                               npm install --production && \
                               pm2 restart $APP_NAME-api || pm2 start server.js --name $APP_NAME-api && \
                               rm ~/app-server-build.tar.gz"
      check_status "Serveur de l'application déployé avec succès" "Erreur lors du déploiement du serveur de l'application"
      
      # Nettoyer
      rm app-server-build.tar.gz
    elif [ -d "$APP_DIR/backend" ]; then
      info "Déploiement du backend de l'application $APP_NAME..."
      
      # Créer un tarball du backend de l'application
      info "Création de l'archive du backend de l'application..."
      cd "$APP_DIR/backend" || exit
      tar --exclude="node_modules" --exclude=".env" --exclude="uploads" -czf "$PROJECT_ROOT/app-backend-build.tar.gz" .
      check_status "Archive du backend de l'application créée avec succès" "Erreur lors de la création de l'archive du backend de l'application"
      cd "$PROJECT_ROOT"
      
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
    else
      warning "Aucun backend trouvé pour l'application $APP_NAME"
    fi
  fi
  
  # Déployer les modules partagés si nécessaire
  if [ -d "$PROJECT_ROOT/apps/shared" ] && { [ -z "$COMPONENT" ] || [ "$COMPONENT" = "shared" ]; }; then
    info "Déploiement des modules partagés..."
    
    # Créer un tarball des modules partagés
    info "Création de l'archive des modules partagés..."
    cd "$PROJECT_ROOT/apps" || exit
    tar -czf "$PROJECT_ROOT/shared-modules.tar.gz" shared
    check_status "Archive des modules partagés créée avec succès" "Erreur lors de la création de l'archive des modules partagés"
    cd "$PROJECT_ROOT"
    
    # Transférer le tarball sur le serveur
    info "Transfert des modules partagés vers le serveur..."
    scp -P "$PORT" shared-modules.tar.gz "$SERVER:~/"
    check_status "Modules partagés transférés avec succès" "Erreur lors du transfert des modules partagés"
    
    # Déployer les modules partagés sur le serveur
    info "Déploiement des modules partagés sur le serveur..."
    ssh -p "$PORT" "$SERVER" "mkdir -p $REMOTE_DIR/apps && \
                             tar -xzf ~/shared-modules.tar.gz -C $REMOTE_DIR/apps && \
                             sudo chmod -R 755 $REMOTE_DIR/apps/shared && \
                             sudo chown -R market:market $REMOTE_DIR/apps/shared && \
                             sudo restorecon -R $REMOTE_DIR/apps/shared && \
                             rm ~/shared-modules.tar.gz"
    check_status "Modules partagés déployés avec succès" "Erreur lors du déploiement des modules partagés"
    
    # Nettoyer
    rm shared-modules.tar.gz
  fi
  
  success "Déploiement de l'application $APP_NAME terminé"
}

# Fonction pour déployer MongoDB
deploy_mongodb() {
  info "Déploiement de MongoDB..."

  # Transférer le script d'installation sur le serveur
  info "Transfert du script d'installation de MongoDB..."
  scp -P "$PORT" "$PROJECT_ROOT/docs/mongodb/install_mongodb.sh" "$SERVER:~/"
  check_status "Script d'installation de MongoDB transféré avec succès" "Erreur lors du transfert du script d'installation de MongoDB"

  # Exécuter le script d'installation sur le serveur
  info "Installation de MongoDB sur le serveur..."
  ssh -p "$PORT" "$SERVER" "chmod +x ~/install_mongodb.sh && sudo ~/install_mongodb.sh && rm ~/install_mongodb.sh"
  check_status "MongoDB installé avec succès" "Erreur lors de l'installation de MongoDB"

  success "Déploiement de MongoDB terminé"
}

# Fonction pour déployer toute la marketplace
deploy_all() {
  info "Déploiement complet de la marketplace..."

  # Déployer MongoDB
  deploy_mongodb

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
      # Vérifier s'il y a un troisième argument pour le composant
      if [ -n "$3" ]; then
        deploy_app "$2" "$3"
      else
        deploy_app "$2"
      fi
      ;;
    shared)
      # Déployer uniquement les modules partagés
      if [ -d "$PROJECT_ROOT/apps/shared" ]; then
        info "Déploiement des modules partagés..."
        
        # Créer un tarball des modules partagés
        info "Création de l'archive des modules partagés..."
        cd "$PROJECT_ROOT/apps" || exit
        tar -czf "$PROJECT_ROOT/shared-modules.tar.gz" shared
        check_status "Archive des modules partagés créée avec succès" "Erreur lors de la création de l'archive des modules partagés"
        cd "$PROJECT_ROOT"
        
        # Transférer le tarball sur le serveur
        info "Transfert des modules partagés vers le serveur..."
        scp -P "$PORT" shared-modules.tar.gz "$SERVER:~/"
        check_status "Modules partagés transférés avec succès" "Erreur lors du transfert des modules partagés"
        
        # Déployer les modules partagés sur le serveur
        info "Déploiement des modules partagés sur le serveur..."
        ssh -p "$PORT" "$SERVER" "mkdir -p $REMOTE_DIR/apps && \
                                 tar -xzf ~/shared-modules.tar.gz -C $REMOTE_DIR/apps && \
                                 sudo chmod -R 755 $REMOTE_DIR/apps/shared && \
                                 sudo chown -R market:market $REMOTE_DIR/apps/shared && \
                                 sudo restorecon -R $REMOTE_DIR/apps/shared && \
                                 rm ~/shared-modules.tar.gz"
        check_status "Modules partagés déployés avec succès" "Erreur lors du déploiement des modules partagés"
        
        # Nettoyer
        rm shared-modules.tar.gz
        
        success "Déploiement des modules partagés terminé"
      else
        error "Le dossier des modules partagés n'existe pas"
        exit 1
      fi
      ;;
    nginx)
      # Déployer uniquement la configuration Nginx
      if [ -d "$PROJECT_ROOT/config/nginx" ]; then
        info "Déploiement de la configuration Nginx..."

        # Transférer la configuration Nginx
        info "Transfert de la configuration Nginx..."
        scp -P "$PORT" "$PROJECT_ROOT/config/nginx/marketplace.conf" "$SERVER:~/"
        check_status "Configuration Nginx transférée avec succès" "Erreur lors du transfert de la configuration Nginx"

        # Installer la configuration Nginx sur le serveur
        info "Installation de la configuration Nginx sur le serveur..."
        ssh -p "$PORT" "$SERVER" "sudo cp ~/marketplace.conf /etc/nginx/conf.d/market.quantum-dream.net.conf && \
                                 sudo nginx -t && \
                                 sudo systemctl restart nginx && \
                                 rm ~/marketplace.conf"
        check_status "Configuration Nginx installée avec succès" "Erreur lors de l'installation de la configuration Nginx"

        success "Déploiement de la configuration Nginx terminé"
      else
        error "Le dossier de configuration Nginx n'existe pas"
        exit 1
      fi
      ;;
    mongodb) deploy_mongodb ;;
    all) deploy_all ;;
    *)
      error "Argument invalide: $1"
      echo "Usage: $0 [frontend|backend|app <app_name> [frontend|backend|shared]|shared|nginx|all]"
      exit 1
      ;;
  esac
else
  # Afficher le menu interactif
  show_menu
fi
