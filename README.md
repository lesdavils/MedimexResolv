# MediResolv - Production Ready

<div align="center">
  <h1>🏥 MediResolv</h1>
  <p><strong>Système Professionnel de Gestion d'Interventions pour Équipements Médicaux</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/MariaDB-10.11+-003545?logo=mariadb&logoColor=white" alt="MariaDB">
    <img src="https://img.shields.io/badge/Debian-12-A81D33?logo=debian&logoColor=white" alt="Debian">
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker">
    <img src="https://img.shields.io/badge/Security-Enterprise-red" alt="Security">
    <img src="https://img.shields.io/badge/License-Proprietary-yellow" alt="License">
  </p>
</div>

## 🚀 Aperçu

MediResolv est une solution d'entreprise complète pour la gestion des interventions sur équipements médicaux. Conçu avec une sécurité de niveau bancaire et optimisé pour les environnements de production critiques.

### ✨ Caractéristiques Clés

- 🔐 **Sécurité Entreprise** : JWT, bcrypt, rate limiting, HTTPS obligatoire
- 📊 **Base MariaDB** : Optimisée pour Debian 12 avec performances maximales  
- 🎨 **Interface Pro** : Responsive, login direct sans scroll, design corporate
- 👥 **Gestion Admin** : Un seul compte admin, création d'utilisateurs sécurisée
- 📱 **Multi-plateforme** : Mobile, tablet, desktop optimisés
- 🔄 **Déploiement Auto** : Scripts Debian 12 + Docker prêts pour production

## 📋 Fonctionnalités Métier

### 🎛️ Dashboard Intelligent
- Tableaux de bord adaptatifs par rôle utilisateur
- Statistiques en temps réel des interventions
- KPI et métriques de performance  
- Notifications et alertes automatiques

### 🎫 Gestion des Tickets
- Workflow complet des demandes d'intervention
- Assignation automatique et planification  
- Suivi temps réel avec historique complet
- Priorités et escalades automatiques

### 🏥 Gestion Clients & Équipements  
- Base complète des établissements médicaux
- Inventaire détaillé des machines/équipements
- Historique complet des interventions par appareil
- Planification maintenance préventive

### 👨‍🔧 Gestion des Interventions
- Fiches d'intervention digitales complètes
- Upload photos avant/après obligatoire
- Signature électronique client
- Gestion des pièces détachées utilisées
- Rapports d'intervention automatiques

### 📦 Gestion Stock
- Inventaire complet pièces détachées  
- Codes-barres et traçabilité complète
- Alertes stock minimum automatiques
- Gestion fournisseurs et coûts

## 🏗️ Architecture Technique

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   HTML/CSS/JS   ├────┤   Node.js       ├────┤    MariaDB      │
│   Responsive    │    │   Express       │    │    10.11+       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  
│     Nginx       │    │     Redis       │    │   Monitoring    │
│   Proxy + SSL   │    │   Sessions      │    │ Prometheus      │
│   Rate Limit    │    │   Cache         │    │ + Grafana       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔧 Stack Technique
- **Backend** : Node.js 18+ + Express + Sequelize ORM
- **Database** : MariaDB 10.11+ (optimisée Debian 12)
- **Frontend** : HTML5 + CSS3 + JavaScript moderne  
- **Proxy** : Nginx avec SSL/TLS et rate limiting
- **Cache** : Redis pour sessions et performances
- **Monitoring** : Prometheus + Grafana (optionnel)
- **Deployment** : Docker + systemd + scripts automatisés

## 🛡️ Sécurité Entreprise

### 🔐 Authentification & Autorisation
- JWT tokens avec expiration configurable  
- Hachage bcrypt avec salt + rounds élevés
- Gestion granulaire des rôles et permissions
- Sessions sécurisées avec timeout automatique
- Protection contre brute force (rate limiting)

### 🛡️ Protection Applications
- Headers de sécurité complets (Helmet)
- Protection CSRF, XSS, injection SQL
- Validation stricte de toutes les entrées (Joi)  
- Upload de fichiers sécurisé avec contrôles
- HTTPS obligatoire en production

### 📊 Audit & Logs  
- Logs de sécurité complets avec winston
- Audit trail de toutes les actions utilisateur
- Monitoring des tentatives d'intrusion
- Rotation automatique des logs
- Alertes sécurité en temps réel

## ⚡ Installation Ultra-Rapide

### 🐳 Méthode 1 : Docker (Recommandée)

```bash
# 1. Cloner le repository
git clone https://github.com/lesdavils/MediResolv.git
cd MediResolv

# 2. Configuration
cp .env.example .env
# Éditez .env avec vos paramètres sécurisés

# 3. Démarrage production
docker-compose -f docker-compose.production.yml up -d

# 4. Vérification
curl http://localhost/health
```

### 🖥️ Méthode 2 : Installation Debian 12

```bash
# 1. Cloner et installer  
git clone https://github.com/lesdavils/MediResolv.git
cd MediResolv

# 2. Installation automatique (root requis)
chmod +x scripts/install-debian12-production.sh
sudo ./scripts/install-debian12-production.sh

# 3. Configuration SSL (optionnel)
sudo certbot --nginx -d votre-domaine.com

# 4. C'est fini ! 🎉
```

## 🔑 Accès Application

### 📍 URLs de Production
- **Application** : https://votre-domaine.com
- **API Backend** : https://votre-domaine.com/api  
- **Health Check** : https://votre-domaine.com/health
- **Monitoring** : https://votre-domaine.com:3001 (Grafana)

### 🔐 Compte Administrateur  
- **Utilisateur** : `admin`
- **Mot de passe** : `Admin123!@#`
- **⚠️ CRITIQUE** : Changez ce mot de passe immédiatement !

### 👥 Rôles Utilisateur
- **Admin** : Gestion complète système + utilisateurs
- **Superviseur** : Gestion équipe et assignation tickets  
- **Technicien** : Interventions et rapports terrain
- **Référent** : Consultation données client
- **Constructeur** : Accès technique équipements

## 📊 API Endpoints

### 🔐 Authentification
```http
POST /api/auth/login           # Connexion utilisateur  
POST /api/auth/logout          # Déconnexion
GET  /api/auth/profile         # Profil utilisateur
PUT  /api/auth/profile         # Mise à jour profil  
POST /api/auth/change-password # Changement mot de passe
```

### 🎫 Tickets & Interventions
```http
GET    /api/tickets            # Liste tickets
POST   /api/tickets            # Créer ticket
GET    /api/tickets/:id        # Détails ticket
PUT    /api/tickets/:id        # Modifier ticket
DELETE /api/tickets/:id        # Supprimer ticket

GET    /api/interventions      # Liste interventions
POST   /api/interventions      # Créer intervention  
PUT    /api/interventions/:id  # Mettre à jour intervention
```

### 🏥 Clients & Machines
```http  
GET    /api/clients            # Liste clients
POST   /api/clients            # Créer client
PUT    /api/clients/:id        # Modifier client

GET    /api/machines           # Liste machines
POST   /api/machines           # Créer machine
PUT    /api/machines/:id       # Modifier machine
```

### 👥 Gestion Utilisateurs (Admin)
```http
GET    /api/users              # Liste utilisateurs
POST   /api/users              # Créer utilisateur  
PUT    /api/users/:id          # Modifier utilisateur
DELETE /api/users/:id          # Désactiver utilisateur
```

## 🔧 Configuration Production

### 🗄️ Base de Données MariaDB

```sql
-- Optimisations production recommandées
SET GLOBAL innodb_buffer_pool_size = 512M;
SET GLOBAL max_connections = 300;  
SET GLOBAL query_cache_size = 128M;
SET GLOBAL slow_query_log = 1;
SET GLOBAL long_query_time = 1;
```

### 🌐 Configuration Nginx

```nginx
# Rate limiting production
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

# Headers sécurité
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### 🔒 Variables d'Environnement Critiques

```bash
# Sécurité (CHANGEZ TOUT !)
JWT_SECRET=votre_cle_secrete_tres_longue_et_unique
DB_PASSWORD=mot_passe_mariadb_tres_securise  
REDIS_PASSWORD=mot_passe_redis_securise

# Production  
NODE_ENV=production
FRONTEND_URL=https://votre-domaine.com
LOG_LEVEL=info

# Email SMTP  
EMAIL_HOST=smtp.votre-domaine.com
EMAIL_USER=noreply@votre-domaine.com
EMAIL_PASS=mot_passe_smtp
```

## 💾 Sauvegarde & Monitoring  

### 📦 Sauvegardes Automatiques
- **Fréquence** : Quotidienne à 2h du matin
- **Rétention** : 30 jours par défaut
- **Format** : Dump MariaDB compressé (.sql.gz)  
- **Manuel** : `/usr/local/bin/mediresolv-backup`

### 📊 Monitoring Production
- **Logs** : Winston + rotation automatique  
- **Métriques** : Prometheus + Grafana
- **Health checks** : Endpoint `/health` 
- **Alertes** : Email automatique sur erreurs critiques
- **Performance** : Monitoring temps réponse API

## 🔧 Gestion & Maintenance

### 🎛️ Commandes Système
```bash  
# Gestion service
sudo systemctl status mediresolv
sudo systemctl restart mediresolv  
sudo systemctl stop mediresolv

# Logs temps réel  
sudo journalctl -u mediresolv -f
tail -f /opt/mediresolv/logs/app.log

# Sauvegarde manuelle
sudo /usr/local/bin/mediresolv-backup

# Mise à jour application
cd /opt/mediresolv
sudo git pull origin main
sudo systemctl restart mediresolv
```

### 🐳 Docker Production
```bash
# Démarrage stack complète
docker-compose -f docker-compose.production.yml up -d

# Logs services
docker-compose -f docker-compose.production.yml logs -f

# Sauvegarde base
docker-compose -f docker-compose.production.yml run --rm backup

# Mise à jour images
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

## 📚 Documentation Technique

### 📖 Guides Disponibles
- [Installation Détaillée](docs/INSTALLATION.md)
- [Configuration Production](docs/PRODUCTION.md)  
- [Guide API Complète](docs/API.md)
- [Sécurité & Bonnes Pratiques](docs/SECURITY.md)
- [Monitoring & Alertes](docs/MONITORING.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

### 🧪 Tests & Développement  
```bash
# Tests unitaires
npm test

# Tests d'intégration  
npm run test:integration

# Coverage
npm run test:coverage

# Audit sécurité
npm audit
npm run security-audit
```

## 🆘 Support & Maintenance

### 📞 Support Entreprise
- **Email** : support@mediresolv.fr
- **Téléphone** : +33 (0)1 XX XX XX XX  
- **Heures** : 9h-18h, Lundi-Vendredi
- **Urgences** : 24h/7j pour clients Enterprise

### 🔧 Maintenance Préventive  
- **Mises à jour sécurité** : Mensuelles automatiques
- **Sauvegardes** : Vérification hebdomadaire
- **Performance** : Audit trimestriel  
- **SSL** : Renouvellement automatique Let's Encrypt

### 🐛 Signalement de Bugs
1. Vérifiez les [Issues GitHub](https://github.com/lesdavils/MediResolv/issues)
2. Créez une issue détaillée avec logs  
3. Support prioritaire pour clients Enterprise
4. Correctifs critiques sous 24h

## 📈 Roadmap & Évolutions

### 🚀 Version 1.1 (Q1 2025)
- [ ] Application mobile native iOS/Android
- [ ] API REST complète v2 avec GraphQL  
- [ ] Intégration BI avec PowerBI/Tableau
- [ ] Module de facturation intégré
- [ ] SSO/LDAP pour entreprises

### 🎯 Version 1.2 (Q2 2025)  
- [ ] IA prédictive pour maintenance
- [ ] Module IoT équipements connectés
- [ ] Workflow avancé avec approbations  
- [ ] Multi-tenant pour groupes hospitaliers
- [ ] API publique pour intégrations tierces

## 📄 Licence & Conformité

### ⚖️ Licence
- **Type** : Licence Propriétaire mediresolv
- **Usage** : Entreprise uniquement  
- **Support** : Inclus pour clients licenciés
- **Mises à jour** : Incluses pendant 2 ans

### 🏥 Conformité Médical
- **RGPD** : Conforme protection données patients
- **ISO 27001** : Sécurité niveau médical  
- **HDS** : Hébergement Données Santé compatible
- **Audit** : Logs complets pour certification

---

<div align="center">
  <p><strong>MediResolv v1.0.0 - Production Ready</strong></p>
  <p>© 2025 mediresolv/Athlex - Tous droits réservés</p>
  <p>Made with ❤️ for medical equipment professionals</p>
</div>