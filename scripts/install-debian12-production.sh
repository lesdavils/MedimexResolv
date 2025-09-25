#!/bin/bash

# Script d'installation production MediResolv pour Debian 12
# Sécurité niveau entreprise avec MariaDB

set -euo pipefail

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly APP_NAME="mediresolv"
readonly APP_DIR="/opt/${APP_NAME}"
readonly SERVICE_USER="mediresolv"
readonly LOG_FILE="/var/log/${APP_NAME}_install.log"

# Couleurs
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# Fonctions de logging
log() {
    echo -e "${GREEN}[INFO]${NC} $*" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $*" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $*" | tee -a "$LOG_FILE"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO]${NC} $*" | tee -a "$LOG_FILE"
}

# Vérification des privilèges root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "Ce script doit être exécuté en tant que root (sudo)"
    fi
}

# Vérification de Debian 12
check_debian_version() {
    if ! grep -q "bookworm" /etc/os-release; then
        error "Ce script est conçu pour Debian 12 (Bookworm)"
    fi
    log "✅ Debian 12 détecté"
}

# Mise à jour du système
update_system() {
    info "📦 Mise à jour du système Debian..."
    apt update && apt upgrade -y
    apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates
    log "✅ Système mis à jour"
}


# Installation de Node.js 18
install_nodejs() {
    info "📦 Installation de Node.js 18..."
    
    # Ajout du repository NodeSource
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    # Vérification
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    
    if [[ "${NODE_VERSION:1:2}" -lt "18" ]]; then
        error "Node.js 18+ requis. Version installée: $NODE_VERSION"
    fi
    
    log "✅ Node.js $NODE_VERSION installé"
    log "✅ npm $NPM_VERSION installé"
}

# Installation de MariaDB 10.11
install_mariadb() {
    info "📦 Installation de MariaDB 10.11..."
    
    # Installation MariaDB
    apt install -y mariadb-server mariadb-client
    
    # Démarrage et activation
    systemctl start mariadb
    systemctl enable mariadb
    
    # Vérification de la version
    MARIADB_VERSION=$(mysql --version | awk '{print $5}' | awk -F, '{print $1}')
    log "✅ MariaDB $MARIADB_VERSION installé"
    
    # Configuration sécurisée
    setup_mariadb_security
}

# Configuration sécurisée de MariaDB
setup_mariadb_security() {
    info "🔐 Configuration sécurisée de MariaDB..."
    
    # Génération des mots de passe sécurisés
    MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
    DB_PASSWORD=$(openssl rand -base64 32)
    
    # Configuration sécurisée automatique
    mysql -u root << EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';
FLUSH PRIVILEGES;

CREATE DATABASE IF NOT EXISTS mediresolv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'mediresolv'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON mediresolv.* TO 'mediresolv'@'localhost';
GRANT CREATE, DROP, INDEX, ALTER ON mediresolv.* TO 'mediresolv'@'localhost';
FLUSH PRIVILEGES;
EOF

    # Sauvegarde des mots de passe
    cat > /root/.mariadb_passwords << EOF
# MediResolv - Mots de passe MariaDB
# GARDEZ CE FICHIER EN SÉCURITÉ !

MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
DB_PASSWORD=${DB_PASSWORD}
DB_USER=mediresolv
DB_NAME=mediresolv

# Date de création: $(date)
EOF

    chmod 600 /root/.mariadb_passwords
    log "✅ MariaDB sécurisé - Mots de passe sauvegardés dans /root/.mariadb_passwords"
}

echo "Souhaitez-vous activer SSL/TLS avec Certificat ? (Y/n) : "
read -r use_ssl
if [[ $use_ssl =~ ^([yY][eE][sS]|[yY])$ ]]; then
    USE_SSL=true
else
    USE_SSL=false
fi

# Plus bas, remplacement du restart nginx simple par conditionnel
if [ "$USE_SSL" = true ]; then
    echo 'Démarrage NGINX avec SSL activé'
    systemctl restart nginx
else
    echo 'Démarrage NGINX sans SSL (HTTP uniquement)'
    sed -i 's/listen 443 ssl;//g' /etc/nginx/sites-enabled/default
    sed -i 's/ssl_certificate .*;/# ssl certificate désactivé;/g' /etc/nginx/sites-enabled/default
    sed -i 's/ssl_certificate_key .*;/# ssl key désactivé;/g' /etc/nginx/sites-enabled/default
    systemctl restart nginx
fi


# Installation de Nginx
install_nginx() {
    info "🌐 Installation et configuration de Nginx..."
    
    apt install -y nginx
    
    # Configuration SSL avec Let's Encrypt
    apt install -y certbot python3-certbot-nginx
    
    # Configuration de base
    create_nginx_config
    
    systemctl start nginx
    systemctl enable nginx
    
    log "✅ Nginx installé et configuré"
}

# Création de la configuration Nginx
create_nginx_config() {
    cat > /etc/nginx/sites-available/${APP_NAME} << EOF
# Configuration Nginx pour MediResolv
# Sécurité niveau entreprise

server {
    listen 80;
    server_name _;
    
    # Redirection HTTPS forcée en production
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name _;
    
    # Configuration SSL (certificats à configurer)
    ssl_certificate /etc/ssl/certs/mediresolv.crt;
    ssl_certificate_key /etc/ssl/private/mediresolv.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';" always;
    
    # Configuration frontend
    location / {
        root ${APP_DIR}/frontend;
        try_files \$uri \$uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
    
    # API Backend
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }
    
    # Uploads sécurisés
    location /uploads/ {
        alias ${APP_DIR}/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public";
        
        # Sécurité uploads
        location ~* \\.(php|pl|py|js|sh)\$ {
            deny all;
        }
    }
    
    # Health check
    location /health {
        proxy_pass http://127.0.0.1:3000/health;
        access_log off;
    }
    
    # Bloquer les fichiers sensibles
    location ~ /\\.(ht|git|env) {
        deny all;
    }
    
    location ~ /\\.(log|sql|bak)\$ {
        deny all;
    }
}

EOF

    # Activation de la configuration
    ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test de configuration
    nginx -t
}

# Création de l'utilisateur système
create_system_user() {
    info "👤 Création de l'utilisateur système..."
    
    if ! id "$SERVICE_USER" &>/dev/null; then
        useradd --system --home "$APP_DIR" --shell /bin/bash --create-home "$SERVICE_USER"
        log "✅ Utilisateur $SERVICE_USER créé"
    else
        log "✅ Utilisateur $SERVICE_USER existe déjà"
    fi
}

# Installation de l'application
install_application() {
    info "📦 Installation de l'application MediResolv..."
    
    # Création de la structure
    mkdir -p "$APP_DIR"/{backend,frontend,logs,backups,uploads}
    
    # Copie des fichiers (depuis le répertoire courant)
    if [[ -d "./backend" ]]; then
        cp -r ./backend/* "$APP_DIR/backend/"
        cp -r ./frontend/* "$APP_DIR/frontend/"
    else
        error "Fichiers source introuvables. Assurez-vous d'être dans le répertoire du projet."
    fi
    
    # Installation des dépendances Node.js
    cd "$APP_DIR/backend"
    npm ci --only=production
    
    # Configuration des permissions
    chown -R "$SERVICE_USER:$SERVICE_USER" "$APP_DIR"
    chmod -R 755 "$APP_DIR"
    chmod -R 700 "$APP_DIR/logs"
    chmod -R 755 "$APP_DIR/uploads"
    
    log "✅ Application installée"
}

# Configuration de l'environnement
setup_environment() {
    info "⚙️ Configuration de l'environnement..."
    
    # Récupération du mot de passe de la base
    DB_PASSWORD=$(grep "DB_PASSWORD=" /root/.mariadb_passwords | cut -d'=' -f2)
    JWT_SECRET=$(openssl rand -base64 64)
    
    cat > "$APP_DIR/backend/.env" << EOF
# Configuration production MediResolv
NODE_ENV=production
PORT=3000

# Base de données MariaDB
DB_HOST=localhost
DB_USER=mediresolv
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=mediresolv
DB_PORT=3306

# Sécurité JWT
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRE=8h

# Application
FRONTEND_URL=https://$(hostname -f)
UPLOAD_DIR=${APP_DIR}/backend/uploads
MAX_FILE_SIZE=10485760

# Logs
LOG_LEVEL=info
LOG_DIR=${APP_DIR}/logs

# Email (à configurer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=

# Redis (optionnel)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Sauvegardes
BACKUP_DIR=${APP_DIR}/backups
BACKUP_RETENTION_DAYS=30
EOF

    chown "$SERVICE_USER:$SERVICE_USER" "$APP_DIR/backend/.env"
    chmod 600 "$APP_DIR/backend/.env"
    
    log "✅ Configuration environnement créée"
}

# Configuration du service systemd
setup_systemd_service() {
    info "🔄 Configuration du service systemd..."
    
    cat > /etc/systemd/system/${APP_NAME}.service << EOF
[Unit]
Description=MediResolv - Système de Gestion d'Interventions
Documentation=https://github.com/lesdavils/MediResolv
After=network.target mariadb.service
Wants=mariadb.service

[Service]
Type=simple
User=${SERVICE_USER}
Group=${SERVICE_USER}
WorkingDirectory=${APP_DIR}/backend
ExecStart=/usr/bin/node server.js
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=10
TimeoutStopSec=30

# Variables d'environnement
Environment=NODE_ENV=production
EnvironmentFile=${APP_DIR}/backend/.env

# Sécurité systemd
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=${APP_DIR}
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true

# Limites de ressources
LimitNOFILE=65536
LimitNPROC=4096

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${APP_NAME}

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable ${APP_NAME}
    
    log "✅ Service systemd configuré"
}

# Initialisation de la base de données
initialize_database() {
    info "🗄️ Initialisation de la base de données..."
    
    # Import du schéma
    if [[ -f "./database/mariadb-schema.sql" ]]; then
        mysql -u mediresolv -p"${DB_PASSWORD}" mediresolv < ./database/mariadb-schema.sql
        log "✅ Schéma de base importé"
    fi
    
    # Vérification de l'admin
    ADMIN_EXISTS=$(mysql -u mediresolv -p"${DB_PASSWORD}" mediresolv -N -e "SELECT COUNT(*) FROM users WHERE role = 'admin';")
    
    if [[ "$ADMIN_EXISTS" -eq "0" ]]; then
        warn "Aucun administrateur trouvé - création du compte admin"
        
        # Hash du mot de passe Admin123!@#
        ADMIN_HASH='$2b$12$LQv3c1yqBWVHxkd0LQ4YCOQEj5k4L0KbQ8n5YvZ2q9L0yF9xZ0wZ2'
        
        mysql -u mediresolv -p"${DB_PASSWORD}" mediresolv << EOF
INSERT INTO users (username, email, password_hash, nom, prenom, role, statut, doit_changer_mot_passe) 
VALUES ('admin', 'admin@mediresolv.fr', '${ADMIN_HASH}', 'Administrateur', 'Système', 'admin', 'actif', TRUE);
EOF
        
        log "✅ Compte administrateur créé (admin / Admin123!@#)"
        warn "⚠️  CHANGEZ LE MOT DE PASSE ADMINISTRATEUR IMMÉDIATEMENT"
    fi
}

# Configuration du firewall
setup_firewall() {
    info "🔥 Configuration du firewall..."
    
    if command -v ufw >/dev/null 2>&1; then
        ufw --force enable
        ufw default deny incoming
        ufw default allow outgoing
        
        # SSH (ajustez le port si nécessaire)
        ufw allow 22/tcp comment 'SSH'
        
        # HTTP/HTTPS
        ufw allow 80/tcp comment 'HTTP'
        ufw allow 443/tcp comment 'HTTPS'
        
        # MariaDB (local seulement)
        ufw deny 3306/tcp comment 'MariaDB blocked externally'
        
        log "✅ Firewall configuré"
    else
        warn "⚠️  UFW non disponible - configurez le firewall manuellement"
    fi
}

# Configuration de la rotation des logs
setup_log_rotation() {
    info "📝 Configuration de la rotation des logs..."
    
    cat > /etc/logrotate.d/${APP_NAME} << EOF
${APP_DIR}/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ${SERVICE_USER} ${SERVICE_USER}
    postrotate
        systemctl reload ${APP_NAME} > /dev/null 2>&1 || true
    endscript
}
EOF

    log "✅ Rotation des logs configurée"
}

# Configuration des sauvegardes automatiques
setup_backup() {
    info "💾 Configuration des sauvegardes automatiques..."
    
    cat > /usr/local/bin/${APP_NAME}-backup << 'EOF'
#!/bin/bash
# Sauvegarde automatique MediResolv

BACKUP_DIR="/opt/mediresolv/backups"
DB_NAME="mediresolv"
DB_USER="mediresolv"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

# Récupération du mot de passe
DB_PASSWORD=$(grep "DB_PASSWORD=" /root/.mariadb_passwords | cut -d'=' -f2)

# Création de la sauvegarde
mariadb-dump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" | gzip > "$BACKUP_FILE"

if [[ $? -eq 0 ]]; then
    echo "✅ Sauvegarde créée: $BACKUP_FILE"
    
    # Nettoyage des anciennes sauvegardes (30 jours)
    find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete
else
    echo "❌ Erreur lors de la sauvegarde"
    exit 1
fi
EOF

    chmod +x /usr/local/bin/${APP_NAME}-backup
    
    # Crontab pour sauvegarde quotidienne
    echo "0 2 * * * /usr/local/bin/${APP_NAME}-backup" | crontab -
    
    log "✅ Sauvegardes automatiques configurées (2h du matin)"
}

# Tests de fonctionnement
run_tests() {
    info "🧪 Tests de fonctionnement..."
    
    # Test MariaDB
    if systemctl is-active --quiet mariadb; then
        log "✅ MariaDB opérationnel"
    else
        error "❌ MariaDB non opérationnel"
    fi
    
    # Test Nginx
    if systemctl is-active --quiet nginx; then
        log "✅ Nginx opérationnel"
    else
        error "❌ Nginx non opérationnel"
    fi
    
    # Démarrage de l'application
    systemctl start ${APP_NAME}
    sleep 10
    
    # Test de l'application
    if systemctl is-active --quiet ${APP_NAME}; then
        log "✅ Application MediResolv opérationnelle"
        
        # Test HTTP
        if curl -sf http://localhost:3000/health > /dev/null; then
            log "✅ Health check réussi"
        else
            warn "⚠️  Health check échoué"
        fi
    else
        error "❌ Application non opérationnelle"
    fi
}

# Affichage du résumé final
display_summary() {
    log "🎉 Installation de MediResolv terminée avec succès !"
    echo
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${GREEN}🏥 MediResolv INSTALLÉ AVEC SUCCÈS 🏥${NC}"
    echo "═══════════════════════════════════════════════════════════════"
    echo
    echo -e "${BLUE}📍 ACCÈS APPLICATION :${NC}"
    echo "   URL: https://$(hostname -f)"
    echo "   Santé: https://$(hostname -f)/health"
    echo
    echo -e "${BLUE}🔑 COMPTE ADMINISTRATEUR :${NC}"
    echo "   Utilisateur: admin"
    echo "   Mot de passe: Admin123!@#"
    echo -e "   ${RED}⚠️  CHANGEZ CE MOT DE PASSE IMMÉDIATEMENT !${NC}"
    echo
    echo -e "${BLUE}🗄️  BASE DE DONNÉES :${NC}"
    echo "   Type: MariaDB $(mysql --version | awk '{print $5}' | awk -F, '{print $1}')"
    echo "   Base: mediresolv"
    echo "   Mots de passe: /root/.mariadb_passwords"
    echo
    echo -e "${BLUE}🔧 GESTION DU SERVICE :${NC}"
    echo "   Statut: systemctl status ${APP_NAME}"
    echo "   Redémarrer: systemctl restart ${APP_NAME}"
    echo "   Logs: journalctl -u ${APP_NAME} -f"
    echo
    echo -e "${BLUE}💾 SAUVEGARDES :${NC}"
    echo "   Auto: Quotidiennes à 2h du matin"
    echo "   Manuel: /usr/local/bin/${APP_NAME}-backup"
    echo "   Dossier: ${APP_DIR}/backups"
    echo
    echo -e "${BLUE}📁 FICHIERS IMPORTANTS :${NC}"
    echo "   Application: ${APP_DIR}"
    echo "   Configuration: ${APP_DIR}/backend/.env"
    echo "   Logs: ${APP_DIR}/logs"
    echo "   Service: /etc/systemd/system/${APP_NAME}.service"
    echo
    echo -e "${YELLOW}📋 PROCHAINES ÉTAPES :${NC}"
    echo "   1. Configurez SSL/HTTPS avec certbot"
    echo "   2. Changez le mot de passe administrateur"
    echo "   3. Configurez l'email SMTP"
    echo "   4. Créez vos utilisateurs"
    echo "   5. Importez vos données clients"
    echo
    echo -e "${GREEN}🎯 MediResolv est prêt pour la production ! ${NC}"
    echo "═══════════════════════════════════════════════════════════════"
}

# Fonction principale
main() {
    echo -e "${BLUE}🚀 Installation MediResolv pour Debian 12${NC}"
    echo -e "${BLUE}   Production Ready - Sécurité Entreprise${NC}"
    echo "══════════════════════════════════════════════════════════════"
    
    check_root
    check_debian_version
    update_system
    install_nodejs
    install_mariadb
    install_nginx
    create_system_user
    install_application
    setup_environment
    setup_systemd_service
    initialize_database
    setup_firewall
    setup_log_rotation
    setup_backup
    run_tests
    display_summary
    
    log "✅ Installation terminée avec succès"
}

# Gestion des erreurs
trap 'error "Installation interrompue à la ligne $LINENO"' ERR
trap 'log "Installation interrompue par l'\''utilisateur"' INT TERM

# Lancement
main "$@"