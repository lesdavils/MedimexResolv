# Medimex - Système de Gestion d'Interventions

Application complète de gestion d'interventions et maintenance médicale pour Medimex/Athlex.

## 🚀 Fonctionnalités

### 🔐 Sécurité & Authentification
- Authentification JWT sécurisée
- Gestion des rôles (Admin, Superviseur, Technicien, Référent, Constructeur)
- Hachage des mots de passe (bcrypt)
- Upload de photos de profil sécurisé
- Rate limiting et protection CSRF
- Logs de sécurité

### 📊 Gestion d'Interventions
- Fiches d'interventions digitalisées avec photos obligatoires
- Création automatique et manuelle de tickets
- Suivi complet par client/machine/intervention
- Planning et agenda intégrés
- Signature électronique pour validation des BL
- Gestion des pièces détachées avec codes-barres

### 💼 Administration
- Interface admin complète pour gestion des utilisateurs
- Tableaux de bord adaptatifs selon le rôle
- Rapports et statistiques avancés
- Gestion centralisée des clients et machines
- Système de notifications

## 🏗️ Architecture Technique

- **Backend**: Node.js + Express + MySQL
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Base de données**: MySQL 8.0 avec schémas optimisés
- **Sécurité**: JWT, bcrypt, helmet, rate limiting
- **Déploiement**: Docker + Nginx + systemd

## 📋 Prérequis

- Node.js 18+
- MySQL 8.0
- Nginx (pour production)
- Docker (optionnel)

## 🚀 Installation

### Méthode 1: Déploiement automatique Debian 12
```bash
# Clone du repository
git clone https://github.com/votre-username/medimex-interventions.git
cd medimex-interventions

# Déploiement automatique (en tant que root)
chmod +x scripts/deploy-debian.sh
sudo ./scripts/deploy-debian.sh
```

### Méthode 2: Docker Compose
```bash
# Configuration de l'environnement
cp .env.example .env
# Éditez .env avec vos paramètres

# Démarrage des services
docker-compose up -d

# Initialisation de la base de données
docker-compose exec medimex-backend npm run migrate
docker-compose exec medimex-backend npm run seed
```

### Méthode 3: Installation manuelle
```bash
# Configuration rapide
chmod +x scripts/setup.sh
./scripts/setup.sh

# Installation backend
cd backend
npm install
npm run migrate
npm run seed
npm start

# L'application sera disponible sur http://localhost:3000
```

## 🔑 Comptes par défaut

| Utilisateur | Mot de passe | Rôle |
|-------------|--------------|------|
| admin | admin123 | Administrateur |
| supervisor | super123 | Superviseur |
| technicien | tech123 | Technicien |

⚠️ **IMPORTANT**: Changez ces mots de passe en production !

## 📁 Structure du Projet

```
medimex-interventions/
├── backend/                 # API Node.js/Express
│   ├── controllers/         # Contrôleurs métier
│   ├── models/             # Modèles Sequelize
│   ├── routes/             # Routes API
│   ├── middleware/         # Middlewares personnalisés
│   ├── config/             # Configuration
│   ├── uploads/            # Fichiers uploadés
│   └── server.js           # Point d'entrée
├── frontend/               # Interface utilisateur
│   ├── assets/             # Assets statiques
│   ├── js/                 # JavaScript
│   └── index.html          # Page principale
├── database/               # Scripts SQL
│   ├── schema.sql          # Schéma de base
│   └── seeds.sql           # Données d'exemple
├── docker/                 # Configuration Docker
│   ├── Dockerfile          # Image backend
│   └── docker-compose.yml  # Stack complète
├── scripts/                # Scripts d'installation
│   ├── deploy-debian.sh    # Déploiement Debian 12
│   └── setup.sh            # Configuration dev
└── README.md               # Documentation
```

## 🔧 Configuration

### Variables d'environnement

Copiez `.env.example` vers `.env` et configurez:

```bash
# Base de données
DB_HOST=localhost
DB_USER=medimex
DB_PASSWORD=your_secure_password
DB_NAME=medimex_interventions

# Sécurité
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=8h

# Application
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://localhost:8080
```

### Configuration Nginx (Production)

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    
    location / {
        root /var/www/medimex;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 Base de Données

### Schéma Principal

- **users**: Utilisateurs avec rôles et permissions
- **clients**: Base clients avec informations complètes
- **machines**: Équipements médicaux par client
- **tickets**: Demandes d'intervention
- **interventions**: Détails des interventions réalisées
- **pieces_detachees**: Gestion du stock de pièces
- **mouvements_stock**: Historique des mouvements
- **security_logs**: Logs de sécurité

### Migrations

```bash
# Création des tables
npm run migrate

# Insertion des données d'exemple
npm run seed

# Reset complet (développement uniquement)
npm run reset
```

## 🛡️ Sécurité

### Mesures implémentées:
- ✅ Hachage des mots de passe (bcrypt)
- ✅ Tokens JWT avec expiration
- ✅ Validation des données (Joi)
- ✅ Protection CSRF
- ✅ Rate limiting
- ✅ Upload de fichiers sécurisé
- ✅ Logs de sécurité complets
- ✅ Headers de sécurité (helmet)

### Recommandations production:
- Utilisez HTTPS uniquement
- Configurez un firewall
- Surveillez les logs
- Effectuez des sauvegardes régulières
- Mettez à jour les dépendances

## 📱 API Endpoints

### Authentification
```
POST /api/auth/login      # Connexion
POST /api/auth/logout     # Déconnexion
GET  /api/auth/profile    # Profil utilisateur
```

### Utilisateurs
```
GET    /api/users         # Liste des utilisateurs
POST   /api/users         # Créer utilisateur
PUT    /api/users/:id     # Modifier utilisateur
DELETE /api/users/:id     # Supprimer utilisateur
```

### Tickets
```
GET    /api/tickets       # Liste des tickets
POST   /api/tickets       # Créer ticket
PUT    /api/tickets/:id   # Modifier ticket
GET    /api/tickets/:id   # Détails ticket
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Coverage
npm run test:coverage
```

## 📈 Monitoring

### Logs
```bash
# Logs application
journalctl -u medimex-interventions -f

# Logs base de données
tail -f /var/log/mysql/error.log

# Logs Nginx
tail -f /var/log/nginx/error.log
```

### Santé de l'application
```bash
# Status des services
systemctl status medimex-interventions mysql nginx

# Health check
curl http://localhost:3000/health
```

## 🤝 Contribution

1. Forkez le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pushez sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Distribué sous licence MIT. Voir `LICENSE` pour plus d'informations.

## 📞 Support

- Email: support@medimex.fr
- Documentation: [lien vers la doc]
- Issues: [lien vers GitHub Issues]

---

**Medimex - Système de Gestion d'Interventions v1.0.0**