# Créer la structure complète de l'application prête pour production

# Structure des fichiers pour l'application Medimex
structure = {
    "backend": {
        "package.json": {
            "name": "medimex-interventions-backend",
            "version": "1.0.0",
            "description": "Backend API pour système de gestion d'interventions Medimex",
            "main": "server.js",
            "scripts": {
                "start": "node server.js",
                "dev": "nodemon server.js",
                "test": "jest",
                "migrate": "sequelize-cli db:migrate",
                "seed": "sequelize-cli db:seed:all"
            },
            "dependencies": {
                "express": "^4.18.2",
                "mysql2": "^3.6.0",
                "sequelize": "^6.32.1",
                "bcryptjs": "^2.4.3",
                "jsonwebtoken": "^9.0.2",
                "multer": "^1.4.5-lts.1",
                "helmet": "^7.0.0",
                "cors": "^2.8.5",
                "express-rate-limit": "^6.10.0",
                "joi": "^17.9.2",
                "dotenv": "^16.3.1",
                "winston": "^3.10.0",
                "sharp": "^0.32.4",
                "express-validator": "^7.0.1"
            },
            "devDependencies": {
                "nodemon": "^3.0.1",
                "jest": "^29.6.2",
                "sequelize-cli": "^6.6.1"
            }
        },
        
        "server.js": '''
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const ticketRoutes = require('./routes/tickets');
const clientRoutes = require('./routes/clients');
const machineRoutes = require('./routes/machines');
const interventionRoutes = require('./routes/interventions');
const pieceRoutes = require('./routes/pieces');
const uploadRoutes = require('./routes/upload');

const { sequelize } = require('./models');
const logger = require('./config/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Sécurité
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limite de 100 requêtes par IP
});
app.use(limiter);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/pieces', pieceRoutes);
app.use('/api/upload', uploadRoutes);

// Route de santé
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({
        error: 'Erreur serveur interne',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
const startServer = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Connexion à la base de données réussie');
        
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({ alter: true });
        }
        
        app.listen(PORT, () => {
            logger.info(`Serveur démarré sur le port ${PORT}`);
        });
    } catch (error) {
        logger.error('Erreur de démarrage:', error);
        process.exit(1);
    }
};

startServer();
''',

        ".env.example": '''
# Configuration Base de Données
DB_HOST=localhost
DB_USER=medimex
DB_PASSWORD=your_secure_password
DB_NAME=medimex_interventions
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=8h

# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:8080

# Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Logs
LOG_LEVEL=info
LOG_FILE=./logs/app.log
''',

        "models/index.js": '''
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Import des modèles
const User = require('./user')(sequelize, Sequelize.DataTypes);
const Client = require('./client')(sequelize, Sequelize.DataTypes);
const Machine = require('./machine')(sequelize, Sequelize.DataTypes);
const Ticket = require('./ticket')(sequelize, Sequelize.DataTypes);
const Intervention = require('./intervention')(sequelize, Sequelize.DataTypes);
const PieceDetachee = require('./piece_detachee')(sequelize, Sequelize.DataTypes);

// Associations
Client.hasMany(Machine, { foreignKey: 'client_id', as: 'machines' });
Machine.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

Ticket.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
Ticket.belongsTo(Machine, { foreignKey: 'machine_id', as: 'machine' });
Ticket.belongsTo(User, { foreignKey: 'technicien_id', as: 'technicien' });
Ticket.belongsTo(User, { foreignKey: 'createur_id', as: 'createur' });

Intervention.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
Intervention.belongsTo(User, { foreignKey: 'technicien_id', as: 'technicien' });

module.exports = {
    sequelize,
    User,
    Client,
    Machine,
    Ticket,
    Intervention,
    PieceDetachee
};
''',

        "models/user.js": '''
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                len: [3, 50],
                isAlphanumeric: true
            }
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        nom: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        },
        prenom: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        },
        role: {
            type: DataTypes.ENUM('admin', 'superviseur', 'technicien', 'referent', 'constructeur'),
            allowNull: false,
            defaultValue: 'technicien'
        },
        telephone: {
            type: DataTypes.STRING(20),
            validate: {
                is: /^[+]?[0-9\s\-\(\)]{8,20}$/
            }
        },
        photo_profil: {
            type: DataTypes.STRING(255)
        },
        statut: {
            type: DataTypes.ENUM('actif', 'inactif'),
            defaultValue: 'actif'
        },
        derniere_connexion: {
            type: DataTypes.DATE
        }
    }, {
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['username'] },
            { fields: ['email'] },
            { fields: ['role'] }
        ]
    });

    return User;
};
'''
    },
    
    "database": {
        "schema.sql": '''
-- Base de données Medimex - Schéma complet
CREATE DATABASE IF NOT EXISTS medimex_interventions;
USE medimex_interventions;

-- Table des utilisateurs
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    role ENUM('admin','superviseur','technicien','referent','constructeur') NOT NULL DEFAULT 'technicien',
    telephone VARCHAR(20),
    photo_profil VARCHAR(255),
    statut ENUM('actif','inactif') DEFAULT 'actif',
    derniere_connexion TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Table des clients
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(200) NOT NULL,
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    contact_principal VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(100),
    notes TEXT,
    statut ENUM('actif','inactif') DEFAULT 'actif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nom (nom),
    INDEX idx_email (email)
);

-- Table des machines/équipements
CREATE TABLE machines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(200) NOT NULL,
    modele VARCHAR(100),
    numero_serie VARCHAR(100) UNIQUE,
    client_id INT,
    categorie VARCHAR(100),
    statut ENUM('actif','maintenance','hors_service','retire') DEFAULT 'actif',
    date_installation DATE,
    date_derniere_maintenance DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_numero_serie (numero_serie),
    INDEX idx_client (client_id),
    INDEX idx_categorie (categorie)
);

-- Table des tickets
CREATE TABLE tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_ticket VARCHAR(20) UNIQUE NOT NULL,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    client_id INT,
    machine_id INT,
    technicien_id INT,
    createur_id INT,
    statut ENUM('ouvert','assigne','en_cours','en_attente','termine','annule') DEFAULT 'ouvert',
    priorite ENUM('faible','normale','elevee','critique') DEFAULT 'normale',
    type_intervention ENUM('installation','maintenance_preventive','maintenance_curative','reparation','autre') DEFAULT 'maintenance_curative',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_assignation TIMESTAMP NULL,
    date_planifiee TIMESTAMP NULL,
    date_debut_intervention TIMESTAMP NULL,
    date_cloture TIMESTAMP NULL,
    temps_estime INT, -- en minutes
    cout_estime DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE SET NULL,
    FOREIGN KEY (technicien_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (createur_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_numero (numero_ticket),
    INDEX idx_statut (statut),
    INDEX idx_priorite (priorite),
    INDEX idx_client (client_id),
    INDEX idx_technicien (technicien_id),
    INDEX idx_date_planifiee (date_planifiee)
);

-- Table des interventions
CREATE TABLE interventions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT,
    technicien_id INT,
    date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP NULL,
    description_travaux TEXT,
    temps_passe INT, -- en minutes
    km_parcourus INT,
    photos JSON, -- URLs des photos
    pieces_utilisees JSON, -- IDs et quantités des pièces
    signature_client TEXT, -- Signature base64 ou URL
    nom_signataire VARCHAR(100),
    satisfaction_client INT CHECK (satisfaction_client >= 1 AND satisfaction_client <= 5),
    commentaire_client TEXT,
    commentaire_interne TEXT,
    cout_final DECIMAL(10,2),
    facturable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (technicien_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_ticket (ticket_id),
    INDEX idx_technicien (technicien_id),
    INDEX idx_date_debut (date_debut)
);

-- Table des pièces détachées
CREATE TABLE pieces_detachees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(200) NOT NULL,
    reference VARCHAR(100) UNIQUE,
    code_barre VARCHAR(100),
    numero_serie_fabricant VARCHAR(100),
    categorie VARCHAR(100),
    description TEXT,
    stock_actuel INT DEFAULT 0,
    stock_minimum INT DEFAULT 0,
    stock_maximum INT DEFAULT 1000,
    prix_achat DECIMAL(10,2),
    prix_vente DECIMAL(10,2),
    fournisseur VARCHAR(100),
    emplacement VARCHAR(100),
    statut ENUM('actif','obsolete','rupture') DEFAULT 'actif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reference (reference),
    INDEX idx_code_barre (code_barre),
    INDEX idx_categorie (categorie),
    INDEX idx_fournisseur (fournisseur)
);

-- Table des mouvements de stock
CREATE TABLE mouvements_stock (
    id INT PRIMARY KEY AUTO_INCREMENT,
    piece_id INT,
    type_mouvement ENUM('entree','sortie','ajustement'),
    quantite INT,
    prix_unitaire DECIMAL(10,2),
    motif VARCHAR(200),
    document_reference VARCHAR(100), -- bon de commande, intervention, etc.
    utilisateur_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (piece_id) REFERENCES pieces_detachees(id) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_piece (piece_id),
    INDEX idx_type_mouvement (type_mouvement),
    INDEX idx_date (created_at)
);

-- Table des logs de sécurité
CREATE TABLE security_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_date (created_at)
);

-- Vue pour les statistiques des techniciens
CREATE VIEW technicien_stats AS
SELECT 
    u.id,
    u.nom,
    u.prenom,
    COUNT(t.id) as total_tickets,
    COUNT(CASE WHEN t.statut = 'termine' THEN 1 END) as tickets_termines,
    COUNT(CASE WHEN t.statut = 'en_cours' THEN 1 END) as tickets_en_cours,
    AVG(CASE WHEN i.temps_passe IS NOT NULL THEN i.temps_passe END) as temps_moyen_intervention
FROM users u
LEFT JOIN tickets t ON u.id = t.technicien_id
LEFT JOIN interventions i ON t.id = i.ticket_id
WHERE u.role = 'technicien' AND u.statut = 'actif'
GROUP BY u.id, u.nom, u.prenom;
''',

        "seeds.sql": '''
-- Données d'exemple pour Medimex
USE medimex_interventions;

-- Insertion des utilisateurs (mots de passe hashés avec bcrypt)
INSERT INTO users (username, email, password_hash, nom, prenom, role, telephone) VALUES
('admin', 'admin@medimex.fr', '$2b$10$rQiRmMqP3KXyLuVfqGJ7ReXQkAoF4JVkzYuJYqMDzr8bI1F5hLCu6', 'Administrateur', 'Système', 'admin', '01 23 45 67 89'),
('j.dupont', 'j.dupont@medimex.fr', '$2b$10$rQiRmMqP3KXyLuVfqGJ7ReXQkAoF4JVkzYuJYqMDzr8bI1F5hLCu6', 'Dupont', 'Jean', 'superviseur', '01 23 45 67 90'),
('m.martin', 'm.martin@medimex.fr', '$2b$10$rQiRmMqP3KXyLuVfqGJ7ReXQkAoF4JVkzYuJYqMDzr8bI1F5hLCu6', 'Martin', 'Marie', 'technicien', '01 23 45 67 91'),
('p.durand', 'p.durand@athlex.fr', '$2b$10$rQiRmMqP3KXyLuVfqGJ7ReXQkAoF4JVkzYuJYqMDzr8bI1F5hLCu6', 'Durand', 'Pierre', 'referent', '01 23 45 67 92');

-- Insertion des clients
INSERT INTO clients (nom, adresse, ville, code_postal, contact_principal, telephone, email) VALUES
('Hôpital Saint-Louis', '123 Rue de la Santé', 'Paris', '75010', 'Dr. Bernard', '01 42 34 56 78', 'bernard@hopital-st-louis.fr'),
('Clinique du Parc', '45 Avenue des Fleurs', 'Lyon', '69003', 'Mme Rousseau', '04 78 45 67 89', 'contact@clinique-parc.fr'),
('Centre Médical Sud', '78 Boulevard Victor Hugo', 'Marseille', '13001', 'M. Gonzalez', '04 91 23 45 67', 'info@centre-medical-sud.fr'),
('Cabinet Radiologie Nord', '15 Place de la République', 'Lille', '59000', 'Dr. Lefebvre', '03 20 12 34 56', 'contact@radio-nord.fr');

-- Insertion des machines
INSERT INTO machines (nom, modele, numero_serie, client_id, categorie, date_installation) VALUES
('Scanner IRM', 'Siemens Magnetom', 'SM12345', 1, 'Imagerie', '2023-01-15'),
('Échographe', 'Philips EPIQ', 'PH67890', 2, 'Échographie', '2023-03-20'),
('Moniteur Patient', 'GE Dash', 'GE11111', 3, 'Monitoring', '2023-05-10'),
('Ventilateur', 'Dräger Evita', 'DR22222', 1, 'Ventilation', '2023-02-28'),
('Défibrillateur', 'Physio Control', 'PC33333', 4, 'Urgence', '2023-04-12');

-- Insertion des pièces détachées
INSERT INTO pieces_detachees (nom, reference, code_barre, categorie, stock_actuel, stock_minimum, prix_achat, prix_vente, fournisseur) VALUES
('Batterie Li-Ion 12V', 'BAT-LI-12V-001', '1234567890123', 'Batteries', 15, 5, 89.50, 125.00, 'TechMed'),
('Câble USB-C 2m', 'CAB-USBC-2M-001', '1234567890124', 'Câbles', 8, 10, 25.00, 35.00, 'ElectroPlus'),
('Capteur température', 'CAP-TEMP-001', '1234567890125', 'Capteurs', 3, 5, 156.75, 220.00, 'SensorTech'),
('Électrodes jetables x10', 'ELEC-JET-10-001', '1234567890126', 'Consommables', 50, 20, 12.50, 18.00, 'MediSupply'),
('Filtre HEPA', 'FIL-HEPA-001', '1234567890127', 'Filtres', 6, 3, 45.00, 65.00, 'FilterPro');
'''
    },
    
    "docker": {
        "Dockerfile": '''
# Image Node.js optimisée pour production
FROM node:18-alpine

# Métadonnées
LABEL maintainer="Medimex <admin@medimex.fr>"
LABEL version="1.0.0"
LABEL description="Système de gestion d'interventions Medimex"

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Création du répertoire de l'application
WORKDIR /usr/src/app

# Installation des dépendances de production seulement
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copie du code source
COPY backend/ .

# Création des répertoires nécessaires
RUN mkdir -p uploads logs && \
    chown -R node:node uploads logs

# Utilisateur non-root pour la sécurité
USER node

# Port exposé
EXPOSE 3000

# Santé check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1

# Commande de démarrage
CMD ["node", "server.js"]
''',

        "docker-compose.yml": '''
version: '3.8'

services:
  medimex-db:
    image: mysql:8.0
    container_name: medimex-db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/seeds.sql:/docker-entrypoint-initdb.d/02-seeds.sql
      - ./mysql.cnf:/etc/mysql/conf.d/custom.cnf
    ports:
      - "3306:3306"
    networks:
      - medimex-network

  medimex-backend:
    build: 
      context: .
      dockerfile: docker/Dockerfile
    container_name: medimex-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DB_HOST: medimex-db
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      JWT_SECRET: ${JWT_SECRET}
    volumes:
      - uploads_data:/usr/src/app/uploads
      - logs_data:/usr/src/app/logs
    ports:
      - "3000:3000"
    depends_on:
      - medimex-db
    networks:
      - medimex-network

  medimex-frontend:
    image: nginx:alpine
    container_name: medimex-frontend
    restart: unless-stopped
    volumes:
      - ./frontend:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "8080:80"
    depends_on:
      - medimex-backend
    networks:
      - medimex-network

volumes:
  db_data:
  uploads_data:
  logs_data:

networks:
  medimex-network:
    driver: bridge
'''
    },
    
    "scripts": {
        "deploy-debian.sh": '''#!/bin/bash
# Script de déploiement automatique sur Debian 12

set -e

echo "🚀 Déploiement Medimex - Système de Gestion d'Interventions"
echo "=============================================="

# Variables
APP_NAME="medimex-interventions"
APP_DIR="/opt/$APP_NAME"
SERVICE_USER="medimex"
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)

# Vérification des privilèges root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Ce script doit être exécuté en tant que root" 
   exit 1
fi

# Mise à jour du système
echo "📦 Mise à jour du système..."
apt update && apt upgrade -y

# Installation des dépendances
echo "🔧 Installation des dépendances..."
apt install -y curl wget git software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Installation de Node.js 18
echo "📦 Installation de Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Installation de MySQL 8.0
echo "🗄️ Installation de MySQL..."
apt install -y mysql-server

# Installation de Docker
echo "🐳 Installation de Docker..."
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Installation de Nginx
echo "🌐 Installation de Nginx..."
apt install -y nginx

# Création de l'utilisateur système
echo "👤 Création de l'utilisateur système..."
useradd --system --home $APP_DIR --shell /bin/bash $SERVICE_USER || true
mkdir -p $APP_DIR
chown $SERVICE_USER:$SERVICE_USER $APP_DIR

# Configuration MySQL
echo "🔐 Configuration MySQL..."
mysql -u root << EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY '$MYSQL_ROOT_PASSWORD';
CREATE DATABASE IF NOT EXISTS medimex_interventions;
CREATE USER IF NOT EXISTS 'medimex'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON medimex_interventions.* TO 'medimex'@'localhost';
FLUSH PRIVILEGES;
EOF

# Création du fichier de configuration
echo "⚙️ Création de la configuration..."
cat > $APP_DIR/.env << EOF
# Configuration Production Medimex
NODE_ENV=production
PORT=3000

# Base de données
DB_HOST=localhost
DB_USER=medimex
DB_PASSWORD=$DB_PASSWORD
DB_NAME=medimex_interventions
DB_PORT=3306

# Sécurité
JWT_SECRET=$JWT_SECRET
JWT_EXPIRE=8h

# Application
FRONTEND_URL=http://localhost:8080
UPLOAD_DIR=/opt/medimex-interventions/uploads
MAX_FILE_SIZE=5242880

# Logs
LOG_LEVEL=info
LOG_FILE=/opt/medimex-interventions/logs/app.log
EOF

chown $SERVICE_USER:$SERVICE_USER $APP_DIR/.env
chmod 600 $APP_DIR/.env

# Configuration du service systemd
echo "🔄 Configuration du service systemd..."
cat > /etc/systemd/system/$APP_NAME.service << EOF
[Unit]
Description=Medimex Interventions Backend API
After=network.target mysql.service

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=$APP_DIR/.env

# Sécurité
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=$APP_DIR

[Install]
WantedBy=multi-user.target
EOF

# Configuration Nginx
echo "🌐 Configuration Nginx..."
cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name _;
    
    # Sécurité
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Frontend
    location / {
        root /var/www/medimex;
        try_files \$uri \$uri/ /index.html;
    }
    
    # API Backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Uploads
    location /uploads/ {
        alias $APP_DIR/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Création des répertoires
mkdir -p $APP_DIR/uploads $APP_DIR/logs /var/www/medimex
chown -R $SERVICE_USER:$SERVICE_USER $APP_DIR/uploads $APP_DIR/logs

# Démarrage des services
echo "🚀 Démarrage des services..."
systemctl daemon-reload
systemctl enable mysql nginx $APP_NAME
systemctl start mysql nginx

# Test Nginx
nginx -t && systemctl reload nginx

# Affichage des informations
echo ""
echo "✅ Installation terminée avec succès!"
echo "=============================================="
echo "📍 Application: http://$(hostname -I | awk '{print $1}')"
echo "🗄️ Base de données: MySQL 8.0"
echo "👤 Utilisateur système: $SERVICE_USER"
echo "📁 Répertoire: $APP_DIR"
echo ""
echo "🔐 Informations de sécurité (GARDEZ PRÉCIEUSEMENT):"
echo "MySQL root password: $MYSQL_ROOT_PASSWORD"
echo "Database password: $DB_PASSWORD"
echo "JWT secret: [voir $APP_DIR/.env]"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Clonez votre code dans $APP_DIR"
echo "2. Installez les dépendances: npm install"
echo "3. Initialisez la base: npm run migrate && npm run seed"
echo "4. Démarrez le service: systemctl start $APP_NAME"
echo "5. Copiez le frontend dans /var/www/medimex/"
echo ""
echo "📊 Monitoring:"
echo "- Logs application: journalctl -u $APP_NAME -f"
echo "- Logs Nginx: tail -f /var/log/nginx/error.log"
echo "- État des services: systemctl status $APP_NAME mysql nginx"
''',

        "setup.sh": '''#!/bin/bash
# Script de configuration rapide pour développement

echo "🛠️ Configuration de l'environnement de développement"

# Installation des dépendances backend
echo "📦 Installation des dépendances backend..."
cd backend && npm install && cd ..

# Création de la base de données (si MySQL est installé)
if command -v mysql &> /dev/null; then
    echo "🗄️ Configuration de la base de données..."
    mysql -u root -p < database/schema.sql
    mysql -u root -p < database/seeds.sql
fi

# Copie du fichier de configuration
cp backend/.env.example backend/.env
echo "⚙️ Fichier .env créé. Personnalisez les variables selon votre environnement."

# Création des répertoires
mkdir -p backend/uploads backend/logs

echo "✅ Configuration terminée!"
echo "🚀 Démarrage: cd backend && npm run dev"
'''
    },
    
    "README.md": '''
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
'''
}

print("✅ Structure complète de l'application créée!")
print("\n📁 Fichiers générés:")

def count_files(d, prefix=""):
    count = 0
    for key, value in d.items():
        if isinstance(value, dict):
            print(f"{prefix}📁 {key}/")
            count += count_files(value, prefix + "  ")
        else:
            print(f"{prefix}📄 {key}")
            count += 1
    return count

total_files = count_files(structure)
print(f"\n📊 Total: {total_files} fichiers créés")