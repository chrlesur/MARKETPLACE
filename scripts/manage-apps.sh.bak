#!/bin/bash

# Script de gestion des applications pour la Marketplace Web
# Ce script permet de gérer les applications de la marketplace (initialisation, ajout, suppression, etc.)

# Configuration
SERVER="market@market.quantum-dream.net"
PORT="4022"
REMOTE_DIR="/var/www/marketplace"

# Déterminer le chemin absolu du répertoire du script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Définir les chemins relatifs au répertoire racine du projet
APPS_DIR="$PROJECT_ROOT/apps"
MONGODB_SCRIPTS_DIR="$PROJECT_ROOT/docs/mongodb"
REMOTE_MONGODB_SCRIPTS_DIR="$REMOTE_DIR/mongodb"

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

# Fonction pour vérifier si les scripts MongoDB sont disponibles
check_mongodb_scripts() {
  info "Vérification des scripts MongoDB..."
  
  # Vérifier si les scripts existent localement
  if [ ! -f "$MONGODB_SCRIPTS_DIR/init-mongodb.js" ]; then
    error "Le script d'initialisation de MongoDB n'existe pas: $MONGODB_SCRIPTS_DIR/init-mongodb.js"
    exit 1
  fi
  
  if [ ! -f "$MONGODB_SCRIPTS_DIR/add-app.js" ]; then
    error "Le script d'ajout d'application n'existe pas: $MONGODB_SCRIPTS_DIR/add-app.js"
    exit 1
  fi
  
  if [ ! -f "$MONGODB_SCRIPTS_DIR/app-templates.js" ]; then
    error "Le script de templates d'applications n'existe pas: $MONGODB_SCRIPTS_DIR/app-templates.js"
    exit 1
  fi
  
  if [ ! -f "$MONGODB_SCRIPTS_DIR/manage-apps.js" ]; then
    error "Le script de gestion des applications n'existe pas: $MONGODB_SCRIPTS_DIR/manage-apps.js"
    exit 1
  fi
  
  # Rendre les scripts exécutables localement
  chmod +x "$MONGODB_SCRIPTS_DIR"/*.js
  
  # Créer un tarball des scripts MongoDB
  info "Création de l'archive des scripts MongoDB..."
  cd "$PROJECT_ROOT" || exit
  tar -czf mongodb-scripts.tar.gz -C "$PROJECT_ROOT/docs" mongodb
  check_status "Archive des scripts MongoDB créée avec succès" "Erreur lors de la création de l'archive des scripts MongoDB"
  
  # Vérifier si le répertoire des scripts existe sur le serveur distant
  info "Vérification du répertoire des scripts sur le serveur distant..."
  ssh -p "$PORT" "$SERVER" "mkdir -p $REMOTE_MONGODB_SCRIPTS_DIR"
  check_status "Répertoire des scripts créé avec succès sur le serveur distant" "Erreur lors de la création du répertoire des scripts sur le serveur distant"
  
  # Transférer les scripts sur le serveur distant
  info "Transfert des scripts MongoDB vers le serveur distant..."
  scp -P "$PORT" mongodb-scripts.tar.gz "$SERVER:~/"
  check_status "Scripts MongoDB transférés avec succès" "Erreur lors du transfert des scripts MongoDB"
  
  # Extraire les scripts sur le serveur distant
  info "Extraction des scripts MongoDB sur le serveur distant..."
  ssh -p "$PORT" "$SERVER" "tar -xzf ~/mongodb-scripts.tar.gz -C $REMOTE_DIR && \
                           chmod +x $REMOTE_MONGODB_SCRIPTS_DIR/*.js && \
                           rm ~/mongodb-scripts.tar.gz"
  check_status "Scripts MongoDB extraits avec succès sur le serveur distant" "Erreur lors de l'extraction des scripts MongoDB sur le serveur distant"
  
  # Créer un package.json temporaire pour les dépendances
  info "Création du fichier package.json pour les dépendances..."
  cat > /tmp/mongodb-package.json << 'EOL'
{
  "name": "mongodb-scripts",
  "version": "1.0.0",
  "description": "Scripts de gestion MongoDB pour la Marketplace",
  "private": true,
  "dependencies": {
    "mongodb": "^5.0.0",
    "commander": "^10.0.0",
    "dotenv": "^16.0.0",
    "chalk": "^4.1.2",
    "bcryptjs": "^2.4.3",
    "uuid": "^9.0.0",
    "slugify": "^1.6.6"
  }
}
EOL
  
  # Transférer le package.json sur le serveur distant
  info "Transfert du fichier package.json vers le serveur distant..."
  scp -P "$PORT" /tmp/mongodb-package.json "$SERVER:~/package.json"
  check_status "Fichier package.json transféré avec succès" "Erreur lors du transfert du fichier package.json"
  
  # Installer les dépendances sur le serveur distant
  info "Installation des dépendances Node.js sur le serveur distant..."
  ssh -p "$PORT" "$SERVER" "cd $REMOTE_MONGODB_SCRIPTS_DIR && \
                           cp ~/package.json . && \
                           npm install && \
                           rm ~/package.json"
  check_status "Dépendances Node.js installées avec succès" "Erreur lors de l'installation des dépendances Node.js"
  
  # Nettoyer
  rm mongodb-scripts.tar.gz
  rm /tmp/mongodb-package.json
  
  success "Scripts MongoDB vérifiés et transférés avec succès"
}

# Fonction pour initialiser MongoDB
init_mongodb() {
  info "Initialisation de MongoDB..."
  
  # Vérifier si MongoDB est en cours d'exécution sur le serveur distant
  info "Vérification de l'état de MongoDB sur le serveur distant..."
  
  mongodb_running=$(ssh -p "$PORT" "$SERVER" "pgrep mongod > /dev/null && echo 'running' || echo 'not running'")
  
  if [ "$mongodb_running" = "not running" ]; then
    error "MongoDB n'est pas en cours d'exécution sur le serveur distant."
    warning "Veuillez démarrer MongoDB sur le serveur distant avec la commande : sudo systemctl start mongod"
    return 1
  fi
  
  # Vérifier si MongoDB est accessible
  info "Vérification de l'accessibilité de MongoDB..."
  
  mongodb_accessible=$(ssh -p "$PORT" "$SERVER" "timeout 5 mongosh --quiet --eval 'db.runCommand({ ping: 1 })' 2>/dev/null || echo 'not accessible'")
  
  if [ "$mongodb_accessible" = "not accessible" ]; then
    error "MongoDB n'est pas accessible sur le serveur distant."
    warning "Veuillez vérifier que MongoDB est correctement configuré et accessible sur localhost:27017"
    return 1
  fi
  
  success "MongoDB est en cours d'exécution et accessible sur le serveur distant."
  
  # Vérifier si l'initialisation a déjà été effectuée
  info "Vérification de l'état de la base de données sur le serveur distant..."
  
  # On vérifie si la base de données est déjà initialisée en comptant les utilisateurs
  db_status=$(ssh -p "$PORT" "$SERVER" "mongosh --quiet --eval 'db = db.getSiblingDB(\"marketplace\"); db.users.countDocuments({})'" 2>/dev/null)
  
  if [[ $db_status =~ ^[0-9]+$ ]] && [ "$db_status" -gt 0 ]; then
    warning "La base de données semble déjà être initialisée (${db_status} utilisateurs trouvés)."
    
    # Demander à l'utilisateur ce qu'il souhaite faire
    echo ""
    echo "Options disponibles :"
    echo "1. Annuler l'opération (par défaut)"
    echo "2. Réinitialiser complètement la base de données (supprime toutes les données)"
    echo "3. Ajouter uniquement les données manquantes (préserve les données existantes)"
    echo ""
    read -p "Votre choix [1]: " db_choice
    db_choice=${db_choice:-1}
    
    case $db_choice in
      1)
        info "Opération annulée par l'utilisateur."
        return 0
        ;;
      2)
        warning "Réinitialisation complète de la base de données demandée."
        force_option="--force"
        ;;
      3)
        info "Ajout des données manquantes uniquement."
        force_option="--add-missing"
        ;;
      *)
        error "Choix invalide. Opération annulée."
        return 1
        ;;
    esac
  else
    info "Aucune base de données initialisée trouvée. Procédure d'initialisation lancée."
    force_option=""
  fi
  
  # Si on continue avec l'initialisation, demander les identifiants
  if [ "$db_choice" = "2" ] || [ "$db_choice" = "3" ] || [ -z "$db_status" ] || [ "$db_status" = "0" ]; then
    # Demander les informations d'identification de l'administrateur
    read -p "Email de l'administrateur [admin@marketplace.com]: " admin_email
    admin_email=${admin_email:-admin@marketplace.com}
    
    read -s -p "Mot de passe de l'administrateur [admin123]: " admin_password
    echo ""
    admin_password=${admin_password:-admin123}
    
    # Exécuter le script d'initialisation sur le serveur distant avec une URI MongoDB explicite
    info "Exécution du script d'initialisation sur le serveur distant..."
    ssh -p "$PORT" "$SERVER" "cd $REMOTE_DIR && MONGODB_URI='mongodb://127.0.0.1:27017/marketplace' node $REMOTE_MONGODB_SCRIPTS_DIR/init-mongodb.js --admin-email='$admin_email' --admin-password='$admin_password' $force_option"
    
    # Vérifier le statut de l'exécution
    if [ $? -eq 0 ]; then
      success "Initialisation de MongoDB terminée avec succès"
      return 0
    else
      error "Erreur lors de l'initialisation de MongoDB"
      
      # Demander à l'utilisateur s'il souhaite voir les logs d'erreur
      read -p "Souhaitez-vous voir les logs d'erreur détaillés ? (o/N): " show_logs
      if [[ $show_logs =~ ^[Oo]$ ]]; then
        ssh -p "$PORT" "$SERVER" "cat $REMOTE_DIR/mongodb-init.log"
      fi
      
      return 1
    fi
  fi
}

# Fonction pour ajouter une application de manière interactive
add_app_interactive() {
  app_name=$1
  
  if [ -z "$app_name" ]; then
    error "Nom de l'application non spécifié"
    return 1
  fi
  
  app_dir="$APPS_DIR/$app_name"
  
  if [ ! -d "$app_dir" ]; then
    error "L'application $app_name n'existe pas"
    return 1
  fi
  
  info "Ajout interactif de l'application $app_name..."
  
  # Créer un tarball de l'application
  info "Création de l'archive de l'application..."
  cd "$APPS_DIR" || exit
  tar -czf "$PROJECT_ROOT/app-$app_name.tar.gz" "$app_name"
  check_status "Archive de l'application créée avec succès" "Erreur lors de la création de l'archive de l'application"
  cd "$PROJECT_ROOT" || exit
  
  # Transférer l'application sur le serveur distant
  info "Transfert de l'application vers le serveur distant..."
  scp -P "$PORT" "app-$app_name.tar.gz" "$SERVER:~/"
  check_status "Application transférée avec succès" "Erreur lors du transfert de l'application"
  
  # Extraire l'application sur le serveur distant
  info "Extraction de l'application sur le serveur distant..."
  ssh -p "$PORT" "$SERVER" "mkdir -p $REMOTE_DIR/apps && \
                           tar -xzf ~/app-$app_name.tar.gz -C $REMOTE_DIR/apps && \
                           rm ~/app-$app_name.tar.gz"
  check_status "Application extraite avec succès sur le serveur distant" "Erreur lors de l'extraction de l'application sur le serveur distant"
  
  # Créer un fichier JSON temporaire
  temp_json="/tmp/app-$app_name.json"
  
  # Extraire les informations de base de l'application
  info "Extraction des informations de base de l'application..."
  ssh -p "$PORT" "$SERVER" "cd $REMOTE_DIR && node $REMOTE_MONGODB_SCRIPTS_DIR/app-templates.js extract --dir $REMOTE_DIR/apps/$app_name --output ~/app-$app_name.json"
  check_status "Informations extraites avec succès" "Erreur lors de l'extraction des informations"
  
  # Récupérer le fichier JSON
  info "Récupération des informations de l'application..."
  scp -P "$PORT" "$SERVER:~/app-$app_name.json" "$temp_json"
  check_status "Informations récupérées avec succès" "Erreur lors de la récupération des informations"
  
  # Demander à l'utilisateur de compléter les informations
  info "Veuillez compléter les informations suivantes :"
  
  # Lire les informations actuelles
  app_data=$(cat "$temp_json")
  current_name=$(echo "$app_data" | grep -o '"name": *"[^"]*"' | cut -d'"' -f4)
  current_short_desc=$(echo "$app_data" | grep -o '"short": *"[^"]*"' | cut -d'"' -f4)
  current_category=$(echo "$app_data" | grep -o '"category": *"[^"]*"' | cut -d'"' -f4)
  current_pricing=$(echo "$app_data" | grep -o '"type": *"[^"]*"' | cut -d'"' -f4)
  
  # Demander les informations
  read -p "Nom de l'application [$current_name]: " app_name_input
  app_name_input=${app_name_input:-$current_name}
  
  read -p "Description courte [$current_short_desc]: " app_short_desc
  app_short_desc=${app_short_desc:-$current_short_desc}
  
  echo "Catégories disponibles : productivite, outils"
  read -p "Catégorie [$current_category]: " app_category
  app_category=${app_category:-$current_category}
  
  echo "Types de tarification disponibles : free, paid, subscription"
  read -p "Type de tarification [$current_pricing]: " app_pricing
  app_pricing=${app_pricing:-$current_pricing}
  
  if [ "$app_pricing" = "paid" ] || [ "$app_pricing" = "subscription" ]; then
    read -p "Prix [0]: " app_price
    app_price=${app_price:-0}
    
    read -p "Devise [EUR]: " app_currency
    app_currency=${app_currency:-EUR}
    
    if [ "$app_pricing" = "subscription" ]; then
      read -p "Jours d'essai [14]: " app_trial_days
      app_trial_days=${app_trial_days:-14}
    fi
  fi
  
  read -p "URL de l'application [/$app_name]: " app_url
  app_url=${app_url:-/$app_name}
  
  read -p "Version [1.0.0]: " app_version
  app_version=${app_version:-1.0.0}
  
  read -p "Prérequis [Navigateur web moderne]: " app_requirements
  app_requirements=${app_requirements:-"Navigateur web moderne"}
  
  read -p "Tags (séparés par des virgules) []: " app_tags
  
  # Mettre à jour le fichier JSON
  info "Mise à jour des informations de l'application..."
  
  # Utiliser jq pour mettre à jour le fichier JSON si disponible
  if command -v jq >/dev/null 2>&1; then
    jq_cmd="jq"
  elif command -v python3 >/dev/null 2>&1; then
    # Utiliser Python comme alternative à jq
    jq_cmd="python3 -c \"import json, sys; data = json.load(sys.stdin); "
    jq_cmd+="data['name'] = '$app_name_input'; "
    jq_cmd+="data['description']['short'] = '$app_short_desc'; "
    jq_cmd+="data['category'] = '$app_category'; "
    jq_cmd+="data['pricing']['type'] = '$app_pricing'; "
    
    if [ "$app_pricing" = "paid" ] || [ "$app_pricing" = "subscription" ]; then
      jq_cmd+="data['pricing']['price'] = $app_price; "
      jq_cmd+="data['pricing']['currency'] = '$app_currency'; "
      
      if [ "$app_pricing" = "subscription" ]; then
        jq_cmd+="data['pricing']['trialDays'] = $app_trial_days; "
      fi
    fi
    
    jq_cmd+="data['url'] = '$app_url'; "
    jq_cmd+="data['version'] = '$app_version'; "
    jq_cmd+="data['requirements'] = '$app_requirements'; "
    
    if [ -n "$app_tags" ]; then
      # Convertir la chaîne de tags en tableau
      IFS=',' read -ra TAGS <<< "$app_tags"
      tags_array="["
      for i in "${!TAGS[@]}"; do
        if [ $i -gt 0 ]; then
          tags_array+=", "
        fi
        tags_array+="\\\"${TAGS[$i]}\\\""
      done
      tags_array+="]"
      jq_cmd+="data['tags'] = $tags_array; "
    fi
    
    jq_cmd+="print(json.dumps(data, indent=2))\"\""
  else
    error "Ni jq ni Python 3 ne sont disponibles. Impossible de mettre à jour le fichier JSON."
    rm "$temp_json"
    return 1
  fi
  
  # Exécuter la commande pour mettre à jour le fichier JSON
  if [ "$jq_cmd" = "jq" ]; then
    cat "$temp_json" | jq ".name = \"$app_name_input\" | 
      .description.short = \"$app_short_desc\" | 
      .category = \"$app_category\" | 
      .pricing.type = \"$app_pricing\" | 
      .url = \"$app_url\" | 
      .version = \"$app_version\" | 
      .requirements = \"$app_requirements\"" > "${temp_json}.new"
    
    if [ "$app_pricing" = "paid" ] || [ "$app_pricing" = "subscription" ]; then
      cat "${temp_json}.new" | jq ".pricing.price = $app_price | 
        .pricing.currency = \"$app_currency\"" > "${temp_json}.new2"
      mv "${temp_json}.new2" "${temp_json}.new"
      
      if [ "$app_pricing" = "subscription" ]; then
        cat "${temp_json}.new" | jq ".pricing.trialDays = $app_trial_days" > "${temp_json}.new2"
        mv "${temp_json}.new2" "${temp_json}.new"
      fi
    fi
    
    if [ -n "$app_tags" ]; then
      # Convertir la chaîne de tags en tableau
      IFS=',' read -ra TAGS <<< "$app_tags"
      tags_json="["
      for i in "${!TAGS[@]}"; do
        if [ $i -gt 0 ]; then
          tags_json+=","
        fi
        tags_json+="\"${TAGS[$i]}\""
      done
      tags_json+="]"
      
      cat "${temp_json}.new" | jq ".tags = $tags_json" > "${temp_json}.new2"
      mv "${temp_json}.new2" "${temp_json}.new"
    fi
    
    mv "${temp_json}.new" "$temp_json"
  else
    # Utiliser Python comme alternative
    eval "cat \"$temp_json\" | $jq_cmd > \"${temp_json}.new\""
    mv "${temp_json}.new" "$temp_json"
  fi
  
  # Transférer le fichier JSON mis à jour sur le serveur distant
  info "Transfert des informations mises à jour vers le serveur distant..."
  scp -P "$PORT" "$temp_json" "$SERVER:~/app-$app_name.json"
  check_status "Informations transférées avec succès" "Erreur lors du transfert des informations"
  
  # Ajouter l'application à la base de données
  info "Ajout de l'application à la base de données..."
  ssh -p "$PORT" "$SERVER" "cd $REMOTE_DIR && node $REMOTE_MONGODB_SCRIPTS_DIR/add-app.js --file ~/app-$app_name.json && rm ~/app-$app_name.json"
  check_status "Application ajoutée avec succès" "Erreur lors de l'ajout de l'application"
  
  # Nettoyer
  rm "$temp_json"
  rm -f "app-$app_name.tar.gz"
  
  success "Application $app_name ajoutée avec succès"
}

# Fonction pour générer automatiquement une application
auto_register_app() {
  app_name=$1
  
  if [ -z "$app_name" ]; then
    error "Nom de l'application non spécifié"
    return 1
  fi
  
  app_dir="$APPS_DIR/$app_name"
  
  if [ ! -d "$app_dir" ]; then
    error "L'application $app_name n'existe pas"
    return 1
  fi
  
  info "Enregistrement automatique de l'application $app_name..."
  
  # Créer un tarball de l'application
  info "Création de l'archive de l'application..."
  cd "$APPS_DIR" || exit
  tar -czf "$PROJECT_ROOT/app-$app_name.tar.gz" "$app_name"
  check_status "Archive de l'application créée avec succès" "Erreur lors de la création de l'archive de l'application"
  cd "$PROJECT_ROOT" || exit
  
  # Transférer l'application sur le serveur distant
  info "Transfert de l'application vers le serveur distant..."
  scp -P "$PORT" "app-$app_name.tar.gz" "$SERVER:~/"
  check_status "Application transférée avec succès" "Erreur lors du transfert de l'application"
  
  # Extraire l'application sur le serveur distant
  info "Extraction de l'application sur le serveur distant..."
  ssh -p "$PORT" "$SERVER" "mkdir -p $REMOTE_DIR/apps && \
                           tar -xzf ~/app-$app_name.tar.gz -C $REMOTE_DIR/apps && \
                           rm ~/app-$app_name.tar.gz"
  check_status "Application extraite avec succès sur le serveur distant" "Erreur lors de l'extraction de l'application sur le serveur distant"
  
  # Enregistrer automatiquement l'application sur le serveur distant
  info "Enregistrement automatique de l'application sur le serveur distant..."
  ssh -p "$PORT" "$SERVER" "cd $REMOTE_DIR && \
                           node $REMOTE_MONGODB_SCRIPTS_DIR/app-templates.js extract --dir $REMOTE_DIR/apps/$app_name --output ~/app-$app_name.json && \
                           node $REMOTE_MONGODB_SCRIPTS_DIR/add-app.js --file ~/app-$app_name.json && \
                           rm ~/app-$app_name.json"
  check_status "Application enregistrée avec succès" "Erreur lors de l'enregistrement de l'application"
  
  # Nettoyer
  rm -f "app-$app_name.tar.gz"
  
  success "Application $app_name enregistrée avec succès"
}

# Fonction pour enregistrer une application à partir d'un template
register_app_from_template() {
  app_name=$1
  template_name=$2
  
  if [ -z "$app_name" ]; then
    error "Nom de l'application non spécifié"
    return 1
  fi
  
  if [ -z "$template_name" ]; then
    template_name="basic"
    info "Aucun template spécifié, utilisation du template par défaut: basic"
  fi
  
  app_dir="$APPS_DIR/$app_name"
  
  if [ ! -d "$app_dir" ]; then
    error "L'application $app_name n'existe pas"
    return 1
  fi
  
  info "Enregistrement de l'application $app_name à partir du template $template_name..."
  
  # Créer un tarball de l'application
  info "Création de l'archive de l'application..."
  cd "$APPS_DIR" || exit
  tar -czf "$PROJECT_ROOT/app-$app_name.tar.gz" "$app_name"
  check_status "Archive de l'application créée avec succès" "Erreur lors de la création de l'archive de l'application"
  cd "$PROJECT_ROOT" || exit
  
  # Transférer l'application sur le serveur distant
  info "Transfert de l'application vers le serveur distant..."
  scp -P "$PORT" "app-$app_name.tar.gz" "$SERVER:~/"
  check_status "Application transférée avec succès" "Erreur lors du transfert de l'application"
  
  # Extraire l'application sur le serveur distant
  info "Extraction de l'application sur le serveur distant..."
  ssh -p "$PORT" "$SERVER" "mkdir -p $REMOTE_DIR/apps && \
                           tar -xzf ~/app-$app_name.tar.gz -C $REMOTE_DIR/apps && \
                           rm ~/app-$app_name.tar.gz"
  check_status "Application extraite avec succès sur le serveur distant" "Erreur lors de l'extraction de l'application sur le serveur distant"
  
  # Enregistrer l'application à partir d'un template sur le serveur distant
  info "Enregistrement de l'application à partir du template $template_name sur le serveur distant..."
  ssh -p "$PORT" "$SERVER" "cd $REMOTE_DIR && \
                           node $REMOTE_MONGODB_SCRIPTS_DIR/app-templates.js generate --template $template_name --name $app_name --output ~/app-$app_name.json && \
                           node $REMOTE_MONGODB_SCRIPTS_DIR/add-app.js --file ~/app-$app_name.json && \
                           rm ~/app-$app_name.json"
  check_status "Application enregistrée avec succès" "Erreur lors de l'enregistrement de l'application"
  
  # Nettoyer
  rm -f "app-$app_name.tar.gz"
  
  success "Application $app_name enregistrée avec succès à partir du template $template_name"
}

# Fonction pour lister les applications
list_apps() {
  info "Liste des applications..."
  
  # Construire les options
  options=""
  
  if [ -n "$1" ]; then
    options="--category $1"
  fi
  
  if [ -n "$2" ]; then
    options="$options --active $2"
  fi
  
  if [ -n "$3" ]; then
    options="$options --featured $3"
  fi
  
  if [ -n "$4" ]; then
    options="$options --format $4"
  fi
  
  # Exécuter le script de gestion des applications sur le serveur distant
  ssh -p "$PORT" "$SERVER" "cd $REMOTE_DIR && node $REMOTE_MONGODB_SCRIPTS_DIR/manage-apps.js list $options"
  
  # Vérifier le statut de l'exécution
  if [ $? -eq 0 ]; then
    success "Liste des applications récupérée avec succès"
  else
    error "Erreur lors de la récupération de la liste des applications"
    return 1
  fi
}

# Fonction pour supprimer une application
remove_app() {
  app_id=$1
  app_slug=$2
  
  if [ -z "$app_id" ] && [ -z "$app_slug" ]; then
    error "ID ou slug de l'application non spécifié"
    return 1
  fi
  
  info "Suppression de l'application..."
  
  # Construire les options
  options=""
  
  if [ -n "$app_id" ]; then
    options="--id $app_id"
  else
    options="--slug $app_slug"
  fi
  
  # Exécuter le script de gestion des applications sur le serveur distant
  ssh -p "$PORT" "$SERVER" "cd $REMOTE_DIR && node $REMOTE_MONGODB_SCRIPTS_DIR/manage-apps.js remove $options"
  
  # Vérifier le statut de l'exécution
  if [ $? -eq 0 ]; then
    success "Application supprimée avec succès"
  else
    error "Erreur lors de la suppression de l'application"
    return 1
  fi
}

# Fonction pour activer/désactiver une application
toggle_app_status() {
  app_id=$1
  app_slug=$2
  active=$3
  
  if [ -z "$app_id" ] && [ -z "$app_slug" ]; then
    error "ID ou slug de l'application non spécifié"
    return 1
  fi
  
  if [ -z "$active" ]; then
    error "Statut actif non spécifié"
    return 1
  fi
  
  info "Modification du statut de l'application..."
  
  # Construire les options
  options="--active $active"
  
  if [ -n "$app_id" ]; then
    options="$options --id $app_id"
  else
    options="$options --slug $app_slug"
  fi
  
  # Exécuter le script de gestion des applications sur le serveur distant
  ssh -p "$PORT" "$SERVER" "cd $REMOTE_DIR && node $REMOTE_MONGODB_SCRIPTS_DIR/manage-apps.js toggle-status $options"
  
  # Vérifier le statut de l'exécution
  if [ $? -eq 0 ]; then
    success "Statut de l'application modifié avec succès"
  else
    error "Erreur lors de la modification du statut de l'application"
    return 1
  fi
}

# Fonction pour mettre en avant une application
toggle_app_featured() {
  app_id=$1
  app_slug=$2
  featured=$3
  
  if [ -z "$app_id" ] && [ -z "$app_slug" ]; then
    error "ID ou slug de l'application non spécifié"
    return 1
  fi
  
  if [ -z "$featured" ]; then
    error "Mise en avant non spécifiée"
    return 1
  fi
  
  info "Modification de la mise en avant de l'application..."
  
  # Construire les options
  options="--featured $featured"
  
  if [ -n "$app_id" ]; then
    options="$options --id $app_id"
  else
    options="$options --slug $app_slug"
  fi
  
  # Exécuter le script de gestion des applications sur le serveur distant
  ssh -p "$PORT" "$SERVER" "cd $REMOTE_DIR && node $REMOTE_MONGODB_SCRIPTS_DIR/manage-apps.js toggle-featured $options"
  
  # Vérifier le statut de l'exécution
  if [ $? -eq 0 ]; then
    success "Mise en avant de l'application modifiée avec succès"
  else
    error "Erreur lors de la modification de la mise en avant de l'application"
    return 1
  fi
}

# Fonction pour afficher l'aide
show_help() {
  echo -e "${BLUE}=== Script de gestion des applications de la Marketplace Web ===${NC}"
  echo ""
  echo "Usage: $0 <command> [options]"
  echo ""
  echo "Commands:"
  echo "  init-mongodb                  Initialiser MongoDB"
  echo "  add-app-interactive <app>     Ajouter une application de manière interactive"
  echo "  auto-register-app <app>       Générer automatiquement une application"
  echo "  register-app-from-template <app> [template]  Utiliser un template prédéfini"
  echo "  list-apps [category] [active] [featured] [format]  Lister les applications"
  echo "  remove-app <id|slug>          Supprimer une application"
  echo "  toggle-status <id|slug> <true|false>  Activer/désactiver une application"
  echo "  toggle-featured <id|slug> <true|false>  Mettre en avant une application"
  echo "  help                          Afficher cette aide"
  echo ""
  echo "Examples:"
  echo "  $0 init-mongodb"
  echo "  $0 add-app-interactive notepad"
  echo "  $0 auto-register-app transkryptor"
  echo "  $0 register-app-from-template notepad basic"
  echo "  $0 list-apps"
  echo "  $0 list-apps outils true false"
  echo "  $0 remove-app notepad"
  echo "  $0 toggle-status notepad false"
  echo "  $0 toggle-featured 5f8a3b2c1d9e8f7a6b5c4d3e true"
  echo ""
}

# Menu principal
show_menu() {
  echo -e "${BLUE}=== Script de gestion des applications de la Marketplace Web ===${NC}"
  echo "1. Initialiser MongoDB"
  echo "2. Ajouter une application de manière interactive"
  echo "3. Générer automatiquement une application"
  echo "4. Utiliser un template prédéfini"
  echo "5. Lister les applications"
  echo "6. Supprimer une application"
  echo "7. Activer/désactiver une application"
  echo "8. Mettre en avant une application"
  echo "9. Quitter"
  echo -n "Votre choix: "
  read -r choice
  
  case $choice in
    1) init_mongodb ;;
    2)
      echo -n "Nom de l'application à ajouter: "
      read -r app_name
      add_app_interactive "$app_name"
      ;;
    3)
      echo -n "Nom de l'application à générer: "
      read -r app_name
      auto_register_app "$app_name"
      ;;
    4)
      echo -n "Nom de l'application: "
      read -r app_name
      echo -n "Nom du template (basic, spa, api) [basic]: "
      read -r template_name
      template_name=${template_name:-basic}
      register_app_from_template "$app_name" "$template_name"
      ;;
    5)
      echo -n "Catégorie (laisser vide pour toutes): "
      read -r category
      echo -n "Actif (true/false, laisser vide pour toutes): "
      read -r active
      echo -n "En avant (true/false, laisser vide pour toutes): "
      read -r featured
      echo -n "Format (table/json) [table]: "
      read -r format
      format=${format:-table}
      list_apps "$category" "$active" "$featured" "$format"
      ;;
    6)
      echo -n "ID ou slug de l'application à supprimer: "
      read -r app_id_or_slug
      if [[ $app_id_or_slug =~ ^[0-9a-f]{24}$ ]]; then
        remove_app "$app_id_or_slug" ""
      else
        remove_app "" "$app_id_or_slug"
      fi
      ;;
    7)
      echo -n "ID ou slug de l'application: "
      read -r app_id_or_slug
      echo -n "Actif (true/false): "
      read -r active
      if [[ $app_id_or_slug =~ ^[0-9a-f]{24}$ ]]; then
        toggle_app_status "$app_id_or_slug" "" "$active"
      else
        toggle_app_status "" "$app_id_or_slug" "$active"
      fi
      ;;
    8)
      echo -n "ID ou slug de l'application: "
      read -r app_id_or_slug
      echo -n "En avant (true/false): "
      read -r featured
      if [[ $app_id_or_slug =~ ^[0-9a-f]{24}$ ]]; then
        toggle_app_featured "$app_id_or_slug" "" "$featured"
      else
        toggle_app_featured "" "$app_id_or_slug" "$featured"
      fi
      ;;
    9) exit 0 ;;
    *) error "Choix invalide" ;;
  esac
  
  echo ""
  show_menu
}

# Vérifier si les scripts MongoDB sont disponibles
check_mongodb_scripts

# Vérifier si le script est exécuté avec des arguments
if [ $# -gt 0 ]; then
  case $1 in
    init-mongodb) init_mongodb ;;
    add-app-interactive)
      if [ -z "$2" ]; then
        error "Nom de l'application non spécifié"
        exit 1
      fi
      add_app_interactive "$2"
      ;;
    auto-register-app)
      if [ -z "$2" ]; then
        error "Nom de l'application non spécifié"
        exit 1
      fi
      auto_register_app "$2"
      ;;
    register-app-from-template)
      if [ -z "$2" ]; then
        error "Nom de l'application non spécifié"
        exit 1
      fi
      register_app_from_template "$2" "$3"
      ;;
    list-apps)
      list_apps "$2" "$3" "$4" "$5"
      ;;
    remove-app)
      if [ -z "$2" ]; then
        error "ID ou slug de l'application non spécifié"
        exit 1
      fi
      if [[ $2 =~ ^[0-9a-f]{24}$ ]]; then
        remove_app "$2" ""
      else
        remove_app "" "$2"
      fi
      ;;
    toggle-status)
      if [ -z "$2" ]; then
        error "ID ou slug de l'application non spécifié"
        exit 1
      fi
      if [ -z "$3" ]; then
        error "Statut actif non spécifié"
        exit 1
      fi
      if [[ $2 =~ ^[0-9a-f]{24}$ ]]; then
        toggle_app_status "$2" "" "$3"
      else
        toggle_app_status "" "$2" "$3"
      fi
      ;;
    toggle-featured)
      if [ -z "$2" ]; then
        error "ID ou slug de l'application non spécifié"
        exit 1
      fi
      if [ -z "$3" ]; then
        error "Mise en avant non spécifiée"
        exit 1
      fi
      if [[ $2 =~ ^[0-9a-f]{24}$ ]]; then
        toggle_app_featured "$2" "" "$3"
      else
        toggle_app_featured "" "$2" "$3"
      fi
      ;;
    help|--help|-h)
      show_help
      ;;
    *)
      error "Commande inconnue: $1"
      show_help
      exit 1
      ;;
  esac
else
  # Afficher le menu interactif
  show_menu
fi
