const { Sequelize } = require('sequelize');
const winston = require('winston');
require('dotenv').config();

// Configuration du logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ 
            filename: 'logs/database.log',
            level: 'error'
        }),
        new winston.transports.File({ 
            filename: 'logs/database-combined.log'
        }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

// Configuration MariaDB optimisée pour production
const sequelizeConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql', // MariaDB utilise le driver MySQL
    dialectOptions: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        // Configuration SSL pour production
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false,
        // Timeout de connexion
        connectTimeout: 60000,
        acquireTimeout: 60000,
        // Configuration MariaDB spécifique
        supportBigNumbers: true,
        bigNumberStrings: true,
        dateStrings: true,
        typeCast: (field, next) => {
            if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
                return field.string();
            }
            return next();
        }
    },
    // Configuration du pool de connexions
    pool: {
        max: process.env.NODE_ENV === 'production' ? 20 : 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
        evict: 60000,
        handleDisconnects: true
    },
    // Configuration des logs
    logging: process.env.NODE_ENV === 'development'
        ? (msg) => logger.info(msg)
        : false,
    // Options de performance
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        timestamps: true,
        underscored: false,
        freezeTableName: true
    },
    // Retry automatique des connexions
    retry: {
        match: [
            /ETIMEDOUT/,
            /EHOSTUNREACH/,
            /ECONNRESET/,
            /ECONNREFUSED/,
            /ETIMEDOUT/,
            /ESOCKETTIMEDOUT/,
            /EHOSTUNREACH/,
            /EPIPE/,
            /EAI_AGAIN/,
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/
        ],
        max: 3
    },
    // Timezone
    timezone: '+01:00' // Europe/Paris
};

// Création de l'instance Sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME || 'mediresolv',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    sequelizeConfig
);

// Test de connexion avec retry
const testConnection = async (retries = 3) => {
    try {
        await sequelize.authenticate();
        logger.info('✅ Connexion MariaDB établie avec succès');

        // Afficher la version de MariaDB
        const [results] = await sequelize.query('SELECT VERSION() as version');
        logger.info(`📊 Version MariaDB: ${results[0].version}`);

        return true;
    } catch (error) {
        logger.error(`❌ Erreur de connexion MariaDB (tentatives restantes: ${retries - 1}):`, error);

        if (retries > 1) {
            logger.info('🔄 Nouvelle tentative de connexion dans 5 secondes...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            return testConnection(retries - 1);
        }

        throw error;
    }
};

// Fonction d'optimisation des performances MariaDB
const optimizeDatabase = async () => {
    try {
        if (process.env.NODE_ENV === 'production') {
            // Optimisations pour MariaDB en production
            const optimizations = [
                "SET SESSION sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'",
                "SET SESSION innodb_lock_wait_timeout = 50",
                "SET SESSION max_execution_time = 30000",
                "SET SESSION optimizer_search_depth = 8"
            ];

            for (const query of optimizations) {
                try {
                    await sequelize.query(query);
                } catch (error) {
                    logger.warn(`Optimisation ignorée: ${query} - ${error.message}`);
                }
            }

            logger.info('✅ Optimisations MariaDB appliquées');
        }
    } catch (error) {
        logger.warn('⚠️ Erreur lors de l\'optimisation MariaDB:', error.message);
    }
};

// Configuration des hooks Sequelize
sequelize.addHook('beforeConnect', async (config) => {
    logger.info('🔗 Tentative de connexion à MariaDB...');
});

sequelize.addHook('afterConnect', async (connection, config) => {
    logger.info('✅ Connexion MariaDB établie');
    await optimizeDatabase();
});

sequelize.addHook('beforeDisconnect', async (connection) => {
    logger.info('🔌 Déconnexion de MariaDB...');
});

// Gestion des erreurs de connexion
sequelize.addHook('afterConnect', (connection, config) => {
    connection.on('error', (err) => {
        logger.error('❌ Erreur de connexion MariaDB:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            logger.info('🔄 Tentative de reconnexion automatique...');
        }
    });
});

// Import et configuration des modèles
const User = require('../models/User')(sequelize, Sequelize.DataTypes);
const Client = require('../models/Client')(sequelize, Sequelize.DataTypes);
const Machine = require('../models/Machine')(sequelize, Sequelize.DataTypes);
const Ticket = require('../models/Ticket')(sequelize, Sequelize.DataTypes);
const Intervention = require('../models/Intervention')(sequelize, Sequelize.DataTypes);
const PieceDetachee = require('../models/PieceDetachee')(sequelize, Sequelize.DataTypes);
const MouvementStock = require('../models/MouvementStock')(sequelize, Sequelize.DataTypes);
const SecurityLog = require('../models/SecurityLog')(sequelize, Sequelize.DataTypes);
const UserSession = require('../models/UserSession')(sequelize, Sequelize.DataTypes);

// Configuration des associations
const setupAssociations = () => {
    // Associations User
    User.hasMany(Ticket, { foreignKey: 'technicien_id', as: 'ticketsAssignes' });
    User.hasMany(Ticket, { foreignKey: 'createur_id', as: 'ticketsCrees' });
    User.hasMany(Intervention, { foreignKey: 'technicien_id', as: 'interventions' });
    User.hasMany(SecurityLog, { foreignKey: 'user_id', as: 'securityLogs' });
    User.hasMany(UserSession, { foreignKey: 'user_id', as: 'sessions' });

    // Associations Client
    Client.hasMany(Machine, { foreignKey: 'client_id', as: 'machines' });
    Client.hasMany(Ticket, { foreignKey: 'client_id', as: 'tickets' });

    // Associations Machine
    Machine.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
    Machine.hasMany(Ticket, { foreignKey: 'machine_id', as: 'tickets' });

    // Associations Ticket
    Ticket.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
    Ticket.belongsTo(Machine, { foreignKey: 'machine_id', as: 'machine' });
    Ticket.belongsTo(User, { foreignKey: 'technicien_id', as: 'technicien' });
    Ticket.belongsTo(User, { foreignKey: 'createur_id', as: 'createur' });
    Ticket.hasMany(Intervention, { foreignKey: 'ticket_id', as: 'interventions' });

    // Associations Intervention
    Intervention.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
    Intervention.belongsTo(User, { foreignKey: 'technicien_id', as: 'technicien' });

    // Associations PieceDetachee
    PieceDetachee.hasMany(MouvementStock, { foreignKey: 'piece_id', as: 'mouvements' });

    // Associations MouvementStock
    MouvementStock.belongsTo(PieceDetachee, { foreignKey: 'piece_id', as: 'piece' });
    MouvementStock.belongsTo(User, { foreignKey: 'utilisateur_id', as: 'utilisateur' });
    MouvementStock.belongsTo(Intervention, { foreignKey: 'intervention_id', as: 'intervention' });

    // Associations SecurityLog
    SecurityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

    // Associations UserSession
    UserSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

    logger.info('✅ Associations des modèles configurées');
};

// Fonction de synchronisation sécurisée
const syncDatabase = async (options = {}) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            logger.warn('⚠️ Synchronisation désactivée en production');
            return;
        }

        const syncOptions = {
            force: false,
            alter: true,
            ...options
        };

        await sequelize.sync(syncOptions);
        logger.info('✅ Synchronisation de la base de données terminée');
    } catch (error) {
        logger.error('❌ Erreur lors de la synchronisation:', error);
        throw error;
    }
};

// Fonction de sauvegarde
const backupDatabase = async () => {
    if (process.env.NODE_ENV !== 'production') {
        return;
    }

    try {
        const { exec } = require('child_process');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = `backup_${process.env.DB_NAME}_${timestamp}.sql`;
        const command = `mariadb-dump -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > backups/${backupFile}`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                logger.error('❌ Erreur de sauvegarde:', error);
                return;
            }
            logger.info(`✅ Sauvegarde créée: ${backupFile}`);
        });
    } catch (error) {
        logger.error('❌ Erreur lors de la sauvegarde:', error);
    }
};

// Configuration des modèles
setupAssociations();

module.exports = {
    sequelize,
    Sequelize,
    models: {
        User,
        Client,
        Machine,
        Ticket,
        Intervention,
        PieceDetachee,
        MouvementStock,
        SecurityLog,
        UserSession
    },
    testConnection,
    syncDatabase,
    backupDatabase,
    optimizeDatabase
};
