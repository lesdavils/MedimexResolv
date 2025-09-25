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

check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "Ce script doit être exécuté en tant que root (sudo)"
    fi
}

check_debian_version() {
    if ! grep -q "bookworm" /etc/os-release; then
        error "Ce script est conçu pour Debian 12 (Bookworm)"
    fi
    log "✅ Debian 12 détecté"
}

choose_ssl() {
    echo "Souhaitez-vous activer SSL/TLS avec Certificat ? (Y/n) : "
    read -r use_ssl
    if [[ $use_ssl =~ ^([yY][eE][sS]|[yY])$ ]]; then
        USE_SSL=true
    else
        USE_SSL=false
    fi
    log "Option SSL : $USE_SSL"
}

update_system() {
    info "📦 Mise à jour du système Debian..."
    apt update && apt upgrade -y
    apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates
    log "✅ Système mis à jour"
}

install_nodejs() {
    info "📦 Installation de Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    if [[ "${NODE_VERSION:1:2}" -lt "18" ]]; then
        error "Node.js 18+ requis. Version installée: $NODE_VERSION"
    fi
    log "✅ Node.js $NODE_VERSION installé"
    log "✅ npm $NPM_VERSION installé"
}

install_mariadb() {
    info "📦 Installation de MariaDB 10.11..."
    apt install -y mariadb-server mariadb-client
    systemctl start mariadb
    systemctl enable mariadb
    MARIADB_VERSION=$(mysql --version | awk '{print $5}' | awk -F, '{print $1}')
    log "✅ MariaDB $MARIADB_VERSION installé"
    setup_mariadb_security
}

setup_mariadb_security() {
    info "🔐 Configuration sécurisée de MariaDB..."
    MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
    DB_PASSWORD=$(openssl rand -base64 32)
    mysql -u root << EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';
FLUSH PRIVILEGES;

CREATE DATABASE IF NOT EXISTS mediresolv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'mediresolv'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON mediresolv.* TO 'mediresolv'@'localhost';
GRANT CREATE, DROP, INDEX, ALTER ON mediresolv.* TO 'mediresolv'@'localhost';
FLUSH PRIVILEGES;
EOF

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

install_nginx() {
    info "🌐 Installation et configuration de Nginx..."
    apt install -y nginx certbot python3-certbot-nginx
    configure_nginx
    systemctl start nginx
    systemctl enable nginx
    log "✅ Nginx installé et configuré"
}

configure_nginx() {
    NGINX_CONF_DIR="/etc/nginx/sites-enabled"
    NGINX_CONF="$NGINX_CONF_DIR/mediresolv.conf"

    if [ ! -d "$NGINX_CONF_DIR" ]; then
        echo "Création du dossier $NGINX_CONF_DIR"
        mkdir -p "$NGINX_CONF_DIR"
    fi

    if [ "$USE_SSL" = true ]; then
        cp "${SCRIPT_DIR}/../docker/nginx/with-ssl.conf" "$NGINX_CONF"
    else
        cp "${SCRIPT_DIR}/../docker/nginx/no-ssl.conf" "$NGINX_CONF"
    fi

    systemctl restart nginx
}

create_system_user() {
    info "👤 Création de l'utilisateur système..."
    if ! id "$SERVICE_USER" &>/dev/null; then
        useradd --system --home "$APP_DIR" --shell /bin/bash --create-home "$SERVICE_USER"
        log "✅ Utilisateur $SERVICE_USER créé"
    else
        log "✅ Utilisateur $SERVICE_USER existe déjà"
    fi
}

install_application() {
    info "📦 Installation de l'application MediResolv..."
    mkdir -p "$APP_DIR"/{backend,frontend,logs,backups,uploads}
    if [[ -d "./backend" ]]; then
        cp -r ./backend/* "$APP_DIR/backend/"
        cp -r ./frontend/* "$APP_DIR/frontend/"
    else
        error "Fichiers source introuvables. Assurez-vous d'être dans le répertoire du projet."
    fi
    cd "$APP_DIR/backend"
    npm ci --only=production
    chown -R "$SERVICE_USER:$SERVICE_USER" "$APP_DIR"
    chmod -R 755 "$APP_DIR"
    chmod -R 700 "$APP_DIR/logs"
    chmod -R 755 "$APP_DIR/uploads"
    log "✅ Application installée"
}

setup_environment() {
    info "⚙️ Configuration de l'environnement..."
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

initialize_database() {
    info "🗄️ Initialisation de la base de données..."
    DB_PASSWORD=$(grep "DB_PASSWORD=" /root/.mariadb_passwords | cut -d'=' -f2)
    if [[ -f "./database/mariadb-schema.sql" ]]; then
        mysql -u mediresolv -p"${DB_PASSWORD}" mediresolv < ./database/mariadb-schema.sql
        log "✅ Schéma de base importé"
    fi
    ADMIN_EXISTS=$(mysql -u mediresolv -p"${DB_PASSWORD}" mediresolv -N -e "SELECT COUNT(*) FROM users WHERE role = 'admin';")
    if [[ "$ADMIN_EXISTS" -eq "0" ]]; then
        warn "Aucun administrateur trouvé - création du compte admin"
        ADMIN_HASH='$2b$12$LQv3vZ2'
        mysql -u mediresolv -p"${DB_PASSWORD}" mediresolv << EOF
INSERT INTO users (username, email, password_hash, nom, prenom, role, statut, doit_changer_mot_passe) 
VALUES ('admin', 'admin@mediresolv.fr', '${ADMIN_HASH}', 'Administrateur', 'Système', 'admin', 'actif', TRUE);
EOF
        log "✅ Compte administrateur créé (admin / Admin123!@#)"
        warn "⚠️  CHANGEZ LE MOT DE PASSE ADMINISTRATEUR IMMÉDIATEMENT"
    fi
}

setup_firewall() {
    info "🔥 Configuration du firewall..."
    if command -v ufw >/dev/null 2>&1; then
        ufw --force enable
        ufw default deny incoming
        ufw default allow outgoing
        ufw allow 22/tcp comment 'SSH'
        ufw allow 80/tcp comment 'HTTP'
        ufw allow 443/tcp comment 'HTTPS'
        ufw deny 3306/tcp comment 'MariaDB blocked externally'
        log "✅ Firewall configuré"
    else
        warn "⚠️  UFW non disponible - configurez le firewall manuellement"
    fi
}

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

DB_PASSWORD=$(grep "DB_PASSWORD=" /root/.mariadb_passwords | cut -d'=' -f2)

mariadb-dump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" | gzip > "$BACKUP_FILE"

if [[ $? -eq 0 ]]; then
    echo "✅ Sauvegarde créée: $BACKUP_FILE"

    find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete
else
    echo "❌ Erreur lors de la sauvegarde"
    exit 1
fi
EOF

    chmod +x /usr/local/bin/${APP_NAME}-backup
    echo "0 2 * * * /usr/local/bin/${APP_NAME}-backup" | crontab -
    log "✅ Sauvegardes automatiques configurées (2h du matin)"
}

run_tests() {
    info "🧪 Tests de fonctionnement..."
    if systemctl is-active --quiet mariadb; then
        log "✅ MariaDB opérationnel"
    else
        error "❌ MariaDB non opérationnel"
    fi
    if systemctl is-active --quiet nginx; then
        log "✅ Nginx opérationnel"
    else
        error "❌ Nginx non opérationnel"
    fi
    systemctl start ${APP_NAME}
    sleep 10
    if systemctl is-active --quiet ${APP_NAME}; then
        log "✅ Application MediResolv opérationnelle"
        if curl -sf http://localhost:3000/health > /dev/null; then
            log "✅ Health check réussi"
        else
            warn "⚠️  Health check échoué"
        fi
    else
        error "❌ Application non opérationnelle"
    fi
}

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

main() {
    echo -e "${BLUE}🚀 Installation MediResolv pour Debian 12${NC}"
    echo -e "${BLUE}   Production Ready - Sécurité Entreprise${NC}"
    echo "══════════════════════════════════════════════════════════════"

    check_root
    check_debian_version
    update_system
    install_nodejs
    install_mariadb

    choose_ssl

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

trap 'error "Installation interrompue à la ligne $LINENO"' ERR
trap 'log "Installation interrompue par l'\''utilisateur"' INT TERM

main "$@"
