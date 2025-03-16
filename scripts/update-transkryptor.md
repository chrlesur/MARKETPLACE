# Documentation du script update-transkryptor.sh

Ce document décrit les modifications apportées par le script `update-transkryptor.sh` pour intégrer l'application Transkryptor dans la marketplace.

## Objectif du script

Le script `update-transkryptor.sh` est conçu pour être exécuté après chaque mise à jour (git pull) de l'application Transkryptor. Il applique automatiquement toutes les modifications nécessaires pour assurer la compatibilité de Transkryptor avec la marketplace.

## Modifications apportées

### 1. Création de fichiers d'override

Le script crée deux fichiers d'override s'ils n'existent pas déjà :

#### 1.1. CSS d'override (`marketplace-overrides.css`)

Ce fichier CSS corrige plusieurs problèmes de style :

- **Correction du body** : Permet le défilement, ajuste la hauteur, supprime les marges et le padding.
- **Amélioration des champs password** : Rend les champs de saisie des clés API visibles et correctement stylisés.
- **Amélioration des champs de sélection de fichier** : Applique une couleur noire au texte des champs de sélection de fichier et au nom du fichier sélectionné pour une meilleure lisibilité.
- **Correction du conteneur principal** : Ajuste la hauteur et le défilement.
- **Amélioration de la lisibilité des zones de texte** : Applique une couleur noire (#000000) au texte pour un contraste maximal, tout en conservant le fond d'origine.
- **Correction des zones de progression** : Améliore l'affichage des barres de progression.

#### 1.2. JavaScript d'override (`marketplace-overrides.js`)

Ce fichier JavaScript ajoute plusieurs fonctionnalités :

- **Correction de l'erreur h1 manquant** : Ajoute dynamiquement un élément h1 caché si nécessaire.
- **Boutons de visibilité pour les champs password** : Ajoute des boutons pour afficher/masquer les clés API.
- **Interception des erreurs** : Corrige la fonction `updateVersion` pour intercepter les erreurs potentielles.

### 2. Modification du fichier HTML

Le script modifie le fichier `index.html` pour inclure les fichiers d'override :

- Ajoute une référence au fichier CSS d'override dans la section `<head>`.
- Ajoute une référence au fichier JavaScript d'override avant la fermeture de la balise `<body>`.

### 3. Corrections directes de fichiers existants

#### 3.1. Correction de `config.js`

- **URLs des endpoints** : Modifie la fonction `getConfig()` pour qu'elle détecte si l'application est exécutée dans la marketplace et ajuste les URLs des endpoints en conséquence.
- **Erreur h1 manquant** : Remplace l'accès direct à `document.querySelector('h1').textContent` par une vérification conditionnelle plus robuste.

#### 3.2. Correction de `base.css`

- Remplace `overflow: hidden;` par `overflow: auto;` pour permettre le défilement.

#### 3.3. Correction de `transcriptionUtils.js`

- **Redirection des requêtes API** : Modifie la fonction `transcribeChunk()` pour qu'elle envoie les requêtes au serveur Transkryptor au lieu de les envoyer directement à l'API OpenAI.
- **Détection du contexte** : Ajoute une logique pour détecter si l'application est exécutée dans la marketplace et ajuste les URLs des endpoints en conséquence.
- **Transmission de la clé API** : Envoie la clé API au serveur plutôt que de l'utiliser directement dans le client.

#### 3.4. Modification de `server.js`

- **Ajout du middleware multer** : Ajoute le middleware multer pour gérer les fichiers multipart/form-data.
- **Ajout de la route `/transcribe`** : Ajoute une nouvelle route pour gérer les requêtes de transcription audio.
- **Proxy vers l'API OpenAI** : Configure le serveur pour qu'il transmette les requêtes à l'API OpenAI avec la clé API fournie par le client.

## Compatibilité

Le script est compatible avec macOS (BSD sed) et Linux (GNU sed) grâce à des conditions qui détectent le système d'exploitation et utilisent la syntaxe appropriée pour les commandes sed.

## Utilisation

Après chaque mise à jour de Transkryptor (git pull), exécutez simplement :

```bash
./scripts/update-transkryptor.sh
```

Puis déployez l'application :

```bash
./scripts/deploy.sh app transkryptor
```

## Configuration Nginx

En plus des modifications apportées par le script, la configuration Nginx a été mise à jour pour permettre le traitement de fichiers audio volumineux :

```nginx
# API de Transkryptor
location /transkryptor/api/ {
    # Correction : port 3000 au lieu de 3002 et strip du préfixe /api
    proxy_pass http://localhost:3000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Augmenter la taille maximale des requêtes pour les fichiers audio
    client_max_body_size 50M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
}
```

Ces modifications permettent :
- D'augmenter la taille maximale des requêtes à 50 Mo (`client_max_body_size 50M`)
- D'augmenter les délais d'attente pour les requêtes longues à 300 secondes

## Résultat

Après l'exécution du script et le déploiement de la configuration Nginx, l'application Transkryptor devrait fonctionner correctement dans la marketplace, avec :

- Des textes lisibles en noir sur le fond d'origine
- Des champs de saisie des clés API visibles et utilisables
- Une interface utilisateur cohérente avec la marketplace
- Une communication fonctionnelle avec le serveur backend
- Une gestion correcte de la transcription audio via le serveur, y compris pour les fichiers volumineux
