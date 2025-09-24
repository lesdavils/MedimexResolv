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