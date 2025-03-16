# Guide de gestion des applications pour la Marketplace

Ce document explique comment initialiser la base de données MongoDB et gérer les applications de la Marketplace Web.

## Table des matières

- [Guide de gestion des applications pour la Marketplace](#guide-de-gestion-des-applications-pour-la-marketplace)
  - [Table des matières](#table-des-matières)
  - [Initialisation de MongoDB](#initialisation-de-mongodb)
    - [Utilisation du script de gestion des applications](#utilisation-du-script-de-gestion-des-applications)
    - [Utilisation directe du script d'initialisation](#utilisation-directe-du-script-dinitialisation)
    - [Données créées lors de l'initialisation](#données-créées-lors-de-linitialisation)
  - [Ajout d'applications](#ajout-dapplications)
    - [Méthode interactive](#méthode-interactive)
    - [Méthode automatique](#méthode-automatique)
    - [Utilisation de templates](#utilisation-de-templates)
  - [Gestion des applications](#gestion-des-applications)
    - [Lister les applications](#lister-les-applications)
    - [Supprimer une application](#supprimer-une-application)
    - [Activer/désactiver une application](#activerdésactiver-une-application)
    - [Mettre en avant une application](#mettre-en-avant-une-application)
  - [Exemples concrets](#exemples-concrets)
    - [Exemple avec NotePad](#exemple-avec-notepad)
    - [Exemple avec Transkryptor](#exemple-avec-transkryptor)
  - [Référence des commandes](#référence-des-commandes)
  - [Dépannage](#dépannage)
    - [Problèmes de connexion à MongoDB](#problèmes-de-connexion-à-mongodb)
    - [Erreurs lors de l'ajout d'applications](#erreurs-lors-de-lajout-dapplications)
    - [Problèmes avec les scripts](#problèmes-avec-les-scripts)
    - [Journaux d'erreur](#journaux-derreur)

## Initialisation de MongoDB

Avant de pouvoir ajouter des applications à la Marketplace, vous devez initialiser la base de données MongoDB. Cette opération crée les collections nécessaires, ajoute un compte administrateur et des catégories de base, et installe l'application NotePad comme application de démonstration.

### Utilisation du script de gestion des applications

```bash
./scripts/manage-apps.sh init-mongodb
```

Le script vous guidera à travers le processus d'initialisation :

1. Il vérifiera si la base de données est déjà initialisée
2. Si c'est le cas, il vous proposera trois options :
   - Annuler l'opération
   - Réinitialiser complètement la base de données (supprime toutes les données)
   - Ajouter uniquement les données manquantes (préserve les données existantes)
3. Si vous continuez, il vous demandera les informations d'identification de l'administrateur
4. Il exécutera le script d'initialisation avec les paramètres appropriés

### Utilisation directe du script d'initialisation

Vous pouvez également exécuter directement le script d'initialisation :

```bash
node docs/mongodb/init-mongodb.js [options]
```

Options disponibles :
- `--admin-email <email>` : Email de l'administrateur (défaut: admin@marketplace.com)
- `--admin-password <pwd>` : Mot de passe de l'administrateur (défaut: admin123)
- `--force` : Forcer la réinitialisation même si déjà initialisée
- `--add-missing` : Ajouter uniquement les données manquantes
- `--mongodb-uri <uri>` : URI de connexion MongoDB (défaut: mongodb://localhost:27017/marketplace)
- `--help` : Afficher l'aide

### Données créées lors de l'initialisation

L'initialisation crée les éléments suivants :

1. **Collections** :
   - `users` : Pour stocker les utilisateurs
   - `categories` : Pour stocker les catégories d'applications
   - `apps` : Pour stocker les applications

2. **Compte administrateur** :
   - Email : celui spécifié (défaut: admin@marketplace.com)
   - Mot de passe : celui spécifié (défaut: admin123)
   - Rôle : admin

3. **Catégories de base** :
   - Productivité : Applications pour améliorer votre productivité et votre organisation
   - Outils : Outils utilitaires pour diverses tâches

4. **Application de démonstration** :
   - NotePad : Éditeur de notes simple et efficace

## Ajout d'applications

Il existe plusieurs méthodes pour ajouter une application à la Marketplace, en fonction de vos besoins et de votre niveau de confort avec les outils en ligne de commande.

### Méthode interactive

La méthode interactive vous guide à travers le processus d'ajout d'une application en vous posant des questions sur les différentes caractéristiques de l'application.

```bash
./scripts/manage-apps.sh add-app-interactive <nom_application>
```

Le script :
1. Extrait automatiquement les informations de base à partir du dossier de l'application
2. Vous demande de compléter ou modifier ces informations
3. Crée un fichier JSON temporaire avec ces informations
4. Ajoute l'application à la base de données

Cette méthode est recommandée pour les utilisateurs qui souhaitent un contrôle précis sur les informations de l'application sans avoir à manipuler directement des fichiers JSON.

### Méthode automatique

La méthode automatique extrait toutes les informations nécessaires à partir du dossier de l'application et les utilise pour créer l'entrée dans la base de données.

```bash
./scripts/manage-apps.sh auto-register-app <nom_application>
```

Le script :
1. Extrait automatiquement les informations à partir du dossier de l'application
2. Crée un fichier JSON temporaire avec ces informations
3. Ajoute l'application à la base de données sans intervention de l'utilisateur

Cette méthode est recommandée pour les applications bien documentées avec un fichier `package.json` et un `README.md` complets.

### Utilisation de templates

Cette méthode utilise des modèles prédéfinis pour créer l'entrée dans la base de données.

```bash
./scripts/manage-apps.sh register-app-from-template <nom_application> [template]
```

Templates disponibles :
- `basic` : Template pour une application basique (défaut)
- `spa` : Template pour une Single Page Application
- `api` : Template pour une application avec API

Le script :
1. Génère un fichier JSON à partir du template spécifié
2. Remplace les valeurs génériques par des valeurs spécifiques à l'application
3. Ajoute l'application à la base de données

Cette méthode est recommandée pour les nouvelles applications qui correspondent à l'un des modèles prédéfinis.

## Gestion des applications

Une fois les applications ajoutées à la Marketplace, vous pouvez les gérer à l'aide des commandes suivantes.

### Lister les applications

Pour afficher la liste des applications enregistrées dans la base de données :

```bash
./scripts/manage-apps.sh list-apps [category] [active] [featured] [format]
```

Paramètres optionnels :
- `category` : Filtrer par catégorie (ex: outils, productivite)
- `active` : Filtrer par statut actif (true/false)
- `featured` : Filtrer par mise en avant (true/false)
- `format` : Format de sortie (table/json, défaut: table)

Exemples :
```bash
# Lister toutes les applications
./scripts/manage-apps.sh list-apps

# Lister les applications actives de la catégorie Outils
./scripts/manage-apps.sh list-apps outils true

# Lister les applications mises en avant au format JSON
./scripts/manage-apps.sh list-apps "" "" true json
```

### Supprimer une application

Pour supprimer une application de la base de données :

```bash
./scripts/manage-apps.sh remove-app <id|slug>
```

Paramètres :
- `id|slug` : ID ou slug de l'application à supprimer

Exemples :
```bash
# Supprimer l'application NotePad par son slug
./scripts/manage-apps.sh remove-app notepad

# Supprimer une application par son ID
./scripts/manage-apps.sh remove-app 5f8a3b2c1d9e8f7a6b5c4d3e
```

### Activer/désactiver une application

Pour activer ou désactiver une application :

```bash
./scripts/manage-apps.sh toggle-status <id|slug> <true|false>
```

Paramètres :
- `id|slug` : ID ou slug de l'application
- `true|false` : Statut actif (true pour activer, false pour désactiver)

Exemples :
```bash
# Désactiver l'application NotePad
./scripts/manage-apps.sh toggle-status notepad false

# Activer une application par son ID
./scripts/manage-apps.sh toggle-status 5f8a3b2c1d9e8f7a6b5c4d3e true
```

### Mettre en avant une application

Pour mettre en avant une application ou retirer sa mise en avant :

```bash
./scripts/manage-apps.sh toggle-featured <id|slug> <true|false>
```

Paramètres :
- `id|slug` : ID ou slug de l'application
- `true|false` : Mise en avant (true pour mettre en avant, false pour retirer)

Exemples :
```bash
# Mettre en avant l'application NotePad
./scripts/manage-apps.sh toggle-featured notepad true

# Retirer la mise en avant d'une application par son ID
./scripts/manage-apps.sh toggle-featured 5f8a3b2c1d9e8f7a6b5c4d3e false
```

## Exemples concrets

### Exemple avec NotePad

NotePad est une application simple de prise de notes qui est installée par défaut lors de l'initialisation de la base de données. Voici comment vous pourriez la gérer :

```bash
# Lister les détails de NotePad
./scripts/manage-apps.sh list-apps outils

# Mettre NotePad en avant
./scripts/manage-apps.sh toggle-featured notepad true

# Mettre à jour NotePad (si vous avez modifié l'application)
./scripts/manage-apps.sh add-app-interactive notepad
```

### Exemple avec Transkryptor

Transkryptor est une application plus complexe qui permet de transcrire et d'analyser des fichiers audio. Voici comment vous pourriez l'ajouter à la Marketplace :

```bash
# Ajouter Transkryptor de manière interactive
./scripts/manage-apps.sh add-app-interactive transkryptor

# Ou l'ajouter automatiquement
./scripts/manage-apps.sh auto-register-app transkryptor

# Vérifier que Transkryptor a été ajouté correctement
./scripts/manage-apps.sh list-apps

# Mettre Transkryptor en avant
./scripts/manage-apps.sh toggle-featured transkryptor true
```

## Référence des commandes

Voici un résumé de toutes les commandes disponibles dans le script de gestion des applications :

| Commande | Description | Paramètres |
|----------|-------------|------------|
| `init-mongodb` | Initialiser MongoDB | - |
| `add-app-interactive` | Ajouter une application de manière interactive | `<app>` |
| `auto-register-app` | Générer automatiquement une application | `<app>` |
| `register-app-from-template` | Utiliser un template prédéfini | `<app> [template]` |
| `list-apps` | Lister les applications | `[category] [active] [featured] [format]` |
| `remove-app` | Supprimer une application | `<id\|slug>` |
| `toggle-status` | Activer/désactiver une application | `<id\|slug> <true\|false>` |
| `toggle-featured` | Mettre en avant une application | `<id\|slug> <true\|false>` |
| `help` | Afficher l'aide | - |

Vous pouvez également exécuter le script sans arguments pour afficher un menu interactif :

```bash
./scripts/manage-apps.sh
```

## Dépannage

### Problèmes de connexion à MongoDB

Si vous rencontrez des problèmes de connexion à MongoDB, vérifiez les points suivants :

1. **MongoDB est-il en cours d'exécution ?**
   ```bash
   sudo systemctl status mongodb
   # ou
   sudo service mongodb status
   ```

2. **L'URI de connexion est-il correct ?**
   Par défaut, le script utilise `mongodb://localhost:27017/marketplace`. Si votre configuration est différente, vous pouvez spécifier l'URI de connexion :
   ```bash
   node docs/mongodb/init-mongodb.js --mongodb-uri="mongodb://user:password@host:port/database"
   ```

3. **Les permissions sont-elles correctes ?**
   Assurez-vous que l'utilisateur MongoDB a les permissions nécessaires pour créer des collections et des documents.

### Erreurs lors de l'ajout d'applications

Si vous rencontrez des erreurs lors de l'ajout d'applications, vérifiez les points suivants :

1. **Le dossier de l'application existe-t-il ?**
   Vérifiez que le dossier de l'application existe dans le répertoire `apps/`.

2. **Les informations extraites sont-elles correctes ?**
   Vous pouvez vérifier les informations extraites en examinant le fichier JSON temporaire créé dans `/tmp/app-<nom_application>.json`.

3. **La catégorie spécifiée existe-t-elle ?**
   Assurez-vous que la catégorie spécifiée existe dans la base de données. Par défaut, seules les catégories "Productivité" (slug: productivite) et "Outils" (slug: outils) sont créées.

4. **Le slug est-il unique ?**
   Assurez-vous que le slug de l'application est unique. Si une autre application utilise déjà le même slug, l'ajout échouera.

### Problèmes avec les scripts

Si vous rencontrez des problèmes avec les scripts, vérifiez les points suivants :

1. **Les scripts sont-ils exécutables ?**
   ```bash
   chmod +x scripts/manage-apps.sh
   chmod +x docs/mongodb/init-mongodb.js
   chmod +x docs/mongodb/add-app.js
   chmod +x docs/mongodb/app-templates.js
   chmod +x docs/mongodb/manage-apps.js
   ```

2. **Les dépendances Node.js sont-elles installées ?**
   ```bash
   cd market/backend
   npm install
   ```

3. **Les chemins sont-ils corrects ?**
   Les scripts supposent que vous les exécutez depuis la racine du projet. Si ce n'est pas le cas, les chemins relatifs peuvent être incorrects.

### Journaux d'erreur

En cas d'erreur, les scripts créent des fichiers de journal qui peuvent vous aider à diagnostiquer les problèmes :

- `mongodb-init.log` : Journal d'initialisation de MongoDB
- Les erreurs sont également affichées dans la console

Si vous avez besoin d'aide supplémentaire, n'hésitez pas à consulter la documentation de MongoDB ou à contacter l'équipe de développement.
