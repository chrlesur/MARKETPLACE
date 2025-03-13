# Installation et configuration de MongoDB pour la Marketplace Web

Ce document explique comment installer et configurer MongoDB pour la Marketplace Web sur un serveur RedHat/CentOS 9.x.

## Prérequis

- Un serveur RedHat/CentOS 9.x
- Accès root ou sudo
- Connexion Internet pour télécharger les paquets

## Installation automatique

Un script d'installation automatique est fourni pour faciliter l'installation et la configuration de MongoDB. Ce script effectue les opérations suivantes :

1. Ajout du référentiel MongoDB
2. Installation de MongoDB 7.0.x
3. Configuration de MongoDB
4. Démarrage et activation du service MongoDB
5. Création des collections pour la marketplace
6. Configuration du service marketplace-api pour utiliser MongoDB

### Utilisation du script

1. Connectez-vous au serveur en SSH
2. Copiez le script `install_mongodb.sh` sur le serveur
3. Rendez le script exécutable : `chmod +x install_mongodb.sh`
4. Exécutez le script en tant que root ou avec sudo : `sudo ./install_mongodb.sh`

## Installation manuelle

Si vous préférez installer MongoDB manuellement, suivez les étapes ci-dessous.

### 1. Ajout du référentiel MongoDB

Créez le fichier `/etc/yum.repos.d/mongodb-org-7.0.repo` avec le contenu suivant :

```
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
```

### 2. Installation de MongoDB

```bash
sudo dnf clean all
sudo dnf makecache
sudo dnf install -y mongodb-org
```

### 3. Configuration de MongoDB

La configuration par défaut de MongoDB est généralement suffisante pour la Marketplace Web. Le fichier de configuration se trouve à `/etc/mongod.conf`.

Si vous souhaitez modifier la configuration, voici un exemple de configuration minimale :

```yaml
# mongod.conf

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
```

### 4. Démarrage et activation de MongoDB

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 5. Vérification de l'installation

```bash
sudo systemctl status mongod
mongosh --eval 'db.version()'
```

### 6. Création des collections pour la marketplace

```bash
mongosh --eval 'use marketplace; db.createCollection("apps"); db.createCollection("categories"); db.createCollection("users");'
```

### 7. Configuration du service marketplace-api

Pour que le service marketplace-api utilise MongoDB, vous devez définir la variable d'environnement `MONGODB_URI` :

```bash
pm2 stop marketplace-api
MONGODB_URI="mongodb://localhost:27017/marketplace" pm2 start /var/www/marketplace/backend/server.js --name marketplace-api
pm2 save
```

## Intégration avec le script de déploiement

Pour intégrer l'installation de MongoDB au script de déploiement, vous pouvez ajouter une nouvelle fonction `deploy_mongodb` dans le fichier `scripts/deploy.sh` :

```bash
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
```

Puis, ajoutez une nouvelle option dans la section `case` du script :

```bash
mongodb) deploy_mongodb ;;
```

Vous pourrez alors déployer MongoDB en exécutant :

```bash
./scripts/deploy.sh mongodb
```

## Sécurité

Par défaut, MongoDB est configuré pour écouter uniquement sur l'interface localhost (127.0.0.1), ce qui est suffisant pour la Marketplace Web puisque le backend s'exécute sur le même serveur.

Si vous avez besoin d'accéder à MongoDB depuis d'autres serveurs, vous devrez modifier la configuration pour autoriser les connexions distantes et mettre en place une authentification.

## Sauvegarde et restauration

### Sauvegarde

Pour sauvegarder la base de données marketplace :

```bash
mongodump --db marketplace --out /chemin/vers/dossier/sauvegarde
```

### Restauration

Pour restaurer la base de données marketplace :

```bash
mongorestore --db marketplace /chemin/vers/dossier/sauvegarde/marketplace
```

## Dépannage

### MongoDB ne démarre pas

Vérifiez les logs de MongoDB :

```bash
sudo cat /var/log/mongodb/mongod.log
```

### Problèmes de connexion

Vérifiez que MongoDB est en cours d'exécution :

```bash
sudo systemctl status mongod
```

Vérifiez que vous pouvez vous connecter à MongoDB :

```bash
mongosh --eval 'db.version()'
```

### Problèmes de permissions

Vérifiez les permissions du répertoire de données :

```bash
ls -la /var/lib/mongo
```

Si nécessaire, corrigez les permissions :

```bash
sudo chown -R mongod:mongod /var/lib/mongo
sudo chmod 755 /var/lib/mongo
```

## Ressources

- [Documentation officielle de MongoDB](https://docs.mongodb.com/)
- [Guide d'installation de MongoDB sur RHEL](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-red-hat/)
- [Guide de sécurité de MongoDB](https://www.mongodb.com/docs/manual/security/)
