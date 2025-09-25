const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const winston = require('winston');
require('dotenv').config();

// Import des configurations
const { sequelize } = require('./config/database');
const logger = require('./config/logger');

// Import des routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clientRoutes = require('./routes/clients');
const ticketRoutes = require('./routes/tickets');
const machineRoutes = require('./routes/machines');
const dashboardRoutes = require('./routes/dashboard');
const interventionRoutes = require('./routes/interventions');
const pieceRoutes = require('./routes/pieces');

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// CONFIGURATION SÉCURITÉ NIVEAU ENTREPRISE
// =====================================================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Configuration CORS sécurisée
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting avancé
const createRateLimit = (windowMs, max, message) => rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Rate limit dépassé pour IP: ${req.ip}`);
        res.status(429).json({ error: message });
    }
});

// Rate limits différenciés
app.use('/api/auth', createRateLimit(15 * 60 * 1000, 5, 'Trop de tentatives de connexion'));
app.use('/api', createRateLimit(15 * 60 * 1000, 100, 'Trop de requêtes API'));
app.use(createRateLimit(15 * 60 * 1000, 200, 'Trop de requêtes'));

// Compression
app.use(compression());

// Body parsing avec limites de sécurité
app.use(express.json({
    limit: '10mb',
    strict: true
}));

app.use(express.urlencoded({
    extended: true,
    limit: '10mb',
    parameterLimit: 1000
}));

// Logging des requêtes
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    next();
});

// =====================================================
// SERVIR LES FICHIERS STATIQUES
// =====================================================
app.use('/static', express.static(path.join(__dirname, '../frontend'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '30d',
    etag: true
}));

// =====================================================
// ROUTES API AVEC PRÉFIXE SÉCURISÉ
// =====================================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/pieces', pieceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// =====================================================
// ROUTE PRINCIPALE POUR SPA
// =====================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// =====================================================
// ROUTE DE SANTÉ SYSTÈME
// =====================================================
app.get('/health', async (req, res) => {
    try {
        // Test de connexion à la base de données
        await sequelize.authenticate();

        const healthCheck = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV,
            database: 'connected',
            application: 'MediResolv'
        };

        res.status(200).json(healthCheck);
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed'
        });
    }
});

// Route pour les métriques (admin uniquement)
app.get('/metrics', require('./middleware/auth').requireAdmin, (req, res) => {
    const metrics = {
        system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
        },
        application: {
            name: 'MediResolv',
            version: process.env.npm_package_version,
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString()
        }
    };

    res.json(metrics);
});

// =====================================================
// MIDDLEWARE DE GESTION D'ERREURS
// =====================================================
app.use((err, req, res, next) => {
    // Log de l'erreur
    logger.error('Erreur serveur:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Réponse sécurisée (pas d'info sensible en production)
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({
            error: 'Erreur serveur interne',
            reference: require('uuid').v4() // ID de référence pour les logs
        });
    } else {
        res.status(500).json({
            error: 'Erreur serveur interne',
            message: err.message,
            stack: err.stack
        });
    }
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
        res.status(404).json({
            error: 'Endpoint API non trouvé',
            path: req.originalUrl
        });
    } else {
        // Redirection SPA
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
});

// =====================================================
// FONCTION DE DÉMARRAGE SÉCURISÉ
// =====================================================
const startServer = async () => {
    try {
        // Vérification des variables d'environnement critiques
        const requiredEnvVars = [
            'NODE_ENV',
            'JWT_SECRET',
            'DB_HOST',
            'DB_USER',
            'DB_PASSWORD',
            'DB_NAME'
        ];

        const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
        if (missingEnvVars.length > 0) {
            throw new Error(`Variables d'environnement manquantes: ${missingEnvVars.join(', ')}`);
        }

        // Test de connexion à la base de données
        await sequelize.authenticate();
        logger.info('✅ Connexion à MariaDB réussie');

        // Synchronisation des modèles (seulement en développement)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            logger.info('✅ Synchronisation des modèles terminée');
        }

        // Démarrage du serveur
        const server = app.listen(PORT, '0.0.0.0', () => {
            logger.info(`🚀 MediResolv démarré avec succès`);
            logger.info(`📍 Port: ${PORT}`);
            logger.info(`🌍 Environnement: ${process.env.NODE_ENV}`);
            logger.info(`🔗 URL: http://localhost:${PORT}`);
            logger.info(`❤️ Santé: http://localhost:${PORT}/health`);
        });

        // Configuration timeout serveur
        server.timeout = 30000; // 30 secondes

        // Gestion gracieuse de l'arrêt
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

        async function gracefulShutdown() {
            logger.info('🛑 Arrêt gracieux en cours...');

            server.close(async () => {
                try {
                    await sequelize.close();
                    logger.info('✅ Base de données fermée');
                    logger.info('✅ Serveur arrêté proprement');
                    process.exit(0);
                } catch (error) {
                    logger.error('❌ Erreur lors de l\'arrêt:', error);
                    process.exit(1);
                }
            });
        }

    } catch (error) {
        logger.error('❌ Erreur de démarrage du serveur:', error);
        process.exit(1);
    }
};

// =====================================================
// GESTION DES ERREURS NON CAPTURÉES
// =====================================================
process.on('uncaughtException', (error) => {
    logger.error('Erreur non capturée:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Promise rejetée non gérée:', { reason, promise });
    process.exit(1);
});

// Démarrage de l'application
startServer();

module.exports = app;
