# NotePad

Une application de prise de notes intégrée à la Marketplace.

## Fonctionnalités

- **Création et gestion de notes** : Créez, modifiez et supprimez facilement vos notes.
- **Formatage de texte riche** : Mettez en forme votre texte avec des options de formatage avancées.
- **Organisation par tags** : Ajoutez des tags à vos notes pour les retrouver facilement.
- **Recherche instantanée** : Recherchez rapidement dans toutes vos notes.
- **Sauvegarde automatique** : Vos notes sont automatiquement sauvegardées pendant que vous écrivez.
- **Exportation des notes** : Exportez toutes vos notes au format JSON.
- **Authentification partagée** : Utilisez votre compte Marketplace pour accéder à vos notes.
- **Interface responsive** : Utilisez NotePad sur tous vos appareils.

## Options de formatage

NotePad propose plusieurs options de formatage pour vos notes :

- **Texte** : Gras, italique, souligné
- **Titres** : H1, H2, H3
- **Listes** : Listes à puces, listes numérotées
- **Liens** : Insérez des liens vers des sites web
- **Images** : Ajoutez des images à vos notes
- **Code** : Insérez des blocs de code
- **Citations** : Mettez en évidence des citations

## Intégration avec la Marketplace

NotePad est intégré à la Marketplace et utilise les modules partagés suivants :

- **Authentification** : Utilise le système d'authentification de la Marketplace.
- **Notifications** : Affiche des notifications cohérentes avec le style de la Marketplace.
- **Navigation** : Utilise la barre de navigation commune à toutes les applications.
- **Styles** : Utilise les styles partagés pour une expérience utilisateur cohérente.

## Stockage des données

Les notes sont stockées localement dans le navigateur de l'utilisateur à l'aide du localStorage. Chaque utilisateur a accès uniquement à ses propres notes, qui sont liées à son compte Marketplace.

## Prérequis

- Node.js 18.x ou supérieur
- npm 9.x ou supérieur

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/marketplace/notepad.git
   cd notepad
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Démarrez le serveur :
   ```bash
   npm start
   ```

4. Accédez à l'application dans votre navigateur :
   ```
   http://localhost:3003
   ```

## Développement

Pour démarrer le serveur en mode développement avec rechargement automatique :

```bash
npm run dev
```

## Structure du projet

```
notepad/
├── public/               # Fichiers statiques
│   ├── css/              # Styles CSS
│   │   └── styles.css    # Styles spécifiques à NotePad
│   ├── js/               # Scripts JavaScript
│   │   └── app.js        # Application principale
│   ├── images/           # Images et icônes
│   └── index.html        # Page HTML principale
├── server.js             # Serveur Express
├── package.json          # Configuration npm
└── README.md             # Documentation
```

## Déploiement

L'application peut être déployée sur n'importe quel serveur prenant en charge Node.js. Pour déployer sur la Marketplace, utilisez le script de déploiement fourni :

```bash
./scripts/deploy.sh app notepad
```

## Licence

MIT
