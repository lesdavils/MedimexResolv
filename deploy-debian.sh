#!/bin/bash
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